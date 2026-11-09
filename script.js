document.addEventListener("DOMContentLoaded", () => {
  initAvisaMenu();
  initSharedHeader();

  // Nyhetsinnhold lastes uavhengig av notisbåndet. Nettfeil i en
  // enkelt JSON-fil skal aldri hindre andre seksjoner i å vises.
  if (document.querySelector(".notisbånd")) {
    loadNotiser();
  }
  if (document.getElementById("notisgrid")) loadNotisarkiv();
  if (document.getElementById("nyhetshjul-grid")) loadNyhetshjul();
  if (document.getElementById("nyhetshjul2-grid")) loadNyhetshjul2();
  if (document.getElementById("sportshjul-grid")) loadSportshjul();
  if (document.getElementById("kulturhjul-grid")) loadKulturhjul();
  if (document.getElementById("kommentarhjul-grid")) loadKommentarer();
  if (document.querySelector(".debatt-innlegg")) loadDebatt();
  if (document.querySelector("[data-artikkelkategori]")) loadCategoryArchive();
  document.body.classList.add("loaded");
});

/* ---------- Felles toppmeny på artikkel- og debattsider ---------- */
function initSharedHeader() {
  const placeholder = document.getElementById("header-placeholder");
  if (!placeholder) return Promise.resolve();

  // Løs lenker fra plasseringen til script.js: samme kode fungerer for
  // både rotfiler og artikkelundersider under /artikler/ og /posts/.
  const script = Array.from(document.scripts).find(el =>
    /\/script\.js(?:\?.*)?$/.test(el.src)
  );
  const root = script ? new URL(".", script.src) : new URL("../", location.href);

  // Behold alltid en synlig vei tilbake selv om lasting feiler.
  const fallback = document.createElement("a");
  fallback.href = new URL("index.html", root).href;
  fallback.textContent = "← Til Paradisavisa";
  fallback.className = "avis-fallback-link";
  placeholder.replaceChildren(fallback);

  return fetch(new URL("header.html", root), { cache: "no-store" })
    .then(response => {
      if (!response.ok) throw new Error("Toppmenyen kunne ikke lastes");
      return response.text();
    })
    .then(html => {
      const template = document.createElement("template");
      template.innerHTML = html.trim();
      const header = template.content.querySelector("header.avisa-shared-header");
      if (!header) throw new Error("Felles toppmeny mangler header");

      // Innholdet kommer fra prosjektets egen header.html. Normaliser alle
      // interne lenker slik at de fungerer også fra artikler/ og posts/.
      header.querySelectorAll("a[href]").forEach(link => {
        const raw = link.getAttribute("href");
        if (raw && !raw.startsWith("#")) link.href = new URL(raw, root).href;
      });
      placeholder.replaceWith(header);
      if (!document.querySelector(".notisbånd")) {
        document.body.classList.add("har-felles-header");
      }
      initAvisaMenu();
    })
    .catch(err => {
      console.error("Felles toppmeny feilet:", err);
      // Den synlige fallback-lenken beholdes.
    });
}

/* ---------- Navigasjon – tilgjengelig også med tastatur og berøring ---------- */
function initAvisaMenu() {
  const headers = document.querySelectorAll(".avis-topp");
  headers.forEach(header => {
    const button = header.querySelector(".nav-toggle");
    const nav = header.querySelector(".avisa-menu");
    if (!button || !nav) return;

    function setOpen(open) {
      nav.hidden = !open;
      button.setAttribute("aria-expanded", String(open));
      button.setAttribute("aria-label", open ? "Lukk meny" : "Åpne meny");
      const glyph = button.querySelector(".nav-toggle-icon");
      if (glyph) glyph.textContent = open ? "×" : "☰";
    }

    setOpen(false);
    button.hidden = false;
    document.documentElement.classList.add("avis-meny-klar");

    button.addEventListener("click", () => setOpen(nav.hidden));

    nav.addEventListener("click", e => {
      if (e.target.closest("a")) setOpen(false);
    });

    document.addEventListener("click", e => {
      if (!header.contains(e.target)) setOpen(false);
    });

    document.addEventListener("keydown", e => {
      if (e.key === "Escape" && !nav.hidden) {
        setOpen(false);
        button.focus();
      }
    });
  });
}


/* ---------- Kategoriarkiv: tydelig dato, ingen gamle saker som "ferske" ---------- */
function loadCategoryArchive() {
  const container = document.querySelector("[data-artikkelkategori]");
  if (!container) return;
  const type = container.dataset.artikkelkategori;
  if (!["nyheter", "kultur"].includes(type)) return;

  const sources = type === "kultur"
    ? ["Kulturhjul.json"]
    : ["Nyhetshjul.json", "Nyhetshjul2.json"];

  Promise.all(sources.map(path =>
    fetch(path, { cache: "no-store" }).then(response => {
      if (!response.ok) throw new Error("Kunne ikke hente " + path);
      return response.json();
    })
  )).then(groups => {
    const seen = new Set();
    const items = groups.flat()
      .filter(x => x && x.url && x.title)
      .filter(x => {
        if (seen.has(x.url)) return false;
        seen.add(x.url);
        return true;
      })
      .sort((a,b) => String(b.date||"").localeCompare(String(a.date||"")));

    container.replaceChildren();
    if (!items.length) {
      const empty = document.createElement("p");
      empty.textContent = "Ingen arkiverte saker i denne kategorien ennå.";
      container.appendChild(empty);
      return;
    }

    items.forEach(item => {
      const card = document.createElement("a");
      card.className = "hjul-card";
      card.href = item.url;
      if (item.image) {
        const image = document.createElement("img");
        image.src = item.image;
        image.alt = "";
        image.loading = "lazy";
        card.appendChild(image);
      }
      const heading = document.createElement("h3");
      heading.textContent = item.title;
      card.appendChild(heading);
      if (item.date) {
        const time = document.createElement("time");
        time.className = "arkiv-dato";
        time.dateTime = item.date;
        try {
          time.textContent = new Date(item.date + "T12:00:00").toLocaleDateString(
            "nb-NO", {day:"numeric",month:"long",year:"numeric"}
          );
        } catch (_) {
          time.textContent = item.date;
        }
        card.appendChild(time);
      }
      if (item.excerpt) {
        const excerpt = document.createElement("p");
        excerpt.textContent = item.excerpt;
        card.appendChild(excerpt);
      }
      container.appendChild(card);
    });
  }).catch(err => {
    console.error("Kategoriarkivet feilet:", err);
    const fallback = document.createElement("p");
    fallback.textContent = "Arkivet kunne ikke lastes. Prøv å åpne siden på nytt.";
    container.replaceChildren(fallback);
  });
}

/* ---------- Notisferskhet: ikke vis gamle eller udaterte nyheter ---------- */
function isNotisAktuell(notis, now = new Date()) {
  if (!notis || typeof notis.text !== "string" || !notis.text.trim()) return false;
  const parseDato = value => {
    if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
    const [aar, maaned, dag] = value.split("-").map(Number);
    const dato = new Date(aar, maaned - 1, dag);
    return dato.getFullYear() === aar && dato.getMonth() === maaned - 1 &&
      dato.getDate() === dag ? dato : null;
  };
  const dato = parseDato(notis.date);
  if (!dato) return false;
  const dagnummer = value => Date.UTC(value.getFullYear(), value.getMonth(), value.getDate()) / 86400000;
  const alder = dagnummer(now) - dagnummer(dato);
  if (alder < 0 || alder >= 7) return false;
  if (notis.expires != null) {
    const utloep = parseDato(notis.expires);
    if (!utloep || dagnummer(now) > dagnummer(utloep)) return false;
  }
  return true;
}

/* ---------- Notisbånd: rolig, jevn og sømløs bevegelse ---------- */
function loadNotiser() {
  // Alle sider bruker samme kildekontrollerte og daterte notisstrøm.
  const filename = "notiser.json";
  // Bruk script.js sin katalog, slik at notiser virker også i /artikler/.
  const appScript = Array.from(document.scripts).find(el => el.src.split("?")[0].endsWith("/script.js"));
  const source = new URL(filename, appScript?.src || window.location.href);
  return fetch(source, { cache: "no-store" })
    .then(response => {
      if (!response.ok) throw new Error("Kunne ikke hente notiser");
      return response.json();
    })
    .then(items => {
      const band = document.querySelector(".notisbånd");
      const innhold = band?.querySelector(".notisinnhold");
      if (!band || !innhold || !Array.isArray(items)) return;
      const aktuelle = items.filter(item => isNotisAktuell(item));
      band.hidden = !aktuelle.length;
      if (!aktuelle.length) {
        band.style.display = "none";
        innhold.replaceChildren();
        return;
      }
      band.style.removeProperty("display");

      band.setAttribute("aria-label", "Notisbånd");
      band.setAttribute("aria-live", "off");

      // Egen klippet lesesone for teksten: pauseknappen dekker ingen ord.
      let visning = band.querySelector(".notis-visning");
      if (!visning) {
        visning = document.createElement("div");
        visning.className = "notis-visning";
        innhold.before(visning);
        visning.appendChild(innhold);
      }

      innhold.classList.remove("is-running");
      innhold.replaceChildren();
      band.querySelector(".notis-kontroller")?.remove();
      // Et kort, resirkulerende spor i stedet for å animere hele
      // nyhetslisten to ganger. Store transform-lag hakker under scrolling
      // på mobil, særlig når nettleserens adresselinje endrer størrelse.
      const lagNotiselement = n => {
        const element = document.createElement("span");
        element.className = "notis-element";
        const item = document.createElement("span");
        item.className = "notis-tekst";
        const category = document.createElement("strong");
        category.textContent = String(n.category || "") + ":";
        item.append(category, document.createTextNode(" " + String(n.text || "")));

        let wrapper = item;
        if (n.url) {
          try {
            const url = new URL(n.url, window.location.href);
            if (url.protocol === "http:" || url.protocol === "https:") {
              const link = document.createElement("a");
              link.href = url.href;
              link.appendChild(item);
              wrapper = link;
            }
          } catch (_) {
            // Ved ugyldig URL vises notisen fortsatt som tekst.
          }
        }
        const skille = document.createElement("span");
        skille.className = "notis-skille";
        skille.textContent = "•";
        element.append(wrapper, skille);
        return element;
      };
      let nesteNotisIndeks = 0;
      const leggTilNesteNotis = () => {
        const element = lagNotiselement(aktuelle[nesteNotisIndeks % aktuelle.length]);
        nesteNotisIndeks++;
        innhold.appendChild(element);
      };
      const oppdaterTilgjengelighet = () => {
        // Dupliserte/offscreen tekster skal ikke leses gjentatte ganger,
        // men notisen som ruller ut skal fortsatt kunne åpnes.
        Array.from(innhold.children).forEach((element, index) => {
          const lenke = element.querySelector("a");
          if (index === 0) {
            element.removeAttribute("aria-hidden");
            if (lenke) lenke.removeAttribute("tabindex");
          } else {
            element.setAttribute("aria-hidden", "true");
            if (lenke) lenke.tabIndex = -1;
          }
        });
      };
      const fyllNotisspor = () => {
        if (!innhold.firstElementChild) leggTilNesteNotis();
        const forsteBredde = innhold.firstElementChild.getBoundingClientRect().width;
        // Også når første notis har rullet helt ut, må den neste fylle
        // hele visningsbredden slik at båndet aldri får tomme mellomrom.
        const minsteBredde = forsteBredde + visning.clientWidth + 40;
        let lagtTil = 0;
        while (innhold.scrollWidth < minsteBredde && lagtTil++ < 24) {
          leggTilNesteNotis();
        }
        oppdaterTilgjengelighet();
      };

      // Behold 2×, 4× og 6×, men la nettleserens compositor drive
      // bevegelsen. Ingen scroll-listener, per-frame JS eller store kopier.
      const fartvalg = [2, 4, 6];
      let valgtFart = 2;
      try {
        const lagret = Number(localStorage.getItem("paradisavisa-notisfart"));
        if (fartvalg.includes(lagret)) valgtFart = lagret;
      } catch (_) { /* Lokallagring kan være blokkert. */ }

      let tickerAnimasjon = null;
      const grunnfart = () => window.matchMedia("(max-width: 700px)").matches ? 30 : 38;
      const kanSpille = () => !band.classList.contains("is-paused") &&
        !visning.contains(document.activeElement) &&
        !(window.matchMedia("(hover: hover) and (pointer: fine)").matches &&
          visning.matches(":hover"));
      const oppdaterHastighet = () => {
        const forsteBredde = innhold.firstElementChild?.getBoundingClientRect().width || 0;
        if (!forsteBredde) return;
        const varighet = forsteBredde / grunnfart();
        innhold.style.setProperty("--ticker-duration", (varighet / valgtFart).toFixed(2) + "s");
        if (tickerAnimasjon) tickerAnimasjon.playbackRate = valgtFart;
      };
      const startNesteNotis = () => {
        fyllNotisspor();
        const forste = innhold.firstElementChild;
        const bredde = forste?.getBoundingClientRect().width || 0;
        if (bredde <= 0 || typeof innhold.animate !== "function") return;
        const animasjon = innhold.animate([
          { transform: "translate3d(0,0,0)" },
          { transform: "translate3d(-" + bredde + "px,0,0)" }
        ], { duration: bredde / grunnfart() * 1000, easing: "linear", fill: "forwards" });
        tickerAnimasjon = animasjon;
        oppdaterHastighet();
        if (!kanSpille()) animasjon.pause();
        animasjon.onfinish = () => {
          if (tickerAnimasjon !== animasjon) return;
          tickerAnimasjon = null;
          // Fjern første notis og nullstill forflytningen i samme frame:
          // neste notis beholder nøyaktig posisjonen sin.
          animasjon.cancel();
          forste.remove();
          startNesteNotis();
        };
      };
      visning.addEventListener("focusin", () => tickerAnimasjon?.pause());
      visning.addEventListener("focusout", () => {
        if (kanSpille()) tickerAnimasjon?.play();
      });
      if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
        visning.addEventListener("mouseenter", () => tickerAnimasjon?.pause());
        visning.addEventListener("mouseleave", () => {
          if (kanSpille()) tickerAnimasjon?.play();
        });
      }

      // Én knapp åpner alle tre kontrollene. Panelet dekker aldri løpende tekst.
      const kontroller = document.createElement("div");
      kontroller.className = "notis-kontroller";
      const valgknapp = document.createElement("button");
      valgknapp.type = "button";
      valgknapp.className = "notis-valgknapp";
      valgknapp.setAttribute("aria-label", "Åpne nyhetsradio og notiskontroller");
      valgknapp.setAttribute("aria-haspopup", "true");
      valgknapp.setAttribute("aria-expanded", "false");
      valgknapp.title = "Nyhetsradio og kontroller";
      valgknapp.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h16" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/><circle cx="9" cy="6" r="2.6" fill="#080808" stroke="currentColor" stroke-width="2"/><circle cx="15" cy="12" r="2.6" fill="#080808" stroke="currentColor" stroke-width="2"/><circle cx="8" cy="18" r="2.6" fill="#080808" stroke="currentColor" stroke-width="2"/></svg>';

      const panel = document.createElement("div");
      panel.className = "notis-valgpanel";
      panel.id = "notis-valgpanel";
      panel.hidden = true;
      panel.setAttribute("role", "group");
      panel.setAttribute("aria-label", "Notisbånd og Paradisavisas nyhetsradio");
      valgknapp.setAttribute("aria-controls", panel.id);

      const overskrift = document.createElement("strong");
      overskrift.className = "notis-paneloverskrift";
      overskrift.textContent = "PARADISAVISA · NYHETSRADIO";
      panel.appendChild(overskrift);

      const pauseknapp = document.createElement("button");
      pauseknapp.type = "button";
      pauseknapp.className = "notis-pause";
      const pauseikon = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 5v14M17 5v14" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"/></svg>';
      const startikon = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5l11 7-11 7z" fill="currentColor"/></svg>';
      const visPauseknapp = () => {
        const pauset = band.classList.contains("is-paused");
        pauseknapp.innerHTML = (pauset ? startikon : pauseikon) +
          '<span>' + (pauset ? "Start nyhetsbåndet" : "Pause nyhetsbåndet") + '</span>';
        pauseknapp.setAttribute("aria-label", pauset ? "Start notisbåndet" : "Pause notisbåndet");
        pauseknapp.setAttribute("aria-pressed", String(pauset));
      };
      pauseknapp.addEventListener("click", () => {
        band.classList.toggle("is-paused");
        if (kanSpille()) tickerAnimasjon?.play();
        else tickerAnimasjon?.pause();
        visPauseknapp();
      });
      visPauseknapp();
      panel.appendChild(pauseknapp);

      const hastighet = document.createElement("div");
      hastighet.className = "notis-hastighet";
      const fartknapp = document.createElement("button");
      fartknapp.type = "button";
      fartknapp.className = "notis-fartknapp";
      fartknapp.setAttribute("aria-expanded", "false");
      fartknapp.setAttribute("aria-controls", "notis-fartmeny");
      const fartmeny = document.createElement("div");
      fartmeny.className = "notis-fartmeny";
      fartmeny.id = "notis-fartmeny";
      fartmeny.hidden = true;
      fartmeny.setAttribute("role", "group");
      fartmeny.setAttribute("aria-label", "Velg hastighet for notisbåndet");
      const oppdaterFartknapper = () => {
        fartknapp.textContent = "Hastighet · " + valgtFart + "×";
        fartknapp.setAttribute("aria-label", "Velg hastighet – nå " + valgtFart + "×");
        fartmeny.querySelectorAll("button[data-fart]").forEach(knapp => {
          knapp.setAttribute("aria-pressed", String(Number(knapp.dataset.fart) === valgtFart));
        });
      };
      for (const fart of fartvalg) {
        const knapp = document.createElement("button");
        knapp.type = "button";
        knapp.dataset.fart = String(fart);
        knapp.textContent = fart + "×";
        knapp.addEventListener("click", () => {
          valgtFart = fart;
          try { localStorage.setItem("paradisavisa-notisfart", String(fart)); }
          catch (_) { /* Valget fungerer likevel. */ }
          oppdaterFartknapper();
          oppdaterHastighet();
          fartmeny.hidden = true;
          fartknapp.setAttribute("aria-expanded", "false");
          fartknapp.focus();
        });
        fartmeny.appendChild(knapp);
      }
      fartknapp.addEventListener("click", () => {
        fartmeny.hidden = !fartmeny.hidden;
        fartknapp.setAttribute("aria-expanded", String(!fartmeny.hidden));
      });
      hastighet.append(fartknapp, fartmeny);
      panel.appendChild(hastighet);
      oppdaterFartknapper();

      // Bruk nettleserens talesyntese; ingen ekstern radiotjeneste eller avgift.
      // Tale startes bare med et brukergest, og stoppes når siden forlates.
      const tale = window.speechSynthesis;
      const harTale = Boolean(tale && typeof window.SpeechSynthesisUtterance === "function");
      const radioknapp = document.createElement("button");
      radioknapp.type = "button";
      radioknapp.className = "notis-radio";
      radioknapp.disabled = !harTale;
      const radiostatus = document.createElement("span");
      radiostatus.className = "notis-radiostatus";
      radiostatus.setAttribute("role", "status");
      radiostatus.setAttribute("aria-live", "polite");
      radiostatus.textContent = harTale ?
        "Trykk Les opp for å starte nyhetsradioen." :
        "Opplesning støttes ikke i denne nettleseren.";
      let radioAktiv = false;
      let radioVersjon = 0;
      let radioIndeks = 0;
      let radiosaker = aktuelle.slice();

      const visRadio = () => {
        radioknapp.textContent = radioAktiv ? "■  Stopp opplesning" : "▶  Les opp notisene";
        radioknapp.setAttribute("aria-label", radioAktiv ? "Stopp nyhetsradio" : "Start nyhetsradio");
        radioknapp.setAttribute("aria-pressed", String(radioAktiv));
      };
      const stoppRadio = (melding = "Nyhetsradioen er stoppet.") => {
        radioAktiv = false;
        radioVersjon++;
        try { tale?.cancel(); } catch (_) { /* Tale kan være utilgjengelig. */ }
        radiostatus.textContent = melding;
        band.classList.remove("is-radio");
        visRadio();
      };
      const lesNeste = versjon => {
        if (!radioAktiv || versjon !== radioVersjon) return;
        if (radioIndeks >= radiosaker.length) {
          // Sjekk om nye notiser er kommet inn mellom radiosendingene.
          fetch(source, { cache: "no-store" }).then(response => {
            if (!response.ok) throw new Error("Notisoppdatering feilet");
            return response.json();
          }).then(data => {
            if (!radioAktiv || versjon !== radioVersjon) return;
            if (Array.isArray(data)) radiosaker = data.filter(item => isNotisAktuell(item));
            radioIndeks = 0;
            if (!radiosaker.length) {
              stoppRadio("Ingen ferske notiser å lese opp.");
              return;
            }
            lesNeste(versjon);
          }).catch(() => {
            if (!radioAktiv || versjon !== radioVersjon) return;
            radiosaker = radiosaker.filter(item => isNotisAktuell(item));
            radioIndeks = 0;
            if (radiosaker.length) lesNeste(versjon);
            else stoppRadio("Ingen ferske notiser å lese opp.");
          });
          return;
        }
        const notis = radiosaker[radioIndeks++];
        if (!isNotisAktuell(notis)) {
          lesNeste(versjon);
          return;
        }
        const ytring = new window.SpeechSynthesisUtterance(
          String(notis.category || "Nyheter") + ". " + notis.text
        );
        ytring.lang = "nb-NO";
        ytring.rate = 1;
        const stemmer = tale.getVoices?.() || [];
        const norsk = stemmer.find(stemme => /^nb[-_]NO$/i.test(stemme.lang)) ||
          stemmer.find(stemme => /^nn[-_]NO$/i.test(stemme.lang)) ||
          stemmer.find(stemme => /^no[-_]/i.test(stemme.lang));
        if (norsk) ytring.voice = norsk;
        radiostatus.textContent = "Leser: " + String(notis.category || "Nyheter");
        ytring.onend = () => { if (radioAktiv && versjon === radioVersjon) lesNeste(versjon); };
        ytring.onerror = () => { if (radioAktiv && versjon === radioVersjon) stoppRadio("Opplesningen kunne ikke fortsette."); };
        try { tale.speak(ytring); }
        catch (_) { stoppRadio("Opplesning kunne ikke startes i nettleseren."); }
      };
      radioknapp.addEventListener("click", () => {
        if (!harTale) return;
        if (radioAktiv) {
          stoppRadio();
          return;
        }
        radiosaker = radiosaker.filter(item => isNotisAktuell(item));
        if (!radiosaker.length) {
          radiostatus.textContent = "Ingen ferske notiser å lese opp.";
          return;
        }
        radioAktiv = true;
        const versjon = ++radioVersjon;
        radioIndeks = 0;
        try { tale.cancel(); } catch (_) { /* Ingen aktiv ytring. */ }
        band.classList.add("is-radio");
        visRadio();
        lesNeste(versjon);
      });
      visRadio();
      panel.append(radioknapp, radiostatus);

      const lukkPanel = () => {
        panel.hidden = true;
        fartmeny.hidden = true;
        valgknapp.setAttribute("aria-expanded", "false");
        fartknapp.setAttribute("aria-expanded", "false");
      };
      valgknapp.addEventListener("click", () => {
        if (panel.hidden) {
          panel.hidden = false;
          valgknapp.setAttribute("aria-expanded", "true");
        } else lukkPanel();
      });
      // Panelet lukkes med samme hovedknapp eller Escape.
      // Ikke lukk automatisk ved dokumentklikk: mobil/Safari kan registrere
      // et trykk på kontrollene som et utenfor-klikk.
      kontroller.addEventListener("keydown", event => {
        if (event.key === "Escape" && !panel.hidden) {
          lukkPanel();
          valgknapp.focus();
          event.stopPropagation();
        }
      });
      window.addEventListener("pagehide", () => {
        if (radioAktiv) stoppRadio();
      });
      kontroller.append(valgknapp, panel);
      band.appendChild(kontroller);

      // Mål tekstbredden etter at typografien er klar. Da unngår vi at
      // animasjonen endrer varighet og hopper idet nettfonten lastes.
      const start = () => {
        innhold.classList.add("is-running");
        startNesteNotis();
      };
      if (document.fonts?.ready) {
        document.fonts.ready.then(start, start);
      } else {
        start();
      }
    })
    .catch(err => console.error("Notisbånd feilet:", err));
}

/* ---------- Nyhetshjul ---------- */
/* ---------- Nyhetshjul: datert, kildekontrollert arkiv eller ferskt stoff ---------- */
function formatArticleDate(date) {
  // En publiseringsdato i kildedataene skal være YYYY-MM-DD.
  if (typeof date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return "";
  const parts = date.split("-").map(Number);
  const timestamp = Date.UTC(parts[0],parts[1]-1,parts[2],12);
  const d = new Date(timestamp);
  if (d.getUTCFullYear() !== parts[0] ||
      d.getUTCMonth() !== parts[1]-1 ||
      d.getUTCDate() !== parts[2]) return "";
  return new Intl.DateTimeFormat("nb-NO", {
    day:"numeric",month:"long",year:"numeric",timeZone:"UTC"
  }).format(d);
}

function daysSincePublished(date) {
  // Fremtidige/superskeive datoer teller ikke som ferske.
  if (!formatArticleDate(date)) return null;
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth()+1).padStart(2,"0");
  const dd = String(now.getDate()).padStart(2,"0");
  const today = Date.parse(yyyy+"-"+mm+"-"+dd+"T12:00:00Z");
  const published = Date.parse(date+"T12:00:00Z");
  return Math.floor((today-published)/86400000);
}

function buildArticleCard(item) {
  const card = document.createElement("a");
  card.className = "hjul-card";
  // Denne lenken kommer fra redaksjonelt kontrollert JSON i repoet.
  // Avvis uventede protokoller – ikke sett inn rå HTML.
  try {
    const target = new URL(String(item.url||""), location.href);
    if (!["http:","https:"].includes(target.protocol)) return null;
    card.href = target.href;
  } catch (_) { return null; }

  if (item.image) {
    const image = document.createElement("img");
    const safePath = String(item.image);
    try {
      const src = new URL(safePath, location.href);
      if (["http:","https:"].includes(src.protocol)) {
        image.src = src.href;
        image.alt = "";
        image.loading = "lazy";
        if (typeof item.position === "string" &&
            /^(?:center|top|bottom|left|right|\d{1,3}%)(?: (?:center|top|bottom|left|right|\d{1,3}%))?$/.test(item.position.trim())) {
          image.style.objectPosition = item.position.trim();
        }
        card.appendChild(image);
      }
    } catch (_) { /* En ugyldig bildebane må ikke hindre teksten. */ }
  }
  const title = document.createElement("h3");
  title.textContent = String(item.title||"");
  card.appendChild(title);

  const dateText = formatArticleDate(item.date);
  if (dateText) {
    const time = document.createElement("time");
    time.className = "forside-dato";
    time.dateTime = item.date;
    time.textContent = dateText;
    card.appendChild(time);
  }

  if (item.excerpt) {
    const excerpt = document.createElement("p");
    excerpt.textContent = String(item.excerpt);
    card.appendChild(excerpt);
  }
  return card;
}

function displayFreshness(items, gridId) {
  const container = document.getElementById(gridId);
  if (!container) return;
  const parent = container.closest("section, main");
  const label = parent?.querySelector("[data-nyhetsstatus]");
  if (!label) return;

  const valid = items.map(item=>item.date).filter(date=>formatArticleDate(date));
  valid.sort().reverse();
  if (!valid.length) {
    label.textContent = "Publiseringsdato mangler – kontroller kilden.";
    return;
  }
  const days = daysSincePublished(valid[0]);
  const latest = formatArticleDate(valid[0]);
  label.textContent = days !== null && days >= 0 && days <= 7
    ? "Sist publisert " + latest
    : "Fra arkivet · Sist publisert " + latest;
}

/* Fire forsideplasser per kategori: den siste kan sveipes sidelengs. */
function renderFourFrontPageCards(grid, cards) {
  grid.replaceChildren(...cards.slice(0, 3));
  if (cards.length <= 4) {
    if (cards[3]) grid.appendChild(cards[3]);
    return;
  }

  const section = grid.closest("section");
  const heading = section?.querySelector("h2")?.textContent || "kategorien";
  const host = document.createElement("div");
  host.className = "avis-sisteplass";
  const rail = document.createElement("div");
  rail.className = "avis-sisteplass-spor";
  rail.setAttribute("role", "region");
  rail.setAttribute("aria-roledescription", "karusell");
  rail.setAttribute("aria-label", "Flere artikler i " + heading);
  rail.tabIndex = 0;
  const remaining = cards.slice(3);
  rail.replaceChildren(...remaining);

  const controls = document.createElement("div");
  controls.className = "avis-sisteplass-styring";
  const label = document.createElement("span");
  label.className = "avis-sisteplass-tekst";
  label.textContent = "Sveip sidelengs for flere saker";
  const counter = document.createElement("span");
  counter.className = "avis-sisteplass-teller";
  counter.setAttribute("aria-live", "polite");
  const previous = document.createElement("button");
  previous.type = "button";
  previous.className = "avis-sisteplass-knapp";
  previous.setAttribute("aria-label", "Forrige artikkel i " + heading);
  previous.textContent = "←";
  const next = document.createElement("button");
  next.type = "button";
  next.className = "avis-sisteplass-knapp";
  next.setAttribute("aria-label", "Neste artikkel i " + heading);
  next.textContent = "→";
  controls.append(label, counter, previous, next);
  host.append(rail, controls);
  grid.appendChild(host);

  let current = 0;
  const update = () => {
    current = Math.min(remaining.length - 1,
      Math.max(0, Math.round(rail.scrollLeft / Math.max(1, rail.clientWidth))));
    counter.textContent = (current + 4) + " / " + cards.length;
    previous.disabled = current === 0;
    next.disabled = current === remaining.length - 1;
  };
  const goTo = index => {
    const target = Math.max(0, Math.min(remaining.length - 1, index));
    const reducedMotion = window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    rail.scrollTo({ left: target * rail.clientWidth,
      behavior: reducedMotion ? "instant" : "smooth" });
  };
  previous.addEventListener("click", () => goTo(current - 1));
  next.addEventListener("click", () => goTo(current + 1));
  rail.addEventListener("scroll", update, { passive: true });
  rail.addEventListener("keydown", event => {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    goTo(current + (event.key === "ArrowRight" ? 1 : -1));
  });
  update();
}

function loadArticleFeed(filename, gridId) {
  const grid = document.getElementById(gridId);
  if (!grid) return;
  return fetch(filename, {cache:"no-store"})
    .then(response=>{
      if (!response.ok) throw new Error("Kunne ikke hente "+filename);
      return response.json();
    })
    .then(raw=>{
      if (!Array.isArray(raw)) throw new Error("Uventet format i "+filename);
      const items=raw
        .filter(item=>item && item.url && item.title)
        .sort((a,b)=>String(b.date||"").localeCompare(String(a.date||"")));
      const cards = items.map(buildArticleCard).filter(Boolean);
      if (document.body.classList.contains("avis-forside")) {
        renderFourFrontPageCards(grid, cards);
      } else {
        grid.replaceChildren(...cards);
      }
      if (!cards.length) {
        const notice=document.createElement("p");
        notice.className="seksjonsinfo";
        notice.textContent="Ingen publiserte saker i denne kategorien ennå.";
        grid.appendChild(notice);
      }
      displayFreshness(items,gridId);
    })
    .catch(err=>{
      console.error(filename+" feilet:",err);
      const notice=document.createElement("p");
      notice.className="seksjonsinfo";
      notice.textContent="Sakene kunne ikke lastes akkurat nå.";
      grid.replaceChildren(notice);
    });
}

function loadNyhetshjul() { return loadArticleFeed("Nyhetshjul.json","nyhetshjul-grid"); }
function loadNyhetshjul2() { return loadArticleFeed("Nyhetshjul2.json","nyhetshjul2-grid"); }
function loadSportshjul() { return loadArticleFeed("Sportshjul.json","sportshjul-grid"); }
function loadKulturhjul() { return loadArticleFeed("Kulturhjul.json","kulturhjul-grid"); }
function loadKommentarer() { return loadArticleFeed("kommentarer.json","kommentarhjul-grid"); }

/* ---------- Debatt ---------- */
function loadDebatt() {
  fetch("debatt.json", { cache: "no-store" })
    .then(r => r.json())
    .then(items => {
      const container = document.querySelector(".debatt-innlegg");
      if (!container || !items.length) return;

      container.innerHTML = "";

      items.forEach(innlegg => {
        container.innerHTML += `
          <a class="card debatt-card" href="${innlegg.url}">
            ${innlegg.image ? `
              <img class="debatt-img"
                   src="${innlegg.image}"
                   alt="${escapeHtml(innlegg.title)}">
            ` : ""}

            <div class="debatt-content">
              <h3>${escapeHtml(innlegg.title)}</h3>
              <p class="debatt-meta">
                ${escapeHtml(innlegg.author)} · ${escapeHtml(innlegg.date)}
              </p>
              <p class="debatt-excerpt">
                ${escapeHtml(innlegg.excerpt.split(' ').slice(0, 16).join(' '))}...
              </p>
            </div>
          </a>`;
      });
      if (document.body.classList.contains("avis-forside")) {
        renderFourFrontPageCards(container, [...container.querySelectorAll(":scope > a")]);
      }
    })
    .catch(err => console.error("Debatt feilet:", err));
}

/* ---------- Hjelpefunksjon ---------- */
function escapeHtml(str) {
  return String(str || "").replace(/[&<>"']/g, s =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[s])
  );
}

/* ---------- Faktaboks ---------- */
function toggleBox(id) {
  const box = document.getElementById(id);
  if (!box) return;
  box.style.display = (box.style.display === "block") ? "none" : "block";
}

/* ---------- Notisarkiv: gamle notiser vises bare etter aktivt valg ---------- */
function loadNotisarkiv() {
  const grid = document.getElementById("notisgrid");
  const details = document.getElementById("eldre-notiser");
  const gamleGrid = document.getElementById("eldre-notisgrid");
  if (!grid || !details || !gamleGrid) return;
  const hent = filename => fetch(filename, { cache: "no-store" }).then(response => {
    if (!response.ok) throw new Error("Kunne ikke hente notiser: " + filename);
    return response.json();
  });
  const tegn = (container, entries) => {
    container.replaceChildren();
    entries.forEach((item, i) => {
      const card = document.createElement("article");
      card.className = "notis-rute " + ["liten", "mellom", "stor"][i % 3];
      const header = document.createElement("div");
      header.className = "notis-header";
      const category = document.createElement("span");
      category.className = "notis-kategori";
      category.textContent = String(item.category || "Notis");
      const date = document.createElement("time");
      date.className = "notis-dato";
      date.dateTime = String(item.date || "");
      date.textContent = String(item.date || "Udatert");
      const description = document.createElement("p");
      description.textContent = String(item.text || "");
      header.append(category, date);
      card.append(header, description);
      container.appendChild(card);
    });
  };
  Promise.all([hent("notiser.json"), hent("arkiv/notiser-2025-10.json")])
    .then(([aktive, arkiverte]) => {
      if (!Array.isArray(aktive) || !Array.isArray(arkiverte)) throw new Error("Ugyldig notisliste");
      const sorter = entries => entries.sort((a, b) =>
        String(b.date || "").localeCompare(String(a.date || "")));
      const na = new Date();
      const ferske = sorter(aktive.filter(item => isNotisAktuell(item, na)));
      const historiske = sorter([...arkiverte, ...aktive.filter(item => !isNotisAktuell(item, na))]);
      tegn(grid, ferske);
      if (!ferske.length) grid.textContent = "Ingen aktuelle notiser akkurat nå.";
      tegn(gamleGrid, historiske);
      details.hidden = !historiske.length;
      const summary = details.querySelector("summary");
      if (summary) summary.textContent = "Eldre notiser (" + historiske.length + ") – åpne arkivet";
    })
    .catch(error => {
      console.error(error);
      grid.textContent = "Notisene kunne ikke lastes. Prøv igjen senere.";
      details.hidden = true;
    });
}

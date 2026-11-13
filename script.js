document.addEventListener("DOMContentLoaded", () => {
  initAvisaMenu();
  initSharedHeader();
  initMastheadScroll();

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

/* ---------- Skjul slagordet, ikke avisnavnet, etter scrolling ---------- */
function initMastheadScroll() {
  const header = document.querySelector(".avis-forside .avis-masthead");
  if (!header) return;

  // Endre DOM bare når synligheten faktisk skifter, slik at notisbåndet
  // ikke påvirkes av arbeid ved hver scroll-hendelse.
  let hidden = null;
  const sync = () => {
    const next = window.scrollY > 64;
    if (hidden === next) return;
    hidden = next;
    header.classList.toggle("avis-rullet", hidden);
  };
  window.addEventListener("scroll", sync, { passive: true });
  sync();
}

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
  // Tre kalenderdager som standard (publiseringsdagen + de to neste).
  // Redaksjonelt expires kan korte ned eller forlenge til høyst sju dager.
  if (alder < 0 || alder >= (notis.expires == null ? 3 : 7)) return false;
  if (notis.expires != null) {
    const utloep = parseDato(notis.expires);
    if (!utloep || dagnummer(now) > dagnummer(utloep)) return false;
  }
  return true;
}

/* ---------- Oppdatering av radioens redaksjonelle nyhetskø ---------- */
// Stabile ID-er brukes når de finnes. Eldre notiser uten ID identifiseres
// med kilde, dato, kategori og originaltekst; endringer i tekst er nye versjoner.
function radioNotisNokkel(notis) {
  if (notis && typeof notis.id === "string" && notis.id.trim())
    return "id:" + notis.id.trim();
  return "eldre:" + JSON.stringify([
    notis?.date || "", notis?.url || "", notis?.category || "", notis?.text || ""
  ]);
}

// Hentede notiser er autoritative: slettede og utløpte saker utgår.
// Nye saker kommer først ved rundeskifte; kjente beholdes i radiokøens
// forrige rekkefølge slik at en redaksjonell omstokking ikke nullstiller flyten.
function prioriterNyeRadioNotiser(gamle, hentede, now = new Date()) {
  const tidligere = Array.isArray(gamle) ? gamle : [];
  const innkomne = Array.isArray(hentede) ? hentede : [];
  const gamleNokler = new Set(tidligere.map(radioNotisNokkel));
  const oppdatert = new Map();
  for (const notis of innkomne) {
    if (!isNotisAktuell(notis, now)) continue;
    const nokkel = radioNotisNokkel(notis);
    if (!oppdatert.has(nokkel)) oppdatert.set(nokkel, notis);
  }
  const prioritet = [];
  for (const [nokkel, notis] of oppdatert) {
    if (!gamleNokler.has(nokkel)) prioritet.push(notis);
  }
  for (const gammel of tidligere) {
    const nokkel = radioNotisNokkel(gammel);
    if (oppdatert.has(nokkel)) {
      prioritet.push(oppdatert.get(nokkel));
      oppdatert.delete(nokkel);
    }
  }
  return prioritet;
}

/* ---------- Godkjent radiotekst med konservativ uttaletilpasning ---------- */
function lagRadioOpplesning(notis) {
  // Taleavvik kan settes eksplisitt av redaksjonen, ikke genereres fritt av AI.
  const tekst = typeof notis?.speechText === "string" && notis.speechText.trim()
    ? notis.speechText : notis?.text;
  const innhold = String(tekst || "").trim()
    .replace(/(\d+(?:[.,]\d+)?)\s*%/g, "$1 prosent")
    .replace(/(\d+(?:[.,]\d+)?)\s*kr\b/gi, "$1 kroner")
    .replace(/\b(mrd|mill)\./gi, ord => ord.toLowerCase().startsWith("mrd")
      ? "milliarder" : "millioner");
  return String(notis?.category || "Nyheter").trim() + ". " + innhold;
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
      // Samme datoorden i notisbåndet og radiosiden, uavhengig av filrekkefølge.
      let aktuelle = items.filter(item => isNotisAktuell(item))
        .sort((a, b) => String(b.date || "").localeCompare(String(a.date || "")));
      band.hidden = !aktuelle.length;
      if (!aktuelle.length) {
        band.style.display = "none";
        innhold.replaceChildren();
        window.dispatchEvent(new Event("paradisradio:empty"));
        // Siden kan stå åpen uten notiser til neste publisering.
        window.setTimeout(loadNotiser, 5 * 60 * 1000);
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
        element.dataset.notisKey = radioNotisNokkel(n);
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

      // Behold 2×, 4× og 5×, men la nettleserens compositor drive
      // bevegelsen. Ingen scroll-listener, per-frame JS eller store kopier.
      const fartvalg = [2, 4, 5];
      let valgtFart = 2;
      try {
        const lagret = Number(localStorage.getItem("paradisavisa-notisfart"));
        if (fartvalg.includes(lagret)) valgtFart = lagret;
        else if (lagret === 6) {
          // Tidligere 6× blir 5× ved oppgradering, også på iPad.
          valgtFart = 5;
          localStorage.setItem("paradisavisa-notisfart", "5");
        }
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
      valgknapp.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M5 9.5L17 4.5"/><rect x="3" y="9" width="18" height="12" rx="2.3"/><circle cx="9" cy="15" r="3"/><path d="M15.5 14h3M15.5 17h3"/></svg>';

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
        fartknapp.textContent = "Tekstbånd · " + valgtFart + "×";
        fartknapp.setAttribute("aria-label", "Velg hastighet for notisbåndet – nå " + valgtFart + "×");
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
      // Norsk systemstemme og separat taletempo i samme meny som båndhastigheten.
      const radioInnstillinger = document.createElement("div");
      radioInnstillinger.className = "notis-radio-innstillinger";

      const stemmeLabel = document.createElement("label");
      stemmeLabel.htmlFor = "notis-radiostemme";
      stemmeLabel.textContent = "Norsk opplesningsstemme";
      const stemmeSelect = document.createElement("select");
      stemmeSelect.id = "notis-radiostemme";
      stemmeSelect.className = "notis-stemme-select";
      stemmeSelect.disabled = !harTale;
      const stemmeInfo = document.createElement("span");
      stemmeInfo.className = "notis-stemme-info";
      let valgtStemme = "";
      try { valgtStemme = localStorage.getItem("paradisavisa-radiostemme") || ""; }
      catch (_) { /* Lokal lagring er valgfri. */ }
      let norskeStemmer = [];
      const stemmeNokkel = stemme => [stemme.voiceURI || "", stemme.lang || "", stemme.name || ""].join("|");
      // Stemmelisten kommer ofte asynkront på iPad. Varsle radiosiden når den endres.
      let varsleStemmevalg = () => {};
      const oppdaterStemmer = () => {
        let alleStemmer = [];
        try { alleStemmer = tale?.getVoices?.() || []; } catch (_) { /* Enkelte nettlesere støtter ikke stemmelisten. */ }
        norskeStemmer = Array.from(alleStemmer).filter(stemme =>
          /^(?:nb|nn|no)(?:-|_)/i.test(String(stemme.lang || "")));
        stemmeSelect.replaceChildren();
        const automatisk = document.createElement("option");
        automatisk.value = "";
        automatisk.textContent = "Automatisk norsk stemme";
        stemmeSelect.appendChild(automatisk);
        for (const stemme of norskeStemmer) {
          const valg = document.createElement("option");
          valg.value = stemmeNokkel(stemme);
          valg.textContent = stemme.name + " (" + stemme.lang + ")";
          stemmeSelect.appendChild(valg);
        }
        stemmeSelect.value = norskeStemmer.some(stemme => stemmeNokkel(stemme) === valgtStemme)
          ? valgtStemme : "";
        stemmeInfo.textContent = !harTale ? "Opplesning er ikke tilgjengelig i nettleseren." :
          norskeStemmer.length ? "Stemmen brukes fra neste notis." :
          "Ingen norsk stemme funnet. Nettleserens standardstemme brukes.";
        varsleStemmevalg();
      };
      stemmeSelect.addEventListener("change", () => {
        valgtStemme = stemmeSelect.value;
        try { localStorage.setItem("paradisavisa-radiostemme", valgtStemme); }
        catch (_) { /* Valget virker denne økten. */ }
        varsleStemmevalg();
      });
      if (harTale && typeof tale.addEventListener === "function") {
        tale.addEventListener("voiceschanged", oppdaterStemmer);
      } else if (harTale && "onvoiceschanged" in tale) {
        // Fallback for nettlesere som eksponerer bare hendelsesegenskapen.
        const forrige = tale.onvoiceschanged;
        tale.onvoiceschanged = event => {
          if (typeof forrige === "function") forrige.call(tale, event);
          oppdaterStemmer();
        };
      }
      oppdaterStemmer();

      // Gjeninnført separat taletempo fra PR #73. Dette påvirker aldri
      // notisbåndets 2×/4×/5× og gjelder fra neste oppleste nyhet.
      const taletempo = [
        { verdi: 0.9, tekst: "0,9× – rolig" },
        { verdi: 1, tekst: "1,0× – normalt" },
        { verdi: 1.1, tekst: "1,1× – raskere" }
      ];
      let valgtTaletempo = 1;
      try {
        const lagret = Number(localStorage.getItem("paradisavisa-radiotempo"));
        if (taletempo.some(valg => valg.verdi === lagret)) valgtTaletempo = lagret;
      } catch (_) { /* Uten lokal lagring brukes normalt taletempo. */ }
      const tempoLabel = document.createElement("label");
      tempoLabel.htmlFor = "notis-radiotempo";
      tempoLabel.textContent = "Talehastighet";
      const tempoSelect = document.createElement("select");
      tempoSelect.id = "notis-radiotempo";
      tempoSelect.className = "notis-tempo-select";
      tempoSelect.disabled = !harTale;
      for (const valg of taletempo) {
        const option = document.createElement("option");
        option.value = String(valg.verdi);
        option.textContent = valg.tekst;
        tempoSelect.appendChild(option);
      }
      tempoSelect.value = String(valgtTaletempo);
      const settTaletempo = verdi => {
        const nummer = Number(verdi);
        if (!taletempo.some(valg => valg.verdi === nummer)) return;
        valgtTaletempo = nummer;
        tempoSelect.value = String(nummer);
        try { localStorage.setItem("paradisavisa-radiotempo", String(nummer)); }
        catch (_) { /* Valget gjelder likevel i denne fanen. */ }
        varsleSpiller();
      };
      tempoSelect.addEventListener("change", () => settTaletempo(tempoSelect.value));
      radioInnstillinger.append(stemmeLabel, stemmeSelect, stemmeInfo, tempoLabel, tempoSelect);

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
      let radioPauset = false;
      let radioVenter = false;
      let radioVersjon = 0;
      let radioIndeks = 0;
      let radioGjeldendeIndeks = -1;
      let radioKreverOmstart = false;
      let radioOvergangTimeout = null;
      let radioVarSkjult = false;
      const mellomNyheterMs = 650;
      let radioSistOppdatert = Date.now();
      let radiosaker = aktuelle.slice();
      const spillerLyttere = new Set();
      const spillerTilstand = () => ({
        aktiv: radioAktiv,
        pauset: radioPauset,
        gjeldendeIndeks: radioGjeldendeIndeks,
        gjeldende: radioGjeldendeIndeks >= 0 ? radiosaker[radioGjeldendeIndeks] : null,
        notiser: radiosaker.filter(item => isNotisAktuell(item)),
        koIndeks: radioAktiv ? radiosaker.filter(item => isNotisAktuell(item)).indexOf(radiosaker[radioGjeldendeIndeks]) : -1,
        stemmer: norskeStemmer.map(stemme => ({ value: stemmeNokkel(stemme), label: stemme.name + " (" + stemme.lang + ")" })),
        valgtStemme: valgtStemme,
        valgtTaletempo: valgtTaletempo,
        stemmeInfo: stemmeInfo.textContent,
        status: radiostatus.textContent,
        taleTilgjengelig: harTale
      });
      const varsleSpiller = () => {
        const tilstand = spillerTilstand();
        spillerLyttere.forEach(lytter => {
          try { lytter(tilstand); } catch (error) { console.error("Radiospiller:", error); }
        });
      };
      varsleStemmevalg = varsleSpiller;
      // Hvis radioen startes i en annen fane, stopp lokal opplesning.
      // Én nyhetskanal om gangen på samme origin der BroadcastChannel støttes.
      let radioKanal = null;
      const radioFane = Math.random().toString(36).slice(2);
      try {
        if (typeof BroadcastChannel === "function") {
          radioKanal = new BroadcastChannel("paradisavisa-nyhetsradio");
          radioKanal.addEventListener("message", event => {
            if (event.data?.type === "start" && event.data?.fane !== radioFane &&
                radioAktiv) stoppRadio("Nyhetsradioen spiller i en annen fane.");
          });
        }
      } catch (_) { /* Ingen fanesynkronisering i eldre nettlesere. */ }

      const radioPauseknapp = document.createElement("button");
      radioPauseknapp.type = "button";
      radioPauseknapp.className = "notis-radio-pause";
      const visRadio = () => {
        radioknapp.textContent = radioAktiv ? "■  Stopp opplesning" : "▶  Les opp notisene";
        radioknapp.setAttribute("aria-label", radioAktiv ? "Stopp nyhetsradio" : "Start nyhetsradio");
        radioknapp.setAttribute("aria-pressed", String(radioAktiv));
        radioPauseknapp.textContent = radioPauset ? "▶  Fortsett radio" : "Ⅱ  Pause radio";
        radioPauseknapp.setAttribute("aria-label", radioPauset ? "Fortsett nyhetsradio" : "Pause nyhetsradio");
        radioPauseknapp.setAttribute("aria-pressed", String(radioPauset));
        radioPauseknapp.disabled = !radioAktiv || !harTale ||
          typeof tale.pause !== "function" || typeof tale.resume !== "function";
        varsleSpiller();
      };
      const stoppRadio = (melding = "Nyhetsradioen er stoppet.") => {
        if (radioOvergangTimeout !== null) clearTimeout(radioOvergangTimeout);
        radioOvergangTimeout = null;
        radioKreverOmstart = false;
        const varPauset = radioPauset;
        radioAktiv = false;
        radioPauset = false;
        radioVenter = false;
        radioGjeldendeIndeks = -1;
        radioVersjon++;
        // Web Speech kan forbli pauset selv etter cancel(); nullstill før neste start.
        try {
          if (varPauset) tale?.resume?.();
          tale?.cancel();
        } catch (_) { /* Tale kan være utilgjengelig. */ }
        radiostatus.textContent = melding;
        band.classList.remove("is-radio");
        visRadio();
      };
      const lesNeste = versjon => {
        if (!radioAktiv || versjon !== radioVersjon) return;
        if (radioPauset) {
          radioVenter = true;
          return;
        }
        radioVenter = false;
        if (radioIndeks >= radiosaker.length) {
          // Ikke gjenta utløpte nyheter; oppdater eksternt høyst hvert femte minutt.
          radiosaker = radiosaker.filter(item => isNotisAktuell(item));
          if (!radiosaker.length) {
            stoppRadio("Ingen ferske notiser å lese opp.");
            return;
          }
          if (Date.now() - radioSistOppdatert < 5 * 60 * 1000) {
            radioIndeks = 0;
            lesNeste(versjon);
            return;
          }
          radioSistOppdatert = Date.now();
          fetch(source, { cache: "no-store" }).then(response => {
            if (!response.ok) throw new Error("Notisoppdatering feilet");
            return response.json();
          }).then(data => {
            if (!radioAktiv || versjon !== radioVersjon) return;
            if (!Array.isArray(data)) throw new Error("Ugyldig notisliste");
            radiosaker = prioriterNyeRadioNotiser(radiosaker, data);
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
        const notis = radiosaker[radioIndeks];
        radioGjeldendeIndeks = radioIndeks++;
        if (!isNotisAktuell(notis)) {
          lesNeste(versjon);
          return;
        }
        radioKreverOmstart = false;
        const ytring = new window.SpeechSynthesisUtterance(lagRadioOpplesning(notis));
        ytring.lang = "nb-NO";
        ytring.rate = valgtTaletempo;
        const norsk = norskeStemmer.find(stemme => stemmeNokkel(stemme) === valgtStemme) ||
          norskeStemmer.find(stemme => /^nb[-_]NO$/i.test(stemme.lang) && stemme.default) ||
          norskeStemmer.find(stemme => /^nb[-_]NO$/i.test(stemme.lang)) ||
          norskeStemmer[0];
        if (norsk) {
          ytring.voice = norsk;
          ytring.lang = norsk.lang;
        }
        radiostatus.textContent = "Leser: " + String(notis.category || "Nyheter");
        varsleSpiller();
        // Et lite opphold mellom notisene skaper nyhetsrytme, uten ekstra syntetisk tale.
        ytring.onend = () => {
          if (!radioAktiv || versjon !== radioVersjon || radioKreverOmstart) return;
          if (radioPauset) {
            radioVenter = true;
            return;
          }
          radiostatus.textContent = "Kort pause før neste nyhet.";
          varsleSpiller();
          radioOvergangTimeout = setTimeout(() => {
            radioOvergangTimeout = null;
            if (radioAktiv && versjon === radioVersjon) lesNeste(versjon);
          }, mellomNyheterMs);
        };
        ytring.onerror = event => {
          if (!radioAktiv || versjon !== radioVersjon || radioOvergangTimeout !== null) return;
          // Programmatisk neste/forrige/stopp øker radioVersjon og treffer ikke her.
          // Safari kan ellers sende interrupted/canceled mens brukerens radio ser aktiv ut.
          if (event?.error === "canceled" || event?.error === "interrupted") {
            radioKreverOmstart = true;
            radioPauset = true;
            radioVenter = false;
            radiostatus.textContent = "Opplesningen ble avbrutt. Trykk Fortsett for å starte denne nyheten på nytt.";
            visRadio();
            return;
          }
          stoppRadio("Opplesningen kunne ikke fortsette.");
        };
        try { tale.speak(ytring); }
        catch (_) { stoppRadio("Opplesning kunne ikke startes i nettleseren."); }
      };
      // Køvalg og Spill bruker samme motor. Ingen separat lydinstans på radiosiden.
      const spillFraKo = indeks => {
        if (!harTale || !Number.isInteger(indeks)) return;
        const ferske = radiosaker.filter(item => isNotisAktuell(item));
        if (indeks < 0 || indeks >= ferske.length) return;
        const fra = radiosaker.indexOf(ferske[indeks]);
        if (fra < 0) return;
        if (radioOvergangTimeout !== null) clearTimeout(radioOvergangTimeout);
        radioOvergangTimeout = null;
        radioKreverOmstart = false;
        const varPauset = radioPauset;
        const varAktiv = radioAktiv;
        radioAktiv = true;
        radioPauset = false;
        radioVenter = false;
        radioIndeks = fra;
        radioGjeldendeIndeks = -1;
        if (!varAktiv) radioSistOppdatert = Date.now();
        const versjon = ++radioVersjon;
        try {
          if (varPauset) tale.resume?.();
          tale.cancel();
        } catch (_) { /* Tale kan være utilgjengelig under fanebytte. */ }
        if (!varAktiv) {
          try { radioKanal?.postMessage({ type: "start", fane: radioFane }); } catch (_) {}
          band.classList.add("is-radio");
        }
        visRadio();
        lesNeste(versjon);
      };
      radioknapp.addEventListener("click", () => {
        if (!harTale) return;
        if (radioAktiv) stoppRadio();
        else spillFraKo(0);
      });
      const byttRadioPause = () => {
        if (!radioAktiv || !harTale) return;
        if (radioPauset) {
          // Etter et uventet iPad-/Safari-avbrudd må talen startes på nytt av et
          // reelt brukerklikk. Vi starter samme nyhet, ikke neste i køen.
          if (radioKreverOmstart) {
            const ferske = radiosaker.filter(item => isNotisAktuell(item));
            const indeks = ferske.indexOf(radiosaker[radioGjeldendeIndeks]);
            if (indeks >= 0) spillFraKo(indeks);
            else stoppRadio("Nyheten er ikke lenger aktuell.");
            return;
          }
          try {
            tale.resume();
            radioPauset = false;
            radiostatus.textContent = "Nyhetsradioen fortsetter.";
            visRadio();
            if (radioVenter) lesNeste(radioVersjon);
          } catch (_) { stoppRadio("Kunne ikke fortsette opplesningen."); }
        } else {
          try {
            if (radioOvergangTimeout !== null) {
              clearTimeout(radioOvergangTimeout);
              radioOvergangTimeout = null;
              radioVenter = true;
            }
            tale.pause();
            radioPauset = true;
            radiostatus.textContent = "Nyhetsradioen er satt på pause.";
            visRadio();
          } catch (_) { stoppRadio("Kunne ikke pause opplesningen."); }
        }
      };
      radioPauseknapp.addEventListener("click", byttRadioPause);
      const hoppRadio = steg => {
        if (!radioAktiv) return;
        const ferske = radiosaker.filter(item => isNotisAktuell(item));
        if (!ferske.length) {
          stoppRadio("Ingen ferske notiser å lese opp.");
          return;
        }
        // Navigasjon følger den samme filtrerte listen som vises på radiosiden.
        // En utløpt nyhet kan dermed ikke velges ved Neste eller Forrige.
        const fra = ferske.indexOf(radiosaker[radioGjeldendeIndeks]);
        const mål = ((fra < 0 ? (steg > 0 ? -1 : 0) : fra) +
          steg + ferske.length) % ferske.length;
        spillFraKo(mål);
      };
      window.ParadisRadioPlayer = {
        getState: spillerTilstand,
        subscribe(lytter) {
          spillerLyttere.add(lytter);
          lytter(spillerTilstand());
          return () => spillerLyttere.delete(lytter);
        },
        play() {
          if (!radioAktiv) radioknapp.click();
          else if (radioPauset) byttRadioPause();
        },
        pause() {
          if (radioAktiv && !radioPauset) byttRadioPause();
        },
        resume() {
          if (radioAktiv && radioPauset) byttRadioPause();
        },
        stop() {
          if (radioAktiv) stoppRadio();
        },
        playIndex(indeks) { spillFraKo(indeks); },
        setVoice(verdi) {
          if (typeof verdi !== "string" ||
              (verdi && !norskeStemmer.some(stemme => stemmeNokkel(stemme) === verdi))) return;
          valgtStemme = verdi;
          stemmeSelect.value = verdi;
          try { localStorage.setItem("paradisavisa-radiostemme", verdi); }
          catch (_) { /* Valget fungerer i denne fanen. */ }
          varsleSpiller();
        },
        setTempo(verdi) { settTaletempo(verdi); },
        next() { hoppRadio(1); },
        previous() { hoppRadio(-1); }
      };
      visRadio();
      const radioSideLenke = document.createElement("a");
      radioSideLenke.className = "notis-radio-side-lenke";
      radioSideLenke.textContent = "Åpne hele radiosiden";
      radioSideLenke.href = new URL("paradisradio.html", appScript?.src || location.href).href;
      radioSideLenke.target = "_blank";
      radioSideLenke.rel = "noopener noreferrer";
      panel.append(radioknapp, radioPauseknapp, radioInnstillinger, radiostatus, radioSideLenke);

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
      // Safari på iPad kan avbryte lokal Web Speech ved skjermlås eller fanebytte.
      // Ingen automatisk omstart uten brukertrykk når fanen blir synlig igjen.
      const vedSynlighetsendring = () => {
        if (document.visibilityState === "hidden") {
          radioVarSkjult = true;
          return;
        }
        if (!radioVarSkjult) return;
        radioVarSkjult = false;
        if (radioAktiv && !radioPauset && radioOvergangTimeout === null &&
            typeof tale?.speaking === "boolean" && !tale.speaking) {
          radioKreverOmstart = true;
          radioPauset = true;
          radioVenter = false;
          radiostatus.textContent = "Talen kan ha stoppet da iPad ble låst eller fanen ble byttet. Trykk Fortsett for å prøve nyheten på nytt.";
          visRadio();
        }
      };
      document.addEventListener("visibilitychange", vedSynlighetsendring);
      window.addEventListener("pagehide", () => {
        document.removeEventListener("visibilitychange", vedSynlighetsendring);
        if (radioAktiv) stoppRadio();
        try { radioKanal?.close(); } catch (_) {}
        if (typeof tale?.removeEventListener === "function") {
          tale.removeEventListener("voiceschanged", oppdaterStemmer);
        }
      });
      kontroller.append(valgknapp, panel);
      band.appendChild(kontroller);
      // Sjekk samme notiskatalog regelmessig mens siden er åpen, også etter
      // datobytte. Ingen omstart av tale, og ingen ekstra radiomotor.
      let oppdateringPaagar = false;
      const oppdaterAktuelleNotiser = async () => {
        if (oppdateringPaagar || document.visibilityState === "hidden") return;
        oppdateringPaagar = true;
        try {
          const response = await fetch(source, { cache: "no-store" });
          if (!response.ok) throw new Error("Kunne ikke oppdatere notiser");
          const data = await response.json();
          if (!Array.isArray(data)) throw new Error("Ugyldig notiskatalog");
          const nye = data.filter(item => isNotisAktuell(item))
            .sort((a, b) => String(b.date || "").localeCompare(String(a.date || "")));
          // Sammenlign hele innholdet: rettede notiser skal også slå gjennom.
          if (JSON.stringify(nye) === JSON.stringify(aktuelle)) {
            radioSistOppdatert = Date.now();
            return;
          }

          const gammelKo = radiosaker;
          const gjeldende = gammelKo[radioGjeldendeIndeks];
          const uavspilte = gammelKo.slice(radioIndeks);
          const nyKo = prioriterNyeRadioNotiser(gammelKo, data);
          const finn = notis => nyKo.findIndex(n => radioNotisNokkel(n) === radioNotisNokkel(notis));
          radiosaker = nyKo;
          radioSistOppdatert = Date.now();
          if (radioAktiv) {
            // Fortsett med neste uavspilte, eksisterende notis. Nye saker
            // ligger foran i listen og leses ved neste rundeskifte.
            const neste = uavspilte.find(n => finn(n) >= 0);
            radioIndeks = neste ? finn(neste) : nyKo.length;
            radioGjeldendeIndeks = gjeldende ? finn(gjeldende) : -1;
          } else {
            radioIndeks = 0;
            radioGjeldendeIndeks = -1;
          }

          aktuelle = nye;
          nesteNotisIndeks = 0;
          if (!aktuelle.length) {
            tickerAnimasjon?.cancel();
            tickerAnimasjon = null;
            innhold.replaceChildren();
            band.hidden = true;
            band.style.display = "none";
            if (radioAktiv) stoppRadio("Ingen ferske notiser å lese opp.");
            window.dispatchEvent(new Event("paradisradio:empty"));
          } else {
            band.hidden = false;
            band.style.removeProperty("display");
            const forste = innhold.firstElementChild;
            if (forste && aktuelle.some(n => radioNotisNokkel(n) === forste.dataset.notisKey)) {
              // La den synlige notisen rulle ferdig, men fjern foreldet kø.
              // Neste element må følge etter det som allerede er synlig.
              nesteNotisIndeks = aktuelle.findIndex(n =>
                radioNotisNokkel(n) === forste.dataset.notisKey) + 1;
              Array.from(innhold.children).slice(1).forEach(el => el.remove());
              fyllNotisspor();
            } else {
              tickerAnimasjon?.cancel();
              tickerAnimasjon = null;
              innhold.replaceChildren();
              startNesteNotis();
            }
          }
          varsleSpiller();
        } catch (error) {
          // Behold sist godkjente innhold ved nettfeil; ingen falske notiser.
          console.warn("Kunne ikke oppdatere notiser:", error);
        } finally {
          oppdateringPaagar = false;
        }
      };
      const oppfriskIntervall = window.setInterval(oppdaterAktuelleNotiser, 5 * 60 * 1000);
      const vedTilbakekomst = () => {
        if (document.visibilityState === "visible") oppdaterAktuelleNotiser();
      };
      document.addEventListener("visibilitychange", vedTilbakekomst);
      window.addEventListener("pagehide", () => {
        window.clearInterval(oppfriskIntervall);
        document.removeEventListener("visibilitychange", vedTilbakekomst);
      });

      // Radiosiden og det lille kontrollpanelet bruker samme spiller i denne fanen.
      window.dispatchEvent(new Event("paradisradio:ready"));

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

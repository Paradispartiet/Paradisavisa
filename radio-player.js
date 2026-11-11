/* Paradisradioen: én delt Web Speech-motor, én radioside, én klikkbar nyhetskø.
   Radiostemmen endres gjennom samme motor som notisbåndets kompakte meny. */
(() => {
  "use strict";
  const init = () => {
    const root = document.getElementById("paradisradio-player");
    if (!root) return;
    const finn = name => root.querySelector('[data-radio="' + name + '"]');
    const spille = finn("play");
    const stopp = finn("stop");
    const neste = finn("next");
    const forrige = finn("previous");
    const status = finn("status");
    const kategori = finn("category");
    const overskrift = finn("headline");
    const dato = finn("date");
    const kilde = finn("source");
    const liste = finn("playlist");
    const listeAntall = finn("count");
    const stemmevalg = finn("voice");
    const stemmeStatus = finn("voice-status");
    let spiller = null;
    let unsubscribe = null;
    let visteNotiser = [];
    let listeelementer = [];
    let stemmeSignatur = "";

    const sikkerKilde = value => {
      if (!value) return null;
      try {
        const url = new URL(value, document.location.href);
        return ["http:", "https:"].includes(url.protocol) ? url.href : null;
      } catch (_) { return null; }
    };
    const visTom = melding => {
      status.textContent = melding;
      overskrift.textContent = "Ingen aktuelle notiser";
      kategori.textContent = "PARADISAVISA";
      dato.textContent = "";
      kilde.hidden = true;
      liste.replaceChildren();
      listeelementer = [];
      visteNotiser = [];
      listeAntall.textContent = "0 aktuelle notiser";
      for (const knapp of [spille, stopp, neste, forrige]) knapp.disabled = true;
    };
    const visStemmer = tilstand => {
      const stemmer = Array.isArray(tilstand.stemmer) ? tilstand.stemmer : [];
      const signatur = JSON.stringify(stemmer);
      if (signatur !== stemmeSignatur) {
        stemmeSignatur = signatur;
        stemmevalg.replaceChildren();
        const automatisk = document.createElement("option");
        automatisk.value = "";
        automatisk.textContent = "Automatisk norsk stemme";
        stemmevalg.appendChild(automatisk);
        stemmer.forEach(stemme => {
          const option = document.createElement("option");
          option.value = stemme.value;
          option.textContent = stemme.label;
          stemmevalg.appendChild(option);
        });
      }
      const valgt = tilstand.valgtStemme || "";
      stemmevalg.value = stemmer.some(stemme => stemme.value === valgt) ? valgt : "";
      stemmevalg.disabled = !tilstand.taleTilgjengelig;
      stemmeStatus.textContent = tilstand.stemmeInfo || "Lokal opplesning fra enheten.";
    };
    const visKo = (notiser, tilstand, tilgjengelig) => {
      // Ikke bygg om listen for hver talestatus: det beholder fokus på iPad og for tastatur.
      if (notiser.length !== visteNotiser.length ||
          notiser.some((item, indeks) => item !== visteNotiser[indeks])) {
        liste.replaceChildren();
        listeelementer = [];
        notiser.forEach((item, indeks) => {
          const li = document.createElement("li");
          li.className = "radio-listeelement";
          const knapp = document.createElement("button");
          knapp.type = "button";
          knapp.className = "radio-ko-knapp";
          knapp.dataset.radioIndex = String(indeks);
          knapp.setAttribute("aria-label", "Spill nyhet " + (indeks + 1) + ": " +
            String(item.category || "Nyheter") + ". " + String(item.text || "").slice(0, 160));
          const nummer = document.createElement("span");
          nummer.className = "radio-ko-nummer";
          nummer.textContent = String(indeks + 1).padStart(2, "0");
          const info = document.createElement("span");
          info.className = "radio-ko-info";
          const label = document.createElement("strong");
          label.textContent = String(item.category || "Nyheter");
          const body = document.createElement("span");
          body.textContent = String(item.text || "");
          const time = document.createElement("time");
          time.dateTime = String(item.date || "");
          time.textContent = String(item.date || "");
          info.append(label, body, time);
          const ikon = document.createElement("span");
          ikon.className = "radio-ko-spillikon";
          ikon.textContent = "▶";
          ikon.setAttribute("aria-hidden", "true");
          knapp.append(nummer, info, ikon);
          knapp.addEventListener("click", () => spiller?.playIndex(indeks));
          li.appendChild(knapp);
          liste.appendChild(li);
          listeelementer.push({ li, knapp });
        });
        visteNotiser = notiser.slice();
      }
      listeelementer.forEach(({li, knapp}, indeks) => {
        const erGjeldende = Boolean(tilstand.aktiv) && indeks === tilstand.koIndeks;
        if (erGjeldende) li.setAttribute("aria-current", "true");
        else li.removeAttribute("aria-current");
        knapp.disabled = !tilgjengelig;
      });
    };
    const visSpiller = tilstand => {
      const notiser = tilstand.notiser || [];
      const aktiv = Boolean(tilstand.aktiv);
      const pauset = Boolean(tilstand.pauset);
      const tilgjengelig = Boolean(tilstand.taleTilgjengelig);
      visStemmer(tilstand);
      if (!notiser.length) {
        visTom("Ingen ferske nyheter å spille. Tidligere notiser er arkivert.");
        return;
      }
      const gjeldende = tilstand.gjeldende || (!aktiv ? notiser[0] : null);
      status.textContent = tilstand.status || "Trykk Spill for å høre nyhetene.";
      kategori.textContent = String(gjeldende?.category || "Nyheter");
      overskrift.textContent = String(gjeldende?.text || "Trykk Spill for å starte nyhetsradioen.");
      dato.textContent = gjeldende?.date ? "Publisert " + gjeldende.date : "";
      const url = sikkerKilde(gjeldende?.url);
      kilde.hidden = !url;
      if (url) kilde.href = url;

      spille.textContent = !aktiv ? "▶ Spill" : pauset ? "▶ Fortsett" : "Ⅱ Pause";
      spille.setAttribute("aria-label", !aktiv ? "Spill nyhetsradio" :
        pauset ? "Fortsett nyhetsradio" : "Pause nyhetsradio");
      spille.disabled = !tilgjengelig;
      stopp.disabled = !tilgjengelig || !aktiv;
      neste.disabled = !tilgjengelig || !aktiv || notiser.length < 2;
      forrige.disabled = !tilgjengelig || !aktiv || notiser.length < 2;
      listeAntall.textContent = notiser.length + " aktuelle notiser";
      visKo(notiser, tilstand, tilgjengelig);
    };
    const spillFraMotor = () => {
      const motor = window.ParadisRadioPlayer;
      if (!motor || spiller) return;
      spiller = motor;
      unsubscribe = spiller.subscribe(visSpiller);
      root.dataset.ready = "true";
    };

    spille.addEventListener("click", () => {
      if (!spiller) return;
      const tilstand = spiller.getState();
      if (tilstand.aktiv && !tilstand.pauset) spiller.pause();
      else spiller.play();
    });
    stopp.addEventListener("click", () => spiller?.stop());
    neste.addEventListener("click", () => spiller?.next());
    forrige.addEventListener("click", () => spiller?.previous());
    stemmevalg.addEventListener("change", () => spiller?.setVoice(stemmevalg.value));
    window.addEventListener("paradisradio:ready", spillFraMotor);
    window.addEventListener("paradisradio:empty", () => {
      if (!spiller) visTom("Ingen ferske nyheter å spille. Tidligere notiser er arkivert.");
    });
    window.addEventListener("pagehide", () => {
      unsubscribe?.();
      unsubscribe = null;
    });
    if (window.ParadisRadioPlayer) spillFraMotor();
    else visTom("Henter aktuelle notiser …");
  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();

/* Paradisavisas radioside. Ingen egen lydmotor: bruker samme
   window.ParadisRadioPlayer som notisbåndets kontrollmeny. */
(() => {
  "use strict";
  const init = () => {
    const root = document.getElementById("paradisradio-player");
    if (!root) return;

    const finn = name => root.querySelector('[data-radio="' + name + '"]');
    const spille = finn("play");
    const pause = finn("pause");
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
    const kontrollAapner = document.getElementById("paradisradio-kontroller");
    let spiller = null;
    let unsubscribe = null;

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
      listeAntall.textContent = "0 aktuelle notiser";
      for (const knapp of [spille, pause, stopp, neste, forrige]) knapp.disabled = true;
    };
    const visSpiller = tilstand => {
      const notiser = tilstand.notiser || [];
      const aktiv = Boolean(tilstand.aktiv);
      const pauset = Boolean(tilstand.pauset);
      const tilgjengelig = Boolean(tilstand.taleTilgjengelig);
      const gjeldende = tilstand.gjeldende ||
        (!aktiv ? notiser[0] : null);

      if (!notiser.length) {
        visTom("Ingen ferske nyheter å spille. Tidligere notiser er arkivert.");
        return;
      }

      status.textContent = tilstand.status || "Trykk Spill for å høre nyhetene.";
      kategori.textContent = String(gjeldende?.category || "Nyheter");
      overskrift.textContent = String(gjeldende?.text || "Trykk Spill for å starte nyhetsradioen.");
      dato.textContent = gjeldende?.date ? "Publisert " + gjeldende.date : "";
      const url = sikkerKilde(gjeldende?.url);
      kilde.hidden = !url;
      if (url) kilde.href = url;

      spille.textContent = !aktiv ? "▶ Spill" : pauset ? "▶ Fortsett" : "Spiller nå";
      spille.disabled = !tilgjengelig || (aktiv && !pauset);
      pause.disabled = !tilgjengelig || !aktiv || pauset;
      stopp.disabled = !tilgjengelig || !aktiv;
      neste.disabled = !tilgjengelig || !aktiv || notiser.length < 2;
      forrige.disabled = !tilgjengelig || !aktiv || notiser.length < 2;
      listeAntall.textContent = notiser.length + " aktuelle notiser";
      liste.replaceChildren();

      notiser.forEach((item, index) => {
        const li = document.createElement("li");
        li.className = "radio-listeelement";
        // Vi sammenligner objektidentitet fra samme liste og motor.
        const erGjeldende = aktiv && item === tilstand.gjeldende;
        if (erGjeldende) li.setAttribute("aria-current", "true");
        const label = document.createElement("strong");
        label.textContent = String(item.category || "Nyheter");
        const body = document.createElement("span");
        body.textContent = String(item.text || "");
        const time = document.createElement("time");
        time.dateTime = String(item.date || "");
        time.textContent = String(item.date || "");
        li.append(label, body, time);
        liste.appendChild(li);
      });
    };
    const spillFraMotor = () => {
      const motor = window.ParadisRadioPlayer;
      if (!motor || spiller) return;
      spiller = motor;
      for (const knapp of [spille, pause, stopp, neste, forrige]) knapp.disabled = false;
      unsubscribe = spiller.subscribe(visSpiller);
      root.dataset.ready = "true";
    };

    spille.addEventListener("click", () => spiller?.play());
    pause.addEventListener("click", () => spiller?.pause());
    stopp.addEventListener("click", () => spiller?.stop());
    neste.addEventListener("click", () => spiller?.next());
    forrige.addEventListener("click", () => spiller?.previous());
    kontrollAapner?.addEventListener("click", () => {
      const knapp = document.querySelector(".notis-valgknapp");
      if (!knapp) {
        status.textContent = "Ingen aktuelle notiser. Radioinnstillingene er ikke tilgjengelige nå.";
        return;
      }
      if (knapp.getAttribute("aria-expanded") !== "true") knapp.click();
      document.querySelector(".notis-stemme-select")?.focus();
    });

    window.addEventListener("paradisradio:ready", spillFraMotor);
    window.addEventListener("paradisradio:empty", () => {
      if (!spiller) visTom("Ingen ferske nyheter å spille. Tidligere notiser er arkivert.");
    });
    window.addEventListener("pagehide", () => {
      unsubscribe?.();
      unsubscribe = null;
    });
    if (window.ParadisRadioPlayer) spillFraMotor();
    else {
      visTom("Henter aktuelle notiser …");
      // Spilleren skal ikke kreve oppfriskning av hele siden for å kunne starte.
      // loadNotiser sender paradisradio:ready når den er klar.
    }
  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();

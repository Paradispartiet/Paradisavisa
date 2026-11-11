/* Paradisavisa – progressive, accessible modules for canonical articles.
   No third-party trackers, no remote requests, no fabricated public vote totals. */
(() => {
  "use strict";
  if (!document.documentElement.classList.contains("av-artikkelside")) return;

  const scope = document.querySelector("article.av-artikkel");
  if (!scope) return;

  /* Poll: a local opinion prompt, not a public tally. Back-end counts require a
     separately approved and protected API with documented privacy policy. */
  scope.querySelectorAll("[data-av-poll]").forEach(poll => {
    const pollId = poll.getAttribute("data-av-poll");
    const form = poll.querySelector("form");
    const result = poll.querySelector("[data-av-poll-result]");
    const resultValue = poll.querySelector("[data-av-poll-choice]");
    const change = poll.querySelector("[data-av-poll-change]");
    if (!pollId || !/^[a-z0-9-]+$/.test(pollId) || !form || !result || !resultValue || !change) return;
    const choices = [...form.querySelectorAll('input[type="radio"][name="choice"]')];
    if (!choices.length) return;
    const key = "paradisavisa:local-poll:v1:" + pollId;
    const getSaved = () => { try { return window.localStorage.getItem(key); } catch (_) { return null; } };
    const setSaved = val => { try { window.localStorage.setItem(key, val); } catch (_) { /* ephemeral in private mode */ } };
    const show = val => {
      const choice = choices.find(input => input.value === val);
      if (!choice) return;
      choice.checked = true;
      const label = choice.closest("label");
      resultValue.textContent = label ? (label.querySelector("span")?.textContent || label.textContent).trim() : val;
      form.hidden = true;
      result.hidden = false;
    };
    const saved = getSaved();
    if (saved) show(saved);
    form.addEventListener("submit", event => {
      event.preventDefault();
      const choice = choices.find(input => input.checked);
      if (!choice) {
        const message = poll.querySelector("[data-av-poll-error]");
        if (message) message.textContent = "Velg ett svar før du fortsetter.";
        choices[0].focus();
        return;
      }
      const message = poll.querySelector("[data-av-poll-error]");
      if (message) message.textContent = "";
      setSaved(choice.value);
      show(choice.value);
    });
    change.addEventListener("click", () => {
      result.hidden = true;
      form.hidden = false;
      choices.find(input => input.checked)?.focus();
    });
  });

  /* Zoom: link remains navigable without JS or <dialog> support. */
  const zoom = document.querySelector("#av-zoom-dialog");
  if (zoom && typeof zoom.showModal === "function") {
    const zoomImage = zoom.querySelector("[data-av-zoom-image]");
    const zoomCaption = zoom.querySelector("[data-av-zoom-caption]");
    scope.querySelectorAll("a[data-av-zoom]").forEach(link => {
      link.addEventListener("click", event => {
        const figure = link.closest("figure");
        const image = figure?.querySelector("img");
        const href = link.getAttribute("href");
        if (!figure || !image || !href || !zoomImage || !zoomCaption) return;
        event.preventDefault();
        zoomImage.src = href;
        zoomImage.alt = image.alt;
        zoomCaption.textContent = figure.querySelector("figcaption")?.textContent?.trim() || "";
        zoom.showModal();
      });
    });
    zoom.querySelector("[data-av-zoom-close]")?.addEventListener("click", () => zoom.close());
    zoom.addEventListener("click", event => { if (event.target === zoom) zoom.close(); });
    zoom.addEventListener("close", () => { if (zoomImage) zoomImage.removeAttribute("src"); });
  }

  /* Step-by-step explainer: all panels are readable without JavaScript. */
  scope.querySelectorAll("[data-av-explainer]").forEach(explainer => {
    const buttons = [...explainer.querySelectorAll("button[data-av-step]")];
    const panels = [...explainer.querySelectorAll("[data-av-panel]")];
    if (!buttons.length || buttons.length !== panels.length) return;
    const steps = buttons.map(button => button.dataset.avStep);
    if (new Set(steps).size !== steps.length || steps.some(step => !panels.some(p => p.dataset.avPanel === step))) return;
    const setActive = step => {
      buttons.forEach(button => button.setAttribute("aria-pressed", String(button.dataset.avStep === step)));
      panels.forEach(panel => { panel.hidden = panel.dataset.avPanel !== step; });
    };
    buttons.forEach((button, i) => {
      button.addEventListener("click", () => setActive(button.dataset.avStep));
      button.addEventListener("keydown", event => {
        let next = null;
        if (event.key === "ArrowRight" || event.key === "ArrowDown") next = (i + 1) % buttons.length;
        if (event.key === "ArrowLeft" || event.key === "ArrowUp") next = (i + buttons.length - 1) % buttons.length;
        if (event.key === "Home") next = 0;
        if (event.key === "End") next = buttons.length - 1;
        if (next === null) return;
        event.preventDefault();
        buttons[next].focus();
        setActive(buttons[next].dataset.avStep);
      });
    });
    setActive(steps[0]);
  });
})();

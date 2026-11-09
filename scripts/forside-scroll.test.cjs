"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

class FakeElement {
  constructor(tagName = "div") {
    this.tagName = tagName;
    this.children = [];
    this.events = {};
    this.attributes = {};
    this.scrollLeft = 0;
    this.clientWidth = 320;
    this.disabled = false;
  }
  appendChild(child) { this.children.push(child); return child; }
  append(...children) { children.forEach(child => this.appendChild(child)); }
  replaceChildren(...children) { this.children = [...children]; }
  setAttribute(name, value) { this.attributes[name] = value; }
  addEventListener(name, callback) { this.events[name] = callback; }
  closest() { return {querySelector: () => ({textContent: "Nyheter"})}; }
  scrollTo({left}) {
    this.scrollLeft = left;
    this.events.scroll?.();
  }
}
function fixture() {
  const script = fs.readFileSync(path.resolve(__dirname, "../script.js"), "utf8");
  const sandbox = {
    document: {
      addEventListener() {},
      createElement: name => new FakeElement(name)
    },
    window: {matchMedia: () => ({matches: false})},
    console
  };
  vm.runInNewContext(script, sandbox, {filename: "script.js"});
  const cards = Array.from({length: 12}, (_, i) => {
    const card = new FakeElement("a");
    card.href = "artikler/sak-" + (i + 1) + ".html";
    return card;
  });
  return {render: sandbox.renderFourFrontPageCards, cards, grid: new FakeElement()};
}
test("Forsiden har høyst fire synlige plasser og resten i det fjerde kortet", () => {
  const {render, cards, grid} = fixture();
  render(grid, cards);
  assert.equal(grid.children.length, 4);
  assert.deepEqual(grid.children.slice(0, 3), cards.slice(0, 3));
  const host = grid.children[3];
  assert.equal(host.className, "avis-sisteplass");
  const [rail, controls] = host.children;
  assert.deepEqual(rail.children, cards.slice(3));
  assert.equal(rail.attributes["aria-roledescription"], "karusell");
  assert.equal(controls.children[1].textContent, "4 / 12");
  const next = controls.children[3];
  next.events.click();
  assert.equal(rail.scrollLeft, 320);
  assert.equal(controls.children[1].textContent, "5 / 12");
  assert.equal(controls.children[2].disabled, false);
  rail.scrollTo({left: 8 * 320});
  assert.equal(controls.children[1].textContent, "12 / 12");
  assert.equal(next.disabled, true);
});
test("Fire eller færre artikler får ikke en unødvendig karusell", () => {
  const {render, cards, grid} = fixture();
  render(grid, cards.slice(0, 4));
  assert.deepEqual(grid.children, cards.slice(0, 4));
  render(grid, cards.slice(0, 2));
  assert.deepEqual(grid.children, cards.slice(0, 2));
});
test("Tastaturnavigasjon beveger bare den siste plassens karusell", () => {
  const {render, cards, grid} = fixture();
  render(grid, cards.slice(0, 7));
  const [rail, controls] = grid.children[3].children;
  let prevented = false;
  rail.events.keydown({key: "ArrowRight", preventDefault: () => {prevented = true;}});
  assert.equal(prevented, true);
  assert.equal(rail.scrollLeft, 320);
  assert.equal(controls.children[1].textContent, "5 / 7");
});

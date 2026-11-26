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


function nyhetskilder() {
  const root = path.resolve(__dirname, "..");
  const innen = JSON.parse(fs.readFileSync(path.join(root, "Nyhetshjul.json"), "utf8"));
  const feature = JSON.parse(fs.readFileSync(path.join(root, "Nyhetshjul2.json"), "utf8"));
  return {innen, feature};
}

test("Alle publiserte nyheter og feature har eksplisitt geografisk merking", () => {
  const {innen, feature} = nyhetskilder();
  const alle = [...innen, ...feature];
  const geografi = new Map();
  assert.ok(innen.length>0 && feature.length>0);
  for (const article of alle) {
    assert.ok(["innenriks", "utenriks"].includes(article.geografi),
      article.title + " mangler presis Innenriks/Utenriks-merking");
    if (geografi.has(article.url))
      assert.equal(article.geografi, geografi.get(article.url),
        "Samme artikkel har ulik geografisk merking i feedene");
    geografi.set(article.url, article.geografi);
  }
  assert.ok(innen.some(x => x.geografi === "innenriks"));
  assert.ok(innen.some(x => x.geografi === "utenriks"));
  assert.equal(innen.find(x => x.url.includes("fjernvarmelekkasje")).geografi, "innenriks");
  assert.equal(innen.find(x => x.url.includes("massie-hegseth")).geografi, "utenriks");
});

test("Forsiden viser Innenriks og Utenriks som egne komplette kortsamlinger", async () => {
  const script = fs.readFileSync(path.resolve(__dirname, "../script.js"), "utf8");
  const {innen} = nyhetskilder();
  const domestic = new FakeElement(), foreign = new FakeElement();
  const grids = {"nyhetshjul-grid":domestic,"utenrikshjul-grid":foreign};
  const sandbox = {
    document: {
      addEventListener() {},
      getElementById: id => grids[id] || null,
      body: {classList:{contains: className => className === "avis-forside"}}
    },
    fetch: async file => {
      assert.equal(file, "Nyhetshjul.json");
      return {ok:true,json:async()=>innen};
    },
    console
  };
  vm.runInNewContext(script, sandbox);
  sandbox.buildArticleCard = article => ({href:article.url});
  sandbox.renderFourFrontPageCards = (grid,cards) => grid.replaceChildren(...cards);
  sandbox.displayFreshness = () => {};
  await sandbox.loadNyhetshjul();
  const domesticUrls = domestic.children.map(x=>x.href);
  const foreignUrls = foreign.children.map(x=>x.href);
  assert.deepEqual(domesticUrls.sort(), innen.filter(x=>x.geografi==="innenriks").map(x=>x.url).sort());
  assert.deepEqual(foreignUrls.sort(), innen.filter(x=>x.geografi==="utenriks").map(x=>x.url).sort());
});

test("Nyhetsarkivet er todelt, avviser duplikater og kulturarkivet beholdes", async () => {
  const script = fs.readFileSync(path.resolve(__dirname, "../script.js"), "utf8");
  const {innen,feature} = nyhetskilder();
  const inside = new FakeElement(), outside = new FakeElement();
  inside.dataset = {artikkelkategori:"nyheter",nyhetsomrade:"innenriks"};
  outside.dataset = {artikkelkategori:"nyheter",nyhetsomrade:"utenriks"};
  const sandbox = {
    document: {
      addEventListener() {},
      querySelectorAll: () => [inside,outside],
      createElement: tag => new FakeElement(tag)
    },
    fetch: async name => {
      const data = {"Nyhetshjul.json":innen,"Nyhetshjul2.json":feature};
      assert.ok(data[name], "Ukjent arkivfil: "+name);
      return {ok:true,json:async()=>data[name]};
    },
    console
  };
  vm.runInNewContext(script, sandbox);
  sandbox.loadCategoryArchive();
  await new Promise(resolve => setImmediate(resolve));
  const domesticUrls = inside.children.map(x=>x.href), foreignUrls = outside.children.map(x=>x.href);
  const seen = new Map([...innen,...feature].map(x=>[x.url,x.geografi]));
  const expected = geografi => [...seen].filter(([,value])=>value===geografi).map(([url])=>url).sort();
  assert.deepEqual(domesticUrls.sort(), expected("innenriks"));
  assert.deepEqual(foreignUrls.sort(), expected("utenriks"));
});

test("Nyhetsmeny, arkivlenker og mobile kortstiler er tydelige på begge spor", () => {
  const root = path.resolve(__dirname, "..");
  const home = fs.readFileSync(path.join(root,"index.html"),"utf8");
  const archive = fs.readFileSync(path.join(root,"nyheter.html"),"utf8");
  const css = fs.readFileSync(path.join(root,"avisdesign.css"),"utf8");
  const baseCss = fs.readFileSync(path.join(root,"styles.css"),"utf8");
  assert.match(home, /id="nyhetshjul"[^>]*aria-labelledby="siste-nyheter-tittel"/);
  assert.match(home, /id="utenrikshjul"[^>]*aria-labelledby="utenriks-tittel"/);
  assert.match(home, /id="utenrikshjul-grid"/);
  assert.match(home, /href="#nyhetshjul">Innenriks/);
  assert.match(home, /href="#utenrikshjul">Utenriks/);
  assert.match(home, /href="nyheter\.html#utenriks"/);
  assert.match(archive, /id="innenriks"/);
  assert.match(archive, /id="utenriks"/);
  assert.match(archive, /data-nyhetsomrade="innenriks"/);
  assert.match(archive, /data-nyhetsomrade="utenriks"/);
  assert.match(css, /:is\(#nyhetshjul-grid,#utenrikshjul-grid\)/);
  assert.match(baseCss, /:is\(#nyhetshjul-grid,#utenrikshjul-grid\)/);
  assert.match(home, /script\.js\?v=47/);
  assert.match(archive, /script\.js\?v=47/);
});

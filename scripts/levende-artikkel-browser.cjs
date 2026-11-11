/* Actual Chromium exercise of the living article demo.
   Never tests factual claims or treats demonstration figures as real. */
"use strict";
const http=require("node:http");
const fs=require("node:fs");
const path=require("node:path");
const assert=require("node:assert/strict");
const {chromium}=require("playwright");
const root=path.resolve(__dirname,"..");
const mime={".html":"text/html; charset=utf-8",".css":"text/css; charset=utf-8",".js":"text/javascript; charset=utf-8",".svg":"image/svg+xml",".png":"image/png",".webp":"image/webp"};
const server=http.createServer((request,response)=>{
  let pathname;
  try { pathname=decodeURIComponent(new URL(request.url,"http://localhost").pathname); } catch (_) {response.writeHead(400);response.end();return;}
  const filename=path.resolve(root,"."+pathname);
  if(filename!==root&&!filename.startsWith(root+path.sep)){response.writeHead(403);response.end();return;}
  fs.readFile(filename,(err,buffer)=>{
    if(err){response.writeHead(404);response.end("Not found");return;}
    response.writeHead(200,{"Content-Type":mime[path.extname(filename)]||"application/octet-stream"});
    response.end(buffer);
  });
});
async function run(){
  fs.mkdirSync(path.join(root,"qa-screenshots"),{recursive:true});
  await new Promise(resolve=>server.listen(0,"127.0.0.1",resolve));
  const base="http://127.0.0.1:"+server.address().port;
  const browser=await chromium.launch({headless:true,args:["--no-sandbox"]});
  try {
    for(const [name,viewport] of [
      ["mobil",{width:390,height:844}],
      ["ipad-staaende",{width:820,height:1180}],
      ["ipad-liggende",{width:1180,height:820}],
      ["pc",{width:1440,height:900}]
    ]){
      const context=await browser.newContext({viewport,serviceWorkers:"block"});
      const page=await context.newPage();
      const errors=[];
      page.on("pageerror",error=>errors.push(error.message));
      await page.goto(base+"/redaksjon/artikkel-demo.html",{waitUntil:"load"});
      assert.match(await page.title(),/Levende artikkel/);
      const dimensions=await page.evaluate(()=>({width:document.documentElement.scrollWidth,viewport:innerWidth}));
      assert.ok(dimensions.width<=dimensions.viewport+2,name+": horizontal overflow "+JSON.stringify(dimensions));
      assert.equal(await page.locator("h1").count(),1);
      const infobox=page.locator("details.av-infoboks");
      await infobox.locator("summary").click();
      assert.equal(await infobox.getAttribute("open"),"");

      const poll=page.locator("[data-av-poll]");
      await poll.locator('input[value="graf"]').check();
      await poll.getByRole("button",{name:"Vis mitt svar"}).click();
      assert.match(await poll.locator("[data-av-poll-result]").innerText(),/Tall og grafer/);
      assert.equal(await poll.locator("form").isVisible(),false);
      await page.reload({waitUntil:"load"});
      assert.match(await poll.locator("[data-av-poll-result]").innerText(),/Tall og grafer/);
      await poll.getByRole("button",{name:"Endre svaret"}).click();
      assert.equal(await poll.locator("form").isVisible(),true);

      await page.getByRole("link",{name:"Forstørr grafen"}).click();
      assert.equal(await page.locator("#av-zoom-dialog").evaluate(el=>el.open),true);
      assert.match(await page.locator("#av-zoom-dialog img").getAttribute("src"),/graf-demo\.svg/);
      await page.keyboard.press("Escape");
      assert.equal(await page.locator("#av-zoom-dialog").evaluate(el=>el.open),false);

      const timeline=page.locator(".av-tidslinje");
      await timeline.locator("li:nth-child(2) summary").click();
      assert.equal(await timeline.locator("li:nth-child(2) details").getAttribute("open"),"");
      await page.locator('button[data-av-step="3"]').click();
      assert.equal(await page.locator('button[data-av-step="3"]').getAttribute("aria-pressed"),"true");
      assert.equal(await page.locator('[data-av-panel="1"]').isVisible(),false);
      assert.equal(await page.locator('[data-av-panel="3"]').isVisible(),true);
      assert.deepEqual(errors,[],name+": no runtime errors");
      await page.screenshot({path:path.join(root,"qa-screenshots","levende-artikkel-"+name+".png"),fullPage:true});

      // Første virkelige pilot: behold original Feature 06, test nye moduler.
      await page.goto(base+"/artikler/2026-11-10-bankene-tjener-milliarder.html",{waitUntil:"load"});
      assert.match(await page.title(),/Bankene tjener milliarder/);
      const dimensionsBank=await page.evaluate(()=>({width:document.documentElement.scrollWidth,viewport:innerWidth}));
      assert.ok(dimensionsBank.width<=dimensionsBank.viewport+2,name+": bankartikkel har sidelengs scroll "+JSON.stringify(dimensionsBank));
      assert.equal(await page.locator("article.av-artikkel h1").count(),1);
      assert.ok(await page.locator(".av-kilde-note a").count()>=9);
      assert.equal(await page.locator(".hero-illustrasjon img").count(),1);
      assert.equal(await page.locator(".analyse-illustrasjon img").count(),1);
      // Under-bilder har loading="lazy": rull til hvert bilde før lastestatus testes.
      const imgs=page.locator("article img");
      for(let i=0;i<await imgs.count();i++){
        await imgs.nth(i).scrollIntoViewIfNeeded();
        await page.waitForFunction(index=>{
          const img=document.querySelectorAll("article img")[index];
          return Boolean(img&&img.complete&&img.naturalWidth>0);
        },i,{timeout:15000});
      }
      const imageStatus=await page.locator("article img").evaluateAll(images=>images.map(i=>({src:i.getAttribute("src"),loaded:i.complete&&i.naturalWidth>0})));
      assert.ok(imageStatus.every(i=>i.loaded),name+": illustrasjon eller datagraf mangler: "+JSON.stringify(imageStatus));
      const bankDetails=page.locator("details.av-infoboks");
      await bankDetails.locator("summary").click();
      assert.equal(await bankDetails.getAttribute("open"),"");
      assert.equal(await page.locator(".av-tidslinje li").count(),3);
      await page.locator(".av-tidslinje li:nth-child(2) summary").click();
      assert.equal(await page.locator(".av-tidslinje li:nth-child(2) details").getAttribute("open"),"");
      await page.locator('button[data-av-step="resultat"]').click();
      assert.equal(await page.locator('[data-av-panel="resultat"]').isVisible(),true);
      assert.equal(await page.locator('[data-av-panel="finansiering"]').isVisible(),false);
      await page.getByRole("link",{name:"Forstørr grafen"}).click();
      assert.equal(await page.locator("#av-zoom-dialog").evaluate(el=>el.open),true);
      assert.match(await page.locator("#av-zoom-dialog img").getAttribute("src"),/bankene-resultat-rentenetto-graf\.svg/);
      await page.keyboard.press("Escape");
      assert.equal(await page.locator("#av-zoom-dialog").evaluate(el=>el.open),false);
      const bankPoll=page.locator('[data-av-poll="bankdebatt-2026-prioritering"]');
      assert.equal(await bankPoll.locator("form").isVisible(),true);
      await bankPoll.locator('input[value="konkurranse"]').check();
      await bankPoll.getByRole("button",{name:"Vis mitt svar"}).click();
      assert.match(await bankPoll.locator("[data-av-poll-result]").innerText(),/Mer åpenhet/);
      assert.equal(await bankPoll.locator("form").isVisible(),false);
      assert.deepEqual(errors,[],name+": feil på virkelig bankfeature");
      await page.screenshot({path:path.join(root,"qa-screenshots","bankfeature-levende-"+name+".png"),fullPage:true});

      // Andre virkelige pilot: KI-debatt med dokumenterte lenker og forklaringsgrafikk.
      await page.goto(base+"/artikler/2026-11-11-maskinene-laerer-aa-skrive.html",{waitUntil:"load"});
      assert.match(await page.title(),/Når maskinene lærer å skrive/);
      const dimensionsDebatt=await page.evaluate(()=>({width:document.documentElement.scrollWidth,viewport:innerWidth}));
      assert.ok(dimensionsDebatt.width<=dimensionsDebatt.viewport+2,name+": KI-debatt har sidelengs scroll "+JSON.stringify(dimensionsDebatt));
      assert.equal(await page.locator("article.av-artikkel h1").count(),1);
      assert.equal(await page.locator("figure.hero img").count(),1);
      assert.equal(await page.locator("figure.av-skriveprosess-figur img").count(),1);
      assert.ok(await page.locator(".av-kilde-note a").count()>=4);
      assert.ok(await page.locator(".av-kilder-samlet li").count()>=8);
      const debattImages=page.locator("article img");
      for(let i=0;i<await debattImages.count();i++){
        await debattImages.nth(i).scrollIntoViewIfNeeded();
        await page.waitForFunction(index=>{
          const img=document.querySelectorAll("article img")[index];
          return Boolean(img&&img.complete&&img.naturalWidth>0);
        },i,{timeout:15000});
      }
      const debateDetails=page.locator("details.av-infoboks");
      await debateDetails.locator("summary").click();
      assert.equal(await debateDetails.getAttribute("open"),"");
      await page.locator('button[data-av-step="kontroll"]').click();
      assert.equal(await page.locator('[data-av-panel="kontroll"]').isVisible(),true);
      assert.equal(await page.locator('[data-av-panel="ide"]').isVisible(),false);
      await page.getByRole("link",{name:"Forstørr forklaringsgrafikken"}).click();
      assert.equal(await page.locator("#av-zoom-dialog").evaluate(el=>el.open),true);
      assert.match(await page.locator("#av-zoom-dialog img").getAttribute("src"),/skriveprosess-forklaringsgrafikk\.svg/);
      await page.keyboard.press("Escape");
      assert.equal(await page.locator("#av-zoom-dialog").evaluate(el=>el.open),false);
      const debatePoll=page.locator('[data-av-poll="ki-skriving-aapenhet-2026"]');
      assert.equal(await debatePoll.locator("form").isVisible(),true);
      await debatePoll.locator('input[value="aapenhet"]').check();
      await debatePoll.getByRole("button",{name:"Vis mitt svar"}).click();
      assert.match(await debatePoll.locator("[data-av-poll-result]").innerText(),/Åpenhet om bruk av KI/);
      assert.equal(await debatePoll.locator("form").isVisible(),false);
      await page.reload({waitUntil:"load"});
      assert.match(await debatePoll.locator("[data-av-poll-result]").innerText(),/Åpenhet om bruk av KI/);
      assert.deepEqual(errors,[],name+": feil i KI-debatt");
      await page.screenshot({path:path.join(root,"qa-screenshots","ki-debatt-levende-"+name+".png"),fullPage:true});
      await context.close();
      console.log("OK: KI-debatt på "+name+" med kilder, grafikk, forklarer og lokal poll");
      console.log("OK: bankfeature på "+name+" med graf, kilder, tidslinje, forklarer og poll");
      console.log("OK: levende artikkel på "+name+" ("+viewport.width+" px)");
    }
    const context=await browser.newContext({viewport:{width:820,height:1180},javaScriptEnabled:false,serviceWorkers:"block"});
    const page=await context.newPage();
    await page.goto(base+"/redaksjon/artikkel-demo.html",{waitUntil:"load"});
    assert.equal(await page.locator("[data-av-poll-js-required]").isVisible(),true);
    assert.equal(await page.locator("[data-av-poll] form").isVisible(),false);
    assert.equal(await page.locator('[data-av-panel="1"]').isVisible(),true);
    assert.equal(await page.locator('[data-av-panel="3"]').isVisible(),true);
    await page.locator("details.av-infoboks summary").click();
    assert.equal(await page.locator("details.av-infoboks").getAttribute("open"),"");
    assert.equal(await page.getByRole("link",{name:"Forstørr grafen"}).getAttribute("href"),"demomateriell/graf-demo.svg");
    await page.goto(base+"/artikler/2026-11-11-maskinene-laerer-aa-skrive.html",{waitUntil:"load"});
    assert.equal(await page.locator('[data-av-poll="ki-skriving-aapenhet-2026"] form').isVisible(),false);
    assert.equal(await page.locator('[data-av-poll="ki-skriving-aapenhet-2026"] [data-av-poll-js-required]').isVisible(),true);
    assert.equal(await page.locator('[data-av-panel="ide"]').isVisible(),true);
    assert.equal(await page.locator('[data-av-panel="kontroll"]').isVisible(),true);
    assert.match(await page.getByRole("link",{name:"Forstørr forklaringsgrafikken"}).getAttribute("href"),/skriveprosess-forklaringsgrafikk\.svg/);
    await context.close();
    console.log("OK: statisk fallback uten JavaScript");
  } finally {
    await browser.close();
    await new Promise(resolve=>server.close(resolve));
  }
}
run().catch(error=>{console.error(error);server.close();process.exitCode=1;});

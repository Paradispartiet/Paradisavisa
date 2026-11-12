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
/* Guard against the previous oversized yellow "Forstørr"-buttons on iPad.
   CSS and content are both checked: 44px touch target but compact visual width. */
async function assertCompactZoomLinks(page,label,minCount=1){
  const links=await page.locator("article.av-artikkel a.av-zoom-knapp").evaluateAll(elements=>elements.map(el=>{
    const css=getComputedStyle(el);
    const rect=el.getBoundingClientRect();
    return {
      text:el.textContent.trim(),
      aria:el.getAttribute("aria-label")||"",
      width:rect.width,height:rect.height,
      fontSize:parseFloat(css.fontSize),
      background:css.backgroundColor
    };
  }));
  assert.ok(links.length>=minCount,label+": missing zoom link(s)");
  for(const link of links){
    assert.equal(link.text,"Forstørr",label+": visible zoom text must remain brief");
    assert.match(link.aria,/^Forstørr /,label+": accessible name should explain what opens");
    assert.ok(link.width<=160,label+": zoom link too wide "+JSON.stringify(link));
    assert.ok(link.height>=43,label+": zoom link has insufficient touch target "+JSON.stringify(link));
    assert.ok(link.fontSize<=15,label+": zoom link text is too large "+JSON.stringify(link));
    assert.ok(link.background==="rgba(0, 0, 0, 0)"||link.background==="transparent",
      label+": zoom link must not have a filled yellow background "+JSON.stringify(link));
  }
}

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
      await assertCompactZoomLinks(page,name+": demonstrasjon");
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
      await assertCompactZoomLinks(page,name+": bankfeature");
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
      await assertCompactZoomLinks(page,name+": KI-debatt");
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
      // Tredje pilot: den publiserte datasenteranalysen og dens nye redaksjonelle moduler.
      await page.goto(base+"/artikler/2026-11-10-hvem-skal-fa-norges-strom.html",{waitUntil:"load"});
      assert.match(await page.title(),/Datasentre: Hvem skal få Norges strøm/);
      await assertCompactZoomLinks(page,name+": datasenter",2);
      const datasentreWidth=await page.evaluate(()=>({documentWidth:document.documentElement.scrollWidth,viewport:innerWidth}));
      assert.ok(datasentreWidth.documentWidth<=datasentreWidth.viewport+2,name+": horisontal overflow datasenterartikkel "+JSON.stringify(datasentreWidth));
      assert.equal(await page.locator("main.story-shell h1").count(),1);
      assert.ok(await page.locator(".av-kilde-note a").count()>=9);
      assert.equal(await page.locator("main figure img").count(),3);
      for(const img of await page.locator("main figure img").all()){
        await img.scrollIntoViewIfNeeded();
        await img.evaluate(async el=>{if(!el.complete||!el.naturalWidth)await new Promise((resolve,reject)=>{el.addEventListener("load",resolve,{once:true});el.addEventListener("error",()=>reject(new Error("image broken")),{once:true});});});
        assert.ok(await img.evaluate(el=>el.naturalWidth>0),name+": image failed to load");
      }
      const mwBox=page.locator("details.av-infoboks");
      await mwBox.locator("summary").click();
      assert.equal(await mwBox.getAttribute("open"),"");
      await page.getByRole("link",{name:"Forstørr køgrafen"}).click();
      assert.equal(await page.locator("#av-zoom-dialog").evaluate(el=>el.open),true);
      assert.match(await page.locator("#av-zoom-dialog img").getAttribute("src"),/datasentre-kraftko-graf\.svg/);
      await page.keyboard.press("Escape");
      await page.getByRole("link",{name:"Forstørr beslutningskartet"}).click();
      assert.equal(await page.locator("#av-zoom-dialog").evaluate(el=>el.open),true);
      await page.keyboard.press("Escape");
      await page.locator('button[data-av-step="samfunn"]').click();
      assert.equal(await page.locator('[data-av-panel="samfunn"]').isVisible(),true);
      assert.equal(await page.locator('[data-av-panel="effekt"]').isVisible(),false);
      assert.equal(await page.locator(".av-tidslinje li").count(),4);
      await page.locator(".av-tidslinje li:nth-child(4) summary").click();
      assert.equal(await page.locator(".av-tidslinje li:nth-child(4) details").getAttribute("open"),"");
      const kraftPoll=page.locator('[data-av-poll="norge-kraftprioritering-2026"]');
      assert.equal(await kraftPoll.locator("form").isVisible(),true);
      await kraftPoll.locator('input[value="likebehandling"]').check();
      await kraftPoll.getByRole("button",{name:"Vis mitt svar"}).click();
      assert.match(await kraftPoll.locator("[data-av-poll-result]").innerText(),/Åpne regler og lik behandling/);
      await page.reload({waitUntil:"load"});
      assert.match(await kraftPoll.locator("[data-av-poll-result]").innerText(),/Åpne regler og lik behandling/);
      assert.deepEqual(errors,[],name+": feil i datasenteranalysen");
      await page.screenshot({path:path.join(root,"qa-screenshots","datasentre-levende-"+name+".png"),fullPage:true});

      // Fjerde pilot: kulturartikkel om Nationaltheatret og Gamle Munch.
      await page.goto(base+"/artikler/2026-11-10-nationaltheatret-gamle-munch-toyen.html",{waitUntil:"load"});
      assert.match(await page.title(),/Nationaltheatret til Tøyen/);
      await assertCompactZoomLinks(page,name+": Nationaltheatret");
      assert.equal(await page.locator("main.story-shell h1").count(),1);
      const theatreDims=await page.evaluate(()=>({documentWidth:document.documentElement.scrollWidth,viewport:innerWidth}));
      assert.ok(theatreDims.documentWidth<=theatreDims.viewport+2,name+": Nationaltheatret har sidelengs scroll "+JSON.stringify(theatreDims));
      assert.ok(await page.locator(".av-kilde-note a").count()>=7);
      assert.equal(await page.locator("main figure img").count(),2);
      for(const img of await page.locator("main figure img").all()){
        await img.scrollIntoViewIfNeeded();
        await page.waitForFunction(src=>{
          const img=[...document.querySelectorAll("main figure img")].find(i=>i.getAttribute("src")===src);
          return !!img&&img.complete&&img.naturalWidth>0;
        },await img.getAttribute("src"),{timeout:15000});
      }
      await page.getByRole("link",{name:"Forstørr diagrammet over de to teaterstedene"}).click();
      assert.equal(await page.locator("#av-zoom-dialog").evaluate(d=>d.open),true);
      assert.match(await page.locator("#av-zoom-dialog img").getAttribute("src"),/nationaltheatret-to-scener-forklaring\.svg/);
      await page.keyboard.press("Escape");
      assert.equal(await page.locator("#av-zoom-dialog").evaluate(d=>d.open),false);
      const teaterBox=page.locator("details.av-infoboks");
      await teaterBox.locator("summary").click();
      assert.equal(await teaterBox.getAttribute("open"),"");
      await page.locator('button[data-av-step="etter"]').click();
      assert.equal(await page.locator('[data-av-panel="etter"]').isVisible(),true);
      assert.equal(await page.locator('[data-av-panel="under"]').isVisible(),false);
      assert.equal(await page.locator(".av-tidslinje li").count(),4);
      await page.locator(".av-tidslinje li:nth-child(4) summary").click();
      assert.equal(await page.locator(".av-tidslinje li:nth-child(4) details").getAttribute("open"),"");
      assert.equal(await page.locator("[data-av-poll]").count(),0);
      assert.deepEqual(errors,[],name+": JavaScript-feil i kulturartikkelen");
      await page.screenshot({path:path.join(root,"qa-screenshots","nationaltheatret-levende-"+name+".png"),fullPage:true});
      console.log("OK: kulturartikkel på "+name+" med originalfoto, tidslinje, faktaboks og faseforklaring");

      // Fifth pilot: sport analysis of Ronaldo with original illustration pair.
      await page.goto(base+"/artikler/2026-11-05-ronaldo-landslagsavskjed.html",{waitUntil:"load"});
      assert.match(await page.title(),/Ronaldo var en gigant/);
      await assertCompactZoomLinks(page,name+": Ronaldo");
      assert.equal(await page.locator("article.av-artikkel h1").count(),1);
      assert.ok(await page.locator(".av-kilde-note a").count()>=7);
      const ronaldoWidth=await page.evaluate(()=>({width:document.documentElement.scrollWidth,viewport:innerWidth}));
      assert.ok(ronaldoWidth.width<=ronaldoWidth.viewport+2,name+": Ronaldo-analysen har sidelengs scroll "+JSON.stringify(ronaldoWidth));
      assert.equal(await page.locator("article figure img").count(),3);
      const pictures=page.locator("article figure img");
      for(let i=0;i<await pictures.count();i++){
        await pictures.nth(i).scrollIntoViewIfNeeded();
        await page.waitForFunction(index=>{
          const im=document.querySelectorAll("article figure img")[index];
          return Boolean(im&&im.complete&&im.naturalWidth>0);
        },i,{timeout:15000});
      }
      const zoomLink=page.getByRole("link",{name:"Forstørr taktikkdiagrammet om presspillet"});
      const zoomAppearance=await zoomLink.evaluate(el=>{
        const r=el.getBoundingClientRect(),s=getComputedStyle(el);
        return {width:r.width,height:r.height,size:parseFloat(s.fontSize),background:s.backgroundColor};
      });
      assert.ok(zoomAppearance.width<=160&&zoomAppearance.height>=43&&zoomAppearance.size<=15,name+": zoomlenken må være kompakt "+JSON.stringify(zoomAppearance));
      assert.ok(zoomAppearance.background==="rgba(0, 0, 0, 0)",name+": zoomlenken skal ikke ha heldekkende gul bakgrunn");
      await zoomLink.click();
      assert.equal(await page.locator("#av-zoom-dialog").evaluate(d=>d.open),true);
      assert.match(await page.locator("#av-zoom-dialog img").getAttribute("src"),/ronaldo-presspill-forklaringsdiagram\.svg/);
      await page.keyboard.press("Escape");
      assert.equal(await page.locator("#av-zoom-dialog").evaluate(d=>d.open),false);
      assert.equal(await page.locator(".av-tidslinje li").count(),5);
      await page.locator(".av-tidslinje li:nth-child(5) summary").click();
      assert.equal(await page.locator(".av-tidslinje li:nth-child(5) details").getAttribute("open"),"");
      await page.locator('button[data-av-step="vinne"]').click();
      assert.equal(await page.locator('[data-av-panel="vinne"]').isVisible(),true);
      assert.equal(await page.locator('[data-av-panel="starte"]').isVisible(),false);
      const ronaldoPoll=page.locator('[data-av-poll="ronaldo-ettermale-2026"]');
      assert.equal(await ronaldoPoll.locator("form").isVisible(),true);
      await ronaldoPoll.locator('input[value="helhet"]').check();
      await ronaldoPoll.getByRole("button",{name:"Vis mitt svar"}).click();
      assert.match(await ronaldoPoll.locator("[data-av-poll-result]").innerText(),/Hele karrieren/);
      await page.reload({waitUntil:"load"});
      assert.match(await ronaldoPoll.locator("[data-av-poll-result]").innerText(),/Hele karrieren/);
      assert.deepEqual(errors,[],name+": JavaScript-feil i Ronaldo-analysen");
      await page.screenshot({path:path.join(root,"qa-screenshots","ronaldo-levende-"+name+".png"),fullPage:true});

      // Sixth pilot: political commentary about a public basic product range.
      await page.goto(base+"/artikler/2026-11-06-staten-bor-lage-ting-som-varer.html",{waitUntil:"load"});
      assert.match(await page.title(),/Staten skal lage ting som varer/);
      await assertCompactZoomLinks(page,name+": grunnsortiment-kommentar");
      assert.equal(await page.locator("article.av-artikkel h1").count(),1);
      assert.ok(await page.locator(".av-kilde-note a").count()>=7);
      const basicDims=await page.evaluate(()=>({width:document.documentElement.scrollWidth,viewport:innerWidth}));
      assert.ok(basicDims.width<=basicDims.viewport+2,name+": grunnsortiment-kommentar har sidelengs scroll "+JSON.stringify(basicDims));
      assert.equal(await page.locator("article figure img").count(),2);
      const basicImages=page.locator("article figure img");
      for(let i=0;i<await basicImages.count();i++){
        await basicImages.nth(i).scrollIntoViewIfNeeded();
        await page.waitForFunction(index=>{
          const img=document.querySelectorAll("article figure img")[index];
          return !!img&&img.complete&&img.naturalWidth>0;
        },i,{timeout:15000});
      }
      await page.getByRole("link",{name:"Forstørr diagrammet over offentlig ansvarsdeling"}).click();
      assert.equal(await page.locator("#av-zoom-dialog").evaluate(d=>d.open),true);
      assert.match(await page.locator("#av-zoom-dialog img").getAttribute("src"),/staten-grunnsortiment-ansvarsdeling\.svg/);
      await page.keyboard.press("Escape");
      assert.equal(await page.locator("#av-zoom-dialog").evaluate(d=>d.open),false);
      await page.locator("details.av-infoboks summary").click();
      assert.equal(await page.locator("details.av-infoboks").getAttribute("open"),"");
      await page.locator('button[data-av-step="etterprove"]').click();
      assert.equal(await page.locator('[data-av-panel="etterprove"]').isVisible(),true);
      assert.equal(await page.locator('[data-av-panel="prioritere"]').isVisible(),false);
      const basicPoll=page.locator('[data-av-poll="offentlig-grunnsortiment-prioritering-2026"]');
      assert.equal(await basicPoll.locator("form").isVisible(),true);
      await basicPoll.locator('input[value="ingen"]').check();
      await basicPoll.getByRole("button",{name:"Vis mitt svar"}).click();
      assert.match(await basicPoll.locator("[data-av-poll-result]").innerText(),/Ingen offentlig produktordning foreløpig/);
      await page.reload({waitUntil:"load"});
      assert.match(await basicPoll.locator("[data-av-poll-result]").innerText(),/Ingen offentlig produktordning foreløpig/);
      assert.deepEqual(errors,[],name+": JavaScript-feil i kommentar om offentlige varer");
      await page.screenshot({path:path.join(root,"qa-screenshots","grunnsortiment-kommentar-"+name+".png"),fullPage:true});

      // Seventh living pilot: Nordic and Baltic digital sovereignty feature.
      await page.goto(base+"/artikler/2026-11-10-norden-teknologigigantene.html",{waitUntil:"load"});
      assert.match(await page.title(),/Kan Norden frigjøre seg fra teknologigigantene/);
      await assertCompactZoomLinks(page,name+": digital-suverenitet");
      assert.equal(await page.locator("article.av-artikkel h1").count(),1);
      assert.ok(await page.locator(".av-kilde-note a").count()>=9);
      const sovereigntyDims=await page.evaluate(()=>({width:document.documentElement.scrollWidth,viewport:innerWidth}));
      assert.ok(sovereigntyDims.width<=sovereigntyDims.viewport+2,name+": digital suverenitet har sidelengs scroll "+JSON.stringify(sovereigntyDims));
      assert.equal(await page.locator("article figure img").count(),3);
      const sovereigntyImages=page.locator("article figure img");
      for(let i=0;i<await sovereigntyImages.count();i++){
        await sovereigntyImages.nth(i).scrollIntoViewIfNeeded();
        await page.waitForFunction(index=>{
          const img=document.querySelectorAll("article figure img")[index];
          return !!img&&img.complete&&img.naturalWidth>0;
        },i,{timeout:15000});
      }
      await page.getByRole("link",{name:"Forstørr diagrammet om leverandøravhengighet"}).click();
      assert.equal(await page.locator("#av-zoom-dialog").evaluate(d=>d.open),true);
      assert.match(await page.locator("#av-zoom-dialog img").getAttribute("src"),/digital-suverenitet-exit-forklaringsgrafikk\.svg/);
      await page.keyboard.press("Escape");
      assert.equal(await page.locator("#av-zoom-dialog").evaluate(d=>d.open),false);
      await page.locator("details.av-infoboks summary").click();
      assert.equal(await page.locator("details.av-infoboks").getAttribute("open"),"");
      await page.locator('button[data-av-step="beredskap"]').click();
      assert.equal(await page.locator('[data-av-panel="beredskap"]').isVisible(),true);
      assert.equal(await page.locator('[data-av-panel="data"]').isVisible(),false);
      assert.equal(await page.locator(".av-tidslinje li").count(),5);
      await page.locator(".av-tidslinje li:nth-child(5) summary").click();
      assert.equal(await page.locator(".av-tidslinje li:nth-child(5) details").getAttribute("open"),"");
      const sovereigntyPoll=page.locator('[data-av-poll="digital-suverenitet-kommune-2026"]');
      assert.equal(await sovereigntyPoll.locator("form").isVisible(),true);
      await sovereigntyPoll.locator('input[value="drift"]').check();
      await sovereigntyPoll.getByRole("button",{name:"Vis mitt svar"}).click();
      assert.match(await sovereigntyPoll.locator("[data-av-poll-result]").innerText(),/Øve på avbrudd/);
      await page.reload({waitUntil:"load"});
      assert.match(await sovereigntyPoll.locator("[data-av-poll-result]").innerText(),/Øve på avbrudd/);
      assert.deepEqual(errors,[],name+": JavaScript-feil i digital suverenitet-feature");
      await page.screenshot({path:path.join(root,"qa-screenshots","nordisk-digital-suverenitet-"+name+".png"),fullPage:true});
      // Eighth pilot: Serbian student election, final RIK seats and accessible map.
      await page.goto(base+"/artikler/2026-11-02-serbia-studentvalget.html",{waitUntil:"load"});
      assert.match(await page.title(),/De sørget i 16 minutter/);
      await assertCompactZoomLinks(page,name+": Serbia-valget");
      assert.equal(await page.locator("article.av-artikkel h1").count(),1);
      const serbiaDims=await page.evaluate(()=>({width:document.documentElement.scrollWidth,viewport:innerWidth}));
      assert.ok(serbiaDims.width<=serbiaDims.viewport+2,name+": Serbia-artikkelen har sidelengs scroll "+JSON.stringify(serbiaDims));
      assert.equal(await page.locator("article figure img").count(),2);
      for(const img of await page.locator("article figure img").all()){
        await img.scrollIntoViewIfNeeded();
        await img.evaluate(async el=>{if(!el.complete||!el.naturalWidth)await new Promise((resolve,reject)=>{el.addEventListener("load",resolve,{once:true});el.addEventListener("error",()=>reject(new Error("image broken")),{once:true});});});
        assert.ok(await img.evaluate(el=>el.naturalWidth>0),name+": Serbia photo/map failed to load");
      }
      assert.ok(await page.locator(".av-kilde-note a").count()>=2);
      await page.getByRole("link",{name:"Forstørr orienteringskartet over proteststedene i Serbia"}).click();
      assert.equal(await page.locator("#av-zoom-dialog").evaluate(d=>d.open),true);
      assert.match(await page.locator("#av-zoom-dialog img").getAttribute("src"),/serbia-studentbevegelse-orienteringskart\.svg/);
      await page.keyboard.press("Escape");
      await page.locator(".av-tidslinje li:nth-child(5) summary").click();
      assert.equal(await page.locator(".av-tidslinje li:nth-child(5) details").getAttribute("open"),"");
      await page.locator("details.av-infoboks summary").click();
      assert.equal(await page.locator("details.av-infoboks").getAttribute("open"),"");
      await page.locator('button[data-av-step="mobilisering"]').click();
      assert.equal(await page.locator('[data-av-panel="mobilisering"]').isVisible(),true);
      assert.equal(await page.locator('[data-av-panel="sorg"]').isVisible(),false);
      const serbiaPoll=page.locator('[data-av-poll="serbia-studentvalg-ansvar-2026"]');
      assert.equal(await serbiaPoll.locator("form").isVisible(),true);
      await serbiaPoll.locator('input[value="etterforskning"]').check();
      await serbiaPoll.getByRole("button",{name:"Vis mitt svar"}).click();
      assert.match(await serbiaPoll.locator("[data-av-poll-result]").innerText(),/Åpen etterforskning/);
      await page.reload({waitUntil:"load"});
      assert.match(await serbiaPoll.locator("[data-av-poll-result]").innerText(),/Åpen etterforskning/);
      assert.deepEqual(errors,[],name+": JavaScript-feil i Serbia-feature");
      await page.screenshot({path:path.join(root,"qa-screenshots","serbia-studentvalg-"+name+".png"),fullPage:true});

      // Ninth pilot: original Norwegian–Russian analysis with factual status update and living diagram.
      await page.goto(base+"/artikler/2026-11-11-norge-russland-eu-abu-dhabi.html",{waitUntil:"load"});
      assert.match(await page.title(),/Norge har fortsatt en vei til Moskva/);
      await assertCompactZoomLinks(page,name+": diplomati");
      assert.equal(await page.locator("article.av-artikkel h1").count(),0); // H1 stays outside the text column.
      assert.equal(await page.locator("main h1").count(),1);
      assert.equal(await page.locator("main figure img").count(),2);
      const diplomaDims=await page.evaluate(()=>({width:document.documentElement.scrollWidth,viewport:innerWidth}));
      assert.ok(diplomaDims.width<=diplomaDims.viewport+2,name+": diplomatifeature har sidelengs scroll "+JSON.stringify(diplomaDims));
      for(const img of await page.locator("main figure img").all()){
        await img.scrollIntoViewIfNeeded();
        await img.evaluate(async el=>{
          if(!el.complete||!el.naturalWidth)await new Promise((resolve,reject)=>{
            el.addEventListener("load",resolve,{once:true});
            el.addEventListener("error",()=>reject(new Error("image broken")),{once:true});
          });
        });
        assert.ok(await img.evaluate(el=>el.naturalWidth>0),name+": diplomatiillustrasjon mangler");
      }
      await page.getByRole("link",{name:"Forstørr oversikten over de diplomatiske kanalene"}).click();
      assert.equal(await page.locator("#av-zoom-dialog").evaluate(d=>d.open),true);
      assert.match(await page.locator("#av-zoom-dialog img").getAttribute("src"),/abu-dhabi-diplomatiske-kanaler\.svg/);
      await page.keyboard.press("Escape");
      assert.equal(await page.locator(".av-tidslinje li").count(),6);
      await page.locator(".av-tidslinje li:nth-child(6) summary").click();
      assert.equal(await page.locator(".av-tidslinje li:nth-child(6) details").getAttribute("open"),"");
      await page.locator("details.av-infoboks summary").click();
      assert.equal(await page.locator("details.av-infoboks").getAttribute("open"),"");
      await page.locator('button[data-av-step="avtale"]').click();
      assert.equal(await page.locator('[data-av-panel="avtale"]').isVisible(),true);
      assert.equal(await page.locator('[data-av-panel="kontakt"]').isVisible(),false);
      const diplomaPoll=page.locator('[data-av-poll="diplomati-europa-ukraina-2026"]');
      assert.equal(await diplomaPoll.locator("form").isVisible(),true);
      await diplomaPoll.locator('input[value="garantier"]').check();
      await diplomaPoll.getByRole("button",{name:"Vis mitt svar"}).click();
      assert.match(await diplomaPoll.locator("[data-av-poll-result]").innerText(),/Troverdige sikkerhetsgarantier/);
      await page.reload({waitUntil:"load"});
      assert.match(await diplomaPoll.locator("[data-av-poll-result]").innerText(),/Troverdige sikkerhetsgarantier/);
      assert.deepEqual(errors,[],name+": JavaScript-feil i diplomatifeature");
      await page.screenshot({path:path.join(root,"qa-screenshots","diplomati-norge-russland-"+name+".png"),fullPage:true});

      // Tenth living feature: oil price settlements, original image, charts and no fabricated pump prices.
      await page.goto(base+"/artikler/2026-11-05-oljeprisfall-usa-valg-norge.html",{waitUntil:"load"});
      assert.match(await page.title(),/Oljeprisen falt nesten ni prosent/);
      await assertCompactZoomLinks(page,name+": oljepris",2);
      assert.equal(await page.locator("main h1").count(),1);
      assert.equal(await page.locator("main figure img").count(),3);
      const oilDims=await page.evaluate(()=>({width:document.documentElement.scrollWidth,viewport:innerWidth}));
      assert.ok(oilDims.width<=oilDims.viewport+2,name+": oljeprissak har horisontal scroll "+JSON.stringify(oilDims));
      for(const img of await page.locator("main figure img").all()){
        await img.scrollIntoViewIfNeeded();
        await img.evaluate(async el=>{if(!el.complete||!el.naturalWidth)await new Promise((resolve,reject)=>{
          el.addEventListener("load",resolve,{once:true});
          el.addEventListener("error",()=>reject(new Error("image broken")),{once:true});
        });});
        assert.ok(await img.evaluate(el=>el.naturalWidth>0),name+": oljeprisfoto eller diagram mangler");
      }
      assert.equal(await page.locator("table.av-datatabell tbody tr").count(),7);
      await page.getByRole("link",{name:"Forstørr grafen over Brents sluttkurser i november"}).click();
      assert.equal(await page.locator("#av-zoom-dialog").evaluate(el=>el.open),true);
      assert.match(await page.locator("#av-zoom-dialog img").getAttribute("src"),/brent-november-sluttkurser\.svg/);
      await page.keyboard.press("Escape");
      await page.getByRole("link",{name:"Forstørr forklaringsgrafikken om oljeprisens virkninger i Norge"}).click();
      assert.equal(await page.locator("#av-zoom-dialog").evaluate(el=>el.open),true);
      assert.match(await page.locator("#av-zoom-dialog img").getAttribute("src"),/oljepris-norge-virkninger\.svg/);
      await page.keyboard.press("Escape");
      assert.equal(await page.locator(".av-tidslinje li").count(),5);
      await page.locator(".av-tidslinje li:nth-child(5) summary").click();
      assert.equal(await page.locator(".av-tidslinje li:nth-child(5) details").getAttribute("open"),"");
      await page.locator("details.av-infoboks summary").click();
      assert.equal(await page.locator("details.av-infoboks").getAttribute("open"),"");
      await page.locator('button[data-av-step="ettersporsel"]').click();
      assert.equal(await page.locator('[data-av-panel="ettersporsel"]').isVisible(),true);
      assert.equal(await page.locator('[data-av-panel="risiko"]').isVisible(),false);
      const oilPoll=page.locator('[data-av-poll="oljepris-norsk-okonomi-2026"]');
      assert.equal(await oilPoll.locator("form").isVisible(),true);
      await oilPoll.locator('input[value="klima"]').check();
      await oilPoll.getByRole("button",{name:"Vis mitt svar"}).click();
      assert.match(await oilPoll.locator("[data-av-poll-result]").innerText(),/faktisk oljeforbruk og utslipp/);
      await page.reload({waitUntil:"load"});
      assert.match(await oilPoll.locator("[data-av-poll-result]").innerText(),/faktisk oljeforbruk og utslipp/);
      assert.deepEqual(errors,[],name+": JavaScript-feil i oljepris-feature");
      await page.screenshot({path:path.join(root,"qa-screenshots","oljepris-levende-"+name+".png"),fullPage:true});

      // Eleventh pilot: original Meta journalism-rights story + source-backed interactivity.
      await page.goto(base+"/artikler/2026-11-02-meta-plattformmakt-pressefrihet.html",{waitUntil:"load"});
      assert.match(await page.title(),/Hvem bestemmer over journalistikken/);
      await assertCompactZoomLinks(page,name+": Meta",2);
      assert.equal(await page.locator("article.av-artikkel h1").count(),1);
      assert.equal(await page.locator("article.av-artikkel h1").isVisible(),true);
      const metaDims=await page.evaluate(()=>({width:document.documentElement.scrollWidth,viewport:innerWidth}));
      assert.ok(metaDims.width<=metaDims.viewport+2,name+": Meta-saken har sidelengs scroll "+JSON.stringify(metaDims));
      assert.equal(await page.locator("article.av-artikkel figure img").count(),4);
      for(const img of await page.locator("article.av-artikkel figure img").all()){
        await img.scrollIntoViewIfNeeded();
        await img.evaluate(async el=>{if(!el.complete||!el.naturalWidth)await new Promise((resolve,reject)=>{
          el.addEventListener("load",resolve,{once:true});
          el.addEventListener("error",()=>reject(new Error("image broken")),{once:true});
        });});
        assert.ok(await img.evaluate(el=>el.naturalWidth>0),name+": Meta-bilde eller grafikk mangler");
      }
      await page.getByRole("link",{name:"Forstørr oversikten over 180 støttespillere og ti formelle parter"}).click();
      assert.equal(await page.locator("#av-zoom-dialog").evaluate(d=>d.open),true);
      assert.match(await page.locator("#av-zoom-dialog img").getAttribute("src"),/meta-norske-mediehus-180-10\.svg/);
      await page.keyboard.press("Escape");
      await page.getByRole("link",{name:"Forstørr diagrammet om lenkedeling, indeksering og innholdsrettigheter"}).click();
      assert.equal(await page.locator("#av-zoom-dialog").evaluate(d=>d.open),true);
      assert.match(await page.locator("#av-zoom-dialog img").getAttribute("src"),/meta-lenke-innhenting-rettigheter\.svg/);
      await page.keyboard.press("Escape");
      assert.equal(await page.locator(".av-tidslinje li").count(),6);
      await page.locator(".av-tidslinje li:nth-child(6) summary").click();
      assert.equal(await page.locator(".av-tidslinje li:nth-child(6) details").getAttribute("open"),"");
      await page.locator("details.av-infoboks summary").click();
      assert.equal(await page.locator("details.av-infoboks").getAttribute("open"),"");
      await page.locator('button[data-av-step="avtale"]').click();
      assert.equal(await page.locator('[data-av-panel="avtale"]').isVisible(),true);
      assert.equal(await page.locator('[data-av-panel="lenke"]').isVisible(),false);
      const metaPoll=page.locator('[data-av-poll="meta-pressefrihet-vilkar-2026"]');
      assert.equal(await metaPoll.locator("form").isVisible(),true);
      await metaPoll.locator('input[value="innsyn"]').check();
      await metaPoll.getByRole("button",{name:"Vis mitt svar"}).click();
      assert.match(await metaPoll.locator("[data-av-poll-result]").innerText(),/Åpenhet om hvilke data/);
      await page.reload({waitUntil:"load"});
      assert.match(await metaPoll.locator("[data-av-poll-result]").innerText(),/Åpenhet om hvilke data/);
      assert.deepEqual(errors,[],name+": JavaScript-feil i Meta-feature");
      await page.screenshot({path:path.join(root,"qa-screenshots","meta-levende-"+name+".png"),fullPage:true});

      // Twelfth pilot: local Sofienberg commentary with two original illustrations and two sourced charts.
      await page.goto(base+"/artikler/2026-11-03-sofienberg-kirke-varmestue.html",{waitUntil:"load"});
      assert.match(await page.title(),/Sofienberg kirke er varm/);
      await assertCompactZoomLinks(page,name+": Sofienberg",2);
      assert.equal(await page.locator("article.av-artikkel h1").count(),1);
      assert.equal(await page.locator("article.av-artikkel figure img").count(),4);
      const sofDims=await page.evaluate(()=>({width:document.documentElement.scrollWidth,viewport:innerWidth}));
      assert.ok(sofDims.width<=sofDims.viewport+2,name+": Sofienberg har sidelengs scroll "+JSON.stringify(sofDims));
      for(const img of await page.locator("article.av-artikkel figure img").all()){
        await img.scrollIntoViewIfNeeded();
        await img.evaluate(async el=>{if(!el.complete||!el.naturalWidth)await new Promise((resolve,reject)=>{
          el.addEventListener("load",resolve,{once:true});
          el.addEventListener("error",()=>reject(new Error("image broken")),{once:true});
        });});
        assert.ok(await img.evaluate(el=>el.naturalWidth>0),name+": Sofienberg-bilde eller kildegrafikk mangler");
      }
      assert.equal(await page.locator(".av-datatabell tbody tr").count(),3);
      await page.getByRole("link",{name:"Forstørr prisgrafikken for tre Sofienberg-arrangementer"}).click();
      assert.equal(await page.locator("#av-zoom-dialog").evaluate(d=>d.open),true);
      assert.match(await page.locator("#av-zoom-dialog img").getAttribute("src"),/sofienberg-priseksempler\.svg/);
      await page.keyboard.press("Escape");
      await page.getByRole("link",{name:"Forstørr adgangsdiagrammet for Sofienberg kirke"}).click();
      assert.equal(await page.locator("#av-zoom-dialog").evaluate(d=>d.open),true);
      assert.match(await page.locator("#av-zoom-dialog img").getAttribute("src"),/sofienberg-adgang-ikke-samme\.svg/);
      await page.keyboard.press("Escape");
      assert.equal(await page.locator(".av-tidslinje li").count(),5);
      await page.locator(".av-tidslinje li:nth-child(5) summary").click();
      assert.equal(await page.locator(".av-tidslinje li:nth-child(5) details").getAttribute("open"),"");
      await page.locator("details.av-infoboks summary").click();
      assert.equal(await page.locator("details.av-infoboks").getAttribute("open"),"");
      await page.locator('button[data-av-step="drift"]').click();
      assert.equal(await page.locator('[data-av-panel="drift"]').isVisible(),true);
      assert.equal(await page.locator('[data-av-panel="tid"]').isVisible(),false);
      const sofPoll=page.locator('[data-av-poll="sofienberg-varmestue-prioritering-2026"]');
      assert.equal(await sofPoll.locator("form").isVisible(),true);
      await sofPoll.locator('input[value="varmestue"]').check();
      await sofPoll.getByRole("button",{name:"Vis mitt svar"}).click();
      assert.match(await sofPoll.locator("[data-av-poll-result]").innerText(),/Faste tider med gratis varmestue/);
      await page.reload({waitUntil:"load"});
      assert.match(await sofPoll.locator("[data-av-poll-result]").innerText(),/Faste tider med gratis varmestue/);
      assert.deepEqual(errors,[],name+": JavaScript-feil i Sofienberg-feature");
      await page.screenshot({path:path.join(root,"qa-screenshots","sofienberg-levende-"+name+".png"),fullPage:true});

      // Alle artikler skal ha Paradisavisas samme mobil-/iPad-meny, også eldre sider.
      for(const [slug,existing] of [
        ["2025-09-26-Legeflukt.html",false],
        ["2026-11-02-nav-rettigheter-automatisk-hjelp.html",false],
        ["2026-11-02-meta-plattformmakt-pressefrihet.html",false],
        ["2026-11-05-oljeprisfall-usa-valg-norge.html",true]
      ]){
        await page.goto(base+"/artikler/"+slug,{waitUntil:"load"});
        if(existing)await page.locator("header.avisa-shared-header").waitFor({state:"visible"});
        else await page.locator("header.avisa-artikkel-injisert").waitFor({state:"visible"});
        assert.equal(await page.locator("header.avisa-shared-header").count(),1,name+": mer enn én menystamme på "+slug);
        const shared=page.locator("header.avisa-shared-header");
        assert.ok(await shared.getByRole("link",{name:"Paradisavisa – forsiden"}).isVisible(),name+": merke mangler "+slug);
        const button=shared.getByRole("button",{name:"Åpne meny"});
        assert.equal(await button.isVisible(),true,name+": menyknapp er skjult "+slug);
        await button.click();
        assert.equal(await shared.getByRole("button",{name:"Lukk meny"}).getAttribute("aria-expanded"),"true");
        assert.equal(await shared.getByRole("navigation",{name:"Hovedmeny"}).isVisible(),true);
        assert.match(await shared.getByRole("link",{name:"Kulturarkiv"}).getAttribute("href"),/\/kultur\.html$/);
        assert.match(await shared.getByRole("link",{name:"Paradisradioen"}).getAttribute("href"),/\/paradisradio\.html$/);
        await page.keyboard.press("Escape");
        assert.equal(await shared.getByRole("button",{name:"Åpne meny"}).getAttribute("aria-expanded"),"false");
        const headerBounds=await shared.evaluate(el=>{const r=el.getBoundingClientRect();return {left:r.left,right:r.right,w:innerWidth};});
        assert.ok(headerBounds.left>=-2&&headerBounds.right<=headerBounds.w+2,name+": toppmenyen flyter ut "+JSON.stringify(headerBounds));
      }
      await page.screenshot({path:path.join(root,"qa-screenshots","felles-header-"+name+".png"),fullPage:false});

      await context.close();
      console.log("OK: Ronaldo-sportanalyse på "+name+" med originalbilder, pressdiagram, tidslinje og poll");
      console.log("OK: datasenteranalyse på "+name+" med kilder, køgraf, beslutningskart, tidslinje og poll");
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
    await page.goto(base+"/artikler/2026-11-10-hvem-skal-fa-norges-strom.html",{waitUntil:"load"});
    assert.equal(await page.locator('[data-av-poll="norge-kraftprioritering-2026"] form').isVisible(),false);
    assert.equal(await page.locator('[data-av-poll="norge-kraftprioritering-2026"] [data-av-poll-js-required]').isVisible(),true);
    assert.equal(await page.locator('[data-av-panel="effekt"]').isVisible(),true);
    assert.equal(await page.locator('[data-av-panel="samfunn"]').isVisible(),true);
    assert.match(await page.getByRole("link",{name:"Forstørr køgrafen"}).getAttribute("href"),/datasentre-kraftko-graf\.svg/);
    await page.goto(base+"/artikler/2026-11-10-nationaltheatret-gamle-munch-toyen.html",{waitUntil:"load"});
    assert.equal(await page.locator('[data-av-panel="under"]').isVisible(),true);
    assert.equal(await page.locator('[data-av-panel="etter"]').isVisible(),true);
    assert.match(await page.getByRole("link",{name:"Forstørr diagrammet over de to teaterstedene"}).getAttribute("href"),/nationaltheatret-to-scener-forklaring\.svg/);
    await page.locator("details.av-infoboks summary").click();
    assert.equal(await page.locator("details.av-infoboks").getAttribute("open"),"");
    await page.goto(base+"/artikler/2026-11-05-ronaldo-landslagsavskjed.html",{waitUntil:"load"});
    assert.equal(await page.locator('[data-av-poll="ronaldo-ettermale-2026"] form').isVisible(),false);
    assert.equal(await page.locator('[data-av-poll="ronaldo-ettermale-2026"] [data-av-poll-js-required]').isVisible(),true);
    assert.equal(await page.locator('[data-av-panel="starte"]').isVisible(),true);
    assert.equal(await page.locator('[data-av-panel="vinne"]').isVisible(),true);
    assert.match(await page.getByRole("link",{name:"Forstørr taktikkdiagrammet om presspillet"}).getAttribute("href"),/ronaldo-presspill-forklaringsdiagram\.svg/);
    await page.goto(base+"/artikler/2026-11-06-staten-bor-lage-ting-som-varer.html",{waitUntil:"load"});
    assert.equal(await page.locator('[data-av-poll="offentlig-grunnsortiment-prioritering-2026"] form').isVisible(),false);
    assert.equal(await page.locator('[data-av-poll="offentlig-grunnsortiment-prioritering-2026"] [data-av-poll-js-required]').isVisible(),true);
    assert.equal(await page.locator('[data-av-panel="prioritere"]').isVisible(),true);
    assert.equal(await page.locator('[data-av-panel="etterprove"]').isVisible(),true);
    assert.match(await page.getByRole("link",{name:"Forstørr diagrammet over offentlig ansvarsdeling"}).getAttribute("href"),/staten-grunnsortiment-ansvarsdeling\.svg/);
    await page.goto(base+"/artikler/2026-11-10-norden-teknologigigantene.html",{waitUntil:"load"});
    assert.equal(await page.locator('[data-av-poll="digital-suverenitet-kommune-2026"] form').isVisible(),false);
    assert.equal(await page.locator('[data-av-poll="digital-suverenitet-kommune-2026"] [data-av-poll-js-required]').isVisible(),true);
    assert.equal(await page.locator('[data-av-panel="data"]').isVisible(),true);
    assert.equal(await page.locator('[data-av-panel="beredskap"]').isVisible(),true);
    assert.match(await page.getByRole("link",{name:"Forstørr diagrammet om leverandøravhengighet"}).getAttribute("href"),/digital-suverenitet-exit-forklaringsgrafikk\.svg/);
    await page.goto(base+"/artikler/2026-11-11-norge-russland-eu-abu-dhabi.html",{waitUntil:"load"});
    assert.equal(await page.locator('[data-av-poll="diplomati-europa-ukraina-2026"] form').isVisible(),false);
    assert.equal(await page.locator('[data-av-poll="diplomati-europa-ukraina-2026"] [data-av-poll-js-required]').isVisible(),true);
    assert.equal(await page.locator('[data-av-panel="kontakt"]').isVisible(),true);
    assert.equal(await page.locator('[data-av-panel="gjennomforing"]').isVisible(),true);
    assert.match(await page.getByRole("link",{name:"Forstørr oversikten over de diplomatiske kanalene"}).getAttribute("href"),/abu-dhabi-diplomatiske-kanaler\.svg/);
    await page.goto(base+"/artikler/2026-11-05-oljeprisfall-usa-valg-norge.html",{waitUntil:"load"});
    assert.equal(await page.locator('[data-av-poll="oljepris-norsk-okonomi-2026"] form').isVisible(),false);
    assert.equal(await page.locator('[data-av-poll="oljepris-norsk-okonomi-2026"] [data-av-poll-js-required]').isVisible(),true);
    assert.equal(await page.locator('[data-av-panel="risiko"]').isVisible(),true);
    assert.equal(await page.locator('[data-av-panel="norge"]').isVisible(),true);
    assert.match(await page.getByRole("link",{name:"Forstørr grafen over Brents sluttkurser i november"}).getAttribute("href"),/brent-november-sluttkurser\.svg/);
    assert.match(await page.getByRole("link",{name:"Forstørr forklaringsgrafikken om oljeprisens virkninger i Norge"}).getAttribute("href"),/oljepris-norge-virkninger\.svg/);
    await page.goto(base+"/artikler/2026-11-02-meta-plattformmakt-pressefrihet.html",{waitUntil:"load"});
    assert.equal(await page.locator('article.av-artikkel h1').isVisible(),true);
    assert.equal(await page.locator('[data-av-poll="meta-pressefrihet-vilkar-2026"] form').isVisible(),false);
    assert.equal(await page.locator('[data-av-poll="meta-pressefrihet-vilkar-2026"] [data-av-poll-js-required]').isVisible(),true);
    assert.equal(await page.locator('[data-av-panel="lenke"]').isVisible(),true);
    assert.equal(await page.locator('[data-av-panel="myndighet"]').isVisible(),true);
    assert.match(await page.getByRole("link",{name:"Forstørr oversikten over 180 støttespillere og ti formelle parter"}).getAttribute("href"),/meta-norske-mediehus-180-10\.svg/);
    assert.match(await page.getByRole("link",{name:"Forstørr diagrammet om lenkedeling, indeksering og innholdsrettigheter"}).getAttribute("href"),/meta-lenke-innhenting-rettigheter\.svg/);
    await page.goto(base+"/artikler/2026-11-03-sofienberg-kirke-varmestue.html",{waitUntil:"load"});
    assert.equal(await page.locator('[data-av-poll="sofienberg-varmestue-prioritering-2026"] form').isVisible(),false);
    assert.equal(await page.locator('[data-av-poll="sofienberg-varmestue-prioritering-2026"] [data-av-poll-js-required]').isVisible(),true);
    assert.equal(await page.locator('[data-av-panel="tid"]').isVisible(),true);
    assert.equal(await page.locator('[data-av-panel="sambruk"]').isVisible(),true);
    assert.match(await page.getByRole("link",{name:"Forstørr prisgrafikken for tre Sofienberg-arrangementer"}).getAttribute("href"),/sofienberg-priseksempler\.svg/);
    assert.match(await page.getByRole("link",{name:"Forstørr adgangsdiagrammet for Sofienberg kirke"}).getAttribute("href"),/sofienberg-adgang-ikke-samme\.svg/);
    // Den statiske <details>-menyen er funksjonell uten JavaScript eller header.html-fetch.
    await page.goto(base+"/artikler/2026-11-02-nav-rettigheter-automatisk-hjelp.html",{waitUntil:"load"});
    const staticHeader=page.locator("header.avisa-article-fallback");
    assert.equal(await staticHeader.isVisible(),true);
    await staticHeader.locator("details.pa-menu summary").click();
    assert.equal(await staticHeader.locator("details.pa-menu").getAttribute("open"),"");
    assert.equal(await staticHeader.getByRole("link",{name:"Kulturarkiv"}).isVisible(),true);
    assert.equal(await staticHeader.getByRole("link",{name:"Paradisradioen"}).isVisible(),true);
    await page.goto(base+"/artikler/2026-11-05-oljeprisfall-usa-valg-norge.html",{waitUntil:"load"});
    const existingFallback=page.locator("#header-placeholder header.avisa-article-fallback");
    assert.equal(await existingFallback.isVisible(),true);
    await existingFallback.locator("details.pa-menu summary").click();
    assert.equal(await existingFallback.locator("details.pa-menu").getAttribute("open"),"");
    assert.equal(await existingFallback.getByRole("link",{name:"Kulturarkiv"}).isVisible(),true);
    assert.equal(await existingFallback.getByRole("link",{name:"Paradisradioen"}).isVisible(),true);
    await context.close();
    console.log("OK: statisk fallback uten JavaScript");
  } finally {
    await browser.close();
    await new Promise(resolve=>server.close(resolve));
  }
}
run().catch(error=>{console.error(error);server.close();process.exitCode=1;});

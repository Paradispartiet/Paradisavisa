/* Full nettlesersjekk av Paradisavisas faktiske filer (ikke simulerte DOM-objekter).
   Kjør: npm install --no-save playwright && npx playwright install chromium
         node scripts/visuell-sjekk.cjs
   Skjermbilder lagres i qa-screenshots/. */
"use strict";
const fs=require("node:fs");
const path=require("node:path");
const http=require("node:http");
const assert=require("node:assert/strict");
const {chromium}=require("playwright");
const root=path.resolve(__dirname,"..");
const output=path.join(root,"qa-screenshots");
const mime={".html":"text/html; charset=utf-8",".css":"text/css; charset=utf-8",
  ".js":"text/javascript; charset=utf-8",".json":"application/json; charset=utf-8",
  ".png":"image/png",".jpg":"image/jpeg",".jpeg":"image/jpeg",
  ".svg":"image/svg+xml",".ico":"image/x-icon"};
const errors=[];
const files=["index.html","nyheter.html","kultur.html","notiser.html","sport.html",
  "kontakt.html","skriv-innlegg.html"];
const server=http.createServer((req,res)=>{
  const requested=decodeURIComponent(new URL(req.url,"http://localhost").pathname);
  const destination=path.resolve(root,"."+requested);
  if(destination!==root&&!destination.startsWith(root+path.sep)){
    res.writeHead(403);res.end("Forbudt");return;
  }
  let file=destination;
  if(fs.existsSync(file)&&fs.statSync(file).isDirectory())file=path.join(file,"index.html");
  fs.readFile(file,(err,data)=>{
    if(err){res.writeHead(404);res.end("Mangler: "+requested);return;}
    res.writeHead(200,{"Content-Type":mime[path.extname(file).toLowerCase()]||"application/octet-stream"});
    res.end(data);
  });
});
const check=(ok,what)=>{if(!ok)errors.push(what);};
async function run(){
  fs.mkdirSync(output,{recursive:true});
  await new Promise(resolve=>server.listen(0,"127.0.0.1",resolve));
  const base="http://127.0.0.1:"+server.address().port;
  const browser=await chromium.launch({headless:true,args:["--no-sandbox"]});
  try {
    for(const [label,size] of [["mobil",{width:390,height:844}],["pc",{width:1366,height:900}]]){
      const context=await browser.newContext({viewport:size,deviceScaleFactor:1});
      await context.route("https://fonts.googleapis.com/**",route=>route.abort());
      await context.route("https://fonts.gstatic.com/**",route=>route.abort());
      const page=await context.newPage();
      page.on("pageerror",err=>errors.push(label+": JavaScript-feil: "+err.message));
      await page.goto(base+"/index.html",{waitUntil:"domcontentloaded"});
      await page.locator(".nav-toggle:not([hidden])").waitFor({timeout:12000});
      const title=page.locator(".avis-identitet h1");
      check((await title.textContent()).includes("PARADISAVISA"),label+": mangler avisnavn");
      check((await page.locator(".avis-motto").textContent()).includes("Objektivt sett, fra vår synsvinkel."),
        label+": motto mangler");
      // Den klassiske avisoverskriften skal være STOR, uten innrammet boks,
      // og menyknappen skal ligge diskret til høyre over avisnavnet.
      const masthead=await page.evaluate(()=>{
        const wordmark=document.querySelector(".avis-masthead h1");
        const link=wordmark.querySelector("a");
        const button=document.querySelector(".avis-masthead .nav-toggle");
        const header=document.querySelector(".avis-masthead");
        const ticker=document.querySelector(".notisbånd");
        const rule=wordmark.getBoundingClientRect();
        const titleBounds=link.getBoundingClientRect();
        const buttonBounds=button.getBoundingClientRect();
        const style=getComputedStyle(wordmark);
        return {
          fontSize:parseFloat(style.fontSize),
          borderTop:parseFloat(style.borderTopWidth),
          borderRight:parseFloat(style.borderRightWidth),
          borderBottom:parseFloat(style.borderBottomWidth),
          borderLeft:parseFloat(style.borderLeftWidth),
          fontFamily:style.fontFamily,
          background:style.backgroundColor,
          left:titleBounds.left,right:titleBounds.right,
          buttonRight:buttonBounds.right,
          buttonLeft:buttonBounds.left,
          buttonTop:buttonBounds.top,
          titleTop:rule.top,
          headerTop:header.getBoundingClientRect().top,
          tickerBottom:ticker.getBoundingClientRect().bottom,
          viewport:innerWidth
        };
      });
      check(masthead.fontSize >= (label==="mobil"?30:95),
        label+": avisoverskriften er for liten ("+masthead.fontSize+"px)");
      check(masthead.borderTop===0&&masthead.borderRight===0&&
            masthead.borderBottom===0&&masthead.borderLeft===0,
        label+": avisoverskriften har fortsatt ramme/boks");
      check(masthead.background==="rgba(0, 0, 0, 0)",
        label+": avisoverskriften har egen bakgrunn i stedet for å ligge fritt");
      check(masthead.left>=0&&masthead.right<=masthead.viewport+2,
        label+": gammeldags avisnavn går utenfor skjermbredden");
      check(masthead.buttonLeft > masthead.viewport * .65,
        label+": menyknappen ligger ikke til høyre");
      check(masthead.buttonTop < masthead.titleTop,
        label+": menyknappen ligger ikke over avisnavnet");
      check(masthead.headerTop >= masthead.tickerBottom - 3,
        label+": avisoverskriften overlapper notisbåndet");

      // Vent på at alle innholdsseksjonene faktisk er fylt. Et tomt felt
      // ved første skjermbilde kan ellers maskere problemer med kortene.
      const storyGrids=["#nyhetshjul-grid","#nyhetshjul2-grid",
        "#sportshjul-grid","#kulturhjul-grid","#kommentarhjul-grid"];
      for(const id of storyGrids){
        await page.locator(id+" .hjul-card").first().waitFor({timeout:12000});
      }
      // Transparens: vis leseren publiseringsdato, og merk gamle saker som arkiv.
      for(const id of storyGrids){
        const card=page.locator(id+" .hjul-card").first();
        check(await card.locator("time.forside-dato").count()===1,
          label+": en sak mangler publiseringsdato i "+id);
        const section=page.locator(id).locator("xpath=..");
        const status=section.locator("[data-nyhetsstatus]");
        check((await status.count())===1,
          label+": seksjonen mangler statuslinje "+id);
        if(await status.count()){
          check(!(await status.textContent()).includes("Kontrollerer publiseringsdatoer"),
            label+": statuslinje ikke oppdatert "+id);
        }
      }
      const layout=await page.evaluate(async () => {
        const ids=["nyhetshjul-grid","nyhetshjul2-grid","sportshjul-grid",
          "kulturhjul-grid","kommentarhjul-grid"];
        const grids=ids.map(id=>{
          const cards=[...document.getElementById(id).querySelectorAll(".hjul-card")];
          return {id,rects:cards.map(card=>{
            const r=card.getBoundingClientRect();
            return {left:r.left,right:r.right,top:r.top,bottom:r.bottom,width:r.width};
          })};
        });
        const images=[...document.querySelectorAll("#hovedinnhold .hjul-card img")];
        await Promise.all(images.map(img=>img.decode().catch(()=>null)));
        return {width:window.innerWidth,grids,
          broken:images.filter(img=>!img.naturalWidth).map(img=>img.getAttribute("src"))};
      });
      check(!layout.broken.length,label+": manglende bilder: "+layout.broken.join(", "));
      for(const grid of layout.grids){
        for(const r of grid.rects){
          check(r.left>=-2 && r.right<=layout.width+2,
            label+": avkuttet kort i "+grid.id+" ("+r.left+"–"+r.right+")");
        }
        if(label==="mobil" && grid.rects.length>1){
          check(grid.rects[1].top>=grid.rects[0].bottom-2,
            "mobil: kortene ligger fortsatt side om side i "+grid.id);
          check(grid.rects[0].width>=layout.width*.80,
            "mobil: kortene er for smale i "+grid.id);
        }
      }
      // Redaksjonell visuell kontroll: profesjonelt hierarki, ingen
      // «knappebokser» rundt seksjonstitlene, og en stor førstesak på PC.
      const editorialLayout=await page.evaluate(()=>{
        const heading=document.querySelector("#nyhetshjul .seksjonstittel");
        const headStyle=getComputedStyle(heading);
        const cards=[...document.querySelectorAll("#nyhetshjul-grid .hjul-card")];
        const first=cards[0].getBoundingClientRect();
        const second=cards[1].getBoundingClientRect();
        const firstTitle=cards[0].querySelector("h3");
        const secondTitle=cards[1].querySelector("h3");
        return {
          headingBorder:parseFloat(headStyle.borderTopWidth)+parseFloat(headStyle.borderBottomWidth),
          headingBackground:headStyle.backgroundColor,
          headingFont:parseFloat(headStyle.fontSize),
          firstTitleFont:parseFloat(getComputedStyle(firstTitle).fontSize),
          secondTitleFont:parseFloat(getComputedStyle(secondTitle).fontSize),
          firstWidth:first.width,secondWidth:second.width,
          secondTop:second.top,firstBottom:first.bottom,
          gridColumns:getComputedStyle(document.getElementById("nyhetshjul-grid")).gridTemplateColumns
        };
      });
      check(editorialLayout.headingBorder===0,
        label+": seksjonsoverskriftene har fortsatt dekorative bokser");
      check(editorialLayout.headingBackground==="rgba(0, 0, 0, 0)",
        label+": seksjonsoverskriftene skal ha transparent bakgrunn");
      check(editorialLayout.headingFont>=26,
        label+": seksjonsoverskriften er for liten");
      if(label==="pc"){
        check(editorialLayout.firstWidth > editorialLayout.secondWidth*1.4,
          "pc: førstesaken har ikke tydelig større plass");
        check(editorialLayout.firstTitleFont > editorialLayout.secondTitleFont*1.35,
          "pc: førstesakens overskrift er ikke tydelig større");
      }
      await page.screenshot({path:path.join(output,"forside-"+label+".png"),fullPage:true});
      const toggle=page.locator(".avis-topp .nav-toggle");
      await toggle.click();
      check(await toggle.getAttribute("aria-expanded")==="true",label+": meny åpnes ikke");
      check(await page.locator("#avis-hovedmeny").isVisible(),label+": meny ikke synlig");
      await page.screenshot({path:path.join(output,"meny-"+label+".png")});
      await page.keyboard.press("Escape");
      check(await toggle.getAttribute("aria-expanded")==="false",label+": Escape lukker ikke");
      check(!(await page.locator("#avis-hovedmeny").isVisible()),label+": meny forblir synlig");
      const pause=page.locator(".notis-pause");
      await pause.waitFor({timeout:10000});
      await pause.click();
      check(await pause.textContent()==="Start",label+": pauseknapp virker ikke");
      await pause.click();
      check(await pause.textContent()==="Pause",label+": startknapp virker ikke");

      for(const name of files.filter(x=>x!=="index.html")){
        await page.goto(base+"/"+name,{waitUntil:"domcontentloaded"});
        await page.locator(".avisa-shared-header .nav-toggle:not([hidden])").waitFor({timeout:10000});
        if(name==="nyheter.html"||name==="kultur.html"){
          await page.locator("[data-artikkelkategori] a.hjul-card").first().waitFor({timeout:10000});
          check((await page.locator("[data-artikkelkategori] a.hjul-card").count())>0,
            label+": tomt kategoriarkiv "+name);
          check((await page.locator("[data-artikkelkategori] time.arkiv-dato").count())>0,
            label+": mangler dato i "+name);
          // Lazy loading er nyttig i nettleseren, men fullsideskjermbilder
          // kan ellers vise tomme bildefelt. Last alle bilder før QA-bildet.
          const brokenArchiveImages=await page.locator("[data-artikkelkategori] img")
            .evaluateAll(async imgs => {
              imgs.forEach(img=>{img.loading="eager"});
              await Promise.all(imgs.map(img=>img.decode().catch(()=>null)));
              return imgs.filter(img=>!img.naturalWidth).map(img=>img.getAttribute("src"));
            });
          check(!brokenArchiveImages.length,
            label+": manglende bilder i "+name+": "+brokenArchiveImages.join(", "));
        }
        const overflow=await page.evaluate(()=>({width:document.documentElement.scrollWidth,viewport:window.innerWidth}));
        check(overflow.width<=overflow.viewport+4,
          label+": horisontal overløp på "+name+" ("+overflow.width+">"+overflow.viewport+")");
        if(["kultur.html","notiser.html","sport.html"].includes(name)){
          await page.screenshot({path:path.join(output,name.replace(".html","")+"-"+label+".png"),fullPage:true});
        }
      }
      // Én løpende artikkelkø. Ingen mandag/onsdag/fredag-utgaver.
      await page.goto(base+"/utkast/index.html",{waitUntil:"domcontentloaded"});
      await page.locator(".katalog .sak").first().waitFor({timeout:12000});
      check((await page.locator("#antall-utkast").textContent())==="15",
        label+": forventet 15 aktive artikkelutkast");
      check((await page.locator("#antall-arkiv").textContent())==="1",
        label+": arkivert Ibsen-artikkel mangler");
      check((await page.locator("#antall-godkjent").textContent())==="0",
        label+": artikler er merket godkjent uten beslutning");
      check((await page.locator(".katalog .sak").count())===15,
        label+": aktiv kø skal vise 15 uavhengige artikler");
      check((await page.locator(".merking").textContent()).includes("IKKE PUBLISERT"),
        label+": arbeidskø er ikke merket som upublisert");
      check((await page.locator("h1").textContent())==="Artikler til gjennomgang",
        label+": gammelt utgavesystem er ikke fjernet");
      await page.screenshot({path:path.join(output,"lopende-artikkelkø-"+label+".png"),fullPage:true});
      await page.locator("#sok").fill("MATATA");
      check((await page.locator(".katalog .sak").count())===1,
        label+": søk i artikkelkø fungerer ikke");
      await page.locator("#sok").fill("");
      await page.locator("#tilstand").selectOption("arkivert");
      check((await page.locator(".katalog .sak").count())===1,
        label+": det arkiverte Ibsen-utkastet vises ikke");
      check((await page.locator(".katalog .sak h2").textContent()).includes("Ibsen"),
        label+": feil artikkel vises som arkivert");
      await context.close();
    }

    const nojs=await browser.newContext({viewport:{width:390,height:844},javaScriptEnabled:false});
    const page=await nojs.newPage();
    await page.goto(base+"/index.html",{waitUntil:"domcontentloaded"});
    check(await page.locator("#avis-hovedmeny").isVisible(),"Menylenker må vises uten JavaScript");
    check(!(await page.locator(".nav-toggle").isVisible()),"Knappen skal være skjult uten JavaScript");
    await page.screenshot({path:path.join(output,"forside-uten-js.png")});
    await nojs.close();
  } finally {
    await browser.close();
  }
}
run().catch(err=>errors.push("Nettlesertest avbrutt: "+err.stack))
  .finally(()=>{
    server.close();
    if(errors.length){
      console.error("Nettlesertest: "+errors.length+" avvik\n"+errors.map(x=>"✗ "+x).join("\n"));
      process.exitCode=1;
    } else {
      console.log("Nettlesertest bestått: mobil, PC, meny, ticker, arkiv, undersider og uten JS.");
    }
    console.log("Skjermbilder: "+output);
  });

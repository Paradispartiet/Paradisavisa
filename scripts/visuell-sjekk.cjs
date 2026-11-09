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
// Bruk samme register som den faktiske køsiden. Et hardkodet antall
// gjør at korrekt registrering av nye artikler feilaktig stopper QA.
const artikkelkatalog=JSON.parse(fs.readFileSync(path.join(root,"utkast/artikler.json"),"utf8"));
const antallAktive=artikkelkatalog.artikler.filter(a=>a.status==="utkast"&&!a.publisert).length;
const antallArkiverte=artikkelkatalog.artikler.filter(a=>a.status==="arkivert").length;
const antallGodkjente=artikkelkatalog.artikler.filter(a=>a.godkjent===true&&!a.publisert).length;
const mime={".html":"text/html; charset=utf-8",".css":"text/css; charset=utf-8",
  ".js":"text/javascript; charset=utf-8",".json":"application/json; charset=utf-8",
  ".png":"image/png",".jpg":"image/jpeg",".jpeg":"image/jpeg",".webp":"image/webp",
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
const check=(ok,what)=>{if(!ok){errors.push(what);console.error("AVVIK: "+what);}};
async function run(){
  fs.mkdirSync(output,{recursive:true});
  await new Promise(resolve=>server.listen(0,"127.0.0.1",resolve));
  const base="http://127.0.0.1:"+server.address().port;
  const browser=await chromium.launch({headless:true,args:["--no-sandbox"]});
  try {
    for(const [label,size] of [["mobil",{width:390,height:844}],["pc",{width:1366,height:900}]]){
      const context=await browser.newContext({viewport:size,deviceScaleFactor:1});
      context.setDefaultTimeout(12000);
      context.setDefaultNavigationTimeout(15000);
      console.log("Starter nettlesersjekk: "+label+" ("+size.width+"px)");
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
      console.log(label+": masthead og meny er aktive");
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
          headerBottom:header.getBoundingClientRect().bottom,
          headerPosition:getComputedStyle(header).position,
          tickerTop:ticker.getBoundingClientRect().top,
          tickerBottom:ticker.getBoundingClientRect().bottom,
          tickerPosition:getComputedStyle(ticker).position,
          tickerHeight:ticker.getBoundingClientRect().height,
          headerBorder:parseFloat(getComputedStyle(header).borderBottomWidth),
          headerRule:getComputedStyle(header.querySelector(".avis-identitet"),"::after").display,
          viewport:innerWidth,
          viewportHeight:innerHeight,
          reservedBottom:parseFloat(getComputedStyle(document.body).paddingBottom)
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
      check(masthead.headerPosition==="sticky",
        label+": avisoverskriften er ikke fast under rulling");
      check(masthead.headerBorder===0 && masthead.headerRule==="none",
        label+": gul skillelinje under avisoverskriften finnes fortsatt");
      check(masthead.tickerHeight<=42,
        label+": notisbåndet er for høyt ("+masthead.tickerHeight+"px)");
      check(masthead.tickerPosition==="fixed",
        label+": notisbåndet er ikke fastmontert");
      check(Math.abs(masthead.tickerBottom-masthead.viewportHeight)<=2,
        label+": notisbåndet ligger ikke i bunnen av skjermen");
      check(masthead.reservedBottom >= masthead.tickerBottom-masthead.tickerTop,
        label+": innholdet har ikke nok bunnplass over notisbåndet");
      check((await page.locator(".avis-leserinfo").count())===0,
        label+": den gamle introduksjonslinjen er ikke fjernet");

      // Vent på at alle innholdsseksjonene faktisk er fylt. Et tomt felt
      // ved første skjermbilde kan ellers maskere problemer med kortene.
      const storyGrids=["#nyhetshjul-grid","#nyhetshjul2-grid",
        "#sportshjul-grid","#kulturhjul-grid","#kommentarhjul-grid"];
      for(const id of storyGrids){
        await page.locator(id+" .hjul-card").first().waitFor({timeout:12000});
      }
      // Kontroller at avisoverskriften forblir synlig når innholdet rulles.
      await page.evaluate(() => window.scrollTo(0, 600));
      const scrollPositions=await page.evaluate(() => ({
        headerTop:document.querySelector(".avis-masthead").getBoundingClientRect().top,
        tickerBottom:document.querySelector(".notisbånd").getBoundingClientRect().bottom,
        viewportHeight:innerHeight
      }));
      check(Math.abs(scrollPositions.headerTop) <= 2,
        label+": avisoverskriften forsvinner når man ruller");
      check(Math.abs(scrollPositions.tickerBottom-scrollPositions.viewportHeight)<=2,
        label+": notisbåndet flytter seg når man ruller ned");
      await page.evaluate(() => window.scrollTo(0, 250));
      const oppover=await page.locator(".notisbånd").evaluate(el => el.getBoundingClientRect().bottom);
      check(Math.abs(oppover-scrollPositions.viewportHeight)<=2,
        label+": notisbåndet forsvinner når man ruller opp");
      await page.evaluate(() => window.scrollTo(0, 0));

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
      console.log(label+": alle redaksjonelle kort finnes, kontrollerer bilder og geometri");
      const layout=await page.evaluate(async () => {
        const ids=["nyhetshjul-grid","nyhetshjul2-grid","sportshjul-grid",
          "kulturhjul-grid","kommentarhjul-grid"];
        const grids=ids.map(id=>{
          const container=document.getElementById(id);
          // Test bare de fire synlige plassene. Senere slides ligger
          // med hensikt utenfor klippevinduet til det fjerde kortet.
          const cards=[...container.children].map(child=>
            child.matches(".hjul-card")
              ? child
              : child.querySelector(".avis-sisteplass-spor > .hjul-card")
          ).filter(Boolean);
          const rail=container.querySelector(".avis-sisteplass-spor");
          return {
            id,
            slotCount:cards.length,
            hasSideScroll:!!rail && rail.scrollWidth>rail.clientWidth+2,
            rects:cards.map(card=>{
              const r=card.getBoundingClientRect();
              return {left:r.left,right:r.right,top:r.top,bottom:r.bottom,width:r.width};
            })
          };
        });
        const images=[...document.querySelectorAll("#hovedinnhold .hjul-card img")];
        // decode() på lazy bilder utenfor synsfeltet kan vente uendelig.
        // Tving alle bilder til eager, og bruk en tidsavgrenset sjekk.
        images.forEach(img => { img.loading = "eager"; });
        await Promise.race([
          Promise.all(images.map(img=>img.decode().catch(()=>null))),
          new Promise(resolve=>setTimeout(resolve,10000))
        ]);
        return {width:window.innerWidth,grids,
          broken:images.filter(img=>img.complete&&!img.naturalWidth).map(img=>img.getAttribute("src")),
          pending:images.filter(img=>!img.complete).map(img=>img.getAttribute("src"))};
      });
      check(!layout.broken.length,label+": manglende bilder: "+layout.broken.join(", "));
      check(!layout.pending.length,label+": bilder ble ikke lastet innen 10 sekunder: "+layout.pending.join(", "));
      for(const grid of layout.grids){
        check(grid.slotCount<=4,
          label+": mer enn fire synlige artikkelplasser i "+grid.id);
        if(["nyhetshjul-grid","kommentarhjul-grid"].includes(grid.id)){
          check(grid.hasSideScroll,
            label+": det fjerde kortet mangler sideveis blaing i "+grid.id);
        }
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
      // Bruk piltasten i siste forsidekort og kontroller faktisk bevegelse.
      const carousel=page.locator("#nyhetshjul-grid .avis-sisteplass");
      check((await carousel.count())===1,
        label+": nyhetskarusellen mangler i siste plass");
      if(await carousel.count()){
        const rail=carousel.locator(".avis-sisteplass-spor");
        const before=await rail.evaluate(el=>el.scrollLeft);
        await carousel.locator(".avis-sisteplass-knapp").last().click();
        await page.waitForTimeout(350);
        const after=await rail.evaluate(el=>el.scrollLeft);
        check(after>before+5,
          label+": neste-pilen blar ikke sidelengs i siste kort");
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
      await page.screenshot({path:path.join(output,"forside-"+label+".png"),fullPage:true,timeout:15000});
      console.log(label+": forsidebilde lagret");
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
      check(await pause.locator("svg").count()===1,
        label+": pauseknappen skal være et lite ikon");
      await pause.click();
      check(await pause.getAttribute("aria-label")==="Start notisbåndet",
        label+": pauseikonet virker ikke");
      await pause.click();
      check(await pause.getAttribute("aria-label")==="Pause notisbåndet",
        label+": startikonet virker ikke");
      const fartknapp=page.locator(".notis-fartknapp");
      await fartknapp.click();
      const alternativer=page.locator(".notis-fartmeny button[data-fart]");
      check(await alternativer.count()===4,
        label+": notisbåndet har ikke fire fartstrinn");
      check(await page.locator(".notis-fartmeny").isVisible(),
        label+": fartmenyen vises ikke");
      const menyPlass=await page.evaluate(()=>({
        menyBunn:document.querySelector(".notis-fartmeny").getBoundingClientRect().bottom,
        båndTopp:document.querySelector(".notisbånd").getBoundingClientRect().top
      }));
      check(menyPlass.menyBunn<=menyPlass.båndTopp+3,
        label+": fartmenyen er skjult bak båndet");
      await page.locator('.notis-fartmeny button[data-fart="1.5"]').click();
      check((await fartknapp.textContent())==="1,5×",
        label+": valgt fart vises ikke på knappen");
      await fartknapp.click();
      await page.locator('.notis-fartmeny button[data-fart="1"]').click();
      check((await fartknapp.textContent())==="1×",
        label+": normalhastigheten kan ikke velges igjen");

      for(const name of files.filter(x=>x!=="index.html")){
        await page.goto(base+"/"+name,{waitUntil:"domcontentloaded"});
        await page.locator(".avisa-shared-header .nav-toggle:not([hidden])").waitFor({timeout:10000});
        if(name==="sport.html" || name==="notiser.html"){
          const fixedBand=await page.locator(".notisbånd").evaluate(el => ({
            position:getComputedStyle(el).position,
            bottom:el.getBoundingClientRect().bottom,
            height:innerHeight
          }));
          check(fixedBand.position==="fixed" && Math.abs(fixedBand.bottom-fixedBand.height)<=2,
            label+": notisbåndet er ikke fast nederst på "+name);
        }
        if(name==="sport.html"){
          check((await page.locator(".sport-banner").count())===0,
            label+": gammel gul sportsbanner finnes fortsatt");
          check((await page.locator("#sport h1").textContent())==="Sport",
            label+": sportssiden mangler stor hovedoverskrift");
          await page.locator("#sportshjul-grid .hjul-card").first().waitFor({timeout:10000});
          const sportStatus=await page.locator("#sport [data-nyhetsstatus]").textContent();
          const newestDate=await page.locator("#sportshjul-grid .hjul-card time.forside-dato").first().getAttribute("datetime");
          const currentDay=new Date().toISOString().slice(0,10);
          const ageDays=(Date.parse(currentDay+"T12:00:00Z")-Date.parse(newestDate+"T12:00:00Z"))/86400000;
          const isArchive=!Number.isFinite(ageDays)||ageDays<0||ageDays>7;
          check(sportStatus.includes("Sist publisert") && (isArchive
              ? sportStatus.includes("Fra arkivet")
              : !sportStatus.includes("Fra arkivet")),
            label+": sportssaker har feil ferskhets- eller arkivmerking");
          if(newestDate==="2026-11-05") {
            const firstCard=page.locator("#sportshjul-grid .hjul-card").first();
            const articleHref=await firstCard.getAttribute("href");
            const sportImage=await firstCard.locator("img").getAttribute("src");
            check(articleHref.includes("artikler/2026-11-05-ronaldo-landslagsavskjed.html"),
              label+": Ronaldo-saken mangler som fersk sportssak");
            await page.goto(articleHref,{waitUntil:"domcontentloaded"});
            check((await page.locator("article h1").textContent()).includes("Ronaldo var en gigant"),
              label+": Ronaldo-artikkelen har feil hovedtittel");
            const expectedHero="2026-11-07-ronaldo-hovedbilde-portrett.webp";
            const expectedAnalysis="2026-11-06-ronaldo-symbolmettet-analyse.webp";
            const pictures=page.locator("article .utkast-illustrasjon img");
            check((await pictures.count())===2,label+": Ronaldo-artikkelen må ha hoved- og sekundærbilde");
            const firstSrc=await pictures.first().getAttribute("src");
            const secondSrc=await pictures.nth(1).getAttribute("src");
            check(firstSrc.includes(expectedHero)&&sportImage.includes(expectedHero),
              label+": Sportskort og artikkel må bruke samme WebP-hovedbilde");
            check(secondSrc.includes(expectedAnalysis),
              label+": Det godkjente symbolmettede sekundærbildet mangler");
            const imageChecks=await pictures.evaluateAll(async imgs=>Promise.all(imgs.map(async img=>{
              const response=await fetch(img.src);
              return response.ok && (response.headers.get("content-type")||"").includes("image/webp")
                && (await response.blob()).size>20000;
            })));
            check(imageChecks.length===2&&imageChecks.every(Boolean),
              label+": Ronaldo-bildene må være reelle, lastbare WebP-filer");
            const social=await page.evaluate(()=>({
              og:document.querySelector('meta[property="og:image"]')?.content||"",
              twitter:document.querySelector('meta[name="twitter:image"]')?.content||""
            }));
            check(social.og.includes(expectedHero)&&social.twitter.includes(expectedHero),
              label+": Ronaldo-artikkelen har feil delingsbilde");
            await page.goto(base+"/"+name,{waitUntil:"domcontentloaded"});
            await page.locator(".avisa-shared-header .nav-toggle:not([hidden])").waitFor({timeout:10000});
          }
        }
        if(name==="notiser.html"){
          check((await page.locator(".notis-arkiv-hoved h1").textContent())==="Notiser",
            label+": notisarkivet mangler egen hovedoverskrift");
          await page.locator("#notisgrid .notis-rute").first().waitFor({timeout:10000});
          const layout=await page.evaluate(()=>{
            const grid=document.getElementById("notisgrid");
            const cards=[...grid.querySelectorAll(".notis-rute")];
            const r=cards[0].getBoundingClientRect();
            return {columns:getComputedStyle(grid).gridTemplateColumns.split(" ").length,
              firstWidth:r.width,viewport:innerWidth,count:cards.length};
          });
          check(layout.count>0,label+": tomt notisarkiv");
          if(label==="mobil"){
            check(layout.columns===1,label+": notiser skal stå i én kolonne på mobil");
            check(layout.firstWidth>layout.viewport*.8,label+": notisene blir for smale på mobil");
          }else{
            check(layout.columns>=2,label+": notisarkivet skal bruke flere kolonner på PC");
            check(layout.firstWidth>250,label+": notisene er for smale på PC");
          }
        }
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
              await Promise.race([
                Promise.all(imgs.map(img=>img.decode().catch(()=>null))),
                new Promise(resolve=>setTimeout(resolve,10000))
              ]);
              return imgs.filter(img=>!img.complete||!img.naturalWidth).map(img=>img.getAttribute("src"));
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
      check((await page.locator("#antall-utkast").textContent())===String(antallAktive),
        label+": køens antall aktive utkast avviker fra artikkelregisteret ("+antallAktive+")");
      check((await page.locator("#antall-arkiv").textContent())===String(antallArkiverte),
        label+": køens antall arkiverte artikler avviker fra artikkelregisteret ("+antallArkiverte+")");
      check((await page.locator("#antall-godkjent").textContent())===String(antallGodkjente),
        label+": køens antall godkjente artikler avviker fra artikkelregisteret ("+antallGodkjente+")");
      check((await page.locator(".katalog .sak").count())===antallAktive,
        label+": aktiv kø skal vise alle "+antallAktive+" uavhengige utkast");
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
      check((await page.locator(".katalog .sak").count())===antallArkiverte,
        label+": arkivfilteret stemmer ikke med "+antallArkiverte+" arkiverte artikler");
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

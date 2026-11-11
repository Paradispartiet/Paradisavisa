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
const vm=require("node:vm");
const root=path.resolve(__dirname,"..");
const output=path.join(root,"qa-screenshots");
// Bruk samme register som den faktiske køsiden. Et hardkodet antall
// gjør at korrekt registrering av nye artikler feilaktig stopper QA.
const artikkelkatalog=JSON.parse(fs.readFileSync(path.join(root,"utkast/artikler.json"),"utf8"));
const antallAktive=artikkelkatalog.artikler.filter(a=>a.status==="utkast"&&!a.publisert).length;
const antallArkiverte=artikkelkatalog.artikler.filter(a=>a.status==="arkivert").length;
const antallGodkjente=artikkelkatalog.artikler.filter(a=>a.godkjent===true&&!a.publisert).length;
// Avsluttede notiser kan gjøre hele båndet usynlig. Ikke lås QA til en dato.
const notisKontekst={document:{addEventListener(){}},Date};
vm.createContext(notisKontekst);
vm.runInContext(fs.readFileSync(path.join(root,"script.js"),"utf8"),notisKontekst);
const isNotisAktuell=vm.runInContext("isNotisAktuell",notisKontekst);
const harAktuelleNotiser=JSON.parse(fs.readFileSync(path.join(root,"notiser.json"),"utf8")).some(n=>isNotisAktuell(n));
const mime={".html":"text/html; charset=utf-8",".css":"text/css; charset=utf-8",
  ".js":"text/javascript; charset=utf-8",".json":"application/json; charset=utf-8",
  ".png":"image/png",".jpg":"image/jpeg",".jpeg":"image/jpeg",".webp":"image/webp",
  ".svg":"image/svg+xml",".ico":"image/x-icon"};
const errors=[];
const files=["index.html","nyheter.html","kultur.html","notiser.html","sport.html",
  "kontakt.html","skriv-innlegg.html","paradisradio.html"];
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
      const context=await browser.newContext({viewport:size,deviceScaleFactor:1,serviceWorkers:"block"});
      context.setDefaultTimeout(12000);
      context.setDefaultNavigationTimeout(15000);
      console.log("Starter nettlesersjekk: "+label+" ("+size.width+"px)");
      await context.route("https://fonts.googleapis.com/**",route=>route.abort());
      await context.route("https://fonts.gstatic.com/**",route=>route.abort());
      const page=await context.newPage();
      // Deterministisk Web Speech-mock: tester at brukerklikk starter/stoppper radioen,
      // uten ekte lyd fra CI-maskinen eller nettleserens talestemmer.
      await page.addInitScript(() => {
        const calls={spoken:[],cancels:0,pauses:0,resumes:0,utterances:[],voices:[],listeners:{}};
        window.__notisRadioTest=calls;
        window.SpeechSynthesisUtterance=class {
          constructor(text){this.text=text;}
        };
        Object.defineProperty(window,"speechSynthesis",{configurable:true,value:{
          speak(utterance){
            calls.utterances.push(utterance);
            calls.spoken.push({
              text:utterance.text,lang:utterance.lang,rate:utterance.rate,
              voice:utterance.voice?.name || null
            });
          },
          cancel(){calls.cancels++},
          pause(){calls.pauses++},
          resume(){calls.resumes++},
          getVoices(){return calls.voices},
          addEventListener(name,listener){calls.listeners[name]=listener},
          removeEventListener(name,listener){
            if(calls.listeners[name]===listener) delete calls.listeners[name];
          }
        }});
      });
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
      if (harAktuelleNotiser) {
      check(masthead.tickerHeight<=42,
        label+": notisbåndet er for høyt ("+masthead.tickerHeight+"px)");
      check(masthead.tickerPosition==="fixed",
        label+": notisbåndet er ikke fastmontert");
      check(Math.abs(masthead.tickerBottom-masthead.viewportHeight)<=2,
        label+": notisbåndet ligger ikke i bunnen av skjermen");
      check(masthead.reservedBottom >= masthead.tickerBottom-masthead.tickerTop,
        label+": innholdet har ikke nok bunnplass over notisbåndet");
      } else {
        check(masthead.tickerHeight===0,label+": utløpt notisbånd skal være skjult");
      }
      check((await page.locator(".avis-leserinfo").count())===0,
        label+": den gamle introduksjonslinjen er ikke fjernet");

      // Vent på at alle innholdsseksjonene faktisk er fylt. Et tomt felt
      // ved første skjermbilde kan ellers maskere problemer med kortene.
      const storyGrids=["#nyhetshjul-grid","#nyhetshjul2-grid",
        "#sportshjul-grid","#kulturhjul-grid","#kommentarhjul-grid"];
      for(const id of storyGrids){
        await page.locator(id+" .hjul-card").first().waitFor({timeout:12000});
      }
      // Mobil og PC: notisbåndet skal bruke et lite komposisjonslag som
      // fortsetter å animere mens leseren scroller, uten å starte på nytt.
      let tickerTidFoer = null;
      if (harAktuelleNotiser) {
        await page.locator(".notis-element").first().waitFor({timeout:12000});
        const tilstand = await page.evaluate(() => {
          const spor=document.querySelector(".notisinnhold");
          const animasjon=spor.getAnimations()[0];
          return {
            antall:spor.children.length,
            animasjoner:spor.getAnimations().length,
            tid:animasjon?.currentTime,
            status:animasjon?.playState
          };
        });
        check(tilstand.antall>=2 && tilstand.antall<=24,
          label+": notisbåndet bygger for mange notiselementer ("+tilstand.antall+")");
        check(tilstand.animasjoner===1 && tilstand.status==="running",
          label+": notisbåndet bruker ikke én aktiv compositor-animasjon");
        tickerTidFoer=tilstand.tid;
      }
      // Slagordet vises på toppen, men skal forsvinne når masthead blir kompakt.
      check(await page.locator(".avis-masthead .avis-motto").evaluate(
        el => getComputedStyle(el).display !== "none"),
        label+": slagordet er skjult allerede på toppen");
      // Kontroller at avisoverskriften forblir synlig når innholdet rulles.
      await page.evaluate(() => window.scrollTo(0, 600));
      await page.waitForFunction(() => document.querySelector(".avis-masthead").classList.contains("avis-rullet"));
      check(await page.locator(".avis-masthead .avis-motto").evaluate(
        el => getComputedStyle(el).display === "none"),
        label+": slagordet tar fremdeles plass etter scrolling");
      if (harAktuelleNotiser && tickerTidFoer != null) {
        await page.waitForTimeout(200);
        const tilstand = await page.evaluate(() => {
          const animasjon=document.querySelector(".notisinnhold").getAnimations()[0];
          return {tid:animasjon?.currentTime,status:animasjon?.playState};
        });
        check(tilstand.status==="running" && tilstand.tid > tickerTidFoer,
          label+": notisbåndets animasjon stopper eller starter på nytt ved scrolling");
      }
      const scrollPositions=await page.evaluate(() => ({
        headerTop:document.querySelector(".avis-masthead").getBoundingClientRect().top,
        tickerBottom:document.querySelector(".notisbånd").getBoundingClientRect().bottom,
        viewportHeight:innerHeight
      }));
      check(Math.abs(scrollPositions.headerTop) <= 2,
        label+": avisoverskriften forsvinner når man ruller");
      if(harAktuelleNotiser) {
      check(Math.abs(scrollPositions.tickerBottom-scrollPositions.viewportHeight)<=2,
        label+": notisbåndet flytter seg når man ruller ned");
      }
      await page.evaluate(() => window.scrollTo(0, 250));
      const oppover=await page.locator(".notisbånd").evaluate(el => el.getBoundingClientRect().bottom);
      if(harAktuelleNotiser) {
      check(Math.abs(oppover-scrollPositions.viewportHeight)<=2,
        label+": notisbåndet forsvinner når man ruller opp");
      }
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.waitForFunction(() => !document.querySelector(".avis-masthead").classList.contains("avis-rullet"));
      check(await page.locator(".avis-masthead .avis-motto").evaluate(
        el => getComputedStyle(el).display !== "none"),
        label+": slagordet kommer ikke tilbake på toppen");

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
      if (harAktuelleNotiser) {
        const valg=page.locator(".notis-valgknapp");
        await valg.waitFor({timeout:10000});
        check(!(await page.locator(".notis-valgpanel").isVisible()),
          label+": kontrollpanelet skal være lukket som standard");
        check((await page.locator(".notis-kontroller > button").count())===1,
          label+": notisbåndet skal bare vise én hovedknapp");
        check((await page.evaluate(()=>window.__notisRadioTest.spoken.length))===0,
          label+": nyhetsradioen skal aldri starte av seg selv");
        await valg.click();
        check(await page.locator(".notis-valgpanel").isVisible(),
          label+": kontrollpanelet åpnes ikke");
        const panelPlass=await page.evaluate(()=>({
          panelBunn:document.querySelector(".notis-valgpanel").getBoundingClientRect().bottom,
          baandTopp:document.querySelector(".notisbånd").getBoundingClientRect().top
        }));
        check(panelPlass.panelBunn<=panelPlass.baandTopp+3,
          label+": kontrollpanelet dekker notisbåndet");

        const pause=page.locator(".notis-pause");
        check(await pause.locator("svg").count()===1,
          label+": pauseknappen skal vise et lite ikon");
        await pause.click();
        check(await pause.getAttribute("aria-label")==="Start notisbåndet",
          label+": pauseknappen stopper ikke nyhetsbåndet");
        check(await page.locator(".notis-valgpanel").isVisible(),
          label+": kontrollpanelet lukkes uventet etter pause");
        await pause.click();
        check(await pause.getAttribute("aria-label")==="Pause notisbåndet",
          label+": startknappen virker ikke");

        const fartknapp=page.locator(".notis-fartknapp");
        check((await fartknapp.textContent()).includes("2×"),
          label+": standardhastigheten skal være 2×");
        await fartknapp.click();
        const alternativer=page.locator(".notis-fartmeny button[data-fart]");
        check(await alternativer.count()===3,
          label+": hastighet skal bare ha 2×, 4× og 5×");
        check(JSON.stringify(await alternativer.allTextContents())===JSON.stringify(["2×","4×","5×"]),
          label+": feil hastighetsvalg");
        await page.locator('.notis-fartmeny button[data-fart="4"]').click();
        check((await fartknapp.textContent()).includes("4×"),
          label+": 4× blir ikke valgt");
        await fartknapp.click();
        await page.locator('.notis-fartmeny button[data-fart="5"]').click();
        check((await fartknapp.textContent()).includes("5×"),
          label+": 6× blir ikke valgt");
        const fartLagring=await page.evaluate(()=>({
          fart:localStorage.getItem("paradisavisa-notisfart"),
          varighet:document.querySelector(".notisinnhold").style.getPropertyValue("--ticker-duration")
        }));
        check(fartLagring.fart==="5" && Boolean(fartLagring.varighet),
          label+": høy hastighet blir ikke lagret/anvendt");

        // Listen er bevisst tom ved oppstart, som på enkelte mobile enheter.
        const stemme=page.locator(".notis-stemme-select");
        check(await stemme.locator("option").count()===1,
          label+": norsk stemmeliste skal kunne starte tom");
        check((await page.locator(".notis-stemme-info").textContent()).includes("Ingen norsk stemme"),
          label+": fallback-informasjon mangler");
        await page.evaluate(()=>{
          const s=window.__notisRadioTest;
          s.voices=[
            {name:"English test",lang:"en-US",voiceURI:"en-test"},
            {name:"Norsk test 1",lang:"nb-NO",voiceURI:"nb-1",default:true},
            {name:"Norsk test 2",lang:"nb-NO",voiceURI:"nb-2"}
          ];
          s.listeners.voiceschanged?.();
        });
        check(await stemme.locator("option").count()===3,
          label+": stemmevelgeren oppdateres ikke etter voiceschanged");
        await stemme.selectOption({label:"Norsk test 2 (nb-NO)"});
        check((await page.evaluate(()=>localStorage.getItem("paradisavisa-radiostemme"))).includes("nb-2"),
          label+": radiostemmen blir ikke lagret");
        check(await page.locator(".notis-hastighet").count()===1,
          label+": bare én hastighetsfunksjon skal finnes");
        check(await page.locator(".notis-tempo-select").count()===0,
          label+": ekstra taletempo-velger skal være fjernet");

        const radio=page.locator(".notis-radio");
        const radiopause=page.locator(".notis-radio-pause");
        check((await radio.getAttribute("aria-pressed"))==="false",
          label+": radioen skal være stoppet som standard");
        check(await radiopause.isDisabled(),
          label+": radioens pauseknapp skal være deaktivert før start");
        await radio.click();
        check((await radio.getAttribute("aria-pressed"))==="true",
          label+": nyhetsradioen startet ikke");
        const lest=await page.evaluate(()=>window.__notisRadioTest.spoken);
        check(lest.length===1 && lest[0].lang==="nb-NO" &&
          lest[0].voice==="Norsk test 2" && lest[0].rate===1 && lest[0].text.length>30,
          label+": nyhetsradioen bruker ikke valgt norsk stemme med normalt taletempo");
        await radiopause.click();
        check((await radiopause.getAttribute("aria-pressed"))==="true" &&
          (await page.evaluate(()=>window.__notisRadioTest.pauses))===1,
          label+": radiopausen virker ikke");
        await radiopause.click();
        check((await radiopause.getAttribute("aria-pressed"))==="false" &&
          (await page.evaluate(()=>window.__notisRadioTest.resumes))===1,
          label+": radioen kan ikke fortsette");
        await page.evaluate(()=>window.__notisRadioTest.utterances[0].onend?.());
        check((await page.evaluate(()=>window.__notisRadioTest.spoken.length))>=2,
          label+": nyhetsradioen går ikke videre til neste notis");
        await radiopause.click();
        const resumeForStopp=await page.evaluate(()=>window.__notisRadioTest.resumes);
        await radio.click();
        check((await page.evaluate(()=>window.__notisRadioTest.resumes))===resumeForStopp+1,
          label+": stopp mens radioen er pauset skal nullstille talesyntesen");
        await radio.click();
        check((await radio.getAttribute("aria-pressed"))==="true",
          label+": radioen starter ikke på nytt etter pause og stopp");
        await radio.click();
        check((await radio.getAttribute("aria-pressed"))==="false",
          label+": stoppknappen virker ikke");
        check(await radiopause.isDisabled(),
          label+": pauseknappen deaktiveres ikke når radioen stoppes");
        check((await page.evaluate(()=>window.__notisRadioTest.cancels))>=1,
          label+": talesyntesen blir ikke stoppet");

        await page.keyboard.press("Escape");
        check(!(await page.locator(".notis-valgpanel").isVisible()),
          label+": Escape lukker ikke kontrollpanelet");
        await valg.click();
        check(await page.locator(".notis-valgpanel").isVisible(),
          label+": kontrollpanelet åpnes ikke igjen");
        await valg.click();
        check(!(await page.locator(".notis-valgpanel").isVisible()),
          label+": kontrollpanelet lukkes ikke ved nytt trykk");
      } else {
        check(await page.locator(".notisbånd").isHidden(),
          label+": nyhetsbåndet skal skjules når alle notisene er utløpt");
      }

      for(const name of files.filter(x=>x!=="index.html")){
        await page.goto(base+"/"+name,{waitUntil:"domcontentloaded"});
        await page.locator(".avisa-shared-header .nav-toggle:not([hidden])").waitFor({timeout:10000});
        if(name==="sport.html" || name==="notiser.html"){
          const fixedBand=await page.locator(".notisbånd").evaluate(el => ({
            position:getComputedStyle(el).position,
            bottom:el.getBoundingClientRect().bottom,
            height:innerHeight
          }));
          check(!harAktuelleNotiser || (fixedBand.position==="fixed" && Math.abs(fixedBand.bottom-fixedBand.height)<=2),
            label+": notisbåndet er ikke fast nederst på "+name);
          if(!harAktuelleNotiser) check(await page.locator(".notisbånd").isHidden(),
            label+": tomt notisbånd vises på "+name);
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
        if(name==="paradisradio.html") {
          check((await page.locator("h1").textContent())==="Paradisradioen",
            label+": radiosiden mangler overskrift");
          check(await page.locator("#paradisradio-player").count()===1,
            label+": radioplayer mangler");
          if(harAktuelleNotiser) {
            await page.locator("#paradisradio-player[data-ready='true']").waitFor({timeout:12000});
            check(await page.locator("[data-radio='playlist'] li").count()>0,
              label+": radiosiden mangler oppdatert spilleliste");
            check((await page.evaluate(()=>window.__notisRadioTest.spoken.length))===0,
              label+": radioen starter automatisk ved sidelasting");
            // Direkte stemmevalg på radiosiden, uten å åpne notisbåndets meny.
            const stemmeRadio=page.locator("#paradisradio-stemme");
            check(await stemmeRadio.isVisible(), label+": norsk stemmevalg mangler på radiosiden");
            check(!(await page.locator(".notis-valgpanel").isVisible()),
              label+": stemmevalg må ikke åpne notisbåndets meny");
            await page.evaluate(()=>{
              const s=window.__notisRadioTest;
              s.voices=[
                {name:"Norsk system 1",lang:"nb-NO",voiceURI:"ipad-1",default:true},
                {name:"Norsk system 2",lang:"nb-NO",voiceURI:"ipad-2"}
              ];
              s.listeners.voiceschanged?.();
            });
            check(await stemmeRadio.locator("option").count()===3,
              label+": asynkrone norske stemmer mangler på radiosiden");
            await stemmeRadio.selectOption({label:"Norsk system 2 (nb-NO)"});
            check((await page.evaluate(()=>localStorage.getItem("paradisavisa-radiostemme"))).includes("ipad-2"),
              label+": valg på radiosiden lagres ikke i radiomotoren");
            check((await page.locator(".notis-stemme-select").inputValue())===
              (await stemmeRadio.inputValue()),
              label+": radiosiden og notismenyen bruker ikke samme stemme");
            const spill=page.locator("[data-radio='play']");
            await spill.click();
            check((await page.evaluate(()=>window.__notisRadioTest.spoken.length))===1,
              label+": Spill skal starte én og bare én opplesning");
            check(await page.locator("[data-radio='stop']").isEnabled(),
              label+": stoppknappen er utilgjengelig under opplesning");
            check((await page.evaluate(()=>window.__notisRadioTest.spoken[0]?.voice))==="Norsk system 2",
              label+": radiosiden sender ikke valgt norsk systemstemme til talen");
            const naa=await page.locator("[data-radio='headline']").textContent();
            check(naa && naa.length>20,label+": nåværende nyhet mangler");

            await page.locator("[data-radio='next']").click();
            check((await page.evaluate(()=>window.__notisRadioTest.spoken.length))===2,
              label+": neste nyhet starter ikke");
            await page.locator("[data-radio='previous']").click();
            check((await page.evaluate(()=>window.__notisRadioTest.spoken.length))===3,
              label+": forrige nyhet starter ikke");

            // Trykk på en bestemt sak. Hoppet bruker samme Web Speech-motor.
            const koKnapp=page.locator("[data-radio='playlist'] .radio-ko-knapp");
            check(await koKnapp.count()>=2, label+": klikkbar spilleliste har for få nyheter");
            await koKnapp.nth(1).click();
            check((await page.evaluate(()=>window.__notisRadioTest.spoken.length))===4,
              label+": klikk på nyhet starter ikke valgt notis");
            check((await page.locator("[data-radio='playlist'] li").nth(1).getAttribute("aria-current"))==="true",
              label+": valgt nyhet blir ikke markert som aktiv");
            check((await page.locator("[data-radio='headline']").textContent()).length>20,
              label+": aktiv notis vises ikke i spillerhode");

            // Én stor knapp skifter mellom Spill, Pause og Fortsett.
            await spill.click();
            check((await spill.textContent()).includes("Fortsett"),
              label+": pause/fortsett deler ikke radiotilstand");
            await spill.click();
            check((await spill.textContent()).includes("Pause"),
              label+": radiosiden gjenopptar ikke tale");

            // Web Speech avslutter en notis: pustepausen gir ingen ekstra tale
            // og overgang til neste notis skjer først etter ca. 650 ms.
            const foerOvergang=await page.evaluate(()=>window.__notisRadioTest.spoken.length);
            await page.evaluate(()=>window.__notisRadioTest.utterances.at(-1).onend?.());
            check((await page.evaluate(()=>window.__notisRadioTest.spoken.length))===foerOvergang,
              label+": neste nyhet starter uten naturlig pause");
            check((await page.locator("[data-radio='status']").textContent()).includes("Kort pause"),
              label+": pause mellom nyheter mangler status");
            await page.waitForTimeout(850);
            check((await page.evaluate(()=>window.__notisRadioTest.spoken.length))===foerOvergang+1,
              label+": neste nyhet starter ikke etter pausen");

            // Safari kan avbryte uten at radioen får en vellykket onend.
            // Brukeren må da trykke Fortsett; samme nyhet starter fra begynnelsen.
            const foerAvbrudd=await page.evaluate(()=>window.__notisRadioTest.spoken.length);
            const avbruttTekst=await page.evaluate(()=>window.__notisRadioTest.spoken.at(-1).text);
            await page.evaluate(()=>window.__notisRadioTest.utterances.at(-1).onerror?.({error:"interrupted"}));
            check((await spill.textContent()).includes("Fortsett"),
              label+": avbrutt tale vises ikke som Fortsett");
            check((await page.locator("[data-radio='status']").textContent()).includes("ble avbrutt"),
              label+": avbrutt tale blir ikke forklart");
            check((await page.evaluate(()=>window.__notisRadioTest.spoken.length))===foerAvbrudd,
              label+": avbrutt tale starter uventet uten brukertrykk");
            await spill.click();
            check((await page.evaluate(()=>window.__notisRadioTest.spoken.length))===foerAvbrudd+1,
              label+": Fortsett starter ikke opplesning etter avbrudd");
            check((await page.evaluate(()=>window.__notisRadioTest.spoken.at(-1).text))===avbruttTekst,
              label+": Fortsett skal starte samme avbrutte nyhet");

            // Bevisst Neste kaller cancel; et sent canceled fra gammel ytring
            // skal ikke gjøre den nye opplesningen til en avbrutt radio.
            const forrigeYtring=await page.evaluate(()=>window.__notisRadioTest.utterances.length-1);
            await page.locator("[data-radio='next']").click();
            await page.evaluate(indeks=>window.__notisRadioTest.utterances[indeks].onerror?.({error:"canceled"}),forrigeYtring);
            check(!(await spill.textContent()).includes("Fortsett"),
              label+": gammelt canceled-avbrudd stopper den nye nyheten");

            // Pause midt i overgang må stoppe tidsuret; neste sak venter til Fortsett.
            const foerPauseMellom=await page.evaluate(()=>window.__notisRadioTest.spoken.length);
            await page.evaluate(()=>window.__notisRadioTest.utterances.at(-1).onend?.());
            await spill.click();
            await page.waitForTimeout(850);
            check((await page.evaluate(()=>window.__notisRadioTest.spoken.length))===foerPauseMellom,
              label+": nyheten starter mens lytteren har pauset mellom sakene");
            await spill.click();
            check((await page.evaluate(()=>window.__notisRadioTest.spoken.length))===foerPauseMellom+1,
              label+": radioen fortsetter ikke etter pausen mellom sakene");

            // Den lille menyen viser samme radiotilstand, ikke en konkurrerende motor.
            const meny=page.locator(".notis-valgknapp");
            await meny.click();
            check((await page.locator(".notis-radio").getAttribute("aria-pressed"))==="true",
              label+": radiomenyen og radiosiden har ulik tilstand");
            const lenke=await page.locator(".notis-radio-side-lenke").getAttribute("href");
            check(lenke.includes("paradisradio.html"),label+": full radioside mangler i notismenyen");
            await page.locator("[data-radio='stop']").click();
            check((await page.locator(".notis-radio").getAttribute("aria-pressed"))==="false",
              label+": stopp på radiosiden oppdaterer ikke radiomenyen");
            check((await page.evaluate(()=>window.__notisRadioTest.cancels))>=1,
              label+": stopp sendes ikke til talesyntesen");
          } else {
            await page.locator("[data-radio='status']").waitFor();
            check(await page.locator("[data-radio='play']").isDisabled(),
              label+": ingen ferske notiser må ikke kunne spilles");
          }
        }
        if(name==="notiser.html"){
          check((await page.locator(".notis-arkiv-hoved h1").textContent())==="Notiser",
            label+": notisarkivet mangler egen hovedoverskrift");
          if(harAktuelleNotiser) {
            await page.locator("#notisgrid .notis-rute").first().waitFor({timeout:10000});
          } else {
            await page.waitForFunction(()=>document.getElementById("notisgrid")?.textContent.includes("Ingen aktuelle notiser"));
          }
          await page.locator("#eldre-notiser:not([hidden]) summary").waitFor({timeout:10000});
          check(!(await page.locator("#eldre-notiser").evaluate(el=>el.open)),
            label+": historiske notiser skal være lukket");
          const layout=await page.evaluate(()=>{
            const grid=document.getElementById("notisgrid");
            const cards=[...grid.querySelectorAll(".notis-rute")];
            const r=cards[0]?.getBoundingClientRect();
            return {columns:getComputedStyle(grid).gridTemplateColumns.split(" ").length,
              firstWidth:r?.width||0,viewport:innerWidth,count:cards.length};
          });
          check(harAktuelleNotiser ? layout.count>0 : layout.count===0,
            label+": feil antall ferske notiser");
          if(harAktuelleNotiser && label==="mobil"){
            check(layout.columns===1,label+": notiser skal stå i én kolonne på mobil");
            check(layout.firstWidth>layout.viewport*.8,label+": notisene blir for smale på mobil");
          }else if(harAktuelleNotiser){
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
        if(["kultur.html","notiser.html","sport.html","paradisradio.html"].includes(name)){
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

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

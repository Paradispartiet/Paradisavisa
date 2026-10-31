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

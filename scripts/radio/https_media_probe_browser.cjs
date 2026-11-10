"use strict";
/* Local HTTP browser QA only. HTTPS for a real iPad is verified after Pages deploy. */
const fs=require("node:fs");
const http=require("node:http");
const path=require("node:path");
const assert=require("node:assert/strict");
const {chromium}=require("playwright");
const root=path.resolve(__dirname,"../..");
const file=path.join(root,"qa/radio-media-session.html");
async function main(){
  const html=fs.readFileSync(file);
  const server=http.createServer((req,res)=>{
    if(req.url!=="/qa/radio-media-session.html"){
      res.writeHead(404);res.end("Not found");return;
    }
    res.writeHead(200,{"Content-Type":"text/html; charset=utf-8","Cache-Control":"no-store"});
    res.end(html);
  });
  await new Promise(resolve=>server.listen(0,"127.0.0.1",resolve));
  const url="http://127.0.0.1:"+server.address().port+"/qa/radio-media-session.html";
  const browser=await chromium.launch({headless:true,args:["--no-sandbox"]});
  try{
    for(const viewport of [{width:390,height:844},{width:1024,height:768}]){
      const context=await browser.newContext({viewport});
      const page=await context.newPage();
      const errors=[];
      page.on("pageerror",e=>errors.push(e.message));
      await page.goto(url,{waitUntil:"load"});
      await page.locator("#play:not([disabled])").waitFor();
      assert.equal(await page.locator("audio").count(),1);
      assert.equal(await page.locator("audio").evaluate(a=>a.paused),true);
      assert.match(await page.locator("#status").textContent(),/Ingen lyd startet automatisk/);
      assert.equal(await page.locator("audio").evaluate(a=>a.src.startsWith("blob:")),true);
      await page.locator("#play").click();
      await page.waitForFunction(()=>!document.querySelector("audio").paused,{timeout:12000});
      assert.match(await page.locator("#now").textContent(),/Testspor 1/);
      await page.locator("#next").click();
      await page.waitForFunction(()=>document.querySelector("#now").textContent.includes("Testspor 2"));
      assert.equal(await page.locator("audio").evaluate(a=>a.paused),false);
      await page.locator("#pause").click();
      assert.equal(await page.locator("audio").evaluate(a=>a.paused),true);
      await page.locator("#play").click();
      await page.waitForFunction(()=>!document.querySelector("audio").paused,{timeout:12000});
      await page.locator("#prev").click();
      assert.match(await page.locator("#now").textContent(),/Testspor 1/);
      await page.locator("#stop").click();
      assert.equal(await page.locator("audio").evaluate(a=>a.paused),true);
      assert.match(await page.locator("#status").textContent(),/Stoppet/);
      const log=await page.locator("#log").inputValue();
      assert.match(log,/Spiller Testspor 1/);
      assert.match(log,/Pauset/);
      assert.deepEqual(errors,[],"JavaScript-feil i HTTPS-testpanelet");
      console.log("OK: original WAV, en spiller, neste/forrige, pause/stopp, "+viewport.width+"px");
      await context.close();
    }
  }finally{
    await browser.close();
    await new Promise(resolve=>server.close(resolve));
  }
}
main().catch(e=>{console.error(e);process.exitCode=1});

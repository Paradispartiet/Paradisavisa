"use strict";
const test=require("node:test");
const assert=require("node:assert/strict");
const {oauthHeader,pct,validateManifest,runBatch,sendXPost,assertCorrectXAccount} = require("./x-autopubliser.cjs");
const SHA="a".repeat(40);
const BASE="https://paradispartiet.github.io/Paradisavisa/";
function article(i) {
  const path="artikler/2026-11-11-test-"+i+".html";
  const link=BASE+path;
  return {article:path,permalink:link,x:{url:link,text:"Testoverskrift "+i+"\nEn kort sak.\n"+link}};
}
function manifest(items) {return {schema:1,sourceCommit:SHA,newArticles:items};}
function fakeStore(initial={schema:1,entries:{}}) {
  const snapshots=[];
  const store={state:structuredClone(initial),snapshots,
    async read(){return {ledger:structuredClone(this.state),sha:"b".repeat(40)};},
    async write(ledger,sha){
      assert.match(sha,/^[a-f0-9]{40}$/);
      this.state=structuredClone(ledger);
      snapshots.push(structuredClone(ledger));
      return "c".repeat(40);
    }};
  return store;
}
test("OAuth 1.0a Header er signert og inneholder aldri API-hemmeligheter",()=>{
  const creds={apiKey:"key",apiSecret:"SECRET!123",accessToken:"token",accessTokenSecret:"TOKEN_SECRET"};
  const value=oauthHeader("https://api.x.com/2/tweets",creds,"nonce",1700000000);
  assert.match(value,/^OAuth oauth_consumer_key="key"/);
  assert.match(value,/oauth_signature_method="HMAC-SHA1"/);
  assert.match(value,/oauth_signature="/);
  assert.doesNotMatch(value,/SECRET!123|TOKEN_SECRET/);
  assert.equal(pct("a b!"),"a%20b%21");
});
test("Én ny artikkel oppdaterer engangssperre før post, så lagrer X-ID",async()=>{
  const store=fakeStore();
  let sends=0;
  const item=article(1);
  const result=await runBatch({
    manifest:manifest([item]),commit:SHA,store,
    sendPost:async text=>{
      sends++;
      assert.equal(store.state.entries[item.article].status,"claimed");
      assert.equal(text,item.x.text);
      return {id:"12345678901234"};
    },
    now:()=>new Date("2026-11-11T20:00:00Z")
  });
  assert.deepEqual(result,{published:1,skipped:0,blocked:0});
  assert.equal(sends,1);
  assert.equal(store.snapshots.length,2);
  assert.equal(store.state.entries[item.article].status,"published");
  assert.equal(store.state.entries[item.article].postUrl,"https://x.com/i/web/status/12345678901234");
});
test("Ved ukjent/feilet X-respons beholdes engangssperren; retry sender ikke",async()=>{
  const store=fakeStore();
  const item=article(2);
  let sends=0;
  await assert.rejects(
    runBatch({manifest:manifest([item]),commit:SHA,store,
      sendPost:async()=>{sends++;throw new Error("Nettverksfeil");}
    }),/Nettverksfeil/
  );
  assert.equal(store.state.entries[item.article].status,"claimed");
  const next=await runBatch({manifest:manifest([item]),commit:SHA,store,
    sendPost:async()=>{sends++;return {id:"555"};}});
  assert.equal(next.skipped,1);
  assert.equal(sends,1);
});
test("Månedstak på ti lenkeinnlegg forhindrer ekstra X-kall",async()=>{
  const entries={};
  for(let i=0;i<10;i++)entries["artikler/2026-10-01-a"+i+".html"]={
    status:"claimed",claimedAt:"2026-11-02T12:00:00Z"
  };
  const store=fakeStore({schema:1,entries});
  let sends=0;
  const result=await runBatch({manifest:manifest([article(3)]),commit:SHA,store,
    now:()=>new Date("2026-11-11T21:00:00Z"),
    sendPost:async()=>{sends++;return {id:"99"};}});
  assert.deepEqual(result,{published:0,skipped:0,blocked:1});
  assert.equal(sends,0);
  assert.equal(store.snapshots.length,0);
});
test("Manifest kan ikke sende en annen URL eller overskride 280 tegn",()=>{
  const item=article(5);
  assert.throws(()=>validateManifest(manifest([item]),"b".repeat(40)),/main-commiten/);
  assert.throws(()=>validateManifest(manifest([{...item,x:{...item.x,text:"x".repeat(281)}}]),SHA),/Ugyldig/);
  assert.throws(()=>validateManifest(manifest([{...item,x:{...item.x,url:"https://evil.example"}}]),SHA),/Ugyldig/);
  assert.throws(()=>validateManifest(manifest([item,item]),SHA),/to ganger/);
});
test("X-avvisning håndteres uten automatisk retry eller avsløring av token",async()=>{
  let calls=0;
  const env={X_API_KEY:"key",X_API_SECRET:"private",X_ACCESS_TOKEN:"token",X_ACCESS_TOKEN_SECRET:"private"};
  const fakeFetch=async()=>{calls++;return {status:403};};
  await assert.rejects(sendXPost("Kontroll",env,fakeFetch),/HTTP 403/);
  assert.equal(calls,1);
});

test("Riktig X-brukerkonto må verifiseres før noen POST",async()=>{
  const env={X_EXPECTED_USERNAME:"paradisavisa",X_API_KEY:"key",X_API_SECRET:"private",
             X_ACCESS_TOKEN:"token",X_ACCESS_TOKEN_SECRET:"private"};
  let observedHeader="";
  const ok=await assertCorrectXAccount(env,async(_url,req)=>{
    assert.equal(req.method,"GET");
    observedHeader=req.headers.Authorization;
    return {status:200,json:async()=>({data:{username:"Paradisavisa"}})};
  });
  assert.equal(ok,"Paradisavisa");
  assert.match(observedHeader,/oauth_signature="/);
  await assert.rejects(
    assertCorrectXAccount({...env,X_EXPECTED_USERNAME:"feil_bruker"},
      async()=>({status:200,json:async()=>({data:{username:"Paradisavisa"}})})),
    /stemmer ikke/
  );
  await assert.rejects(assertCorrectXAccount({...env,X_EXPECTED_USERNAME:""}),/X_EXPECTED_USERNAME/);
});

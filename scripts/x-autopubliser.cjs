"use strict";
/*
 * Direkte X-publisering for Paradisavisa.
 * - Kun NYE, offentlig verifiserte artikler fra SoMe-manifestet.
 * - OAuth 1.0a User Context, POST https://api.x.com/2/tweets.
 * - Skriver en varig "claimed" oppføring FØR kall til X. Ukjente utfall
 *   forsøkes ALDRI automatisk igjen (ingen dobbelpublisering).
 * - Hard grense: maks 10 X-lenkeinnlegg per UTC-måned fra denne integrasjonen.
 * - Ingen X-kall uten eksplisitt X_AUTOPUBLISH_ENABLED=true og fire secrets.
 */
const fs = require("node:fs");
const crypto = require("node:crypto");
const ENDPOINT = "https://api.x.com/2/tweets";
const LEDGER_BRANCH = "x-publiseringslogg";
const LEDGER_PATH = "redaksjon/x-publiseringslogg.json";
const MAX_POSTS_PER_MONTH = 10;
const BASE = "https://paradispartiet.github.io/Paradisavisa/";

function pct(value) {
  return encodeURIComponent(String(value)).replace(/[!'()*]/g,
    c => "%" + c.charCodeAt(0).toString(16).toUpperCase());
}

function oauthHeader(url, credentials, nonce = crypto.randomBytes(16).toString("hex"),
                     epoch = Math.floor(Date.now() / 1000)) {
  for (const k of ["apiKey","apiSecret","accessToken","accessTokenSecret"]) {
    if (!credentials[k] || typeof credentials[k] !== "string")
      throw new Error("Mangler autentiseringsfelt: " + k);
  }
  const oauth = {
    oauth_consumer_key:credentials.apiKey,
    oauth_nonce:String(nonce),
    oauth_signature_method:"HMAC-SHA1",
    oauth_timestamp:String(epoch),
    oauth_token:credentials.accessToken,
    oauth_version:"1.0"
  };
  const sorted = Object.entries(oauth).map(([k,v])=>[pct(k),pct(v)])
    .sort((a,b)=>a[0].localeCompare(b[0]) || a[1].localeCompare(b[1]));
  const parameters = sorted.map(([k,v])=>k+"="+v).join("&");
  const signatureBase = "POST&" + pct(url) + "&" + pct(parameters);
  const secret = pct(credentials.apiSecret) + "&" + pct(credentials.accessTokenSecret);
  const signature = crypto.createHmac("sha1", secret).update(signatureBase).digest("base64");
  oauth.oauth_signature = signature;
  return "OAuth " + Object.entries(oauth).map(([k,v])=>pct(k)+'="'+pct(v)+'"').join(", ");
}

function validateManifest(manifest, commit) {
  if (!manifest || manifest.schema !== 1 || !Array.isArray(manifest.newArticles))
    throw new Error("Ukjent eller ufullstendig SoMe-manifest");
  if (!/^[a-f0-9]{40}$/.test(commit || "") || manifest.sourceCommit !== commit)
    throw new Error("SoMe-manifestet stammer ikke fra denne main-commiten");
  if (manifest.newArticles.length > 30)
    throw new Error("Uventet stor artikkelpakke – krever redaksjonell kontroll");
  const seen = new Set();
  for (const article of manifest.newArticles) {
    if (!article || typeof article.article !== "string" ||
        !/^artikler\/[a-zA-Z0-9_/-]+\.html$/.test(article.article) ||
        article.article.includes("..") || article.article.includes("//") ||
        typeof article.permalink !== "string" ||
        article.permalink !== new URL(article.article, BASE).href ||
        typeof article.x?.text !== "string" ||
        article.x.text.length < 20 || article.x.text.length > 280 ||
        article.x.url !== article.permalink ||
        !article.x.text.endsWith("\n" + article.permalink))
      throw new Error("Ugyldig artikkel eller X-tekst i manifestet");
    if (seen.has(article.article)) throw new Error("Samme artikkel to ganger i manifestet");
    seen.add(article.article);
  }
  return manifest.newArticles;
}

function validateLedger(ledger) {
  if (!ledger || ledger.schema !== 1 || !ledger.entries ||
      typeof ledger.entries !== "object" || Array.isArray(ledger.entries))
    throw new Error("Ugyldig eller manglende varig X-publiseringslogg");
  return ledger;
}

function isMonthlyClaim(entry, month) {
  return typeof entry?.claimedAt === "string" && entry.claimedAt.startsWith(month + "-");
}

async function runBatch({manifest, commit, store, sendPost, now = () => new Date(), log = () => {}}) {
  const articles = validateManifest(manifest, commit);
  if (!articles.length) return {published:0,skipped:0,blocked:0};
  const first = await store.read();
  const ledger = validateLedger(first.ledger);
  let sha = first.sha, published = 0, skipped = 0, blocked = 0;
  const month = now().toISOString().slice(0,7);
  for (const item of articles) {
    const key = item.article;
    if (Object.prototype.hasOwnProperty.call(ledger.entries,key)) {
      skipped++;
      log("X: finnes allerede i varig logg, ingen nytt innlegg: " + key);
      continue;
    }
    const count = Object.values(ledger.entries).filter(e=>isMonthlyClaim(e, month)).length;
    if (count >= MAX_POSTS_PER_MONTH) {
      blocked++;
      log("X: månedstak ("+MAX_POSTS_PER_MONTH+") nådd; IKKE sendt: "+key);
      continue;
    }

    // Må lykkes med å lagre sperren FØR vi får lov å kontakte X.
    ledger.entries[key] = {
      status:"claimed",
      claimedAt:now().toISOString(),
      sourceCommit:commit,
      textDigest:crypto.createHash("sha256").update(item.x.text).digest("hex"),
      note:"Ingen automatisk retry; kontroller X manuelt ved feil/ukjent respons"
    };
    sha = await store.write(ledger,sha);
    log("X: varig engangssperre registrert før sending: "+key);

    // Ingen automatisk retry ved 429, 500, nettverksbrudd eller timeout:
    // X kan ha publisert selv om responsen forsvant.
    const result = await sendPost(item.x.text);
    if (!result || !/^\d{1,25}$/.test(String(result.id || "")))
      throw new Error("Uklar respons fra X etter sending. Engangssperre beholdes.");
    ledger.entries[key] = {
      ...ledger.entries[key],
      status:"published",
      postId:String(result.id),
      postUrl:"https://x.com/i/web/status/"+result.id,
      publishedAt:now().toISOString()
    };
    // Hvis statusoppdatering feiler, forblir engangssperren varig aktiv.
    sha = await store.write(ledger,sha);
    published++;
    log("X: bekreftet publisert: "+key+" ("+result.id+")");
  }
  return {published,skipped,blocked};
}

function githubStore(env, fetcher = fetch) {
  const repo = env.GITHUB_REPOSITORY;
  if (!/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(repo || ""))
    throw new Error("Mangler/ugyldig GITHUB_REPOSITORY");
  if (!env.GH_WRITE_TOKEN) throw new Error("Mangler GitHub Actions-token med contents:write");
  const url = "https://api.github.com/repos/"+repo+"/contents/"+LEDGER_PATH;
  const headers = {
    Authorization:"Bearer "+env.GH_WRITE_TOKEN,
    Accept:"application/vnd.github+json",
    "X-GitHub-Api-Version":"2022-11-28",
    "User-Agent":"Paradisavisa-X-publisher"
  };
  const checkResponse = async(response, action) => {
    if (!response.ok) throw new Error("GitHub "+action+" feilet: HTTP "+response.status);
    return response.json();
  };
  return {
    async read() {
      const response = await fetcher(url+"?ref="+encodeURIComponent(LEDGER_BRANCH),
        {headers,signal:AbortSignal.timeout(15000)});
      const result = await checkResponse(response,"lese engangslogg");
      if (!result.sha || !result.content)
        throw new Error("Engangslogg er utilgjengelig; avbryt sikkert");
      const ledger = JSON.parse(Buffer.from(result.content.replace(/\s/g,""),"base64").toString("utf8"));
      return {ledger,sha:result.sha};
    },
    async write(ledger,sha) {
      if (!/^[a-f0-9]{40}$/.test(sha || ""))
        throw new Error("Ingen gyldig SHA for engangslogg; avbryt");
      const payload = {
        message:"X-publisering: oppdater varig engangssperre [skip ci]",
        branch:LEDGER_BRANCH,
        sha,
        content:Buffer.from(JSON.stringify(ledger,null,2)+"\n","utf8").toString("base64")
      };
      const response = await fetcher(url,{
        method:"PUT",
        headers:{...headers,"Content-Type":"application/json"},
        body:JSON.stringify(payload),
        signal:AbortSignal.timeout(15000)
      });
      const result = await checkResponse(response,"skrive engangslogg");
      if (!result.content?.sha) throw new Error("GitHub bekreftet ikke lagringen – avbryt");
      return result.content.sha;
    }
  };
}

async function sendXPost(text, env, fetcher = fetch) {
  const credentials = {
    apiKey:env.X_API_KEY,
    apiSecret:env.X_API_SECRET,
    accessToken:env.X_ACCESS_TOKEN,
    accessTokenSecret:env.X_ACCESS_TOKEN_SECRET
  };
  const response = await fetcher(ENDPOINT,{
    method:"POST",
    headers:{
      Authorization:oauthHeader(ENDPOINT,credentials),
      "Content-Type":"application/json",
      "User-Agent":"Paradisavisa-X-publisher"
    },
    body:JSON.stringify({text}),
    signal:AbortSignal.timeout(20000)
  });
  if (response.status !== 201) {
    // Aldri logg svarbody: den kan inneholde sensitive data eller tokenreferanser.
    throw new Error("X bekreftet ikke publisering (HTTP "+response.status+"). Engangssperre beholdes.");
  }
  const json = await response.json();
  if (!json.data?.id)
    throw new Error("X svarte uten post-ID. Ukjent utfall – ingen automatisk retry.");
  return {id:String(json.data.id)};
}

async function main() {
  if (process.env.X_AUTOPUBLISH_ENABLED !== "true") {
    console.log("X-publisering er deaktivert (X_AUTOPUBLISH_ENABLED er ikke true). Ingen API-kall.");
    return;
  }
  const i=process.argv.indexOf("--manifest");
  if (i<0 || !process.argv[i+1]) throw new Error("Bruk --manifest <manifest.json>");
  const env=process.env;
  for (const name of ["X_API_KEY","X_API_SECRET","X_ACCESS_TOKEN","X_ACCESS_TOKEN_SECRET","GH_WRITE_TOKEN"]) {
    if (!env[name]) throw new Error("Mangler konfigurert GitHub Secret: "+name);
  }
  const manifest=JSON.parse(fs.readFileSync(process.argv[i+1],"utf8"));
  const result=await runBatch({
    manifest,commit:env.GITHUB_SHA,store:githubStore(env),
    sendPost:text=>sendXPost(text,env),log:console.log
  });
  console.log("X-publisering ferdig: "+JSON.stringify(result));
  if (result.blocked) throw new Error("X månedstak nådd; overskytende artikler må håndteres redaksjonelt");
}
if (require.main===module) main().catch(e=>{
  console.error("X-publisering stoppet: "+e.message);
  process.exitCode=1;
});
module.exports={pct,oauthHeader,validateManifest,validateLedger,isMonthlyClaim,runBatch,githubStore,sendXPost};

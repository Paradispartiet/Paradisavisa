"use strict";
const {test}=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const vm=require("node:vm");

const html=fs.readFileSync(path.join(__dirname,"../../qa/radio-media-session.html"),"utf8");
const scripts=[...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)].map(x=>x[1]);
test("Testside bruker bare egen lyd, ikke uavklarte Vox- eller nyhets-MP3-er",()=>{
  assert.equal(scripts.length,1);
  assert.match(html,/meta name="robots" content="noindex,nofollow,noarchive"/);
  assert.match(html,/media-src blob:/);
  assert.match(html,/connect-src 'none'/);
  assert.match(html,/Ingen automatisk lyd/);
  assert.match(html,/ikke nyhetsradio/);
  assert.match(html,/isSecureContext/);
  assert.match(html,/Media Session API/);
  assert.match(html,/document\.addEventListener\("visibilitychange"/);
  assert.match(html,/\.setActionHandler\(/);
  assert.match(html,/nexttrack:next,previoustrack:prev/);
  assert.match(html,/new Blob\(\[pcm\],\{type:"audio\/wav"\}\)/);
  assert.match(html,/const rate=12000,frames=rate\*seconds/);
  assert.doesNotMatch(html,/<audio[^>]*autoplay/i);
  assert.doesNotMatch(html,/<script[^>]+src=/);
  assert.doesNotMatch(html,/<audio[^>]+src=/);
  assert.doesNotMatch(scripts[0],/\bfetch\s*\(/);
  assert.doesNotMatch(scripts[0],/\bXMLHttpRequest\b/);
  assert.doesNotMatch(scripts[0],/\.mp3\b/);
  assert.doesNotMatch(scripts[0],/speechSynthesis/);
});
test("Inline JS har gyldig syntaks og kan ikke starte lyd ved innlasting",()=>{
  new vm.Script(scripts[0]);
  const initial=scripts[0].slice(0,scripts[0].indexOf('for(const [name,fn] of Object.entries'));
  assert.doesNotMatch(initial,/audio\.play\(\);\s*\n\s*report\("Klar/);
});
test("Testside inneholder ingen opplesningsmanifest eller modellrettighetsendring",()=>{
  assert.doesNotMatch(html,/release-gate\.json|model-lock\.json|publicAudioEnabled|MODEL_CARD/);
  assert.doesNotMatch(html,/https:\/\/huggingface\.co|\.onnx\b/);
  assert.match(html,/Originale testlyder|originale testlyder/);
});

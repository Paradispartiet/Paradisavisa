"use strict";
const {test}=require("node:test");
const assert=require("node:assert/strict");
const {createPrivatePreview,verifyPrivateManifest,current,osloDate}=
  require("./mp3_preview_player.cjs");

const SHA="a".repeat(64);
const row=(id,date="2026-11-10",expires="2026-11-16")=>({
  id:id.repeat(20),category:"Sport",date,expires,
  candidateFile:"lyd/"+id.repeat(20)+"-"+id.repeat(16)+".mp3",
  durationSeconds:16.7,contentHash:SHA,audioSha256:SHA
});
const gate={publicAudioEnabled:false,modelRightsStatus:"PENDING",editorialAudioStatus:"PENDING"};
const manifest=items=>({
  schemaVersion:1,status:"UNPUBLISHED_INTERNAL_AUDIO_ONLY",
  privateCandidateOnly:true,publicPlayable:false,
  count:items.length,items
});
class AudioMock{
  constructor(){this.listeners=new Map();this.calls=[];this.src="";this.reject=false;}
  addEventListener(type,fn){this.listeners.set(type,fn);}
  removeEventListener(type,fn){if(this.listeners.get(type)===fn)this.listeners.delete(type);}
  emit(type){this.listeners.get(type)?.();}
  play(){this.calls.push("play:"+this.src);return this.reject?
    Promise.reject(Error("Browser denied playback")):Promise.resolve();}
  pause(){this.calls.push("pause");}
  load(){this.calls.push("load");}
  removeAttribute(name){if(name==="src")this.src="";}
}
class SessionMock{
  constructor(){this.playbackState="none";this.actions={};this.metadata=null;}
  setActionHandler(name,cb){this.actions[name]=cb;}
}
const make=(items=[row("a"),row("b")],extra={})=>{
  const audio=new AudioMock();
  const session=new SessionMock();
  const updates=[];
  let instant=new Date("2026-11-10T15:00:00Z");
  const ctor=class MediaMetadataMock{constructor(data){Object.assign(this,data);}};
  const player=createPrivatePreview({
    manifest:manifest(items),releaseGate:gate,audio,
    baseUrl:"https://example.org/private-radio/",
    now:()=>instant,mediaSession:session,MediaMetadataCtor:ctor,
    onState:s=>updates.push(s),...extra
  });
  return {player,audio,session,updates,setNow:time=>{instant=new Date(time);}};
};

test("Kun intern D2-lydpakke og stengt release-gate aksepteres",()=>{
  const ok=manifest([row("a")]);
  assert.equal(verifyPrivateManifest(ok,gate).length,1);
  for(const changed of [
    {...ok,publicPlayable:true},
    {...ok,privateCandidateOnly:false},
    {...ok,status:"APPROVED"},
    {...ok,audioUrl:"https://example.org/music.mp3"},
    {...ok,count:2},
  ]) assert.throws(()=>verifyPrivateManifest(changed,gate));
  for(const bad of [
    {...gate,publicAudioEnabled:true},
    {...gate,modelRightsStatus:"APPROVED"},
    {...gate,editorialAudioStatus:"APPROVED"},
  ]) assert.throws(()=>verifyPrivateManifest(ok,bad));
  assert.throws(()=>verifyPrivateManifest(manifest([row("a"),row("a")]),gate));
  assert.throws(()=>verifyPrivateManifest(manifest([{...row("a"),
      candidateFile:"lyd/../../hemmelig.mp3"}]),gate));
  assert.throws(()=>verifyPrivateManifest(manifest([{...row("a"),audioUrl:"https://evil.example.org"}]),gate));
  assert.throws(()=>verifyPrivateManifest(manifest([{...row("a"),expires:"2026-11-20"}]),gate));
  assert.throws(()=>verifyPrivateManifest(manifest([{...row("a"),date:"2026-02-30"}]),gate));
});

test("Dato følger Oslo, inklusive ved midnatt og sesongtid",()=>{
  assert.equal(osloDate(new Date("2026-11-10T23:30:00Z")),"2026-11-11");
  assert.equal(osloDate(new Date("2026-06-01T22:30:00Z")),"2026-06-02");
  assert.equal(current(row("a","2026-11-10","2026-11-16"),"2026-11-16"),true);
  assert.equal(current(row("a","2026-11-10","2026-11-16"),"2026-11-17"),false);
  assert.equal(current(row("a","2026-11-10","2026-11-16"),"2026-11-09"),false);
});

test("Ikke autoplay; brukerklikk starter første aktuelle MP3 med riktig metadata",async()=>{
  const fresh=row("a");
  const old=row("c","2026-11-01","2026-11-06");
  const t=make([old,fresh]);
  assert.equal(t.audio.calls.length,0,"ingen lyd før eksplisitt avspillingshandling");
  assert.equal(t.player.getState().currentCount,1);
  assert.equal(t.player.getState().publicPlayable,false);
  assert.equal(await t.player.play(),true);
  assert.equal(t.player.getState().current.id,fresh.id);
  assert.match(t.audio.src,/lyd\/a{20}-a{16}\.mp3$/);
  assert.equal(t.session.playbackState,"playing");
  assert.equal(t.session.metadata.artist,"Paradisavisa");
  assert.equal(t.audio.calls.filter(x=>x.startsWith("play:")).length,1);
  t.player.dispose();
});

test("Play/pause/resume/next/previous og Media Session virker som én motor",async()=>{
  const t=make();
  await t.player.play();
  t.session.actions.pause();
  assert.equal(t.player.getState().paused,true);
  assert.equal(t.session.playbackState,"paused");
  t.session.actions.play();
  await Promise.resolve();
  assert.equal(t.player.getState().paused,false);
  assert.equal(t.session.playbackState,"playing");
  await t.player.next();
  assert.equal(t.player.getState().current.id,"b".repeat(20));
  await t.player.previous();
  assert.equal(t.player.getState().current.id,"a".repeat(20));
  t.audio.emit("ended");
  await Promise.resolve();
  assert.equal(t.player.getState().current.id,"b".repeat(20));
  t.session.actions.stop();
  assert.equal(t.player.getState().active,false);
  assert.equal(t.session.playbackState,"none");
  assert.equal(t.audio.src,"");
  t.player.dispose();
  assert.equal(t.session.actions.play,null);
  assert.equal(t.session.actions.nexttrack,null);
});

test("Utløpt lyd stoppes ved overgang til ny Oslo-dato",async()=>{
  const a=row("a","2026-11-10","2026-11-10");
  const b=row("b","2026-11-10","2026-11-12");
  const t=make([a,b]);
  assert.equal(await t.player.play(),true);
  t.setNow("2026-11-10T23:30:00Z"); // 11. november i Oslo.
  t.audio.emit("timeupdate");
  await Promise.resolve();
  assert.equal(t.player.getState().current.id,"b".repeat(20));
  t.setNow("2026-11-12T23:30:00Z"); // 13. november i Oslo.
  t.audio.emit("timeupdate");
  assert.equal(t.player.getState().active,false);
  assert.match(t.player.getState().status,/utløpt/i);
});

test("Utgåtte notiser kan aldri starte eller bli gjentatt",async()=>{
  const t=make([row("a","2026-10-01","2026-10-06")]);
  assert.equal(await t.player.play(),false);
  assert.equal(t.audio.calls.filter(x=>x.startsWith("play:")).length,0);
  assert.match(t.player.getState().status,/arkivlyd/i);
});

test("MP3-feil gir trygg stopp, uten automatisk ny stemme eller nettverk",async()=>{
  const t=make();
  t.audio.reject=true;
  assert.equal(await t.player.play(),false);
  assert.equal(t.player.getState().active,false);
  assert.match(t.player.getState().status,/feilet/i);
  t.audio.reject=false;
  assert.equal(await t.player.play(),true);
  t.audio.emit("error");
  assert.equal(t.player.getState().active,false);
  t.player.dispose();
});

test("Ustøttet Media Session påvirker ikke avspilling",async()=>{
  const a=new AudioMock();
  const p=createPrivatePreview({
    manifest:manifest([row("a")]),releaseGate:gate,
    audio:a,baseUrl:"https://example.org/private-radio/",
    now:()=>new Date("2026-11-10T16:00:00Z")
  });
  assert.equal(await p.play(),true);
  p.pause();
  assert.equal(p.getState().paused,true);
  p.stop();
  assert.equal(p.getState().active,false);
  p.dispose();
});

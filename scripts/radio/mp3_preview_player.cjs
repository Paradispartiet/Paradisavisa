"use strict";

/* PREVIEW ONLY — never imported by public Paradisradioen.
   Accepts only the unpublished D2 manifest and a disabled release gate.
   No fetches, automatic playback, publication or licensing overrides. */
const AUDIO_PATH=/^lyd\/[a-f0-9]{20}-[a-f0-9]{16}\.mp3$/;
const SHA=/^[a-f0-9]{64}$/;
const ISO_DATE=/^\d{4}-\d{2}-\d{2}$/;

function validDate(v) {
  if(typeof v!=="string"||!ISO_DATE.test(v))return false;
  const [y,m,d]=v.split("-").map(Number);
  if(y<1900||y>2200)return false;
  const date=new Date(Date.UTC(y,m-1,d));
  return Number.isFinite(date.getTime())&&date.toISOString().slice(0,10)===v;
}
function osloDate(when=new Date()) {
  if(!(when instanceof Date)||!Number.isFinite(when.getTime()))throw new TypeError("Ugyldig klokkeslett");
  const p=new Intl.DateTimeFormat("en-GB",{
    timeZone:"Europe/Oslo",year:"numeric",month:"2-digit",day:"2-digit"
  }).formatToParts(when);
  const part=n=>p.find(x=>x.type===n).value;
  return [part("year"),part("month"),part("day")].join("-");
}
function current(item,day) {
  if(!item||!validDate(day)||!validDate(item.date)||!validDate(item.expires))return false;
  const t=Date.parse(day+"T00:00:00Z"),a=Date.parse(item.date+"T00:00:00Z");
  const b=Date.parse(item.expires+"T00:00:00Z");
  return t>=a&&t<=b&&t-a<=6*86400000;
}
function verifyPrivateManifest(manifest,gate) {
  if(!gate||gate.publicAudioEnabled!==false||gate.modelRightsStatus!=="PENDING"||
     gate.editorialAudioStatus!=="PENDING")
    throw Error("Privat spiller krever sperret offentlig lydport");
  if(!manifest||manifest.schemaVersion!==1||
     manifest.status!=="UNPUBLISHED_INTERNAL_AUDIO_ONLY"||
     manifest.privateCandidateOnly!==true||manifest.publicPlayable!==false||
     !Array.isArray(manifest.items)||manifest.items.length>50||
     manifest.count!==manifest.items.length||
     Object.hasOwn(manifest,"audioUrl"))
    throw Error("Manifestet er ikke en kontrollert, upublisert lydpakke");
  const ids=new Set();
  const files=new Set();
  return Object.freeze(manifest.items.map(item=>{
    if(!item||!/^([a-f0-9]{20})$/.test(item.id)||ids.has(item.id)||
       typeof item.category!=="string"||!item.category.trim()||
       item.category.length>100||!validDate(item.date)||!validDate(item.expires)||
       !AUDIO_PATH.test(item.candidateFile)||files.has(item.candidateFile)||
       !SHA.test(item.contentHash)||!SHA.test(item.audioSha256)||
       Object.hasOwn(item,"audioUrl")||
       !Number.isFinite(item.durationSeconds)||item.durationSeconds<=2||
       item.durationSeconds>=240)
      throw Error("Utrygg, ugyldig eller duplisert MP3-post");
    const span=(Date.parse(item.expires+"T00:00:00Z")-
                Date.parse(item.date+"T00:00:00Z"))/86400000;
    if(span<0||span>6)throw Error("Lydposten er gyldig for lenge");
    ids.add(item.id);files.add(item.candidateFile);
    return Object.freeze({id:item.id,category:item.category,date:item.date,
      expires:item.expires,candidateFile:item.candidateFile,
      audioSha256:item.audioSha256,contentHash:item.contentHash,
      durationSeconds:item.durationSeconds});
  }));
}
function createPrivatePreview({manifest,releaseGate,audio,baseUrl,
                              mediaSession=null,MediaMetadataCtor=null,
                              now=()=>new Date(),onState=()=>{}}) {
  const items=verifyPrivateManifest(manifest,releaseGate);
  if(!audio||typeof audio.play!=="function"||typeof audio.pause!=="function"||
     typeof audio.addEventListener!=="function"||
     typeof baseUrl!=="string"||!baseUrl)throw TypeError("Audioelement og base-URL kreves");
  const base=new URL(baseUrl);
  if(!["file:","https:","http:"].includes(base.protocol)||!base.href.endsWith("/"))
    throw Error("Base må være en lokal eller vanlig nettkatalog");
  let index=-1,active=false,paused=false,disposed=false,version=0;
  let status="Klar for privat lytting. Trykk Spill.";
  const day=()=>osloDate(now());
  const available=()=>items.map((item,i)=>({item,index:i})).filter(v=>current(v.item,day()));
  const selected=()=>index<0?null:items[index];
  const getState=()=>({active,paused,index,current:selected(),status,
                       currentCount:available().length,publicPlayable:false});
  const notify=()=>{try{onState(getState())}catch(_){}};
  const setStatus=s=>{status=s;notify()};
  const syncSession=()=>{
    if(!mediaSession)return;
    try{mediaSession.playbackState=active?(paused?"paused":"playing"):"none"}catch(_){}
  };
  const announce=item=>{
    if(!mediaSession||!MediaMetadataCtor)return;
    try{mediaSession.metadata=new MediaMetadataCtor({
      title:item.category+" – nyhetsnotis",artist:"Paradisavisa",
      album:"Privat MP3-test, ikke direktesending"
    })}catch(_){}
  };
  const safeSrc=item=>{
    const target=new URL(item.candidateFile,base);
    if(!target.href.startsWith(base.href)||
       (base.protocol!=="file:"&&target.origin!==base.origin))
      throw Error("Lydlenken ligger utenfor privat katalog");
    return target.href;
  };
  const stop=(reason="Opplesningen er stoppet.")=>{
    version++;active=false;paused=false;index=-1;
    try{audio.pause()}catch(_){}
    try{audio.removeAttribute?.("src");audio.load?.()}catch(_){}
    syncSession();setStatus(reason);
  };
  const onFailure=()=>stop("MP3-avspilling feilet. Den offentlige radioen er uendret.");
  const playIndex=async i=>{
    if(disposed)return false;
    const item=items[i];
    if(!item||!current(item,day())){
      stop("Nyheten er utløpt. Ingen gammel lyd spilles.");return false;
    }
    const currentVersion=++version;
    active=true;paused=false;index=i;
    try{
      audio.pause();
      audio.src=safeSrc(item);
      audio.load?.();
      announce(item);syncSession();
      setStatus("Privat lydprøve: "+item.category);
      await Promise.resolve(audio.play());
      return !disposed&&currentVersion===version;
    }catch(_){
      if(currentVersion===version)onFailure();
      return false;
    }
  };
  const play=()=>{
    if(disposed)return Promise.resolve(false);
    if(active&&paused){
      if(!current(selected(),day())){stop("Nyheten er utløpt.");return Promise.resolve(false)}
      paused=false;syncSession();setStatus("Privat MP3-lyd fortsetter.");
      return Promise.resolve().then(()=>audio.play()).then(()=>true,()=>{
        onFailure();return false;
      });
    }
    if(active)return Promise.resolve(true);
    const choices=available();
    if(!choices.length){stop("Ingen aktuelle notiser. Arkivlyd avspilles ikke.");return Promise.resolve(false)}
    return playIndex(choices[0].index);
  };
  const pause=()=>{
    if(!active||paused||disposed)return;
    try{audio.pause()}catch(_){}
    paused=true;syncSession();setStatus("Privat lyd er satt på pause.");
  };
  const jump=offset=>{
    if(disposed||!active)return Promise.resolve(false);
    const choices=available();
    if(!choices.length){stop("Ingen aktuelle notiser.");return Promise.resolve(false)}
    const at=choices.findIndex(c=>c.index===index);
    const target=at<0?0:(at+offset+choices.length)%choices.length;
    return playIndex(choices[target].index);
  };
  const next=()=>jump(1);
  const previous=()=>jump(-1);
  const ended=()=>{if(active&&!paused)void next()};
  const error=()=>{if(active)onFailure()};
  const tick=()=>{
    if(!active||disposed||current(selected(),day()))return;
    const choices=available();
    if(choices.length)void playIndex(choices[0].index);
    else stop("Alle nyheter er utløpt.");
  };
  audio.addEventListener("ended",ended);
  audio.addEventListener("error",error);
  audio.addEventListener("timeupdate",tick);
  const actions={play:()=>{void play()},pause,stop:()=>stop(),
                 nexttrack:()=>{void next()},previoustrack:()=>{void previous()}};
  if(mediaSession&&typeof mediaSession.setActionHandler==="function"){
    for(const [name,handler] of Object.entries(actions)){
      try{mediaSession.setActionHandler(name,handler)}catch(_){}
    }
  }
  const dispose=()=>{
    if(disposed)return;
    stop();disposed=true;
    audio.removeEventListener?.("ended",ended);
    audio.removeEventListener?.("error",error);
    audio.removeEventListener?.("timeupdate",tick);
    if(mediaSession&&typeof mediaSession.setActionHandler==="function"){
      for(const name of Object.keys(actions)){
        try{mediaSession.setActionHandler(name,null)}catch(_){}
      }
    }
  };
  notify();
  return Object.freeze({play,pause,stop,next,previous,dispose,getState});
}
module.exports={createPrivatePreview,verifyPrivateManifest,current,osloDate};

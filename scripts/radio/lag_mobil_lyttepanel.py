#!/usr/bin/env python3
"""Lag iPad-/mobiltest av private Vox-lydprøver; aldri deploy til Pages.

Én HTMLAudioElement og innebygde lyddata: ingen MP3-nettlenker, ingen autoplay.
Tester Media Session der nettleseren støtter det, men lover ikke låseskjermlyd.
"""
from __future__ import annotations
import argparse
import html
import json
import pathlib

from lag_lyttepanel import checked_tracks


def build_mobile_panel(report_path: pathlib.Path, output: pathlib.Path) -> pathlib.Path:
    tracks = checked_tracks(report_path)  # Kontroller internstatus, rettigheter, SHA-256 og filbaner.
    dataset = []
    for t in tracks:
        dataset.append({
            "id": t["id"],
            "profile": t["profile"],
            "title": str(t.get("sourceCategory") or "Nyhet") + (
                " · Normal" if t["profile"] == "normal" else " · Nyhetsflyt"),
            "description": t["speechText"],
            "sourceClass": t.get("sourceClass", ""),
            "durationSeconds": t["durationSeconds"],
            "src": t["src"],
        })
    # Hindrer at eventuelle nyhetstekster avslutter script-elementet eller tilfører HTML.
    json_data = json.dumps(dataset, ensure_ascii=False, separators=(",", ":"))
    json_data = json_data.replace("<", "\\u003c").replace(">", "\\u003e").replace("&", "\\u0026")
    markup = r"""<!doctype html>
<html lang="no">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; media-src data:; script-src 'unsafe-inline'; style-src 'unsafe-inline'; base-uri 'none'; form-action 'none'">
<title>Paradisradioen – iPad-test av MP3</title>
<style>
*{box-sizing:border-box}
body{margin:0;background:#070707;color:#f7f7f7;font:16px/1.5 system-ui,-apple-system,sans-serif}
main{max-width:800px;margin:0 auto;padding:25px 16px 88px}
h1{font-size:clamp(1.5rem,4.5vw,2.4rem);line-height:1.2;margin:.2rem 0 1rem}
h2{font-size:1.12rem;margin:0 0 12px}
.kicker{color:#f6d65d;font-weight:800;letter-spacing:.14em;font-size:.8rem}
.warning{border-left:4px solid #f0ce5f;background:#1e1e1e;padding:12px 14px}
.panel{background:#171717;border:1px solid #505050;border-radius:12px;padding:clamp(14px,3vw,22px);margin-top:16px}
#now{font-size:1.2rem;font-weight:750;color:#f6d65d}
#source{font-size:.83rem;color:#ccc}
audio{display:block;width:100%;height:54px;margin:16px 0}
.controls{display:flex;gap:9px;flex-wrap:wrap}
button{border:1px solid #777;background:#272727;color:white;min-height:48px;border-radius:7px;padding:10px 15px;cursor:pointer;font:700 .9rem/1.2 inherit}
button.primary{background:#f4d35e;color:#090909;border-color:#f4d35e}
button:focus-visible{outline:3px solid white;outline-offset:3px}
button:disabled{opacity:.35;cursor:not-allowed}
#status{color:#eee;min-height:2.8rem}
ol{padding:0;list-style:none;margin:.8rem 0}
li{border-bottom:1px solid #3d3d3d;padding:.7rem 0;font-size:.92rem}
li[aria-current="true"]{border-left:3px solid #f4d35e;padding-left:10px;background:#262117}
#currentText{color:#ccc;overflow-wrap:anywhere}
code{font-size:.86rem;overflow-wrap:anywhere}
#log{background:#101010;color:#d6d6d6;border:1px solid #5d5d5d;border-radius:6px;width:100%;font:12px/1.4 ui-monospace,monospace;padding:10px}
.grid{display:grid;gap:14px;grid-template-columns:repeat(auto-fit,minmax(min(100%,275px),1fr))}
small{color:#bbb}
</style>
</head>
<body><main>
<p class="kicker">PARADISAVISA · ALLTID NYHETER</p>
<h1>Mobiltest av norsk radiostemme</h1>
<p class="warning"><strong>Kun privat test.</strong> MP3-ene er tidligere publiserte notiser brukt som stemmeprøver, ikke dagsaktuelle nyheter eller offentlig sending. Ingen automatisk avspilling.</p>
<p>Test vanlig avspilling først. Prøv så å låse skjermen, bruke medieknappene på iPad og bytte app. Hvis mediekontrollene ikke vises, er det en nettleser- eller lokalfilbegrensning, ikke nødvendigvis feil i lydfilene.</p>
<section class="panel" aria-label="Mobilspiller">
<h2>Én felles MP3-spiller</h2>
<p id="now">Velg Spill for å starte</p>
<p id="source"></p>
<audio id="player" controls preload="none" playsinline></audio>
<div class="controls">
<button id="previous" type="button">Forrige</button>
<button id="play" type="button" class="primary">Spill / fortsett</button>
<button id="pause" type="button">Pause</button>
<button id="next" type="button">Neste</button>
<button id="stop" type="button">Stopp</button>
</div>
<p id="status" role="status" aria-live="polite">Klar. Ingen lyd er startet.</p>
<details><summary>Tekst som blir lest opp</summary><p id="currentText"></p></details>
</section>
<div class="grid">
<section class="panel"><h2>Prøvene</h2><ol id="playlist"></ol></section>
<section class="panel"><h2>Teknisk status</h2>
<p id="sessionSupport">Kontrollerer nettleseren …</p>
<p id="secureContext"></p>
<p><small>På noen iPad-er støttes ikke Media Session fra lokale HTML-filer. For sikker låseskjermverifisering trengs en separat HTTPS-test etter rettighetskontroll.</small></p>
</section>
</div>
<section class="panel"><h2>Hendelseslogg</h2>
<p><small>Registrerer trykk, pauser, medietaster, feil og om siden skjules. Denne loggen sendes ingen steder.</small></p>
<textarea id="log" rows="9" readonly aria-label="Lokal testlogg"></textarea>
<button id="copylog" type="button">Kopier testlogg</button>
</section>
</main>
<script id="tracks" type="application/json">__DATA__</script>
<script>
"use strict";
(()=>{
 const list=JSON.parse(document.getElementById("tracks").textContent);
 const audio=document.getElementById("player");
 const now=document.getElementById("now");
 const source=document.getElementById("source");
 const currentText=document.getElementById("currentText");
 const status=document.getElementById("status");
 const log=document.getElementById("log");
 const playlist=document.getElementById("playlist");
 let index=-1, playing=false;
 const media=navigator.mediaSession||null;
 const logLine=msg=>{
   const stamp=new Date().toLocaleTimeString("nb-NO");
   log.value+=(log.value?"\n":"")+stamp+"  "+msg;
   log.scrollTop=log.scrollHeight;
 };
 const setStatus=msg=>{status.textContent=msg;logLine(msg)};
 const mediaState=()=>{
   if(!media)return;
   try{media.playbackState=playing?(audio.paused?"paused":"playing"):"none"}catch(_){}
 };
 const show=()=>{
   if(index<0){now.textContent="Velg Spill for å starte";source.textContent="";currentText.textContent=""}
   else{
     const item=list[index];
     now.textContent=item.title;
     source.textContent=(item.sourceClass==="arkiv_kun_uttaletest"?"Arkiv, kun uttaletest":"Publisert notis, uttaletest")+
       " · "+item.durationSeconds.toFixed(1)+" sek";
     currentText.textContent=item.description;
   }
   [...playlist.children].forEach((li,i)=>{
     if(i===index)li.setAttribute("aria-current","true");
     else li.removeAttribute("aria-current");
   });
 };
 const metadata=()=>{
   if(!media||index<0||typeof MediaMetadata!=="function")return;
   try{media.metadata=new MediaMetadata({
     title:list[index].title,artist:"Paradisavisa",
     album:"Privat norsk stemmetest – ikke direktesending"
   })}catch(_){}
 };
 const stop=()=>{
   playing=false;
   audio.pause();
   audio.removeAttribute("src");
   audio.load();
   index=-1;show();mediaState();
   setStatus("Stoppet.");
 };
 const selectAndPlay=i=>{
   if(i<0||i>=list.length)return;
   audio.pause();
   index=i;
   audio.src=list[i].src;
   audio.load();
   show();metadata();
   // Kalles synkront fra brukerhandling (viktig for iOS).
   try{
     const result=audio.play();
     playing=true;mediaState();
     setStatus("Spiller: "+list[i].title);
     Promise.resolve(result).catch(err=>{
       playing=false;mediaState();
       setStatus("Avspilling avvist: "+(err?.name||"ukjent feil"));
     });
   }catch(err){
     playing=false;mediaState();
     setStatus("Kunne ikke starte lyd: "+(err?.name||"ukjent feil"));
   }
 };
 const play=()=>{
   if(!list.length)return;
   if(index<0){selectAndPlay(0);return}
   if(!audio.paused)return;
   try{
     const result=audio.play();
     playing=true;mediaState();setStatus("Fortsetter: "+list[index].title);
     Promise.resolve(result).catch(err=>{
       playing=false;mediaState();setStatus("Fortsett avvist: "+(err?.name||"ukjent feil"));
     });
   }catch(err){playing=false;mediaState();setStatus("Fortsett feilet: "+(err?.name||"ukjent feil"))}
 };
 const pause=()=>{
   if(index<0)return;
   audio.pause();mediaState();setStatus("Pauset.");
 };
 const next=()=>{
   if(!list.length)return;
   selectAndPlay(index<0?0:(index+1)%list.length);
 };
 const previous=()=>{
   if(!list.length)return;
   selectAndPlay(index<=0?list.length-1:index-1);
 };
 const bind=(id,fn)=>document.getElementById(id).addEventListener("click",fn);
 bind("play",play);bind("pause",pause);bind("stop",stop);
 bind("next",next);bind("previous",previous);
 for(const item of list){
   const li=document.createElement("li");
   li.textContent=item.title;
   playlist.appendChild(li);
 }
 audio.addEventListener("ended",()=>{logLine("Lydfil ferdig; spiller neste");next()});
 audio.addEventListener("error",()=>{
   playing=false;mediaState();
   setStatus("Lydfeil: "+(audio.error?.code||"ukjent"));
 });
 audio.addEventListener("pause",()=>mediaState());
 audio.addEventListener("play",()=>mediaState());
 document.addEventListener("visibilitychange",()=>logLine(
   "Side "+(document.hidden?"skjult (bakgrunn/låseskjerm)":"synlig")));
 if(media&&typeof media.setActionHandler==="function"){
   for(const [name,handler] of Object.entries({
     play,pause,stop,nexttrack:next,previoustrack:previous
   })){
     try{
       media.setActionHandler(name,()=>{
         logLine("Medietast: "+name);handler();
       });
     }catch(_){logLine("Medietast utilgjengelig: "+name)}
   }
 }
 document.getElementById("sessionSupport").textContent=
   "Media Session: "+(media?"Tilgjengelig i nettleseren":"Ikke tilgjengelig her");
 document.getElementById("secureContext").textContent=
   "Sikker kontekst: "+(window.isSecureContext?"Ja":"Nei")+
   " · protokoll: "+location.protocol;
 bind("copylog",()=>{
   log.focus();log.select();
   try{document.execCommand("copy");setStatus("Testloggen er kopiert eller markert for kopiering.")}
   catch(_){setStatus("Marker loggen og kopier manuelt.")}
 });
 show();logLine("Mobiltesten lastet. Ingen automatisk lyd.");
})();
</script>
</body></html>"""
    page = markup.replace("__DATA__", json_data)
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(page, encoding="utf-8")
    return output


def main() -> None:
    p = argparse.ArgumentParser()
    p.add_argument("--report", type=pathlib.Path, default=pathlib.Path("vox-prove/rapport.json"))
    p.add_argument("--output", type=pathlib.Path, default=pathlib.Path("vox-prove/ipad-mobiltest.html"))
    args = p.parse_args()
    print(build_mobile_panel(args.report, args.output))


if __name__ == "__main__":
    main()

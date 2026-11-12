/* Eldre artikkelsider: eksisterende header.html er eneste JS-aktive navigasjonskilde.
   Fallback med <details> ligger i HTML og fungerer også uten nett/JavaScript. */
(() => {
 "use strict";
 const boot=()=>{
  const fallback=document.querySelector("body > .avisa-article-fallback");
  // Sider med den allerede etablerte header-placeholder behandles av script.js.
  if(!fallback||document.getElementById("header-placeholder"))return;
  const src=Array.from(document.scripts).find(s=>/\/artikkel-header\.js(?:\?.*)?$/.test(s.src))?.src;
  if(!src)return;
  const root=new URL(".",src);
  fetch(new URL("header.html",root),{cache:"no-store"}).then(r=>{
   if(!r.ok)throw new Error("Felles toppmeny kunne ikke lastes");
   return r.text();
  }).then(html=>{
   const t=document.createElement("template");
   t.innerHTML=html.trim();
   const header=t.content.querySelector("header.avisa-shared-header");
   if(!header)throw new Error("Ugyldig felles header");
   header.classList.add("avisa-artikkel-injisert");
   for(const a of header.querySelectorAll("a[href]")){
    const href=a.getAttribute("href");
    if(href&&!href.startsWith("#"))a.href=new URL(href,root).href;
   }
   const button=header.querySelector(".nav-toggle");
   const menu=header.querySelector(".avisa-menu");
   if(!button||!menu)throw new Error("Meny mangler");
   // Skjul bare JS-menyen når knappen er klar; fallback har alltid fungerende <details>.
   menu.hidden=true;
   button.hidden=false;
   const setOpen=open=>{
    menu.hidden=!open;
    button.setAttribute("aria-expanded",String(open));
    button.setAttribute("aria-label",open?"Lukk meny":"Åpne meny");
    const icon=button.querySelector(".nav-toggle-icon");
    if(icon)icon.textContent=open?"×":"☰";
   };
   button.addEventListener("click",()=>setOpen(menu.hidden));
   menu.addEventListener("click",e=>{if(e.target.closest("a"))setOpen(false)});
   document.addEventListener("click",e=>{if(!header.contains(e.target))setOpen(false)});
   document.addEventListener("keydown",e=>{
    if(e.key==="Escape"&&!menu.hidden){setOpen(false);button.focus();}
   });
   fallback.replaceWith(header);
   document.body.classList.add("har-felles-header");
  }).catch(()=>{
   // Ingen tom header: det serverrendrede <details>-menyvalget beholdes.
  });
 };
 if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot,{once:true});
 else boot();
})();

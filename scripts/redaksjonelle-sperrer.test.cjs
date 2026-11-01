"use strict";
const test=require("node:test");
const assert=require("node:assert/strict");
const {finnLenkerTilUtkast,fjernInterneNotater}=require("./redaksjonelle-sperrer.cjs");

const kilde="utkast/2026-10-30/uten-mobilnett.html";

test("blokkerer lenker til artikler i andre utkastmapper",()=>{
  assert.deepEqual(finnLenkerTilUtkast('<a href="../2026-10-28/cyberrisiko.html">Sak</a>',kilde),["../2026-10-28/cyberrisiko.html"]);
});

test("blokkerer lenker til utkast i samme mappe",()=>{
  assert.deepEqual(finnLenkerTilUtkast('<a href="pensjonsinformasjon.html">Sak</a>',kilde),["pensjonsinformasjon.html"]);
});

test("blokkerer rotlenker, absolutte lenker og lenker med spørring",()=>{
  const tekst='<a href="/utkast/2026-10-30/arbeidstid.html">A</a><a href="https://example.org/Paradisavisa/utkast/2026-10-28/medier-meta.html?x=1">B</a>';
  assert.equal(finnLenkerTilUtkast(tekst,kilde).length,2);
});

test("godtar ikke-artikkel-lenker",()=>{
  const tekst='<a href="../../index.html">Forside</a><a href="../index.html">Kø</a><a href="#artikkel">Topp</a><a href="https://nsm.no/aktuelt/">NSM</a><a href="../2026-10-28/redaksjon.css">Stil</a>';
  assert.deepEqual(finnLenkerTilUtkast(tekst,kilde),[]);
});

test("fjerner interne notater, men beholder kildene",()=>{
  const html='<p>Ingress</p><p><strong>Kildesjekk 1. november 2026:</strong> Internt notat.</p><ul><li>Offentlig kilde</li></ul><p><strong>Før publisering:</strong> Sjekk kilden.</p><p>Leserverdig innhold</p>';
  assert.equal(fjernInterneNotater(html),'<p>Ingress</p><ul><li>Offentlig kilde</li></ul><p>Leserverdig innhold</p>');
});

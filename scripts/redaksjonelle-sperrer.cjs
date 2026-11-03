/* Felles tekniske sperrer for artikkelutkast. Ikke journalistisk faktasjekk. */
"use strict";

function finnLenkerTilUtkast(html, fraFil) {
  const funn=[];
  const grunnadresse="https://paradisavisa.invalid/"+fraFil;
  for (const treff of html.matchAll(/\bhref\s*=\s*(["'])(.*?)\1/gi)) {
    const lenke=treff[2].trim();
    if (!lenke || lenke.startsWith("#") || /^(?:mailto|tel|data):/i.test(lenke)) continue;
    let adresse;
    try { adresse=new URL(lenke,grunnadresse); } catch { continue; }
    if (/\/utkast\/\d{4}-\d{2}-\d{2}\/[a-z0-9-]+\.html$/i.test(adresse.pathname)) {
      funn.push(lenke);
    }
  }
  return funn;
}

function fjernInterneNotater(html) {
  return html.replace(/<p>\s*<strong>(?:Før publisering|Kildesjekk[^<]*):<\/strong>[\s\S]*?<\/p>/g,"");
}

module.exports={finnLenkerTilUtkast,fjernInterneNotater};

#!/usr/bin/env node
/*
 * Genera los SVG del logo AGOLD a partir de js/butterfly-geometry.js
 *   assets/logo/agold-sello.svg      sello completo (aro + textos + mariposa)
 *   assets/logo/agold-mariposa.svg   isotipo (solo la mariposa)
 *   favicon.svg                      favicon
 * y actualiza los bloques marcados en index.html:
 *   <!-- logo:mariposa --> … <!-- /logo:mariposa -->
 *
 * Uso: node scripts/build-logo.mjs   (no hace falta en el despliegue)
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { FACETS, BODY, ANTENNA } from '../js/butterfly-geometry.js';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const GOLD = '#B8975A';
const r = (n) => Math.round(n * 100) / 100;

/** Aristas únicas de todas las facetas (para dibujarlas línea a línea). */
function uniqueEdges() {
  const seen = new Map();
  for (const f of FACETS) {
    for (let i = 0; i < 3; i++) {
      const a = f.pts[i];
      const b = f.pts[(i + 1) % 3];
      const key = [a, b].map((p) => p.join(',')).sort().join('|');
      if (!seen.has(key)) seen.set(key, [a, b]);
    }
  }
  // Orden: del cuerpo hacia fuera, para que el trazo "crezca" desde el centro
  return [...seen.values()].sort(
    (e1, e2) => Math.hypot(...e1[0]) + Math.hypot(...e1[1]) - Math.hypot(...e2[0]) - Math.hypot(...e2[1])
  );
}

/** Mariposa como grupo SVG. className opcional para animación de trazado. */
function butterflyMarkup({ animate = false } = {}) {
  const edges = uniqueEdges();
  const attr = (i) => (animate ? ` pathLength="1" style="--i:${i}"` : '');
  const lines = edges
    .map(([a, b], i) => `<path d="M${r(a[0])} ${r(a[1])}L${r(b[0])} ${r(b[1])}"${attr(i)}/>`)
    .join('');
  const n = edges.length;
  const body = BODY.map(
    ([cy, rx, ry], i) => `<ellipse cx="0" cy="${cy}" rx="${rx}" ry="${ry}"${attr(n + i)}/>`
  ).join('');
  const ant = [1, -1]
    .map((s, k) => {
      const [fx, fy] = ANTENNA.from;
      const [tx, ty] = ANTENNA.to;
      const ang = (Math.atan2(ty - fy, (tx - fx) * s) * 180) / Math.PI + 90;
      return (
        `<path d="M${r(fx * s)} ${fy}L${r(tx * s)} ${ty}"${attr(n + BODY.length + k)}/>` +
        `<ellipse cx="0" cy="0" rx="${ANTENNA.tip.rx}" ry="${ANTENNA.tip.ry}" transform="translate(${r(tx * s)} ${ty - 3}) rotate(${r(ang)})"${attr(n + BODY.length + k)}/>`
      );
    })
    .join('');
  return lines + body + ant;
}

const butterflyStandalone = (size = 160) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-70 -62 140 132" width="${size}" height="${r((size * 132) / 140)}" fill="none" stroke="${GOLD}" stroke-width="1.1" stroke-linejoin="round" stroke-linecap="round" role="img" aria-label="AGOLD">${butterflyMarkup()}</svg>\n`;

function seal() {
  const c = 200;
  const R = 184; // aro exterior
  const Ri = 160; // aro interior
  const polar = (rad, deg) => {
    const a = ((deg - 90) * Math.PI) / 180;
    return [r(c + rad * Math.cos(a)), r(c + rad * Math.sin(a))];
  };
  const arc = (rad, d1, d2) => {
    const [x1, y1] = polar(rad, d1);
    const [x2, y2] = polar(rad, d2);
    const large = Math.abs(d2 - d1) > 180 ? 1 : 0;
    return `M${x1} ${y1}A${rad} ${rad} 0 ${large} 1 ${x2} ${y2}`;
  };
  const topGap = 29;
  const botGap = 50;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="400" height="400" role="img" aria-label="AGOLD · Nails &amp; Beauty">
  <defs>
    <path id="arc-top" d="M${c - 175} ${c}A175 175 0 0 1 ${c + 175} ${c}"/>
    <path id="arc-bot" d="M${c - 193} ${c}A193 193 0 0 0 ${c + 193} ${c}"/>
  </defs>
  <circle cx="${c}" cy="${c}" r="198" fill="#FFFFFF"/>
  <g fill="none" stroke="${GOLD}" stroke-width="1.6" stroke-linecap="round">
    <path d="${arc(R, topGap, 180 - botGap)}"/>
    <path d="${arc(R, 180 + botGap, 360 - topGap)}"/>
    <circle cx="${c}" cy="${c}" r="${Ri}"/>
  </g>
  <g fill="${GOLD}" font-family="'Instrument Sans', Futura, 'Century Gothic', 'Helvetica Neue', Arial, sans-serif" font-weight="400">
    <text font-size="33" letter-spacing="5"><textPath href="#arc-top" startOffset="50%" text-anchor="middle">AGOLD</textPath></text>
    <text font-size="23" letter-spacing="4"><textPath href="#arc-bot" startOffset="50%" text-anchor="middle">NAILS &amp; BEAUTY</textPath></text>
  </g>
  <g transform="translate(${c} ${c + 2}) scale(2.12)" fill="none" stroke="${GOLD}" stroke-width="0.62" stroke-linejoin="round" stroke-linecap="round">${butterflyMarkup()}</g>
</svg>
`;
}

writeFileSync(join(ROOT, 'assets/logo/agold-sello.svg'), seal());
writeFileSync(join(ROOT, 'assets/logo/agold-mariposa.svg'), butterflyStandalone());
writeFileSync(
  join(ROOT, 'favicon.svg'),
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-74 -70 148 148"><rect x="-74" y="-70" width="148" height="148" rx="30" fill="#1A1512"/><g fill="none" stroke="#D2B479" stroke-width="3" stroke-linejoin="round" stroke-linecap="round">${butterflyMarkup()}</g></svg>\n`
);

// Inyecta el isotipo animable en index.html
const htmlPath = join(ROOT, 'index.html');
try {
  let html = readFileSync(htmlPath, 'utf8');
  html = html.replace(
    /<!-- logo:mariposa -->[\s\S]*?<!-- \/logo:mariposa -->/g,
    `<!-- logo:mariposa -->${butterflyMarkup({ animate: true })}<!-- /logo:mariposa -->`
  );
  writeFileSync(htmlPath, html);
  console.log('index.html actualizado');
} catch {
  console.log('index.html no encontrado (se omite la inyección)');
}
console.log('Logo generado en assets/logo/ y favicon.svg');

#!/usr/bin/env node
/**
 * After `npm run build`: the document language and the font loading of every page in ./out.
 *
 *   node scripts/check-lang-fonts.mjs
 *
 * What it asserts (docs/landing-copy.md, "Regions are pages"):
 *  - <html lang="ru"> on /ru/, <html lang="en"> on every other page, the 404 included.
 *  - No English page preloads a Cyrillic font file, and none links a stylesheet that declares the Cyrillic faces twice.
 *  - /ru/ preloads the Cyrillic Manrope file, with the same `font-display: swap` and a "Manrope Fallback" as the English pages.
 *
 * It reads the built HTML and CSS only (no browser). It depends on `experimental.cssChunking: 'graph'` in next.config.ts: with the
 * default chunking, Turbopack merges the font CSS of both root layouts into every page. Exit code 1 on any failure.
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';

const OUT = resolve(process.argv[2] ?? 'out');
const CYRILLIC = /U\+4[0-5][0-9a-f]/i; // the Cyrillic block (U+400-45F)

function* htmlFiles(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (name === '_next') continue;
    if (statSync(p).isDirectory()) yield* htmlFiles(p);
    else if (name.endsWith('.html')) yield p;
  }
}

const cssCache = new Map();
const css = (href) => {
  if (!cssCache.has(href)) cssCache.set(href, readFileSync(join(OUT, href), 'utf8'));
  return cssCache.get(href);
};

const failures = [];
const fail = (page, message) => failures.push(`${page}: ${message}`);
let pages = 0;

for (const file of htmlFiles(OUT)) {
  const page = '/' + relative(OUT, file).replace(/index\.html$/, '');
  if (/^\/(_next|_not-found)/.test(page) || page.startsWith('/yandex')) continue;
  const html = readFileSync(file, 'utf8');
  if (!/<html[\s>]/.test(html)) continue;
  pages += 1;

  const isRu = page === '/ru/';
  const lang = /<html[^>]*\slang="([^"]*)"/.exec(html)?.[1];
  if (lang !== (isRu ? 'ru' : 'en')) fail(page, `<html lang="${lang}"> but the page is ${isRu ? 'ru' : 'en'}`);

  const sheets = [...html.matchAll(/<link rel="stylesheet" href="([^"]+\.css)"/g)].map((m) => m[1]);
  const faces = sheets.flatMap((href) => [...css(href).matchAll(/@font-face\{[^}]*\}/g)].map((m) => m[0]));
  const cyrillicManrope = faces.filter((f) => /font-family:Manrope[;}]/.test(f) && CYRILLIC.test(f));
  const swap = faces.filter((f) => /font-family:(Manrope|Inter|Bricolage Grotesque);/.test(f)).every((f) => f.includes('font-display:swap'));
  if (!swap) fail(page, 'a font face is not font-display: swap');
  if (!faces.some((f) => f.includes('font-family:Manrope Fallback'))) fail(page, 'no metric-matched "Manrope Fallback"');

  const preloaded = [...html.matchAll(/<link rel="preload" href="([^"]+\.woff2)" as="font"/g)].map((m) => m[1].split('/').pop());
  const cyrillicPreloads = preloaded.filter((name) => faces.some((f) => f.includes(name) && CYRILLIC.test(f)));

  if (isRu) {
    if (!cyrillicPreloads.length) fail(page, 'the Cyrillic Manrope file is not preloaded');
    if (cyrillicManrope.length !== 1) fail(page, `${cyrillicManrope.length} Cyrillic Manrope faces declared (want exactly 1)`);
  } else {
    if (cyrillicPreloads.length) fail(page, `preloads a Cyrillic font file (${cyrillicPreloads.join(', ')})`);
    if (cyrillicManrope.length > 1) fail(page, `${cyrillicManrope.length} Cyrillic Manrope faces declared (want at most 1, never preloaded)`);
  }
}

if (failures.length) {
  console.error(failures.map((f) => `  x ${f}`).join('\n'));
  console.error(`\ncheck-lang-fonts: FAIL (${failures.length})`);
  process.exit(1);
}
console.log(`check-lang-fonts: ok (${pages} pages)`);

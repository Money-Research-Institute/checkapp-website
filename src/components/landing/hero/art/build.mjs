#!/usr/bin/env node
/**
 * Re-makes the hero phone in Russian: the Home screen of public/landing/hero/phone-800.webp with its words in Russian, so /ru/ shows
 * the same app in the same language as the Meet DiDi phones and the final-CTA phone (src/components/landing/familiar/art).
 *
 *   node src/components/landing/hero/art/build.mjs
 *
 * - The words are the ones the Meet DiDi device art uses for the same screen (../../familiar/art/strings.mjs, `STR.ru.home`), so the
 *   two Home phones on /ru/ always agree. They are drafts like every Russian string outside the client's document.
 * - BASE (default public/landing/hero/phone-800.webp) is the English export; only the words change, the bezel, island and the
 *   art of the screen are copied.
 * - Fonts: Inter's latin and cyrillic woff2 (the files next/font writes to out/_next/static/media; override with INTER_LATIN /
 *   INTER_CYRILLIC), Chrome (`channel: 'chrome'`, like the quality gate), playwright-core and sharp from the devDependencies.
 *
 * It writes <OUT_DIR or ./art-out>/phone-ru.png (800 x 1594, alpha) and prints the encode command to run. The files that ship are
 * public/landing/hero/phone-ru-{400,800}.avif|webp, encoded with scripts/assets/encode.mjs (`--widths 400,800 --alpha`) and picked
 * by region in index.tsx.
 */
import { createRequire } from 'node:module';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import sharp from 'sharp';
import { STR } from '../../familiar/art/strings.mjs';

const here = new URL('.', import.meta.url).pathname;
const repo = resolve(here, '../../../../../');
const require = createRequire(resolve(repo, 'package.json'));
const { chromium } = require('playwright-core');

const baseFile = resolve(process.env.BASE ?? resolve(repo, 'public/landing/hero/phone-800.webp'));
const media = resolve(repo, 'out/_next/static/media');
const fontFiles = {
  latin: process.env.INTER_LATIN ?? resolve(media, '83afe278b6a6bb3c-s.2bn3s6zvc0dyp.woff2'),
  cyrillic: process.env.INTER_CYRILLIC ?? resolve(media, '9c72aa0f40e4eef8-s.1y4-pdgsjb-pw.woff2'),
};
const outDir = resolve(process.env.OUT_DIR ?? 'art-out');

const browser = await chromium.launch({ channel: 'chrome' });
const page = await browser.newPage({ viewport: { width: 900, height: 1700 }, deviceScaleFactor: 1 });
await page.setContent('<!doctype html><meta charset="utf-8"><body style="margin:0">');
await page.evaluate(
  async ({ latin, cyrillic }) => {
    const ranges = {
      latin: 'U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+2000-206F,U+2074,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD',
      cyrillic: 'U+0301,U+0400-045F,U+0490-0491,U+04B0-04B1,U+2116',
    };
    for (const [key, b64] of Object.entries({ latin, cyrillic })) {
      const bin = Uint8Array.from(atob(b64), (ch) => ch.charCodeAt(0));
      const face = new FontFace('Inter', bin.buffer, { weight: '100 900', unicodeRange: ranges[key] });
      await face.load();
      document.fonts.add(face);
    }
    await document.fonts.ready;
  },
  { latin: readFileSync(fontFiles.latin).toString('base64'), cyrillic: readFileSync(fontFiles.cyrillic).toString('base64') },
);

// Chrome decodes WebP, but the data URL is made from a PNG so the export's alpha and colour come through untouched.
const png = await sharp(baseFile).ensureAlpha().png().toBuffer();
await page.addScriptTag({ path: resolve(here, 'screens.js') });
await page.evaluate((u) => window.loadImages(u), { home: 'data:image/png;base64,' + png.toString('base64') });

mkdirSync(outDir, { recursive: true });
const out = resolve(outDir, 'phone-ru.png');
writeFileSync(out, Buffer.from((await page.evaluate((s) => window.renderHome(s), STR.ru.home)).split(',')[1], 'base64'));
await browser.close();

console.log(out);
console.log(`node scripts/assets/encode.mjs ${out} public/landing/hero phone-ru --widths 400,800 --alpha`);

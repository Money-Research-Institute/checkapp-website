#!/usr/bin/env node
/**
 * Re-makes the four Meet DiDi phone screens, in English and in Russian (docs: the "Device art" note in ../index.tsx).
 *
 *   BASE_DIR=<dir with device-{home,chat,record,scan}-840.webp> node src/components/landing/familiar/art/build.mjs [en|ru]
 *
 * - BASE_DIR holds the Figma-derived device exports the art was made from: `git show 5f373bf:public/landing/familiar/device-<n>-840.webp`
 *   for home, chat, record and scan (the record one is the old video recorder; its round preview is reused as the camera viewfinder).
 * - Fonts: Inter's latin and cyrillic woff2 (the files next/font writes to out/_next/static/media; override with INTER_LATIN /
 *   INTER_CYRILLIC).
 * - Chrome (`channel: 'chrome'`, like the quality gate) and playwright-core and sharp from the repo's devDependencies.
 *
 * It writes <OUT_DIR or ./art-out>/<screen>-<locale>.png (840 x 1711, alpha) and prints the encode commands to run; the files that
 * ship are public/landing/familiar/device-{home,camera,chat,scan}[-ru]-{560,840}.avif|webp, encoded with scripts/assets/encode.mjs
 * (`--widths 560,840 --alpha`).
 */
import { createRequire } from 'node:module';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { STR } from './strings.mjs';

const here = new URL('.', import.meta.url).pathname;
const repo = resolve(here, '../../../../../');
const require = createRequire(resolve(repo, 'package.json'));
const { chromium } = require('playwright-core');

const baseDir = process.env.BASE_DIR;
if (!baseDir) throw new Error('BASE_DIR is required (see the header of this file)');
const media = resolve(repo, 'out/_next/static/media');
const fontFiles = {
  latin: process.env.INTER_LATIN ?? resolve(media, '83afe278b6a6bb3c-s.2bn3s6zvc0dyp.woff2'),
  cyrillic: process.env.INTER_CYRILLIC ?? resolve(media, '9c72aa0f40e4eef8-s.1y4-pdgsjb-pw.woff2'),
};
const outDir = resolve(process.env.OUT_DIR ?? 'art-out');
const locales = process.argv.slice(2).length ? process.argv.slice(2) : ['en', 'ru'];

const browser = await chromium.launch({ channel: 'chrome' });
const page = await browser.newPage({ viewport: { width: 900, height: 1800 }, deviceScaleFactor: 1 });
await page.setContent('<!doctype html><meta charset="utf-8"><body style="margin:0">');
await page.evaluate(
  async ({ latin, cyrillic }) => {
    const ranges = {
      latin: 'U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+2000-206F,U+2074,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD',
      cyrillic: 'U+0301,U+0400-045F,U+0490-0491,U+04B0-04B1,U+2116',
    };
    for (const [key, b64] of Object.entries({ latin, cyrillic })) {
      const bin = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
      const face = new FontFace('Inter', bin.buffer, { weight: '100 900', unicodeRange: ranges[key] });
      await face.load();
      document.fonts.add(face);
    }
    await document.fonts.ready;
  },
  { latin: readFileSync(fontFiles.latin).toString('base64'), cyrillic: readFileSync(fontFiles.cyrillic).toString('base64') },
);

const urls = {};
for (const n of ['home', 'chat', 'record', 'scan']) {
  urls[n] = 'data:image/webp;base64,' + readFileSync(resolve(baseDir, `device-${n}-840.webp`)).toString('base64');
}
await page.addScriptTag({ path: resolve(here, 'screens.js') });
await page.evaluate((u) => window.loadImages(u), urls);

mkdirSync(outDir, { recursive: true });
const save = (name, dataUrl) => writeFileSync(resolve(outDir, `${name}.png`), Buffer.from(dataUrl.split(',')[1], 'base64'));
for (const loc of locales) {
  const S = STR[loc];
  save(`home-${loc}`, await page.evaluate((s) => window.renderHome(s), S.home));
  save(`scan-${loc}`, await page.evaluate((s) => window.renderScan(s), S.scan));
  // The chat first: the camera's blurred ground is the chat.
  save(`chat-${loc}`, await page.evaluate((s) => window.renderChat(s), S.chat));
  save(`camera-${loc}`, await page.evaluate((s) => window.renderRecord(s), S.record));
}
await browser.close();

for (const loc of locales) {
  for (const n of ['home', 'camera', 'chat', 'scan']) {
    const name = `device-${n}${loc === 'ru' ? '-ru' : ''}`;
    console.log(`node scripts/assets/encode.mjs ${resolve(outDir, `${n}-${loc}.png`)} public/landing/familiar ${name} --widths 560,840 --alpha`);
  }
}

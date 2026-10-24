/**
 * Open Graph images, 1200 x 630: public/og-default.png (English pages, DEFAULT_OG_IMAGE in src/lib/constants.ts) and
 * public/og-default-ru.png (the Russian landing page, DEFAULT_OG_IMAGE_RU).
 *
 * The DiDi master icon sits on the right of a dark #07130c canvas. Fonts follow docs/landing.md D4: the
 * wordmark is Bricolage Grotesque, everything else Manrope (shipped as scripts/brand/fonts/*.woff2, Latin and Cyrillic, so
 * this never depends on a build output). The wordmark is "checkapp", lower case, as the client spells it. No health claims
 * are baked in (D1): the claims scan cannot read raster text. The master is only placed and rounded (22.4 % corners), never
 * redrawn or recoloured.
 *
 * The Russian headline is the client's own hero headline, read from src/content/copy/ru.ts (never retyped); the line under
 * it is the first sentence of the client's "Meet DiDi" text. The English lines are ours (DRAFT, as before).
 *
 *   npm run og:generate
 *
 * Rendered with headless Chrome (playwright-core, the same `channel: 'chrome'` `npm run qa` uses).
 */
/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('fs');
const path = require('path');
const { pathToFileURL } = require('url');
const sharp = require('sharp');
const { chromium } = require('playwright-core');

const ROOT = path.join(__dirname, '..');
const MASTER = path.join(ROOT, 'public/brand/source/didi-icon-master.png');
const FONT_DISPLAY = path.join(__dirname, 'brand/fonts/bricolage-grotesque-latin.woff2');
const FONT_LATIN = path.join(__dirname, 'brand/fonts/manrope-latin.woff2');
const FONT_CYRILLIC = path.join(__dirname, 'brand/fonts/manrope-cyrillic.woff2');
const TILE = path.join(ROOT, 'public/brand/tile/didi-tile-96.png');

const WIDTH = 1200;
const HEIGHT = 630;

const LATIN_RANGE =
  'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD';
const CYRILLIC_RANGE = 'U+0301, U+0400-045F, U+0490-0491, U+04B0-04B1, U+2116';

const dataUri = (file, mime) => `data:${mime};base64,${fs.readFileSync(file).toString('base64')}`;
const escapeHtml = (text) => text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** Headline with its last sentence in the accent colour. A one-sentence headline keeps its last word accented. */
function accentLast(text) {
  const sentences = text.split(/(?<=[.!?])\s+/);
  if (sentences.length > 1) {
    const last = sentences.pop();
    return `${escapeHtml(sentences.join(' '))} <em>${escapeHtml(last)}</em>`;
  }
  const words = text.split(' ');
  const last = words.pop();
  return `${escapeHtml(words.join(' '))} <em>${escapeHtml(last)}</em>`;
}

async function variants() {
  const { ru } = await import(pathToFileURL(path.join(ROOT, 'src/content/copy/ru.ts')).href);
  return [
    {
      file: 'public/og-default.png',
      headline: 'Your daily wellness <em>companion.</em>', // DRAFT
      line: 'Meet DiDi: a small daily check-in, explained in plain language.', // DRAFT
      size: 72,
    },
    {
      file: 'public/og-default-ru.png',
      headline: accentLast(ru.hero.headline),
      line: escapeHtml(ru.meetDidi.text.split(/(?<=[.!?])\s+/)[0]),
      size: 50,
    },
  ];
}

const page = ({ headline, line, size }) => `<!doctype html>
<html><head><meta charset="utf-8"><style>
@font-face { font-family: 'Bricolage Grotesque'; font-weight: 200 800; src: url(${dataUri(FONT_DISPLAY, 'font/woff2')}) format('woff2'); }
@font-face { font-family: 'Manrope'; font-weight: 200 800; unicode-range: ${LATIN_RANGE}; src: url(${dataUri(FONT_LATIN, 'font/woff2')}) format('woff2'); }
@font-face { font-family: 'Manrope'; font-weight: 200 800; unicode-range: ${CYRILLIC_RANGE}; src: url(${dataUri(FONT_CYRILLIC, 'font/woff2')}) format('woff2'); }
* { box-sizing: border-box; margin: 0; padding: 0; }
html, body { width: ${WIDTH}px; height: ${HEIGHT}px; overflow: hidden; background: #07130c; }
body {
  position: relative;
  color: #f6f8f0;
  font-family: 'Manrope', system-ui, sans-serif;
  background:
    radial-gradient(520px 420px at 80% 52%, rgba(96, 160, 70, 0.34), rgba(96, 160, 70, 0) 70%),
    radial-gradient(640px 360px at 6% 104%, rgba(39, 98, 33, 0.45), rgba(39, 98, 33, 0) 70%),
    #07130c;
}
.left { position: absolute; left: 72px; top: 0; bottom: 0; width: 590px; display: flex; flex-direction: column; justify-content: center; }
.brand { display: flex; align-items: center; gap: 14px; margin-bottom: 44px; }
.brand img { width: 48px; height: 48px; display: block; }
.brand span { font-family: 'Bricolage Grotesque', sans-serif; font-weight: 700; font-size: 32px; letter-spacing: -0.02em; }
h1 { font-family: 'Manrope', sans-serif; font-weight: 700; font-size: ${size}px; line-height: 1.06; letter-spacing: -0.04em; }
h1 em { font-style: normal; color: #9ccf6a; }
p { margin-top: 28px; font-size: 27px; line-height: 1.4; font-weight: 500; color: #d9e4cc; max-width: 540px; }
.url { margin-top: 40px; font-size: 22px; font-weight: 700; letter-spacing: 0.02em; color: #9ccf6a; }
.mascot { position: absolute; right: 72px; top: 95px; width: 440px; height: 440px; border-radius: 22.4%; overflow: hidden;
  box-shadow: 0 0 0 1px rgba(246, 248, 240, 0.10), 0 30px 80px rgba(0, 0, 0, 0.55); }
.mascot img { width: 100%; height: 100%; display: block; }
</style></head><body>
<div class="left">
  <div class="brand"><img src="${dataUri(TILE, 'image/png')}" alt=""><span>checkapp</span></div>
  <h1>${headline}</h1>
  <p>${line}</p>
  <div class="url">checkapp.today</div>
</div>
<div class="mascot"><img src="${dataUri(MASTER, 'image/png')}" alt=""></div>
</body></html>`;

(async () => {
  const items = await variants();
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  try {
    for (const item of items) {
      const tab = await browser.newPage({ viewport: { width: WIDTH, height: HEIGHT }, deviceScaleFactor: 1 });
      await tab.setContent(page(item), { waitUntil: 'load' });
      await tab.evaluate(() => document.fonts.ready);
      const shot = await tab.screenshot({ type: 'png', clip: { x: 0, y: 0, width: WIDTH, height: HEIGHT } });
      await tab.close();
      const png = await sharp(shot).png({ compressionLevel: 9, effort: 10 }).toBuffer();
      const meta = await sharp(png).metadata();
      if (meta.width !== WIDTH || meta.height !== HEIGHT) throw new Error(`${item.file} is ${meta.width}x${meta.height}, want ${WIDTH}x${HEIGHT}`);
      fs.writeFileSync(path.join(ROOT, item.file), png);
      console.log(`Generated ${item.file} (${meta.width}x${meta.height}, ${(png.length / 1024).toFixed(0)} KB)`);
    }
  } finally {
    await browser.close();
  }
})().catch((e) => {
  console.error(e);
  process.exit(1);
});

/**
 * Open Graph images, 1200 x 630: public/og-default.png (English pages, DEFAULT_OG_IMAGE in src/lib/constants.ts) and
 * public/og-default-ru.png (the Russian landing page, DEFAULT_OG_IMAGE_RU).
 *
 * "Sunrise": DiDi, arms up, in front of a warm sun and its rays, on a green hill under a deep-green sky. The pose is
 * the app's own `happy` pose (scripts/brand/art/didi-happy.webp, a transparent cut-out), placed and never redrawn.
 * Fonts follow docs/landing.md D4: the wordmark is Bricolage Grotesque, everything else Manrope (shipped as
 * scripts/brand/fonts/*.woff2, Latin and Cyrillic, so this never depends on a build output). The wordmark is "checkapp",
 * lower case, as the client spells it. No health claims are baked in (D1): the claims scan cannot read raster text.
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
const POSE = path.join(__dirname, 'brand/art/didi-happy.webp');
const FONT_DISPLAY = path.join(__dirname, 'brand/fonts/bricolage-grotesque-latin.woff2');
const FONT_LATIN = path.join(__dirname, 'brand/fonts/manrope-latin.woff2');
const FONT_CYRILLIC = path.join(__dirname, 'brand/fonts/manrope-cyrillic.woff2');
const TILE = path.join(ROOT, 'public/brand/tile/didi-tile-128.png');

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
      size: 84,
    },
    {
      file: 'public/og-default-ru.png',
      headline: accentLast(ru.hero.headline),
      line: escapeHtml(ru.meetDidi.text.split(/(?<=[.!?])\s+/)[0]),
      size: 54,
    },
  ];
}

/** A four-point sparkle; `id` keeps each gradient separate. */
const sparkle = (id, x, y, size, opacity = 1, rotate = 0) =>
  `<svg style="position:absolute;left:${x}px;top:${y}px;width:${size}px;height:${size}px;opacity:${opacity};transform:rotate(${rotate}deg);filter:drop-shadow(0 0 ${size / 3}px rgba(255,214,90,.75))" viewBox="-1 -1 2 2"><defs><linearGradient id="s${id}" x1="0" y1="-1" x2="0" y2="1"><stop offset="0" stop-color="#fff7c9"/><stop offset="1" stop-color="#ffc83a"/></linearGradient></defs><path d="M0,-1 C0.1,-0.28 0.28,-0.1 1,0 C0.28,0.1 0.1,0.28 0,1 C-0.1,0.28 -0.28,0.1 -1,0 C-0.28,-0.1 -0.1,-0.28 0,-1Z" fill="url(#s${id})"/></svg>`;

const page = ({ headline, line, size }) => `<!doctype html>
<html><head><meta charset="utf-8"><style>
@font-face { font-family: 'Bricolage Grotesque'; font-weight: 200 800; src: url(${dataUri(FONT_DISPLAY, 'font/woff2')}) format('woff2'); }
@font-face { font-family: 'Manrope'; font-weight: 200 800; unicode-range: ${LATIN_RANGE}; src: url(${dataUri(FONT_LATIN, 'font/woff2')}) format('woff2'); }
@font-face { font-family: 'Manrope'; font-weight: 200 800; unicode-range: ${CYRILLIC_RANGE}; src: url(${dataUri(FONT_CYRILLIC, 'font/woff2')}) format('woff2'); }
* { box-sizing: border-box; margin: 0; padding: 0; }
html, body { width: ${WIDTH}px; height: ${HEIGHT}px; overflow: hidden; }
body { position: relative; color: #fff; font-family: 'Manrope', system-ui, sans-serif; background: linear-gradient(165deg, #0a2412 0%, #14451f 42%, #3f8a3a 82%, #7cbf55 100%); }
.abs { position: absolute; }
.rays { left: 340px; top: -290px; width: 1240px; height: 1240px; border-radius: 50%;
  background: repeating-conic-gradient(from 0deg at 50% 50%, rgba(255, 244, 190, .10) 0deg 6deg, rgba(255, 244, 190, 0) 6deg 18deg);
  -webkit-mask-image: radial-gradient(circle, #000 18%, transparent 62%); mask-image: radial-gradient(circle, #000 18%, transparent 62%); }
.sun { left: 640px; top: -10px; width: 640px; height: 640px; border-radius: 50%;
  background: radial-gradient(circle, #fff3b0 0%, #ffe27a 28%, rgba(255, 214, 90, .55) 46%, rgba(255, 214, 90, 0) 70%); }
.hill { left: -200px; top: 520px; width: 1700px; height: 500px; border-radius: 50%;
  background: radial-gradient(ellipse at 50% 0%, #9bd66a, #4f9a3c 55%, #2f6f2e); }
.mascot { left: 650px; top: 18px; height: 610px; filter: drop-shadow(0 26px 32px rgba(10, 40, 10, .5)); }
.left { left: 76px; top: 0; bottom: 0; width: 560px; display: flex; flex-direction: column; justify-content: center; }
.brand { display: flex; align-items: center; gap: 14px; }
.brand img { width: 50px; height: 50px; border-radius: 13px; display: block; }
.brand span { font-family: 'Bricolage Grotesque', sans-serif; font-weight: 700; font-size: 34px; letter-spacing: -0.02em; }
h1 { font-family: 'Manrope', sans-serif; font-weight: 800; font-size: ${size}px; line-height: 1.02; letter-spacing: -0.045em; margin-top: 46px; text-shadow: 0 4px 30px rgba(0, 40, 0, .35); }
h1 em { font-style: normal; color: #ffe27a; }
p { margin-top: 26px; font-size: 28px; line-height: 1.4; font-weight: 500; color: #e6f3da; max-width: 500px; }
.url { margin-top: 38px; display: inline-flex; width: max-content; padding: 12px 22px; border-radius: 999px; background: #fff; color: #14451f; font-weight: 700; font-size: 21px; letter-spacing: .01em; }
</style></head><body>
<div class="abs rays"></div><div class="abs sun"></div><div class="abs hill"></div>
${sparkle(1, 1080, 56, 56, 1, 8)}${sparkle(2, 650, 120, 30, 0.95)}${sparkle(3, 1130, 340, 28, 0.9)}${sparkle(4, 700, 480, 26, 0.85)}
<img class="abs mascot" src="${dataUri(POSE, 'image/webp')}" alt="">
<div class="abs left">
  <div class="brand"><img src="${dataUri(TILE, 'image/png')}" alt=""><span>checkapp</span></div>
  <h1>${headline}</h1>
  <p>${line}</p>
  <div class="url">checkapp.today</div>
</div>
</body></html>`;

(async () => {
  const items = await variants();
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  try {
    for (const item of items) {
      const tab = await browser.newPage({ viewport: { width: WIDTH, height: HEIGHT }, deviceScaleFactor: 2 });
      await tab.setContent(page(item), { waitUntil: 'load' });
      await tab.evaluate(() => document.fonts.ready);
      // Rendered at 2x and scaled down: Chrome dithers the big gradients, and at 1x that shows as a faint patch on the hill.
      const shot = await tab.screenshot({ type: 'png', clip: { x: 0, y: 0, width: WIDTH, height: HEIGHT } });
      await tab.close();
      const png = await sharp(shot).resize(WIDTH, HEIGHT).png({ compressionLevel: 9, effort: 10 }).toBuffer();
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

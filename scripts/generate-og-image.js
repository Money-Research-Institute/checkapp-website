/**
 * Open Graph image, 1200 x 630, written to public/og-default.png (DEFAULT_OG_IMAGE in src/lib/constants.ts).
 *
 * The DiDi master icon sits on the right of a dark #07130c canvas; the headline sits on the left in
 * Bricolage Grotesque (the site's display font, shipped as scripts/brand/fonts/*.woff2 so this never depends on a
 * build output). The master is only placed and rounded (22.4 % corners), never redrawn or recoloured.
 *
 *   npm run og:generate
 *
 * Rendered with headless Chrome (playwright-core, the same `channel: 'chrome'` the QA gate uses).
 */
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const { chromium } = require('playwright-core');

const ROOT = path.join(__dirname, '..');
const OUTPUT_PATH = path.join(ROOT, 'public/og-default.png');
const MASTER = path.join(ROOT, 'public/brand/source/didi-icon-master.png');
const FONT_DISPLAY = path.join(__dirname, 'brand/fonts/bricolage-grotesque-latin.woff2');
const FONT_BODY = path.join(__dirname, 'brand/fonts/dm-sans-latin.woff2');
const TILE = path.join(ROOT, 'public/brand/tile/didi-tile-96.png');

const WIDTH = 1200;
const HEIGHT = 630;

const dataUri = (file, mime) => `data:${mime};base64,${fs.readFileSync(file).toString('base64')}`;

const html = `<!doctype html>
<html><head><meta charset="utf-8"><style>
@font-face { font-family: 'Bricolage Grotesque'; font-weight: 200 800; src: url(${dataUri(FONT_DISPLAY, 'font/woff2')}) format('woff2'); }
@font-face { font-family: 'DM Sans'; font-weight: 100 1000; src: url(${dataUri(FONT_BODY, 'font/woff2')}) format('woff2'); }
* { box-sizing: border-box; margin: 0; padding: 0; }
html, body { width: ${WIDTH}px; height: ${HEIGHT}px; overflow: hidden; background: #07130c; }
body {
  position: relative;
  color: #f6f8f0;
  font-family: 'DM Sans', system-ui, sans-serif;
  background:
    radial-gradient(520px 420px at 80% 52%, rgba(96, 160, 70, 0.34), rgba(96, 160, 70, 0) 70%),
    radial-gradient(640px 360px at 6% 104%, rgba(39, 98, 33, 0.45), rgba(39, 98, 33, 0) 70%),
    #07130c;
}
.left { position: absolute; left: 72px; top: 0; bottom: 0; width: 600px; display: flex; flex-direction: column; justify-content: center; }
.brand { display: flex; align-items: center; gap: 14px; margin-bottom: 44px; }
.brand img { width: 48px; height: 48px; display: block; }
.brand span { font-family: 'Bricolage Grotesque', sans-serif; font-weight: 700; font-size: 32px; letter-spacing: -0.02em; }
h1 { font-family: 'Bricolage Grotesque', sans-serif; font-weight: 700; font-size: 84px; line-height: 0.98; letter-spacing: -0.035em; }
h1 em { font-style: normal; color: #9ccf6a; }
p { margin-top: 30px; font-size: 28px; line-height: 1.35; font-weight: 500; color: #d9e4cc; max-width: 520px; }
.url { margin-top: 40px; font-size: 22px; font-weight: 700; letter-spacing: 0.02em; color: #9ccf6a; }
.mascot { position: absolute; right: 72px; top: 95px; width: 440px; height: 440px; border-radius: 22.4%; overflow: hidden;
  box-shadow: 0 0 0 1px rgba(246, 248, 240, 0.10), 0 30px 80px rgba(0, 0, 0, 0.55); }
.mascot img { width: 100%; height: 100%; display: block; }
</style></head><body>
<div class="left">
  <div class="brand"><img src="${dataUri(TILE, 'image/png')}" alt=""><span>CheckApp</span></div>
  <h1>Your AI health <em>companion.</em></h1>
  <p>Meet DIDI: daily check-ins, tongue scans and healthy habits.</p>
  <div class="url">checkapp.today</div>
</div>
<div class="mascot"><img src="${dataUri(MASTER, 'image/png')}" alt=""></div>
</body></html>`;

(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: WIDTH, height: HEIGHT }, deviceScaleFactor: 1 });
    await page.setContent(html, { waitUntil: 'load' });
    await page.evaluate(() => document.fonts.ready);
    const shot = await page.screenshot({ type: 'png', clip: { x: 0, y: 0, width: WIDTH, height: HEIGHT } });
    const png = await sharp(shot).png({ compressionLevel: 9, effort: 10 }).toBuffer();
    const meta = await sharp(png).metadata();
    if (meta.width !== WIDTH || meta.height !== HEIGHT) throw new Error(`OG image is ${meta.width}x${meta.height}, want ${WIDTH}x${HEIGHT}`);
    fs.writeFileSync(OUTPUT_PATH, png);
    console.log(`Generated ${path.relative(ROOT, OUTPUT_PATH)} (${meta.width}x${meta.height}, ${(png.length / 1024).toFixed(0)} KB)`);
  } finally {
    await browser.close();
  }
})().catch((e) => {
  console.error(e);
  process.exit(1);
});

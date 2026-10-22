/**
 * Check every asset the kit promises: it exists, and sharp reads back the exact pixel size.
 *   node scripts/brand/verify-brand-kit.mjs
 * Exits 1 on any mismatch.
 */
import sharp from 'sharp';
import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { FORMATS, BARE_SIZES, LIFTED_SIZES, HAIRLINE_SIZES, liftedCanvas, FULL_BLEED, FAVICON } from './kit.mjs';
import { readIcoDirectory } from './write-ico.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '../..');
const expected = []; // {file, w, h, format}

for (const n of BARE_SIZES) for (const f of FORMATS) expected.push({ file: `public/brand/tile/didi-tile-${n}.${f}`, w: n, h: n, format: f });
for (const n of LIFTED_SIZES) for (const f of FORMATS) expected.push({ file: `public/brand/tile/didi-tile-lifted-${n}.${f}`, w: liftedCanvas(n), h: liftedCanvas(n), format: f });
for (const n of HAIRLINE_SIZES) for (const f of FORMATS) expected.push({ file: `public/brand/tile/didi-tile-hairline-${n}.${f}`, w: n, h: n, format: f });
for (const f of FULL_BLEED) expected.push({ file: f.file, w: f.size, h: f.size, format: 'png' });
for (const f of FAVICON) expected.push({ file: `public/brand/icons/favicon-${f.canvas}.png`, w: f.canvas, h: f.canvas, format: 'png' });
expected.push({ file: 'public/og-default.png', w: 1200, h: 630, format: 'png' });

const sharpFormat = { avif: 'heif', webp: 'webp', png: 'png' };
let bad = 0;
for (const e of expected) {
  try {
    const m = await sharp(join(ROOT, e.file)).metadata();
    const ok = m.width === e.w && m.height === e.h && m.format === sharpFormat[e.format];
    if (!ok) { bad++; console.error(`FAIL ${e.file}: ${m.width}x${m.height} ${m.format}, want ${e.w}x${e.h} ${e.format}`); }
  } catch (err) {
    bad++;
    console.error(`FAIL ${e.file}: ${err.message}`);
  }
}

const ico = readIcoDirectory(await readFile(join(ROOT, 'src/app/favicon.ico')));
const icoWant = FAVICON.map((f) => f.canvas).join(',');
const icoGot = ico.map((e) => `${e.w}`).join(',');
if (icoGot !== icoWant || ico.some((e) => e.w !== e.h)) { bad++; console.error(`FAIL src/app/favicon.ico: entries ${icoGot}, want ${icoWant}`); }
for (const e of ico) {
  const buf = (await readFile(join(ROOT, 'src/app/favicon.ico'))).subarray(e.offset, e.offset + e.bytes);
  const m = await sharp(buf).metadata();
  if (m.width !== e.w || m.height !== e.h) { bad++; console.error(`FAIL favicon.ico entry ${e.w}: payload is ${m.width}x${m.height}`); }
}

console.log(`${expected.length + 1 + ico.length} checks, ${bad} failed`);
process.exit(bad ? 1 : 0);

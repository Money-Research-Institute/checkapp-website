/**
 * Derive every production brand asset from the master art. Nothing here redraws or recolours the logo:
 * the tiles come from make-tile.mjs (the owner-approved geometry), the full-bleed squares are the master
 * scaled and placed, and the only thing added is cream background copied from the master's own edge.
 *
 *   node scripts/brand/build-brand-kit.mjs
 *
 * Output (see docs/brand.md for what each file is for):
 *   public/brand/tile/didi-tile-{N}.{avif,webp,png}            bare rounded tile (LogoMark adds the shadow in CSS)
 *   public/brand/tile/didi-tile-lifted-{N}.{avif,webp,png}      rounded tile with the soft shadow baked in
 *   public/brand/tile/didi-tile-hairline-{N}.{avif,webp,png}    rounded tile with a 1 px hairline, for 16-28 px marks
 *   public/brand/icons/{icon-180,icon-192,icon-512,maskable-512,favicon-16,favicon-32,favicon-48}.png
 *   src/app/{icon.png,apple-icon.png,favicon.ico}
 */
import sharp from 'sharp';
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { makeTile, MASTER } from './make-tile.mjs';
import { buildIco } from './write-ico.mjs';
import { BARE_SIZES, LIFTED_SIZES, HAIRLINE_SIZES, FULL_BLEED, FAVICON, MASKABLE_CENTER } from './kit.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '../..');
const out = (p) => join(ROOT, p);
const written = [];

async function put(path, buf) {
  await mkdir(dirname(out(path)), { recursive: true });
  await writeFile(out(path), buf);
  written.push(path);
}

/** One tile buffer (PNG from makeTile) -> AVIF + WebP + PNG next to each other. */
async function putTile(base, png) {
  await put(`${base}.png`, await sharp(png).png({ compressionLevel: 9, effort: 10 }).toBuffer());
  await put(`${base}.webp`, await sharp(png).webp({ quality: 92, alphaQuality: 100, effort: 6, smartSubsample: false }).toBuffer());
  await put(`${base}.avif`, await sharp(png).avif({ quality: 70, effort: 6, chromaSubsampling: '4:4:4' }).toBuffer());
}

/**
 * Master scaled to `scale` of the canvas and placed bottom-anchored (the shoulders already bleed off the master's
 * bottom edge), with the gap filled by copying the master's own edge pixels (flat cream). Maskable: the character is
 * instead centred on the minimal circle around sprout, hood and chin, so it all sits in the 40 % radius safe zone.
 */
async function fullBleed(size, scale, maskable) {
  const inner = Math.round(size * scale);
  let left, top;
  if (maskable) {
    left = Math.round(size / 2 - MASKABLE_CENTER[0] * (inner / 1024));
    top = Math.round(size / 2 - MASKABLE_CENTER[1] * (inner / 1024));
  } else {
    left = Math.round((size - inner) / 2);
    top = size - inner;
  }
  const scaled = await sharp(MASTER).resize(inner, inner, { kernel: 'lanczos3' }).toBuffer();
  const extended = await sharp(scaled)
    .extend({ top: Math.max(top, 0), left: Math.max(left, 0), right: Math.max(size - inner - left, 0), bottom: Math.max(size - inner - top, 0), extendWith: 'copy' })
    .png()
    .toBuffer();
  // a separate pass: sharp runs extract before extend inside one pipeline
  return sharp(extended).extract({ left: 0, top: 0, width: size, height: size }).png({ compressionLevel: 9, effort: 10 }).toBuffer();
}

// 1. tiles
for (const n of BARE_SIZES) await putTile(`public/brand/tile/didi-tile-${n}`, await makeTile(n, { bare: true }));
for (const n of LIFTED_SIZES) await putTile(`public/brand/tile/didi-tile-lifted-${n}`, await makeTile(n, { shadow: true }));
for (const n of HAIRLINE_SIZES) await putTile(`public/brand/tile/didi-tile-hairline-${n}`, await makeTile(n, { shadow: false }));

// 2. full-bleed squares
for (const f of FULL_BLEED) await put(f.file, await fullBleed(f.size, f.scale, !!f.maskable));

// 3. favicons (tiles, transparent corners) and the ICO
const favicons = [];
for (const f of FAVICON) {
  let buf = await makeTile(f.tile, { shadow: f.shadow });
  if (f.canvas === 16) {
    // 16 px is the one size where the default light sharpen is not enough to keep the eyes and smile apart.
    buf = await sharp(buf).sharpen({ sigma: 0.7, m1: 0.6, m2: 1.6 }).png({ compressionLevel: 9 }).toBuffer();
  }
  const m = await sharp(buf).metadata();
  if (m.width !== f.canvas || m.height !== f.canvas) throw new Error(`favicon ${f.canvas}: canvas is ${m.width}x${m.height}`);
  await put(`public/brand/icons/favicon-${f.canvas}.png`, buf);
  favicons.push(buf);
}
await put('src/app/favicon.ico', buildIco(favicons));

// 4. The web manifest is src/app/manifest.ts (it needs the GITHUB_PAGES_BASE_PATH-aware icon URLs); it points at the icons above.

console.log(`wrote ${written.length} files`);

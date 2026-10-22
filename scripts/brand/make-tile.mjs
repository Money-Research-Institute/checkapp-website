/**
 * The DiDi logo tile, with the light-surface treatment (docs/landing-decisions.md D7).
 *
 * The master is cream, which disappears on white pages, so the tile always carries a thin deep-green rim
 * (drawn inside the rounded edge) and, from 32 px up, a soft shadow on a padded transparent canvas.
 *
 *   node scripts/brand/make-tile.mjs 64 out.png          rimmed tile + shadow (>= 32 px)
 *   node scripts/brand/make-tile.mjs 16 out.png          rimmed tile, no shadow
 *   node scripts/brand/make-tile.mjs 512 out.png --bare  rounded tile only (no rim, no shadow)
 *
 * Import `makeTile` from other scripts. Verified by eye on #fff, #f1f3f5, a light tab and #07130c.
 */
import sharp from 'sharp';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const HERE = dirname(fileURLToPath(import.meta.url));
export const MASTER = join(HERE, '../../public/brand/source/didi-icon-master.png');

export const RIM_COLOR = '#3E7D36';
export const RIM = 0.03; // of the side, never less than 1 px
export const RADIUS = 0.224; // of the side
export const SHADOW_FROM = 32; // px: below this the blur is noise

const svg = (w, h, body) => Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">${body}</svg>`);

/** @returns {Promise<Buffer>} PNG with transparent corners (and a padded canvas when a shadow is drawn) */
export async function makeTile(size, { bare = false, shadow = size >= SHADOW_FROM, master = MASTER } = {}) {
  const r = Math.round(size * RADIUS);
  const base = await sharp(master)
    .resize(size, size, { kernel: 'lanczos3' })
    .composite([{ input: svg(size, size, `<rect width="${size}" height="${size}" rx="${r}" fill="#fff"/>`), blend: 'dest-in' }])
    .sharpen(size <= 64 ? { sigma: 0.6 } : undefined)
    .png()
    .toBuffer();
  if (bare) return base;

  const pad = shadow ? Math.round(size * 0.12) : 0;
  const full = size + pad * 2;
  const layers = [];
  if (shadow) {
    const blob = svg(full, full, `<rect x="${pad}" y="${pad + size * 0.03}" width="${size}" height="${size}" rx="${r}" fill="rgba(20,50,20,0.38)"/>`);
    layers.push({ input: await sharp(blob).blur(Math.max(0.8, size * 0.03)).png().toBuffer(), left: 0, top: 0 });
  }
  layers.push({ input: base, left: pad, top: pad });
  const bw = Math.max(1, size * RIM);
  layers.push({
    input: svg(size, size, `<rect x="${bw / 2}" y="${bw / 2}" width="${size - bw}" height="${size - bw}" rx="${r - bw / 2}" fill="none" stroke="${RIM_COLOR}" stroke-width="${bw}"/>`),
    left: pad,
    top: pad,
  });
  return sharp({ create: { width: full, height: full, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } }).composite(layers).png().toBuffer();
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const [size, out, flag] = process.argv.slice(2);
  if (!size || !out) { console.error('usage: make-tile.mjs <size> <out.png> [--bare]'); process.exit(2); }
  const buf = await makeTile(Number(size), { bare: flag === '--bare' });
  await sharp(buf).toFile(out);
  const m = await sharp(buf).metadata();
  console.log(`${out}: ${m.width}x${m.height}`);
}

#!/usr/bin/env node
/**
 * The shared dither tile: public/landing/_shared/noise-128.png.
 *
 * 128 x 128, white with a random alpha (triangular distribution, 16 levels spanning 0..112), seeded so the file is
 * reproducible. 16 alpha levels let it be a lossless 4-bit palette PNG (~8 KB instead of ~19).
 * Laid over a near-black gradient at `opacity: var(--dither-a, .04)` (see .fx-dither in src/styles/fx.css) it adds
 * about 0-1.7 levels of noise, enough to break 8-bit banding without lifting the blacks. It must stay lossless:
 * AVIF/WebP smooth baked-in noise away. Only a lossless PNG pass is applied.
 *
 *   node scripts/assets/make-noise.mjs
 */
import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '../..');
const SIZE = 128;
const MAX_ALPHA = 112;
const LEVELS = 15; // 16 alpha values

// mulberry32: tiny, seeded, good enough for noise.
function rng(seed) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rand = rng(0x5eed1e55);
const px = Buffer.alloc(SIZE * SIZE * 4);
for (let i = 0; i < SIZE * SIZE; i++) {
  const triangular = (rand() + rand()) / 2; // TPDF: no visible pattern, smooth tails
  px[i * 4] = px[i * 4 + 1] = px[i * 4 + 2] = 255;
  px[i * 4 + 3] = Math.round((Math.round(triangular * LEVELS) / LEVELS) * MAX_ALPHA);
}

const out = join(ROOT, 'public/landing/_shared/noise-128.png');
await mkdir(dirname(out), { recursive: true });
await sharp(px, { raw: { width: SIZE, height: SIZE, channels: 4 } })
  .png({ compressionLevel: 9, palette: true, colours: 16, quality: 100, dither: 0 })
  .toFile(out);
console.log(`wrote ${out}`);

#!/usr/bin/env node
/**
 * Takes the baked signal trace out of the "usual way" render.
 *
 * The scene's left-hand glass card (a face with scan corner brackets) came with a chart panel under the portrait: a heartbeat-style
 * line over an area fill, a left axis and faint grid lines. That reads as a vital-sign reading taken from the face, and the page says
 * the opposite (docs/landing-copy.md, "What the app can honestly claim": photo scans on request, a short wellness insight back, no
 * monitoring, no trends). It is a raster, so the gate's claim scanner cannot see it; the fix is in the pixels.
 *
 * What this does: paints the whole chart panel out of the card, so the card is the face crop in its brackets above a plain pane of glass.
 *   1. The hole is a quad (HOLE, in the 1448 x 1086 frame) that covers the panel plate, the trace, the axis and the grid with a few px of margin
 *      and stays clear of the portrait's bottom edge, the two bracket corners and the card's own rim. Its bottom edge is parallel to the card's.
 *   2. It is filled by solving Laplace's equation inside the hole with the pixels just outside as the boundary (successive over-relaxation),
 *      which continues the glass's own gradient, dark at the left and lit by the phone's glow on the right, with no brush strokes.
 *   3. A seeded grain at the picture's own noise level goes on top so the patch does not read as smoother than its surroundings.
 *   The portrait, the brackets, the rim and every pixel outside the hole are untouched.
 *
 * Two ways to use it:
 *   - build.mjs calls removeTrace() on the master before it puts the screen in, so the pipeline from the master always ends trace-free.
 *   - From the shipped picture, when the master is not to hand (it is not committed, see build.mjs):
 *       node src/components/landing/usual-way/art/remove-trace.mjs <render.png|webp|avif, 1448 x 1086> [en|ru] [OUT_DIR=./art-out]
 *     It writes render[-ru].png and render-square[-ru].png and prints the encode commands, exactly like build.mjs. Decode the shipped
 *     usual-way-render[-ru]-1448.webp (quality 85, near lossless for this) as the input. Idempotent: on a picture with no trace it only
 *     re-smooths plain glass.
 *
 * The decision that the phone's own screen (the "Looks stable" chip, the Moisture / Surface Texture rows) stays is not made here;
 * see the header of ../index.tsx.
 */
import { mkdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const W = 1448;
const H = 1086;

/** The chart panel plus margin, clockwise from the top left, in the 1448 x 1086 frame. */
export const HOLE = [
  [194, 487],
  [393, 511],
  [393, 579],
  [194, 556],
];

/** Std-dev of the grain laid over the fill (the picture's own noise is about this on the glass; checked by eye at 3x and with gamma 2.2). */
const GRAIN = 0.8;
const ITERATIONS = 3000;
const OMEGA = 1.92;

function inside(x, y, poly) {
  let c = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i];
    const [xj, yj] = poly[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) c = !c;
  }
  return c;
}

/**
 * Fills HOLE in `rgb` (Float32Array, W * H * 3, 0..255) in place and returns it.
 * Deterministic: the grain comes from a fixed-seed generator, so the same input always gives the same output.
 */
export function removeTrace(rgb, w = W, h = H) {
  if (w !== W || h !== H) throw new Error(`removeTrace needs a ${W} x ${H} frame, got ${w} x ${h}`);
  const xs = HOLE.map((p) => p[0]);
  const ys = HOLE.map((p) => p[1]);
  const x0 = Math.min(...xs) - 2;
  const y0 = Math.min(...ys) - 2;
  const bw = Math.max(...xs) + 2 - x0 + 1;
  const bh = Math.max(...ys) + 2 - y0 + 1;

  const hole = new Uint8Array(bw * bh);
  const sub = new Float32Array(bw * bh * 3);
  for (let y = 0; y < bh; y++)
    for (let x = 0; x < bw; x++) {
      hole[y * bw + x] = inside(x + x0 + 0.5, y + y0 + 0.5, HOLE) ? 1 : 0;
      for (let c = 0; c < 3; c++) sub[(y * bw + x) * 3 + c] = rgb[((y + y0) * w + x + x0) * 3 + c];
    }

  const stride = bw * 3;
  for (let it = 0; it < ITERATIONS; it++)
    for (let y = 1; y < bh - 1; y++)
      for (let x = 1; x < bw - 1; x++) {
        if (!hole[y * bw + x]) continue;
        for (let c = 0; c < 3; c++) {
          const i = (y * bw + x) * 3 + c;
          const avg = (sub[i - 3] + sub[i + 3] + sub[i - stride] + sub[i + stride]) / 4;
          sub[i] += OMEGA * (avg - sub[i]);
        }
      }

  let seed = 12345;
  const rnd = () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 4294967296;
  };
  const gauss = () => {
    let u = 0;
    for (let k = 0; k < 6; k++) u += rnd();
    return (u - 3) * Math.SQRT2; // sum of six uniforms: mean 3, variance 1/2
  };
  for (let y = 0; y < bh; y++)
    for (let x = 0; x < bw; x++) {
      if (!hole[y * bw + x]) continue;
      const n = gauss() * GRAIN;
      for (let c = 0; c < 3; c++) rgb[((y + y0) * w + x + x0) * 3 + c] = Math.min(255, Math.max(0, sub[(y * bw + x) * 3 + c] + n));
    }
  return rgb;
}

// ---- CLI -------------------------------------------------------------------------------------------------------------------------
if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  const { default: sharp } = await import('sharp');
  const [input, locale = 'en'] = process.argv.slice(2);
  if (!input || !['en', 'ru'].includes(locale)) {
    console.error('usage: node remove-trace.mjs <1448x1086 render> [en|ru]   (OUT_DIR env, default ./art-out)');
    process.exit(1);
  }
  const here = new URL('.', import.meta.url).pathname;
  const { squareX } = JSON.parse(readFileSync(resolve(here, 'screen-fit.json'), 'utf8'));
  const outDir = resolve(process.env.OUT_DIR ?? 'art-out');
  mkdirSync(outDir, { recursive: true });

  const { data, info } = await sharp(resolve(input)).flatten({ background: '#000000' }).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  if (info.width !== W || info.height !== H) throw new Error(`input must be ${W} x ${H}, got ${info.width} x ${info.height}`);
  const rgb = Float32Array.from(data);
  removeTrace(rgb);

  const to8 = (src) => {
    const buf = Buffer.alloc(src.length);
    for (let i = 0; i < src.length; i++) buf[i] = Math.min(255, Math.max(0, Math.round(src[i])));
    return buf;
  };
  const suffix = locale === 'ru' ? '-ru' : '';
  await sharp(to8(rgb), { raw: { width: W, height: H, channels: 3 } }).png().toFile(resolve(outDir, `render${suffix}.png`));
  // The phone crop for phones narrower than 480px: a 1086 x 1086 window of the same scene (build.mjs does the same).
  const sq = new Float32Array(H * H * 3);
  for (let y = 0; y < H; y++) for (let x = 0; x < H; x++) for (let c = 0; c < 3; c++) sq[(y * H + x) * 3 + c] = rgb[(y * W + x + squareX) * 3 + c];
  await sharp(to8(sq), { raw: { width: H, height: H, channels: 3 } }).png().toFile(resolve(outDir, `render-square${suffix}.png`));
  console.log(`node scripts/assets/encode.mjs ${resolve(outDir, `render${suffix}.png`)} public/landing/usual-way usual-way-render${suffix} --widths 640,960,1448`);
  console.log(`node scripts/assets/encode.mjs ${resolve(outDir, `render-square${suffix}.png`)} public/landing/usual-way usual-way-render-square${suffix} --widths 540,1086`);
}

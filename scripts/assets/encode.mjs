#!/usr/bin/env node
/**
 * Offline image encoder for the landing pages. Raw Figma exports are fetched into a scratch folder and never
 * committed; what this writes is what ships under public/landing/<slug>/ (or public/pages/<name>/).
 *
 *   node scripts/assets/encode.mjs <src> <outDir> <name> [--widths 640,1080,1472] [--alpha]
 *                                  [--avif-bits 10] [--avif-q 60] [--webp-q 85] [--effort 5] [--444]
 *
 * Writes <outDir>/<name>-<w>.avif and <outDir>/<name>-<w>.webp for every requested width the source can supply
 * (never upscaled). Defaults are tuned for dark gradients, where 8-bit banding is the real enemy:
 *   - AVIF 10-bit (--avif-bits 10 is the default; 8 only if a browser target needs it), 4:4:4 when --444 or --alpha,
 *   - WebP quality 85 as the fallback,
 *   - no alpha unless --alpha (an opaque source is flattened onto #000, the page colour).
 * Use the files with <Picture base="/landing/<slug>/<name>" widths={[...]} width height alt /> (src/components/ds/Picture.tsx).
 * Every URL the page builds goes through withBasePath; CSS-referenced art is passed in as an inline custom property.
 */
import sharp from 'sharp';
import { mkdir, stat } from 'node:fs/promises';
import { join, resolve } from 'node:path';

const argv = process.argv.slice(2);
const positional = [];
const flags = new Map();
for (let i = 0; i < argv.length; i++) {
  const a = argv[i];
  if (a.startsWith('--')) {
    const key = a.slice(2);
    const next = argv[i + 1];
    if (next !== undefined && !next.startsWith('--')) {
      flags.set(key, next);
      i++;
    } else flags.set(key, true);
  } else positional.push(a);
}

const [src, outDir, name] = positional;
if (!src || !outDir || !name) {
  console.error('usage: node scripts/assets/encode.mjs <src> <outDir> <name> [--widths 640,1080,1472] [--alpha] [--avif-bits 10] [--avif-q 60] [--webp-q 85] [--effort 5] [--444]');
  process.exit(1);
}

const widths = String(flags.get('widths') ?? '640,1080,1472')
  .split(',')
  .map((n) => parseInt(n, 10))
  .filter((n) => n > 0)
  .sort((a, b) => a - b);
const alpha = flags.has('alpha');
const bits = parseInt(flags.get('avif-bits') ?? '10', 10);
if (![8, 10, 12].includes(bits)) throw new Error('--avif-bits must be 8, 10 or 12');
const avifQ = parseInt(flags.get('avif-q') ?? '60', 10);
const webpQ = parseInt(flags.get('webp-q') ?? '85', 10);
const effort = parseInt(flags.get('effort') ?? '5', 10);
const chroma = flags.has('444') || alpha ? '4:4:4' : '4:2:0';

await mkdir(resolve(outDir), { recursive: true });
const meta = await sharp(src).metadata();
console.log(`${src}: ${meta.width}x${meta.height}${meta.hasAlpha ? ' (alpha)' : ''}, ${meta.space ?? '?'}`);

const rows = [];
let wrote = 0;
for (const w of widths) {
  if (meta.width && w > meta.width) {
    console.warn(`  skip ${w}px: the source is only ${meta.width}px wide`);
    continue;
  }
  let pipe = sharp(src).toColourspace('srgb').resize({ width: w, withoutEnlargement: true, kernel: 'lanczos3' });
  if (!alpha) pipe = pipe.flatten({ background: '#000000' });
  const buf = await pipe.clone().raw().toBuffer({ resolveWithObject: true });
  const h = buf.info.height;

  const avif = join(resolve(outDir), `${name}-${w}.avif`);
  const webp = join(resolve(outDir), `${name}-${w}.webp`);
  await pipe.clone().avif({ quality: avifQ, bitdepth: bits, chromaSubsampling: chroma, effort }).toFile(avif);
  await pipe.clone().webp({ quality: webpQ, alphaQuality: 100, effort: 5 }).toFile(webp);
  const [a, b] = await Promise.all([stat(avif), stat(webp)]);
  rows.push({ file: `${name}-${w}`, size: `${w}x${h}`, avifKB: +(a.size / 1024).toFixed(1), webpKB: +(b.size / 1024).toFixed(1) });
  wrote += 2;
}
console.table(rows);
console.log(`wrote ${wrote} files to ${resolve(outDir)} (AVIF ${bits}-bit ${chroma} q${avifQ}, WebP q${webpQ}${alpha ? ', alpha' : ''})`);

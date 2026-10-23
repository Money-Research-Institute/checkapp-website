#!/usr/bin/env node
/**
 * Re-makes the "usual way" render with the app's current Scan Details screen, in English and in Russian.
 *
 *   MASTER=<1448x1086 master render> node src/components/landing/usual-way/art/build.mjs [en|ru ...]
 *
 * The render is one baked 3D scene (phone, rocks, glow, the floating glass cards). Only the phone's screen is wrong in it: it
 * shows Figma's old Scan Details (an orange "Needs Attention" chip, "July 22, 2024", the worried mascot, "DIDI"). This script
 * puts the screen of the Meet DiDi section's phone 4 (public/landing/familiar/device-scan[-ru]-840.webp: "Looks stable", "Today",
 * the smiling DiDi, and a Russian twin) into the scene, so the same screen is never shown with two different UIs on one page and
 * /ru/ has no English app UI left. Everything else in the scene is the master's own pixels.
 *
 * What it does, in order (the numbers it needs are in screen-fit.json, solved once against the master):
 *   1. Warp: the screen rect of the 840 x 1711 device export (44, 37, 754 x 1637, radius 104) goes through the homography that
 *      maps its four corners to the four corners of the phone's glass in the master (fit to the glass silhouette: the radius the
 *      fit converged to, 104.2, is the device's own, which is the check that the model is right). 3 x 3 supersampled, with an
 *      antialiased rounded-rect coverage. The export's last 2.4 px at the edge are extended outward so the bezel's dark antialias
 *      never rims the glass.
 *   2. Light: the master's screen is not pure white (about 0.99 in the middle, falling to 0.83 at the bottom edge). That is a smooth
 *      multiplier, fit as a cubic in the master's x, y from the pixels where the master and the old screen are both plain (the old
 *      screen warped by a content fit, which is only used for this), and applied to the warped screen.
 *   3. Island: the warp puts the export's Dynamic Island a few px off the master's own, and the master's has the camera glints. So the
 *      warped island is painted out (diffusion fill from the ring around it) and the master's island, with its rim, is pasted back.
 *   4. The glass is composited over the master with the coverage as alpha. Nothing outside the glass changes.
 *
 * Inputs and outputs:
 *   - MASTER is the Figma export of the scene, lossless. It is not committed (like every raw export); the shipped file is the same
 *     picture after encoding, `git show 5f373bf:public/landing/usual-way/usual-way-render-1448.webp` is an acceptable stand-in.
 *   - The screens are read from public/landing/familiar (override with SCREEN_EN / SCREEN_RU).
 *   - It writes <OUT_DIR or ./art-out>/render[-ru].png (1448 x 1086) and render-square[-ru].png (1086 x 1086, the phone crop for
 *     phones narrower than 480px) and prints the encode commands that produce the files that ship,
 *     public/landing/usual-way/usual-way-render[-ru]-{640,960,1448}.avif|webp and usual-way-render-square[-ru]-{540,1086}.avif|webp.
 *
 * Only sharp is needed (a devDependency of the repo). Re-run it, with the same fit, whenever a string on the familiar phone 4 changes.
 */
import { mkdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import sharp from 'sharp';

const here = new URL('.', import.meta.url).pathname;
const repo = resolve(here, '../../../../../');
const FIT = JSON.parse(readFileSync(resolve(here, 'screen-fit.json'), 'utf8'));

const masterPath = process.env.MASTER;
if (!masterPath) throw new Error('MASTER is required (see the header of this file)');
const outDir = resolve(process.env.OUT_DIR ?? 'art-out');
const screens = {
  en: process.env.SCREEN_EN ?? resolve(repo, 'public/landing/familiar/device-scan-840.webp'),
  ru: process.env.SCREEN_RU ?? resolve(repo, 'public/landing/familiar/device-scan-ru-840.webp'),
};
const locales = process.argv.slice(2).length ? process.argv.slice(2) : ['en', 'ru'];

const [W, H] = FIT.size;
const [RX, RY, RW, RH] = FIT.rect;

/** Decoded image, 3 channels as float, an alpha image is composited on white first. */
async function load(path) {
  const { data, info } = await sharp(path).flatten({ background: '#ffffff' }).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const out = new Float32Array(info.width * info.height * 3);
  for (let i = 0; i < out.length; i++) out[i] = data[i];
  return { w: info.width, h: info.height, d: out };
}

/** 3 x 3 homography taking the four `src` points to the four `dst` points (Gauss elimination on the 8 x 8 system). */
function solveH(src, dst) {
  const A = [];
  for (let i = 0; i < 4; i++) {
    const [x, y] = src[i];
    const [u, v] = dst[i];
    A.push([x, y, 1, 0, 0, 0, -u * x, -u * y, u]);
    A.push([0, 0, 0, x, y, 1, -v * x, -v * y, v]);
  }
  for (let c = 0; c < 8; c++) {
    let p = c;
    for (let r = c + 1; r < 8; r++) if (Math.abs(A[r][c]) > Math.abs(A[p][c])) p = r;
    [A[c], A[p]] = [A[p], A[c]];
    for (let r = 0; r < 8; r++) {
      if (r === c) continue;
      const f = A[r][c] / A[c][c];
      for (let k = c; k < 9; k++) A[r][k] -= f * A[c][k];
    }
  }
  const h = A.map((row, i) => row[8] / row[i]);
  return [h[0], h[1], h[2], h[3], h[4], h[5], h[6], h[7], 1];
}
function invert3(m) {
  const [a, b, c, d, e, f, g, h, i] = m;
  const A = e * i - f * h, B = -(d * i - f * g), C = d * h - e * g;
  const det = a * A + b * B + c * C;
  return [A, -(b * i - c * h), b * f - c * e, B, a * i - c * g, -(a * f - c * d), C, -(a * h - b * g), a * e - b * d].map((v) => v / det);
}

/** Bilinear sample of all three channels at (x, y), added to `acc`. Coordinates are pixel indices (pixel centres at integers). */
function sample(img, x, y, acc) {
  const x0 = Math.floor(x), y0 = Math.floor(y);
  const fx = x - x0, fy = y - y0;
  const X0 = Math.min(img.w - 1, Math.max(0, x0)), X1 = Math.min(img.w - 1, Math.max(0, x0 + 1));
  const Y0 = Math.min(img.h - 1, Math.max(0, y0)), Y1 = Math.min(img.h - 1, Math.max(0, y0 + 1));
  const d = img.d, w = img.w;
  const i00 = (Y0 * w + X0) * 3, i10 = (Y0 * w + X1) * 3, i01 = (Y1 * w + X0) * 3, i11 = (Y1 * w + X1) * 3;
  const a = (1 - fx) * (1 - fy), b = fx * (1 - fy), c = (1 - fx) * fy, e = fx * fy;
  for (let k = 0; k < 3; k++) acc[k] += d[i00 + k] * a + d[i10 + k] * b + d[i01 + k] * c + d[i11 + k] * e;
}

/** The screen warped into the master's frame: premultiplied colour and coverage. */
function warpScreen(screen) {
  const Hm = solveH(
    [[RX, RY], [RX + RW, RY], [RX + RW, RY + RH], [RX, RY + RH]],
    FIT.quad,
  );
  const Hi = invert3(Hm);
  const rad = FIT.radius;
  const ci = FIT.colorInset;
  const rgb = new Float32Array(W * H * 3);
  const cov = new Float32Array(W * H);
  const SS = 3;
  const xs = FIT.quad.map((p) => p[0]), ys = FIT.quad.map((p) => p[1]);
  const BOX = [Math.min(...xs) - 4, Math.min(...ys) - 4, Math.max(...xs) + 4, Math.max(...ys) + 4];
  const clip = (v, lo, hi) => (v < lo ? lo : v > hi ? hi : v);
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      if (x < BOX[0] || x > BOX[2] || y < BOX[1] || y > BOX[3]) continue; // far from the glass
      let inside = 0;
      const acc = [0, 0, 0];
      for (let sy = 0; sy < SS; sy++) {
        for (let sx = 0; sx < SS; sx++) {
          const gx = x + (sx + 0.5) / SS - 0.5;
          const gy = y + (sy + 0.5) / SS - 0.5;
          const w = Hi[6] * gx + Hi[7] * gy + Hi[8];
          const u = (Hi[0] * gx + Hi[1] * gy + Hi[2]) / w;
          const v = (Hi[3] * gx + Hi[4] * gy + Hi[5]) / w;
          if (u < RX || u > RX + RW || v < RY || v > RY + RH) continue;
          const cx = clip(u, RX + rad, RX + RW - rad), cy = clip(v, RY + rad, RY + RH - rad);
          if ((u - cx) ** 2 + (v - cy) ** 2 > rad * rad) continue;
          inside++;
          // Colour from the nearest point of the rounded rect inset by `ci`, so the edge colour extends outward.
          const r2 = rad - ci;
          const qx = clip(u, RX + ci + r2, RX + RW - ci - r2), qy = clip(v, RY + ci + r2, RY + RH - ci - r2);
          const dx = u - qx, dy = v - qy;
          const dist = Math.hypot(dx, dy) + 1e-9;
          const k = dist > r2 ? r2 / dist : 1;
          const su = qx + dx * k, sv = qy + dy * k;
          sample(screen, su, sv, acc);
        }
      }
      if (!inside) continue;
      const i = y * W + x;
      cov[i] = inside / (SS * SS);
      for (let c = 0; c < 3; c++) rgb[i * 3 + c] = acc[c] / (SS * SS);
    }
  }
  return { rgb, cov };
}

/** The master's screen light: a cubic in (x, y), one per channel. */
function lightAt(x, y, c) {
  const { center, scale, degree, coef } = FIT.light;
  const u = (x - center[0]) / scale[0], v = (y - center[1]) / scale[1];
  let k = 0, s = 0;
  for (let i = 0; i <= degree; i++) for (let j = 0; j <= degree - i; j++) s += coef[c][k++] * u ** i * v ** j;
  return s;
}

function gauss1d(sigma) {
  const r = Math.floor(3 * sigma) + 1;
  const k = new Float32Array(2 * r + 1);
  let sum = 0;
  for (let i = -r; i <= r; i++) sum += k[i + r] = Math.exp(-(i * i) / (2 * sigma * sigma));
  for (let i = 0; i < k.length; i++) k[i] /= sum;
  return k;
}
/** Separable Gaussian blur of a one-channel float image, edge pixels repeated. */
function blur(a, w, h, sigma) {
  const k = gauss1d(sigma), r = (k.length - 1) / 2;
  const tmp = new Float32Array(a.length), out = new Float32Array(a.length);
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      let s = 0;
      for (let i = -r; i <= r; i++) s += k[i + r] * a[y * w + Math.min(w - 1, Math.max(0, x + i))];
      tmp[y * w + x] = s;
    }
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      let s = 0;
      for (let i = -r; i <= r; i++) s += k[i + r] * tmp[Math.min(h - 1, Math.max(0, y + i)) * w + x];
      out[y * w + x] = s;
    }
  return out;
}
/** Square dilation of a mask by `r` pixels. */
function dilate(m, w, h, r) {
  const a = new Uint8Array(m.length), b = new Uint8Array(m.length);
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      if (!m[y * w + x]) continue;
      for (let i = Math.max(0, x - r); i <= Math.min(w - 1, x + r); i++) a[y * w + i] = 1;
    }
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      if (!a[y * w + x]) continue;
      for (let j = Math.max(0, y - r); j <= Math.min(h - 1, y + r); j++) b[j * w + x] = 1;
    }
  return b;
}

/** The black pill of a Dynamic Island: the dark connected region around the seed, inside the island box. */
function pill(img) {
  const [x0, y0, x1, y1] = FIT.island.box;
  const dark = new Uint8Array(W * H);
  for (let y = y0; y < y1; y++)
    for (let x = x0; x < x1; x++) {
      const i = y * W + x;
      if ((img[i * 3] + img[i * 3 + 1] + img[i * 3 + 2]) / 3 < FIT.island.threshold) dark[i] = 1;
    }
  const out = new Uint8Array(W * H);
  const [sx, sy] = FIT.island.seed;
  const stack = [sy * W + sx];
  out[stack[0]] = 1;
  while (stack.length) {
    const i = stack.pop();
    const x = i % W, y = (i / W) | 0;
    const next = [];
    if (x > 0) next.push(i - 1);
    if (x < W - 1) next.push(i + 1);
    if (y > 0) next.push(i - W);
    if (y < H - 1) next.push(i + W);
    for (const j of next) {
      if (out[j] || !dark[j]) continue;
      out[j] = 1;
      stack.push(j);
    }
  }
  return out;
}

/** Paint out the warped island and paste the master's own back. */
function swapIsland(N, R) {
  const { grow, paste, feather, box } = FIT.island;
  const pr = pill(R), pn = pill(N);
  const union = new Uint8Array(W * H);
  for (let i = 0; i < union.length; i++) union[i] = pr[i] | pn[i];
  const omega = dilate(union, W, H, grow);
  // Diffusion fill of the hole from the ring around it, inside the island box only.
  const ring = dilate(omega, W, H, 2);
  let n = 0;
  const mean = [0, 0, 0];
  for (let i = 0; i < ring.length; i++)
    if (ring[i] && !omega[i]) {
      n++;
      for (let c = 0; c < 3; c++) mean[c] += N[i * 3 + c];
    }
  for (let c = 0; c < 3; c++) mean[c] /= n;
  const [x0, y0, x1, y1] = box;
  const bw = x1 - x0, bh = y1 - y0;
  const sub = new Float32Array(bw * bh * 3);
  const hole = new Uint8Array(bw * bh);
  for (let y = 0; y < bh; y++)
    for (let x = 0; x < bw; x++) {
      const i = (y + y0) * W + (x + x0);
      hole[y * bw + x] = omega[i];
      for (let c = 0; c < 3; c++) sub[(y * bw + x) * 3 + c] = omega[i] ? mean[c] : N[i * 3 + c];
    }
  for (let it = 0; it < 600; it++)
    for (let y = 0; y < bh; y++)
      for (let x = 0; x < bw; x++) {
        if (!hole[y * bw + x]) continue;
        for (let c = 0; c < 3; c++) {
          const at = (xx, yy) => sub[(Math.min(bh - 1, Math.max(0, yy)) * bw + Math.min(bw - 1, Math.max(0, xx))) * 3 + c];
          sub[(y * bw + x) * 3 + c] = (at(x - 1, y) + at(x + 1, y) + at(x, y - 1) + at(x, y + 1)) / 4;
        }
      }
  for (let y = 0; y < bh; y++)
    for (let x = 0; x < bw; x++) for (let c = 0; c < 3; c++) N[((y + y0) * W + x + x0) * 3 + c] = sub[(y * bw + x) * 3 + c];
  const wgt = blur(Float32Array.from(dilate(pr, W, H, paste)), W, H, feather);
  for (let i = 0; i < wgt.length; i++) {
    const a = Math.min(1, Math.max(0, wgt[i]));
    if (a > 0) for (let c = 0; c < 3; c++) N[i * 3 + c] = N[i * 3 + c] * (1 - a) + R[i * 3 + c] * a;
  }
}

const master = await load(resolve(masterPath));
if (master.w !== W || master.h !== H) throw new Error(`MASTER must be ${W} x ${H}, got ${master.w} x ${master.h}`);

mkdirSync(outDir, { recursive: true });
const write = async (name, data, w, h) => {
  const buf = Buffer.alloc(w * h * 3);
  for (let i = 0; i < buf.length; i++) buf[i] = Math.min(255, Math.max(0, Math.round(data[i])));
  await sharp(buf, { raw: { width: w, height: h, channels: 3 } }).png().toFile(resolve(outDir, name));
};

for (const loc of locales) {
  const screen = await load(screens[loc]);
  const { rgb, cov } = warpScreen(screen);
  const N = new Float32Array(W * H * 3);
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      const i = y * W + x, a = cov[i];
      for (let c = 0; c < 3; c++) {
        const R = master.d[i * 3 + c];
        if (a <= 0) {
          N[i * 3 + c] = R;
          continue;
        }
        const lit = Math.min(255, Math.max(0, (rgb[i * 3 + c] / Math.max(a, 1e-4)) * lightAt(x, y, c)));
        N[i * 3 + c] = R * (1 - a) + lit * a;
      }
    }
  swapIsland(N, master.d);
  const suffix = loc === 'ru' ? '-ru' : '';
  await write(`render${suffix}.png`, N, W, H);
  // The phone crop for phones narrower than 480px: a 1086 x 1086 window of the same scene.
  const S = H, sq = new Float32Array(S * S * 3);
  for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) for (let c = 0; c < 3; c++) sq[(y * S + x) * 3 + c] = N[(y * W + x + FIT.squareX) * 3 + c];
  await write(`render-square${suffix}.png`, sq, S, S);
  console.log(`node scripts/assets/encode.mjs ${resolve(outDir, `render${suffix}.png`)} public/landing/usual-way usual-way-render${suffix} --widths 640,960,1448`);
  console.log(`node scripts/assets/encode.mjs ${resolve(outDir, `render-square${suffix}.png`)} public/landing/usual-way usual-way-render-square${suffix} --widths 540,1086`);
}

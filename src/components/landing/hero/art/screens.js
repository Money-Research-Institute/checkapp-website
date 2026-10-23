/*
 * Browser side of the hero phone's Russian art (see build.mjs, which loads it in Chrome and calls renderHome()).
 * Everything is in image pixels of the 800 x 1594 phone export in public/landing/hero/phone-800.webp (bezel, island, side
 * buttons, status bar and the Home screen). Only the words of the screen are touched: each is painted over with the ground
 * around it, then set again in Inter, sized from the ink width of the string it replaces and put on that string's baseline,
 * so English and Russian share the same lines. The method is the one the Meet DiDi device art uses
 * (src/components/landing/familiar/art/screens.js); the ink boxes are this export's own.
 */
const W = 800, H = 1594;
const IM = {};

window.loadImages = async (urls) => {
  for (const [k, u] of Object.entries(urls)) {
    const img = new Image();
    img.src = u;
    await img.decode();
    IM[k] = img;
  }
};

function base(name) {
  const cv = document.createElement('canvas');
  cv.width = W;
  cv.height = H;
  const c = cv.getContext('2d', { willReadFrequently: true });
  c.imageSmoothingQuality = 'high';
  c.drawImage(IM[name], 0, 0);
  return c;
}
const rgb = (a) => `rgb(${a[0] | 0} ${a[1] | 0} ${a[2] | 0})`;

/* Fill a box by interpolating, row by row, between the two columns just outside it (flat and vertical-gradient grounds alike). */
function fillRows(c, [x0, y0, x1, y1], padL = 3, padR = 3) {
  const w = x1 - x0, h = y1 - y0;
  const L = c.getImageData(x0 - padL - 1, y0, 2, h).data;
  const R = c.getImageData(x1 + padR - 1, y0, 2, h).data;
  const out = c.createImageData(w, h);
  for (let r = 0; r < h; r++) {
    const l = [0, 1, 2].map((k) => (L[r * 8 + k] + L[r * 8 + 4 + k]) / 2);
    const rr = [0, 1, 2].map((k) => (R[r * 8 + k] + R[r * 8 + 4 + k]) / 2);
    for (let i = 0; i < w; i++) {
      const t = (i + 0.5) / w;
      const o = (r * w + i) * 4;
      for (let k = 0; k < 3; k++) out.data[o + k] = l[k] * (1 - t) + rr[k] * t;
      out.data[o + 3] = 255;
    }
  }
  c.putImageData(out, x0, y0);
}

/* The colour of a string's ink: the pixel of its box that is furthest from the ground just left of it. */
function inkColor(c, [x0, y0, x1, y1]) {
  const w = x1 - x0 + 1, h = y1 - y0 + 1;
  const d = c.getImageData(x0, y0, w, h).data;
  const bg = c.getImageData(x0 - 3, y0 + (h >> 1), 1, 1).data;
  let best = 0, col = [0, 0, 0];
  for (let i = 0; i < d.length; i += 4) {
    const dist = Math.abs(d[i] - bg[0]) + Math.abs(d[i + 1] - bg[1]) + Math.abs(d[i + 2] - bg[2]);
    if (dist > best) { best = dist; col = [d[i], d[i + 1], d[i + 2]]; }
  }
  return col;
}

const fontOf = (size, weight) => `${weight} ${size}px Inter, sans-serif`;
function inkMetrics(c, s, size, weight) {
  c.font = fontOf(size, weight);
  c.letterSpacing = '0px';
  c.textAlign = 'left';
  c.textBaseline = 'alphabetic';
  const m = c.measureText(s);
  return { abl: m.actualBoundingBoxLeft, abr: m.actualBoundingBoxRight, asc: m.actualBoundingBoxAscent, w: m.actualBoundingBoxLeft + m.actualBoundingBoxRight };
}
function fitSize(c, s, weight, inkW) {
  return (inkW / inkMetrics(c, s, 100, weight).w) * 100;
}

/*
 * One text item: `orig` is what the export says there, `ink` its measured ink box [x0, y0, x1, y1]. The size comes from the ink
 * width, the baseline from the ink top plus the ascent of the original string, so any replacement lands on the same line in the
 * same size, anchored left / centre to the same ink edge.
 */
function item(c, ctxOrig, it, text) {
  if (text === it.orig) return;
  const [x0, y0, x1, y1] = it.ink;
  const weight = it.w ?? 400;
  const size = it.size ?? fitSize(c, it.orig, weight, x1 - x0 + 1);
  const mo = inkMetrics(c, it.orig, size, weight);
  const color = it.color ?? rgb(inkColor(ctxOrig, it.ink));
  fillRows(c, it.fill ?? [x0 - 5, y0 - 5, x1 + 6, y1 + 6], it.padL ?? 3, it.padR ?? 3);
  const m = inkMetrics(c, text, size, weight);
  const x = (it.a ?? 'l') === 'l' ? x0 + m.abl : (x0 + x1 + 1) / 2 - (m.abr - m.abl) / 2;
  c.font = fontOf(size, weight);
  c.fillStyle = color;
  c.fillText(text, x, y0 + mo.asc);
}

/* Copy a circular piece of the original export elsewhere (the icon that moves with its text). */
function moveCircle(c, name, cx, cy, r, dx, dy) {
  c.save();
  c.beginPath();
  c.arc(cx + dx, cy + dy, r, 0, Math.PI * 2);
  c.clip();
  c.drawImage(IM[name], dx, dy);
  c.restore();
}

/* ---------------------------------------------------------------- home */

const HOME = {
  talk: { orig: 'Talk?', ink: [188, 187, 259, 208], w: 600, fill: [182, 181, 266, 214] },
  greet: { orig: 'Good afternoon, Mah!', ink: [126, 285, 461, 316], w: 700, fill: [121, 279, 468, 322], padL: 1 },
  start: { orig: 'Start Tongue Scan', ink: [300, 1018, 552, 1045], w: 600, color: '#fff', fill: [244, 1010, 560, 1053] },
  light: { orig: 'Light it up!', ink: [278, 1149, 404, 1174], w: 700, fill: [273, 1143, 412, 1180] },
  ready: { orig: 'DIDI is ready when you are.', ink: [279, 1189, 595, 1213], w: 400, fill: [273, 1183, 606, 1219] },
  days: { orig: '4 days', ink: [147, 1270, 227, 1293], w: 700, a: 'c', fill: [141, 1266, 233, 1298] },
  streak: { orig: 'Streak', ink: [162, 1301, 213, 1312], w: 400, a: 'c', fill: [156, 1297, 219, 1318] },
};
/* Mon to Sun: the ink columns under the seven dots (y 1302 to 1316), measured on the export. */
const DAYS = [
  ['Mon', 295, 331], ['Tue', 355, 385], ['Wed', 409, 445], ['Thu', 469, 500], ['Fri', 533, 551], ['Sat', 586, 612], ['Sun', 641, 671],
];

window.renderHome = (S) => {
  const c = base('home');
  const orig = base('home');
  item(c, orig, HOME.talk, S.talk);
  item(c, orig, HOME.greet, S.greet);
  item(c, orig, HOME.light, S.light);
  item(c, orig, HOME.ready, S.ready);
  item(c, orig, HOME.days, S.days);
  item(c, orig, HOME.streak, S.streak);

  // One size for the seven day names (each English word would fit to a slightly different one), the median of the seven fits.
  const fits = DAYS.map(([en, x0, x1]) => fitSize(c, en, 600, x1 - x0 + 1)).sort((a, b) => a - b);
  const dowSize = fits[3];
  DAYS.forEach(([en, x0, x1], i) => {
    const mid = Math.round((x0 + x1) / 2);
    item(c, orig, { orig: en, ink: [x0, 1302, x1, 1316], w: 600, a: 'c', size: dowSize, fill: [mid - 27, 1297, mid + 28, 1322] }, S.dow[i]);
  });

  // The button: the plus and the text are one group, centred on the button (its centre is x 401).
  const st = HOME.start;
  if (S.start !== st.orig) {
    const size = fitSize(c, st.orig, st.w, st.ink[2] - st.ink[0] + 1);
    const m = inkMetrics(c, S.start, size, st.w);
    const iconL = 252, iconW = 31, gap = 300 - 283;
    const left = 401 - (iconW + gap + m.w) / 2;
    fillRows(c, st.fill, 3, 3);
    moveCircle(c, 'home', 267.5, 1028, 17, left - iconL, 0);
    const mo = inkMetrics(c, st.orig, size, st.w);
    c.font = fontOf(size, st.w);
    c.fillStyle = '#fff';
    c.fillText(S.start, left + iconW + gap + m.abl, st.ink[1] + mo.asc);
  }
  return c.canvas.toDataURL('image/png');
};

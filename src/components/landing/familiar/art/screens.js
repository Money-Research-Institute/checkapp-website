/*
 * Browser side of the Meet DiDi device art (see build.mjs, which loads it in Chrome and calls render*()).
 * Everything is in image pixels of the 840 x 1711 device export (3x of the 280pt phone). The base images are the Figma-derived
 * exports (bezel, status bar, island, side buttons); only the screen is touched. Text that changes is set in Inter, sized from the
 * ink width of the string it replaces and put on that string's baseline, so English and Russian share the same lines.
 */
/* In-page renderer for the Meet DiDi device screens (840 x 1711 at 3x). Runs in Chrome; fonts are loaded by the harness. */
const W = 840, H = 1711;
const IM = {};
window.IM = IM;

window.loadImages = async (urls) => {
  for (const [k, u] of Object.entries(urls)) {
    const img = new Image();
    img.src = u;
    await img.decode();
    IM[k] = img;
  }
};

function mk() {
  const c = document.createElement('canvas');
  c.width = W; c.height = H;
  return c;
}
function base(name) {
  const c = mk();
  const x = c.getContext('2d', { willReadFrequently: true });
  x.imageSmoothingQuality = 'high';
  x.drawImage(IM[name], 0, 0);
  return x;
}
const rgb = (a) => `rgb(${a[0]|0} ${a[1]|0} ${a[2]|0})`;

/* Fill a box by interpolating, row by row, between the two columns just outside it (handles flat and vertical-gradient grounds). */
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

const fontOf = (size, weight, fam = 'Inter') => `${weight} ${size}px ${fam}, sans-serif`;
function inkMetrics(c, s, size, weight) {
  c.font = fontOf(size, weight);
  c.letterSpacing = '0px';
  c.textAlign = 'left';
  c.textBaseline = 'alphabetic';
  const m = c.measureText(s);
  return { abl: m.actualBoundingBoxLeft, abr: m.actualBoundingBoxRight, asc: m.actualBoundingBoxAscent, desc: m.actualBoundingBoxDescent, w: m.actualBoundingBoxLeft + m.actualBoundingBoxRight };
}
function fitSize(c, s, weight, inkW) {
  const m = inkMetrics(c, s, 100, weight);
  return (inkW / m.w) * 100;
}

/*
 * One text item: `orig` is what the source raster says there, `ink` its measured ink box [x0, y0, x1, y1]. The size comes from
 * the ink width, the baseline from the ink top plus the ascent of the original string, so any replacement string lands on the
 * same line, in the same size, anchored left / centre / right to the same ink edge.
 */
function item(c, ctxOrig, it, text) {
  if (text === it.orig) return null;
  const [x0, y0, x1, y1] = it.ink;
  const weight = it.w ?? 400;
  const size = it.size ?? fitSize(c, it.orig, weight, x1 - x0 + 1);
  const mo = inkMetrics(c, it.orig, size, weight);
  const baseline = y0 + mo.asc;
  const color = it.color ?? rgb(inkColor(ctxOrig, it.ink));
  const box = it.fill ?? [x0 - 5, y0 - 5, x1 + 6, y1 + 6];
  fillRows(c, box, it.padL ?? 3, it.padR ?? 3);
  const m = inkMetrics(c, text, size, weight);
  let x;
  if ((it.a ?? 'l') === 'l') x = x0 + m.abl;
  else if (it.a === 'c') x = (x0 + x1 + 1) / 2 - (m.abr - m.abl) / 2;
  else x = x1 + 1 - m.abr;
  c.font = fontOf(size, weight);
  c.fillStyle = color;
  c.textAlign = 'left';
  c.fillText(text, x, baseline);
  return { size, baseline, x, w: m.w };
}

function rr(c, x, y, w, h, r) {
  c.beginPath();
  c.moveTo(x + r, y);
  c.arcTo(x + w, y, x + w, y + h, r);
  c.arcTo(x + w, y + h, x, y + h, r);
  c.arcTo(x, y + h, x, y, r);
  c.arcTo(x, y, x + w, y, r);
  c.closePath();
}

/* The screen's own shape: 754 x 1637 at (44, 37), corner radius ~104. */
const SCREEN = { x: 44, y: 37, w: 754, h: 1637, r: 104 };
function clipScreen(c) { rr(c, SCREEN.x, SCREEN.y, SCREEN.w, SCREEN.h, SCREEN.r); c.clip(); }

function wrap(c, text, maxW) {
  const words = text.split(' ');
  const lines = [];
  let cur = '';
  for (const w of words) {
    const t = cur ? cur + ' ' + w : w;
    if (c.measureText(t).width > maxW && cur) { lines.push(cur); cur = w; } else cur = t;
  }
  if (cur) lines.push(cur);
  return lines;
}

/* Copy a circular piece of the original raster elsewhere (icons that move). */
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
  talk: { orig: 'Talk?', ink: [187, 190, 263, 213], w: 600, fill: [181, 184, 271, 220] },
  greet: { orig: 'Good afternoon, Mah!', ink: [118, 297, 484, 329], w: 700, fill: [114, 291, 490, 335], padL: 1 },
  start: { orig: 'Start Tongue Scan', ink: [309, 1096, 583, 1126], w: 600, color: '#fff', fill: [250, 1088, 590, 1134] },
  light: { orig: 'Light it up!', ink: [285, 1239, 422, 1266], w: 700, fill: [281, 1233, 430, 1272] },
  ready: { orig: 'DIDI is ready when you are.', ink: [285, 1283, 629, 1308], w: 400, fill: [281, 1277, 640, 1314] },
  days: { orig: '4 days', ink: [142, 1371, 228, 1395], w: 700, a: 'c', fill: [138, 1365, 234, 1400] },
  streak: { orig: 'Streak', ink: [158, 1404, 212, 1416], w: 400, a: 'c', fill: [154, 1400, 218, 1421] },
};
const DAYS = [
  ['Mon', 304, 341], ['Tue', 369, 401], ['Wed', 427, 467], ['Thu', 493, 527], ['Fri', 562, 583], ['Sat', 620, 649], ['Sun', 680, 713],
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
  DAYS.forEach(([en, x0, x1], i) => {
    item(c, orig, { orig: en, ink: [x0, 1408, x1, 1421], w: 600, a: 'c', size: 19.2, fill: [Math.round((x0 + x1) / 2) - 28, 1402, Math.round((x0 + x1) / 2) + 29, 1428] }, S.dow[i]);
  });
  // The button: icon + text are one group centred on the button.
  const st = HOME.start;
  if (S.start !== st.orig) {
    const weight = st.w;
    const size = fitSize(c, st.orig, weight, st.ink[2] - st.ink[0] + 1);
    const m = inkMetrics(c, S.start, size, weight);
    const iconW = 33, gap = 20;
    const groupW = iconW + gap + m.w;
    const left = 420 - groupW / 2;
    fillRows(c, st.fill, 3, 3);
    // icon from the original (circle, r 17 around (272.5, 1107))
    const dx = left - 256;
    moveCircle(c, 'home', 272.5, 1107, 18, dx, 0);
    const mo = inkMetrics(c, st.orig, size, weight);
    c.font = fontOf(size, weight);
    c.fillStyle = '#fff';
    c.fillText(S.start, left + iconW + gap + m.abl, st.ink[1] + mo.asc);
  }
  return c.canvas.toDataURL('image/png');
};

/* ---------------------------------------------------------------- scan */

const SCAN = {
  title: { orig: 'Scan Details', ink: [315, 159, 525, 186], w: 700, a: 'c', fill: [305, 152, 535, 193] },
  overall: { orig: 'Overall Result', ink: [188, 278, 392, 300], w: 600, fill: [184, 272, 400, 306] },
  date: { orig: 'July 22, 2024 11:06', ink: [187, 317, 362, 335], w: 400, fill: [183, 311, 372, 341] },
  l1: { orig: 'Tongue Color', ink: [148, 746, 302, 769], w: 400, fill: [144, 740, 436, 776], padL: 1, padR: 4 },
  l2: { orig: 'Coating', ink: [149, 846, 236, 870], w: 400, fill: [144, 840, 436, 877], padL: 1, padR: 4 },
  l3: { orig: 'Moisture', ink: [149, 947, 248, 965], w: 400, fill: [144, 941, 436, 972], padL: 1, padR: 4 },
  l4: { orig: 'Surface Texture', ink: [149, 1047, 330, 1066], w: 400, fill: [144, 1041, 436, 1073], padL: 1, padR: 4 },
  v1: { orig: 'Light pink', ink: [468, 744, 587, 769], w: 500, fill: [458, 738, 748, 776] },
  v2: { orig: 'Thin white coating', ink: [466, 844, 694, 870], w: 500, fill: [458, 838, 748, 877] },
  v3: { orig: 'Slightly dry', ink: [467, 945, 605, 971], w: 500, fill: [458, 939, 748, 978] },
  v4: { orig: 'Mostly smooth', ink: [468, 1047, 650, 1072], w: 500, fill: [458, 1041, 748, 1079] },
  summary: { orig: 'Summary', ink: [75, 1185, 215, 1214], w: 600, fill: [71, 1179, 224, 1220] },
  rec: { orig: 'Recommended Next Steps', ink: [107, 1406, 501, 1435], w: 600, fill: [103, 1400, 512, 1441] },
  drink: { orig: 'Drink more water today', ink: [134, 1486, 437, 1512], w: 500, fill: [130, 1481, 450, 1518], padL: 2 },
};
const PARA = { orig1: 'Your scan appears generally stable, with mild dryness visible', ink1: [75, 1243, 739, 1265], pitch: 35, fill: [70, 1236, 776, 1342] };

function checkMark(c, cx, cy, r, color) {
  c.save();
  c.fillStyle = color;
  c.beginPath(); c.arc(cx, cy, r, 0, Math.PI * 2); c.fill();
  c.strokeStyle = '#fff';
  c.lineWidth = r * 0.22;
  c.lineCap = 'round'; c.lineJoin = 'round';
  c.beginPath();
  c.moveTo(cx - r * 0.42, cy + r * 0.02);
  c.lineTo(cx - r * 0.1, cy + r * 0.36);
  c.lineTo(cx + r * 0.46, cy - r * 0.34);
  c.stroke();
  c.restore();
}

window.renderScan = (S) => {
  const c = base('scan');
  const orig = base('scan');
  item(c, orig, SCAN.date, S.date);
  // The chip: Figma's "Needs Attention" verdict is wiped. No replacement status is drawn when S.chip is null: a finished verdict as a
  // picture would contradict the page's own copy and cannot be scanned (docs/landing-decisions.md D1).
  fillRows(c, [486, 268, 756, 342], 3, 3);
  if (S.chip) {
    const size = 26.5, weight = 600;
    const m = inkMetrics(c, S.chip, size, weight);
    const padL = 18, icon = 34, gap = 12, padR = 24;
    const w = padL + icon + gap + m.w + padR;
    const x1 = 749, x0 = x1 - w, y0 = 275, h = 60;
    c.save();
    rr(c, x0, y0, w, h, h / 2);
    c.fillStyle = 'rgb(222 241 218)';
    c.fill();
    c.restore();
    checkMark(c, x0 + padL + icon / 2, y0 + h / 2, icon / 2, 'rgb(62 133 58)');
    c.font = fontOf(size, weight);
    c.fillStyle = 'rgb(37 104 40)';
    c.textAlign = 'left';
    c.fillText(S.chip, x0 + padL + icon + gap + m.abl, y0 + h / 2 + 9.5);
  }
  // The avatar: the smiling DiDi of the chat header instead of the worried one.
  fillRows(c, [94, 238, 180, 348], 3, 3);
  {
    const sx = 160, sy = 125, sw = 130, sh = 145;
    const a = document.createElement('canvas'); a.width = sw; a.height = sh;
    const ax = a.getContext('2d', { willReadFrequently: true });
    ax.drawImage(IM.chat, sx, sy, sw, sh, 0, 0, sw, sh);
    const src = ax.getImageData(0, 0, sw, sh);
    const cx = 224.5 - sx, cy = 205 - sy, R = 50.6;
    for (let y = 0; y < sh; y++) for (let x = 0; x < sw; x++) {
      const i = (y * sw + x) * 4;
      const inside = Math.hypot(x + 0.5 - cx, y + 0.5 - cy);
      let al;
      if (inside <= R - 0.5) al = 1;
      else if (inside <= R + 0.5) al = R + 0.5 - inside;
      else {
        const g = src.data[i + 1] - src.data[i + 2];
        al = Math.min(1, Math.max(0, (g - 28) / 32));
        if (y > cy) al = 0;
      }
      src.data[i + 3] = Math.round(src.data[i + 3] * al);
    }
    ax.putImageData(src, 0, 0);
    const s = 0.7;
    // chat ring centre (224.5, 205) -> scan ring centre (135.5, 303)
    c.drawImage(a, 135.5 - cx * s, 303 - cy * s, sw * s, sh * s);
  }
  item(c, orig, SCAN.title, S.title);
  item(c, orig, SCAN.overall, S.overall);
  ['l1', 'l2', 'l3', 'l4'].forEach((k, i) => item(c, orig, SCAN[k], S.labels[i]));
  ['v1', 'v2', 'v3', 'v4'].forEach((k, i) => item(c, orig, SCAN[k], S.values[i]));
  item(c, orig, SCAN.summary, S.summary);
  item(c, orig, SCAN.rec, S.rec);
  item(c, orig, SCAN.drink, S.drink);
  if (S.para) {
    const size = fitSize(c, PARA.orig1, 400, PARA.ink1[2] - PARA.ink1[0] + 1);
    const mo = inkMetrics(c, PARA.orig1, size, 400);
    const color = rgb(inkColor(orig, PARA.ink1));
    fillRows(c, PARA.fill, 3, 3);
    c.font = fontOf(size, 400);
    c.fillStyle = color;
    const lines = wrap(c, S.para, S.paraW ?? 690);
    lines.forEach((ln, i) => c.fillText(ln, 75, PARA.ink1[1] + mo.asc + i * PARA.pitch));
    window.__paraLines = lines.length;
  }
  if (S.view) {
    // "View Full Conversation": icon + text as a group centred on the button.
    const orig1 = 'View Full Conversation';
    const size = fitSize(c, orig1, 600, 341);
    const m = inkMetrics(c, S.view, size, 600);
    const mo = inkMetrics(c, orig1, size, 600);
    const iconL = 221, iconW = 42, gap = 281 - 263;
    const left = 421.5 - (iconW + gap + m.w) / 2;
    fillRows(c, [214, 1550, 632, 1610], 3, 3);
    c.save();
    c.beginPath(); rr(c, left - 2, 1553, iconW + 4, 52, 12); c.clip();
    c.drawImage(IM.scan, left - iconL, 0);
    c.restore();
    c.font = fontOf(size, 600);
    c.fillStyle = rgb(inkColor(orig, [281, 1568, 621, 1592]));
    c.fillText(S.view, left + iconW + gap + m.abl, 1568 + mo.asc);
  }
  return c.canvas.toDataURL('image/png');
};

/* ---------------------------------------------------------------- chat */

const CHAT_TEXT = { orig: 'Hey! Ready for your daily check-in?', inkW: 415, pitch: 33, firstBase: 333 };

function drawCheck(c, x, y, color) {
  c.save();
  c.strokeStyle = color; c.lineWidth = 2.4; c.lineCap = 'round'; c.lineJoin = 'round';
  c.beginPath(); c.moveTo(x, y - 6); c.lineTo(x + 5, y - 1); c.lineTo(x + 14, y - 12); c.stroke();
  c.restore();
}

window.renderChat = (S) => {
  const c = base('chat');
  const orig = base('chat');
  c.fillStyle = 'rgb(246 246 246)';
  c.fillRect(44, 262, 754, 1240);
  const size = fitSize(c, CHAT_TEXT.orig, 400, CHAT_TEXT.inkW);
  const tsize = 18.2;
  const bubble = (o) => {
    c.font = fontOf(size, 400);
    const lines = wrap(c, o.text, 524);
    const widest = Math.max(...lines.map((l) => c.measureText(l).width));
    const w = Math.round(Math.max(widest + 46, 250));
    const h = 47 + (lines.length - 1) * CHAT_TEXT.pitch + 39 + 14;
    const x = o.x;
    c.save();
    rr(c, x, o.y, w, h, 34); c.fillStyle = o.bg; c.fill();
    c.restore();
    c.font = fontOf(size, 400); c.fillStyle = 'rgb(30 30 30)'; c.textAlign = 'left';
    lines.forEach((l, i) => c.fillText(l, x + 23, o.y + 47 + i * CHAT_TEXT.pitch));
    c.font = fontOf(tsize, 400); c.fillStyle = 'rgb(150 150 150)'; c.textAlign = 'right';
    c.fillText(o.time, x + w - 24, o.y + 47 + (lines.length - 1) * CHAT_TEXT.pitch + 39);
    c.textAlign = 'left';
    return o.y + h;
  };
  let y = 286;
  y = bubble({ x: 75, y, text: S.ask, bg: 'rgb(233 241 231)', time: S.time1 });
  y += 26;
  // The sent photo: a grey bubble, right-aligned, with the picture, the time and a read mark.
  {
    const pad = 12, ph = 300, w = ph + 2 * pad, h = pad + ph + 46;
    const x = 766 - w;
    c.save();
    rr(c, x, y, w, h, 34); c.fillStyle = 'rgb(232 232 232)'; c.fill();
    c.restore();
    c.save();
    rr(c, x + pad, y + pad, ph, ph, 24); c.clip();
    c.drawImage(IM.record, 211, 545, 420, 420, x + pad, y + pad, ph, ph);
    c.restore();
    c.font = fontOf(tsize, 400); c.fillStyle = 'rgb(130 130 130)'; c.textAlign = 'right';
    c.fillText(S.time2, x + w - 52, y + pad + ph + 31);
    drawCheck(c, x + w - 44, y + pad + ph + 29, 'rgb(76 150 70)');
    c.textAlign = 'left';
    y += h + 26;
  }
  y = bubble({ x: 75, y, text: S.reply, bg: 'rgb(233 241 231)', time: S.time3 });
  if (S.placeholder) {
    item(c, orig, { orig: 'Ask me anything...', ink: [173, 1545, 427, 1575], w: 400, fill: [168, 1538, 446, 1583], padL: 2 }, S.placeholder);
  }
  window.__chatCanvas = c.canvas;
  window.__chatEnd = y;
  return c.canvas.toDataURL('image/png');
};

/* ---------------------------------------------------------------- the camera (replaces the video-note recorder) */

window.renderRecord = (S) => {
  const c = base('record');
  // The ground under the header is the new chat, blurred and dimmed the way the recorder dimmed it.
  const t = document.createElement('canvas'); t.width = W; t.height = H;
  const tx = t.getContext('2d');
  tx.fillStyle = 'rgb(246 246 246)'; tx.fillRect(0, 0, W, H);
  tx.save(); clipScreen(tx); tx.drawImage(window.__chatCanvas, 0, 0); tx.restore();
  const b = document.createElement('canvas'); b.width = W; b.height = H;
  const bx = b.getContext('2d');
  bx.filter = 'blur(11px)'; bx.drawImage(t, 0, 0); bx.filter = 'none';
  bx.fillStyle = 'rgba(0,0,0,0.4024)'; bx.fillRect(0, 0, W, H);
  // Below the viewfinder there is only the dimmed ground: no smudge of the chat's input bar behind the controls.
  const fade = bx.createLinearGradient(0, 1420, 0, 1480);
  fade.addColorStop(0, 'rgba(147,147,147,0)'); fade.addColorStop(1, 'rgb(147,147,147)');
  bx.fillStyle = fade; bx.fillRect(0, 1420, W, 60);
  bx.fillStyle = 'rgb(147,147,147)'; bx.fillRect(0, 1480, W, H - 1480);

  c.save();
  clipScreen(c);
  c.beginPath(); c.rect(0, 272, W, H - 272); c.clip();
  c.drawImage(b, 0, 0);
  c.restore();

  c.save();
  clipScreen(c);
  // The viewfinder: the original round preview, zoomed a little so the video progress ring falls outside it.
  c.save();
  c.beginPath(); c.arc(421, 748, 321, 0, Math.PI * 2); c.clip();
  c.translate(421, 748); c.scale(1.085, 1.085); c.translate(-421, -748);
  c.drawImage(IM.record, 0, 0);
  c.restore();
  c.beginPath(); c.arc(421, 748, 326, 0, Math.PI * 2);
  c.strokeStyle = 'rgba(255,255,255,0.96)'; c.lineWidth = 9; c.stroke();

  // One instruction, in a dark pill.
  {
    const size = 31, weight = 600;
    c.font = fontOf(size, weight);
    const m = c.measureText(S.guide);
    const w = m.width + 64, h = 66, cx = 421, cy = 1148;
    rr(c, cx - w / 2, cy - h / 2, w, h, h / 2);
    c.fillStyle = 'rgba(16,24,16,0.62)'; c.fill();
    c.fillStyle = '#fff'; c.textAlign = 'center'; c.textBaseline = 'alphabetic';
    c.fillText(S.guide, cx, cy + 10.5);
    c.textAlign = 'left';
  }

  // The controls: flip camera and flash (the original buttons, moved), a round shutter between them.
  moveCircle(c, 'record', 112.5, 1475.5, 39.5, 150 - 112.5, 1545 - 1475.5);
  moveCircle(c, 'record', 213.5, 1475.5, 39.5, 692 - 213.5, 1545 - 1475.5);
  {
    const cx = 421, cy = 1545;
    c.beginPath(); c.arc(cx, cy, 80, 0, Math.PI * 2);
    c.strokeStyle = '#fff'; c.lineWidth = 9; c.stroke();
    const g = c.createLinearGradient(0, cy - 62, 0, cy + 62);
    g.addColorStop(0, 'rgb(112 172 102)'); g.addColorStop(1, 'rgb(64 128 58)');
    c.beginPath(); c.arc(cx, cy, 62, 0, Math.PI * 2);
    c.fillStyle = g; c.fill();
  }
  rr(c, 421 - 122, 1643, 244, 9, 4.5);
  c.fillStyle = 'rgba(255,255,255,0.92)'; c.fill();
  c.restore();
  return c.canvas.toDataURL('image/png');
};

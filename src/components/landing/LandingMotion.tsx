'use client';

import { useEffect } from 'react';

/**
 * The landing's pointer and scroll polish, three small DOM controllers and nothing else (no canvas, no tiers):
 *
 *  - [data-once]: a one-shot rise for elements that are off screen at load (armed), played on their first 35 % intersection. Absent
 *    attribute = finished frame, so no-JS, print and reduced motion see the whole page.
 *  - [data-depth]: pointer parallax on fine pointers; writes the CSS `translate` property, so section motion uses transform/rotate/scale.
 *  - the cursor's light on the hero's glass cards (--mx / --my, painted by styles/fx.css).
 *  - the final card's rim light: its two lobes travel around the card's edge, facing the pointer and, when the pointer is not
 *    about, following the card's pass through the viewport (--adx / --ady / --bdx / --bdy, applied by FinalCta.module.css).
 *
 * Mounted once at the end of LandingPage. Ported from the old experience engine's core, minus its WebGL and tier machinery.
 */

const noop = () => {};
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

/* ---------------------------------------------------------------- [data-once] */

/**
 * absent attribute = final state. At boot an element that is BELOW (or above) the first view gets data-once-state="armed"
 * (CSS may show the start frame only under [data-once-state="armed"]); on its first >= 35 % intersection it becomes
 * "played" and CSS runs the one-shot. Reduced motion never arms anything: the finished frame stays.
 *
 * An element that already shows on screen when this chunk boots is left alone, in its finished state. The chunk boots after
 * LCP and idle, so by then the user has been looking at that element for a while (a reload that restored the scroll, a
 * back-navigation, an anchor, the whole hero): arming it would snap it back to its start frame and replay, which reads as a
 * glitch on content they were already reading.
 */
function startOnce(reduced: boolean): () => void {
  const els = document.querySelectorAll('[data-once]');
  if (reduced || !els.length) return noop;
  // An observer reports every target once, right after observe(), with its real (clip-aware) visibility: that first report
  // decides between "already on screen: leave it finished" and "off screen: arm it".
  const decided = new Set<Element>();
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (!decided.has(e.target)) {
          decided.add(e.target);
          if (e.isIntersecting) io.unobserve(e.target);
          else e.target.setAttribute('data-once-state', 'armed');
          continue;
        }
        const tall = !!e.rootBounds && e.intersectionRect.height >= e.rootBounds.height * 0.5;
        if (e.isIntersecting && (e.intersectionRatio >= 0.35 || tall)) {
          e.target.setAttribute('data-once-state', 'played');
          io.unobserve(e.target);
        }
      }
    },
    { threshold: [0, 0.1, 0.2, 0.35, 0.5] },
  );
  els.forEach((el) => io.observe(el));
  return () => io.disconnect();
}

/* ---------------------------------------------------------------- [data-depth] */

interface DepthItem {
  el: HTMLElement;
  mx: number;
  my: number;
  k: number;
  x: number;
  y: number;
  tx: number;
  ty: number;
  /** data-depth-rot: the most degrees the element leans toward the pointer. Published as --rx / --ry (deg) for the CSS to use. */
  rot: number;
  rx: number;
  ry: number;
  trx: number;
  try: number;
}
interface DepthGroup {
  root: Element;
  items: DepthItem[];
  visible: boolean;
}

/**
 * Pointer parallax, fine pointers only. data-depth="<max px x>" (data-depth-y, data-depth-k = damping, default 6).
 * Writes the individual CSS `translate` property, so a section's own motion must use transform / rotate / scale.
 * x += (target - x) * (1 - e^(-k dt)), dt clamped to 0.05. The loop starts on the first real pointermove, runs only
 * while the pointer is inside the element's nearest [data-depth-root] (default: [data-section]) and that root is on
 * screen, and sleeps once everything is within 0.05px of its target: idle cost is 0 rAF/s. All offsets are 0 at rest.
 */
function startDepth(reduced: boolean): () => void {
  if (reduced || !matchMedia('(hover: hover) and (pointer: fine)').matches) return noop;
  const els = document.querySelectorAll<HTMLElement>('[data-depth]');
  if (!els.length) return noop;

  const groups = new Map<Element, DepthGroup>();
  els.forEach((el) => {
    const root = el.closest('[data-depth-root]') ?? el.closest('[data-section]') ?? document.body;
    const mx = parseFloat(el.dataset.depth ?? '') || 0;
    const my = el.dataset.depthY !== undefined ? parseFloat(el.dataset.depthY) || 0 : mx;
    const k = parseFloat(el.dataset.depthK ?? '') || 6;
    const rot = parseFloat(el.dataset.depthRot ?? '') || 0;
    let g = groups.get(root);
    if (!g) groups.set(root, (g = { root, items: [], visible: false }));
    g.items.push({ el, mx, my, k, x: 0, y: 0, tx: 0, ty: 0, rot, rx: 0, ry: 0, trx: 0, try: 0 });
  });

  let raf = 0;
  let last = 0;

  const io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      const g = groups.get(e.target);
      if (!g) continue;
      g.visible = e.isIntersecting;
      if (!g.visible) {
        for (const it of g.items) it.tx = it.ty = it.trx = it.try = 0;
        wake();
      }
    }
  });
  groups.forEach((g) => io.observe(g.root));

  function tick(now: number) {
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;
    let moving = false;
    groups.forEach((g) => {
      for (const it of g.items) {
        const f = 1 - Math.exp(-it.k * dt);
        it.x += (it.tx - it.x) * f;
        it.y += (it.ty - it.y) * f;
        it.rx += (it.trx - it.rx) * f;
        it.ry += (it.try - it.ry) * f;
        if (Math.abs(it.tx - it.x) < 0.05 && Math.abs(it.ty - it.y) < 0.05) {
          it.x = it.tx;
          it.y = it.ty;
        } else {
          moving = true;
        }
        if (Math.abs(it.trx - it.rx) < 0.02 && Math.abs(it.try - it.ry) < 0.02) {
          it.rx = it.trx;
          it.ry = it.try;
        } else {
          moving = true;
        }
        it.el.style.translate = it.x === 0 && it.y === 0 ? '' : `${it.x.toFixed(2)}px ${it.y.toFixed(2)}px`;
        if (it.rot) {
          if (it.rx === 0 && it.ry === 0) {
            it.el.style.removeProperty('--rx');
            it.el.style.removeProperty('--ry');
          } else {
            it.el.style.setProperty('--rx', it.rx.toFixed(2));
            it.el.style.setProperty('--ry', it.ry.toFixed(2));
          }
        }
      }
    });
    raf = moving ? requestAnimationFrame(tick) : 0;
  }
  function wake() {
    if (raf) return;
    last = performance.now();
    raf = requestAnimationFrame(tick);
  }

  function onMove(event: PointerEvent) {
    if (event.pointerType && event.pointerType !== 'mouse' && event.pointerType !== 'pen') return;
    groups.forEach((g) => {
      const inside = g.visible && g.root.contains(event.target as Node);
      if (!inside) {
        for (const it of g.items) it.tx = it.ty = it.trx = it.try = 0;
        return;
      }
      const r = g.root.getBoundingClientRect();
      const nx = clamp((event.clientX - (r.left + r.width / 2)) / (r.width / 2), -1, 1);
      const ny = clamp((event.clientY - (r.top + r.height / 2)) / (r.height / 2), -1, 1);
      for (const it of g.items) {
        it.tx = nx * it.mx;
        it.ty = ny * it.my;
        it.trx = -ny * it.rot;
        it.try = nx * it.rot;
      }
    });
    wake();
  }
  function onLeave() {
    groups.forEach((g) => g.items.forEach((it) => (it.tx = it.ty = it.trx = it.try = 0)));
    wake();
  }

  window.addEventListener('pointermove', onMove, { passive: true });
  document.documentElement.addEventListener('pointerleave', onLeave);
  return () => {
    window.removeEventListener('pointermove', onMove);
    document.documentElement.removeEventListener('pointerleave', onLeave);
    io.disconnect();
    if (raf) cancelAnimationFrame(raf);
    groups.forEach((g) =>
      g.items.forEach((it) => {
        it.el.style.translate = '';
        it.el.style.removeProperty('--rx');
        it.el.style.removeProperty('--ry');
      }),
    );
  };
}

/* ---------------------------------------------------------------- pointer light on glass */

/**
 * The cursor's light on the hero's glass cards (fine pointers only, never under reduced motion): a lamp held near glass. For the cards
 * within 160px of the pointer it writes --mx / --my (px, relative to the card); fx.css paints a faint highlight into the 1px edge from them.
 * Cards farther away are cleared. Only the hero's cards take part: the testimonial cards move on their own, so a light computed from the
 * pointer would freeze on them, and the small pills and rows elsewhere are better still. Work happens in one rAF per burst of pointer or
 * scroll events, reads all rects before writing any variable (no forced recalc per card), and only over cards near the viewport.
 */
function startSpotlight(reduced: boolean): () => void {
  if (reduced || !matchMedia('(hover: hover) and (pointer: fine)').matches) return noop;
  const REACH = 160;
  const near = new Set<HTMLElement>();
  let lit = new Set<HTMLElement>();
  let px = -9999;
  let py = -9999;
  let raf = 0;

  const clear = (el: HTMLElement) => {
    el.style.removeProperty('--mx');
    el.style.removeProperty('--my');
  };
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        const el = e.target as HTMLElement;
        if (e.isIntersecting) near.add(el);
        else {
          near.delete(el);
          lit.delete(el);
          clear(el);
        }
      }
    },
    { rootMargin: '240px' },
  );
  document.querySelectorAll<HTMLElement>('[data-section="hero"] .fx-edge').forEach((el) => io.observe(el));

  function frame() {
    raf = 0;
    // reads first ...
    const hits: Array<[HTMLElement, number, number]> = [];
    near.forEach((el) => {
      const r = el.getBoundingClientRect();
      if (!r.width) return;
      const dx = Math.max(r.left - px, 0, px - r.right);
      const dy = Math.max(r.top - py, 0, py - r.bottom);
      if (dx * dx + dy * dy <= REACH * REACH) hits.push([el, px - r.left, py - r.top]);
    });
    // ... then writes
    const next = new Set<HTMLElement>();
    for (const [el, x, y] of hits) {
      el.style.setProperty('--mx', `${x.toFixed(0)}px`);
      el.style.setProperty('--my', `${y.toFixed(0)}px`);
      next.add(el);
    }
    lit.forEach((el) => {
      if (!next.has(el)) clear(el);
    });
    lit = next;
  }
  const schedule = () => {
    if (!raf) raf = requestAnimationFrame(frame);
  };
  const onMove = (event: PointerEvent) => {
    if (event.pointerType && event.pointerType !== 'mouse' && event.pointerType !== 'pen') return;
    px = event.clientX;
    py = event.clientY;
    schedule();
  };
  const onLeave = () => {
    px = py = -9999;
    schedule();
  };
  window.addEventListener('pointermove', onMove, { passive: true });
  window.addEventListener('scroll', schedule, { passive: true });
  document.documentElement.addEventListener('pointerleave', onLeave);
  return () => {
    window.removeEventListener('pointermove', onMove);
    window.removeEventListener('scroll', schedule);
    document.documentElement.removeEventListener('pointerleave', onLeave);
    io.disconnect();
    if (raf) cancelAnimationFrame(raf);
    lit.forEach(clear);
  };
}

/* ---------------------------------------------------------------- rim light on the final CTA card */

/** The rest centres of the two lobes' clusters (FinalCta.module.css, Figma's blobs): from the top-left and the bottom-right corner. */
const RIM_A = { x: 19, y: 43 };
const RIM_B = { x: 54, y: 46.5 };
/** Where a ray from the centre of a w x h box leaves it, inset by `inset` px, as a point from the box's top-left. */
function edgePoint(w: number, h: number, angle: number, inset: number): { x: number; y: number } {
  const c = Math.cos(angle);
  const s = Math.sin(angle);
  const t = Math.min(w / 2 / Math.max(Math.abs(c), 1e-6), h / 2 / Math.max(Math.abs(s), 1e-6)) - inset;
  return { x: w / 2 + c * t, y: h / 2 + s * t };
}
const wrapAngle = (a: number) => Math.atan2(Math.sin(a), Math.cos(a));

/**
 * The light on the final card's border turns around the card. Lobe A sits on the ray from the card's centre; lobe B on the opposite
 * one. The ray points at the pointer while it has moved in the last 2.5 s (fine pointers), and otherwise follows the card's pass
 * through the viewport: at the start of the pass the lobes rest in the Figma corners, and over the pass they travel half a turn.
 * The angle is eased (shortest way round); the loop sleeps when it has arrived and only runs while the card is on screen.
 * Reduced motion keeps the lobes at their corners.
 */
function startRimLight(reduced: boolean): () => void {
  const rim = document.querySelector<HTMLElement>('[data-rim]');
  if (!rim || reduced) return noop;
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const POINTER_MS = 2500;

  let visible = false;
  let raf = 0;
  let last = 0;
  let angle: number | null = null;
  let px = 0;
  let py = 0;
  let movedAt = -Infinity;
  let wakeTimer = 0;

  function frame(now: number) {
    const r = rim!.getBoundingClientRect();
    const w = r.width;
    const h = r.height;
    if (!w || !h) return;
    const home = Math.atan2(RIM_A.y - h / 2, RIM_A.x - w / 2);
    const usePointer = fine && now - movedAt < POINTER_MS;
    const progress = Math.min(1, Math.max(0, (innerHeight - r.top) / (innerHeight + h)));
    const target = usePointer ? Math.atan2(py - (r.top + h / 2), px - (r.left + w / 2)) : home + progress * Math.PI;
    if (angle === null) angle = home;
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;
    const diff = wrapAngle(target - angle);
    angle = Math.abs(diff) < 0.0008 ? target : angle + diff * (1 - Math.exp(-6 * dt));

    const a = edgePoint(w, h, angle, 2);
    const b = edgePoint(w, h, angle + Math.PI, 2);
    rim!.style.setProperty('--adx', `${(a.x - RIM_A.x).toFixed(1)}px`);
    rim!.style.setProperty('--ady', `${(a.y - RIM_A.y).toFixed(1)}px`);
    rim!.style.setProperty('--bdx', `${(b.x - (w - RIM_B.x)).toFixed(1)}px`);
    rim!.style.setProperty('--bdy', `${(b.y - (h - RIM_B.y)).toFixed(1)}px`);
    raf = Math.abs(diff) < 0.0008 ? 0 : requestAnimationFrame(frame);
  }
  function wake() {
    if (raf || !visible) return;
    last = performance.now();
    raf = requestAnimationFrame(frame);
  }
  function onMove(event: PointerEvent) {
    if (event.pointerType && event.pointerType !== 'mouse' && event.pointerType !== 'pen') return;
    px = event.clientX;
    py = event.clientY;
    movedAt = performance.now();
    window.clearTimeout(wakeTimer);
    wakeTimer = window.setTimeout(wake, POINTER_MS + 50); // hand back to the scroll position once the pointer has gone quiet
    wake();
  }

  const io = new IntersectionObserver(
    ([entry]) => {
      visible = entry.isIntersecting;
      if (visible) wake();
    },
    { rootMargin: '200px' },
  );
  io.observe(rim);
  window.addEventListener('scroll', wake, { passive: true });
  window.addEventListener('resize', wake);
  if (fine) window.addEventListener('pointermove', onMove, { passive: true });
  return () => {
    io.disconnect();
    window.removeEventListener('scroll', wake);
    window.removeEventListener('resize', wake);
    window.removeEventListener('pointermove', onMove);
    window.clearTimeout(wakeTimer);
    if (raf) cancelAnimationFrame(raf);
    for (const name of ['--adx', '--ady', '--bdx', '--bdy']) rim.style.removeProperty(name);
  };
}

export function LandingMotion() {
  useEffect(() => {
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const stops = [startOnce(reduced), startDepth(reduced), startSpotlight(reduced), startRimLight(reduced)];
    return () => stops.forEach((stop) => stop());
  }, []);
  return null;
}

/**
 * Experience core: the first lazy chunk (<= 4 KB gzipped). Imported with a bare import() by Experience.tsx once the page
 * has painted and the browser is idle. It never touches WebGL drawing; it
 *   1. publishes the tier (<html data-fx="t1">),
 *   2. runs the small DOM controllers: [data-once] one-shot reveals, [data-fx="bob"] off-screen pause, [data-depth]
 *      pointer parallax on a single shared, self-sleeping rAF loop,
 *   3. decides whether this device earns the T2 canvas, and if so hands the claimed WebGL2 contexts to the `gl` chunk.
 *
 * Nothing here is reachable from the initial bundle (see docs/experience-playbook.md and docs/design-system.md).
 */
import type { FxTier, Quality, SceneId } from './types';
import { isSceneId } from './sceneIds';

declare global {
  interface Window {
    /** Set only by the QA gate. Skips the software-renderer, memory and core-count checks. Never a URL parameter. */
    __QA_FORCE_GL?: boolean;
  }
}

export interface GlClaim {
  canvas: HTMLCanvasElement;
  gl: WebGL2RenderingContext;
  scene: SceneId;
}

export interface GlEnv {
  quality: Quality;
  reducedMotion: boolean;
  /** pointer: coarse or a narrow screen. Never `innerWidth < 820`. */
  coarse: boolean;
  /** Resolves when the main thread is idle AND no scroll happened in the last 150 ms. */
  idle(): Promise<void>;
  /** Publish the tier on <html data-fx>. */
  setFx(tier: FxTier): void;
}

export interface Boot {
  claims: GlClaim[];
  env: GlEnv;
  stop(): void;
}

const noop = () => {};
const SOFTWARE = /swiftshader|llvmpipe|softpipe|basic render/i;
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

/* ---------------------------------------------------------------- [data-fx="bob"] */

/** The idle bob and the testimonials marquee are the page's infinite CSS loops: pause them while they are off-screen. */
function startBobPause(): () => void {
  const els = document.querySelectorAll('[data-fx="bob"], [data-fx="marquee"]');
  if (!els.length) return noop;
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) e.target.setAttribute('data-paused', e.isIntersecting ? 'false' : 'true');
    },
    { rootMargin: '100px' },
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
    let g = groups.get(root);
    if (!g) groups.set(root, (g = { root, items: [], visible: false }));
    g.items.push({ el, mx, my, k, x: 0, y: 0, tx: 0, ty: 0 });
  });

  let raf = 0;
  let last = 0;

  const io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      const g = groups.get(e.target);
      if (!g) continue;
      g.visible = e.isIntersecting;
      if (!g.visible) {
        for (const it of g.items) it.tx = it.ty = 0;
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
        if (Math.abs(it.tx - it.x) < 0.05 && Math.abs(it.ty - it.y) < 0.05) {
          it.x = it.tx;
          it.y = it.ty;
        } else {
          moving = true;
        }
        it.el.style.translate = it.x === 0 && it.y === 0 ? '' : `${it.x.toFixed(2)}px ${it.y.toFixed(2)}px`;
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
        for (const it of g.items) it.tx = it.ty = 0;
        return;
      }
      const r = g.root.getBoundingClientRect();
      const nx = clamp((event.clientX - (r.left + r.width / 2)) / (r.width / 2), -1, 1);
      const ny = clamp((event.clientY - (r.top + r.height / 2)) / (r.height / 2), -1, 1);
      for (const it of g.items) {
        it.tx = nx * it.mx;
        it.ty = ny * it.my;
      }
    });
    wake();
  }
  function onLeave() {
    groups.forEach((g) => g.items.forEach((it) => (it.tx = it.ty = 0)));
    wake();
  }

  window.addEventListener('pointermove', onMove, { passive: true });
  document.documentElement.addEventListener('pointerleave', onLeave);
  return () => {
    window.removeEventListener('pointermove', onMove);
    document.documentElement.removeEventListener('pointerleave', onLeave);
    io.disconnect();
    if (raf) cancelAnimationFrame(raf);
    groups.forEach((g) => g.items.forEach((it) => (it.el.style.translate = '')));
  };
}

/* ---------------------------------------------------------------- capability probe */

function qualityFor(coarse: boolean, mid: boolean): Quality {
  const scale = Math.min(coarse ? 0.75 : 1, mid ? 0.6 : 1);
  const base = coarse ? 40 : 160;
  const maxMotes = mid ? Math.min(base, 20) : base;
  return {
    scale,
    maxMotes,
    motes: (cssWidth) => (coarse || mid ? maxMotes : cssWidth >= 2200 ? 300 : 160),
    fpsCap: coarse ? 30 : 60,
    maxPixels: coarse ? 0.9e6 : 2.6e6,
  };
}

/**
 * T2 needs: deviceMemory >= 4 (unknown is fine), hardwareConcurrency >= 4, a WebGL2 context, and a renderer that is not
 * a software rasteriser. `window.__QA_FORCE_GL === true` (set by the QA gate only) skips the memory, core-count and
 * software-renderer checks. The context is created on the page's own canvas and handed on, so it is made exactly once.
 */
function claimContexts(): GlClaim[] {
  const nav = navigator as Navigator & { deviceMemory?: number };
  const force = window.__QA_FORCE_GL === true;
  if (!force) {
    if (nav.deviceMemory !== undefined && nav.deviceMemory < 4) return [];
    if (nav.hardwareConcurrency !== undefined && nav.hardwareConcurrency < 4) return [];
  }
  const coarse = matchMedia('(pointer: coarse)').matches || window.innerWidth <= 1024;
  const claims: GlClaim[] = [];
  document.querySelectorAll<HTMLCanvasElement>('canvas[data-webgl]').forEach((canvas) => {
    const scene = canvas.dataset.webglScene;
    if (!isSceneId(scene)) return;
    let gl: WebGL2RenderingContext | null = null;
    try {
      gl = canvas.getContext('webgl2', {
        alpha: false,
        antialias: false,
        depth: false,
        stencil: false,
        preserveDrawingBuffer: false,
        powerPreference: coarse ? 'default' : 'high-performance',
      });
    } catch {
      gl = null;
    }
    if (!gl) return;
    if (!force) {
      const info = gl.getExtension('WEBGL_debug_renderer_info');
      const renderer = info ? String(gl.getParameter(info.UNMASKED_RENDERER_WEBGL)) : '';
      if (SOFTWARE.test(renderer)) {
        gl.getExtension('WEBGL_lose_context')?.loseContext();
        return;
      }
    }
    claims.push({ canvas, gl, scene });
  });
  return claims;
}

export function boot(sched: { idle(): Promise<void> }): Boot {
  const root = document.documentElement;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const nav = navigator as Navigator & { deviceMemory?: number };
  const coarse = matchMedia('(pointer: coarse)').matches || window.innerWidth <= 1024;
  const mid = (nav.deviceMemory !== undefined && nav.deviceMemory <= 4) || (nav.hardwareConcurrency ?? 8) <= 4;

  root.dataset.fx = 't1';
  const stops = [startOnce(reduced), startBobPause(), startDepth(reduced)];

  return {
    claims: claimContexts(),
    env: {
      quality: qualityFor(coarse, mid),
      reducedMotion: reduced,
      coarse,
      idle: sched.idle,
      setFx: (tier) => {
        root.dataset.fx = tier;
      },
    },
    stop: () => stops.forEach((stop) => stop()),
  };
}

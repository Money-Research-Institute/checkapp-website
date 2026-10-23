/**
 * The per-canvas runner (docs/experience-playbook.md sections 1, 3 and 4). It owns everything that is not drawing:
 *
 *  - progressive loading: the poster is the page until the first frame exists; the canvas is invisible until it has drawn
 *    and set a truthful data-webgl-state; only then does the poster fade out (and the canvas equals the poster at t = 0, scroll
 *    dimming included: it eases in over the first 0.4 s of drawn time, see sceneState());
 *  - the poster is the texture: read from the on-screen <img> (`currentSrc`, so the art-directed crop that is displayed is
 *    the one uploaded), sRGB, flipY, uploaded once and re-uploaded only if the browser swaps the crop;
 *  - pixel caps by pixels (dpr *= sqrt(max/px)), render scale + a resolution ladder driven by rAF CALLBACK cadence (not
 *    drawn frames, so the runner's own 30 fps cap is never misread as slowness) JUDGED AGAINST THE DISPLAY'S OWN PERIOD (so an
 *    OS-imposed 30 Hz callback rate, iOS Low Power Mode or a power saver, is not misread either), a give-up rule, an fps cap;
 *  - cull + pause: IntersectionObserver, visibilitychange, reduced motion (one still frame per resize, no loop);
 *  - dt <= 0.05, no preserveDrawingBuffer, no per-frame allocation, no setState;
 *  - context loss: preventDefault, poster back AT ONCE (no fade: the canvas goes dark in the same frame), state "lost", rebuild
 *    on restore;
 *  - data-webgl-luma: one 1x1 readPixels at the scene's lumaSample point after the first frame;
 *  - idle-sliced initialisation (scene load, texture upload, scene init, first frame), never within 150 ms of a scroll.
 *
 * It never throws into the page: any failure leaves the poster up and the state at "fallback".
 */
import type { GlClaim, GlEnv } from '../core';
import { SCENES } from '../scenes';
import type { Scene, SceneContext, SceneState } from '../types';

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
const noop = () => {};
const SCALE_FLOOR = 0.5;
const STEP = 0.85;
/** The scroll-exit dimming (state.exit) eases in over this many seconds of drawn time after the first frame. */
const EXIT_RAMP = 0.4;
/** Callback cadence: the first WARM_SKIP callbacks after (re)start are ignored, the next WARM_SAMPLES are measured. */
const WARM_SKIP = 4;
const WARM_SAMPLES = 12;
/** The display's period at 60 Hz, ms. A device with a faster display keeps its own period, a slower one is judged below. */
const PERIOD_60 = 1000 / 60;
/** Where a steady callback cadence is read as a 30 Hz cap (iOS Low Power Mode, power savers), ms. */
const CAP_30 = 1000 / 30;

function parsePosition(value: string | undefined): [number, number] {
  const parts = (value ?? '50% 50%').split(/\s+/).map((p) => parseFloat(p) / 100);
  const x = Number.isFinite(parts[0]) ? parts[0] : 0.5;
  const y = Number.isFinite(parts[1]) ? parts[1] : x;
  return [clamp(x, 0, 1), clamp(y, 0, 1)];
}

export function runCanvas(claim: GlClaim, env: GlEnv): () => void {
  const { canvas, gl, scene: sceneId } = claim;
  const stage = canvas.parentElement;
  const poster = stage?.querySelector<HTMLImageElement>('[data-webgl-poster]');
  if (!stage || !poster) return noop; // contract broken: the canvas stays in "fallback" and the poster stays the page

  // The section that clips the stage (overflow: clip). Scroll-exit is measured against it, see sceneState().
  const host = stage.closest('[data-section]') ?? stage;
  const fitMode = canvas.dataset.posterFit === 'contain' ? 'contain' : 'cover';
  const [posX, posY] = parsePosition(canvas.dataset.posterPos);
  const quality = env.quality;
  const baseScale = quality.scale;
  const capMs = 1000 / quality.fpsCap; // the runner's own draw cap (30 fps on coarse pointers, 60 on desktop)
  const reduceQuery = matchMedia('(prefers-reduced-motion: reduce)');
  const fineQuery = matchMedia('(hover: hover) and (pointer: fine)');

  let scene: Scene | null = null;
  let ctx: SceneContext | null = null;
  let texture: WebGLTexture | null = null;
  let uploadedSrc = '';
  const posterSize = { width: 1, height: 1 };

  let disposed = false;
  let ready = false; // first frame drawn, scene alive
  let lost = false;
  let gaveUp = false;
  let reduced = env.reducedMotion;
  let onScreen = true; // optimistic until the observer reports; the first frame is drawn either way
  let tabVisible = !document.hidden;
  let building = false;

  let cssW = 0;
  let cssH = 0;
  let scale = baseScale;
  let raf = 0;
  let lastCb = 0;
  let lastDraw = 0;
  let t = 0;
  let firstPending = true;

  // dynamic resolution. Everything is judged against `period`, the display's own callback interval, measured once per
  // (re)start in `calibrate()`: 8.3 ms on a 120 Hz screen, 16.7 on 60 Hz, 33.3 when the OS caps callbacks at 30 Hz.
  let period = PERIOD_60;
  let ema = PERIOD_60;
  let warm = 0;
  let slow = 0;
  let fast = 0;
  let stuck = 0;
  const intervals = new Float64Array(WARM_SAMPLES);
  const scratch = new Float64Array(WARM_SAMPLES);

  // pointer / scroll state handed to the scene (mutated in place)
  const state: SceneState = { pointer: { x: 0, y: 0 }, scroll: 0, exit: 0, onScreen: true };
  let targetX = 0;
  let targetY = 0;

  const setState = (s: 'running' | 'paused' | 'fallback' | 'lost') => {
    canvas.dataset.webglState = s;
  };

  /**
   * Put the poster back (`opacity` '1', or '' for the stylesheet's own) with the 0.4 s transition (fx.css) switched off for this
   * one change. After the first frame the poster sits at opacity 0, and a plain `style.opacity = '1'` would EASE it back in from
   * nothing while the canvas, which has no transition, is already gone: the floor would fade to black and back. The reflow
   * commits the new value with no transition running before the transition is handed back.
   */
  function showPosterAtOnce(opacity: string) {
    const el = poster!;
    el.style.transition = 'none';
    el.style.opacity = opacity;
    void el.offsetWidth;
    el.style.transition = '';
  }

  /* ------------------------------------------------------------ sizing */

  function measure() {
    cssW = canvas.clientWidth;
    cssH = canvas.clientHeight;
  }

  function applySize() {
    if (!cssW || !cssH) return;
    let dpr = Math.min(window.devicePixelRatio || 1, 2) * scale;
    const px = cssW * cssH * dpr * dpr;
    if (px > quality.maxPixels) dpr *= Math.sqrt(quality.maxPixels / px);
    const w = Math.max(1, Math.round(cssW * dpr));
    const h = Math.max(1, Math.round(cssH * dpr));
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }
    gl.viewport(0, 0, w, h);
    scene?.resize(cssW, cssH, w / cssW);
  }

  /* ------------------------------------------------------------ poster texture */

  async function posterLoaded(): Promise<boolean> {
    if (!poster!.complete || !poster!.naturalWidth) {
      try {
        await poster!.decode();
      } catch {
        return false;
      }
    }
    return poster!.naturalWidth > 0;
  }

  function uploadTexture() {
    if (!texture) texture = gl.createTexture();
    if (!texture) throw new Error('createTexture failed');
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
    gl.pixelStorei(gl.UNPACK_COLORSPACE_CONVERSION_WEBGL, gl.NONE);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, gl.RGBA, gl.UNSIGNED_BYTE, poster!);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
    posterSize.width = poster!.naturalWidth;
    posterSize.height = poster!.naturalHeight;
    uploadedSrc = poster!.currentSrc;
  }

  function posterFit(w: number, h: number): [number, number, number, number] {
    const c = w / h;
    const i = posterSize.width / posterSize.height;
    let sx: number;
    let sy: number;
    if (fitMode === 'cover') {
      if (c > i) [sx, sy] = [1, i / c];
      else [sx, sy] = [c / i, 1];
    } else if (c > i) [sx, sy] = [c / i, 1];
    else [sx, sy] = [1, i / c];
    return [sx, sy, (1 - sx) * posX, (1 - sy) * (1 - posY)];
  }

  /* ------------------------------------------------------------ frames */

  function sceneState() {
    // Reduced motion draws ONE still frame, and that frame is the poster: no scroll term, no pointer, at any scroll position.
    if (reduced) {
      state.scroll = 0;
      state.exit = 0;
      state.pointer.x = state.pointer.y = 0;
      state.onScreen = onScreen;
      return;
    }
    const vh = window.innerHeight;
    const r = stage!.getBoundingClientRect();
    state.scroll = clamp((vh - r.top) / (vh + r.height), 0, 1);
    // exit: how far the VISIBLE floor has scrolled out of the top. The section clips the stage, so its visible part starts at
    // max(stage top, section top). Measuring from the stage's own top breaks wherever the stage pokes out above the section
    // (a landscape phone: the 3:4 floor box is taller than the hero) and dims the very first frame by ~40 %. With the
    // section's top as the floor, exit is exactly 0 at scrollY = 0 in every layout, and unchanged where the stage sits inside.
    const h = host === stage ? r : host.getBoundingClientRect();
    const top = Math.max(r.top, h.top);
    // The dimming eases in over the first EXIT_RAMP seconds of drawn time. The poster under the first frame has no scroll term,
    // so a visitor who has already scrolled into the hero when T2 starts (it starts a few seconds after load, and again after
    // every context restore) would see the floor step 25 % darker in one frame, with the poster's own fade hidden under the
    // opaque canvas. Ramped, the canvas is the poster at t = 0 whatever the scroll position and dims into place; once the ramp
    // is done (and across every pause, `t` does not advance while paused) it is the plain scroll term.
    const k = clamp(t / EXIT_RAMP, 0, 1);
    state.exit = clamp(-top / Math.max(r.bottom - top, 1), 0, 1) * k * k * (3 - 2 * k);
    state.onScreen = onScreen;
  }

  function drawOnce(dt: number) {
    if (!scene || lost || disposed) return;
    sceneState();
    scene.draw(reduced ? 0 : t, dt, state); // reduced: t = 0, so every additive term is 0 and the frame is the poster
    if (firstPending) onFirstFrame();
  }

  function onFirstFrame() {
    firstPending = false;
    ready = true;
    try {
      const [u, v] = scene?.lumaSample ?? [0.5, 0.5];
      const px = new Uint8Array(4);
      const x = clamp(Math.round(u * (canvas.width - 1)), 0, canvas.width - 1);
      const y = clamp(Math.round(v * (canvas.height - 1)), 0, canvas.height - 1);
      gl.readPixels(x, y, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, px);
      canvas.dataset.webglLuma = ((0.2126 * px[0] + 0.7152 * px[1] + 0.0722 * px[2]) / 255).toFixed(3);
    } catch {
      /* the probe is diagnostic only */
    }
    // The state flip makes the canvas visible (fx.css) in the same task as the draw; the poster then fades out beneath it.
    setState('paused');
    poster!.style.opacity = '0';
    env.setFx('t2');
    sync();
  }

  function frame(now: number) {
    raf = 0;
    if (!shouldRun()) return;
    adapt(now - lastCb);
    lastCb = now;
    if (!shouldRun()) return; // adapt() may have given up
    // The draw gate: the runner's cap (minus a little jitter), but never above what the display delivers. On a screen whose
    // callbacks already arrive slower than the cap (30 Hz), a 31 ms gate would skip every callback that arrives 30.5 ms apart.
    if (now - lastDraw >= (period >= capMs ? period * 0.9 : capMs - 2)) {
      const dt = Math.min((now - lastDraw) / 1000, 0.05);
      lastDraw = now;
      t += dt;
      // damped pointer (frame-rate independent): x += (target - x) * (1 - e^(-k dt))
      const f = 1 - Math.exp(-4 * dt);
      state.pointer.x += (targetX - state.pointer.x) * f;
      state.pointer.y += (targetY - state.pointer.y) * f;
      drawOnce(dt);
    }
    raf = requestAnimationFrame(frame);
  }

  /**
   * The resolution ladder. A frame is "slow" relative to the display's own period, not to a fixed 24 ms: iOS Safari in Low Power
   * Mode and other power savers hand out rAF callbacks at 30 Hz (a steady 33.3 ms), which is not load, and judging it against 24 ms
   * stepped the render scale down, then killed the animation for the rest of the session.
   *   slow at   max(24, 1.4 x period)   60 Hz: 24 ms (as before) | 30 Hz: 46.7 ms (one callback missed) | 120 Hz: 24 ms
   *   stuck at  max(32, 1.9 x period)   60 Hz: 32 ms (as before) | 30 Hz: 63.3 ms
   * Slow for 30 callbacks steps the scale down one notch, slow at the floor and stuck for 90 callbacks gives up (T1), calm for
   * 240 callbacks steps back up.
   */
  function adapt(cb: number) {
    if (warm < WARM_SKIP + WARM_SAMPLES) {
      if (warm >= WARM_SKIP) intervals[warm - WARM_SKIP] = Math.min(cb, 100);
      if (++warm === WARM_SKIP + WARM_SAMPLES) calibrate();
      return;
    }
    const slowAt = Math.max(24, 1.4 * period);
    const stuckAt = Math.max(32, 1.9 * period);
    ema += (Math.min(cb, 100) - ema) * 0.1;
    if (ema > slowAt) {
      fast = 0;
      if (scale > SCALE_FLOOR + 1e-3) {
        stuck = 0;
        if (++slow > 30) {
          slow = 0;
          scale = Math.max(SCALE_FLOOR, scale * STEP);
          applySize();
          renderNow();
        }
      } else if (ema > stuckAt) {
        if (++stuck >= 90) giveUp(); // at the floor and still crawling: one still frame, carry on as T1
      } else {
        stuck = 0;
      }
    } else {
      slow = 0;
      stuck = 0;
      // Recover slowly: only after a long calm stretch, one step at a time.
      if (ema < Math.max(18, 1.08 * period) && scale < baseScale - 1e-3) {
        if (++fast > 240) {
          fast = 0;
          scale = Math.min(baseScale, scale / STEP);
          applySize();
          renderNow();
        }
      } else {
        fast = 0;
      }
    }
  }

  /**
   * Read the display's period from the callbacks measured after a (re)start: the median interval, and how steady it is (median
   * absolute deviation). A steady cadence near 33.3 ms is a 30 Hz cap, not load: the period becomes 33.3 and nothing steps down for
   * it. Anything else is judged as a 60 Hz or faster display (the period never exceeds 16.7 ms), so a device that is genuinely
   * slow from the first frame (25 ms, say) is still slow. A device locked to a steady 30 fps by its own GPU load looks exactly like
   * a capped one and keeps its resolution; 30 fps is a fine rate for an ambient floor, and any further slowdown (one more
   * missed callback, 50 ms) crosses the 30 Hz thresholds above and steps down as usual.
   */
  function calibrate() {
    const mid = WARM_SAMPLES >> 1;
    scratch.set(intervals);
    scratch.sort();
    const median = (scratch[mid - 1] + scratch[mid]) / 2;
    for (let i = 0; i < WARM_SAMPLES; i++) scratch[i] = Math.abs(intervals[i] - median);
    scratch.sort();
    const mad = (scratch[mid - 1] + scratch[mid]) / 2;
    const capped = Math.abs(median - CAP_30) <= 4 && mad <= 2.5;
    period = capped ? CAP_30 : clamp(median, 4, PERIOD_60);
    ema = median;
    slow = fast = stuck = 0;
  }

  function giveUp() {
    gaveUp = true;
    env.setFx('t1');
    sync();
  }

  /** Redraw without advancing time (after a resize cleared the buffer). */
  function renderNow() {
    if (ready) drawOnce(0);
  }

  const shouldRun = () => ready && !lost && !disposed && !gaveUp && onScreen && tabVisible && !reduced;

  function sync() {
    if (!ready || lost || disposed) return;
    if (shouldRun()) {
      if (!raf) {
        lastCb = lastDraw = performance.now();
        ema = period; // do not carry a stale cadence across a pause: measure again (the display may have changed power mode)
        warm = 0;
        slow = fast = stuck = 0;
        setState('running');
        raf = requestAnimationFrame(frame);
      }
    } else {
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
      setState('paused');
    }
  }

  /* ------------------------------------------------------------ build / rebuild */

  async function build() {
    if (building || disposed) return;
    building = true;
    try {
      await env.idle();
      const mod = await SCENES[sceneId]();
      if (disposed) return;
      if (!(await posterLoaded())) return;
      await env.idle();
      if (disposed) return;
      uploadTexture();
      const instance = mod.default();
      scene = instance;
      const sceneCtx: SceneContext = {
        gl,
        canvas,
        posterImage: poster!,
        posterTexture: texture as WebGLTexture,
        posterSize,
        posterFit,
        tier: 2,
        quality,
        reducedMotion: reduced,
      };
      ctx = sceneCtx;
      await instance.init(sceneCtx);
      if (disposed || lost) return;
      await env.idle();
      if (disposed || lost) return;
      measure();
      if (!cssW || !cssH) return;
      t = 0;
      firstPending = true;
      applySize();
      drawOnce(0);
    } catch (error) {
      if (process.env.NODE_ENV !== 'production') console.error('[experience] scene failed, keeping the poster', error);
      scene = null;
      ready = false;
      setState('fallback');
      showPosterAtOnce('');
    } finally {
      building = false;
    }
  }

  /* ------------------------------------------------------------ listeners */

  const ro = new ResizeObserver(() => {
    measure();
    if (!ready) return;
    if (reduced) debouncedStill();
    else {
      applySize();
      renderNow();
    }
  });
  ro.observe(canvas);

  let stillTimer = 0;
  function debouncedStill() {
    clearTimeout(stillTimer);
    stillTimer = window.setTimeout(() => {
      if (!ready || lost || disposed) return;
      applySize();
      renderNow(); // one still frame, no rAF
    }, 150);
  }

  const io = new IntersectionObserver(([entry]) => {
    onScreen = entry.isIntersecting;
    sync();
  });
  io.observe(canvas);

  const onVisibility = () => {
    tabVisible = !document.hidden;
    sync();
  };
  document.addEventListener('visibilitychange', onVisibility);

  const onReduce = () => {
    reduced = reduceQuery.matches;
    if (ctx) ctx.reducedMotion = reduced;
    if (reduced) {
      // Switching on mid-run: forget the running clock and the damped pointer, so the still frame is the t = 0 frame (the
      // poster), not whatever pulse phase the loop happened to be in.
      t = 0;
      targetX = targetY = 0;
    }
    sync();
    if (ready && !lost && !disposed) {
      applySize(); // the scene sizes its mote count from ctx.reducedMotion
      renderNow();
    }
  };
  reduceQuery.addEventListener('change', onReduce);

  const onLost = (event: Event) => {
    event.preventDefault();
    lost = true;
    ready = false;
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
    setState('lost'); // the canvas is invisible from this state on (fx.css), with no transition
    showPosterAtOnce('1'); // ...and the poster is simply there in the same frame: no dip to black while it fades back in
    scene = null; // its GL objects died with the context: do not dispose
    texture = null;
    env.setFx('t1');
  };
  const onRestored = () => {
    lost = false;
    firstPending = true;
    uploadedSrc = '';
    void build();
  };
  canvas.addEventListener('webglcontextlost', onLost);
  canvas.addEventListener('webglcontextrestored', onRestored);

  // The browser may swap the art-directed crop at a breakpoint: re-upload the texture in place.
  const onPosterLoad = async () => {
    if (!ready || lost || disposed || poster!.currentSrc === uploadedSrc) return;
    await env.idle();
    if (!ready || lost || disposed) return;
    uploadTexture();
    scene?.resize(cssW, cssH, canvas.width / (cssW || 1));
    renderNow();
  };
  poster.addEventListener('load', onPosterLoad);

  // Pointer: fine pointers only, never under reduced motion.
  const onPointer = (event: PointerEvent) => {
    if (reduced || !fineQuery.matches || (event.pointerType && event.pointerType === 'touch')) return;
    const r = stage.getBoundingClientRect();
    targetX = clamp(((event.clientX - r.left) / r.width) * 2 - 1, -1, 1);
    targetY = clamp(-(((event.clientY - r.top) / r.height) * 2 - 1), -1, 1);
  };
  const onPointerLeave = () => {
    targetX = targetY = 0;
  };
  window.addEventListener('pointermove', onPointer, { passive: true });
  document.documentElement.addEventListener('pointerleave', onPointerLeave);

  measure();
  void build();

  return () => {
    disposed = true;
    if (raf) cancelAnimationFrame(raf);
    clearTimeout(stillTimer);
    ro.disconnect();
    io.disconnect();
    document.removeEventListener('visibilitychange', onVisibility);
    reduceQuery.removeEventListener('change', onReduce);
    canvas.removeEventListener('webglcontextlost', onLost);
    canvas.removeEventListener('webglcontextrestored', onRestored);
    poster.removeEventListener('load', onPosterLoad);
    window.removeEventListener('pointermove', onPointer);
    document.documentElement.removeEventListener('pointerleave', onPointerLeave);
    try {
      scene?.dispose();
      if (texture) gl.deleteTexture(texture);
      gl.getExtension('WEBGL_lose_context')?.loseContext();
    } catch {
      /* already gone */
    }
    setState('fallback');
    showPosterAtOnce('');
  };
}

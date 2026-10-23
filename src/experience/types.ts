/**
 * The contract between the experience engine (src/experience) and a WebGL scene.
 * Type-only: importing this file adds nothing to any bundle.
 *
 * A scene is a plain object with five methods. The runner owns everything else: context creation, the poster texture
 * upload, pixel caps, dynamic resolution, pausing, context-loss recovery, the poster crossfade and the luma probe
 * (docs/experience-playbook.md section 4). A scene only draws.
 */

/** Add an id here, a canvas with `data-webgl-scene="<id>"`, and a factory in scenes.ts. */
export type SceneId = 'hero-floor';

export interface Quality {
  /** Starting render scale (1 desktop, 0.75 mobile, 0.6 mid-tier; the runner steps down to 0.5 under load). */
  scale: number;
  /** Mote budget at the current tier: 160 desktop, 40 mobile, <= 20 mid-tier. */
  maxMotes: number;
  /** Mote budget for a canvas of this CSS width: desktop gives 300 on ultrawide (>= 2200px). */
  motes(cssWidth: number): number;
  /** 60 desktop, 30 on coarse pointers / narrow screens. */
  fpsCap: number;
  /** Pixel budget the runner enforces on the backing store (2.6 MP desktop, 0.9 MP mobile). */
  maxPixels: number;
}

export interface SceneContext {
  gl: WebGL2RenderingContext;
  canvas: HTMLCanvasElement;
  /** The poster <img> that is on screen. Its `currentSrc` is the art-directed crop that was uploaded. */
  posterImage: HTMLImageElement;
  /**
   * The poster, uploaded by the runner: sRGB (UNPACK_COLORSPACE_CONVERSION none), premultiply off, FLIP_Y on (so a y-up
   * uv with (0,0) bottom-left samples it upright), LINEAR, CLAMP_TO_EDGE, no mipmaps. Bind it yourself.
   */
  posterTexture: WebGLTexture;
  posterSize: { width: number; height: number };
  /**
   * Cover-fit (or contain-fit, per the canvas's data-poster-fit / data-poster-pos attributes) as a vec4 for a canvas of
   * this CSS size: `texUv = canvasUv * vec2(x, y) + vec2(z, w)`, with canvasUv y-up in [0,1]. With `contain`, texUv can
   * leave [0,1]: mask it in the shader (the ultrawide hero fades to black there).
   */
  posterFit(cssWidth: number, cssHeight: number): [number, number, number, number];
  /** Always 2 in practice (T1 never reaches a scene); typed 1 | 2 so a Canvas2D tier can share the interface later. */
  tier: 1 | 2;
  quality: Quality;
  reducedMotion: boolean;
}

export interface SceneState {
  /** Damped pointer, -1..1 across the canvas, y up. Always 0,0 on touch and under reduced motion. */
  pointer: { x: number; y: number };
  /** 0..1: how far the stage has travelled through the viewport (0 entering at the bottom, 1 gone at the top). */
  scroll: number;
  /**
   * 0..1: how far the visible part of the stage has scrolled out of the top of the viewport. The stage is clipped by its
   * [data-section], so this is measured from the section's top when the stage pokes out above it: exactly 0 at scrollY = 0
   * in every layout. Always 0 under reduced motion (the single still frame is the poster). The runner eases it in over the first
   * 0.4 s of drawn time, so the first frame (the poster has no scroll term) is 0 even when the visitor is already scrolled into
   * the hero; scenes just use the value they are given.
   */
  exit: number;
  onScreen: boolean;
}

export interface Scene {
  /** Compile, link, create buffers. May return a promise (poll KHR_parallel_shader_compile; see gl/util.ts). */
  init(c: SceneContext): void | Promise<void>;
  /**
   * The canvas backing store changed. `cssWidth` x `cssHeight` are CSS pixels; `dpr` is the EFFECTIVE ratio after
   * the render scale and the pixel cap (backing store = css * dpr). The runner already called gl.viewport.
   */
  resize(cssWidth: number, cssHeight: number, dpr: number): void;
  /**
   * Draw one frame into the default framebuffer. `t` is seconds of DRAWN time since the first frame (it does not
   * advance while paused, so every additive term is exactly 0 on the first frame, where the canvas must equal the
   * poster). `dt` is clamped to 0.05. Under reduced motion this runs once per resize with t = 0, dt = 0, exit = 0 and a
   * centred pointer, whatever the scroll position: the still frame is the poster.
   */
  draw(t: number, dt: number, state: SceneState): void;
  /** Delete every GL object you created. Called on teardown, never on context loss (the context is already gone). */
  dispose(): void;
  /** Where to read the 1x1 luma probe after the first frame, in canvas uv (y up). Default [0.5, 0.5]. */
  lumaSample?: [number, number];
}

export type SceneFactory = () => Scene;

/** What the engine publishes on <html data-fx>. */
export type FxTier = 't0' | 't1' | 't2';

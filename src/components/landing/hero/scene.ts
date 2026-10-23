import { FULLSCREEN_VS, linkProgram, uniformLocations } from '@/experience/gl/util';
import type { Scene, SceneContext, SceneFactory, SceneState } from '@/experience/types';

/**
 * "hero-floor": the poster is the albedo, and the scene only ADDS light to it. The phone is the lamp.
 *
 * Frame 0 must equal the poster (the runner crossfades the poster out under the first frame, and the gate compares them),
 * so every term below is exactly 0 at t = 0 (a 1 - cos, a smoothstep ramp from 0, an event that has not fired) and only grows
 * once time runs. Under reduced motion the runner draws a single frame at t = 0, which is therefore the poster.
 *
 * Art direction (docs/landing-decisions.md D13): a quiet room, light only where the product is, one slow clock, events instead of
 * loops. So:
 *   1. the hot spot under the phone breathes (10 s, the page's one clock) and leans a hair toward the pointer;
 *   2. a volumetric shaft rises from it, with an irregular fan of faint rays inside it. Both are scaled by one slowly rising
 *      density field (value noise), so the light has a medium to live in and nothing is mirror-symmetric;
 *   3. a SCAN, once: a soft band climbs the shaft from the floor at 1.6 s (the product's own gesture), and its echo runs once out along
 *      the grid lines. It fires again only when the pointer dwells over the phone, at most once every 14 s. No loop;
 *   4. scroll-exit dimming (uExit);
 *   5. GPU motes: gl.POINTS positioned from gl_VertexID alone, few and fine, visible only where the shaft is (dust shows in light);
 *   6. static triangular dither, masked by luminance, so pure black stays black and the dark gradients do not band;
 *   7. where the poster box is narrower than the section (ultrawide) a horizontal edge fade, the twin of the CSS mask the poster
 *      carries at the same widths, so tier 0/1 and tier 2 look the same.
 * Every added term is summed as light and rolled off with a soft shoulder, so overlapping lights add up without clipping.
 *
 * Two draw calls, one texture, no loops, no vertex buffers. Per frame: 6 uniforms for the floor, 2 for the motes.
 */

const FLOOR_FS = `#version 300 es
precision highp float;
in vec2 vUv;
uniform sampler2D uTex;
uniform vec4 uFit;   // poster uv = canvas uv * fit.xy + fit.zw (cover, cropped from the top)
uniform vec2 uTexel; // 1 / poster size
uniform vec4 uP;     // x time (s), y scroll exit 0..1, z edge fade share (0 = none)
uniform vec2 uPtr;   // damped pointer, -1..1, y up
uniform float uScan; // time (s) the current scan started, -1 = none yet
out vec4 o;

const vec2 V = vec2(0.5, 0.22); // where the grid converges, in poster uv
const float ASP = 1.504;        // poster aspect (1492 x 992)

float luma(vec3 c) { return dot(c, vec3(0.2126, 0.7152, 0.0722)); }
float ign(vec2 p) { return fract(52.9829189 * fract(dot(p, vec2(0.06711056, 0.00583715)))); }
float h1(float n) { return fract(sin(n * 12.9898 + 4.1414) * 43758.5453); }
float h2(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float vn1(float x) { float i = floor(x); float f = fract(x); return mix(h1(i), h1(i + 1.0), f * f * (3.0 - 2.0 * f)); }
float vn2(vec2 p) {
  vec2 i = floor(p); vec2 f = fract(p); vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(h2(i), h2(i + vec2(1.0, 0.0)), u.x), mix(h2(i + vec2(0.0, 1.0)), h2(i + vec2(1.0, 1.0)), u.x), u.y);
}

void main() {
  vec2 uv = vUv * uFit.xy + uFit.zw;
  vec3 a = texture(uTex, uv).rgb;
  float t = uP.x;
  vec3 add = vec3(0.0); // light added to the poster, in one place so it can be rolled off together

  float l0 = luma(a);
  float l1 = luma(texture(uTex, uv + vec2(uTexel.x * 2.0, 0.0)).rgb);
  float l2 = luma(texture(uTex, uv + vec2(0.0, uTexel.y * 2.0)).rgb);
  float line = smoothstep(0.015, 0.09, l0 - 0.5 * (l1 + l2));

  // 1. the hot spot: the one slow clock (10 s), a hair of lean toward the pointer
  vec2 hc = vec2(0.5 + uPtr.x * 0.02, 0.2 + uPtr.y * 0.01);
  vec2 hd = (uv - hc) * vec2(ASP, 1.0);
  float breath = 0.5 - 0.5 * cos(0.62831853 * t);
  add += vec3(0.11, 0.30, 0.13) * (exp(-dot(hd, hd) / 0.09) * breath * 1.1);

  // 2. shaft + fan, inside one drifting density field
  float yy = uv.y - 0.2;
  float w = 0.05 + 0.32 * max(yy, 0.0);
  float sx = (uv.x - hc.x) * ASP;
  float ramp = smoothstep(0.0, 3.0, t);
  float dens = 0.62 + 0.38 * vn2(vec2(sx * 2.6 + 3.0, yy * 1.7 - t * 0.03));
  float shaft = exp(-sx * sx / (w * w)) * smoothstep(0.0, 0.06, yy) * (1.0 - smoothstep(0.34, 0.6, yy));
  add += vec3(0.5, 1.0, 0.55) * (0.11 * shaft * dens * ramp);

  float yb = uv.y - hc.y;
  float k = atan(sx, max(yb, 0.001)) * 8.0;
  float fan = smoothstep(0.38, 0.92, vn1(k) * 0.65 + vn1(k * 2.3 + 7.0) * 0.35); // irregular, never mirrored
  float reach = smoothstep(0.0, 0.05, yb) * (1.0 - smoothstep(0.22, 0.62, yb));
  add += vec3(0.45, 1.0, 0.5) * (0.085 * fan * reach * exp(-sx * sx / 0.18) * dens * ramp);

  // 3. the scan, as an event: a soft band climbs the shaft once (2.4 s), then its echo runs once out along the grid lines
  float on = step(0.0, uScan);
  float sw = clamp((t - uScan) / 2.4, 0.0, 1.0) * on;
  float sy = 0.05 + sw * 0.46;
  float dy = (uv.y - sy) / 0.016;
  float band = exp(-dy * dy) * exp(-sx * sx / (0.03 + 0.2 * sw));
  add += vec3(0.62, 1.0, 0.45) * (band * sin(3.14159265 * sw) * 0.34 * dens);
  float ph = clamp((t - uScan - 0.9) / 6.5, 0.0, 1.0) * on;
  float r = length((uv - V) * vec2(ASP, 1.0));
  float dr = (r - ph * 1.25) / 0.075;
  add += vec3(0.35, 1.0, 0.45) * (exp(-dr * dr) * sin(3.14159265 * ph) * line * 0.3);

  // soft shoulder: overlapping lights add up without clipping (about linear for small values)
  vec3 col = a + (1.0 - exp(-add * 1.4)) / 1.4;

  // 4. scroll exit
  col *= 1.0 - 0.6 * uP.y;

  // 7. ultrawide edge fade (linear, like the CSS mask)
  if (uP.z > 0.0) col *= clamp(min(vUv.x, 1.0 - vUv.x) / uP.z, 0.0, 1.0);

  // 6. static triangular dither, fading in from 0 so that frame 0 is the poster; none on pure black, weaker on bright lines
  vec2 fc = gl_FragCoord.xy;
  float n = ign(fc) + ign(fc.yx + 37.0) - 1.0;
  float L = luma(col);
  col += n * (1.0 / 255.0) * smoothstep(0.0, 0.6, t) * smoothstep(0.004, 0.03, L) * (1.0 - smoothstep(0.45, 0.85, L));

  o = vec4(clamp(col, 0.0, 1.0), 1.0);
}`;

const MOTE_VS = `#version 300 es
precision highp float;
uniform vec4 uK; // x time, y device pixel ratio, z hot spot x, w hot spot y (canvas uv)
uniform float uE; // scroll exit
out float vA;
out float vH;
float h(float n) { return fract(sin(n * 12.9898 + 4.1414) * 43758.5453); }
void main() {
  float i = float(gl_VertexID);
  float a = h(i), b = h(i + 17.0), c = h(i + 31.0), e = h(i + 53.0);
  float t = uK.x;
  float ph = fract(b + t * (0.010 + 0.016 * c)); // 0..1, rising, a full pass in 30-100 s
  float y = uK.w * 0.55 + ph * 0.5;
  float spread = 0.06 + 0.5 * ph;
  float x = uK.z + (a - 0.5) * 1.2 * spread + sin(t * 0.4 + e * 6.2832) * 0.01;
  // dust is only visible where there is light: brightest on the axis of the shaft, gone at its edges
  float q = (a - 0.5) * 1.2 * spread / (0.06 + 0.3 * ph);
  float inShaft = exp(-q * q * 0.5);
  float tw = 0.7 + 0.3 * sin(t * 1.1 + c * 40.0);
  vA = smoothstep(0.0, 0.14, ph) * (1.0 - smoothstep(0.55, 1.0, ph)) * tw * inShaft * smoothstep(0.0, 2.0, t) * (1.0 - uE);
  vH = c;
  gl_PointSize = max((1.6 + 2.0 * e) * uK.y, 3.0);
  gl_Position = vec4(x * 2.0 - 1.0, y * 2.0 - 1.0, 0.0, 1.0);
}`;

const MOTE_FS = `#version 300 es
precision mediump float;
in float vA;
in float vH;
out vec4 o;
void main() {
  float k = 1.0 - smoothstep(0.0, 1.0, length(gl_PointCoord - 0.5) * 2.0);
  o = vec4(mix(vec3(0.5, 1.0, 0.65), vec3(0.8, 1.0, 0.55), vH) * (k * k * vA * 1.5), 1.0);
}`;

type Locations<T extends string> = Record<T, WebGLUniformLocation | null>;

const FLOOR_UNIFORMS = ['uTex', 'uFit', 'uTexel', 'uP', 'uPtr', 'uScan'] as const;

/** How long a scan band takes to climb, and the shortest gap before a pointer can call another (seconds). */
const SCAN_LEN = 2.4;
const SCAN_COOLDOWN = 14;
const MOTE_UNIFORMS = ['uK', 'uE'] as const;

const heroFloor: SceneFactory = (): Scene => {
  let c: SceneContext;
  let floor: WebGLProgram | null = null;
  let motes: WebGLProgram | null = null;
  let fu = {} as Locations<(typeof FLOOR_UNIFORMS)[number]>;
  let mu = {} as Locations<(typeof MOTE_UNIFORMS)[number]>;
  let edge = 0;
  let count = 0;
  let dpr = 1;
  let hx = 0.5;
  let hy = 0.12;
  let scanAt = -1; // drawn time the current scan started; -1 until the first one
  let nextAt = 1.6; // the first scan fires when drawn time passes this, once
  let dwell = 0; // seconds the pointer has spent over the phone

  return {
    /** The bright hot spot, in canvas uv. A black first frame fails the gate. */
    lumaSample: [0.5, 0.14],

    async init(ctx) {
      c = ctx;
      const gl = ctx.gl;
      [floor, motes] = await Promise.all([
        linkProgram(gl, FULLSCREEN_VS, FLOOR_FS),
        linkProgram(gl, MOTE_VS, MOTE_FS),
      ]);
      fu = uniformLocations(gl, floor, FLOOR_UNIFORMS);
      mu = uniformLocations(gl, motes, MOTE_UNIFORMS);
      gl.useProgram(floor);
      gl.uniform1i(fu.uTex, 0);
    },

    resize(cssWidth, cssHeight, ratio) {
      const gl = c.gl;
      const f = c.posterFit(cssWidth, cssHeight);
      dpr = ratio;
      gl.useProgram(floor);
      gl.uniform4f(fu.uFit, f[0], f[1], f[2], f[3]);
      gl.uniform2f(fu.uTexel, 1 / c.posterSize.width, 1 / c.posterSize.height);
      // The poster box is narrower than the section on ultrawide: fade its sides out, as the CSS mask on the poster does.
      edge = c.canvas.getBoundingClientRect().left > 0.3 ? 0.15 : 0;
      count = c.reducedMotion ? 0 : c.quality.motes(cssWidth);
      hx = (0.5 - f[2]) / f[0];
      hy = (0.2 - f[3]) / f[1];
    },

    draw(t: number, dt: number, s: SceneState) {
      const gl = c.gl;
      // The scan is an event: once at 1.6 s, then only when the pointer dwells over the phone (centre of the stage), at most every 14 s.
      if (!c.reducedMotion) {
        dwell = Math.abs(s.pointer.x) < 0.22 && s.onScreen ? dwell + dt : 0;
        if (t >= nextAt && (scanAt < 0 || t - scanAt > SCAN_LEN)) {
          scanAt = t;
          nextAt = Infinity;
        } else if (dwell > 0.4 && (scanAt < 0 || t - scanAt > SCAN_COOLDOWN)) {
          scanAt = t;
          dwell = 0;
        }
      }
      gl.useProgram(floor);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, c.posterTexture);
      gl.uniform4f(fu.uP, t, s.exit, edge, 0);
      gl.uniform2f(fu.uPtr, s.pointer.x, s.pointer.y);
      gl.uniform1f(fu.uScan, scanAt);
      gl.drawArrays(gl.TRIANGLES, 0, 3);

      if (count > 0) {
        gl.useProgram(motes);
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.ONE, gl.ONE);
        gl.uniform4f(mu.uK, t, dpr, hx, hy);
        gl.uniform1f(mu.uE, s.exit);
        gl.drawArrays(gl.POINTS, 0, count);
        gl.disable(gl.BLEND);
      }
    },

    dispose() {
      const gl = c.gl;
      if (floor) gl.deleteProgram(floor);
      if (motes) gl.deleteProgram(motes);
      floor = motes = null;
    },
  };
};

export default heroFloor;

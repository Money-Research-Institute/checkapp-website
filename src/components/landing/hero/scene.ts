import { FULLSCREEN_VS, linkProgram, uniformLocations } from '@/experience/gl/util';
import type { Scene, SceneContext, SceneFactory, SceneState } from '@/experience/types';

/**
 * "hero-floor": the poster is the albedo, and the scene only ADDS light to it.
 *
 * Frame 0 must equal the poster (the runner crossfades the poster out under the first frame, and the gate compares them),
 * so every term below is exactly 0 at t = 0 (a sin(pi * phase), a 1 - cos, a smoothstep ramp from 0) and only grows
 * once time runs. Under reduced motion the runner draws a single frame at t = 0, which is therefore the poster.
 *
 *   1. a pulse travels outward from the vanishing point along the grid lines (about every 9 s). The lines are found in
 *      the poster itself: a 3-tap high-pass of its luminance, so no second texture is needed;
 *   2. the hot spot under the phone breathes (0.1 Hz) and leans a few percent toward the pointer;
 *   3. a faint volumetric shaft rises from it: at most 8 % luminance, and exactly 0 well below the copy;
 *   4. scroll-exit dimming (uExit);
 *   5. GPU motes: gl.POINTS positioned from gl_VertexID alone, rising through the shaft (zero CPU per frame);
 *   6. triangular dither, masked by luminance, to break 8-bit banding in the dark gradients;
 *   7. where the poster box is narrower than the section (ultrawide) a horizontal edge fade, the twin of the CSS mask
 *      the poster carries at the same widths, so tier 0/1 and tier 2 look the same.
 *
 * Two draw calls, one texture, no loops, no vertex buffers. Per frame: 5 uniforms for the floor, 2 for the motes.
 */

const FLOOR_FS = `#version 300 es
precision highp float;
in vec2 vUv;
uniform sampler2D uTex;
uniform vec4 uFit;   // poster uv = canvas uv * fit.xy + fit.zw (cover, cropped from the top)
uniform vec2 uTexel; // 1 / poster size
uniform vec4 uP;     // x time (s), y scroll exit 0..1, z edge fade share (0 = none)
uniform vec2 uPtr;   // damped pointer, -1..1, y up
out vec4 o;

const vec2 V = vec2(0.5, 0.22); // where the grid converges, in poster uv
const float ASP = 1.504;        // poster aspect (1492 x 992)

float luma(vec3 c) { return dot(c, vec3(0.2126, 0.7152, 0.0722)); }
float ign(vec2 p) { return fract(52.9829189 * fract(dot(p, vec2(0.06711056, 0.00583715)))); }

void main() {
  vec2 uv = vUv * uFit.xy + uFit.zw;
  vec3 a = texture(uTex, uv).rgb;
  float t = uP.x;
  vec3 col = a;

  // 1. travelling pulse, masked by the poster's own line luminance
  float ph = fract(t / 9.0);
  float l0 = luma(a);
  float l1 = luma(texture(uTex, uv + vec2(uTexel.x * 2.0, 0.0)).rgb);
  float l2 = luma(texture(uTex, uv + vec2(0.0, uTexel.y * 2.0)).rgb);
  float line = smoothstep(0.015, 0.09, l0 - 0.5 * (l1 + l2));
  float r = length((uv - V) * vec2(ASP, 1.0));
  float ring = exp(-pow((r - ph * 1.25) / 0.075, 2.0)) * sin(3.14159265 * ph);
  col += vec3(0.35, 1.0, 0.45) * (ring * line * 0.55);

  // 2. breathing hot spot, leaning toward the pointer
  vec2 hc = vec2(0.5 + uPtr.x * 0.05, 0.2 + uPtr.y * 0.03);
  vec2 hd = (uv - hc) * vec2(ASP, 1.0);
  float breath = 0.5 - 0.5 * cos(0.62831853 * t);
  col += vec3(0.10, 0.26, 0.12) * (exp(-dot(hd, hd) / 0.09) * breath * 0.9);

  // 3. volumetric shaft: <= 8 % luminance, zero above poster y = 0.6 (the copy is far above that)
  float yy = uv.y - 0.2;
  float w = 0.05 + 0.32 * max(yy, 0.0);
  float sx = (uv.x - hc.x) * ASP;
  float shaft = exp(-sx * sx / (w * w)) * smoothstep(0.0, 0.06, yy) * (1.0 - smoothstep(0.34, 0.6, yy));
  col += vec3(0.5, 1.0, 0.55) * (0.075 * shaft * (0.75 + 0.25 * sin(t * 0.7 + uv.y * 6.0)) * smoothstep(0.0, 2.5, t));

  // 4. scroll exit
  col *= 1.0 - 0.6 * uP.y;

  // 7. ultrawide edge fade (linear, like the CSS mask)
  if (uP.z > 0.0) col *= clamp(min(vUv.x, 1.0 - vUv.x) / uP.z, 0.0, 1.0);

  // 6. triangular dither, fading in from 0 so that frame 0 is the poster; weaker on bright lines
  vec2 fc = gl_FragCoord.xy + 5.588238 * floor(t * 24.0);
  float n = ign(fc) + ign(fc.yx + 37.0) - 1.0;
  col += n * (1.0 / 255.0) * smoothstep(0.0, 0.6, t) * (1.0 - smoothstep(0.45, 0.85, luma(col)));

  o = vec4(clamp(col, 0.0, 1.0), 1.0);
}`;

const MOTE_VS = `#version 300 es
precision highp float;
uniform vec4 uK; // x time, y device pixel ratio, z hot spot x, w hot spot y (canvas uv)
uniform float uE; // scroll exit
out float vA;
float h(float n) { return fract(sin(n * 12.9898 + 4.1414) * 43758.5453); }
void main() {
  float i = float(gl_VertexID);
  float a = h(i), b = h(i + 17.0), c = h(i + 31.0), e = h(i + 53.0);
  float t = uK.x;
  float ph = fract(b + t * (0.012 + 0.02 * c)); // 0..1, rising, a full pass in 25-80 s
  float y = uK.w * 0.55 + ph * 0.5;
  float x = uK.z + (a - 0.5) * 1.2 * (0.06 + 0.5 * ph) + sin(t * 0.5 + e * 6.2832) * 0.012;
  float tw = 0.55 + 0.45 * sin(t * 1.7 + c * 40.0);
  vA = smoothstep(0.0, 0.12, ph) * (1.0 - smoothstep(0.6, 1.0, ph)) * tw * smoothstep(0.0, 1.5, t) * (1.0 - uE);
  gl_PointSize = (1.8 + 2.0 * e) * uK.y;
  gl_Position = vec4(x * 2.0 - 1.0, y * 2.0 - 1.0, 0.0, 1.0);
}`;

const MOTE_FS = `#version 300 es
precision mediump float;
in float vA;
out vec4 o;
void main() {
  float k = 1.0 - smoothstep(0.0, 1.0, length(gl_PointCoord - 0.5) * 2.0);
  o = vec4(vec3(0.5, 1.0, 0.6) * (k * k * vA * 1.8), 1.0);
}`;

type Locations<T extends string> = Record<T, WebGLUniformLocation | null>;

const FLOOR_UNIFORMS = ['uTex', 'uFit', 'uTexel', 'uP', 'uPtr'] as const;
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

    draw(t: number, _dt: number, s: SceneState) {
      const gl = c.gl;
      gl.useProgram(floor);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, c.posterTexture);
      gl.uniform4f(fu.uP, t, s.exit, edge, 0);
      gl.uniform2f(fu.uPtr, s.pointer.x, s.pointer.y);
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

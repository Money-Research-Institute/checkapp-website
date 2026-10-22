/**
 * Small helpers for scene authors. Not used by the runner itself, so they only ship in a scene's own chunk.
 * Scenes use gl_VertexID only (no vertex buffers), no dynamic loops, and at most ~8 uniforms per frame.
 */

/** GLSL ES 3.00 vertex shader: one oversized triangle covering the screen. `vUv` is y-up, (0,0) bottom-left, 0..1 on screen. */
export const FULLSCREEN_VS = `#version 300 es
out vec2 vUv;
void main() {
  vec2 p = vec2(float((gl_VertexID << 1) & 2), float(gl_VertexID & 2));
  vUv = p;
  gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);
}`;

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

function compile(gl: WebGL2RenderingContext, type: number, source: string): WebGLShader {
  const shader = gl.createShader(type);
  if (!shader) throw new Error('createShader failed');
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  return shader;
}

/**
 * Compile and link without blocking: where KHR_parallel_shader_compile exists the link is polled (8 ms timer, never rAF,
 * so it cannot count against the reduced-motion frame budget) instead of stalling the main thread on the first query.
 * Rejects with the info log on failure; the runner then leaves the poster in place (state stays "fallback").
 */
export async function linkProgram(gl: WebGL2RenderingContext, vertex: string, fragment: string): Promise<WebGLProgram> {
  const vs = compile(gl, gl.VERTEX_SHADER, vertex);
  const fs = compile(gl, gl.FRAGMENT_SHADER, fragment);
  const program = gl.createProgram();
  if (!program) throw new Error('createProgram failed');
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);

  const parallel = gl.getExtension('KHR_parallel_shader_compile');
  if (parallel) {
    while (!gl.getProgramParameter(program, parallel.COMPLETION_STATUS_KHR)) await sleep(8);
  }
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const log = `${gl.getShaderInfoLog(vs) ?? ''}\n${gl.getShaderInfoLog(fs) ?? ''}\n${gl.getProgramInfoLog(program) ?? ''}`;
    gl.deleteProgram(program);
    gl.deleteShader(vs);
    gl.deleteShader(fs);
    throw new Error(`shader link failed: ${log.trim()}`);
  }
  gl.detachShader(program, vs);
  gl.detachShader(program, fs);
  gl.deleteShader(vs);
  gl.deleteShader(fs);
  return program;
}

/** Look up uniform locations once, by name. */
export function uniformLocations<T extends string>(
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  names: readonly T[],
): Record<T, WebGLUniformLocation | null> {
  const out = {} as Record<T, WebGLUniformLocation | null>;
  for (const name of names) out[name] = gl.getUniformLocation(program, name);
  return out;
}

/**
 * The `gl` chunk entry (<= 7 KB gzipped with the runner, scene registry excluded): loaded by Experience.tsx only when
 * `core` has claimed a WebGL2 context for a T2 device. It never runs on T0/T1.
 */
import type { GlClaim, GlEnv } from '../core';
import { runCanvas } from './runner';

export interface GlHandle {
  stop(): void;
}

export function run(claims: GlClaim[], env: GlEnv): GlHandle {
  const stops = claims.map((claim) => runCanvas(claim, env));
  return { stop: () => stops.forEach((stop) => stop()) };
}

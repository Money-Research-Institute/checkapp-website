import type { SceneFactory } from '@/experience/types';

/**
 * FOUNDATION STUB. The hero task replaces this with the "hero-floor" scene (poster-as-texture floor light, motes).
 * The engine imports this module lazily through src/experience/scenes.ts and calls the default export once per context.
 */
const heroFloor: SceneFactory = () => ({
  init() {},
  resize() {},
  draw() {},
  dispose() {},
});

export default heroFloor;

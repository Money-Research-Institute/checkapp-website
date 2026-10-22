import type { SceneFactory, SceneId } from './types';

// The ids are also listed in sceneIds.ts (the light list `core` validates against); TypeScript fails if they drift.

/**
 * Scene registry, part of the lazy `gl` chunk. Each entry is a bare import() so a scene (and its shaders) is its own
 * chunk, fetched only when a canvas asks for it. The initial bundle never references this file.
 */
export const SCENES: Record<SceneId, () => Promise<{ default: SceneFactory }>> = {
  'hero-floor': () => import('@/components/landing/hero/scene'),
};

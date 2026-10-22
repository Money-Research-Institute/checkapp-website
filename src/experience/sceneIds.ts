import type { SceneId } from './types';

/**
 * The ids a canvas may name. Kept apart from scenes.ts so `core` can validate a canvas without pulling in the registry's
 * imports. The Record type makes TypeScript fail if a SceneId is added without an entry here.
 */
const IDS: Record<SceneId, true> = { 'hero-floor': true };

export function isSceneId(id: string | undefined): id is SceneId {
  return !!id && Object.prototype.hasOwnProperty.call(IDS, id);
}

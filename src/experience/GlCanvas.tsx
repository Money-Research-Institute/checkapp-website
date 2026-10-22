import type { SceneId } from './types';

/**
 * The markup half of the engine: a server component that renders the one decorative canvas.
 *
 * Contract with the section that uses it (docs/experience-playbook.md):
 *  - The canvas and the poster `<img data-webgl-poster>` (a ds <Picture>, possibly art-directed) are SIBLINGS inside one
 *    stage element that reserves its aspect-ratio per mode, so the canvas swapping in can never shift layout.
 *  - The canvas is `inset: 0`, pointer-events none, aria-hidden, and starts with `data-webgl-state="fallback"`, which is
 *    the truth until the engine has drawn a frame. It stays invisible (src/styles/fx.css) until then.
 *  - The engine reads its texture from the poster's `currentSrc`, applies `data-poster-fit` / `data-poster-pos`, and
 *    fades the poster out only after the first drawn frame. Without JS, WebGL2, or on a software renderer the poster IS
 *    the hero.
 * Never mark the stage wrapper aria-hidden: it contains the meaningful phone image. Only this canvas is hidden.
 */
export function GlCanvas({
  scene = 'hero-floor',
  fit = 'cover',
  position = '50% 50%',
  className,
}: {
  scene?: SceneId;
  /** How the poster fills the canvas, matching the poster's object-fit. */
  fit?: 'cover' | 'contain';
  /** Matching object-position, as two percentages. */
  position?: string;
  className?: string;
}) {
  return (
    <canvas
      data-webgl=""
      data-webgl-scene={scene}
      data-webgl-state="fallback"
      data-poster-fit={fit}
      data-poster-pos={position}
      aria-hidden="true"
      className={className}
    />
  );
}

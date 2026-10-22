import type { CSSProperties } from 'react';

/**
 * The CheckApp logo: the 3D DiDi icon as a rounded tile. This is the only logo on the site;
 * it is derived from the master art by `scripts/brand/build-brand-kit.mjs` and is never redrawn,
 * recoloured or stretched here (docs/brand.md).
 *
 * Light-surface treatment (docs/landing-decisions.md D7): the cream tile is lifted off white pages with a
 * soft shadow only, no rim. From 32 px up the shadow is CSS `drop-shadow` on the plain tile. Below 32 px a
 * shadow is only blur, so those sizes use the tile with a 1 px deep-green hairline baked in.
 *
 * Server component: renders a <picture> (AVIF, WebP, PNG fallback) with explicit width and height, so it
 * reserves its space and cannot shift the layout.
 */

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

/** Keep in step with scripts/brand/kit.mjs. */
const BARE_SIZES = [40, 64, 96, 128, 256, 512] as const;
const HAIRLINE_SIZES = [16, 24, 28, 32, 48, 56, 64] as const;
const HAIRLINE_BELOW = 32;
const MIN_SIZE = 16;

/** The same shadow the tile has baked in at 32 px and up (make-tile.mjs). */
const TILE_SHADOW = 'drop-shadow(0 1px 2px rgba(20, 50, 20, 0.35))';

type Format = 'avif' | 'webp' | 'png';

function pick(ladder: readonly number[], px: number): number {
  return ladder.find((n) => n >= px) ?? ladder[ladder.length - 1];
}

function srcSet(prefix: string, ladder: readonly number[], size: number, format: Format): string {
  const one = pick(ladder, size);
  const two = pick(ladder, size * 2);
  const url = (n: number) => `${BASE}/brand/tile/${prefix}-${n}.${format}`;
  return one === two ? `${url(one)} 1x` : `${url(one)} 1x, ${url(two)} 2x`;
}

export type LogoMarkProps = {
  /** Rendered side in CSS px. UI minimum is 28; 16 is for favicons only. Default 40. */
  size?: number;
  /** True when text next to the mark already says "CheckApp" (alt is empty). False: alt is "CheckApp". Default false. */
  decorative?: boolean;
  /** Above-the-fold mark (header, hero): eager, high fetch priority. Default false: lazy. */
  priority?: boolean;
  className?: string;
};

export function LogoMark({ size = 40, decorative = false, priority = false, className }: LogoMarkProps) {
  const px = Math.max(MIN_SIZE, Math.round(size));
  const hairline = px < HAIRLINE_BELOW;
  const prefix = hairline ? 'didi-tile-hairline' : 'didi-tile';
  const ladder = hairline ? HAIRLINE_SIZES : BARE_SIZES;

  const style: CSSProperties = {
    display: 'block',
    flex: 'none',
    width: px,
    height: px,
    ...(hairline ? null : { filter: TILE_SHADOW }),
  };

  return (
    <picture>
      <source type="image/avif" srcSet={srcSet(prefix, ladder, px, 'avif')} />
      <source type="image/webp" srcSet={srcSet(prefix, ladder, px, 'webp')} />
      <img
        src={`${BASE}/brand/tile/${prefix}-${pick(ladder, px)}.png`}
        srcSet={srcSet(prefix, ladder, px, 'png')}
        width={px}
        height={px}
        alt={decorative ? '' : 'CheckApp'}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        fetchPriority={priority ? 'high' : 'auto'}
        draggable={false}
        className={className}
        style={style}
      />
    </picture>
  );
}

import type { ImgHTMLAttributes } from 'react';
import { withBasePath } from '@/lib/paths';

/**
 * An AVIF / WebP <picture> for files written by `node scripts/assets/encode.mjs` (<base>-<width>.avif / .webp).
 * Every URL goes through withBasePath, so GITHUB_PAGES_BASE_PATH builds work.
 *
 * - `base` is the public path without the width or extension, e.g. '/landing/hero/floor'.
 * - `widths` lists the encoded widths; the largest is the WebP fallback in the <img>.
 * - `sources` adds art-directed crops that win while their media query matches (the hero floor has a wide and a tall one).
 * - `priority` makes it the LCP image: eager, fetchPriority high, plus a preload hint for the AVIF set (one per art-directed
 *   source, each with its media query; the default set is preloaded when there are none or exactly one art-directed
 *   source, as `not all and <that media>`).
 *   Everything else is loading="lazy" decoding="async". Always give width and height (the intrinsic size of the
 *   largest file) so the box is reserved and nothing shifts.
 * - Extra props (data-webgl-poster, ...) pass through to the <img>.
 */
export type PictureSource = {
  media: string;
  base: string;
  widths: number[];
  sizes?: string;
};

type PictureProps = Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'srcSet' | 'sizes' | 'width' | 'height' | 'alt' | 'loading'> & {
  base: string;
  widths: number[];
  sizes?: string;
  width: number;
  height: number;
  alt: string;
  priority?: boolean;
  sources?: PictureSource[];
};

const srcSet = (base: string, widths: number[], ext: 'avif' | 'webp') =>
  [...widths]
    .sort((a, b) => a - b)
    .map((w) => `${withBasePath(`${base}-${w}.${ext}`)} ${w}w`)
    .join(', ');

export function Picture({
  base,
  widths,
  sizes = '100vw',
  width,
  height,
  alt,
  priority = false,
  sources = [],
  ...img
}: PictureProps) {
  const largest = Math.max(...widths);
  return (
    <>
      {priority ? (
        <>
          {sources.map((s) => (
            <link
              key={s.media}
              rel="preload"
              as="image"
              type="image/avif"
              media={s.media}
              imageSrcSet={srcSet(s.base, s.widths, 'avif')}
              imageSizes={s.sizes ?? sizes}
              fetchPriority="high"
            />
          ))}
          {sources.length <= 1 ? (
            <link
              rel="preload"
              as="image"
              type="image/avif"
              media={sources.length === 1 ? `not all and ${sources[0].media}` : undefined}
              imageSrcSet={srcSet(base, widths, 'avif')}
              imageSizes={sizes}
              fetchPriority="high"
            />
          ) : null}
        </>
      ) : null}
      <picture>
        {sources.map((s) => (
          <source key={`${s.media}-avif`} media={s.media} type="image/avif" srcSet={srcSet(s.base, s.widths, 'avif')} sizes={s.sizes ?? sizes} />
        ))}
        {sources.map((s) => (
          <source key={`${s.media}-webp`} media={s.media} type="image/webp" srcSet={srcSet(s.base, s.widths, 'webp')} sizes={s.sizes ?? sizes} />
        ))}
        <source type="image/avif" srcSet={srcSet(base, widths, 'avif')} sizes={sizes} />
        <source type="image/webp" srcSet={srcSet(base, widths, 'webp')} sizes={sizes} />
        <img
          src={withBasePath(`${base}-${largest}.webp`)}
          width={width}
          height={height}
          alt={alt}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          fetchPriority={priority ? 'high' : 'auto'}
          {...img}
        />
      </picture>
    </>
  );
}

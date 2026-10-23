import type { ImgHTMLAttributes } from 'react';
import { withBasePath } from '@/lib/paths';

/**
 * An AVIF / WebP <picture> for files written by `node scripts/assets/encode.mjs` (<base>-<width>.avif / .webp).
 * Every URL goes through withBasePath, so GITHUB_PAGES_BASE_PATH builds work.
 *
 * - `base` is the public path without the width or extension, e.g. '/landing/hero/phone'.
 * - `widths` lists the encoded widths; the largest is the WebP fallback in the <img>.
 * - `priority` makes it the LCP image: eager, fetchPriority high, plus a preload hint for the AVIF set.
 *   Everything else is loading="lazy" decoding="async". Always give width and height (the intrinsic size of the
 *   largest file) so the box is reserved and nothing shifts.
 * - Extra props (className, aria-hidden, ...) pass through to the <img>.
 */
type PictureProps = Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'srcSet' | 'sizes' | 'width' | 'height' | 'alt' | 'loading'> & {
  base: string;
  widths: number[];
  sizes?: string;
  width: number;
  height: number;
  alt: string;
  priority?: boolean;
};

const srcSet = (base: string, widths: number[], ext: 'avif' | 'webp') =>
  [...widths]
    .sort((a, b) => a - b)
    .map((w) => `${withBasePath(`${base}-${w}.${ext}`)} ${w}w`)
    .join(', ');

export function Picture({ base, widths, sizes = '100vw', width, height, alt, priority = false, ...img }: PictureProps) {
  const largest = Math.max(...widths);
  return (
    <>
      {priority ? (
        <link rel="preload" as="image" type="image/avif" imageSrcSet={srcSet(base, widths, 'avif')} imageSizes={sizes} fetchPriority="high" />
      ) : null}
      <picture>
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

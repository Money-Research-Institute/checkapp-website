/**
 * Cover images are Unsplash URLs written by the content factory (`coverImage` in the frontmatter, w=1200). Cards show
 * them at 300-700px wide, so on Unsplash's image CDN we ask for the width we need: a `srcset` rewrites the `w`
 * parameter. Any other host (or an unparseable value) gets no `srcset` and the original URL is used as is.
 */
const WIDTHS = [480, 800, 1200];

export function coverSrcSet(url: string): string | undefined {
  try {
    const parsed = new URL(url);
    if (parsed.hostname !== 'images.unsplash.com') return undefined;
    return WIDTHS.map((width) => {
      parsed.searchParams.set('w', String(width));
      return `${parsed.toString()} ${width}w`;
    }).join(', ');
  } catch {
    return undefined;
  }
}

/** `sizes` for the card layouts in BlogGrid / RelatedPosts: 1 column, 2 columns from 640px, 3 from 1024px. */
export const COVER_SIZES = {
  default: '(min-width: 1024px) 420px, (min-width: 640px) 50vw, 100vw',
  featured: '(min-width: 860px) 56vw, 100vw',
  compact: '(min-width: 1100px) 300px, (min-width: 560px) 50vw, 100vw',
} as const;

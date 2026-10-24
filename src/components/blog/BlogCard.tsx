import Link from 'next/link';
import { GlassCard } from '@/components/ds/GlassCard';
import type { BlogPostMeta } from '@/lib/blog';
import { COVER_SIZES, coverSrcSet } from './cover';
import { formatDate } from './format';
import styles from './BlogCard.module.css';

type Variant = 'default' | 'featured' | 'compact';

/**
 * One article in a list: cover, category, title, a short description, date and reading time.
 * The title link is stretched over the whole card (one target, one accessible name = the title); the cover is
 * decorative because the title already says what the article is.
 *
 * - `default`  the index grid card
 * - `featured` the full-width card at the top of the index (image beside the text from 860px)
 * - `compact`  the related-posts card: smaller, no description
 * `headingLevel` is 2 on the index and 3 under another heading. `priority` makes the cover eager (the first card).
 */
export function BlogCard({
  post,
  variant = 'default',
  headingLevel = 2,
  priority = false,
}: {
  post: BlogPostMeta;
  variant?: Variant;
  headingLevel?: 2 | 3;
  priority?: boolean;
}) {
  const Heading = headingLevel === 2 ? 'h2' : 'h3';

  return (
    <GlassCard
      as="article"
      padded={false}
      className={variant === 'default' ? styles.card : `${styles.card} ${styles[variant]}`}
    >
      <div className={styles.media} aria-hidden="true">
        {post.coverImage ? (
          // A plain <img>: the cover is a remote URL and the site is a static export without the image optimiser.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            className={styles.cover}
            src={post.coverImage}
            srcSet={coverSrcSet(post.coverImage)}
            sizes={COVER_SIZES[variant]}
            width={1200}
            height={675}
            alt=""
            loading={priority ? 'eager' : 'lazy'}
            decoding="async"
            fetchPriority={priority ? 'high' : 'auto'}
          />
        ) : (
          <span className={styles.initial}>{post.title.charAt(0)}</span>
        )}
      </div>

      <div className={styles.body}>
        <p className={styles.chip}>{post.category}</p>
        <Heading className={styles.title}>
          <Link href={`/blog/${post.slug}/`} className={styles.link}>
            {post.title}
          </Link>
        </Heading>
        {variant === 'compact' ? null : <p className={styles.desc}>{post.description}</p>}
        <p className={styles.meta}>
          <time dateTime={post.datePublished}>{formatDate(post.datePublished, variant === 'featured' ? 'long' : 'short')}</time>
          <span aria-hidden="true">·</span>
          <span>{post.readTime} min read</span>
        </p>
      </div>
    </GlassCard>
  );
}

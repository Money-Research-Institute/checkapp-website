import type { BlogPostMeta } from '@/lib/blog';
import { BlogCard } from './BlogCard';
import styles from './BlogGrid.module.css';

/**
 * The index list: the featured post (if any) on its own row, then everything else in a 1 / 2 / 3 column grid.
 * Static on purpose: 35 cards that fade in on a scroll timeline would leave full-page captures and print mostly blank,
 * and the page is a list people scan, not a stage.
 */
export function BlogGrid({ posts }: { posts: BlogPostMeta[] }) {
  if (posts.length === 0) {
    return <p className={styles.empty}>New articles are on the way.</p>;
  }

  const featured = posts.find((post) => post.featured);
  const rest = posts.filter((post) => post.slug !== featured?.slug);
  const first = featured ?? rest[0];

  return (
    <ul className={styles.grid} role="list">
      {featured ? (
        <li className={styles.featured}>
          <BlogCard post={featured} variant="featured" priority />
        </li>
      ) : null}
      {rest.map((post) => (
        // The eager (LCP) image is the featured card's, or the first card's when nothing is featured.
        <li key={post.slug}>
          <BlogCard post={post} priority={!featured && post === first} />
        </li>
      ))}
    </ul>
  );
}

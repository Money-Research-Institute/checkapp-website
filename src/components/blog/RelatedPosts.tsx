import { Section } from '@/components/ds/Section';
import type { BlogPostMeta } from '@/lib/blog';
import { BlogCard } from './BlogCard';
import styles from './RelatedPosts.module.css';

/** "You might also like": up to four compact cards under an h2. Renders nothing without posts. */
export function RelatedPosts({ posts }: { posts: BlogPostMeta[] }) {
  if (posts.length === 0) return null;

  return (
    <Section labelledBy="related-posts-heading">
      <div className={styles.head}>
        <h2 id="related-posts-heading" className={styles.title}>
          You might also like
        </h2>
        <p className={styles.lede}>More from the CheckApp blog: hydration, habits, and AI wellness.</p>
      </div>
      <ul className={styles.grid} role="list">
        {posts.map((post) => (
          <li key={post.slug}>
            <BlogCard post={post} variant="compact" headingLevel={3} />
          </li>
        ))}
      </ul>
    </Section>
  );
}

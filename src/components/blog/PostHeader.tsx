import Link from 'next/link';
import { ArrowRightIcon } from '@/components/ds/icons';
import { Eyebrow } from '@/components/ds/Eyebrow';
import { GradientHeading } from '@/components/ds/GradientHeading';
import type { BlogPostMeta } from '@/lib/blog';
import { formatDate } from './format';
import styles from './PostHeader.module.css';

/** The top of an article: way back to the index, category, the page's one h1 and the byline. */
export function PostHeader({ post }: { post: BlogPostMeta }) {
  return (
    <header className={styles.head}>
      <Link href="/blog/" className={styles.back}>
        <ArrowRightIcon className={styles.backIcon} />
        All articles
      </Link>

      <Eyebrow>{post.category}</Eyebrow>

      <GradientHeading as="h1" size="section" align="left" className={styles.title}>
        {post.title}
      </GradientHeading>

      <p className={styles.byline}>
        <span>By {post.author.name}</span>
        <span className={styles.sep} aria-hidden="true">·</span>
        <span>
          Last updated: <time dateTime={post.dateModified}>{formatDate(post.dateModified, 'month')}</time>
        </span>
        <span className={styles.sep} aria-hidden="true">·</span>
        <span>{post.readTime} min read</span>
      </p>
    </header>
  );
}

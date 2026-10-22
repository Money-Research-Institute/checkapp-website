import { Faq } from '@/components/ds/Faq';
import { GlassCard } from '@/components/ds/GlassCard';
import type { BlogFaq, BlogSource } from '@/lib/blog';
import styles from './PostSections.module.css';

/** "Sources": the references from the post's frontmatter, as 44px-tall external links. */
export function PostSources({ sources }: { sources: BlogSource[] }) {
  if (sources.length === 0) return null;

  return (
    <GlassCard as="section" aria-labelledby="post-sources-heading" className={styles.sources}>
      <h2 id="post-sources-heading" className={styles.heading}>
        Sources
      </h2>
      <ul className={styles.list} role="list">
        {sources.map((source) => (
          <li key={source.url}>
            <a href={source.url} target="_blank" rel="noopener noreferrer" className={styles.source}>
              {source.label}
              <span className={styles.srOnly}> (opens in a new tab)</span>
            </a>
          </li>
        ))}
      </ul>
    </GlassCard>
  );
}

/** "Frequently asked questions": the post's FAQ as the ds accordion. The same items feed the FAQPage JSON-LD. */
export function PostFaq({ items, slug }: { items: BlogFaq[]; slug: string }) {
  if (items.length === 0) return null;

  return (
    <section aria-labelledby="post-faq-heading" className={styles.faq}>
      <h2 id="post-faq-heading" className={styles.heading}>
        Frequently asked questions
      </h2>
      <Faq items={items} page={`blog/${slug}`} group="post-faq" />
    </section>
  );
}

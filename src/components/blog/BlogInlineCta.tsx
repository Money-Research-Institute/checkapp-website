import { Button } from '@/components/ds/Button';
import { GlassCard } from '@/components/ds/GlassCard';
import styles from './BlogInlineCta.module.css';

/** The nudge after the article body. Quieter than the closing banner: a glass card and one secondary button. */
export function BlogInlineCta({ slug }: { slug: string }) {
  return (
    <GlassCard as="aside" glow aria-label="Related product" className={styles.cta}>
      <p className={styles.kicker}>Try it in CheckApp</p>
      <h2 className={styles.title}>Let DiDi turn this advice into a daily habit</h2>
      <p className={styles.text}>
        Daily check-ins, photo check-ins and gentle nudges, so you don&apos;t have to remember everything yourself.
      </p>
      <Button
        href="/features/"
        variant="secondary"
        trackingPage={`blog/${slug}`}
        trackingPosition="inline"
        data-cta={`blog-${slug}-inline-features`}
      >
        See how DiDi works
      </Button>
    </GlassCard>
  );
}

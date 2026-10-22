import type { ReactNode } from 'react';
import { Eyebrow } from './Eyebrow';
import { GradientHeading } from './GradientHeading';
import styles from './SectionIntro.module.css';

/**
 * Eyebrow + gradient h2 + lede, centred. The lede sits between two [ ] brackets drawn with borders, so they follow the
 * text height at any wrap. 24px between eyebrow, heading and lede, as in the design.
 */
export function SectionIntro({
  eyebrow,
  title,
  lede,
  headingId,
  as = 'h2',
  className,
}: {
  eyebrow?: ReactNode;
  title: ReactNode;
  lede?: ReactNode;
  headingId?: string;
  as?: 'h1' | 'h2' | 'h3';
  className?: string;
}) {
  return (
    <header className={[styles.intro, className].filter(Boolean).join(' ')}>
      {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
      <GradientHeading as={as} size="section" id={headingId}>
        {title}
      </GradientHeading>
      {lede ? (
        <div className={styles.lede}>
          <span className={styles.bracket} aria-hidden="true" />
          <p>{lede}</p>
          <span className={`${styles.bracket} ${styles.right}`} aria-hidden="true" />
        </div>
      ) : null}
    </header>
  );
}

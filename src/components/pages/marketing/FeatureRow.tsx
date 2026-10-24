import type { ReactNode } from 'react';
import { CheckIcon, Eyebrow, GradientHeading } from '@/components/ds';
import styles from './FeatureRow.module.css';

/**
 * One feature: words on one side, a visual on the other (the visual drops under the words on phones). `reversed` swaps the
 * sides from 900px up. `as` picks the heading level: an h2 is a section heading (the gradient one, left aligned), an h3 sits
 * under the page's section h2.
 * The copy rises and the visual settles into place on view entry (data-fx; the default style is the finished layout).
 */
export function FeatureRow({
  as = 'h3',
  id,
  eyebrow,
  title,
  children,
  points,
  visual,
  reversed = false,
}: {
  as?: 'h2' | 'h3';
  id?: string;
  /** Optional pill above the title (the section-level rows use it). */
  eyebrow?: string;
  title: string;
  children?: ReactNode;
  /** Optional short list under the paragraph, each with a check mark. */
  points?: readonly string[];
  visual: ReactNode;
  reversed?: boolean;
}) {
  return (
    <div className={styles.row} data-reversed={reversed || undefined}>
      <div className={styles.copy} data-fx="rise">
        {eyebrow ? (
          <div className={styles.eyebrow}>
            <Eyebrow>{eyebrow}</Eyebrow>
          </div>
        ) : null}
        {as === 'h2' ? (
          <GradientHeading as="h2" size="section" align="left" id={id} className={styles.sectionTitle}>
            {title}
          </GradientHeading>
        ) : (
          <h3 id={id} className={styles.title}>
            {title}
          </h3>
        )}
        {children ? <div className={styles.text}>{children}</div> : null}
        {points?.length ? (
          <ul className={styles.points}>
            {points.map((point) => (
              <li key={point}>
                <CheckIcon className={styles.check} size={20} />
                <span>{point}</span>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
      <div className={styles.visual} data-fx="settle">
        {visual}
      </div>
    </div>
  );
}

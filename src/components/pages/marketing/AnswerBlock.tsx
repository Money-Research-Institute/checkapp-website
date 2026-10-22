import type { ReactNode } from 'react';
import styles from './AnswerBlock.module.css';

/**
 * The answer-first summary at the top of a page: one short paragraph a reader (or a search engine) can quote on its own.
 * A faint green wash with a bright left edge, so it reads as "the short version" without becoming a second hero.
 */
export function AnswerBlock({ label = 'In short', children }: { label?: string; children: ReactNode }) {
  return (
    <div className={styles.block}>
      <p className={styles.label}>{label}</p>
      <p className={styles.text}>{children}</p>
    </div>
  );
}

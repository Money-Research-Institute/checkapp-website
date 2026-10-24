import type { CSSProperties } from 'react';
import styles from './Steps.module.css';

export type Step = { title: string; text: string };

/** A numbered list of short steps. Each step is a list item with its own h3, so a screen reader hears "list, 3 items". */
export function Steps({ steps }: { steps: readonly Step[] }) {
  return (
    <ol className={styles.steps}>
      {steps.map((step, index) => (
        <li key={step.title} className={styles.step} data-fx="rise" style={{ '--i': index } as CSSProperties}>
          <span className={styles.num} aria-hidden="true">
            {index + 1}
          </span>
          <div className={styles.body}>
            <h3 className={styles.title}>{step.title}</h3>
            <p className={styles.text}>{step.text}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}

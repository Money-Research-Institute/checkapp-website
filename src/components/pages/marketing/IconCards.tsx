import type { CSSProperties, ReactNode } from 'react';
import { GlassCard } from '@/components/ds';
import styles from './IconCards.module.css';

export type IconCardItem = { title: string; icon: ReactNode; text: ReactNode };

/**
 * Three glass cards, each with a line icon, a short h3 and a sentence (stacked on phones, side by side from 800px). They carry
 * the values on /about and "you are in charge" on /features. The icon is decorative: the title says the same thing in words.
 */
export function IconCards({ items }: { items: readonly IconCardItem[] }) {
  return (
    <ul className={styles.grid}>
      {items.map((item, index) => (
        <li key={item.title} className={styles.item}>
          <GlassCard className={styles.card} data-fx="rise" style={{ '--i': index } as CSSProperties}>
            <div className={styles.inner}>
              <span className={styles.mark}>{item.icon}</span>
              <h3 className={styles.title}>{item.title}</h3>
              <p className={styles.text}>{item.text}</p>
            </div>
          </GlassCard>
        </li>
      ))}
    </ul>
  );
}

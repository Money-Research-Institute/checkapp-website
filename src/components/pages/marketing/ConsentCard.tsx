import { CheckIcon, GlassCard } from '@/components/ds';
import { LockIcon } from './icons';
import styles from './ConsentCard.module.css';

/**
 * The visual of the "your data" row on /how-it-works: a glass card with a padlock and the three things the client's data and
 * consent text promises, as a short check list. It says nothing the client's sentence does not.
 */
export function ConsentCard({ points }: { points: readonly string[] }) {
  return (
    <GlassCard glow className={styles.card}>
      <div className={styles.inner}>
        <span className={styles.mark}>
          <LockIcon size={32} />
        </span>
        <ul className={styles.list}>
          {points.map((point) => (
            <li key={point}>
              <CheckIcon className={styles.check} size={20} />
              <span>{point}</span>
            </li>
          ))}
        </ul>
      </div>
    </GlassCard>
  );
}

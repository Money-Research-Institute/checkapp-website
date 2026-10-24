import type { ReactNode } from 'react';
import { SparkleIcon } from './icons';
import styles from './Eyebrow.module.css';

/**
 * The small pill above a section heading: sparkle + label, a faint green fill and a 1.2px stroke that is brighter at
 * the top-left and bottom-right corners. `strong` is the hero's slightly denser fill.
 */
export function Eyebrow({
  children,
  strong = false,
  className,
}: {
  children: ReactNode;
  strong?: boolean;
  className?: string;
}) {
  return (
    <span className={[styles.eyebrow, 'fx-edge', strong ? styles.strong : '', className].filter(Boolean).join(' ')}>
      <SparkleIcon className={styles.icon} />
      {children}
    </span>
  );
}

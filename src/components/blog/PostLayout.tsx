import type { ReactNode } from 'react';
import styles from './PostLayout.module.css';

/**
 * The article's grid. One column below 1024px (header, inline contents, text); from 1024px a 68ch reading column and
 * a 15rem sticky contents column, the whole thing centred so an ultrawide window keeps the measure.
 */
export function PostLayout({
  header,
  aside,
  children,
}: {
  header: ReactNode;
  aside?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className={`${styles.layout} ${aside ? '' : styles.single}`}>
      <div className={styles.head}>{header}</div>
      <div className={styles.main}>{children}</div>
      {aside ? <div className={styles.aside}>{aside}</div> : null}
    </div>
  );
}

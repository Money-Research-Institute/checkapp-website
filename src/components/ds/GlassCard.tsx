import type { ElementType, HTMLAttributes, ReactNode } from 'react';
import styles from './GlassCard.module.css';

/**
 * The glass surface from the hero cards: a 6 % white fill (no backdrop blur, the design has none), a 1px stroke that
 * fades from 40 % white to nothing, and optionally the deep-green corner glows. Under prefers-contrast: more the fill
 * becomes solid. Content is the caller's.
 */
export function GlassCard({
  as: Tag = 'div',
  glow = false,
  padded = true,
  className,
  children,
  ...rest
}: {
  as?: ElementType;
  /** Two blurred #276221 ellipses at opposite corners, clipped by the card. */
  glow?: boolean;
  padded?: boolean;
  className?: string;
  children?: ReactNode;
} & Omit<HTMLAttributes<HTMLElement>, 'className' | 'children'>) {
  return (
    <Tag className={['fx-edge', styles.card, padded ? styles.padded : '', className].filter(Boolean).join(' ')} {...rest}>
      {glow ? (
        <>
          <span className={`${styles.glow} ${styles.glowA}`} aria-hidden="true" />
          <span className={`${styles.glow} ${styles.glowB}`} aria-hidden="true" />
        </>
      ) : null}
      <div className={styles.content}>{children}</div>
    </Tag>
  );
}

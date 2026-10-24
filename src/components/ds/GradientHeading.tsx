import type { HTMLAttributes, ReactNode } from 'react';
import styles from './GradientHeading.module.css';

type Size = 'hero' | 'section' | 'sub' | 'faq';

/**
 * Heading with the Figma 60-100-60 white gradient text (a solid white fallback where background-clip:text is missing,
 * CanvasText under forced-colors, solid white under prefers-contrast: more).
 * `as` picks the element (h1-h4); `size` picks the type scale: hero (64/80), section (52/72), sub, faq (left aligned).
 */
export function GradientHeading({
  as: Tag = 'h2',
  size = 'section',
  align = 'center',
  id,
  className,
  children,
  ...rest
}: {
  as?: 'h1' | 'h2' | 'h3' | 'h4';
  size?: Size;
  align?: 'center' | 'left';
  id?: string;
  className?: string;
  children: ReactNode;
} & Omit<HTMLAttributes<HTMLHeadingElement>, 'className' | 'children' | 'id'>) {
  const cls = [styles.heading, styles[size], align === 'left' ? styles.left : '', className].filter(Boolean).join(' ');
  return (
    <Tag id={id} className={cls} {...rest}>
      {children}
    </Tag>
  );
}

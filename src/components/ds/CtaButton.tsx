'use client';

import Link from 'next/link';
import type { AnchorHTMLAttributes, ReactNode } from 'react';
import { trackCtaClick } from '@/lib/analytics';
import { ArrowRightIcon } from './icons';
import styles from './CtaButton.module.css';

export type CtaButtonProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href' | 'children' | 'className'> & {
  href: string;
  children: ReactNode;
  /** nav: 56px header pill. lg: 60px hero / final CTA. bar: full-width pill in the mobile bar. */
  size?: 'nav' | 'lg' | 'bar';
  /** deep: Color/Main #276221 (nav, bar). brand: #41773c (hero and final CTA). */
  tone?: 'deep' | 'brand';
  /** Open in a new tab (an off-site link). Internal links leave this off. */
  external?: boolean;
  trackingPage?: string;
  trackingPosition?: string;
  className?: string;
};

/**
 * The gradient-free pill CTA from the Figma landing: label + 20px arrow, a clipped white ellipse that reads as light
 * under the pill (it rises 4px on hover and :focus-visible), a 1px 30 % white border, and a 0.97 press.
 * Minimum target 44px. Any data-* attribute passes through (data-critical, data-hides-cta-bar, ...).
 * Client component only for click tracking; the markup is a plain link, so it works without JS.
 */
export function CtaButton({
  href,
  children,
  size = 'lg',
  tone,
  external,
  trackingPage = 'unknown',
  trackingPosition = 'unknown',
  className,
  onClick,
  ...rest
}: CtaButtonProps) {
  const resolvedTone = tone ?? (size === 'lg' ? 'brand' : 'deep');
  const cls = [styles.cta, styles[size], resolvedTone === 'brand' ? styles.brand : styles.deep, className]
    .filter(Boolean)
    .join(' ');

  const handleClick: AnchorHTMLAttributes<HTMLAnchorElement>['onClick'] = (event) => {
    const label = typeof children === 'string' ? children : (rest['aria-label'] ?? 'cta');
    trackCtaClick(trackingPage, label, trackingPosition);
    onClick?.(event);
  };

  const content = (
    <>
      <span className={styles.light} aria-hidden="true" />
      <span className={styles.label}>{children}</span>
      <ArrowRightIcon className={styles.arrow} />
    </>
  );

  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={cls} onClick={handleClick} {...rest}>
        {content}
      </a>
    );
  }

  return (
    <Link href={href} className={cls} onClick={handleClick} {...rest}>
      {content}
    </Link>
  );
}

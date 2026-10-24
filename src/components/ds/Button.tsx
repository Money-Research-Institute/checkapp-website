'use client';

import Link from 'next/link';
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { trackCtaClick } from '@/lib/analytics';
import styles from './Button.module.css';

type CommonProps = {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'md' | 'sm';
  className?: string;
  trackingPage?: string;
  trackingPosition?: string;
};

type LinkProps = CommonProps & {
  href: string;
  external?: boolean;
  onClick?: () => void;
  'aria-label'?: string;
};

type NativeProps = CommonProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className' | 'children'> & { href?: undefined };

export type ButtonProps = LinkProps | NativeProps;

/**
 * The general-purpose button for forms and inner pages (the landing's big gradient-free pill is CtaButton).
 * With `href` it renders a link, otherwise a <button> (type="button" unless you say otherwise).
 * 44px minimum height, visible focus ring, 0.97 press.
 */
export function Button({
  children,
  variant = 'primary',
  size = 'md',
  className,
  trackingPage,
  trackingPosition,
  ...rest
}: ButtonProps) {
  const cls = [styles.button, styles[variant], styles[size], className].filter(Boolean).join(' ');

  function track() {
    if (!trackingPage) return;
    const label = typeof children === 'string' ? children : 'button';
    trackCtaClick(trackingPage, label, trackingPosition ?? 'unknown');
  }

  if ('href' in rest && rest.href !== undefined) {
    const { href, external, onClick, ...anchor } = rest as Omit<LinkProps, keyof CommonProps>;
    const handle = () => {
      track();
      onClick?.();
    };
    if (external) {
      return (
        <a href={href} target="_blank" rel="noopener noreferrer" className={cls} onClick={handle} {...anchor}>
          {children}
        </a>
      );
    }
    return (
      <Link href={href} prefetch={false} className={cls} onClick={handle} {...anchor}>
        {children}
      </Link>
    );
  }

  const { onClick, type = 'button', ...native } = rest as Omit<NativeProps, keyof CommonProps>;
  return (
    <button
      {...native}
      type={type}
      className={cls}
      onClick={(event) => {
        track();
        onClick?.(event);
      }}
    >
      {children}
    </button>
  );
}

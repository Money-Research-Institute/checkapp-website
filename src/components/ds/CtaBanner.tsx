import type { ReactNode } from 'react';
import { APP_DOWNLOAD_URL } from '@/lib/constants';
import { CtaButton } from './CtaButton';
import { GradientHeading } from './GradientHeading';
import { GlassCard } from './GlassCard';
import styles from './CtaBanner.module.css';

/**
 * The closing call to action of an inner page: a glass card with a headline, one line of support and the big pill.
 * Copy follows docs/landing-decisions.md D1: a wellness companion, no medical claims.
 */
export function CtaBanner({
  headline = 'A small daily check-in with DiDi',
  subheadline = 'DiDi is waiting for you.',
  label = 'Get checkapp',
  href = APP_DOWNLOAD_URL,
  page = 'unknown',
  position = 'banner',
  children,
}: {
  headline?: string;
  subheadline?: string;
  label?: string;
  href?: string;
  page?: string;
  position?: string;
  children?: ReactNode;
}) {
  return (
    <GlassCard glow className={styles.banner}>
      <div className={styles.inner}>
        <GradientHeading as="h2" size="section">
          {headline}
        </GradientHeading>
        <p className={styles.sub}>{subheadline}</p>
        <CtaButton href={href} size="lg" trackingPage={page} trackingPosition={position}>
          {label}
        </CtaButton>
        {children}
      </div>
    </GlassCard>
  );
}

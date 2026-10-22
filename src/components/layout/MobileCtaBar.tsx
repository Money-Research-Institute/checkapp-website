'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { CtaButton } from '@/components/ds/CtaButton';
import { APP_DOWNLOAD_URL } from '@/lib/constants';
import styles from './MobileCtaBar.module.css';

/**
 * Sticky download bar for phones (hidden from md up). It is 72px tall (`--cta-bar-h`, plus the home-indicator inset) and
 * the page reserves exactly that space. It gets out of the way while any element marked `data-hides-cta-bar` (the hero's
 * and the final section's own CTA) is on screen, so two buttons never stack. Hidden means inert too.
 */
function Bar({ label }: { label: string }) {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const targets = document.querySelectorAll('[data-hides-cta-bar]');
    if (!targets.length || !('IntersectionObserver' in window)) return;
    const showing = new Set<Element>();
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) showing.add(entry.target);
        else showing.delete(entry.target);
      }
      setHidden(showing.size > 0);
    });
    targets.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <div className={styles.bar} data-hidden={hidden || undefined} inert={hidden}>
      <CtaButton href={APP_DOWNLOAD_URL} size="bar" trackingPage="mobile-bar" trackingPosition="sticky-bottom">
        {label}
      </CtaButton>
    </div>
  );
}

export function MobileCtaBar({ label }: { label: string }) {
  // A new page has new targets: remount so the hidden flag starts fresh.
  const pathname = usePathname();
  return <Bar key={pathname} label={label} />;
}

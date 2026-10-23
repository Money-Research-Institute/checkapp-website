'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { CtaButton } from '@/components/ds/CtaButton';
import { APP_DOWNLOAD_URL } from '@/lib/constants';
import styles from './MobileCtaBar.module.css';

/**
 * Sticky download bar for phones (hidden from md up). It is 72px tall (`--cta-bar-h`, plus the home-indicator inset) and
 * the page reserves exactly that space. It gets out of the way while any element marked `data-hides-cta-bar` (the hero's
 * and the final section's own CTA) is on screen, so two buttons never stack, and while the cookie notice is open (that
 * has its own buttons and the same corner of the screen). Hidden means inert too.
 *
 * On a landing page the bar is server-rendered HIDDEN (`startHidden`): the hero's own CTA is in the first view, so showing
 * the bar in the first painted frame and sliding it away after hydration would put two "Get checkapp" buttons on screen
 * and make the bottom edge flicker. The first answer from the observer never animates (it only settles the state the
 * server guessed); every later change slides.
 */
function Bar({ label, startHidden }: { label: string; startHidden: boolean }) {
  const [hidden, setHidden] = useState(startHidden);
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    const targets = document.querySelectorAll('[data-hides-cta-bar]');
    if (!targets.length || !('IntersectionObserver' in window)) {
      // Nothing to wait for. The bar was hidden only because a landing page was expected: show it.
      const frame = requestAnimationFrame(() => setHidden(false));
      return () => cancelAnimationFrame(frame);
    }
    const showing = new Set<Element>();
    let first = true;
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) showing.add(entry.target);
        else showing.delete(entry.target);
      }
      setHidden(showing.size > 0);
      if (first) first = false;
      else setAnimate(true);
    });
    targets.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <div className={styles.bar} data-hidden={hidden || undefined} data-animate={animate || undefined} inert={hidden}>
      <CtaButton href={APP_DOWNLOAD_URL} size="bar" trackingPage="mobile-bar" trackingPosition="sticky-bottom">
        {label}
      </CtaButton>
    </div>
  );
}

export function MobileCtaBar({ label, startHidden }: { label: string; startHidden: boolean }) {
  // A new page has new targets: remount so the hidden flag starts fresh.
  const pathname = usePathname();
  return <Bar key={pathname} label={label} startHidden={startHidden} />;
}

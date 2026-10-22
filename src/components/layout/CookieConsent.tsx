'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { setAnalyticsConsent } from '@/lib/analytics';
import styles from './CookieConsent.module.css';

const KEY = 'cookie-consent';

/**
 * Cookie notice. Same storage key as before ('cookie-consent' = 'accepted' | 'declined'). It appears once the browser is
 * idle (never competing with the first paint or the hero), sits above the mobile CTA bar, and is compact on phones so it
 * cannot cover the hero's call to action.
 */
export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (localStorage.getItem(KEY)) return;
    } catch {
      return; // storage blocked: do not nag on every page
    }
    const show = () => setVisible(true);
    if (typeof window.requestIdleCallback === 'function') {
      const id = window.requestIdleCallback(show, { timeout: 3500 });
      return () => window.cancelIdleCallback(id);
    }
    const id = window.setTimeout(show, 3500);
    return () => window.clearTimeout(id);
  }, []);

  function choose(choice: 'accepted' | 'declined') {
    try {
      localStorage.setItem(KEY, choice);
    } catch {
      /* storage blocked */
    }
    setAnalyticsConsent(choice);
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className={styles.wrap} role="dialog" aria-label="Cookie consent">
      <div className={`fx-edge ${styles.card}`}>
        <p className={styles.text}>
          We use cookies to improve your experience and understand site traffic.{' '}
          <Link href="/privacy/" className={styles.link}>
            Privacy policy
          </Link>
        </p>
        <div className={styles.actions}>
          <button type="button" className={`${styles.btn} ${styles.secondary}`} onClick={() => choose('declined')}>
            Necessary only
          </button>
          <button type="button" className={`${styles.btn} ${styles.primary}`} onClick={() => choose('accepted')}>
            Accept all
          </button>
        </div>
      </div>
    </div>
  );
}

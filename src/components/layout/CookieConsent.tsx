'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import type { Dict } from '@/i18n';
import { setAnalyticsConsent } from '@/lib/analytics';
import styles from './CookieConsent.module.css';

const KEY = 'cookie-consent';

/**
 * Cookie notice. Same storage key as before ('cookie-consent' = 'accepted' | 'declined'). It appears after the first real
 * input (or 8 s), never at load, so it cannot cover the hero's call to action unprompted. It sits above the mobile CTA bar
 * and is compact on phones and on short landscape screens.
 */
export function CookieConsent({ dict }: { dict: Dict['cookie'] }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (localStorage.getItem(KEY)) return;
    } catch {
      return; // storage blocked: do not nag on every page
    }
    // Show after the first real input (pointer, key, wheel, touch), or after 8 s of reading at the latest. Never at load:
    // the notice must not sit on top of the hero's call to action before anyone has touched the page.
    const events = ['pointerdown', 'keydown', 'wheel', 'touchstart'] as const;
    const show = () => setVisible(true);
    const timer = window.setTimeout(show, 8000);
    events.forEach((name) => window.addEventListener(name, show, { once: true, passive: true }));
    return () => {
      window.clearTimeout(timer);
      events.forEach((name) => window.removeEventListener(name, show));
    };
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
    <div className={styles.wrap} role="dialog" aria-label={dict.label}>
      <div className={`fx-edge ${styles.card}`}>
        <p className={styles.text}>
          {dict.text}{' '}
          <Link href="/privacy/" className={styles.link}>
            {dict.privacy}
          </Link>
        </p>
        <div className={styles.actions}>
          <button type="button" className={`${styles.btn} ${styles.secondary}`} onClick={() => choose('declined')}>
            {dict.necessary}
          </button>
          <button type="button" className={`${styles.btn} ${styles.primary}`} onClick={() => choose('accepted')}>
            {dict.accept}
          </button>
        </div>
      </div>
    </div>
  );
}

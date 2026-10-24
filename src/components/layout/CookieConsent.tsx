'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import type { Dict } from '@/i18n';
import { setAnalyticsConsent } from '@/lib/analytics';
import styles from './CookieConsent.module.css';

const KEY = 'cookie-consent';

/**
 * Cookie notice. Same storage key as before ('cookie-consent' = 'accepted' | 'declined'). It appears after the first real
 * input (or 8 s), never at load, so it cannot cover the hero's call to action unprompted.
 *
 * Three promises about where it sits:
 *  - it owns the bottom edge: while it is open it sets `data-consent-open` on <html> and the phone CTA bar steps aside
 *    (the notice has buttons of its own), so the two never stack;
 *  - it is a slim card on phones and a one-row strip on short landscape screens;
 *  - it never lies on top of a `data-critical` element (headline, primary CTA, nav). If the first input arrives while the
 *    card would cover one (a landscape phone, a 320 x 568 screen in Russian), the card is held back, laid out but invisible,
 *    and appears as soon as scrolling or resizing clears the way. Once it has appeared it stays.
 */
export function CookieConsent({ dict }: { dict: Dict['cookie'] }) {
  const [armed, setArmed] = useState(false);
  const [clear, setClear] = useState(false);
  const [answered, setAnswered] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      if (localStorage.getItem(KEY)) return;
    } catch {
      return; // storage blocked: do not nag on every page
    }
    // Show after the first real input (pointer, key, wheel, touch), or after 8 s of reading at the latest. Never at load:
    // the notice must not sit on top of the hero's call to action before anyone has touched the page.
    const events = ['pointerdown', 'keydown', 'wheel', 'touchstart'] as const;
    const arm = () => setArmed(true);
    const timer = window.setTimeout(arm, 8000);
    events.forEach((name) => window.addEventListener(name, arm, { once: true, passive: true }));
    return () => {
      window.clearTimeout(timer);
      events.forEach((name) => window.removeEventListener(name, arm));
    };
  }, []);

  // Held back until the card's box is clear of every data-critical element.
  useEffect(() => {
    if (!armed || answered || clear) return;
    let frame = 0;
    const measure = () => {
      frame = 0;
      const card = cardRef.current?.getBoundingClientRect();
      if (!card) return;
      const covers = Array.from(document.querySelectorAll('[data-critical]')).some((el) => {
        const r = el.getBoundingClientRect();
        return r.width > 0 && r.height > 0 && r.left < card.right && r.right > card.left && r.top < card.bottom && r.bottom > card.top;
      });
      if (!covers) setClear(true);
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };
    schedule();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
    };
  }, [armed, answered, clear]);

  const open = armed && clear && !answered;

  // The phone CTA bar reads this flag (MobileCtaBar.module.css).
  useEffect(() => {
    if (!open) return;
    const root = document.documentElement;
    root.setAttribute('data-consent-open', '');
    return () => root.removeAttribute('data-consent-open');
  }, [open]);

  function choose(choice: 'accepted' | 'declined') {
    try {
      localStorage.setItem(KEY, choice);
    } catch {
      /* storage blocked */
    }
    setAnalyticsConsent(choice);
    setAnswered(true);
  }

  if (!armed || answered) return null;

  return (
    <div className={styles.wrap} role="dialog" aria-label={dict.label} data-held={clear ? undefined : ''}>
      <div ref={cardRef} className={`fx-edge ${styles.card}`}>
        <p className={styles.text}>
          {dict.text}{' '}
          <Link href="/privacy/" prefetch={false} className={styles.link}>
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

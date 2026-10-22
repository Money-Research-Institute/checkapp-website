'use client';

import { useEffect, useState } from 'react';
import { APP_SCHEME_CALLBACK } from '@/lib/constants';
import styles from './forms.module.css';

type Phase = 'opening' | 'redirecting' | 'fallback';

const FALLBACK =
  'If CheckApp did not open, install the Android APK from the download page, then tap the email link again.';

const MESSAGE: Record<Phase, string> = {
  opening: 'Opening CheckApp…',
  redirecting: 'Redirecting to the app…',
  fallback: FALLBACK,
};

const MOBILE_UA = /Android|iPhone|iPad|iPod/i;
const DESKTOP_CLASS_UA = /Macintosh|X11|Linux/i;

/**
 * Only a phone or tablet can have the app. A desktop browser has no handler for checkapp://: Chrome only logs a failed
 * launch, Firefox replaces the page with an "address wasn't understood" error. "Request desktop site" on Android and
 * iPadOS Safari send a desktop user agent from a multi-touch device (5 touch points; a mouse-only desktop reports 0), so
 * those still forward.
 */
function canHaveTheApp() {
  const ua = navigator.userAgent;
  return MOBILE_UA.test(ua) || (DESKTOP_CLASS_UA.test(ua) && navigator.maxTouchPoints > 1);
}

/**
 * The live half of /auth/callback.
 *
 * Supabase recovery / confirm emails often fall back to the Site URL (checkapp.today) instead of opening the Android
 * app. This forwards the query string and the hash (that is where the session tokens are) into the custom scheme, so
 * the installed APK can complete the session, and says what is happening. If nothing has taken over after 1.5 s the app
 * is probably not installed, so the message turns into the fallback. The tokens are only ever passed to the scheme:
 * they are not logged, stored or sent anywhere.
 *
 * On a device that cannot have the app (a desktop browser) the launch is skipped and the fallback shows at once: the
 * launch can only fail there, and the browser reports each failure as a console error.
 */
export function CallbackStatus() {
  const [phase, setPhase] = useState<Phase>('opening');

  useEffect(() => {
    // State is set from timers, not synchronously in the effect (that would render twice before the redirect starts).
    const timers: number[] = [];

    if (canHaveTheApp()) {
      const deepLink = `${APP_SCHEME_CALLBACK}${window.location.search}${window.location.hash}`;
      timers.push(window.setTimeout(() => setPhase('redirecting'), 0));
      window.location.replace(deepLink);
      timers.push(window.setTimeout(() => setPhase('fallback'), 1500));
    } else {
      timers.push(window.setTimeout(() => setPhase('fallback'), 0));
    }

    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, []);

  return (
    <div className={styles.statusBox}>
      <span className={styles.spinner} data-stopped={phase === 'fallback' || undefined} aria-hidden="true" />
      <div className={styles.statusText}>
        <p className={styles.statusLive} role="status" aria-live="polite">
          {MESSAGE[phase]}
        </p>
        {/* Invisible copy of the longest message: it keeps the card's height constant (see forms.module.css). */}
        <p className={styles.statusSizer} aria-hidden="true">
          {FALLBACK}
        </p>
      </div>
    </div>
  );
}

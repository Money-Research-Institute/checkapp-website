'use client';

import { useEffect, useState } from 'react';
import { APP_SCHEME_CALLBACK } from '@/lib/constants';

/**
 * Supabase recovery/confirm often falls back to Site URL (checkapp.today)
 * instead of opening the Android app. This page forwards query + hash into
 * the custom scheme so the installed APK can complete the session.
 */
export default function AuthCallbackPage() {
  const [status, setStatus] = useState('Opening CheckApp…');

  useEffect(() => {
    const search = window.location.search;
    const hash = window.location.hash;
    const deepLink = `${APP_SCHEME_CALLBACK}${search}${hash}`;
    setStatus('Redirecting to the app…');
    window.location.replace(deepLink);

    const timer = window.setTimeout(() => {
      setStatus(
        'If CheckApp did not open, install the Android APK from the download page, then tap the email link again.',
      );
    }, 1500);

    return () => window.clearTimeout(timer);
  }, []);

  return (
    <main className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center px-6 py-16 text-center">
      <p className="text-sm font-semibold uppercase tracking-wide text-primary">CheckApp</p>
      <h1 className="mt-3 font-display text-3xl font-bold text-text-primary">Signing you in</h1>
      <p className="mt-4 text-text-secondary">{status}</p>
      <a
        href="/download/"
        className="mt-8 text-sm font-semibold text-primary underline underline-offset-4"
      >
        Download the Android app
      </a>
    </main>
  );
}

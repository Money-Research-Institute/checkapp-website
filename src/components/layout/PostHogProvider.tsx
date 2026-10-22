'use client';

import { useEffect } from 'react';
import { initPostHog } from '@/lib/analytics';

/** Starts analytics when the browser is idle. Renders nothing. */
export function PostHogProvider() {
  useEffect(() => {
    initPostHog();
  }, []);

  return null;
}

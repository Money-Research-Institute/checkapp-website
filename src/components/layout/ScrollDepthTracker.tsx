'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { trackEvent } from '@/lib/analytics';

const MILESTONES = [25, 50, 75, 100];

export function ScrollDepthTracker() {
  const pathname = usePathname();

  useEffect(() => {
    // No analytics key, no scroll listener.
    if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) return;
    const reached = new Set<number>();

    function handleScroll() {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight <= 0) return;

      const percent = Math.min(100, Math.round((scrollTop / docHeight) * 100));

      for (const milestone of MILESTONES) {
        if (percent >= milestone && !reached.has(milestone)) {
          reached.add(milestone);
          trackEvent('scroll_depth', { page: pathname, percent: milestone });
        }
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [pathname]);

  return null;
}

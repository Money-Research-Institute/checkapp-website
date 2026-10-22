'use client';

import { useEffect } from 'react';
import type { FxTier } from './types';

/**
 * The experience island. Mounted once, at the end of the landing page (so /blog, /privacy and the rest pay nothing).
 * Renders nothing. Its whole job is to decide WHEN to pull in the two lazy chunks, with bare import() calls (not
 * next/dynamic, which emits preloads), so WebGL stays out of the initial bundle and out of LCP:
 *
 *   1. cheap pre-probe (saveData, deviceMemory <= 2, hardwareConcurrency <= 2, forced-colors): fail = CSS only, no fetch;
 *   2. wait for the LCP entry (window load + 3 s at the latest), then requestIdleCallback (2 s timeout), and a quiet
 *      scroll (no scroll event for 150 ms);
 *   3. import('./core'): tier, [data-once], [data-depth], bob pause, and the claim of a WebGL2 context for T2;
 *   4. only if a context was claimed: import('./gl'): the runner and the scene registry.
 *
 * `window.__QA_FORCE_GL === true` (the gate sets it) skips the memory / core-count checks here and in core. There is no
 * URL-parameter or storage override, by design.
 */
export function Experience() {
  useEffect(() => {
    const root = document.documentElement;
    let cancelled = false;
    const cleanups: Array<() => void> = [];

    let lastScroll = 0;
    const onScroll = () => {
      lastScroll = performance.now();
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    cleanups.push(() => window.removeEventListener('scroll', onScroll));

    /** Idle AND scroll-quiet: every initialisation slice waits on this. */
    const idle = () =>
      new Promise<void>((resolve) => {
        const attempt = () => {
          const wait = 150 - (performance.now() - lastScroll);
          if (wait > 0) setTimeout(attempt, wait + 1);
          else resolve();
        };
        if ('requestIdleCallback' in window) requestIdleCallback(attempt, { timeout: 2000 });
        else setTimeout(attempt, 200);
      });

    /** Resolves after the first LCP entry, or 3 s after window load if the browser has no LCP observer. */
    const afterLcp = () =>
      new Promise<void>((resolve) => {
        let po: PerformanceObserver | undefined;
        let timer = 0;
        let done = false;
        const finish = () => {
          if (done) return;
          done = true;
          clearTimeout(timer);
          po?.disconnect();
          resolve();
        };
        const arm = () => {
          timer = window.setTimeout(finish, 3000);
          try {
            po = new PerformanceObserver((list) => {
              if (list.getEntries().length) finish();
            });
            po.observe({ type: 'largest-contentful-paint', buffered: true });
          } catch {
            /* no LCP support: the timeout decides */
          }
        };
        if (document.readyState === 'complete') arm();
        else window.addEventListener('load', arm, { once: true });
        cleanups.push(finish);
      });

    const setFx = (tier: FxTier) => {
      root.dataset.fx = tier;
    };

    (async () => {
      const nav = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };
      const force = (window as Window & { __QA_FORCE_GL?: boolean }).__QA_FORCE_GL === true;
      const lowEnd =
        !!nav.connection?.saveData ||
        matchMedia('(forced-colors: active)').matches ||
        (!force &&
          ((nav.deviceMemory !== undefined && nav.deviceMemory <= 2) ||
            (nav.hardwareConcurrency !== undefined && nav.hardwareConcurrency <= 2)));
      if (lowEnd) {
        setFx('t0');
        return;
      }

      await afterLcp();
      if (cancelled) return;
      await idle();
      if (cancelled) return;

      const core = await import('./core');
      if (cancelled) return;
      const boot = core.boot({ idle });
      cleanups.push(boot.stop);
      if (!boot.claims.length) return; // T1: no WebGL2, a software renderer, or fewer than 4 cores / 4 GB

      const { run } = await import('./gl');
      if (cancelled) return;
      const handle = run(boot.claims, boot.env);
      cleanups.push(handle.stop);
    })().catch(() => {
      /* the page is already complete without any of this */
    });

    return () => {
      cancelled = true;
      cleanups.forEach((fn) => fn());
    };
  }, []);

  return null;
}

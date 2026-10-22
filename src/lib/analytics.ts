'use client';

/**
 * Analytics, off the critical path.
 *
 * posthog-js is ~100 KB gzipped, so it is NOT imported statically: `initPostHog()` loads it with a dynamic
 * import() on idle, events fired before it arrives are queued and replayed, and nothing is initialised or captured
 * when the visitor chose "Necessary only" (localStorage 'cookie-consent' === 'declined').
 */

type Props = Record<string, string | number | boolean>;
type PostHog = typeof import('posthog-js').default;

const CONSENT_KEY = 'cookie-consent';
const MAX_QUEUE = 50;

let client: PostHog | null = null;
let loading: Promise<void> | null = null;
const queue: Array<{ event: string; properties?: Props }> = [];

function declined(): boolean {
  try {
    return localStorage.getItem(CONSENT_KEY) === 'declined';
  } catch {
    return false;
  }
}

function load(): Promise<void> {
  if (client || loading) return loading ?? Promise.resolve();
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  if (!key || typeof window === 'undefined' || declined()) return Promise.resolve();

  loading = import('posthog-js')
    .then(({ default: posthog }) => {
      posthog.init(key, {
        api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST ?? 'https://us.i.posthog.com',
        capture_pageview: 'history_change',
      });
      client = posthog;
      for (const item of queue.splice(0)) posthog.capture(item.event, item.properties);
    })
    .catch(() => {
      /* blocked by an extension or offline: analytics is optional */
    });
  return loading;
}

/** Load PostHog once the browser is idle (called by PostHogProvider). Safe to call repeatedly. */
export function initPostHog() {
  if (typeof window === 'undefined' || declined()) return;
  const run = () => void load();
  if ('requestIdleCallback' in window) window.requestIdleCallback(run, { timeout: 4000 });
  else setTimeout(run, 1500);
}

/** The visitor changed their mind in the cookie banner. */
export function setAnalyticsConsent(choice: 'accepted' | 'declined') {
  if (choice === 'declined') {
    queue.length = 0;
    client?.opt_out_capturing();
  } else {
    client?.opt_in_capturing();
    initPostHog();
  }
}

export function trackEvent(event: string, properties?: Props) {
  if (typeof window === 'undefined' || declined()) return;
  if (client) {
    client.capture(event, properties);
    return;
  }
  if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) return;
  if (queue.length < MAX_QUEUE) queue.push({ event, properties });
}

export function trackCtaClick(page: string, buttonLabel: string, position: string) {
  trackEvent('cta_click', { page, button_label: buttonLabel, position });
  const label = buttonLabel.toLowerCase();
  if (label.includes('download') || label.includes('get checkapp') || label.includes('free')) {
    trackEvent('app_download_click', { source_page: page, source_component: position });
  }
}

export function trackFaqOpen(page: string, question: string) {
  trackEvent('faq_open', { page, question });
}

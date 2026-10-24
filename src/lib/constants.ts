/**
 * Download CTAs on the marketing site.
 * - APP_DOWNLOAD_URL: where "Download Free" buttons go (landing page).
 * - ANDROID_APK_URL: direct file under /public/downloads/ (GitHub Pages static).
 * Flip ANDROID_APK_AVAILABLE to true after placing the production APK file.
 */
export const APP_DOWNLOAD_URL = '/download/';

/** The Russian twin of the download page: where the main call to action of `/ru/` goes (see `localizeHref` in paths.ts). */
export const RUSSIAN_DOWNLOAD_PATH = '/ru/download/';

/**
 * Direct APK for Android (Kave EAS build fd763319, 2026-08).
 * File is ~148MB so it cannot live in this GitHub Pages repo (100MB limit).
 * Expo artifact URL redirects to the current signed download.
 */
export const ANDROID_APK_URL =
  'https://expo.dev/artifacts/eas/vM-woNWpQSlcW9zVvL_YgVBhmfMa2nQHmLAB92fSVl8.apk';

export const ANDROID_APK_AVAILABLE = true;

/** Set when the Play Store listing is live; leave null until then. */
export const PLAY_STORE_URL: string | null = null;

/** @deprecated Use APP_DOWNLOAD_URL */
export const TESTFLIGHT_URL = APP_DOWNLOAD_URL;

/** Deep link used after password-recovery / email confirm. */
export const APP_SCHEME_CALLBACK = 'checkapp://auth/callback';

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://checkapp.today';

/** Public Supabase project — same backend as the Android app. Anon key is safe in the browser. */
export const SUPABASE_URL = 'https://gzcxxbukqvpolrtwjpam.supabase.co';
export const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd6Y3h4YnVrcXZwb2xydHdqcGFtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAwNDg5OTYsImV4cCI6MjA5NTYyNDk5Nn0.1X0pHRRK5j8WD17bc9av-puws6qk0cI59kXxCdhTQU0';

export const ACCOUNT_DELETION_PATH = '/delete-account/';

/** The brand is spelled in lower case, as the client asks (docs/landing-copy.md). The legal pages keep their own text. */
export const SITE_NAME = 'checkapp';

/**
 * The header's links. `key` picks the label from the shell dictionary (src/i18n), so the same list serves every language.
 * "Home" is not here: it points at the landing page of the current region, which the header knows.
 *
 * None of the site's navigation links prefetch (`prefetch={false}` on every `<Link>` in the header, footer and CTA). The
 * router would otherwise fetch every linked page on the first view, and preload each page's own stylesheet: the
 * console filled with "preloaded but not used" warnings and the network tab with cancelled requests. The blog never
 * prefetched for a further reason: its cover photos come from a third party, and prefetching pulled one in before
 * the visitor had answered the cookie notice. Pages are static files on a CDN; opening one is fast without it.
 */
export const NAV_LINKS: readonly {
  href: string;
  key: 'howItWorks' | 'features' | 'blog';
}[] = [
  { href: '/how-it-works/', key: 'howItWorks' },
  { href: '/features/', key: 'features' },
  { href: '/blog/', key: 'blog' },
];

export const SOCIAL_LINKS = {
  instagram: 'https://instagram.com/checkapp',
  twitter: 'https://twitter.com/checkapp',
  contact: 'mailto:hello@checkapp.today',
} as const;

export const DEFAULT_OG_IMAGE = '/og-default.png';
/** The Russian landing page's share image: the same card with the client's Russian headline (`npm run og:generate`). */
export const DEFAULT_OG_IMAGE_RU = '/og-default-ru.png';

/** The logo for JSON-LD: the 3D DiDi icon, full-bleed 512 (docs/brand.md). Absolute, because structured data needs it. */
export const LOGO_PATH = '/brand/icons/icon-512.png';
export const LOGO_URL = `${SITE_URL.replace(/\/$/, '')}${LOGO_PATH}`;

/** Browser chrome colour: the page is pure black. */
export const THEME_COLOR = '#000000';

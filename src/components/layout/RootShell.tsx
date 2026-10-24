import { Analytics } from '@vercel/analytics/react';
import type { CSSProperties, ReactNode } from 'react';
import type { Locale } from '@/content/copy';
import { withBasePath } from '@/lib/paths';
import { mobileApplicationSchema, organizationSchema } from '@/lib/seo';
import '@/app/globals.css';
import { JsonLd } from './JsonLd';
import { PostHogProvider } from './PostHogProvider';
import { ScrollDepthTracker } from './ScrollDepthTracker';

/**
 * The document: <html lang>, the font variables, <body>, the site-wide structured data and the analytics.
 *
 * Next.js allows one `lang` per root layout, so the site has two root layouts that share this component: `app/(en)/layout.tsx`
 * (lang="en": every page except the Russian one) and `app/(ru)/layout.tsx` (lang="ru": `/ru/`). Each passes its own
 * font set (`src/lib/fonts`), so English pages never download Cyrillic.
 *
 * The global stylesheet is imported here, once, and not in each layout: with the same CSS imported by two root layouts,
 * Turbopack puts the font CSS of both layouts on every page (English pages would then preload the Cyrillic file). The visible page (header, <main>, footer) is
 * `SiteFrame`, which each route group renders for itself because the footer needs to know the landing region.
 */
export function RootShell({
  locale,
  fontVariables,
  children,
}: {
  locale: Locale;
  /** `className` from the font set: defines --font-manrope, --font-inter, --font-bricolage. */
  fontVariables: string;
  children: ReactNode;
}) {
  // CSS url() ignores GITHUB_PAGES_BASE_PATH, so art that CSS references is published as custom properties from here.
  const assetVars = {
    '--noise-url': `url("${withBasePath('/landing/_shared/noise-128.png')}")`,
  } as CSSProperties;

  return (
    <html lang={locale} className={fontVariables} style={assetVars}>
      <body className="font-sans antialiased">
        <JsonLd data={[organizationSchema(), mobileApplicationSchema(locale)]} />
        {children}
        <PostHogProvider />
        <ScrollDepthTracker />
        {/* Vercel Analytics: a no-op off Vercel (GitHub Pages, local). */}
        <Analytics />
      </body>
    </html>
  );
}

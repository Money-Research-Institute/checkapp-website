import type { ReactNode } from 'react';
import { RegionPaths, getRegionCopy, type Locale, type Region } from '@/content/copy';
import { getDict } from '@/i18n';
import { CookieConsent } from './CookieConsent';
import { Footer } from './Footer';
import { Header } from './Header';
import { MobileCtaBar } from './MobileCtaBar';

/**
 * What the visitor sees around a page: skip link, header, <main>, footer, the phone CTA bar and the cookie notice.
 *
 * It is a component, not part of a layout file, because the footer (region switcher, the region's disclaimer) and the
 * download button's label depend on which landing page this is, and a layout can only know that if there is one layout per
 * landing page. So `/`, `/eu/`, `/gulf/` and `/ru/` each have a one-line layout that renders `<SiteFrame region=...>`,
 * and every other page shares `(pages)/layout.tsx`, which renders it without a region (English chrome, the default).
 */
export function SiteFrame({
  locale,
  region,
  children,
}: {
  locale: Locale;
  /** The landing page this frame wraps. Omitted on every other page. */
  region?: Region;
  children: ReactNode;
}) {
  const dict = getDict(locale);
  // On a landing page the download label is the client's hero CTA for that region; elsewhere it is the shell's default.
  const ctaLabel = region ? getRegionCopy(region).hero.cta : null;

  return (
    <>
      <a href="#main" className="skip-link">
        {dict.skipLink}
      </a>
      <Header
        dict={dict.header}
        homeHref={region ? RegionPaths[region] : '/'}
        ctaLabel={ctaLabel ?? dict.header.cta}
        englishTargets={locale !== 'en'}
        englishOnlyLabel={dict.footer.pageInEnglish}
      />
      <main id="main">{children}</main>
      <Footer locale={locale} region={region} />
      <MobileCtaBar label={ctaLabel ?? dict.mobileBar.cta} />
      <CookieConsent dict={dict.cookie} />
    </>
  );
}

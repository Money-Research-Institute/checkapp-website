'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { LogoMark } from '@/components/brand/LogoMark';
import { CtaButton } from '@/components/ds/CtaButton';
import type { Locale } from '@/content/copy';
import type { Dict } from '@/i18n';
import { APP_DOWNLOAD_URL, NAV_LINKS, SITE_NAME } from '@/lib/constants';
import { shellLink } from '@/lib/paths';
import styles from './Header.module.css';

/** Scrolled past the top? A primitive snapshot, so the header only re-renders when it flips. */
function subscribeScroll(callback: () => void) {
  window.addEventListener('scroll', callback, { passive: true });
  return () => window.removeEventListener('scroll', callback);
}
const scrolledNow = () => window.scrollY > 8;
const scrolledOnServer = () => false;

/**
 * Where the burger gives way to the links + download pill. The Russian labels are ~130px longer than the English ones, and two
 * of the three links lead to English pages and carry an "EN" tag, so the full bar needs more room there. Keep in step with the
 * media queries in Header.module.css.
 */
const FULL_BAR_FROM: Record<Locale, number> = { en: 768, ru: 1024 };

/** Elements that carry the page's own download button (the hero's, the final section's, the download page's). */
const OWN_CTA = '[data-hides-cta-bar]';

/**
 * The one header for the whole site. Fixed, transparent over the hero, glass once the page scrolls.
 * md and up: logo + wordmark, the nav links, a 56px "Download Now" pill. Below md: logo and a 44px hamburger that opens
 * a full-screen menu. In Russian the full bar needs 1024px, so from 768 to 1023 it shows the logo, the pill and the burger.
 * The logo never shrinks or drops out to make room. `<nav data-critical="nav">` is visible at every width (the gate hit-tests it).
 * No animation library: the menu is a state flag and CSS; the glass fades with CSS transitions.
 *
 * Landscape phones (<= 500px tall) get a compact bar (see the CSS): the same 16px edge as the page, 48px high, and no download
 * pill while the page's own download button is on screen (`data-cta-covered`, the same signal the phone bar uses), because two
 * identical buttons cost a third of the height of a screen that short. From 480 to 767 wide that bar also takes over the phone's
 * bottom bar (hidden there): logo, pill and burger, as the Russian bar does from 768 to 1023.
 *
 * Over the hero the links sit on a scrim (`.header::before`, gone once the glass fades in on scroll), so the hero's green wash
 * never lands behind them at full strength.
 *
 * Links on the Russian site: the download button goes to the Russian download page (CtaButton), "How it works" to its section of
 * the Russian landing page, and every other link to an English page, which says so with a visible "EN" tag and a spoken cue.
 */
export function Header({
  locale,
  dict,
  homeHref,
  ctaLabel,
  englishOnlyLabel,
  startCtaCovered,
}: {
  /** The page's language: sets the width at which the full bar replaces the burger. */
  locale: Locale;
  /** The shell strings (src/i18n), chosen by the page's language. */
  dict: Dict['header'];
  /** Where the logo and "Home" go: `/` on English pages, the region's own landing page (`/ru/`) on the others. */
  homeHref: string;
  /** The download button: copy.hero.cta on a landing page, the shell's default elsewhere. */
  ctaLabel: string;
  /** Spoken after a link to a page that exists in English only ("page in English"), on a Russian page. */
  englishOnlyLabel: string;
  /**
   * Server-render the compact (landscape phone) bar without its download pill. True on a landing page, whose own button is in
   * the first view; the observer settles the real state after hydration. False elsewhere.
   */
  startCtaCovered: boolean;
}) {
  const pathname = usePathname();
  const scrolled = useSyncExternalStore(subscribeScroll, scrolledNow, scrolledOnServer);
  const [open, setOpen] = useState(false);
  const [ctaCovered, setCtaCovered] = useState(startCtaCovered);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const isActive = (href: string) =>
    href === homeHref ? pathname === homeHref : pathname.startsWith(href.replace(/\/$/, ''));
  const links: { href: string; label: string; english: boolean }[] = [
    { href: homeHref, label: dict.home, english: false },
    ...NAV_LINKS.map((link) => ({
      ...shellLink(link.href, locale),
      label: dict[link.key],
    })),
  ];

  // Is the page's own download button on screen? Then a landscape phone's bar drops its duplicate (CSS reads the flag).
  useEffect(() => {
    const targets = document.querySelectorAll(OWN_CTA);
    if (!targets.length || !('IntersectionObserver' in window)) {
      const frame = requestAnimationFrame(() => setCtaCovered(false));
      return () => cancelAnimationFrame(frame);
    }
    const showing = new Set<Element>();
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) showing.add(entry.target);
        else showing.delete(entry.target);
      }
      setCtaCovered(showing.size > 0);
    });
    targets.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [pathname]);

  // The burger disappears at the full-bar width: a menu left open across it would keep the page scroll-locked.
  useEffect(() => {
    const query = matchMedia(`(min-width: ${FULL_BAR_FROM[locale]}px)`);
    const close = () => {
      if (query.matches) setOpen(false);
    };
    query.addEventListener('change', close);
    return () => query.removeEventListener('change', close);
  }, [locale]);

  // Menu open: lock page scroll, move focus into the menu, Escape closes, Tab stays inside (menu + button).
  useEffect(() => {
    if (!open) return;
    const root = document.documentElement;
    const previous = root.style.overflow;
    root.style.overflow = 'hidden';
    panelRef.current?.querySelector<HTMLElement>('a')?.focus();

    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setOpen(false);
        buttonRef.current?.focus();
        return;
      }
      if (event.key !== 'Tab') return;
      const items = [buttonRef.current, ...(panelRef.current?.querySelectorAll<HTMLElement>('a') ?? [])].filter(
        (el): el is HTMLElement => !!el,
      );
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
    document.addEventListener('keydown', onKey);
    return () => {
      root.style.overflow = previous;
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <header
      className={styles.header}
      data-lang={locale}
      data-scrolled={scrolled || undefined}
      data-open={open || undefined}
      data-cta-covered={ctaCovered || undefined}
    >
      <div className={styles.bar}>
        <nav data-critical="nav" aria-label={dict.navLabel} className={styles.nav}>
          <Link href={homeHref} prefetch={false} className={styles.brand} onClick={() => setOpen(false)}>
            <LogoMark size={28} decorative priority />
            <span className={styles.wordmark}>{SITE_NAME}</span>
          </Link>

          <ul className={styles.links}>
            {links.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  prefetch={false}
                  className={styles.link}
                  aria-current={isActive(link.href) ? 'page' : undefined}
                  hrefLang={link.english ? 'en' : undefined}
                >
                  {link.label}
                  {link.english ? (
                    <>
                      <span className={styles.lang} aria-hidden="true">
                        EN
                      </span>
                      <span className="sr-only"> ({englishOnlyLabel})</span>
                    </>
                  ) : null}
                </Link>
              </li>
            ))}
          </ul>

          <div className={styles.cta}>
            <CtaButton href={APP_DOWNLOAD_URL} size="nav" trackingPage="header" trackingPosition="desktop-nav">
              {ctaLabel}
            </CtaButton>
          </div>

          <button
            ref={buttonRef}
            type="button"
            className={styles.burger}
            aria-label={open ? dict.closeMenu : dict.openMenu}
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpen((v) => !v)}
          >
            <span className={styles.burgerLines} aria-hidden="true">
              <span />
              <span />
              <span />
            </span>
          </button>
        </nav>
      </div>

      <div id="mobile-menu" ref={panelRef} className={styles.panel} hidden={!open}>
        <nav aria-label={dict.mobileNavLabel}>
          <ul className={styles.panelLinks}>
            {links.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  prefetch={false}
                  className={styles.panelLink}
                  aria-current={isActive(link.href) ? 'page' : undefined}
                  hrefLang={link.english ? 'en' : undefined}
                  onClick={() => setOpen(false)}
                >
                  {link.label}
                  {link.english ? (
                    <>
                      <span className={styles.lang} aria-hidden="true">
                        EN
                      </span>
                      <span className="sr-only"> ({englishOnlyLabel})</span>
                    </>
                  ) : null}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <CtaButton href={APP_DOWNLOAD_URL} size="bar" trackingPage="header" trackingPosition="mobile-menu">
          {ctaLabel}
        </CtaButton>
      </div>
    </header>
  );
}

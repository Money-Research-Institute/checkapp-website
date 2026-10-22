'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { LogoMark } from '@/components/brand/LogoMark';
import { CtaButton } from '@/components/ds/CtaButton';
import type { Dict } from '@/i18n';
import { APP_DOWNLOAD_URL, NAV_LINKS, SITE_NAME } from '@/lib/constants';
import styles from './Header.module.css';

/** Scrolled past the top? A primitive snapshot, so the header only re-renders when it flips. */
function subscribeScroll(callback: () => void) {
  window.addEventListener('scroll', callback, { passive: true });
  return () => window.removeEventListener('scroll', callback);
}
const scrolledNow = () => window.scrollY > 8;
const scrolledOnServer = () => false;

/**
 * The one header for the whole site. Fixed, transparent over the hero, glass once the page scrolls.
 * md and up: logo + wordmark, the nav links, a 56px "Download Now" pill. Below md: logo and a 44px hamburger that opens
 * a full-screen menu. `<nav data-critical="nav">` is visible at every width (the gate hit-tests it).
 * No animation library: the menu is a state flag and CSS; the glass fades with CSS transitions.
 */
export function Header({
  dict,
  homeHref,
  ctaLabel,
  englishTargets,
  englishOnlyLabel,
}: {
  /** The shell strings (src/i18n), chosen by the page's language. */
  dict: Dict['header'];
  /** Where the logo and "Home" go: `/` on English pages, the region's own landing page (`/ru/`) on the others. */
  homeHref: string;
  /** The download button: copy.hero.cta on a landing page, the shell's default elsewhere. */
  ctaLabel: string;
  /** The links lead to pages that exist in English only (every page but the landing pages): say so on a Russian page. */
  englishTargets: boolean;
  /** Spoken after such a link ("page in English"). */
  englishOnlyLabel: string;
}) {
  const pathname = usePathname();
  const scrolled = useSyncExternalStore(subscribeScroll, scrolledNow, scrolledOnServer);
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const isActive = (href: string) =>
    href === homeHref ? pathname === homeHref : pathname.startsWith(href.replace(/\/$/, ''));
  const links = [
    { href: homeHref, label: dict.home, english: false },
    ...NAV_LINKS.map((link) => ({ href: link.href, label: dict[link.key], english: englishTargets })),
  ];

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
    <header className={styles.header} data-scrolled={scrolled || undefined} data-open={open || undefined}>
      <div className={styles.bar}>
        <nav data-critical="nav" aria-label={dict.navLabel} className={styles.nav}>
          <Link href={homeHref} className={styles.brand} onClick={() => setOpen(false)}>
            <LogoMark size={28} decorative priority />
            <span className={styles.wordmark}>{SITE_NAME}</span>
          </Link>

          <ul className={styles.links}>
            {links.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={styles.link}
                  aria-current={isActive(link.href) ? 'page' : undefined}
                  hrefLang={link.english ? 'en' : undefined}
                >
                  {link.label}
                  {link.english ? <span className="sr-only"> ({englishOnlyLabel})</span> : null}
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
                  className={styles.panelLink}
                  aria-current={isActive(link.href) ? 'page' : undefined}
                  hrefLang={link.english ? 'en' : undefined}
                  onClick={() => setOpen(false)}
                >
                  {link.label}
                  {link.english ? <span className="sr-only"> ({englishOnlyLabel})</span> : null}
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

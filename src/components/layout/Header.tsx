'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { LogoMark } from '@/components/brand/LogoMark';
import { CtaButton } from '@/components/ds/CtaButton';
import { APP_DOWNLOAD_URL, NAV_LINKS } from '@/lib/constants';
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
export function Header() {
  const pathname = usePathname();
  const scrolled = useSyncExternalStore(subscribeScroll, scrolledNow, scrolledOnServer);
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const isActive = (href: string) => (href === '/' ? pathname === '/' : pathname.startsWith(href.replace(/\/$/, '')));

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
        <nav data-critical="nav" aria-label="Main" className={styles.nav}>
          <Link href="/" className={styles.brand} onClick={() => setOpen(false)}>
            <LogoMark size={28} decorative priority />
            <span className={styles.wordmark}>CheckApp</span>
          </Link>

          <ul className={styles.links}>
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={styles.link}
                  aria-current={isActive(link.href) ? 'page' : undefined}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          <div className={styles.cta}>
            <CtaButton href={APP_DOWNLOAD_URL} size="nav" trackingPage="header" trackingPosition="desktop-nav">
              Download Now
            </CtaButton>
          </div>

          <button
            ref={buttonRef}
            type="button"
            className={styles.burger}
            aria-label={open ? 'Close menu' : 'Open menu'}
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
        <nav aria-label="Mobile">
          <ul className={styles.panelLinks}>
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={styles.panelLink}
                  aria-current={isActive(link.href) ? 'page' : undefined}
                  onClick={() => setOpen(false)}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <CtaButton href={APP_DOWNLOAD_URL} size="bar" trackingPage="header" trackingPosition="mobile-menu">
          Download Now
        </CtaButton>
      </div>
    </header>
  );
}

'use client';

import { useEffect, useState } from 'react';
import styles from './Testimonials.module.css';

/**
 * Switches the moving wall on, and pauses it while it is off-screen.
 *
 * The stylesheet keeps the finished, still wall as the default and starts the columns only under `html[data-fx]`. Nothing else
 * publishes that flag now (the page's experience engine, which used to, is gone), so this does, once the page is hydrated: a
 * visitor who asked for less data (Save-Data) or forced colours keeps the still wall, as does anyone with reduced motion (the
 * stylesheet's own media query). The loop is the page's one infinite animation, so it stops when its tracks leave the screen.
 */
function useMarquee() {
  useEffect(() => {
    const root = document.documentElement;
    const nav = navigator as Navigator & { connection?: { saveData?: boolean } };
    if (nav.connection?.saveData || matchMedia('(forced-colors: active)').matches) return;
    root.dataset.fx = 't1';
    const tracks = document.querySelectorAll('[data-fx="marquee"]');
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) e.target.setAttribute('data-paused', e.isIntersecting ? 'false' : 'true');
      },
      { rootMargin: '100px' },
    );
    tracks.forEach((el) => io.observe(el));
    return () => {
      io.disconnect();
      delete root.dataset.fx;
    };
  }, []);
}

/**
 * The pause control WCAG 2.2.2 asks for: the wall moves by itself for longer than five seconds, so there must be a way to stop it
 * that works without a mouse (hover and focus already pause it). It flips data-marquee on the wall and is only drawn while the
 * wall is actually moving (the stylesheet hides it otherwise).
 */
export function MarqueeToggle() {
  useMarquee();
  const [paused, setPaused] = useState(false);
  return (
    <button
      type="button"
      className={styles.toggle}
      aria-pressed={paused}
      aria-label="Pause the moving testimonials"
      onClick={(e) => {
        const next = !paused;
        setPaused(next);
        const wall = e.currentTarget.parentElement?.querySelector('[data-marquee-root]');
        if (wall) wall.setAttribute('data-marquee', next ? 'paused' : 'running');
      }}
    >
      <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" focusable="false">
        {paused ? <path d="M4 2.5v11l9-5.5z" fill="currentColor" /> : <path d="M4 2.5h3v11H4zM9 2.5h3v11H9z" fill="currentColor" />}
      </svg>
    </button>
  );
}

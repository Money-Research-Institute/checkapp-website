'use client';

import { useState } from 'react';
import styles from './Testimonials.module.css';

/**
 * The pause control WCAG 2.2.2 asks for: the wall moves by itself for longer than five seconds, so there must be a way to stop it
 * that works without a mouse (hover and focus already pause it). It flips data-marquee on the wall and is only drawn while the
 * wall is actually moving (the stylesheet hides it otherwise).
 */
export function MarqueeToggle() {
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

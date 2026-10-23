'use client';

import { useEffect, useState } from 'react';
import styles from './Familiar.module.css';

/**
 * The pager of the phone strip: one dot per phone, the one nearest the middle of the strip lit. The strip itself is native
 * horizontal scrolling with scroll-snap (index.tsx, Familiar.module.css); this only reads its scroll position and, on a tap,
 * asks it to scroll a phone into the middle. It is a hint that there are four phones, not a controller, so the strip works
 * the same without it. It is shown only where the strip scrolls (the CSS hides it everywhere else).
 *
 * The first dot is lit in the server render, which is also the strip's resting state, so nothing moves on hydration.
 */
export function FamiliarPager({ stripId, label, itemLabels }: { stripId: string; label: string; itemLabels: readonly string[] }) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const strip = document.getElementById(stripId);
    if (!strip) return;
    let frame = 0;
    const read = () => {
      frame = 0;
      const box = strip.getBoundingClientRect();
      const middle = box.left + box.width / 2;
      let best = 0;
      let bestDistance = Infinity;
      strip.querySelectorAll<HTMLElement>('[data-slide]').forEach((slide, i) => {
        const r = slide.getBoundingClientRect();
        const distance = Math.abs(r.left + r.width / 2 - middle);
        if (distance < bestDistance) {
          bestDistance = distance;
          best = i;
        }
      });
      setActive(best);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(read);
    };
    strip.addEventListener('scroll', onScroll, { passive: true });
    read();
    return () => {
      strip.removeEventListener('scroll', onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [stripId]);

  const show = (i: number) => {
    const slide = document.getElementById(stripId)?.querySelectorAll<HTMLElement>('[data-slide]')[i];
    if (!slide) return;
    const calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    slide.scrollIntoView({ behavior: calm ? 'auto' : 'smooth', inline: 'center', block: 'nearest' });
  };

  return (
    <div className={styles.pager} role="group" aria-label={label}>
      {itemLabels.map((itemLabel, i) => (
        <button key={itemLabel} type="button" className={styles.dot} aria-label={itemLabel} aria-current={i === active ? 'true' : undefined} onClick={() => show(i)}>
          <span className={styles.dotMark} aria-hidden="true" />
        </button>
      ))}
    </div>
  );
}

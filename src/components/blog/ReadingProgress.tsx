'use client';

import { useEffect, useRef } from 'react';
import styles from './ReadingProgress.module.css';

/**
 * A 3px bar at the top of the window that fills as the article is read. Decorative (aria-hidden): it duplicates the
 * scrollbar. No React state and no animation loop: a scroll or resize schedules one requestAnimationFrame that writes
 * a `transform: scaleX()` (compositor only), so an idle page does no work at all. 100% is the moment the end of the
 * article body (`targetId`) reaches the bottom of the window.
 */
export function ReadingProgress({ targetId }: { targetId: string }) {
  const fillRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fill = fillRef.current;
    if (!fill) return;
    let frame = 0;

    const paint = () => {
      frame = 0;
      const target = document.getElementById(targetId);
      const viewport = window.innerHeight;
      const end = target
        ? target.getBoundingClientRect().bottom + window.scrollY - viewport
        : document.documentElement.scrollHeight - viewport;
      const progress = end > 0 ? Math.min(1, Math.max(0, window.scrollY / end)) : 1;
      fill.style.transform = `scaleX(${progress.toFixed(4)})`;
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(paint);
    };

    paint();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    // Images and the web font change the article's height without a scroll event.
    const observer = 'ResizeObserver' in window ? new ResizeObserver(schedule) : null;
    observer?.observe(document.documentElement);

    return () => {
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      observer?.disconnect();
      if (frame) cancelAnimationFrame(frame);
    };
  }, [targetId]);

  return (
    <div className={styles.track} aria-hidden="true">
      <div ref={fillRef} className={styles.fill} />
    </div>
  );
}

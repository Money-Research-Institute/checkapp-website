'use client';

import { useEffect, useState } from 'react';
import styles from './TableOfContents.module.css';

type Heading = { id: string; text: string };

/**
 * The article's contents list, in two shapes of the same component:
 * - `aside`  (1024px and up) a sticky column beside the text that marks the section being read;
 * - `inline` (below 1024px) a collapsed "On this page" disclosure above the text, so phones and tablets get a TOC too.
 * CSS shows exactly one of them at a time, so there is only ever one "Table of contents" landmark on screen.
 * The active section comes from an IntersectionObserver that only wakes when a heading crosses the reading line;
 * state changes a handful of times per article, never per scroll event.
 */
export function TableOfContents({ headings, variant }: { headings: Heading[]; variant: 'aside' | 'inline' }) {
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    if (variant !== 'aside' || !('IntersectionObserver' in window)) return;
    const targets = headings
      .map((heading) => document.getElementById(heading.id))
      .filter((element): element is HTMLElement => element !== null);
    if (targets.length === 0) return;

    // The reading line sits 35% down the viewport; the current section is the last heading that has passed it.
    const update = () => {
      const line = window.innerHeight * 0.35;
      let current: string | null = null;
      for (const target of targets) {
        if (target.getBoundingClientRect().top <= line) current = target.id;
        else break;
      }
      setActive(current);
    };

    // An observer reports every target once as soon as it observes it, which is the initial update.
    const observer = new IntersectionObserver(update, { rootMargin: '0px 0px -65% 0px' });
    targets.forEach((target) => observer.observe(target));
    return () => observer.disconnect();
  }, [headings, variant]);

  if (headings.length === 0) return null;

  const list = (
    <ul className={styles.list} role="list">
      {headings.map((heading) => (
        <li key={heading.id}>
          <a
            href={`#${heading.id}`}
            className={styles.link}
            aria-current={active === heading.id ? 'location' : undefined}
          >
            {heading.text}
          </a>
        </li>
      ))}
    </ul>
  );

  if (variant === 'inline') {
    return (
      <details className={styles.inline}>
        <summary className={styles.summary}>On this page</summary>
        <nav aria-label="Table of contents">{list}</nav>
      </details>
    );
  }

  return (
    <nav aria-label="Table of contents" className={styles.aside}>
      <p className={styles.label}>On this page</p>
      {list}
    </nav>
  );
}

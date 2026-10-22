'use client';

import type { ReactNode } from 'react';
import { trackFaqOpen } from '@/lib/analytics';
import { MinusIcon, PlusIcon } from './icons';
import styles from './Faq.module.css';

export type FaqItem = { question: string; answer: ReactNode };

/**
 * FAQ list for inner pages: native <details name=...> (exclusive, keyboard and screen-reader support for free, works
 * without JS), a plus/minus glyph and open-tracking. `defaultOpen` is the index opened in the static HTML.
 * Landing FAQ has its own lamp treatment in src/components/landing/faqs; this is the plain version.
 */
export function Faq({
  items,
  page = 'unknown',
  group = 'faq',
  defaultOpen,
  className,
}: {
  items: FaqItem[];
  page?: string;
  /** The `name` of the details group. Give lists on the same page different names. */
  group?: string;
  defaultOpen?: number;
  className?: string;
}) {
  return (
    <div className={[styles.list, className].filter(Boolean).join(' ')}>
      {items.map((item, index) => {
        // `name` (exclusive accordion) is standard HTML but missing from this version of the React types.
        const groupAttr = { name: group };
        return (
          <details
            key={item.question}
            className={styles.item}
            open={defaultOpen === index}
            {...groupAttr}
            onToggle={(event) => {
              if ((event.currentTarget as HTMLDetailsElement).open) trackFaqOpen(page, item.question);
            }}
          >
            <summary className={styles.summary}>
              <span className={styles.question}>{item.question}</span>
              <PlusIcon className={styles.plus} />
              <MinusIcon className={styles.minus} />
            </summary>
            <div className={styles.answer}>{item.answer}</div>
          </details>
        );
      })}
    </div>
  );
}

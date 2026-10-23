import type { ReactNode } from 'react';
import s from './hero.module.css';

/**
 * Renders a client string with every hyphenated compound kept whole: "check-in" and "once-a-year" never break after the hyphen.
 *
 * A browser may break a line after any hyphen, so on a phone the EU headline read "A daily health check- / in, instead of a once- /
 * a-year checkup." The headline is the most important string on the page and it must not stutter. This wraps each hyphenated word
 * in a nowrap span (the compound moves to the next line as one unit; `text-wrap: balance` on the heading still balances the lines).
 *
 * It only adds spans. The text itself is not touched (no U+2011 swap, no soft hyphens), so copy and paste, search, the page's
 * text scans and the client's string in src/content/copy stay exactly as written. Whitespace and dashes with spaces around
 * them ("— not once a year") are left alone: those are the places a line should break.
 */
export function KeepHyphenated({ children }: { children: string }): ReactNode {
  // "(\s+)" keeps the separators, so joining the parts gives the original string back.
  return children.split(/(\s+)/).map((part, i) =>
    /\p{L}-\p{L}/u.test(part) ? (
      <span key={i} className={s.keep}>
        {part}
      </span>
    ) : (
      part
    ),
  );
}

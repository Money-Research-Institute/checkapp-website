import type { ReactNode } from 'react';
import s from './hero.module.css';

/**
 * Renders a client string with every hyphenated compound kept whole: "check-in" and "once-a-year" never break after the hyphen.
 *
 * A browser may break a line after any hyphen, so on a phone the EU headline read "A daily health check- / in, instead of a once- /
 * a-year checkup." This wraps each hyphenated word in a nowrap span (the compound moves to the next line as one unit;
 * `text-wrap: balance` on the heading still balances the lines). It only adds spans: the client's string is not touched.
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

import type { ReactNode } from 'react';
import styles from './Prose.module.css';

/**
 * Long-form text on the dark page: legal pages and MDX blog bodies. Styles plain h2-h4, p, ul/ol, a, blockquote, code,
 * hr and tables (wrap a table in <div class="table-wrap"> or use `prose-table-wrap` from MdxContent to scroll it).
 * Line length is capped at ~72ch and the text colour clears AA on black (#f0f0f0 / 70 % white).
 */
export function Prose({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={[styles.prose, className].filter(Boolean).join(' ')}>{children}</div>;
}

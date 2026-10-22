import { CLIENT } from './copy';
import styles from './Disclaimer.module.css';

/**
 * The client's medical-device disclaimer, visible on every page that talks about health signals (it is also in the footer of
 * every page). Marked `data-disclaimer`: that is what lets it say what the product does NOT do (the QA claims scan skips these
 * elements). The wording is the client's, verbatim (src/content/copy/us.ts); docs/landing-decisions.md D1: the regulatory text
 * must survive.
 */
export function Disclaimer() {
  return (
    <p className={styles.note} data-disclaimer>
      {CLIENT.disclaimer}
    </p>
  );
}

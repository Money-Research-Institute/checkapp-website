import type { CSSProperties } from 'react';
import { GradientHeading, Picture } from '@/components/ds';
import { CLIENT } from './copy';
import styles from './FourP.module.css';

/**
 * The 4P block of /about: the Figma "Projects" grid (title tile, four numbered tiles, DiDi on a cloud).
 *
 * Wording: the statement under the grid is the client's own 4P sentence (CLIENT.fourP, verbatim). The tiles are named after the
 * client's four Ps, in the client's order (personalized, preventive, participatory, predictive), and each says only what that
 * sentence says: daily attention, gentle nudges, you decide what to share, a short wellness read that is never a diagnosis or
 * a disease prediction. docs/landing-copy.md withdrew D1's "Patterns" and "Progress" tiles (they promised comparison over time).
 * Same DRAFT wording as the landing page's tiles, so the two never disagree.
 *
 * The mascot is the Figma image "image 1418" (node 2601:13022), encoded to public/pages/marketing.
 */
const PILLARS = [
  {
    n: '01',
    title: 'Personalized',
    text: 'DiDi works from the photos you choose to take, so what you get back is about you, not a generic checklist.',
  },
  {
    n: '02',
    title: 'Preventive',
    text: 'Daily attention and gentle nudges. A quick check-in and a small push to look after yourself today.',
  },
  {
    n: '03',
    title: 'Participatory',
    text: 'You decide what to share, and when. DiDi only looks at what you send, and you can delete your data anytime.',
  },
  {
    n: '04',
    title: 'Predictive',
    text: 'DiDi gives a short wellness read in plain language — never diagnoses or disease predictions.',
  },
] as const;

export function FourP() {
  return (
    <section className={styles.block} aria-labelledby="four-p-title">
      <div className={styles.grid}>
        <div className={`${styles.tile} ${styles.title}`} data-fx="rise">
          <div className={`${styles.surface} ${styles.titleSurface}`}>
            <GradientHeading as="h2" size="sub" align="left" id="four-p-title" className={styles.heading}>
              The future of everyday wellness is 4P
            </GradientHeading>
          </div>
        </div>

        {PILLARS.map((pillar, index) => (
          <div
            key={pillar.n}
            className={`${styles.tile} ${styles[`p${index + 1}`]}`}
            data-fx="rise"
            style={{ '--i': index + 1 } as CSSProperties}
          >
            <div className={styles.surface}>
              <p className={styles.number} aria-hidden="true">
                {pillar.n}
              </p>
              <h3 className={styles.name}>{pillar.title}</h3>
              <p className={styles.text}>{pillar.text}</p>
            </div>
          </div>
        ))}

        <div className={styles.cloud} data-fx="settle">
          <Picture
            base="/pages/marketing/didi-cloud"
            widths={[640, 1080]}
            width={1080}
            height={720}
            sizes="(min-width: 1100px) 440px, (min-width: 700px) 520px, min(90vw, 440px)"
            // Not alt="": Chrome gives an unloaded lazy image with empty alt no box at all, so the page would jump by the image's
            // height when it arrived. The mascot is content anyway.
            alt="DiDi, the checkapp companion, resting on a cloud and waving."
            className={styles.cloudImg}
          />
        </div>
      </div>

      <div className={styles.foot}>
        <p className={styles.lede}>{CLIENT.fourP}</p>
      </div>
    </section>
  );
}

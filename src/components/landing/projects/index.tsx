/**
 * Projects: the 4P pillars (Figma node 2601:12989, 1440 x 810).
 *
 * A title tile, four numbered pillar tiles and DiDi lying on a cloud in the empty fifth slot, over a deep-green glow that
 * comes from the bottom-left. Everything that carries meaning is plain server-rendered DOM; the atmosphere (glow, mascot)
 * is decoration and is hidden from assistive technology.
 *
 * Every region renders the same layout and art; only the strings change:
 *   - the statement above the tiles is the client's own 4P paragraph, verbatim (`fourP` in src/content/copy);
 *   - the title-tile heading and the four tiles are our drafts in ./copy.ts (named after the client's four Ps, saying only
 *     what the client's sentence says), in English or in Russian. Never retype a client string here.
 * Fonts follow docs/landing-decisions.md D4 (Geist becomes Manrope, which the layout already loads for the whole site).
 *
 * Motion lives in projects.module.css and the shared vocabulary (data-fx, data-depth), and is all compositor-only:
 *   - tiles rise in order as they enter (data-fx="rise", stagger via --i),
 *   - the mascot drifts with scroll (data-fx="drift") and leans toward a fine pointer (data-depth, written by the
 *     engine's shared loop); the glow follows at 40 % of that, as a deeper plane,
 *   - the glow swells while the section crosses the viewport (a named view timeline, in the CSS).
 * No spores, no canvas, no time-based loop, and the default style of everything is the finished, visible layout.
 */
import type { CSSProperties } from 'react';
import { getRegionCopy, localeOf, type SectionProps } from '@/content/copy';
import { Picture } from '@/components/ds/Picture';
import { projectsCopy } from './copy';
import styles from './projects.module.css';

const stagger = (i: number) => ({ '--i': i }) as CSSProperties;

/** The mascot drifts 12px up as the section passes through the viewport (data-fx="drift" reads these). */
const DRIFT = { '--fx-from': '0px, 12px', '--fx-to': '0px, -12px' } as CSSProperties;

/** "01" .. "04": the numerals are decoration (the list already conveys order), so they are aria-hidden in the markup. */
const numeral = (i: number) => String(i + 1).padStart(2, '0');

export function ProjectsSection({ region }: SectionProps) {
  const { heading, pillars } = projectsCopy[localeOf(region)];
  const { fourP } = getRegionCopy(region);

  return (
    <section
      data-section="projects"
      data-figma-node="2601:12989"
      aria-labelledby="projects-heading"
      className={styles.section}
    >
      {/* Ultrawide only: a very faint wash along the bottom so the section does not end in a void (see the CSS). */}
      <span className={`fx-dither ${styles.wash}`} aria-hidden="true" />

      <div className={styles.stage}>
        <p className={styles.lede}>{fourP}</p>

        <div className={styles.grid}>
          <div className={`${styles.tile} ${styles.titleTile}`} data-fx="rise" style={stagger(0)}>
            <div className={`${styles.surface} ${styles.titleSurface}`}>
              {/* A square raster seen through a window: the arc must stay on the lower edge at every size (CSS). */}
              <div className={styles.art} aria-hidden="true">
                <Picture
                  base="/landing/projects/tile-art"
                  widths={[640, 964]}
                  sizes="(min-width: 1120px) 482px, (min-width: 768px) 62vw, 122vw"
                  width={964}
                  height={964}
                  alt=""
                  className={styles.artImg}
                />
              </div>
              <h2 id="projects-heading" className={styles.heading}>
                {heading}
              </h2>
            </div>
          </div>

          {/* DiDi on a cloud. It sits in the empty slot beside tile 03 on desktop, in the top-right cell on tablet and
              after the title tile on phones. The glow is a child so it can anchor to the section (desktop) or to the
              mascot (everywhere else) just by changing which ancestor is positioned. */}
          <div className={styles.companion} aria-hidden="true">
            <div className={`fx-dither ${styles.glow}`} data-depth="4" data-depth-y="2.4" />
            <div className={styles.lean} data-depth="10" data-depth-y="6">
              <div className={styles.float} data-fx="drift" style={DRIFT}>
                <Picture
                  base="/landing/projects/didi-cloud"
                  widths={[480, 802]}
                  sizes="(min-width: 1120px) 401px, (min-width: 768px) 360px, min(64vw, 300px)"
                  width={802}
                  height={535}
                  alt=""
                  className={styles.mascot}
                />
              </div>
            </div>
          </div>

          <ol className={styles.pillars} role="list">
            {pillars.map((pillar, i) => (
              <li key={pillar.name} className={`${styles.tile} ${styles.pillar}`} data-fx="rise" style={stagger(i)}>
                <div className={styles.surface}>
                  <div className={styles.details}>
                    <span className={styles.num} aria-hidden="true">
                      {numeral(i)}
                    </span>
                    <h3 className={styles.name}>{pillar.name}</h3>
                    <p className={styles.text}>{pillar.text}</p>
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

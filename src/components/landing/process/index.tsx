/**
 * "How it works": three numbered steps, a staggered walkthrough of the product (Figma 2601:12435 is only phone 1, the
 * section itself is unframed: see scripts/qa/figma-sections.json). Plain DOM + CSS, no GL, no client JS of its own.
 *
 * Words: each step is ONE sentence, the client's (`howItWorks` in src/content/copy, one per region), and the only thing
 * added to it is its number, drawn as the Figma raster numeral. Figma's titles ("Daily Health Monitoring", ...) and blurbs are
 * gone: the document covers this block, so a section never shows the Figma or D1 text for it (docs/landing-copy.md). The
 * sentence is the step's <h3>. The sr-only h2 and the phone alt text are in ./copy.ts (en and ru).
 *
 * Same layout and art in all four regions; only the strings change. Russian runs 15-30 % longer, so every box here is built
 * to grow (heights come from the text, never fixed) and the sentence wraps inside its column.
 *
 * Markup: an <ol role="list"> of three <li>, each with the <h3>, a <picture> phone and an aria-hidden numeral; the two
 * dashed arrows are aria-hidden decoration inside the <li> they leave.
 *
 * Layout (src/components/landing/process/Process.module.css, all by container query on the section's own width):
 *   >= 1000px   the 1440 x 2300 artboard, scaled: every box is a % of the stage, type is cqw with rem floors.
 *   600-999px   compact zig-zag rows (phone and text swap sides), arrows from 680px.
 *   < 600px     one column: phone, then numeral + sentence. Arrows from 360px.
 *   landscape phone (<= 500px tall): two-column rows, no arrows.
 *   ultrawide   the stage stays 1440 and centred; a faint green haze and dither fill the margins.
 *
 * Motion (CSS only, compositor properties only, off under reduced motion): the arrows are uncovered by a black curtain
 * (data-fx="curtain", src/styles/motion.css), the phones settle in and drift against their text, the numeral of the step
 * in view rises to full tone. Where scroll timelines do not exist the [data-once] reveals play once instead.
 */
import { getRegionCopy, localeOf } from '@/content/copy';
import type { SectionProps } from '@/content/copy';
import { Picture } from '@/components/ds/Picture';
import { withBasePath } from '@/lib/paths';
import { PROCESS_COPY } from './copy';
import { PROCESS_ARROWS, PROCESS_STEPS } from './steps';
import styles from './Process.module.css';

export function ProcessSection({ region }: SectionProps) {
  const sentences = getRegionCopy(region).howItWorks;
  const copy = PROCESS_COPY[localeOf(region)];
  return (
    <section
      id="how-it-works"
      data-section="process"
      data-figma-node="2601:12435"
      aria-labelledby="process-heading"
      className={styles.root}
    >
      <h2 id="process-heading" className={styles.srOnly}>
        {copy.heading}
      </h2>
      <div className={`${styles.haze} fx-dither`} aria-hidden="true" />
      <div className={styles.frame}>
        <div className={styles.stage}>
          <ol role="list" className={styles.steps}>
            {PROCESS_STEPS.map(({ n, phone, numeral }, i) => {
              const arrow = n === 1 ? PROCESS_ARROWS[1] : n === 2 ? PROCESS_ARROWS[2] : null;
              return (
                <li key={n} className={`${styles.step} ${styles[`step${n}`]}`}>
                  <div className={`${styles.phone} ${styles[`phone${n}`]}`} data-once>
                    <div className={styles.drift}>
                      <div className={styles.settle}>
                        <Picture
                          base={phone.base}
                          widths={phone.widths}
                          sizes={phone.sizes}
                          width={phone.width}
                          height={phone.height}
                          alt={copy.phones[i]}
                        />
                      </div>
                    </div>
                  </div>
                  <div className={styles.copy} data-once>
                    <span className={styles.numeral} style={{ aspectRatio: `${numeral.width} / ${numeral.height}` }}>
                      <Picture
                        base={numeral.base}
                        widths={[numeral.width]}
                        sizes="112px"
                        width={numeral.width}
                        height={numeral.height}
                        alt=""
                        aria-hidden="true"
                      />
                    </span>
                    <h3 className={styles.text}>{sentences[i]}</h3>
                  </div>
                  {arrow ? (
                    <span
                      className={`${styles.arrow} ${styles[`arrow${n as 1 | 2}`]}`}
                      data-fx="curtain"
                      data-fx-dir={n === 2 ? 'rtl' : undefined}
                      data-once
                      aria-hidden="true"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={withBasePath(arrow.src)} width={arrow.width} height={arrow.height} alt="" loading="lazy" decoding="async" />
                    </span>
                  ) : null}
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}

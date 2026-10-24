/**
 * 02 · The usual way: checkups once a year (Figma node 2601:12628, 1440 x 1057).
 *
 * The still, quiet beat of the page: the problem, stated plainly, before DiDi shows up. A server component, T0 complete.
 * No canvas, no time-based loop, no pointer effect. The only motion is scroll-linked CSS (docs/landing.md,
 * "Scroll as a timeline"), and every default style is the finished frame:
 *   - the four statements rise 01 to 04 as they enter (data-fx="rise", stagger via --i),
 *   - the render drifts +/-12px inside its radius-24 clip (data-fx="drift"),
 *   - a green glow at the phone base ramps up with the section's scroll position (UsualWay.module.css).
 * Everything stops under prefers-reduced-motion and is simply absent where animation-timeline is unsupported.
 *
 * Every region gets the same layout and the same scene; only the strings change (./copy.ts: English for /, /eu/ and /gulf/,
 * Russian drafts for /ru/). The client's final copy does not cover this section, so the words are ours. Nothing here may
 * carry a claim into a raster: the render is the app's own scan-details screen. Fonts: Manrope only (D4), through the
 * page's --font-sans.
 *
 * The render's phone screen (art/build.mjs):
 *  - It is the screen of the Meet DiDi section's phone 4 ("Looks stable", "Today, 4:56 pm", the smiling DiDi), put into the same
 *    baked 3D scene. Figma's own screen carried an orange "Needs Attention" verdict, a July 2024 date and "DIDI", which the rest of
 *    the page (and the app's wellness wording) does not say, and the same Scan Details screen must not appear with two UIs on one
 *    page. The "Looks stable" chip is ours, exactly as on the Meet DiDi phone: the owner decides whether the app's real status
 *    labels should appear instead. That call is not in docs/landing-decisions.md yet (QA round 3 asked for an entry): the chip, the
 *    Moisture / Surface Texture rows and the one-line summary are shown as "a short wellness insight back", the same screen as the
 *    Meet DiDi phone 4, and they change together with it, from the same art, when the owner rules.
 *  - The scene's left-hand glass card (the face in its scan brackets) used to carry a chart panel with a heartbeat-style line under the
 *    portrait: a vital-sign reading the page does not claim (no monitoring, no trends; docs/landing-copy.md) and the claim scanner cannot
 *    see in a raster. art/remove-trace.mjs paints the panel out of every file of the render (the portrait, the brackets and the rim stay);
 *    build.mjs runs it first, so a rebuild from the master stays clean. Do not put a chart, a waveform or a number into this art.
 *  - /ru/ gets its own render, `usual-way-render-ru-*` and `usual-way-render-square-ru-*` (the same scene and the same Russian
 *    screen as the Meet DiDi phone 4), so there is no English app UI left on a Russian page. The floating glass cards are icons
 *    only, so they are the same file for both. The alt text and the pixels say the same thing in both languages.
 *  - Re-run art/build.mjs, with the same art/screen-fit.json, when a string on the Meet DiDi phone 4 changes.
 */
import { localeOf, type SectionProps } from '@/content/copy';
import type { CSSProperties } from 'react';
import { Picture } from '@/components/ds/Picture';
import { SectionIntro } from '@/components/ds/SectionIntro';
import { COPY } from './copy';
import styles from './UsualWay.module.css';

const ASSETS = '/landing/usual-way';

/** What the figure's box is, per breakpoint (see UsualWay.module.css), so the browser picks the right file. */
const RENDER_SIZES =
  '(max-width: 479px) calc(100vw - 32px), (max-width: 999px) calc(100vw - 96px), (min-width: 1440px) 752px, 53vw';

const DRIFT = { '--fx-from': '0px, 12px', '--fx-to': '0px, -12px' } as CSSProperties;

export function UsualWaySection({ region }: SectionProps) {
  const locale = localeOf(region);
  const t = COPY[locale];
  // The Russian page shows the Russian render of the screen (usual-way-render[-square]-ru-*).
  const suffix = locale === 'ru' ? '-ru' : '';

  return (
    <section
      data-section="usual-way"
      data-figma-node="2601:12628"
      aria-labelledby="usual-way-heading"
      className={styles.root}
    >
      {/* Atmosphere: the lattice raster under a flat 40 % black (rebuilt in CSS), feathered into the page, dithered. */}
      <div className={`${styles.atmos} fx-dither`} aria-hidden="true">
        <div className={styles.lattice}>
          <div className={styles.latticeLayer}>
            <Picture
              base={`${ASSETS}/usual-way-bg`}
              widths={[1440]}
              sizes="1440px"
              width={1440}
              height={1057}
              alt=""
              className={styles.latticeImg}
            />
            <span className={styles.shade} />
          </div>
        </div>
      </div>

      <div className={styles.inner}>
        <SectionIntro
          className={styles.intro}
          eyebrow={t.eyebrow}
          title={t.title}
          lede={t.lede}
          headingId="usual-way-heading"
        />

        <div className={styles.stage}>
          <div className={styles.figure}>
            <Picture
              base={`${ASSETS}/usual-way-render${suffix}`}
              widths={[640, 960, 1448]}
              sizes={RENDER_SIZES}
              sources={[
                {
                  // Phones: a square crop baked from the same master (phone and the right-hand glass cards).
                  media: '(max-width: 479px)',
                  base: `${ASSETS}/usual-way-render-square${suffix}`,
                  widths: [540, 1086],
                  sizes: 'calc(100vw - 32px)',
                },
              ]}
              width={1448}
              height={1086}
              alt={t.renderAlt}
              className={styles.render}
              data-fx="drift"
              style={DRIFT}
            />
            <span className={styles.glow} aria-hidden="true" />
          </div>

          <ol className={styles.list} role="list">
            {t.statements.map((text, i) => (
              <li key={i} className={styles.card} data-fx="rise" style={{ '--i': i } as CSSProperties}>
                <span className={styles.num} aria-hidden="true">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <p className={styles.text}>{text}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

/**
 * 03 · Meet DiDi: four phones (Figma node 2601:12718, 1440 x 1226; "03-familar" is a typo in the file, the slug stays `familiar`).
 *
 * A server component that takes the region and renders the same layout and art for all four; only the strings change. Complete at
 * T0: header, four whole-device phone exports, connectors and caption cards are plain DOM. There is no canvas and
 * no silk shader here: the ribbons are the Figma bitmap, scaled 1.00 to 1.06 with the section's scroll position, with a focal
 * glow that peaks while the phones are centred. Motion is CSS only (Familiar.module.css): a per-column sequence scrubbed by
 * view() in both directions (screen powers on, connector draws, caption rises), an alternating drift, and on phones a native
 * scroll-snap strip with a per-slide entrance. The only JS involved is the experience engine's [data-depth] pointer sway on the
 * phones (fine pointers, at most 6px, only inside this section) and the strip's pager (FamiliarPager.tsx, a few dots under the
 * strip where it scrolls).
 *
 * Wording (docs/landing-copy.md):
 *  - the paragraph under the heading is the client's "Meet DiDi" text, `meetDidiText(region)`; the US sentence that expands the
 *    name to "Digital Diagnostic" is held back there (SHOW_NAME_ORIGIN), so nothing here ever expands the acronym;
 *  - the line under the phones is the client's "What it does now", `whatItDoes`, with the three scans as chips;
 *  - the eyebrow, heading, captions and alt text are ours (./copy.ts, Russian marked DRAFT). Figma's captions promised a
 *    comparison with earlier check-ins and video analysis, so they say what the app does today instead.
 *
 * Other calls that are not Figma's, and why:
 *  - The phones are one image per device (about 60 layers each in Figma).
 *  - The text inside a raster cannot be scanned (docs/landing-decisions.md, end of D1), so the four screens say only what the page
 *    says. Figma's phone 2 is a video-note recorder (round preview, "0:10,16", Cancel, pause), phone 3 has DiDi asking for "a quick
 *    video" with a 0:10 video note, and phone 4 carries an orange "Needs Attention" verdict and a July 2024 date. The app analyses
 *    photos only, on request, so they were re-made (see "Device art" below): phone 2 is a photo camera (the original round preview,
 *    a one-line instruction, a shutter), phone 3 is a photo exchange with a reply, phone 4 reads "Looks stable" with today's time
 *    and the smiling DiDi instead of the worried one. The "Looks stable" chip is ours (the summary under it already says "generally
 *    stable"): the owner decides whether the real app's status labels should appear instead. Phone 1 only fixes "DIDI" to "DiDi".
 *  - /ru/ gets its own render of all four screens in Russian (<image>-ru-*): the same layout, the strings of src/content/copy where
 *    they exist («Начать скан языка», «Чат?», «Добрый день, Mah!» as on the final-cta phone) and drafts elsewhere. Mixed-language
 *    screens on a Russian page were the worst of the options, so there is no English UI left in this section on /ru/.
 *  - The portrait on phones 2 to 4 is a stock photo of a person: licence still to be confirmed (see the hand-off notes).
 *  - Strip (< 600px): slides are min(264px, 64vw) wide so the next phone peeks about a fifth of its width, its screen already on,
 *    with a faint green rim; the pager says there are four.
 *
 * Asset provenance (public/landing/familiar, encoded with scripts/assets/encode.mjs; the raw exports are not committed):
 *  - device-*: Figma's MCP export flattens the "iPhone 15 Green" frames onto opaque black, so the transparency was rebuilt:
 *    an analytic matte of the body (rounded rect 276.4 x 570.2, radius 47.4, supersampled) with the colours un-premultiplied,
 *    and the side buttons' alpha taken from a 1x transparent render of the node. Re-export the same way if the art changes.
 *  - Device art: the screens were then re-made in Chrome canvas on top of those exports (the bezel, status bar and island are
 *    untouched; screen rect 754 x 1637 at (44, 37), radius 104, at 840 px wide). Everything that stays is Figma's pixels; text that
 *    changes is set in Inter (the app's UI face, matched to the source's size and baseline per string, so English and Russian sit
 *    on the same lines); new pieces (chat bubbles, camera shutter, status chip) are drawn. Re-run the same way when a string changes.
 *  - silk-*: the bitmap of node 2601:12719, turned 180 degrees because the Figma node is rotated (the raw fill is upside
 *    down against the design). The ribbons therefore cross at 47.5% / 47.5%, which Familiar.module.css relies on.
 */
import { getRegionCopy, localeOf, meetDidiText } from '@/content/copy';
import type { SectionProps } from '@/content/copy';
import { Picture } from '@/components/ds/Picture';
import { SectionIntro } from '@/components/ds/SectionIntro';
import type { CSSProperties } from 'react';
import { familiarCopy } from './copy';
import { FamiliarPager } from './FamiliarPager';
import styles from './Familiar.module.css';

const ASSETS = '/landing/familiar';

/** Phone width: 280px, less on narrower desktops and tablets; on the strip, min(264px, 64vw). */
const PHONE_SIZES = '(max-width: 599px) min(264px, 64vw), 280px';

const STRIP_ID = 'familiar-strip';

export function FamiliarSection({ region }: SectionProps) {
  const locale = localeOf(region);
  const copy = familiarCopy[locale];
  const { whatItDoes } = getRegionCopy(region);
  // The Russian page shows the Russian render of every screen (<image>-ru-*).
  const suffix = locale === 'ru' ? '-ru' : '';

  return (
    <section
      data-section="familiar"
      data-figma-node="2601:12718"
      aria-labelledby="familiar-heading"
      className={styles.root}
    >
      {/* Atmosphere: the ribbon bitmap (0.8 opacity, bottom fade and a soft top in CSS), a focal glow and a dither tile. */}
      <div className={styles.atmos} aria-hidden="true">
        <div className={styles.silkWrap}>
          <div className={styles.silk}>
            <div className={styles.silkScale}>
              <div className={`${styles.silkFrame} fx-dither`}>
                <Picture
                  base={`${ASSETS}/silk`}
                  widths={[887, 1774]}
                  sizes="min(100vw, 2560px)"
                  width={1774}
                  height={887}
                  alt=""
                  className={styles.silkImg}
                />
              </div>
              <div className={styles.glow} />
            </div>
          </div>
        </div>
      </div>

      <div className={styles.inner}>
        <SectionIntro
          className={styles.intro}
          eyebrow={copy.eyebrow}
          title={copy.title}
          lede={meetDidiText(region)}
          headingId="familiar-heading"
        />

        {/* Above 599px this wrapper is display: contents. Below it scrolls (scroll-snap), so it is a focusable, named region. */}
        <div id={STRIP_ID} className={styles.strip} role="region" aria-label={copy.stripLabel} tabIndex={0}>
          <ol className={styles.row} role="list">
            {copy.steps.map((step, i) => (
              <li key={step.image} data-slide="" className={styles.day} style={{ '--i': i } as CSSProperties}>
                <div
                  className={styles.device}
                  data-depth={i % 2 === 0 ? 6 : 4}
                  data-depth-y={i % 2 === 0 ? 3 : 2}
                >
                  <Picture
                    base={`${ASSETS}/${step.image}${suffix}`}
                    widths={[560, 840]}
                    sizes={PHONE_SIZES}
                    width={840}
                    height={1711}
                    alt={step.alt}
                    className={styles.phone}
                  />
                </div>
                <div className={styles.cap}>
                  <span className={styles.line} aria-hidden="true" />
                  <div className={styles.card}>
                    <h3 className={styles.title}>{step.title}</h3>
                    <p className={styles.text}>{step.text}</p>
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </div>
        <FamiliarPager
          stripId={STRIP_ID}
          label={copy.pagerLabel}
          itemLabels={copy.steps.map((_, i) => copy.pagerItem(i + 1, copy.steps.length))}
        />

        {/* The client's "What it does now", with the three scans as chips. */}
        <div className={styles.scope}>
          <ul className={styles.chips} role="list" aria-label={copy.scansLabel}>
            {copy.scans.map((scan) => (
              <li key={scan} className={styles.chip}>
                {scan}
              </li>
            ))}
          </ul>
          <p className={styles.scopeText}>{whatItDoes}</p>
        </div>
      </div>
    </section>
  );
}

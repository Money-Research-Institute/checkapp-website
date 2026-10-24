/**
 * FAQs with the lamp (Figma node 2610:30003, 1320 x 666: heading + list only; the space around it lives in margins).
 *
 * A ruled accordion on pure black: two-line gradient h2, four rows (number | question | answer | +/-), row 002 open, and
 * one overhead "lamp" hanging from the top rule of the open row: a huge, very faint green haze plus a small bright cone.
 * Plain DOM + CSS at every tier, no canvas (docs/landing.md: a shader for a 26-level haze and a 69px cone
 * would cost a context for something the DOM does for free).
 *
 *   T0  complete without JS or scroll timelines: native <details name="faq"> rows in an <ol>, row 002 [open], the lamp
 *       lit on the open row (CSS :has() follows it with no script), static CSS haze + the shared dither, answers in the
 *       DOM for crawlers and find-in-page (a closed <details> already exposes its content to find-in-page).
 *   T1  FaqIsland (client, renders nothing): the lamp springs to the row that just opened (a CSS linear() spring driven
 *       by one custom property), rows below shift with a transform FLIP, the answer fades up 8px, closing every row dims
 *       the lamp to ~35 %, FAQ open analytics, arrow keys. The lamp ignites once on arrival (view() timeline, only where
 *       supported; the default is lamp ON), and on fine pointers the cone sways +/-14px through the shared [data-depth]
 *       engine.
 *
 * Layers, back to front: black page, haze (+ dither), cone + hot-spot, rules, text, toggles. The haze and cone are
 * decoration: aria-hidden, pointer-events none, never opacity 0 on any text or on the section. The haze bleeds about
 * 368px up over the bottom of the process section on purpose; it stays BEHIND that section's content because
 * the process stage is z-index 1 and everything here sits at z-index 0 or below inside an isolated container.
 *
 * Layout: see faqs.module.css (container queries on the list: phone / tablet / the Figma arrangement from 900px).
 *
 * Words: the questions and answers are the client's, one set per region (`faqEntries(region)` in src/content/copy; the price
 * question appears only once the region has a price, so the list is four rows today and five later, and every layout here
 * lets the rows grow). The same strings go to the FAQPage JSON-LD, so the structured data never says more than the page. The h2
 * is the only string of our own (./copy.ts, en and ru). Same layout and art in all four regions; Russian runs 15-30 % longer,
 * so every box in the stylesheet takes its height from the text.
 */
import { faqEntries, localeOf } from '@/content/copy';
import type { SectionProps } from '@/content/copy';
import type { CSSProperties } from 'react';
import { Container } from '@/components/ds/Container';
import { GradientHeading } from '@/components/ds/GradientHeading';
import { JsonLd } from '@/components/layout/JsonLd';
import { withBasePath } from '@/lib/paths';
import { faqSchema } from '@/lib/seo';
import { FAQS_COPY } from './copy';
import { FaqIsland } from './FaqIsland';
import styles from './faqs.module.css';

const ASSETS = '/landing/faqs';
const LIST_ID = 'faqs-list';
/** The row that is open in the static HTML: 002, as in Figma (the lamp hangs from the rule above it). */
const OPEN_BY_DEFAULT = 1;

/**
 * The +/- glyphs are the Figma exports, drawn as masks so they follow currentColor (and CanvasText in forced colors).
 * CSS url() ignores GITHUB_PAGES_BASE_PATH, so the URLs are built here and handed over as custom properties.
 */
const ROOT_STYLE = {
  '--faq-plus': `url("${withBasePath(`${ASSETS}/plus.svg`)}")`,
  '--faq-minus': `url("${withBasePath(`${ASSETS}/minus.svg`)}")`,
} as CSSProperties;

/** Safe-area insets for a landscape phone with a notch (a no-op until the viewport asks for viewport-fit=cover). */
const CONTAINER_STYLE = {
  paddingInlineStart: 'max(var(--gutter), env(safe-area-inset-left, 0px))',
  paddingInlineEnd: 'max(var(--gutter), env(safe-area-inset-right, 0px))',
} as CSSProperties;

export function FaqsSection({ region }: SectionProps) {
  const copy = FAQS_COPY[localeOf(region)];
  const entries = faqEntries(region);
  const openIndex = Math.min(OPEN_BY_DEFAULT, entries.length - 1);
  const coneSrc = withBasePath(`${ASSETS}/cone.svg`);

  return (
    <section
      id="faqs"
      data-section="faqs"
      data-figma-node="2610:30003"
      aria-labelledby="faqs-heading"
      className={styles.root}
      style={ROOT_STYLE}
    >
      <JsonLd data={faqSchema(entries.map(({ question, answer }) => ({ question, answer })))} />
      <Container size="wide" style={CONTAINER_STYLE}>
        <GradientHeading as="h2" size="faq" align="left" id="faqs-heading" className={styles.title}>
          {copy.heading}
        </GradientHeading>

        <div className={styles.stage}>
          {/* Static haze: a CSS radial-gradient with Gaussian stops and the shared dither tile. Never a moving layer. */}
          <div className={`${styles.haze} fx-dither`} aria-hidden="true" />

          <ol id={LIST_ID} role="list" className={styles.list}>
            {entries.map((item, index) => {
              const open = index === openIndex;
              // `name` (the exclusive accordion) is standard HTML but missing from this version of the React types.
              const group = { name: 'faq' };
              return (
                <li key={item.question} className={styles.row} data-lit={open ? '' : undefined}>
                  <details className={styles.item} {...group} open={open} data-initial={open ? '' : undefined}>
                    <summary className={styles.summary}>
                      {/* "(001)": a CSS counter, so assistive tech reads the <ol> numbering once, not twice. */}
                      <span className={styles.num} aria-hidden="true" />
                      <h3 className={styles.q}>{item.question}</h3>
                      <span className={styles.glyph} aria-hidden="true">
                        <span className={styles.plus} />
                        <span className={styles.minus} />
                      </span>
                    </summary>
                    <div className={styles.answer}>
                      <p>{item.answer}</p>
                    </div>
                  </details>

                  {/* The lamp of this row: lit only on the open row, hanging from its top rule. */}
                  <span className={styles.lamp} data-faq-lamp aria-hidden="true">
                    <span className={styles.spot} />
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      className={styles.cone}
                      src={coneSrc}
                      alt=""
                      width={321}
                      height={154}
                      // Four identical requests collapse into one 1.7KB fetch; eager (but low priority) so the cone of a
                      // row that lights up later is already decoded when its lamp springs in.
                      fetchPriority="low"
                      decoding="async"
                      data-depth="14"
                      data-depth-y="0"
                    />
                  </span>
                </li>
              );
            })}
          </ol>
        </div>
      </Container>

      <FaqIsland listId={LIST_ID} page={region === 'us' ? 'home' : `home-${region}`} />
    </section>
  );
}

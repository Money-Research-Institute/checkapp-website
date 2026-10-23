/**
 * Testimonials wall (Figma node 2601:13023, 1320 x 954). A server component: pure markup, every effect is CSS.
 *
 * Content comes from src/content/testimonials.ts (docs/landing-decisions.md D2). The six cards are placeholders, so each
 * <figure> carries data-verified="false" until a real entry replaces it; the QA gate reports that as a warning on purpose.
 *
 * The .fx-dither noise layer sits on each card, not on the wall: on the #000 page a wall-wide layer lifts the black gaps between
 * the cards by up to 4/255 and draws a faint rectangle. Banding only matters inside the card fills and the lit card's glow anyway.
 *
 * Structure: header (SectionIntro) + wall. The wall is three independent flex columns, two cards each, vertically centred in the
 * tallest one, which is what staggers their tops (+13.5 / +47 / 0 px at 1440). Layout per width lives in Testimonials.module.css:
 * 3 columns from 960 px, 2 columns plus a faded third-column row from 600 px, 1 column below.
 *
 * Entries flagged needsReplacement (a crypto-template quote, a claim the page may not make) never take a column's full-brightness
 * top slot: arrange() swaps them under the card below, and the stylesheet dims them wherever they land and drops them on a phone.
 * So the cards a reader sees first are the ones the page can stand behind, while all six stay on the wall as D2 decided.
 */
import type { CSSProperties } from 'react';
import type { Region, SectionProps } from '@/content/copy';
import { Container } from '@/components/ds/Container';
import { SectionIntro } from '@/components/ds/SectionIntro';
import { testimonials, type Testimonial } from '@/content/testimonials';
import { withBasePath } from '@/lib/paths';
import { copy } from './copy';
import { MarqueeToggle } from './MarqueeToggle';
import styles from './Testimonials.module.css';

const COLUMNS = 3;
const PER_COLUMN = 2;
/** The Figma card heights by slot (column, row), px. The date sits on margin-top:auto, so these only set the rhythm. */
const SLOT_HEIGHTS: readonly (readonly number[])[] = [[294, 267], [236, 258], [294, 294]];

/** Regions that show no wall: the six quotes are English placeholders (docs/landing-copy.md H4), so /ru/ has none. */
const WITHOUT_TESTIMONIALS: readonly Region[] = ['ru'];

/**
 * The Figma order, two cards per column, except that a flagged card on top of a column trades places with the unflagged card
 * under it. Order inside a column is the only thing that changes, so each column keeps its two cards and its stagger.
 */
function arrange(list: readonly Testimonial[]): Testimonial[][] {
  return Array.from({ length: COLUMNS }, (_, c) => list.slice(c * PER_COLUMN, (c + 1) * PER_COLUMN))
    .filter((column) => column.length > 0)
    .map((column) => {
      const [top, under] = column;
      return top.needsReplacement && under && !under.needsReplacement ? [under, top] : column;
    });
}

function Card({ t, minH, lit, once }: { t: Testimonial; minH: number; lit: boolean; once: boolean }) {
  const avatar = (width: 84 | 126) => withBasePath(`${t.avatar}-${width}.webp`);
  return (
    <figure
      className={`${styles.card} fx-edge fx-dither`}
      data-verified={t.placeholder ? 'false' : 'true'}
      data-placeholder={t.placeholder ? 'true' : undefined}
      data-needs-replacement={t.needsReplacement ? 'true' : undefined}
      data-lit={lit ? 'true' : undefined}
      data-once={once ? '' : undefined}
      style={{ '--min-h': `${minH}px` } as CSSProperties}
    >
      <figcaption className={styles.who}>
        {/* A 42px circle: the 84 / 126 px files are its 2x and 3x. Static export has no image optimiser, so a plain <img>. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          className={styles.avatar}
          src={avatar(84)}
          srcSet={`${avatar(84)} 2x, ${avatar(126)} 3x`}
          width={42}
          height={42}
          alt=""
          loading="lazy"
          decoding="async"
        />
        <span className={styles.id}>
          <span className={styles.name}>{t.name}</span>
          <span className={styles.role}>{t.role}</span>
        </span>
      </figcaption>
      <blockquote className={styles.quote}>
        <p>{`“${t.quote}”`}</p>
      </blockquote>
      <time className={styles.date} dateTime={t.isoDate}>
        {t.date}
      </time>
    </figure>
  );
}

/**
 * Optional in figma-sections.json: it renders nothing for /ru/ (H4) and when there are no testimonials at all. The layout and
 * the art are the same for us, eu and gulf; the header is the same English text, since the client's document has none for it.
 */
export function TestimonialsSection({ region }: SectionProps) {
  if (WITHOUT_TESTIMONIALS.includes(region) || !testimonials.length) return null;
  const { eyebrow, title, lede } = copy.en;
  const columns = arrange(testimonials);
  const slots = columns.map((column, c) => column.map((t, r) => ({ t, minH: SLOT_HEIGHTS[c]?.[r] ?? 270 })));
  // Column c's ring starts with its own cards, so the first frame is the Figma wall; the others follow in turn.
  const rings = slots.map((_, c) => [...slots.slice(c), ...slots.slice(0, c)].flat());
  const litId = columns[1]?.[0]?.id;

  return (
    <section
      data-section="testimonials"
      data-figma-node="2601:13023"
      aria-labelledby="testimonials-heading"
      className={styles.section}
    >
      <Container size="wide">
        <SectionIntro
          className={styles.intro}
          eyebrow={eyebrow}
          title={title}
          lede={lede}
          headingId="testimonials-heading"
        />
        <div className={styles.stage}>
          {/* Three columns. Each carries the whole ring of cards, starting with its own two (the Figma wall), then the other
              columns' cards, twice: the second copy is what the marquee scrolls into. Without the marquee (no JS, reduced
              motion, phones, the low tier) only the first two cards of the first copy show: the finished Figma wall. */}
          <div className={styles.wall} data-marquee-root>
            {columns.map((_, c) => (
              <div key={c} className={styles.col} data-fx="drift">
                <div className={styles.track} data-fx="marquee">
                  {[false, true].map((clone) => (
                    <div
                      key={clone ? 'clone' : 'set'}
                      className={styles.set}
                      {...(clone ? { 'aria-hidden': true, inert: true, 'data-clone': '' } : {})}
                    >
                      {rings[c].map(({ t, minH }, i) => (
                        <Card key={t.id} t={t} minH={minH} lit={t.id === litId} once={!clone && i < PER_COLUMN} />
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <MarqueeToggle />
        </div>
      </Container>
    </section>
  );
}

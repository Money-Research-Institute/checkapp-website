/**
 * Testimonials wall (Figma node 2601:13023, 1320 x 954). A server component: pure markup, every effect is CSS.
 *
 * Content comes from src/content/testimonials.ts (docs/landing-decisions.md D2). The six cards are placeholders, so each
 * <figure> carries data-verified="false" until a real entry replaces it; the QA gate reports that as a warning on purpose.
 *
 * The .fx-dither noise layer sits on each card, not on the wall: on the #000 page a wall-wide layer lifts the black gaps between
 * the cards by up to 4/255 and draws a faint rectangle. Banding only matters inside the card fills and Sofia's glow anyway.
 *
 * Structure: header (SectionIntro) + wall. The wall is three independent flex columns, two cards each, vertically centred in the
 * tallest one, which is what staggers their tops (+13.5 / +47 / 0 px at 1440). Layout per width lives in Testimonials.module.css:
 * 3 columns from 960 px, 2 columns plus a faded Daniel | Liam row from 600 px, 1 column (Alex, Sofia, Ryan, Emily) below.
 */
import type { Region, SectionProps } from '@/content/copy';
import { Container } from '@/components/ds/Container';
import { SectionIntro } from '@/components/ds/SectionIntro';
import { testimonials, type Testimonial } from '@/content/testimonials';
import { withBasePath } from '@/lib/paths';
import { copy } from './copy';
import styles from './Testimonials.module.css';

const COLUMNS = 3;
const PER_COLUMN = 2;

/** Regions that show no wall: the six quotes are English placeholders (docs/landing-copy.md H4), so /ru/ has none. */
const WITHOUT_TESTIMONIALS: readonly Region[] = ['ru'];

function Card({ t }: { t: Testimonial }) {
  const avatar = (width: 84 | 126) => withBasePath(`${t.avatar}-${width}.webp`);
  return (
    <figure
      className={`${styles.card} fx-edge fx-dither`}
      data-verified={t.placeholder ? 'false' : 'true'}
      data-placeholder={t.placeholder ? 'true' : undefined}
      data-needs-replacement={t.needsReplacement ? 'true' : undefined}
      data-once=""
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
  const columns = Array.from({ length: COLUMNS }, (_, c) => testimonials.slice(c * PER_COLUMN, (c + 1) * PER_COLUMN)).filter(
    (column) => column.length > 0,
  );

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
        <div className={styles.wall}>
          {columns.map((column, c) => (
            <div key={c} className={styles.col} data-fx="drift">
              {column.map((t) => (
                <Card key={t.id} t={t} />
              ))}
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}

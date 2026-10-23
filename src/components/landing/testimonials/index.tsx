/**
 * Testimonials: a wall of six glass cards (3 x 2 on desktop, 2 x 3 on a tablet, one column on a phone). A server component, pure markup.
 *
 * Content comes from src/content/testimonials.ts (docs/landing.md D2). Every card is a placeholder, so each <figure> carries
 * data-verified="false" until a real, consented entry replaces it. Entries flagged `needsReplacement` (a crypto-template quote, a claim
 * the page may not make) are not shown at all. The wall renders nothing on /ru/ (H4): LandingPage does not mount it there.
 */
import { Container } from '@/components/ds/Container';
import { GlassCard } from '@/components/ds/GlassCard';
import { SectionIntro } from '@/components/ds/SectionIntro';
import { testimonials } from '@/content/testimonials';
import { withBasePath } from '@/lib/paths';
import { copy } from './copy';
import s from './Testimonials.module.css';

const SHOWN = 6;

export function TestimonialsSection() {
  const shown = testimonials.filter((t) => !t.needsReplacement).slice(0, SHOWN);
  if (!shown.length) return null;
  const { eyebrow, title, lede } = copy.en;
  return (
    <section data-section="testimonials" aria-labelledby="testimonials-heading" className={s.section}>
      <Container size="wide">
        <SectionIntro eyebrow={eyebrow} title={title} lede={lede} headingId="testimonials-heading" />
        <div className={s.wall}>
          {shown.map((t) => {
            const avatar = (width: 84 | 126) => withBasePath(`${t.avatar}-${width}.webp`);
            return (
              <GlassCard key={t.id} as="figure" className={s.card} data-verified={t.placeholder ? 'false' : 'true'}>
                <figcaption className={s.who}>
                  {/* A 42px circle: the 84 / 126 px files are its 2x and 3x. Static export has no image optimiser, so a plain <img>. */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    className={s.avatar}
                    src={avatar(84)}
                    srcSet={`${avatar(84)} 2x, ${avatar(126)} 3x`}
                    width={42}
                    height={42}
                    alt=""
                    loading="lazy"
                    decoding="async"
                  />
                  <span>
                    <span className={s.name}>{t.name}</span>
                    <span className={s.role}>{t.role}</span>
                  </span>
                </figcaption>
                <blockquote className={s.quote}>
                  <p>{`“${t.quote}”`}</p>
                </blockquote>
                <time className={s.date} dateTime={t.isoDate}>
                  {t.date}
                </time>
              </GlassCard>
            );
          })}
        </div>
      </Container>
    </section>
  );
}

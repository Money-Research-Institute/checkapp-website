/**
 * Hero: eyebrow, the client's headline and sub-line, the store CTA and one static phone. Plain DOM + CSS, no client code of its own.
 *
 * Wording (docs/landing.md): the headline, the sub-line, the button label and the price small print are the client's, read from
 * src/content/copy and never retyped. The small print shows only when the region has a price. The eyebrow and the phone's alt
 * text are ours (./copy.ts, Russian marked DRAFT). The phone is the same art in every region; /ru/ gets the screen in Russian.
 *
 * DOM contract: <h1 data-critical="headline"> is the page's only h1; the CTA carries data-critical="primary-cta" and
 * data-hides-cta-bar, so the phone's sticky bar stays out of its way while it is on screen.
 */
import { getRegionCopy, localeOf, subscriptionLine } from '@/content/copy';
import type { SectionProps } from '@/content/copy';
import { CtaButton } from '@/components/ds/CtaButton';
import { Eyebrow } from '@/components/ds/Eyebrow';
import { GradientHeading } from '@/components/ds/GradientHeading';
import { Picture } from '@/components/ds/Picture';
import { APP_DOWNLOAD_URL } from '@/lib/constants';
import { heroCopy } from './copy';
import { KeepHyphenated } from './keep-hyphenated';
import s from './hero.module.css';

export function HeroSection({ region }: SectionProps) {
  const copy = getRegionCopy(region);
  const locale = localeOf(region);
  const t = heroCopy[locale];
  const price = subscriptionLine(region);
  return (
    <section data-section="hero" aria-labelledby="hero-heading" className={s.hero}>
      <div className={s.copy}>
        <Eyebrow strong>{t.eyebrow}</Eyebrow>
        <GradientHeading as="h1" size="hero" id="hero-heading" data-critical="headline" className={s.title}>
          <KeepHyphenated>{copy.hero.headline}</KeepHyphenated>
        </GradientHeading>
        <p className={s.lede}>
          <KeepHyphenated>{copy.hero.subheadline}</KeepHyphenated>
        </p>
        <CtaButton
          href={APP_DOWNLOAD_URL}
          size="lg"
          trackingPage={region === 'us' ? 'home' : `home-${region}`}
          trackingPosition="hero"
          data-critical="primary-cta"
          data-hides-cta-bar
        >
          {copy.hero.cta}
        </CtaButton>
        {price ? <p className={s.fine}>{price}</p> : null}
      </div>
      <div className={s.stage}>
        <Picture
          base={locale === 'ru' ? '/landing/hero/phone-ru' : '/landing/hero/phone'}
          widths={[400, 800]}
          sizes="(min-width: 900px) 380px, 280px"
          width={800}
          height={1594}
          alt={t.phoneAlt}
          priority
          className={s.phone}
        />
      </div>
    </section>
  );
}

/**
 * Final CTA: one glass card, the client's closing words on one side and the app's home screen on the other. A server component:
 * the card, the phone and the button are plain DOM + one picture, no client code, no motion.
 *
 * Wording (docs/landing.md; nothing client-written is retyped here, it is all read from src/content/copy):
 *  - the h2 is "FINAL CALL" (`finalCta`), verbatim, one sentence;
 *  - the sub-line is `adLines[1]`, the ad line the document names for it;
 *  - the note beside the button is "DATA AND CONSENT" (`dataConsent`): where the photos go, that face and iris images are
 *    biometric, that the person is asked first (the EU / Russian wording says "explicit consent" / «с твоего согласия»);
 *  - the button reads `hero.cta`, the region's own download call ("Get checkapp", «Скачать checkapp»).
 *  There is no price, plan, trial, report or history anywhere in the card.
 *
 * The phone is the app's home screen with the three photo scans (Tongue, Face, Iris) and a generic "Start a scan" button, in an
 * English and a Russian render (D5, docs/landing.md). It is cropped flush with the bottom edge of the card.
 */
import { getRegionCopy, localeOf } from '@/content/copy';
import type { SectionProps } from '@/content/copy';
import { Container } from '@/components/ds/Container';
import { CtaButton } from '@/components/ds/CtaButton';
import { GlassCard } from '@/components/ds/GlassCard';
import { GradientHeading } from '@/components/ds/GradientHeading';
import { Picture } from '@/components/ds/Picture';
import { APP_DOWNLOAD_URL } from '@/lib/constants';
import { finalCtaCopy } from './copy';
import s from './FinalCta.module.css';

export function FinalCtaSection({ region }: SectionProps) {
  const { finalCta, adLines, dataConsent, hero } = getRegionCopy(region);
  const locale = localeOf(region);
  return (
    <section data-section="final-cta" aria-labelledby="final-cta-heading" className={s.root}>
      <Container size="wide">
        <GlassCard glow padded={false} className={s.card}>
          <div className={s.layout}>
            <div className={s.copy}>
              <GradientHeading as="h2" size="section" id="final-cta-heading" className={s.heading}>
                {finalCta}
              </GradientHeading>
              <p className={s.sub}>{adLines[1]}</p>
              <CtaButton
                href={APP_DOWNLOAD_URL}
                size="lg"
                tone="brand"
                trackingPage="home"
                trackingPosition="final-cta"
                data-hides-cta-bar
              >
                {hero.cta}
              </CtaButton>
              <p className={s.note}>{dataConsent}</p>
            </div>
            <div className={s.phoneBox}>
              <Picture
                base={`/landing/final-cta/phone-${locale}`}
                widths={[384, 768, 1152]}
                sizes="(min-width: 800px) 300px, 280px"
                width={1152}
                height={2274}
                alt={finalCtaCopy[locale].phoneAlt}
                className={s.phone}
              />
            </div>
          </div>
        </GlassCard>
      </Container>
    </section>
  );
}

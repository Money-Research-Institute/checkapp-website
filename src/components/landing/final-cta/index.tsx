/**
 * 08 · Final CTA card (Figma node 2601:13109, 1320 x 433.7 at 1440; "node · Data" in the file, slug `final-cta`).
 *
 * A server component that takes the region and renders the same card and art for all four; only the strings change. Complete at
 * T0: the card, the phone and the CTA are plain DOM + one picture. There is no canvas and no script here; every effect is CSS
 * (FinalCta.module.css) and every one of them is an enhancement of a finished layout, so no-JS, Firefox, older Safari, print and
 * reduced motion all show the final frame. The experience tiers add nothing to this section: T0, T1 and T2 render the same card.
 *
 * Wording (docs/landing-copy.md; nothing client-written is retyped here, it is all read from src/content/copy):
 *  - the h2 is "FINAL CALL" (`finalCta`), verbatim, one sentence;
 *  - the sub-line is `adLines[1]`, the ad line the document names for it;
 *  - the note beside the button is "DATA AND CONSENT" (`dataConsent`): where the photos go, that face and iris images are
 *    biometric, that the person is asked first (the EU / Russian wording says "explicit consent" / «с твоего согласия»);
 *  - the button reads `hero.cta`, the region's own download call ("Get checkapp", «Скачать checkapp»).
 *  There is no price, plan, trial, report or history anywhere in the card.
 *
 * Layout: the shell is the container. Phone left / text right from 760px of card width (640px on a landscape phone), stacked
 * below that with the phone cropped flush with the bottom edge. Sizes are cqi of the shell, so the row scales with the card
 * instead of snapping. The same layout and art serve every region; Russian runs 15-30 % longer, so nothing is sized to a line
 * count: the text column is centred, the card grows (the phone image is taller than any row card gets) and the note drops under
 * the button when the column is too narrow for both.
 *
 * Calls that are not Figma's, and why:
 *  - docs/landing-decisions.md D5 and docs/landing-copy.md: Figma's phone shows the "Upgrade Your CheckApp" paywall (Free | Pro |
 *    Premium+), which depicts paid plans the app cannot sell, and "weekly report / 90-day history" are not things the app does
 *    today. The device is the same Figma "iPhone 15 Green" frame (2601:13118, with the power button kept) carrying the app's home
 *    screen (2601:12776: status bar, avatar, greeting, DiDi) with the three photo scans, Tongue, Face and Iris, in place of the
 *    streak card, plus a generic "Start a scan" button. Those three buttons and the mascot's new position are composed, not
 *    exported; everything else in the screen is Figma's pixels. One flattened image on #000, in an English and a Russian render.
 *  - D4: the headline is Manrope 700 where Figma has Inter Bold; 52px (Figma: 64px) because the client's sentence is 64
 *    characters, not 46. It balances over three or four lines.
 *  - D1 / D6: "DiDi", not "DIDI"; the sub-line is --c-sub-on-black (#7c7c86, 5.1:1) instead of Figma's #52525b (2.7:1).
 *  - The mobile stack, the landscape-phone row and the high-contrast / forced-colors treatment are not in Figma (it only has
 *    1440); they are derived from its intent.
 */
import { getRegionCopy, localeOf } from '@/content/copy';
import type { SectionProps } from '@/content/copy';
import type { ReactNode } from 'react';
import { CtaButton } from '@/components/ds/CtaButton';
import { Picture } from '@/components/ds/Picture';
import { APP_DOWNLOAD_URL } from '@/lib/constants';
import { finalCtaCopy } from './copy';
import styles from './FinalCta.module.css';

/** public/landing/final-cta/phone-<locale>-384|768|1152 (.avif / .webp): the whole 370px device plus 4px of room, 384 x 758 CSS px. */
const PHONE = '/landing/final-cta/phone';

/** Row: 29.09cqi of a card that is at most 1320px wide (384px there). Stacked: min(76cqi, 340px). */
const PHONE_SIZES = '(min-width: 1440px) 384px, (min-width: 830px) 27vw, min(76vw, 340px)';

/**
 * One rim hot-spot: a green disc and a cream pill, both Gaussian-blurred, as in Figma's two `blobs` frames. The wrapper is
 * what slides along the edge; the shapes are placed from the corner in px (CSS), never scaled with the card.
 */
function Lobe({ corner }: { corner: 'tl' | 'br' }): ReactNode {
  return (
    <span className={`${styles.lobe} ${corner === 'tl' ? styles.lobeTl : styles.lobeBr}`}>
      <span className={styles.green} />
      <span className={styles.cream} />
    </span>
  );
}

/**
 * The card hangs over the footer: z-index above it and a negative bottom margin of --footer-overlap (tokens.css sets the
 * overlap and the footer's runway when this section is on the page). Margins, not padding, so the data-section height
 * stays the card's own ~434px at 1440.
 */
export function FinalCtaSection({ region }: SectionProps) {
  const { finalCta, adLines, dataConsent, hero } = getRegionCopy(region);
  const locale = localeOf(region);
  const copy = finalCtaCopy[locale];

  return (
    <section
      data-section="final-cta"
      data-figma-node="2601:13109"
      aria-labelledby="final-cta-heading"
      className={styles.root}
    >
      <div className={styles.shell}>
        {/* Rim light: two lobes seen only through a ring-shaped mask (the 2.15px gap around the card). */}
        <div className={styles.rim} aria-hidden="true">
          <Lobe corner="tl" />
          <Lobe corner="br" />
        </div>

        <div className={styles.card}>
          <div className={styles.copy}>
            <h2 id="final-cta-heading" className={styles.heading}>
              {finalCta}
            </h2>
            <p className={styles.sub}>{adLines[1]}</p>
            <div className={styles.actions}>
              <div className={styles.cta}>
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
              </div>
              <p className={styles.note}>{dataConsent}</p>
            </div>
          </div>

          <div className={styles.phone}>
            <div className={styles.rise}>
              <Picture
                base={`${PHONE}-${locale}`}
                widths={[384, 768, 1152]}
                sizes={PHONE_SIZES}
                width={1152}
                height={2274}
                alt={copy.phoneAlt}
                className={styles.img}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

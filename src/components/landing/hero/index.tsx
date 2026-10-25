/**
 * Hero (Figma node 2601:12436, 1440 x 1225): a living floor, a phone and floating glass cards.
 *
 * A server component with no client code of its own, taking { region } like every landing section: the layout and the art are the
 * same for us, eu, gulf and ru; only the strings change. The page is complete without any JavaScript: the copy, the phone and the
 * cards are plain DOM/PNG layers over the floor poster; any motion is CSS (see styles/motion.css), and the finished
 * frame is the default one.
 *
 * DOM contract: <h1 data-critical="headline"> is the page's only h1, the primary CTA
 * carries data-critical="primary-cta" and data-hides-cta-bar, the poster <img data-webgl-poster> and the canvas are
 * siblings in one box (.floor) that never changes size when the canvas arrives, each decorative card is aria-hidden on
 * its own, and the phone keeps real alt text. The Header (nav) is foundation's, fixed over the top of this section.
 *
 * Wording (docs/landing-copy.md): the headline, the sub-line, the button label and the price small print are the client's, read from
 * src/content/copy and never retyped. The small print shows only when the region has a price (subscriptionLine is null until
 * pricing.ts has one). The eyebrow, the phone's alt text and the words on the floating cards are ours (./copy.ts, Russian marked
 * DRAFT). The phone is the same art in every region; /ru/ gets it with the screen's words in Russian (phone-ru, ./art).
 *
 * The cards say only what the app does today (a photo scan on request and the short insight that comes back). So the design's
 * smartwatch, Heart Rate, Sleep and Body Composition cards are a finished-scan card, two readings and a moisture gauge; the plan
 * card is DiDi's check-in nudge; the Upgrade card is DiDi asking for a photo (D1, D5, docs/landing-copy.md). Same places, same glass.
 * The headline and the sub-line go through KeepHyphenated, so "check-in" and "once-a-year" never break after the hyphen.
 * Past 1473px the floor poster is narrower than the section, so a pair of side strips (the poster's own edge columns, extended)
 * carries the green atmosphere out to the screen edges instead of leaving black walls.
 */
import { getRegionCopy, localeOf, subscriptionLine } from '@/content/copy';
import type { SectionProps } from '@/content/copy';
import type { CSSProperties } from 'react';
import { CtaButton } from '@/components/ds/CtaButton';
import { Eyebrow } from '@/components/ds/Eyebrow';
import { GradientHeading } from '@/components/ds/GradientHeading';
import { Picture } from '@/components/ds/Picture';
import { APP_DOWNLOAD_URL } from '@/lib/constants';
import { GaugeCard, MascotCard, NudgeCard, ReadingTiles, ResultCard, StreakCard } from './cards';
import { heroCopy } from './copy';
import { KeepHyphenated } from './keep-hyphenated';
import s from './hero.module.css';

/**
 * ds Picture is lazy unless `priority`, and `priority` also adds a preload and fetchpriority=high (reserved for the poster).
 * The phone and the ambient glow are in the first view too, so they load eagerly without competing with the poster.
 */
const eager = { loading: 'eager' } as const;

/**
 * Idle float: 5-7 s, +/-4px, paused off-screen by the engine. Each plane has its own period and a small positive delay,
 * so every plane starts exactly at rest (the first frame is the Figma frame) and they drift apart from there.
 */
const bob = (duration: number, delay: number): CSSProperties =>
  ({ '--bob-dur': `${duration}s`, '--bob-delay': `${delay}s` }) as CSSProperties;

export function HeroSection({ region }: SectionProps) {
  const copy = getRegionCopy(region);
  const locale = localeOf(region);
  const t = heroCopy[locale];
  const price = subscriptionLine(region);
  return (
    <section data-section="hero" data-figma-node="2601:12436" aria-labelledby="hero-heading" className={s.hero}>
      <div className={s.inner}>
        <div className={`${s.ambient} fx-dither`} aria-hidden="true">
          <Picture
            base="/landing/hero/ambient"
            widths={[720]}
            width={720}
            height={240}
            alt=""
            className={s.ambientImg}
            {...eager}
          />
        </div>

        <div className={s.copy}>
          <Eyebrow strong className={s.badge}>
            {t.eyebrow}
          </Eyebrow>
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
            className={s.cta}
          >
            {copy.hero.cta}
          </CtaButton>
          {price ? <p className={s.fine}>{price}</p> : null}
        </div>

        <div className={s.stage}>
          {/* Floor: poster (the LCP image on desktop), the T2 canvas drawing it as a texture, and the black fade. */}
          <div className={`${s.floor} fx-dither`}>
            <Picture
              base="/landing/hero/floor"
              widths={[640, 1080, 1492]}
              sizes="(min-width: 700px) 1472px, 100vw"
              width={1492}
              height={992}
              alt=""
              priority
              data-webgl-poster=""
              className={s.poster}
              sources={[
                {
                  media: '(max-width: 699px) and (orientation: portrait)',
                  base: '/landing/hero/floor-tall',
                  widths: [360, 720],
                  sizes: '100vw',
                },
              ]}
            />
            <div className={s.floorFade} aria-hidden="true" />
          </div>

          {/* Past 1473px the poster is narrower than the section: its own edge columns, extended, carry the glow to the screen edges. */}
          <div className={s.reach} aria-hidden="true">
            <span className={`${s.reachSide} ${s.reachL} fx-dither`} />
            <span className={`${s.reachSide} ${s.reachR} fx-dither`} />
          </div>

          {/* Nudge: DiDi offering a check-in, where the Premium+ plan card stood (Figma 2822:13948).
              On a phone it comes first and leads the cascade; from 700 up it flanks the phone on the right. */}
          <div className={`${s.plane} ${s.scans}`} data-depth="26">
            <div className={s.exitScans}>
              <div className={s.float} data-fx="bob" style={bob(5.6, 1.1)}>
                <NudgeCard t={t.nudge} />
              </div>
            </div>
          </div>

          {/* Left rail: what comes back from a scan. A finished-scan header and the two readings from 1024 up; DiDi's note
              at every width. On a phone it sits below the nudge card, out of the first view. */}
          <div className={`${s.plane} ${s.rail}`} data-depth="26">
            <div className={s.exitRail}>
              <div className={s.float} data-fx="bob" style={bob(6.4, 0.4)}>
                <ResultCard t={t.result} />
                <div className={s.checks}>
                  <ReadingTiles t={t.readings} />
                  <GaugeCard t={t.gauge} />
                </div>
              </div>
            </div>
          </div>

          {/* DiDi's prompt: the tilted card at the phone's right edge, where the Upgrade card stood. Desktop only. */}
          <div className={`${s.plane} ${s.mascot}`} data-depth="30">
            <div className={s.exitMascot}>
              <div className={s.float} data-fx="bob" style={bob(7.2, 2.4)}>
                <MascotCard t={t.mascot} />
              </div>
            </div>
          </div>

          {/* Streak: the tilted card, half behind the phone. Desktop only; the phone hides most of it. */}
          <div className={`${s.plane} ${s.streak}`} data-depth="34">
            <div className={s.exitStreak}>
              <div className={s.float} data-fx="bob" style={bob(6.8, 1.8)}>
                <StreakCard t={t.streak} />
              </div>
            </div>
          </div>

          {/* The phone: one meaningful image (whole device, UI baked in). The Russian page gets the same screen in Russian
              (phone-ru, made by ./art/build.mjs), so the app reads in one language from the hero down to the final phone. */}
          <div className={`${s.plane} ${s.phone}`} data-depth="12" data-depth-rot="3">
            <div className={`${s.exitPhone}`}>
              <Picture
                base={locale === 'ru' ? '/landing/hero/phone-ru' : '/landing/hero/phone'}
                widths={[400, 800]}
                sizes="(min-width: 1920px) 480px, (min-width: 768px) 400px, 300px"
                width={800}
                height={1594}
                alt={t.phoneAlt}
                className={s.phoneImg}
                {...eager}
              />
            </div>
          </div>

          <div className={s.bottomFade} aria-hidden="true" />
        </div>
      </div>
    </section>
  );
}

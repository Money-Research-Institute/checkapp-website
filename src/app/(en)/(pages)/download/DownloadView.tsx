import { Button, CtaButton, GlassCard, PageHero, PageShell, Section } from '@/components/ds';
import { JsonLd } from '@/components/layout/JsonLd';
import type { Dict } from '@/i18n';
import { ANDROID_APK_AVAILABLE, ANDROID_APK_URL, PLAY_STORE_URL, SOCIAL_LINKS } from '@/lib/constants';
import { breadcrumbSchema } from '@/lib/seo';
import styles from './download.module.css';
import { PhoneIcon, ShieldIcon } from './icons';

/**
 * The download page, in the language of `t`. `/download/` (English) and `/ru/download/` (Russian) render it, so the page that a
 * Russian visitor reaches from the main call to action is in their language (the Russian root layout sets `<html lang="ru">`).
 *
 * The APK flow is Play-critical and the same in both: the button only exists while ANDROID_APK_AVAILABLE is true (otherwise the
 * "coming shortly" notice stands in), the Play Store button only while PLAY_STORE_URL is set, and both open in a new tab with
 * the same tracking positions. `data-hides-cta-bar` keeps the phone's sticky bar (and, on a landscape phone, the header's
 * download button) from sitting over the page's own download button.
 */
export function DownloadView({
  t,
  disclaimer,
  homePath,
  downloadPath,
}: {
  t: Dict['download'];
  /** The regulatory line, in the page's language. D1: the gate exempts anything marked data-disclaimer. */
  disclaimer: string;
  /** The landing page of this language (`/` or `/ru/`), for the breadcrumb. */
  homePath: string;
  /** This page's own path, for the breadcrumb. */
  downloadPath: string;
}) {
  const actions =
    ANDROID_APK_AVAILABLE || PLAY_STORE_URL ? (
      <>
        {ANDROID_APK_AVAILABLE ? (
          <CtaButton
            href={ANDROID_APK_URL}
            external
            size="lg"
            trackingPage="download"
            trackingPosition="hero_apk"
            data-hides-cta-bar
          >
            {t.apk}
          </CtaButton>
        ) : null}
        {PLAY_STORE_URL ? (
          <Button
            href={PLAY_STORE_URL}
            external
            variant="secondary"
            trackingPage="download"
            trackingPosition="hero_play"
            data-hides-cta-bar
          >
            {t.play}
          </Button>
        ) : null}
      </>
    ) : null;

  return (
    <PageShell>
      <JsonLd
        data={breadcrumbSchema([
          { name: t.breadcrumbHome, path: homePath },
          { name: t.breadcrumbDownload, path: downloadPath },
        ])}
      />

      <PageHero
        eyebrow={t.eyebrow}
        title={t.title}
        lede={t.lede}
        actions={
          <>
            {actions}
            {!ANDROID_APK_AVAILABLE ? (
              <div className={styles.notice} data-hides-cta-bar>
                <p className={styles.noticeTitle}>{t.soonTitle}</p>
                <p className={styles.noticeText}>
                  {t.soonText} <a href={SOCIAL_LINKS.contact}>hello@checkapp.today</a>.
                </p>
              </div>
            ) : null}
          </>
        }
      />

      <Section size="narrow" tight>
        <div className={styles.grid}>
          <GlassCard as="section" className={styles.card} aria-labelledby="download-install">
            <span className={styles.mark}>
              <PhoneIcon />
            </span>
            <h2 id="download-install" className={styles.cardTitle}>
              {t.installTitle}
            </h2>
            <ol className={styles.steps}>
              <li>
                {t.step1.before}
                <strong>{t.step1.strong}</strong>
                {t.step1.after}
              </li>
              <li>
                {t.step2.before}
                <em>{t.step2.em}</em>
                {t.step2.after}
              </li>
              <li>
                {t.step3.before}
                <strong>{t.step3.strong}</strong>
                {t.step3.after}
              </li>
              <li>{t.step4}</li>
            </ol>
          </GlassCard>

          <GlassCard as="section" className={styles.card} aria-labelledby="download-before">
            <span className={styles.mark}>
              <ShieldIcon />
            </span>
            <h2 id="download-before" className={styles.cardTitle}>
              {t.beforeTitle}
            </h2>
            <ul className={styles.points}>
              <li>{t.androidVersion}</li>
              <li data-disclaimer>{disclaimer}</li>
              <li>{t.playStatus}</li>
            </ul>
          </GlassCard>
        </div>
      </Section>
    </PageShell>
  );
}

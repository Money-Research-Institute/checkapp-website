import { Button, CtaButton, GlassCard, PageHero, PageShell, Section } from '@/components/ds';
import { JsonLd } from '@/components/layout/JsonLd';
import { ANDROID_APK_AVAILABLE, ANDROID_APK_URL, PLAY_STORE_URL, SOCIAL_LINKS } from '@/lib/constants';
import { breadcrumbSchema, createMetadata } from '@/lib/seo';
import styles from './download.module.css';
import { PhoneIcon, ShieldIcon } from './icons';

export const metadata = createMetadata({
  title: 'Download CheckApp for Android',
  description:
    'Download the CheckApp Android APK and start daily check-ins with DiDi, your AI wellness companion.',
  path: '/download',
});

export default function DownloadPage() {
  /*
   * The APK flow is Play-critical and unchanged: the button only exists while ANDROID_APK_AVAILABLE is true (otherwise
   * the "coming shortly" notice stands in), the Play Store button only while PLAY_STORE_URL is set, and both open in a
   * new tab with the same tracking positions as before. `data-hides-cta-bar` keeps the phone's sticky "Get checkapp"
   * bar from sitting over the page's own download button.
   */
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
            Download APK
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
            Get it on Google Play
          </Button>
        ) : null}
      </>
    ) : null;

  return (
    <PageShell>
      <JsonLd
        data={breadcrumbSchema([
          { name: 'Home', path: '/' },
          { name: 'Download', path: '/download' },
        ])}
      />

      <PageHero
        eyebrow="Android"
        title="Download CheckApp"
        lede="Direct APK for Android."
        actions={
          <>
            {actions}
            {!ANDROID_APK_AVAILABLE ? (
              <div className={styles.notice} data-hides-cta-bar>
                <p className={styles.noticeTitle}>APK coming shortly</p>
                <p className={styles.noticeText}>
                  We&apos;re preparing the production Android build. This page will unlock the download as soon as the
                  file is published. Check back soon, or email{' '}
                  <a href={SOCIAL_LINKS.contact}>hello@checkapp.today</a>.
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
              Install on Android
            </h2>
            <ol className={styles.steps}>
              <li>
                Tap <strong>Download APK</strong> on this page (from your phone).
              </li>
              <li>
                If prompted, allow installs from this browser under <em>Install unknown apps</em>.
              </li>
              <li>
                Open the downloaded file and tap <strong>Install</strong>.
              </li>
              <li>Open CheckApp and create your account.</li>
            </ol>
          </GlassCard>

          <GlassCard as="section" className={styles.card} aria-labelledby="download-before">
            <span className={styles.mark}>
              <ShieldIcon />
            </span>
            <h2 id="download-before" className={styles.cardTitle}>
              Before you install
            </h2>
            <ul className={styles.points}>
              <li>Android 8.0 or newer recommended.</li>
              {/* D1: the regulatory wording stays, and the gate exempts disclaimers marked data-disclaimer. */}
              <li data-disclaimer>
                CheckApp and DiDi are wellness companions — not a medical device or diagnosis tool.
              </li>
              <li>Google Play listing is in progress; the APK here is the official direct download.</li>
            </ul>
          </GlassCard>
        </div>
      </Section>
    </PageShell>
  );
}

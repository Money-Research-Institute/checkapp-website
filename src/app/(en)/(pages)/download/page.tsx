import { Section } from '@/components/ui/Section';
import { Button } from '@/components/ui/Button';
import { JsonLd } from '@/components/layout/JsonLd';
import { createMetadata, breadcrumbSchema } from '@/lib/seo';
import { ANDROID_APK_URL, ANDROID_APK_AVAILABLE, PLAY_STORE_URL } from '@/lib/constants';
import { Smartphone, ShieldAlert, Download } from 'lucide-react';

export const metadata = createMetadata({
  title: 'Download CheckApp for Android',
  description:
    'Download the CheckApp Android APK and start daily check-ins with DIDI, your AI wellness companion.',
  path: '/download',
});

export default function DownloadPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbSchema([
          { name: 'Home', path: '/' },
          { name: 'Download', path: '/download' },
        ])}
      />

      <Section className="pt-16 pb-8 md:pt-24">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-primary">Android</p>
          <h1 className="mt-3 font-display text-4xl font-bold tracking-tight text-text-primary md:text-5xl">
            Download CheckApp
          </h1>
          <p className="mt-4 text-lg text-text-secondary">
            Direct APK for Android. Free for the August launch — no account fees, no in-app purchases
            required.
          </p>

          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            {ANDROID_APK_AVAILABLE ? (
              <Button
                href={ANDROID_APK_URL}
                external
                trackingPage="download"
                trackingPosition="hero_apk"
                className="inline-flex items-center gap-2 px-8 py-3.5 text-base"
              >
                <Download className="h-5 w-5" aria-hidden />
                Download APK
              </Button>
            ) : (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 px-6 py-4 text-left text-sm text-amber-950">
                <p className="font-semibold">APK coming shortly</p>
                <p className="mt-1 text-amber-900/80">
                  We&apos;re preparing the production Android build. This page will unlock the
                  download as soon as the file is published. Check back soon, or email{' '}
                  <a className="underline" href="mailto:hello@checkapp.today">
                    hello@checkapp.today
                  </a>
                  .
                </p>
              </div>
            )}

            {PLAY_STORE_URL ? (
              <Button
                href={PLAY_STORE_URL}
                external
                variant="secondary"
                trackingPage="download"
                trackingPosition="hero_play"
                className="px-8 py-3.5 text-base"
              >
                Get it on Google Play
              </Button>
            ) : null}
          </div>
        </div>
      </Section>

      <Section className="pb-20">
        <div className="mx-auto grid max-w-3xl gap-6 md:grid-cols-2">
          <div className="surface p-6">
            <Smartphone className="h-8 w-8 text-primary" aria-hidden />
            <h2 className="mt-4 font-display text-xl font-bold">Install on Android</h2>
            <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-text-secondary">
              <li>Tap <strong>Download APK</strong> on this page (from your phone).</li>
              <li>
                If prompted, allow installs from this browser under{' '}
                <em>Install unknown apps</em>.
              </li>
              <li>Open the downloaded file and tap <strong>Install</strong>.</li>
              <li>Open CheckApp and create your account.</li>
            </ol>
          </div>

          <div className="surface p-6">
            <ShieldAlert className="h-8 w-8 text-primary" aria-hidden />
            <h2 className="mt-4 font-display text-xl font-bold">Before you install</h2>
            <ul className="mt-3 space-y-2 text-sm text-text-secondary">
              <li>Android 8.0 or newer recommended.</li>
              <li>
                CheckApp and DIDI are wellness companions — not a medical device or diagnosis tool.
              </li>
              <li>
                Google Play listing is in progress; the APK here is the official direct download.
              </li>
            </ul>
          </div>
        </div>
      </Section>
    </>
  );
}

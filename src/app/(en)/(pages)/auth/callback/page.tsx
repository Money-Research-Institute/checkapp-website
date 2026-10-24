import { LogoMark } from '@/components/brand/LogoMark';
import { Button, GlassCard, GradientHeading, PageShell, Section } from '@/components/ds';
import { CallbackStatus } from '@/components/forms/CallbackStatus';
import { createMetadata } from '@/lib/seo';
import styles from './callback.module.css';

/*
 * A bridge, not content: it hands an email link (password recovery, sign-up confirmation) to the Android app through
 * the checkapp:// scheme. It stays out of the sitemap (next-sitemap excludes /auth), is disallowed in robots.txt, and
 * now also says noindex in its own metadata.
 */
export const metadata = createMetadata({
  title: 'Signing you in to CheckApp',
  description: 'Opening the CheckApp app to finish signing you in.',
  path: '/auth/callback',
  noindex: true,
});

export default function AuthCallbackPage() {
  return (
    <PageShell>
      <Section size="narrow">
        <GlassCard className={styles.card}>
          <div className={styles.inner}>
            <LogoMark size={64} priority />
            <GradientHeading as="h1" size="sub">
              Signing you in
            </GradientHeading>
            <CallbackStatus />
            <Button href="/download/" data-hides-cta-bar>
              Download the Android app
            </Button>
          </div>
        </GlassCard>
      </Section>
    </PageShell>
  );
}

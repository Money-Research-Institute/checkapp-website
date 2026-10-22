import type { Metadata } from 'next';
import { CtaButton } from '@/components/ds/CtaButton';
import { PageHero, PageShell } from '@/components/ds/Section';

export const metadata: Metadata = {
  title: 'Page not found',
  robots: { index: false, follow: true },
};

/** Branded 404 (written to out/404.html). The shell, header and footer come from the root layout. */
export default function NotFound() {
  return (
    <PageShell>
      <PageHero
        eyebrow="404"
        title="This page wandered off"
        lede="DiDi looked everywhere and could not find it. Let's get you back to somewhere that exists."
        actions={
          <CtaButton href="/" size="lg" trackingPage="not-found" trackingPosition="hero">
            Back to home
          </CtaButton>
        }
      />
    </PageShell>
  );
}

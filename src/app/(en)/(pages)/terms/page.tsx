import { JsonLd } from '@/components/layout/JsonLd';
import { Section } from '@/components/ui/Section';
import { createMetadata, breadcrumbSchema } from '@/lib/seo';

export const metadata = createMetadata({
  title: 'Terms of Service — CheckApp',
  description:
    'CheckApp terms of service including medical disclaimer, acceptable use, and subscription terms.',
  path: '/terms',
});

export default function TermsPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbSchema([
          { name: 'Home', path: '/' },
          { name: 'Terms of Service', path: '/terms' },
        ])}
      />

      <Section variant="light" className="pt-24 md:pt-28">
        <h1 className="font-display text-4xl font-bold">Terms of Service</h1>
        <p className="mt-2 text-text-secondary">Last updated: June 1, 2026</p>

        <div className="prose-checkapp mt-10 max-w-3xl">
          <h2>Acceptance of terms</h2>
          <p>
            By downloading, installing, or using CheckApp, you agree to these Terms of Service. If
            you do not agree, do not use the app.
          </p>

          <h2>Medical disclaimer</h2>
          <p>
            <strong>CheckApp and DIDI are not medical devices.</strong> The app provides wellness
            guidance and habit support only. Tongue scan analysis, hydration estimates, and AI
            responses are for informational purposes and do not constitute medical advice, diagnosis,
            or treatment. Always consult a qualified healthcare professional for medical concerns.
          </p>

          <h2>Acceptable use</h2>
          <p>
            You agree to use CheckApp for personal wellness purposes only. You may not misuse the
            app, attempt to reverse-engineer AI systems, or share content that violates others&apos;
            privacy.
          </p>

          <h2>Subscriptions</h2>
          <p>
            Paid plans (Base, Premium+) are billed through the Apple App Store. Subscriptions
            auto-renew unless cancelled at least 24 hours before the end of the current period.
            Refunds are handled according to Apple&apos;s refund policy.
          </p>

          <h2>Intellectual property</h2>
          <p>
            CheckApp, DIDI, and all related content are owned by CheckApp. You retain ownership of
            content you submit (photos, videos, messages) but grant us a license to process it for
            providing the service.
          </p>

          <h2>Limitation of liability</h2>
          <p>
            CheckApp is provided &ldquo;as is.&rdquo; We are not liable for any health outcomes
            resulting from use of the app. Our total liability is limited to the amount you paid
            for the service in the past 12 months.
          </p>

          <h2>Contact</h2>
          <p>
            Questions about these terms: <a href="mailto:hello@checkapp.health">hello@checkapp.health</a>
          </p>
        </div>
      </Section>
    </>
  );
}

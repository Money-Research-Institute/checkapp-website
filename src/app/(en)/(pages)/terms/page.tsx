import { PageHero, PageShell, Prose, Section } from '@/components/ds';
import { JsonLd } from '@/components/layout/JsonLd';
import { createMetadata, breadcrumbSchema } from '@/lib/seo';

export const metadata = createMetadata({
  title: 'Terms of Service — CheckApp',
  description:
    'CheckApp terms of service including medical disclaimer, acceptable use, and subscription terms.',
  path: '/terms',
});

/*
 * Legal text: the wording below is the terms as published. Change structure and styling here, never the words;
 * a wording change is a legal decision. Each h2 has an id so a section can be linked (/terms/#medical-disclaimer).
 */
export default function TermsPage() {
  return (
    <PageShell>
      <JsonLd
        data={breadcrumbSchema([
          { name: 'Home', path: '/' },
          { name: 'Terms of Service', path: '/terms' },
        ])}
      />

      <PageHero
        title="Terms of Service"
        lede={
          <>
            Last updated: <time dateTime="2026-06-01">June 1, 2026</time>
          </>
        }
      />

      <Section size="prose" tight>
        {/* 68ch measure, counted in the text's own size (Prose sets 1.0625rem), so the wrapper takes the same font size. */}
        <div className="mx-auto max-w-[68ch] text-[1.0625rem]">
          <Prose>
            <h2 id="acceptance-of-terms">Acceptance of terms</h2>
            <p>
              By downloading, installing, or using CheckApp, you agree to these Terms of Service. If
              you do not agree, do not use the app.
            </p>

            <h2 id="medical-disclaimer">Medical disclaimer</h2>
            <p>
              <strong>CheckApp and DIDI are not medical devices.</strong> The app provides wellness
              guidance and habit support only. Tongue scan analysis, hydration estimates, and AI
              responses are for informational purposes and do not constitute medical advice, diagnosis,
              or treatment. Always consult a qualified healthcare professional for medical concerns.
            </p>

            <h2 id="acceptable-use">Acceptable use</h2>
            <p>
              You agree to use CheckApp for personal wellness purposes only. You may not misuse the
              app, attempt to reverse-engineer AI systems, or share content that violates others&apos;
              privacy.
            </p>

            <h2 id="subscriptions">Subscriptions</h2>
            <p>
              Paid plans (Base, Premium+) are billed through the Apple App Store. Subscriptions
              auto-renew unless cancelled at least 24 hours before the end of the current period.
              Refunds are handled according to Apple&apos;s refund policy.
            </p>

            <h2 id="intellectual-property">Intellectual property</h2>
            <p>
              CheckApp, DIDI, and all related content are owned by CheckApp. You retain ownership of
              content you submit (photos, videos, messages) but grant us a license to process it for
              providing the service.
            </p>

            <h2 id="limitation-of-liability">Limitation of liability</h2>
            <p>
              CheckApp is provided &ldquo;as is.&rdquo; We are not liable for any health outcomes
              resulting from use of the app. Our total liability is limited to the amount you paid
              for the service in the past 12 months.
            </p>

            <h2 id="contact">Contact</h2>
            <p>
              Questions about these terms: <a href="mailto:hello@checkapp.health">hello@checkapp.health</a>
            </p>
          </Prose>
        </div>
      </Section>
    </PageShell>
  );
}

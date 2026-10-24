import Link from 'next/link';
import { PageHero, PageShell, Prose, Section } from '@/components/ds';
import { JsonLd } from '@/components/layout/JsonLd';
import { createMetadata, breadcrumbSchema } from '@/lib/seo';

export const metadata = createMetadata({
  title: 'Privacy Policy — CheckApp',
  description:
    'CheckApp privacy policy: how we collect, use, and protect your health data, AI processing, and your rights.',
  path: '/privacy',
});

/*
 * Legal text: the wording below is the policy as published. Change structure and styling here, never the words;
 * a wording change is a legal decision. Each h2 has an id so a section can be linked (/privacy/#your-rights).
 */
export default function PrivacyPage() {
  return (
    <PageShell>
      <JsonLd
        data={breadcrumbSchema([
          { name: 'Home', path: '/' },
          { name: 'Privacy Policy', path: '/privacy' },
        ])}
      />

      <PageHero
        title="Privacy Policy"
        lede={
          <>
            Last updated: <time dateTime="2026-08-18">August 18, 2026</time>
          </>
        }
      />

      <Section size="prose" tight>
        {/* 68ch measure, counted in the text's own size (Prose sets 1.0625rem), so the wrapper takes the same font size. */}
        <div className="mx-auto max-w-[68ch] text-[1.0625rem]">
          <Prose>
            <h2 id="what-data-we-collect">What data we collect</h2>
            <p>
              When you use CheckApp, we may collect: account information (email, name), health check-in
              data (mood, symptoms, hydration logs), tongue scan photos, short video messages,
              device information, and usage analytics.
            </p>

            <h2 id="how-we-use-ai">How we use AI</h2>
            <p>
              DIDI uses a third-party AI provider (Anthropic / Claude, including Claude Vision) to
              analyze tongue photos, generate wellness guidance, and respond to your messages. Photos
              and message text are sent to Anthropic to produce a response. We do not use your data to
              train CheckApp models, and we do not have a confirmed zero-retention agreement with
              Anthropic. Treat this as third-party processing that may be logged under Anthropic&apos;s
              own retention terms.
            </p>

            <h2 id="data-storage-and-security">Data storage and security</h2>
            <p>
              Your account data is stored with Supabase. Tongue scan photos and video messages are
              stored in encrypted cloud storage. We retain CheckApp-held data as long as your account
              is active, or as required by law. Deleting your account removes the data we store.
            </p>

            <h2 id="your-rights">Your rights</h2>
            <p>
              You have the right to access, export, correct, or delete your personal data at any time.
              To delete your account without using the app, go to{' '}
              <Link href="/delete-account/">checkapp.today/delete-account</Link>{' '}or email{' '}
              <a href="mailto:hello@checkapp.today">hello@checkapp.today</a>. If you are in the EU/EEA,
              you have additional rights under GDPR including data portability and the right to lodge a
              complaint with a supervisory authority.
            </p>

            <h2 id="third-party-services">Third-party services</h2>
            <p>
              We use Supabase (database, auth, and file storage), Anthropic (AI processing of messages
              and scan photos), GitHub Pages (website hosting), and PostHog (analytics). Each service
              has its own privacy policy governing data they process on our behalf.
            </p>

            <h2 id="contact">Contact</h2>
            <p>
              For privacy questions: <a href="mailto:hello@checkapp.today">hello@checkapp.today</a>
            </p>
          </Prose>
        </div>
      </Section>
    </PageShell>
  );
}

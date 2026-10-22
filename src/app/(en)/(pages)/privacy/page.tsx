import { JsonLd } from '@/components/layout/JsonLd';
import { Section } from '@/components/ui/Section';
import { createMetadata, breadcrumbSchema } from '@/lib/seo';

export const metadata = createMetadata({
  title: 'Privacy Policy — CheckApp',
  description:
    'CheckApp privacy policy: how we collect, use, and protect your health data, AI processing, and your rights.',
  path: '/privacy',
});

export default function PrivacyPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbSchema([
          { name: 'Home', path: '/' },
          { name: 'Privacy Policy', path: '/privacy' },
        ])}
      />

      <Section variant="light" className="pt-24 md:pt-28">
        <h1 className="font-display text-4xl font-bold">Privacy Policy</h1>
        <p className="mt-2 text-text-secondary">Last updated: August 18, 2026</p>

        <div className="prose-checkapp mt-10 max-w-3xl">
          <h2>What data we collect</h2>
          <p>
            When you use CheckApp, we may collect: account information (email, name), health check-in
            data (mood, symptoms, hydration logs), tongue scan photos, short video messages,
            device information, and usage analytics.
          </p>

          <h2>How we use AI</h2>
          <p>
            DIDI uses a third-party AI provider (Anthropic / Claude, including Claude Vision) to
            analyze tongue photos, generate wellness guidance, and respond to your messages. Photos
            and message text are sent to Anthropic to produce a response. We do not use your data to
            train CheckApp models, and we do not have a confirmed zero-retention agreement with
            Anthropic. Treat this as third-party processing that may be logged under Anthropic&apos;s
            own retention terms.
          </p>

          <h2>Data storage and security</h2>
          <p>
            Your account data is stored with Supabase. Tongue scan photos and video messages are
            stored in encrypted cloud storage. We retain CheckApp-held data as long as your account
            is active, or as required by law. Deleting your account removes the data we store.
          </p>

          <h2>Your rights</h2>
          <p>
            You have the right to access, export, correct, or delete your personal data at any time.
            To delete your account without using the app, go to{' '}
            <a href="/delete-account/">checkapp.today/delete-account</a>
            {' '}or email hello@checkapp.today. If you are in the EU/EEA, you have additional rights
            under GDPR including data portability and the right to lodge a complaint with a
            supervisory authority.
          </p>

          <h2>Third-party services</h2>
          <p>
            We use Supabase (database, auth, and file storage), Anthropic (AI processing of messages
            and scan photos), GitHub Pages (website hosting), and PostHog (analytics). Each service
            has its own privacy policy governing data they process on our behalf.
          </p>

          <h2>Contact</h2>
          <p>
            For privacy questions: <a href="mailto:hello@checkapp.today">hello@checkapp.today</a>
          </p>
        </div>
      </Section>
    </>
  );
}

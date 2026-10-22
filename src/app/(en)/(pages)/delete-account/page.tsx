import { JsonLd } from '@/components/layout/JsonLd';
import { Section } from '@/components/ui/Section';
import { createMetadata, breadcrumbSchema } from '@/lib/seo';
import { DeleteAccountForm } from './DeleteAccountForm';

export const metadata = createMetadata({
  title: 'Delete your CheckApp account',
  description:
    'Request permanent deletion of your CheckApp account, profile, messages, scans, and stored photos.',
  path: '/delete-account',
});

export default function DeleteAccountPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbSchema([
          { name: 'Home', path: '/' },
          { name: 'Delete account', path: '/delete-account' },
        ])}
      />

      <Section variant="light" className="pt-24 md:pt-28">
        <div className="mx-auto max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-wide text-primary">Google Play</p>
          <h1 className="mt-3 font-display text-4xl font-bold md:text-5xl">Delete your account</h1>
          <p className="mt-4 text-lg text-text-secondary">
            Use this page to delete your CheckApp account without opening the app. Deletion is
            permanent and usually completes immediately after you confirm the email code.
          </p>
          <div className="mt-10">
            <DeleteAccountForm />
          </div>
        </div>
      </Section>
    </>
  );
}

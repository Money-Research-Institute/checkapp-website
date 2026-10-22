import { PageHero, PageShell, Section } from '@/components/ds';
import { DeleteAccountForm } from '@/components/forms/DeleteAccountForm';
import { JsonLd } from '@/components/layout/JsonLd';
import { breadcrumbSchema, createMetadata } from '@/lib/seo';
import styles from './delete-account.module.css';

export const metadata = createMetadata({
  title: 'Delete your CheckApp account',
  description:
    'Request permanent deletion of your CheckApp account, profile, messages, scans, and stored photos.',
  path: '/delete-account',
});

export default function DeleteAccountPage() {
  return (
    <PageShell>
      <JsonLd
        data={breadcrumbSchema([
          { name: 'Home', path: '/' },
          { name: 'Delete account', path: '/delete-account' },
        ])}
      />

      <PageHero
        eyebrow="Google Play"
        title="Delete your account"
        lede="Use this page to delete your CheckApp account without opening the app. Deletion is permanent and usually completes immediately after you confirm the email code."
      />

      <Section size="narrow" tight>
        {/* data-hides-cta-bar: nobody leaving the app wants a "Get checkapp" bar over the form they are filling in. */}
        <div className={styles.form} data-hides-cta-bar>
          <DeleteAccountForm />
        </div>
      </Section>
    </PageShell>
  );
}

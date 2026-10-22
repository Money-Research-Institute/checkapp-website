import Link from 'next/link';
import { GlassCard, PageHero, PageShell, Section } from '@/components/ds';
import { LeadForm } from '@/components/forms/LeadForm';
import { JsonLd } from '@/components/layout/JsonLd';
import { SOCIAL_LINKS } from '@/lib/constants';
import { breadcrumbSchema, createMetadata } from '@/lib/seo';
import styles from './contact.module.css';

export const metadata = createMetadata({
  title: 'Contact CheckApp',
  description:
    'Questions about CheckApp or DiDi, your AI wellness companion? Send us a message and we will reply by email.',
  path: '/contact',
});

export default function ContactPage() {
  return (
    <PageShell>
      <JsonLd
        data={breadcrumbSchema([
          { name: 'Home', path: '/' },
          { name: 'Contact', path: '/contact' },
        ])}
      />

      <PageHero
        eyebrow="Contact"
        title="Talk to the CheckApp team"
        lede="Questions, feedback, or partnership ideas? Leave your details and we will get back to you."
      />

      <Section size="narrow" tight>
        <div className={styles.grid}>
          <LeadForm source="checkapp.today/contact" />

          <GlassCard as="aside" aria-labelledby="contact-other" className={styles.aside}>
            <h2 id="contact-other" className={styles.asideTitle}>
              Other ways to reach us
            </h2>
            <ul className={styles.list}>
              <li>
                <a className={styles.row} href={SOCIAL_LINKS.contact}>
                  <span className={styles.rowLabel}>Email</span>
                  <span className={styles.rowValue}>hello@checkapp.today</span>
                </a>
              </li>
              <li>
                <Link className={styles.row} href="/delete-account/">
                  <span className={styles.rowLabel}>Want your data removed?</span>
                  <span className={styles.rowValue}>Delete your account</span>
                </Link>
              </li>
              <li>
                <Link className={styles.row} href="/privacy/">
                  <span className={styles.rowLabel}>How we handle your details</span>
                  <span className={styles.rowValue}>Privacy Policy</span>
                </Link>
              </li>
            </ul>
            <p className={styles.note}>
              CheckApp shares general wellness information only — not medical advice.
            </p>
          </GlassCard>
        </div>
      </Section>
    </PageShell>
  );
}

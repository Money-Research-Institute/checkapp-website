import { JsonLd } from '@/components/layout/JsonLd';
import { Section } from '@/components/ui/Section';
import { LeadForm } from '@/components/marketing/LeadForm';
import { createMetadata, breadcrumbSchema } from '@/lib/seo';
import { SOCIAL_LINKS } from '@/lib/constants';

export const metadata = createMetadata({
  title: 'Contact CheckApp',
  description:
    'Questions about CheckApp or DIDI, your AI wellness companion? Send us a message and we will reply by email.',
  path: '/contact',
});

export default function ContactPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbSchema([
          { name: 'Home', path: '/' },
          { name: 'Contact', path: '/contact' },
        ])}
      />

      <Section variant="light" className="pt-24 md:pt-28">
        <div className="mx-auto max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-wide text-primary">Contact</p>
          <h1 className="mt-3 font-display text-4xl font-bold md:text-5xl">Talk to the CheckApp team</h1>
          <p className="mt-4 text-lg text-text-secondary">
            Questions, feedback, or partnership ideas? Leave your details and we will get back to you.
            You can also email{' '}
            <a className="font-medium text-primary underline" href={SOCIAL_LINKS.contact}>
              hello@checkapp.today
            </a>
            . CheckApp shares general wellness information only — not medical advice.
          </p>
          <div className="mt-10">
            <LeadForm source="checkapp.today/contact" />
          </div>
        </div>
      </Section>
    </>
  );
}

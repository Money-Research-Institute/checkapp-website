/**
 * FAQ: the client's questions and answers in the ds `Faq` accordion (native <details name>, works without JS, open tracking built in).
 *
 * Words: one set per region (`faqEntries(region)` in src/content/copy; the price question appears only once the region has a price,
 * so the list is four rows today and five later). The same strings go to the FAQPage JSON-LD, so the structured data never says
 * more than the page. The h2 is the only string of our own (./copy.ts, en and ru). Row 002 is open in the static HTML.
 */
import { faqEntries, localeOf } from '@/content/copy';
import type { SectionProps } from '@/content/copy';
import { Faq } from '@/components/ds/Faq';
import { Section } from '@/components/ds/Section';
import { SectionIntro } from '@/components/ds/SectionIntro';
import { JsonLd } from '@/components/layout/JsonLd';
import { faqSchema } from '@/lib/seo';
import { FAQS_COPY } from './copy';
import s from './faqs.module.css';

const OPEN_BY_DEFAULT = 1;

export function FaqsSection({ region }: SectionProps) {
  const copy = FAQS_COPY[localeOf(region)];
  const entries = faqEntries(region);
  return (
    <Section id="faqs" size="narrow" labelledBy="faqs-heading">
      <JsonLd data={faqSchema(entries.map(({ question, answer }) => ({ question, answer })))} />
      <SectionIntro title={copy.heading} headingId="faqs-heading" className={s.intro} />
      <Faq
        items={entries}
        page={region === 'us' ? 'home' : `home-${region}`}
        defaultOpen={Math.min(OPEN_BY_DEFAULT, entries.length - 1)}
      />
    </Section>
  );
}

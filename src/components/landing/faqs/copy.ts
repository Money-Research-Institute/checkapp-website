/**
 * The words of the FAQ section that the client's document does not cover. The questions and answers themselves are the
 * client's (`faqEntries(region)` in src/content/copy: five entries, the price question only once the region has a price)
 * and are read in index.tsx; nobody retypes them here, and the same strings feed the FAQPage JSON-LD.
 *
 * What is left is the visible h2. Figma's "Frequently Asked Questions Section" lost its "Section" suffix (a design leftover,
 * docs/landing-decisions.md D1). Spelling: `checkapp` (lower case) and `DiDi`; neither is needed in this one line.
 *
 * Every Russian string is a DRAFT until the client approves it (docs/landing-copy.md). Russian addresses the reader as «ты»;
 * a heading names the topic and needs no pronoun.
 */
import type { Locale } from '@/content/copy';

export interface FaqsCopy {
  /** The visible h2 above the list (the section's accessible name). */
  heading: string;
}

export const FAQS_COPY: Record<Locale, FaqsCopy> = {
  en: {
    heading: 'Frequently asked questions',
  },
  ru: {
    // DRAFT
    heading: 'Частые вопросы',
  },
};

/**
 * Landing copy contract. The client's final wording (22.10.2026, docs/landing-copy.md) lives in
 * src/content/copy/{us,eu,gulf,ru}.ts, verbatim: change a word there only with the client's say-so.
 */

/** Which landing page: its URL, its language, and which of the client's wordings it carries. */
export type Region = 'us' | 'eu' | 'gulf' | 'ru';
export type Locale = 'en' | 'ru';

/** What every landing section component receives from the page that renders it. */
export type SectionProps = { region: Region };

export interface FaqEntry {
  question: string;
  answer: string;
  /** The answer quotes the price, so it is withheld until the region has one (see pricing.ts). */
  needsPrice?: boolean;
}

export interface RegionCopy {
  region: Region;
  locale: Locale;
  hero: { headline: string; subheadline: string; cta: string };
  /** Small print under the hero CTA. Carries {price} (and {currency} in the Gulf): withheld until pricing.ts has them. */
  subscription: string;
  meetDidi: {
    /** The client's text, verbatim. */
    text: string;
    /**
     * The same paragraph without the sentence that expands the name to "Digital Diagnostic". Only the US text has that
     * sentence. It is held back (SHOW_NAME_ORIGIN in index.ts) until the client confirms, because "diagnostic" is the
     * word a store reviewer or regulator reads as a medical-device claim.
     */
    withoutNameOrigin?: string;
  };
  /** "What it does now": the capabilities the app really has today. Do not claim anything beyond this. */
  whatItDoes: string;
  howItWorks: readonly [string, string, string];
  dataConsent: string;
  fourP: string;
  finalCta: string;
  /** Two short taglines written for ads; usable as sub-lines and in metadata. */
  adLines: readonly [string, string];
  faq: readonly FaqEntry[];
  /** Mark the element that renders it with data-disclaimer. */
  disclaimer: string;
}

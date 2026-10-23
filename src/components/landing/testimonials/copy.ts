/**
 * The strings of the testimonials wall that the client's document does not cover (docs/landing.md): the section header.
 * They are the Figma wording (node 2601:13023) and say nothing about what the app does, so they need no D1 replacement.
 * The six cards themselves are data, in src/content/testimonials.ts.
 *
 * English only, on purpose: `/ru/` renders no testimonials section at all (docs/landing.md H4: the six quotes are
 * English placeholders, and translating them would invent more), so a Russian header would be a string no region uses.
 * When real, consented Russian quotes exist, add the `ru` entry here (marked DRAFT) and lift the region check in LandingPage.tsx.
 */
export const copy = {
  en: {
    eyebrow: 'Testimonials',
    title: 'For people who bounce off health apps',
    lede: 'It turns out a little warmth goes a long way. These are the signals people come back for.',
  },
} as const;

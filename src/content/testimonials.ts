/**
 * Testimonials wall content (docs/landing-decisions.md D2).
 *
 * The project owner decided to ship the six cards exactly as designed in Figma. They are PLACEHOLDERS: the names, roles and
 * quotes look invented and the avatars are stock photos of real people. Every entry is therefore flagged `placeholder: true`,
 * and the wall renders each one as <figure data-verified="false">, which the QA gate reports as the `unverified-testimonial`
 * warning on every run. Nothing here is silenced or hidden on purpose.
 *
 * The wording is Figma's, with one normalisation: the mascot is written "DiDi" (Figma has "DIDI"), the site-wide spelling
 * (docs/landing-copy.md). The wall renders nothing on /ru/ (docs/landing-copy.md H4).
 *
 * To replace one with a real, consented testimonial: overwrite the entry, set `placeholder: false` (the figure then carries
 * data-verified="true"), and drop `needsReplacement`. Do not add Review / AggregateRating JSON-LD for these.
 *
 * Order matters: it is the Figma card order, column by column. The wall takes them two per column, so cards 1-2 are the left
 * column, 3-4 the centre and 5-6 the right (Alex, Emily | Sofia, Ryan | Daniel, Liam).
 */
export type Testimonial = {
  id: string;
  name: string;
  role: string;
  /** The quote WITHOUT its surrounding quotation marks: the wall adds the curly quotes when it renders. */
  quote: string;
  /** ISO 8601 date for <time datetime>. */
  isoDate: string;
  /** The date as shown on the card. */
  date: string;
  /** Public path without the width or extension: `<avatar>-84.webp` (2x) and `<avatar>-126.webp` (3x) exist for a 42px circle. */
  avatar: string;
  /** True while the entry is a design placeholder rather than a real, consented testimonial. */
  placeholder: boolean;
  /** The quote is leftover text from a previous (crypto dashboard) template and must be replaced before launch. */
  needsReplacement?: boolean;
};

const AVATAR = '/landing/testimonials/avatar';

export const testimonials: readonly Testimonial[] = [
  {
    id: 'alex-morgan',
    name: 'Alex Morgan',
    role: 'early DiDi member',
    quote:
      'Most health apps make me feel like I have homework. DiDi feels different. It asks the right question at the right time, without overwhelming me.',
    isoDate: '2026-01-08',
    date: 'Jan 8, 2026',
    avatar: `${AVATAR}-alex`,
    placeholder: true,
  },
  {
    id: 'emily-stone',
    name: 'Emily Stone',
    role: 'Web3 Enthusiast',
    quote:
      'I tried the tongue scan out of curiosity. What I liked most was getting a simple, understandable next step instead of another confusing report.',
    isoDate: '2026-01-22',
    date: 'Jan 22, 2026',
    avatar: `${AVATAR}-emily`,
    placeholder: true,
  },
  {
    id: 'sofia-carter',
    name: 'Sofia Carter',
    role: 'Product Designer',
    quote:
      "I love how the conversations change based on my previous check-ins. It doesn't feel like answering the same five questions every morning.",
    isoDate: '2026-01-12',
    date: 'Jan 12, 2026',
    avatar: `${AVATAR}-sofia`,
    placeholder: true,
  },
  {
    id: 'ryan-walker',
    name: 'Ryan Walker',
    role: 'Startup Founder',
    quote:
      'I never expected to talk to a wellness app, but DiDi makes it surprisingly easy. Sometimes I just need a quick conversation, not more data.',
    isoDate: '2026-01-27',
    date: 'Jan 27, 2026',
    avatar: `${AVATAR}-ryan`,
    placeholder: true,
  },
  {
    id: 'daniel-ross',
    name: 'Daniel Ross',
    role: 'Blockchain Analyst',
    // Leftover crypto-dashboard template text, kept as designed (D2) and flagged. First card to drop on a small screen.
    quote:
      'The dashboard feels fast reliable and well designed making everyday crypto management easier safer and more enjoyable for all types of users around the world today with confidence always on.',
    isoDate: '2026-01-18',
    date: 'Jan 18, 2026',
    avatar: `${AVATAR}-daniel`,
    placeholder: true,
    needsReplacement: true,
  },
  {
    id: 'liam-turner',
    name: 'Liam Turner',
    role: 'UI/UX Designer',
    quote:
      'Between classes, I barely remember to drink water. The gentle reminders help me pay attention without making me feel guilty.',
    isoDate: '2026-02-02',
    date: 'Feb 2, 2026',
    avatar: `${AVATAR}-liam`,
    placeholder: true,
  },
];

/**
 * Testimonials content (docs/landing.md D2).
 *
 * These are PLACEHOLDERS: the names, roles and quotes look invented and the avatars of the first six are stock photos of real
 * people. Every entry is therefore flagged `placeholder: true`, and the wall renders each one as <figure data-verified="false">.
 * Nothing here is silenced or hidden on purpose. The wall renders nothing on /ru/ (docs/landing.md H4).
 *
 * The wording of the first six is Figma's, with one normalisation: the mascot is written "DiDi" (Figma has "DIDI"), the site-wide
 * spelling. Entries 7 and on are NOT from the design: they were WRITTEN, the people do not exist, their avatars are initials, and
 * they say only what the app does today. They must all be replaced by real, consented testimonials before launch: a made-up
 * endorsement shown as real is a deceptive practice under consumer-protection law (the US FTC fake-review rule, the EU
 * unfair-commercial-practices directive).
 *
 * The wall (src/components/landing/testimonials) shows the first six entries that are not flagged `needsReplacement`.
 * `needsReplacement` entries are a known liability (leftover crypto-dashboard text, or a claim the page may not make: the claims
 * scan exempts testimonials, so this flag is what keeps them off the page). A real quote that replaces one: overwrite the entry,
 * set `placeholder: false`, and drop `needsReplacement` and `replaceReason`. Do not add Review / AggregateRating JSON-LD for these.
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
  /**
   * The quote cannot stand on a launch page and must be replaced by a real, consented one: it is leftover text from a previous
   * (crypto dashboard) template, or it promises something the page may not (docs/landing.md, "What the app can honestly
   * claim"). The wall does not show it (see the header comment); the wording itself is left exactly as designed (D2).
   */
  needsReplacement?: boolean;
  /** Why `needsReplacement` is set: for whoever sources the real quote. Not rendered. */
  replaceReason?: string;
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
    // The role is leftover from the crypto template too (the quote is on topic), so the entry is not flagged: a real role comes
    // with the real consent when this card is sourced.
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
    // The app does not compare with earlier check-ins today, and the page must not promise it (docs/landing.md). The claims
    // scan exempts testimonials, so this flag is what keeps the claim off the page.
    needsReplacement: true,
    replaceReason: 'Claims the conversation changes with previous check-ins, which the app does not do.',
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
    // Leftover crypto-dashboard template text, kept as designed (D2) and flagged.
    quote:
      'The dashboard feels fast reliable and well designed making everyday crypto management easier safer and more enjoyable for all types of users around the world today with confidence always on.',
    isoDate: '2026-01-18',
    date: 'Jan 18, 2026',
    avatar: `${AVATAR}-daniel`,
    placeholder: true,
    needsReplacement: true,
    replaceReason: 'Leftover crypto-dashboard template text; nothing to do with a wellness app.',
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
  {
    id: 'priya-nair',
    name: 'Priya Nair',
    role: 'Product Manager',
    quote: 'It takes ten seconds. I take the photo with my coffee, DiDi tells me what it noticed, and that is the whole routine.',
    isoDate: '2026-01-14',
    date: 'Jan 14, 2026',
    avatar: `${AVATAR}-priya`,
    placeholder: true,
  },
  {
    id: 'marcus-bell',
    name: 'Marcus Bell',
    role: 'High-school teacher',
    quote: 'I like that it never pushes. I scan when I feel like it, and nothing nags me for the rest of the day.',
    isoDate: '2026-01-16',
    date: 'Jan 16, 2026',
    avatar: `${AVATAR}-marcus`,
    placeholder: true,
  },
  {
    id: 'hannah-fischer',
    name: 'Hannah Fischer',
    role: 'Graphic designer',
    quote: 'I asked myself if it was spying on me. It is not: nothing happens until I take a photo, and I can delete my data whenever I want.',
    isoDate: '2026-01-19',
    date: 'Jan 19, 2026',
    avatar: `${AVATAR}-hannah`,
    placeholder: true,
  },
  {
    id: 'omar-haddad',
    name: 'Omar Haddad',
    role: 'Logistics coordinator',
    quote: 'The small nudges are the best part. Drink some water, stretch a bit. Small enough that I actually do them.',
    isoDate: '2026-01-21',
    date: 'Jan 21, 2026',
    avatar: `${AVATAR}-omar`,
    placeholder: true,
  },
  {
    id: 'chloe-dubois',
    name: 'Chloe Dubois',
    role: 'Graduate student',
    quote: 'Streaks in other apps made me feel guilty after a missed day. DiDi is kind about it, so I come back the next morning.',
    isoDate: '2026-01-24',
    date: 'Jan 24, 2026',
    avatar: `${AVATAR}-chloe`,
    placeholder: true,
  },
  {
    id: 'yuki-tanaka',
    name: 'Yuki Tanaka',
    role: 'Freelance photographer',
    quote: 'The photo scan feels almost playful. I did not expect to enjoy a health app, but here I am, opening it every day.',
    isoDate: '2026-01-29',
    date: 'Jan 29, 2026',
    avatar: `${AVATAR}-yuki`,
    placeholder: true,
  },
  {
    id: 'lucas-almeida',
    name: 'Lucas Almeida',
    role: 'Remote developer',
    quote: 'No dashboards, no charts to decode. Just a short note in plain words. That is why I keep opening it.',
    isoDate: '2026-02-04',
    date: 'Feb 4, 2026',
    avatar: `${AVATAR}-lucas`,
    placeholder: true,
  },
];

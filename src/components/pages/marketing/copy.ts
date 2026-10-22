/**
 * The words of /how-it-works, /features and /about.
 *
 * Two sources, kept apart on purpose (docs/landing-copy.md, docs/landing-decisions.md):
 *
 *  1. `CLIENT` is the client's final wording (src/content/copy/us.ts, verbatim). The inner pages are English-only, so they read the
 *     US text. Nobody retypes a client string here; the page reads it from the region copy.
 *  2. Everything else is OUR DRAFT, marked `// DRAFT` and listed for the client to approve. A draft says only what the client's own
 *     text says: photo scans of the tongue, face and iris, only when the person asks for them, a short wellness insight back, nothing
 *     in the background, a permission first for biometric photos, deletion on request, never a diagnosis.
 *
 * What these pages must NOT claim (the rule behind the gate's `unsupported-capability` check, docs/landing-copy.md): a weekly
 * report, a 90-day history, comparison with earlier check-ins, trends or "over time", continuous or real-time monitoring, video
 * analysis, reminders that run by themselves. D5's "weekly report / 90-day history" cards are withdrawn for the same reason; the
 * two spots that showed paid plans show the three scans instead. Spelling: `checkapp` (lower case) and `DiDi`.
 */
import { faqEntries, getRegionCopy, meetDidiText } from '@/content/copy';

const us = getRegionCopy('us');

/** The client's wording, as the US landing page renders it. */
export const CLIENT = {
  /** "Get checkapp" */
  cta: us.hero.cta,
  /** The hero sub-headline: the best one-paragraph explanation of the product. */
  subheadline: us.hero.subheadline,
  /** "Meet DiDi, your digital health companion. It shares gentle wellness insights from the photos you choose to take." */
  meetDidi: meetDidiText('us'),
  /** What the app does now: the honest list. */
  whatItDoes: us.whatItDoes,
  /** The three steps, as sentences. */
  steps: us.howItWorks,
  dataConsent: us.dataConsent,
  fourP: us.fourP,
  finalCta: us.finalCta,
  /** "A health checkup, every day." / "Your health deserves attention. Every day." */
  adLines: us.adLines,
  /** The questions the page may show (the price question stays out until the client gives a price). */
  faq: faqEntries('us'),
  /** Goes in an element marked `data-disclaimer`. */
  disclaimer: us.disclaimer,
} as const;

export const PAGES = {
  howItWorks: {
    // DRAFT
    title: 'How checkapp works: a daily check-in with DiDi',
    // DRAFT
    description:
      'Take a photo of your tongue, face or iris and DiDi shares a short wellness insight. Only when you ask, nothing runs in the background. Not a medical device.',
    hero: {
      // DRAFT
      eyebrow: 'How it works',
      // DRAFT
      title: 'A daily check-in in three small steps.',
      // DRAFT
      secondary: 'See what checkapp does',
    },
    meet: {
      // DRAFT
      eyebrow: 'Meet DiDi',
      // DRAFT
      title: 'Your digital health companion',
      // DRAFT
      points: [
        'You choose when to start a scan',
        'Nothing runs in the background',
        'A streak card on the home screen counts your days in a row',
      ],
    },
    steps: {
      // DRAFT
      eyebrow: 'Three steps',
      // DRAFT
      title: 'Photo, insight, nudge. Then back tomorrow.',
      // DRAFT: the sentences under each title are the client's `howItWorks`
      titles: ['Take a photo', 'Read the insight', 'Use it as a nudge'],
    },
    scans: {
      // DRAFT
      eyebrow: 'What you can scan',
      // DRAFT
      title: 'Tongue, face or iris',
      // DRAFT
      lede: 'Pick one, take a photo, and DiDi takes it from there.',
    },
    data: {
      // DRAFT
      eyebrow: 'Your data',
      // DRAFT
      title: 'Your photos, your call',
      // DRAFT: three short restatements of the client's data and consent sentences
      points: [
        'Photos are processed in the cloud only with your permission',
        'Face and iris photos are biometric, so checkapp asks first',
        'You can delete your data anytime',
      ],
      // DRAFT
      privacy: 'Read the privacy policy',
    },
  },

  features: {
    // DRAFT
    title: 'checkapp features: photo scans of your tongue, face and iris',
    // DRAFT
    description:
      'Photo scans of your tongue, face and iris, only when you ask for them, and a short wellness insight from DiDi. Nothing runs in the background. Not a medical device.',
    hero: {
      // DRAFT
      eyebrow: 'Features',
      // DRAFT
      title: 'What checkapp does.',
      // DRAFT
      secondary: 'See how it works',
    },
    // DRAFT: the answer-first summary, built from the client's "what it does now"
    answer:
      'Take a photo of your tongue, face or iris and DiDi, your digital health companion, shares a short wellness insight in plain language. You choose when. Nothing runs in the background.',
    scans: {
      // DRAFT
      eyebrow: 'Scans',
      // DRAFT
      title: 'Three ways to check in',
      // DRAFT
      lede: 'Tongue, face or iris. One photo is all it takes.',
    },
    inside: {
      // DRAFT
      eyebrow: 'What is inside',
      // DRAFT
      title: 'Small enough to do every day',
      // DRAFT
      lede: 'A health check, every day, without an appointment.',
      daily: {
        // DRAFT
        title: 'A check-in every day',
        // DRAFT
        text: 'Check in on your health every day, not once a year. Open checkapp, say hello to DiDi and start a scan when you want one.',
        // DRAFT
        points: ['Start a scan whenever you like', 'A streak card on the home screen counts your days in a row'],
      },
      insight: {
        // DRAFT
        title: 'A short wellness insight',
        // DRAFT
        text: 'DiDi reads the photo you share and answers in plain language, in the same chat, with one small step for today.',
        // DRAFT
        points: ['Visible signals explained in plain words', 'One small next step, not a long report'],
      },
    },
    terms: {
      // DRAFT
      eyebrow: 'On your terms',
      // DRAFT
      title: 'You are in charge',
      // DRAFT
      lede: 'checkapp does what you ask, and nothing else.',
    },
    compare: {
      // DRAFT
      eyebrow: 'Compare',
      // DRAFT
      title: 'A checkup and a check-in',
      // DRAFT
      lede: 'checkapp does not replace seeing a doctor. It is the small thing you can do in between.',
    },
    faq: {
      // DRAFT
      eyebrow: 'FAQ',
      // D1: the Figma leftover "Section" is dropped
      title: 'Frequently asked questions',
    },
  },

  about: {
    // DRAFT
    title: 'About checkapp: why we built DiDi',
    // DRAFT
    description:
      'Why checkapp exists: a health check you do with a photo, not an appointment, and DiDi, the digital health companion that shares a short wellness insight. Not a medical device.',
    hero: {
      // DRAFT
      eyebrow: 'About checkapp',
      // the client's ad line: "Your health deserves attention. Every day."
      title: CLIENT.adLines[1],
      // DRAFT
      lede: 'checkapp turns a health check into a daily ritual: a quick photo, a short wellness read from DiDi, and it is always your choice.',
    },
    story: {
      // DRAFT
      eyebrow: 'Our idea',
      // DRAFT
      title: 'A checkup, but every day',
      // DRAFT
      paragraphs: [
        'A health checkup usually happens once a year, if it happens at all. In between, there is no simple moment to stop and ask how you are doing.',
        'checkapp is built to be that moment. Take a quick photo of your tongue, face or iris, and DiDi, your digital health companion, shares a short wellness read in plain language.',
        'It stays small on purpose. Nothing runs in the background, and you decide what to share and when.',
      ],
    },
    values: {
      // DRAFT
      eyebrow: 'Our values',
      // DRAFT
      title: 'What we care about',
    },
    limits: {
      // DRAFT
      eyebrow: 'Clear limits',
      // DRAFT
      title: 'What DiDi does and does not do',
      // DRAFT
      lede: 'DiDi is here to make a daily check-in easy, and we want to be plain about where it stops.',
    },
    cta: {
      // the client's ad line: "A health checkup, every day."
      headline: CLIENT.adLines[0],
      // DRAFT
      subheadline: 'One quick photo. One short wellness read from DiDi.',
    },
  },

  closing: {
    // the client's ad lines
    headline: CLIENT.adLines[0],
    subheadline: CLIENT.adLines[1],
  },
} as const;

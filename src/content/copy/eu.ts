import type { RegionCopy } from './types';

export const eu: RegionCopy = {
  region: 'eu',
  locale: 'en',
  hero: {
    headline: "A daily health check-in, instead of a once-a-year checkup.",
    subheadline:
      "checkapp makes health checks a daily routine. Take a quick photo of your tongue, face or iris — DiDi, your digital health companion, turns it into a short wellness insight. You decide what to share, and when.",
    cta: "Get checkapp",
  },
  subscription:
    "{price}/month incl. VAT. Subscription renews until you cancel in your store settings. Manage or cancel anytime in App Store or Google Play.",
  meetDidi: {
    text: "Meet DiDi, your digital health companion. DiDi shares wellness insights based on the photos you take — it does not diagnose and does not replace a doctor.",
  },
  whatItDoes: "Photo scans of your tongue, face and iris — only when you choose to take them. No background scanning.",
  howItWorks: [
    "Take a photo of your tongue, face or iris.",
    "DiDi reads it — with your consent — and shares a short wellness insight.",
    "Take the insight into your day. Come back when you want another check-in.",
  ],
  dataConsent:
    "Photos, including face and iris images, are processed in the cloud only with your explicit consent. You can withdraw consent and delete your data at any time.",
  fourP:
    "Built on 4P medicine: personalized, preventive, participatory and predictive. For us that means insights and nudges — never diagnoses or predictions of disease.",
  finalCta: "Your health is in your hands — with DiDi in them. Get checkapp.",
  adLines: ["A health check-in, every day.", "Your health deserves attention. Every day."],
  faq: [
    {
      question: "Is this a medical device?",
      answer: "No. checkapp provides wellness information and is not a medical device.",
    },
    {
      question: "Does DiDi diagnose?",
      answer: "No. DiDi shares wellness insights from your photos. It does not diagnose and does not replace a doctor.",
    },
    {
      question: "Does it run in the background?",
      answer: "No. checkapp only scans when you take a photo. Nothing runs in the background.",
    },
    {
      question: "Where is my data processed?",
      answer:
        "In the cloud, and only with your explicit consent. Face and iris photos are biometric. You can withdraw consent and delete your data at any time.",
    },
    {
      question: "How much does it cost?",
      answer: "{price}/month incl. VAT. Cancel anytime in your store settings.",
      needsPrice: true,
    },
  ],
  disclaimer:
    "checkapp provides general wellness information. It is not a medical device, does not provide medical advice, and does not replace a consultation with a healthcare professional.",
};

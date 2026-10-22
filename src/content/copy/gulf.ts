import type { RegionCopy } from './types';

export const gulf: RegionCopy = {
  region: 'gulf',
  locale: 'en',
  hero: {
    headline: "Make your health a daily habit — not a yearly appointment.",
    subheadline:
      "checkapp brings a simple daily health ritual to your phone. A quick photo of your tongue, face or iris — and DiDi gives you a private wellness insight. No noise, no dashboard overload.",
    cta: "Get checkapp",
  },
  subscription: "{price}/month ({currency}). Cancel anytime in your store settings.",
  meetDidi: {
    text: "Meet DiDi, your digital health companion. DiDi helps you pay attention to yourself through photos you choose to take. It does not diagnose.",
  },
  whatItDoes: "Photo scans of your tongue, face and iris — whenever you choose. No background scanning.",
  howItWorks: [
    "Take a photo of your tongue, face or iris.",
    "DiDi reads the photo and shares a short wellness insight.",
    "Keep the habit going — another check-in tomorrow, if you want.",
  ],
  dataConsent:
    "Photos are processed in the cloud only with your consent. Face and iris images need clear permission. You can delete your data at any time.",
  fourP:
    "Inspired by 4P medicine: personalized, preventive, participatory and predictive — turned into simple daily insights, never diagnoses.",
  finalCta: "Your health is in your hands — with DiDi in them. Get checkapp.",
  adLines: ["Invest in your health, every day.", "Your health deserves attention. Every day."],
  faq: [
    {
      question: "Is this a medical device?",
      answer: "No. checkapp provides general wellness information and is not a medical device.",
    },
    {
      question: "Does DiDi diagnose?",
      answer: "No. DiDi does not diagnose and does not replace a licensed doctor.",
    },
    {
      question: "Does it run in the background?",
      answer: "No. checkapp only scans when you take a photo. Nothing runs in the background.",
    },
    {
      question: "Where is my data processed?",
      answer: "In the cloud, and only with your consent. You can delete your data anytime.",
    },
    {
      question: "How much does it cost?",
      answer: "{price}/month ({currency}). Cancel anytime in your store settings.",
      needsPrice: true,
    },
  ],
  disclaimer:
    "checkapp provides general wellness information. It is not a medical device and does not replace a consultation with a licensed doctor. In an emergency, call your local emergency number.",
};

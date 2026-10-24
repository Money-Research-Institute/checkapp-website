import type { RegionCopy } from './types';

export const us: RegionCopy = {
  region: 'us',
  locale: 'en',
  hero: {
    headline: "Check in on your health every day — not once a year.",
    subheadline:
      "checkapp turns a health check into a daily ritual. Snap a quick photo of your tongue, face or iris — DiDi, your digital health companion, gives you a short wellness read. On your terms, when you choose.",
    cta: "Get checkapp",
  },
  subscription:
    "{price}/month. Auto-renews until you cancel. Cancel anytime in App Store or Google Play settings. Payment charged to your store account.",
  meetDidi: {
    text: "Meet DiDi, your digital health companion. The name comes from “Digital Diagnostic” — but DiDi never diagnoses. It shares gentle wellness insights from the photos you choose to take.",
    withoutNameOrigin:
      "Meet DiDi, your digital health companion. It shares gentle wellness insights from the photos you choose to take.",
  },
  whatItDoes: "Photo scans of your tongue, face and iris — only when you ask for them. Nothing runs in the background.",
  howItWorks: [
    "Take a photo of your tongue, face or iris.",
    "DiDi reads the photo and shares a short wellness insight.",
    "Use that insight as a nudge for your day — then come back tomorrow.",
  ],
  dataConsent:
    "Your photos are processed in the cloud only with your permission. Face and iris images are biometric data, so we ask first. You can delete your data anytime.",
  fourP:
    "Built on 4P medicine: personalized, preventive, participatory and predictive. For us that means daily attention and gentle nudges — never diagnoses or disease predictions.",
  finalCta: "Your health is in your hands — with DiDi in them. Get checkapp.",
  adLines: ["A health checkup, every day.", "Your health deserves attention. Every day."],
  faq: [
    {
      question: "Is this a medical device?",
      answer: "No. checkapp is for general wellness only and is not a medical device.",
    },
    {
      question: "Does DiDi diagnose?",
      answer: "No. DiDi shares wellness insights from your photos. It does not diagnose. For medical questions, talk to a doctor.",
    },
    {
      question: "Does it run in the background?",
      answer: "No. checkapp only scans when you take a photo. Nothing runs in the background.",
    },
    {
      question: "Where is my data processed?",
      answer: "In the cloud, and only with your permission. Face and iris photos are biometric. You can delete your data anytime.",
    },
    {
      question: "How much does it cost?",
      answer: "{price}/month. Auto-renews until canceled. Cancel anytime in your store settings.",
      needsPrice: true,
    },
  ],
  disclaimer:
    "checkapp is for general wellness only. It is not a medical device and is not intended to diagnose, treat, cure or prevent any disease. Not for emergencies. Always talk to a qualified clinician for medical concerns.",
};

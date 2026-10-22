/**
 * Final CTA card: the strings the client's document does not cover.
 *
 * The client's own wording is rendered by index.tsx straight from src/content/copy and is not repeated here:
 *   - the headline is `finalCta` ("FINAL CALL"),
 *   - the sub-line is `adLines[1]` ("AD LINES"),
 *   - the note beside the button is `dataConsent` ("DATA AND CONSENT"),
 *   - the button label is the hero's `hero.cta` (the same download call, in the region's own words).
 *
 * What is left is the alt text of the phone. Docs/landing-decisions.md D5 replaced Figma's paywall screen ("Upgrade Your CheckApp,
 * Free | Pro | Premium+") and docs/landing-copy.md narrowed it to the three scans, so the phone shows the app's home screen with
 * a Tongue / Face / Iris button each: the same three photo scans "what it does now" lists. It says nothing about plans, prices,
 * history or reports. The labels baked into that picture (greeting, "Talk?", the three buttons, "Start a scan") exist in an
 * English and a Russian render (public/landing/final-cta/phone-en|ru-*), so /ru/ shows Russian image text as well.
 *
 * The Russian string is a DRAFT for the client to approve. It addresses the reader as «ты» where it speaks to the reader at all
 * (this one only describes the picture).
 */
import type { Locale } from '@/content/copy';

export interface FinalCtaCopy {
  /** Describes the screen the phone shows, never what a caption promises. */
  phoneAlt: string;
}

export const finalCtaCopy: Record<Locale, FinalCtaCopy> = {
  en: {
    phoneAlt:
      'The checkapp home screen on a green iPhone: a greeting for Mah, three scan buttons (Tongue, Face and Iris) and DiDi, the mascot, waving below them.',
  },
  ru: {
    // DRAFT
    phoneAlt:
      'Главный экран checkapp на зелёном iPhone: приветствие для Mah, три кнопки скана (язык, лицо и радужка) и машущий рукой DiDi под ними.',
  },
};

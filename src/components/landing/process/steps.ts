/**
 * The art of the three steps of "How it works". No words live here: the step sentences are the client's
 * (src/content/copy, `howItWorks`, one per region, read by index.tsx) and the alt text and the heading are in ./copy.ts.
 *
 * Art (public/landing/process, written by scripts/assets/encode.mjs from the Figma exports):
 *   phone-<n>-<w>.avif/.webp   the three opaque phone mock-ups on black, with the neon rim and the perspective baked in.
 *                              Phone 2 is stored UN-flipped (D6): its UI text reads correctly.
 *   phone-<n>-ru-<w>.avif/.webp the same three, with the Russian app screens (the /ru/ page).
 *
 *   numeral-<n>-<w>.avif/.webp the big grey-green numerals (alpha, 2x of their design size). Decorative.
 *   arrow-<n>.svg              the two hand-drawn dashed loops, 1 to 2 and 2 to 3.
 *
 * Baked screens: the UI text inside the phones is pixels, so neither the gate's banned-claim scan nor its Cyrillic share
 * can see it. The frames (rim, glow, perspective) come from the Figma mock-ups; the SCREENS are the scrubbed flat renders
 * of the Meet DiDi section (public/landing/familiar, en and ru), warped onto each frame's screen quad (fitted from the
 * frame's own screen mask, so the rim and the glow are untouched). One wording on the whole page. Whoever swaps a screen
 * re-reads every phone at full size: photo not video, "Looks stable" not a verdict, no 2024 date, "DiDi" not "DIDI".
 */
import type { Locale } from '@/content/copy';

export interface ProcessStep {
  n: 1 | 2 | 3;
  phone: {
    base: string;
    /** Encoded widths (the largest is the intrinsic size). */
    widths: number[];
    width: number;
    height: number;
    /** The `sizes` hint for the three layouts: artboard, compact rows, single column. */
    sizes: string;
  };
  numeral: { base: string; width: number; height: number };
}

/** The art base of a phone for a locale: the English screens, or the Russian ones (`-ru`) on /ru/. */
export const phoneBase = (phone: ProcessStep['phone'], locale: Locale) => (locale === 'ru' ? `${phone.base}-ru` : phone.base);

export const PROCESS_STEPS: readonly ProcessStep[] = [
  {
    n: 1,
    phone: {
      base: '/landing/process/phone-1',
      widths: [640, 1024],
      width: 1024,
      height: 1536,
      // The phone frame is cropped to the middle 80 % of the art below 1000px, so the image is 1.25x its frame there.
      sizes: '(min-width: 1000px) min(43.3vw, 623px), (min-width: 600px) min(48vw, 412px), min(93vw, 375px)',
    },
    numeral: { base: '/landing/process/numeral-1', width: 123, height: 284 },
  },
  {
    n: 2,
    phone: {
      base: '/landing/process/phone-2',
      widths: [430, 860],
      width: 860,
      height: 1829,
      sizes: '(min-width: 1000px) min(31.3vw, 450px), (min-width: 600px) min(38vw, 330px), min(74vw, 300px)',
    },
    numeral: { base: '/landing/process/numeral-2', width: 216, height: 291 },
  },
  {
    n: 3,
    phone: {
      base: '/landing/process/phone-3',
      widths: [640, 1024],
      width: 1024,
      height: 1536,
      sizes: '(min-width: 1000px) min(41.4vw, 596px), (min-width: 600px) min(48vw, 412px), min(93vw, 375px)',
    },
    numeral: { base: '/landing/process/numeral-3', width: 225, height: 297 },
  },
];

/**
 * The two hand-drawn dashed loops: 1 to 2 and 2 to 3. width/height are the Figma boxes at 1440; the SVGs stretch to the box
 * (preserveAspectRatio none) exactly as in the design. Figma flips arrow 1 horizontally and its raw export is NOT in display
 * orientation, so the flip is baked into public/landing/process/arrow-1.svg (a matrix on its group): there is no CSS flip,
 * which would also have flipped the curtain that uncovers it.
 */
export const PROCESS_ARROWS = {
  1: { src: '/landing/process/arrow-1.svg', width: 277, height: 230 },
  2: { src: '/landing/process/arrow-2.svg', width: 307, height: 168 },
} as const;

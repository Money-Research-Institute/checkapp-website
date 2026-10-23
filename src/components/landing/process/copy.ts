/**
 * The words of "How it works" that the client's document does not cover. The three step sentences themselves are the
 * client's (src/content/copy, `howItWorks`) and are read in index.tsx; nobody retypes them here.
 *
 * What is left is the sr-only heading and the alt text of the three phone mock-ups. They describe the screens and say only
 * what the app does today (photo scans of the tongue, face and iris; docs/landing-copy.md): no "video", no history, no
 * trends. Spelling: `checkapp` (lower case) and `DiDi`.
 *
 * Every Russian string is a DRAFT until the client approves it (docs/landing-copy.md).
 *
 * The screens inside the phones are baked into the raster art, which the gate cannot read, so they are checked by eye
 * (see steps.ts, "Baked screens"). Each one says what the app does today, in the same words as the Meet DiDi phones: a
 * photo request and a photo bubble (no video), "Looks stable" (no verdict on the body), "Today" (no stale date), "DiDi".
 * The Russian page gets its own Russian art (phone-<n>-ru-*), so /ru/ has no English UI text in the images either.
 */
import type { Locale } from '@/content/copy';

export interface ProcessCopy {
  /** The sr-only h2 (the Figma frame has no visible heading). */
  heading: string;
  /** Alt text of phone 1, 2 and 3. */
  phones: readonly [string, string, string];
}

export const PROCESS_COPY: Record<Locale, ProcessCopy> = {
  en: {
    heading: 'How checkapp works',
    phones: [
      'checkapp home screen with DiDi, a Start Tongue Scan button and a streak card',
      'checkapp chat where DiDi asks for a quick photo and says what it noticed',
      'checkapp scan details with tongue color, coating and moisture readings',
    ],
  },
  ru: {
    // DRAFT
    heading: 'Как работает checkapp',
    phones: [
      // DRAFT
      'Главный экран checkapp: DiDi, кнопка скана языка и карточка с серией дней',
      // DRAFT
      'Чат в checkapp: DiDi просит быстрое фото и рассказывает, что заметил',
      // DRAFT
      'Результаты скана в checkapp: цвет языка, налёт и влажность',
    ],
  },
};

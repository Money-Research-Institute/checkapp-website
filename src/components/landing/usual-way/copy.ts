/**
 * Strings of the "usual way" section. The client's final copy (docs/landing-copy.md) does not cover this section, so the
 * words are ours and the client approves them later. Every Russian string is a DRAFT.
 *
 * Rules these strings follow (docs/landing-copy.md, "What the app can honestly claim"): the section states a problem with
 * the once-a-year checkup and says nothing about what the app does beyond the hero's own promise (a daily check-in, on
 * request). No medical claim, no monitoring, no history, no comparison. The English wording is Figma's, with one change:
 * the lede says "checking in on it" where Figma said "monitoring it", because the app does not monitor anything in the
 * background.
 *
 * The same words are used for the US, EU and Gulf pages; /ru/ gets the Russian set. Spelling: `checkapp`, `DiDi`.
 */
import type { Locale } from '@/content/copy';

export interface UsualWayCopy {
  /** The pill above the heading. */
  eyebrow: string;
  /** The h2. Typographic apostrophe, so it matches the design glyph for glyph. */
  title: string;
  /** The paragraph between the two brackets. */
  lede: string;
  /** The four numbered statements. The numerals 01 to 04 are drawn by the component, not stored. */
  statements: readonly [string, string, string, string];
  /** Alt text of the 3D render of the scan screen. Its baked UI text is the app's own and is not repeated here. */
  renderAlt: string;
}

export const COPY: Record<Locale, UsualWayCopy> = {
  en: {
    eyebrow: 'The Traditional Approach',
    title: 'Health checkups shouldn’t happen just once a year',
    lede: 'Traditional health checkups can be stressful, time-consuming, and uncertain. Your health changes every day, so why should checking in on it be an occasional event?',
    statements: [
      'Months can pass between health assessments.',
      'Small changes in your health may go unnoticed.',
      'Waiting for results can feel overwhelming.',
      'Too often, action begins only after symptoms appear.',
    ],
    renderAlt:
      'The checkapp scan details screen on a phone, surrounded by floating glass cards for moisture, coating, tongue and surface texture',
  },
  ru: {
    eyebrow: 'Привычный подход', // DRAFT
    title: 'Чекап здоровья не должен случаться раз в год', // DRAFT
    lede: 'Обычный чекап может быть стрессовым, долгим и неопределённым. Здоровье меняется каждый день — так почему заглядывать в него лишь изредка?', // DRAFT
    statements: [
      'Между проверками здоровья могут пройти месяцы.', // DRAFT
      'Небольшие перемены в самочувствии легко пропустить.', // DRAFT
      'Ожидание результатов бывает тревожным.', // DRAFT
      'Слишком часто о здоровье вспоминают, когда уже есть симптомы.', // DRAFT
    ],
    renderAlt:
      'Экран разбора скана в checkapp на телефоне, вокруг него парят стеклянные карточки: влажность, налёт, язык и текстура поверхности', // DRAFT
  },
};

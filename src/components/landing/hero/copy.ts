import type { Locale } from '@/content/copy';

/**
 * The hero's own strings: what the client's document (docs/landing.md) does not cover. The headline, the sub-line, the button
 * label and the price small print are the client's and come from `src/content/copy`; never retype them here.
 *
 * Every Russian string is a DRAFT until the client approves it (informal «ты», short, no medical claims). The text baked into the
 * phone picture (the app's own UI) is Russian on /ru/ too (public/landing/hero/phone-ru-*), so the alt text must keep naming
 * the screen the way the picture says it.
 */
export interface HeroStrings {
  eyebrow: string;
  /** Alt text of the phone image. It describes the picture, so it names the screen the way the page does. */
  phoneAlt: string;
}

export const heroCopy: Record<Locale, HeroStrings> = {
  en: {
    eyebrow: 'Your Digital Health Companion',
    phoneAlt:
      'The checkapp home screen on a phone: DiDi, the digital health companion, says good afternoon above a button that starts a tongue scan.',
  },
  ru: {
    eyebrow: 'Твой цифровой друг здоровья', // DRAFT
    phoneAlt:
      'Главный экран checkapp на телефоне: DiDi, цифровой друг здоровья, желает доброго дня над кнопкой, которая запускает скан языка.', // DRAFT
  },
};

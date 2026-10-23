import type { Locale } from '@/content/copy';

/**
 * The hero's own strings: everything the client's document (docs/landing-copy.md) does not cover. The headline, the sub-line, the
 * button label and the price small print are the client's and come from `src/content/copy`; never retype them here.
 *
 * What is here:
 *  - the eyebrow above the headline and the alt text of the phone mock-up;
 *  - the words on the floating UI cards (scan result, readings, the moisture gauge, scans, streak, DiDi's prompt). The cards are illustration, aria-hidden,
 *    and the numbers on them are mock-ups, so they are translated like any other visible string.
 *
 * What the cards may say (docs/landing-copy.md, "What the app can honestly claim"): the app takes photo scans of the tongue, face and iris,
 * only when the person asks, and answers with a short wellness insight. So the cards show exactly that and nothing else: no wearable,
 * no heart rate, no sleep, no body fat, no verdict on the body ("Normal"), nothing that happens in the background. The gate cannot see
 * aria-hidden text, so this list is the guard: keep new strings inside it.
 *
 * Every Russian string is a DRAFT until the client approves it (informal «ты», short, no medical claims). The text baked into the phone
 * mock-up (the app's own UI) is Russian on /ru/ too: public/landing/hero/phone-ru-* is the same screen with the words the Meet DiDi
 * phones use («Чат?», «Добрый день, Mah!», «Начать скан языка»), made by ./art/build.mjs. Those words are in the picture, so the
 * alt text below must keep naming them the way the picture says them.
 */
export interface HeroStrings {
  eyebrow: string;
  /** Alt text of the phone image. It describes the picture, so it names the screen the way the page does. */
  phoneAlt: string;
  /** The header of a finished scan: which scan, that its insight is back, and when (a mock-up time). */
  result: { title: string; status: string; time: string };
  /** The two readings DiDi notes on a tongue photo: its color and its coating. */
  readings: { color: string; colorValue: string; coating: string; coatingValue: string };
  /** One reading of the photo on a gauge (moisture of the tongue, as the app's own scan screen shows it), and the one small next step. */
  gauge: { title: string; sub: string; tip: string; zones: readonly [string, string, string]; next: string; nextValue: string };
  /** DiDi asking for a photo: the tilted card behind the phone, where the design's Upgrade card stood. */
  mascot: { alt: string; text: string; cta: string; time: string };
  /** The card that takes the place of the paid-plan card: the three photo scans the app has today. */
  scans: { title: string; sub: string; tongue: string; face: string; iris: string };
  streak: {
    days: string;
    label: string;
    title: string;
    sub: string;
    /** Monday to Sunday. */
    week: readonly [string, string, string, string, string, string, string];
  };
}

export const heroCopy: Record<Locale, HeroStrings> = {
  en: {
    eyebrow: 'Your Digital Health Companion',
    phoneAlt:
      'The checkapp home screen on a phone: DiDi, the digital health companion, says good afternoon above a button that starts a tongue scan.',
    result: { title: 'Tongue scan', status: 'Insight ready', time: '12:17 pm' },
    readings: { color: 'Color', colorValue: 'Light pink', coating: 'Coating', coatingValue: 'Thin' },
    gauge: {
      title: 'Moisture',
      sub: 'Read from your photo',
      tip: 'Slightly dry',
      zones: ['Dry', 'Balanced', 'Moist'],
      next: 'Next step',
      nextValue: 'Drink more water',
    },
    mascot: {
      alt: 'DiDi holding a camera',
      text: 'Want a closer look, Mah? Send me a photo.',
      cta: 'Start a scan',
      time: '4:56',
    },
    scans: {
      title: 'Photo scans',
      sub: 'Only when you ask',
      tongue: 'Tongue',
      face: 'Face',
      iris: 'Iris',
    },
    streak: {
      days: '4 days',
      label: 'Streak',
      title: 'Light it up!',
      sub: 'DiDi is ready when you are.',
      week: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    },
  },
  ru: {
    eyebrow: 'Твой цифровой друг здоровья', // DRAFT
    phoneAlt:
      'Главный экран checkapp на телефоне: DiDi, цифровой друг здоровья, желает доброго дня над кнопкой, которая запускает скан языка.', // DRAFT
    result: {
      title: 'Скан языка', // DRAFT
      status: 'Разбор готов', // DRAFT
      time: '12:17',
    },
    readings: {
      color: 'Цвет', // DRAFT
      colorValue: 'Розовый', // DRAFT
      coating: 'Налёт', // DRAFT
      coatingValue: 'Тонкий', // DRAFT
    },
    gauge: {
      title: 'Влажность', // DRAFT
      sub: 'По твоему фото', // DRAFT
      tip: 'Чуть сухо', // DRAFT
      zones: [
        'Сухо', // DRAFT
        'Норма', // DRAFT
        'Влажно', // DRAFT
      ],
      next: 'Следующий шаг', // DRAFT
      nextValue: 'Выпей воды', // DRAFT
    },
    mascot: {
      alt: 'DiDi с камерой', // DRAFT
      text: 'Хочешь присмотреться, Mah? Пришли фото.', // DRAFT
      cta: 'Начать скан', // DRAFT
      time: '4:56',
    },
    scans: {
      title: 'Фото-сканы', // DRAFT
      sub: 'Только когда ты сам хочешь', // DRAFT
      tongue: 'Язык', // DRAFT
      face: 'Лицо', // DRAFT
      iris: 'Радужка', // DRAFT
    },
    streak: {
      days: '4 дня', // DRAFT
      label: 'Серия', // DRAFT
      title: 'Зажги серию!', // DRAFT
      sub: 'DiDi готов, когда готов ты.', // DRAFT
      week: [
        'Пн', // DRAFT
        'Вт', // DRAFT
        'Ср', // DRAFT
        'Чт', // DRAFT
        'Пт', // DRAFT
        'Сб', // DRAFT
        'Вс', // DRAFT
      ],
    },
  },
};

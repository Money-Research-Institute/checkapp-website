import type { Locale } from '@/content/copy';

/**
 * The hero's own strings: everything the client's document (docs/landing-copy.md) does not cover. The headline, the sub-line, the
 * button label and the price small print are the client's and come from `src/content/copy`; never retype them here.
 *
 * What is here:
 *  - the eyebrow above the headline and the alt text of the phone mock-up;
 *  - the words on the floating UI cards (scan result, readings, DiDi's note, scans, streak). The cards are illustration, aria-hidden,
 *    and the numbers on them are mock-ups, so they are translated like any other visible string.
 *
 * What the cards may say (docs/landing-copy.md, "What the app can honestly claim"): the app takes photo scans of the tongue, face and iris,
 * only when the person asks, and answers with a short wellness insight. So the cards show exactly that and nothing else: no wearable,
 * no heart rate, no sleep, no body fat, no verdict on the body ("Normal"), nothing that happens in the background. The gate cannot see
 * aria-hidden text, so this list is the guard: keep new strings inside it.
 *
 * Every Russian string is a DRAFT until the client approves it (informal «ты», short, no medical claims). The baked-in text of the
 * phone mock-up (the app's own UI) stays English on /ru/: there is no Russian screen art yet.
 */
export interface HeroStrings {
  eyebrow: string;
  /** Alt text of the phone image. It describes the picture, so it names the screen the way the page does. */
  phoneAlt: string;
  /** The header of a finished scan: which scan, that its insight is back, and when (a mock-up time). */
  result: { title: string; status: string; time: string };
  /** The two readings DiDi notes on a tongue photo: its color and its coating. */
  readings: { color: string; colorValue: string; coating: string; coatingValue: string };
  /** DiDi's short answer: what the app sends back, and the one small next step for the day. */
  note: { title: string; sub: string; text: string; next: string; nextValue: string };
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
    note: {
      title: 'DiDi’s note',
      sub: 'A short wellness insight',
      text: 'Thanks for the photo. Here is what I noticed, in plain words, and one small step for today.',
      next: 'Next step',
      nextValue: 'Drink more water',
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
    note: {
      title: 'Заметка DiDi', // DRAFT
      sub: 'Короткий wellness-разбор', // DRAFT
      text: 'Спасибо за фото. Вот что я заметил, простыми словами, и один маленький шаг на сегодня.', // DRAFT
      next: 'Следующий шаг', // DRAFT
      nextValue: 'Выпей воды', // DRAFT
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

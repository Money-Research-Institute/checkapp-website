import type { Locale } from '@/content/copy';

/**
 * The hero's own strings: everything the client's document (docs/landing-copy.md) does not cover. The headline, the sub-line, the
 * button label and the price small print are the client's and come from `src/content/copy`; never retype them here.
 *
 * What is here:
 *  - the eyebrow above the headline and the alt text of the phone mock-up;
 *  - the words on the floating UI cards (watch, vitals, body composition, scans, streak). The cards are illustration, aria-hidden,
 *    and the numbers on them are mock-ups, so they are translated like any other visible string.
 *
 * Every Russian string is a DRAFT until the client approves it (informal «ты», short, no medical claims). The baked-in text of the
 * phone mock-up (the app's own UI) stays English on /ru/: there is no Russian screen art yet.
 */
export interface HeroStrings {
  eyebrow: string;
  /** Alt text of the phone image. It describes the picture, so it names the screen the way the page does. */
  phoneAlt: string;
  watch: { connected: string; lastSync: string; time: string };
  vitals: { heartRate: string; heartValue: string; sleep: string; sleepValue: string };
  body: {
    title: string;
    state: string;
    /** The tooltip over the knob, and the "Body Fat" row below the bar. */
    value: string;
    /** The four labels under the bar, lean to above average. */
    scale: readonly [string, string, string, string];
    fat: string;
  };
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
    watch: { connected: 'Connected', lastSync: 'Last sync:', time: '12:17 pm' },
    vitals: { heartRate: 'Heart Rate', heartValue: '91 BPM', sleep: 'Sleep Duration', sleepValue: '8h 20m' },
    body: {
      title: 'Body Composition',
      state: 'Normal',
      value: '24.1%',
      scale: ['Lean', 'Ideal', 'Average', 'Above average'],
      fat: 'Body Fat',
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
    watch: {
      connected: 'Подключено', // DRAFT
      lastSync: 'Синхронизация:', // DRAFT
      time: '12:17',
    },
    vitals: {
      heartRate: 'Пульс', // DRAFT
      heartValue: '91 уд/мин', // DRAFT
      sleep: 'Сон', // DRAFT
      sleepValue: '8 ч 20 мин', // DRAFT
    },
    body: {
      title: 'Состав тела', // DRAFT
      state: 'Норма', // DRAFT
      value: '24,1%',
      scale: [
        'Низкий', // DRAFT
        'Идеал', // DRAFT
        'Средний', // DRAFT
        'Выше среднего', // DRAFT
      ],
      fat: 'Жир в теле', // DRAFT
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

/**
 * Meet DiDi ("familiar"): the strings the client's document does not cover.
 *
 * The client's own wording is rendered by index.tsx straight from src/content/copy and is not repeated here:
 *   - the paragraph under the heading is `meetDidiText(region)` ("MEET DIDI"),
 *   - the line under the four phones is `getRegionCopy(region).whatItDoes` ("WHAT IT DOES NOW").
 *
 * What this file holds are our drafts (docs/landing-copy.md, "Drafts we still write"): the eyebrow, the heading, the four captions
 * and the alt text of the phone mock-ups. They say only what the app does today: a photo scan of the tongue, face or iris, on
 * request, with a short wellness insight back (docs/landing-copy.md, "What the app can honestly claim"). Figma's captions
 * ("DIDI reads yesterday", "Talk on video", "Evening, a quiet recap") promised a comparison with earlier check-ins and video
 * analysis, which the gate fails, so they are replaced; the day-of-the-week framing went with them (it also contradicted the
 * "Good afternoon" on the first screen). The four steps follow the phones in order: start, photo, chat, insight.
 *
 * Alt text describes what the screen shows, never what the caption promises. The mock-ups themselves are flattened exports of the
 * app's English UI, so on /ru/ the alt text is the only Russian a screen reader gets for them (see the hand-off notes).
 *
 * Every Russian string is a DRAFT for the client to approve. It addresses the reader as «ты». The gate also fails «видео…»
 * and «со временем», so neither appears.
 */
import type { Locale } from '@/content/copy';

/** Which exported device a step shows (public/landing/familiar/<image>-560|840.avif|webp). */
export type DeviceImage = 'device-home' | 'device-record' | 'device-chat' | 'device-scan';

export interface Step {
  image: DeviceImage;
  alt: string;
  title: string;
  text: string;
}

export interface FamiliarCopy {
  eyebrow: string;
  title: string;
  /** Accessible name of the scrollable day strip on phones. */
  stripLabel: string;
  /** In story order. */
  steps: readonly [Step, Step, Step, Step];
  /** Accessible name of the three scan chips. */
  scansLabel: string;
  /** The three scans, in the client's order. */
  scans: readonly [string, string, string];
}

export const familiarCopy: Record<Locale, FamiliarCopy> = {
  en: {
    eyebrow: 'Meet DiDi',
    title: 'Your digital health assistant from the future.',
    stripLabel: 'A scan with DiDi, in four steps',
    steps: [
      {
        image: 'device-home',
        alt: 'DiDi home screen: the mascot greets Mah, with a Start Tongue Scan button and a 4-day streak.',
        title: 'Start whenever you like',
        text: 'Open checkapp and tap Start Tongue Scan. Nothing runs until you do.',
      },
      {
        image: 'device-record',
        alt: 'The in-app camera: a round live preview, pause and flip-camera buttons, and a green send button.',
        title: 'Take a quick photo',
        text: 'Tongue, face or iris, only when you choose to.',
      },
      {
        image: 'device-chat',
        alt: 'Chat with DiDi: a message from DiDi and a round picture sent back, above an “Ask me anything…” box.',
        title: 'DiDi answers in the chat',
        text: 'A short wellness insight, in plain words, in the same conversation.',
      },
      {
        image: 'device-scan',
        alt: 'Scan Details: overall result Needs Attention, with tongue color, coating, moisture and surface texture readings and a next step to drink more water.',
        title: 'See what DiDi noticed',
        text: 'Tongue color, coating, moisture and one small next step for today.',
      },
    ],
    scansLabel: 'What you can scan',
    scans: ['Tongue', 'Face', 'Iris'],
  },
  ru: {
    // DRAFT
    eyebrow: 'Знакомься с DiDi',
    // DRAFT
    title: 'Твой цифровой помощник из будущего.',
    // DRAFT
    stripLabel: 'Скан с DiDi в четыре шага',
    steps: [
      {
        image: 'device-home',
        // DRAFT
        alt: 'Главный экран приложения: DiDi машет рукой, ниже кнопка запуска скана языка и серия из четырёх дней.',
        // DRAFT
        title: 'Начни, когда захочешь',
        // DRAFT
        text: 'Открой checkapp и нажми кнопку скана языка. Пока ты не нажмёшь, ничего не запускается.',
      },
      {
        image: 'device-record',
        // DRAFT
        alt: 'Камера в приложении: круглый предпросмотр, кнопки паузы и переключения камеры и зелёная кнопка отправки.',
        // DRAFT
        title: 'Сделай быстрое фото',
        // DRAFT
        text: 'Язык, лицо или радужка — только когда ты сам этого хочешь.',
      },
      {
        image: 'device-chat',
        // DRAFT
        alt: 'Чат с DiDi: сообщение от DiDi и круглая картинка в ответ, а внизу строка для вопроса.',
        // DRAFT
        title: 'DiDi отвечает в чате',
        // DRAFT
        text: 'Короткий wellness-комментарий простыми словами, прямо в диалоге.',
      },
      {
        image: 'device-scan',
        // DRAFT
        alt: 'Экран деталей скана: общий результат, цвет языка, налёт, влажность и текстура поверхности, краткое резюме и совет выпить больше воды.',
        // DRAFT
        title: 'Посмотри, что заметил DiDi',
        // DRAFT
        text: 'Цвет языка, налёт, влажность и один небольшой шаг на сегодня.',
      },
    ],
    // DRAFT
    scansLabel: 'Что можно отсканировать',
    // DRAFT
    scans: ['Язык', 'Лицо', 'Радужка'],
  },
};

/**
 * Meet DiDi ("familiar"): the strings the client's document does not cover.
 *
 * The client's own wording is rendered by index.tsx straight from src/content/copy and is not repeated here:
 *   - the paragraph under the heading is `meetDidiText(region)` ("MEET DIDI"),
 *   - the line under the four phones is `getRegionCopy(region).whatItDoes` ("WHAT IT DOES NOW").
 *
 * What this file holds are our drafts (docs/landing-copy.md, "Drafts we still write"): the eyebrow, the heading, the four captions,
 * the alt text of the phone mock-ups and the labels of the phone strip's pager. They say only what the app does today: a photo scan
 * of the tongue, face or iris, on request, with a short wellness insight back (docs/landing-copy.md, "What the app can honestly
 * claim"). Figma's captions ("DIDI reads yesterday", "Talk on video", "Evening, a quiet recap") promised a comparison with earlier
 * check-ins and video analysis, which the gate fails, so they are replaced; the day-of-the-week framing went with them (it also
 * contradicted the "Good afternoon" on the first screen). The four steps follow the phones in order: start, photo, chat, insight.
 *
 * Alt text describes what the screen shows, never what the caption promises. The mock-ups are raster images, so the gate cannot read
 * the text inside them: they carry nothing the copy does not say (no video, no verdict, no date), and /ru/ gets its own render of
 * all four screens in Russian (public/landing/familiar/<image>-ru-*), so the pixels and the alt text agree in both languages.
 *
 * Every Russian string is a DRAFT for the client to approve. It addresses the reader as «ты». The gate also fails «видео…»
 * and «со временем», so neither appears.
 */
import type { Locale } from '@/content/copy';

/** Which exported device a step shows (public/landing/familiar/<image>[-ru]-560|840.avif|webp). */
export type DeviceImage = 'device-home' | 'device-camera' | 'device-chat' | 'device-scan';

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
  /** Accessible name of the strip's pager (the dots under it). */
  pagerLabel: string;
  /** Accessible name of one pager dot: "Phone 2 of 4". */
  pagerItem: (n: number, total: number) => string;
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
    pagerLabel: 'Choose a phone',
    pagerItem: (n, total) => `Phone ${n} of ${total}`,
    steps: [
      {
        image: 'device-home',
        alt: 'DiDi home screen: the mascot greets Mah, with a Start Tongue Scan button and a 4-day streak.',
        title: 'Start whenever you like',
        text: 'Open checkapp and tap Start Tongue Scan. Nothing runs until you do.',
      },
      {
        image: 'device-camera',
        alt: 'The in-app camera: a round live preview of a face under the prompt “Fit your face in the circle”, with flip-camera and flash buttons and a round shutter button.',
        title: 'Take a quick photo',
        text: 'Tongue, face or iris, only when you choose to.',
      },
      {
        image: 'device-chat',
        alt: 'Chat with DiDi: DiDi asks for a quick photo, the photo is sent back and DiDi replies, above an “Ask me anything…” box.',
        title: 'DiDi answers in the chat',
        text: 'A short wellness insight, in plain words, in the same conversation.',
      },
      {
        image: 'device-scan',
        alt: 'Scan Details: a scan titled Your scan, with short notes on tongue color, coating, moisture and surface texture, a summary of what is visible in the photo and a small next step to drink more water.',
        title: 'See what DiDi noticed',
        text: 'Tongue color, coating, moisture and one small next step for today.',
      },
    ],
    scansLabel: 'What you can scan',
    scans: ['Tongue', 'Face', 'Iris'],
  },
  ru: {
    // DRAFT: «Встречай», not «Знакомься», so the eyebrow does not echo the client's paragraph right below it.
    eyebrow: 'Встречай DiDi',
    // DRAFT: «друг», the client's own word for DiDi («цифровой друг», hero and Meet DiDi), not «помощник». The English line is Figma's.
    title: 'Твой цифровой друг уже здесь.',
    // DRAFT
    stripLabel: 'Скан с DiDi в четыре шага',
    // DRAFT
    pagerLabel: 'Выбери экран',
    // DRAFT
    pagerItem: (n, total) => `Экран ${n} из ${total}`,
    steps: [
      {
        image: 'device-home',
        // DRAFT
        alt: 'Главный экран приложения: DiDi машет рукой, ниже кнопка «Начать скан языка» и серия из четырёх дней.',
        // DRAFT
        title: 'Начни, когда захочешь',
        // DRAFT
        text: 'Открой checkapp и нажми кнопку скана языка. Пока ты не нажмёшь, ничего не запускается.',
      },
      {
        image: 'device-camera',
        // DRAFT
        alt: 'Камера в приложении: круглый видоискатель с лицом, подсказка «Помести лицо в круг», кнопки переключения камеры и вспышки и круглая кнопка съёмки.',
        // DRAFT
        title: 'Сделай быстрое фото',
        // DRAFT
        text: 'Язык, лицо или радужка — только когда ты сам этого хочешь.',
      },
      {
        image: 'device-chat',
        // DRAFT
        alt: 'Чат с DiDi: DiDi просит быстрое фото, снимок отправлен, и DiDi отвечает; внизу строка «Спроси меня о чём угодно…».',
        // DRAFT
        title: 'DiDi отвечает в чате',
        // DRAFT
        text: 'Короткий wellness-комментарий простыми словами, прямо в диалоге.',
      },
      {
        image: 'device-scan',
        // DRAFT
        alt: 'Экран деталей скана «Твой скан»: короткие заметки о цвете языка, налёте, влажности и текстуре поверхности, краткое описание того, что видно на фото, и небольшой шаг — выпить больше воды.',
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

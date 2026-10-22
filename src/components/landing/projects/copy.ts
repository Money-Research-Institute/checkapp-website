/**
 * Projects (the 4P pillars): the strings the client's document does not cover.
 *
 * The client's own 4P statement (`fourP`, verbatim, per region) is rendered above the tiles by index.tsx and is not repeated here.
 * What this file holds are our drafts (docs/landing-copy.md, "Drafts we still write"): the title-tile heading and the four tiles,
 * named after the client's four Ps (personalized, preventive, participatory, predictive) in the client's order. Each tile says
 * only what the client's 4P sentence says: attention, gentle nudges, you decide what to share, and a short wellness read that is
 * never a diagnosis or a disease prediction. Nothing here promises a report, a history, a comparison with earlier check-ins or
 * anything the app does not do today (the gate fails those).
 *
 * The Russian is a DRAFT for the client to approve. It addresses the reader as «ты». Tile 04 repeats the client's own Russian
 * phrase ("не диагнозы и не прогнозы болезней"), which the gate's claimAllow list recognises.
 *
 * Numerals are not copy: index.tsx derives "01".."04" from the position.
 */
import type { Locale } from '@/content/copy';

export interface Pillar {
  name: string;
  text: string;
}

export interface ProjectsCopy {
  /** The title tile's h2. */
  heading: string;
  /** Four tiles, in the client's order. */
  pillars: readonly [Pillar, Pillar, Pillar, Pillar];
}

export const projectsCopy: Record<Locale, ProjectsCopy> = {
  en: {
    heading: 'The future of everyday wellness is 4P',
    pillars: [
      {
        name: 'Personalized',
        text: 'DiDi works from the photos you choose to take, so what you get back is about you, not a generic checklist.',
      },
      {
        name: 'Preventive',
        text: 'Daily attention and gentle nudges. A quick check-in and a small push to look after yourself today.',
      },
      {
        name: 'Participatory',
        text: 'You decide what to share, and when. DiDi only looks at what you send, and you can delete your data anytime.',
      },
      {
        name: 'Predictive',
        text: 'DiDi gives a short wellness read in plain language — never diagnoses or disease predictions.',
      },
    ],
  },
  ru: {
    // DRAFT
    heading: 'Будущее повседневного благополучия — это 4P',
    pillars: [
      {
        // DRAFT
        name: 'Персональная',
        text: 'DiDi опирается на фото, которые ты сам решаешь сделать, поэтому разбор получается про тебя, а не по шаблону.',
      },
      {
        // DRAFT
        name: 'Превентивная',
        text: 'Ежедневное внимание и мягкие подсказки. Короткий чек-ин и маленький повод позаботиться о себе сегодня.',
      },
      {
        // DRAFT
        name: 'Участвующая',
        text: 'Ты решаешь, чем делиться и когда. DiDi смотрит только то, что ты отправил, а данные можно удалить в любой момент.',
      },
      {
        // DRAFT
        name: 'Предиктивная',
        text: 'Короткий wellness-комментарий по каждому фото простым языком. Подсказки и мягкие советы — не диагнозы и не прогнозы болезней.',
      },
    ],
  },
};

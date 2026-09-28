import type { ArticleRequest } from './prompts/types';
import { clusterTagEn } from '../config/cluster-tags';
import type { UnsplashImage } from './images';

const DEPTH = [
  'Wellness education starts with small repeatable actions — not with a perfect plan you abandon by midweek.',
  'Hydration, sleep, and movement interact. Changing one lever often shifts how the others feel within a few days.',
  'Apps can prompt and remember patterns. CheckApp and DIDI are wellness tools. They do not diagnose, treat, or cure disease.',
  'CheckApp and DIDI support daily habits through conversational check-ins and optional wellness indicators.',
  'If symptoms are acute or worrying, professional care comes first. Educational articles are not emergency guidance.',
  'Consistency over intensity: two minutes daily beats a heroic weekend reset.',
];

function faqItems(req: ArticleRequest): Array<{ q: string; a: string }> {
  const kw = req.keywordEn || req.keywordDe;
  return [
    {
      q: `What is ${kw}?`,
      a: `${kw} is a practical wellness topic. This article explains everyday habits and limits — not medical diagnosis.`,
    },
    {
      q: `Can CheckApp replace professional care for ${kw}?`,
      a: 'No. CheckApp and DIDI are wellness tools for habit support and education. They do not diagnose, treat, or cure disease.',
    },
    {
      q: 'Is this article medical advice?',
      a: 'No. It is general wellness information. Consult a qualified healthcare professional for medical concerns.',
    },
    {
      q: 'How can DIDI help with daily wellness?',
      a: 'DIDI sends conversational check-ins, tracks hydration streaks, and remembers your patterns over time.',
    },
    {
      q: 'Should I stop seeing my doctor if an app helps?',
      a: 'No. Continue regular medical care. Apps complement professional guidance; they do not replace it.',
    },
    {
      q: 'Where can I try CheckApp?',
      a: 'Try CheckApp free — DIDI turns daily wellness advice into a habit you actually keep. Visit /download/.',
    },
  ];
}

export function generateMockArticle(req: ArticleRequest, images: UnsplashImage[]): string {
  const cover = images[0]?.url.replace('w=800', 'w=1200') ?? images[0]?.url ?? '';
  const kw = req.keywordEn || req.keywordDe;
  const title = req.titleEn || req.titleDe;
  const img2 = images[1] ?? images[0];
  const faqs = faqItems(req);
  const faqYaml = faqs.map((f) => `  - question: "${f.q}"\n    answer: "${f.a}"`).join('\n');
  const authorName = req.author?.name ?? 'Ed Musinski';
  const authorRole = req.author?.role ?? 'Chief Science Consultant';

  return `---
title: "${title}"
description: "${title.slice(0, 120)} Educational guide to ${kw} for daily wellness in 2026 — not medical advice."
datePublished: "${req.plannedDate}"
dateModified: "${req.plannedDate}"
author:
  name: "${authorName}"
  role: "${authorRole}"
category: "${req.category}"
readTime: 8
coverImage: "${cover}"
featured: false
checkedBy: "Sam Okonkwo, Registered Dietitian"
tags: ["${kw}", "${clusterTagEn(req.cluster)}", "wellness", "2026"]
faq:
${faqYaml}
sources:
  - label: "WHO — Health topics"
    url: "https://www.who.int/health-topics"
  - label: "NIH — Wellness"
    url: "https://www.nih.gov/health-information"
---

**${kw}** is a practical wellness topic for adults building sustainable daily habits. This briefing explains everyday actions and clear limits — wellness education, not medical diagnosis.

**At a glance:**
- Focus: small daily actions you can repeat
- Tools: reminders, check-ins, optional tracking
- Limit: not a substitute for professional medical care

## What does ${kw} mean for daily wellness?

${DEPTH[0]} ${DEPTH[1]}

| Topic | Everyday action | What it is not |
|-------|-----------------|----------------|
| Hydration | Drink with meals | A lab test |
| Check-ins | Two-minute review | Clinical intake |
| Patterns | Weekly trend view | Diagnosis |
| Apps | Habit support | Medical devices |

## Why ${kw} matters in 2026

${DEPTH.join('\n\n')}

![${img2.altText} — wellness habits](${img2.url})

## How to work with ${kw} — five steps

1. **Pick one small action you can repeat daily.**
2. **Anchor it to an existing routine (habit stacking).**
3. **Log for seven days before changing another variable.**
4. **Review weekly patterns, not hourly scores.**
5. **Consult a clinician for persistent or acute symptoms.**

## Limits and responsible use

Wellness apps highlight habits and patterns. They do not diagnose, treat, or cure disease. No app can guarantee health outcomes. CheckApp is a wellness companion, not a medical device.

See also: [How It Works](/how-it-works/) and [Features](/features/).

## Conclusion

Treat ${kw} as a habit-and-awareness problem. Verify guidance with reputable sources and your clinician when needed. Try CheckApp free — DIDI turns daily wellness advice into a habit you actually keep. [Get CheckApp Free](/download/)

*This article is for general wellness information only. It is not medical advice, diagnosis, or treatment. CheckApp and DIDI are not medical devices. Always consult a qualified healthcare professional for medical concerns.*
`;
}

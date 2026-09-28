import {
  FORBIDDEN_PATTERNS,
  listComplianceHits,
} from '../config/forbidden-patterns';
import { generateMockArticle } from './mock-generator';
import { REQUIRED_DISCLAIMER_TEXT, SAFE_LIMITS_SENTENCE, SYSTEM_PROMPT } from './prompts/system';
import { buildArticlePrompt } from './prompts/article-de';
import type { ArticleRequest } from './prompts/types';
import { validateArticle } from './validator';

function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

function shouldMatch(pattern: RegExp, text: string, label: string): void {
  assert(pattern.test(text), `expected to MATCH (${label}): ${text}`);
}

function shouldNotMatch(pattern: RegExp, text: string, label: string): void {
  pattern.lastIndex = 0;
  assert(!pattern.test(text), `expected NOT to match (${label}): ${text}`);
  pattern.lastIndex = 0;
}

function assertClean(text: string, label: string): void {
  const hits = listComplianceHits(text);
  assert(
    hits.length === 0,
    `expected PASS (${label}) but matched ${hits.map((hit) => `${hit.key}:"${hit.match}"`).join('; ')} in: ${text}`,
  );
}

function assertBlocked(text: string, label: string): void {
  const hits = listComplianceHits(text);
  assert(hits.length > 0, `expected FAIL (${label}): ${text}`);
}

shouldNotMatch(
  FORBIDDEN_PATTERNS.medicalDiagnosis,
  'Tongue photos may show hydration indicators for wellness awareness, not a clinical diagnosis.',
  'educational wellness signal language',
);

shouldMatch(
  FORBIDDEN_PATTERNS.medicalDiagnosis,
  'This app diagnoses dehydration with clinical accuracy.',
  'diagnosis claim',
);

shouldNotMatch(
  FORBIDDEN_PATTERNS.medicalDeviceClaim,
  'CheckApp is a wellness app, not an FDA-approved medical device.',
  'educational not-a-device sentence',
);

shouldMatch(
  FORBIDDEN_PATTERNS.medicalDeviceClaim,
  'CheckApp is FDA-approved to treat hypertension.',
  'FDA treatment claim',
);

shouldNotMatch(
  FORBIDDEN_PATTERNS.replacesDoctor,
  'Apps complement professional guidance; they do not replace your doctor.',
  'educational doctor complement',
);

shouldMatch(
  FORBIDDEN_PATTERNS.replacesDoctor,
  'You no longer need to see a doctor if you use this app.',
  'replaces doctor claim',
);

shouldNotMatch(
  FORBIDDEN_PATTERNS.guaranteedOutcome,
  'No wellness app can guarantee perfect hydration every day.',
  'educational no-guarantee',
);

shouldMatch(
  FORBIDDEN_PATTERNS.guaranteedOutcome,
  'We guarantee your hydration will reach 100% accuracy.',
  'guaranteed outcome',
);

const DISCLAIMER = REQUIRED_DISCLAIMER_TEXT;

assertClean(DISCLAIMER, 'required medical disclaimer');
assertClean(
  'It is not medical advice, diagnosis, or treatment. CheckApp and DIDI are not medical devices.',
  'disclaimer clause without markup',
);
assertClean('They do not diagnose disease.', 'negated diagnose disease');
assertClean('CheckApp does not diagnose dehydration.', 'negated diagnose dehydration');
assertClean('This is not a medical diagnosis of any condition.', 'negated medical diagnosis of');
assertClean('DIDI does not detect disease.', 'negated detect disease');
assertClean('We never diagnose, detect disease, or identify illness.', 'negated coordinated diagnosis list');
assertClean(SAFE_LIMITS_SENTENCE, 'canonical limits sentence');
assertClean('They do not diagnose, treat, or cure disease.', 'comma-separated limits clause');
assertClean('CheckApp does not prescribe medication.', 'negated prescription');
assertClean('This routine is not guaranteed to cure disease.', 'negated cure guarantee');
assertClean('If you have dehydration, drink a glass of water and reassess.', 'conditional hydration cue');
assertClean('Whether you have dehydration or just thirst, start with water.', 'whether-clause hydration cue');
assertClean(
  'Tongue photos may show hydration indicators for wellness awareness, not a clinical diagnosis.',
  'wellness indicator sentence',
);

assertBlocked('This app diagnoses dehydration with clinical accuracy.', 'affirmative dehydration diagnosis');
assertBlocked('DIDI detects disease early.', 'detects disease');
assertBlocked('The scan detects conditions from a photo.', 'detects conditions');
assertBlocked('The scan identifies illness from a photo.', 'identifies illness');
assertBlocked('The scan identifies disorders from a photo.', 'identifies disorders');
assertBlocked('This is a medical diagnosis of dehydration.', 'medical diagnosis of');
assertBlocked('You have been diagnosed with diabetes.', 'diagnosed with diabetes');
assertBlocked('You have diabetes.', 'you have diabetes');
assertBlocked('You have dehydration.', 'you have dehydration');
assertBlocked('You have a chronic disease.', 'you have a chronic disease');
assertBlocked('This tea cures disease.', 'cures disease');
assertBlocked('The protocol treats cancer.', 'treats cancer');
assertBlocked('We prescribe medication for hypertension.', 'prescribes medication');
assertBlocked('Here is a prescription for diabetes.', 'prescription for diabetes');
assertBlocked('CheckApp is FDA-approved to treat hypertension.', 'FDA treatment claim');
assertBlocked('We guarantee your hydration will reach 100% accuracy.', 'guaranteed outcome');
assertBlocked(
  'This is not medical advice. The app detects disease.',
  'new sentence after a disclaimer still diagnoses',
);
assertBlocked(
  'CheckApp is not a medical device and diagnoses dehydration.',
  'negation does not cover a later affirmative claim',
);
assertBlocked('This app can diagnose disease.', 'can diagnose disease');

const sampleArticle = `---
title: "Morning Hydration Routine: Signals You Can Notice at Home"
description: "Build a morning hydration routine around thirst, urine color, and energy — wellness signals for daily habits, with clear limits."
datePublished: "2026-09-28"
dateModified: "2026-09-28"
author:
  name: "Ed Musinski"
  role: "Chief Science Consultant"
category: "Hydration Science"
readTime: 8
coverImage: "https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=1200"
featured: false
tags: ["morning hydration routine", "hydration", "wellness", "2026"]
faq:
  - question: "What is a morning hydration routine?"
    answer: "It is a repeatable habit: drink water after waking and notice thirst, urine color, and energy as hydration signals."
  - question: "What can a wellness app add?"
    answer: "A reminder and a weekly pattern view. ${SAFE_LIMITS_SENTENCE}"
  - question: "Is this medical advice?"
    answer: "No. It is general wellness information. Talk with a qualified healthcare professional about medical concerns."
  - question: "Which signals are useful in the morning?"
    answer: "Thirst, a dry mouth, and darker urine are wellness cues. They are not a clinical verdict."
  - question: "Where can I try CheckApp?"
    answer: "Try CheckApp free — DIDI turns daily wellness advice into a habit you actually keep."
sources:
  - label: "WHO — Drinking-water"
    url: "https://www.who.int/news-room/fact-sheets/detail/drinking-water"
  - label: "NIH"
    url: "https://www.nih.gov/health-information"
---

A morning hydration routine is one glass of water after you wake up, then a moment to notice thirst, urine color, and energy. Those are hydration signals. They help you choose the next glass of water. They are not a clinical verdict.

## What belongs in a morning hydration routine?

Put the glass by the kettle the night before. Drink it before coffee. ${SAFE_LIMITS_SENTENCE} We never diagnose, detect disease, or identify illness.

| Signal | Everyday meaning | What it is not |
| --- | --- | --- |
| Thirst | A prompt to drink | A lab result |
| Urine color | A rough hydration cue | A clinical verdict |
| Dry mouth | A reason to sip water | A disease label |
| Afternoon slump | A pattern to watch over a week | An emergency sign |

## How do you keep the habit small?

1. Fill the glass before you go to sleep.
2. Drink it before you open email.
3. Notice one hydration signal at midday.
4. Keep the same cue for seven days.
5. Change only one part of the routine after that week.

![Glass of water on a morning table](https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=800)

## What are the limits?

This article is not a medical diagnosis of dehydration. It describes a habit. If symptoms are severe, persistent, or frightening, contact a qualified healthcare professional.

Try CheckApp free — DIDI turns daily wellness advice into a habit you actually keep. [Get CheckApp Free](/download/)

${DISCLAIMER}
`;

assertClean(sampleArticle, 'sample wellness article compliance');
const sampleResult = validateArticle(sampleArticle, 'morning hydration routine', 1500);
assert(
  sampleResult.valid,
  `sample wellness article should pass validation:\n${sampleResult.errors.join('\n')}`,
);
assert(
  sampleResult.errors.every((error) => !error.includes('Medical diagnosis language')),
  'sample article must not trip the diagnosis validator',
);

const mockRequest: ArticleRequest = {
  id: 20,
  cluster: 'Habits',
  slug: 'habit-stacking-wellness',
  titleDe: 'Habit Stacking for Wellness: Link Small Actions Into Lasting Routines',
  titleEn: 'Habit Stacking for Wellness: Link Small Actions Into Lasting Routines',
  keywordDe: 'habit stacking wellness',
  keywordEn: 'habit stacking wellness',
  lsiKeywords: ['routine building'],
  format: 'Howto',
  targetLength: 1500,
  taSegments: ['beginners'],
  priority: 'high',
  plannedDate: '2026-09-17',
  language: 'EN',
  category: 'Daily Habits',
  status: 'pending',
  unsplashQuery: 'habit stacking morning routine checklist',
  searchVolDe: 1500,
  kd: 23,
  searchVolEn: 3000,
};

const mockArticle = generateMockArticle(mockRequest, [
  {
    url: 'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=800',
    altText: 'Glass of water',
    photographer: 'Test',
    photographerUrl: 'https://unsplash.com/',
  },
]);
assertClean(mockArticle, 'mock article compliance');
const mockResult = validateArticle(mockArticle, mockRequest.keywordEn, 600);
assert(mockResult.valid, `mock article should pass validation:\n${mockResult.errors.join('\n')}`);

assert(SYSTEM_PROMPT.includes(SAFE_LIMITS_SENTENCE), 'system prompt includes the safe limits sentence');
assert(SYSTEM_PROMPT.includes(DISCLAIMER), 'system prompt includes the required disclaimer');
const userPrompt = buildArticlePrompt(mockRequest, [], []);
assert(userPrompt.includes(SAFE_LIMITS_SENTENCE), 'user prompt includes the safe limits sentence');
assert(userPrompt.includes(DISCLAIMER), 'user prompt includes the required disclaimer');
assert(userPrompt.includes('hydration signals'), 'user prompt few-shot uses wellness signals');

console.log('✅ compliance-patterns.test.ts passed');

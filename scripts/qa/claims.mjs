/**
 * The text rules of the QA check (scripts/qa/check.mjs): the patterns and the functions that apply them. The rules and the reasons
 * are in docs/landing.md ("What the app can honestly claim").
 */

/** Medical and superlative claims the page must never make, scanned case-insensitively over its text, alt and aria-label (not inside [data-disclaimer]). */
export const BANNED_CLAIMS = [
  "diagnos",
  "predict\\w*\\s+(a\\s+|the\\s+)?(diseases?|illness(es)?|conditions?)",
  "prevent\\w*\\s+(a\\s+|the\\s+)?(diseases?|illness(es)?|conditions?)",
  "to predict is to prevent",
  "world.?s\\s+first",
  "\\b(cure|cures|cured|curing)\\b",
  "\\btreat(s|ing|ment|ments)?\\b",
  "clinically\\s+(proven|tested|validated)",
  "medical[- ]grade",
  "doctor[- ]approved",
  "detect\\w*\\s+(diseases?|cancer|illness)",
  "диагноз",
  "диагност",
  "(?<!\\p{L})(?:лечит|лечени\\p{L}*|вылеч\\p{L}*|излеч\\p{L}*)",
  "(?:предсказ|прогноз|предотвращ)\\p{L}*\\s+(?:болезн|заболеван)\\p{L}*",
  "(?<!\\p{L})первое\\s+в\\s+мире",
  "клинически\\s+(?:доказан|проверен)\\p{L}*",
  "медицинского\\s+класса",
];

/** The narrow phrasings in which a banned word denies the claim ("never diagnoses", "Does DiDi diagnose?"). Removed from the text before BANNED_CLAIMS runs; not a general negation filter. */
export const CLAIM_ALLOW = [
  "\\b(?:does\\s+not|doesn['’]t|do\\s+not|don['’]t|never|cannot|can['’]t|not\\s+intended\\s+to)\\s+diagnos\\w*",
  "\\bdoes\\s+(?:didi|checkapp|it|this(?:\\s+app)?)\\s+diagnose\\b\\??",
  "(?<!\\p{L})не\\s+(?:ставит|ставят|поставит|предсказывает|предсказывают|прогнозирует|лечит|лечат|диагностирует)\\s+\\p{L}+",
  "(?<!\\p{L})не\\s+(?:диагноз\\p{L}*|прогноз\\p{L}*(?:\\s+болезн\\p{L}*)?)",
  "(?<!\\p{L})ставит\\s+диагнозы\\s*\\?",
];

/** Things the app cannot do yet (history, reports, video, comparison over time). Scanned like claims, but not inside the testimonials, which are placeholders. */
export const UNSUPPORTED_CAPABILITIES = [
  "weekly\\s+report",
  "90[- ]day",
  "video\\s+(?:check|analysis|scan)",
  "\\bover\\s+time\\b",
  "\\bcompar\\w+\\s+(?:today|your|signals?|check-?ins?)",
  "\\b(?:earlier|previous)\\s+check-?ins?\\b",
  "continuous(?:ly)?\\s+monitor\\w*",
  "\\breal[- ]time\\b",
  "еженедельн\\p{L}*\\s+отчёт\\p{L}*",
  "90\\s+дн\\p{L}*",
  "со\\s+временем",
  "(?<!\\p{L})видео\\p{L}*",
];

/** Template tokens and filler that must never reach a visitor. */
export const PLACEHOLDERS = [
  "\\{(?:price|currency)\\}",
  "\\[(?:Price|Цена|AED\\/SAR|AED|SAR)\\]",
  "\\bTODO\\b",
  "\\bTBD\\b",
  "lorem\\s+ipsum",
];

const rx = (src) => new RegExp(src, 'iu');

/**
 * Banned claims in `text`. `allow` patterns are removed first: they are the narrow phrasings in which a banned word is
 * used to deny the claim ("DiDi never diagnoses", "Does DiDi diagnose?"), which the client's final copy relies on. They
 * are not a general negation filter, so "diagnoses your tongue" and "may help prevent disease" still fail.
 */
export function findClaims(text, { bannedClaims, claimAllow = [] }) {
  let t = text;
  for (const src of claimAllow) t = t.replace(new RegExp(src, 'giu'), ' ');
  const hits = [];
  for (const src of bannedClaims) {
    const m = rx(src).exec(t);
    if (m) hits.push(`"${m[0]}" …${t.slice(Math.max(0, m.index - 30), m.index + m[0].length + 30)}…`);
  }
  return hits;
}

/** Capabilities the app does not have yet (see docs/landing.md). Scanned like claims, minus the testimonials. */
export function findUnsupported(text, { unsupportedCapabilities = [], claimAllow = [] }) {
  return findClaims(text, { bannedClaims: unsupportedCapabilities, claimAllow });
}

/** Template tokens and filler that must never reach a visitor. */
export function findPlaceholders(text, patterns = []) {
  const hits = [];
  for (const src of patterns) {
    const m = rx(src).exec(text);
    if (m) hits.push(`"${m[0]}" …${text.slice(Math.max(0, m.index - 30), m.index + m[0].length + 30)}…`);
  }
  return hits;
}

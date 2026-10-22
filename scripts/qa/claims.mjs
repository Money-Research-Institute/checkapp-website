/**
 * The text rules of the gate, kept out of check.mjs so selftest.mjs can test them on plain strings.
 * The patterns live in budgets.json; this file only applies them.
 */

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

/** Capabilities the app does not have yet (see docs/landing-copy.md). Scanned like claims, minus the testimonials. */
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

/** Share of the letters in `text` that are Cyrillic, or null when there is too little text to judge. */
export function cyrillicShare(text) {
  const letters = text.match(/\p{L}/gu)?.length ?? 0;
  if (letters < 60) return null;
  return (text.match(/\p{Script=Cyrillic}/gu)?.length ?? 0) / letters;
}

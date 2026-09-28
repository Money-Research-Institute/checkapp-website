/** Patterns that break the MDX blog engine or violate wellness compliance */
export const FORBIDDEN_PATTERNS = {
  jsxComponent: /<[A-Z][a-zA-Z]+[\s/>]/g,
  anchorId: /\{#[^}]+\}/,
  internalAnchorLink: /\[([^\]]+)\]\(#[^)]+\)/,
  scriptTag: /<script[\s>]/i,
  h1InBody: /^# [^#]/m,
  yamlBlockTags: /^tags:\s*\n\s*-/m,
  yamlBlockFaq: /^faq:\s*\n\s*-\s*question/m,
  imageJsx: /<Image[\s/>]/,
  keyTakeaways: /<KeyTakeaways/,
  callout: /<Callout/,
  mockAbsatzFiller: /Absatz \d+ vertieft/i,
  medicalDiagnosis:
    /\b(?:(?:can|will|helps?\s+to)\s+diagnos(?:e|is|ing)|diagnos(?:e|is|es|ing)\s+(?:dehydration|disease|illness|conditions?|disorders?)|detects?\s+(?:diseases?|illness(?:es)?|conditions?)|identif(?:y|ies)\s+(?:diseases?|illness(?:es)?|disorders?)|(?:clinical|accurate|medical)\s+diagnosis\s+(?:with|of|for)|diagnosed\s+with\s+(?:dehydration|diabetes|hypertension|cancer|anemia|asthma|influenza|covid(?:-19)?|an?\s+(?:illness|disease|disorder|infection)))\b/i,
  readerDiagnosis:
    /\b(?:you(?:['’]ve|\s+have)\s+been\s+diagnosed\b|(?<!\b(?:if|when|unless|whether)\s+)\byou have\s+(?:got\s+)?(?:a\s+|an\s+)?(?:mild\s+|severe\s+|chronic\s+|clinical\s+)?(?:dehydration|diabetes|hypertension|hypotension|cancer|anemia|asthma|influenza|covid(?:-19)?|infection|disease|illness|disorder|diagnosis)\b)/i,
  cureOrTreatClaim:
    /\b(?:(?:cure|cures|cured|curing|heal|heals|healing)\s+(?:your\s+|the\s+|a\s+|an\s+)?(?:dehydration|disease|illness|condition|disorder|diabetes|cancer|infection|hypertension)|(?:treat|treats|treated|treating)\s+(?:your\s+|the\s+|a\s+|an\s+)?(?:disease|illness|cancer|diabetes|hypertension|infection))\b/i,
  prescriptionClaim:
    /\b(?:prescrib(?:e|es|ed|ing)\s+(?:you|patients?|medication|medicine|drugs?|antibiotics|treatment)|prescription\s+for\s+(?:you|patients?|dehydration|diabetes|hypertension|medication|antibiotics))\b/i,
  medicalDeviceClaim:
    /\b(?:(?:is|are)\s+(?:an?\s+)?FDA[- ]approved(?:\s+(?:medical\s+)?device)?|(?:is|are)\s+(?:a\s+)?medical device|clinically\s+proven\s+to\s+(?:cure|treat|diagnose))\b/i,
  replacesDoctor:
    /\b(?:\b(?:we|this app|checkapp|didi|apps?)\s+(?:can\s+)?replace(?:s)?\s+your\s+doctor|instead\s+of\s+seeing\s+a\s+doctor|no\s+(?:longer\s+)?need\s+(?:to\s+)?(?:see|for)\s+(?:a\s+)?doctor)\b/i,
  guaranteedOutcome:
    /\b(?:guaranteed\s+(?:to\s+)?(?:cure|heal|fix|diagnose)|100\s*%\s+accurate\s+(?:diagnosis|detection)|we\s+guarantee\s+(?:your\s+)?(?:health|hydration|recovery))\b/i,
  fakeExpertAuthor:
    /dr\.\s*(?:jane\s+smith|john\s+doe|sarah\s+wellness)|invented\s+expert|certified\s+medical\s+ai/i,
} as const;

export const FORBIDDEN_PATTERN_MESSAGES: Record<keyof typeof FORBIDDEN_PATTERNS, string> = {
  jsxComponent: 'JSX components found — not allowed in MDX',
  anchorId: 'Anchor IDs {#id} found — not allowed in MDX',
  internalAnchorLink: 'Internal anchor links [text](#id) found — not allowed',
  scriptTag: '<script> tag found — not allowed in MDX',
  h1InBody: 'H1 (# Heading) in article body — not allowed',
  yamlBlockTags: 'YAML block array for tags — use an inline array',
  yamlBlockFaq: 'YAML block array for faq — use list syntax in frontmatter',
  imageJsx: '<Image /> JSX — only ![alt](url) is allowed',
  keyTakeaways: '<KeyTakeaways> component — not allowed',
  callout: '<Callout> component — not allowed',
  mockAbsatzFiller: 'Mock copy-paste filler (Absatz N vertieft) — article invalid',
  medicalDiagnosis: 'Medical diagnosis language — use wellness signals / indicators instead',
  readerDiagnosis: 'Direct reader diagnosis ("you have …") — describe wellness signals instead',
  cureOrTreatClaim: 'Cure or treat claim — describe habits and limits instead',
  prescriptionClaim: 'Prescription language — CheckApp does not prescribe medication',
  medicalDeviceClaim: 'Medical device or FDA claim — CheckApp is a wellness app, not a medical device',
  replacesDoctor: 'Language that replaces professional medical care — not allowed',
  guaranteedOutcome: 'Guaranteed health outcome claim — not allowed',
  fakeExpertAuthor: 'Invented expert author — only canonical CheckApp authors are allowed',
};

export const COMPLIANCE_PATTERN_KEYS = [
  'medicalDiagnosis',
  'readerDiagnosis',
  'cureOrTreatClaim',
  'prescriptionClaim',
  'medicalDeviceClaim',
  'replacesDoctor',
  'guaranteedOutcome',
  'fakeExpertAuthor',
] as const satisfies readonly (keyof typeof FORBIDDEN_PATTERNS)[];

export type CompliancePatternKey = (typeof COMPLIANCE_PATTERN_KEYS)[number];

/** Affirmative claims stay blocked. A nearby "not / never / do not" can excuse only a short compliance phrase. */
const NEGATION_AWARE_KEYS: ReadonlySet<CompliancePatternKey> = new Set([
  'medicalDiagnosis',
  'readerDiagnosis',
  'cureOrTreatClaim',
  'prescriptionClaim',
  'medicalDeviceClaim',
  'replacesDoctor',
  'guaranteedOutcome',
]);

const NEGATION_CUE =
  /\b(?:(?:do|does|did|is|are|was|were|can|will|would|should|must|may|might)\s+not|cannot|can['’]t|don['’]t|doesn['’]t|isn['’]t|aren['’]t|won['’]t|never|without|not|no)\b/gi;

/**
 * Words that may sit between a negation cue and a forbidden span
 * ("do not diagnose or detect disease", "not a medical diagnosis of").
 * Any other word ends the negation, so a later real claim still fails.
 */
const NEGATION_GAP_WORDS = new Set([
  'or',
  'and',
  'a',
  'an',
  'the',
  'any',
  'your',
  'our',
  'my',
  'to',
  'of',
  'for',
  'with',
  'also',
  'even',
  'guaranteed',
  'medical',
  'clinical',
  'accurate',
  'formal',
  'real',
  'actual',
  'standalone',
  'valid',
  'true',
  'direct',
  'official',
  'diagnose',
  'diagnoses',
  'diagnosing',
  'diagnosis',
  'detect',
  'detects',
  'detecting',
  'identify',
  'identifies',
  'identifying',
  'cure',
  'cures',
  'curing',
  'cured',
  'treat',
  'treats',
  'treating',
  'treated',
  'heal',
  'heals',
  'healing',
  'disease',
  'illness',
  'condition',
  'conditions',
  'disorder',
  'disorders',
  'dehydration',
  'diabetes',
  'cancer',
  'hypertension',
]);

function clauseStart(text: string, matchIndex: number): number {
  let start = 0;
  for (let i = matchIndex - 1; i >= 0; i--) {
    const char = text[i];
    if (char === '.' || char === '!' || char === '?' || char === '\n') {
      start = i + 1;
      break;
    }
  }
  return start;
}

function gapAllowsNegation(gap: string): boolean {
  if (gap.length > 96) return false;
  const words = gap
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .split(/\s+/)
    .filter(Boolean);
  if (words.length > 14) return false;
  return words.every((word) => NEGATION_GAP_WORDS.has(word.toLowerCase()));
}

/** True when this span is inside a negated disclaimer or "does not diagnose …" phrase. */
export function isNegatedComplianceSpan(text: string, matchIndex: number): boolean {
  const clause = text.slice(clauseStart(text, matchIndex), matchIndex);
  const cue = new RegExp(NEGATION_CUE.source, 'gi');
  for (const found of clause.matchAll(cue)) {
    const gap = clause.slice((found.index ?? 0) + found[0].length);
    if (gapAllowsNegation(gap)) return true;
  }
  return false;
}

export interface ComplianceHit {
  key: CompliancePatternKey;
  match: string;
  index: number;
}

export function listComplianceHits(content: string): ComplianceHit[] {
  const hits: ComplianceHit[] = [];
  for (const key of COMPLIANCE_PATTERN_KEYS) {
    const pattern = FORBIDDEN_PATTERNS[key];
    const flags = pattern.flags.includes('g') ? pattern.flags : `${pattern.flags}g`;
    const re = new RegExp(pattern.source, flags);
    for (const found of content.matchAll(re)) {
      const index = found.index ?? 0;
      if (NEGATION_AWARE_KEYS.has(key) && isNegatedComplianceSpan(content, index)) continue;
      hits.push({ key, match: found[0], index });
    }
  }
  return hits;
}

export function complianceFailureMessages(content: string): string[] {
  const preview = new Map<CompliancePatternKey, string[]>();
  for (const hit of listComplianceHits(content)) {
    const list = preview.get(hit.key) ?? [];
    if (list.length < 3) list.push(hit.match.replace(/\s+/g, ' ').trim());
    preview.set(hit.key, list);
  }

  const messages: string[] = [];
  for (const key of COMPLIANCE_PATTERN_KEYS) {
    const matched = preview.get(key);
    if (!matched?.length) continue;
    const shown = matched.map((item) => `"${item}"`).join(', ');
    messages.push(`❌ ${FORBIDDEN_PATTERN_MESSAGES[key]} (matched: ${shown})`);
  }
  return messages;
}

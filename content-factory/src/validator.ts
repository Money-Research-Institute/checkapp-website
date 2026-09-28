import fs from 'fs';
import path from 'path';
import {
  FORBIDDEN_PATTERNS,
  complianceFailureMessages,
} from '../config/forbidden-patterns';
import authors from '../config/authors.json';

const CANONICAL_AUTHORS = new Set(authors.map((a) => a.name.toLowerCase()));

const REQUIRED_CTA =
  /Try CheckApp free[\s\S]*?Get CheckApp Free\]\(\/download\/\)/i;

const REQUIRED_DISCLAIMER =
  /general wellness information only|not medical advice/i;

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  stats: {
    wordCountDe: number;
    wordCountEn: number;
    imageCount: number;
    tableCount: number;
    faqCount: number;
    sourceCount: number;
    internalLinks: number;
    externalLinks: number;
    h2Count: number;
    hasEnSection: boolean;
    keywordDensity: number;
    numberedListItems: number;
  };
}

function countTables(text: string): number {
  const lines = text.split('\n');
  let tables = 0;
  let inTable = false;

  for (const line of lines) {
    const isTableLine = line.trim().startsWith('|');
    if (isTableLine && !inTable) {
      tables++;
      inTable = true;
    } else if (!isTableLine) {
      inTable = false;
    }
  }

  return tables;
}

function countKeywordOccurrences(text: string, keyword: string): number {
  const normalized = text.toLowerCase();
  const kw = keyword.toLowerCase().trim();
  if (!kw) return 0;

  if (kw.includes(' ')) {
    const regex = new RegExp(kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
    return (normalized.match(regex) || []).length;
  }

  const words = normalized.split(/\s+/);
  return words.filter((w) => w.replace(/[^\w-]/g, '') === kw).length;
}

function extractParagraphs(body: string): string[] {
  return body
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter(
      (p) =>
        p.length > 80 &&
        !p.startsWith('!') &&
        !p.startsWith('|') &&
        !p.startsWith('#') &&
        !p.startsWith('*') &&
        !p.startsWith('-'),
    );
}

function detectCopyPaste(body: string, label: string): string[] {
  const errors: string[] = [];

  if (FORBIDDEN_PATTERNS.mockAbsatzFiller.test(body)) {
    errors.push(`❌ ${label}: mock copy-paste (Absatz N vertieft) — reject article`);
  }

  const paragraphs = extractParagraphs(body);
  const seen = new Map<string, number>();

  for (const paragraph of paragraphs) {
    const normalized = paragraph.replace(/\s+/g, ' ').toLowerCase();
    const count = (seen.get(normalized) ?? 0) + 1;
    seen.set(normalized, count);

    if (count >= 2) {
      errors.push(
        `❌ ${label}: identical paragraph ${count}x — "${paragraph.slice(0, 72)}…"`,
      );
      break;
    }
  }

  const repeatedOpeners = paragraphs
    .map((p) => p.slice(0, 120).replace(/\s+/g, ' '))
    .filter((opener) => opener.length >= 60);
  const openerCounts = new Map<string, number>();
  for (const opener of repeatedOpeners) {
    const count = (openerCounts.get(opener) ?? 0) + 1;
    openerCounts.set(opener, count);
    if (count >= 3) {
      errors.push(`❌ ${label}: same paragraph opener ${count}x — copy-paste`);
      break;
    }
  }

  return errors;
}

export function validateArticle(
  content: string,
  keyword: string,
  minWordCount: number,
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  const body = content.replace(/^---[\s\S]*?---\n/, '');

  if (FORBIDDEN_PATTERNS.jsxComponent.test(content)) {
    errors.push('❌ JSX components found — not allowed in MDX');
  }
  if (FORBIDDEN_PATTERNS.anchorId.test(content)) {
    errors.push('❌ Anchor IDs {#id} found — not allowed in MDX');
  }
  if (FORBIDDEN_PATTERNS.internalAnchorLink.test(content)) {
    errors.push('❌ Internal anchor links [text](#id) found — not allowed');
  }
  if (FORBIDDEN_PATTERNS.scriptTag.test(content)) {
    errors.push('❌ <script> tag found — not allowed in MDX');
  }
  if (FORBIDDEN_PATTERNS.h1InBody.test(body)) {
    errors.push('❌ H1 (# Heading) in article body — not allowed');
  }
  if (FORBIDDEN_PATTERNS.yamlBlockTags.test(content)) {
    warnings.push('⚠️ YAML block array for tags found — convert to an inline array');
  }
  if (FORBIDDEN_PATTERNS.mockAbsatzFiller.test(content)) {
    errors.push('❌ Mock copy-paste filler in article — publication blocked');
  }

  errors.push(...complianceFailureMessages(content));

  const authorMatch = content.match(/^\s*name:\s*["']?(.+?)["']?\s*$/m);
  if (authorMatch && !CANONICAL_AUTHORS.has(authorMatch[1].trim().toLowerCase())) {
    errors.push(`❌ Author must be a canonical CheckApp author (${[...CANONICAL_AUTHORS].join(', ')})`);
  }

  if (/readTime:\s*["']/m.test(content)) {
    errors.push('❌ readTime must be a number, not a string like "8 min"');
  }

  if (/^titleEn:/m.test(content) || /^descriptionEn:/m.test(content) || /^tagsEn:/m.test(content)) {
    errors.push('❌ Bilingual frontmatter fields (titleEn etc.) are not used in CheckApp contract');
  }

  errors.push(...detectCopyPaste(body, 'EN'));

  if (content.includes('---en---')) {
    errors.push('❌ Bilingual ---en--- marker is not used in the EN-only CheckApp contract');
  }

  const wordCountDe = body.split(/\s+/).filter(Boolean).length;
  const wordCountEn = 0;
  const imageCount = (content.match(/!\[/g) || []).length;
  const tableCount = countTables(body);
  const faqCount = (content.match(/^\s*-\s+question:/gm) || []).length;
  const sourceCount = (content.match(/^\s*-\s+label:/gm) || []).length;
  const internalLinks = (content.match(/\[([^\]]+)\]\(\/blog\//g) || []).length;
  const externalLinks = (content.match(/\[([^\]]+)\]\(https?:\/\//g) || []).length;
  const h2Count = (body.match(/^## /gm) || []).length;
  const numberedListItems = (body.match(/^\d+\.\s+/gm) || []).length;

  const keywordOccurrences = countKeywordOccurrences(body, keyword);
  const keywordDensity = wordCountDe > 0 ? (keywordOccurrences / wordCountDe) * 100 : 0;

  if (wordCountDe < minWordCount) {
    warnings.push(`⚠️ Body too short: ${wordCountDe} words (minimum: ${minWordCount})`);
  }
  if (imageCount < 2) {
    warnings.push(`⚠️ Too few images: ${imageCount} (minimum: 2)`);
  }
  if (tableCount === 0) {
    warnings.push('⚠️ No table found — at least 1 required');
  }
  if (faqCount < 4) {
    warnings.push(`⚠️ Too few FAQ questions: ${faqCount} (minimum: 4)`);
  }
  if (sourceCount < 2) {
    warnings.push(`⚠️ Too few sources: ${sourceCount} (minimum: 2)`);
  }
  if (internalLinks < 1) {
    warnings.push(`⚠️ Few internal blog links: ${internalLinks} (target: 2–3)`);
  }
  if (keywordDensity < 0.3) {
    warnings.push(`⚠️ Keyword density too low: ${keywordDensity.toFixed(2)}%`);
  }
  if (keywordDensity > 2.0) {
    warnings.push(`⚠️ Keyword density too high (keyword stuffing): ${keywordDensity.toFixed(2)}%`);
  }
  if (h2Count < 4) {
    warnings.push(`⚠️ Too few H2 headings: ${h2Count} (target: 5–8)`);
  }
  if (!REQUIRED_DISCLAIMER.test(content)) {
    errors.push('❌ Required disclaimer missing (general wellness information only / not medical advice)');
  }
  if (!REQUIRED_CTA.test(content)) {
    errors.push(
      '❌ Required CTA missing: Try CheckApp free — DIDI turns daily wellness advice into a habit you actually keep. [Get CheckApp Free](/download/)',
    );
  }
  if (numberedListItems < 5) {
    warnings.push(`⚠️ Too few numbered list items: ${numberedListItems} (target: 5+)`);
  }

  const titleMatch = content.match(/^title:\s*["']?(.+?)["']?\s*$/m);
  const descMatch = content.match(/^description:\s*["']?(.+?)["']?\s*$/m);
  if (titleMatch) {
    const len = titleMatch[1].length;
    if (len < 40 || len > 80) {
      warnings.push(`⚠️ title length: ${len} characters (target: 50–70)`);
    }
  }
  if (descMatch) {
    const len = descMatch[1].length;
    if (len < 120 || len > 180) {
      warnings.push(`⚠️ description length: ${len} characters (target: 150–160)`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    stats: {
      wordCountDe,
      wordCountEn,
      imageCount,
      tableCount,
      faqCount,
      sourceCount,
      internalLinks,
      externalLinks,
      h2Count,
      hasEnSection: true,
      keywordDensity,
      numberedListItems,
    },
  };
}

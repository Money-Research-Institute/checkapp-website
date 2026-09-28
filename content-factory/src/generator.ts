import Anthropic from '@anthropic-ai/sdk';
import fs from 'fs';
import path from 'path';
import type { ArticleRequest } from './prompts/types';
import { REQUIRED_DISCLAIMER_TEXT, SAFE_LIMITS_SENTENCE, SYSTEM_PROMPT } from './prompts/system';
import { buildArticlePrompt } from './prompts/article-de';
import { fetchUnsplashImages, CLUSTER_IMAGE_QUERIES } from './images';
import { validateArticle } from './validator';
import { getInternalLinks, selectAuthor } from './queue';
import { computeArticleStats, formatStatsLog } from './stats';
import { generateMockArticle } from './mock-generator';

const LOG_DIR = path.join(__dirname, '../logs');
const MAX_GENERATION_ATTEMPTS = 3;

function getMinWordCount(format: string): number {
  const map: Record<string, number> = {
    'Pillar Guide': 2500,
    Guide: 1800,
    Howto: 1200,
    Explainer: 1500,
    'Trust-Artikel': 1000,
    'Lifestyle-Artikel': 1200,
    'Produkt-Feature': 1000,
  };
  return map[format] || 1500;
}

function enrichRequest(request: ArticleRequest): ArticleRequest {
  const author = request.author ?? selectAuthor(request.cluster, request.category);
  const targetLength = Math.max(request.targetLength, getMinWordCount(request.format));
  const today = new Date().toISOString().split('T')[0];
  const plannedDate = today;
  return { ...request, author, targetLength, plannedDate };
}

function extractMdxContent(raw: string): string {
  const mdxStart = raw.indexOf('---');
  return mdxStart >= 0 ? raw.slice(mdxStart) : raw;
}

function logGeneration(slug: string, data: Record<string, unknown>): void {
  fs.mkdirSync(LOG_DIR, { recursive: true });
  const logPath = path.join(LOG_DIR, `${slug}-${Date.now()}.json`);
  fs.writeFileSync(logPath, JSON.stringify(data, null, 2), 'utf-8');
}

export async function generateArticle(
  request: ArticleRequest,
  options: { mock?: boolean } = {},
): Promise<string> {
  const req = enrichRequest(request);
  const useMock = options.mock || process.env.MOCK_GENERATION === '1';

  const imageQueries =
    CLUSTER_IMAGE_QUERIES[req.cluster] || [req.unsplashQuery || 'wellness hydration lifestyle'];
  const images = await fetchUnsplashImages(imageQueries[0], 3, { excludeSlug: req.slug });

  if (useMock) {
    console.log(`🧪 Mock generation (no Claude API): ${req.slug}...`);
    const articleContent = generateMockArticle(req, images);
    return finalizeArticle(req, articleContent, { mock: true, minWordCount: 600 });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    throw new Error(
      'ANTHROPIC_API_KEY is not set. Use --mock for testing without Claude API.',
    );
  }
  const internalLinks = getInternalLinks(req.slug, 5);

  const userPrompt = buildArticlePrompt(req, images, internalLinks);

  const client = new Anthropic({ apiKey });
  const messages: Anthropic.MessageParam[] = [{ role: 'user', content: userPrompt }];
  let lastErrors: string[] = [];

  for (let attempt = 1; attempt <= MAX_GENERATION_ATTEMPTS; attempt++) {
    console.log(`🤖 Generating article: ${req.slug} (attempt ${attempt}/${MAX_GENERATION_ATTEMPTS})...`);

    const message = await client.messages.create({
      model: process.env.ANTHROPIC_MODEL || 'claude-sonnet-5',
      max_tokens: 16000,
      system: SYSTEM_PROMPT,
      messages,
    });

    const textBlock = message.content.find((b) => b.type === 'text');
    if (!textBlock || textBlock.type !== 'text') {
      throw new Error('No text content in Claude response');
    }

    const articleContent = extractMdxContent(textBlock.text);
    const validation = reviewArticle(req, articleContent, { mock: false });
    if (validation.valid) {
      return articleContent;
    }

    lastErrors = validation.errors;
    if (attempt === MAX_GENERATION_ATTEMPTS) break;

    console.warn(`↩️ Compliance retry ${attempt} for ${req.slug}`);
    messages.push(
      { role: 'assistant', content: textBlock.text },
      { role: 'user', content: complianceRepairPrompt(validation.errors) },
    );
  }

  throw new Error(`Article validation failed: ${lastErrors.join('; ')}`);
}

function complianceRepairPrompt(errors: string[]): string {
  return `The draft failed the wellness compliance validator and was not published.
Rewrite the complete article from scratch. Start directly with ---.

Errors:
${errors.map((error) => `- ${error}`).join('\n')}

Keep this limits sentence:
${SAFE_LIMITS_SENTENCE}

Keep this disclaimer verbatim at the end:
${REQUIRED_DISCLAIMER_TEXT}

Describe wellness signals, hydration indicators, and habits.
Do not state a diagnosis, a prescription, a cure, or a guaranteed health outcome.
Do not write that the reader has a disease.
Do not write "detects disease", "diagnoses dehydration", "medical diagnosis of", "FDA-approved", or "replaces your doctor".`;
}

function reviewArticle(
  req: ArticleRequest,
  articleContent: string,
  meta: { mock: boolean; minWordCount?: number },
): ReturnType<typeof validateArticle> {
  const minWordCount = meta.minWordCount ?? getMinWordCount(req.format);
  const validation = validateArticle(
    articleContent,
    req.keywordEn || req.keywordDe,
    minWordCount,
  );

  if (!validation.valid) {
    console.error('❌ Validation failed:');
    validation.errors.forEach((e) => console.error(e));
    logGeneration(req.slug, { errors: validation.errors, warnings: validation.warnings, mock: meta.mock });
    return validation;
  }

  if (validation.warnings.length > 0) {
    console.warn('⚠️ Warnings:');
    validation.warnings.forEach((w) => console.warn(w));
  }

  const stats = computeArticleStats(articleContent, validation);
  console.log(meta.mock ? '✅ Mock validation passed:' : '✅ Validation passed:');
  console.log(`   ${formatStatsLog(stats)}`);

  logGeneration(req.slug, { stats, warnings: validation.warnings, mock: meta.mock });

  return validation;
}

function finalizeArticle(
  req: ArticleRequest,
  articleContent: string,
  meta: { mock: boolean; minWordCount?: number },
): string {
  const validation = reviewArticle(req, articleContent, meta);
  if (!validation.valid) {
    throw new Error(`Article validation failed: ${validation.errors.join('; ')}`);
  }
  return articleContent;
}

export { getMinWordCount };

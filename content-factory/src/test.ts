import { fetchUnsplashImages } from './images';
import { sendArticleNotification } from './notify';
import { getQueueStats } from './queue';
import { ensureRobotsTxt } from './robots';
import { regenerateSitemap } from './sitemap';
import { validateArticle } from './validator';
import type { ArticleRequest } from './prompts/types';
import fs from 'fs';
import path from 'path';

export async function runIntegrationTests(options: {
  slug?: string;
  skipEmail?: boolean;
}): Promise<void> {
  console.log('\n🧪 Content Factory — Integration Test (no Claude API)\n');

  // 1. Queue
  const stats = getQueueStats();
  console.log('📋 Queue:', stats);

  // 2. Unsplash
  console.log('\n🖼️  Testing Unsplash API...');
  const images = await fetchUnsplashImages('international banking', 2);
  const isPlaceholder = images[0]?.photographer === 'Unsplash';
  console.log(
    isPlaceholder
      ? '⚠️  Using placeholder images (UNSPLASH_ACCESS_KEY missing or API failed)'
      : `✅ Unsplash OK: "${images[0].altText}" by ${images[0].photographer}`,
  );

  // 3. robots + sitemap
  console.log('\n🗺️  Testing sitemap/robots...');
  ensureRobotsTxt();
  const contentDir = path.resolve(process.env.CONTENT_DIR || '../content/blog');
  const slugs = fs.existsSync(contentDir)
    ? fs.readdirSync(contentDir).filter((f) => f.endsWith('.mdx')).map((f) => f.replace('.mdx', ''))
    : [];
  regenerateSitemap(slugs);
  const indexable = slugs.filter((slug) => !slug.toLowerCase().includes('fallback'));
  console.log(`✅ Sitemap: ${indexable.length} indexable blog entries`);

  // 4. Validate existing article
  if (options.slug && fs.existsSync(path.join(contentDir, `${options.slug}.mdx`))) {
    console.log(`\n📄 Validating existing article: ${options.slug}`);
    const content = fs.readFileSync(path.join(contentDir, `${options.slug}.mdx`), 'utf-8');
    const result = validateArticle(content, options.slug.replace(/-/g, ' '), 1200);
    console.log(`   Status: ${result.valid ? '✅ VALID' : '❌ INVALID'} (${result.stats.wordCountDe} DE words)`);
  }

  // 5. Email test
  if (!options.skipEmail) {
    console.log('\n📧 Testing Resend email...');
    if (!process.env.RESEND_API_KEY || !process.env.NOTIFY_EMAIL) {
      console.log('⚠️  Skipped — set RESEND_API_KEY and NOTIFY_EMAIL in .env');
    } else {
      await sendArticleNotification({
        slug: 'test-mock-article-2026',
        titleDe: '🧪 Content Factory Test — Mock-Artikel',
        titleEn: 'Content Factory Test — Mock Article',
        cluster: 'Einlagenarbitrage',
        keywordDe: 'einlagenarbitrage test',
        searchVolDe: 1600,
        wordCountDe: 2500,
        wordCountEn: 2200,
        faqCount: 7,
        publishedDate: new Date().toISOString().split('T')[0],
        coverImage: images[0]?.url ?? '',
        descriptionDe:
          'Dies ist ein Test der Content Factory ohne Claude API. Wenn Sie diese E-Mail sehen, funktioniert Resend.',
      });
      console.log('✅ Test email sent');
    }
  }

  console.log('\n✅ Integration test complete\n');
}

export async function runMockGenerateTest(
  request: ArticleRequest,
  dryRun: boolean,
): Promise<void> {
  const { generateArticle } = await import('./generator');
  const { publishArticle } = await import('./publisher');
  const { addArticleToSitemap } = await import('./sitemap');

  console.log(`\n🧪 Mock generate: ${request.slug}\n`);
  const content = await generateArticle(request, { mock: true });

  if (dryRun) {
    console.log('\n--- MOCK OUTPUT (first 1500 chars) ---\n');
    console.log(content.slice(0, 1500));
    console.log('\n...[truncated]');
    return;
  }

  await publishArticle(request.slug, content, request, false);
  await addArticleToSitemap(request.slug, request.plannedDate, request.priority);
  console.log(`\n🎉 Mock article published: /blog/${request.slug}`);
  console.log('   ⚠️  This is test content — delete or replace when Claude API is available.');
}

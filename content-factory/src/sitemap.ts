import fs from 'fs';
import path from 'path';
import { XMLBuilder, XMLParser } from 'fast-xml-parser';
import { writeLlmsTxt } from './llms';

function getSitemapPath(): string {
  return path.join(process.env.SITE_PUBLIC_DIR || '../public', 'sitemap.xml');
}

function getBaseUrl(): string {
  return (process.env.SITE_BASE_URL || 'https://checkapp.today').replace(/\/$/, '');
}

interface SitemapEntry {
  loc: string;
  lastmod: string;
  changefreq: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority: string;
  'xhtml:link'?: Array<{ '@_rel': string; '@_hreflang': string; '@_href': string }>;
}

function withTrailingSlash(url: string): string {
  return url.endsWith('/') ? url : `${url}/`;
}

/** Fail closed: any blog slug containing "fallback" is a thin duplicate and is not indexable. */
export function isIndexableBlogSlug(slug: string): boolean {
  const normalized = slug.trim().toLowerCase();
  return normalized.length > 0 && !normalized.startsWith('_') && !normalized.includes('fallback');
}

export function isFallbackBlogLoc(loc: string): boolean {
  const match = String(loc).match(/\/blog\/([^/?#]+)/i);
  if (!match) return false;
  try {
    return decodeURIComponent(match[1]).toLowerCase().includes('fallback');
  } catch {
    return match[1].toLowerCase().includes('fallback');
  }
}

function hreflang(url: string): SitemapEntry['xhtml:link'] {
  const loc = withTrailingSlash(url);
  return [
    { '@_rel': 'alternate', '@_hreflang': 'en', '@_href': loc },
    { '@_rel': 'alternate', '@_hreflang': 'x-default', '@_href': loc },
  ];
}

function staticEntries(lastmod: string): SitemapEntry[] {
  const BASE_URL = getBaseUrl();
  const pages: Array<{ path: string; changefreq: SitemapEntry['changefreq']; priority: string }> = [
    { path: '/', changefreq: 'weekly', priority: '1.0' },
    { path: '/blog/', changefreq: 'daily', priority: '0.9' },
    { path: '/how-it-works/', changefreq: 'weekly', priority: '0.8' },
    { path: '/features/', changefreq: 'weekly', priority: '0.8' },
    { path: '/download/', changefreq: 'weekly', priority: '0.8' },
    { path: '/privacy/', changefreq: 'monthly', priority: '0.3' },
    { path: '/terms/', changefreq: 'monthly', priority: '0.3' },
  ];

  return pages.map(({ path, changefreq, priority }) => {
    const url = `${BASE_URL}${path === '/' ? '/' : path}`;
    return {
      loc: withTrailingSlash(url),
      lastmod,
      changefreq,
      priority,
      'xhtml:link': hreflang(url),
    };
  });
}

function buildBlogEntry(
  slug: string,
  lastmod: string,
  priority: 'high' | 'medium' | 'low' = 'medium',
): SitemapEntry {
  const BASE_URL = getBaseUrl();
  const loc = `${BASE_URL}/blog/${slug}/`;
  const priorityMap = { high: '0.85', medium: '0.75', low: '0.6' };

  return {
    loc,
    lastmod,
    changefreq: 'monthly',
    priority: priorityMap[priority],
    'xhtml:link': hreflang(loc),
  };
}

function readSitemap(): { urlset: { url: SitemapEntry[] } } {
  const SITEMAP_PATH = getSitemapPath();
  const sitemap: { urlset: { url: SitemapEntry[] } } = { urlset: { url: [] } };

  if (fs.existsSync(SITEMAP_PATH)) {
    const parser = new XMLParser({ ignoreAttributes: false });
    const parsed = parser.parse(fs.readFileSync(SITEMAP_PATH, 'utf-8'));
    const urls = parsed?.urlset?.url;
    sitemap.urlset.url = Array.isArray(urls) ? urls : urls ? [urls] : [];
  }

  return sitemap;
}

function writeSitemap(sitemap: { urlset: { url: SitemapEntry[] } }): void {
  const SITEMAP_PATH = getSitemapPath();
  sitemap.urlset.url = sitemap.urlset.url.filter((entry) => !isFallbackBlogLoc(entry.loc));
  const builder = new XMLBuilder({
    ignoreAttributes: false,
    format: true,
    indentBy: '  ',
    suppressEmptyNode: true,
  });

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${builder.build(sitemap.urlset)}
</urlset>`;

  fs.mkdirSync(path.dirname(SITEMAP_PATH), { recursive: true });
  fs.writeFileSync(SITEMAP_PATH, xml, 'utf-8');
}

export async function addArticleToSitemap(
  slug: string,
  datePublished: string,
  priority: 'high' | 'medium' | 'low' = 'medium',
): Promise<void> {
  const BASE_URL = getBaseUrl();
  const sitemap = readSitemap();
  const loc = `${BASE_URL}/blog/${slug}/`;

  sitemap.urlset.url = sitemap.urlset.url.filter((u) => u.loc !== loc && !isFallbackBlogLoc(u.loc));

  if (!isIndexableBlogSlug(slug)) {
    writeSitemap(sitemap);
    writeLlmsTxt();
    console.log(`ℹ️ Sitemap excluded non-indexable slug: /blog/${slug}/`);
    return;
  }

  const newEntry = buildBlogEntry(slug, datePublished, priority);
  sitemap.urlset.url.push(newEntry);
  sitemap.urlset.url.sort((a, b) => parseFloat(b.priority) - parseFloat(a.priority));

  writeSitemap(sitemap);
  writeLlmsTxt();
  console.log(`✅ Sitemap updated: added /blog/${slug}/`);
}

export function regenerateSitemap(
  slugs: string[],
  defaultDate: string = new Date().toISOString().split('T')[0],
): void {
  const blogEntries = slugs
    .filter(isIndexableBlogSlug)
    .map((slug) => buildBlogEntry(slug, defaultDate, 'medium'));
  const sitemap = {
    urlset: {
      url: [...staticEntries(defaultDate), ...blogEntries].sort(
        (a, b) => parseFloat(b.priority) - parseFloat(a.priority),
      ),
    },
  };

  writeSitemap(sitemap);
  writeLlmsTxt(slugs);
  console.log(`✅ Sitemap regenerated with ${blogEntries.length} blog entries`);
}

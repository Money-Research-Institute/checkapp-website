import type { Metadata } from 'next';
import { RegionHreflang, RegionPaths, Regions, getRegionCopy, type Locale, type Region } from '@/content/copy';
import { DEFAULT_OG_IMAGE, LOGO_URL, SITE_NAME, SITE_URL } from './constants';

type PageMeta = {
  title: string;
  description: string;
  path: string;
  ogImage?: string;
  /** Thin or duplicate pages (content-factory fallbacks) must not be indexed. */
  noindex?: boolean;
  /** hreflang -> path of the alternate versions of this page (including itself), plus 'x-default'. */
  languages?: Record<string, string>;
  /** Open Graph locale of this page (`en_US`, `ru_RU`). */
  locale?: string;
  /** Open Graph locales of the other versions of this page. */
  alternateLocales?: string[];
};

/**
 * Join a site-relative path with the origin. Leave absolute http(s) URLs alone.
 * Prefixing the origin onto `https://…` produces `https://checkapp.todayhttps//…`
 * after the URL parser collapses the second scheme.
 */
export function absoluteAssetUrl(asset: string): string {
  const trimmed = asset.trim();
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  const origin = SITE_URL.replace(/\/$/, '');
  return `${origin}${trimmed.startsWith('/') ? trimmed : `/${trimmed}`}`;
}

export function createMetadata({
  title,
  description,
  path,
  ogImage = DEFAULT_OG_IMAGE,
  noindex = false,
  languages,
  locale,
  alternateLocales,
}: PageMeta): Metadata {
  const url = absoluteAssetUrl(path);
  const image = absoluteAssetUrl(ogImage);

  return {
    title,
    description,
    alternates: {
      canonical: url,
      ...(languages
        ? { languages: Object.fromEntries(Object.entries(languages).map(([lang, href]) => [lang, absoluteAssetUrl(href)])) }
        : {}),
    },
    ...(noindex
      ? {
          robots: {
            index: false,
            follow: true,
            googleBot: { index: false, follow: true },
          },
        }
      : {}),
    openGraph: {
      title,
      description,
      url,
      siteName: SITE_NAME,
      type: 'website',
      ...(locale ? { locale } : {}),
      ...(alternateLocales?.length ? { alternateLocale: alternateLocales } : {}),
      images: [{ url: image, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
    },
  };
}

export function breadcrumbSchema(items: { name: string; path: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${SITE_URL}${item.path}`,
    })),
  };
}

/**
 * Structured data stays in English (it is for crawlers, not for the page's reader). The only thing that follows the page is
 * `inLanguage` on the app, so a Russian page says it is Russian.
 */
export function organizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    url: SITE_URL,
    logo: LOGO_URL,
    contactPoint: {
      '@type': 'ContactPoint',
      email: 'hello@checkapp.today',
      contactType: 'customer support',
    },
  };
}

export function mobileApplicationSchema(locale: Locale = 'en') {
  return {
    '@context': 'https://schema.org',
    '@type': 'MobileApplication',
    name: SITE_NAME,
    inLanguage: locale,
    description:
      'A wellness companion app: take a photo of your tongue, face or iris and DiDi shares a short wellness insight, only when you ask. Not a medical device.',
    applicationCategory: 'HealthApplication',
    operatingSystem: 'Android',
    image: LOGO_URL,
    // No `offers`: no price is set yet (docs/landing-copy.md), so none is declared.
    // No aggregateRating and no Review markup: there are no verified ratings or testimonials yet
    // (docs/landing-decisions.md D1, D2).
  };
}

/** The Open Graph locale of each landing page. */
const OgLocale: Record<Region, string> = { us: 'en_US', eu: 'en_IE', gulf: 'en_AE', ru: 'ru_RU' };

/** The <title> of each landing page (docs/landing-copy.md: wordmark first, then DiDi in the page's language). */
const LandingTitle: Record<Locale, string> = {
  en: 'checkapp · DiDi, your digital health companion',
  ru: 'checkapp · DiDi, цифровой друг твоего здоровья',
};

/**
 * Metadata of a landing page (`/`, `/eu/`, `/gulf/`, `/ru/`): the hero subheadline as description, a canonical to its own
 * URL, hreflang alternates for the four pages plus x-default (the US page, `/`) and its Open Graph locale.
 */
export function landingMetadata(region: Region): Metadata {
  const copy = getRegionCopy(region);
  const languages: Record<string, string> = { 'x-default': RegionPaths.us };
  for (const r of Regions) languages[RegionHreflang[r]] = RegionPaths[r];
  return createMetadata({
    title: LandingTitle[copy.locale],
    description: copy.hero.subheadline,
    path: RegionPaths[region],
    languages,
    locale: OgLocale[region],
    alternateLocales: Regions.filter((r) => r !== region).map((r) => OgLocale[r]),
  });
}

export function faqSchema(faqs: { question: string; answer: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

export function articleSchema(post: {
  title: string;
  description: string;
  slug: string;
  datePublished: string;
  dateModified: string;
  authorName: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.description,
    datePublished: post.datePublished,
    dateModified: post.dateModified,
    author: {
      '@type': 'Person',
      name: post.authorName,
    },
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      logo: {
        '@type': 'ImageObject',
        url: LOGO_URL,
      },
    },
    mainEntityOfPage: `${SITE_URL}/blog/${post.slug}/`,
  };
}

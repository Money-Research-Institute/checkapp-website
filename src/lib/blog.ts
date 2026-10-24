import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const BLOG_DIR = path.join(process.cwd(), 'content/blog');

/** Default byline photo: a 216px WebP (72px at 3x) made from the original portrait. */
export const DEFAULT_AUTHOR_IMAGE = '/pages/blog/ed-musinski-216.webp';

export type BlogAuthor = {
  name: string;
  role: string;
  image?: string;
};

export type BlogFaq = {
  question: string;
  answer: string;
};

export type BlogSource = {
  label: string;
  url: string;
};

export type BlogPostMeta = {
  slug: string;
  title: string;
  description: string;
  datePublished: string;
  dateModified: string;
  author: BlogAuthor;
  category: string;
  tags: string[];
  readTime: number;
  featured?: boolean;
  coverImage?: string;
  faq: BlogFaq[];
  sources: BlogSource[];
  checkedBy?: string;
  /** True for content-factory fallback duplicates and explicit noindex frontmatter. */
  noindex?: boolean;
};

/** Content-factory safe copies use slugs that contain `fallback`. They stay on disk but are not public. */
export function isFallbackSlug(slug: string): boolean {
  return slug.toLowerCase().includes('fallback');
}

export type BlogPost = BlogPostMeta & {
  content: string;
};

function parsePost(filename: string): BlogPost {
  const slug = filename.replace(/\.mdx$/, '');
  const raw = fs.readFileSync(path.join(BLOG_DIR, filename), 'utf8');
  const { data, content } = matter(raw);

  const DEFAULT_AUTHOR: BlogAuthor = {
    name: 'Ed Musinski',
    role: 'Chief Science Consultant',
    image: DEFAULT_AUTHOR_IMAGE,
  };

  // Handle both object and string author formats
  const rawAuthor = data.author;
  let author: BlogAuthor =
    rawAuthor && typeof rawAuthor === 'object'
      ? (rawAuthor as BlogAuthor)
      : {
          name: typeof rawAuthor === 'string' ? rawAuthor : DEFAULT_AUTHOR.name,
          role: 'Wellness Editor',
        };

  // Map legacy team bylines to the scientific consultant
  if (
    author.name === 'CheckApp Wellness Team' ||
    author.name === 'CheckApp Team'
  ) {
    author = DEFAULT_AUTHOR;
  }

  if (!author.image && author.name === DEFAULT_AUTHOR.name) {
    author = { ...author, image: DEFAULT_AUTHOR.image, role: author.role || DEFAULT_AUTHOR.role };
  }

  // Handle both datePublished and date fields
  const datePublished = (data.datePublished ?? data.date ?? new Date().toISOString().slice(0, 10)) as string;
  const dateModified = (data.dateModified ?? data.date ?? datePublished) as string;

  // Handle both category and tags[0]
  const tags = (data.tags as string[] | undefined) ?? [];
  const category = (data.category ?? tags[0] ?? 'wellness') as string;

  const robots = typeof data.robots === 'string' ? data.robots.toLowerCase() : '';
  const noindex =
    isFallbackSlug(slug) ||
    data.noindex === true ||
    data.noindex === 'true' ||
    robots.includes('noindex');

  // Estimate readTime if not provided (avg 200 wpm)
  const readTime = (data.readTime as number | undefined) ?? Math.max(1, Math.ceil(content.trim().split(/\s+/).length / 200));

  return {
    slug,
    title: data.title as string,
    description: data.description as string,
    datePublished,
    dateModified,
    author,
    category,
    tags,
    readTime,
    featured: data.featured as boolean | undefined,
    coverImage: data.coverImage as string | undefined,
    faq: (data.faq as BlogFaq[]) ?? [],
    sources: (data.sources as BlogSource[]) ?? [],
    checkedBy: data.checkedBy as string | undefined,
    noindex,
    content,
  };
}

export function getAllPostSlugs(): string[] {
  if (!fs.existsSync(BLOG_DIR)) return [];

  return fs
    .readdirSync(BLOG_DIR)
    .filter((f) => f.endsWith('.mdx') && !f.startsWith('_'))
    .map((f) => f.replace(/\.mdx$/, ''));
}

export function getAllPosts(): BlogPostMeta[] {
  if (!fs.existsSync(BLOG_DIR)) return [];

  return fs
    .readdirSync(BLOG_DIR)
    .filter((f) => f.endsWith('.mdx') && !f.startsWith('_') && !isFallbackSlug(f.replace(/\.mdx$/, '')))
    .map((f) => {
      const { content, ...meta } = parsePost(f);
      void content;
      return meta;
    })
    .sort(
      (a, b) =>
        new Date(b.datePublished).getTime() - new Date(a.datePublished).getTime(),
    );
}

export function getPostBySlug(slug: string): BlogPost | null {
  const filename = `${slug}.mdx`;
  const filePath = path.join(BLOG_DIR, filename);
  if (!fs.existsSync(filePath)) return null;
  return parsePost(filename);
}

export function getRelatedPosts(slug: string, category: string, limit = 4): BlogPostMeta[] {
  const all = getAllPosts().filter((p) => p.slug !== slug);
  const sameCategory = all.filter((p) => p.category === category);
  const others = all.filter((p) => p.category !== category);

  return [...sameCategory, ...others].slice(0, limit);
}

const FOUR_P_MEDICINE_TAGS = new Set([
  '4p-medicine',
  'predictive-health',
  'preventive-health',
  'preventive-care',
  'participative-health',
  'personalisation',
  'pattern-recognition',
  'patient-empowerment',
]);

/** Articles for the homepage 4P Medicine section — prioritises core explainer first. */
export function getFourPMedicinePosts(limit = 4): BlogPostMeta[] {
  const all = getAllPosts();
  const prioritySlug = '4p-medicine-basics';

  const tagged = all.filter((post) =>
    post.tags.some((tag) => FOUR_P_MEDICINE_TAGS.has(tag.toLowerCase())),
  );

  const priority = tagged.find((p) => p.slug === prioritySlug);
  const rest = tagged
    .filter((p) => p.slug !== prioritySlug)
    .sort(
      (a, b) =>
        new Date(b.datePublished).getTime() - new Date(a.datePublished).getTime(),
    );

  const ordered = priority ? [priority, ...rest] : rest;
  return ordered.slice(0, limit);
}

/**
 * Strip the inline Markdown a heading can carry, so the TOC shows (and the id is built from) what a reader sees:
 * links keep their label, emphasis and code lose their marks.
 */
export function cleanHeadingText(raw: string): string {
  return raw
    .replace(/!?\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/[*`~]+/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * The anchor id for a heading. The MDX `h2` component and `extractHeadings` both go through this, so the TOC links
 * always land on a real id. (The rule is the long-standing one: lower case, letters/digits/hyphens, spaces to hyphens.)
 */
export function headingSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-');
}

export function extractHeadings(content: string): { id: string; text: string }[] {
  const headingRegex = /^## (.+)$/gm;
  const headings: { id: string; text: string }[] = [];
  let match: RegExpExecArray | null;

  while ((match = headingRegex.exec(content)) !== null) {
    const text = cleanHeadingText(match[1]);
    const id = headingSlug(text);
    if (!id) continue;
    headings.push({ id, text });
  }

  return headings;
}

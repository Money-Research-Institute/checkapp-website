import { notFound } from 'next/navigation';
import Link from 'next/link';
import { JsonLd } from '@/components/layout/JsonLd';
import { Section } from '@/components/ui/Section';
import { MdxContent } from '@/components/blog/MdxContent';
import { TableOfContents } from '@/components/blog/TableOfContents';
import { ReadingProgress } from '@/components/blog/ReadingProgress';
import { AuthorBio } from '@/components/blog/AuthorBio';
import { CtaBanner } from '@/components/marketing/CtaBanner';
import { RelatedPosts } from '@/components/blog/RelatedPosts';
import { FaqAccordion } from '@/components/ui/FaqAccordion';
import { BlogInlineCta } from '@/components/blog/BlogInlineCta';
import {
  extractHeadings,
  getAllPostSlugs,
  getPostBySlug,
  getRelatedPosts,
  isFallbackSlug,
} from '@/lib/blog';
import { createMetadata, breadcrumbSchema, articleSchema, faqSchema } from '@/lib/seo';

type PageProps = {
  params: Promise<{ slug: string }>;
};

export const dynamic = 'force-static';

export async function generateStaticParams() {
  return getAllPostSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return {};

  return createMetadata({
    title: post.title,
    description: post.description,
    path: `/blog/${slug}`,
    ogImage: post.coverImage || undefined,
    noindex: post.noindex === true || isFallbackSlug(slug),
  });
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const headings = extractHeadings(post.content);
  const related = getRelatedPosts(slug, post.category, 4);

  const formattedDate = new Date(post.dateModified).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  return (
    <>
      <ReadingProgress />
      <JsonLd
        data={[
          breadcrumbSchema([
            { name: 'Home', path: '/' },
            { name: 'Blog', path: '/blog' },
            { name: post.title, path: `/blog/${slug}` },
          ]),
          articleSchema({
            title: post.title,
            description: post.description,
            slug,
            datePublished: post.datePublished,
            dateModified: post.dateModified,
            authorName: post.author.name,
          }),
          ...(post.faq.length > 0 ? [faqSchema(post.faq)] : []),
        ]}
      />

      <Section variant="warm" className="pt-24 md:pt-28">
        <div className="grid gap-12 lg:grid-cols-[1fr_240px]">
          <article>
            <Link href="/blog" className="text-sm font-semibold text-primary hover:underline">
              ← Back to Blog
            </Link>

            <span className="mt-4 inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              {post.category}
            </span>

            <h1 className="mt-4 font-display text-3xl font-bold md:text-5xl">{post.title}</h1>

            <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-text-secondary">
              <span>Last updated: {formattedDate}</span>
              <span>·</span>
              <span>{post.readTime} min read</span>
              <span>·</span>
              <span>{post.author.name}</span>
            </div>

            <div className="mt-8">
              <MdxContent source={post.content} />
            </div>

            <div className="my-12">
              <BlogInlineCta slug={slug} />
            </div>

            {post.sources.length > 0 && (
              <div className="mt-8 rounded-2xl bg-card p-6">
                <h2 className="font-display text-lg font-bold">Sources</h2>
                <ul className="mt-3 space-y-2">
                  {post.sources.map((s) => (
                    <li key={s.url}>
                      <a href={s.url} target="_blank" rel="noopener noreferrer" className="text-sm text-primary underline">
                        {s.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {post.faq.length > 0 && (
              <div className="mt-12">
                <h2 className="mb-6 font-display text-2xl font-bold">Frequently asked questions</h2>
                <FaqAccordion items={post.faq} page={`blog/${slug}`} />
              </div>
            )}

            <div className="mt-12">
              <AuthorBio
                name={post.author.name}
                role={post.author.role}
                imageSrc={post.author.image}
                checkedBy={post.checkedBy}
              />
            </div>

            <div className="mt-12">
              <RelatedPosts posts={related} />
            </div>

            <div className="mt-12">
              <CtaBanner page={`blog/${slug}`} position="end-article" />
            </div>
          </article>

          <aside className="hidden lg:block">
            <TableOfContents headings={headings} />
          </aside>
        </div>
      </Section>
    </>
  );
}

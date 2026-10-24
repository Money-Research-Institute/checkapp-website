import { notFound } from 'next/navigation';
import { CtaBanner, Container, PageShell, Section } from '@/components/ds';
import { JsonLd } from '@/components/layout/JsonLd';
import { AuthorBio } from '@/components/blog/AuthorBio';
import { BlogInlineCta } from '@/components/blog/BlogInlineCta';
import { MdxContent } from '@/components/blog/MdxContent';
import { PostFaq, PostSources } from '@/components/blog/PostSections';
import { PostHeader } from '@/components/blog/PostHeader';
import { PostLayout } from '@/components/blog/PostLayout';
import { ReadingProgress } from '@/components/blog/ReadingProgress';
import { RelatedPosts } from '@/components/blog/RelatedPosts';
import { TableOfContents } from '@/components/blog/TableOfContents';
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
    path: `/blog/${slug}/`,
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

  return (
    <PageShell>
      <ReadingProgress targetId="post-body" />
      <JsonLd
        data={[
          breadcrumbSchema([
            { name: 'Home', path: '/' },
            { name: 'Blog', path: '/blog/' },
            { name: post.title, path: `/blog/${slug}/` },
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

      <Container as="article">
        <PostLayout
          header={<PostHeader post={post} />}
          aside={headings.length > 0 ? <TableOfContents headings={headings} variant="aside" /> : undefined}
        >
          {headings.length > 0 ? <TableOfContents headings={headings} variant="inline" /> : null}

          <div id="post-body">
            <MdxContent source={post.content} />
          </div>

          <BlogInlineCta slug={slug} />
          <PostSources sources={post.sources} />
          <PostFaq items={post.faq} slug={slug} />
          <AuthorBio
            name={post.author.name}
            role={post.author.role}
            imageSrc={post.author.image}
            checkedBy={post.checkedBy}
          />
        </PostLayout>
      </Container>

      <RelatedPosts posts={related} />

      <Section size="narrow" tight>
        <CtaBanner page={`blog/${slug}`} position="end-article" />
      </Section>
    </PageShell>
  );
}

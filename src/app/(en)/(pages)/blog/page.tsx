import { JsonLd } from '@/components/layout/JsonLd';
import { Section } from '@/components/ui/Section';
import { BlogGrid } from '@/components/blog/BlogGrid';
import { getAllPosts } from '@/lib/blog';
import { createMetadata, breadcrumbSchema } from '@/lib/seo';

export const metadata = createMetadata({
  title: 'CheckApp Blog — Hydration Science, Wellness Habits, Health Tips',
  description:
    'Expert articles on hydration science, AI wellness, daily health habits, and tongue health from the CheckApp team.',
  path: '/blog',
});

export default function BlogPage() {
  const posts = getAllPosts();

  return (
    <>
      <JsonLd
        data={breadcrumbSchema([
          { name: 'Home', path: '/' },
          { name: 'Blog', path: '/blog' },
        ])}
      />

      <Section variant="warm" className="pt-24 md:pt-28">
        <h1 className="font-display text-4xl font-bold md:text-5xl">
          Hydration science, wellness habits, and AI health
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-text-secondary">
          Evidence-based articles to help you stay hydrated, build healthy habits, and understand
          how AI is changing personal wellness.
        </p>
        <div className="mt-12">
          <BlogGrid posts={posts} />
        </div>
      </Section>
    </>
  );
}

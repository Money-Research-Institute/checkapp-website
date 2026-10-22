import { preconnect } from 'react-dom';
import { JsonLd } from '@/components/layout/JsonLd';
import { PageHero, PageShell, Section } from '@/components/ds';
import { BlogGrid } from '@/components/blog/BlogGrid';
import { getAllPosts } from '@/lib/blog';
import { createMetadata, breadcrumbSchema } from '@/lib/seo';

export const metadata = createMetadata({
  title: 'CheckApp Blog — Hydration Science, Wellness Habits, Health Tips',
  description:
    'Expert articles on hydration science, AI wellness, daily health habits, and tongue health from the CheckApp team.',
  path: '/blog/',
});

export default function BlogPage() {
  const posts = getAllPosts();
  // The featured card's cover (the LCP image) comes from Unsplash; open that connection while the HTML is still parsing.
  preconnect('https://images.unsplash.com');

  return (
    <PageShell>
      <JsonLd
        data={breadcrumbSchema([
          { name: 'Home', path: '/' },
          { name: 'Blog', path: '/blog/' },
        ])}
      />

      <PageHero
        eyebrow="The CheckApp blog"
        title="Hydration science, wellness habits, and AI health"
        lede="Evidence-based articles to help you stay hydrated, build healthy habits, and understand how AI is changing personal wellness."
      />

      <Section tight>
        <BlogGrid posts={posts} />
      </Section>
    </PageShell>
  );
}

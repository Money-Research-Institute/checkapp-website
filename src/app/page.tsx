import type { Metadata } from 'next';
import { Experience } from '@/experience/Experience';
import { FamiliarSection } from '@/components/landing/familiar';
import { FaqsSection } from '@/components/landing/faqs';
import { FinalCtaSection } from '@/components/landing/final-cta';
import { HeroSection } from '@/components/landing/hero';
import { ProcessSection } from '@/components/landing/process';
import { ProjectsSection } from '@/components/landing/projects';
import { TestimonialsSection } from '@/components/landing/testimonials';
import { UsualWaySection } from '@/components/landing/usual-way';
import { createMetadata } from '@/lib/seo';

export const metadata: Metadata = createMetadata({
  title: 'CheckApp: your daily wellness companion. Meet DiDi.',
  description:
    'CheckApp turns checking in on your health into a small daily habit. DiDi looks at what you share and tells you what it notices in plain language. A wellness companion, not a medical device.',
  path: '/',
});

/**
 * The landing page: nine sections in design order (the footer is the global one in the root layout), then the lazy
 * experience island. <main> has no top padding; the hero's own padding clears the fixed header.
 * FAQ JSON-LD is emitted by FaqsSection.
 */
export default function HomePage() {
  return (
    <>
      <HeroSection />
      <UsualWaySection />
      <FamiliarSection />
      <ProjectsSection />
      <TestimonialsSection />
      <ProcessSection />
      <FaqsSection />
      <FinalCtaSection />
      <Experience />
    </>
  );
}

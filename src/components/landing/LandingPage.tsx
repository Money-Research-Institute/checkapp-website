import type { SectionProps } from '@/content/copy';
import '@/i18n/typeset-copy'; // Russian typography of the client's copy: runs once, before any section reads it
import { FamiliarSection } from './familiar';
import { FaqsSection } from './faqs';
import { FinalCtaSection } from './final-cta';
import { HeroSection } from './hero';
import { ProcessSection } from './process';
import { ProjectsSection } from './projects';
import { TestimonialsSection } from './testimonials';
import { UsualWaySection } from './usual-way';

/**
 * A landing page (`/`, `/eu/`, `/gulf/`, `/ru/`): the sections in design order, then the lazy experience island.
 *
 * Every region renders the same layout and art; only the strings change. Each section is a server component that takes the
 * region and reads its wording from `src/content/copy` (the client's text) or from its own `copy.ts` (our drafts). The ninth
 * block of the design, the footer, is the global `Footer` that the page's layout (`SiteFrame`) renders after <main>.
 *
 * `<main>` has no top padding; the hero's own padding clears the fixed header. FAQ JSON-LD is emitted by FaqsSection.
 */
export function LandingPage({ region }: SectionProps) {
  return (
    <>
      <HeroSection region={region} />
      <UsualWaySection region={region} />
      <FamiliarSection region={region} />
      <ProjectsSection region={region} />
      {/* H4 (docs/landing-copy.md): the six quotes are English placeholders, and translating them would invent more. */}
      {region === 'ru' ? null : <TestimonialsSection region={region} />}
      <ProcessSection region={region} />
      <FaqsSection region={region} />
      <FinalCtaSection region={region} />
    </>
  );
}

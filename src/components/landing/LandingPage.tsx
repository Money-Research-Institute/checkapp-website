import type { SectionProps } from '@/content/copy';
import '@/i18n/typeset-copy'; // Russian typography of the client's copy: runs once, before any section reads it
import { FaqsSection } from './faqs';
import { FinalCtaSection } from './final-cta';
import { HeroSection } from './hero';
import { ProcessSection } from './process';
import { TestimonialsSection } from './testimonials';

/**
 * A landing page (`/`, `/eu/`, `/gulf/`, `/ru/`): five server-rendered sections, no client engine.
 *
 * Every region renders the same layout and art; only the strings change. Each section takes the region and reads its wording
 * from `src/content/copy` (the client's text) or from its own `copy.ts` (our drafts). Header, footer, phone CTA bar and cookie
 * notice are the global `SiteFrame`, which the page's layout renders around <main>. See docs/landing.md.
 */
export function LandingPage({ region }: SectionProps) {
  return (
    <>
      <HeroSection region={region} />
      <ProcessSection region={region} />
      {/* H4 (docs/landing.md): the quotes are English placeholders, and translating them would invent more. */}
      {region === 'ru' ? null : <TestimonialsSection />}
      <FaqsSection region={region} />
      <FinalCtaSection region={region} />
    </>
  );
}

/**
 * FOUNDATION STUB for the "hero" section. The section task replaces this file; the contract it keeps:
 * a server component with root <section data-section="hero" data-figma-node="2601:12436">, an aria-labelledby heading,
 * never opacity 0, and a height at 1440 within +/-20 % of scripts/qa/figma-sections.json (1225px).
 */
import { APP_DOWNLOAD_URL } from '@/lib/constants';
import { Container } from '@/components/ds/Container';
import { CtaButton } from '@/components/ds/CtaButton';
import { GradientHeading } from '@/components/ds/GradientHeading';

/**
 * The real hero also renders the stage: <Picture data-webgl-poster> + <GlCanvas /> as siblings in one box with a reserved
 * aspect-ratio (see src/experience/GlCanvas.tsx and docs/experience-playbook.md). The hero task adds it.
 */
export function HeroSection() {
  return (
    <section
      data-section="hero"
      data-figma-node="2601:12436"
      aria-labelledby="hero-heading"
      className="relative lg:min-h-[1225px]"
      style={{ paddingTop: 'calc(var(--header-h) + 48px)', paddingBottom: 48 }}
    >
      <Container size="narrow" className="flex flex-col items-center gap-6 text-center">
        <GradientHeading as="h1" size="hero" id="hero-heading" data-critical="headline">
          Meet DiDi, your daily wellness companion
        </GradientHeading>
        <CtaButton
          href={APP_DOWNLOAD_URL}
          size="lg"
          trackingPage="home"
          trackingPosition="hero"
          data-critical="primary-cta"
          data-hides-cta-bar
        >
          Get CheckApp Free
        </CtaButton>
      </Container>
    </section>
  );
}

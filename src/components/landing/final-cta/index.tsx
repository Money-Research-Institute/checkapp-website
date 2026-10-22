/**
 * FOUNDATION STUB for the "final-cta" section. The section task replaces this file; the contract it keeps:
 * a server component with root <section data-section="final-cta" data-figma-node="2601:13109">, an aria-labelledby heading,
 * never opacity 0, and a height at 1440 within +/-20 % of scripts/qa/figma-sections.json (434px).
 */
import type { SectionProps } from '@/content/copy';
import { APP_DOWNLOAD_URL } from '@/lib/constants';
import { Container } from '@/components/ds/Container';
import { CtaButton } from '@/components/ds/CtaButton';
import { GradientHeading } from '@/components/ds/GradientHeading';

/**
 * The card hangs over the footer: z-index above it and a negative bottom margin of --footer-overlap (tokens.css sets
 * the overlap and the footer's runway when this section is on the page). No vertical padding on the section itself.
 */
export function FinalCtaSection({ region }: SectionProps) {
  return (
    <section
      data-section="final-cta"
      data-figma-node="2601:13109"
      aria-labelledby="final-cta-heading"
      className="relative z-[1] lg:min-h-[434px]"
      style={{ marginBottom: 'calc(var(--footer-overlap) * -1)' }}
    >
      <Container size="wide" className="flex flex-col items-center gap-6 py-12 text-center">
        <GradientHeading as="h2" id="final-cta-heading">
          Start your daily check-in with DiDi
        </GradientHeading>
        <CtaButton
          href={APP_DOWNLOAD_URL}
          size="lg"
          trackingPage="home"
          trackingPosition="final-cta"
          data-hides-cta-bar
        >
          Get CheckApp Free
        </CtaButton>
      </Container>
    </section>
  );
}

/**
 * FOUNDATION STUB for the "familiar" section. The section task replaces this file; the contract it keeps:
 * a server component with root <section data-section="familiar" data-figma-node="2601:12718">, an aria-labelledby heading,
 * never opacity 0, and a height at 1440 within +/-20 % of scripts/qa/figma-sections.json (1226px).
 */
import { Container } from '@/components/ds/Container';
import { GradientHeading } from '@/components/ds/GradientHeading';

export function FamiliarSection() {
  return (
    <section
      data-section="familiar"
      data-figma-node="2601:12718"
      aria-labelledby="familiar-heading"
      className="py-16 lg:min-h-[1226px]"
    >
      <Container size="narrow">
        <GradientHeading as="h2" id="familiar-heading">
          Meet DiDi
        </GradientHeading>
      </Container>
    </section>
  );
}

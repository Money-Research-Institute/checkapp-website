/**
 * FOUNDATION STUB for the "usual-way" section. The section task replaces this file; the contract it keeps:
 * a server component with root <section data-section="usual-way" data-figma-node="2601:12628">, an aria-labelledby heading,
 * never opacity 0, and a height at 1440 within +/-20 % of scripts/qa/figma-sections.json (1057px).
 */
import type { SectionProps } from '@/content/copy';
import { Container } from '@/components/ds/Container';
import { GradientHeading } from '@/components/ds/GradientHeading';

export function UsualWaySection({ region }: SectionProps) {
  return (
    <section
      data-section="usual-way"
      data-figma-node="2601:12628"
      aria-labelledby="usual-way-heading"
      className="py-16 lg:min-h-[1057px]"
    >
      <Container size="narrow">
        <GradientHeading as="h2" id="usual-way-heading">
          The usual way to check your health
        </GradientHeading>
      </Container>
    </section>
  );
}

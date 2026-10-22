/**
 * FOUNDATION STUB for the "process" section. The section task replaces this file; the contract it keeps:
 * a server component with root <section data-section="process" data-figma-node="2601:12435">, an aria-labelledby heading,
 * never opacity 0, and a height at 1440 within +/-20 % of scripts/qa/figma-sections.json (2300px).
 */
import { Container } from '@/components/ds/Container';

/** Anchor target of the "How it works" links: id="how-it-works". The Figma frame has no visible heading, so the h2 is sr-only. */
export function ProcessSection() {
  return (
    <section
      id="how-it-works"
      data-section="process"
      data-figma-node="2601:12435"
      aria-labelledby="process-heading"
      className="py-16 lg:min-h-[2300px]"
    >
      <Container size="narrow">
        <h2 id="process-heading" className="sr-only">
          How CheckApp works
        </h2>
      </Container>
    </section>
  );
}

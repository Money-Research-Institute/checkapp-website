/**
 * FOUNDATION STUB for the "projects" section. The section task replaces this file; the contract it keeps:
 * a server component with root <section data-section="projects" data-figma-node="2601:12989">, an aria-labelledby heading,
 * never opacity 0, and a height at 1440 within +/-20 % of scripts/qa/figma-sections.json (810px).
 */
import { Container } from '@/components/ds/Container';
import { GradientHeading } from '@/components/ds/GradientHeading';

export function ProjectsSection() {
  return (
    <section
      data-section="projects"
      data-figma-node="2601:12989"
      aria-labelledby="projects-heading"
      className="py-16 lg:min-h-[810px]"
    >
      <Container size="wide">
        <GradientHeading as="h2" id="projects-heading">
          The future of everyday wellness is 4P
        </GradientHeading>
      </Container>
    </section>
  );
}

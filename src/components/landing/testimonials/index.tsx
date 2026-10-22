/**
 * FOUNDATION STUB for the "testimonials" section. The section task replaces this file; the contract it keeps:
 * a server component with root <section data-section="testimonials" data-figma-node="2601:13023">, an aria-labelledby heading,
 * never opacity 0, and a height at 1440 within +/-20 % of scripts/qa/figma-sections.json (954px).
 */
import { Container } from '@/components/ds/Container';
import { GradientHeading } from '@/components/ds/GradientHeading';

/** Optional in figma-sections.json. The real cards (data-driven, data-verified="false") come from the testimonials task. */
export function TestimonialsSection() {
  return (
    <section
      data-section="testimonials"
      data-figma-node="2601:13023"
      aria-labelledby="testimonials-heading"
      className="py-16 lg:min-h-[954px]"
    >
      <Container size="wide">
        <GradientHeading as="h2" id="testimonials-heading">
          What people say
        </GradientHeading>
      </Container>
    </section>
  );
}

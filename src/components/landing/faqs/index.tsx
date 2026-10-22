/**
 * FOUNDATION STUB for the "faqs" section. The section task replaces this file; the contract it keeps:
 * a server component with root <section data-section="faqs" data-figma-node="2610:30003">, an aria-labelledby heading,
 * never opacity 0, and a height at 1440 within +/-20 % of scripts/qa/figma-sections.json (666px).
 */
import { Container } from '@/components/ds/Container';
import { GradientHeading } from '@/components/ds/GradientHeading';

/** Anchor target id="faqs". The real section emits the FAQPage JSON-LD itself through JsonLd + faqSchema. */
export function FaqsSection() {
  return (
    <section
      id="faqs"
      data-section="faqs"
      data-figma-node="2610:30003"
      aria-labelledby="faqs-heading"
      className="py-16 lg:min-h-[666px]"
    >
      <Container size="wide">
        <GradientHeading as="h2" size="faq" align="left" id="faqs-heading">
          Frequently asked questions
        </GradientHeading>
      </Container>
    </section>
  );
}

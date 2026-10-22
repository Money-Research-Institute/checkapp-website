import { JsonLd } from '@/components/layout/JsonLd';
import { Section } from '@/components/ui/Section';
import { FaqAccordion } from '@/components/ui/FaqAccordion';
import {
  FeatureRow,
  ChatBubbleVisual,
  HydrationMeterVisual,
  VideoCircleVisual,
  StreakVisual,
  NotificationVisual,
  TimelineVisual,
} from '@/components/marketing/FeatureRow';
import { ComparisonTable } from '@/components/marketing/ComparisonTable';
import { PricingCards } from '@/components/marketing/PricingCards';
import { AnswerBlock } from '@/components/marketing/AnswerBlock';
import { createMetadata, breadcrumbSchema, faqSchema } from '@/lib/seo';

export const metadata = createMetadata({
  title: 'CheckApp Features — AI Health Companion, Tongue Analysis',
  description:
    'Explore all CheckApp features: AI chat with DIDI, tongue dehydration analysis, video messages, hydration streaks, push notifications, and more.',
  path: '/features',
});

const FEATURES_FAQ = [
  {
    question: 'What makes CheckApp different from other hydration apps?',
    answer:
      'CheckApp uses DIDI, an AI companion that proactively messages you, analyzes tongue photos, and responds to video messages — not just passive water tracking.',
  },
  {
    question: 'Is the tongue scan medically accurate?',
    answer:
      'Tongue analysis provides wellness guidance based on visual indicators. It is not a medical device and should not replace professional medical advice.',
  },
  {
    question: 'Is there a free tier?',
    answer:
      'Yes. CheckApp is free — we believe everyone deserves access to quality tools for taking care of their health. No credit card required.',
  },
  {
    question: 'What are short video messages?',
    answer:
      'Short video messages are circular video clips you send to DIDI — like voice notes, but visual. DIDI watches and responds with personalised feedback.',
  },
];

export default function FeaturesPage() {
  return (
    <>
      <JsonLd
        data={[
          breadcrumbSchema([
            { name: 'Home', path: '/' },
            { name: 'Features', path: '/features' },
          ]),
          faqSchema(FEATURES_FAQ),
        ]}
      />

      <Section variant="dark" className="pt-24 md:pt-28">
        <h1 className="font-display text-4xl font-bold md:text-5xl">
          Everything you need to actually stay healthy.
        </h1>
        <p className="mt-4 text-xl text-white/70">Not just tracked. Guided.</p>
        <div className="mt-8">
          <AnswerBlock variant="dark">
            CheckApp combines AI daily check-ins, tongue dehydration analysis, short video
            messages, hydration streaks, smart notifications, and health memory — all through a
            conversational interface with DIDI, your personal health companion.
          </AnswerBlock>
        </div>
      </Section>

      <Section variant="warm">
        <div className="space-y-20">
          <FeatureRow
            title="AI Daily Check-ins"
            description="DIDI messages you proactively — morning, afternoon, evening. Not a notification. A real question that waits for your answer."
            visual={<ChatBubbleVisual />}
          />
          <FeatureRow
            title="Tongue Scan Analysis"
            description="Point camera. Tap. Get results in 3 seconds. Powered by Claude Vision AI — analyzes color, texture, moisture."
            visual={<HydrationMeterVisual />}
            reversed
          />
          <FeatureRow
            title="Short Video Messages"
            description="Send a short circular video — like a Telegram video note. DIDI sees you, not just your words."
            visual={<VideoCircleVisual />}
          />
          <FeatureRow
            title="Hydration Streaks"
            description="Build your streak. DIDI celebrates every milestone. Break it? He doesn't judge — he just asks what happened."
            visual={<StreakVisual />}
            reversed
          />
          <FeatureRow
            title="Smart Push Notifications"
            description="DIDI knows when you've been quiet. At 22 hours, he checks in. Never annoying. Always caring."
            visual={<NotificationVisual />}
          />
          <FeatureRow
            title="Health Memory"
            description="DIDI remembers last week's headache, yesterday's water count, and your mood patterns. Getting smarter every day."
            visual={<TimelineVisual />}
            reversed
          />
        </div>
      </Section>

      <Section variant="light">
        <h2 className="mb-8 font-display text-3xl font-bold">How CheckApp compares</h2>
        <ComparisonTable />
      </Section>

      <Section variant="warm">
        <h2 className="mb-8 font-display text-3xl font-bold">Simple, transparent pricing</h2>
        <PricingCards />
      </Section>

      <Section variant="light">
        <h2 className="mb-6 font-display text-2xl font-bold">Frequently asked questions</h2>
        <FaqAccordion items={FEATURES_FAQ} page="features" />
      </Section>
    </>
  );
}

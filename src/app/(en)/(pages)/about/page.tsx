import { SiteImage } from '@/components/ui/SiteImage';
import { JsonLd } from '@/components/layout/JsonLd';
import { Section } from '@/components/ui/Section';
import { CtaBanner } from '@/components/marketing/CtaBanner';
import { FourPMedicine } from '@/components/marketing/FourPMedicine';
import { AnswerBlock } from '@/components/marketing/AnswerBlock';
import { createMetadata, breadcrumbSchema } from '@/lib/seo';
import { HandshakeIcon, LockKeyhole, FlaskConical, CheckCircle2, XCircle } from 'lucide-react';

export const metadata = createMetadata({
  title: 'About CheckApp — The Story Behind DIDI, Your AI Health Companion',
  description:
    'Learn why we built CheckApp and DIDI — the AI health companion that turns wellness tracking into a daily conversation.',
  path: '/about',
});

// TODO: replace with real team photos and bios
const TEAM = [
  { name: 'Alex Rivera', role: 'Founder & CEO', bio: 'Built CheckApp after forgetting to drink water for the 100th time.' },
  { name: 'Morgan Chen', role: 'Head of AI', bio: 'Former ML engineer. Makes DIDI smarter every day.' },
  { name: 'Sam Okonkwo', role: 'Wellness Advisor', bio: 'Registered dietitian. Reviews all health content.' },
];

const VALUES = [
  { Icon: HandshakeIcon, title: 'Care over data',  desc: 'We build for feelings, not metrics.',         accent: 'bg-primary/10 text-primary' },
  { Icon: LockKeyhole,   title: 'Privacy first',    desc: 'Your health data is yours. Always.',          accent: 'bg-forest/10 text-forest' },
  { Icon: FlaskConical,  title: 'Science-backed',   desc: 'Every feature is grounded in research.',      accent: 'bg-accent-amber/10 text-accent-amber' },
];

const CAN_DO = [
  'Help you build hydration habits through daily conversation',
  'Identify patterns and signal potential wellness changes',
  'Remember your check-in history and respond proactively',
  'Respond to video and text messages with lifestyle guidance',
];

const CANNOT_DO = [
  'Diagnose or identify any medical condition',
  'Replace a doctor or licensed healthcare professional',
  'Prescribe treatment or recommend medication',
  'Serve as a medical device or clinical tool',
];

export default function AboutPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbSchema([
          { name: 'Home', path: '/' },
          { name: 'About', path: '/about' },
        ])}
      />

      <Section variant="dark" className="pt-24 md:pt-28">
        <div className="flex flex-col items-center gap-10 md:flex-row">
          <div className="flex-1">
            <h1 className="font-display text-4xl font-bold md:text-5xl">
              We built the health app we wished existed.
            </h1>
            <AnswerBlock>
              CheckApp was born from a simple frustration: every health app showed data but never
              told us what to do about it. DIDI is our answer — an AI companion that turns wellness
              into a daily conversation.
            </AnswerBlock>
          </div>
          <SiteImage
            src="/assets/didi-home-character.png"
            alt="DIDI character illustration representing the CheckApp origin story"
            width={220}
            height={220}
          />
        </div>
      </Section>

      <Section variant="light">
        <h2 className="font-display text-3xl font-bold">Our story</h2>
        <div className="mt-6 max-w-3xl space-y-4 text-lg leading-relaxed text-text-secondary">
          <p>
            It started with a simple frustration. Every health app showed us data but never told us
            what to do about it. We tracked steps, counted calories, logged water — and still felt
            terrible by 3pm every day.
          </p>
          <p>
            The problem wasn&apos;t lack of information. It was lack of conversation. Nobody asked
            &ldquo;how are you feeling?&rdquo; Nobody noticed when we skipped water for six hours.
            Nobody cared when we broke a streak.
          </p>
          <p>
            That&apos;s when DIDI was born — not as a chatbot, but as a health friend who actually
            checks in. Who remembers your patterns. Who celebrates your wins and asks what happened
            when you slip. Who reads your tongue photo and says &ldquo;drink one more glass&rdquo;
            instead of showing a chart.
          </p>
        </div>
      </Section>

      <Section variant="warm">
        <blockquote className="mx-auto max-w-3xl text-center">
          <p className="font-display text-2xl font-bold md:text-3xl">
            &ldquo;At CheckApp, we believe health isn&apos;t a dashboard. It&apos;s a conversation.
            DIDI is how we&apos;re making that real.&rdquo;
          </p>
        </blockquote>
      </Section>

      <Section variant="light">
        <h2 className="font-display text-3xl font-bold">The team</h2>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {TEAM.map((member) => (
            <div key={member.name} className="surface rounded-3xl p-6">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-2xl font-bold text-primary">
                {member.name.charAt(0)}
              </div>
              <h3 className="mt-4 font-display text-xl font-bold">{member.name}</h3>
              <p className="text-sm font-semibold text-primary">{member.role}</p>
              <p className="mt-2 text-text-secondary">{member.bio}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section variant="warm">
        <h2 className="font-display text-3xl font-bold">Our values</h2>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {VALUES.map(({ Icon, title, desc, accent }) => (
            <div
              key={title}
              className="surface rounded-3xl p-6"
            >
              <div className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl ${accent}`}>
                <Icon size={22} />
              </div>
              <h3 className="font-display text-xl font-bold text-text">{title}</h3>
              <p className="mt-2 text-text-secondary">{desc}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section variant="light">
        <h2 className="font-display text-3xl font-bold">What DIDI Can and Cannot Do</h2>
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <div className="rounded-[1.75rem] border border-primary/15 bg-primary/5 p-6">
            <h3 className="mb-4 font-semibold text-primary">DIDI can:</h3>
            <ul className="space-y-3 text-text-secondary">
              {CAN_DO.map((item) => (
                <li key={item} className="flex items-start gap-2.5">
                  <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-primary" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-[1.75rem] border border-black/[0.06] bg-bg-warm p-6">
            <h3 className="mb-4 font-semibold text-text">DIDI cannot:</h3>
            <ul className="space-y-3 text-text-secondary">
              {CANNOT_DO.map((item) => (
                <li key={item} className="flex items-start gap-2.5">
                  <XCircle size={18} className="mt-0.5 shrink-0 text-text-secondary" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      <FourPMedicine />

      <Section variant="light">
        <CtaBanner
          headline="Try DIDI Today"
          subheadline="Join thousands building healthier habits through conversation."
          page="about"
          position="bottom"
        />
      </Section>
    </>
  );
}

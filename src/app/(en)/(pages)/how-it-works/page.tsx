import { SiteImage } from '@/components/ui/SiteImage';
import { JsonLd } from '@/components/layout/JsonLd';
import { Button } from '@/components/ui/Button';
import { Section } from '@/components/ui/Section';
import { AnswerBlock } from '@/components/marketing/AnswerBlock';
import { CtaBanner } from '@/components/marketing/CtaBanner';
import { VideoCircleVisual } from '@/components/marketing/FeatureRow';
import { createMetadata, breadcrumbSchema } from '@/lib/seo';
import { APP_DOWNLOAD_URL } from '@/lib/constants';
import { Sun, Clock, Camera, Moon } from 'lucide-react';

export const metadata = createMetadata({
  title: 'How CheckApp Works — AI Wellness Tracking & Daily Check-ins',
  description:
    'Learn how DIDI, your AI health companion, uses tongue scan analysis, daily check-ins, and video messages to help you build lasting wellness habits.',
  path: '/how-it-works',
});

const ROUTINE = [
  {
    time: '09:00', Icon: Clock, title: 'Morning check-in',
    desc: 'DIDI asks how you feel + water status — with a different question every day.',
    screen: (
      <div className="space-y-2 p-2">
        <div className="flex items-end gap-1.5">
          <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-white text-[8px] font-bold">D</div>
          <div className="max-w-[85%] rounded-xl rounded-bl-sm bg-bubble-didi px-2 py-1.5 text-[9px] leading-relaxed text-text-secondary">
            Good morning! How&apos;s your energy? I&apos;d like a tongue photo today — different angle than yesterday.
          </div>
        </div>
        <div className="flex justify-end">
          <div className="rounded-xl rounded-br-sm bg-bubble-user px-2 py-1.5 text-[9px] text-text-secondary">Feeling okay! 😊</div>
        </div>
        <div className="mt-2 w-full rounded-lg bg-primary py-1.5 text-center text-[9px] font-semibold text-white">Tap to Check Up</div>
      </div>
    ),
  },
  {
    time: '13:00', Icon: Sun, title: 'Midday nudge',
    desc: "DIDI notices if you've had less than 30% of your daily water goal and gently follows up.",
    screen: (
      <div className="space-y-2 p-2">
        <div className="rounded-xl bg-accent-amber/10 px-2.5 py-2 text-[9px] text-forest">
          <p className="font-semibold">⚡ Midday check</p>
          <p className="mt-0.5">You&apos;ve only hit 28% of your water goal. DIDI noticed.</p>
        </div>
        <div className="flex items-end gap-1.5">
          <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-white text-[8px] font-bold">D</div>
          <div className="max-w-[85%] rounded-xl rounded-bl-sm bg-bubble-didi px-2 py-1.5 text-[9px] leading-relaxed text-text-secondary">
            Hey — it&apos;s 1pm and you&apos;re behind on water. Drink a big glass now?
          </div>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-black/10">
          <div className="h-full w-[28%] rounded-full bg-primary" />
        </div>
        <p className="text-[8px] text-text-secondary text-center">28% of daily goal</p>
      </div>
    ),
  },
  {
    time: 'Anytime', Icon: Camera, title: 'Tongue scan',
    desc: 'Available on demand — DIDI signals when a check makes sense based on your patterns.',
    screen: (
      <div className="space-y-2 p-2">
        <p className="text-center text-[9px] font-bold text-text-secondary">Scan Result</p>
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-primary/15 to-bubble-didi shadow-inner">
          <span className="text-2xl">👅</span>
        </div>
        <div className="rounded-xl bg-primary/10 px-2.5 py-2">
          <div className="mb-1 flex justify-between text-[8px]">
            <span className="font-semibold text-primary">Hydration</span>
            <span className="font-bold text-primary">74%</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-black/10">
            <div className="h-full w-[74%] rounded-full bg-primary" />
          </div>
          <p className="mt-1 text-[8px] text-text-secondary">Moderately hydrated. One more glass before dinner.</p>
        </div>
      </div>
    ),
  },
  {
    time: '21:00', Icon: Moon, title: 'Evening summary',
    desc: "DIDI wraps up the day — what went well, what to focus on tomorrow.",
    screen: (
      <div className="space-y-2 p-2">
        <p className="text-[9px] font-bold text-text-secondary">Today&apos;s Summary</p>
        <div className="grid grid-cols-2 gap-1.5">
          {[['Check-ins','3/3','✓'],['Hydration','74%','✓'],['Streak','5 days','🔥'],['Mood','Good','✓']].map(([l,v,i]) => (
            <div key={l} className="rounded-lg bg-bg-warm px-2 py-1.5 text-center">
              <p className="text-[10px] font-bold text-primary">{v} {i}</p>
              <p className="text-[8px] text-text-secondary">{l}</p>
            </div>
          ))}
        </div>
        <div className="flex items-start gap-1.5">
          <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-white text-[8px] font-bold">D</div>
          <div className="rounded-xl rounded-tl-sm bg-bubble-didi px-2 py-1.5 text-[8px] leading-relaxed text-text-secondary">
            Solid day. Tomorrow I&apos;ll ask about sleep quality — it affects hydration too.
          </div>
        </div>
      </div>
    ),
  },
];

const SCAN_STEPS = [
  { step: '1', title: 'Open camera in app', desc: 'Tap the check-in button and select tongue scan.' },
  { step: '2', title: 'Take photo in good light', desc: 'Natural light works best. Hold steady for 2 seconds.' },
  { step: '3', title: 'AI analyzes your tongue', desc: 'Color, coating, moisture → hydration level in seconds.' },
];

const SCIENCE = [
  {
    title: 'Dehydration & cognitive performance',
    desc: 'Mild dehydration of 1-2% body weight impairs cognitive performance by up to 13%.',
    source: 'Journal of Nutrition, 2024',
    url: 'https://pubmed.ncbi.nlm.nih.gov/',
  },
  {
    title: 'Tongue diagnosis in medicine',
    desc: 'Tongue appearance has been used in traditional and modern medicine as a hydration indicator.',
    source: 'NIH / PubMed',
    url: 'https://pubmed.ncbi.nlm.nih.gov/',
  },
  {
    title: 'Habit formation through conversation',
    desc: 'Conversational interfaces increase habit adherence compared to passive tracking alone.',
    source: 'Behavioral Science Research',
    url: 'https://pubmed.ncbi.nlm.nih.gov/',
  },
];

export default function HowItWorksPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbSchema([
          { name: 'Home', path: '/' },
          { name: 'How It Works', path: '/how-it-works' },
        ])}
      />

      <Section variant="dark" className="pt-24 md:pt-28">
        <div className="flex flex-col items-center gap-10 md:flex-row">
          <div className="flex-1">
            <h1 className="font-display text-4xl font-bold md:text-5xl">
              Your wellness routine, rebuilt around conversation.
            </h1>
            <AnswerBlock variant="dark">
              CheckApp works by having DIDI — your AI health companion — proactively check in
              throughout the day, analyze tongue photos for hydration, and respond to short video
              messages with personalised wellness guidance.
            </AnswerBlock>
          </div>
          <SiteImage
            src="/assets/didi-body-home.png"
            alt="DIDI full body illustration with health thought bubbles"
            width={168}
            height={320}
            className="drop-shadow-2xl"
          />
        </div>
      </Section>

      <Section variant="light">
        <h2 className="font-display text-3xl font-bold md:text-4xl">The Daily DIDI Routine</h2>

        {/* Dynamic AI callout */}
        <div className="mt-8 rounded-[1.75rem] border border-primary/20 bg-gradient-to-br from-primary/10 to-primary/5 p-6 md:p-8">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-primary text-white text-lg">
              ✦
            </div>
            <div>
              <p className="font-display text-lg font-bold text-text">
                DIDI&apos;s conversations are different every day
              </p>
              <p className="mt-1.5 text-text-secondary">
                DIDI is a reasoning model, not a static script. Each morning it reads your check-in
                history, hydration trends, and mood to craft a completely fresh conversation — new
                questions, different photo requests, varied tasks. No two days are the same.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {ROUTINE.map((item) => (
            <div key={item.time} className="surface flex flex-col overflow-hidden">
              {/* Phone mockup preview */}
              <div className="bg-bg-warm px-3 pt-3 pb-2">
                {/* Phone chrome mini */}
                <div className="mx-auto max-w-[180px] rounded-2xl border border-black/10 bg-white shadow-md overflow-hidden">
                  <div className="flex h-4 items-center justify-center bg-bg-warm">
                    <div className="h-1.5 w-10 rounded-full bg-black/10" />
                  </div>
                  {item.screen}
                  <div className="flex h-3 items-center justify-center bg-bg-warm">
                    <div className="h-0.5 w-8 rounded-full bg-black/15" />
                  </div>
                </div>
              </div>

              {/* Card text */}
              <div className="p-4">
                <div className="flex items-center gap-2.5 mb-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <item.Icon size={18} />
                  </div>
                  <span className="text-sm font-bold text-primary">{item.time}</span>
                </div>
                <h3 className="font-display text-base font-bold text-text">{item.title}</h3>
                <p className="mt-1 text-sm text-text-secondary">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section variant="warm">
        <h2 className="font-display text-3xl font-bold md:text-4xl">Tongue Scan Technology</h2>
        <p className="mt-4 max-w-2xl text-lg text-text-secondary">
          Mild dehydration affects 75% of adults at some point during the day. A tongue scan gives you
          a quick, at-home signal before symptoms escalate.
        </p>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {SCAN_STEPS.map((s) => (
            <div key={s.step} className="surface p-6">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-white font-bold">
                {s.step}
              </span>
              <h3 className="mt-4 font-display text-xl font-bold">{s.title}</h3>
              <p className="mt-2 text-text-secondary">{s.desc}</p>
            </div>
          ))}
        </div>
        <p className="mt-8 rounded-2xl border border-black/[0.06] bg-card p-4 text-sm text-text-secondary">
          <strong className="text-text">Disclaimer:</strong> DIDI is not a medical device. Results are for personal
          wellness guidance only. Consult a doctor for medical concerns.
        </p>
      </Section>

      <Section variant="light">
        <div className="grid items-center gap-10 md:grid-cols-[1.2fr_0.8fr] md:gap-14">
          <div>
            <h2 className="font-display text-3xl font-bold md:text-4xl">Short Video Messages to DIDI</h2>
            <p className="mt-4 max-w-xl text-lg text-text-secondary">
              Record a short circular video — show your tongue, describe how you feel, or just check
              in visually. DIDI watches and responds with context-aware feedback. Like a video note,
              but for your health.
            </p>
          </div>
          <VideoCircleVisual />
        </div>
      </Section>

      <Section variant="warm">
        <h2 className="font-display text-3xl font-bold md:text-4xl">The Science Behind It</h2>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {SCIENCE.map((s) => (
            <div key={s.title} className="surface p-6">
              <h3 className="font-display text-lg font-bold">{s.title}</h3>
              <p className="mt-2 text-text-secondary">{s.desc}</p>
              <a href={s.url} target="_blank" rel="noopener noreferrer" className="mt-4 inline-block text-sm text-primary underline">
                {s.source} →
              </a>
            </div>
          ))}
        </div>
      </Section>

      <Section variant="light">
        <CtaBanner page="how-it-works" position="bottom" />
      </Section>
    </>
  );
}

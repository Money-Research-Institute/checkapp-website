import Link from 'next/link';
import { JsonLd } from '@/components/layout/JsonLd';
import { CtaBanner, Eyebrow, GlassCard, GradientHeading, PageHero, PageShell, Section, SectionIntro } from '@/components/ds';
import {
  CLIENT,
  CanCannot,
  CompassIcon,
  Disclaimer,
  FourP,
  IconCards,
  LockIcon,
  PAGES,
  PhoneShot,
  SunIcon,
} from '@/components/pages/marketing';
import { breadcrumbSchema, createMetadata } from '@/lib/seo';
import styles from './page.module.css';

const copy = PAGES.about;

export const metadata = createMetadata({
  title: copy.title,
  description: copy.description,
  path: '/about/',
});

/** The first sentence of the client's closing line: "Your health is in your hands — with DiDi in them." */
const PULL_QUOTE = CLIENT.finalCta.split(/(?<=\.)\s+/)[0];

export default function AboutPage() {
  return (
    <PageShell>
      <JsonLd
        data={breadcrumbSchema([
          { name: 'Home', path: '/' },
          { name: 'About', path: '/about/' },
        ])}
      />

      <PageHero eyebrow={copy.hero.eyebrow} title={copy.hero.title} lede={copy.hero.lede} />

      <Section labelledBy="story">
        <div className={styles.story}>
          <div className={styles.storyCopy} data-fx="rise">
            <Eyebrow>{copy.story.eyebrow}</Eyebrow>
            <GradientHeading as="h2" size="section" align="left" id="story" className={styles.storyTitle}>
              {copy.story.title}
            </GradientHeading>
            <div className={styles.prose}>
              {copy.story.paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </div>
          <div className={styles.storyVisual} data-fx="settle">
            <PhoneShot name="home" />
          </div>
        </div>
      </Section>

      <Section size="narrow" tight>
        <GlassCard glow className={styles.quote} data-fx="rise">
          <p className={styles.quoteText}>{PULL_QUOTE}</p>
        </GlassCard>
      </Section>

      <Section labelledBy="values">
        <SectionIntro eyebrow={copy.values.eyebrow} headingId="values" title={copy.values.title} />
        <div className={styles.gap}>
          <IconCards
            items={[
              {
                title: 'Small and daily',
                icon: <SunIcon />,
                text: 'One quick photo and a short wellness read, not a form to fill in. Small enough to do again tomorrow.',
              },
              {
                title: 'Your call',
                icon: <LockIcon />,
                text: (
                  <>
                    You decide what to share and when, and you can delete your data anytime. Read how we handle it in the{' '}
                    <Link href="/privacy/">privacy policy</Link>.
                  </>
                ),
              },
              {
                title: 'Honest about limits',
                icon: <CompassIcon />,
                text: 'DiDi is a wellness companion, not a medical device. We say plainly what it can and cannot do, and we would rather under-promise.',
              },
            ]}
          />
        </div>
      </Section>

      <Section labelledBy="limits">
        <SectionIntro eyebrow={copy.limits.eyebrow} headingId="limits" title={copy.limits.title} lede={copy.limits.lede} />
        <div className={styles.gap}>
          <CanCannot />
        </div>
      </Section>

      <Section>
        <FourP />
      </Section>

      <Section size="narrow" tight>
        <Disclaimer />
      </Section>

      <Section size="narrow">
        <CtaBanner
          headline={copy.cta.headline}
          subheadline={copy.cta.subheadline}
          label={CLIENT.cta}
          page="about"
          position="bottom"
        />
      </Section>
    </PageShell>
  );
}

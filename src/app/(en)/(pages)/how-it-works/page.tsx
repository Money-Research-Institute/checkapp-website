import Link from 'next/link';
import { JsonLd } from '@/components/layout/JsonLd';
import { Button, CtaBanner, CtaButton, PageHero, PageShell, Section, SectionIntro } from '@/components/ds';
import {
  AnswerBlock,
  CLIENT,
  ConsentCard,
  Disclaimer,
  FeatureRow,
  PAGES,
  PhoneShot,
  ScanCards,
  Steps,
} from '@/components/pages/marketing';
import { APP_DOWNLOAD_URL } from '@/lib/constants';
import { breadcrumbSchema, createMetadata } from '@/lib/seo';
import styles from './page.module.css';

const copy = PAGES.howItWorks;

export const metadata = createMetadata({
  title: copy.title,
  description: copy.description,
  path: '/how-it-works/',
});

/** The client's three step sentences, each under a short title of ours. */
const STEPS = CLIENT.steps.map((text, index) => ({ title: copy.steps.titles[index], text }));

export default function HowItWorksPage() {
  return (
    <PageShell>
      <JsonLd
        data={breadcrumbSchema([
          { name: 'Home', path: '/' },
          { name: 'How it works', path: '/how-it-works/' },
        ])}
      />

      <PageHero
        eyebrow={copy.hero.eyebrow}
        title={copy.hero.title}
        lede={CLIENT.subheadline}
        actions={
          <>
            <CtaButton
              href={APP_DOWNLOAD_URL}
              size="lg"
              trackingPage="how-it-works"
              trackingPosition="hero"
              data-critical="primary-cta"
              data-hides-cta-bar
            >
              {CLIENT.cta}
            </CtaButton>
            <Button href="/features/" variant="secondary" trackingPage="how-it-works" trackingPosition="hero-features">
              {copy.hero.secondary}
            </Button>
          </>
        }
      />

      <Section labelledBy="meet-didi">
        <FeatureRow
          as="h2"
          id="meet-didi"
          eyebrow={copy.meet.eyebrow}
          title={copy.meet.title}
          points={copy.meet.points}
          visual={<PhoneShot name="home" />}
        >
          <AnswerBlock label="Meet DiDi">{CLIENT.meetDidi}</AnswerBlock>
        </FeatureRow>
      </Section>

      <Section labelledBy="three-steps">
        <FeatureRow
          as="h2"
          id="three-steps"
          eyebrow={copy.steps.eyebrow}
          title={copy.steps.title}
          visual={<PhoneShot name="scan" />}
          reversed
        >
          <Steps steps={STEPS} />
        </FeatureRow>
      </Section>

      <Section labelledBy="scans">
        <SectionIntro eyebrow={copy.scans.eyebrow} headingId="scans" title={copy.scans.title} lede={copy.scans.lede} />
        <div className={styles.gap}>
          <ScanCards />
        </div>
      </Section>

      <Section labelledBy="your-data">
        <FeatureRow
          as="h2"
          id="your-data"
          eyebrow={copy.data.eyebrow}
          title={copy.data.title}
          visual={<ConsentCard points={copy.data.points} />}
        >
          <p>{CLIENT.dataConsent}</p>
          <p>
            <Link href="/privacy/">{copy.data.privacy}</Link>
          </p>
        </FeatureRow>
      </Section>

      <Section size="narrow" tight>
        <Disclaimer />
      </Section>

      <Section size="narrow">
        <CtaBanner
          headline={PAGES.closing.headline}
          subheadline={PAGES.closing.subheadline}
          label={CLIENT.cta}
          page="how-it-works"
          position="bottom"
        />
      </Section>
    </PageShell>
  );
}

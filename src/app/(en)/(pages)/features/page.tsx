import Link from 'next/link';
import { JsonLd } from '@/components/layout/JsonLd';
import { Button, CtaBanner, CtaButton, Faq, PageHero, PageShell, Section, SectionIntro } from '@/components/ds';
import {
  AnswerBlock,
  CLIENT,
  ComparisonTable,
  Disclaimer,
  FeatureRow,
  IconCards,
  LockIcon,
  PAGES,
  PhoneShot,
  ScanCards,
  TapIcon,
  TrashIcon,
} from '@/components/pages/marketing';
import { APP_DOWNLOAD_URL } from '@/lib/constants';
import { breadcrumbSchema, createMetadata, faqSchema } from '@/lib/seo';
import styles from './page.module.css';

const copy = PAGES.features;

export const metadata = createMetadata({
  title: copy.title,
  description: copy.description,
  path: '/features/',
});

/**
 * The FAQ is the client's own five questions (src/content/copy/us.ts). The price question appears only once the client gives a
 * price (docs/landing-copy.md H2), so today there are four. D5: nothing is for sale in the app yet, so there is no plan
 * question and no "free" claim either.
 */
const FAQ = CLIENT.faq.map(({ question, answer }) => ({ question, answer }));

export default function FeaturesPage() {
  return (
    <PageShell>
      <JsonLd
        data={[
          breadcrumbSchema([
            { name: 'Home', path: '/' },
            { name: 'Features', path: '/features/' },
          ]),
          faqSchema(FAQ),
        ]}
      />

      <PageHero
        eyebrow={copy.hero.eyebrow}
        title={copy.hero.title}
        lede={CLIENT.whatItDoes}
        actions={
          <>
            <CtaButton
              href={APP_DOWNLOAD_URL}
              size="lg"
              trackingPage="features"
              trackingPosition="hero"
              data-critical="primary-cta"
              data-hides-cta-bar
            >
              {CLIENT.cta}
            </CtaButton>
            <Button href="/how-it-works/" variant="secondary" trackingPage="features" trackingPosition="hero-how">
              {copy.hero.secondary}
            </Button>
          </>
        }
      />

      <Section size="narrow" tight>
        <AnswerBlock>{copy.answer}</AnswerBlock>
      </Section>

      <Section labelledBy="scans">
        <SectionIntro eyebrow={copy.scans.eyebrow} headingId="scans" title={copy.scans.title} lede={copy.scans.lede} />
        <div className={styles.gap}>
          <ScanCards />
        </div>
      </Section>

      <Section labelledBy="inside">
        <SectionIntro
          eyebrow={copy.inside.eyebrow}
          headingId="inside"
          title={copy.inside.title}
          lede={copy.inside.lede}
        />
        <div className={`${styles.gap} ${styles.rows}`}>
          <FeatureRow title={copy.inside.daily.title} points={copy.inside.daily.points} visual={<PhoneShot name="home" />}>
            <p>{copy.inside.daily.text}</p>
          </FeatureRow>

          <FeatureRow
            title={copy.inside.insight.title}
            points={copy.inside.insight.points}
            visual={<PhoneShot name="scan" />}
            reversed
          >
            <p>{copy.inside.insight.text}</p>
          </FeatureRow>
        </div>
      </Section>

      <Section labelledBy="terms">
        <SectionIntro eyebrow={copy.terms.eyebrow} headingId="terms" title={copy.terms.title} lede={copy.terms.lede} />
        <div className={styles.gap}>
          <IconCards
            items={[
              {
                title: 'Only when you ask',
                icon: <TapIcon />,
                text: 'checkapp only scans when you take a photo. Nothing runs in the background.',
              },
              {
                title: 'Permission first',
                icon: <LockIcon />,
                text: 'Your photos are processed in the cloud only with your permission. Face and iris images are biometric data, so we ask first.',
              },
              {
                title: 'Delete anytime',
                icon: <TrashIcon />,
                text: (
                  <>
                    You can delete your data anytime. Read how we handle it in the <Link href="/privacy/">privacy policy</Link>.
                  </>
                ),
              },
            ]}
          />
        </div>
      </Section>

      <Section labelledBy="compare">
        <SectionIntro
          eyebrow={copy.compare.eyebrow}
          headingId="compare"
          title={copy.compare.title}
          lede={copy.compare.lede}
        />
        <div className={styles.gap}>
          <ComparisonTable />
        </div>
      </Section>

      <Section size="narrow" labelledBy="faq">
        <SectionIntro eyebrow={copy.faq.eyebrow} headingId="faq" title={copy.faq.title} />
        <div className={styles.gap}>
          <Faq items={FAQ} page="features" group="features-faq" />
        </div>
      </Section>

      <Section size="narrow" tight>
        <Disclaimer />
      </Section>

      <Section size="narrow">
        <CtaBanner
          headline={PAGES.closing.headline}
          subheadline={PAGES.closing.subheadline}
          label={CLIENT.cta}
          page="features"
          position="bottom"
        />
      </Section>
    </PageShell>
  );
}

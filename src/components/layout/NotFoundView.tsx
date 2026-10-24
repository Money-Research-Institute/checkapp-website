import { CtaButton } from '@/components/ds/CtaButton';
import { PageHero, PageShell } from '@/components/ds/Section';
import type { Locale } from '@/content/copy';
import { getDict } from '@/i18n';

/** The 404 body in the shell's language. The shell, header and footer around it come from `SiteFrame`. */
export function NotFoundView({ locale }: { locale: Locale }) {
  const dict = getDict(locale).notFound;
  return (
    <PageShell>
      <PageHero
        eyebrow={dict.eyebrow}
        title={dict.title}
        lede={dict.lede}
        actions={
          <CtaButton href="/" size="lg" trackingPage="not-found" trackingPosition="hero">
            {dict.back}
          </CtaButton>
        }
      />
    </PageShell>
  );
}

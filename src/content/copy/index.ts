import { eu } from './eu';
import { gulf } from './gulf';
import { ru } from './ru';
import { us } from './us';
import { withPrice } from './pricing';
import type { FaqEntry, Locale, Region, RegionCopy } from './types';

export type { FaqEntry, Locale, Region, RegionCopy, SectionProps } from './types';
export { Prices, withPrice } from './pricing';

/**
 * Show the US sentence "The name comes from “Digital Diagnostic” — but DiDi never diagnoses." Held back until the client
 * confirms it (docs/landing-copy.md H1). The quality gate rejects the word "diagnostic" on the page, so turning this on also
 * needs a reviewed change to the gate.
 */
export const SHOW_NAME_ORIGIN = false;

const Copies: Record<Region, RegionCopy> = { us, eu, gulf, ru };

export const Regions: readonly Region[] = ['us', 'eu', 'gulf', 'ru'];

/** The landing page of each region. `/` is the US page and the default for everyone else. */
export const RegionPaths: Record<Region, string> = { us: '/', eu: '/eu/', gulf: '/gulf/', ru: '/ru/' };

/** The label of each region in its own language, for the footer switcher. */
export const RegionLabels: Record<Region, string> = { us: 'United States', eu: 'Europe', gulf: 'Gulf', ru: 'Русский' };

/** hreflang of each landing page. The three English pages differ by market, not by language. */
export const RegionHreflang: Record<Region, string> = { us: 'en-US', eu: 'en-IE', gulf: 'en-AE', ru: 'ru' };

export const getRegionCopy = (region: Region): RegionCopy => Copies[region];
export const localeOf = (region: Region): Locale => Copies[region].locale;

/** The "Meet DiDi" paragraph the page may show. */
export function meetDidiText(region: Region): string {
  const { text, withoutNameOrigin } = Copies[region].meetDidi;
  return SHOW_NAME_ORIGIN ? text : (withoutNameOrigin ?? text);
}

/** The hero small print, or null while the region has no price. */
export const subscriptionLine = (region: Region): string | null => withPrice(Copies[region].subscription, region);

/** The FAQ the page may show: entries that quote a price are dropped until the region has one. */
export function faqEntries(region: Region): FaqEntry[] {
  return Copies[region].faq
    .map((f) => {
      if (!f.needsPrice) return f;
      const answer = withPrice(f.answer, region);
      return answer === null ? null : { ...f, answer };
    })
    .filter((f): f is FaqEntry => f !== null);
}

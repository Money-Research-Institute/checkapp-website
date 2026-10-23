import { FAQS_COPY } from '@/components/landing/faqs/copy';
import { finalCtaCopy } from '@/components/landing/final-cta/copy';
import { heroCopy } from '@/components/landing/hero/copy';
import { PROCESS_COPY } from '@/components/landing/process/copy';
import { getRegionCopy, Regions } from '@/content/copy';
import { typesetInPlace } from './typeset';

/**
 * Imported for its effect, by everything that renders the text of a landing page (`SiteFrame`, `LandingPage`, the Russian
 * download page): the first import runs the typography step (typeset.ts) over
 *   - the client's copy of every region, `getRegionCopy(region)`, which nobody edits (English regions: a dash stays with the word
 *     before it; Russian: that, plus the short words that never end a line), and
 *   - the drafts of every landing section (`src/components/landing/<slug>/copy.ts`), `en` and `ru`,
 * in place, so each string gets its no-break spaces once, and no section has to remember it or retype a string.
 * A module runs once per process and the step is idempotent, so importing it from several places is safe. A new section with
 * text of its own adds its copy to the list.
 */
for (const region of Regions) {
  const copy = getRegionCopy(region);
  typesetInPlace(copy, copy.locale);
}
for (const copy of [FAQS_COPY, finalCtaCopy, heroCopy, PROCESS_COPY]) {
  typesetInPlace(copy.en, 'en');
  typesetInPlace(copy.ru, 'ru');
}

export {};

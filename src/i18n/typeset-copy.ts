import { familiarCopy } from '@/components/landing/familiar/copy';
import { FAQS_COPY } from '@/components/landing/faqs/copy';
import { finalCtaCopy } from '@/components/landing/final-cta/copy';
import { heroCopy } from '@/components/landing/hero/copy';
import { PROCESS_COPY } from '@/components/landing/process/copy';
import { projectsCopy } from '@/components/landing/projects/copy';
import { COPY as usualWayCopy } from '@/components/landing/usual-way/copy';
import { getRegionCopy } from '@/content/copy';
import { typesetInPlace } from './typeset';

/**
 * Imported for its effect, by everything that renders the Russian text of a landing page (`SiteFrame`, `LandingPage`, the Russian
 * download page): the first import runs the Russian typography step (typeset.ts) over
 *   - the client's Russian copy, `getRegionCopy('ru')`, which nobody edits, and
 *   - the Russian drafts of every landing section (`src/components/landing/<slug>/copy.ts`),
 * in place, so each string gets its no-break space before a dash once, and no section has to remember it or retype a string.
 * A module runs once per process and the step is idempotent, so importing it from several places is safe. A new section with
 * Russian text of its own adds its `copy.ru` to the list.
 */
for (const copy of [getRegionCopy('ru')]) typesetInPlace(copy);
for (const copy of [familiarCopy, FAQS_COPY, finalCtaCopy, heroCopy, PROCESS_COPY, projectsCopy, usualWayCopy]) {
  typesetInPlace(copy.ru);
}

export {};

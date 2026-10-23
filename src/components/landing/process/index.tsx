/**
 * "How it works": three numbered steps, each a phone and ONE sentence. Plain DOM + CSS, no client code.
 *
 * Words: each step is the client's sentence (`howItWorks` in src/content/copy, one per region); the only thing added to it is its
 * number, drawn as the Figma raster numeral. The sentence is the step's <h3>. The sr-only h2 and the phone alt text are in ./copy.ts.
 *
 * Art (public/landing/process, written by scripts/assets/encode.mjs): phone-<n>-<w> (English screens) and phone-<n>-ru-<w> (the
 * Russian screens, used on /ru/), numeral-<n>-<w>. The UI text inside the phones is pixels, so the claims scan cannot read it:
 * whoever swaps a screen re-reads it (photo not video, no verdict on the body, "DiDi" not "DIDI"; docs/landing.md).
 *
 * Markup: an <ol> of three <li>, each with a <picture> phone, an aria-hidden numeral and the <h3>.
 */
import { getRegionCopy, localeOf } from '@/content/copy';
import type { SectionProps } from '@/content/copy';
import { Picture } from '@/components/ds/Picture';
import { PROCESS_COPY } from './copy';
import s from './Process.module.css';

/** Encoded widths (the largest is the intrinsic size) and intrinsic size of each step's art. */
const STEPS = [
  { phone: { widths: [640, 1024], width: 1024, height: 1536 }, numeral: { width: 123, height: 284 } },
  { phone: { widths: [430, 860], width: 860, height: 1829 }, numeral: { width: 216, height: 291 } },
  { phone: { widths: [640, 1024], width: 1024, height: 1536 }, numeral: { width: 225, height: 297 } },
] as const;

export function ProcessSection({ region }: SectionProps) {
  const sentences = getRegionCopy(region).howItWorks;
  const locale = localeOf(region);
  const copy = PROCESS_COPY[locale];
  return (
    <section id="how-it-works" data-section="process" aria-labelledby="process-heading" className={s.root}>
      <h2 id="process-heading" className="sr-only">
        {copy.heading}
      </h2>
      <ol className={s.steps}>
        {STEPS.map(({ phone, numeral }, i) => {
          const n = i + 1;
          return (
            <li key={n} className={s.step}>
              <Picture
                base={`/landing/process/phone-${n}${locale === 'ru' ? '-ru' : ''}`}
                widths={[...phone.widths]}
                sizes="(min-width: 900px) 420px, 340px"
                width={phone.width}
                height={phone.height}
                alt={copy.phones[i]}
                className={s.phone}
              />
              <div className={s.copy}>
                <Picture
                  base={`/landing/process/numeral-${n}`}
                  widths={[numeral.width]}
                  width={numeral.width}
                  height={numeral.height}
                  alt=""
                  aria-hidden="true"
                  className={s.numeral}
                />
                <h3 className={s.text}>{sentences[i]}</h3>
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

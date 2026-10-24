/**
 * The global footer (Figma "10-footer", node 2601:12661, 1440 x 740). A server component rendered on every route by
 * the root layout; the landing page is the context Figma designs, the other routes inherit it with a shorter runway.
 *
 * Plain DOM over a baked, dithered glow poster. Nothing here is a canvas and nothing moves the text:
 *  - the glow is one AVIF/WebP (public/landing/footer: Figma's 1586x992 fill, flipped X and cropped to the 1097x564 window
 *    Figma shows, 10-bit AVIF 6.6 KB), a black veil that reproduces Figma's 179.96deg black-to-transparent overlay, and the
 *    runtime `.fx-dither` noise tile (AVIF smooths baked-in noise away, so the dither lives in CSS);
 *  - a scroll-linked rise (view() timeline, compositor-only) brings the glow from 64px low and 30 % dimmer to exactly
 *    Figma's resting frame as the page ends, so the brightest the glow ever gets is the sampled #2E7034 peak and text
 *    contrast is the same at the end state as in the design. Without view() timelines, or under reduced motion, the
 *    page simply shows that resting frame.
 *  - ultrawide: the layer stops growing at 2500px (the width of Figma's own glow frame) and its sides ease out to black
 *    with a long mask, so a 3440px screen gets a soft pool of light, never a stretched bar. The row of links stays in the
 *    centred 1320px column and the type grows a notch (15px from 2560, 16px from 3000).
 *
 * Deviations from Figma, all on purpose (docs/landing.md):
 *  - D1: the tagline says only what the app does today (Figma: "monitors hydration signals"), and the medical
 *    disclaimer strip the old footer carried is kept as <p data-disclaimer>. Figma drops it. The disclaimer is the client's
 *    wording for the page's region (src/content/copy); pages that are not a landing page show the US one.
 *  - D4: Manrope everywhere; Bricolage Grotesque is the wordmark only. The column headings are Manrope 600.
 *  - D7: the logo is the shared LogoMark (the 3D DiDi tile), never the flat Figma glyph.
 *  - Contrast: Figma's white/.4 headings and white/.5 legal row fail AA over the glow (about 3.8:1), so they are
 *    raised (see footer.module.css). axe cannot judge text over gradients, so this was measured, not assumed.
 *  - Targets: Figma's 28px link pitch is kept only on a fine pointer from 1100px; everywhere else every link is 44px.
 *
 * Regions and languages (docs/landing.md): the footer is the same component on every route, in the page's language
 * (src/i18n). On a landing page it also carries the region switcher, real links to the four landing pages (each label in its
 * own language, hreflang on each, the current one aria-current="page"). The Russian page links to pages that exist in
 * English only (privacy, terms, blog, ...): those links say so with a visible "EN" tag, hreflang="en" and a spoken "page in
 * English". "How it works" goes to its section of the Russian landing page instead (`shellLink`).
 *
 * The three link groups are <nav>s labelled by their visible headings; the duplicate legal links in the bottom bar are
 * hidden (display: none, so out of the accessibility tree too) on phones, where they would only repeat the Company column.
 */
import Link from 'next/link';
import type { CSSProperties } from 'react';
import { LogoMark } from '@/components/brand/LogoMark';
import { Container } from '@/components/ds/Container';
import { Picture } from '@/components/ds/Picture';
import {
  RegionHreflang,
  RegionLabels,
  RegionPaths,
  Regions,
  getRegionCopy,
  localeOf,
  type Locale,
  type Region,
} from '@/content/copy';
import { fill, getDict, type Dict } from '@/i18n';
import { SITE_NAME, SOCIAL_LINKS } from '@/lib/constants';
import { shellLink } from '@/lib/paths';
import styles from './footer/footer.module.css';
import { COMPANY_LINKS, CONNECT_LINKS, LEGAL_LINKS, PRODUCT_LINKS, type FooterLinkItem } from './footer/links';

const YEAR = new Date().getFullYear();

/** The page gutter, never narrower than the notch / rounded-corner inset of a landscape phone. */
const SAFE_GUTTER: CSSProperties = {
  paddingInline:
    'max(var(--gutter), env(safe-area-inset-left, 0px)) max(var(--gutter), env(safe-area-inset-right, 0px))',
};

type LinkContext = {
  dict: Dict['footer'];
  /** The page's language: on a Russian page a link to a page that exists in English only is marked "EN" (see `shellLink`). */
  locale: Locale;
};

function FooterLink({ item, className, ctx }: { item: FooterLinkItem; className: string; ctx: LinkContext }) {
  const label = item.label === 'email' ? SOCIAL_LINKS.contact.replace(/^mailto:/, '') : ctx.dict[item.label];
  if (item.kind === 'external') {
    return (
      <a href={item.href} className={className} target="_blank" rel="noopener noreferrer">
        {label}
        <span className={styles.sr}> ({ctx.dict.opensInNewTab})</span>
      </a>
    );
  }
  if (item.kind === 'mail') {
    return (
      <a href={item.href} className={className}>
        {label}
      </a>
    );
  }
  const target = shellLink(item.href, ctx.locale);
  return (
    <Link href={target.href} prefetch={item.prefetch} className={className} hrefLang={target.english ? 'en' : undefined}>
      {label}
      {target.english ? (
        <>
          <span className={styles.lang} aria-hidden="true">
            EN
          </span>
          <span className={styles.sr}> ({ctx.dict.pageInEnglish})</span>
        </>
      ) : null}
    </Link>
  );
}

function LinkGroup({
  id,
  title,
  items,
  ctx,
  className,
}: {
  id: string;
  title: string;
  items: readonly FooterLinkItem[];
  ctx: LinkContext;
  className?: string;
}) {
  return (
    <nav aria-labelledby={id} className={className ? `${styles.group} ${className}` : styles.group}>
      <h3 id={id} className={styles.heading}>
        {title}
      </h3>
      <ul className={styles.list}>
        {items.map((item) => (
          <li key={item.href}>
            <FooterLink item={item} className={styles.link} ctx={ctx} />
          </li>
        ))}
      </ul>
    </nav>
  );
}

/** The region switcher: one real link per landing page, each label in its own language. */
function RegionSwitcher({ current, dict }: { current: Region; dict: Dict['footer'] }) {
  return (
    <nav aria-labelledby="footer-regions" className={styles.regions}>
      <h3 id="footer-regions" className={styles.regionHeading}>
        {dict.regionHeading}
      </h3>
      <ul className={styles.regionList}>
        {Regions.map((region) => (
          <li key={region}>
            <Link
              href={RegionPaths[region]}
              hrefLang={RegionHreflang[region]}
              lang={localeOf(region)}
              className={styles.regionLink}
              aria-current={region === current ? 'page' : undefined}
            >
              {RegionLabels[region]}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export function Footer({ locale, region }: { locale: Locale; region?: Region }) {
  const dict = getDict(locale).footer;
  const ctx: LinkContext = { dict, locale };
  // The client's disclaimer for the page's region. Pages that are not a landing page take the one of their language.
  const disclaimer = getRegionCopy(region ?? (locale === 'ru' ? 'ru' : 'us')).disclaimer;

  return (
    <footer
      data-section="footer"
      data-figma-node="2601:12661"
      aria-labelledby="footer-heading"
      className={styles.footer}
    >
      <h2 id="footer-heading" className={styles.sr}>
        {dict.heading}
      </h2>

      {/* Atmosphere only. The layer is 48px wider than the footer on each side so the pointer sway never shows an edge. */}
      <div className={styles.glow} aria-hidden="true">
        <div className={`${styles.stage} fx-dither`}>
          <Picture
            base="/landing/footer/glow"
            widths={[1097]}
            width={1097}
            height={564}
            alt=""
            aria-hidden="true"
            className={styles.poster}
          />
          <span className={styles.veil} />
        </div>
      </div>

      <Container size="wide" className={styles.inner} style={SAFE_GUTTER}>
        <div className={styles.grid}>
          <div className={styles.brand}>
            <p className={styles.lockup}>
              <span className={styles.mark}>
                <LogoMark size={26} decorative />
              </span>
              <span className={styles.wordmark}>{SITE_NAME}</span>
            </p>
            <p className={styles.tagline}>{dict.tagline}</p>
          </div>

          <LinkGroup id="footer-product" title={dict.product} items={PRODUCT_LINKS} ctx={ctx} />
          <LinkGroup id="footer-company" title={dict.company} items={COMPANY_LINKS} ctx={ctx} />
          <LinkGroup id="footer-connect" title={dict.connect} items={CONNECT_LINKS} ctx={ctx} className={styles.connect} />
        </div>

        {/* One row from 1000px (the disclaimer left, the region switcher right, as the legal links are), stacked below it. */}
        <div className={styles.meta}>
          {region ? <RegionSwitcher current={region} dict={dict} /> : null}

          {/* D1: regulatory wording survives the redesign. Exempt from the claims scan (scripts/qa/claims.mjs) by data-disclaimer. */}
          <p data-disclaimer className={styles.note}>
            {disclaimer}
          </p>
        </div>

        <div className={styles.bar}>
          <p className={styles.copy}>
            {fill(dict.copyright, { year: YEAR, name: SITE_NAME })}
          </p>
          <nav aria-label={dict.legalNav} className={styles.legal}>
            <ul className={styles.legalList}>
              {LEGAL_LINKS.map((item) => (
                <li key={item.href}>
                  <FooterLink item={item} className={styles.legalLink} ctx={ctx} />
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </Container>
    </footer>
  );
}

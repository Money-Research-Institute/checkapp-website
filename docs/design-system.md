# Design system

One dark theme for the whole site (page background pure `#000`). Everything below is built once in the foundation and
reused by the landing sections and the inner pages. Inner pages import only from `@/components/ds`; landing sections may too.

## Tokens (`src/styles/tokens.css`)

Plain CSS custom properties on `:root`, mirrored into Tailwind v4 by `@theme inline` in `src/app/globals.css`, so both
`var(--c-brand)` and `bg-brand` work. Sections never edit these files: a section-only value goes in a custom property scoped to
`[data-section="<slug>"]` inside the section's own CSS.

| Group | Tokens |
|---|---|
| Colour | `--c-bg`, `--c-brand` (#41773c CTA), `--c-brand-deep` (#276221 nav CTA, glows), `--c-accent`, `--c-mint`, `--c-bracket`, `--c-fg`, `--c-fg-body`, `--c-fg-70/-60/-50/-40`, `--c-muted`, `--c-sub-on-black` (#7c7c86), `--c-surface-a/-b`, `--c-tile-*`, `--c-glass`, `--c-glass-edge`, `--c-focus` |
| Type | `--fs-h1/-h2/-h3/-lede/-body`, `--lh-*`, `--ls-*` (fluid with `clamp()`). Utilities `font-sans` (Manrope), `font-ui` (Inter), `font-brand` (Bricolage, wordmark only). **The h1 leads**: on a phone `--fs-h1` is 34 to 37 px and `--fs-h2` stays under 29 px (see "Heading hierarchy" below) |
| Layout | `--gutter`, `--measure` (1320), `--measure-narrow` (1280), `--measure-prose`, `--header-h` (72 on phones, 104 from 768, **64 on a landscape phone**: `(orientation: landscape) and (max-height: 500px)`), `--cta-bar-h` (72), `--radius-card/-pill/-eyebrow`, `--tap` (44) |
| Footer coupling | `--footer-overlap`, `--footer-runway` (the final CTA overlaps the footer; `body:has([data-section="final-cta"])` sets them) |
| Motion | `--dur-fast/-base/-slow` (150/300/600 ms), `--ease-out-expo`, `--ease-out`, `--spring` (a `linear()` spring) |

`prefers-contrast: more` makes glass solid and translucent text opaque; `forced-colors` and focus rings have baselines in
`globals.css`. `tap` / `tap-y` utilities give a 44 px minimum target; `html`/`body` reserve the mobile CTA bar's height.

### Heading hierarchy

The page's one `h1` is the top of the type scale at every width, and a phone is where it was losing: the hero measured 28 to 31 px
while the section h2s measured 30 to 34. The contract: **on a phone the h1 is at least 34 px and bold, and no section h2 is
larger than 29 px.** `GradientHeading size="hero"` carries the weight (700 below 768, with a gradient that only dims to 82 %), and
`--fs-h1` / `--fs-h2` carry the sizes. A section that sets its own heading size (the landing sections do) has to stay inside the
contract: read `--fs-h1` / `--fs-h2` or clamp to the same numbers, and check at 320, 390 and 430.

## Primitives (`src/components/ds`)

| Component | Use |
|---|---|
| `CtaButton` | The pill CTA (`size` nav 56 / lg 60 / bar, `tone` deep / brand): arrow, rim light under the pill that rises on hover and `:focus-visible` (in a `.glow` wrapper whose mask keeps it off the label: the white text keeps the fill's own contrast, 5.3:1 on brand and 7.4:1 on deep, instead of 2.8 to 3.3:1 on the bloom), 0.97 press, 44 px target (`--cta-nav-h` shrinks the nav pill; the header sets 44 px on a landscape phone). Spreads `data-*` (`data-critical`, `data-hides-cta-bar`). On the Russian site (`/ru/...`) a link to a page with a Russian twin goes to the twin (`localizeHref`, `src/lib/paths.ts`), so a landing section passes `APP_DOWNLOAD_URL` and never needs to know its language. |
| `Button` | Forms and inner pages: `primary` / `secondary` / `ghost`, link or `<button>`. |
| `Eyebrow`, `GradientHeading`, `SectionIntro` | The section header stack (eyebrow, 60-100-60 gradient heading with solid / forced-colors / high-contrast fallbacks, bracketed lede). |
| `Container`, `PageShell`, `PageHero`, `Section` | Layout. `PageShell` clears the fixed header; `PageHero` carries the page's single `h1`. |
| `GlassCard` | 6 % glass, gradient stroke, optional corner glows. |
| `Prose` | Legal and MDX text. |
| `Faq` | Native `<details name>` list with plus / minus and open tracking. |
| `CtaBanner` | Closing CTA card of an inner page. |
| `Field`, `Input`, `Textarea`, `Select`, `Checkbox`, `FormMessage` | Form controls (visible focus, 44 px targets, announced errors). |
| `Picture` | AVIF / WebP `<picture>` through `withBasePath`; `priority` adds `fetchPriority` and a preload; `sources` for art direction; passes `data-webgl-poster` through. |
| icons | `ArrowRightIcon`, `SparkleIcon`, `PlusIcon`, `MinusIcon`, `CheckIcon`. |

## Motion vocabulary (`src/styles/motion.css`, `fx.css`)

Compositor-only (`transform`, `opacity`, `rotate`, `mask`), CSS-only, and **the default style of every element is its final
visible state**: no-JS, Firefox, older Safari, print and reduced motion all show the finished layout. Every rule lives inside
`@media (prefers-reduced-motion: no-preference)`, scroll timelines also inside `@supports (animation-timeline: view())`.

| Attribute | Effect |
|---|---|
| `data-fx="rise"` | 14-18 px rise + fade on view entry. Stagger with `style="--i: n"`. |
| `data-fx="settle"` | `translateY` + `scale(.97)` to rest. |
| `data-fx="drift"` | travel from `--fx-from` to `--fx-to` (`"0px, 12px"`) over the pass through the viewport. |
| `data-fx="curtain"` | a black curtain slides off (process arrows); `data-fx-dir="rtl"` reverses. |
| `data-fx="bob"` | 5-7 s idle bob (`--bob-amp`, `--bob-dur`, `--bob-delay`); paused off-screen by the engine (`data-paused`). |
| `.fx-dither` | masked noise layer (`--dither-a`, `--dither-mask`) that breaks banding on near-black gradients. Needs `public/landing/_shared/noise-128.png` (made by `scripts/assets/make-noise.mjs`); the layout publishes its base-path-safe URL as `--noise-url`. |
| `.fx-edge` | gradient 1 px stroke via a masked `::before` (`--edge`, `--edge-w`, `--edge-a`). |

Rules: section motion uses `transform`, `rotate`, `scale` (never `translate`);
never `overflow: hidden/auto` on an ancestor of a `view()`-animated element (use `overflow: clip`); declare
`animation-timeline` after the `animation` shorthand.

## Shell chrome (`src/components/layout`)

- **Header**: three shapes. Below 768 the logo and a burger. From 768 the logo, the links and the download pill; the Russian labels
  are ~130 px longer and two of the links carry an "EN" tag, so `/ru/` shows logo + pill + burger from 768 to 1023 and the full bar
  from 1024 (`FULL_BAR_FROM` in `Header.tsx`, the media queries in `Header.module.css`). **Landscape phones**
  (`orientation: landscape` and `max-height: 500px`) get a compact bar: 8 px from the top, 48 px high, the same 16 px edge as the
  hero, a 44 px pill that is dropped while the page's own download button is on screen (`data-cta-covered`, set from the same
  `[data-hides-cta-bar]` signal the phone bar uses), and a two-column open menu. From 480 to 767 wide the pill is also in the bar there (logo left, pill and burger on the
  right), because the phone's bottom bar is not shown on a short landscape screen (below). `--header-h` is 64 px there, so pages that clear
  the header follow. At the top of the page the links sit on a scrim (`.header::before`, a black wash that holds through the nav row
  and fades out below it; gone once the glass fades in on scroll): the hero's green wash runs under the right-hand links and 16px grey
  on it measured 2.4 to 3.3:1, with the scrim 6.8 or more. The links go through `shellLink` (`src/lib/paths.ts`): on a Russian page "How it works" is the landing
  page's own section (`/ru/#how-it-works`) and any link to a page that exists in English only wears a visible "EN" tag (and a spoken
  cue), in the header and the footer. The `/blog/` links are `prefetch={false}`: the blog's cover photos come from a third party,
  and prefetching the route from the header fetched one on every page load, before the cookie notice had been answered. The logo never shrinks (`LogoMark` pins its `<picture>`), and the pill's
  right edge stays inside the gutter at every width: a sweep that checks the rect of every header link against the viewport and the
  gutter, for every locale, is the way to test a change here (the gate's overflow check cannot see clipped content).
- **MobileCtaBar**: not shown on a short landscape screen (`(orientation: landscape) and (max-height: 500px) and (min-width: 480px)`):
  with the 48 px header above it, the bar took a third of a 375 px screen. The same query, in `MobileCtaBar.module.css`, `globals.css`
  (the page stops reserving the bar's strip) and `footer.module.css` (laid out as on a tablet), must stay in step with the header's.
  Narrower than 480 there is no room for the pill beside the logo and the burger, so the bar stays. Server-rendered hidden on a landing page (the hero's CTA is in the first view), then settled silently by the
  observer; only later changes slide (`data-animate`). It also steps aside while the cookie notice is open (`html[data-consent-open]`).
- **CookieConsent**: after the first input or 8 s. A slim card on phones, a one-row strip on short landscape screens. It is held
  back (laid out, invisible) while its box would cover a `data-critical` element, and appears once scrolling or resizing clears it.

## Assets

`node scripts/assets/encode.mjs <src> <outDir> <name> --widths 640,1080,1472 [--alpha] [--avif-bits 10]` writes
`<name>-<w>.avif` and `.webp`. Commit the output under `public/landing/<slug>/`, never the raw export. Every URL goes through
`withBasePath`; CSS-referenced art is passed in as an inline custom property built in TSX. No claim text in rasters (the gate
cannot scan them).

`npm run og:generate` writes the two share cards, `public/og-default.png` (English pages) and `public/og-default-ru.png` (`/ru/`,
headline read from the client's copy). `landingMetadata` picks the card by language.

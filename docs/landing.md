# The landing page

Four pages (`/`, `/eu/`, `/gulf/`, `/ru/`), one layout, five plain server-rendered sections. No client engine, no WebGL, no scroll-driven
choreography: the page is HTML + CSS and a few small islands that were already part of the shell (CTA tracking, FAQ open tracking).

| # | Section | Folder (`src/components/landing/`) | Words |
|---|---|---|---|
| 1 | Hero: eyebrow, headline, sub-line, store CTA, one static phone | `hero/` | client (`hero`, `subscription`); eyebrow and alt text ours |
| 2 | How it works: three phones, one sentence each | `process/` | client (`howItWorks`); alt text ours |
| 3 | Testimonials: six placeholder cards (**not on `/ru/`**) | `testimonials/` | `src/content/testimonials.ts`; header ours |
| 4 | FAQ: the ds `Faq` accordion + FAQPage JSON-LD | `faqs/` | client (`faqEntries(region)`); h2 ours |
| 5 | Final CTA: closing line, CTA, consent note, phone | `final-cta/` | client (`finalCta`, `adLines[1]`, `dataConsent`) |

`LandingPage.tsx` composes them. Header, footer, phone CTA bar and cookie notice are the shell (`SiteFrame`); the design system is
`src/components/ds`, the tokens `src/styles/tokens.css` ([design-system.md](./design-system.md)). Each section keeps its own
`copy.ts` for the strings the client's document does not cover (`{ en, ru }`, Russian marked `// DRAFT`); nobody types a client
string into JSX.

## Regions are pages

| Page | Region | `<html lang>` | Notes |
|---|---|---|---|
| `/` | United States | `en` | the default; the others are variants of it |
| `/eu/` | European Union | `en` | VAT in the price, explicit-consent wording |
| `/gulf/` | Gulf (UAE, KSA) | `en` | price in AED/SAR |
| `/ru/` | CIS | `ru` | Russian chrome and sections; no testimonials (H4) |

No geo-redirect (static export) and no runtime switch: the footer has a region switcher, and every page has a self canonical, `hreflang`
alternates (`RegionHreflang`) and an `og:locale`. Routes: `(en)/(us)/`, `(en)/eu/`, `(en)/gulf/` and `(ru)/ru/`, each a one-line layout
(`SiteFrame region=...`) plus `<LandingPage region=...>`. Next.js allows one `lang` per root layout, so there are two root layouts
(`(en)`, `(ru)`) sharing `RootShell`, each with its own font set (`src/lib/fonts/latin.ts`, `cyrillic.ts`; a Cyrillic file is only
fetched on `/ru/`, which `npm run check:lang-fonts` verifies on `out/`). `/ru/download/` is the Russian twin of the download page; links
to pages that exist in English only carry an "EN" tag and `hreflang="en"`.

## The client's copy

`src/content/copy/{us,eu,gulf,ru}.ts` hold the client's final wording (22.10.2026, `checkapp_landing_copy_final.docx`) **verbatim**.
Change a word there only with the client's say-so. Spelling (the document's rule): **checkapp** (lower case) and **DiDi**; Russian
addresses the reader as «ты». Read it with `getRegionCopy(region)`.

| Document block | Field | Where it shows |
|---|---|---|
| HERO headline / subheadline / CTA | `hero.*` | hero (the h1 is the headline) |
| SUBSCRIPTION | `subscription` | hero small print, **only when the region has a price** |
| HOW IT WORKS (3 steps) | `howItWorks` | process: the sentence is the step text |
| FAQ (5) | `faqEntries(region)` | FAQ and its JSON-LD; the price question appears only with a price |
| FINAL CALL / AD LINES / DATA AND CONSENT | `finalCta`, `adLines[1]`, `dataConsent` | final CTA |
| DISCLAIMER | `disclaimer` | footer, in an element marked `data-disclaimer` |
| MEET DIDI, WHAT IT DOES NOW, 4P | `meetDidi`, `whatItDoes`, `fourP` | **not shown any more** (their sections were cut); the strings stay in the copy files in case they come back |

## What the app can honestly claim

The app takes **photo scans of the tongue, face and iris, only when the person takes a photo, and answers with a short wellness insight;
nothing runs in the background.** That is the whole list. So the page must not promise a weekly report, a 90-day history, comparison with
earlier check-ins, trends, "over time", continuous or real-time monitoring, video analysis, or any medical claim (diagnose, predict or
prevent a disease, cure, treat, "world's first", "clinically proven", "medical-grade", "doctor-approved"). Text baked into raster
art (the phones) cannot be scanned: read every phone at full size when you swap a screen (photo not video, "Looks stable" not a verdict, no date, "DiDi").

`scripts/qa/claims.mjs` holds the patterns and fails the page on them: `BANNED_CLAIMS`, `UNSUPPORTED_CAPABILITIES` (not inside the
testimonials, which are placeholders), `PLACEHOLDERS` (`{price}`, `[Price]`, TODO, lorem). `CLAIM_ALLOW` lets a banned word through only
where it denies the claim in the client's own phrasing ("never diagnoses", "Does DiDi diagnose?", «не ставит диагнозы»); it is not a
general negation filter. Text inside `[data-disclaimer]` is exempt, so the disclaimer may say what the product does *not* do.

## Holds and decisions that still apply

Each is reversible; a hold waits for the client. Older code comments cite `docs/landing-copy.md` and `docs/landing-decisions.md`: both
were merged into this file and keep their numbers.

| | What |
|---|---|
| H1 | The US sentence "The name comes from “Digital Diagnostic” — …" is not shown (`SHOW_NAME_ORIGIN = false`): "diagnostic" next to a health app reads as a medical-device claim. Turning it on also needs the claims patterns reviewed. |
| H2 | No price anywhere: `Prices` in `pricing.ts` is all `null`, so the hero small print and the price FAQ are withheld. Fill `Prices[region]` and `withPrice()` does the rest. |
| H3 | Running text says `checkapp` (lower case). The legal pages keep their text, which says CheckApp (a lawyer aligns it). |
| H4 | `/ru/` has no testimonials: the quotes are English placeholders and translating them would invent more. |
| D1 | No medical or superlative claims anywhere, including copy the document does not cover (draft wording is ours; the client approves). The footer keeps the medical disclaimer strip. Never expand "DiDi" to "Digital Diagnostic". |
| D2 | Testimonials ship as designed but are **placeholders** (invented people, stock avatars): each card carries `data-verified="false"`. Entries flagged `needsReplacement` are not shown. Replace with real, consented quotes before launch; never add Review / AggregateRating JSON-LD for these. |
| D3 | The white hooded sprout-doctor **is** DiDi. No alien art anywhere. |
| D4 | Fonts: Manrope (display and body), Inter (small UI text), Bricolage Grotesque (wordmark only). |
| D5 | No paid-plan visuals (the app sells nothing yet): the final-CTA phone shows the home screen with the three photo scans. |
| D6 | Contrast fixes over Figma stay (sub-lines `#7c7c86`); phone 2 of "How it works" is stored un-flipped so its UI text reads correctly. |
| D7 | The logo is the 3D DiDi icon, drawn only through `LogoMark` ([brand.md](./brand.md)). |
| D8 | Keep what is legally required or functional: every URL, `/privacy`, `/terms`, `/delete-account`, `/auth/callback`, the download flow, the blog, the lead form, analytics with consent, sitemap, SEO and JSON-LD. |

## Typography of the copy

`src/i18n/typeset.ts` puts no-break spaces where a line may not break and CSS cannot say so: a dash stays with the word before it (all
languages), and in Russian a short preposition, conjunction or particle stays with the word after it. `typeset-copy.ts` runs the step once
over every region's copy and every section's own `copy.ts`; nobody types U+00A0. Meta descriptions and JSON-LD turn them back into plain spaces.
The hero headline and sub-line also go through `KeepHyphenated`, so "check-in" never breaks after the hyphen.

## Check it

```bash
npm run lint && npx tsc --noEmit && npm run build   # about 15 s together
npm run qa                                           # about 8 s, against out/
```

`npm run qa` (`scripts/qa/check.mjs`) loads the four pages at 375x812 and 1440x900 and fails on console errors, failed requests (analytics
excluded), horizontal overflow, a missing or double `<h1>`, a wrong `<html lang>`, and the claims scan above. It needs Google Chrome
(`playwright-core` drives it) and serves `out/` itself; `--out <dir>` tests another build folder. Looking at the page is still a human job:
screenshot `/` at 375 and 1440 wide after any visual change.

## Assets

Raw Figma exports are never committed. `node scripts/assets/encode.mjs <src> <outDir> <name> --widths 640,1080 [--alpha] [--avif-bits 10]`
writes `<name>-<w>.avif` and `.webp` under `public/landing/<slug>/`; draw them with ds `Picture` (every URL goes through `withBasePath`).
CSS-referenced art is passed in as an inline custom property built in TSX, because CSS `url()` ignores `GITHUB_PAGES_BASE_PATH`.
`npm run og:generate` writes the two share cards (`/og-default.png`, `/og-default-ru.png`).

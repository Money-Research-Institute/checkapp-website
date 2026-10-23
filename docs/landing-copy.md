# Landing copy: the client's final wording (22.10.2026)

Source: `checkapp_landing_copy_final.docx` (the client's updated copy, "final wording by region"). It is stored **verbatim** in
`src/content/copy/{us,eu,gulf,ru}.ts`; `npm run qa:selftest` runs every string of it through the claim rules. Change a word there
only with the client's say-so. Where this file disagrees with `docs/landing-decisions.md` D1, **this file wins**; D1 still governs
every string the client's document does not cover.

Spelling (the document's own rule): **checkapp** (lower case) and **DiDi**. Russian text addresses the reader as «ты».

## Regions are pages

| Page | Region | Language | `<html lang>` | Notes |
|---|---|---|---|---|
| `/` | United States | en | `en` | the default; everything else is a variant of it |
| `/eu/` | European Union | en | `en` | VAT in the price, explicit-consent wording |
| `/gulf/` | Gulf (UAE, KSA) | en | `en` | price in AED/SAR |
| `/ru/` | CIS | ru | `ru` | Russian chrome and sections; no testimonials |

All four render the **same sections in the same order** from `getRegionCopy(region)`. There is no geo-redirect (static export) and no
runtime switch: the footer carries a region switcher (`RegionLabels`, each label in its own language) and every page has a self
canonical plus `hreflang` alternates (`RegionHreflang`) and an `og:locale`.

## Where each block of the document lands

| Document block | Field | Section |
|---|---|---|
| HERO headline / subheadline / CTA | `hero.*` | `hero` (the h1 is the headline) |
| SUBSCRIPTION | `subscription` | `hero`, small print under the CTA, **only when the region has a price** |
| MEET DIDI | `meetDidi` via `meetDidiText()` | `familiar` |
| WHAT IT DOES NOW | `whatItDoes` | `familiar`, next to the phones (tongue, face, iris) |
| HOW IT WORKS (3 steps) | `howItWorks` | `process`: the client's sentence is the step text; the only extra is the number |
| DATA AND CONSENT | `dataConsent` | `final-cta`, a short note beside the CTA |
| 4P MEDICINE | `fourP` | `projects`, the statement above the four tiles |
| FINAL CALL | `finalCta` | `final-cta` headline |
| AD LINES | `adLines` | `adLines[1]` is the `final-cta` sub-line; both are fair game for metadata |
| FAQ (5) | `faqEntries(region)` | `faqs` (and the FAQ JSON-LD); the price question appears only with a price |
| DISCLAIMER | `disclaimer` | `footer`, in an element marked `data-disclaimer` |

A section never shows the Figma or D1 text for a block the document covers. Components read the copy; nobody types a client string into JSX.

## What the app can honestly claim (the rule behind the new gate check)

"What it does now" says: **photo scans of the tongue, face and iris, only when the person takes a photo, a short wellness insight back,
nothing in the background.** That is the whole list. So the page must not promise a weekly report, a 90-day history, comparison with earlier
check-ins, trends, "over time", continuous or real-time monitoring, or video analysis. D1's older replacement texts that said so ("compares
today with your own earlier check-ins", "Patterns", "Progress") are withdrawn. The gate fails them as `unsupported-capability` (not inside the
testimonials, which are Figma placeholders). D5's "weekly report, 90-day history" feature cards are withdrawn for the same reason: the two
spots that showed plans show the three scans instead.

Drafts we still write (the document does not cover them), each marked `// DRAFT` and listed for the client to approve: the four tiles of
`projects` (named after the client's four Ps: Personalized, Preventive, Participatory, Predictive; each says only what the client's own 4P
sentence says: attention, nudges, you decide what to share, a wellness read that is never a diagnosis or a disease prediction), the
`usual-way` section, the tiny labels on the phone mock-ups, and **all Russian text outside the document** (header, footer, cookie notice, the
sections above, 404). Put them in `src/components/landing/<slug>/copy.ts` (`{ en, ru }`), never inline.

## Holds (decided by default, each reversible)

| | What | Why | To release it |
|---|---|---|---|
| H1 | US sentence "The name comes from “Digital Diagnostic” — but DiDi never diagnoses." is **not shown** (`SHOW_NAME_ORIGIN = false`). The page uses `meetDidi.withoutNameOrigin`, our derived text. | "diagnostic" next to a health app is what a store reviewer or regulator reads as a medical-device claim, and the other three regions do not use the sentence. | client confirms it, then set the flag **and** make a reviewed gate change (the gate rejects "diagnostic" on purpose; selftest asserts that) |
| H2 | No price anywhere: the subscription line and the "How much does it cost?" answer are withheld (`Prices` in `pricing.ts` is all `null`). | the document carries `[Price]` and `[AED/SAR]` placeholders; the gate fails any `{price}` or `[Price]` on a page (`placeholder-leak`). | fill `Prices[region]` with the real figure; `withPrice()` does the rest |
| H3 | Wordmark and running text say `checkapp` (lower case), as the document asks. The legal pages (`/privacy`, `/terms`) keep their existing text, which says CheckApp. | the document's own spelling rule vs. legal text we must not edit | tell the client, align the legal text with their lawyer |
| H4 | `/ru/` has no testimonials section. | the six quotes are invented English placeholders (D2); translating them would invent more | real, consented Russian quotes |

## Chrome and metadata

`src/i18n/` holds the dictionaries (`en`, `ru`) for the header, mobile CTA bar, cookie notice, footer labels and 404: no i18n library, a
typed accessor, static export. The legal and blog pages stay English. Each landing page sets its own `<title>`, description (the hero
subheadline is a good one), canonical, `hreflang` alternates, `og:locale` and share image (`/og-default-ru.png` on `/ru/`: the client's
Russian headline, made by `npm run og:generate`), and is in the sitemap. The app's JSON-LD description on `/ru/` is the Russian hero
subheadline.

## How the four pages are built

```
src/app/
  (en)/layout.tsx          root layout, <html lang="en">, Latin fonts   -> RootShell
  (en)/(us)/  eu/  gulf/   one layout + page per landing page           -> SiteFrame region=...  + LandingPage
  (en)/(pages)/            every inner page (about, blog, privacy, ...) -> SiteFrame, no region
  (ru)/layout.tsx          root layout, <html lang="ru">, Cyrillic fonts -> RootShell
  (ru)/ru/                 the Russian landing page                      -> SiteFrame region="ru" + LandingPage
  global-not-found.tsx     the 404 (a whole document: two root layouts have no single layout to build it from)
```

- Next.js allows one `lang` per root layout, hence two root layouts sharing `RootShell`. Going between `/ru/` and any other page is a full page load.
- `SiteFrame` (skip link, header, `<main>`, footer, phone CTA bar, cookie notice) is rendered by the layout of each landing page, because the footer
  (region switcher, the region's disclaimer) and the download label (`copy.hero.cta`) depend on the region and a layout cannot read the URL.
- Shell strings live in `src/i18n/{en,ru}.ts` (typed, no library). English is the default for every non-landing page; the Russian strings are drafts.
- Fonts: `src/lib/fonts/latin.ts` for English, `src/lib/fonts/cyrillic.ts` for `/ru/`. next/font writes the `@font-face` of every subset with a
  `unicode-range`, so the browser only fetches a Cyrillic file when Cyrillic text is on the page, and only the Russian page *preloads* it. Two details keep that
  true: `experimental.cssChunking: 'graph'` (the default chunking merges the font CSS of both root layouts into every page), and the `Русский` label in the
  footer switcher, which is set in the system font on English pages (in Manrope it would trigger the Cyrillic download on `/`). `npm run check:lang-fonts` checks the
  built `out/` for all of it.
- Footer and header links on `/ru/` to pages that exist only in English (privacy, terms, blog, ...) carry `hreflang="en"`, a visible
  "EN" tag and a spoken "страница на английском". "Как это работает" goes to its section of the Russian page (`/ru/#how-it-works`).
- **The download page has a Russian twin**, `/ru/download/` (`src/app/(ru)/ru/download/page.tsx`, the same `DownloadView` as `/download/`,
  strings in `src/i18n/{en,ru}.ts` under `download`, the regulatory line is the client's Russian disclaimer). Every «Скачать checkapp»
  button on the Russian site leads there: the landing sections keep passing `APP_DOWNLOAD_URL` and `CtaButton` swaps it by the page it
  is on (`localizeHref`). The two download pages list each other as hreflang alternates (page head and sitemap). The Russian text on it is
  a DRAFT for the client to approve, like the rest of the shell.
- **Typography** (`src/i18n/typeset.ts`): two rules about where a line may not break, which CSS cannot express, so they are no-break
  spaces put in at render time. (1) A dash stays with the word before it, in every language: a line never starts with «— это 4P»
  or "— not a yearly appointment" (the Gulf headline did). (2) Russian only: a one- or two-letter preposition, conjunction, particle or
  short pronoun (в к с у о а и я, на по за из от до ко со во об, но не ни то да, ты мы вы он её ей им) stays with the word after it,
  and the enclitics бы ли же with the word before them, so a line never ends on «в» or «и». The client's strings are verbatim, so
  `typeset-copy.ts` runs the step once over every region's copy and every section's own `copy.ts` (`en` and `ru`), `index.ts` over the shell
  dictionaries; nobody types U+00A0 into a string, and a section must not retype one to get it. Only plain spaces change, nothing is
  reworded, `\s` still matches. Meta descriptions and JSON-LD turn them back into plain spaces (`plain`).

## The gate knows all of this

`pages` (quick) = `/` and `/ru/`; `pagesFull` and `sectionPages` = all four. New checks: `lang-mismatch` (`<html lang>` must be the page's
language), `lang-content` (a `/ru/` page must be at least 60% Cyrillic, an English page at most 2%), `placeholder-leak` (template tokens,
TODO, lorem), `unsupported-capability`, and Russian entries in `bannedClaims`. `claimAllow` lets a banned word through only when it
denies the claim in the client's own phrasing ("never diagnoses", "Does DiDi diagnose?", «не ставит диагнозы»).

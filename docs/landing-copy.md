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
subheadline is a good one), canonical, `hreflang` alternates and `og:locale`, and is in the sitemap.

## The gate knows all of this

`pages` (quick) = `/` and `/ru/`; `pagesFull` and `sectionPages` = all four. New checks: `lang-mismatch` (`<html lang>` must be the page's
language), `lang-content` (a `/ru/` page must be at least 60% Cyrillic, an English page at most 2%), `placeholder-leak` (template tokens,
TODO, lorem), `unsupported-capability`, and Russian entries in `bannedClaims`. `claimAllow` lets a banned word through only when it
denies the claim in the client's own phrasing ("never diagnoses", "Does DiDi diagnose?", «не ставит диагнозы»).

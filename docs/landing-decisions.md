# Landing redesign — decisions that override Figma

The Figma design (`FSJqiLATooQsiMWs9OISQW`, node `2601:12433`) is the visual source of truth. **This file overrides it**
wherever they disagree, because the design contains copy and art that the product, its own disclaimer, or Google Play
policy cannot support. Where a decision is still open it says so; nothing open may be built around a guess.
Builders and reviewers read this file in full. The gate enforces what can be enforced (`banned-claim`,
`unverified-testimonial`, `section-missing`).

## D1. Copy: no medical or superlative claims  (decided, needs client sign-off)

The site's own footer says "CheckApp does not claim to diagnose, treat, cure, or prevent any condition or disease", and
the app cannot analyse video yet (image only). The design says otherwise in several places. Use the right-hand text.
Draft wording is ours; the client approves it.

| Where | Figma text | Use instead | Why |
|---|---|---|---|
| hero paragraph | "Checkup, the world's first app that turns checking and monitoring your health into a convenient daily routine. … we've learned to predict diseases before they even appear. To predict is to prevent." | "CheckApp turns checking in on your health into a small daily habit. Keep using your phone and DiDi notices changes in your daily signals, then tells you what it sees in plain language. A wellness companion, not a medical device." | disease-prediction claim, unprovable "world's first", wrong name ("Checkup") |
| familiar, sub-copy | "DiDi stands for Digital Diagnostic. It helps you stay connected … continuous monitoring." | "DiDi helps you stay connected to your health through simple daily interactions, gentle observations and ongoing check-ins." | "Diagnostic" is a medical-device claim. Do not expand the acronym anywhere |
| hero, Upgrade card | "…Go Pro for detailed zone analysis and video diagnostics." | drop the card (it is half hidden behind the phone), or "Go Pro for a weekly report and 90-day history" | video is not analysed yet; "diagnostics" |
| projects, h2 | "The future of healthcare is 4P" | "The future of everyday wellness is 4P" | "healthcare" implies a medical service |
| projects, tile 02 | "Prediction — … identify changes that may indicate potential risks." | "Patterns — By comparing your signals over time, DiDi helps you notice changes in your own patterns." | prediction/risk claim |
| projects, tile 03 | "Prevention — Understanding possible risks earlier can help you take proactive steps toward better health." | "Progress — Seeing what changes day to day makes it easier to take small, proactive steps toward better habits." | "prevention" contradicts the disclaimer |
| projects, tile 04 | "Participativeness" | "Participation" (text unchanged) | consistent with the other three |
| process, step 2 | "…photos and videos … support a more informed understanding of your condition." | "Share a photo and DiDi notes visible signals like tongue colour and coating, then explains them in plain language." | image only today; "condition" |
| process, step 3 | "…better understand potential health risks." | "DiDi remembers your previous check-ins and compares them over time, helping you notice changes and see your own patterns." | risk claim |
| FAQ, h2 | "Frequently Asked Questions Section" | "Frequently asked questions" | Figma leftover |
| FAQ, row 002 | "How does Checkup monitor my health?" | "How does CheckApp work?" / answer: "CheckApp uses AI-powered observations and the information you share through your phone to help you follow your wellness signals and changes over time." | name; "monitor my health" |
| FAQ, row 004 | "What is 4P medicine?" | "What is 4P?" | "medicine" |
| FAQ, answers 001/003/004 | missing in Figma | 001: "DiDi is the companion inside CheckApp. It checks in with you every day, looks at the photos and answers you share, and explains what it notices in plain language. It is a wellness companion, not a medical device." 003: "A traditional checkup is a snapshot once in a while. DiDi is a daily conversation that compares today with your own earlier check-ins, so changes stand out. It does not replace seeing a doctor." 004: "4P is how we think about everyday wellness: Personalisation, Patterns, Progress and Participation, built around you." | no answer, or invented elsewhere |
| footer | disclaimer strip dropped, only "Not a medical device" kept | **keep the existing Medical Disclaimer strip** (mark it `data-disclaimer`) and keep the copyright line | regulatory wording must survive |
| everywhere | "Checkup", "DIDI" | "CheckApp"; "DiDi" in running text (as most of the design) | one name |

Also: do **not** carry over the current homepage's "2,400+ people building healthy habits" unless the client confirms the number.
The usual-way section's "checkups shouldn't happen just once a year" stays, because the disclaimer is visible on the same page.

The gate's `banned-claim` check scans the landing page's text (plus alt and aria-label) for: `diagnos*`, predicting a disease/illness/condition,
preventing one, curing, treating, "world's first", "clinically proven/tested/validated", "medical-grade", "doctor-approved". Text inside an element marked
`data-disclaimer` is exempt, so the disclaimer may say what the product does *not* do. Text baked into raster images cannot be scanned: do not put claims there.

## D2. Testimonials: as in Figma  (decided by the project owner; risk stays visible)

The owner's call is to build the six testimonial cards exactly as designed. Data-driven from `src/content/testimonials.ts` (the six Figma entries, each flagged
`placeholder: true`; card 5's quote is leftover crypto-dashboard text and is also flagged `needsReplacement: true`).

Still true, and tracked rather than hidden: the names, roles and quotes look invented and the six avatars look like stock photos of real people. The gate reports
`unverified-testimonial` as a **warning** on every run (it was a blocker before this decision), and the final critic lists it in the launch checklist.
Rendered figures carry `data-verified="false"` until a real, consented entry replaces them.

## D3. Mascot  (decided by the project owner)

The white hooded "sprout doctor" **is DiDi**. The alien was retired entirely. Use the Figma character and phone art as designed ("Mah" is the user's name in the mock UI,
not the mascot). No alien art anywhere on the site.

Follow-ups outside this repo, listed so they are not forgotten: the mobile app and the Play listing screenshots still show the alien (and "Check Me", where the
mock-ups say "Start Tongue Scan"); they need the new art before the landing page and the store tell the same story.

## D4. Fonts  (decided)

The design uses Manrope, Inter, Geist, DM Sans, Roboto and Bricolage Grotesque; the old site loaded DM Sans, Bricolage and DM Mono. Whole site:

- **Manrope** (400/500/600/700, display and body), **Inter** (500/600/700, UI numerals and small card text), **Bricolage Grotesque** (wordmark only).
- Geist -> Manrope (800 where the design uses Black), DM Sans -> Manrope, Roboto -> Inter, DM Mono dropped. `next/font/google`, latin subset, `display: swap`, preload only the hero weights.

## D5. Paid-plan visuals  (decided by default, reversible)

The hero's "Premium+ · 7-day trial · Subscribe now" card and the final phone showing "Upgrade Your CheckApp · Free | Pro | Premium+" depict paid plans.
The app cannot sell anything yet (no billing integration; the paywall itself says paid plans are unavailable and prices provisional), so advertising a trial
would be wrong today. Default: replace those two spots with real feature cards (weekly report, 90-day history). If purchases ship with this release,
rerun with `paidPlans: true` and keep the visuals.

## D6. Smaller calls  (decided)

- Phone 2 in the "process" section is mirrored in Figma (its UI text reads backwards): export it un-flipped.
- Hero nav and CTA are a restyle of the global `Header`/`MobileCtaBar`, not a second copy.
- Contrast fixes from the Brief stand (final-CTA sub-line `#7c7c86`, "You are on the" ≥ `#d4d4d4`).
- Tiny decorative cards (Roboto 9.7 px) ship as flattened `aria-hidden` images, not DOM.

## D7. Logo: the 3D DiDi icon on cream  (decided by the project owner)

The logo is the 3D mascot icon made with Google Gemini from the Figma mascot (docs/brand-provenance.md): head-and-shoulders DiDi on a cream background, in the spirit of Duolingo's owl.
An earlier flat-vector attempt was rejected; of five backgrounds the owner chose cream. Cream alone disappears on light pages, so the tile always carries a thin deep-green rim
(3 % of the side, at least 1 px, #3E7D36) and, from 32 px up, a soft shadow. It is used wherever the logo appears: header, footer, favicon, apple-touch icon, manifest icons, JSON-LD logo, OG image.
The brand-kit step only derives assets and a component from the masters (`@/components/brand/LogoMark`); nobody redraws or recolours it. The gate's `brand-assets` check fails the page if the
icon, apple-touch icon or OG image (1200 x 630) is missing or does not resolve.

## D8. Existing code is not a constraint  (decided by the project owner)

Everything already on the branch belongs to a previous project. Refactor freely, delete what the new design replaces, and judge on merit. Keep only what is functional or legally
required: every URL, the text of /privacy and /terms, the delete-account flow, the auth-callback forwarding, the download/APK flow, the blog engine and its content, the lead form and
webhook, analytics with cookie consent, sitemap/robots, SEO metadata and JSON-LD. One design system for the whole site, with no second "old" shell.

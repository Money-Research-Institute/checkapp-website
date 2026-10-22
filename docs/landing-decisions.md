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

## D2. Testimonials: none until they are real  (decided)

All six cards look invented: stock names, "Web3 Enthusiast", "Blockchain Analyst", and one quote is leftover crypto-dashboard
text. Invented testimonials on a health product are a trust and advertising-standards problem.

- Build the section and its layout, driven by `src/content/testimonials.ts`, which ships **empty**.
- The section renders nothing unless there are at least three entries, each `{ name, role, quote, date, verified: true }`, with consent recorded outside the repo.
- Rendered cards carry `data-verified="true"`. The gate fails any `blockquote` in `[data-section="testimonials"]` without it (`unverified-testimonial`).
- `testimonials` is `optional: true` in `scripts/qa/figma-sections.json`: absent is fine, present-and-unverified is not.

## D3. Mascot and phone screens  (OPEN, one client answer; building proceeds on (a))

Figma shows a white hooded "sprout doctor" DiDi inside the phone mock-ups, with a different home screen, whereas the shipped app's DiDi is the
alien and its home screen reads "Check Me", not "Start Tongue Scan". ("Mah" in the design is the *user's* name in the mock UI, not the mascot.)

- (a) **shipped app is canonical** (recommended): phone screens become real app screenshots in the Figma device frames; the sprout art is not used.
- (b) **the Figma character is the new brand**: use the art as designed, and the app has to change to match before the page goes live.

Swapping between (a) and (b) later only replaces image assets (`public/landing/shared/app-screens/` and the mascot art), so building on (a) while the client
answers is low-regret. Until a choice is passed to the workflow (`mascot: 'shipped' | 'figma'`), builders may not export or reuse mascot art or baked phone screens.

## D4. Fonts  (decided)

The design uses Manrope, Inter, Geist, DM Sans, Roboto and Bricolage Grotesque; the site loads DM Sans, Bricolage and DM Mono. Landing route group:

- **Manrope** (400/500/600/700, display and body), **Inter** (500/600/700, UI numerals and small card text), **Bricolage Grotesque** (wordmark only, already loaded).
- Geist → Manrope (800 where the design uses Black), DM Sans → Manrope, Roboto → Inter. `next/font/google`, latin subset, `display: swap`, preload only the hero weights.
- The existing sub-pages keep their current fonts through their own route-group layout, so the redesign does not restyle them.

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

# The landing page

Figma: file `FSJqiLATooQsiMWs9OISQW`, frame **Landing** (node `2601:12433`, 1440 x 9766). The page follows it block by block;
`src/components/landing/<slug>/` holds one folder per block and `LandingPage.tsx` stacks them.

| Block | Figma node | Folder |
|-------|------------|--------|
| Hero (floor, phone, glass cards) | `2601:12436` | `hero` |
| The traditional approach | `2601:12628` | `usual-way` |
| Meet DiDi (four phones) | `2601:12718` | `familiar` |
| The future is 4P | `2601:12989` | `projects` |
| Testimonials | `2601:13023` | `testimonials` |
| Three steps (tilted phones) | `2601:12435` / `12434` / `13092` | `process` |
| FAQs | `2610:30003` | `faqs` |
| Final call to action | `2601:13109` | `final-cta` |
| Footer | `2601:12661` | `components/layout/Footer.tsx` |

## Wording

The text is the client's final copy, not Figma's placeholders: `src/content/copy/{us,eu,gulf,ru}.ts`, never retyped. The layout is
Figma's. Where the two differ on purpose (headline, card and step names, testimonial order), [landing-decisions.md](./landing-decisions.md)
and [landing-copy.md](./landing-copy.md) say why. No health claims are baked into images: the claims scan cannot read pixels.

## Motion

Plain CSS, no JavaScript engine. The default style of every element is its **finished** frame, so no-JS, print, Firefox,
older Safari and `prefers-reduced-motion` all show the whole page. Effects (`src/styles/motion.css`) are an enhancement inside
`@media (prefers-reduced-motion: no-preference)` and, for scroll timelines, `@supports (animation-timeline: view())`.
Only `transform` and `opacity` move; never put `overflow: hidden` on an ancestor of a `view()`-animated element (use `clip`).

## Checks

```bash
npm run build && npm run qa
```

`scripts/qa/check.mjs` loads `/`, `/eu/`, `/gulf/` and `/ru/` at 375 x 812 and 1440 x 900 and fails on console errors, failed
requests (analytics excluded), horizontal overflow, a missing or double `<h1>`, a wrong `<html lang>` and the claims scan
(`claims.mjs`). About 10 seconds. To compare with Figma, screenshot the page with `reducedMotion: 'reduce'` (every element in its finished frame).

## Share image

`npm run og:generate` writes `public/og-default.png` and `public/og-default-ru.png` (1200 x 630).

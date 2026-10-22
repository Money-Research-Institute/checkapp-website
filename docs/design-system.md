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
| Type | `--fs-h1/-h2/-h3/-lede/-body`, `--lh-*`, `--ls-*` (fluid with `clamp()`). Utilities `font-sans` (Manrope), `font-ui` (Inter), `font-brand` (Bricolage, wordmark only) |
| Layout | `--gutter`, `--measure` (1320), `--measure-narrow` (1280), `--measure-prose`, `--header-h`, `--cta-bar-h` (72), `--radius-card/-pill/-eyebrow`, `--tap` (44) |
| Footer coupling | `--footer-overlap`, `--footer-runway` (the final CTA overlaps the footer; `body:has([data-section="final-cta"])` sets them) |
| Motion | `--dur-fast/-base/-slow` (150/300/600 ms), `--ease-out-expo`, `--ease-out`, `--spring` (a `linear()` spring) |

`prefers-contrast: more` makes glass solid and translucent text opaque; `forced-colors` and focus rings have baselines in
`globals.css`. `tap` / `tap-y` utilities give a 44 px minimum target; `html`/`body` reserve the mobile CTA bar's height.

## Primitives (`src/components/ds`)

| Component | Use |
|---|---|
| `CtaButton` | The pill CTA (`size` nav 56 / lg 60 / bar, `tone` deep / brand): arrow, light under the pill that rises on hover and `:focus-visible`, 0.97 press, 44 px target. Spreads `data-*` (`data-critical`, `data-hides-cta-bar`). |
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

Rules: `translate` is reserved for the engine's pointer parallax, so section motion uses `transform`, `rotate`, `scale`;
never `overflow: hidden/auto` on an ancestor of a `view()`-animated element (use `overflow: clip`); declare
`animation-timeline` after the `animation` shorthand.

## Experience engine (`src/experience`)

Only `Experience.tsx` (about 1 KB gzipped) is in the initial bundle; it is mounted once at the end of `page.tsx`. After the LCP
entry (or window load + 3 s) and an idle, scroll-quiet moment it imports two chunks with bare `import()` calls:

1. **`core`** (about 2 KB gz): publishes `<html data-fx="t1">`, runs the DOM controllers, and claims a WebGL2 context for T2.
   - `[data-once]`: gets `data-once-state="armed"` at boot, `"played"` on first 35 % intersection. No attribute = final state.
   - `[data-depth="<px>"]` (`data-depth-y`, `data-depth-k`, optional `data-depth-root`): pointer parallax on fine pointers,
     written to the CSS `translate` property with `x += (target - x) * (1 - e^(-k dt))`. One rAF loop that sleeps when settled.
   - `[data-fx="bob"]` off-screen pause.
2. **`gl`** (about 3 KB gz) plus the scene's own chunk: the runner (context, poster texture, pixel caps, dynamic resolution,
   pause / cull, context-loss recovery, poster crossfade, luma probe) and `scenes.ts`, the registry that maps `'hero-floor'` to
   `() => import('@/components/landing/hero/scene')`.

Tiers (published as `html[data-fx]`): **t0** CSS only (saveData, forced-colors, low-end, no JS), **t1** core without GL (no
WebGL2, software renderer, < 4 cores / 4 GB, give-up after sustained slowness, context lost), **t2** core + GL. The only QA
override is `window.__QA_FORCE_GL === true`, set by the gate; there is no URL or storage override.

To add a scene: implement `Scene` (`src/experience/types.ts`), register it in `scenes.ts` and `sceneIds.ts`, and render
`<GlCanvas scene="..." />` next to a `<Picture data-webgl-poster>` inside a stage that reserves its `aspect-ratio`. The poster is
the texture (`ctx.posterTexture`, `ctx.posterFit(w, h)`), so frame 0 equals the poster and every additive term must be 0 at
`t = 0`. Shader helpers (`linkProgram`, `uniformLocations`, `FULLSCREEN_VS`) are in `gl/util.ts`.

## Assets

`node scripts/assets/encode.mjs <src> <outDir> <name> --widths 640,1080,1472 [--alpha] [--avif-bits 10]` writes
`<name>-<w>.avif` and `.webp`. Commit the output under `public/landing/<slug>/`, never the raw export. Every URL goes through
`withBasePath`; CSS-referenced art is passed in as an inline custom property built in TSX. No claim text in rasters (the gate
cannot scan them).

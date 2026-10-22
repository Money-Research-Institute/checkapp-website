# Experience playbook — landing redesign

What "done" means for the redesigned landing page, and the game-dev / WebGL techniques allowed to get there.
Read this before writing code. The gate (`npm run qa`) enforces the measurable half; the workflow's reviewers
enforce the rest. Design source: Figma `FSJqiLATooQsiMWs9OISQW`, node `2601:12433` (Landing, 1440 × 9766).

## 0. Principles (in priority order)

1. **Content first.** Text, links and CTAs are real DOM. The canvas is atmosphere; it never carries meaning,
   never gates first paint, never covers anything clickable. SEO and screen readers see the same page without it.
2. **Every viewport is a first-class design.** Figma only shows 1440. Mobile, tablet, fold, landscape-phone and
   ultrawide are *derived* from its intent, not shrunk or stretched from it.
3. **Three tiers, always.** T0 no WebGL (poster + CSS), T1 light (CSS 3D / Canvas2D), T2 full WebGL. The page is
   complete and good at T0; higher tiers only add.
4. **No scroll hijacking, no hover-only anything.** Native scroll; read `scrollY` and smooth it yourself.
5. **Measure, don't assume.** A technique that doesn't fit the budget below is cut, not tuned until the gate stops noticing.

## 1. The DOM contract (what the gate looks for)

| Hook | Where | Rule |
|---|---|---|
| `data-section="<slug>"` + `data-figma-node="<id>"` | each top-level section | slugs and ids come from `scripts/qa/figma-sections.json`; every section visible at every viewport |
| `data-critical="<name>"` | `<h1>`, primary CTA, nav | `document.elementFromPoint` at its centre must hit it (nothing laid over it) |
| `canvas[data-webgl]` | each WebGL canvas | `aria-hidden="true"`; `data-webgl-state` is truthful: `running` · `paused` · `fallback` · `lost` |
| `data-webgl-luma` | same canvas | mean luma 0–1 of the first frame (one `readPixels` after first draw); a black canvas fails |
| `[data-webgl-poster]` | sibling `<img>` | visible whenever state is `fallback`/`lost`; it is the LCP element; crossfades out only after the first frame |

`scripts/qa/fixtures/good/index.html` is a working reference of the whole contract (fallback, reduced motion,
pause off-screen, tab-hidden pause, context loss/restore, pixel cap, dynamic resolution). Start from it.

## 2. Budgets (`scripts/qa/budgets.json` is the source of truth)

| | Budget |
|---|---|
| Initial JS (gz) | no regression vs. baseline (331.8 KB). The WebGL layer is a **lazy chunk** that does not count, and must not appear in the initial bundle |
| LCP | ≤ 2.5 s desktop, ≤ 3.5 s mobile at 4× CPU throttle. LCP is the poster/hero text, never the canvas |
| CLS | ≤ 0.05 — reserve `aspect-ratio` for the stage so the canvas swapping in cannot move anything |
| Canvas pixels | ≤ 2.1 MP mobile, ≤ 4.2 MP desktop. Cap by **pixels** (`dpr *= sqrt(max/px)`), not only by `min(dpr, 2)` |
| First view | ≤ 1.6 MB mobile, ≤ 2.2 MB desktop (encoded, before first scroll) |
| Reduced motion | ≤ 6 `requestAnimationFrame` calls/s idle: one still frame, no loop |
| Touch targets | ≥ 44 × 44 px (inline links in running text exempt) |
| a11y | 0 serious/critical axe-core violations at WCAG 2.2 AA, at mobile, tablet and desktop |

## 3. Game-dev techniques, mapped to this design

The design is dark, deep green, with a large phone mock-up, glass cards floating around it, a floor light beam
and ambient glows. That vocabulary is exactly what these techniques are for.

| Technique | Use it for | Cost | Tier |
|---|---|---|---|
| **Frame-rate independent damping** — `x += (target − x) · (1 − e^(−k·dt))` | pointer/scroll parallax on cards and phone; never raw `lerp(a,b,0.1)` (speed depends on fps) | trivial | T1+ |
| **Fixed timestep + dt clamp** (`dt = min(dt, 0.05)`) | anything simulated; a backgrounded tab must not teleport on return | trivial | T1+ |
| **Dynamic resolution scaling** | EMA of frame time; sustained > 24 ms steps render scale 1 → 0.85 → … → 0.5, recovers slowly | small | T2 |
| **Quality tiers + capability probe** | `hardwareConcurrency`, `deviceMemory`, `saveData`, `WEBGL_debug_renderer_info` (SwiftShader/llvmpipe ⇒ T0), reduced motion ⇒ still frame | small | all |
| **Cull + pause** | `IntersectionObserver` + `visibilitychange` stop the loop; `frameloop: demand` when static | trivial | T2 |
| **GPU particles / instancing** | dust, spores, light motes: positions computed in the vertex shader from `uTime`; zero per-frame CPU work; count scales by tier | small | T2 |
| **Fullscreen fragment shader** | floor light beam, volumetric glow, slow noise-driven ambient — one triangle, no geometry | small | T2 |
| **Dithering (blue-noise / interleaved gradient noise)** | **dark gradients band badly in 8-bit.** Add ±0.5/255 noise in the shader (or a tiny noise overlay in CSS at T0/T1) | trivial | all |
| **Bake instead of compute** | pre-bake noise to a small texture; pre-render beams as sprites for T1 | saves GPU | T1/T2 |
| **Layered parallax (depth planes)** | phone, glass cards, glows, floor at different depths; DOM `translate3d` for text-bearing cards (crisp, accessible), canvas for non-text atmosphere | cheap | T1+ |
| **Scroll as a timeline** | one eased `progress` per section read in the rAF loop; CSS `animation-timeline: scroll()` where supported, JS fallback | cheap | T1+ |
| **Progressive loading** | poster → first frame → crossfade; compressed textures (KTX2/Basis, or AVIF/WebP for 2D); never block paint on an asset | — | all |
| **Context-loss recovery** | `webglcontextlost` → `preventDefault`, stop, show poster, state `lost`; on restore rebuild resources | small | T2 |

Not allowed: scroll-jacking libraries, full-page canvases behind all content, per-frame `setState`, animating
`width/height/top/left` (compositor properties only: `transform`, `opacity`), `preserveDrawingBuffer`, MSAA on mobile,
hover-only reveals, motion with no reduced-motion path.

## 4. WebGL engineering rules

- Create the context lazily (dynamic `import()` after first paint / on idle), `alpha:false`, `antialias:false`
  on mobile, `powerPreference:'high-performance'` only on desktop. Output sRGB, tone-map once.
- One renderer per page. Share it across sections via one fixed full-viewport canvas **or** a few small ones;
  decide in the architecture step and justify it against pixel budget and overdraw.
- Dispose everything you create (geometries, textures, render targets, programs) on unmount.
- Shaders: no dynamic loops, minimal branching, `mediump` where banding allows, noise from a texture on mobile,
  compile errors surfaced to the console in dev and swallowed to `fallback` in prod.
- iOS Safari caps total canvas memory and kills contexts under pressure: keep one small canvas where possible,
  and treat `lost` as normal, not exceptional.
- Pointer parallax needs `@media (hover:hover) and (pointer:fine)`. Touch gets scroll-driven or idle motion.

## 5. Responsive rules (all sizes)

- Fluid type and space with `clamp()`; layout with container queries where a component changes shape, media queries
  where the page does. Use `svh/dvh`, never `100vh`. Respect `env(safe-area-inset-*)`.
- Breakpoints are content-driven; the gate samples 320 · 360 · 375 · 390 · 412 · 430 · 600 (fold) · 768 · 820 · 1024 ·
  1280 · 1366 · 1440 · 1920 · 2560 · 3440 and landscape phone 844 × 390. No horizontal overflow at any of them.
- Hero degrades by **priority**, not by scale: headline → CTA → phone → the strongest two cards → the rest. Floating
  cards that would collide are dropped or restacked, never shrunk to illegibility.
- Ultrawide: content stays at a max measure (~1280 px) and centred; the background atmosphere extends.
- Landscape phone (short height): the hero must not assume 100svh is tall; the CTA stays above the fold.
- 200 % browser zoom and large system font: nothing clips or overlaps.
- Dark design: also check `prefers-contrast: more` does not break legibility; glass surfaces need a solid fallback.

## 6. What the gate does NOT cover (so a human or the workflow must)

- **Chrome only.** Safari/iOS and Firefox are not exercised; WebGL quirks live there. Test the T2 path on a real iPhone
  and a mid-range Android before launch.
- **No FPS gating.** Headless Chrome renders GL in software, so frame rate is meaningless there. Cost is bounded
  structurally (lazy chunk, pixel cap, pause off-screen, tiers) and profiled separately with the DevTools trace.
- **Looks.** Pixel-level fidelity to Figma and "does it feel good" are judged by the workflow's visual reviewers
  against Figma screenshots; the gate only checks section presence and rough heights at 1440.

## 7. Commands

```bash
npm run build && npm run qa            # quick matrix (4 viewports + no-WebGL + reduced-motion) against out/
npm run qa:full                        # all 18 viewports
node scripts/qa/check.mjs --url http://localhost:3000    # against the dev server
npm run qa:selftest                    # proves the gate itself still catches what it should
```

Reports land in `.qa/report.json`; screenshots in `.qa/shots/` (gitignored).

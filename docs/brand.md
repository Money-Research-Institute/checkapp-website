# Brand kit

The logo is the **3D DiDi icon** (decided in `docs/landing-decisions.md` D7, provenance in `docs/brand-provenance.md`).
Every file below is derived from `public/brand/source/didi-icon-master.png` by `scripts/brand/build-brand-kit.mjs`.
Nothing is redrawn, recoloured or re-rendered. Regenerate with:

```bash
node scripts/brand/build-brand-kit.mjs   # tiles, icons, favicon.ico (the manifest is src/app/manifest.ts)
npm run og:generate                      # public/og-default.png
node scripts/brand/verify-brand-kit.mjs  # reads every file back with sharp and checks its exact size
```

In React use `LogoMark` (the tile) or `Lockup` (tile + "CheckApp"), both in `src/components/brand/`. There is no second logo.

## Two kinds of asset

### 1. The tile (the logo on a page)

The master is cream, edge to edge. The tile is the master cut to a rounded square (corner radius **22.4 %** of the side) by `scripts/brand/make-tile.mjs`.
Cream vanishes on a white page, so the tile is lifted off it with **a soft shadow only, no rim**. This is the owner's choice.

| Size | Treatment | Why |
|---|---|---|
| 32 px and up | soft shadow: 3 % down, blur 3 % of the side, rgba(20,50,20,.38) | lifts cream off white and light grey |
| 16 and 24 px (and 28) | 1 px deep-green hairline (`#3E7D36`), no shadow | below 32 px a shadow is only blur and the tile disappears in a light browser tab |

Three tile sets exist, all as AVIF + WebP + PNG (lanczos3, a light sharpen at 64 px and below):

| Set | Files | Canvas | Use |
|---|---|---|---|
| bare | `public/brand/tile/didi-tile-{40,64,96,128,256,512}` | square, side = N | **What `LogoMark` renders.** Exact layout box. The shadow is CSS `drop-shadow(0 1px 2px rgba(20,50,20,.35))`, applied by the component. |
| lifted | `public/brand/tile/didi-tile-lifted-{40,64,96,128,256,512}` | N + 2 x round(0.12 N): 50, 80, 120, 158, 318, 634 | The shadow is baked in on a transparent, padded canvas. For places that cannot run CSS (emails, other sites, slides). The visible tile is N px. |
| hairline | `public/brand/tile/didi-tile-hairline-{16,24,28,32,48,56,64}` | square, side = N | `LogoMark` below 32 px (1x and 2x). The 32/48/56/64 entries exist as the 2x sources of the small marks. |

### 2. The full-bleed square (what the OS frames)

iOS, Android and the browser mask these themselves, so they have **no rim, no shadow and no rounded corners**.

| File | Size | Note |
|---|---|---|
| `public/brand/icons/icon-180.png`, `src/app/apple-icon.png` | 180 | apple-touch icon |
| `public/brand/icons/icon-192.png` | 192 | manifest, purpose `any` |
| `public/brand/icons/icon-512.png`, `src/app/icon.png` | 512 | manifest `any`, tab icon, JSON-LD logo |
| `public/brand/icons/maskable-512.png` | 512 | manifest, purpose `maskable` |

**Safe zone.** The master is tight: the leaf tip is 4.7 % from the top edge, outside the central 80 %. Rather than crop the face, the character is **scaled down and the cream background is
extended** by copying the master's own edge pixels (the edge is flat cream, so there is no seam; checked with the 80 % square and the circle overlaid):

- `icon-*`, `apple-icon`, `icon.png`: character at **93 %**, bottom-anchored (the shoulders already bleed off the master's bottom edge). Sprout top at 11.4 %, inside the 80 % square.
- `maskable-512`: character at **87.5 %**, centred on the minimal circle around the sprout tips, hood sides and chin (centre 517,436, radius 468 in master pixels), so all of it sits
  inside the Android safe circle (radius 40 %). The face is never smaller than about 87 % of the master.

### Favicon

`src/app/favicon.ico` holds three **PNG entries: 16, 32, 48** (written by `scripts/brand/write-ico.mjs`, no dependency). They are tiles with transparent corners, made by `makeTile`:

- **16**: hairline tile. The default light sharpen left the eyes muddy, so 16 px alone gets a stronger unsharp mask (sigma 0.7, m1 0.6, m2 1.6) after the tile is made. Eyes, cheeks and the sprout read; the smile does not (it cannot at 16 px).
- **32 and 48**: shadow tiles. A shadow needs a padded canvas, and an ICO entry must be exactly its size, so the tile inside is slightly smaller (26 px in the 32 canvas, 38 px in the 48 canvas).

## Minimum sizes

- **16 px**: the favicon only.
- **28 px**: the smallest the logo appears in the UI. Below 32 px `LogoMark` switches to the hairline tile by itself.
- `LogoMark` clamps anything under 16 px up to 16.

## Clear space

Keep a margin of **one quarter of the tile's side** (a 40 px tile: 10 px) clear of other elements on every side. The shadow lives inside that margin; never crowd it. In a `Lockup` the gap between tile and
wordmark is 30 % of the tile side.

## Do not

- **Do not recolour** the tile, tint it, put it in grayscale or swap the cream for another background. (`didi-icon-green.png` is a kept alternative, not part of the kit.)
- **Do not stretch or squash.** Width equals height, always. `LogoMark` sets both from one number.
- **Do not add a shadow, glow, outline or rim of your own.** The shadow is already part of the tile (baked, or the one CSS `drop-shadow` in `LogoMark`). Never stack a second one.
- **Do not round it again, crop it, rotate it or put it on a busy photo.**
- **Do not redraw, re-render or "improve" it**, and do not make a second logo. The full-body art (`didi-full-body.png`) is for large brand moments, never a logo.
- **Do not use the full-bleed squares as an on-page logo** (square corners, no lift): they are for the OS.

## Manifest: every asset and where it is used

Status says whether the place already points at the kit. Everything below is wired (foundation commit).

| Asset | Size | Used for | Status |
|---|---|---|---|
| `src/app/favicon.ico` | 16, 32, 48 | browser tab icon (`<link rel="icon">`, generated by Next from the file) | wired by file convention |
| `src/app/icon.png` | 512 | `<link rel="icon" type="image/png">` | wired by file convention |
| `src/app/apple-icon.png` | 180 | `<link rel="apple-touch-icon">` | wired by file convention |
| `src/app/manifest.ts` | | web app manifest (static export, base-path aware): name, black colours, three icons | wired by file convention, served as `/manifest.webmanifest` |
| `public/brand/icons/icon-192.png` | 192 | manifest, purpose `any` | via manifest |
| `public/brand/icons/icon-512.png` | 512 | manifest, purpose `any`; **JSON-LD `logo`** (`organizationSchema`, `mobileApplicationSchema`) | wired: `LOGO_URL` in `src/lib/constants.ts`, used by `src/lib/seo.ts` |
| `public/brand/icons/maskable-512.png` | 512 | manifest, purpose `maskable` | via manifest |
| `public/brand/icons/icon-180.png` | 180 | same art as `apple-icon.png`, for direct links | available |
| `public/brand/icons/favicon-{16,32,48}.png` | 16, 32, 48 | the ICO entries as plain PNGs (e.g. `<link sizes>` or docs) | available |
| `public/og-default.png` | 1200 x 630 | Open Graph and Twitter card (`DEFAULT_OG_IMAGE = '/og-default.png'` in `src/lib/constants.ts`), made by `npm run og:generate` | wired |
| `public/brand/tile/didi-tile-{40..512}` | 40-512 | **header and footer** logo through `LogoMark` / `Lockup` | wired: `Header` (`LogoMark` 28 px + wordmark) and `Footer` (`Lockup`) |
| `public/brand/tile/didi-tile-hairline-{16..64}` | 16-64 | `LogoMark` below 32 px | via `LogoMark` |
| `public/brand/tile/didi-tile-lifted-{40..512}` | 50-634 canvas | self-contained shadowed tile for emails, decks, embeds | available |
| `public/brand/source/*` | 1024 | masters; input only, never served on a page | do not edit |

`LogoMark` props: `size` (CSS px, default 40), `decorative` (alt is empty; use it when the text "CheckApp" sits next to the mark), `priority` (eager + high fetch priority for the header and hero mark),
`className`. Alt text is **"CheckApp"** when the mark stands alone and **""** when decorative. `Lockup` always marks the tile decorative because the wordmark carries the name.

## Open Graph image

`scripts/generate-og-image.js` draws the master (rounded 22.4 %) on the right of a `#07130c` canvas and the wordmark in Bricolage Grotesque and the headline and sub-line in Manrope (docs/landing-decisions.md D4; no health claims are baked into the raster, D1). The fonts are
committed as `scripts/brand/fonts/*.woff2` (latin subsets, SIL OFL, taken from the Next font build) so the script does not depend on `.next/`. It renders with headless Chrome (`playwright-core`, `channel: 'chrome'`,
the same as the QA gate) and refuses to write anything that is not exactly 1200 x 630.

# CheckApp Marketing Website

Static marketing site for [CheckApp](https://checkapp.today), the wellness companion app featuring DiDi.

Built with **Next.js 16** (App Router, `output: "export"`, `trailingSlash: true`), **Tailwind CSS v4**, **MDX** blog content, and a
small CSS-first motion system with one lazy WebGL canvas on the landing hero. Dark theme only.

## Quick start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## How the code is laid out

| Path | What lives there |
|------|------------------|
| `src/styles/` | Design tokens (`tokens.css`), the motion vocabulary (`motion.css`), atmosphere utilities (`fx.css`). `src/app/globals.css` maps them into Tailwind v4. |
| `src/components/ds/` | The design system: `CtaButton`, `Button`, `Eyebrow`, `GradientHeading`, `SectionIntro`, `Container`, `PageShell`/`PageHero`/`Section`, `GlassCard`, `Prose`, `Faq`, form fields, `Picture`, icons. See [docs/design-system.md](./docs/design-system.md). |
| `src/components/brand/` | `LogoMark` and `Lockup`: the only way the logo is drawn ([docs/brand.md](./docs/brand.md)). |
| `src/components/layout/` | `Header`, `Footer`, `MobileCtaBar`, `CookieConsent`, analytics glue, `JsonLd`. |
| `src/components/landing/<slug>/` | One folder per landing section; `src/app/page.tsx` composes them. |
| `scripts/brand/`, `scripts/assets/` | Offline asset pipelines (`sharp`): the logo kit, the AVIF/WebP encoder, the dither tile. |
| `scripts/qa/` | The quality gate: one ~100-line smoke test, about 10 seconds after a build ([docs/landing.md](./docs/landing.md)). |
| `docs/landing-decisions.md` | Decisions that override Figma (copy, testimonials, fonts, mascot, logo). Authoritative. |

Fonts (Manrope, Inter, Bricolage Grotesque only) come from `next/font/google` in `src/app/layout.tsx`.

## Quality gate

```bash
npm run build && npm run qa    # four landing pages x two viewports against out/, ~10 s
```

## Pages

| Route | Description |
|-------|-------------|
| `/` | Home: hero, the usual way, meet DiDi, 4P, testimonials, how it works, FAQ, final CTA |
| `/how-it-works` | Daily routine, tongue scan, krugocheks, science |
| `/features` | Feature grid, comparison table, pricing |
| `/about` | Origin story, team, values, transparency |
| `/blog` | SEO content hub |
| `/blog/[slug]` | Individual articles with FAQ schema |
| `/privacy` | Privacy policy |
| `/terms` | Terms of service |

## Environment variables

Copy `.env.example` to `.env.local`:

```bash
NEXT_PUBLIC_SITE_URL=https://checkapp.today
NEXT_PUBLIC_POSTHOG_KEY=phc_...        # optional
NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com
```

## Adding a blog post

Create `content/blog/your-slug.mdx` with frontmatter:

```yaml
---
title: "Your Article Title"
description: "150-160 char meta description"
datePublished: "2026-06-01"
dateModified: "2026-06-01"
author:
  name: "Author Name"
  role: "Role"
category: "Hydration Science"
readTime: 8
featured: false
checkedBy: "Wellness Advisor Name"
faq:
  - question: "Question?"
    answer: "Answer."
sources:
  - label: "WHO"
    url: "https://..."
---
```

Every article must include:
- Direct answer in the first paragraph
- H2 headings phrased as questions
- FAQ section (4+ items)
- External citations
- Internal links to `/features` and `/how-it-works`

## Assets

Raw Figma exports are never committed. Encode them offline, then commit the output under `public/landing/<slug>/`:

```bash
node scripts/assets/encode.mjs <raw.png> public/landing/<slug> <name> --widths 640,1080,1472   # 10-bit AVIF + WebP
node scripts/assets/make-noise.mjs                                                           # the shared dither tile
node scripts/brand/build-brand-kit.mjs && npm run og:generate                                # the logo kit and the OG image
```

## Deployment (Vercel)

1. Push this repo to GitHub
2. Import in [Vercel](https://vercel.com)
3. Set domain `checkapp.health`
4. Add env vars from `.env.example`
5. Enable Vercel Analytics in project settings

Build command: `npm run build` (auto-generates `sitemap.xml` via postbuild)

**Note:** Do not set `GITHUB_PAGES_BASE_PATH` on Vercel — that variable is only for GitHub Pages project-site builds.

## Deployment (GitHub Pages — client preview)

Static export is configured (`output: 'export'`). The site deploys automatically via GitHub Actions on push to `main`.

### One-time GitHub setup

1. Push repo to GitHub
2. **Settings → Pages → Source** → select **GitHub Actions**
3. (Optional) Add PostHog secrets under **Settings → Secrets → Actions**

Live URL: `https://<username>.github.io/<repo-name>/`

The workflow sets `GITHUB_PAGES_BASE_PATH=/<repo-name>` automatically so assets and routes work on project pages.

### Preview locally

```bash
npm run build
npm run preview   # serves ./out
```

For a subpath preview matching GitHub Pages:

```bash
GITHUB_PAGES_BASE_PATH=/checkapp-website npm run build
npx serve out
```

See [DEPLOY_TO_GITHUB_PAGES.md](./DEPLOY_TO_GITHUB_PAGES.md) for full details.

### Custom domain on GitHub Pages

1. Create `public/CNAME` with your domain (e.g. `checkapp.health`)
2. Remove or override `GITHUB_PAGES_BASE_PATH` in the workflow (leave it unset for root hosting)
3. Set `NEXT_PUBLIC_SITE_URL` to your domain in workflow env

## SEO / GEO checklist

- [ ] Replace TestFlight URL in `src/lib/constants.ts`
- [ ] Submit sitemap to Google Search Console
- [ ] Verify robots.txt allows AI bots (GPTBot, ClaudeBot, etc.)
- [ ] Test OG images at [opengraph.xyz](https://www.opengraph.xyz)
- [ ] Run Lighthouse — target ≥ 90 Performance, Accessibility, SEO
- [ ] Set up Bing Webmaster Tools

## Launch checklist (week 1)

- [ ] All 7 pages live and mobile-responsive
- [ ] TestFlight link working
- [ ] Publish first 3 blog articles (done — see `content/blog/`)
- [ ] Submit to Product Hunt
- [ ] Submit to AI tool directories (theresanaiforthat.com, futurepedia.io)

## Pricing note

Marketing site pricing copy (TZ spec) may differ from the mobile app's `subscriptionPlans.ts`. Marketing leads product — align before public launch.

## TODO

- Replace TestFlight URL: `src/lib/constants.ts`
- Replace team photos/bios: `src/app/about/page.tsx`

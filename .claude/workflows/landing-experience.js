export const meta = {
  name: 'landing-experience',
  description: 'ریدیزاین لندینگ CheckApp از Figma با تجربه‌ی WebGL/گیم‌دِو، ریسپانسیو برای همه‌ی اندازه‌ها، با گیت کیفیت قطعی که تا سبز نشدن تکرار می‌شود',
  whenToUse: 'Run after docs/experience-playbook.md and scripts/qa exist. First run with args {stopAfter:"architecture"} to review the plan, then run again without it to build.',
  phases: [
    { title: 'بریف', detail: 'هر سکشن Figma یک تحلیلگر + استخراج توکن‌ها' },
    { title: 'طراحی تجربه', detail: '۳ طرح مستقل → ۳ داور با زاویه‌ی متفاوت → ترکیب برنده' },
    { title: 'معماری', detail: 'فایل‌ها، قراردادها، مالکیت فایل برای هر ایجنت' },
    { title: 'پایه', detail: 'وابستگی‌ها، توکن‌ها، موتور WebGL با قرارداد playbook' },
    { title: 'ساخت', detail: 'هر سکشن موازی (مالکیت جدا) + یکپارچه‌سازی' },
    { title: 'گیت کیفیت', detail: 'اجرای گیت قطعی + بازبین‌های بصری + راستی‌آزمایی مخالف + رفع، تا سبز شدن' },
    { title: 'بازبینی نهایی', detail: 'منتقد کامل‌بودن: چه چیزی پوشش داده نشد' },
  ],
}

/* ------------------------------------------------------------------ config */
const A = args ?? {}
const SITE = A.site ?? '/Users/kave/Repos/checkapp-website'
const MAX_ROUNDS = A.maxRounds ?? 5
const STOP_AFTER = A.stopAfter ?? null // 'brief' | 'plan' | 'architecture'
const FIGMA = 'FSJqiLATooQsiMWs9OISQW'

// Mirror of scripts/qa/figma-sections.json (the file is the source of truth; this only fans out the Brief).
const SECTIONS = [
  { slug: 'hero', node: '2601:12436', name: 'hero' },
  { slug: 'usual-way', node: '2601:12628', name: '02-the usual way' },
  { slug: 'familiar', node: '2601:12718', name: '03-familar (4 iPhone mock-ups)' },
  { slug: 'projects', node: '2601:12989', name: 'Projects (grid, ambient glow)' },
  { slug: 'features', node: '2601:13023', name: 'Frame 2147238592 (unnamed, analyst names it)' },
  { slug: 'process', node: '2601:12435', name: 'three numbered steps, unframed: nodes 2601:12435, 2601:12434, 2601:13092 and frames 2601:13093, 2601:13098, 2601:13104' },
  { slug: 'faqs', node: '2610:30003', name: 'FAQs' },
  { slug: 'data-card', node: '2601:13109', name: 'node · Data card with blobs' },
  { slug: 'footer', node: '2601:12661', name: '10-footer' },
]

const COMMON = [
  `Repository: ${SITE} (Next.js static export, branch feat/landing-experience). The session's working directory is a DIFFERENT repo (the mobile app): never read or edit anything outside ${SITE}; use absolute paths or cd there first.`,
  'Read AGENTS.md and the Next.js docs it points to (node_modules/next/dist/docs) before writing any Next code. next.config has output:"export" and trailingSlash:true: no server runtime, no API routes, no next/image optimisation.',
  'Read docs/experience-playbook.md in full and obey it: the DOM contract, the budgets, the tiers, and the list of disallowed techniques. scripts/qa/fixtures/good/index.html is a working reference of the WebGL contract.',
  `Sections source of truth: scripts/qa/figma-sections.json. Design: Figma file ${FIGMA}, Landing node 2601:12433 (1440x9766). Figma tools are MCP tools: load them with ToolSearch (mcp__figma__get_design_context, mcp__figma__get_screenshot, mcp__figma__get_metadata). Invoke the figma:figma-design-to-code skill BEFORE calling get_design_context.`,
  'Git: local commits only, on feat/landing-experience. Never push. Never switch branch. Never touch main.',
  'Your final text is a return value, not a message to a person. Return exactly what the schema asks for.',
].join('\n')

// Appended to every prompt AFTER the architecture phase. Earlier prompts are deliberately untouched so a resumed run keeps its cache.
const GATE_RULES = [
  'THE GATE IS READ-ONLY. Never edit scripts/qa/check.mjs, budgets.json, static-server.mjs, serve.mjs or selftest.mjs, and never loosen a budget. This OVERRULES the architecture plan wherever it lets foundation edit check.mjs.',
  'Only scripts/qa/figma-sections.json (slug renames, provisional flags) and the section markup of scripts/qa/fixtures/good/index.html may change.',
  'The capability probe must honour window.__QA_FORCE_GL === true (set only by the gate). The architecture\'s "?fx=2" URL override is REJECTED: ship no URL-parameter or storage override for the GL tier.',
  'The full gate walks every existing route (budgets.pagesFull) and applies the section contract to "/" only. Moving existing routes into a route group must keep every URL identical (trailing slash included) and keep /delete-account, /auth/callback and /download working.',
].join('\n')

/* ----------------------------------------------------------------- schemas */
const str = { type: 'string' }
const strs = { type: 'array', items: str }

const SPEC = {
  type: 'object',
  properties: {
    slug: str,
    title: str,
    summary: str,
    layout1440: str,
    content: strs,
    assets: { type: 'array', items: { type: 'object', properties: { name: str, nodeId: str, format: str, note: str }, required: ['name', 'nodeId'] } },
    interactions: strs,
    responsive: { type: 'object', properties: { mobile: str, tablet: str, desktop: str, ultrawide: str }, required: ['mobile', 'tablet', 'desktop', 'ultrawide'] },
    experience: { type: 'array', items: { type: 'object', properties: { idea: str, technique: str, tier: { type: 'string', enum: ['T0', 'T1', 'T2'] }, cost: str }, required: ['idea', 'technique', 'tier'] } },
    risks: strs,
    referencePng: str,
  },
  required: ['slug', 'summary', 'layout1440', 'content', 'responsive', 'experience'],
}

const TOKENS = {
  type: 'object',
  properties: { colors: strs, gradients: strs, typography: strs, radii: strs, shadowsAndGlass: strs, spacing: strs, notes: strs },
  required: ['colors', 'typography'],
}

const PLAN = {
  type: 'object',
  properties: {
    angle: str,
    stack: { type: 'object', properties: { library: str, why: str, estimatedGzKB: { type: 'number' } }, required: ['library', 'why'] },
    heroConcept: str,
    perSection: { type: 'array', items: { type: 'object', properties: { slug: str, effect: str, technique: str, tier: str, cost: str }, required: ['slug', 'effect', 'tier'] } },
    tiers: { type: 'object', properties: { T0: str, T1: str, T2: str }, required: ['T0', 'T1', 'T2'] },
    budgetFit: str,
    risks: strs,
  },
  required: ['angle', 'stack', 'heroConcept', 'perSection', 'tiers', 'budgetFit'],
}

const SCORES = {
  type: 'object',
  properties: { scores: { type: 'array', items: { type: 'object', properties: { angle: str, score: { type: 'number' }, reason: str, dealbreaker: str }, required: ['angle', 'score', 'reason'] } } },
  required: ['scores'],
}

const ARCH = {
  type: 'object',
  properties: {
    summary: str,
    dependencies: { type: 'array', items: { type: 'object', properties: { name: str, why: str, estimatedGzKB: { type: 'number' } }, required: ['name', 'why'] } },
    sectionSlugRenames: { type: 'array', items: { type: 'object', properties: { from: str, to: str }, required: ['from', 'to'] } },
    tasks: {
      type: 'array',
      items: {
        type: 'object',
        properties: { id: str, kind: { type: 'string', enum: ['foundation', 'section'] }, slug: str, title: str, owns: strs, brief: str },
        required: ['id', 'kind', 'title', 'owns', 'brief'],
      },
    },
    lazyBoundary: str,
    contracts: strs,
  },
  required: ['summary', 'dependencies', 'tasks', 'lazyBoundary'],
}

const GATE = {
  type: 'object',
  properties: {
    ok: { type: 'boolean' },
    level: str,
    buildOk: { type: 'boolean' },
    seconds: { type: 'number' },
    blocking: { type: 'array', items: { type: 'object', properties: { id: str, count: { type: 'number' }, where: str, message: str, detail: str }, required: ['id', 'message'] } },
    warnings: { type: 'array', items: { type: 'object', properties: { id: str, count: { type: 'number' }, message: str }, required: ['id', 'message'] } },
    notes: str,
  },
  required: ['ok', 'buildOk', 'blocking'],
}

const FINDINGS = {
  type: 'object',
  properties: {
    findings: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          title: str, section: str, viewport: str,
          severity: { type: 'string', enum: ['blocker', 'important', 'polish'] },
          symptom: str, evidence: str, fix: str,
        },
        required: ['title', 'severity', 'symptom', 'evidence', 'fix'],
      },
    },
  },
  required: ['findings'],
}

const VERDICT = { type: 'object', properties: { refuted: { type: 'boolean' }, reason: str }, required: ['refuted', 'reason'] }

const TRIAGE = {
  type: 'object',
  properties: { assignments: { type: 'array', items: { type: 'object', properties: { ref: str, owner: str, why: str }, required: ['ref', 'owner'] } } },
  required: ['assignments'],
}

const DONE = { type: 'object', properties: { summary: str, commit: str, buildOk: { type: 'boolean' }, filesTouched: strs, openIssues: strs }, required: ['summary', 'buildOk'] }

/* ============================================================ 1. BRIEF === */
phase('بریف')
log('هر سکشن Figma توسط یک تحلیلگر خوانده می‌شود؛ هم‌زمان توکن‌های طراحی استخراج می‌شود')

const briefOne = (s) =>
  agent(
    [
      COMMON,
      `\nYou are the analyst for ONE section: slug "${s.slug}", Figma node ${s.node} (${s.name}).`,
      'Steps:',
      '1. Load the Figma tools and the figma:figma-design-to-code skill. Call get_design_context on the node, and get_screenshot at maxDimension 1600.',
      `2. Download the screenshot with curl to ${SITE}/.qa/figma/${s.slug}.png (mkdir -p first). Set referencePng to that path.`,
      '3. Describe layout at 1440 precisely (grid, spacing, alignment, z-order, what overlaps what), inventory every text/image/icon, and list the assets that must be exported (node id + format; prefer AVIF/WebP for photos and SVG for icons).',
      '4. Figma only has the 1440 desktop design. Write a concrete responsive plan for mobile (320-430, incl. landscape phone), tablet (600-1024, incl. a foldable at ~600), desktop (1280-1920) and ultrawide (2560-3440): what reflows, what is dropped by priority, what stays. Not "stacks vertically": say how.',
      '5. List experience ideas that use game-dev/WebGL techniques from the playbook table where they genuinely fit this section, each with its tier and cost. Prefer fewer, better ideas. Say plainly when a section is best left as plain DOM.',
      '6. If the section is unframed or unnamed in Figma, name it from what it actually shows, and say so in summary.',
      'Do not write any code.',
    ].join('\n'),
    { label: `بریف · ${s.slug}`, phase: 'بریف', schema: SPEC },
  )

const tokensAgent = agent(
  [
    COMMON,
    '\nExtract the design tokens of the whole Landing from Figma (get_variable_defs if variables exist, otherwise read them from get_design_context of the hero, a content section and the footer).',
    'Return exact values: every colour with its role, gradients (angle + stops), the type scale (family, size, weight, line-height, tracking), radii, shadows and the glass/blur recipe of the floating cards, spacing rhythm. Flag any value that looks inconsistent across sections in notes.',
    'Do not write any code.',
  ].join('\n'),
  { label: 'بریف · توکن‌های طراحی', phase: 'بریف', schema: TOKENS },
)

const [specsRaw, tokens] = await Promise.all([pipeline(SECTIONS, briefOne), tokensAgent])
const specs = specsRaw.filter(Boolean)
if (specs.length !== SECTIONS.length) log(`هشدار: فقط ${specs.length} از ${SECTIONS.length} سکشن بریف شدند؛ سکشن‌های جاافتاده به‌صورت دستی بررسی شوند`)
if (!tokens) log('هشدار: استخراج توکن شکست خورد')
if (STOP_AFTER === 'brief') return { stoppedAfter: 'brief', specs, tokens }

/* ================================================ 2. EXPERIENCE DESIGN === */
phase('طراحی تجربه')
log('سه طرح مستقل با سه زاویه‌ی متفاوت؛ سپس سه داور')

const ANGLES = [
  { key: 'atmosphere', brief: 'ATMOSPHERE-FIRST: DOM carries every card, phone and text (crisp, accessible); one lazily loaded raw-WebGL2/tiny-lib canvas draws the light beam, volumetric glow and GPU particles behind them; depth comes from damped parallax on the DOM layers.' },
  { key: 'object', brief: 'OBJECT-FIRST: the hero phone is a real 3D object (rounded body, screen texture, reflections, scroll- and pointer-driven rotation) with a restrained atmosphere around it. Be honest about the asset weight and the library it needs.' },
  { key: 'lean', brief: 'LEAN: CSS 3D transforms + Canvas2D + CSS scroll-driven animations do almost everything; WebGL is used for exactly one effect (the floor beam) or not at all. Maximum robustness and smallest bundle.' },
]

const specsJson = JSON.stringify(specs)
const tokensJson = JSON.stringify(tokens)

const plans = (
  await parallel(
    ANGLES.map((a) => () =>
      agent(
        [
          COMMON,
          `\nDesign the experience layer for the whole landing page from this angle: ${a.brief}`,
          'Inputs (from the Brief phase):',
          `SECTION SPECS: ${specsJson}`,
          `TOKENS: ${tokensJson}`,
          'Rules: pick techniques only from the playbook table or justify an addition; give every section an effect (or "none, plain DOM") with its tier; define what T0, T1 and T2 each look like; estimate the lazy chunk size and say how you would verify it; say how it fits every budget in the playbook. State the library choice and its real cost. Think about the weakest viewport (320 px wide, 4x throttled CPU) first.',
          'Do not write code.',
        ].join('\n'),
        { label: `طرح تجربه · ${a.key}`, phase: 'طراحی تجربه', schema: PLAN },
      ),
    ),
  )
).filter(Boolean)

if (!plans.length) throw new Error('هیچ طرح تجربه‌ای تولید نشد')

const LENSES = [
  'WOW AND BRAND: which plan makes this page feel premium, alive and memorable for a health-companion audience without being gimmicky, and stays faithful to the Figma look?',
  'PERFORMANCE AND ROBUSTNESS: which plan survives a low-end Android on 4x throttled CPU, iOS Safari canvas limits, WebGL loss, no-WebGL, reduced motion and the playbook budgets?',
  'BUILDABILITY AND ACCESSIBILITY: which plan can actually be built and kept correct in a static Next export, keeps all content in DOM, passes WCAG 2.2 AA, and is maintainable?',
]
const judgments = (
  await parallel(
    LENSES.map((lens, i) => () =>
      agent(
        [
          COMMON,
          `\nYou are judge ${i + 1} of 3. Lens: ${lens}`,
          `PLANS: ${JSON.stringify(plans)}`,
          'Score each plan 1-10 through your lens only, with a concrete reason. If a plan has a dealbreaker under your lens, name it.',
        ].join('\n'),
        { label: `داور ${i + 1}`, phase: 'طراحی تجربه', schema: SCORES },
      ),
    ),
  )
).filter(Boolean)

const finalPlan = await agent(
  [
    COMMON,
    '\nSynthesise the FINAL experience plan. Start from the plan with the best judged outcome (weigh dealbreakers heavily, do not just average), then graft the best ideas from the others where they fit the budgets.',
    `PLANS: ${JSON.stringify(plans)}`,
    `JUDGMENTS: ${JSON.stringify(judgments)}`,
    'Return one coherent plan in the same schema. In budgetFit, state explicitly which budget is tightest and what you cut to stay inside it.',
  ].join('\n'),
  { label: 'ترکیب طرح نهایی', phase: 'طراحی تجربه', schema: PLAN, effort: 'high' },
)
log(`طرح نهایی: ${finalPlan.angle} · ${finalPlan.stack.library}`)
if (STOP_AFTER === 'plan') return { stoppedAfter: 'plan', specs, tokens, plans, judgments, finalPlan }

/* ============================================================ 3. ARCHITECTURE === */
phase('معماری')
const arch = await agent(
  [
    COMMON,
    '\nYou are the architect. Turn the specs and the final experience plan into a build plan.',
    `SECTION SPECS: ${specsJson}`,
    `TOKENS: ${tokensJson}`,
    `FINAL PLAN: ${JSON.stringify(finalPlan)}`,
    'Inspect the current src/ (layout, globals.css, components, existing pages) so the plan fits what exists; keep existing routes (/, /download, /features, /blog, /privacy, /terms, /delete-account, /auth/callback, ...) working and keep their SEO metadata, JSON-LD and analytics.',
    'Output:',
    '- dependencies to add (each with the reason and an estimated gz size). Prefer none or tiny. No dependency without a reason.',
    '- sectionSlugRenames for any provisional slug in scripts/qa/figma-sections.json that the Brief named better (the foundation task will update that file).',
    '- tasks: ONE "foundation" task (deps, tokens as CSS variables, layout shell, page.tsx composing every section with placeholders, the lazy ExperienceCanvas engine following the playbook contract: capability probe, tiers, pause off-screen/hidden, context loss, pixel cap, dynamic resolution, poster/fallback, reduced motion) and ONE "section" task per section. Every task lists `owns`: the exact files/dirs it may create or edit. Ownership must be DISJOINT across tasks: no file may be owned twice. Section tasks may only import from foundation outputs. Each section task also owns its own asset directory under public/ (for example public/landing/<slug>/).',
    '- lazyBoundary: exactly where the dynamic import() sits and why that keeps WebGL out of the initial bundle and out of LCP.',
    '- contracts: the props/attributes shared between foundation and sections (e.g. the hook sections use to register a light, the data-attributes).',
    'Do not write product code.',
  ].join('\n'),
  { label: 'معماری', phase: 'معماری', schema: ARCH, effort: 'high' },
)

const owned = new Map()
const clash = []
for (const t of arch.tasks) for (const f of t.owns) { if (owned.has(f) && owned.get(f) !== t.id) clash.push(`${f}: ${owned.get(f)} vs ${t.id}`); owned.set(f, t.id) }
if (clash.length) log(`هشدار: مالکیت فایل‌ها هم‌پوشانی دارد (احتمال تداخل ایجنت‌ها): ${clash.slice(0, 5).join(' | ')}`)
if (STOP_AFTER === 'architecture') return { stoppedAfter: 'architecture', specs, tokens, finalPlan, arch, ownershipClashes: clash }

/* ============================================================ 4. FOUNDATION === */
phase('پایه')
const foundationTask = arch.tasks.find((t) => t.kind === 'foundation')
const foundation = await agent(
  [
    COMMON,
    GATE_RULES,
    '\nYou are the foundation builder. Implement the foundation task and nothing else.',
    `TASK: ${JSON.stringify(foundationTask)}`,
    `ARCHITECTURE: ${JSON.stringify({ summary: arch.summary, dependencies: arch.dependencies, lazyBoundary: arch.lazyBoundary, contracts: arch.contracts, renames: arch.sectionSlugRenames })}`,
    `FINAL PLAN: ${JSON.stringify(finalPlan)}`,
    `TOKENS: ${tokensJson}`,
    `SECTION TASKS (create a placeholder component for each, owned by that task, so page.tsx compiles): ${JSON.stringify(arch.tasks.filter((t) => t.kind === 'section').map((t) => ({ id: t.id, slug: t.slug, owns: t.owns })))}`,
    'Every placeholder renders <section data-section="<slug>" data-figma-node="<node>"> so the gate contract holds from the first commit. Apply slug renames in scripts/qa/figma-sections.json.',
    'The engine must follow scripts/qa/fixtures/good/index.html (and the playbook) exactly where it defines the contract. Verify yourself: run `npm run build`, then `node scripts/qa/check.mjs --viewports selftest --no-sections` and fix what the gate reports. Install only the dependencies the architecture lists. Commit when green (feat(landing): foundation ...).',
  ].join('\n'),
  { label: 'پایه · موتور و قالب', phase: 'پایه', schema: DONE, effort: 'high' },
)
if (!foundation || !foundation.buildOk) throw new Error(`پایه ساخته نشد: ${foundation ? foundation.summary : 'agent failed'}`)
log(`پایه آماده: ${foundation.summary}`)

/* ============================================================ 5. BUILD === */
phase('ساخت')
const sectionTasks = arch.tasks.filter((t) => t.kind === 'section')
log(`ساخت ${sectionTasks.length} سکشن به‌صورت موازی؛ هر ایجنت فقط فایل‌های خودش را می‌نویسد`)

const built = (
  await pipeline(sectionTasks, (t) => {
    const spec = specs.find((x) => x.slug === t.slug) ?? null
    const plan = finalPlan.perSection.find((x) => x.slug === t.slug) ?? null
    return agent(
      [
        COMMON,
        GATE_RULES,
        `\nYou build ONE section: "${t.slug}". Other agents are building the other sections at the same time in the same working tree.`,
        `TASK: ${JSON.stringify(t)}`,
        `SPEC: ${JSON.stringify(spec)}`,
        `EXPERIENCE PLAN FOR THIS SECTION: ${JSON.stringify(plan)}`,
        `SHARED: ${JSON.stringify({ contracts: arch.contracts, lazyBoundary: arch.lazyBoundary, tokens: 'use the CSS variables the foundation created in globals.css' })}`,
        `Reference image: ${spec ? spec.referencePng : '(none)'}: compare your result against it visually.`,
        'Rules:',
        `- Edit ONLY the paths in "owns" (${t.owns.join(', ')}). If you need something from foundation or another section, use its public contract; if the contract is missing, say so in openIssues instead of editing it.`,
        '- Do NOT run `next build` or commit (parallel builds and commits collide). Run `npx tsc --noEmit` and ignore errors in files you do not own.',
        '- Export the section with <section data-section data-figma-node>, mark the h1/primary CTA/nav with data-critical where your section has them.',
        '- Implement ALL three responsive plans from the spec and the T0/T1/T2 behaviour from the experience plan. Compositor-only animation, reduced-motion path for every motion, no hover-only interaction, touch targets >= 44px.',
        '- Do NOT start a dev server: Next allows one per directory and the other builders share it. Compare your work against the reference image by reading the code against it; the gate loop renders and reviews everything visually after integration.',
        '- Assets: export every asset in SPEC.assets from Figma into your owned public/ directory (use the asset URLs get_design_context returns, or the Figma download tool). Optimise (AVIF/WebP for photos, SVG for icons, sensible dimensions: the first-view budget is real). Never hotlink Figma URLs; they expire.',
      ].join('\n'),
      { label: `ساخت · ${t.slug}`, phase: 'ساخت', schema: DONE },
    )
  })
).filter(Boolean)

const integ = await agent(
  [
    COMMON,
    GATE_RULES,
    '\nYou are the integrator. Section builders have finished editing the working tree in parallel.',
    `REPORTS: ${JSON.stringify(built)}`,
    'Do: `npx tsc --noEmit`, `npm run lint` (compare against the known baseline of 8 errors / 7 warnings on main: do not add to it), `npm run build`. Fix cross-file problems (imports, duplicate declarations, contract mismatches) and anything the builders listed in openIssues that is a seam between tasks. Do not redesign sections.',
    'Then commit everything: feat(landing): sections. Report the commit and the build status.',
  ].join('\n'),
  { label: 'یکپارچه‌سازی', phase: 'ساخت', schema: DONE, effort: 'high' },
)
if (!integ || !integ.buildOk) log(`هشدار: یکپارچه‌سازی build سبز نداد: ${integ ? integ.summary : 'agent failed'}`)

/* ============================================================ 6. QUALITY GATE LOOP === */
phase('گیت کیفیت')

const gatePrompt = (level, round) =>
  [
    COMMON,
    `\nYou run the deterministic quality gate, round ${round}, level "${level}". You do NOT edit source code.`,
    `0. Tamper check: BASE=$(git log --format=%h -1 --grep='gate-baseline'); run \`git diff --stat $BASE -- scripts/qa/check.mjs scripts/qa/budgets.json scripts/qa/static-server.mjs scripts/qa/serve.mjs scripts/qa/selftest.mjs\`. If it prints anything, return ok:false with ONE blocking issue id "gate-tampered" naming the files, and stop: do not run the gate.`,
    `1. If \`git status --short\` shows changes, commit them first: git add -A && git commit -m "fix(landing): QA round ${round - 1} fixes".`,
    `2. Run: npm run build   (if it fails, return ok:false, buildOk:false and put the compiler errors in blocking[] with id "build").`,
    `3. Run: ${level === 'full' ? 'npm run qa:full' : 'npm run qa'}   (several minutes: use a 10-minute timeout, or run it in the background and wait for it to exit; never report before it has exited).`,
    '4. Read .qa/report.json and return it faithfully: ok, every BLOCKING issue grouped by id (count, the viewports/modes where it happened, the first message and its detail lines), the warnings, seconds.',
    'Never soften, drop or reinterpret a result. If the gate crashes, say so in notes and set ok:false.',
  ].join('\n')

const reviewers = [
  { key: 'mobile', lens: 'phones 320/360/375/390/412/430 wide and landscape 844x390 and the 600px fold: is it beautiful, balanced, legible and thumb-friendly, or just "not broken"? Is the hero strong above the fold? Are dropped elements dropped in priority order?' },
  { key: 'tablet', lens: 'tablets 768/820 portrait and 1024 landscape: layout rhythm, wasted space, awkward in-between states between phone and desktop breakpoints' },
  { key: 'desktop', lens: 'desktop 1280/1366/1440/1920 against the Figma reference PNGs in .qa/figma/: fidelity section by section (spacing, type, colour, glass, glow, composition), consistency of the whole page' },
  { key: 'wide', lens: 'ultrawide 2560 and 3440: max measure, background atmosphere extending, nothing stretched, nothing floating in empty space' },
  { key: 'motion', lens: 'LIVE behaviour in a browser (serve with `node scripts/qa/serve.mjs 4173`; if the port is busy a server from an earlier round is already serving out/, reuse it; then use the browser tools): WebGL runs and looks right, shader/console errors, simulate WEBGL_lose_context loss and restore, reduced motion, tab hidden pause, scroll feel (no jank, no hijack), parallax smoothness, touch vs hover behaviour, loading sequence (poster -> crossfade, no flash, no layout jump)' },
]

const reviewPrompt = (r, round) =>
  [
    COMMON,
    `\nYou are a visual/experience reviewer, round ${round}. Lens: ${r.lens}`,
    'Screenshots from the gate are in .qa/shots/home/<viewport>-fold.png and -full.png (look at them with the Read tool: actually LOOK, never assume). Figma references are in .qa/figma/<slug>.png.',
    'Report only real defects you can point at: a screenshot path + what is visible in it, or a measurement/console line you produced. Rank honestly: blocker = broken, unreadable, ugly enough to embarrass the brand, or violates the playbook; important = clearly below the bar; polish = nice to have (list at most 3 polish items).',
    'Quality bar: the output must be uniformly good at every size, not great at 1440 and acceptable elsewhere. Do not report anything the deterministic gate already reports; it will be fixed separately.',
    'Do not edit code.',
  ].join('\n')

const verifyPrompt = (f, lens) =>
  [
    COMMON,
    `\nAdversarially check this finding. Lens: ${lens}. Try hard to REFUTE it: open the cited evidence, re-measure, look again. Default to refuted=true if you cannot reproduce it or the evidence does not show what is claimed.`,
    `FINDING: ${JSON.stringify(f)}`,
    'Do not edit code.',
  ].join('\n')

let level = 'quick'
let green = false
let lastGate = null
let lastVerified = []
const history = []

for (let round = 1; round <= MAX_ROUNDS; round++) {
  log(`دور ${round}/${MAX_ROUNDS}: گیت قطعی (${level})`)
  const gate = await agent(gatePrompt(level, round), { label: `گیت ${level} · دور ${round}`, phase: 'گیت کیفیت', schema: GATE, effort: 'low' })
  if (!gate) { log('گیت جواب نداد؛ توقف'); break }
  lastGate = gate

  // Visual review runs on every round the gate could produce screenshots, verified before anything is fixed.
  const verified = (
    await pipeline(
      reviewers,
      (r) => agent(reviewPrompt(r, round), { label: `بازبین ${r.key} · دور ${round}`, phase: 'گیت کیفیت', schema: FINDINGS }),
      (res, r) => {
        const real = (res ? res.findings : []).filter((f) => f.severity !== 'polish')
        return parallel(
          real.map((f) => async () => {
            const votes = (
              await parallel([
                () => agent(verifyPrompt(f, 'REPRODUCE: does it actually show what is claimed?'), { label: `راستی‌آزمایی A · ${f.title.slice(0, 28)}`, phase: 'گیت کیفیت', schema: VERDICT }),
                () => agent(verifyPrompt(f, 'SEVERITY AND SCOPE: is it really this severe, and is it a defect rather than a taste preference?'), { label: `راستی‌آزمایی B · ${f.title.slice(0, 28)}`, phase: 'گیت کیفیت', schema: VERDICT }),
              ])
            ).filter(Boolean)
            // benefit of the doubt goes to the finding: it dies only if every skeptic refuted it.
            return votes.length && votes.every((v) => v.refuted) ? null : { ...f, reviewer: r.key }
          }),
        )
      },
    )
  )
    .flat()
    .filter(Boolean)
  lastVerified = verified

  const visualBlockers = verified.filter((f) => f.severity === 'blocker')
  const failing = gate.blocking.length + verified.length
  history.push({ round, level, gateBlocking: gate.blocking.length, visualBlockers: visualBlockers.length, visualImportant: verified.length - visualBlockers.length, failing })
  log(`دور ${round}: گیت ${gate.ok ? 'سبز' : `${gate.blocking.length} مورد مسدودکننده`} · بازبین‌ها ${visualBlockers.length} blocker و ${verified.length - visualBlockers.length} important تأییدشده`)

  // "clean" = nothing blocks. Important findings do not block green, but they are still fixed while rounds remain.
  const clean = gate.ok && visualBlockers.length === 0
  if (clean && level === 'quick') { level = 'full'; log('quick سبز شد؛ حالا ماتریس کامل'); continue }
  if (clean && (verified.length === 0 || round === MAX_ROUNDS)) { green = true; break }

  // Non-convergence guard, compared like with like: three rounds at the same level without fewer failures.
  // (Moving quick -> full legitimately raises the count, so levels are never compared against each other.)
  const same = history.filter((h) => h.level === level)
  if (same.length >= 3) {
    const [a, b, c] = same.slice(-3)
    if (c.failing >= b.failing && b.failing >= a.failing) {
      log('هشدار: سه دور پشت‌سرهم در یک سطح بدون کاهش خطا؛ حلقه متوقف شد تا بی‌نهایت نچرخد')
      break
    }
  }
  if (round === MAX_ROUNDS) break

  // Triage -> fix. Issues are routed to the task that owns the files, so fixers never collide.
  const issues = [
    ...gate.blocking.map((b, i) => ({ ref: `gate:${i}:${b.id}`, source: 'gate', ...b })),
    ...verified.map((f, i) => ({ ref: `visual:${i}`, source: 'visual', ...f })),
  ]
  const owners = arch.tasks.map((t) => ({ id: t.id, kind: t.kind, slug: t.slug, owns: t.owns }))
  const triage = await agent(
    [
      COMMON,
      '\nAssign each issue to exactly one owner task from this list (by id), based on which files must change. Use the foundation task for global CSS/tokens/engine/layout/bundle/a11y-in-shared-components; a section task for section-specific issues.',
      `OWNERS: ${JSON.stringify(owners)}`,
      `ISSUES: ${JSON.stringify(issues)}`,
    ].join('\n'),
    { label: `تخصیص رفع · دور ${round}`, phase: 'گیت کیفیت', schema: TRIAGE, effort: 'low' },
  )
  const byOwner = new Map()
  const foundationId = arch.tasks.find((t) => t.kind === 'foundation').id
  const knownOwners = new Set(arch.tasks.map((t) => t.id))
  for (const a of triage ? triage.assignments : []) {
    const issue = issues.find((x) => x.ref === a.ref)
    if (!issue) continue
    const owner = knownOwners.has(a.owner) ? a.owner : foundationId // an invented owner id must not crash the run
    if (!byOwner.has(owner)) byOwner.set(owner, [])
    byOwner.get(owner).push(issue)
  }
  const unassigned = issues.filter((x) => ![...byOwner.values()].some((l) => l.includes(x)))
  if (unassigned.length) { // no silent drops
    byOwner.set(foundationId, [...(byOwner.get(foundationId) ?? []), ...unassigned])
    log(`${unassigned.length} مورد بدون مالک به تسک پایه داده شد`)
  }

  const fixOne = ([ownerId, list]) => {
    const t = arch.tasks.find((x) => x.id === ownerId)
    return agent(
      [
        COMMON,
        GATE_RULES,
        `\nYou fix issues in the files owned by task "${t.id}" (${t.title}). Round ${round}.`,
        `OWNS: ${t.owns.join(', ')}. Edit only those paths; other fixers are working in parallel on theirs. If a fix needs a file you do not own, say so in openIssues.`,
        `ISSUES TO FIX: ${JSON.stringify(list)}`,
        'Fix the cause, not the symptom (no widening a budget, no hiding an element to silence a check, no aria-hidden to dodge axe). For visual issues re-look at the cited screenshot first. Run `npx tsc --noEmit` for your files; do not run next build or commit (the next gate round commits).',
      ].join('\n'),
      { label: `رفع · ${t.slug ?? t.id} · دور ${round}`, phase: 'گیت کیفیت', schema: DONE },
    )
  }
  const entries = [...byOwner.entries()]
  const sectionFixes = entries.filter(([id]) => id !== foundationId)
  const globalFixes = entries.filter(([id]) => id === foundationId)
  await parallel(sectionFixes.map((e) => () => fixOne(e)))
  await parallel(globalFixes.map((e) => () => fixOne(e))) // shared files last, so section fixers never race them
}

/* ============================================================ 7. FINAL REVIEW === */
phase('بازبینی نهایی')
const critic = await agent(
  [
    COMMON,
    '\nYou are the completeness critic. Nobody may call this redesign "guaranteed" unless you cannot find what was not covered.',
    `GATE LAST RESULT: ${JSON.stringify(lastGate)}`,
    `ROUND HISTORY: ${JSON.stringify(history)}`,
    `OPEN VERIFIED FINDINGS: ${JSON.stringify(lastVerified)}`,
    'List, concretely: which viewports/devices/browsers/states were NOT exercised (Safari/iOS, Firefox, real GPUs, slow networks, 200% zoom, forced-colors, print, keyboard-only navigation, existing sub-pages that share the layout, the /download page APK flow, analytics consent banner interplay); which claims in the playbook are enforced only by the honour system; whether any budget was loosened during the run (diff scripts/qa/budgets.json against git history); and the top five things a human should test on real devices before launch.',
    'Gate integrity: BASE=$(git log --format=%h -1 --grep=gate-baseline); `git diff $BASE -- scripts/qa/check.mjs scripts/qa/budgets.json scripts/qa/static-server.mjs scripts/qa/selftest.mjs` must be empty. List anything else that weakens a check (budgets, ignore lists, skipped routes, severity downgrades) in budgetsLoosened.',
    'Check git: confirm everything is committed on feat/landing-experience and nothing was pushed.',
  ].join('\n'),
  { label: 'منتقد کامل‌بودن', phase: 'بازبینی نهایی', schema: { type: 'object', properties: { notCovered: strs, honourSystemOnly: strs, budgetsLoosened: strs, humanChecklist: strs, gitClean: { type: 'boolean' } }, required: ['notCovered', 'humanChecklist'] }, effort: 'high' },
)

return {
  green,
  rounds: history.length,
  history,
  gate: lastGate,
  openFindings: lastVerified,
  critic,
  plan: { angle: finalPlan.angle, stack: finalPlan.stack },
  note: green ? 'گیت قطعی روی ماتریس کامل سبز شد و هیچ blocker بصری تأییدشده‌ای نماند.' : 'سبز نشد: خروجی را تأیید نکنید؛ gate و openFindings را ببینید.',
}

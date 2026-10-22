#!/usr/bin/env node
/**
 * Deterministic quality gate for the landing page. No LLM in the loop: it either
 * measures a thing or it doesn't, so a green run means something.
 *
 *   node scripts/qa/check.mjs                      quick matrix against ./out
 *   node scripts/qa/check.mjs --viewports full     every viewport in budgets.json
 *   node scripts/qa/check.mjs --url http://localhost:3000   test a running dev server
 *   node scripts/qa/check.mjs --no-sections        skip the Figma section contract
 *
 * Exit code 1 when anything blocking fails. Report: .qa/report.json, shots: .qa/shots/.
 *
 * The page opts in to the checks through a small DOM contract, documented in
 * docs/experience-playbook.md: [data-section], [data-critical], canvas[data-webgl]
 * with data-webgl-state, [data-webgl-poster].
 */
import { chromium } from 'playwright-core';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { gzipSync } from 'node:zlib';
import { extname, join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { serve, candidates } from './static-server.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, '../..');

/* ---------------------------------------------------------------- args */
const argv = process.argv.slice(2);
const opt = (name, fallback) => {
  const i = argv.indexOf(`--${name}`);
  return i === -1 || argv[i + 1] === undefined ? fallback : argv[i + 1];
};
const flag = (name) => argv.includes(`--${name}`);

const budgets = JSON.parse(await readFile(join(HERE, 'budgets.json'), 'utf8'));
const figma = JSON.parse(await readFile(join(HERE, 'figma-sections.json'), 'utf8'));

const outDir = resolve(ROOT, opt('out', 'out'));
const externalUrl = opt('url', null);
const viewportSet = opt('viewports', 'quick');
const pages = opt('pages', (viewportSet === 'full' ? budgets.pagesFull : budgets.pages).join(',')).split(',');
const checkSections = !flag('no-sections');
const shotsDir = resolve(ROOT, opt('shots', '.qa/shots'));
const reportPath = resolve(ROOT, opt('json', '.qa/report.json'));
const viewports = budgets.viewports[viewportSet];
if (!viewports) throw new Error(`unknown --viewports "${viewportSet}" (have: ${Object.keys(budgets.viewports).join(', ')})`);

/* -------------------------------------------------------------- issues */
const issues = [];
const metrics = [];
const severityOf = (id) => budgets.severity[id] ?? 'block';
const ignored = (s) => budgets.ignore.some((x) => s.includes(x));
function add(id, ctx, message, detail) {
  issues.push({ id, severity: severityOf(id), ...ctx, message, ...(detail ? { detail } : {}) });
}

/* ------------------------------------------- in-page code (serialised) */
function initInPage({ mode }) {
  window.__qa = { cls: 0, lcp: 0, lcpTag: '', raf: 0 };
  // Headless Chrome renders GL in software, which a real capability probe correctly sends to tier 0. The gate has to
  // exercise the GL path anyway, so it sets this flag; the probe may honour it, and no URL parameter may exist for it.
  window.__QA_FORCE_GL = true;
  const raf = window.requestAnimationFrame.bind(window);
  window.requestAnimationFrame = (cb) => { window.__qa.raf++; return raf(cb); };
  try {
    new PerformanceObserver((l) => {
      for (const e of l.getEntries()) if (!e.hadRecentInput) window.__qa.cls += e.value;
    }).observe({ type: 'layout-shift', buffered: true });
  } catch { /* unsupported */ }
  try {
    new PerformanceObserver((l) => {
      const es = l.getEntries();
      const e = es[es.length - 1];
      if (e) { window.__qa.lcp = e.startTime; window.__qa.lcpTag = e.element ? e.element.tagName : ''; }
    }).observe({ type: 'largest-contentful-paint', buffered: true });
  } catch { /* unsupported */ }
  if (mode === 'nowebgl') {
    const get = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (type, ...rest) {
      if (/webgl/i.test(String(type))) return null;
      return get.call(this, type, ...rest);
    };
  }
}

function collectInPage({ sections, checkSections, minTap, touch, claims }) {
  const out = {};
  const de = document.documentElement;
  const vw = window.innerWidth;
  const visible = (el) => {
    const r = el.getBoundingClientRect();
    const cs = getComputedStyle(el);
    return r.width > 0 && r.height > 0 && cs.visibility !== 'hidden' && cs.display !== 'none' && Number(cs.opacity) > 0.01;
  };
  const hiddenFromUsers = (el) => !!el.closest('[aria-hidden="true"], [inert]');
  const clippedByAncestor = (el) => {
    for (let p = el.parentElement; p && p !== document.body && p !== de; p = p.parentElement) {
      if (getComputedStyle(p).overflowX !== 'visible') return true;
    }
    return false;
  };

  out.overflowX = Math.max(de.scrollWidth, document.body.scrollWidth) - vw;
  out.docHeight = de.scrollHeight;

  // Text that sits outside the viewport horizontally and is not in a clipping container (a carousel is fine).
  const off = [];
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  while (walker.nextNode()) {
    const n = walker.currentNode;
    const t = n.textContent.trim();
    if (!t) continue;
    const el = n.parentElement;
    if (!el || ['SCRIPT', 'STYLE', 'NOSCRIPT'].includes(el.tagName) || !visible(el) || hiddenFromUsers(el)) continue;
    const range = document.createRange();
    range.selectNodeContents(n);
    const r = range.getBoundingClientRect();
    if (r.width === 0) continue;
    if ((r.left < -1 || r.right > vw + 1) && !clippedByAncestor(el)) {
      off.push(`${el.tagName.toLowerCase()} "${t.slice(0, 40)}" [${Math.round(r.left)}→${Math.round(r.right)}]`);
    }
  }
  out.textOffscreen = off;

  const small = [];
  if (touch) {
    const sel = 'a[href], button, [role="button"], input:not([type=hidden]), select, textarea, summary';
    for (const el of document.querySelectorAll(sel)) {
      if (!visible(el) || hiddenFromUsers(el)) continue;
      if (el.tagName === 'A' && el.closest('p, li, dd, figcaption') && getComputedStyle(el).display === 'inline') continue; // WCAG 2.5.8 inline exception
      const r = el.getBoundingClientRect();
      if (r.width < minTap || r.height < minTap) {
        const label = (el.getAttribute('aria-label') || el.textContent || '').trim().slice(0, 30);
        small.push(`${el.tagName.toLowerCase()} "${label}" ${Math.round(r.width)}×${Math.round(r.height)}`);
      }
    }
  }
  out.smallTargets = small;

  out.brokenImages = [...document.images].filter((i) => i.complete && i.naturalWidth === 0 && i.currentSrc).map((i) => i.currentSrc.slice(-90));

  out.sections = checkSections
    ? sections.map((s) => {
        const el = document.querySelector(`[data-section="${s.slug}"]`);
        if (!el) return { slug: s.slug, missing: true };
        const r = el.getBoundingClientRect();
        return { slug: s.slug, height: Math.round(r.height), visible: visible(el), hasNode: el.hasAttribute('data-figma-node') };
      })
    : [];

  // A critical element (h1, primary CTA, nav) must be what you actually hit at its centre, not a canvas laid over it.
  const occluded = [];
  for (const el of document.querySelectorAll('[data-critical]')) {
    const name = el.getAttribute('data-critical') || el.tagName.toLowerCase();
    if (!visible(el)) { occluded.push(`${name}: not visible`); continue; }
    el.scrollIntoView({ block: 'center' });
    const r = el.getBoundingClientRect();
    const x = Math.min(Math.max(r.left + r.width / 2, 0), vw - 1);
    const y = Math.min(Math.max(r.top + r.height / 2, 0), window.innerHeight - 1);
    const hit = document.elementFromPoint(x, y);
    if (!hit || !(el === hit || el.contains(hit))) occluded.push(`${name}: covered by <${hit ? hit.tagName.toLowerCase() : 'nothing'}${hit && hit.className && typeof hit.className === 'string' ? '.' + hit.className.split(' ')[0] : ''}>`);
  }
  out.occluded = occluded;

  // Claims scan (landing only: `claims` is null elsewhere). Text, alt and aria-label, minus anything marked data-disclaimer,
  // so a disclaimer may say what the product does NOT do. textContent on a clone also catches hidden text.
  out.claims = [];
  if (claims) {
    const clone = document.body.cloneNode(true);
    clone.querySelectorAll('[data-disclaimer], script, style, noscript').forEach((e) => e.remove());
    const parts = [clone.textContent];
    clone.querySelectorAll('[alt], [aria-label]').forEach((e) => parts.push(e.getAttribute('alt') || '', e.getAttribute('aria-label') || ''));
    const text = parts.join(' \n ').replace(/\s+/g, ' ');
    for (const src of claims) {
      const m = new RegExp(src, 'i').exec(text);
      if (m) out.claims.push(`"${m[0]}" …${text.slice(Math.max(0, m.index - 30), m.index + m[0].length + 30)}…`);
    }
  }
  out.unverifiedTestimonials = [...document.querySelectorAll('[data-section="testimonials"] blockquote')].filter((b) => !b.closest('[data-verified="true"]')).length;

  out.canvases = [...document.querySelectorAll('canvas[data-webgl]')].map((c) => ({
    state: c.dataset.webglState || '',
    pixels: c.width * c.height,
    luma: c.dataset.webglLuma === undefined ? null : Number(c.dataset.webglLuma),
    ariaHidden: c.getAttribute('aria-hidden'),
  }));
  out.posters = [...document.querySelectorAll('[data-webgl-poster]')].map((p) => ({ visible: visible(p) }));
  out.landmarks = {
    h1: document.querySelectorAll('h1').length,
    title: document.title,
    lang: de.lang,
    viewportMeta: !!document.querySelector('meta[name=viewport]'),
  };
  return out;
}

/* ------------------------------------------------------------- one case */
async function runCase(browser, base, pagePath, vp, mode, axeSrc) {
  const ctx = { page: pagePath, viewport: vp.name, mode };
  const context = await browser.newContext({
    viewport: { width: vp.width, height: vp.height },
    deviceScaleFactor: vp.dpr,
    isMobile: vp.mobile,
    hasTouch: vp.mobile,
    reducedMotion: mode === 'reduced' ? 'reduce' : 'no-preference',
  });
  await context.addInitScript(initInPage, { mode });
  const page = await context.newPage();

  const consoleErrors = [];
  const failed = [];
  page.on('console', (m) => { if (m.type() === 'error') consoleErrors.push(m.text()); });
  page.on('pageerror', (e) => consoleErrors.push(`pageerror: ${e.message}`));
  page.on('requestfailed', (r) => {
    const why = r.failure()?.errorText ?? '';
    if (why !== 'net::ERR_ABORTED') failed.push(`${r.url()} (${why})`); // aborted = cancelled prefetch/navigation, not a fault
  });
  page.on('response', (r) => { if (r.status() >= 400) failed.push(`${r.url()} → ${r.status()}`); });

  if (vp.mobile) {
    const cdp = await context.newCDPSession(page);
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: budgets.cpuThrottle });
  }

  await page.goto(base + pagePath, { waitUntil: 'load', timeout: 30000 });
  await page.waitForLoadState('networkidle', { timeout: 8000 }).catch(() => {});
  await page.waitForTimeout(600);

  // LCP is the one timing that software-GL Chrome under CPU throttle measures noisily (a busy machine can add seconds
  // to a trivial page). Best of up to 3 loads, like Lighthouse's repeated runs: a genuinely slow page fails all three.
  const lcpBudget = vp.mobile ? budgets.lcpMs.mobile : budgets.lcpMs.desktop;
  let bestLcp = await page.evaluate(() => window.__qa.lcp);
  // 0 means "no entry recorded", which is a failed measurement, not a fast page: retry it too.
  for (let attempt = 1; attempt < 3 && (bestLcp === 0 || bestLcp > lcpBudget); attempt++) {
    await page.reload({ waitUntil: 'load', timeout: 30000 });
    await page.waitForLoadState('networkidle', { timeout: 8000 }).catch(() => {});
    await page.waitForTimeout(600);
    const next = await page.evaluate(() => window.__qa.lcp);
    bestLcp = bestLcp === 0 ? next : next === 0 ? bestLcp : Math.min(bestLcp, next);
  }

  const bytesAtLoad = await page.evaluate(() =>
    Math.round(performance.getEntriesByType('resource').reduce((n, e) => n + (e.encodedBodySize || 0), 0) / 1024));

  // Scroll the whole page once so lazy content loads and layout shifts, if any, are counted.
  await page.evaluate(async () => {
    const h = () => document.documentElement.scrollHeight;
    const step = Math.max(200, Math.floor(innerHeight * 0.8));
    for (let y = 0; y < h(); y += step) { scrollTo(0, y); await new Promise((r) => setTimeout(r, 120)); }
    scrollTo(0, h()); await new Promise((r) => setTimeout(r, 200));
    scrollTo(0, 0); await new Promise((r) => setTimeout(r, 300));
  });

  const raf0 = await page.evaluate(() => window.__qa.raf);
  await page.waitForTimeout(1000);
  const rafPerSec = (await page.evaluate(() => window.__qa.raf)) - raf0;

  if (mode === 'default') {
    const dir = join(shotsDir, pagePath === '/' ? 'home' : pagePath.replace(/\W+/g, '-'));
    await mkdir(dir, { recursive: true });
    await page.screenshot({ path: join(dir, `${vp.name}-fold.png`), scale: 'css' });
    if (vp.shot === 'full') await page.screenshot({ path: join(dir, `${vp.name}-full.png`), fullPage: true, scale: 'css' });
  }

  const totalKB = await page.evaluate(() =>
    Math.round(performance.getEntriesByType('resource').reduce((n, e) => n + (e.encodedBodySize || 0), 0) / 1024));
  const vitals = await page.evaluate(() => ({ ...window.__qa }));
  vitals.lcp = [vitals.lcp, bestLcp].filter((v) => v > 0).sort((a, b) => a - b)[0] ?? 0;
  const m = await page.evaluate(collectInPage, {
    sections: figma.sections, checkSections: checkSections && budgets.sectionPages.includes(pagePath), minTap: budgets.minTapTarget, touch: vp.mobile,
    claims: budgets.sectionPages.includes(pagePath) ? budgets.bannedClaims : null,
  });

  /* ---- judge ---- */
  if (m.overflowX > 1) add('overflow-x', ctx, `page is ${m.overflowX}px wider than the viewport`);
  if (m.textOffscreen.length) add('text-offscreen', ctx, `${m.textOffscreen.length} text node(s) outside the viewport`, m.textOffscreen.slice(0, 6));
  if (m.smallTargets.length) add('tap-target', ctx, `${m.smallTargets.length} touch target(s) under ${budgets.minTapTarget}px`, m.smallTargets.slice(0, 6));
  if (m.brokenImages.length) add('broken-image', ctx, `${m.brokenImages.length} image(s) failed to load`, m.brokenImages);
  if (m.occluded.length) add('occlusion', ctx, `critical element(s) not reachable`, m.occluded);
  if (!m.landmarks.viewportMeta) add('meta-viewport', ctx, 'missing <meta name="viewport">');
  if (!m.landmarks.title) add('meta-title', ctx, 'empty <title>');
  if (!m.landmarks.lang) add('meta-lang', ctx, '<html lang> is not set');
  if (m.landmarks.h1 !== 1) add('seo-h1', ctx, `expected exactly one <h1>, found ${m.landmarks.h1}`);

  if (checkSections && budgets.sectionPages.includes(pagePath)) {
    for (const s of m.sections) {
      if (s.missing) { if (!figma.sections.find((x) => x.slug === s.slug)?.optional) add('section-missing', ctx, `[data-section="${s.slug}"] not found`); }
      else {
        if (!s.visible) add('section-missing', ctx, `section "${s.slug}" is in the DOM but not visible`);
        if (!s.hasNode) add('section-missing', ctx, `section "${s.slug}" has no data-figma-node`);
      }
    }
    if (vp.name === 'desktop-1440') {
      for (const spec of figma.sections.filter((s) => s.fidelity)) {
        const got = m.sections.find((s) => s.slug === spec.slug);
        if (!got || got.missing) continue;
        const drift = Math.abs(got.height - spec.height) / spec.height;
        if (drift > budgets.fidelityHeightTolerance) add('section-fidelity', ctx, `"${spec.slug}" is ${got.height}px tall, Figma says ${spec.height}px (${Math.round(drift * 100)}% off)`);
      }
    }
  }

  if (vitals.cls > budgets.cls) add('cls', ctx, `layout shift ${vitals.cls.toFixed(3)} > ${budgets.cls}`);
  if (m.claims.length) add('banned-claim', ctx, `${m.claims.length} unsupported medical/superlative claim(s) on the page`, m.claims.slice(0, 4));
  if (m.unverifiedTestimonials) add('unverified-testimonial', ctx, `${m.unverifiedTestimonials} testimonial(s) without a verified figure (data-verified="true")`);
  if (vitals.lcp === 0) add('lcp-missing', ctx, 'no largest-contentful-paint entry was recorded after 3 loads, so LCP is unverified');
  else if (vitals.lcp > lcpBudget) add('lcp', ctx, `LCP ${Math.round(vitals.lcp)}ms > ${lcpBudget}ms`);

  const fvBudget = vp.mobile ? budgets.firstViewKB.mobile : budgets.firstViewKB.desktop;
  if (bytesAtLoad > fvBudget) add('page-weight-first-view', ctx, `${bytesAtLoad}KB loaded by first paint > ${fvBudget}KB`);
  const totBudget = vp.mobile ? budgets.totalKB.mobile : budgets.totalKB.desktop;
  if (totalKB > totBudget) add('page-weight-total', ctx, `${totalKB}KB after a full scroll > ${totBudget}KB`);

  const errs = consoleErrors.filter((e) => !ignored(e) && !/^Failed to load resource/.test(e)); // reported as request-failed, with the URL
  const bad = failed.filter((e) => !ignored(e));
  if (errs.length) add('console-error', ctx, `${errs.length} console error(s)`, errs.slice(0, 5));
  if (bad.length) add('request-failed', ctx, `${bad.length} failed request(s)`, bad.slice(0, 5));

  const limit = vp.mobile ? budgets.canvasPixels.mobile : budgets.canvasPixels.desktop;
  for (const c of m.canvases) {
    if (c.pixels > limit) add('canvas-pixels', ctx, `canvas is ${(c.pixels / 1e6).toFixed(1)}MP > ${(limit / 1e6).toFixed(1)}MP: cap by pixels, not just DPR`);
    if (c.ariaHidden !== 'true') add('canvas-a11y', ctx, 'decorative <canvas data-webgl> must be aria-hidden="true"');
    if (mode === 'default') {
      if (c.state === 'fallback') add('webgl-unverifiable', ctx, 'WebGL fell back in the gate browser, so the GL path was not exercised');
      else if (!['running', 'paused'].includes(c.state)) add('canvas-state', ctx, `data-webgl-state is "${c.state}" (want running|paused)`);
      if (c.luma !== null && c.luma < 0.005) add('canvas-blank', ctx, `first frame is black (luma ${c.luma})`);
    }
    if (mode === 'nowebgl' && c.state !== 'fallback') add('nowebgl-fallback', ctx, `with WebGL unavailable data-webgl-state is "${c.state}", want "fallback"`);
  }
  if (mode === 'nowebgl' && m.canvases.length && !m.posters.some((p) => p.visible)) add('nowebgl-fallback', ctx, 'WebGL unavailable and no visible [data-webgl-poster]: the hero would be empty');
  if (mode === 'reduced' && rafPerSec > budgets.reducedMotionMaxRafPerSec) add('reduced-motion', ctx, `${rafPerSec} requestAnimationFrame calls/s under prefers-reduced-motion (max ${budgets.reducedMotionMaxRafPerSec})`);

  if (mode === 'default' && axeSrc && budgets.axeViewports.includes(vp.name)) {
    await page.evaluate(axeSrc);
    const res = await page.evaluate(() => window.axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'] } }));
    for (const v of res.violations) {
      const id = v.impact === 'serious' || v.impact === 'critical' ? 'a11y' : 'a11y-moderate';
      add(id, ctx, `${v.id}: ${v.help} (${v.nodes.length} node${v.nodes.length > 1 ? 's' : ''})`, v.nodes.slice(0, 2).map((n) => n.target.join(' ')));
    }
  }

  // Brand wiring: the icon, apple-touch icon and OG image must exist and resolve (landing page, once per run).
  if (mode === 'default' && budgets.sectionPages.includes(pagePath) && vp === viewports[0]) {
    const refs = await page.evaluate(() => ({
      icon: [...document.querySelectorAll('link[rel~="icon"]')].map((l) => l.href),
      'apple-touch-icon': [...document.querySelectorAll('link[rel="apple-touch-icon"]')].map((l) => l.href),
      'og:image': [...document.querySelectorAll('meta[property="og:image"]')].map((x) => x.content),
    }));
    for (const [kind, urls] of Object.entries(refs)) {
      if (!urls.length) { add('brand-assets', ctx, `no ${kind} declared`); continue; }
      for (const u of urls) {
        const local = base + new URL(u, page.url()).pathname; // metadataBase may point at production: test what this build serves
        const r = await context.request.get(local).catch(() => null);
        if (!r || r.status() !== 200) { add('brand-assets', ctx, `${kind} ${new URL(u, page.url()).pathname} -> ${r ? r.status() : 'unreachable'}`); continue; }
        if (kind === 'og:image') {
          const buf = await r.body();
          if (buf.subarray(1, 4).toString() === 'PNG') {
            const w = buf.readUInt32BE(16), h = buf.readUInt32BE(20);
            if (w !== 1200 || h !== 630) add('brand-assets', ctx, `og:image is ${w}x${h}, want 1200x630`);
          }
        }
      }
    }
  }

  metrics.push({ ...ctx, lcp: Math.round(vitals.lcp), lcpTag: vitals.lcpTag, cls: Number(vitals.cls.toFixed(3)), firstViewKB: bytesAtLoad, totalKB, rafPerSec, overflowX: m.overflowX, docHeight: m.docHeight, canvases: m.canvases.length });
  await context.close();
}

/* ------------------------------------------------------- bundle report */
async function bundleChecks() {
  const report = [];
  for (const p of pages) {
    const file = candidates(outDir, p.endsWith('/') ? p : `${p}/`)[0];
    let html;
    try { html = await readFile(file, 'utf8'); } catch { add('bundle-missing', { page: p }, `no ${file} (run npm run build first)`); continue; }
    const hrefs = new Set();
    for (const m of html.matchAll(/<script\b[^>]*\ssrc="([^"]+\.js[^"]*)"/g)) hrefs.add(m[1]);
    for (const m of html.matchAll(/<link\b[^>]*>/g)) {
      const tag = m[0];
      const href = /\shref="([^"]+)"/.exec(tag)?.[1];
      if (href && /\.js(\?|$)/.test(href) && /rel="(modulepreload|preload)"/.test(tag)) hrefs.add(href);
    }
    let gz = 0;
    const parts = [];
    let glInInitial = null;
    for (const h of hrefs) {
      try {
        const buf = await readFile(join(outDir, h.split('?')[0]));
        const size = gzipSync(buf).length;
        gz += size;
        parts.push({ file: h, gzKB: Math.round(size / 102.4) / 10 });
        const text = buf.toString('utf8');
        if (!glInInitial && /createShader\(/.test(text) && /compileShader\(/.test(text)) glInInitial = h;
      } catch { /* external script */ }
    }
    parts.sort((a, b) => b.gzKB - a.gzKB);
    const gzKB = Math.round(gz / 102.4) / 10;
    if (gzKB > budgets.initialJsGzKB) add('bundle-initial-js', { page: p }, `initial JS is ${gzKB}KB gz > ${budgets.initialJsGzKB}KB`, parts.slice(0, 3).map((x) => `${x.gzKB}KB ${x.file}`));
    if (glInInitial) add('webgl-in-initial-bundle', { page: p }, 'WebGL code is in the initial bundle; load it lazily after first paint', [glInInitial]);
    report.push({ page: p, initialJsGzKB: gzKB, top: parts.slice(0, 4) });
  }
  return report;
}

/* ----------------------------------------------------------------- main */
let server = null;
let base = externalUrl;
if (!base) {
  ({ server, base } = await serve(outDir));
}

let browser;
try {
  browser = await chromium.launch({
    channel: 'chrome',
    headless: true,
    args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--enable-webgl'],
  });
} catch (e) {
  console.error(`Could not launch Chrome (${e.message.split('\n')[0]}). Install Google Chrome or adapt launch() in scripts/qa/check.mjs.`);
  process.exit(2);
}

const axeSrc = await readFile(join(ROOT, 'node_modules/axe-core/axe.min.js'), 'utf8').catch(() => null);
const extraNames = new Set(budgets.extraModes.viewports);
// Throw one load away: the first page in a fresh Chrome pays GPU/process start-up and would poison its LCP.
{
  const warm = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  const wp = await warm.newPage();
  await wp.goto(base + pages[0], { waitUntil: 'load', timeout: 30000 }).catch(() => {});
  await warm.close();
}
const started = performance.now();

for (const pagePath of pages) {
  for (const vp of viewports) {
    await runCase(browser, base, pagePath, vp, 'default', axeSrc);
    if (extraNames.has(vp.name)) {
      await runCase(browser, base, pagePath, vp, 'nowebgl', null);
      await runCase(browser, base, pagePath, vp, 'reduced', null);
    }
    process.stdout.write('.');
  }
}
process.stdout.write('\n');
await browser.close();
if (server) server.close();

const bundles = externalUrl ? [] : await bundleChecks();

/* --------------------------------------------------------------- report */
const blocking = issues.filter((i) => i.severity === 'block');
const warnings = issues.filter((i) => i.severity !== 'block');
const report = { ok: blocking.length === 0, viewportSet, seconds: Math.round((performance.now() - started) / 1000), counts: { blocking: blocking.length, warnings: warnings.length }, issues, metrics, bundles };
await mkdir(dirname(reportPath), { recursive: true });
await writeFile(reportPath, JSON.stringify(report, null, 2));

const group = (list) => {
  const by = new Map();
  for (const i of list) {
    const g = by.get(i.id) ?? { count: 0, where: new Set(), first: i };
    g.count++;
    g.where.add(i.viewport ? `${i.viewport}${i.mode && i.mode !== 'default' ? `/${i.mode}` : ''}` : i.page);
    by.set(i.id, g);
  }
  return by;
};
const print = (title, list) => {
  if (!list.length) return;
  console.log(`\n${title}`);
  for (const [id, g] of group(list)) {
    console.log(`  ${id.padEnd(24)} ×${String(g.count).padEnd(3)} ${[...g.where].slice(0, 5).join(', ')}${g.where.size > 5 ? ` +${g.where.size - 5}` : ''}`);
    console.log(`      ${g.first.message}`);
    if (g.first.detail) for (const d of [].concat(g.first.detail).slice(0, 3)) console.log(`        · ${d}`);
  }
};
print('BLOCKING', blocking);
print('WARNINGS', warnings);

console.log('\nviewport              mode     LCP    CLS    firstKB  totalKB  raf/s');
for (const m of metrics) console.log(`${m.viewport.padEnd(21)} ${m.mode.padEnd(8)} ${String(m.lcp).padEnd(6)} ${String(m.cls).padEnd(6)} ${String(m.firstViewKB).padEnd(8)} ${String(m.totalKB).padEnd(8)} ${m.rafPerSec}`);
for (const b of bundles) console.log(`\ninitial JS ${b.page}: ${b.initialJsGzKB}KB gz (budget ${budgets.initialJsGzKB}KB)`);

console.log(`\nQA GATE: ${report.ok ? 'PASS' : 'FAIL'}  (${blocking.length} blocking, ${warnings.length} warnings, ${report.seconds}s)  → ${reportPath.replace(ROOT + '/', '')}`);
process.exit(report.ok ? 0 : 1);

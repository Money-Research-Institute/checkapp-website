#!/usr/bin/env node
/**
 * Smoke test of the built site. After `npm run build`:   npm run qa      (about 15 s)
 *
 * Loads /, /eu/, /gulf/ and /ru/ from ./out at a phone (375x812) and a desktop (1440x900) and fails on:
 *   console errors, failed requests (analytics excluded), horizontal overflow, a missing or double <h1>, a wrong <html lang>,
 *   and banned claims / unsupported capabilities / template placeholders in the page text (claims.mjs, docs/landing.md).
 * Needs Google Chrome (playwright-core drives it). `--out <dir>` tests another build folder (default: out).
 */
import { chromium } from 'playwright-core';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { BANNED_CLAIMS, CLAIM_ALLOW, PLACEHOLDERS, UNSUPPORTED_CAPABILITIES, findClaims, findPlaceholders, findUnsupported } from './claims.mjs';
import { serve } from './static-server.mjs';

const PAGES = ['/', '/eu/', '/gulf/', '/ru/'];
const VIEWPORTS = [{ width: 375, height: 812 }, { width: 1440, height: 900 }];
const ANALYTICS = /\/_vercel\/|posthog|vercel-insights|vitals\.vercel/;

/** In the page: scroll through it once, so lazy images load (a missing file then shows up as a failed request). */
async function scrollThrough() {
  for (let y = 0; y < document.documentElement.scrollHeight; y += innerHeight * 0.8) {
    scrollTo(0, y);
    await new Promise((r) => setTimeout(r, 40));
  }
  scrollTo(0, 0);
}

/** In the page: what the checks need. Text = text content + alt + aria-label, in three cuts (see claims.mjs for who reads which). */
function measure() {
  const grab = (root) =>
    [root.textContent, ...[...root.querySelectorAll('[alt], [aria-label]')].flatMap((e) => [e.getAttribute('alt'), e.getAttribute('aria-label')])]
      .join(' \n ')
      .replace(/\s+/g, ' ');
  const root = document.body.cloneNode(true);
  root.querySelectorAll('script, style, noscript').forEach((e) => e.remove());
  const all = grab(root);
  root.querySelectorAll('[data-disclaimer]').forEach((e) => e.remove()); // a disclaimer may say what the product does NOT do
  const claims = grab(root);
  root.querySelectorAll('[data-section="testimonials"]').forEach((e) => e.remove()); // placeholders, exempt from the capability scan
  const de = document.documentElement;
  return {
    overflow: Math.max(de.scrollWidth, document.body.scrollWidth) - innerWidth,
    h1: document.querySelectorAll('h1').length,
    lang: de.lang,
    text: { all, claims, caps: grab(root) },
  };
}

async function checkPage(browser, base, path, viewport, scanText) {
  const problems = [];
  const mobile = viewport.width < 600;
  const context = await browser.newContext({ viewport, isMobile: mobile, hasTouch: mobile });
  const page = await context.newPage();
  const note = (msg, url = '') => ANALYTICS.test(msg + url) || problems.push(msg);
  page.on('console', (m) => m.type() === 'error' && !m.text().startsWith('Failed to load resource') && note(`console error: ${m.text()}`));
  page.on('pageerror', (e) => note(`page error: ${e.message}`));
  page.on('requestfailed', (r) => r.failure()?.errorText !== 'net::ERR_ABORTED' && note(`request failed: ${r.url()}`, r.url())); // aborted = a cancelled prefetch
  page.on('response', (r) => r.status() >= 400 && note(`HTTP ${r.status()}: ${r.url()}`, r.url()));

  await page.goto(base + path, { waitUntil: 'load' });
  await page.evaluate(scrollThrough);
  await page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => {});
  const m = await page.evaluate(measure);
  await context.close();

  if (m.overflow > 0) problems.push(`horizontal overflow: ${m.overflow}px`);
  if (m.h1 !== 1) problems.push(`expected exactly one <h1>, found ${m.h1}`);
  const lang = path === '/ru/' ? 'ru' : 'en';
  if (m.lang !== lang) problems.push(`<html lang="${m.lang}">, expected "${lang}"`);
  if (scanText) {
    const rules = { bannedClaims: BANNED_CLAIMS, claimAllow: CLAIM_ALLOW, unsupportedCapabilities: UNSUPPORTED_CAPABILITIES };
    for (const hit of findClaims(m.text.claims, rules)) problems.push(`banned claim: ${hit}`);
    for (const hit of findUnsupported(m.text.caps, rules)) problems.push(`unsupported capability: ${hit}`);
    for (const hit of findPlaceholders(m.text.all, PLACEHOLDERS)) problems.push(`placeholder: ${hit}`);
  }
  return problems.map((p) => `${path} @${viewport.width}: ${p}`);
}

const started = Date.now();
const outFlag = process.argv.indexOf('--out');
const outDir = resolve(dirname(fileURLToPath(import.meta.url)), '../..', outFlag > 0 ? process.argv[outFlag + 1] : 'out');
const { server, base } = await serve(outDir);
let browser;
try {
  browser = await chromium.launch({ channel: 'chrome' });
} catch (e) {
  server.close();
  console.error(`Could not launch Google Chrome (${e.message.split('\n')[0]}). Install Chrome, or adapt launch() in scripts/qa/check.mjs.`);
  process.exit(2);
}
const runs = await Promise.all(PAGES.flatMap((path) => VIEWPORTS.map((vp, i) => checkPage(browser, base, path, vp, i === 0))));
await browser.close();
server.close();

const problems = [...new Set(runs.flat())];
const seconds = ((Date.now() - started) / 1000).toFixed(1);
if (problems.length) {
  console.error(problems.map((p) => `  FAIL ${p}`).join('\n'));
  console.error(`\nQA FAIL: ${problems.length} problem(s), ${seconds}s`);
  process.exit(1);
}
console.log(`QA PASS: ${PAGES.length} pages x ${VIEWPORTS.length} viewports, ${seconds}s`);

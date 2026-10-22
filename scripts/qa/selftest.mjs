#!/usr/bin/env node
/**
 * Tests the gate itself. A gate that has never failed on purpose proves nothing, so:
 *   good fixture  -> must PASS with zero blocking issues
 *   bad fixture   -> must FAIL, and must name every defect planted in it
 * Run after any change to check.mjs or budgets.json:  npm run qa:selftest
 */
import { spawnSync } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import { findClaims, findPlaceholders, findUnsupported } from './claims.mjs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const run = (name) => {
  const r = spawnSync(process.execPath, ['scripts/qa/check.mjs', '--out', `scripts/qa/fixtures/${name}`, '--viewports', 'selftest', '--pages', '/',
    '--json', `.qa/selftest/${name}.json`, '--shots', `.qa/selftest/shots-${name}`], { cwd: ROOT, encoding: 'utf8' });
  return r;
};

// Every id below is a defect planted in fixtures/bad/index.html.
const PLANTED = ['overflow-x', 'text-offscreen', 'tap-target', 'broken-image', 'request-failed', 'occlusion', 'cls',
  'console-error', 'canvas-pixels', 'canvas-a11y', 'canvas-state', 'canvas-blank', 'nowebgl-fallback', 'reduced-motion',
  'section-missing', 'a11y', 'meta-lang', 'banned-claim', 'unverified-testimonial', 'brand-assets', 'unsupported-capability', 'placeholder-leak'];

let failures = 0;
const check = (ok, msg) => { console.log(`${ok ? '  ✓' : '  ✗'} ${msg}`); if (!ok) failures++; };

console.log('good fixture (reference implementation of the contract)');
const good = run('good');
const goodReport = JSON.parse(await readFile(resolve(ROOT, '.qa/selftest/good.json'), 'utf8'));
check(good.status === 0 && goodReport.ok, `passes (exit ${good.status}, ${goodReport.counts.blocking} blocking)`);
for (const i of goodReport.issues.filter((x) => x.severity === 'block')) console.log(`      unexpected: ${i.id} @ ${i.viewport}/${i.mode} ${i.message}`);

console.log('bad fixture (planted defects)');
const bad = run('bad');
const badReport = JSON.parse(await readFile(resolve(ROOT, '.qa/selftest/bad.json'), 'utf8'));
check(bad.status === 1 && !badReport.ok, `fails (exit ${bad.status}, ${badReport.counts.blocking} blocking)`);
const seen = new Set(badReport.issues.map((i) => i.id)); // any severity: the point is that the defect is noticed
for (const id of PLANTED) check(seen.has(id), `catches ${id}`);

console.log('wrong-language fixture (lang="ru" and Russian text on a page that must be English)');
const wl = run('wronglang');
const wlReport = JSON.parse(await readFile(resolve(ROOT, '.qa/selftest/wronglang.json'), 'utf8'));
const wlSeen = new Set(wlReport.issues.map((i) => i.id));
for (const id of ['lang-mismatch', 'lang-content']) check(wlSeen.has(id), `catches ${id}`);

console.log('claim rules on plain strings (budgets.json)');
const budgets = JSON.parse(await readFile(resolve(ROOT, 'scripts/qa/budgets.json'), 'utf8'));
const claims = (t) => findClaims(t, budgets).length;
const caps = (t) => findUnsupported(t, budgets).length;
const denials = ['DiDi never diagnoses.', 'It does not diagnose and does not replace a doctor.', 'Does DiDi diagnose? No.', 'DiDi does not diagnose.',
  'Он не ставит диагнозы и не предсказывает болезни.', 'DiDi ставит диагнозы? Нет.', 'мягкие подсказки — не диагнозы и не прогнозы болезней.'];
for (const t of denials) check(claims(t) === 0, `allows the denial: ${t}`);
const claimed = ['DiDi diagnoses your tongue.', 'The name comes from “Digital Diagnostic”.', 'We predict diseases before they appear.', 'It may help prevent disease.',
  'DiDi never misses a diagnosis.', 'Clinically proven.', 'DiDi предсказывает болезни по языку.', 'Диагностика по фото.', 'DiDi лечит.', 'Первое в мире приложение.'];
for (const t of claimed) check(claims(t) > 0, `rejects the claim: ${t}`);
for (const t of ['Your weekly report is ready.', 'Compare today with your earlier check-ins.', 'Watch the trend over time.', 'Еженедельный отчёт готов.', 'Видео-скан языка.']) check(caps(t) > 0, `rejects the unsupported capability: ${t}`);
for (const t of ['{price}/month', '[Price]/month', '[Цена]/мес.', 'TODO write this']) check(findPlaceholders(t, budgets.placeholders).length > 0, `rejects the placeholder: ${t}`);

console.log("the client's final copy (src/content/copy) against the claim rules");
const copyFiles = ['us', 'eu', 'gulf', 'ru'];
for (const f of copyFiles) {
  const src = await readFile(resolve(ROOT, `src/content/copy/${f}.ts`), 'utf8');
  const literals = [...src.matchAll(/"((?:[^"\\]|\\.)*)"/g)].map((m) => m[1]).filter((s) => s.length > 14);
  const disclaimer = (/disclaimer:\s*"((?:[^"\\]|\\.)*)"/.exec(src) ?? [])[1];
  const held = literals.filter((s) => /Digital Diagnostic/.test(s));
  const live = literals.filter((s) => s !== disclaimer && !held.includes(s));
  const bad = live.filter((s) => claims(s) > 0 || caps(s) > 0);
  check(bad.length === 0, `${f}: ${live.length} strings pass${bad.length ? ` (FAIL: ${bad[0].slice(0, 70)})` : ''}`);
  for (const h of held) check(claims(h) > 0, `${f}: the held-back "Digital Diagnostic" sentence is still rejected, as intended`);
}

console.log(failures ? `\nSELFTEST FAIL (${failures})` : '\nSELFTEST PASS: the gate passes good pages and catches every planted defect');
process.exit(failures ? 1 : 0);

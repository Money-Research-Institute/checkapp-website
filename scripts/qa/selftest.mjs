#!/usr/bin/env node
/**
 * Tests the gate itself. A gate that has never failed on purpose proves nothing, so:
 *   good fixture  -> must PASS with zero blocking issues
 *   bad fixture   -> must FAIL, and must name every defect planted in it
 * Run after any change to check.mjs or budgets.json:  npm run qa:selftest
 */
import { spawnSync } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const run = (name) => {
  const r = spawnSync(process.execPath, ['scripts/qa/check.mjs', '--out', `scripts/qa/fixtures/${name}`, '--viewports', 'selftest',
    '--json', `.qa/selftest/${name}.json`, '--shots', `.qa/selftest/shots-${name}`], { cwd: ROOT, encoding: 'utf8' });
  return r;
};

// Every id below is a defect planted in fixtures/bad/index.html.
const PLANTED = ['overflow-x', 'text-offscreen', 'tap-target', 'broken-image', 'request-failed', 'occlusion', 'cls',
  'console-error', 'canvas-pixels', 'canvas-a11y', 'canvas-state', 'canvas-blank', 'nowebgl-fallback', 'reduced-motion',
  'section-missing', 'a11y', 'meta-lang', 'banned-claim', 'unverified-testimonial', 'brand-assets'];

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

console.log(failures ? `\nSELFTEST FAIL (${failures})` : '\nSELFTEST PASS: the gate passes good pages and catches every planted defect');
process.exit(failures ? 1 : 0);

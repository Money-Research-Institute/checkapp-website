import assert from 'node:assert/strict';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const PRIMARY_PREFIX = 'AKfycbxgm1M73';
const SKIP_DIRS = new Set(['.git', '.next', 'node_modules', 'out', 'coverage']);

function macroUrls(text: string): RegExpMatchArray[] {
  return [...text.matchAll(/https:\/\/script\.google\.com\/macros\/s\/([A-Za-z0-9_-]+)\/exec/g)];
}

function walk(dir: string, files: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    if (SKIP_DIRS.has(entry)) continue;
    const full = path.join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) walk(full, files);
    else if (stat.isFile() && /\.(ts|tsx|js|mjs|json|md|html|yml)$/.test(entry)) files.push(full);
  }
  return files;
}

const deploymentIds = new Map<string, string[]>();
for (const file of walk(ROOT)) {
  const rel = path.relative(ROOT, file);
  if (rel === 'package-lock.json' || rel === 'src/lib/leadsWebhook.test.ts') continue;
  for (const match of macroUrls(readFileSync(file, 'utf8'))) {
    const list = deploymentIds.get(match[1]) ?? [];
    list.push(rel);
    deploymentIds.set(match[1], list);
  }
}

const webhookSource = readFileSync(path.join(ROOT, 'src/lib/leadsWebhook.ts'), 'utf8');
const primaryMatch = macroUrls(webhookSource)[0];
assert.ok(primaryMatch, 'shared webhook module must declare the primary macros URL');
const primaryId = primaryMatch[1];
assert.ok(primaryId.startsWith(PRIMARY_PREFIX), `primary deployment must start with ${PRIMARY_PREFIX}`);

const foundIds = [...deploymentIds.keys()];
assert.ok(
  foundIds.length === 1 && foundIds[0] === primaryId,
  `expected only the shared leads webhook, found: ${[...deploymentIds.entries()]
    .map(([id, files]) => `${id.slice(0, 12)}… (${files.join(', ')})`)
    .join('; ')}`,
);
assert.deepEqual(
  deploymentIds.get(primaryId),
  ['src/lib/leadsWebhook.ts'],
  'the macros URL must live only in the shared webhook module',
);

assert.match(webhookSource, /method:\s*'POST'/);
assert.match(webhookSource, /redirect:\s*'follow'/);
assert.match(webhookSource, /Content-Type':\s*'text\/plain;charset=utf-8'/);
assert.match(webhookSource, /NEXT_PUBLIC_LEADS_WEBHOOK_URL/);

const submitLeadSource = readFileSync(path.join(ROOT, 'src/lib/submitLead.ts'), 'utf8');
assert.match(submitLeadSource, /postToLeadsWebhook\(/, 'submitLead must post through the shared webhook');
assert.doesNotMatch(submitLeadSource, /script\.google\.com/, 'submitLead must not hardcode a macros URL');
assert.match(submitLeadSource, /LEAD_PROJECT_NAME\s*=\s*'checkapp'/);
for (const key of ['name', 'email', 'consent', 'project', 'source', 'timestamp']) {
  assert.match(submitLeadSource, new RegExp(`\\b${key}\\b`), `payload must include ${key}`);
}

const leadFormSource = readFileSync(path.join(ROOT, 'src/components/marketing/LeadForm.tsx'), 'utf8');
assert.match(leadFormSource, /submitLead\(/, 'LeadForm must call submitLead');
assert.doesNotMatch(leadFormSource, /script\.google\.com/);

delete process.env.NEXT_PUBLIC_LEADS_WEBHOOK_URL;
const { LEADS_WEBHOOK_URL, postToLeadsWebhook } = await import('./leadsWebhook.ts');
assert.ok(
  LEADS_WEBHOOK_URL.includes(`/s/${primaryId}/exec`),
  'unset NEXT_PUBLIC_LEADS_WEBHOOK_URL must fall back to the primary deployment',
);

// Mocked fetch only: this test never sends anything to the real sheet.
const calls: { url: string; init: RequestInit }[] = [];
const originalFetch = globalThis.fetch;
globalThis.fetch = (async (url: string | URL | Request, init?: RequestInit) => {
  calls.push({ url: String(url), init: init ?? {} });
  return new Response(JSON.stringify({ result: 'ok' }), { status: 200 });
}) as typeof fetch;

try {
  await postToLeadsWebhook({ project: 'checkapp', email: 'a@b.c' });
} finally {
  globalThis.fetch = originalFetch;
}

assert.equal(calls.length, 1);
assert.equal(calls[0].url, LEADS_WEBHOOK_URL);
assert.equal(calls[0].init.method, 'POST');
assert.equal(calls[0].init.redirect, 'follow');
assert.equal(
  (calls[0].init.headers as Record<string, string>)['Content-Type'],
  'text/plain;charset=utf-8',
);
assert.equal(calls[0].init.body, JSON.stringify({ project: 'checkapp', email: 'a@b.c' }));

console.log('✅ leadsWebhook.test.ts passed');

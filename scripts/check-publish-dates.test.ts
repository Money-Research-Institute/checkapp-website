import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const BLOG_DIR = path.join(ROOT, 'content/blog');

function utcToday(): string {
  return new Date().toISOString().slice(0, 10);
}

function frontmatterValue(raw: string, key: string): string | null {
  const fm = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!fm) return null;
  const line = fm[1].match(new RegExp(`^${key}:\\s*["']?([^"'\\r\\n]+?)["']?\\s*$`, 'm'));
  return line ? line[1] : null;
}

const today = utcToday();
const problems: string[] = [];
let checked = 0;

for (const file of readdirSync(BLOG_DIR).filter((f) => f.endsWith('.mdx') && !f.startsWith('_'))) {
  const raw = readFileSync(path.join(BLOG_DIR, file), 'utf8');
  const date = frontmatterValue(raw, 'datePublished') ?? frontmatterValue(raw, 'date');
  checked++;
  if (!date || !/^\d{4}-\d{2}-\d{2}/.test(date)) {
    problems.push(`${file}: missing or invalid datePublished (${date ?? 'none'})`);
    continue;
  }
  if (date.slice(0, 10) > today) {
    problems.push(`${file}: datePublished ${date} is in the future (today UTC ${today})`);
  }
}

assert.ok(checked > 0, 'no blog posts found');
assert.deepEqual(problems, [], `blog publish-date problems:\n${problems.join('\n')}`);
console.log(`✅ check-publish-dates passed (${checked} posts, none dated after ${today})`);

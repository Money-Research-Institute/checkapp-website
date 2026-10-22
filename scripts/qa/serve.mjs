#!/usr/bin/env node
/** Serve ./out the way the production host does:  node scripts/qa/serve.mjs [port] [dir]  (default 4173, out) */
import { resolve } from 'node:path';
import { serve } from './static-server.mjs';

const port = Number(process.argv[2] ?? 4173);
const dir = resolve(process.argv[3] ?? 'out');
const { base } = await serve(dir, port);
console.log(`serving ${dir} at ${base}`);

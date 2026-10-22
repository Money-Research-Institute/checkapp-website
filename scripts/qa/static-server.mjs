/**
 * Minimal static host for the exported site (trailingSlash-aware). Shared by the gate and by
 * `node scripts/qa/serve.mjs`, so what gets tested is served the way GitHub Pages serves it.
 */
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join } from 'node:path';

const MIME = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css',
  '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.avif': 'image/avif', '.gif': 'image/gif', '.ico': 'image/x-icon',
  '.woff2': 'font/woff2', '.woff': 'font/woff', '.mp4': 'video/mp4', '.webm': 'video/webm', '.txt': 'text/plain',
  '.xml': 'application/xml', '.glb': 'model/gltf-binary', '.ktx2': 'image/ktx2', '.wasm': 'application/wasm',
};

/** Resolve a URL path to a file the way a static host with trailingSlash does. */
export function candidates(dir, p) {
  if (p.endsWith('/')) return [join(dir, p, 'index.html')];
  if (extname(p)) return [join(dir, p)];
  return [join(dir, p, 'index.html'), join(dir, `${p}.html`)];
}

export async function serve(dir, port = 0) {
  const server = createServer(async (req, res) => {
    try {
      const p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
      for (const f of candidates(dir, p)) {
        if (!f.startsWith(dir)) continue; // path traversal
        try {
          if ((await stat(f)).isFile()) {
            res.writeHead(200, { 'content-type': MIME[extname(f)] ?? 'application/octet-stream', 'cache-control': 'no-store' });
            res.end(await readFile(f));
            return;
          }
        } catch { /* try next candidate */ }
      }
      res.writeHead(404, { 'content-type': 'text/plain' });
      res.end('not found');
    } catch {
      res.writeHead(500);
      res.end();
    }
  });
  await new Promise((r) => server.listen(port, '127.0.0.1', r));
  return { server, base: `http://127.0.0.1:${server.address().port}` };
}


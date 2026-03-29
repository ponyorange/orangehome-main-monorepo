/**
 * 同一端口提供 platform / builder 静态资源（需构建时设置 Vite base 为 /platform/、/builder/）
 *
 * 规范路径必须带尾部斜杠：/platform/、/builder/（不是 /platform、/builder）。
 * 无斜杠的请求会 302 到带斜杠地址，并保留 ?query #hash。
 */
import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.join(__dirname, '..');
const roots = {
  '/platform': path.join(repoRoot, 'apps/web_platform/dist'),
  '/builder': path.join(repoRoot, 'apps/web_builder/dist'),
};

function mime(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const map = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.mjs': 'application/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.json': 'application/json',
    '.svg': 'image/svg+xml',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
    '.ico': 'image/x-icon',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
    '.ttf': 'font/ttf',
    '.map': 'application/json',
    '.wasm': 'application/wasm',
  };
  return map[ext] || 'application/octet-stream';
}

function matchBase(pathname) {
  if (pathname === '/platform' || pathname.startsWith('/platform/')) return '/platform';
  if (pathname === '/builder' || pathname.startsWith('/builder/')) return '/builder';
  return null;
}

async function sendFile(res, absPath, method) {
  const st = await fs.stat(absPath);
  if (!st.isFile()) return false;
  const ct = mime(absPath);
  if (method === 'HEAD') {
    res.writeHead(200, { 'Content-Type': ct, 'Content-Length': st.size });
    res.end();
    return true;
  }
  const data = await fs.readFile(absPath);
  res.writeHead(200, { 'Content-Type': ct });
  res.end(data);
  return true;
}

const port = Number(process.env.COMBINED_STATIC_PORT || 60062);

const server = http.createServer(async (req, res) => {
  const host = req.headers.host || 'localhost';
  const url = new URL(req.url || '/', `http://${host}`);
  const pathname = decodeURIComponent(url.pathname);

  const base = matchBase(pathname);
  if (!base) {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Use /platform/ or /builder/');
    return;
  }

  // 无尾部斜杠时补全为 /builder/；必须把 ?query #hash 带上，否则 302 会丢掉参数
  if (pathname === '/platform' || pathname === '/builder') {
    const location = `${base}/${url.search}${url.hash}`;
    res.writeHead(302, { Location: location });
    res.end();
    return;
  }

  const root = roots[base];
  const rel = pathname.slice(base.length).replace(/^\//, '') || 'index.html';
  const rootResolved = path.resolve(root);
  const filePath = path.resolve(path.join(root, rel));
  if (!filePath.startsWith(rootResolved + path.sep) && filePath !== rootResolved) {
    res.writeHead(403);
    res.end();
    return;
  }

  const method = req.method || 'GET';
  if (method !== 'GET' && method !== 'HEAD') {
    res.writeHead(405);
    res.end();
    return;
  }

  try {
    if (await sendFile(res, filePath, method)) return;
  } catch {
    /* fall through to SPA */
  }

  if (method === 'GET' || method === 'HEAD') {
    const indexHtml = path.join(root, 'index.html');
    try {
      if (await sendFile(res, indexHtml, method)) return;
    } catch {
      /* 404 */
    }
  }

  res.writeHead(404);
  res.end();
});

server.listen(port, '0.0.0.0', () => {
  console.log(
    `[combined-static] http://0.0.0.0:${port}/platform/  http://0.0.0.0:${port}/builder/`,
  );
});

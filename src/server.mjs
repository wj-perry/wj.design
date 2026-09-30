import { createServer } from 'node:http';
import { initialize, listIssues, pool } from './store.mjs';
const allowed = new Set((process.env.ALLOWED_ORIGINS || 'https://weijie-products.weiguanghong123.chatgpt.site').split(',').map(s => s.trim()));
await initialize();
const server = createServer(async (req, res) => {
  const origin = req.headers.origin;
  res.setHeader('Vary', 'Origin');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  if (origin && !allowed.has(origin)) { res.writeHead(403); res.end('{"error":"origin_not_allowed"}'); return; }
  if (origin) res.setHeader('Access-Control-Allow-Origin', origin);
  if (req.method === 'OPTIONS') { res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS'); res.writeHead(204); res.end(); return; }
  if (req.method !== 'GET') { res.writeHead(405, { Allow: 'GET, OPTIONS' }); res.end('{"error":"method_not_allowed"}'); return; }
  const pathname = new URL(req.url, 'http://localhost').pathname;
  try {
    if (pathname === '/health') { await pool.query('SELECT 1'); res.end('{"ok":true}'); }
    else if (pathname === '/api/news') { const issues = await listIssues(); res.setHeader('Cache-Control', 'public, max-age=300'); res.end(JSON.stringify({ issues })); }
    else { res.writeHead(404); res.end('{"error":"not_found"}'); }
  } catch { res.writeHead(503); res.end('{"error":"news_temporarily_unavailable"}'); }
});
server.listen(Number(process.env.PORT || 10000), '0.0.0.0', () => console.log('AI 资讯 API 已启动。'));
process.on('SIGTERM', () => server.close(async () => { await pool.end(); process.exit(0); }));

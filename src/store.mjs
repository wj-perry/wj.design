import pg from 'pg';
import { readFile } from 'node:fs/promises';
export const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL, max: 3, connectionTimeoutMillis: 10000, idleTimeoutMillis: 10000 });
export async function initialize() {
  if (!process.env.DATABASE_URL) throw new Error('缺少 DATABASE_URL。');
  await pool.query('CREATE TABLE IF NOT EXISTS ai_news_issues (id text PRIMARY KEY, payload jsonb NOT NULL)');
  const history = JSON.parse(await readFile(new URL('../history.json', import.meta.url), 'utf8'));
  for (const issue of history) {
    if (Date.now() - Date.parse(issue.id) > 52 * 7 * 86400000) continue;
    await pool.query('INSERT INTO ai_news_issues (id, payload) VALUES ($1, $2) ON CONFLICT (id) DO NOTHING', [issue.id, JSON.stringify(issue)]);
    const existing = (await pool.query('SELECT payload FROM ai_news_issues WHERE id = $1', [issue.id])).rows[0]?.payload;
    if (existing) {
      const cached = new Map(issue.items.map(item => [item.id, item]));
      const patched = {...existing, title:existing.title || issue.title, description:existing.description || issue.description, items:existing.items.map(item => {
        const old = cached.get(item.id);
        return old?.text === item.text ? {...item, textZh:item.textZh || old.textZh, title:item.title || old.title, images:item.images?.length ? item.images : old.images || []} : item;
      })};
      if (JSON.stringify(patched) !== JSON.stringify(existing)) await pool.query('UPDATE ai_news_issues SET payload = $2 WHERE id = $1 AND payload = $3::jsonb', [issue.id, JSON.stringify(patched), JSON.stringify(existing)]);
    }
  }
}
export async function listIssues() {
  return (await pool.query('SELECT payload FROM ai_news_issues ORDER BY id DESC LIMIT 52')).rows.map(r => r.payload);
}
export async function saveIssue(issue) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query("SELECT pg_advisory_xact_lock(121800)");
    await client.query('INSERT INTO ai_news_issues (id, payload) VALUES ($1, $2) ON CONFLICT (id) DO UPDATE SET payload = EXCLUDED.payload', [issue.id, JSON.stringify(issue)]);
    await client.query('DELETE FROM ai_news_issues WHERE id NOT IN (SELECT id FROM ai_news_issues ORDER BY id DESC LIMIT 52)');
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally { client.release(); }
}

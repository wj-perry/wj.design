import pg from 'pg';
export const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL, max: 3, connectionTimeoutMillis: 10000, idleTimeoutMillis: 10000 });
export async function initialize() {
  if (!process.env.DATABASE_URL) throw new Error('缺少 DATABASE_URL。');
  await pool.query('CREATE TABLE IF NOT EXISTS ai_news_issues (id text PRIMARY KEY, payload jsonb NOT NULL)');
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

import { readFile } from 'node:fs/promises';
import { collect } from './collect.mjs';
import { initialize, saveIssue, pool } from './store.mjs';
try {
  await initialize();
  const settings = JSON.parse(await readFile(new URL('../settings.json', import.meta.url), 'utf8'));
  const issue = await collect({ token: process.env.X_BEARER_TOKEN, settings });
  await saveIssue(issue);
  console.log(`已发布 ${issue.id} 周报，${issue.items.length} 条资讯。`);
} catch (error) {
  // Do not print HTTP headers, connection strings, or raw API responses.
  console.error(error.message.startsWith('X API') || error.message.startsWith('缺少') || error.message.startsWith('本周') ? error.message : '周报采集或存储失败；已有周报保持不变。');
  process.exitCode = 1;
} finally { await pool.end(); }

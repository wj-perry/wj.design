import { readFile } from 'node:fs/promises';
import { collect } from './collect.mjs';
import { initialize, saveIssue, listIssues, pool } from './store.mjs';
import { translateIssue } from './translate.mjs';
try {
  await initialize();
  const settings = JSON.parse(await readFile(new URL('../settings.json', import.meta.url), 'utf8'));
  const collected = await collect({ token: process.env.X_BEARER_TOKEN, settings });
  const previousItems = (await listIssues()).flatMap(issue => issue.items);
  const issue = await translateIssue(collected, { key: process.env.GOOGLE_TRANSLATE_API_KEY, previousItems });
  if (!process.env.GOOGLE_TRANSLATE_API_KEY) console.warn('尚未配置 GOOGLE_TRANSLATE_API_KEY，本期保留原文。');
  await saveIssue(issue);
  console.log(`已发布 ${issue.id} 周报，${issue.items.length} 条资讯。`);
  console.log(`中文译文 ${issue.items.filter(item => item.textZh).length} 条，配图资讯 ${issue.items.filter(item => item.images?.length).length} 条。`);
} catch (error) {
  // Do not print HTTP headers, connection strings, or raw API responses.
  console.error(error.message.startsWith('X API') || error.message.startsWith('缺少') || error.message.startsWith('本周') ? error.message : '周报采集或存储失败；已有周报保持不变。');
  process.exitCode = 1;
} finally { await pool.end(); }

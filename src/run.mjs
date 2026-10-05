import { readFile } from 'node:fs/promises';
import { collect, issueId } from './collect.mjs';
import { initialize, saveIssue, listIssues, pool } from './store.mjs';
import { translateIssue } from './translate.mjs';
try {
  await initialize();
  const settings = JSON.parse(await readFile(new URL('../settings.json', import.meta.url), 'utf8'));
  const previousIssues = await listIssues();
  const backfill = process.argv.includes('--backfill-oct-2026');
  const dates = backfill ? ['2026-10-02', '2026-10-03', '2026-10-04'] : [null];
  for (const date of dates) {
  const now = date ? new Date(`${date}T09:00:00+08:00`) : new Date();
  const id = issueId(now, settings);
  if (date && previousIssues.some(issue => issue.id === id)) { console.log(`跳过已发布 ${id}`); continue; }
  const previousItems = previousIssues.flatMap(issue => issue.items);
  const alreadyPublished = previousIssues.filter(issue => issue.id !== id && (!date || issue.cadence === 'daily')).flatMap(issue => issue.items);
  const collected = await collect({ token: process.env.X_BEARER_TOKEN, settings, now, previousItems: alreadyPublished, ...(date ? {startTime: new Date(`${date}T00:00:00+08:00`).toISOString(), endTime: new Date(+new Date(`${date}T00:00:00+08:00`) + 86400000).toISOString()} : {}) });
  collected.publishedAt = previousIssues.find(issue => issue.id === id)?.publishedAt || collected.publishedAt;
  const issue = await translateIssue(collected, { key: process.env.GOOGLE_TRANSLATE_API_KEY, previousItems });
  if (!process.env.GOOGLE_TRANSLATE_API_KEY) console.warn('尚未配置 GOOGLE_TRANSLATE_API_KEY，本期保留原文。');
  await saveIssue(issue);
  previousIssues.push(issue);
  console.log(`已发布 ${issue.id} 资讯，${issue.items.length} 条资讯。`);
  console.log(`中文译文 ${issue.items.filter(item => item.textZh).length} 条，配图资讯 ${issue.items.filter(item => item.images?.length).length} 条。`);
  }
} catch (error) {
  // Do not print HTTP headers, connection strings, or raw API responses.
  console.error(error.message.startsWith('X API') || error.message.startsWith('缺少') || error.message.startsWith('本次') ? error.message : '资讯采集或存储失败；已有资讯保持不变。');
  process.exitCode = 1;
} finally { await pool.end(); }

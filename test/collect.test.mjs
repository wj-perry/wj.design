import test from 'node:test';
import assert from 'node:assert/strict';
import { collect, weekId } from '../src/collect.mjs';
const settings = { query: 'from:OpenAI', maxPages: 2, maxItems: 30, categories: { '开发': ['api'] } };
test('按北京时间计算周一归档日期', () => {
  assert.equal(weekId(new Date('2026-10-04T16:00:00Z')), '2026-10-05');
  assert.equal(weekId(new Date('2026-10-04T15:59:59Z')), '2026-09-28');
});
test('分页去重，保留来源并分类', async () => {
  let calls = 0;
  const issue = await collect({ token: 'test-only', settings, now: new Date('2026-09-30T01:00:00Z'), request: async url => {
    calls++;
    assert.equal(url.searchParams.get('next_token'), calls === 1 ? null : 'page2');
    return { ok: true, json: async () => ({ data: [{ id: '1', text: 'New API', author_id: 'a', created_at: '2026-09-29T01:00:00Z' }], includes: { users: [{ id: 'a', username: 'OpenAI' }] }, meta: calls === 1 ? { next_token: 'page2' } : {} }) };
  }});
  assert.equal(calls, 2);
  assert.equal(issue.items.length, 1);
  assert.equal(issue.items[0].category, '开发');
  assert.equal(issue.items[0].author, 'OpenAI');
});
test('权限错误、部分失败、空数据均阻止发布', async () => {
  for (const response of [{ ok: false, status: 401 }, { ok: true, json: async () => ({ errors: [{}] }) }, { ok: true, json: async () => ({ data: [] }) }]) {
    await assert.rejects(collect({ token: 'test-only', settings, request: async () => response }));
  }
});

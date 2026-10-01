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

test('图片附件映射到正确帖子，仅保留可信图片来源', async () => {
  const issue = await collect({token:'test',settings,request:async url => {
    assert.equal(url.searchParams.get('expansions'), 'author_id,attachments.media_keys');
    return {ok:true,json:async()=>({data:[{id:'p',text:'New API',author_id:'a',attachments:{media_keys:['image','video','bad']}}],includes:{users:[{id:'a',username:'OpenAI'}],media:[{media_key:'image',type:'photo',url:'https://pbs.twimg.com/media/test.jpg',alt_text:'图'},{media_key:'video',type:'video'},{media_key:'bad',type:'photo',url:'javascript:alert(1)'}]}})};
  }});
  assert.equal(issue.items[0].images.length,1);
  assert.equal(issue.items[0].images[0].alt,'图');
});

test('视频选择最高码率 MP4，拒绝其他来源并保留预览图', async () => {
  const issue = await collect({token:'test',settings,request:async url => {
    assert.ok(url.searchParams.get('media.fields').includes('variants'));
    return {ok:true,json:async()=>({data:[{id:'p',text:'API',author_id:'a',attachments:{media_keys:['v','bad']}}],includes:{users:[{id:'a',username:'OpenAI',name:'OpenAI',profile_image_url:'https://pbs.twimg.com/profile_images/a.jpg'}],media:[{media_key:'v',type:'video',preview_image_url:'https://pbs.twimg.com/media/poster.jpg',variants:[{content_type:'video/mp4',bit_rate:100,url:'https://video.twimg.com/low.mp4'},{content_type:'video/mp4',bit_rate:200,url:'https://video.twimg.com/high.mp4'},{content_type:'application/x-mpegURL',url:'https://video.twimg.com/index.m3u8'}]},{media_key:'bad',type:'video',variants:[{content_type:'video/mp4',url:'https://example.com/fake.mp4'}]}]}})};
  }});
  assert.equal(issue.items[0].videos.length,1);
  assert.equal(issue.items[0].videos[0].url,'https://video.twimg.com/high.mp4');
  assert.equal(issue.items[0].videos[0].poster,'https://pbs.twimg.com/media/poster.jpg');
});

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

test('daily issue uses Shanghai date, queries 24h, excludes published items and preserves media', async () => {
  const now = new Date('2026-10-05T16:00:00Z');
  const dailySettings = {...settings, cadence:'daily', maxItems:15};
  const issue = await collect({token:'test',settings:dailySettings,now,previousItems:[{id:'old',text:'old API'}],request:async url=>{
    assert.equal(url.searchParams.get('start_time'),'2026-10-04T16:01:00.000Z');
    return {ok:true,json:async()=>({data:[{id:'old',text:'old API',author_id:'a'},{id:'new',text:'New API release',author_id:'a'}],includes:{users:[{id:'a',username:'OpenAI'}]}})};
  }});
  assert.equal(issue.id,'2026-10-06-daily');
  assert.equal(issue.cadence,'daily');
  assert.deepEqual(issue.items.map(x=>x.id),['new']);
});

test('daily caps at 15 and prioritizes substantive releases over popular teasers', async () => {
  const posts=[{id:'teaser',text:'Get ready',author_id:'a',public_metrics:{like_count:999999}},...Array.from({length:20},(_,i)=>({id:String(i),text:`New API release ${i}`,author_id:'a',public_metrics:{like_count:i}}))];
  const issue=await collect({token:'test',settings:{...settings,cadence:'daily',maxItems:15},request:async()=>({ok:true,json:async()=>({data:posts,includes:{users:[{id:'a',username:'OpenAI'}]}})})});
  assert.equal(issue.items.length,15);
  assert.ok(issue.items.every(x=>x.id!=='teaser'));
});

test('multiple source queries aggregate posts, reset paging and deduplicate before selection', async () => {
  const daily={...settings,cadence:'daily',maxItems:15,queries:['from:OpenAI','from:figma']};
  const calls=[];
  const issue=await collect({token:'test',settings:daily,request:async url=>{
    calls.push([url.searchParams.get('query'),url.searchParams.get('next_token')]);
    return {ok:true,json:async()=>({data:[{id:'shared',text:'New API release',author_id:'a'},{id:url.searchParams.get('query'),text:'New design release',author_id:'a'}],includes:{users:[{id:'a',username:'OpenAI'}]}})};
  }});
  assert.deepEqual(calls,[['from:OpenAI',null],['from:figma',null]]);
  assert.equal(issue.items.length,3);
});
test('a failed source query prevents publishing a partial daily edition', async () => {
  let calls=0;
  await assert.rejects(collect({token:'test',settings:{...settings,queries:['from:OpenAI','from:figma']},request:async()=>{
    calls++;
    return calls===1?{ok:true,json:async()=>({data:[{id:'p',text:'New API',author_id:'a'}],includes:{users:[{id:'a',username:'OpenAI'}]}})}:{ok:false,status:429};
  }}));
});

import test from 'node:test';
import assert from 'node:assert/strict';
import { translateIssue } from '../src/translate.mjs';
const issue = { id: 'week', items: [{ id: '1', text: 'Hello' }, { id: '2', text: 'World', images: [{url:'https://pbs.twimg.com/media/test.jpg'}] }] };
test('复用未改变的原文译文，并为新内容按顺序保存中文', async () => {
  const result = await translateIssue(issue, { key: 'test', previousItems: [{ id:'1', text:'Hello', textZh:'你好' }], request:async (url, options) => {
    assert.deepEqual(JSON.parse(options.body).q, ['World']);
    assert.equal(options.headers['X-Goog-Api-Key'], 'test');
    return {ok:true,json:async()=>({data:{translations:[{translatedText:'世界'}]}})};
  }});
  assert.deepEqual(result.items.map(i=>i.textZh), ['你好','世界']);
  assert.deepEqual(result.items[1].images, issue.items[1].images);
  assert.equal(issue.items[1].textZh, undefined);
});
test('没有密钥不调用翻译，异常和不完整结果保留原文', async () => {
  assert.deepEqual(await translateIssue(issue, { request:()=>{throw Error('must not call');} }), issue);
  for (const response of [{ok:false}, {ok:true,json:async()=>({data:{translations:[{translatedText:'不完整'}]}})}]) {
    assert.deepEqual(await translateIssue(issue, {key:'test',request:async()=>response}), issue);
  }
});

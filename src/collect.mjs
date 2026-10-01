export function weekId(now) {
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Shanghai', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(now);
  const part = type => parts.find(p => p.type === type).value;
  const day = new Date(`${part('year')}-${part('month')}-${part('day')}T00:00:00Z`);
  day.setUTCDate(day.getUTCDate() - (day.getUTCDay() + 6) % 7);
  return day.toISOString().slice(0, 10);
}

export async function collect({ token, settings, now = new Date(), request = fetch }) {
  if (!token) throw new Error('缺少 X_BEARER_TOKEN，请在 Render 环境变量中填写。');
  const users = new Map(), posts = new Map(), media = new Map();
  let next;
  for (let page = 0; page < settings.maxPages; page++) {
    const url = new URL('https://api.x.com/2/tweets/search/recent');
    const params = { query: settings.query, max_results: '100', start_time: new Date(+now - 7 * 86400000 + 60000).toISOString(), end_time: new Date(+now - 30000).toISOString(), 'tweet.fields': 'created_at,author_id,public_metrics,attachments', expansions: 'author_id,attachments.media_keys', 'user.fields': 'username,name,profile_image_url', 'media.fields': 'url,type,width,height,alt_text,preview_image_url,variants' };
    for (const [key, value] of Object.entries(params)) url.searchParams.set(key, value);
    if (next) url.searchParams.set('next_token', next);
    const response = await request(url, { headers: { Authorization: `Bearer ${token}` }, signal: AbortSignal.timeout(30000) });
    if (!response.ok) throw new Error(`X API 请求失败（${response.status}），已有周报保持不变。`);
    const result = await response.json();
    if (result.errors?.length) throw new Error('X API 返回不完整数据，已有周报保持不变。');
    for (const user of result.includes?.users || []) users.set(user.id, user);
    for (const image of result.includes?.media || []) media.set(image.media_key, image);
    for (const post of result.data || []) posts.set(post.id, post);
    next = result.meta?.next_token;
    if (!next) break;
  }
  const categoryFor = text => Object.entries(settings.categories).find(([, words]) => words.some(word => text.toLowerCase().includes(word.toLowerCase())))?.[0] || '其他';
  const items = [...posts.values()].filter(p => users.has(p.author_id) && typeof p.text === 'string').sort((a,b) => (b.public_metrics?.like_count || 0) - (a.public_metrics?.like_count || 0)).slice(0, settings.maxItems).map(p => ({ id: p.id, text: p.text, author: users.get(p.author_id).username, authorName: users.get(p.author_id).name, avatar: users.get(p.author_id).profile_image_url, videos: (p.attachments?.media_keys || []).map(key => media.get(key)).filter(m => m && ['video','animated_gif'].includes(m.type)).map(m => ({url: (m.variants || []).filter(v => v.content_type === 'video/mp4' && /^https:\/\/video\.twimg\.com\//.test(v.url || '')).sort((a,b) => (b.bit_rate || 0) - (a.bit_rate || 0))[0]?.url, poster: /^https:\/\/pbs\.twimg\.com\//.test(m.preview_image_url || '') ? m.preview_image_url : undefined})).filter(v => v.url), createdAt: p.created_at, category: categoryFor(p.text), images: (p.attachments?.media_keys || []).map(key => media.get(key)).filter(image => image?.type === 'photo' && /^https:\/\/pbs\.twimg\.com\//.test(image.url || '')).map(image => ({ url: image.url, alt: image.alt_text || '原帖配图', width: image.width, height: image.height })) }));
  if (!items.length) throw new Error('本周没有符合条件的资讯，已有周报保持不变。');
  const id = weekId(now);
  return { id, label: `${id} 当周`, publishedAt: now.toISOString(), items };
}

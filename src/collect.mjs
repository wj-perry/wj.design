export function weekId(now) {
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Shanghai', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(now);
  const part = type => parts.find(p => p.type === type).value;
  const day = new Date(`${part('year')}-${part('month')}-${part('day')}T00:00:00Z`);
  day.setUTCDate(day.getUTCDate() - (day.getUTCDay() + 6) % 7);
  return day.toISOString().slice(0, 10);
}

export function dayId(now) {
  const parts = new Intl.DateTimeFormat('en-CA', {timeZone:'Asia/Shanghai',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(now);
  return ['year','month','day'].map(type=>parts.find(p=>p.type===type).value).join('-');
}

export function issueId(now, settings) {
  return settings.cadence === 'daily' ? dayId(now) + '-daily' : weekId(now);
}

export function selectPosts(posts, settings, previousItems = []) {
  const seen = new Set(previousItems.map(item => item.id));
  const normalized = text => text.toLowerCase().replace(/https?:\/\/\S+/g,'').replace(/\s+/g,' ').trim();
  const previousTexts = new Set(previousItems.map(item=>normalized(item.text || '')).filter(Boolean));
  const score = post => {
    const text = post.text.toLowerCase();
    let relevance = 0;
    for (const words of Object.values(settings.categories)) if(words.some(word=>text.includes(word.toLowerCase())))relevance++;
    if(/launch|release|introducing|research|paper|benchmark|new feature|发布|上线|研究/.test(text))relevance+=2;
    if(/get ready|don't be late|on the dot|准备好了/.test(text))relevance-=3;
    return relevance * 10 + Math.log1p(post.public_metrics?.like_count || 0);
  };
  return posts.filter(post=>!seen.has(post.id) && !previousTexts.has(normalized(post.text))).sort((a,b)=>score(b)-score(a) || String(b.created_at || '').localeCompare(a.created_at || '')).slice(0,settings.maxItems);
}

export async function collect({ token, settings, now = new Date(), request = fetch, previousItems = [], startTime, endTime }) {
  if (!token) throw new Error('缺少 X_BEARER_TOKEN，请在 Render 环境变量中填写。');
  const users = new Map(), posts = new Map(), media = new Map();
  for (const query of settings.queries || [settings.query]) {
  let next;
  for (let page = 0; page < settings.maxPages; page++) {
    const url = new URL('https://api.x.com/2/tweets/search/recent');
    const params = { query, max_results: '100', start_time: startTime || new Date(+now - (settings.cadence === 'daily' ? 1 : 7) * 86400000 + 60000).toISOString(), end_time: endTime || new Date(+now - 30000).toISOString(), 'tweet.fields': 'created_at,author_id,public_metrics,attachments', expansions: 'author_id,attachments.media_keys', 'user.fields': 'username,name,profile_image_url', 'media.fields': 'url,type,width,height,alt_text,preview_image_url,variants' };
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
  }
  const categoryFor = text => Object.entries(settings.categories).find(([, words]) => words.some(word => text.toLowerCase().includes(word.toLowerCase())))?.[0] || '其他';
  const candidates = [...posts.values()].filter(p => users.has(p.author_id) && typeof p.text === 'string').filter(p => !settings.bloggerAccounts?.includes(users.get(p.author_id).username) || (settings.bloggerKeywords || []).some(word => word === 'ai' ? /\bai\b/i.test(p.text) : p.text.toLowerCase().includes(word.toLowerCase())));
  const items = (settings.cadence === 'daily' ? selectPosts(candidates, settings, previousItems) : candidates.sort((a,b) => (b.public_metrics?.like_count || 0) - (a.public_metrics?.like_count || 0)).slice(0, settings.maxItems)).map(p => ({ id: p.id, text: p.text, author: users.get(p.author_id).username, authorName: users.get(p.author_id).name, avatar: users.get(p.author_id).profile_image_url, videos: (p.attachments?.media_keys || []).map(key => media.get(key)).filter(m => m && ['video','animated_gif'].includes(m.type)).map(m => ({url: (m.variants || []).filter(v => v.content_type === 'video/mp4' && /^https:\/\/video\.twimg\.com\//.test(v.url || '')).sort((a,b) => (b.bit_rate || 0) - (a.bit_rate || 0))[0]?.url, poster: /^https:\/\/pbs\.twimg\.com\//.test(m.preview_image_url || '') ? m.preview_image_url : undefined})).filter(v => v.url), createdAt: p.created_at, category: categoryFor(p.text), images: (p.attachments?.media_keys || []).map(key => media.get(key)).filter(image => image?.type === 'photo' && /^https:\/\/pbs\.twimg\.com\//.test(image.url || '')).map(image => ({ url: image.url, alt: image.alt_text || '原帖配图', width: image.width, height: image.height })) }));
  if (!items.length) throw new Error('本次没有新的符合条件的资讯，已有周报保持不变。');
  const id = issueId(now, settings);
  return { id, cadence: settings.cadence || 'weekly', label: settings.cadence === 'daily' ? dayId(now) + ' 每日精选' : `${id} 当周`, publishedAt: now.toISOString(), items };
}

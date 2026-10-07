window.renderAINews = function(root, archiveNav) {
  const seeds = window.aiNewsIssues || [];
  let chosenId = new URLSearchParams(location.search).get('issue');
  let issues = [...seeds].sort((a,b) => b.id.localeCompare(a.id));
  let selected = issues.find(i => i.id === chosenId) || issues[0];
  let category = '全部', loading = true, failed = false;
  let archiveQuery = '';
  let articleObserver;
  const categories = ['全部','设计','产品','开发','研究','其他'];
  const safeURL = value => { try { const u = new URL(value); return u.protocol === 'https:' ? u.href : null; } catch { return null; } };
  const mediaURL = value => { const url = safeURL(value); return url && ['pbs.twimg.com','video.twimg.com','www-cdn.anthropic.com','cdn.sanity.io','elyx.design'].includes(new URL(url).hostname) ? url : null; };
  const localVideoURL = value => typeof value === 'string' && /^assets\/news-videos\/[a-f0-9]{16}\.mp4$/.test(value) ? value : null;
  const releaseDate = issue => { const date = new Date(issue.publishedAt || issue.id); return Number.isNaN(+date) ? issue.id : new Intl.DateTimeFormat('zh-CN',{timeZone:'Asia/Shanghai',year:'numeric',month:'long',day:'numeric'}).format(date); };
  const el = (tag, cls, text) => { const node = document.createElement(tag); if(cls) node.className=cls; if(text) node.textContent=text; return node; };
  const section = el('section','tool-section news-section'); section.id='ai-news';
  section.innerHTML='<div class="section-head"><span>01</span><h2>AI资讯</h2><p>每日精选 · 产品、设计与研究</p></div><div class="news-toolbar"><div class="news-filters"></div></div><header class="news-issue-header"></header><nav class="news-toc" aria-label="本期目录"></nav><details class="news-toc-mobile"><summary>本期目录</summary><nav aria-label="本期目录"></nav></details><figure class="news-cover" hidden></figure><div class="news-items" aria-live="polite"></div><div class="news-footer">每日精选 15 条 · 保留原始来源</div>';
  root.append(section);
  const archiveWrap = archiveNav.closest('.section-nav-wrap');
  let archiveSearch = archiveWrap?.querySelector('.news-archive-search');
  if (archiveWrap && !archiveSearch) {
    archiveSearch = el('label','news-archive-search');
    archiveSearch.innerHTML = '<i data-lucide="search" aria-hidden="true"></i><input type="search" placeholder="搜索标题或日期" aria-label="按标题或日期搜索 AI 资讯" autocomplete="off">';
    archiveWrap.querySelector('.section-nav-header')?.append(archiveSearch);
    const input = archiveSearch.querySelector('input');
    input.addEventListener('input', () => { archiveQuery = input.value.trim(); renderArchive(); });
    input.addEventListener('keydown', event => {
      if (event.key === 'Escape' && input.value) { input.value = ''; archiveQuery = ''; renderArchive(); }
    });
  }
  const searchable = value => String(value || '').toLocaleLowerCase('zh-CN').replace(/[\s年月日./_-]+/g,'');
  const renderArchive = () => {
    archiveNav.replaceChildren();
    const query = searchable(archiveQuery);
    const matches = issues.filter(issue => !query || searchable(`${issue.title || ''} ${releaseDate(issue)} ${issue.id}`).includes(query));
    for (const issue of matches) {
      const link = el('a', 'news-archive-link');
      const url = new URL(location.href);
      url.searchParams.set('page', 'news'); url.searchParams.set('issue', issue.id); url.hash = '';
      link.href = url.pathname + url.search;
      link.append(el('span', 'news-archive-title', issue.title || 'AI 精选资讯'),el('span', 'news-archive-date', releaseDate(issue)));
      link.title = issue.title || 'AI 周报';
      const active = issue.id === selected?.id;
      link.classList.toggle('active', active);
      if (active) link.setAttribute('aria-current', 'page');
      link.addEventListener('click', event => {
        if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
        event.preventDefault();
        chosenId = issue.id; selected = issue;
        history.pushState({page:'news'}, '', link.href);
        renderArchive(); render();
        section.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'});
      });
      archiveNav.append(link);
    }
    if (!matches.length) {
      const empty = el('p','news-archive-empty','没有找到匹配的资讯');
      empty.setAttribute('role','status');
      archiveNav.append(empty);
    }
  };
  const render = () => {
    const container=section.querySelector('.news-items'), header=section.querySelector('.news-issue-header'),toc=section.querySelector('.news-toc');
    articleObserver?.disconnect();
    const mobileToc=section.querySelector('.news-toc-mobile nav');mobileToc.replaceChildren();section.querySelector('.news-toc-mobile').open=false;
    container.replaceChildren();header.replaceChildren();toc.replaceChildren();
    const cover = section.querySelector('.news-cover'); cover.replaceChildren(); cover.hidden = true;
    const coverItem = (selected?.items || []).find(item => item.images?.some(image => mediaURL(image.url)));
    const image = coverItem?.images.find(image => mediaURL(image.url));
    if (image) {
      const img = el('img'); img.src = mediaURL(image.url); img.alt = image.alt || '本期封面'; img.decoding = 'async';
      img.addEventListener('error', () => { cover.hidden = true; });
      const caption = el('figcaption','news-cover-credit');
      caption.append(document.createTextNode('封面来自「'));
      const source = el('a','',coverItem.sourceName || coverItem.authorName || coverItem.author || '原帖作者');
      source.href = safeURL(image.sourceUrl) || safeURL(coverItem.sourceUrl) || `https://x.com/${encodeURIComponent(coverItem.author)}/status/${encodeURIComponent(coverItem.id)}`;
      source.target = '_blank'; source.rel = 'noopener noreferrer';
      caption.append(source,document.createTextNode('」'));
      cover.append(img,caption); cover.hidden = false;
    }
    if(selected){
      header.append(el('span','news-kicker',(selected.cadence==='daily'?'AI DAILY / ':'AI WEEKLY / ')+releaseDate(selected)),el('h3','',selected.title || 'AI 有什么新变化？'),el('p','news-issue-meta',`微光 · ${releaseDate(selected)} · ${selected.items.length} 条资讯`),el('p','news-issue-description',selected.description || '关注新产品、设计工具、开发实践与模型研究。'));
    }
    section.querySelector('.news-footer').textContent=`每日精选 ${selected?.items?.length || 0} 条 · 保留原始来源`;
    const items=(selected?.items||[]).filter(item=>category==='全部'||item.category===category);
    if(!items.length)container.append(el('p','news-empty',selected?'本期暂无这一类资讯。':loading?'正在加载资讯…':failed?'资讯暂时无法加载，请稍后重试。':'首期 AI 周报，待发布。'));
    items.forEach((item,index)=>{
      const row=el('article','news-item');row.id='news-'+item.id;
      const meta=el('div','news-meta');const avatar=mediaURL(item.avatar);if(avatar){const img=el('img','news-avatar');img.src=avatar;img.alt='';img.loading='lazy';meta.append(img);}
      meta.append(el('span','',`${item.sourceName || item.authorName || '@'+item.author} · ${item.category} · ${new Date(item.createdAt).toLocaleDateString('zh-CN')}`));row.append(meta);
      const title=item.title || (item.textZh || '').split(/\n/)[0].slice(0,48) || '资讯 '+(index+1);
      if(item.title)row.append(el('h4','',item.title));
      const a=el('a');a.href='#'+row.id;a.setAttribute('aria-label',`${index+1}. ${title}`);a.append(el('span','news-toc-label',String(index+1).padStart(2,'0')+' '+title),el('span','news-toc-line'));
      const mobileLink=el('a','',String(index+1).padStart(2,'0')+' '+title);mobileLink.href=a.href;
      mobileLink.addEventListener('click',()=>section.querySelector('.news-toc-mobile').open=false);mobileToc.append(mobileLink);toc.append(a);
      for(const paragraph of (item.textZh || '本条资讯正在整理中文，完成后会自动更新。').split(/\n\s*\n/))row.append(el('p','',paragraph));
      if(item.insightZh){const insight=el('aside','news-insight');insight.setAttribute('aria-label','AI 解读');insight.append(el('span','news-insight-label','AI 解读'),el('p','',item.insightZh));row.append(insight);}
      for(const image of item.images||[]){const url=mediaURL(image.url);if(!url)continue;const figure=el('figure','news-media'),a=el('a');a.href=url;a.target='_blank';a.rel='noopener noreferrer';const img=el('img');img.src=url;img.alt=image.alt||'原文配图';img.loading='lazy';img.decoding='async';img.addEventListener('error',()=>{figure.replaceChildren(el('p','news-media-error','配图暂时无法加载，请查看原文。'));});a.append(img);figure.append(a);if(image.alt)figure.append(el('figcaption','',image.alt));row.append(figure);}
      for(const video of item.videos||[]){
        const figure=el('figure','news-media');const url=mediaURL(video.url);
        if(url || localVideoURL(video.localUrl)){
          const player=el('video');player.src=localVideoURL(video.localUrl) || url;player.controls=true;player.preload='none';player.playsInline=true;player.setAttribute('aria-label',video.title || item.title || '原帖视频');
          const poster=mediaURL(video.poster);if(poster)player.poster=poster;
          let usedFallback=false;
          player.addEventListener('error',()=>{
            if(localVideoURL(video.localUrl) && url && !usedFallback){usedFallback=true;player.src=url;player.load();return;}
            if(!figure.querySelector('.news-media-error')){const message=el('p','news-media-error','视频暂时无法加载，');const link=el('a','','查看原帖');link.href=safeURL(item.sourceUrl)||`https://x.com/${encodeURIComponent(item.author)}/status/${encodeURIComponent(item.id)}`;link.target='_blank';link.rel='noopener noreferrer';message.append(link);figure.append(message);}
          });
          player.addEventListener('play',()=>section.querySelectorAll('video').forEach(other=>{if(other!==player)other.pause();}));
          figure.append(player);
        }
        else if(safeURL(video.embedUrl)&&new URL(video.embedUrl).hostname==='www.youtube-nocookie.com'&&/^\/embed\/[A-Za-z0-9_-]+$/.test(new URL(video.embedUrl).pathname)){const iframe=el('iframe');iframe.src=video.embedUrl;iframe.title=video.title||'官方视频';iframe.loading='lazy';iframe.allow='fullscreen; picture-in-picture';iframe.allowFullscreen=true;iframe.referrerPolicy='strict-origin-when-cross-origin';figure.append(iframe);}
        if(figure.children.length){figure.append(el('figcaption','',video.title||'原帖视频'));row.append(figure);}
      }
      if(item.textZh&&!item.curated){const details=el('details','news-original');details.append(el('summary','','查看原文'),el('p','',item.text));row.append(details);}
      const source=safeURL(item.sourceUrl)||`https://x.com/${encodeURIComponent(item.author)}/status/${encodeURIComponent(item.id)}`;
      const link=el('a','news-source',item.sourceUrl?'阅读官方原文 ↗':'阅读 X 原帖 ↗');link.href=source;link.target='_blank';link.rel='noopener noreferrer';row.append(link);container.append(row);
    });
    section.querySelector('.news-toc-mobile').hidden=!items.length;
    const positions=new Map();
    articleObserver=new IntersectionObserver(entries=>{
      if(!section.isConnected){articleObserver.disconnect();return;}
      for(const entry of entries)positions.set(entry.target.id,entry.isIntersecting);
      const current=[...container.children].find(node=>positions.get(node.id));if(!current)return;
      section.querySelectorAll('.news-toc a,.news-toc-mobile nav a').forEach(link=>{const active=link.hash==='#'+current.id;link.classList.toggle('active',active);if(active)link.setAttribute('aria-current','location');else link.removeAttribute('aria-current');});
    },{rootMargin:'-15% 0px -55% 0px'});
    container.querySelectorAll('.news-item').forEach(row=>articleObserver.observe(row));
  };
  for(const name of categories){const button=el('button','',name);button.type='button';button.setAttribute('aria-pressed',String(category===name));button.onclick=()=>{category=name;section.querySelectorAll('.news-filters button').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));render();};section.querySelector('.news-filters').append(button);}
  renderArchive();render();
  fetch('https://weijie-ai-news-api.onrender.com/api/news',{signal:AbortSignal.timeout(90000)}).then(r=>{if(!r.ok)throw Error('unavailable');return r.json();}).then(data=>{
    if(!Array.isArray(data.issues)||!data.issues.every(i=>typeof i.id==='string'&&Array.isArray(i.items)))throw Error('invalid');
    if (!section.isConnected) return;
    const translated = new Map(seeds.map(i => [i.id, i]));
    const live = data.issues.map(issue => {
      const saved = translated.get(issue.id);
      if (!saved) return {...issue,items:issue.items.filter(item=>item.textZh)};
      const cached = new Map(saved.items.map(item => [item.id, item]));
      const items=issue.items.map(item => {
        const old = cached.get(item.id);
        const videos = item.videos?.length ? item.videos.map(video => ({...video, localUrl:old?.videos?.find(cachedVideo => cachedVideo.url===video.url)?.localUrl})) : old?.videos || [];
        return old?.text === item.text ? {...item, textZh:old.textZh || item.textZh, insightZh:old.insightZh || item.insightZh, title:old.title || item.title, images:item.images?.length ? item.images : old.images || [], videos} : item;
      }).filter(item=>item.textZh);
      return {...issue, publishedAt:saved.publishedAt || issue.publishedAt, title:saved.title || issue.title, description:saved.description || issue.description, items:items.length?items:saved.items};
    }).filter(issue=>issue.items.length);
    issues=[...new Map([...seeds,...live].map(i=>[i.id,i])).values()].sort((a,b)=>b.id.localeCompare(a.id));selected=issues.find(i=>i.id===chosenId)||issues[0];renderArchive();
  }).catch(()=>{failed=true;}).finally(()=>{loading=false;if(section.isConnected)render();});
};

const root = document.documentElement;
const body = document.body;
const catalogueSections = window.visualSections || [];
const componentSections = window.componentSections || [];
const productSections = window.productSections || [];
const designResources = window.designResources || [];
const resourceSection = (id, index, title, description, type) => ({
  id, index, title, description,
  count: designResources.filter(item => item[0] === type).length,
  tools: designResources.filter(item => item[0] === type).map(([, name, desc, url]) => [name, desc, url])
});
const inspirationSections = [
  resourceSection('galleries', '01', '画廊', '精选网站、产品与视觉灵感。', 'gallery'),
  resourceSection('interface', '02', '界面', '界面设计、工具与创作平台。', 'interface'),
  resourceSection('reading', '03', '阅读', '设计、产品与开发实践文章。', 'reading')
];
const pageKeys = ['news', 'products', 'inspiration', 'components', 'build', 'visuals', 'utilities', 'designer', 'about'];
const requestedPage = new URLSearchParams(location.search).get('page');
let activePage = pageKeys.includes(requestedPage) ? requestedPage : 'news';
let activeSections = catalogueSections;
let aboutReturnPage = new URLSearchParams(location.search).get('from');
if (!pageKeys.includes(aboutReturnPage) || aboutReturnPage === 'about') aboutReturnPage = 'products';
const allTools = [...catalogueSections, ...componentSections, ...inspirationSections].flatMap(section => section.tools.map(([name, description, url]) => ({
  name,
  description,
  url,
  category: section.title,
  sectionId: section.id,
  domain: new URL(url).hostname.replace(/^www\./, '')
})));
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
const xCreators = [
  ['EK','Emil Kowalski','Sonner、Vaul 与动效体验的创作者。','https://x.com/emilkowalski_','#6ecff6'],
  ['RF','Rauno Freiberg','Vercel 交互设计师，《Interaction Guidelines》作者。','https://x.com/raunofreiberg','#f0d900'],
  ['PC','Paco Coursey','cmdk、next-themes 等开源项目作者。','https://x.com/pacocoursey','#5865f2'],
  ['AA','Adam Argyle','Chrome DevRel，长期分享现代 CSS。','https://x.com/argyleink','#b86cff'],
  ['SD','Sarah Drasner','工程管理者、网页动画作者与讲师。','https://x.com/sarah_edo','#7b8ca8'],
  ['JT','Jhey Tompkins','擅长创造有趣的 CSS 与交互实验。','https://x.com/jh3yy','#171817'],
  ['LF','Lynn Fisher','Single Div 项目背后的设计师。','https://x.com/lynnandtonic','#9aa1a8'],
  ['SC','shadcn','shadcn/ui 与组件生态的创作者。','https://x.com/shadcn','#111210'],
  ['GR','Guillermo Rauch','Vercel 创始人，关注开发者体验与 AI 产品。','https://x.com/rauchg','#4a7d66'],
  ['LR','Lee Robinson','分享 Next.js、产品与开发者关系实践。','https://x.com/leeerob','#3f83f8'],
  ['BC','Bartosz Ciechanowski','用高质量交互文章解释复杂概念。','https://x.com/bciechanowski','#ef4d67'],
  ['SS','Steve Schoger','Refactoring UI 作者，专注界面视觉细节。','https://x.com/steveschoger','#8d6b4f'],
  ['RA','Rasmus Andersson','Inter 字体作者，设计师与软件工程师。','https://x.com/rsms','#ef7f45'],
  ['DH','Dan Hollick','用视觉化方式讲解产品与技术概念。','https://x.com/danhollick','#4465e8'],
  ['MP','Miguel Piedrafita','独立开发者，持续构建轻巧的 AI 产品。','https://x.com/m1guelpf','#9465d8'],
  ['JY','Jason Yuan','产品设计师，关注 AI 原生交互体验。','https://x.com/jasonyuandesign','#ea4b8b']
];

const aiNewsSources = [
  ['OA','OpenAI','AI 研究、模型与产品官方动态。','OpenAI'],
  ['AN','Anthropic','Claude 与 AI 安全研究官方动态。','AnthropicAI'],
  ['GD','Google DeepMind','Google DeepMind 研究与模型进展。','GoogleDeepMind'],
  ['HF','Hugging Face','开源模型、数据集与社区动态。','huggingface'],
  ['VE','Vercel','AI 开发工具与前端平台更新。','vercel'],
  ['FG','Figma','设计工具与 AI 功能更新。','figma'],
  ['AK','Andrej Karpathy','AI 研究、教育与工程实践。','karpathy'],
  ['BC','Boris Cherny','Claude Code 创建者，分享使用技巧。','bcherny'],
  ['TR','Thariq','Claude Code 开发与实践文章。','trq212'],
  ['PN','Noam Brown','推理研究与技术细节。','polynoamial'],
  ['GB','Gabriel','Sora 开发与生成式视频进展。','gabriel1'],
  ['JN','Jason Liu','开发者体验与 Codex 相关内容。','jxnlco'],
  ['LK','Logan Kilpatrick','Gemini 与 Google AI Studio 更新。','OfficialLoganK'],
  ['AM','Ammaar Reshi','AI 产品、设计与氛围编码。','ammaar'],
  ['FF','fofrAI','生成模型的创意用例。','fofrAI'],
  ['EZ','Eric Zakariasson','Cursor 使用方法与产品洞察。','ericzakariasson'],
  ['MT','Michael Truell','Cursor CEO，分享产品发布与使用更新。','mntruell'],
  ['AE','AI Explorer','AI 工具、内容与免费资源。','ai_explorer25'],
  ['MC','Mili','xAI 与 Grok 产品更新。','milichab'],
  ['SK','SK','Grok 主要发布与使用动态。','skcd42'],
  ['WJ','Perry Weijie','本站作者的产品、设计与 AI 实践。','perry_weijie'],
  ['KM','Kimi','Kimi 与 Moonshot AI 官方动态。','Kimi_Moonshot'],
  ['PX','Perplexity','Perplexity 产品与搜索体验更新。','AskPerplexity'],
  ['MV','Meta VR','Meta VR 与空间计算官方动态。','MetaVR_Official'],
  ['TS','Typesafe AI','AI 编程模型与开发工具更新。','typesafeai'],
  ['NL','Neuralink','脑机接口研究与产品进展。','neuralink'],
  ['KL','Kling AI','可灵 AI 视频生成产品更新。','Kling_ai'],
  ['HY','HyperFrames','AI 视频与动态内容创作。','HyperFrames_'],
  ['HG','HeyGen','数字人与 AI 视频产品更新。','HeyGen'],
  ['JH','Jensen Huang','NVIDIA 与 AI 计算行业观点。','JensenHuang'],
  ['SC','ScreenKite','AI 录屏与视频工具更新。','screenkite_com'],
  ['MS','Microsoft AI','Microsoft AI 产品与研究动态。','MicrosoftAI'],
  ['GS','GS AI','AI 产品、工具与行业动态。','gs_ai_'],
  ['CG','ChatGPT','ChatGPT 官方功能与产品更新。','ChatGPT'],
  ['RT','Robotaxi','自动驾驶与 Robotaxi 动态。','robotaxi'],
  ['TA','Tesla AI','Tesla AI 与自动驾驶进展。','Tesla_AI'],
  ['XD','X Developers','X 平台开发者能力与 API 更新。','XDevelopers'],
  ['NV','NVIDIA','NVIDIA AI、芯片与平台动态。','nvidia'],
  ['NR','NVIDIA Robotics','机器人与 Physical AI 进展。','NVIDIARobotics'],
  ['CU','Cursor','Cursor 官方产品更新。','cursor_ai'],
  ['GX','Grok','Grok 官方功能与模型更新。','grok'],
  ['GG','Gemma','Google Gemma 开源模型动态。','googlegemma'],
  ['LA','Locally AI','本地 AI 应用与端侧模型实践。','LocallyAIApp'],
  ['TO','Tesla Optimus','Optimus 人形机器人进展。','Tesla_Optimus'],
  ['DR','Dreamina','AI 图像与视频创作产品更新。','dreamina_ai'],
  ['TX','Tencent AI','腾讯 AI 研究与产品动态。','TencentAI_News'],
  ['WX','WeChat','微信产品与生态官方动态。','Weixin_WeChat'],
  ['SP','Sundar Pichai','Google 与 AI 产品战略动态。','sundarpichai'],
  ['GA','Google AI Studio','Google AI Studio 功能与案例。','GoogleAIStudio']
];

const existingCreatorNames = new Set(xCreators.map(([,name]) => name));
const sourceColors = ['#111210','#4f6bff','#7b61ff','#e56f4a','#2f8f6b','#b35f98','#3f83f8','#8d6b4f'];
aiNewsSources.forEach(([initials,name,description,handle], index) => {
  if (!existingCreatorNames.has(name)) xCreators.push([initials,name,description,`https://x.com/${handle}`,sourceColors[index % sourceColors.length]]);
});

function refreshIcons() {
  if (!window.lucide) return;
  window.lucide.createIcons({ attrs: { 'stroke-width': 1.7 } });
}

function sectionsForPage(page) {
  if (page === 'inspiration') return inspirationSections;
  if (page === 'components') return componentSections;
  if (page === 'build') return catalogueSections.filter(section => ['three-d', 'shaders'].includes(section.id));
  if (page === 'utilities') return catalogueSections.filter(section => ['type', 'color'].includes(section.id));
  return catalogueSections;
}

function readStorage(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value === null ? fallback : JSON.parse(value);
  } catch {
    return fallback;
  }
}

function writeStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Preferences remain optional when storage is unavailable.
  }
}

let viewMode = readStorage('wj-catalog-view', 'list');
let themeMode = readStorage('wj-catalog-theme', 'auto');
let savedTools = new Set(readStorage('wj-catalog-saved', []));
let currentDetailIndex = 0;
let commandSavedOnly = false;
let toastTimer = 0;
let hoverTimer = 0;

const sectionsRoot = document.getElementById('sections');
const sectionNav = document.getElementById('sectionNav');
const featuredWrap = document.getElementById('visuals');
const primaryLinks = [...document.querySelectorAll('.primary-nav [data-page]')];
const viewButton = document.getElementById('viewButton');
const themeButton = document.getElementById('themeButton');
const savedLabel = document.getElementById('savedLabel');
const searchDialog = document.getElementById('searchDialog');
const commandInput = document.getElementById('commandInput');
const commandResults = document.getElementById('commandResults');
const detailDialog = document.getElementById('detailDialog');
const detailImage = document.getElementById('detailImage');
const detailLoading = document.getElementById('detailLoading');
const detailIcon = document.getElementById('detailIcon');
const detailName = document.getElementById('detailName');
const detailDescription = document.getElementById('detailDescription');
const detailCategory = document.getElementById('detailCategory');
const detailDomain = document.getElementById('detailDomain');
const detailSave = document.getElementById('detailSave');
const detailVisit = document.getElementById('detailVisit');
const submitDialog = document.getElementById('submitDialog');
const toast = document.getElementById('toast');

const hoverPreview = document.createElement('aside');
hoverPreview.className = 'hover-preview';
hoverPreview.setAttribute('aria-hidden', 'true');
hoverPreview.innerHTML = '<div><img alt="" width="720" height="450"><span>正在生成网站预览…</span></div><p><strong></strong><small></small></p>';
body.append(hoverPreview);
const hoverImage = hoverPreview.querySelector('img');
const hoverStatus = hoverPreview.querySelector('div span');
const hoverName = hoverPreview.querySelector('strong');
const hoverDomain = hoverPreview.querySelector('small');

function faviconUrl(tool) {
  return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(tool.domain)}&sz=64`;
}

function screenshotUrl(tool, width = 720) {
  return `https://s0.wordpress.com/mshots/v1/${encodeURIComponent(tool.url)}?w=${width}`;
}

function attachImageFallback(image, tool) {
  let firstFailure = true;
  image.addEventListener('error', () => {
    if (firstFailure) {
      firstFailure = false;
      image.src = new URL('/favicon.ico', tool.url).href;
      return;
    }
    const initials = tool.name.replace(/[^a-z0-9 ]/gi, ' ').trim().split(/\s+/).slice(0, 2).map(word => word[0]).join('').toUpperCase() || 'WJ';
    image.src = `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64"><rect width="64" height="64" rx="12" fill="#171817"/><text x="32" y="39" text-anchor="middle" font-family="monospace" font-size="20" font-weight="700" fill="white">${initials}</text></svg>`)}`;
  });
}

function createFavicon(tool, className = 'tool-favicon') {
  const image = document.createElement('img');
  image.className = className;
  image.src = faviconUrl(tool);
  image.alt = '';
  image.width = className === 'card-favicon' ? 24 : 18;
  image.height = image.width;
  image.loading = 'lazy';
  image.decoding = 'async';
  image.referrerPolicy = 'no-referrer';
  attachImageFallback(image, tool);
  return image;
}

function showToast(message) {
  clearTimeout(toastTimer);
  toast.textContent = message;
  toast.classList.add('visible');
  toastTimer = setTimeout(() => toast.classList.remove('visible'), 1800);
}

function saveTool(tool, force) {
  const shouldSave = force ?? !savedTools.has(tool.url);
  if (shouldSave) savedTools.add(tool.url);
  else savedTools.delete(tool.url);
  writeStorage('wj-catalog-saved', [...savedTools]);
  updateSavedState();
  return shouldSave;
}

function updateSavedState() {
  savedLabel.textContent = savedTools.size ? `收藏 ${savedTools.size}` : '收藏';
  document.querySelectorAll('[data-save-url]').forEach(button => {
    const saved = savedTools.has(button.dataset.saveUrl);
    button.classList.toggle('saved', saved);
    button.setAttribute('aria-pressed', String(saved));
    button.innerHTML = `<i data-lucide="heart"${saved ? ' fill="currentColor"' : ''}></i>`;
    button.setAttribute('aria-label', saved ? '取消收藏' : '收藏工具');
  });
  if (detailDialog.open) {
    const tool = allTools[currentDetailIndex];
    const saved = savedTools.has(tool.url);
    detailSave.classList.toggle('saved', saved);
    detailSave.innerHTML = `<i data-lucide="heart"${saved ? ' fill="currentColor"' : ''}></i>`;
    detailSave.setAttribute('aria-pressed', String(saved));
  }
  refreshIcons();
}

function createSaveButton(tool, className = 'save-button') {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = className;
  button.dataset.saveUrl = tool.url;
  button.addEventListener('click', event => {
    event.preventDefault();
    event.stopPropagation();
    const saved = saveTool(tool);
    showToast(saved ? `已收藏 ${tool.name}` : `已取消收藏 ${tool.name}`);
  });
  return button;
}

function positionHoverPreview(anchor, tool) {
  const rect = anchor.getBoundingClientRect();
  const width = 340;
  const height = 252;
  const left = rect.left > width + 26 ? rect.left - width - 15 : rect.right + 15;
  const top = Math.max(15, Math.min(innerHeight - height - 15, rect.top - 70));
  hoverPreview.style.left = `${Math.max(15, Math.min(innerWidth - width - 15, left))}px`;
  hoverPreview.style.top = `${top}px`;
  hoverName.textContent = tool.name;
  hoverDomain.textContent = tool.domain;
  hoverStatus.hidden = false;
  hoverStatus.textContent = '正在生成网站预览…';
  hoverImage.classList.remove('loaded');
  hoverImage.alt = `${tool.name} 网站预览`;
  hoverImage.onload = () => {
    hoverImage.classList.add('loaded');
    hoverStatus.hidden = true;
  };
  hoverImage.onerror = () => {
    hoverStatus.hidden = false;
    hoverStatus.textContent = '预览暂不可用，点击即可访问网站';
  };
  hoverImage.src = screenshotUrl(tool);
  hoverPreview.classList.add('visible');
}

function bindHoverPreview(anchor, tool) {
  const show = () => {
    if (!finePointer.matches || viewMode !== 'list') return;
    clearTimeout(hoverTimer);
    hoverTimer = setTimeout(() => positionHoverPreview(anchor, tool), 150);
  };
  const hide = () => {
    clearTimeout(hoverTimer);
    hoverTimer = setTimeout(() => hoverPreview.classList.remove('visible'), 70);
  };
  anchor.addEventListener('mouseenter', show);
  anchor.addEventListener('mouseleave', hide);
  anchor.addEventListener('focus', show);
  anchor.addEventListener('blur', hide);
}

function renderSectionNav() {
  document.querySelector('.news-archive-search')?.remove();
  sectionNav.replaceChildren();
  const navSections = activePage === 'products'
    ? productSections
    : activePage === 'designer'
      ? [{ id: 'x-creators', title: 'X 值得关注', count: xCreators.length }]
      : activePage === 'about'
        ? [{ id: 'about-page', title: '关于我', count: 1 }]
      : activeSections;
  if (activePage === 'news') return;
  navSections.forEach((section, index) => {
    const link = document.createElement('a');
    link.href = `#${section.id}`;
    if (index === 0) link.classList.add('active');
    link.innerHTML = `<span>${section.title}</span><em>${String(section.count).padStart(2, '0')}</em>`;
    sectionNav.append(link);
  });
}

function renderList(section, container) {
  const list = document.createElement('div');
  list.className = 'tool-list';
  section.tools.forEach(([name, description, url], index) => {
    const tool = allTools.find(item => item.url === url);
    const row = document.createElement('div');
    row.className = 'tool-row rise';
    row.style.setProperty('--delay', `${Math.min(index * 24, 180)}ms`);
    const link = document.createElement('a');
    link.className = 'tool-link';
    link.href = url;
    link.target = '_blank';
    link.rel = 'noreferrer';
    link.append(createFavicon(tool));
    const copy = document.createElement('span');
    copy.className = 'tool-copy';
    const title = document.createElement('strong');
    title.className = 'tool-name';
    title.textContent = name;
    const dot = document.createElement('i');
    dot.className = 'tool-dot';
    const summary = document.createElement('span');
    summary.className = 'tool-description';
    summary.textContent = description;
    copy.append(title, dot, summary);
    const arrow = document.createElement('span');
    arrow.className = 'external-arrow';
    arrow.innerHTML = '<i data-lucide="arrow-up-right"></i>';
    link.append(copy, arrow);
    bindHoverPreview(link, tool);
    row.append(link, createSaveButton(tool));
    list.append(row);
  });
  container.append(list);
}

function renderGrid(section, container) {
  const grid = document.createElement('div');
  grid.className = 'tool-grid';
  section.tools.forEach(([name, description, url], index) => {
    const tool = allTools.find(item => item.url === url);
    const card = document.createElement('div');
    card.className = 'tool-card rise';
    card.setAttribute('role', 'button');
    card.tabIndex = 0;
    card.setAttribute('aria-label', `展开 ${name} 的网站预览`);
    card.style.setProperty('--delay', `${Math.min(index * 24, 180)}ms`);
    const fallback = document.createElement('span');
    fallback.className = 'preview-fallback';
    fallback.textContent = '正在生成预览…';
    const shot = document.createElement('img');
    shot.className = 'preview-shot';
    shot.src = screenshotUrl(tool);
    shot.alt = `${name} 网站预览`;
    shot.loading = 'lazy';
    shot.decoding = 'async';
    shot.addEventListener('load', () => fallback.hidden = true, { once: true });
    shot.addEventListener('error', () => fallback.textContent = name, { once: true });
    const expand = document.createElement('span');
    expand.className = 'card-expand';
    expand.innerHTML = '<i data-lucide="expand"></i>';
    const open = event => {
      if (event.target.closest('button')) return;
      openDetail(allTools.indexOf(tool));
    };
    card.addEventListener('click', open);
    card.addEventListener('keydown', event => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        open(event);
      }
    });
    card.append(fallback, shot, createFavicon(tool, 'card-favicon'), expand, createSaveButton(tool));
    grid.append(card);
  });
  container.append(grid);
}

function activateProduct(product) {
  if (product.url) {
    window.open(product.url, '_blank', 'noopener,noreferrer');
    return;
  }
  showToast(`${product.name} 的详情正在整理中`);
}

function renderProducts(section, container) {
  const collection = document.createElement('div');
  collection.className = 'product-list';
  section.products.forEach((product, index) => {
    const card = document.createElement('article');
    card.className = 'product-row rise';
    card.style.setProperty('--delay', `${Math.min(index * 45, 180)}ms`);
    card.tabIndex = 0;
    card.setAttribute('role', 'button');
    card.setAttribute('aria-label', product.url ? `访问 ${product.name}` : `查看 ${product.name}`);
    card.innerHTML = `
      <div class="product-image"><img src="${product.image}" alt="${product.name} 产品界面"></div>
      <div class="product-copy">
        <span class="product-status">${product.status}</span>
        <h3>${product.name}</h3>
        <p>${product.description}</p>
      </div>
      <span class="product-action"><i data-lucide="${product.url ? 'arrow-up-right' : 'chevron-right'}"></i></span>`;
    const activate = () => activateProduct(product);
    card.addEventListener('click', activate);
    card.addEventListener('keydown', event => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        activate();
      }
    });
    collection.append(card);
  });
  container.append(collection);
}

function renderDesigner() {
  const section = document.createElement('section');
  section.className = 'tool-section designer-section';
  section.id = 'x-creators';
  section.innerHTML = `
    <div class="section-head rise"><span>01</span><h2>X 值得关注</h2><p>我经常阅读的产品、设计、AI 与开发账号，也是 AI 资讯的主要来源。</p></div>
    <div class="creator-list">${xCreators.map(([initials,name,description,url,color],index) => `
      <a class="creator-row rise" style="--delay:${Math.min(index * 24,180)}ms;--avatar:${color}" href="${url}" target="_blank" rel="noreferrer">
        <span class="creator-avatar" aria-hidden="true">${initials}</span>
        <span class="creator-copy"><strong>${name}</strong><i></i><span>${description}</span></span>
        <i data-lucide="arrow-up-right"></i>
      </a>`).join('')}</div>`;
  sectionsRoot.append(section);
}

function renderAbout() {
  const section = document.createElement('section');
  section.className = 'tool-section about-section';
  section.id = 'about-page';
  section.innerHTML = `
    <div class="section-head rise"><span>01</span><h2>关于我</h2><p>魏杰 · UX 设计师与产品构建者</p></div>
    <div class="about-panel rise">
      <div class="about-kicker">WEI JIE · UX DESIGNER</div>
      <h3>我喜欢设计，也喜欢把想法真正做成可以使用的产品。</h3>
      <p>我是魏杰，一名 UX 设计师。我关注产品体验、交互设计与 AI 工具，用清晰、自然的界面梳理复杂问题。</p>
      <p>这个网站记录我开发的产品、长期收集的设计资源，以及我在产品与创作过程中的观察。</p>
      <div class="about-contact" aria-label="联系方式">
        <strong>联系我</strong>
        <span class="about-wechat">
          <button type="button" aria-describedby="aboutWechatPopover">微信</button>
          <span class="about-wechat-popover" id="aboutWechatPopover" role="tooltip"><img src="assets/wechat-ai-news-group.jpeg" alt="AI 资讯微信群二维码"><small>微信扫码加入 AI 资讯群</small></span>
        </span>
        <a href="https://x.com/perry_weijie" target="_blank" rel="noreferrer">Twitter</a>
        <a href="mailto:wj121800@gmail.com">邮箱</a>
      </div>
    </div>`;
  sectionsRoot.append(section);
}

function renderSections() {
  hoverPreview.classList.remove('visible');
  sectionsRoot.replaceChildren();
  if (activePage === 'news') {
    window.renderAINews(sectionsRoot, sectionNav);
    refreshIcons();
    return;
  }
  if (activePage === 'designer') {
    renderDesigner();
    refreshIcons();
    return;
  }
  if (activePage === 'about') {
    renderAbout();
    refreshIcons();
    return;
  }
  const renderedSections = activePage === 'products' ? productSections : activeSections;
  renderedSections.forEach(section => {
    const element = document.createElement('section');
    element.className = 'tool-section';
    element.id = section.id;
    const head = document.createElement('div');
    head.className = 'section-head rise';
    head.innerHTML = `<span>${section.index}</span><h2>${section.title}</h2><p>${section.description}</p>`;
    element.append(head);
    if (activePage === 'products') renderProducts(section, element);
    else if (viewMode === 'grid') renderGrid(section, element);
    else renderList(section, element);
    sectionsRoot.append(element);
  });
  updateSavedState();
  observeSections();
  refreshIcons();
}

function setView(mode) {
  viewMode = mode;
  body.dataset.view = mode;
  viewButton.innerHTML = `<i data-lucide="${mode === 'list' ? 'list' : 'layout-grid'}"></i>`;
  viewButton.setAttribute('aria-label', mode === 'list' ? '切换为网格视图' : '切换为列表视图');
  viewButton.setAttribute('aria-pressed', String(mode === 'grid'));
  viewButton.classList.toggle('active', mode === 'list');
  writeStorage('wj-catalog-view', mode);
  renderSections();
  refreshIcons();
}

function applyTheme(mode) {
  themeMode = mode;
  const dark = mode === 'dark' || (mode === 'auto' && matchMedia('(prefers-color-scheme: dark)').matches);
  root.dataset.theme = dark ? 'dark' : 'light';
  themeButton.innerHTML = `<i data-lucide="${mode === 'auto' ? 'sun-moon' : dark ? 'sun' : 'moon'}"></i>`;
  themeButton.setAttribute('aria-label', `切换主题，当前为${mode === 'auto' ? '跟随系统' : dark ? '深色' : '浅色'}`);
  document.querySelector('meta[name="theme-color"]').content = dark ? '#1a1b18' : '#ffffff';
  writeStorage('wj-catalog-theme', mode);
  refreshIcons();
}

function renderCommandResults() {
  const query = commandInput.value.trim().toLowerCase();
  commandResults.replaceChildren();
  let candidates = allTools;
  if (commandSavedOnly) candidates = candidates.filter(tool => savedTools.has(tool.url));
  if (query) candidates = candidates.filter(tool => `${tool.name} ${tool.description} ${tool.category} ${tool.domain}`.toLowerCase().includes(query));

  if (!query && !commandSavedOnly) {
    const label = document.createElement('p');
    label.className = 'command-group-title';
    label.textContent = '菜单';
    commandResults.append(label);
    activeSections.forEach(section => {
      const button = document.createElement('button');
      button.className = 'command-item';
      button.type = 'button';
      button.innerHTML = `<span><i data-lucide="folder"></i></span><span>${section.title}</span><small>${String(section.count).padStart(2, '0')}</small>`;
      button.addEventListener('click', () => {
        searchDialog.close();
        document.getElementById(section.id)?.scrollIntoView({ behavior: reducedMotion.matches ? 'auto' : 'smooth' });
      });
      commandResults.append(button);
    });
    refreshIcons();
    return;
  }

  const label = document.createElement('p');
  label.className = 'command-group-title';
  label.textContent = commandSavedOnly ? `收藏 · ${candidates.length}` : `工具 · ${candidates.length}`;
  commandResults.append(label);
  if (!candidates.length) {
    const empty = document.createElement('div');
    empty.className = 'command-empty';
    empty.textContent = commandSavedOnly ? '还没有收藏任何工具。' : '没有匹配的工具。';
    commandResults.append(empty);
    return;
  }
  candidates.slice(0, 40).forEach(tool => {
    const button = document.createElement('button');
    button.className = 'command-item';
    button.type = 'button';
    button.append(createFavicon(tool));
    const name = document.createElement('span');
    name.textContent = `${tool.name} · ${tool.description}`;
    const category = document.createElement('small');
    category.textContent = tool.category;
    button.append(name, category);
    button.addEventListener('click', () => {
      searchDialog.close();
      openDetail(allTools.indexOf(tool));
    });
    commandResults.append(button);
  });
  refreshIcons();
}

function openSearch(savedOnly = false) {
  commandSavedOnly = savedOnly;
  commandInput.value = '';
  commandInput.placeholder = savedOnly ? '搜索已收藏的工具…' : '搜索工具、分类或网站…';
  renderCommandResults();
  if (!searchDialog.open) searchDialog.showModal();
  requestAnimationFrame(() => commandInput.focus());
}

function openDetail(index) {
  currentDetailIndex = (index + allTools.length) % allTools.length;
  const tool = allTools[currentDetailIndex];
  detailName.textContent = tool.name;
  detailDescription.textContent = tool.description;
  detailCategory.textContent = tool.category;
  detailDomain.textContent = tool.domain;
  detailVisit.href = tool.url;
  detailIcon.src = faviconUrl(tool);
  attachImageFallback(detailIcon, tool);
  detailImage.classList.remove('loaded');
  detailImage.alt = `${tool.name} 网站预览`;
  detailLoading.hidden = false;
  detailLoading.textContent = '正在生成网站预览…';
  detailImage.onload = () => {
    detailImage.classList.add('loaded');
    detailLoading.hidden = true;
  };
  detailImage.onerror = () => {
    detailLoading.hidden = false;
    detailLoading.textContent = '预览暂不可用，请直接访问网站';
  };
  detailImage.src = screenshotUrl(tool, 1200);
  if (!detailDialog.open) detailDialog.showModal();
  updateSavedState();
}

let sectionObserver;
function observeSections() {
  sectionObserver?.disconnect();
  const links = [...sectionNav.querySelectorAll('a')];
  sectionObserver = new IntersectionObserver(entries => {
    const visible = entries.filter(entry => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (!visible) return;
    links.forEach(link => link.classList.toggle('active', link.getAttribute('href') === `#${visible.target.id}`));
  }, { rootMargin: '-18% 0px -70% 0px', threshold: [0, .1, .35] });
  document.querySelectorAll('.tool-section').forEach(section => sectionObserver.observe(section));
}

function switchPage(page, { updateUrl = true, scroll = true } = {}) {
  if (!pageKeys.includes(page)) return;
  activePage = page;
  activeSections = sectionsForPage(page);
  primaryLinks.forEach(link => {
    const active = link.dataset.page === page;
    link.classList.toggle('active', active);
    if (active) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  });
  featuredWrap.hidden = true;
  viewButton.hidden = ['news','products','designer','about'].includes(page);
  renderSectionNav();
  renderSections();
  if (updateUrl) {
    const url = new URL(location.href);
    url.searchParams.set('page', page);
    url.hash = '';
    history.pushState({ page }, '', url);
  }
  if (scroll) window.scrollTo({ top: 0, behavior: reducedMotion.matches ? 'auto' : 'smooth' });
  refreshIcons();
}

function setupSmoothScroll() {
  if (reducedMotion.matches || matchMedia('(pointer: coarse)').matches || !window.Lenis) return;
  const lenis = new Lenis({ duration: 1.05, smoothWheel: true, syncTouch: false, wheelMultiplier: .92 });
  const frame = time => {
    lenis.raf(time);
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
  document.addEventListener('click', event => {
    const link = event.target.closest('a[href^="#"]');
    if (!link) return;
    const target = document.querySelector(link.getAttribute('href'));
    if (!target) return;
    event.preventDefault();
    lenis.scrollTo(target, { offset: -54, duration: 1 });
  });
}

setView(viewMode === 'grid' ? 'grid' : 'list');
switchPage(activePage, { updateUrl: false, scroll: false });
applyTheme(themeMode);
setupSmoothScroll();
refreshIcons();
document.getElementById('year').textContent = new Date().getFullYear();

viewButton.addEventListener('click', () => setView(viewMode === 'list' ? 'grid' : 'list'));
themeButton.addEventListener('click', () => applyTheme(themeMode === 'auto' ? 'light' : themeMode === 'light' ? 'dark' : 'auto'));
document.getElementById('searchButton').addEventListener('click', () => openSearch(false));
document.getElementById('savedButton').addEventListener('click', () => openSearch(true));
document.getElementById('exploreButton').addEventListener('click', () => openDetail(Math.floor(Math.random() * allTools.length)));
document.getElementById('submitButton').addEventListener('click', () => submitDialog.showModal());
const supportDialog = document.getElementById('supportDialog');
document.getElementById('supportButton').addEventListener('click', () => supportDialog.showModal());
supportDialog.addEventListener('click', event => {
  if (event.target === supportDialog) supportDialog.close();
});
supportDialog.querySelectorAll('[data-method]').forEach(button => button.addEventListener('click', () => {
  supportDialog.querySelectorAll('[data-method]').forEach(item => item.classList.toggle('active', item === button));
  supportDialog.querySelectorAll('[data-panel]').forEach(panel => { panel.hidden = panel.dataset.panel !== button.dataset.method; });
}));
commandInput.addEventListener('input', renderCommandResults);
searchDialog.addEventListener('click', event => {
  const box = searchDialog.querySelector('.command-box').getBoundingClientRect();
  const outside = event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom;
  if (outside) searchDialog.close();
});
document.getElementById('detailClose').addEventListener('click', () => detailDialog.close());
document.getElementById('detailPrevious').addEventListener('click', () => openDetail(currentDetailIndex - 1));
document.getElementById('detailNext').addEventListener('click', () => openDetail(currentDetailIndex + 1));
detailSave.addEventListener('click', () => {
  const tool = allTools[currentDetailIndex];
  const saved = saveTool(tool);
  showToast(saved ? `已收藏 ${tool.name}` : `已取消收藏 ${tool.name}`);
});

document.getElementById('submitForm').addEventListener('submit', event => {
  const name = document.getElementById('submitName').value.trim();
  const url = document.getElementById('submitUrl').value.trim();
  if (!name || !url) {
    event.preventDefault();
    return;
  }
  const submitted = readStorage('wj-submitted-tools', []);
  submitted.push({ name, url, createdAt: new Date().toISOString() });
  writeStorage('wj-submitted-tools', submitted);
  setTimeout(() => showToast('推荐已保存在当前浏览器'), 50);
  event.currentTarget.reset();
});

document.querySelectorAll('[data-page]').forEach(link => link.addEventListener('click', event => {
  event.preventDefault();
  if (link.dataset.page === 'about') aboutReturnPage = activePage === 'about' ? 'products' : activePage;
  switchPage(link.dataset.page);
}));
addEventListener('popstate', () => {
  const page = new URLSearchParams(location.search).get('page');
  switchPage(pageKeys.includes(page) ? page : 'news', { updateUrl: false, scroll: false });
});

const sidebar = document.getElementById('sidebar');
const mobileMenu = document.getElementById('mobileMenu');
const mobileBackdrop = document.getElementById('mobileBackdrop');
const mobileLayout = matchMedia('(max-width: 820px)');
const mainContent = document.getElementById('main');
function setMobileMenu(open, restoreFocus = false) {
  open = open && mobileLayout.matches;
  sidebar.classList.toggle('open', open);
  sidebar.inert = mobileLayout.matches && !open;
  mainContent.inert = open;
  mobileMenu.setAttribute('aria-expanded', String(open));
  mobileBackdrop.hidden = !open;
  document.documentElement.classList.toggle('mobile-nav-open', open);
  if (open) document.getElementById('mobileClose').focus();
  else if (restoreFocus && mobileLayout.matches) mobileMenu.focus();
}
mobileMenu.addEventListener('click', () => setMobileMenu(true));
document.getElementById('mobileClose').addEventListener('click', () => setMobileMenu(false, true));
mobileBackdrop.addEventListener('click', () => setMobileMenu(false, true));
sidebar.addEventListener('click', event => { if (event.target.closest('a')) setMobileMenu(false, true); });
mobileLayout.addEventListener('change', () => setMobileMenu(false));
document.addEventListener('keydown', event => {
  if (!sidebar.classList.contains('open')) return;
  if (event.key === 'Escape') { event.preventDefault(); setMobileMenu(false, true); }
  if (event.key === 'Tab') {
    const targets = [...sidebar.querySelectorAll('a[href],button')].filter(node => node.getClientRects().length);
    const first = targets[0], last = targets[targets.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  }
});
setMobileMenu(false);

document.addEventListener('keydown', event => {
  const command = event.metaKey || event.ctrlKey;
  if (command && event.key.toLowerCase() === 'k') {
    event.preventDefault();
    openSearch(false);
  }
  if (command && event.key.toLowerCase() === 'e') {
    event.preventDefault();
    openDetail(Math.floor(Math.random() * allTools.length));
  }
  if (event.key === 'Escape') hoverPreview.classList.remove('visible');
});

const pageProgress = document.getElementById('pageProgress');
let progressFrame = 0;
function updateProgress() {
  progressFrame = 0;
  const maximum = document.documentElement.scrollHeight - innerHeight;
  pageProgress.style.transform = `scaleX(${maximum > 0 ? scrollY / maximum : 0})`;
}
addEventListener('scroll', () => {
  if (!progressFrame) progressFrame = requestAnimationFrame(updateProgress);
}, { passive: true });
addEventListener('resize', updateProgress);
updateProgress();

matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
  if (themeMode === 'auto') applyTheme('auto');
});

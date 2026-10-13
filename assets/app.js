/* Each page renders its own section from the shared bilingual CV data. */
(() => {
  'use strict';
  const content = window.CV_CONTENT;
  const currentPage = document.body.dataset.page || 'about';
  const assetVersion = document.body.dataset.assetVersion;
  const routes = {about:'index.html',education:'education.html',publications:'publications.html',projects:'projects.html',awards:'awards.html',skills:'skills.html',service:'service.html',cv:'cv.html'};
  const strings = {
    zh: {skip:'跳到正文',menu:'菜单',about:'个人简介',education:'教育经历',publications:'学术成果',projects:'科研项目',awards:'奖励荣誉',skills:'研究技能',service:'经历与服务',cv:'完整简历',downloadCv:'下载Word简历',print:'打印或保存PDF',personal:'个人信息',search:'检索论文',searchPlaceholder:'检索题名、作者或期刊',empty:'没有符合条件的论文。请尝试其他关键词或分类。',footerAffiliation:'北京师范大学地理科学学部',birth:'出生年月',hometown:'籍贯',membership:'政治面貌',phone:'手机号',rank:'成绩排名',gpa:'平均绩点',advisors:'导师',contribution:'谷天赐的贡献',patents:'专利',published:'已发表',accepted:'已录用',review:'在审',all:'全部',first:'第一及共同第一作者',corresponding:'通讯及共同通讯作者',second:'导师一作、谷天赐二作',collaborative:'其他合作论文',updated:'2026年10月更新',academicMetrics:'学术指标',metric:'指标',total:'总计',since2021:'2021年至今',researchDirection:'研究方向',researchInterests:'研究兴趣',recentNews:'近期动态'},
    en: {skip:'Skip to content',menu:'Menu',about:'About',education:'Education',publications:'Publications',projects:'Projects',awards:'Honors',skills:'Skills',service:'Experience',cv:'Full CV',downloadCv:'Download Word CV',print:'Print or save PDF',personal:'Personal information',search:'Search publications',searchPlaceholder:'Search title, author or journal',empty:'No matching publications. Try another keyword or category.',footerAffiliation:'Faculty of Geographical Science, Beijing Normal University',birth:'Date of birth',hometown:'Hometown',membership:'Political membership',phone:'Phone',rank:'Class rank',gpa:'GPA',advisors:'Supervisors',contribution:'Contribution',patents:'Patents',published:'Published',accepted:'Accepted',review:'Under review',all:'All',first:'First and co-first author',corresponding:'Corresponding author',second:'Second author with supervisor',collaborative:'Other collaborations',updated:'Updated October 2026',academicMetrics:'Academic metrics',metric:'Metric',total:'All',since2021:'Since 2021',researchDirection:'Research direction',researchInterests:'Research interests',recentNews:'News'}
  };
  let language = 'zh';
  const requestedLanguage = new URLSearchParams(window.location.search).get('lang');
  if (requestedLanguage === 'en' || requestedLanguage === 'zh') language = requestedLanguage;
  else {
    try { if (localStorage.getItem('cv-language') === 'en') language = 'en'; } catch (_) { /* Storage is optional. */ }
  }
  try { localStorage.setItem('cv-language', language); } catch (_) { /* Storage is optional. */ }
  if (currentPage === 'education' || currentPage === 'skills') {
    const target = currentPage === 'education' ? routes.about : routes.cv;
    window.location.replace(target + '?lang=' + language + '&v=' + assetVersion + '#' + currentPage);
    return;
  }
  const legacySection = window.location.hash.slice(1);
  if (currentPage === 'about' && Object.hasOwn(routes, legacySection) && !['about','education'].includes(legacySection)) {
    const inCV = legacySection === 'skills';
    window.location.replace((inCV ? routes.cv : routes[legacySection]) + '?lang=' + language + '&v=' + assetVersion + (inCV ? '#' + legacySection : ''));
    return;
  }
  const filterOptions = ['selected','all','first','corresponding','second','collaborative','conference','accepted'];
  let filter, query, topic, publishedOnly, projectFilter, rankFilter;
  function readLocation() {
    const params = new URLSearchParams(location.search);
    filter = filterOptions.includes(params.get('filter')) ? params.get('filter') : currentPage === 'publications' ? 'selected' : 'all';
    query = params.get('q') || '';
    topic = content.researchThemes.some((item) => item.id === params.get('topic')) ? params.get('topic') : '';
    publishedOnly = params.get('scope') === 'published';
    rankFilter = ['1','2','3','4','top','not-listed','unverified'].includes(params.get('tier')) ? params.get('tier') : '';
    projectFilter = ['led','participant','nsfc','key-rd','provincial','university','commissioned'].includes(params.get('project')) ? params.get('project') : 'all';
  }
  readLocation();
  let printState = null;
  const byId = (id) => document.getElementById(id);
  const escape = (value) => String(value ?? '').replace(/[&<>"']/g, (char) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const localized = (value) => typeof value === 'object' && value !== null ? value[language] : value;
  const text = (key) => strings[language][key];
  const colon = () => language === 'zh' ? '：' : ': ';
  strings.zh.selectedResearch = '研究选读';
  strings.en.selectedResearch = 'Research Highlights';
  strings.zh.fullArticle = '论文全文';
  strings.en.fullArticle = 'Read article';
  strings.zh.selected = '精选成果';
  strings.en.selected = 'Selected Publications';
  strings.zh.conference = '会议摘要';
  strings.en.conference = 'Conference abstracts';
  strings.zh.journalPage = '出版方文章页';
  strings.en.journalPage = 'Publisher Article Page';
  strings.zh.findPaper = '检索论文';
  strings.en.findPaper = 'Find article';
  Object.assign(strings.zh, {footerContact:'联系与交流',footerAcademic:'学术主页',footerExplore:'站点导航',footerHosted:'托管于',backToTop:'返回顶部'});
  Object.assign(strings.en, {footerContact:'Contact',footerAcademic:'Academic profiles',footerExplore:'Explore',footerHosted:'Hosted on',backToTop:'Back to top'});
  Object.assign(strings.zh, {menu:'导航',skills:'方法与工具',second:'第二作者，导师第一作者',researchInterests:'研究方向',profileShort:'简介',projectsShort:'项目',contactDetails:'联系方式与学术主页',fullBiography:'完整个人介绍',viewSelected:'查看精选成果',viewCv:'查看完整简历',exploreMap:'探索研究图谱',mapExplanation:'主题连接论文，虚线表示论文采用的方法。点击主题查看相关成果，点击论文打开出版方文章；悬停或键盘聚焦可查看关联。',mapTopics:'研究主题',mapPapers:'论文',mapMethods:'研究方法',publicationOverview:'成果概览',projectOverview:'项目概览',journalArticles:'已发表期刊论文',acceptedArticles:'已录用文章',publishedScope:'仅显示已发表期刊论文',allTopics:'全部主题',clearScope:'查看所有类型',led:'主持项目',participant:'参与项目',nsfc:'国家自然科学基金', 'key-rd':'国家重点研发计划课题',provincial:'省部级项目',university:'校级课题',commissioned:'横向与地方政府委托项目',projectOverviewNote:'按项目来源统计，共15项，其中主持4项、参与11项。国家公派留学资助不计入科研项目。',metricsSnapshot:'谷歌学术数据截至',firstMetric:'第一及共同第一作者',correspondingMetric:'通讯及共同通讯作者',citationMetric:'总引用',hMetric:'h指数'});
  Object.assign(strings.en, {menu:'Navigation',about:'Personal Profile',projects:'Research Projects',awards:'Honors and Awards',skills:'Methods and Tools',service:'Academic Service and Experience',cv:'CV',personal:'Personal Details',birth:'Month and Year of Birth',hometown:'Place of Origin',membership:'Political Affiliation',profileShort:'Profile',projectsShort:'Projects',contactDetails:'Contact and Academic Profiles',fullBiography:'Full Personal Profile',viewSelected:'View Selected Publications',viewCv:'View Full CV',exploreMap:'Explore Research Map',researchInterests:'Research Themes',mapExplanation:'Topics connect to papers; dashed lines indicate methods used in a paper. Select a topic to browse related publications or a paper to open its article page. Hover or focus with the keyboard to explore connections.',mapTopics:'Research Themes',mapPapers:'Publications',mapMethods:'Methods',publicationOverview:'Publication Overview',projectOverview:'Research Project Overview',journalArticles:'Published Journal Articles',acceptedArticles:'Accepted Article',publishedScope:'Published journal articles only',allTopics:'All Topics',clearScope:'Include All Record Types',first:'First or Co-first Author',corresponding:'Corresponding or Co-corresponding Author',second:'Second Author with Supervisor as First Author',collaborative:'Other Collaborative Papers',conference:'Conference Abstracts',led:'Projects led',participant:'Projects Participated In',nsfc:'NSFC','key-rd':'National Key R&D Program Research Task',provincial:'Provincial or Ministerial Projects',university:'University-funded Projects',commissioned:'Commissioned Projects',projectOverviewNote:'15 projects classified by source: four led and 11 participated in. CSC funding for overseas study is excluded from research project counts.',metricsSnapshot:'Google Scholar snapshot',firstMetric:'First or Co-first Author',correspondingMetric:'Corresponding or Co-corresponding Author',citationMetric:'Citations',hMetric:'h-index'});
  Object.assign(strings.zh,{journalRanking:'期刊分区',rankingEdition:'2025版中科院大类分区',rankingSources:'查看统计口径与来源',rankingTop:'1区及2区',rankingNotListed:'该版未列入',rankingUnverified:'分区未核实',journal:'期刊',rankingColumn:'大类分区',source:'数据来源',articleCount:'论文数量',clearRanking:'清除分区筛选'});
  Object.assign(strings.en,{journalRanking:'Journal Rankings',rankingEdition:'CAS Broad-subject Ranking, 2025 Edition',rankingSources:'Counting Method and Sources',rankingTop:'CAS Tiers 1 and 2',rankingNotListed:'Not Listed in This Edition',rankingUnverified:'Ranking Not Verified',journal:'Journal',rankingColumn:'CAS Tier',source:'Source',articleCount:'Articles',clearRanking:'Clear Ranking Filter'});
  const icon = (name, className) => '<svg class="' + className + '" aria-hidden="true"><use href="assets/icons.svg#' + name + '"></use></svg>';
  const setText = (id, value) => { if (byId(id)) byId(id).textContent = value; };
  const setHTML = (id, value) => { if (byId(id)) byId(id).innerHTML = value; };
  const isPublishedJournal = (paper) => paper.status === 'published' && paper.kind !== 'conference';
  const journalRanking = (paper) => content.journalRankings.journals.find((entry) => entry.venue === paper.venue.en);
  const rankKey = (paper) => {
    if (!isPublishedJournal(paper) || paper.originalLanguage !== 'en') return '';
    const record = journalRanking(paper);
    return record?.status === 'ranked' ? String(record.tier) : record?.status || 'unverified';
  };
  const rankLabel = (key) => key === 'top' ? text('rankingTop') : key === 'not-listed' ? text('rankingNotListed') : key === 'unverified' ? text('rankingUnverified') : language === 'zh' ? key + '区' : 'CAS Tier ' + key;
  function pageURL(page, params = {}, hash = '') {
    const search = new URLSearchParams({lang:language,v:assetVersion,...params});
    return routes[page] + '?' + search + hash;
  }
  function saveLocation(replace = false) {
    const url = new URL(location.href);
    for (const key of ['filter','q','topic','scope','project','tier']) url.searchParams.delete(key);
    if (byId('publication-list')) {
      url.searchParams.set('filter',filter);
      if (query) url.searchParams.set('q',query);
      if (topic) url.searchParams.set('topic',topic);
      if (publishedOnly) url.searchParams.set('scope','published');
      if (rankFilter) url.searchParams.set('tier',rankFilter);
    }
    if (currentPage === 'projects' && projectFilter !== 'all') url.searchParams.set('project',projectFilter);
    try { history[replace ? 'replaceState' : 'pushState'](null,'',url); } catch (_) { /* Local previews may reject history changes. */ }
  }
  function selectedCountLabel() {
    const count = content.publications.filter((paper) => paper.selected).length;
    return language === 'zh' ? '查看全部精选成果（' + count + '篇）' : 'View All ' + count + ' Selected Publications';
  }

  function groups(items) {
    const result = [];
    for (const item of items) {
      let group = result.find((entry) => entry.name.zh === item.group.zh);
      if (!group) { group = {name:item.group,items:[]}; result.push(group); }
      group.items.push(item);
    }
    return result;
  }

  function researchFigure(paper) {
    const figure = paper.figure;
    return '<figure class="research-figure"><a class="research-image-link" href="' + escape(figure.src) + '" target="_blank" rel="noopener"><img src="' + escape(figure.src) + '" width="' + figure.width + '" height="' + figure.height + '" alt="' + escape(localized(figure.alt)) + '" loading="lazy" decoding="async"></a>' +
      '<figcaption><a href="' + escape(figure.src) + '" target="_blank" rel="noopener">' + escape(localized(figure.caption)) + '</a></figcaption></figure>';
  }

  function renderHomeOverview() {
    if (!byId('home-metrics')) return;
    const scholar = content.profile.scholar + '&hl=' + (language === 'zh' ? 'zh-CN' : 'en');
    const published = content.publications.filter(isPublishedJournal);
    const entries = [
      {value:published.filter((paper) => paper.category === 'first').length,label:text('firstMetric'),href:pageURL('publications',{filter:'first',scope:'published'},'#publication-browser')},
      {value:published.filter((paper) => paper.category === 'corresponding').length,label:text('correspondingMetric'),href:pageURL('publications',{filter:'corresponding',scope:'published'},'#publication-browser')},
      {value:content.metrics[0].value,label:text('citationMetric'),href:scholar},
      {value:content.metrics[1].value,label:text('hMetric'),href:scholar}
    ];
    setHTML('home-metrics', entries.map((entry) => '<a href="' + escape(entry.href) + '"' + (entry.href.startsWith('https:') ? ' target="_blank" rel="noopener"' : '') + '><strong>' + escape(entry.value) + '</strong><span>' + escape(entry.label) + '</span></a>').join('') + '<p class="snapshot-note">' + escape(text('metricsSnapshot')) + ' ' + content.metricsSnapshot + '</p>');
    setHTML('home-research', content.researchThemes.map((item,index) => '<li>' + icon(['city','leaf','map'][index],'interest-icon') + '<div><a href="' + escape(pageURL('publications',{filter:'all',topic:item.id},'#publication-browser')) + '">' + escape(localized(item.label)) + '<span aria-hidden="true"> →</span></a><p>' + escape(localized(item.description)) + '</p></div></li>').join(''));
    setHTML('home-methods',content.methodsAndTools.map((item) => '<dt>' + escape(localized(item.label)) + '</dt><dd>' + escape(localized(item.tools)) + '</dd>').join(''));
    renderResearchMap();
  }

  function renderResearchMap() {
    if (!byId('research-map')) return;
    const nodes = [], edges = [];
    content.researchThemes.forEach((item,index) => nodes.push({id:item.id,label:localized(item.label),kind:'topic',x:140,y:140+index*150,href:pageURL('publications',{filter:'all',topic:item.id},'#publication-browser')}));
    content.researchMapPapers.forEach((item,index) => {
      const paper = content.publications.find((entry) => entry.id === item.id);
      nodes.push({id:item.id,label:localized(item.label),title:paper.title[paper.originalLanguage],kind:'paper',x:470,y:65+index*70,href:paper.doi || paper.articleUrl || paper.searchUrl});
      paper.topics.forEach((id) => edges.push({from:id,to:paper.id,kind:'topic'}));
    });
    content.researchMethods.forEach((item,index) => {
      const paper = content.publications.find((entry) => entry.id === item.papers[0]);
      nodes.push({id:item.id,label:localized(item.label),kind:'method',x:800,y:140+index*280,href:paper.doi || paper.articleUrl});
      item.papers.forEach((id) => edges.push({from:id,to:item.id,kind:'method'}));
    });
    const lines = edges.map((edge) => {
      const from = nodes.find((node) => node.id === edge.from), to = nodes.find((node) => node.id === edge.to);
      if (!from || !to) return '';
      return '<path class="map-edge map-edge-' + edge.kind + '" data-from="' + edge.from + '" data-to="' + edge.to + '" d="M ' + (from.x+104) + ' ' + from.y + ' C ' + (from.x+166) + ' ' + from.y + ', ' + (to.x-166) + ' ' + to.y + ', ' + (to.x-104) + ' ' + to.y + '"/>';
    }).join('');
    const nodeHTML = nodes.map((node) => {
      const words = language === 'zh' ? node.label.match(/.{1,12}/g) : node.label.split(' ');
      const rows = [];
      let row = '';
      words.forEach((word) => {
        if (row && (language === 'zh' || (row+' '+word).length > 27)) {rows.push(row); row=word;}
        else row += (row ? ' ' : '') + word;
      });
      rows.push(row);
      const label = rows.map((line,index) => '<tspan x="' + node.x + '" y="' + (node.y+(index-(rows.length-1)/2)*18+5) + '">' + escape(line) + '</tspan>').join('');
      return '<a class="map-node map-node-' + node.kind + '" data-node="' + node.id + '" href="' + escape(node.href) + '" aria-label="' + escape(node.title || node.label) + '"' + (node.href.startsWith('https:') ? ' target="_blank" rel="noopener"' : '') + '><title>' + escape(node.title || node.label) + '</title><rect x="' + (node.x-104) + '" y="' + (node.y-25) + '" width="208" height="50" rx="4"/><text text-anchor="middle">' + label + '</text></a>';
    }).join('');
    setHTML('research-map','<svg class="research-map-svg" viewBox="0 0 940 555" role="group" aria-label="' + escape(text('exploreMap')) + '"><text class="map-column-label" x="140" y="17" text-anchor="middle">' + escape(text('mapTopics')) + '</text><text class="map-column-label" x="470" y="17" text-anchor="middle">' + escape(text('mapPapers')) + '</text><text class="map-column-label" x="800" y="17" text-anchor="middle">' + escape(text('mapMethods')) + '</text>' + lines + nodeHTML + '</svg>');
    setHTML('map-paper-links','<p>' + escape(text('mapPapers')) + '</p><ul>' + content.researchMapPapers.map((item) => {
      const paper = content.publications.find((entry) => entry.id === item.id);
      return '<li><a href="' + escape(paper.doi || paper.articleUrl || paper.searchUrl) + '" target="_blank" rel="noopener">' + escape(localized(item.label)) + '</a></li>';
    }).join('') + '</ul>');
  }

  function overviewBar(label,count,maximum,attribute,value) {
    return '<button type="button" class="overview-bar" ' + attribute + '="' + value + '" aria-label="' + escape(label + ': ' + count) + '"><span class="bar-label">' + escape(label) + '</span><span class="bar-track" aria-hidden="true"><span style="width:' + (100*count/maximum) + '%"></span></span><strong>' + count + '</strong></button>';
  }

  function renderPublicationOverview() {
    if (!byId('publication-overview')) return;
    const published = content.publications.filter(isPublishedJournal);
    const english = published.filter((paper) => paper.originalLanguage === 'en');
    const keys = ['1','2','3','4','not-listed','unverified'];
    const colors = ['#004da3','#4f83ba','#91b0d1','#c3d4e7','#aeb8c3','#e6ebf0'];
    const counts = keys.map((key) => english.filter((paper) => rankKey(paper) === key).length);
    const circumference = 2*Math.PI*83;
    let offset = 0;
    const segments = keys.map((key,index) => {
      const length = circumference*counts[index]/english.length;
      const segment = counts[index] ? '<a href="' + escape(pageURL('publications',{filter:'all',scope:'published',tier:key},'#publication-browser')) + '" data-tier="' + key + '" aria-label="' + escape(rankLabel(key) + ': ' + counts[index]) + '"><circle class="rank-segment" cx="120" cy="120" r="83" fill="none" stroke="' + colors[index] + '" stroke-width="22" stroke-dasharray="' + Math.max(0,length-2) + ' ' + circumference + '" stroke-dashoffset="' + -offset + '" transform="rotate(-90 120 120)"/></a>' : '';
      offset += length;
      return segment;
    }).join('');
    const topCount = counts[0]+counts[1];
    setHTML('publication-ranking-chart','<svg class="ranking-donut" viewBox="0 0 240 240" role="group" aria-label="' + escape(text('rankingEdition')) + '">' + segments + '<a href="' + escape(pageURL('publications',{filter:'all',scope:'published',tier:'top'},'#publication-browser')) + '" data-tier="top" aria-label="' + escape(text('rankingTop') + ': ' + topCount) + '"><circle cx="120" cy="120" r="65" fill="white"/><text x="120" y="122" text-anchor="middle" class="rank-total">' + topCount + '</text><text x="120" y="153" text-anchor="middle" class="rank-center-label">' + escape(text('rankingTop')) + '</text></a></svg>');
    setHTML('publication-ranking-legend',keys.map((key,index) => '<button type="button" data-tier="' + key + '" aria-pressed="' + (rankFilter === key) + '"><span class="rank-swatch" style="background:' + colors[index] + '" aria-hidden="true"></span><span>' + escape(rankLabel(key)) + '</span><strong>' + counts[index] + '</strong></button>').join(''));
    const chineseCount = published.length-english.length;
    setText('publication-overview-note',language === 'zh' ? '按' + english.length + '篇已发表英文期刊论文统计，每篇计一次。中文期刊论文' + chineseCount + '篇另计；已录用文章与会议摘要不参与分区统计。点击图环或标签查看论文。' : 'Based on ' + english.length + ' published English-language journal articles, counted once each. The ' + chineseCount + ' Chinese-language journal articles, accepted article and conference abstracts are excluded. Select a segment or label to browse the papers.');
    setText('ranking-method',language === 'zh' ? '统一采用LetPub公开页面列出的2025年3月中科院期刊分区表大类分区，查询日期为2026年10月13日。未列入该版与尚未核实的期刊分别列出，不沿用更名前或其他年份的分区。' : 'The chart uses broad-subject tiers in the March 2025 CAS journal ranking as reported on public LetPub pages, checked on October 13, 2026. Not-listed and unverified records are shown separately. Rankings for former journal titles or other editions are not substituted.');
    setHTML('ranking-source-table','<table><thead><tr><th scope="col">' + text('journal') + '</th><th scope="col">' + text('rankingColumn') + '</th><th scope="col">' + text('articleCount') + '</th><th scope="col">' + text('source') + '</th></tr></thead><tbody>' + content.journalRankings.journals.map((record) => '<tr><th scope="row">' + escape(record.venue) + '</th><td>' + escape(rankLabel(record.status === 'ranked' ? String(record.tier) : record.status)) + '</td><td>' + english.filter((paper) => paper.venue.en === record.venue).length + '</td><td><a href="' + escape(record.sourceUrl) + '" target="_blank" rel="noopener">LetPub</a></td></tr>').join('') + '</tbody></table>');
  }

  function renderProjectOverview() {
    if (!byId('project-overview')) return;
    setHTML('project-totals',['all','led','participant'].map((role) => '<button type="button" data-project-filter="' + role + '"><strong>' + content.projects.filter((item) => role === 'all' || item.role === role).length + '</strong><span>' + escape(role === 'all' ? (language === 'zh' ? '科研项目总计' : 'Research Projects') : text(role)) + '</span></button>').join(''));
    const sources = ['nsfc','key-rd','provincial','university','commissioned'];
    const maximum = Math.max(...sources.map((source) => content.projects.filter((item) => item.source === source).length));
    setHTML('project-bars',sources.map((source) => overviewBar(text(source),content.projects.filter((item) => item.source === source).length,maximum,'data-project-filter',source)).join(''));
    setHTML('project-filter','<button type="button" class="filter-button" data-project-filter="all" aria-pressed="' + (projectFilter === 'all') + '">' + escape(language === 'zh' ? '全部项目' : 'All Projects') + '</button>' + (projectFilter === 'all' ? '' : '<span>' + escape(text(projectFilter)) + '</span>'));
    const ledCount = content.projects.filter((item) => item.role === 'led').length;
    setText('project-overview-note',language === 'zh' ? '按项目来源统计，共' + content.projects.length + '项，其中主持' + ledCount + '项、参与' + (content.projects.length-ledCount) + '项。国家公派留学资助不计入科研项目。' : content.projects.length + ' projects classified by source: ' + ledCount + ' led and ' + (content.projects.length-ledCount) + ' participated in. CSC funding for overseas study is excluded from research project counts.');
    document.querySelectorAll('[data-project-filter]').forEach((button) => button.setAttribute('aria-pressed',String(button.dataset.projectFilter === projectFilter)));
  }

  function renderFeaturedResearch() {
    if (!byId('home-featured')) return;
    setHTML('home-featured', content.publications.filter((paper) => paper.featured).map((paper) =>
      '<article class="featured-study">' + researchFigure(paper) + '<div class="featured-copy"><h3><a href="' + escape(paper.doi) + '" target="_blank" rel="noopener">' + escape(localized(paper.title)) + '</a></h3><p class="featured-venue"><em>' + escape(localized(paper.venue)) + '</em>, ' + escape(paper.year) + '</p><p>' + escape(localized(paper.featuredSummary)) + '</p><a class="article-link" href="' + escape(paper.doi) + '" target="_blank" rel="noopener">' + text('fullArticle') + '</a></div></article>'
    ).join(''));
  }

  function renderRecords(id, items) {
    if (!byId(id)) return;
    const isProject = id === 'project-list';
    const heading = currentPage === 'cv' ? 'h3' : 'h2';
    setHTML(id, groups(items).map((group) => {
      const ordered = [...group.items].sort((a,b) => b.dates.localeCompare(a.dates));
      return '<div class="group-block"><' + heading + ' class="group-title">' + escape(localized(group.name)) + '</' + heading + '><ul class="record-list">' + ordered.map((item) => {
        const detail = isProject ? '<p class="record-program">' + escape(localized(item.program)) + '</p>' : '';
        const body = isProject && currentPage === 'cv'
          ? '<p class="record-full">' + escape(localized(item.text)) + '</p>'
          : '<p class="record-title">' + escape(localized(item.displayTitle)) + '</p>' + detail;
        return '<li class="record-item"><p class="record-date">' + escape(item.dates) + '</p><div>' + body + '</div></li>';
      }).join('') + '</ul></div>';
    }).join(''));
  }

  function matchesFilter(paper) {
    if (publishedOnly && !isPublishedJournal(paper)) return false;
    if (rankFilter && (rankFilter === 'top' ? !['1','2'].includes(rankKey(paper)) : rankKey(paper) !== rankFilter)) return false;
    if (topic && !paper.topics.includes(topic)) return false;
    if (filter === 'all') return true;
    if (filter === 'selected') return paper.selected === true;
    if (filter === 'conference') return paper.kind === 'conference';
    if (paper.kind === 'conference') return false;
    if (filter === 'first') return paper.category === 'first';
    if (filter === 'second') return paper.category === 'second' || paper.category === 'accepted';
    if (filter === 'accepted') return paper.status === filter;
    return paper.category === filter;
  }

  function renderFilters() {
    if (!byId('publication-filters')) return;
    setHTML('publication-filters', filterOptions.map((option) => '<button type="button" class="filter-button" data-filter="' + option + '" aria-pressed="' + (filter === option) + '">' + escape(text(option)) + '</button>').join(''));
    if (currentPage === 'publications') setHTML('publication-topics','<button type="button" data-topic="" aria-pressed="' + !topic + '">' + escape(text('allTopics')) + '</button>' + content.researchThemes.map((item) => '<button type="button" data-topic="' + item.id + '" aria-pressed="' + (topic === item.id) + '">' + escape(localized(item.label)) + '</button>').join(''));
    byId('publication-scope').hidden = !publishedOnly && !rankFilter;
    const scopeLabel = rankFilter ? text('rankingEdition') + colon() + rankLabel(rankFilter) : text('publishedScope');
    setHTML('publication-scope',escape(scopeLabel) + ' <button type="button" data-clear-scope>' + escape(text(rankFilter ? 'clearRanking' : 'clearScope')) + '</button>');
    byId('publication-ranking-legend')?.querySelectorAll('[data-tier]').forEach((button) => button.setAttribute('aria-pressed',String(button.dataset.tier === rankFilter)));
  }

  function publicationLink(paper) {
    if (paper.doi) return '<a class="doi-link" href="' + escape(paper.doi) + '" target="_blank" rel="noopener">DOI: ' + escape(paper.doi.replace('https://doi.org/', '')) + '</a>';
    const note = paper.doiNote ? '<span class="doi-pending">' + escape(localized(paper.doiNote)) + '</span>' : '';
    const fallback = paper.articleUrl || paper.searchUrl;
    return note + (fallback ? '<a class="' + (paper.articleUrl ? 'journal-link' : 'paper-search-link') + '" href="' + escape(fallback) + '" target="_blank" rel="noopener">' + text(paper.articleUrl ? 'journalPage' : 'findPaper') + '</a>' : '');
  }

  function renderPublications() {
    if (!byId('publication-list')) return;
    const keyword = query.trim().toLocaleLowerCase();
    const papers = content.publications.filter((paper) => matchesFilter(paper) && (!keyword || [paper.title.zh,paper.title.en,paper.authors.zh,paper.authors.en,paper.venue.zh,paper.venue.en,paper.year].join(' ').toLocaleLowerCase().includes(keyword)));
    setText('publication-count', language === 'zh' ? '共' + content.publications.length + '条记录，当前显示' + papers.length + '条' : 'Showing ' + papers.length + ' of ' + content.publications.length + ' records');
    byId('publication-count').hidden = currentPage === 'cv' && filter === 'all' && !keyword && !topic && !publishedOnly && !rankFilter;
    byId('publication-empty').hidden = papers.length > 0;
    setHTML('publication-list', papers.map((paper, index) => {
      const authors = escape(localized(paper.authors)).replace(/Gu,\s*T\.\*?|谷天赐/g, '<strong>$&</strong>');
      const title = paper.title[paper.originalLanguage];
      const translation = paper.originalLanguage === 'zh' && language === 'en' ? '<p class="original-title" lang="en">' + escape(paper.title.en) + '</p>' : '';
      const heading = currentPage === 'cv' ? 'h3' : 'h2';
      const role = paper.kind === 'conference' ? localized(paper.role) : ['second','accepted'].includes(paper.category) ? (language === 'zh' ? '第二作者' : 'Second author') : paper.category === 'collaborative' ? '' : localized(paper.role);
      const status = paper.kind === 'conference' ? '<span class="status">' + escape(text('conference')) + '</span>' : paper.status === 'published' ? '' : '<span class="status">' + escape(text(paper.status)) + '</span>';
      const citation = [paper.year,paper.reference].filter(Boolean).map(escape).join(', ');
      const illustrated = currentPage === 'publications' && paper.figure;
      return '<article class="publication' + (illustrated ? ' publication-illustrated' : '') + '" id="' + escape(paper.id) + '" data-status="' + escape(paper.status) + '" data-kind="' + escape(paper.kind || 'journal') + '">' +
        (illustrated ? researchFigure(paper) : '') + '<div class="publication-copy">' +
        '<' + heading + ' class="publication-title" lang="' + (paper.originalLanguage === 'zh' ? 'zh-CN' : 'en') + '"><span class="publication-number">' + (index + 1) + '.</span><a href="' + escape(paper.doi || paper.articleUrl || paper.searchUrl) + '" target="_blank" rel="noopener">' + escape(title) + '</a></' + heading + '>' + translation +
        '<p class="authors">' + authors + '</p>' +
        '<p class="venue"><em>' + escape(localized(paper.venue)) + '</em>' + (citation ? ', ' + citation : '') + '</p>' +
        '<p class="publication-notes">' + (role ? '<span>' + escape(role) + '</span>' : '') + status + publicationLink(paper) + '</p></div></article>';
    }).join(''));
  }

  function renderEducation() {
    if (!byId('education-list')) return;
    setHTML('education-list', content.education.map((item) => {
      const rank = item.rank.split('/');
      const rankText = language === 'zh' ? '第' + rank[0] + '名，共' + rank[1] + '人' : rank[0] + ' of ' + rank[1];
      const separator = language === 'zh' ? '，' : ', ';
      const scores = currentPage === 'cv' ? '<p class="education-scores"><span>' + escape(text('rank')) + colon() + escape(rankText) + '</span><span>' + escape(text('gpa')) + colon() + escape(item.gpa) + '</span></p>' : '';
      const heading = ['about','cv'].includes(currentPage) ? 'h3' : 'h2';
      return '<article class="education-item"><p class="dates">' + escape(localized(item.dates)) + '</p><div><' + heading + ' class="school-name">' + escape(localized(item.school)) + '</' + heading + '><p>' + escape(localized(item.degree)) + separator + escape(localized(item.major)) + '</p><p class="advisors">' + escape(text('advisors')) + colon() + escape(localized(item.advisors)) + '</p>' + scores + '</div></article>';
    }).join(''));
  }

  function renderService() {
    if (!byId('service-list')) return;
    setHTML('service-list', groups(content.services).map((group) => {
      const entries = [];
      for (const item of group.items) {
        if (item.kind === 'title' || item.kind === 'policy') entries.push({title:item.text,details:[],kind:item.kind});
        else if (entries.length) entries[entries.length - 1].details.push(item.text);
      }
      const heading = currentPage === 'cv' ? 'h3' : 'h2';
      const entryHeading = currentPage === 'cv' ? 'h4' : 'h3';
      return '<div class="service-group"><' + heading + ' class="group-title">' + escape(localized(group.name)) + '</' + heading + '>' + entries.map((entry) => entry.kind === 'policy' ? '<ul class="policy-list"><li><span aria-hidden="true">· </span>' + escape(localized(entry.title)) + '</li></ul>' : '<article class="service-entry"><' + entryHeading + ' class="service-title">' + escape(localized(entry.title)) + '</' + entryHeading + '><ul>' + entry.details.map((detail) => '<li>' + escape(localized(detail)) + '</li>').join('') + '</ul></article>').join('') + '</div>';
    }).join(''));
  }

  function renderProfile() {
    if (!byId('profile-name')) return;
    setHTML('profile-name', escape(localized(content.profile.name)) + '<span>' + escape(content.profile.name[language === 'zh' ? 'en' : 'zh']) + '</span>');
    const affiliation = currentPage === 'about' && language === 'en' ? 'Beijing Normal University' : localized(content.profile.affiliation);
    setHTML('profile-position', escape(affiliation) + '<br>' + escape(localized(content.profile.position)));
    setText('profile-bio', localized(content.profile.bio));
    setHTML('home-biography', content.profile.homeBio.map((paragraph) => '<p>' + escape(localized(paragraph)) + '</p>').join(''));
    renderHomeOverview();
    renderFeaturedResearch();
    setHTML('home-news', content.news.map((item) => '<li><span class="news-date">' + escape(item.date) + '</span><span>' + escape(localized(item.text)) + '</span></li>').join(''));
    setHTML('biography', content.biography.map((paragraph) => '<p>' + escape(localized(paragraph)) + '</p>').join(''));
    setHTML('research-statement', content.researchStatement.map((paragraph) => '<p>' + escape(localized(paragraph)) + '</p>').join(''));
    setHTML('metrics', content.metrics.map((metric) => '<tr><th scope="row">' + escape(localized(metric.label)) + '</th><td>' + escape(metric.value) + '</td><td>' + escape(metric.since2021) + '</td></tr>').join(''));
    setText('metrics-note', localized(content.metricsNote));
    byId('scholar-link').href = content.profile.scholar + '&hl=' + (language === 'zh' ? 'zh-CN' : 'en');
    byId('orcid-link').href = content.profile.orcid;
    byId('researchgate-link').href = content.profile.researchgate;
    setHTML('personal-information', ['birth','hometown','membership','phone'].map((key) => '<dt>' + escape(text(key)) + '</dt><dd>' + (key === 'phone' ? '<a href="tel:+86' + escape(content.profile.phone) + '">+86 ' + escape(content.profile.phone) + '</a>' : escape(localized(content.profile[key]))) + '</dd>').join(''));
  }

  function renderFooter() {
    setText('footer-affiliation', localized(content.profile.affiliation));
    setText('footer-copyright', '© ' + new Date().getFullYear() + ' ' + localized(content.profile.name));
    byId('footer-scholar-link').href = content.profile.scholar + '&hl=' + (language === 'zh' ? 'zh-CN' : 'en');
    byId('footer-orcid-link').href = content.profile.orcid;
    byId('footer-researchgate-link').href = content.profile.researchgate;
  }

  function render() {
    document.documentElement.lang = language === 'zh' ? 'zh-CN' : 'en';
    document.title = localized(content.profile.name) + ' ' + text(currentPage);
    document.querySelectorAll('[data-i18n]').forEach((element) => { element.textContent = text(element.dataset.i18n); });
    document.querySelectorAll('[data-page-summary]').forEach((element) => { element.textContent = localized(content.pageSummaries[element.dataset.pageSummary]); });
    document.querySelectorAll('[data-profile-name]').forEach((element) => { element.textContent = content.profile.name[element.dataset.profileName]; });
    document.querySelectorAll('[data-language]').forEach((button) => { button.setAttribute('aria-pressed', String(button.dataset.language === language)); });
    document.querySelectorAll('[data-page-link]').forEach((link) => { link.href = pageURL(link.dataset.pageLink); });
    document.querySelectorAll('[data-selected-link]').forEach((link) => { link.href = pageURL('publications',{filter:'selected'},'#publication-browser'); });
    document.querySelectorAll('[data-selected-count]').forEach((link) => { link.textContent = selectedCountLabel(); });
    document.querySelectorAll('[data-email]').forEach((link) => { link.href = 'mailto:' + content.profile.email; link.querySelector('span').textContent = content.profile.email; });
    byId('site-nav').setAttribute('aria-label', language === 'zh' ? '主要导航' : 'Main navigation');
    renderProfile();
    renderFooter();
    renderEducation();
    if (byId('publication-list')) {
      byId('publication-search').placeholder = text('searchPlaceholder');
      byId('publication-search').value = query;
      byId('publication-filters').setAttribute('aria-label', language === 'zh' ? '论文分类筛选' : 'Publication filters');
      renderFilters();
      renderPublications();
      renderPublicationOverview();
      setText('patents-line', text('patents') + colon() + localized(content.patents));
    }
    renderProjectOverview();
    renderRecords('project-list',content.projects.filter((item) => currentPage !== 'projects' || projectFilter === 'all' || item.role === projectFilter || item.source === projectFilter));
    renderRecords('award-list', content.awards);
    if (byId('skill-list')) {
      setHTML('skill-list', content.skills.map((skill) => {
        const value = localized(skill.shortText);
        const separator = language === 'zh' ? '：' : ':';
        const position = value.indexOf(separator);
        return '<dt>' + escape(value.slice(0,position)) + '</dt><dd>' + escape(value.slice(position + 1).trim()) + '</dd>';
      }).join(''));
    }
    renderService();
    setText('updated-label', text('updated'));
  }

  document.querySelectorAll('[data-language]').forEach((button) => button.addEventListener('click', () => {
    language = button.dataset.language;
    try { localStorage.setItem('cv-language', language); } catch (_) { /* Language switching still works. */ }
    const url = new URL(window.location.href);
    url.searchParams.set('lang', language);
    try { history.replaceState(null, '', url); } catch (_) { /* file previews can reject history changes. */ }
    render();
  }));
  byId('publication-filters')?.addEventListener('click', (event) => {
    const button = event.target.closest('[data-filter]');
    if (!button) return;
    filter = button.dataset.filter;
    publishedOnly = Boolean(rankFilter);
    if (['selected','all','accepted','conference'].includes(filter)) { rankFilter = ''; publishedOnly = false; }
    if (filter === 'selected') { query = ''; topic = ''; byId('publication-search').value = ''; }
    saveLocation();
    renderFilters();
    renderPublications();
    byId('publication-filters').querySelector('[aria-pressed="true"]').focus({preventScroll:true});
  });
  byId('publication-search')?.addEventListener('input', (event) => { query = event.target.value; saveLocation(true); renderPublications(); });
  byId('publication-topics')?.addEventListener('click',(event) => {
    const button = event.target.closest('[data-topic]');
    if (!button) return;
    topic = button.dataset.topic; filter = 'all'; publishedOnly = false; rankFilter = '';
    saveLocation(); renderFilters(); renderPublications();
    byId('publication-topics').querySelector('[aria-pressed="true"]').focus({preventScroll:true});
  });
  byId('publication-scope')?.addEventListener('click',(event) => {
    if (!event.target.closest('[data-clear-scope]')) return;
    publishedOnly = false; rankFilter = ''; saveLocation(); renderFilters(); renderPublications();
    byId('publication-filters').querySelector('[aria-pressed="true"]').focus({preventScroll:true});
  });
  byId('publication-overview')?.addEventListener('click',(event) => {
    const button = event.target.closest('[data-tier]');
    if (!button) return;
    if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    rankFilter = button.dataset.tier;
    filter = 'all'; query = ''; topic = ''; publishedOnly = true;
    byId('publication-search').value = '';
    saveLocation(); renderFilters(); renderPublications(); renderPublicationOverview();
    byId('publication-browser').scrollIntoView({block:'start'});
    byId('publication-filters').querySelector('[aria-pressed="true"]').focus({preventScroll:true});
  });
  function projectFilterClick(event) {
    const button = event.target.closest('[data-project-filter]');
    if (!button) return;
    projectFilter = button.dataset.projectFilter;
    saveLocation(); renderProjectOverview();
    renderRecords('project-list',content.projects.filter((item) => projectFilter === 'all' || item.role === projectFilter || item.source === projectFilter));
    byId('project-filter').scrollIntoView({block:'start'});
    byId('project-filter').querySelector('button').focus({preventScroll:true});
  }
  byId('project-overview')?.addEventListener('click',projectFilterClick);
  byId('project-filter')?.addEventListener('click',projectFilterClick);
  function highlightMap(id) {
    const map = byId('research-map');
    const connected = new Set([id]);
    map.querySelectorAll('.map-edge').forEach((edge) => {
      const match = Boolean(id && [edge.dataset.from,edge.dataset.to].includes(id));
      edge.classList.toggle('is-active',match);
      if (match) {connected.add(edge.dataset.from); connected.add(edge.dataset.to);}
    });
    map.classList.toggle('has-focus',Boolean(id));
    map.querySelectorAll('.map-node').forEach((node) => node.classList.toggle('is-connected',connected.has(node.dataset.node)));
  }
  byId('research-map')?.addEventListener('pointerover',(event) => highlightMap(event.target.closest('[data-node]')?.dataset.node || ''));
  byId('research-map')?.addEventListener('pointerleave',() => highlightMap(document.activeElement.closest('[data-node]')?.dataset.node || ''));
  byId('research-map')?.addEventListener('focusin',(event) => highlightMap(event.target.closest('[data-node]')?.dataset.node || ''));
  byId('research-map')?.addEventListener('focusout',(event) => highlightMap(event.relatedTarget?.closest('[data-node]')?.dataset.node || ''));
  window.addEventListener('popstate',() => {
    const lang = new URLSearchParams(location.search).get('lang');
    if (['zh','en'].includes(lang)) language = lang;
    readLocation(); render();
  });
  document.querySelector('.menu-button').addEventListener('click', (event) => {
    const open = event.currentTarget.getAttribute('aria-expanded') !== 'true';
    event.currentTarget.setAttribute('aria-expanded', String(open));
    byId('site-nav').classList.toggle('is-open', open);
  });
  byId('site-nav').addEventListener('click', (event) => {
    if (!event.target.closest('a')) return;
    document.querySelector('.menu-button').setAttribute('aria-expanded', 'false');
    byId('site-nav').classList.remove('is-open');
  });
  document.addEventListener('keydown',(event) => {
    if (event.key !== 'Escape' || !byId('site-nav').classList.contains('is-open')) return;
    document.querySelector('.menu-button').setAttribute('aria-expanded','false');
    byId('site-nav').classList.remove('is-open');
    document.querySelector('.menu-button').focus();
  });
  const contactMedia = window.matchMedia('(min-width:701px)');
  const updateContact = () => { const details = document.querySelector('.profile-contact'); if (details) details.open = contactMedia.matches; };
  contactMedia.addEventListener('change',updateContact);
  updateContact();
  byId('print-cv')?.addEventListener('click', () => window.print());
  window.addEventListener('beforeprint', () => {
    const personal = document.querySelector('.personal-details');
    const details = [...document.querySelectorAll('.profile-contact')];
    printState = {filter,query,topic,publishedOnly,rankFilter,personalOpen:personal?.open,details:details.map((item) => ({item,open:item.open}))};
    filter = 'all'; query = ''; topic = ''; publishedOnly = false; rankFilter = '';
    details.forEach((item) => {item.open = true;});
    if (personal) personal.open = true;
    renderPublications();
  });
  window.addEventListener('afterprint', () => {
    if (!printState) return;
    filter = printState.filter; query = printState.query; topic = printState.topic; publishedOnly = printState.publishedOnly; rankFilter = printState.rankFilter;
    const personal = document.querySelector('.personal-details');
    if (personal) personal.open = printState.personalOpen;
    printState.details.forEach((entry) => {entry.item.open = entry.open;});
    printState = null;
    renderPublications();
  });
  render();
})();

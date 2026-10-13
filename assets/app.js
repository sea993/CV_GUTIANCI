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
    window.location.replace('cv.html?lang=' + language + '&v=' + assetVersion + '#' + currentPage);
    return;
  }
  const legacySection = window.location.hash.slice(1);
  if (currentPage === 'about' && Object.hasOwn(routes, legacySection) && legacySection !== 'about') {
    const inCV = legacySection === 'education' || legacySection === 'skills';
    window.location.replace((inCV ? routes.cv : routes[legacySection]) + '?lang=' + language + '&v=' + assetVersion + (inCV ? '#' + legacySection : ''));
    return;
  }
  let filter = 'all';
  let query = '';
  let printState = null;
  const byId = (id) => document.getElementById(id);
  const escape = (value) => String(value ?? '').replace(/[&<>"']/g, (char) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const localized = (value) => typeof value === 'object' && value !== null ? value[language] : value;
  const text = (key) => strings[language][key];
  const colon = () => language === 'zh' ? '：' : ': ';
  strings.zh.selectedResearch = '研究选读';
  strings.en.selectedResearch = 'Selected research';
  strings.zh.fullArticle = '论文全文';
  strings.en.fullArticle = 'Read article';
  const icon = (name, className) => '<svg class="' + className + '" aria-hidden="true"><use href="assets/icons.svg#' + name + '"></use></svg>';
  const setText = (id, value) => { if (byId(id)) byId(id).textContent = value; };
  const setHTML = (id, value) => { if (byId(id)) byId(id).innerHTML = value; };

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
    if (filter === 'all') return true;
    if (filter === 'first') return paper.category === 'first';
    if (filter === 'second') return paper.category === 'second' || paper.category === 'accepted';
    if (filter === 'accepted') return paper.status === filter;
    return paper.category === filter;
  }

  function renderFilters() {
    if (!byId('publication-filters')) return;
    const options = ['all','first','corresponding','second','collaborative','accepted'];
    setHTML('publication-filters', options.map((option) => '<button type="button" class="filter-button" data-filter="' + option + '" aria-pressed="' + (filter === option) + '">' + escape(text(option)) + '</button>').join(''));
  }

  function renderPublications() {
    if (!byId('publication-list')) return;
    const keyword = query.trim().toLocaleLowerCase();
    const papers = content.publications.filter((paper) => matchesFilter(paper) && (!keyword || [paper.title.zh,paper.title.en,paper.authors.zh,paper.authors.en,paper.venue.zh,paper.venue.en,paper.year,paper.metadata.zh,paper.metadata.en].join(' ').toLocaleLowerCase().includes(keyword)));
    setText('publication-count', language === 'zh' ? '共' + content.publications.length + '条记录，当前显示' + papers.length + '条' : 'Showing ' + papers.length + ' of ' + content.publications.length + ' records');
    byId('publication-count').hidden = filter === 'all' && !keyword;
    byId('publication-empty').hidden = papers.length > 0;
    setHTML('publication-list', papers.map((paper) => {
      const authors = escape(localized(paper.authors)).replace(/Gu,\s*T\.\*?|谷天赐/g, '<strong>$&</strong>');
      const title = paper.title[paper.originalLanguage];
      const translation = paper.originalLanguage === 'zh' && language === 'en' ? '<p class="original-title" lang="en">' + escape(paper.title.en) + '</p>' : '';
      const heading = currentPage === 'cv' ? 'h3' : 'h2';
      const role = ['second','accepted'].includes(paper.category) ? (language === 'zh' ? '第二作者' : 'Second author') : paper.category === 'collaborative' ? '' : localized(paper.role);
      const status = paper.status === 'published' ? '' : '<span class="status">' + escape(text(paper.status)) + '</span>';
      const citation = [paper.year,paper.reference].filter(Boolean).map(escape).join(', ');
      const illustrated = currentPage === 'publications' && paper.figure;
      return '<article class="publication' + (illustrated ? ' publication-illustrated' : '') + '" id="' + escape(paper.id) + '" data-status="' + escape(paper.status) + '">' +
        (illustrated ? researchFigure(paper) : '') + '<div class="publication-copy">' +
        '<' + heading + ' class="publication-title" lang="' + (paper.originalLanguage === 'zh' ? 'zh-CN' : 'en') + '">' + escape(title) + '</' + heading + '>' + translation +
        '<p class="authors">' + authors + '</p>' +
        '<p class="venue"><em>' + escape(localized(paper.venue)) + '</em>' + (citation ? ', ' + citation : '') + '</p>' +
        (role || status || paper.doi ? '<p class="publication-notes">' + (role ? '<span>' + escape(role) + '</span>' : '') + status + (paper.doi ? '<a href="' + escape(paper.doi) + '" target="_blank" rel="noopener">' + text('fullArticle') + '</a>' : '') + '</p>' : '') + '</div></article>';
    }).join(''));
  }

  function renderEducation() {
    if (!byId('education-list')) return;
    setHTML('education-list', content.education.map((item) => {
      const rank = item.rank.split('/');
      const rankText = language === 'zh' ? '第' + rank[0] + '名，共' + rank[1] + '人' : rank[0] + ' of ' + rank[1];
      const separator = language === 'zh' ? '，' : ', ';
      const scores = currentPage === 'cv' ? '<p class="education-scores"><span>' + escape(text('rank')) + colon() + escape(rankText) + '</span><span>' + escape(text('gpa')) + colon() + escape(item.gpa) + '</span></p>' : '';
      const heading = currentPage === 'cv' ? 'h3' : 'h2';
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
    setHTML('home-research', content.homeResearch.map((item, index) => '<li>' + icon(['city','leaf','map'][index], 'interest-icon') + '<span>' + escape(localized(item)) + '</span></li>').join(''));
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

  function render() {
    document.documentElement.lang = language === 'zh' ? 'zh-CN' : 'en';
    document.title = localized(content.profile.name) + ' ' + text(currentPage);
    document.querySelectorAll('[data-i18n]').forEach((element) => { element.textContent = text(element.dataset.i18n); });
    document.querySelectorAll('[data-page-summary]').forEach((element) => { element.textContent = localized(content.pageSummaries[element.dataset.pageSummary]); });
    document.querySelectorAll('[data-profile-name]').forEach((element) => { element.textContent = localized(content.profile.name); });
    document.querySelectorAll('[data-language]').forEach((button) => { button.setAttribute('aria-pressed', String(button.dataset.language === language)); });
    document.querySelectorAll('[data-page-link]').forEach((link) => { link.href = routes[link.dataset.pageLink] + '?lang=' + language + '&v=' + assetVersion; });
    document.querySelectorAll('[data-email]').forEach((link) => { link.href = 'mailto:' + content.profile.email; link.querySelector('span').textContent = content.profile.email; });
    byId('site-nav').setAttribute('aria-label', language === 'zh' ? '主要导航' : 'Main navigation');
    renderProfile();
    renderEducation();
    if (byId('publication-list')) {
      byId('publication-search').placeholder = text('searchPlaceholder');
      byId('publication-search').value = query;
      byId('publication-filters').setAttribute('aria-label', language === 'zh' ? '论文分类筛选' : 'Publication filters');
      renderFilters();
      renderPublications();
      setText('patents-line', text('patents') + colon() + localized(content.patents));
    }
    renderRecords('project-list', content.projects);
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
    byId('publication-filters').querySelectorAll('button').forEach((element) => element.setAttribute('aria-pressed', String(element === button)));
    renderPublications();
  });
  byId('publication-search')?.addEventListener('input', (event) => { query = event.target.value; renderPublications(); });
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
  byId('print-cv')?.addEventListener('click', () => window.print());
  window.addEventListener('beforeprint', () => {
    const personal = document.querySelector('.personal-details');
    printState = {filter,query,personalOpen:personal?.open};
    filter = 'all'; query = '';
    if (personal) personal.open = true;
    renderPublications();
  });
  window.addEventListener('afterprint', () => {
    if (!printState) return;
    filter = printState.filter; query = printState.query;
    const personal = document.querySelector('.personal-details');
    if (personal) personal.open = printState.personalOpen;
    printState = null;
    renderPublications();
  });
  render();
})();

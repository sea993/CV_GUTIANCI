/* Each page renders its own section from the shared bilingual CV data. */
(() => {
  'use strict';
  const content = window.CV_CONTENT;
  const currentPage = document.body.dataset.page || 'about';
  const routes = {about:'index.html',education:'education.html',publications:'publications.html',projects:'projects.html',awards:'awards.html',skills:'skills.html',service:'service.html',cv:'cv.html'};
  const strings = {
    zh: {skip:'跳到正文',menu:'菜单',about:'个人简介',education:'教育经历',publications:'学术成果',projects:'科研项目',awards:'奖励荣誉',skills:'研究技能',service:'经历与服务',cv:'完整简历',downloadCv:'下载原始简历',print:'打印或保存PDF',personal:'个人信息',search:'检索论文',searchPlaceholder:'检索题名、作者或期刊',empty:'没有符合条件的论文。请尝试其他关键词或分类。',footerAffiliation:'北京师范大学地理科学学部',birth:'出生年月',hometown:'籍贯',membership:'政治面貌',phone:'手机号',rank:'成绩排名',gpa:'平均绩点',advisors:'导师',contribution:'谷天赐的贡献',patents:'专利',published:'已发表',accepted:'已录用',review:'在审',all:'全部',first:'第一及共同第一作者',corresponding:'通讯及共同通讯作者',second:'导师一作、谷天赐二作',collaborative:'其他合作论文',updated:'2026年10月更新',academicMetrics:'学术指标',metric:'指标',total:'总计',since2021:'2021年至今',researchDirection:'研究方向'},
    en: {skip:'Skip to content',menu:'Menu',about:'About',education:'Education',publications:'Publications',projects:'Projects',awards:'Honors',skills:'Skills',service:'Experience',cv:'Full CV',downloadCv:'Download original CV',print:'Print or save PDF',personal:'Personal information',search:'Search publications',searchPlaceholder:'Search title, author or journal',empty:'No matching publications. Try another keyword or category.',footerAffiliation:'Faculty of Geographical Science, Beijing Normal University',birth:'Date of birth',hometown:'Hometown',membership:'Political membership',phone:'Phone',rank:'Class rank',gpa:'GPA',advisors:'Supervisors',contribution:'Contribution',patents:'Patents',published:'Published',accepted:'Accepted',review:'Under review',all:'All',first:'First and co-first author',corresponding:'Corresponding author',second:'Second author with supervisor',collaborative:'Other collaborations',updated:'Updated October 2026',academicMetrics:'Academic metrics',metric:'Metric',total:'All',since2021:'Since 2021',researchDirection:'Research direction'}
  };
  let language = 'zh';
  const requestedLanguage = new URLSearchParams(window.location.search).get('lang');
  if (requestedLanguage === 'en' || requestedLanguage === 'zh') language = requestedLanguage;
  else {
    try { if (localStorage.getItem('cv-language') === 'en') language = 'en'; } catch (_) { /* Storage is optional. */ }
  }
  try { localStorage.setItem('cv-language', language); } catch (_) { /* Storage is optional. */ }
  const legacySection = window.location.hash.slice(1);
  if (currentPage === 'about' && Object.hasOwn(routes, legacySection) && legacySection !== 'about') {
    window.location.replace(routes[legacySection] + '?lang=' + language);
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

  function renderGroupedList(id, items) {
    if (!byId(id)) return;
    setHTML(id, groups(items).map((group) => '<div class="group-block"><h2>' + escape(localized(group.name)) + '</h2><ol>' + group.items.map((item) => '<li>' + escape(localized(item.text)) + '</li>').join('') + '</ol></div>').join(''));
  }

  function matchesFilter(paper) {
    if (filter === 'all') return true;
    if (filter === 'first') return paper.category === 'first' || paper.category === 'review';
    if (filter === 'second') return paper.category === 'second' || paper.category === 'accepted';
    if (filter === 'review' || filter === 'accepted') return paper.status === filter;
    return paper.category === filter;
  }

  function renderFilters() {
    if (!byId('publication-filters')) return;
    const options = ['all','first','corresponding','second','collaborative','accepted','review'];
    setHTML('publication-filters', options.map((option) => '<button type="button" class="filter-button" data-filter="' + option + '" aria-pressed="' + (filter === option) + '">' + escape(text(option)) + '</button>').join(''));
  }

  function renderPublications() {
    if (!byId('publication-list')) return;
    const keyword = query.trim().toLocaleLowerCase();
    const papers = content.publications.filter((paper) => matchesFilter(paper) && (!keyword || [paper.title.zh,paper.title.en,paper.authors.zh,paper.authors.en,paper.venue.zh,paper.venue.en,paper.year,paper.metadata.zh,paper.metadata.en].join(' ').toLocaleLowerCase().includes(keyword)));
    setText('publication-count', language === 'zh' ? '共' + content.publications.length + '条记录，当前显示' + papers.length + '条' : 'Showing ' + papers.length + ' of ' + content.publications.length + ' records');
    byId('publication-empty').hidden = papers.length > 0;
    setHTML('publication-list', papers.map((paper) => {
      const authors = escape(localized(paper.authors)).replace(/Gu,\s*T\.\*?|谷天赐/g, '<strong>$&</strong>');
      const originalTitle = language === 'zh' && paper.title.en !== paper.title.zh ? '<p class="original-title" lang="en">' + escape(paper.title.en) + '</p>' : '';
      const metadata = localized(paper.metadata).replace(/\s*\/\s*/g, language === 'zh' ? '；' : '; ');
      return '<article class="publication" id="' + escape(paper.id) + '" data-status="' + escape(paper.status) + '">' +
        '<div class="publication-year">' + escape(paper.year) + '<span class="status">' + escape(text(paper.status)) + '</span></div>' +
        '<div><h2>' + escape(localized(paper.title)) + '</h2>' + originalTitle +
        '<p class="authors">' + authors + '</p>' +
        '<p class="venue"><em>' + escape(localized(paper.venue)) + '</em>' + (paper.reference ? ', ' + escape(paper.reference) : '') + '</p>' +
        '<div class="paper-meta"><span class="author-role">' + escape(localized(paper.role)) + '</span>' + (metadata ? '<span>' + escape(metadata) + '</span>' : '') + '</div>' +
        (paper.contribution ? '<p class="contribution">' + escape(text('contribution')) + colon() + escape(localized(paper.contribution)) + '</p>' : '') +
        '</div></article>';
    }).join(''));
  }

  function renderEducation() {
    if (!byId('education-list')) return;
    setHTML('education-list', content.education.map((item) => {
      const rank = item.rank.split('/');
      const rankText = language === 'zh' ? '第' + rank[0] + '名，共' + rank[1] + '人' : rank[0] + ' of ' + rank[1];
      const separator = language === 'zh' ? '，' : ', ';
      return '<article class="education-item"><p class="dates">' + escape(localized(item.dates)) + '</p><div><h2>' + escape(localized(item.school)) + '</h2><p>' + escape(localized(item.degree)) + separator + escape(localized(item.major)) + '</p><p class="advisors">' + escape(text('advisors')) + colon() + escape(localized(item.advisors)) + '</p><p class="education-scores"><span>' + escape(text('rank')) + colon() + escape(rankText) + '</span><span>' + escape(text('gpa')) + colon() + escape(item.gpa) + '</span></p></div></article>';
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
      return '<div class="service-group"><h2>' + escape(localized(group.name)) + '</h2>' + entries.map((entry) => entry.kind === 'policy' ? '<p class="service-policy">' + escape(localized(entry.title)) + '</p>' : '<article class="service-entry"><h3>' + escape(localized(entry.title)) + '</h3><ul>' + entry.details.map((detail) => '<li>' + escape(localized(detail)) + '</li>').join('') + '</ul></article>').join('') + '</div>';
    }).join(''));
  }

  function renderProfile() {
    if (!byId('profile-name')) return;
    setHTML('profile-name', escape(localized(content.profile.name)) + '<span>' + escape(content.profile.name[language === 'zh' ? 'en' : 'zh']) + '</span>');
    setHTML('profile-position', escape(localized(content.profile.affiliation)) + '<br>' + escape(localized(content.profile.position)));
    setText('profile-bio', localized(content.profile.bio));
    setHTML('biography', content.biography.map((paragraph) => '<p>' + escape(localized(paragraph)) + '</p>').join(''));
    setHTML('research-statement', content.researchStatement.map((paragraph) => '<p>' + escape(localized(paragraph)) + '</p>').join(''));
    setHTML('metrics', content.metrics.map((metric) => '<tr><th scope="row">' + escape(localized(metric.label)) + '</th><td>' + escape(metric.value) + '</td><td>' + escape(metric.since2021) + '</td></tr>').join(''));
    setText('metrics-note', localized(content.metricsNote));
    byId('scholar-link').href = content.profile.scholar + '&hl=' + (language === 'zh' ? 'zh-CN' : 'en');
    setHTML('personal-information', ['birth','hometown','membership','phone'].map((key) => '<dt>' + escape(text(key)) + '</dt><dd>' + (key === 'phone' ? '<a href="tel:+86' + escape(content.profile.phone) + '">+86 ' + escape(content.profile.phone) + '</a>' : escape(localized(content.profile[key]))) + '</dd>').join(''));
  }

  function render() {
    document.documentElement.lang = language === 'zh' ? 'zh-CN' : 'en';
    document.title = localized(content.profile.name) + ' ' + text(currentPage);
    document.querySelectorAll('[data-i18n]').forEach((element) => { element.textContent = text(element.dataset.i18n); });
    document.querySelectorAll('[data-profile-name]').forEach((element) => { element.textContent = localized(content.profile.name); });
    document.querySelectorAll('[data-language]').forEach((button) => { button.setAttribute('aria-pressed', String(button.dataset.language === language)); });
    document.querySelectorAll('[data-page-link]').forEach((link) => { link.href = routes[link.dataset.pageLink] + '?lang=' + language; });
    byId('site-nav').setAttribute('aria-label', language === 'zh' ? '主要导航' : 'Main navigation');
    renderProfile();
    renderEducation();
    if (byId('publication-list')) {
      setText('publication-summary', localized(content.summary));
      byId('publication-search').placeholder = text('searchPlaceholder');
      byId('publication-search').value = query;
      byId('publication-filters').setAttribute('aria-label', language === 'zh' ? '论文分类筛选' : 'Publication filters');
      renderFilters();
      renderPublications();
      setText('patents-line', text('patents') + colon() + localized(content.patents));
    }
    setText('project-summary', localized(content.projectSummary));
    renderGroupedList('project-list', content.projects);
    renderGroupedList('award-list', content.awards);
    if (byId('skill-list')) {
      setHTML('skill-list', content.skills.map((skill) => {
        const value = localized(skill.text);
        const separator = language === 'zh' ? '：' : ':';
        const position = value.indexOf(separator);
        return '<article class="skill"><h2>' + escape(value.slice(0,position)) + '</h2><p>' + escape(value.slice(position + 1).trim()) + '</p></article>';
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

/* Static, bilingual rendering; all resume data lives in content.json. */
(() => {
  'use strict';
  const content = window.CV_CONTENT;
  const strings = {
    zh: {skip:'跳到正文',menu:'目录',about:'个人介绍',education:'教育经历',publications:'学术成果',projects:'科研项目',awards:'奖励荣誉',skills:'研究技能',service:'经历与服务',cvShort:'完整简历 ↗',downloadCv:'下载完整简历 ↗',print:'打印 / 保存PDF',personal:'个人信息',search:'检索论文',searchPlaceholder:'检索题名、作者或期刊',empty:'没有符合条件的论文。请尝试其他关键词或分类。',footerAffiliation:'北京师范大学 · 地理科学学部',top:'回到顶部 ↑',birth:'出生年月',hometown:'籍贯',membership:'政治面貌',phone:'手机号',rank:'成绩排名',gpa:'平均绩点',advisors:'导师',contribution:'本人贡献',patents:'专利',published:'已发表',accepted:'已录用',review:'在审',all:'全部',first:'第一 / 共同第一作者',corresponding:'通讯 / 共同通讯作者',second:'导师一作、本人二作',collaborative:'其他合作论文',results:'条论文记录',updated:'内容更新于2026年10月',snapshot:'学术指标截至2026年10月'},
    en: {skip:'Skip to content',menu:'Menu',about:'About',education:'Education',publications:'Publications',projects:'Projects',awards:'Honors',skills:'Skills',service:'Experience',cvShort:'Full CV ↗',downloadCv:'Download original CV ↗',print:'Print / Save PDF',personal:'Personal information',search:'Search publications',searchPlaceholder:'Search title, author or journal',empty:'No matching publications. Try another keyword or category.',footerAffiliation:'Faculty of Geographical Science · Beijing Normal University',top:'Back to top ↑',birth:'Date of birth',hometown:'Hometown',membership:'Political membership',phone:'Phone',rank:'Class rank',gpa:'GPA',advisors:'Supervisors',contribution:'Contribution',patents:'Patents',published:'Published',accepted:'Accepted',review:'Under review',all:'All',first:'First / co-first author',corresponding:'Corresponding author',second:'Second author with supervisor',collaborative:'Other collaborations',results:'publication records',updated:'Content updated October 2026',snapshot:'Academic metrics as of October 2026'}
  };
  let language = 'zh';
  const requestedLanguage = new URLSearchParams(window.location.search).get('lang');
  if (requestedLanguage === 'en' || requestedLanguage === 'zh') language = requestedLanguage;
  else {
    try { if (localStorage.getItem('cv-language') === 'en') language = 'en'; } catch (_) { /* Storage can be disabled. */ }
  }
  let filter = 'all';
  let query = '';
  let printState = null;
  const byId = (id) => document.getElementById(id);
  const escape = (value) => String(value ?? '').replace(/[&<>"']/g, (char) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const localized = (value) => typeof value === 'object' && value !== null ? value[language] : value;
  const text = (key) => strings[language][key];

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
    byId(id).innerHTML = groups(items).map((group) => `<div class="group-block"><h3>${escape(localized(group.name))}</h3><ol>${group.items.map((item) => `<li>${escape(localized(item.text))}</li>`).join('')}</ol></div>`).join('');
  }

  function matchesFilter(paper) {
    if (filter === 'all') return true;
    if (filter === 'first') return paper.category === 'first' || paper.category === 'review';
    if (filter === 'second') return paper.category === 'second' || paper.category === 'accepted';
    if (filter === 'review' || filter === 'accepted') return paper.status === filter;
    return paper.category === filter;
  }

  function renderFilters() {
    const options = ['all','first','corresponding','second','collaborative','accepted','review'];
    byId('publication-filters').innerHTML = options.map((option) => `<button type="button" class="filter-button" data-filter="${option}" aria-pressed="${filter === option}">${escape(text(option))}</button>`).join('');
  }

  function renderPublications() {
    const keyword = query.trim().toLocaleLowerCase();
    const papers = content.publications.filter((paper) => matchesFilter(paper) && (!keyword || [paper.title.zh,paper.title.en,paper.authors.zh,paper.authors.en,paper.venue.zh,paper.venue.en,paper.year,paper.metadata.zh,paper.metadata.en].join(' ').toLocaleLowerCase().includes(keyword)));
    byId('publication-count').textContent = `${papers.length} / ${content.publications.length} ${text('results')}`;
    byId('publication-empty').hidden = papers.length > 0;
    byId('publication-list').innerHTML = papers.map((paper) => {
      const authors = escape(localized(paper.authors)).replace(/Gu,\s*T\.\*?|谷天赐/g, '<strong>$&</strong>');
      const originalTitle = language === 'zh' && paper.title.en !== paper.title.zh ? `<p class="original-title" lang="en">${escape(paper.title.en)}</p>` : '';
      return `<article class="publication" id="${escape(paper.id)}" data-status="${paper.status}">
        <div class="publication-year">${escape(paper.year || '—')}<span class="status">${escape(text(paper.status))}</span></div>
        <div><h3>${escape(localized(paper.title))}</h3>${originalTitle}
          <p class="authors">${authors}</p>
          <p class="venue"><em>${escape(localized(paper.venue))}</em>${paper.reference ? ` · ${escape(paper.reference)}` : ''}</p>
          <div class="paper-meta"><span class="author-role">${escape(localized(paper.role))}</span>${paper.metadata.zh ? `<span>${escape(localized(paper.metadata))}</span>` : ''}</div>
          ${paper.contribution ? `<p class="contribution">${escape(text('contribution'))}：${escape(localized(paper.contribution))}</p>` : ''}
        </div></article>`;
    }).join('');
  }

  function renderService() {
    byId('service-list').innerHTML = groups(content.services).map((group) => {
      const entries = [];
      for (const item of group.items) {
        if (item.kind === 'title' || item.kind === 'policy') entries.push({title:item.text,details:[],kind:item.kind});
        else entries[entries.length - 1].details.push(item.text);
      }
      return `<div class="service-group"><h3>${escape(localized(group.name))}</h3>${entries.map((entry) => entry.kind === 'policy' ? `<p class="service-policy">${escape(localized(entry.title))}</p>` : `<div class="service-entry"><h4>${escape(localized(entry.title))}</h4><ul>${entry.details.map((detail) => `<li>${escape(localized(detail))}</li>`).join('')}</ul></div>`).join('')}</div>`;
    }).join('');
  }

  function render() {
    document.documentElement.lang = language === 'zh' ? 'zh-CN' : 'en';
    document.title = language === 'zh' ? '谷天赐 · Tianci Gu | 学术主页' : 'Tianci Gu · 谷天赐 | Academic Homepage';
    document.querySelectorAll('[data-i18n]').forEach((element) => { element.textContent = text(element.dataset.i18n); });
    document.querySelectorAll('[data-language]').forEach((button) => { button.setAttribute('aria-pressed', String(button.dataset.language === language)); });
    byId('site-nav').setAttribute('aria-label', language === 'zh' ? '主要导航' : 'Main navigation');
    byId('publication-filters').setAttribute('aria-label', language === 'zh' ? '论文分类筛选' : 'Publication filters');
    byId('profile-position').textContent = `${localized(content.profile.affiliation)} · ${localized(content.profile.position)}`;
    byId('profile-name').innerHTML = `${escape(localized(content.profile.name))}<span>${escape(content.profile.name[language === 'zh' ? 'en' : 'zh'])}</span>`;
    byId('research-heading').textContent = localized(content.profile.research);
    byId('profile-bio').textContent = localized(content.profile.bio);
    byId('portrait-caption').textContent = localized(content.profile.affiliation);
    byId('metrics').innerHTML = content.metrics.map((metric) => `<div class="metric"><strong>${escape(metric.value)}</strong><span>${escape(localized(metric.label))}</span></div>`).join('');
    byId('metrics-note').textContent = localized(content.metricsNote);
    byId('personal-information').innerHTML = ['birth','hometown','membership','phone'].map((key) => `<dt>${escape(text(key))}</dt><dd>${key === 'phone' ? `<a href="tel:+86${content.profile.phone}">+86 ${content.profile.phone}</a>` : escape(localized(content.profile[key]))}</dd>`).join('');
    byId('education-list').innerHTML = content.education.map((item) => `<article class="education-item"><p class="dates">${escape(localized(item.dates))}</p><h3>${escape(localized(item.school))}</h3><p>${escape(localized(item.degree))} · ${escape(localized(item.major))}</p><p class="advisors">${escape(text('advisors'))}：${escape(localized(item.advisors))}</p><p class="education-scores"><span>${escape(text('rank'))}</span>${item.rank} &nbsp; <span>${escape(text('gpa'))}</span>${item.gpa}</p></article>`).join('');
    byId('publication-summary').textContent = localized(content.summary);
    byId('publication-search').placeholder = text('searchPlaceholder');
    byId('publication-search').value = query;
    renderFilters();
    renderPublications();
    byId('patents-line').textContent = `${text('patents')}：${localized(content.patents)}`;
    byId('project-summary').textContent = localized(content.projectSummary);
    renderGroupedList('project-list', content.projects);
    renderGroupedList('award-list', content.awards);
    byId('skill-list').innerHTML = content.skills.map((skill) => {
      const value = localized(skill.text);
      const separator = language === 'zh' ? '：' : ':';
      const position = value.indexOf(separator);
      return `<p class="skill"><strong>${escape(value.slice(0,position))}${escape(separator)}</strong> ${escape(value.slice(position + 1).trim())}</p>`;
    }).join('');
    renderService();
    byId('updated-label').textContent = text('updated');
  }

  document.querySelectorAll('[data-language]').forEach((button) => button.addEventListener('click', () => {
    language = button.dataset.language;
    try { localStorage.setItem('cv-language', language); } catch (_) { /* Language switching still works. */ }
    const url = new URL(window.location.href);
    url.searchParams.set('lang', language);
    try { history.replaceState(null, '', url); } catch (_) { /* file:// previews may reject history changes. */ }
    render();
  }));
  byId('publication-filters').addEventListener('click', (event) => {
    const button = event.target.closest('[data-filter]');
    if (!button) return;
    filter = button.dataset.filter;
    byId('publication-filters').querySelectorAll('button').forEach((element) => element.setAttribute('aria-pressed', String(element === button)));
    renderPublications();
  });
  byId('publication-search').addEventListener('input', (event) => { query = event.target.value; renderPublications(); });
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
  byId('print-cv').addEventListener('click', () => window.print());
  window.addEventListener('beforeprint', () => {
    printState = {filter,query,personalOpen:document.querySelector('.personal-details').open};
    filter = 'all'; query = ''; document.querySelector('.personal-details').open = true; renderPublications();
  });
  window.addEventListener('afterprint', () => {
    if (!printState) return;
    filter = printState.filter; query = printState.query; document.querySelector('.personal-details').open = printState.personalOpen;
    printState = null; renderPublications();
  });
  render();
})();

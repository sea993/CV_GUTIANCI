"""Generate static section pages sharing a bilingual navigation."""
from html import escape
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]
# GitHub Pages caches shared resources. Change their URLs when an asset changes.
ASSET_VERSION = str(max(path.stat().st_mtime_ns for path in (ROOT / 'assets').rglob('*') if path.is_file()))
PAGES = {
    'about': ('index.html', '个人简介'),
    'education': ('education.html', '教育经历'),
    'publications': ('publications.html', '学术成果'),
    'projects': ('projects.html', '科研项目'),
    'awards': ('awards.html', '奖励荣誉'),
    'skills': ('skills.html', '研究技能'),
    'service': ('service.html', '经历与服务'),
    'cv': ('cv.html', '完整简历'),
}
def contacts(include_cv=False):
    def icon(name):
        return f'<svg class="contact-icon" aria-hidden="true"><use href="assets/icons.svg#{name}"></use></svg>'
    cv_link = f'  <a href="cv.html" data-page-link="cv">{icon("document")}<span data-i18n="cv">完整简历</span></a>\n' if include_cv else ''
    return f'''<div class="contact-links">
  <a href="mailto:gutc@mail.bnu.edu.cn" data-email>{icon("mail")}<span>gutc@mail.bnu.edu.cn</span></a>
  <a id="scholar-link" href="https://scholar.google.com/citations?user=gLpuU54AAAAJ" target="_blank" rel="noopener">{icon("scholar")}<span>Google Scholar</span></a>
  <a id="orcid-link" href="https://orcid.org/0000-0001-9466-5545" target="_blank" rel="noopener">{icon("identity")}<span>ORCID</span></a>
  <a id="researchgate-link" href="https://www.researchgate.net/profile/Tianci-Gu-2" target="_blank" rel="noopener">{icon("network")}<span>ResearchGate</span></a>
{cv_link}</div>'''

HOME = f'''<section id="about" class="about-layout" aria-labelledby="home-title">
  <aside class="profile-sidebar">
    <figure class="portrait-block"><img src="assets/portrait.jpeg" width="150" height="191" alt="谷天赐 Tianci Gu" fetchpriority="high"></figure>
    <h2 id="profile-name">谷天赐 <span>Tianci Gu</span></h2>
    <div class="profile-institution"><img class="institution-seal" src="assets/bnu-seal.png" width="40" height="40" alt="北京师范大学 Beijing Normal University"><p id="profile-position" class="profile-position">北京师范大学地理科学学部<br>自然资源专业博士生</p></div>
    <details class="profile-contact"><summary data-i18n="contactDetails">联系方式与学术主页</summary>{contacts(include_cv=True)}</details>
  </aside>
  <div class="about-main">
    <h1 id="home-title" class="about-title" data-i18n="about">个人简介</h1>
    <div id="home-biography" class="home-biography"></div>
    <div id="home-metrics" class="home-metrics" aria-label="学术成果概览"></div>
    <div class="home-actions"><a class="primary-link" href="publications.html" data-selected-link data-i18n="viewSelected">查看精选成果</a><a href="cv.html" data-page-link="cv" data-i18n="viewCv">查看完整简历</a></div>
    <section id="education" class="home-education" aria-labelledby="education-title">
      <h2 id="education-title" data-i18n="education">教育经历</h2>
      <p class="page-lead" data-page-summary="education"></p>
      <div id="education-list" class="education-list"></div>
    </section>
    <h2 data-i18n="researchInterests">研究方向</h2><ul id="home-research" class="research-interests"></ul>
    <details id="research-map-panel" class="research-map-panel"><summary data-i18n="exploreMap">探索研究图谱</summary><p class="map-explanation" data-i18n="mapExplanation"></p><div id="research-map"></div><div id="map-paper-links" class="map-paper-links"></div></details>
    <div class="section-heading"><h2 data-i18n="selectedResearch">研究选读</h2><a href="publications.html" data-selected-link data-selected-count></a></div><div id="home-featured" class="featured-research"></div>
    <p class="more-selected"><a href="publications.html" data-selected-link data-selected-count></a></p>
    <h2 data-i18n="skills">方法与工具</h2><dl id="home-methods" class="home-methods"></dl>
    <h2 data-i18n="recentNews">近期动态</h2><ul id="home-news" class="news-list"></ul>
  </div>
</section>'''

CV_ABOUT = f'''<section id="about" class="about-section" aria-labelledby="profile-name">
  <div class="profile-header">
    <div class="profile-copy">
      <h1 id="profile-name">谷天赐 <span>Tianci Gu</span></h1>
      <p id="profile-position" class="profile-position">北京师范大学地理科学学部<br>自然资源专业博士生</p>
      <p id="profile-bio" class="bio"></p>
      {contacts()}
    </div>
    <figure class="portrait-block"><img src="assets/portrait.jpeg" width="150" height="191" alt="谷天赐 Tianci Gu" fetchpriority="high"></figure>
  </div>
  <div id="biography" class="biography"></div>
  <div class="scholar-summary">
    <h2 data-i18n="academicMetrics">学术指标</h2>
    <table class="metrics-table"><thead><tr><th scope="col" data-i18n="metric">指标</th><th scope="col" data-i18n="total">总计</th><th scope="col" data-i18n="since2021">2021年至今</th></tr></thead><tbody id="metrics"></tbody></table>
    <p class="metrics-note" id="metrics-note"></p>
  </div>
  <div class="research-statement"><h2 data-i18n="researchDirection">研究方向</h2><div id="research-statement"></div></div>
  <details class="personal-details"><summary data-i18n="personal">个人信息</summary><dl id="personal-information"></dl></details>
</section>'''

def section(key, body):
    lead = f'<p class="page-lead" data-page-summary="{key}"></p>' if key in {'education','publications','projects','awards','service'} else ''
    return f'<section id="{key}" class="content-section" aria-labelledby="{key}-title"><h1 class="page-title" id="{key}-title" data-i18n="{key}">{PAGES[key][1]}</h1>{lead}{body}</section>'

SECTIONS = {
    'education': section('education', '<div class="education-list" id="education-list"></div>'),
    'publications': section('publications', '''<section id="publication-overview" class="data-overview journal-overview" aria-labelledby="publication-overview-title"><div class="ranking-heading"><h2 id="publication-overview-title" data-i18n="journalRanking">期刊分区</h2><span data-i18n="rankingEdition">2025版中科院大类分区</span></div><div class="ranking-layout"><div id="publication-ranking-chart"></div><div id="publication-ranking-legend" class="ranking-legend"></div></div><p id="publication-overview-note" class="overview-note"></p><details class="ranking-sources"><summary data-i18n="rankingSources">查看统计口径与来源</summary><p id="ranking-method"></p><div id="ranking-source-table" class="ranking-source-table"></div></details></section><div class="publication-tools" id="publication-browser"><div class="publication-filters" id="publication-filters" role="group" aria-label="论文分类筛选"></div>
      <div id="publication-topics" class="topic-filters" role="group" aria-label="研究主题筛选"></div><p id="publication-scope" class="publication-scope" hidden></p>
      <label class="search-label"><span class="visually-hidden" data-i18n="search">检索论文</span><input id="publication-search" type="search" placeholder="检索题名、作者或期刊" autocomplete="off"></label></div>
      <p class="result-count" id="publication-count" role="status" aria-live="polite"></p><div id="publication-list"></div>
      <p id="publication-empty" class="empty-message" hidden data-i18n="empty">没有符合条件的论文。</p>'''),
    'projects': section('projects', '<section id="project-overview" class="data-overview" aria-labelledby="project-overview-title"><h2 id="project-overview-title" data-i18n="projectOverview">项目概览</h2><div id="project-totals" class="overview-totals"></div><div id="project-bars" class="overview-bars"></div><p id="project-overview-note" class="overview-note"></p></section><div id="project-filter" class="project-filters" role="status" aria-live="polite"></div><div id="project-list" class="grouped-list"></div>'),
    'awards': section('awards', '<div id="award-list" class="grouped-list"></div>'),
    'skills': section('skills', '<dl id="skill-list" class="skills-list"></dl>'),
    'service': section('service', '<div id="service-list" class="service-list"></div>'),
}

FOOTER = '''<footer class="site-footer" id="site-footer">
    <div class="footer-inner">
      <div class="footer-main">
        <section class="footer-contact" aria-labelledby="footer-contact-title">
          <h2 id="footer-contact-title" data-i18n="footerContact">联系与交流</h2>
          <p id="footer-affiliation">北京师范大学地理科学学部</p>
          <a href="mailto:gutc@mail.bnu.edu.cn" data-email><span>gutc@mail.bnu.edu.cn</span></a>
        </section>
        <nav aria-labelledby="footer-academic-title">
          <h2 id="footer-academic-title" data-i18n="footerAcademic">学术主页</h2>
          <ul>
            <li><a id="footer-scholar-link" href="https://scholar.google.com/citations?user=gLpuU54AAAAJ" target="_blank" rel="noopener">Google Scholar</a></li>
            <li><a id="footer-orcid-link" href="https://orcid.org/0000-0001-9466-5545" target="_blank" rel="noopener">ORCID</a></li>
            <li><a id="footer-researchgate-link" href="https://www.researchgate.net/profile/Tianci-Gu-2" target="_blank" rel="noopener">ResearchGate</a></li>
          </ul>
        </nav>
        <nav aria-labelledby="footer-explore-title">
          <h2 id="footer-explore-title" data-i18n="footerExplore">站点导航</h2>
          <ul>
            <li><a href="publications.html" data-page-link="publications" data-i18n="publications">学术成果</a></li>
            <li><a href="cv.html" data-page-link="cv" data-i18n="cv">完整简历</a></li>
            <li><a href="https://github.com/sea993/CV_GUTIANCI" target="_blank" rel="noopener">GitHub</a></li>
          </ul>
        </nav>
      </div>
      <div class="footer-bottom">
        <p id="footer-copyright">© 2026 谷天赐</p>
        <p class="footer-host"><span data-i18n="footerHosted">托管于</span> <a href="https://pages.github.com/" target="_blank" rel="noopener">GitHub Pages</a></p>
        <a class="back-to-top" href="#top"><span data-i18n="backToTop">返回顶部</span><span aria-hidden="true">↑</span></a>
      </div>
    </div>
  </footer>'''

for key, (filename, title) in PAGES.items():
    nav = ''.join(
        f'<a href="{name}" data-page-link="{route}" data-i18n="{route}"'
        + (' aria-current="page"' if route == key else '')
        + f'>{label}</a>'
        for route, (name, label) in PAGES.items() if route not in {'education', 'skills'}
    )
    cv_sections = [
        value.replace('<h1 class="page-title"', '<h2 class="page-title"').replace('</h1>', '</h2>')
        for value in SECTIONS.values()
    ]
    # Overview charts belong on the browsing pages, not in the complete CV.
    cv_sections = [re.sub(r'<section id="(?:publication|project)-overview".*?</section>', '', value, flags=re.S) for value in cv_sections]
    body = HOME if key == 'about' else ''.join([CV_ABOUT, *cv_sections]) if key == 'cv' else SECTIONS[key]
    if key == 'education':
        body = f'''<section class="content-section"><h1 class="page-title">教育经历 Education</h1>
          <p><a href="index.html?lang=zh&amp;v={ASSET_VERSION}#education">在个人简介页查看教育经历</a></p>
          <p lang="en"><a href="index.html?lang=en&amp;v={ASSET_VERSION}#education">View education on the Personal Profile page</a></p></section>'''
    if key == 'cv':
        body = f'<div class="print-actions"><a href="assets/tianci-gu-cv.docx?v={ASSET_VERSION}" download data-i18n="downloadCv">下载Word简历</a><button type="button" id="print-cv" data-i18n="print">打印或保存PDF</button></div>' + body
    canonical = 'https://sea993.github.io/CV_GUTIANCI/' + ('' if key in {'about', 'education'} else filename)
    html = f'''<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="description" content="谷天赐，北京师范大学自然资源博士生，研究城市化生态效应与生物多样性保护。{escape(title)}。">
  <meta name="theme-color" content="#004da3">
  <meta property="og:title" content="谷天赐 {escape(title)}">
  <meta property="og:description" content="Tianci Gu, PhD student in Natural Resources at Beijing Normal University.">
  <meta property="og:type" content="website">
  <link rel="canonical" href="{canonical}">
  <link rel="icon" href="assets/favicon.svg" type="image/svg+xml">
  <link rel="stylesheet" href="assets/style.css?v={ASSET_VERSION}">
  <title>谷天赐 {escape(title)}</title>
  <script src="assets/content.js?v={ASSET_VERSION}" defer></script>
  <script src="assets/app.js?v={ASSET_VERSION}" defer></script>
</head>
<body id="top" data-page="{key}" data-asset-version="{ASSET_VERSION}">
  <a class="skip-link" href="#main" data-i18n="skip">跳到正文</a>
  <header class="site-header">
    <div class="header-inner">
      <a class="wordmark" href="index.html" data-page-link="about"><span lang="zh-CN" data-profile-name="zh">谷天赐</span><span class="wordmark-en" lang="en" data-profile-name="en">Tianci Gu</span></a>
      <div class="header-controls">
        <div class="language-switch" role="group" aria-label="语言选择 Language selection">
          <button type="button" data-language="zh" aria-pressed="true">中文</button>
          <button type="button" data-language="en" aria-pressed="false">English</button>
        </div>
        <button class="menu-button" type="button" aria-expanded="false" aria-controls="site-nav"><span class="menu-icon" aria-hidden="true">☰</span><span data-i18n="menu">导航</span></button>
      </div>
    </div>
    <nav class="site-nav" id="site-nav" aria-label="主要导航">{nav}</nav>
    <nav class="quick-nav" aria-label="快捷导航"><a href="index.html" data-page-link="about" data-i18n="profileShort"{' aria-current="page"' if key == 'about' else ''}>简介</a><a href="publications.html" data-page-link="publications" data-i18n="publications"{' aria-current="page"' if key == 'publications' else ''}>学术成果</a><a href="projects.html" data-page-link="projects" data-i18n="projectsShort"{' aria-current="page"' if key == 'projects' else ''}>科研项目</a></nav>
  </header>
  <main id="main" class="page-shell">{body}<noscript><p>请开启JavaScript浏览网站内容，或<a href="assets/tianci-gu-cv.docx?v={ASSET_VERSION}">下载Word简历</a>。 Enable JavaScript to browse this site, or download the CV.</p></noscript></main>
  {FOOTER}
</body>
</html>
'''
    (ROOT / filename).write_text(html, encoding='utf-8')
print(f'Generated {len(PAGES)} pages, including the legacy education and skills redirects.')

"""Generate static section pages sharing a bilingual navigation."""
from html import escape
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
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
    cv_link = '  <a href="cv.html" data-page-link="cv" data-i18n="cv">完整简历</a>\n' if include_cv else ''
    return f'''<div class="contact-links">
  <a href="mailto:gutc@mail.bnu.edu.cn" data-email>gutc@mail.bnu.edu.cn</a>
  <a id="scholar-link" href="https://scholar.google.com/citations?user=gLpuU54AAAAJ" target="_blank" rel="noopener">Google Scholar</a>
  <a id="orcid-link" href="https://orcid.org/0000-0001-9466-5545" target="_blank" rel="noopener">ORCID</a>
  <a id="researchgate-link" href="https://www.researchgate.net/profile/Tianci-Gu-2" target="_blank" rel="noopener">ResearchGate</a>
{cv_link}</div>'''

HOME = f'''<section id="about" class="about-layout" aria-labelledby="home-title">
  <aside class="profile-sidebar">
    <figure class="portrait-block"><img src="assets/portrait.jpeg" width="150" height="191" alt="谷天赐 Tianci Gu" fetchpriority="high"></figure>
    <h2 id="profile-name">谷天赐 <span>Tianci Gu</span></h2>
    <p id="profile-position" class="profile-position">北京师范大学地理科学学部<br>自然资源专业博士生</p>
    {contacts(include_cv=True)}
  </aside>
  <div class="about-main">
    <h1 id="home-title" class="about-title" data-i18n="about">个人简介</h1>
    <div id="home-biography" class="home-biography"></div>
    <h2 data-i18n="researchInterests">研究兴趣</h2><ul id="home-research" class="plain-list"></ul>
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
    return f'<section id="{key}" class="content-section" aria-labelledby="{key}-title"><h1 class="page-title" id="{key}-title" data-i18n="{key}">{PAGES[key][1]}</h1>{body}</section>'

SECTIONS = {
    'education': section('education', '<div class="education-list" id="education-list"></div>'),
    'publications': section('publications', '''<div class="publication-tools"><div class="publication-filters" id="publication-filters" role="group" aria-label="论文分类筛选"></div>
      <label class="search-label"><span class="visually-hidden" data-i18n="search">检索论文</span><input id="publication-search" type="search" placeholder="检索题名、作者或期刊" autocomplete="off"></label></div>
      <p class="result-count" id="publication-count" role="status" aria-live="polite"></p><div id="publication-list"></div>
      <p id="publication-empty" class="empty-message" hidden data-i18n="empty">没有符合条件的论文。</p>'''),
    'projects': section('projects', '<div id="project-list" class="grouped-list"></div>'),
    'awards': section('awards', '<div id="award-list" class="grouped-list"></div>'),
    'skills': section('skills', '<dl id="skill-list" class="skills-list"></dl>'),
    'service': section('service', '<div id="service-list" class="service-list"></div>'),
}

for key, (filename, title) in PAGES.items():
    nav = ''.join(
        f'<a href="{name}" data-page-link="{route}" data-i18n="{route}"'
        + (' aria-current="page"' if route == key else '')
        + f'>{label}</a>'
        for route, (name, label) in PAGES.items() if route != 'skills'
    )
    cv_sections = [
        value.replace('<h1 class="page-title"', '<h2 class="page-title"').replace('</h1>', '</h2>')
        for value in SECTIONS.values()
    ]
    body = HOME if key == 'about' else ''.join([CV_ABOUT, *cv_sections]) if key == 'cv' else SECTIONS[key]
    if key == 'cv':
        body = '<div class="print-actions"><a href="assets/tianci-gu-cv.docx" download data-i18n="downloadCv">下载Word简历</a><button type="button" id="print-cv" data-i18n="print">打印或保存PDF</button></div>' + body
    canonical = 'https://sea993.github.io/CV_GUTIANCI/' + ('' if key == 'about' else filename)
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
  <link rel="stylesheet" href="assets/style.css">
  <title>谷天赐 {escape(title)}</title>
  <script src="assets/content.js" defer></script>
  <script src="assets/app.js" defer></script>
</head>
<body data-page="{key}">
  <a class="skip-link" href="#main" data-i18n="skip">跳到正文</a>
  <header class="site-header">
    <div class="header-inner">
      <a class="wordmark" href="index.html" data-page-link="about" data-profile-name>谷天赐</a>
      <div class="header-controls">
        <div class="language-switch" role="group" aria-label="语言选择 Language selection">
          <button type="button" data-language="zh" aria-pressed="true">中文</button>
          <button type="button" data-language="en" aria-pressed="false">English</button>
        </div>
        <button class="menu-button" type="button" aria-expanded="false" aria-controls="site-nav" data-i18n="menu">菜单</button>
      </div>
    </div>
    <nav class="site-nav" id="site-nav" aria-label="主要导航">{nav}</nav>
  </header>
  <main id="main" class="page-shell">{body}<noscript><p>请开启JavaScript浏览网站内容，或<a href="assets/tianci-gu-cv.docx">下载Word简历</a>。 Enable JavaScript to browse this site, or download the CV.</p></noscript></main>
</body>
</html>
'''
    (ROOT / filename).write_text(html, encoding='utf-8')
print(f'Generated {len(PAGES)} pages, including the legacy skills redirect.')

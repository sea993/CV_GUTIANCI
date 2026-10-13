const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {chromium} = require(process.env.PLAYWRIGHT_MODULE_PATH || 'playwright');
const root = path.resolve(__dirname, '..');
const base = process.env.SITE_URL || 'http://127.0.0.1:8765/';
const screenshots = path.join(root, 'temp', 'blue-review');
fs.mkdirSync(screenshots, {recursive:true});
const routes = {about:'index.html',publications:'publications.html',projects:'projects.html',awards:'awards.html',service:'service.html',cv:'cv.html'};

(async () => {
  const browser = await chromium.launch({headless:true, ...(process.env.BROWSER_CHANNEL ? {channel:process.env.BROWSER_CHANNEL} : {})});
  const errors = [], failedRequests = [];
  let checks = 0;
  const page = await browser.newPage({viewport:{width:1280,height:1000},acceptDownloads:true});
  page.on('pageerror', error => errors.push(error.message));
  page.on('response', response => { if (response.status() >= 400) failedRequests.push(response.status() + ' ' + response.url()); });
  const check = (condition, message) => { assert(condition, message); checks++; };
  const go = async (key, language='zh') => {
    const response = await page.goto(new URL(routes[key] + '?lang=' + language,base).href,{waitUntil:'load'});
    check(response.status() === 200, key + ' did not load');
    check(await page.locator('html').getAttribute('lang') === (language==='zh'?'zh-CN':'en'), key + ' language is incorrect');
  };
  try {
    await go('about');
    check(await page.locator('.full-biography,#home-short-bio').count() === 0, 'The removed short or collapsed profile returned');
    check(await page.locator('#home-biography').isVisible(), 'The detailed introduction should be directly visible');
    check(await page.locator('.home-metrics a').count() === 4, 'The homepage evidence strip is incomplete');
    check(await page.locator('[data-selected-count]').allTextContents().then(values=>values.every(value=>value.includes('11'))), 'Selected publication links have a stale count');
    check(await page.locator('#home-biography p').count() === 5, 'The homepage introduction is incomplete');
    check(await page.locator('.home-education .education-item').count() === 3, 'Education is missing below the homepage introduction');
    check(await page.locator('.home-education .education-scores').count() === 0, 'Education scores should remain in the full CV');
    const biography = await page.locator('#home-biography').innerText();
    check(biography.includes('1999年生') && biography.includes('山东巨野人') && biography.includes('中共党员'), 'The updated personal background is missing');
    check(biography.includes('1169次') && biography.includes('h指数20') && !/1076|h指数19|收录成果43/.test(biography), 'The confirmed citation metrics were not preserved');
    check(biography.includes('近程间接影响') && biography.includes('远程间接影响') && biography.includes('同等人口'), 'Research pathways and counterfactual plans are missing');
    check(await page.locator('#metrics,.personal-details,#research-statement').count() === 0, 'Detailed CV content remains on the homepage');
    check((await page.locator('#main [data-email]').innerText()) === 'gutc@mail.bnu.edu.cn', 'Email is incorrect');
    check((await page.locator('#main [data-email]').getAttribute('href')) === 'mailto:gutc@mail.bnu.edu.cn', 'Email link is incorrect');
    check((await page.locator('#scholar-link').getAttribute('href')).includes('gLpuU54AAAAJ'), 'Scholar profile link is incorrect');
    check(await page.locator('.contact-icon').count() === 5, 'Contact icons were removed during rendering');
    check(await page.locator('#home-featured .research-figure').count() === 3, 'The supplied selected research figures are missing');
    check(await page.locator('#home-featured figcaption').first().innerText().then(value=>value.includes('图形摘要')), 'The graphical abstract caption is missing');
    const imagePopup = page.waitForEvent('popup');
    await page.locator('#home-featured .research-image-link').first().click();
    const figurePage = await imagePopup;
    await figurePage.waitForLoadState('load');
    check((await figurePage.locator('img').evaluate(image=>image.naturalWidth)) === 3358, 'The graphical abstract cannot be opened at its source resolution');
    await figurePage.close();
    await page.locator('[data-language="en"]').click();
    check(await page.locator('.contact-icon').count() === 5, 'Language switching removed contact icons');
    check(await page.locator('#home-featured img').first().getAttribute('alt').then(value=>value.includes('Graphical abstract')), 'The research image lacks English alternative text');
    check(await page.locator('#home-title').innerText() === 'Personal Profile', 'The approved English profile label was not applied');
    await page.locator('#research-map-panel summary').click();
    check(await page.locator('.map-node').count() === 12, 'The compact research map is incomplete');
    await page.locator('.map-node[data-node="paper-2"]').focus();
    check(await page.locator('.map-edge.is-active').count() === 2, 'Keyboard focus does not reveal the paper topic and verified method');
    check(await page.locator('.map-node[data-node="paper-2"]').getAttribute('href') === 'https://doi.org/10.1016/j.eiar.2026.108631', 'Map paper does not link to its article');
    await page.locator('.map-node[data-node="urban-form"]').click();
    check(new URL(page.url()).searchParams.get('topic') === 'urban-form', 'Map topic does not open a filtered publication collection');
    check(await page.locator('.publication').count() === 11, 'The urban form collection is incomplete');
    await page.locator('[data-language="zh"]').click();
    check(new URL(page.url()).searchParams.get('topic') === 'urban-form', 'Language switching lost the topic');
    await page.locator('#publication-search').fill('bird');
    check(await page.locator('.publication').count() === 1, 'Topic and title search did not combine');
    await page.locator('[data-filter="selected"]').click();
    check(await page.locator('.publication').count() === 11 && await page.locator('#publication-search').inputValue() === '' && !new URL(page.url()).searchParams.has('topic'), 'Selected publications did not reset stale topic or query');
    await page.goBack();
    check(await page.locator('#publication-search').inputValue() === 'bird' && await page.locator('.publication').count() === 1, 'Browser Back did not restore the topic search');
    await page.locator('[data-language="en"]').click();
    await page.locator('#site-nav [data-page-link="projects"]').click();
    check(new URL(page.url()).pathname.endsWith('/projects.html') && new URL(page.url()).searchParams.get('lang')==='en', 'Navigation did not retain language');
    check(new URL(page.url()).searchParams.has('v'), 'Navigation can reuse a stale cached page');
    check((await page.locator('#project-list').innerText()).includes('Projects led'), 'Projects led was changed');
    check(!(await page.locator('#project-list').innerText()).includes('Responsibilities:'), 'Verbose project responsibilities remain on the project page');
    check(await page.locator('#project-totals strong').allTextContents().then(values=>values.join(',')==='15,4,11'), 'Project total and roles are incorrect');
    check(await page.locator('#project-bars strong').allTextContents().then(values=>values.join(',')==='4,1,3,3,4'), 'Project sources were counted incorrectly');
    await page.locator('#project-bars [data-project-filter="nsfc"]').click();
    check(await page.locator('#project-list li').count() === 4, 'NSFC project filtering failed');
    await page.locator('[data-language="zh"]').click();
    check(await page.locator('#project-list li').count() === 4, 'Language switching lost the project filter');
    await page.locator('#project-totals [data-project-filter="led"]').click();
    check(await page.locator('#project-list li').count() === 4, 'Led project filtering failed');
    await page.locator('#project-filter [data-project-filter="all"]').click();
    check(await page.locator('#project-list li').count() === 15, 'All projects were not restored');

    await go('publications','en');
    check(await page.locator('#publication-totals,#publication-bars').count() === 0, 'The rejected author-role overview returned');
    check(await page.locator('#publication-ranking-legend strong').allTextContents().then(values=>values.join(',')==='28,4,3,0'), 'The consistent JCR quartile distribution is incorrect');
    await page.locator('#publication-ranking-legend [data-tier="2"]').click();
    check(await page.locator('.publication').count() === 4 && await page.locator('#paper-20').count() === 0, 'JCR quartile filter includes non-published records');
    check(new URL(page.url()).searchParams.get('scope') === 'published', 'Published-journal scope is missing from the shareable URL');
    await page.reload();
    check(await page.locator('.publication').count() === 4 && new URL(page.url()).searchParams.get('tier') === '2', 'Reload lost publication ranking scope');
    await page.locator('[data-clear-scope]').click();
    check(await page.locator('.publication').count() === 48, 'Clearing ranking scope did not restore all records');
    await page.locator('#publication-ranking-chart [data-tier="top"]').click();
    check(await page.locator('.publication').count() === 32, 'The Q1 and Q2 total is incorrect');
    await page.locator('#chinese-journal-summary [data-tier="core"]').click();
    check(await page.locator('.publication').count() === 4 && await page.locator('.publication .journal-index').filter({hasText:'Chinese Core'}).count() === 4, 'Chinese Core filtering or labels are incorrect');
    await page.locator('#chinese-journal-summary [data-tier="cssci"]').click();
    check(await page.locator('.publication').evaluateAll(ps=>ps.map(p=>p.id).join(',')) === 'paper-51,paper-50', 'CSSCI includes an English or unverified record');
    await page.reload();
    check(await page.locator('.publication').count() === 2 && new URL(page.url()).searchParams.get('tier') === 'cssci', 'Reload lost Chinese indexing scope');
    await page.locator('[data-language="zh"]').click();
    check(await page.locator('#publication-scope').innerText().then(t=>t.includes('中文期刊收录')&&!t.includes('JCR')), 'Chinese indexing scope was mislabeled as JCR');
    check(await page.locator('.journal-index').filter({hasText:'中文核心'}).count() === 2, 'Chinese index labels did not translate');
    await page.locator('[data-language="en"]').click();
    await page.locator('[data-filter="selected"]').click();
    check(await page.locator('[data-filter="selected"]').getAttribute('aria-pressed') === 'true', 'Selected publications is not the initial view');
    check(await page.locator('.publication').evaluateAll(papers=>papers.map(paper=>paper.id).join(',')) === 'paper-1,paper-2,paper-3,paper-9,paper-10,paper-12,paper-16,paper-19,paper-17,paper-18,paper-20', 'The selected publication set or its role and journal order is incorrect');
    check(await page.locator('.publication-number').allTextContents().then(numbers=>numbers.length===11&&numbers.every((number,index)=>number===`${index+1}.`)), 'Selected publications are not numbered consecutively');
    check(await page.locator('#paper-1 .research-figure').count() === 1, 'The paper figure is missing on the publication page');
    check(await page.locator('.publication .research-figure').count() === 3, 'The supplied graphical abstracts are missing');
    check(await page.locator('.publication-title a').count() === 11, 'Publication titles do not link to their article pages');
    check(await page.locator('[data-filter="review"],.publication[data-status="review"],#paper-4,#paper-5,#paper-6').count() === 0, 'Under-review papers remain public');
    await page.locator('#publication-search').fill('What Factors Drove');
    check(await page.locator('.publication').count() === 1 && await page.locator('#paper-9').count() === 1, 'Search within selected publications failed');
    check(await page.locator('.publication-number').innerText()==='1.', 'Search did not restart publication numbering');
    await page.locator('[data-language="zh"]').click();
    check(await page.locator('[data-filter="selected"]').getAttribute('aria-pressed') === 'true' && await page.locator('.publication').count() === 1, 'Language switching discarded the selected search');
    await page.locator('#publication-search').fill('');
    await page.locator('[data-language="en"]').click();
    await page.locator('[data-filter="all"]').click();
    check(await page.locator('.publication').count() === 48, 'The complete publication list is missing records');
    check(await page.locator('.publication-number').allTextContents().then(numbers=>numbers.length===48&&numbers.every((number,index)=>number===`${index+1}.`)), 'The full publication list is not numbered consecutively');
    check(await page.locator('.publication').evaluateAll(papers=>papers.slice(0,5).map(paper=>paper.id).join(',')) === 'paper-1,paper-2,paper-3,paper-7,paper-9', 'The complete list still mixes author roles by year');
    await page.locator('[data-filter="corresponding"]').click();
    check(await page.locator('.publication').first().getAttribute('id') === 'paper-9', 'Earths Future is not first in corresponding-author publications');
    await page.locator('[data-language="zh"]').click();
    check(await page.locator('.publication').first().getAttribute('id') === 'paper-9', 'Language switching changed the corresponding-author order');
    await page.locator('[data-language="en"]').click();
    await page.locator('[data-filter="all"]').click();
    check(await page.locator('.publication .doi-link').count() === 46, 'The DOI links are incomplete');
    check(await page.locator('.doi-link').evaluateAll(links=>links.every(link=>link.href.startsWith('https://doi.org/10.')&&link.textContent==='DOI: '+link.href.replace('https://doi.org/','')&&link.target==='_blank'&&link.rel.includes('noopener'))), 'A DOI label, target or safe new-tab attribute is incorrect');
    check(await page.locator('.doi-pending').count() === 1 && await page.locator('.journal-link').count() === 1 && await page.locator('.paper-search-link').count() === 1, 'Unresolved DOI records are missing their labeled fallback links');
    check((await page.locator('#publication-list').innerText()).includes('64(03), 528-537'), 'Journal pagination is missing');
    await page.locator('#publication-search').fill('nonlinear cropland footprint');
    check(await page.locator('.publication').count() === 1, 'English title search failed');
    check(await page.locator('.publication').getAttribute('data-status') === 'published', 'Published manuscript misclassified');
    await page.locator('#publication-search').fill('');
    await page.locator('[data-filter="first"]').click();
    check(await page.locator('.publication').count() === 4 && await page.locator('#paper-7').count() === 1, 'First-author filter failed');
    await page.locator('[data-language="zh"]').click();
    check(await page.locator('.publication').count() === 4, 'Language switching discarded filter state');
    await page.locator('[data-filter="accepted"]').click();
    check(await page.locator('.publication').count() === 1, 'Accepted filter failed');
    await page.locator('[data-filter="first"]').click();
    check(await page.locator('.publication').count() === 4, 'First author filter failed');
    await page.locator('[data-filter="conference"]').click();
    check(await page.locator('.publication').count() === 2 && await page.locator('.publication[data-kind="conference"]').count() === 2, 'Conference abstracts are missing or mixed with journal articles');
    check(await page.locator('.publication-notes .status').allTextContents().then(values=>values.every(value=>value==='会议摘要')), 'Conference abstracts lack their type labels');
    await page.locator('[data-filter="all"]').click();
    await page.locator('#publication-search').fill('谷歌地球引擎');
    check(await page.locator('.publication').count() === 1, 'Chinese title search failed');
    await page.locator('#publication-search').fill('长江经济带三大城市群');
    check(await page.locator('.publication').count() === 2, 'The two Yangtze River Economic Belt papers are missing');
    await page.locator('#publication-search').fill('全球生态系统健康');
    check(await page.locator('.publication').count() === 1 && await page.locator('#paper-51').count() === 1, 'The Chinese ecosystem health paper is missing');
    await page.locator('#publication-search').fill('<img src=x onerror=alert(1)>');
    check(await page.locator('.publication').count() === 0 && await page.locator('#publication-empty').isVisible(), 'Empty search message failed');
    check(await page.evaluate(()=>{
      const bottom=document.querySelector('.site-footer').getBoundingClientRect().bottom+scrollY;
      return bottom>=innerHeight-2&&Math.abs(bottom-document.documentElement.scrollHeight)<2;
    }), 'The footer does not reach the end of the page');

    await go('cv');
    check(await page.locator('#publication-list .research-figure').count() === 0, 'Research thumbnails were included in the printable CV');
    check(await page.locator('.education-item').count() === 3, 'Education is incomplete in the CV');
    check(await page.locator('#education .page-lead').innerText().then(value=>value.trim().length>0), 'The education summary was lost from the CV');
    check(await page.locator('.education-scores').count() === 3, 'Education scores were lost from the CV');
    check(await page.locator('#skill-list dt').count() === 5, 'Concise skills are missing from the CV');
    check((await page.locator('#metrics').innerText()).includes('1,169') && (await page.locator('#metrics').innerText()).includes('1,165'), 'Citation counts are incorrect');
    check(await page.locator('#metrics tr:nth-child(2) td').allTextContents().then(values=>values.every(value=>value==='20')), 'h-index is incorrect');
    check(await page.locator('#metrics tr:nth-child(3) td').allTextContents().then(values=>values.every(value=>value==='26')), 'i10-index is incorrect');
    check((await page.locator('#project-list').innerText()).includes('RMB') === false, 'Unexpected English text in the Chinese CV');
    await page.locator('.personal-details summary').click();
    check((await page.locator('#personal-information').innerText()).includes('18366013097'), 'Personal details are inaccessible');
    const downloadEvent = page.waitForEvent('download');
    await page.locator('.print-actions a[download]').click();
    const download = await downloadEvent;
    check(fs.readFileSync(await download.path()).equals(fs.readFileSync(path.join(root,'assets/tianci-gu-cv.docx'))), 'Downloaded CV differs from the latest download file');
    await page.locator('[data-filter="first"]').click();
    await page.evaluate(()=>window.dispatchEvent(new Event('beforeprint')));
    check(await page.locator('.publication').count() === 48, 'Print omitted filtered papers');
    check(await page.locator('.publication-number').allTextContents().then(numbers=>numbers.length===48&&numbers.every((number,index)=>number===`${index+1}.`)), 'Print omitted or reordered publication numbers');
    check(await page.locator('.publication').evaluateAll(papers=>papers.slice(0,5).map(paper=>paper.id).join(',')) === 'paper-1,paper-2,paper-3,paper-7,paper-9', 'The printable CV has a different publication order');
    await page.evaluate(()=>window.dispatchEvent(new Event('afterprint')));
    check(await page.locator('.publication').count() === 4, 'Print cleanup lost filter state');
    await page.locator('[data-filter="all"]').click();
    await page.locator('#education').screenshot({path:path.join(screenshots,'cv-education-zh.png')});
    await page.locator('#skills').screenshot({path:path.join(screenshots,'cv-skills-zh.png')});
    await page.emulateMedia({media:'print'});
    check(!await page.locator('.site-header').isVisible(), 'Print includes navigation');
    check(!await page.locator('.site-footer').isVisible(), 'Print includes the website footer');
    await page.emulateMedia({media:'screen'});
    await go('cv','en');
    check((await page.locator('#project-list').innerText()).includes('RMB 600,000'), 'Project funding was lost from the full CV');

    const viewports = [1920,1280,768,390,375,320];
    for (const width of viewports) {
      await page.setViewportSize({width,height:1000});
      for (const language of ['zh','en']) {
        for (const key of Object.keys(routes)) {
          await go(key,language);
          if (key==='about' || key==='publications') {
            await page.locator('img').evaluateAll(images=>{images.forEach(image=>{image.loading='eager';});return Promise.all(images.map(image=>image.decode()));});
            check(await page.locator('img').evaluateAll(images=>images.every(image=>image.complete&&image.naturalWidth>0)), 'Research image failed to load: '+key);
          }
          const body = await page.locator('#main').innerText();
          check(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth), 'Horizontal overflow: ' + key + ' ' + language + ' ' + width);
          check(await page.locator('footer').count() === 1 && await page.locator('.site-footer').isVisible(), 'The shared footer is missing: '+key);
          check(await page.locator('#updated-label').count() === 0, 'The rejected update-date block returned');
          check(await page.locator('.site-footer [data-email]').getAttribute('href') === 'mailto:gutc@mail.bnu.edu.cn', 'The footer email is incorrect');
          check(await page.locator('#footer-scholar-link').getAttribute('href') === 'https://scholar.google.com/citations?user=gLpuU54AAAAJ&hl='+(language==='zh'?'zh-CN':'en'), 'The footer Scholar profile or language is incorrect');
          check(await page.locator('#footer-orcid-link').getAttribute('href') === 'https://orcid.org/0000-0001-9466-5545', 'The footer ORCID link is incorrect');
          check(await page.locator('#footer-researchgate-link').getAttribute('href') === 'https://www.researchgate.net/profile/Tianci-Gu-2', 'The footer ResearchGate link is incorrect');
          check(await page.locator('#footer-contact-title').innerText() === (language==='zh'?'联系与交流':'Contact'), 'The footer language is incorrect');
          check(await page.locator('#footer-copyright').innerText() === '© '+new Date().getFullYear()+' '+(language==='zh'?'谷天赐':'Tianci Gu'), 'The footer attribution is incorrect');
          check(await page.locator('.site-footer [data-page-link]').evaluateAll((links,lang)=>links.every(link=>new URL(link.href).searchParams.get('lang')===lang&&new URL(link.href).searchParams.get('v')===document.body.dataset.assetVersion),language), 'Footer navigation lost the language or current version');
          check(await page.locator('#main > section').count() === (key==='cv'?7:1), 'Independent page contains other sections: '+key);
          check(await page.locator('h1').count() === 1, 'Multiple primary headings: '+key);
          if (['publications','projects','awards','service'].includes(key)) {
            check(await page.locator('.page-title + .page-lead').count()===1, 'The page summary is not immediately below the title: '+key);
            check(await page.locator('.page-lead').innerText().then(value=>value.trim().length>0), 'The page summary is empty: '+key+' '+language);
          }
          check(await page.evaluate(()=>[...document.querySelectorAll('script[src]')].every(script=>new URL(script.src).searchParams.get('v')===document.body.dataset.assetVersion)), 'Shared scripts are not versioned consistently: '+key);
          check(await page.locator('#site-nav [aria-current="page"]').getAttribute('data-page-link') === key, 'Active navigation is incorrect: '+key);
          check(await page.locator('#site-nav [data-page-link="skills"],#site-nav [data-page-link="education"]').count() === 0, 'A CV section remains in navigation');
          check(!/我|本人|\b(?:I|my|myself|we|our)\b/i.test(body), 'First-person copy remains: '+key);
          check(!body.includes('gutc@cug.edu.cn'), 'Old email remains: '+key);
          check(await page.evaluate(()=>getComputedStyle(document.documentElement).getPropertyValue('--accent').trim()==='#004da3'), 'The logo blue is incorrect');
          check(await page.evaluate(()=>[...document.querySelectorAll('.portrait-block,.education-item,.service-entry,.metrics-table th,.metrics-table td')].every(el=>parseFloat(getComputedStyle(el).borderLeftWidth)===0&&parseFloat(getComputedStyle(el).borderRightWidth)===0)), 'Decorative vertical rules remain');
          if (key==='publications' || key==='cv') {
            check(await page.locator('.publication').count()===(key==='publications'?11:48),'Publications missing');
            check(await page.locator('.doi-link').count()===(key==='publications'?10:46),'DOI links missing at this viewport');
            check(await page.locator('.doi-pending').count()===1,'Pending DOI labels missing at this viewport');
            check(await page.locator('.publication[data-status="review"],#paper-4,#paper-5,#paper-6').count()===0,'Under-review papers remain visible');
            check(!/唯一第一作者|Sole first author|Nature旗下期刊|中科院一区|IF 8\.8|谷天赐的贡献/.test(await page.locator('#publication-list').innerText()),'Unwanted publication labels remain');
            check(await page.locator('.contribution,.paper-meta').count()===0,'Publication metadata blocks remain');
          }
          if (key==='projects') check(await page.locator('#project-list li').count()===15,'Projects missing');
          if (key==='awards') check(await page.locator('#award-list li').count()===23,'Awards missing');
          if (key==='service') {
            check(await page.locator('.service-entry').count()===12,'Service entries missing');
            check((await page.locator('.policy-list').innerText()).includes('·') && !body.includes('政策建议成果：'),'Policy entry has incorrect formatting');
          }
          if (width===1280) await page.screenshot({path:path.join(screenshots,key+'-'+language+'-desktop.png'),fullPage:['about','awards','service'].includes(key)});
          if (width===390) await page.screenshot({path:path.join(screenshots,key+'-'+language+'-mobile.png'),fullPage:key==='about'});
          if (width===1280 && key==='service' && language==='zh') await page.locator('.service-group').filter({has:page.locator('.policy-list')}).screenshot({path:path.join(screenshots,'policy-zh.png')});
          if ([1280,390].includes(width) && key==='about') {
            await page.locator('.site-footer').screenshot({path:path.join(screenshots,'footer-'+language+'-'+width+'.png')});
            await page.evaluate(()=>scrollTo(0,document.documentElement.scrollHeight));
            await page.screenshot({path:path.join(screenshots,'footer-context-'+language+'-'+width+'.png')});
            await page.locator('.back-to-top').click();
            check(await page.evaluate(()=>scrollY<2) && new URL(page.url()).hash==='#top', 'The return-to-top link failed');
          }
        }
      }
    }
    await go('about','en');
    check(await page.locator('.quick-nav').isVisible(), 'Persistent mobile shortcuts are missing');
    check(await page.locator('.profile-contact').getAttribute('open') === null, 'Mobile contact information consumes the first screen');
    await page.locator('.menu-button').click();
    await page.keyboard.press('Escape');
    check(await page.locator('.menu-button').getAttribute('aria-expanded')==='false', 'Escape does not close the mobile menu');
    await page.locator('.menu-button').click();
    check(await page.locator('#site-nav').isVisible(),'Mobile menu did not open');
    await page.locator('#site-nav [data-page-link="cv"]').click();
    check(await page.locator('.menu-button').getAttribute('aria-expanded')==='false','Mobile menu did not close');
    await page.locator('.site-footer [data-page-link="publications"]').click();
    check(new URL(page.url()).pathname.endsWith('/publications.html') && new URL(page.url()).searchParams.get('lang')==='en', 'Footer navigation did not retain English');
    check(new URL(page.url()).searchParams.get('v')===await page.locator('body').getAttribute('data-asset-version'), 'Footer navigation loaded an outdated page');
    for (const width of [1280,390]) {
      await page.setViewportSize({width,height:1000});
      for (const language of ['zh','en']) {
        for (const legacyPath of ['education.html?lang='+language, '?lang='+language+'#education']) {
          await page.goto(new URL(legacyPath,base).href,{waitUntil:'load'});
          await page.waitForURL(url=>(url.pathname.endsWith('/index.html')||url.pathname.endsWith('/'))&&url.searchParams.get('lang')===language&&url.hash==='#education');
          check(await page.locator('.education-item').count()===3,'The legacy education link lost education records');
          check(await page.locator('html').getAttribute('lang')===(language==='zh'?'zh-CN':'en'),'The education redirect lost the language');
          check(await page.locator('#site-nav [aria-current="page"]').getAttribute('data-page-link')==='about','The education redirect did not activate the About navigation');
          if (legacyPath.startsWith('education.html')) check(new URL(page.url()).searchParams.get('v')===await page.locator('body').getAttribute('data-asset-version'),'The education redirect did not update the asset version');
          check(await page.evaluate(()=>document.querySelector('#education-title').getBoundingClientRect().top>=document.querySelector('.site-header').getBoundingClientRect().bottom&&document.querySelector('#education-title').getBoundingClientRect().bottom<innerHeight),'The education heading is hidden after redirect');
        }
        await page.screenshot({path:path.join(screenshots,'education-on-home-'+language+'-'+width+'.png')});
      }
    }
    await page.goto(new URL('skills.html?lang=en',base).href,{waitUntil:'load'});
    await page.waitForURL(url=>url.pathname.endsWith('/cv.html')&&url.searchParams.get('lang')==='en'&&url.hash==='#skills');
    check(await page.locator('#skill-list dt').count()===5,'Legacy skills route did not redirect to CV');
    await page.goto(new URL('?lang=zh#projects',base).href,{waitUntil:'load'});
    await page.waitForURL(url=>url.pathname.endsWith('/projects.html')&&url.searchParams.get('lang')==='zh');
    check(await page.locator('#project-list li').count()===15,'Legacy project route did not redirect');
    check(errors.length===0,'JavaScript errors: '+errors.join('; '));
    check(failedRequests.length===0,'Failed requests: '+failedRequests.join('; '));
    const report={status:'PASS',checks,pages:Object.keys(routes),viewports,base,javascriptErrors:errors,failedRequests};
    fs.writeFileSync(path.join(screenshots,'browser-verification.json'),JSON.stringify(report,null,2));
    process.stdout.write(JSON.stringify(report));
  } finally { await browser.close(); }
})().catch(error=>{process.stderr.write(error.stack);process.exitCode=1;});

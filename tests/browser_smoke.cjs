const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {chromium} = require(process.env.PLAYWRIGHT_MODULE_PATH || 'playwright');
const root = path.resolve(__dirname, '..');
const base = process.env.SITE_URL || 'http://127.0.0.1:8765/';
const screenshots = path.join(root, 'temp', 'blue-review');
fs.mkdirSync(screenshots, {recursive:true});
const routes = {about:'index.html',education:'education.html',publications:'publications.html',projects:'projects.html',awards:'awards.html',service:'service.html',cv:'cv.html'};

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
    check(await page.locator('#home-biography p').count() === 2, 'The homepage introduction is incomplete');
    check(await page.locator('#metrics,.personal-details,#research-statement').count() === 0, 'Detailed CV content remains on the homepage');
    check((await page.locator('[data-email]').innerText()) === 'gutc@mail.bnu.edu.cn', 'Email is incorrect');
    check((await page.locator('[data-email]').getAttribute('href')) === 'mailto:gutc@mail.bnu.edu.cn', 'Email link is incorrect');
    check((await page.locator('#scholar-link').getAttribute('href')).includes('gLpuU54AAAAJ'), 'Scholar profile link is incorrect');
    await page.locator('[data-language="en"]').click();
    await page.locator('#site-nav [data-page-link="projects"]').click();
    check(new URL(page.url()).pathname.endsWith('/projects.html') && new URL(page.url()).searchParams.get('lang')==='en', 'Navigation did not retain language');
    check((await page.locator('#project-list').innerText()).includes('Projects led'), 'Projects led was changed');
    check(!(await page.locator('#project-list').innerText()).includes('Responsibilities:'), 'Verbose project responsibilities remain on the project page');

    await go('publications','en');
    check((await page.locator('#publication-list').innerText()).includes('64(03), 528-537'), 'Journal pagination is missing');
    await page.locator('#publication-search').fill('Metros for Meadows');
    check(await page.locator('.publication').count() === 1, 'English title search failed');
    check(await page.locator('.publication').getAttribute('data-status') === 'review', 'Reviewed manuscript misclassified');
    await page.locator('#publication-search').fill('');
    await page.locator('[data-filter="review"]').click();
    check(await page.locator('.publication').count() === 3, 'Review filter failed');
    await page.locator('[data-language="zh"]').click();
    check(await page.locator('.publication').count() === 3, 'Language switching discarded filter state');
    await page.locator('[data-filter="accepted"]').click();
    check(await page.locator('.publication').count() === 1, 'Accepted filter failed');
    await page.locator('[data-filter="first"]').click();
    check(await page.locator('.publication').count() === 7, 'First author filter failed');
    await page.locator('[data-filter="all"]').click();
    await page.locator('#publication-search').fill('谷歌地球引擎');
    check(await page.locator('.publication').count() === 1, 'Chinese title search failed');
    await page.locator('#publication-search').fill('<img src=x onerror=alert(1)>');
    check(await page.locator('.publication').count() === 0 && await page.locator('#publication-empty').isVisible(), 'Empty search message failed');

    await go('cv');
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
    await page.locator('[data-filter="review"]').click();
    await page.evaluate(()=>window.dispatchEvent(new Event('beforeprint')));
    check(await page.locator('.publication').count() === 31, 'Print omitted filtered papers');
    await page.evaluate(()=>window.dispatchEvent(new Event('afterprint')));
    check(await page.locator('.publication').count() === 3, 'Print cleanup lost filter state');
    await page.locator('[data-filter="all"]').click();
    await page.locator('#education').screenshot({path:path.join(screenshots,'cv-education-zh.png')});
    await page.locator('#skills').screenshot({path:path.join(screenshots,'cv-skills-zh.png')});
    await page.emulateMedia({media:'print'});
    check(!await page.locator('.site-header').isVisible(), 'Print includes navigation');
    await page.emulateMedia({media:'screen'});
    await go('cv','en');
    check((await page.locator('#project-list').innerText()).includes('RMB 600,000'), 'Project funding was lost from the full CV');

    const viewports = [1920,1280,768,390,375,320];
    for (const width of viewports) {
      await page.setViewportSize({width,height:1000});
      for (const language of ['zh','en']) {
        for (const key of Object.keys(routes)) {
          await go(key,language);
          const body = await page.locator('#main').innerText();
          check(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth), 'Horizontal overflow: ' + key + ' ' + language + ' ' + width);
          check(await page.locator('footer,#updated-label').count() === 0, 'Footer remains');
          check(await page.locator('#main > section').count() === (key==='cv'?7:1), 'Independent page contains other sections: '+key);
          check(await page.locator('h1').count() === 1, 'Multiple primary headings: '+key);
          check(await page.locator('#site-nav [aria-current="page"]').getAttribute('data-page-link') === key, 'Active navigation is incorrect: '+key);
          check(await page.locator('#site-nav [data-page-link="skills"]').count() === 0, 'Skills remains in navigation');
          check(!/我|本人|\b(?:I|my|myself|we|our)\b/i.test(body), 'First-person copy remains: '+key);
          check(!body.includes('gutc@cug.edu.cn'), 'Old email remains: '+key);
          check(await page.evaluate(()=>getComputedStyle(document.documentElement).getPropertyValue('--accent').trim()==='#004da3'), 'The logo blue is incorrect');
          check(await page.evaluate(()=>[...document.querySelectorAll('.portrait-block,.education-item,.service-entry,.metrics-table th,.metrics-table td')].every(el=>parseFloat(getComputedStyle(el).borderLeftWidth)===0&&parseFloat(getComputedStyle(el).borderRightWidth)===0)), 'Decorative vertical rules remain');
          if (key==='education') check(await page.locator('.education-item').count()===3 && await page.locator('.education-scores').count()===0,'Education page includes scores or omits education');
          if (key==='publications' || key==='cv') {
            check(await page.locator('.publication').count()===31,'Publications missing');
            check(!/唯一第一作者|Sole first author|Nature旗下期刊|中科院一区|IF 8\.8|谷天赐的贡献/.test(await page.locator('#publication-list').innerText()),'Unwanted publication labels remain');
            check(await page.locator('.contribution,.paper-meta').count()===0,'Publication metadata blocks remain');
          }
          if (key==='projects') check(await page.locator('#project-list li').count()===15,'Projects missing');
          if (key==='awards') check(await page.locator('#award-list li').count()===24,'Awards missing');
          if (key==='service') {
            check(await page.locator('.service-entry').count()===12,'Service entries missing');
            check((await page.locator('.policy-list').innerText()).includes('·') && !body.includes('政策建议成果：'),'Policy entry has incorrect formatting');
          }
          if (width===1280) await page.screenshot({path:path.join(screenshots,key+'-'+language+'-desktop.png'),fullPage:['about','education','awards','service'].includes(key)});
          if (width===390) await page.screenshot({path:path.join(screenshots,key+'-'+language+'-mobile.png'),fullPage:key==='about'});
          if (width===1280 && key==='service' && language==='zh') await page.locator('.service-group').filter({has:page.locator('.policy-list')}).screenshot({path:path.join(screenshots,'policy-zh.png')});
        }
      }
    }
    await go('about','en');
    await page.locator('.menu-button').click();
    check(await page.locator('#site-nav').isVisible(),'Mobile menu did not open');
    await page.locator('#site-nav [data-page-link="education"]').click();
    check(await page.locator('.menu-button').getAttribute('aria-expanded')==='false','Mobile menu did not close');
    await page.goto(new URL('skills.html?lang=en',base).href,{waitUntil:'load'});
    await page.waitForURL('**/cv.html?lang=en#skills');
    check(await page.locator('#skill-list dt').count()===5,'Legacy skills route did not redirect to CV');
    await page.goto(new URL('?lang=zh#projects',base).href,{waitUntil:'load'});
    await page.waitForURL('**/projects.html?lang=zh');
    check(await page.locator('#project-list li').count()===15,'Legacy project route did not redirect');
    check(errors.length===0,'JavaScript errors: '+errors.join('; '));
    check(failedRequests.length===0,'Failed requests: '+failedRequests.join('; '));
    const report={status:'PASS',checks,pages:Object.keys(routes),viewports,base,javascriptErrors:errors,failedRequests};
    fs.writeFileSync(path.join(screenshots,'browser-verification.json'),JSON.stringify(report,null,2));
    process.stdout.write(JSON.stringify(report));
  } finally { await browser.close(); }
})().catch(error=>{process.stderr.write(error.stack);process.exitCode=1;});

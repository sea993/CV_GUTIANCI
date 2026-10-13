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
    check(await page.locator('#home-biography p').count() === 5, 'The homepage introduction is incomplete');
    const biography = await page.locator('#home-biography').innerText();
    check(biography.includes('1999年生') && biography.includes('山东巨野人') && biography.includes('中共党员'), 'The updated personal background is missing');
    check(biography.includes('1169次') && biography.includes('h指数20') && !/1076|h指数19|收录成果43/.test(biography), 'The confirmed citation metrics were not preserved');
    check(biography.includes('近程间接影响') && biography.includes('远程间接影响') && biography.includes('同等人口'), 'Research pathways and counterfactual plans are missing');
    check(await page.locator('#metrics,.personal-details,#research-statement').count() === 0, 'Detailed CV content remains on the homepage');
    check((await page.locator('[data-email]').innerText()) === 'gutc@mail.bnu.edu.cn', 'Email is incorrect');
    check((await page.locator('[data-email]').getAttribute('href')) === 'mailto:gutc@mail.bnu.edu.cn', 'Email link is incorrect');
    check((await page.locator('#scholar-link').getAttribute('href')).includes('gLpuU54AAAAJ'), 'Scholar profile link is incorrect');
    check(await page.locator('.contact-icon').count() === 5, 'Contact icons were removed during rendering');
    check(await page.locator('#home-featured .research-figure').count() === 1, 'The selected research figure is missing');
    check(await page.locator('#home-featured figcaption').innerText().then(value=>value.includes('图形摘要')), 'The graphical abstract caption is missing');
    const imagePopup = page.waitForEvent('popup');
    await page.locator('#home-featured .research-image-link').click();
    const figurePage = await imagePopup;
    await figurePage.waitForLoadState('load');
    check((await figurePage.locator('img').evaluate(image=>image.naturalWidth)) === 3358, 'The graphical abstract cannot be opened at its source resolution');
    await figurePage.close();
    await page.locator('[data-language="en"]').click();
    check(await page.locator('.contact-icon').count() === 5, 'Language switching removed contact icons');
    check(await page.locator('#home-featured img').getAttribute('alt').then(value=>value.includes('Graphical abstract')), 'The research image lacks English alternative text');
    await page.locator('#site-nav [data-page-link="projects"]').click();
    check(new URL(page.url()).pathname.endsWith('/projects.html') && new URL(page.url()).searchParams.get('lang')==='en', 'Navigation did not retain language');
    check(new URL(page.url()).searchParams.has('v'), 'Navigation can reuse a stale cached page');
    check((await page.locator('#project-list').innerText()).includes('Projects led'), 'Projects led was changed');
    check(!(await page.locator('#project-list').innerText()).includes('Responsibilities:'), 'Verbose project responsibilities remain on the project page');

    await go('publications','en');
    check(await page.locator('#paper-1 .research-figure').count() === 1, 'The paper figure is missing on the publication page');
    check(await page.locator('.publication .research-figure').count() === 3, 'The supplied graphical abstracts are missing');
    check(await page.locator('[data-filter="review"],.publication[data-status="review"],#paper-4,#paper-5,#paper-6,#paper-7').count() === 0, 'Withdrawn papers remain public');
    check((await page.locator('#publication-list').innerText()).includes('64(03), 528-537'), 'Journal pagination is missing');
    await page.locator('#publication-search').fill('nonlinear cropland footprint');
    check(await page.locator('.publication').count() === 1, 'English title search failed');
    check(await page.locator('.publication').getAttribute('data-status') === 'published', 'Published manuscript misclassified');
    await page.locator('#publication-search').fill('');
    await page.locator('[data-filter="first"]').click();
    check(await page.locator('.publication').count() === 3, 'First-author filter failed');
    await page.locator('[data-language="zh"]').click();
    check(await page.locator('.publication').count() === 3, 'Language switching discarded filter state');
    await page.locator('[data-filter="accepted"]').click();
    check(await page.locator('.publication').count() === 1, 'Accepted filter failed');
    await page.locator('[data-filter="first"]').click();
    check(await page.locator('.publication').count() === 3, 'First author filter failed');
    await page.locator('[data-filter="all"]').click();
    await page.locator('#publication-search').fill('谷歌地球引擎');
    check(await page.locator('.publication').count() === 1, 'Chinese title search failed');
    await page.locator('#publication-search').fill('<img src=x onerror=alert(1)>');
    check(await page.locator('.publication').count() === 0 && await page.locator('#publication-empty').isVisible(), 'Empty search message failed');

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
    check(await page.locator('.publication').count() === 27, 'Print omitted filtered papers');
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
          if (key==='about' || key==='publications') {
            await page.locator('img').evaluateAll(images=>Promise.all(images.map(image=>image.decode())));
            check(await page.locator('img').evaluateAll(images=>images.every(image=>image.complete&&image.naturalWidth>0)), 'Research image failed to load: '+key);
          }
          const body = await page.locator('#main').innerText();
          check(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth), 'Horizontal overflow: ' + key + ' ' + language + ' ' + width);
          check(await page.locator('footer,#updated-label').count() === 0, 'Footer remains');
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
            check(await page.locator('.publication').count()===27,'Publications missing');
            check(await page.locator('.publication[data-status="review"],#paper-4,#paper-5,#paper-6,#paper-7').count()===0,'Withdrawn papers remain visible');
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
        }
      }
    }
    await go('about','en');
    await page.locator('.menu-button').click();
    check(await page.locator('#site-nav').isVisible(),'Mobile menu did not open');
    await page.locator('#site-nav [data-page-link="cv"]').click();
    check(await page.locator('.menu-button').getAttribute('aria-expanded')==='false','Mobile menu did not close');
    for (const width of [1280,390]) {
      await page.setViewportSize({width,height:1000});
      for (const language of ['zh','en']) {
        for (const legacyPath of ['education.html?lang='+language, '?lang='+language+'#education']) {
          await page.goto(new URL(legacyPath,base).href,{waitUntil:'load'});
          await page.waitForURL(url=>url.pathname.endsWith('/cv.html')&&url.searchParams.get('lang')===language&&url.hash==='#education');
          check(await page.locator('.education-item').count()===3,'The legacy education link lost education records');
          check(await page.locator('html').getAttribute('lang')===(language==='zh'?'zh-CN':'en'),'The education redirect lost the language');
          check(await page.locator('#site-nav [aria-current="page"]').getAttribute('data-page-link')==='cv','The education redirect did not activate the CV navigation');
          check(new URL(page.url()).searchParams.get('v')===await page.locator('body').getAttribute('data-asset-version'),'The education redirect did not update the asset version');
          check(await page.evaluate(()=>document.querySelector('#education-title').getBoundingClientRect().top>=document.querySelector('.site-header').getBoundingClientRect().bottom&&document.querySelector('#education-title').getBoundingClientRect().bottom<innerHeight),'The education heading is hidden after redirect');
        }
        await page.screenshot({path:path.join(screenshots,'education-in-cv-'+language+'-'+width+'.png')});
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

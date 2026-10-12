const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {chromium} = require(process.env.PLAYWRIGHT_MODULE_PATH || 'playwright');
const root = path.resolve(__dirname, '..');
const base = process.env.SITE_URL || 'http://127.0.0.1:8765/';
const screenshots = path.join(root, 'temp');
fs.mkdirSync(screenshots, {recursive:true});
const routes = {about:'index.html',education:'education.html',publications:'publications.html',projects:'projects.html',awards:'awards.html',skills:'skills.html',service:'service.html',cv:'cv.html'};

(async () => {
  const browser = await chromium.launch({headless:true, ...(process.env.BROWSER_CHANNEL ? {channel:process.env.BROWSER_CHANNEL} : {})});
  const errors = [];
  const failedRequests = [];
  let checks = 0;
  const page = await browser.newPage({viewport:{width:1440,height:1100},acceptDownloads:true});
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('response', (response) => { if (response.status() >= 400) failedRequests.push(response.status() + ' ' + response.url()); });
  const check = (condition, message) => { assert(condition, message); checks++; };
  const go = async (key, language = 'zh') => {
    const response = await page.goto(new URL(routes[key] + '?lang=' + language, base).href, {waitUntil:'load'});
    check(response.status() === 200, key + ' did not load');
    await page.locator('h1').waitFor();
    check(await page.locator('html').getAttribute('lang') === (language === 'zh' ? 'zh-CN' : 'en'), key + ' language is incorrect');
  };
  const noOverflow = async () => check(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), 'Horizontal overflow at ' + page.url());
  try {
    await go('about');
    check(await page.locator('#main > section').count() === 1, 'The homepage still combines all sections');
    check(await page.locator('.metrics-table tbody tr').count() === 3, 'Scholar metrics are incomplete');
    check((await page.locator('#metrics').innerText()).includes('1,169') && (await page.locator('#metrics').innerText()).includes('1,165'), 'Citation counts are incorrect');
    check(await page.locator('#metrics tr:nth-child(2) td').allTextContents().then(values => values.every(value => value === '20')), 'h-index is incorrect');
    check(await page.locator('#metrics tr:nth-child(3) td').allTextContents().then(values => values.every(value => value === '26')), 'i10-index is incorrect');
    check((await page.locator('#scholar-link').getAttribute('href')).includes('gLpuU54AAAAJ'), 'Scholar profile link is incorrect');
    check((await page.locator('#research-statement').innerText()).includes('同等人口、不同空间形态'), 'Counterfactual research plan is missing');
    check(!/43项|45项|1076|1,076/.test(await page.locator('#main').innerText()), 'Obsolete profile metrics remain');
    await page.screenshot({path:path.join(screenshots, 'desktop-zh.png'),fullPage:true});
    await page.locator('.personal-details summary').click();
    check((await page.locator('#personal-information').innerText()).includes('18366013097'), 'Phone is not accessible');
    const downloadEvent = page.waitForEvent('download');
    await page.locator('.contact-links a[download]').click();
    const download = await downloadEvent;
    check(fs.readFileSync(await download.path()).equals(fs.readFileSync(path.join(root, 'assets/tianci-gu-cv.docx'))), 'Downloaded CV differs from supplied CV');

    await page.locator('[data-language="en"]').click();
    check(await page.locator('html').getAttribute('lang') === 'en', 'English switch failed');
    await page.screenshot({path:path.join(screenshots, 'desktop-en.png'),fullPage:true});
    await page.locator('#site-nav [data-page-link="projects"]').click();
    check(new URL(page.url()).pathname.endsWith('/projects.html') && new URL(page.url()).searchParams.get('lang') === 'en', 'Navigation did not retain language');
    check((await page.locator('#project-list').innerText()).includes('Projects led'), 'Projects led was changed');
    check((await page.locator('#project-list').innerText()).includes('RMB 600,000'), 'Project funding is missing');
    await page.screenshot({path:path.join(screenshots, 'projects-en.png')});

    await go('publications', 'en');
    check((await page.locator('#publication-list').innerText()).includes('64(03), 528-537'), 'Journal pagination is missing');
    await page.locator('#publication-search').fill('Metros for Meadows');
    check(await page.locator('.publication').count() === 1, 'Title search failed');
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
    check(await page.locator('.publication').count() === 0 && await page.locator('#publication-empty').isVisible(), 'Empty results message failed');
    await page.locator('#publication-search').fill('');
    await page.screenshot({path:path.join(screenshots, 'publications-zh.png')});

    await go('cv');
    await page.locator('[data-filter="review"]').click();
    await page.evaluate(() => window.dispatchEvent(new Event('beforeprint')));
    check(await page.locator('.publication').count() === 31, 'Printing excluded filtered papers');
    check(await page.locator('.personal-details').getAttribute('open') !== null, 'Printing omitted personal information');
    await page.evaluate(() => window.dispatchEvent(new Event('afterprint')));
    check(await page.locator('.publication').count() === 3, 'Print cleanup discarded filter state');
    check(await page.locator('h1').count() === 1, 'The full CV has multiple primary headings');
    await page.locator('[data-filter="all"]').click();
    await page.emulateMedia({media:'print'});
    check(!await page.locator('.site-header').isVisible(), 'Print output includes navigation');
    await page.emulateMedia({media:'screen'});

    for (const width of [1440,768,390,320]) {
      await page.setViewportSize({width,height:1000});
      for (const language of ['zh','en']) {
        for (const key of Object.keys(routes)) {
          await go(key, language);
          await noOverflow();
          check(await page.locator('#main > section').count() === (key === 'cv' ? 7 : 1), key + ' contains other sections');
          check(await page.locator('#site-nav [aria-current="page"]').getAttribute('data-page-link') === key, key + ' navigation marker is incorrect');
          if (key === 'education') check(await page.locator('.education-item').count() === 3, 'Education records missing');
          if (key === 'publications') check(await page.locator('.publication').count() === 31, 'Publication records missing');
          if (key === 'projects') check(await page.locator('#project-list li').count() === 15, 'Project records missing');
          if (key === 'awards') check(await page.locator('#award-list li').count() === 24, 'Awards missing');
          if (key === 'skills') check(await page.locator('.skill h2').count() === 5 && await page.locator('.skill p').count() === 5, 'Skill labels and descriptions are incomplete');
          if (key === 'service') check(await page.locator('.service-entry').count() === 12, 'Experience records missing');
          check(await page.locator('.section-number, .section-caption').count() === 0, 'Decorative section labels remain');
          check(await page.evaluate(() => [...document.querySelectorAll('.portrait-block,.education-item,.service-entry,.metrics-table th,.metrics-table td')].every(element => parseFloat(getComputedStyle(element).borderLeftWidth) === 0 && parseFloat(getComputedStyle(element).borderRightWidth) === 0)), 'Decorative vertical rules remain');
          check(!/[·/↗]/.test(await page.locator('.header-controls').innerText()), 'Decorative control separators remain');
          if (width === 390 && key === 'about') await page.screenshot({path:path.join(screenshots, 'mobile-' + language + '.png'),fullPage:true});
          if (width === 1440 && language === 'zh' && ['education','skills','service'].includes(key)) await page.screenshot({path:path.join(screenshots, key + '-zh.png')});
        }
      }
    }
    await go('about', 'en');
    await page.locator('.menu-button').click();
    check(await page.locator('#site-nav').isVisible(), 'Mobile menu did not open');
    await page.locator('#site-nav [data-page-link="projects"]').click();
    check(await page.locator('.menu-button').getAttribute('aria-expanded') === 'false', 'Mobile menu did not close');
    await page.reload({waitUntil:'load'});
    check(await page.locator('html').getAttribute('lang') === 'en', 'Reload lost language');
    await page.goto(new URL('index.html',base).href, {waitUntil:'load'});
    check(await page.locator('html').getAttribute('lang') === 'en', 'Language preference was not retained');
    await page.goto(new URL('?lang=zh#projects',base).href, {waitUntil:'load'});
    await page.waitForURL('**/projects.html?lang=zh');
    check(await page.locator('#project-list li').count() === 15, 'Legacy section links did not redirect');
    check(errors.length === 0, 'JavaScript errors: ' + errors.join('; '));
    check(failedRequests.length === 0, 'Failed requests: ' + failedRequests.join('; '));
    const report = {status:'PASS',checks,pages:Object.keys(routes),viewports:[1440,768,390,320],javascriptErrors:errors,failedRequests};
    fs.writeFileSync(path.join(screenshots, 'browser-verification.json'), JSON.stringify(report,null,2));
    process.stdout.write(JSON.stringify(report));
  } finally { await browser.close(); }
})().catch((error) => { process.stderr.write(error.stack); process.exitCode = 1; });

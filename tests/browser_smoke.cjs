const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {chromium} = require(process.env.PLAYWRIGHT_MODULE_PATH || 'playwright');
const root = path.resolve(__dirname, '..');
const base = process.env.SITE_URL || 'http://127.0.0.1:8765/';
const screenshots = path.join(root, 'temp');
fs.mkdirSync(screenshots, {recursive:true});

(async () => {
  const browser = await chromium.launch({headless:true, ...(process.env.BROWSER_CHANNEL ? {channel:process.env.BROWSER_CHANNEL} : {})});
  const errors = [];
  const failedRequests = [];
  let checks = 0;
  const page = await browser.newPage({viewport:{width:1440,height:1100},acceptDownloads:true});
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('response', (response) => { if (response.status() >= 400) failedRequests.push(`${response.status()} ${response.url()}`); });
  const check = (condition, message) => { assert(condition, message); checks++; };
  const noOverflow = async () => check(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), 'Horizontal overflow');
  try {
    const response = await page.goto(base, {waitUntil:'networkidle'});
    check(response.status() === 200, 'Home page is not served');
    check(await page.locator('.publication').count() === 31, 'Missing publications');
    check(await page.locator('#project-list li').count() === 15, 'Missing projects');
    check(await page.locator('#award-list li').count() === 24, 'Missing awards');
    check(await page.locator('.service-entry').count() === 12, 'Missing experience entries');
    await noOverflow();
    await page.screenshot({path:path.join(screenshots, 'desktop-zh.png')});
    await page.locator('.personal-details summary').click();
    check((await page.locator('#personal-information').innerText()).includes('18366013097'), 'Phone is not accessible');
    await page.locator('[data-language="en"]').click();
    check(await page.locator('html').getAttribute('lang') === 'en', 'English language not applied');
    check((await page.locator('#project-list').innerText()).includes('RMB 600,000'), 'English project funding is missing');
    check((await page.locator('#publication-list').innerText()).includes('64(03), 528-537'), 'Chinese journal pagination is missing');
    check((await page.locator('#skill-list').innerText()).includes('Data collection and organization: experienced'), 'Skill labels run into their descriptions');
    await noOverflow();
    await page.screenshot({path:path.join(screenshots, 'desktop-en.png')});
    await page.locator('#publication-search').fill('Metros for Meadows');
    check(await page.locator('.publication').count() === 1, 'Title search failed');
    check(await page.locator('.publication').getAttribute('data-status') === 'review', 'Reviewed manuscript misclassified');
    await page.locator('#publication-search').fill('');
    await page.locator('[data-filter="review"]').click();
    check(await page.locator('.publication').count() === 3, 'Review filter failed');
    await page.locator('[data-language="zh"]').click();
    check(await page.locator('.publication').count() === 3, 'Language switching discarded the selected filter');
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
    await page.locator('[data-filter="review"]').click();
    await page.evaluate(() => window.dispatchEvent(new Event('beforeprint')));
    check(await page.locator('.publication').count() === 31, 'Printing excluded filtered papers');
    check(await page.locator('.personal-details').getAttribute('open') !== null, 'Printing omitted personal information');
    await page.evaluate(() => window.dispatchEvent(new Event('afterprint')));
    check(await page.locator('.publication').count() === 3, 'Print cleanup discarded filter state');
    await page.locator('[data-filter="all"]').click();
    await page.locator('#publications').scrollIntoViewIfNeeded();
    await page.screenshot({path:path.join(screenshots, 'publications-zh.png')});
    const downloadEvent = page.waitForEvent('download');
    await page.locator('.contact-links a[download]').click();
    const download = await downloadEvent;
    const downloadedPath = await download.path();
    check(fs.readFileSync(downloadedPath).equals(fs.readFileSync(path.join(root, 'assets/tianci-gu-cv.docx'))), 'Downloaded CV differs from supplied CV');
    for (const width of [768,390,320]) {
      await page.setViewportSize({width,height:900});
      await page.goto(new URL('?lang=zh', base).href, {waitUntil:'networkidle'});
      await noOverflow();
      if (width === 390) {
        await page.screenshot({path:path.join(screenshots, 'mobile-zh.png')});
        await page.locator('.menu-button').click();
        check(await page.locator('#site-nav').isVisible(), 'Mobile menu did not open');
        await page.locator('#site-nav a[href="#projects"]').click();
        check(await page.locator('.menu-button').getAttribute('aria-expanded') === 'false', 'Mobile menu did not close');
      }
      await page.locator('[data-language="en"]').click();
      await noOverflow();
      if (width === 390) { await page.locator('#about').scrollIntoViewIfNeeded(); await page.screenshot({path:path.join(screenshots, 'mobile-en.png')}); }
    }
    await page.reload({waitUntil:'networkidle'});
    check(await page.locator('html').getAttribute('lang') === 'en', 'Language preference was not retained');
    check(errors.length === 0, `JavaScript errors: ${errors.join('; ')}`);
    check(failedRequests.length === 0, `Failed requests: ${failedRequests.join('; ')}`);
    const report = {status:'PASS',checks,viewports:[1440,768,390,320],javascriptErrors:errors,failedRequests};
    fs.writeFileSync(path.join(screenshots, 'browser-verification.json'), JSON.stringify(report,null,2));
    process.stdout.write(JSON.stringify(report));
  } finally { await browser.close(); }
})().catch((error) => { process.stderr.write(error.stack); process.exitCode = 1; });

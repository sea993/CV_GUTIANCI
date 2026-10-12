const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const content = JSON.parse(fs.readFileSync(path.join(root, 'assets/content.json'), 'utf8'));

test('the complete resume collections are present', () => {
  assert.equal(content.education.length, 3);
  assert.equal(content.publications.length, 31);
  assert.equal(content.projects.length, 15);
  assert.equal(content.awards.length, 24);
  assert.equal(content.skills.length, 5);
  assert.equal(content.services.length, 34);
});

test('every bilingual value has both Chinese and English text', () => {
  const inspect = (value) => {
    if (value === null || typeof value !== 'object') return;
    if (Object.hasOwn(value, 'zh') || Object.hasOwn(value, 'en')) {
      assert.equal(typeof value.zh, 'string');
      assert.equal(typeof value.en, 'string');
      // Empty journal metadata is legitimate for papers under review.
      assert.equal(Boolean(value.zh.trim()), Boolean(value.en.trim()));
    }
    Object.values(value).forEach(inspect);
  };
  inspect(content);
});

test('accepted and reviewed manuscripts remain distinct from published papers', () => {
  assert.equal(content.publications.filter((p) => p.status === 'review').length, 3);
  assert.equal(content.publications.filter((p) => p.status === 'accepted').length, 1);
  assert.equal(content.publications.filter((p) => p.status === 'published').length, 27);
  assert.equal(content.publications.find((p) => p.venue.en === 'Nature Sustainability').status, 'review');
  assert.match(content.publications.find((p) => p.venue.en === 'Global Change Biology').title.en, /^Protecting the safe havens/);
});

test('the latest academic and project values have been preserved', () => {
  assert.equal(content.education[2].gpa, '3.68');
  assert.equal(content.education[0].rank, '3/48');
  assert.deepEqual(content.metrics.map((x) => x.value), ['45','1,158','20']);
  assert(content.projects.some((p) => p.text.zh.includes('2024YFF1306104')));
  assert(content.awards.some((p) => p.text.zh.includes('优秀报告一等奖')));
  assert(content.services.some((p) => p.text.zh.includes('九三学社中央')));
  assert.equal(content.publications.filter((p) => p.contribution).length, 12);
});

test('Chinese journal volume and page information is retained', () => {
  const paper = content.publications.find((p) => p.venue.en === 'Journal of Xiamen University (Natural Science)');
  assert.equal(paper.year, '2025');
  assert.equal(paper.reference, '64(03), 528-537');
});

test('browser data is synchronized with the editable content file', () => {
  const script = fs.readFileSync(path.join(root, 'assets/content.js'), 'utf8');
  assert.deepEqual(JSON.parse(script.slice('window.CV_CONTENT = '.length).trim().replace(/;$/, '')), content);
});

test('site assets and section links work under a GitHub project path', () => {
  const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  for (const match of html.matchAll(/(?:src|href)="(assets\/[^"?#]+)"/g)) {
    assert(fs.existsSync(path.join(root, match[1])), `Missing ${match[1]}`);
    assert(new URL(match[1], 'https://sea993.github.io/CV_GUTIANCI/').pathname.startsWith('/CV_GUTIANCI/'));
  }
  for (const match of html.matchAll(/href="#([^"]+)"/g)) assert(html.includes(`id="${match[1]}"`));
  assert(fs.statSync(path.join(root, 'assets/tianci-gu-cv.docx')).size > 50000);
});

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const content = JSON.parse(fs.readFileSync(path.join(root, 'assets/content.json'), 'utf8'));

test('the complete resume collections are present', () => {
  assert.equal(content.education.length, 3);
  assert.equal(content.publications.length, 48);
  assert.equal(content.projects.length, 15);
  assert.equal(content.awards.length, 23);
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

test('only approved publication records are included in public data', () => {
  assert.equal(content.publications.filter((p) => p.status === 'review').length, 0);
  assert.equal(content.publications.filter((p) => p.status === 'accepted').length, 1);
  assert.equal(content.publications.filter((p) => p.status === 'published').length, 47);
  assert(!content.publications.some((p) => ['paper-4','paper-5','paper-6'].includes(p.id)));
  assert(content.publications.some((p) => p.id === 'paper-7' && p.status === 'published'));
  assert(content.publications.every((p) => ['published','accepted'].includes(p.status)));
});

test('the supplied complete list is deduplicated and the selected set is exact', () => {
  const normalized = content.publications.map((p) => p.title.en.toLowerCase().replace(/[^a-z0-9]/g, ''));
  assert.equal(new Set(normalized).size, 48);
  assert.equal(new Set(content.publications.map((p) => p.id)).size, 48);
  assert.deepEqual(content.publications.filter((p) => p.selected).map((p) => p.id).sort(),
    [1,2,3,9,10,12,16,17,18,19,20].map((id) => 'paper-' + id).sort());
  const abstracts = content.publications.filter((p) => p.kind === 'conference');
  assert.equal(abstracts.length, 2);
  assert.deepEqual(abstracts.map((p) => p.reference), ['EGU25-6392','EGU25-5566']);
  assert(abstracts.every((p) => p.doi.startsWith('https://doi.org/10.5194/egusphere-')));
  for (const title of ['长江经济带三大城市群新型城镇化耦合协调时空特征研究','长江经济带三大城市群国土空间利用效率耦合协调研究','全球生态系统健康时空演变规律及其驱动机制','基于谷歌地球引擎平台的中国城市环境质量分区和分规模动态评估']) {
    assert.equal(content.publications.filter((p) => p.title.zh === title).length, 1);
  }
});

test('DOI links are distinct from source pages and unresolved records remain explicit', () => {
  const linked = content.publications.filter((paper) => paper.doi);
  assert.equal(linked.length, 46);
  for (const paper of linked) {
    assert.match(paper.doi, /^https:\/\/doi\.org\/10\.\d{4,9}\/\S+$/);
    assert(!paper.doiNote);
  }
  assert.deepEqual(content.publications.filter((paper) => !paper.doi).map((paper) => paper.id).sort(), ['paper-20','paper-50']);
  for (const paper of content.publications.filter((paper) => !paper.doi)) {
    assert(paper.articleUrl || paper.searchUrl);
    assert(!new URL(paper.articleUrl || paper.searchUrl).hostname.includes('doi.org'));
  }
  assert.equal(content.publications.find((paper) => paper.id === 'paper-20').doiNote.zh, 'DOI待补充');
  const territorial = content.publications.find((paper) => paper.id === 'paper-50');
  assert.equal(territorial.doiIdentifier, '10.11870/cjlyzyyhj202601008');
  assert.equal(territorial.articleUrl, 'https://yangtzebasin.whlib.ac.cn/CN/10.11870/cjlyzyyhj202601008');
  assert(!territorial.doiNote);
  assert.equal(content.publications.find((paper) => paper.id === 'paper-49').doi, 'https://doi.org/10.3969/j.issn.1005-8141.2026.07.008');
  assert.equal(content.publications.find((paper) => paper.id === 'paper-26').doi, 'https://doi.org/10.6043/j.issn.0438-0479.202410007');
});

test('publication order prioritizes author roles and the specified corresponding-author paper', () => {
  const priority = {first:0, corresponding:1, second:2, accepted:2, collaborative:3};
  const ranks = content.publications.map((paper) => paper.kind === 'conference' ? 4 : priority[paper.category]);
  assert(ranks.every((rank, index) => index === 0 || ranks[index - 1] <= rank));
  assert.deepEqual(content.publications.slice(0,4).map((paper) => paper.id), ['paper-1','paper-2','paper-3','paper-7']);
  assert.equal(content.publications.find((paper) => paper.category === 'corresponding').id, 'paper-9');
  assert.deepEqual(content.publications.filter((paper) => paper.category === 'second' || paper.category === 'accepted').map((paper) => paper.id), ['paper-16','paper-19','paper-17','paper-18','paper-20']);
  assert(content.publications.slice(-2).every((paper) => paper.kind === 'conference'));
});

test('the latest academic and project values have been preserved', () => {
  assert.equal(content.education[2].gpa, '3.68');
  assert.equal(content.education[0].rank, '3/48');
  assert.deepEqual(content.metrics.map((x) => x.value), ['1,169','20','26']);
  assert.deepEqual(content.metrics.map((x) => x.since2021), ['1,165','20','26']);
  assert.equal(content.profile.scholar, 'https://scholar.google.com/citations?user=gLpuU54AAAAJ');
  assert.equal(content.profile.email, 'gutc@mail.bnu.edu.cn');
  assert(content.projects.some((p) => p.text.zh.includes('2024YFF1306104')));
  assert(content.awards.some((p) => p.text.zh.includes('优秀报告一等奖')));
  assert(content.services.some((p) => p.text.zh.includes('九三学社中央')));
  assert.equal(content.publications.filter((p) => p.contribution).length, 9);
});

test('Chinese journal volume and page information is retained', () => {
  const paper = content.publications.find((p) => p.venue.en === 'Journal of Xiamen University (Natural Science)');
  assert.equal(paper.year, '2025');
  assert.equal(paper.reference, '64(03), 528-537');
});

test('concise presentation retains the source facts and correct author roles', () => {
  assert(content.publications.every((paper) => !paper.role.zh.includes('唯一')));
  assert.equal(content.publications[2].role.zh, '共同第一作者');
  assert(content.projects.every((item) => item.displayTitle.zh && item.program.en && item.dates && item.text.zh));
  for (const index of [1,2,4,5,6,7,8]) assert(content.awards[index].displayTitle.zh.startsWith('北京师范大学'));
  assert(content.awards[5].displayTitle.zh.includes('第九届研究生学术能力竞赛二等奖'));
  assert(content.skills.every((item) => item.shortText.zh && item.shortText.en));
  assert(!content.services.find((item) => item.kind === 'policy').text.zh.includes('政策建议成果：'));
});

test('browser data is synchronized with the editable content file', () => {
  const script = fs.readFileSync(path.join(root, 'assets/content.js'), 'utf8');
  assert.deepEqual(JSON.parse(script.slice('window.CV_CONTENT = '.length).trim().replace(/;$/, '')), content);
});

test('overview counts separate publication status and project sources', () => {
  const published = content.publications.filter(p=>p.status==='published'&&p.kind!=='conference');
  assert.equal(published.length,45);
  assert.deepEqual(['first','corresponding','second','collaborative'].map(role=>published.filter(p=>p.category===role).length),[4,8,4,29]);
  assert.deepEqual(['nsfc','key-rd','provincial','university','commissioned'].map(source=>content.projects.filter(p=>p.source===source).length),[4,1,3,3,4]);
  assert.equal(content.projects.filter(p=>p.role==='led').length,4);
  assert.equal(new Set(content.projects.map(p=>p.id)).size,15);
});

test('research map and topic links use public records and verified method associations', () => {
  const ids = new Set(content.publications.map(p=>p.id));
  const topics = new Set(content.researchThemes.map(t=>t.id));
  for (const paper of content.publications) assert(paper.topics.every(id=>topics.has(id)));
  for (const topic of topics) assert(content.publications.some(p=>p.topics.includes(topic)),'A research theme has no publications');
  assert(content.researchMapPapers.every(p=>ids.has(p.id)));
  for (const method of content.researchMethods) assert(method.papers.every(id=>ids.has(id)));
  assert.deepEqual(content.researchMethods.map(m=>m.papers),[['paper-2'],['paper-11']]);
  assert.equal(content.publications.filter(p=>p.featured).length,3);
  assert(content.publications.filter(p=>p.featured).every(p=>p.figure&&p.selected&&p.doi));
});

test('JCR counts use one release and preserve N/A and absent English records', () => {
  assert.equal(content.journalRankings.edition,'2026');
  assert.equal(content.journalRankings.metricYear,2025);
  assert.equal(content.journalRankings.scope,'JIF-quartile');
  const english=content.publications.filter(p=>p.status==='published'&&p.kind!=='conference'&&p.originalLanguage==='en');
  const journals=new Map(content.journalRankings.journals.map(r=>[r.venue,r]));
  assert.equal(journals.size,23);
  assert(english.every(p=>journals.has(p.venue.en)));
  assert.deepEqual(['Q1','Q2','Q3','Q4'].map(q=>english.filter(p=>journals.get(p.venue.en).quartile===q).length),[28,4,3,0]);
  assert.equal(english.filter(p=>!journals.get(p.venue.en).quartile).length,6);
  for(const r of journals.values()) {
    assert.equal(r.checkedDate,'2026-10-13');
    assert(r.sourceUrl.startsWith('https://www.niic.nsc.ru/'));
    if(r.status==='ranked') {
      assert(['Q1','Q2','Q3','Q4'].includes(r.quartile));
      assert(r.sourcePage>0 && /^\d{4}-\d{3}[\dX]$/.test(r.eissn));
    } else assert.equal(r.quartile,null);
  }
  assert.equal(journals.get('npj Heritage Science').status,'not-applicable');
  assert.equal(journals.get('npj Heritage Science').eissn,'3059-3220');
  assert.equal(journals.get('Journal of Asian Architecture and Building Engineering').status,'not-applicable');
  assert.equal(journals.get('Transactions in Earth, Environment, and Sustainability').status,'no-record');
  assert.equal(journals.get('Environmental Science and Pollution Research').status,'no-record');
});

test('Chinese Core and CSSCI counts overlap and never include English or accepted papers', () => {
  const published=content.publications.filter(p=>p.status==='published'&&p.kind!=='conference'&&p.originalLanguage==='zh');
  const journals=new Map(content.chineseJournalIndexes.journals.map(r=>[r.venue.en,r]));
  assert.equal(published.length,4);
  assert.equal(journals.size,4);
  assert(published.every(p=>journals.has(p.venue.en)));
  assert.equal(published.filter(p=>journals.get(p.venue.en).indexes.includes('core')).length,4);
  assert.deepEqual(published.filter(p=>journals.get(p.venue.en).indexes.includes('cssci')).map(p=>p.id),['paper-51','paper-50']);
  assert(published.filter(p=>journals.get(p.venue.en).indexes.includes('cssci')).every(p=>journals.get(p.venue.en).indexes.includes('core')));
  assert(content.publications.filter(p=>p.originalLanguage==='en').every(p=>!journals.has(p.venue.en)));
  for(const r of journals.values()) assert(r.sourceUrl.startsWith('https://'));
});

test('independent pages and their assets work under a GitHub project path', () => {
  for (const name of ['index','education','publications','projects','awards','skills','service','cv']) {
  const html = fs.readFileSync(path.join(root, name + '.html'), 'utf8');
  for (const match of html.matchAll(/(?:src|href)="(assets\/[^"?#]+)(?:[?#][^"]*)?"/g)) {
    assert(fs.existsSync(path.join(root, match[1])), `Missing ${match[1]}`);
    assert(new URL(match[1], 'https://sea993.github.io/CV_GUTIANCI/').pathname.startsWith('/CV_GUTIANCI/'));
  }
  for (const match of html.matchAll(/href="#([^"]+)"/g)) assert(html.includes(`id="${match[1]}"`));
  for (const match of html.matchAll(/href="([a-z]+\.html)(?:[?#][^"]*)?"/g)) assert(fs.existsSync(path.join(root,match[1])));
  assert(!html.includes('section-number'));
  assert.equal([...html.matchAll(/<footer\b/g)].length, 1);
  assert(html.includes('id="site-footer"') && html.includes('href="#top"'));
  assert(!html.includes('gutc@cug.edu.cn'));
  }
  assert(fs.statSync(path.join(root, 'assets/tianci-gu-cv.docx')).size > 50000);
});

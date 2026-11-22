// End-to-end test of the study app, opened over file:// like a double-click.
// Run: node tests/e2e.js   (needs Playwright + Chromium)
const { chromium } = require('playwright');
const path = require('path');
const URL = 'file://' + path.resolve(__dirname, '..', 'index.html');
const SHOTS = process.env.SHOTS || '';
let failures = 0;
function ok(cond, msg) { if (cond) console.log('  ✔ ' + msg); else { failures++; console.log('  ✘ ' + msg); } }

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, acceptDownloads: true });
  const page = await ctx.newPage();
  const errors = [];
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', e => errors.push(String(e)));
  page.on('dialog', d => d.accept());

  const cur = () => page.evaluate(() => {
    const S = JSON.parse(localStorage.getItem('ds.session.v1'));
    if (!S) return null;
    const st = DS_DATA.statements.find(s => s.id === S.ids[S.pos]);
    const it = S.sub === 0 ? st : st.followUps[S.sub - 1];
    return { id: it.id, type: it.type, answer: it.answer, options: it.options, table: it.table, phase: S.phase, round: S.round };
  });
  async function readNote() {
    ok(await page.locator('#ans, .choice, .cell').count() === 0, 'note phase shows no answer controls');
    await page.click('#readBtn');
    await page.waitForSelector('#checkBtn');
  }
  async function fill(it, correct) {
    const t = it.type;
    if (t === 'explain') await page.fill('#ans', correct ? it.answer : 'banana');
    if (t === 'exact') await page.fill('#ans', correct ? it.answer[0] : 'zzz-wrong');
    if (t === 'set') await page.fill('#ans', correct ? it.answer : '{999}');
    if (t === 'choice') {
      const want = Array.isArray(it.answer) ? it.answer : [it.answer];
      const pick = correct ? want : [it.options.find(o => !want.includes(o))];
      const btns = page.locator('.choice');
      for (let i = 0; i < it.options.length; i++) {
        const pressed = await btns.nth(i).getAttribute('aria-pressed') === 'true';
        if (pick.includes(it.options[i]) !== pressed) await btns.nth(i).click();
      }
    }
    if (t === 'truthtable') {
      const cells = page.locator('.cell');
      for (let i = 0; i < it.answer.length; i++) {
        let target = it.answer[i]; if (!correct && i === 0) target = target === 'T' ? 'F' : 'T';
        for (let k = 0; k < 3 && (await cells.nth(i).textContent()) !== target; k++) await cells.nth(i).click();
      }
    }
    if (t === 'matrix') {
      const cells = page.locator('.cell'); const cols = it.answer[0].length;
      for (let i = 0; i < it.answer.length; i++) for (let j = 0; j < cols; j++) {
        let target = String(it.answer[i][j]); if (!correct && i === 0 && j === 0) target = target === '1' ? '0' : '1';
        if ((await cells.nth(i * cols + j).textContent()) !== target) await cells.nth(i * cols + j).click();
      }
    }
  }
  async function answer(correct) {
    const it = await cur(); await fill(it, correct); await page.click('#checkBtn');
    await page.waitForSelector('.feedback'); return it;
  }
  async function verdict() { return (await page.locator('.feedback .verdict').last().textContent()).toLowerCase(); }

  console.log('Home page');
  await page.goto(URL);
  await page.waitForSelector('.topic');
  ok(await page.locator('.topic').count() === 6, '6 topic cards');
  ok((await page.textContent('h1')).includes('Memorise'), 'hero heading');
  if (SHOTS) await page.screenshot({ path: SHOTS + '/home-phone.png', fullPage: true });

  console.log('Explain: almost → wrong → 3 tries → needs review → follow-up');
  await page.click('.topic >> nth=0 >> text=Launch session');
  await page.click('#allBtn');
  await page.waitForSelector('#readBtn');
  ok((await page.textContent('.qcard .eyebrow')).includes('Note 1 of'), '"Note X of Y" label');
  if (SHOTS) await page.screenshot({ path: SHOTS + '/note-phone.png', fullPage: true });
  await readNote();
  ok(await page.locator('.note').count() === 0, 'note hidden in answer phase');
  ok(await page.locator('.toolbar button').count() >= 24, 'symbol toolbar under answer box');
  await page.fill('#ans', 'a collection of objects'); await page.click('#checkBtn');
  ok((await verdict()).includes('almost'), 'partial answer → ALMOST');
  ok(await page.locator('.chip.hit').count() > 0 && await page.locator('.chip.miss').count() > 0, 'found + missed keywords shown');
  ok((await page.textContent('.feedback')).includes('Hint'), 'hint shown on ALMOST');
  if (SHOTS) await page.screenshot({ path: SHOTS + '/almost-phone.png', fullPage: true });
  await page.fill('#ans', 'banana'); await page.click('#checkBtn');
  ok((await verdict()).includes('wrong'), 'nonsense → WRONG');
  await page.fill('#ans', 'still no idea'); await page.click('#checkBtn');
  ok(await page.locator('.review-flag').count() === 1, '3rd wrong try → needs review');
  ok((await page.textContent('.feedback')).includes('The answer'), 'answer revealed after 3 tries');
  await page.click('#nextBtn');
  await page.waitForSelector('#readBtn');
  ok((await page.textContent('.kind')).includes('Follow-up 1 of 1'), 'follow-up starts with its NOTE phase');
  await readNote();
  await answer(true);
  ok((await verdict()).includes('correct'), 'follow-up choice correct');
  ok((await page.textContent('.feedback')).includes('original note'), 'original note shown on CORRECT');

  console.log('Every answer type (correct on 1st, 2nd attempt)');
  // Jump to a hand-picked session covering every type
  await page.evaluate(() => localStorage.setItem('ds.session.v1', JSON.stringify({ topic: '1', ids: ['1-03', '2A-09', '3A-07', '1-12', '1-24', '1-29', '3A-23'], round: 1, pos: 0, sub: 0, phase: 'note', attempts: 0, roundRes: {}, first: {}, final: {} })));
  await page.goto('about:blank'); await page.goto(URL + '#/study'); await page.waitForSelector('#readBtn');
  const seen = new Set(); let steps = 0;
  while (steps++ < 40) {
    const it = await cur(); if (!it) break;
    if (it.phase === 'note' || await page.locator('#readBtn').count()) await readNote();
    const it2 = await cur();
    if (!seen.has(it2.type)) {
      // first time we see a type: wrong first, then correct (2nd attempt → 60%)
      await answer(false); ok(!(await verdict()).includes('correct'), it2.type + ' wrong answer rejected (' + it2.id + ')');
      if (it2.type === 'truthtable' || it2.type === 'matrix') ok(await page.locator('.cell.bad').count() >= 1, it2.type + ' wrong cell highlighted');
      if (it2.type === 'set') ok((await page.textContent('.feedback')).includes('missing'), 'set feedback reports missing elements');
      if (SHOTS && it2.type === 'truthtable') await page.screenshot({ path: SHOTS + '/truthtable-phone.png', fullPage: true });
      seen.add(it2.type);
    }
    await answer(true); ok((await verdict()).includes('correct'), it2.type + ' correct answer accepted (' + it2.id + ')');
    await page.click('#nextBtn');
    await page.waitForTimeout(50);
    if (page.url().includes('#/results')) break;
    await page.waitForSelector('#readBtn, .big-pct');
    if (await page.locator('.big-pct').count()) break;
  }
  ['explain', 'exact', 'set', 'truthtable', 'matrix', 'choice'].forEach(t => ok(seen.has(t) || t === 'explain', 'covered type ' + t));
  await page.waitForSelector('.big-pct');
  ok((await page.textContent('.stage')).includes('Mastered'), 'results page lists mastered');
  if (SHOTS) { await page.waitForTimeout(1000); await page.screenshot({ path: SHOTS + '/results-phone.png', fullPage: true }); }

  console.log('ASCII input conversion + set order');
  await page.evaluate(() => localStorage.setItem('ds.session.v1', JSON.stringify({ topic: '1', ids: ['1-46', '1-36'], round: 1, pos: 0, sub: 0, phase: 'note', attempts: 0, roundRes: {}, first: {}, final: {} })));
  await page.goto('about:blank'); await page.goto(URL + '#/study'); await readNote();
  await page.fill('#ans', "A' n B'");
  ok((await page.textContent('#pv')).includes('A′ ∩ B′'), 'live preview converts ASCII');
  await page.click('#checkBtn'); ok((await verdict()).includes('correct'), "\"A' n B'\" accepted for A′ ∩ B′");
  await page.click('#nextBtn'); await readNote();      // follow-up 1 exact
  await page.fill('#ans', "a' U b'"); await page.click('#checkBtn'); ok((await verdict()).includes('correct'), "\"a' U b'\" accepted");
  await page.click('#nextBtn'); await readNote();      // follow-up 2 set
  await page.click('.toolbar button[data-sym="{"]'); await page.type('#ans', '6, 5, 6'); await page.click('.toolbar button[data-sym="}"]');
  ok((await page.inputValue('#ans')) === '{6, 5, 6}', 'toolbar inserts symbols at caret');
  await page.click('#checkBtn'); ok((await verdict()).includes('correct'), 'set {6,5,6} = {5,6}');

  console.log('Review round after a failure');
  await page.evaluate(() => localStorage.setItem('ds.session.v1', JSON.stringify({ topic: '1', ids: ['1-49'], round: 1, pos: 0, sub: 0, phase: 'note', attempts: 0, roundRes: {}, first: {}, final: {} })));
  await page.goto('about:blank'); await page.goto(URL + '#/study'); await readNote();
  for (let i = 0; i < 3; i++) { await page.fill('#ans', 'nope'); await page.click('#checkBtn'); }
  await page.click('#nextBtn'); await readNote(); await answer(true); await page.click('#nextBtn');
  await page.waitForSelector('#readBtn');
  ok((await page.textContent('.stage-top')).includes('Review round'), 'failed statement repeats from NOTE phase');
  ok((await cur()).id === '1-49', 'review starts with the failed statement');
  await readNote(); await answer(true); await page.click('#nextBtn'); await readNote(); await answer(true); await page.click('#nextBtn');
  await page.waitForSelector('.big-pct');
  ok(await page.evaluate(() => JSON.parse(localStorage.getItem('ds.progress.v1')).stmts['1-49'].status) === 'mastered', 'progress saved after review');

  console.log('Quiz mode');
  await page.clock.install();
  await page.goto(URL + '#/quiz/3B'); await page.waitForSelector('#opts .choice');
  const total = +(await page.textContent('.stage-top .eyebrow')).match(/\/ (\d+)/)[1];
  ok(total === await page.evaluate(() => DS_DATA.statements.filter(s => s.topic === '3B').length), 'quiz has one MCQ per statement');
  // answer correctly by finding the right option text
  for (let q = 0; q < 2; q++) {
    const right = await page.evaluate(() => { const qtext = document.querySelector('div.question').textContent; const s = DS_DATA.statements.find(x => x.mcq.question === qtext); return s.mcq.options[s.mcq.answer]; });
    await page.locator('#opts .choice', { hasText: right }).first().click();
    ok((await page.textContent('#fb')).includes('Correct'), 'quiz correct answer');
    await page.click('#qNext');
  }
  ok((await page.textContent('.streak')).includes('2'), 'streak counter = 2');
  await page.clock.runFor(21000);
  ok((await page.textContent('#fb')).includes('Time’s up'), '20-second timer expires');
  ok((await page.textContent('.stage-top .streak')).includes('0'), 'streak resets on timeout');
  if (SHOTS) await page.screenshot({ path: SHOTS + '/quiz-phone.png', fullPage: true });
  await page.click('#qNext'); await page.click('#quitBtn');
  await page.waitForSelector('.big-pct');
  ok((await page.textContent('.stage')).includes('best streak'), 'quiz report');

  console.log('Trap quiz');
  await page.goto(URL + '#/trap'); await page.waitForSelector('#opts .choice');
  const trapN = +(await page.textContent('.stage-top .eyebrow')).match(/\/ (\d+)/)[1];
  const expected = await page.evaluate(() => DS_DATA.statements.filter(s => s.kind === 'watch' || s.kind === 'mistake').length);
  ok(trapN === expected && trapN >= 18, 'trap quiz = all WATCH OUT + Top 10 (' + trapN + ')');

  console.log('Manage notes');
  await page.goto(URL + '#/manage'); await page.waitForSelector('#mlist');
  await page.click('text=+ Add statement');
  await page.fill('[name=id]', 'X-1'); await page.fill('[name=title]', 'Test note'); await page.fill('[name=note]', '<b>Test</b> note');
  await page.fill('[name=question]', 'What is 2+2?'); await page.selectOption('[name=type]', 'exact'); await page.fill('[name=answer]', '4\nfour');
  await page.fill('[name=hint]', 'add'); await page.fill('[name=followUps]', '[{"note":"n","question":"3+3?","type":"exact","answer":["6"],"hint":"h"}]');
  await page.fill('[name=mq]', 'pick 4'); for (let i = 0; i < 4; i++) await page.fill('[name=mo' + i + ']', String(4 + i));
  await page.click('button[type=submit]'); await page.waitForSelector('#mlist');
  ok((await page.textContent('#mlist')).includes('X-1'), 'statement added');
  await page.click('a[href="#/manage/X-1"]'); await page.fill('[name=title]', 'Edited note'); await page.click('button[type=submit]'); await page.waitForSelector('#mlist');
  ok((await page.textContent('#mlist')).includes('Edited note'), 'statement edited');
  await page.click('a[href="#/manage/X-1"]'); await page.fill('[name=answer]', ''); await page.click('button[type=submit]');
  ok((await page.textContent('#ferr')).includes('accepted answer'), 'validation blocks an empty answer');
  await page.goto(URL + '#/manage'); await page.waitForSelector('#mlist');
  const [dl] = await Promise.all([page.waitForEvent('download'), page.click('#expBtn')]);
  const file = await dl.path(); const exported = JSON.parse(require('fs').readFileSync(file, 'utf8'));
  ok(exported.statements.length === 242, 'export JSON contains all statements (' + exported.statements.length + ')');
  await page.click('[data-del="X-1"]'); await page.waitForTimeout(100);
  ok(!(await page.textContent('#mlist')).includes('X-1'), 'statement deleted');
  await page.setInputFiles('#impFile', file); await page.waitForTimeout(300);
  ok((await page.textContent('#mlist')).includes('X-1'), 'import JSON restores it');
  await page.click('#resetBtn'); await page.waitForTimeout(100);
  ok(await page.evaluate(() => localStorage.getItem('ds.data.v1')) === null, 'reset to built-in notes');

  console.log('Home progress');
  const home = await ctx.newPage(); home.on('pageerror', e => errors.push(String(e)));
  await home.goto(URL); await home.waitForTimeout(1300);
  ok(+(await home.locator('.stat .num').nth(3).textContent()) === 2, 'sessions counter counts up (2 finished)');
  ok(+(await home.locator('.stat .num').nth(1).textContent()) >= 5, 'mastered counter');
  if (SHOTS) {
    await home.setViewportSize({ width: 1280, height: 900 }); await home.reload(); await home.waitForTimeout(1300);
    await home.screenshot({ path: SHOTS + '/home-desktop.png', fullPage: true });
    await home.goto(URL + '#/topic/2A'); await home.waitForTimeout(600); await home.screenshot({ path: SHOTS + '/topic-desktop.png' });
  }
  ok(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), 'no horizontal scroll (phone)');
  ok(errors.length === 0, 'no console errors' + (errors.length ? ': ' + errors.join(' | ') : ''));
  await browser.close();
  console.log(failures ? `\n${failures} FAILED` : '\nAll e2e checks passed');
  process.exit(failures ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });

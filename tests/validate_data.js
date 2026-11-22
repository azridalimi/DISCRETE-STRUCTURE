// Structural validation of js/data.js — run: node tests/validate_data.js
const D = require('../js/data.js'), C = require('../js/checker.js');
let errs = [];
const ids = new Set();
const TYPES = ['explain','exact','set','truthtable','matrix','choice'];
function checkItem(it, where) {
  if (!it.question) errs.push(where + ': no question');
  if (!it.note) errs.push(where + ': no note');
  if (!it.hint) errs.push(where + ': no hint');
  if (!TYPES.includes(it.type)) errs.push(where + ': bad type ' + it.type);
  if (it.type === 'explain') { if (!it.keywords || !it.keywords.length) errs.push(where + ': no keywords');
    // the reference answer must itself score CORRECT
    const r = C.checkExplain(it.answer, it.keywords); if (r.verdict !== 'correct') errs.push(where + ': reference answer scores ' + r.pct + '% missing ' + r.missed); }
  if (it.type === 'exact' && (!Array.isArray(it.answer) || !it.answer.length)) errs.push(where + ': exact needs array');
  if (it.type === 'set' && !C.setElements(it.answer)) errs.push(where + ': set answer unparseable ' + it.answer);
  if (it.type === 'choice') { const a = Array.isArray(it.answer) ? it.answer : [it.answer];
    a.forEach(x => { if (!it.options.includes(x)) errs.push(where + ': answer not in options: ' + x); }); }
  if (it.type === 'truthtable') { if (it.table.rows.length !== it.answer.length) errs.push(where + ': tt rows/answer mismatch');
    it.table.rows.forEach(r => { if (r.length !== it.table.cols.length - 1) errs.push(where + ': tt row width'); }); }
  if (it.type === 'matrix') { if (it.answer.length !== it.grid.rows.length || it.answer.some(r => r.length !== it.grid.cols.length)) errs.push(where + ': matrix dims'); }
  // self-check: the stored answer must pass its own checker
  let resp = it.answer; if (it.type === 'exact') resp = it.answer[0];
  if (C.check(it, resp).verdict !== 'correct') errs.push(where + ': own answer fails checker');
}
const count = {};
D.statements.forEach(s => {
  if (ids.has(s.id)) errs.push('duplicate id ' + s.id); ids.add(s.id);
  count[s.topic] = (count[s.topic] || 0) + 1;
  checkItem(s, s.id);
  if (!s.followUps.length || s.followUps.length > 3) errs.push(s.id + ': followUps count ' + s.followUps.length);
  s.followUps.forEach(f => checkItem(f, f.id));
  if (!s.mcq || s.mcq.options.length !== 4) errs.push(s.id + ': mcq needs 4 options');
  else if (new Set(s.mcq.options).size !== 4) errs.push(s.id + ': mcq duplicate options');
});
console.log('Statements per topic:', count, 'total', D.statements.length,
  'follow-ups', D.statements.reduce((a, s) => a + s.followUps.length, 0));
console.log(errs.length ? errs.join('\n') : 'Data structure OK');
process.exit(errs.length ? 1 : 0);

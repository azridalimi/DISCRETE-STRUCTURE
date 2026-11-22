// Generates COVERAGE.md from js/data.js. Run: node tools/build_coverage.js
const D = require('../js/data.js'), fs = require('fs'), path = require('path');
const SECTIONS = [
  ['1.1', 'What is a set?'], ['1.2', 'Types of sets'], ['1.3', 'Subsets, cardinality and power set'], ['1.4', 'Operations on sets (with Venn diagrams)'],
  ['1.5', 'Set identities (laws)'], ['1.6', 'Generalised union and intersection'], ['1.7', 'Cartesian product'],
  ['2.1', 'Propositions'], ['2.2', 'Logical connectives: one master truth table'], ['2.3', 'Precedence (order of operations)'], ['2.4', 'Logical equivalence ≡'],
  ['2.5', 'Laws of logic: side by side with the set laws'], ['2.6', 'Logic ↔ Set theory dictionary'],
  ['2.7', 'Predicates and domain'], ['2.8', 'The two quantifiers (incl. negating, translating, quick check)'], ['2.9', 'Nested quantifiers'], ['2.10', 'Proof techniques'],
  ['3.1', 'What is a relation?'], ['3.2', 'Four ways to show a relation (incl. in/out-degree)'], ['3.3', 'Properties of relations (incl. Boolean product)'], ['3.4', 'The two special relations'],
  ['3.5', 'What is a function?'], ['3.6', 'One-to-one, onto, bijection'], ['3.7', 'Inverse function'], ['3.8', 'Composition'],
  ['Cheat: Sets', 'Cheat sheet · Sets'], ['Cheat: Logic', 'Cheat sheet · Logic'], ['Cheat: Quantifiers', 'Cheat sheet · Quantifiers'], ['Cheat: Proofs', 'Cheat sheet · Proofs of p → q'],
  ['Cheat: Relations', 'Cheat sheet · Relations'], ['Cheat: Functions', 'Cheat sheet · Functions'], ['Top 10 mistakes', 'Top 10 common mistakes']
];
const KIND = { def: 'DEFINITION', table: 'TABLE ROW', example: 'EXAMPLE', proof: 'EXAMPLE (proof)', tip: 'MEMORY TIP', watch: 'WATCH OUT', quick: 'QUICK CHECK', cheat: 'CHEAT SHEET', mistake: 'TOP-10 MISTAKE' };
const CH = { '1': 'Chapter 1 · Set Theory', '2A': 'Chapter 2A · Fundamentals of Logic', '2B': 'Chapter 2B · Quantifiers & Proof', '3A': 'Chapter 3A · Relations', '3B': 'Chapter 3B · Functions', 'S': '★ Cheat Sheet & Top 10 Mistakes' };
const clean = s => s.replace(/<[^>]+>/g, '').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&').replace(/\|/g, '\\|');
let out = '# COVERAGE: PDF → statement IDs\n\n' +
  'Generated from `js/data.js` by `node tools/build_coverage.js`. Every PDF sub-heading is listed with the statements that cover it. ' +
  'Each row is one statement (a note + main question + follow-ups + 1 MCQ). The **Covers** column names the exact PDF item (definition, table row, example, memory tip, watch out or quick check).\n\n';
const byKind = {}; D.statements.forEach(s => byKind[s.kind] = (byKind[s.kind] || 0) + 1);
out += `**Totals:** ${D.statements.length} statements · ${D.statements.reduce((a, s) => a + s.followUps.length, 0)} follow-up questions · ${D.statements.length} MCQs\n\n`;
out += '| Kind | Count |\n|---|---|\n' + Object.keys(KIND).filter(k => byKind[k]).map(k => `| ${KIND[k]} | ${byKind[k]} |`).join('\n') + '\n';
let lastCh = '';
SECTIONS.forEach(([sec, name]) => {
  const list = D.statements.filter(s => s.section === sec);
  const ch = list[0] ? list[0].topic : '';
  if (ch && ch !== lastCh) { out += `\n## ${CH[ch]}\n`; lastCh = ch; }
  out += `\n### ${/^\d/.test(sec) ? sec + ' ' : ''}${name}\n\n`;
  if (!list.length) { out += '_No statements: MISSING_\n'; return; }
  out += '| ID | Kind | Covers | Answer type | Follow-ups |\n|---|---|---|---|---|\n';
  list.forEach(s => { out += `| ${s.id} | ${KIND[s.kind]} | ${clean(s.title)} | ${s.type} | ${s.followUps.map(f => f.type).join(', ')} |\n`; });
});
const orphans = D.statements.filter(s => !SECTIONS.some(x => x[0] === s.section));
if (orphans.length) out += '\n## Statements without a known section\n\n' + orphans.map(s => `- ${s.id} ${clean(s.title)}`).join('\n') + '\n';
out += '\n## How the Trap Quiz is built\n\nIt uses every statement whose kind is WATCH OUT or TOP-10 MISTAKE: ' +
  D.statements.filter(s => s.kind === 'watch' || s.kind === 'mistake').map(s => s.id).join(', ') + '.\n';
fs.writeFileSync(path.join(__dirname, '..', 'COVERAGE.md'), out);
console.log('COVERAGE.md written:', D.statements.length, 'statements,', SECTIONS.length, 'sections', orphans.length ? '(ORPHANS: ' + orphans.length + ')' : '');

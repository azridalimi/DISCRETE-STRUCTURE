// Unit tests for js/checker.js — run: node tests/test_checker.js
const C = require('../js/checker.js');
let fail = 0;
function eq(name, got, want) { const ok = JSON.stringify(got) === JSON.stringify(want); if (!ok) { fail++; console.log('FAIL', name, '\n  got ', got, '\n  want', want); } }
const v = (item, resp) => C.check(item, resp).verdict;
// ASCII conversion
eq('union', C.toSymbols('A U B'), 'A ∪ B');
eq('intersect', C.toSymbols('A n B'), 'A ∩ B');
eq('U alone', C.toSymbols('U'), 'U');
eq('2n+1', C.toSymbols('2n + 1'), '2n + 1');
eq('arrows', C.toSymbols('p -> q <-> r'), 'p → q ↔ r');
eq('not/and/or', C.toSymbols('not p and q or r'), '¬ p ∧ q ∨ r');
eq('~!', C.toSymbols('~p & !q | r'), '¬p ∧ ¬q ∨ r');
eq('forall', C.toSymbols('forall x exists y'), '∀ x ∃ y');
eq('in/subset', C.toSymbols('x in A, A subset B'), 'x ∈ A, A ⊆ B');
eq('empty', C.toSymbols('{}'), '∅');
eq('not in', C.toSymbols('1 not in A'), '1 ∉ A');
eq('complement', C.toSymbols("A' n B'"), 'A′ ∩ B′');
eq('times', C.toSymbols('A x B'), 'A × B');
eq('compose', C.toSymbols('f o g'), 'f ∘ g');
// exact
eq('exact 8', v({type:'exact',answer:['8']}, ' 8 '), 'correct');
eq('exact demorgan', v({type:'exact',answer:['A′ ∩ B′']}, "a' n b'"), 'correct');
eq('exact quant', v({type:'exact',answer:['∀x (S(x) → C(x))']}, 'forall x (S(x) -> C(x))'), 'correct');
eq('exact pow', v({type:'exact',answer:['2ⁿ']}, '2^n'), 'correct');
eq('exact wrong', v({type:'exact',answer:['8']}, '9'), 'wrong');
// sets
eq('set order', v({type:'set',answer:'{1,2,3}'}, '{3,1,2,2}'), 'correct');
eq('set no braces', v({type:'set',answer:'{1,2,3}'}, '3, 2, 1'), 'correct');
eq('set pairs', v({type:'set',answer:'{(a,1),(b,2)}'}, '{(b,2),(a,1)}'), 'correct');
eq('set pairs order', v({type:'set',answer:'{(a,1),(b,2)}'}, '{(1,a),(b,2)}'), 'wrong');
eq('powerset', v({type:'set',answer:'{∅,{1},{2},{1,2}}'}, '{{2,1},{},{1},{2}}'), 'correct');
eq('empty set', v({type:'set',answer:'∅'}, '{}'), 'correct');
eq('empty set2', v({type:'set',answer:'∅'}, 'empty'), 'correct');
const r = C.check({type:'set',answer:'{1,2,3}'}, '{1,2,9}'); eq('set feedback', [r.missingCount, r.extra], [1, ['9']]);
eq('unreadable', C.check({type:'set',answer:'{1}'}, '{1,{2}').unreadable, true);
// explain
const kw = [['well-defined','well defined','clear rule'], ['distinct','different','unique'], ['elements','members','objects'], ['collection','group']];
let e = C.checkExplain('A set is a well defined collection of distinct elements.', kw); eq('explain full', [e.verdict, e.pct], ['correct', 100]);
e = C.checkExplain('a colection of objects', kw); eq('explain almost', [e.verdict, e.pct], ['almost', 50]);
e = C.checkExplain('some things', kw); eq('explain wrong', e.verdict, 'wrong');
e = C.checkExplain('collecton of distinkt evn', [['collection'],['distinct'],['even']]); eq('lev only 6+', e.found, ['collection','distinct']);
// truthtable / matrix / choice
eq('tt', C.check({type:'truthtable',answer:['T','F']}, ['T','T']).wrongCells, [1]);
eq('mx', C.check({type:'matrix',answer:[[1,0],[0,1]]}, [[1,0],[1,1]]).wrongCells, [[1,0]]);
eq('choice multi', v({type:'choice',answer:['B','C']}, ['C','B']), 'correct');
console.log(fail ? fail + ' failures' : 'All checker tests passed');
process.exit(fail ? 1 : 0);

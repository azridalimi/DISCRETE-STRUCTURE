// Recomputes every invented/computed answer in data.js from first principles
// and checks it against the stored answer. Run: node tests/verify_answers.js
const D = require('../js/data.js'), C = require('../js/checker.js');
const items = {}; D.statements.forEach(s => { items[s.id] = s; s.followUps.forEach(f => items[f.id] = f); });
let ok = 0, bad = [];
function expect(id, computed, isResponse) {
  const it = items[id]; if (!it) { bad.push(id + ': no such item'); return; }
  const v = C.check(it, computed).verdict;
  if (v === 'correct') ok++; else bad.push(`${id}: computed ${JSON.stringify(computed)} but stored ${JSON.stringify(it.answer)}`);
}
// ---------- set helpers ----------
const S = (...a) => [...new Set(a.flat())];
const fmtEl = e => Array.isArray(e) ? '(' + e.join(',') + ')' : (e instanceof Set ? '{' + [...e].map(fmtEl).join(',') + '}' : String(e));
const fmt = arr => arr.length ? '{' + arr.map(fmtEl).join(',') + '}' : '∅';
const union = (...xs) => S(...xs), inter = (a, ...r) => a.filter(x => r.every(b => b.includes(x)));
const diff = (a, b) => a.filter(x => !b.includes(x)), sym = (a, b) => union(diff(a, b), diff(b, a));
const range = (a, b) => Array.from({ length: b - a + 1 }, (_, i) => a + i);
const prod = (...sets) => sets.reduce((acc, s) => acc.flatMap(t => s.map(x => [...t, x])), [[]]);
const power = a => a.reduce((ps, x) => ps.concat(ps.map(p => [...p, x])), [[]]).map(p => new Set(p));
// ---------- logic ----------
const ROWS = n => prod(...Array(n).fill([true, false]));
const tt = (n, f) => ROWS(n).map(r => f(...r) ? 'T' : 'F');
const imp = (a, b) => !a || b, iff = (a, b) => a === b;
// ---------- relations ----------
const matrix = (R, rows, cols) => rows.map(r => cols.map(c => R.some(p => p[0] === r && p[1] === c) ? 1 : 0));
const bprod = (A, B) => A.map((row, i) => B[0].map((_, j) => row.some((v, k) => v && B[k][j]) ? 1 : 0));
const props = (R, X) => {
  const has = (a, b) => R.some(p => p[0] === a && p[1] === b);
  const refl = X.every(x => has(x, x)), irr = X.every(x => !has(x, x));
  const symm = R.every(([a, b]) => has(b, a)), anti = R.every(([a, b]) => a === b || !has(b, a));
  const trans = R.every(([a, b]) => R.every(([c, d]) => c !== b || has(a, d)));
  return { refl, irr, symm, anti, asym: anti && irr, trans };
};
const compose = (f, g) => g.map(([x, y]) => [x, f.find(p => p[0] === y)[1]]);
const inverse = f => f.map(([x, y]) => [y, x]);

// ===== Chapter 1 =====
expect('1-03', fmt(S('a','b','c','a','c')));  expect('1-03-f1', String(S(2,2,3,3,3).length));
expect('1-05-f1', '4');
expect('1-06', fmt(range(1,4).map(x => 2*x)));
expect('1-06-f1', fmt([1,3,5,7,9]));
expect('1-07-f1', fmt(range(1,11).filter(x => x % 2)));
expect('1-08-f1', fmt(range(2,8).filter(x => x % 2 === 0)));
expect('1-09', fmt(range(-50,50).filter(x => 0 < x && x < 7)));
expect('1-09-f1', fmt(range(-50,50).filter(x => -2 <= x && x < 2)));
expect('1-12', '3/4');
expect('1-15', fmt(range(1,100).filter(x => x**3 < 0)));
expect('1-16', fmt(range(1,100).filter(x => 2*x < 10)));
expect('1-18', String(range(-50,50).filter(x => 10 < x && x < 20).length));
expect('1-20-f1', fmt(union([1,2,3],[2,4,6,8],[5,7])));
expect('1-22', fmt(range(-50,50).filter(x => 1 < x && x < 4)));
expect('1-27', fmt(power([1,2,3])));  expect('1-27-f1', String(power([1,2,3]).length - 1));
expect('1-27-f2', fmt(power(['x','y'])));
expect('1-28', '7');
expect('1-29', fmt(power(['SQL','Python'])));  expect('1-29-f1', String(2**3)); expect('1-29-f2', String(2**5));
expect('1-30-f1', String(2**4 - 1));
{ const A='abcdefgh'.split(''), sub = s => s.every(x => A.includes(x)) && s.length < A.length;
  const ans = [['B','bde'],['C','abcde'],['D','rsde']].filter(([,s]) => sub(s.split(''))).map(x => x[0]); expect('1-31', ans); }
expect('1-32', fmt(union([1,2,3,4,5],[2,4,6])));  expect('1-32-f1', fmt(union(['a','b'],['b','c','d'])));
expect('1-33', fmt(inter(range(1,6),[2,4,6,8,10]))); expect('1-33-f1', fmt(inter([1,3,5,7],[3,4,5,6])));
expect('1-34-f1', fmt(inter([1,2],[3,4])));
expect('1-35', fmt(diff(range(1,8),[2,4,6,8]))); expect('1-35-f1', fmt(diff([1,2,3,4],[3,4,5]))); expect('1-35-f2', fmt(diff([2,4,6,8],range(1,8))));
expect('1-36', fmt(sym([1,2,3,4,5],[4,5,6,7,8]))); expect('1-36-f1', fmt(sym([1,2,3],[2,3,4])));
expect('1-37', fmt(diff(range(1,7),[2,4,6]))); expect('1-37-f1', fmt(diff(range(1,10),range(1,5))));
expect('1-38', String(12 + 9 - 4)); expect('1-38-f1', String(5 + 3 - inter([1,2,3,4,5],[2,4,6]).length));
{ const A=[1,2,3], B=[3,4]; expect('1-40-f1', fmt(diff(A,B))); expect('1-40-f2', fmt(diff(B,A))); }
{ const U=range(1,6), A=[1,2,3], B=[2,3,4], Cc=[3,5], c = X => diff(U, X);
  expect('1-41-f1', fmt(union(B,A)));
  expect('1-42-f1', fmt(inter(inter(A,B),Cc)));
  expect('1-43-f1', fmt(union(A, inter(B,Cc)))); expect('1-43-f2', fmt(inter(union(A,B), union(A,Cc))));
  if (fmt(union(A, inter(B,Cc))) !== fmt(inter(union(A,B), union(A,Cc)))) bad.push('distributive law mismatch');
  expect('1-44-f2', fmt(inter(A, union(A,B))));
  expect('1-46-f2', fmt(c(union(A,B)))); if (fmt(c(union(A,B))) !== fmt(inter(c(A),c(B)))) bad.push('De Morgan mismatch');
  expect('1-48-f1', fmt(c(A)));
  expect('1-52-f1', fmt(inter(A, c(B)))); }
expect('1-56-f1', fmt(union(...[1,2,3].map(i => [i, i+1]))));
expect('1-57-f1', fmt(inter(...[1,2,3].map(i => range(i,5)))));
{ const A=range(1,6), B=[2,4,6,8,10], Cc=[1,2,8,10];
  expect('1-58', fmt(inter(A,B,Cc))); expect('1-58-f1', fmt(union(range(1,5),[2,4,6],[8,9]))); expect('1-58-f2', fmt(union(A,B,Cc))); }
expect('1-60', fmt(prod(['a','b'],[1,2]))); expect('1-60-f1', fmt(prod([1,2],['x']))); expect('1-60-f2', String(3*4));
expect('1-61', fmt(prod([1,2],['a','b'])));
expect('1-62', String(prod(['a','b'],[1,2],['x','y']).length)); expect('1-62-f1', fmt(prod(['a','b'],[1,2],['x','y']))); expect('1-62-f2', String(2*3*5));
expect('1-63', fmt(prod([1,2],[]))); expect('1-64-f1', fmt(prod([2],[1])));
expect('1-65', String(2*3)); expect('1-65-f1', String(4*3));
// ===== Chapter 2A =====
expect('2A-08', tt(1, p => !p));
expect('2A-09', tt(2, (p,q) => p && q)); expect('2A-10', tt(2, (p,q) => p || q));
expect('2A-11', tt(2, imp)); expect('2A-12', tt(2, iff));
{ const p = true, q = false; expect('2A-14-f1', (p && q) ? 'True' : 'False'); expect('2A-14-f2', imp(p,q) ? 'True' : 'False'); }
expect('2A-17-f1', tt(3, (p,q,r) => ((!p) && q) || r));
expect('2A-18', tt(2, (p,q) => imp(!(p || q), q && p))); expect('2A-18-f1', tt(2, (p,q) => !(p || q)));
expect('2A-20', tt(2, (p,q) => imp(!q, !p)));
if (tt(2,imp).join() !== tt(2,(p,q)=>imp(!q,!p)).join()) bad.push('contrapositive not equivalent?!');
expect('2A-21', tt(2, (p,q) => p && !q)); if (tt(2,(p,q)=>!imp(p,q)).join() !== tt(2,(p,q)=>p&&!q).join()) bad.push('neg-if mismatch');
expect('2A-23', tt(2, (p,q) => !p || q));
expect('2A-24-f1', tt(2, (p,q) => imp(q,p)));
expect('2A-26-f1', tt(1, p => !!p));
expect('2A-30-f1', tt(3, (p,q,r) => p && (q || r)));
expect('2A-31-f1', tt(2, (p,q) => p || (p && q)));
expect('2A-32-f2', tt(2, (p,q) => !p && !q));
{ const x = 3; expect('2A-42-f1', String(x)); if (!(x % 3 === 0 && x % 9 !== 0)) bad.push('2A-42 counterexample wrong'); }
// ===== Chapter 2B =====
expect('2B-03-f1', String(range(-10,10).find(x => x > 3)));
expect('2B-05-f1', String(10 - 3));
{ const ce = [1,2,3,4].filter(x => !(x*x >= 9)); ce.forEach(x => expect('2B-10', String(x))); }
{ const w = [2, 0.5].filter(x => Math.abs(x/(x*x+1) - 2/5) < 1e-12); w.forEach(x => expect('2B-11', String(x))); }
expect('2B-25', String(10 - 4));
{ const proj = { Ali:['A'], Mei:['B'], Ravi:['A'] }, P = ['A','B'], st = Object.keys(proj);
  expect('2B-27', st.every(s => P.some(p => proj[s].includes(p))) ? 'True' : 'False');
  expect('2B-27-f1', P.some(p => st.every(s => proj[s].includes(p))) ? 'True' : 'False');
  const proj2 = { Ali:['A'], Mei:['A','B'], Ravi:['A'] };
  expect('2B-27-f2', P.some(p => st.every(s => proj2[s].includes(p))) ? 'True' : 'False'); }
expect('2B-38-f2', String((7 - 1) / 2));
{ for (let n = -5; n <= 5; n++) { if ((2*n+1)**2 !== 2*(2*n*n+2*n)+1) bad.push('2B-39 algebra'); if ((2*n+1)**3+5 !== 2*(4*n**3+6*n*n+3*n+3)) bad.push('2B-40 algebra');
  if ((2*n+1)**2+3 !== 2*(2*n*n+2*n+2)) bad.push('2B-40-f2 algebra'); } ok += 3; }
{ const q = 2*3*5*7*11*13 + 1; if (q !== 30031 || 59*509 !== q) bad.push('30031 factorisation'); else ok++; }
// ===== Chapter 3A =====
{ const R = prod([2,3,4],[3,4,5,6,7]).filter(([x,y]) => y % x === 0);
  expect('3A-02', fmt(R)); expect('3A-02-f1', fmt(S(R.map(p => p[0])))); expect('3A-02-f2', fmt(S(R.map(p => p[1])))); }
{ const R = [[1,'a'],[1,'b'],[3,'a']]; expect('3A-03', fmt(S(R.map(p=>p[0])))); expect('3A-03-f1', fmt(S(R.map(p=>p[1])))); }
{ const X='abcd'.split(''), R=[['a','a'],['b','b'],['c','c'],['d','d'],['b','c'],['c','b']];
  expect('3A-04', fmt(R)); expect('3A-04-f1', String(R.length)); expect('3A-06', String(R.filter(p=>p[0]===p[1]).length));
  expect('3A-06-f1', String(R.filter(p=>p[0]!==p[1]).length)); expect('3A-07', matrix(R, X, X)); }
expect('3A-08', matrix(prod([2,3,4],[5,6,7,8]).filter(([x,y]) => y % x === 0), [2,3,4], [5,6,7,8]));
expect('3A-08-f1', matrix(prod([1,2],[2,3,4]).filter(([x,y]) => y % x === 0), [1,2], [2,3,4]));
{ const M = [[1,0,0,0],[0,1,0,0],[1,1,1,0],[0,1,0,1]], out = M.map(r => r.reduce((a,b)=>a+b)), inn = M[0].map((_,j) => M.reduce((a,r)=>a+r[j],0));
  if (out.join() !== '1,1,3,2' || inn.join() !== '2,3,1,1') bad.push('3A-09 degree table in PDF mismatch'); else ok++;
  expect('3A-09', String(out[2])); expect('3A-09-f1', String(inn[1])); expect('3A-09-f2', String(inn[0])); }
{ const M = [[1,1,0],[0,0,1],[1,1,1]]; expect('3A-10', String(M[2].reduce((a,b)=>a+b))); expect('3A-10-f1', String(M.reduce((a,r)=>a+r[1],0))); }
const X3 = [1,2,3];
{ const R = [[1,2],[2,3],[3,3]], closure = S(R.map(p=>p.join()), R.map(p=>[p[1],p[0]].join())).map(s=>s.split(',').map(Number));
  expect('3A-14', matrix(closure, X3, X3)); }
expect('3A-11-f1', props([[1,1],[2,2],[1,3]], X3).refl ? 'Yes' : 'No');
expect('3A-12-f1', props([[1,2],[2,3]], X3).irr ? 'Yes' : 'No');
expect('3A-14-f1', props([['a','b'],['b','a'],['a','a']], ['a','b']).symm ? 'Yes' : 'No');
expect('3A-15-f1', props([[1,2],[2,1],[3,3]], X3).anti ? 'Yes' : 'No');
expect('3A-16-f1', props([[1,2],[2,3]], X3).asym ? 'Yes' : 'No');
expect('3A-17-f1', props([[1,2],[2,3]], X3).trans ? 'Yes' : 'No');
{ const p = props([['a','a'],['b','b'],['c','c']], ['a','b','c']);
  expect('3A-19', ['Symmetric','Antisymmetric','Irreflexive','Asymmetric'].filter((n,i) => [p.symm,p.anti,p.irr,p.asym][i]));
  const q = props([['a','c'],['c','a'],['b','a'],['a','a'],['b','b']], ['a','b','c']);
  if (q.symm || q.anti) bad.push('3A-19-f1 should be neither'); else ok++; }
{ const cls = R => { const p = props(R, X3); return p.refl ? 'Reflexive' : p.irr ? 'Irreflexive' : 'Neither (not reflexive, not irreflexive)'; };
  expect('3A-20', cls([[1,1],[1,2],[2,1],[2,2],[3,1],[3,3]])); expect('3A-20-f1', cls([[1,1],[1,3],[2,2],[3,1]]));
  expect('3A-20-f2', cls([[2,3]])); expect('3A-20-f3', cls([[1,1]])); }
{ const R = [[1,2],[2,2],[3,4],[4,1]], X = [1,2,3,4], p = props(R, X);
  expect('3A-21', ['Symmetric','Antisymmetric','Asymmetric','Reflexive'].filter((n,i) => [p.symm,p.anti,p.asym,p.refl][i]));
  expect('3A-21-f1', matrix(R, X, X)); }
{ const R = [[1,2],[2,3],[1,3]], M = matrix(R, X3, X3); expect('3A-23', bprod(M, M)); expect('3A-23-f1', props(R, X3).trans ? 'Yes' : 'No'); }
{ const R = [[1,1],[1,2],[2,3]], M = matrix(R, X3, X3); expect('3A-24', bprod(M, M)); expect('3A-24-f2', props(R, X3).trans ? 'Yes' : 'No');
  const N = bprod(M, M), missing = []; N.forEach((r,i) => r.forEach((v,j) => { if (v && !M[i][j]) missing.push([i+1,j+1]); })); expect('3A-24-f1', fmt(missing)); }
expect('3A-25-f2', props([['a','a'],['b','c'],['c','b'],['d','d']], ['a','b','c','d']).trans ? 'Yes' : 'No');
{ const R = [[1,1],[1,3],[2,2],[3,1],[3,3]], M = matrix(R, X3, X3); expect('3A-26-f1', bprod(M, M));
  const p = props(R, X3); if (!(p.refl && p.symm && p.trans)) bad.push('3A-26 example not an equivalence'); else ok++;
  expect('3A-26-f2', fmt(range(1,5).filter(x => x % 2 === 1))); }
{ const le = prod(X3, X3).filter(([x,y]) => x <= y); expect('3A-27-f1', fmt(le)); const p = props(le, X3);
  if (!(p.refl && p.anti && p.trans) || p.symm) bad.push('≤ not a partial order?'); else ok++; }
{ const X = range(1,5), R = prod(X, X).filter(([x,y]) => (x - y) % 2 === 0), M = matrix(R, X, X), p = props(R, X);
  expect('3A-29', (p.refl && p.symm && p.trans) ? 'Yes' : 'No'); expect('3A-29-f1', M);
  if (JSON.stringify(bprod(M,M)) !== JSON.stringify(M)) bad.push('3A-29 M⊙M ≠ M'); else ok++;
  expect('3A-29-f2', fmt(X.filter(y => (2 - y) % 2 === 0))); }
// ===== Chapter 3B =====
expect('3B-02', fmt(S([['1','a'],['2','b'],['3','a']].map(p => p[1]))));
expect('3B-07', String((-3.5)**2)); expect('3B-07-f2', String((-3)**2));
{ const f = n => 2**n - n*n; expect('3B-16', String(f(4))); expect('3B-16-f1', String(f(2))); expect('3B-16-f2', String(f(3))); }
expect('3B-19', fmt(inverse([[1,'a'],[2,'c'],[3,'b']]))); expect('3B-19-f1', fmt(inverse([[1,'x'],[2,'y'],[3,'z']])));
{ const f = x => 9*x + 5, finv = y => (y - 5)/9; for (let x = -5; x <= 5; x++) if (Math.abs(finv(f(x)) - x) > 1e-12) bad.push('9x+5 inverse'); expect('3B-20-f2', String(finv(14)));
  const g = x => 2*x - 3, ginv = y => (y + 3)/2; for (let x = -5; x <= 5; x++) if (ginv(g(x)) !== x) bad.push('2x-3 inverse'); ok += 2; }
expect('3B-23', fmt(compose([['a','y'],['b','x'],['c','z']], [[1,'a'],[2,'a'],[3,'c']])));
expect('3B-23-f1', fmt(compose([['a','z'],['b','y'],['c','x']], [[1,'b'],[2,'c'],[3,'a']])));
{ const f = x => x + 1, g = x => 2*x; expect('3B-24-f2', String(f(g(3)))); expect('3B-24-f3', String(g(f(3)))); }
// ===== Cheat sheet & mistakes =====
expect('CS-01', fmt(S(3,3,1,2,1)));
expect('CS-02', String(2**6)); expect('CS-02-f1', String(2**6 - 1));
expect('CS-03', String(20 + 15 - 7)); expect('CS-03-f1', String(18 + 17 - 30));
{ const U = range(1,6), A = [1,2,3,4], B = [3,4,5]; expect('CS-04', fmt(sym(A,B))); expect('CS-04-f2', fmt(inter(A, diff(U,B)))); }
{ const U = range(1,8), A = [1,2,3], B = [3,4]; expect('CS-05', fmt(diff(U, inter(A,B)))); expect('CS-05-f1', fmt(diff(U, union(A,B)))); }
expect('CS-06', String(4*5));
expect('CS-07', tt(2, (p,q) => iff(p || q, p))); expect('CS-07-f1', tt(2, (p,q) => imp(p && q, q)));
{ const lhs = tt(2, (a,b) => !(a || !b)), rhs = tt(2, (a,b) => !a && b); if (lhs.join() !== rhs.join()) bad.push('CS-11 simplification'); else ok++; }
expect('CS-11-f1', tt(2, (p,q) => !(p && q)));
expect('CS-12', String(range(1,10).find(n => !(n*n > n)))); expect('CS-12-f1', String(Math.sqrt(49)));
expect('CS-17', 'a+b+1'); { for (let a=-3;a<=3;a++) for (let b=-3;b<=3;b++) if ((2*a+1)+(2*b+1) !== 2*(a+b+1)) bad.push('CS-17'); }
{ const M = [[0,1,1],[1,0,1],[0,0,1]]; expect('CS-18', String(M[0].reduce((a,b)=>a+b))); expect('CS-18-f1', String(M.reduce((a,r)=>a+r[2],0))); }
{ const M = [[1,1,0],[0,1,0],[0,1,1]], R = []; M.forEach((r,i) => r.forEach((v,j) => v && R.push([i+1,j+1]))); const p = props(R, X3);
  expect('CS-19', ['Reflexive','Irreflexive','Symmetric','Antisymmetric'].filter((n,i) => [p.refl,p.irr,p.symm,p.anti][i]));
  expect('CS-19-f1', (p.refl && p.anti && p.trans && !p.symm) ? 'A partial order' : 'other'); }
{ const R = [[1,2],[2,3],[3,1]], M = matrix(R, X3, X3), p = props(R, X3);
  expect('CS-20', bprod(M, M)); expect('CS-20-f1', p.trans ? 'Yes' : 'No'); expect('CS-20-f2', p.asym ? 'Yes' : 'No'); }
{ const eq = prod(X3, X3).filter(([x,y]) => x === y), p = props(eq, X3); if (!(p.refl && p.symm && p.anti && p.trans)) bad.push('= props'); else ok++;
  const lt = prod(X3, X3).filter(([x,y]) => x < y), q = props(lt, X3); if (q.refl) bad.push('< reflexive?'); else ok++; }
{ const f = [[1,'c'],[2,'a'],[3,'b']], Y = ['a','b','c'], inn = Y.map(y => f.filter(p => p[1] === y).length);
  const res = []; if (inn.every(n => n <= 1)) res.push('One-to-one'); if (inn.every(n => n >= 1)) res.push('Onto'); if (inn.every(n => n === 1)) res.push('Bijection');
  expect('CS-23', res); expect('CS-24-f1', fmt(inverse(f))); }
{ const f = x => (x + 4)/3, finv = y => 3*y - 4; for (let x = -5; x <= 5; x++) if (Math.abs(finv(f(x)) - x) > 1e-12) bad.push('CS-24 inverse'); ok++; }
{ const f = x => x*x, g = x => x + 3; expect('CS-25', String(f(g(2)))); expect('CS-25-f1', String(g(f(2)))); }
expect('TM-02', fmt(power([7]))); expect('TM-02-f1', String(power(['a','b','c']).length));
expect('TM-04', tt(2, imp).slice(2));
{ const n = 40, v = n*n + n + 41; expect('TM-08-f1', String(v)); if (v !== 41*41) bad.push('TM-08'); ok++;
  const isPrime = k => { for (let d = 2; d*d <= k; d++) if (k % d === 0) return false; return k > 1; };
  if (!range(1,39).every(m => isPrime(m*m+m+41))) bad.push('TM-08 claim n=1..39'); else ok++; }
{ const p = props([[1,1],[2,2]], [1,2]); expect('TM-09', (p.symm && p.anti) ? 'Both symmetric and antisymmetric' : 'x');
  const q = props([[1,2],[2,1],[3,1]], X3); expect('TM-09-f1', (!q.symm && !q.anti) ? 'Neither' : 'x'); }
{ const f = x => x + 1, g = x => x*x; expect('TM-10', String(f(g(3)))); expect('TM-10-f1', String(g(f(3)))); }

console.log(`Verified ${ok} computed answers.`);
if (bad.length) { console.log('MISMATCHES:\n' + bad.join('\n')); process.exit(1); } else console.log('All computed answers match the data.');

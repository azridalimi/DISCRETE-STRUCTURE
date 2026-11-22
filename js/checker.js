/* =========================================================================
   checker.js — answer normalisation and checking.
   Plain script: works in the browser (window.Checker) and in Node
   (module.exports) so the verification scripts use the exact same logic.
   ========================================================================= */
(function (root) {
  'use strict';

  /* ---------- 1. ASCII → math symbols --------------------------------- */
  // Multi-character operators (order matters: longest first).
  var MULTI = [
    ['<->', '↔'], ['<=>', '↔'], ['⟺', '↔'], ['⇔', '↔'],
    ['->', '→'], ['=>', '→'], ['⇒', '→'],
    ['!=', '≠'], ['<=', '≤'], ['>=', '≥'],
    ['||', '∨'], ['&&', '∧'], ['{}', '∅'], ['{ }', '∅'],
    ['...', '…']
  ];
  var SINGLE = { '~': '¬', '!': '¬', '&': '∧', '|': '∨', "'": '′', '’': '′', '\\': '−' };
  // Whole-word replacements (case-insensitive).
  var WORDS = [
    [/\bnot\s+in\b/gi, '∉'], [/\bnotin\b/gi, '∉'],
    [/\bfor\s+all\b/gi, '∀'], [/\bforall\b/gi, '∀'],
    [/\bthere\s+exists\b/gi, '∃'], [/\bexists\b/gi, '∃'],
    [/\bproper\s*subset\b/gi, '⊂'], [/\bpsubset\b/gi, '⊂'],
    [/\bsubseteq\b/gi, '⊆'], [/\bsubset\b/gi, '⊆'],
    [/\bunion\b/gi, '∪'], [/\bintersect(ion)?\b/gi, '∩'],
    [/\bxor\b/gi, '⊕'], [/\bimplies\b/gi, '→'], [/\biff\b/gi, '↔'],
    [/\bequiv\b/gi, '≡'], [/\bempty(set)?\b/gi, '∅'],
    [/\bin\b/gi, '∈'], [/\bnot\b/gi, '¬'], [/\band\b/gi, '∧'], [/\bor\b/gi, '∨']
  ];
  var OPERAND_END = /^([A-Za-z0-9_]+|[)\]}′∅ℕℤℚℝ])$/;
  var OPERAND_START = /^([A-Za-z0-9_]+|[(\[{∅ℕℤℚℝ¬])$/;

  // Single letters that are operators only in a binary position:
  //   A U B → A ∪ B,  A n B → A ∩ B,  A x B → A × B,  f o g → f ∘ g
  function binaryLetters(s) {
    var toks = s.match(/[A-Za-z0-9_]+|\s+|[\s\S]/g) || [];
    function prevTok(i) { for (var j = i - 1; j >= 0; j--) if (!/^\s+$/.test(toks[j])) return toks[j]; return null; }
    function nextTok(i) { for (var j = i + 1; j < toks.length; j++) if (!/^\s+$/.test(toks[j])) return toks[j]; return null; }
    for (var i = 0; i < toks.length; i++) {
      var t = toks[i];
      if (t !== 'U' && t !== 'n' && t !== 'x' && t !== 'o') continue;
      var p = prevTok(i), n = nextTok(i);
      if (!p || !n || !OPERAND_END.test(p) || !OPERAND_START.test(n)) continue;
      if (t === 'U') toks[i] = '∪';
      else if (t === 'n') toks[i] = '∩';
      else if (t === 'x') { if (/^[A-Z][′]?$|^[)}]$/.test(p) && /^[A-Z]$|^[({]$/.test(n)) toks[i] = '×'; }
      else if (t === 'o') { if (/^[a-z]$|^\)$/.test(p) && /^[a-z]$|^\($/.test(n)) toks[i] = '∘'; }
    }
    return toks.join('');
  }

  function toSymbols(input) {
    var s = String(input == null ? '' : input);
    MULTI.forEach(function (m) { s = s.split(m[0]).join(m[1]); });
    s = s.replace(/[~!&|'’\\]/g, function (c) { return SINGLE[c]; });
    WORDS.forEach(function (w) { s = s.replace(w[0], w[1]); });
    s = binaryLetters(s);
    s = s.replace(/¬\s*∈/g, '∉');
    return s;
  }

  /* ---------- 2. Canonical form for exact comparison ------------------ */
  var SUP = { '⁰': '^0', '¹': '^1', '²': '^2', '³': '^3', '⁴': '^4', '⁵': '^5', '⁶': '^6', '⁷': '^7', '⁸': '^8', '⁹': '^9', 'ⁿ': '^n', '⁺': '+', '⁻': '^-' };
  var SUB = { '₀': '0', '₁': '1', '₂': '2', '₃': '3', '₄': '4', '₅': '5', '₆': '6', '₇': '7', '₈': '8', '₉': '9', 'ᵢ': 'i', 'ⱼ': 'j', 'ₙ': 'n' };
  var LETTERS = { 'ℕ': 'N', 'ℤ': 'Z', 'ℚ': 'Q', 'ℝ': 'R' };

  function canon(input) {
    var s = toSymbols(input);
    s = s.replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹ⁿ⁺⁻]/g, function (c) { return SUP[c]; });
    s = s.replace(/[₀₁₂₃₄₅₆₇₈₉ᵢⱼₙ]/g, function (c) { return SUB[c]; });
    s = s.replace(/[ℕℤℚℝ]/g, function (c) { return LETTERS[c]; });
    s = s.replace(/[−–—∖]/g, '-').replace(/[·⋅]/g, '*').replace(/∎/g, '');
    s = s.replace(/\s+/g, '').toLowerCase();
    s = s.replace(/\.$/, '');
    return s;
  }

  /* ---------- 3. Set parsing ------------------------------------------ */
  // Grammar:  value := set | tuple | atom ;  set := { values } ; tuple := ( values )
  function parseSet(input) {
    var s = canon(input);
    if (!s) return null;
    if (s === '∅') s = '{}';
    if (s[0] !== '{') s = '{' + s + '}';
    var i = 0;
    function value() {
      if (s[i] === '{') return group('{', '}', 'set');
      if (s[i] === '(') return group('(', ')', 'tuple');
      var start = i;
      while (i < s.length && ',})'.indexOf(s[i]) < 0) {
        if (s[i] === '{' || s[i] === '(') throw new Error('bad');
        i++;
      }
      var atom = s.slice(start, i);
      if (atom === '') throw new Error('empty');
      if (atom === '∅') return { k: 'set', v: [] };
      return { k: 'atom', v: atom };
    }
    function group(open, close, kind) {
      i++; var items = [];
      if (s[i] === close) { i++; return { k: kind, v: items }; }
      for (;;) {
        items.push(value());
        if (s[i] === ',') { i++; continue; }
        if (s[i] === close) { i++; return { k: kind, v: items }; }
        throw new Error('bad');
      }
    }
    try {
      var v = value();
      if (i !== s.length) return null;
      return v;
    } catch (e) { return null; }
  }
  function canonValue(v) {
    if (v.k === 'atom') return v.v;
    var parts = v.v.map(canonValue);
    if (v.k === 'tuple') return '(' + parts.join(',') + ')';
    var uniq = parts.filter(function (p, idx) { return parts.indexOf(p) === idx; }).sort();
    return '{' + uniq.join(',') + '}';
  }
  function setElements(input) {
    var v = parseSet(input);
    if (!v || v.k !== 'set') return null;
    var parts = v.v.map(canonValue);
    return parts.filter(function (p, idx) { return parts.indexOf(p) === idx; });
  }

  /* ---------- 4. Explain (keyword) scoring ---------------------------- */
  function normText(s) {
    return String(s || '').toLowerCase()
      .replace(/[’']/g, '')
      .replace(/[!-/:-@[-`{-~“”«»…–—]/g, ' ')
      .replace(/\s+/g, ' ').trim();
  }
  function lev(a, b) {
    if (a === b) return 0;
    var m = a.length, n = b.length, d = [], i, j;
    for (i = 0; i <= m; i++) { d[i] = [i]; }
    for (j = 0; j <= n; j++) { d[0][j] = j; }
    for (i = 1; i <= m; i++) for (j = 1; j <= n; j++) {
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    }
    return d[m][n];
  }
  function stem(w) { return w.length > 3 ? w.replace(/(es|s)$/, '') : w; }
  function wordMatch(w, k) {
    if (w === k || stem(w) === stem(k)) return true;
    if (k.length >= 6 && w.length >= 4 && lev(w, k) <= 2) return true;
    return false;
  }
  function hasKeyword(words, joined, syn) {
    var k = normText(syn);
    if (!k) return false;
    if (!/[a-z0-9]/.test(k)) return joined.indexOf(k) >= 0; // pure symbols
    var kw = k.split(' ');
    for (var i = 0; i + kw.length <= words.length; i++) {
      var ok = true;
      for (var j = 0; j < kw.length; j++) if (!wordMatch(words[i + j], kw[j])) { ok = false; break; }
      if (ok) return true;
    }
    // symbols glued to text, e.g. "p→q"
    return /[^a-z0-9 ]/.test(k) && joined.indexOf(k) >= 0;
  }
  function checkExplain(text, keywords) {
    var joined = normText(text), words = joined ? joined.split(' ') : [];
    var found = [], missed = [];
    (keywords || []).forEach(function (group) {
      var g = Array.isArray(group) ? group : [group];
      if (g.some(function (syn) { return hasKeyword(words, joined, syn); })) found.push(g[0]);
      else missed.push(g[0]);
    });
    var total = found.length + missed.length;
    var pct = total ? Math.round((found.length / total) * 100) : 0;
    var verdict = pct >= 70 ? 'correct' : pct >= 40 ? 'almost' : 'wrong';
    return { verdict: verdict, pct: pct, found: found, missed: missed };
  }

  /* ---------- 5. Main entry ------------------------------------------- */
  // item: a statement or follow-up; response depends on type.
  function check(item, response) {
    var type = item.type;
    if (type === 'explain') return checkExplain(response, item.keywords);

    if (type === 'exact') {
      var forms = Array.isArray(item.answer) ? item.answer : [item.answer];
      var r = canon(response);
      if (!r) return { verdict: 'wrong', empty: true };
      var ok = forms.some(function (f) { return canon(f) === r; });
      return { verdict: ok ? 'correct' : 'wrong' };
    }

    if (type === 'set') {
      var want = setElements(item.answer);
      var got = setElements(response);
      if (!got) return { verdict: 'wrong', unreadable: true };
      var missing = want.filter(function (e) { return got.indexOf(e) < 0; });
      var extra = got.filter(function (e) { return want.indexOf(e) < 0; });
      return { verdict: (!missing.length && !extra.length) ? 'correct' : 'wrong', missingCount: missing.length, extra: extra };
    }

    if (type === 'truthtable') {
      var wrongRows = [];
      item.answer.forEach(function (v, i) {
        if (String(response[i] || '').toUpperCase() !== String(v).toUpperCase()) wrongRows.push(i);
      });
      return { verdict: wrongRows.length ? 'wrong' : 'correct', wrongCells: wrongRows };
    }

    if (type === 'matrix') {
      var cells = [];
      item.answer.forEach(function (row, i) {
        row.forEach(function (v, j) {
          if (Number((response[i] || [])[j] || 0) !== Number(v)) cells.push([i, j]);
        });
      });
      return { verdict: cells.length ? 'wrong' : 'correct', wrongCells: cells };
    }

    if (type === 'choice') {
      var ans = Array.isArray(item.answer) ? item.answer.slice().sort() : [item.answer];
      var resp = Array.isArray(response) ? response.slice().sort() : [response];
      var same = ans.length === resp.length && ans.every(function (a, i) { return a === resp[i]; });
      return { verdict: same ? 'correct' : 'wrong' };
    }
    return { verdict: 'wrong' };
  }

  var api = {
    toSymbols: toSymbols, canon: canon, parseSet: parseSet, setElements: setElements,
    checkExplain: checkExplain, lev: lev, check: check, normText: normText
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.Checker = api;
})(this);

/* =========================================================================
   data.js — every note + question for the Discrete Structures study app.
   Built from Discrete_Structures_Notes.pdf. See COVERAGE.md for the map
   from each PDF sub-heading to the statement IDs below.

   Statement format (after the S() helper expands the short keys):
   {
     id, topic, section, kind, title,
     note,        // HTML shown in the NOTE phase
     question,    // HTML shown in the ANSWER phase
     type,        // explain | exact | set | truthtable | matrix | choice
     answer,      // reference answer (exact: array of accepted forms)
     keywords,    // explain: [[keyword, synonym, …], …]
     options,     // choice: list of options (answer may be an array → multi-select)
     table,       // truthtable: { cols:[…, result], rows:[[given values]…] }
     grid,        // matrix: { rows:[labels], cols:[labels] }
     hint, followUps:[ {same fields} ], mcq:{ question, options, answer:index }
   }
   kind: def | table | example | tip | watch | quick | proof | cheat | mistake
   ========================================================================= */
(function (root) {
  'use strict';
  var TOPICS = [
    { id: '1',  num: '1',  name: 'Set Theory',             sub: 'Sets, subsets, power sets, operations, laws, Cartesian product', accent: 'yellow' },
    { id: '2A', num: '2A', name: 'Fundamentals of Logic',  sub: 'Propositions, connectives, truth tables, equivalences', accent: 'coral' },
    { id: '2B', num: '2B', name: 'Quantifiers & Proof',    sub: '∀, ∃, nested quantifiers, proof techniques', accent: 'blue' },
    { id: '3A', num: '3A', name: 'Relations',              sub: 'Representations, properties, equivalence, partial order', accent: 'pink' },
    { id: '3B', num: '3B', name: 'Functions',              sub: 'One-to-one, onto, bijection, inverse, composition', accent: 'yellow' },
    { id: 'S',  num: '★',  name: 'Cheat Sheet & Top 10 Mistakes', sub: 'Mixed revision of everything', accent: 'coral' }
  ];
  var LIST = [];

  /* ---------- HTML helpers (produce plain strings) ---------------------- */
  function tbl(head, rows) {
    var h = '<table class="nt"><thead><tr>' + head.map(function (c) { return '<th>' + c + '</th>'; }).join('') + '</tr></thead><tbody>';
    rows.forEach(function (r) { h += '<tr>' + r.map(function (c) { return '<td>' + c + '</td>'; }).join('') + '</tr>'; });
    return h + '</tbody></table>';
  }
  // Relation / truth matrix. diag=true outlines the main diagonal.
  function mx(rl, cl, M, diag) {
    var h = '<table class="mx"><thead><tr><th></th>' + cl.map(function (c) { return '<th>' + c + '</th>'; }).join('') + '</tr></thead><tbody>';
    M.forEach(function (row, i) {
      h += '<tr><th>' + rl[i] + '</th>' + row.map(function (v, j) {
        var cls = (diag && i === j ? 'dg ' : '') + (v ? 'one' : '');
        return '<td class="' + cls + '">' + v + '</td>';
      }).join('') + '</tr>';
    });
    return h + '</tbody></table>';
  }
  var vid = 0;
  // Venn diagram: kind = union | inter | diff | sym | comp | disjoint | subset
  function venn(kind, label) {
    var n = 'v' + (vid++);
    var A = '<circle cx="62" cy="55" r="32"/>', B = '<circle cx="98" cy="55" r="32"/>';
    var defs = '<defs><clipPath id="' + n + 'a">' + A + '</clipPath><clipPath id="' + n + 'b">' + B + '</clipPath>' +
      '<mask id="' + n + 'nb"><rect width="160" height="110" fill="#fff"/><circle cx="98" cy="55" r="32" fill="#000"/></mask>' +
      '<mask id="' + n + 'na"><rect width="160" height="110" fill="#fff"/><circle cx="62" cy="55" r="32" fill="#000"/></mask></defs>';
    var sh = '';
    if (kind === 'union') sh = '<g class="vs">' + A + B + '</g>';
    if (kind === 'inter') sh = '<g class="vs" clip-path="url(#' + n + 'a)">' + B + '</g>';
    if (kind === 'diff') sh = '<g class="vs" mask="url(#' + n + 'nb)">' + A + '</g>';
    if (kind === 'sym') sh = '<g class="vs" mask="url(#' + n + 'nb)">' + A + '</g><g class="vs" mask="url(#' + n + 'na)">' + B + '</g>';
    if (kind === 'comp') sh = '<g class="vs" mask="url(#' + n + 'na)"><rect x="6" y="6" width="148" height="98" rx="8"/></g>';
    var circles = '<g class="vl">' + A + B + '</g>', lab = '<text x="44" y="30">A</text><text x="110" y="30">B</text>';
    if (kind === 'disjoint') {
      circles = '<g class="vl"><circle cx="48" cy="55" r="26"/><circle cx="112" cy="55" r="26"/></g>';
      lab = '<text x="44" y="60">A</text><text x="108" y="60">B</text>';
    }
    if (kind === 'subset') {
      circles = '<g class="vl"><circle cx="80" cy="55" r="40"/></g><g class="vs"><circle cx="80" cy="62" r="18"/></g><g class="vl"><circle cx="80" cy="62" r="18"/></g>';
      lab = '<text x="76" y="67">A</text><text x="104" y="30">B</text>';
    }
    return '<figure class="venn"><svg viewBox="0 0 160 110" role="img" aria-label="Venn diagram: ' + (label || kind) + '">' + defs +
      '<rect class="vu" x="6" y="6" width="148" height="98" rx="8"/>' + sh + circles + lab + '<text x="12" y="20" class="vt">U</text></svg>' +
      '<figcaption>' + (label || '') + '</figcaption></figure>';
  }
  // Arrow diagram for functions: X, Y = labels; pairs = [[x,y],…]
  function arrows(X, Y, pairs, caption) {
    var h = Math.max(X.length, Y.length) * 30 + 30;
    function yPos(i, len) { return 25 + i * ((h - 40) / Math.max(len - 1, 1)) + (len === 1 ? (h - 40) / 2 : 0); }
    var s = '<figure class="arrows"><svg viewBox="0 0 170 ' + (h + 10) + '" role="img" aria-label="Arrow diagram ' + caption + '">' +
      '<defs><marker id="ah" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,0L10,5L0,10z" class="ahd"/></marker></defs>' +
      '<ellipse class="vl" cx="35" cy="' + (h / 2 + 5) + '" rx="24" ry="' + (h / 2) + '"/><ellipse class="vl" cx="135" cy="' + (h / 2 + 5) + '" rx="24" ry="' + (h / 2) + '"/>' +
      '<text x="31" y="10" class="vt">X</text><text x="131" y="10" class="vt">Y</text>';
    X.forEach(function (x, i) { s += '<text x="30" y="' + (yPos(i, X.length) + 5) + '">' + x + '</text>'; });
    Y.forEach(function (y, i) { s += '<text x="131" y="' + (yPos(i, Y.length) + 5) + '">' + y + '</text>'; });
    pairs.forEach(function (p) {
      var y1 = yPos(X.indexOf(p[0]), X.length), y2 = yPos(Y.indexOf(p[1]), Y.length);
      s += '<line class="arr" x1="42" y1="' + y1 + '" x2="124" y2="' + y2 + '" marker-end="url(#ah)"/>';
    });
    return s + '</svg><figcaption>' + caption + '</figcaption></figure>';
  }
  var TT1 = [['T'], ['F']];
  var TT2 = [['T', 'T'], ['T', 'F'], ['F', 'T'], ['F', 'F']];
  var TT3 = [['T', 'T', 'T'], ['T', 'T', 'F'], ['T', 'F', 'T'], ['T', 'F', 'F'], ['F', 'T', 'T'], ['F', 'T', 'F'], ['F', 'F', 'T'], ['F', 'F', 'F']];
  function tt(cols, rows) { return { cols: cols, rows: rows }; }

  /* ---------- Statement builder (expands short keys) ------------------- */
  function item(o, id) {
    var it = {
      id: id, note: o.note || '', question: o.q, type: o.type || 'exact',
      answer: o.ans, hint: o.hint || ''
    };
    if (o.kw) it.keywords = o.kw;
    if (o.opts) it.options = o.opts;
    if (o.table) it.table = o.table;
    if (o.grid) it.grid = o.grid;
    return it;
  }
  function S(o) {
    var st = item(o, o.id);
    st.topic = o.t; st.section = o.sec; st.kind = o.kind || 'def'; st.title = o.title;
    st.followUps = (o.fu || []).map(function (f, i) { return item(f, o.id + '-f' + (i + 1)); });
    st.mcq = { question: o.mcq[0], options: o.mcq.slice(1), answer: 0 };
    // reorder keys for readability in exports
    LIST.push({
      id: st.id, topic: st.topic, section: st.section, kind: st.kind, title: st.title,
      note: st.note, question: st.question, type: st.type, answer: st.answer,
      keywords: st.keywords, options: st.options, table: st.table, grid: st.grid,
      hint: st.hint, followUps: st.followUps, mcq: st.mcq
    });
  }
  var YN = ['Yes', 'No'];
  var TF = ['True', 'False'];

  /* =====================================================================
     CHAPTER 1 — SET THEORY
     ===================================================================== */
  // ---- 1.1 What is a set? ----
  S({ id: '1-01', t: '1', sec: '1.1', kind: 'def', title: `What is a set?`,
    note: `A <b>set</b> is a <b>well-defined</b> collection of <b>distinct</b> objects called <b>elements</b> (members).<br>"Well-defined" means you can always say <i>for certain</i> whether something is in the set or not.`,
    q: `In your own words: what is a set, and what does "well-defined" mean?`, type: 'explain',
    kw: [['collection', 'group', 'bunch'], ['distinct', 'different', 'unique', 'no duplicates', 'no repeats'], ['elements', 'members', 'objects', 'items'],
      ['well-defined', 'well defined', 'clearly defined'], ['certain', 'for sure', 'always', 'decide', 'whether', 'tell']],
    ans: `A set is a well-defined collection of distinct objects (elements). Well-defined: you can always say for certain whether something is in the set or not.`,
    hint: `Use 3 ideas: what kind of collection, what the objects are called, and what "well-defined" lets you decide.`,
    fu: [{ note: `Well-defined = membership can always be decided for certain. Vague words like "good", "tall", "interesting" are not well-defined.`,
      q: `Which of these is a well-defined set?`, type: 'choice',
      opts: [`The integers between 1 and 5`, `The good films of 2020`, `The tall students in the class`, `The interesting numbers`],
      ans: `The integers between 1 and 5`, hint: `Pick the one where everybody would agree on every member.` }],
    mcq: [`A set is a well-defined collection of…`, `distinct objects`, `ordered objects`, `objects that may repeat`, `numbers only`] });

  S({ id: '1-02', t: '1', sec: '1.1', kind: 'def', title: `Golden rule 1: order doesn't matter`,
    note: `<b>Order doesn't matter</b> in a set: {1,2,3,4} = {4,1,3,2}. A set only cares <i>which</i> elements are in it.`,
    q: `Is {1,2,3,4} = {4,1,3,2}?`, type: 'choice',
    opts: [`Yes, order doesn't matter in a set`, `No, the order is different`, `Only if they are ordered pairs`, `Only for sets of numbers`],
    ans: `Yes, order doesn't matter in a set`, hint: `Do both sets contain exactly the same elements?`,
    fu: [{ note: `Order doesn't matter in sets, so {x, y} and {y, x} contain the same elements.`,
      q: `True or false: {x, y} = {y, x}`, type: 'choice', opts: TF, ans: 'True', hint: `Compare the elements, not their positions.` }],
    mcq: [`Which is equal to {a, b, c}?`, `{c, a, b}`, `(a, b, c)`, `{a, b}`, `{{a}, b, c}`] });

  S({ id: '1-03', t: '1', sec: '1.1', kind: 'def', title: `Golden rule 2: duplicates don't count`,
    note: `<b>Duplicates don't count:</b> {a,b,c,a,c} = {a,b,c}. Writing an element twice doesn't add anything.`,
    q: `Simplify {a, b, c, a, c} (write the set without duplicates).`, type: 'set', ans: '{a,b,c}',
    hint: `Keep each different element once.`,
    fu: [{ note: `Duplicates don't count, so you count each distinct element once.`, q: `How many elements does {2, 2, 3, 3, 3} have?`, type: 'exact', ans: ['2'], hint: `How many DIFFERENT values appear?` }],
    mcq: [`|{a, b, c, a, c}| = ?`, `3`, `5`, `4`, `2`] });

  S({ id: '1-04', t: '1', sec: '1.1', kind: 'def', title: `Notation: capitals, lowercase, ∈ and ∉`,
    note: `Sets use CAPITALS (A, B); elements use lowercase (a, x).<br><b>x ∈ A</b> means "x belongs to A"; <b>x ∉ A</b> means "x does not belong to A".`,
    q: `What do x ∈ A and x ∉ A mean?`, type: 'explain',
    kw: [['belongs', 'element', 'member', 'is in', 'inside'], ['does not', 'doesnt', 'not an element', 'not a member', 'not in', 'isnt']],
    ans: `x ∈ A: x belongs to (is an element of) A. x ∉ A: x does not belong to A.`, hint: `One symbol says "belongs to", the other is its negation.`,
    fu: [{ note: `Convention: capitals = sets, lowercase = elements.`, q: `Following the usual convention, which name most likely refers to a set?`, type: 'choice',
      opts: ['B', 'b', 'x', 'a'], ans: 'B', hint: `Sets get capital letters.` }],
    mcq: [`"x ∉ A" is read as…`, `x does not belong to A`, `x is a subset of A`, `A belongs to x`, `x is the complement of A`] });

  S({ id: '1-05', t: '1', sec: '1.1', kind: 'example', title: `Example: membership in A = {{1}, {2}, 3, 4}`,
    note: `A = {{1}, {2}, 3, 4}<br>{2} ∈ A ✔ (the set {2} is an element)<br>1 ∉ A ✔ (1 is <i>inside</i> {1}, but 1 itself is not an element of A)`,
    q: `A = {{1}, {2}, 3, 4}. Is 1 ∈ A?`, type: 'choice',
    opts: [`No: 1 is inside {1}, but 1 itself is not an element of A`, `Yes: 1 appears inside A`, `Yes: {1} and 1 are the same thing`, `It cannot be decided`],
    ans: `No: 1 is inside {1}, but 1 itself is not an element of A`, hint: `List the elements of A one by one. Is the number 1 on that list?`,
    fu: [{ note: `The elements of A = {{1}, {2}, 3, 4} are: {1}, {2}, 3 and 4.`, q: `What is |A| (the number of elements of A)?`, type: 'exact', ans: ['4'], hint: `Count the top-level items separated by commas.` },
      { note: `{2} is one of the listed elements of A = {{1}, {2}, 3, 4}.`, q: `Is {2} ∈ A?`, type: 'choice', opts: YN, ans: 'Yes', hint: `Is the set {2} itself one of the listed elements?` }],
    mcq: [`A = {{1}, {2}, 3, 4}. Which is TRUE?`, `{2} ∈ A`, `1 ∈ A`, `2 ∈ A`, `{3} ∈ A`] });

  // Three ways to describe a set (table rows)
  S({ id: '1-06', t: '1', sec: '1.1', kind: 'table', title: `Describing a set: complete list (roster)`,
    note: tbl(['Method', 'Example', 'Idea'], [['Complete list (roster)', '{2, 4, 6, 8}', 'Write every element in braces { }']]),
    q: `Write {2, 4, …, 8} as a complete list (roster).`, type: 'set', ans: '{2,4,6,8}', hint: `Fill in every element the "…" stands for.`,
    fu: [{ note: `Roster = write every element in braces.`, q: `Write the set of the first five positive odd numbers as a roster.`, type: 'set', ans: '{1,3,5,7,9}', hint: `Start at 1 and add 2 each time.` }],
    mcq: [`The roster method means…`, `writing every element in braces`, `giving a rule after "|"`, `drawing a Venn diagram`, `showing a pattern with "…"`] });

  S({ id: '1-07', t: '1', sec: '1.1', kind: 'table', title: `Describing a set: pattern + ellipsis`,
    note: tbl(['Method', 'Example', 'Idea'], [['Pattern + ellipsis', '{2, 4, …, 8}', 'Show enough to see the pattern, then "…"']]),
    q: `Which description uses pattern + ellipsis?`, type: 'choice',
    opts: ['{2, 4, …, 8}', '{2, 4, 6, 8}', '{x ∈ ℤ | 2 ≤ x ≤ 8, x even}', '{8}'], ans: '{2, 4, …, 8}', hint: `Look for the "…".`,
    fu: [{ note: `Pattern + ellipsis: {1, 3, 5, …, 11} continues the pattern (+2) up to 11.`, q: `Write {1, 3, 5, …, 11} as a complete list.`, type: 'set', ans: '{1,3,5,7,9,11}', hint: `Keep adding 2 until you reach 11.` }],
    mcq: [`In {2, 4, …, 8}, the "…" means…`, `continue the visible pattern`, `the set is infinite`, `the elements are unknown`, `the set is empty`] });

  S({ id: '1-08', t: '1', sec: '1.1', kind: 'table', title: `Describing a set: set-builder notation`,
    note: tbl(['Method', 'Example', 'Idea'], [['Set-builder notation', '{x ∈ ℤ | 2 ≤ x ≤ 8, x even}', 'A <b>rule</b> decides membership. "|" reads "such that"']]),
    q: `In set-builder notation, how do you read the symbol "|"?`, type: 'exact', ans: ['such that', 'st', 's.t.', 'where'], hint: `Two words: "all integers x ____ ____ 2 ≤ x ≤ 8".`,
    fu: [{ note: `{x ∈ ℤ | 2 ≤ x ≤ 8, x even}: the rule keeps the even integers from 2 to 8.`, q: `List {x ∈ ℤ | 2 ≤ x ≤ 8, x even}.`, type: 'set', ans: '{2,4,6,8}', hint: `Integers from 2 to 8, keep only the even ones.` }],
    mcq: [`In set-builder notation, the symbol "|" reads…`, `"such that"`, `"divides"`, `"or"`, `"absolute value"`] });

  S({ id: '1-09', t: '1', sec: '1.1', kind: 'example', title: `Example: set-builder`,
    note: `A = {x ∈ ℤ | 0 &lt; x &lt; 7} → read: "all integers x such that 0 &lt; x &lt; 7".<br>So A = {1, 2, 3, 4, 5, 6}.<br>B = {x ∈ ℤ | x &gt; 0} = {1, 2, 3, …}`,
    q: `List A = {x ∈ ℤ | 0 &lt; x &lt; 7}.`, type: 'set', ans: '{1,2,3,4,5,6}', hint: `Strict inequalities: 0 and 7 are NOT included.`,
    fu: [{ note: `Same method: read the rule, list every integer that passes it. Watch &lt; versus ≤.`, q: `List {x ∈ ℤ | −2 ≤ x &lt; 2}.`, type: 'set', ans: '{-2,-1,0,1}', hint: `−2 is included (≤) but 2 is not (&lt;).` },
      { note: `B = {x ∈ ℤ | x &gt; 0} = {1, 2, 3, …} never stops.`, q: `Is B = {x ∈ ℤ | x &gt; 0} finite or infinite?`, type: 'choice', opts: ['Infinite', 'Finite'], ans: 'Infinite', hint: `Is there a largest positive integer?` }],
    mcq: [`{x ∈ ℤ | 0 < x < 7} = ?`, `{1, 2, 3, 4, 5, 6}`, `{0, 1, 2, 3, 4, 5, 6, 7}`, `{1, 2, 3, 4, 5, 6, 7}`, `{0, 1, 2, 3, 4, 5, 6}`] });

  // Common number sets (table rows)
  S({ id: '1-10', t: '1', sec: '1.1', kind: 'table', title: `Number set ℕ (natural numbers)`,
    note: tbl(['Symbol', 'Name', 'Examples'], [['ℕ', 'Natural numbers (here: positive integers)', '1, 2, 3, …']]),
    q: `In these notes, is 0 ∈ ℕ?`, type: 'choice', opts: [`No: here ℕ = positive integers 1, 2, 3, …`, `Yes: ℕ always contains 0`, `Only sometimes`, `ℕ is empty`],
    ans: `No: here ℕ = positive integers 1, 2, 3, …`, hint: `Read the "Name" column carefully: "(here: …)".`,
    fu: [{ note: `ℕ = {1, 2, 3, …} in these notes.`, q: `What is the smallest element of ℕ (as defined here)?`, type: 'exact', ans: ['1'], hint: `Positive integers only.` }],
    mcq: [`In these notes ℕ means…`, `the positive integers 1, 2, 3, …`, `all integers`, `all fractions`, `the real numbers`] });

  S({ id: '1-11', t: '1', sec: '1.1', kind: 'table', title: `Number set ℤ (integers)`,
    note: tbl(['Symbol', 'Name', 'Examples'], [['ℤ', 'Integers', '…, −2, −1, 0, 1, 2, …']]),
    q: `What is the smallest of the sets ℕ, ℤ, ℚ, ℝ that contains −2?`, type: 'choice', opts: ['ℤ', 'ℕ', 'ℚ', 'ℝ'], ans: 'ℤ', hint: `−2 is a whole number but not positive.`,
    fu: [{ note: `ℤ contains negatives, 0 and positives: …, −2, −1, 0, 1, 2, …`, q: `Is 0 ∈ ℤ?`, type: 'choice', opts: YN, ans: 'Yes', hint: `Look at the examples listed for ℤ.` }],
    mcq: [`Which number is in ℤ but NOT in ℕ?`, `−1`, `3`, `1/2`, `√2`] });

  S({ id: '1-12', t: '1', sec: '1.1', kind: 'table', title: `Number set ℚ (rationals)`,
    note: tbl(['Symbol', 'Name', 'Examples'], [['ℚ', 'Rationals: a/b, b ≠ 0', '1/2, −3, 0.75']]),
    q: `Write 0.75 as a fraction a/b in lowest terms.`, type: 'exact', ans: ['3/4'], hint: `0.75 = 75/100. Simplify.`,
    fu: [{ note: `A rational number can be written as a/b with b ≠ 0. −3 = −3/1.`, q: `Is −3 ∈ ℚ?`, type: 'choice', opts: YN, ans: 'Yes', hint: `Can you write −3 as a fraction?` }],
    mcq: [`ℚ is the set of numbers of the form…`, `a/b with b ≠ 0`, `a/b with a ≠ 0`, `√a`, `only positive fractions`] });

  S({ id: '1-13', t: '1', sec: '1.1', kind: 'table', title: `Number set ℝ (reals)`,
    note: tbl(['Symbol', 'Name', 'Examples'], [['ℝ', 'Reals: rationals + irrationals', '−2, 1/2, √2, π']]),
    q: `Which number is in ℝ but NOT in ℚ?`, type: 'choice', opts: ['√2', '1/2', '−3', '0.75'], ans: '√2', hint: `Which one cannot be written as a fraction a/b?`,
    fu: [{ note: `ℝ = rationals + irrationals (like √2 and π).`, q: `Is π a real number?`, type: 'choice', opts: YN, ans: 'Yes', hint: `Look at the examples for ℝ.` }],
    mcq: [`ℝ consists of…`, `rationals + irrationals`, `integers only`, `rationals only`, `positive numbers only`] });

  S({ id: '1-14', t: '1', sec: '1.1', kind: 'tip', title: `Memory tip: ℕ ⊂ ℤ ⊂ ℚ ⊂ ℝ`,
    note: `ℕ ⊂ ℤ ⊂ ℚ ⊂ ℝ: each set sits inside the next one, like nesting dolls. ℤ comes from German <i>Zahlen</i> ("numbers"), and ℚ is for <i>quotient</i>.`,
    q: `Fill the chain ℕ ⊂ ? ⊂ ? ⊂ ℝ. Type the two missing sets separated by a comma.`, type: 'exact', ans: ['ℤ, ℚ', 'ℤ ⊂ ℚ', 'ℤ ⊆ ℚ', 'ℕ ⊂ ℤ ⊂ ℚ ⊂ ℝ', 'ℕ ⊆ ℤ ⊆ ℚ ⊆ ℝ'], hint: `Nesting dolls: integers, then fractions.`,
    fu: [{ note: `ℚ is for quotient (a fraction a/b is a quotient).`, q: `The letter ℚ stands for which word?`, type: 'exact', ans: ['quotient'], hint: `The result of a division.` },
      { note: `ℤ comes from the German word Zahlen ("numbers").`, q: `ℤ comes from which German word?`, type: 'exact', ans: ['Zahlen'], hint: `German for "numbers", starts with Z.` }],
    mcq: [`Which chain is correct?`, `ℕ ⊂ ℤ ⊂ ℚ ⊂ ℝ`, `ℤ ⊂ ℕ ⊂ ℚ ⊂ ℝ`, `ℕ ⊂ ℚ ⊂ ℤ ⊂ ℝ`, `ℝ ⊂ ℚ ⊂ ℤ ⊂ ℕ`] });

  // ---- 1.2 Types of sets ----
  S({ id: '1-15', t: '1', sec: '1.2', kind: 'table', title: `Empty set ∅`,
    note: tbl(['Type', 'Meaning', 'Example'], [['Empty set ∅ or { }', 'Has no elements', '{x ∈ ℤ⁺ | x³ &lt; 0} = ∅']]),
    q: `Write {x ∈ ℤ⁺ | x³ &lt; 0} as a set.`, type: 'set', ans: '∅', hint: `Can a positive integer have a negative cube?`,
    fu: [{ note: `∅ (also written { }) has no elements.`, q: `|∅| = ?`, type: 'exact', ans: ['0'], hint: `How many elements does the empty set have?` }],
    mcq: [`{x ∈ ℤ⁺ | x³ < 0} = ?`, `∅`, `{0}`, `{−1}`, `ℤ⁻`] });

  S({ id: '1-16', t: '1', sec: '1.2', kind: 'table', title: `Equal sets A = B`,
    note: tbl(['Type', 'Meaning', 'Example'], [['Equal sets A = B', 'Exactly the <b>same elements</b>', '{a,b,c} = {b,c,a}; {1,2,3,4} = {x ∈ ℤ⁺ | 2x &lt; 10}']]),
    q: `List {x ∈ ℤ⁺ | 2x &lt; 10}.`, type: 'set', ans: '{1,2,3,4}', hint: `2x &lt; 10 means x &lt; 5. Positive integers only.`,
    fu: [{ note: `Equal sets have exactly the same elements, in any order.`, q: `Is {a, b, c} = {b, c, a}?`, type: 'choice', opts: YN, ans: 'Yes', hint: `Same elements?` }],
    mcq: [`A = B means…`, `A and B have exactly the same elements`, `A and B have the same number of elements`, `A ⊂ B`, `A and B are disjoint`] });

  S({ id: '1-17', t: '1', sec: '1.2', kind: 'table', title: `Equivalent sets`,
    note: tbl(['Type', 'Meaning', 'Example'], [['Equivalent sets', 'Same <b>number</b> of elements (|A| = |B|), elements can differ', '{A,B,C,D,E} and {1,2,3,4,5}']]),
    q: `{A,B,C,D,E} and {1,2,3,4,5} are…`, type: 'choice', opts: [`Equivalent but not equal`, `Equal`, `Equal and equivalent`, `Neither`], ans: `Equivalent but not equal`, hint: `Same elements? Same count?`,
    fu: [{ note: `Equivalent sets: |A| = |B|.`, q: `What must be the same for two sets to be equivalent?`, type: 'explain', kw: [['number', 'size', 'count', 'cardinality', 'how many', '|a| = |b|']], ans: `Their number of elements (cardinality): |A| = |B|.`, hint: `Not the elements themselves…` }],
    mcq: [`Equivalent sets have…`, `the same number of elements`, `the same elements`, `no elements in common`, `the same first element`] });

  S({ id: '1-18', t: '1', sec: '1.2', kind: 'table', title: `Finite set`,
    note: tbl(['Type', 'Meaning', 'Example'], [['Finite set', 'Has exactly n elements for some integer n ≥ 0', '{x ∈ ℤ | 10 &lt; x &lt; 20}']]),
    q: `How many elements does {x ∈ ℤ | 10 &lt; x &lt; 20} have?`, type: 'exact', ans: ['9'], hint: `List them: 11, 12, …, 19.`,
    fu: [{ note: `A set is finite if it has exactly n elements for some integer n ≥ 0 (∅ has n = 0).`, q: `Is ∅ a finite set?`, type: 'choice', opts: YN, ans: 'Yes', hint: `Is n = 0 allowed?` }],
    mcq: [`|{x ∈ ℤ | 10 < x < 20}| = ?`, `9`, `10`, `11`, `infinite`] });

  S({ id: '1-19', t: '1', sec: '1.2', kind: 'table', title: `Infinite set: countable vs uncountable`,
    note: tbl(['Type', 'Meaning', 'Example'], [['Infinite set', 'Not finite. <b>Countable</b> (can be listed, e.g. ℤ, even integers) or <b>uncountable</b> (cannot be listed, e.g. ℝ, complex numbers)', 'ℤ = {…,−1,0,1,…}; {x ∈ ℝ | 1&lt;x&lt;4}']]),
    q: `ℝ is…`, type: 'choice', opts: [`Infinite and uncountable`, `Infinite and countable`, `Finite`, `Empty`], ans: `Infinite and uncountable`, hint: `Can you list all real numbers one after another?`,
    fu: [{ note: `Countable = can be listed (ℤ, the even integers).`, q: `The set of even integers is…`, type: 'choice', opts: [`Countable`, `Uncountable`, `Finite`], ans: `Countable`, hint: `Can you list them: 0, 2, −2, 4, −4, …?` }],
    mcq: [`Which set is uncountable?`, `ℝ`, `ℤ`, `the even integers`, `ℕ`] });

  S({ id: '1-20', t: '1', sec: '1.2', kind: 'table', title: `Universal set U`,
    note: tbl(['Type', 'Meaning', 'Example'], [['Universal set U', 'The "whole world" set that contains every set we\'re talking about', 'A={1,2,3}, B={2,4,6,8}, C={5,7} → U={1,…,8}']]),
    q: `What is the universal set U?`, type: 'explain', kw: [['contains', 'includes', 'holds', 'has'], ['every set', 'all sets', 'all the sets', 'whole world', 'everything', 'all elements']],
    ans: `The "whole world" set that contains every set (and element) we're talking about.`, hint: `Think "whole world".`,
    fu: [{ note: `A={1,2,3}, B={2,4,6,8}, C={5,7} → U = {1,…,8}.`, q: `Write U = {1, …, 8} as a complete list.`, type: 'set', ans: '{1,2,3,4,5,6,7,8}', hint: `Every integer from 1 to 8.` }],
    mcq: [`The universal set U is…`, `the set containing every set we're talking about`, `the empty set`, `always ℝ`, `the intersection of all sets`] });

  S({ id: '1-21', t: '1', sec: '1.2', kind: 'watch', title: `Watch out: Equal ≠ Equivalent`,
    note: `<b>Equal ≠ Equivalent.</b> Equal sets have the <i>same members</i>; equivalent sets only have the <i>same count</i>. Equal sets are always equivalent, but equivalent sets are not always equal.`,
    q: `Which statement is true?`, type: 'choice',
    opts: [`Equal sets are always equivalent, but equivalent sets are not always equal`, `Equivalent sets are always equal`, `"Equal" and "equivalent" mean the same thing`, `Equal sets are never equivalent`],
    ans: `Equal sets are always equivalent, but equivalent sets are not always equal`, hint: `If two sets have the same members, do they automatically have the same count?`,
    fu: [{ note: `Same count but different members → equivalent, not equal.`, q: `{1, 2, 3} and {a, b, c} are…`, type: 'choice', opts: [`Equivalent only`, `Equal only`, `Both`, `Neither`], ans: `Equivalent only`, hint: `Compare the members, then compare the counts.` }],
    mcq: [`TRAP: {1,2} and {x,y} are…`, `equivalent but not equal`, `equal`, `equal and equivalent`, `neither`] });

  S({ id: '1-22', t: '1', sec: '1.2', kind: 'watch', title: `Watch out: always check the domain`,
    note: `{x ∈ ℝ | 1 &lt; x &lt; 4} is <b>infinite</b> (endless real numbers between 1 and 4), but {x ∈ ℤ | 1 &lt; x &lt; 4} = {2, 3} is <b>finite</b>. Always check the domain!`,
    q: `List {x ∈ ℤ | 1 &lt; x &lt; 4}.`, type: 'set', ans: '{2,3}', hint: `Integers strictly between 1 and 4.`,
    fu: [{ note: `Domain ℝ: there are endless real numbers between 1 and 4.`, q: `Is {x ∈ ℝ | 1 &lt; x &lt; 4} finite or infinite?`, type: 'choice', opts: ['Infinite', 'Finite'], ans: 'Infinite', hint: `Think 1.5, 1.25, 1.125, …` }],
    mcq: [`TRAP: {x ∈ ℝ | 1 < x < 4} is…`, `infinite`, `{2, 3}`, `finite with 2 elements`, `empty`] });

  // ---- 1.3 Subsets, cardinality and power set ----
  S({ id: '1-23', t: '1', sec: '1.3', kind: 'def', title: `Subset ⊆`,
    note: `<b>A ⊆ B</b> if <b>every</b> element of A is also in B.` + venn('subset', 'A ⊆ B'),
    q: `When is A ⊆ B?`, type: 'explain', kw: [['every', 'all', 'each'], ['element', 'member'], ['in b', 'of b', 'to b', 'inside b', 'belongs to b', 'b']],
    ans: `When every element of A is also an element of B.`, hint: `"every ____ of A is also ____".`,
    fu: [{ note: `A ⊆ B if every element of A is also in B.`, q: `Is {1, 2} ⊆ {1, 2, 3}?`, type: 'choice', opts: YN, ans: 'Yes', hint: `Check 1 and 2.` },
      { note: `A ⊆ B fails as soon as ONE element of A is missing from B.`, q: `Is {1, 4} ⊆ {1, 2, 3}?`, type: 'choice', opts: YN, ans: 'No', hint: `Check 4.` }],
    mcq: [`A ⊆ B means…`, `every element of A is in B`, `every element of B is in A`, `A and B share one element`, `A ∈ B`] });

  S({ id: '1-24', t: '1', sec: '1.3', kind: 'def', title: `∅ ⊆ A and A ⊆ A`,
    note: `• ∅ ⊆ A for every set A<br>• A ⊆ A (every set is a subset of itself)`,
    q: `Which are ALWAYS true for any set A? (select all)`, type: 'choice', opts: ['∅ ⊆ A', 'A ⊆ A', 'A ⊂ A', '∅ ∈ A'], ans: ['∅ ⊆ A', 'A ⊆ A'], hint: `Two are always true. ⊂ requires A ≠ B; ∈ is about elements.`,
    fu: [{ note: `∅ ⊆ A for every set A, including A = ∅.`, q: `Is ∅ ⊆ ∅?`, type: 'choice', opts: YN, ans: 'Yes', hint: `"Every set" includes the empty set.` }],
    mcq: [`Which is true for EVERY set A?`, `∅ ⊆ A`, `∅ ∈ A`, `A ⊂ A`, `A ⊆ ∅`] });

  S({ id: '1-25', t: '1', sec: '1.3', kind: 'def', title: `A = B ⟺ A ⊆ B and B ⊆ A`,
    note: `<b>A = B ⟺ A ⊆ B and B ⊆ A</b>. To prove two sets are equal, show each is a subset of the other.`,
    q: `How can you prove A = B using subsets?`, type: 'explain', kw: [['a ⊆ b', 'a subset of b', 'a is a subset of b', 'a in b'], ['b ⊆ a', 'b subset of a', 'b is a subset of a', 'b in a', 'other way', 'each other', 'both']],
    ans: `Show A ⊆ B and B ⊆ A.`, hint: `Two subset checks, one in each direction.`,
    fu: [{ note: `A = B ⟺ A ⊆ B and B ⊆ A.`, q: `You showed A ⊆ B and B ⊆ A. What can you conclude?`, type: 'exact', ans: ['A = B', 'A=B'], hint: `The two directions together give…` }],
    mcq: [`A = B if and only if…`, `A ⊆ B and B ⊆ A`, `A ⊆ B or B ⊆ A`, `A ∩ B ≠ ∅`, `|A| = |B|`] });

  S({ id: '1-26', t: '1', sec: '1.3', kind: 'def', title: `Proper subset ⊂`,
    note: `<b>A ⊂ B</b> if A ⊆ B <b>and</b> A ≠ B. (B has at least one extra element.)<br>{SQL, Python} ⊂ {SQL, Python, Spark}`,
    q: `Is {SQL, Python} ⊂ {SQL, Python, Spark}?`, type: 'choice', opts: [`Yes: it is a subset and the sets are not equal`, `No: they share elements`, `No: ⊂ needs disjoint sets`, `Only ⊆, not ⊂`], ans: `Yes: it is a subset and the sets are not equal`, hint: `Two checks: subset? not equal?`,
    fu: [{ note: `A ⊂ B needs A ≠ B. A set is never a proper subset of itself.`, q: `Is {1, 2} ⊂ {1, 2}?`, type: 'choice', opts: YN, ans: 'No', hint: `Does B have an extra element?` }],
    mcq: [`A ⊂ B means…`, `A ⊆ B and A ≠ B`, `A ⊆ B or A = B`, `A ∩ B = ∅`, `B ⊆ A`] });

  S({ id: '1-27', t: '1', sec: '1.3', kind: 'example', title: `Example: all subsets of {1, 2, 3}`,
    note: `A = {1, 2, 3}<br>Subsets (8): ∅, {1}, {2}, {3}, {1,2}, {1,3}, {2,3}, {1,2,3}<br>Proper subsets (7): all of the above <b>except</b> {1,2,3} itself.`,
    q: `List ALL subsets of A = {1, 2, 3} as a set of sets, e.g. {∅, {1}, …}.`, type: 'set', ans: '{∅,{1},{2},{3},{1,2},{1,3},{2,3},{1,2,3}}', hint: `There are 8. Don't forget ∅ and A itself.`,
    fu: [{ note: `Proper subsets = all subsets except A itself.`, q: `How many proper subsets does {1, 2, 3} have?`, type: 'exact', ans: ['7'], hint: `8 subsets minus one.` },
      { note: `Same method for a 2-element set: 2² = 4 subsets.`, q: `List all subsets of {x, y}.`, type: 'set', ans: '{∅,{x},{y},{x,y}}', hint: `4 subsets, including ∅ and {x, y}.` }],
    mcq: [`How many subsets does {1, 2, 3} have?`, `8`, `7`, `6`, `3`] });

  S({ id: '1-28', t: '1', sec: '1.3', kind: 'def', title: `Cardinality |S|`,
    note: `<b>Cardinality |S|</b> = the number of distinct elements in S.<br>|{1,2,3}| = 3, |{a,b,c,d,e,f,g}| = 7, |∅| = 0`,
    q: `|{a, b, c, d, e, f, g}| = ?`, type: 'exact', ans: ['7'], hint: `Count the distinct letters.`,
    fu: [{ note: `The empty set has no elements.`, q: `|∅| = ?`, type: 'exact', ans: ['0'], hint: `Nothing inside.` },
      { note: `{∅} is a set with ONE element: the empty set.`, q: `|{∅}| = ?`, type: 'exact', ans: ['1'], hint: `Count the items between the outer braces.` }],
    mcq: [`|∅| = ?`, `0`, `1`, `undefined`, `∅`] });

  S({ id: '1-29', t: '1', sec: '1.3', kind: 'def', title: `Power set P(A)`,
    note: `<b>Power set</b> P(A) = the set of <b>all subsets</b> of A: P(A) = {X | X ⊆ A}.<br><b>If |A| = n, then |P(A)| = 2ⁿ</b><br>P({SQL, Python}) = {∅, {SQL}, {Python}, {SQL, Python}}, which has 2² = 4 elements.`,
    q: `Write P({SQL, Python}).`, type: 'set', ans: '{∅,{SQL},{Python},{SQL,Python}}', hint: `4 subsets: empty, each single one, both.`,
    fu: [{ note: `|P(A)| = 2ⁿ when |A| = n.`, q: `If |A| = 3, what is |P(A)|?`, type: 'exact', ans: ['8', '2^3'], hint: `2 to the power n.` },
      { note: `|P(A)| = 2ⁿ.`, q: `If |A| = 5, what is |P(A)|?`, type: 'exact', ans: ['32', '2^5'], hint: `2 × 2 × 2 × 2 × 2.` }],
    mcq: [`If |A| = 4, then |P(A)| = ?`, `16`, `8`, `4`, `15`] });

  S({ id: '1-30', t: '1', sec: '1.3', kind: 'tip', title: `Memory tip: why 2ⁿ?`,
    note: `For each element you make a yes/no choice: put it in the subset or leave it out. n elements → 2 × 2 × … × 2 = 2ⁿ subsets.<br>Number of <b>proper</b> subsets = 2ⁿ − 1 (remove A itself). Don't forget ∅ is always in P(A)!`,
    q: `Why does a set with n elements have 2ⁿ subsets?`, type: 'explain', kw: [['yes no', 'yes or no', 'in or out', 'include', 'leave', 'choice', 'choose', 'two options'], ['each element', 'every element', 'each', 'per element'], ['2', 'two', 'multiply', 'times']],
    ans: `Each element gives a yes/no choice (in or out), 2 choices per element, so 2 × 2 × … × 2 = 2ⁿ.`, hint: `What decision do you make for each element?`,
    fu: [{ note: `Proper subsets = 2ⁿ − 1.`, q: `How many proper subsets does a 4-element set have?`, type: 'exact', ans: ['15'], hint: `2⁴ − 1.` },
      { note: `∅ is always in P(A) (∅ ⊆ every set).`, q: `Is ∅ ∈ P(A) for every set A?`, type: 'choice', opts: YN, ans: 'Yes', hint: `Is ∅ a subset of every set?` }],
    mcq: [`Number of proper subsets of an n-element set:`, `2ⁿ − 1`, `2ⁿ`, `n²`, `2n`] });

  S({ id: '1-31', t: '1', sec: '1.3', kind: 'quick', title: `Quick check: proper subsets of A`,
    note: `A = {a,b,c,d,e,f,g,h}, B = {b,d,e}, C = {a,b,c,d,e}, D = {r,s,d,e}.<br>Which are proper subsets of A? <b>Answer: B and C.</b> D is not, because r, s ∉ A.`,
    q: `A = {a,b,c,d,e,f,g,h}, B = {b,d,e}, C = {a,b,c,d,e}, D = {r,s,d,e}. Which are proper subsets of A? (select all)`, type: 'choice', opts: ['B', 'C', 'D'], ans: ['B', 'C'], hint: `Check every element of each set against A.`,
    fu: [{ note: `D = {r,s,d,e} contains r and s, which are not in A.`, q: `Why is D not a subset of A?`, type: 'explain', kw: [['r', 's'], ['not in a', '∉', 'not elements', 'not in', 'outside', 'missing']], ans: `Because r and s are not elements of A (r, s ∉ A).`, hint: `Find the elements of D that A doesn't have.` }],
    mcq: [`A = {a,…,h}. Which is a proper subset of A?`, `{b, d, e}`, `{r, s, d, e}`, `{a, b, c, d, e, f, g, h}`, `{a, z}`] });

  // ---- 1.4 Operations on sets ----
  S({ id: '1-32', t: '1', sec: '1.4', kind: 'table', title: `Union A ∪ B`,
    note: venn('union', 'A ∪ B') + tbl(['Operation', 'Definition', 'Say it as', 'Example'], [['Union A ∪ B', '{x | x ∈ A or x ∈ B}', 'in A, in B, or both', '{1,2,3,4,5} ∪ {2,4,6} = {1,2,3,4,5,6}']]),
    q: `{1,2,3,4,5} ∪ {2,4,6} = ?`, type: 'set', ans: '{1,2,3,4,5,6}', hint: `Everything in either set (no duplicates).`,
    fu: [{ note: `A ∪ B = everything in A, in B, or both.`, q: `A = {a, b}, B = {b, c, d}. A ∪ B = ?`, type: 'set', ans: '{a,b,c,d}', hint: `Pour both into one cup.` }],
    mcq: [`x ∈ A ∪ B means…`, `x ∈ A or x ∈ B`, `x ∈ A and x ∈ B`, `x ∈ A but x ∉ B`, `x is in exactly one of them`] });

  S({ id: '1-33', t: '1', sec: '1.4', kind: 'table', title: `Intersection A ∩ B`,
    note: venn('inter', 'A ∩ B') + tbl(['Operation', 'Definition', 'Say it as', 'Example'], [['Intersection A ∩ B', '{x | x ∈ A and x ∈ B}', 'in both', '{1,…,6} ∩ {2,4,6,8,10} = {2,4,6}']]),
    q: `{1,2,3,4,5,6} ∩ {2,4,6,8,10} = ?`, type: 'set', ans: '{2,4,6}', hint: `Only what's in both.`,
    fu: [{ note: `A ∩ B = elements in both A and B.`, q: `{1,3,5,7} ∩ {3,4,5,6} = ?`, type: 'set', ans: '{3,5}', hint: `Which numbers appear in both lists?` }],
    mcq: [`{1,…,6} ∩ {2,4,6,8,10} = ?`, `{2,4,6}`, `{1,2,3,4,5,6,8,10}`, `{1,3,5}`, `{8,10}`] });

  S({ id: '1-34', t: '1', sec: '1.4', kind: 'table', title: `Disjoint sets`,
    note: venn('disjoint', 'Disjoint: A ∩ B = ∅') + tbl(['Operation', 'Definition', 'Say it as', 'Example'], [['Disjoint', 'A ∩ B = ∅', 'nothing in common', '{1,3,5,…} and {2,4,6,…}']]),
    q: `Are the odd numbers {1,3,5,…} and the even numbers {2,4,6,…} disjoint?`, type: 'choice', opts: [`Yes: their intersection is ∅`, `No: they are both infinite`, `No: they are equivalent`, `Only if U is finite`], ans: `Yes: their intersection is ∅`, hint: `Is any number both odd and even?`,
    fu: [{ note: `Disjoint means A ∩ B = ∅.`, q: `{1, 2} ∩ {3, 4} = ?`, type: 'set', ans: '∅', hint: `Anything in common?` }],
    mcq: [`A and B are disjoint when…`, `A ∩ B = ∅`, `A ∪ B = ∅`, `A − B = ∅`, `A ⊆ B`] });

  S({ id: '1-35', t: '1', sec: '1.4', kind: 'table', title: `Difference A − B`,
    note: venn('diff', 'A − B') + tbl(['Operation', 'Definition', 'Say it as', 'Example'], [['Difference A − B', '{x | x ∈ A and x ∉ B}', 'in A but not in B', '{1,…,8} − {2,4,6,8} = {1,3,5,7}']]),
    q: `{1,2,3,4,5,6,7,8} − {2,4,6,8} = ?`, type: 'set', ans: '{1,3,5,7}', hint: `Start from the first set and remove what's in the second.`,
    fu: [{ note: `A − B keeps what is in A but not in B.`, q: `{1,2,3,4} − {3,4,5} = ?`, type: 'set', ans: '{1,2}', hint: `Remove 3 and 4 from the first set.` },
      { note: `Order matters: here A is the smaller set.`, q: `{2,4,6,8} − {1,2,3,4,5,6,7,8} = ?`, type: 'set', ans: '∅', hint: `Is anything in the first set missing from the second?` }],
    mcq: [`x ∈ A − B means…`, `x ∈ A and x ∉ B`, `x ∈ B and x ∉ A`, `x ∈ A or x ∈ B`, `x ∈ A and x ∈ B`] });

  S({ id: '1-36', t: '1', sec: '1.4', kind: 'table', title: `Symmetric difference A ⊕ B`,
    note: venn('sym', 'A ⊕ B') + tbl(['Operation', 'Definition', 'Say it as', 'Example'], [['Symmetric difference A ⊕ B', '(A − B) ∪ (B − A)', 'in exactly one of them', '{1,2,3,4,5} ⊕ {4,5,6,7,8} = {1,2,3,6,7,8}']]),
    q: `{1,2,3,4,5} ⊕ {4,5,6,7,8} = ?`, type: 'set', ans: '{1,2,3,6,7,8}', hint: `Everything except what's in both.`,
    fu: [{ note: `A ⊕ B = (A − B) ∪ (B − A): in exactly one of them.`, q: `{1,2,3} ⊕ {2,3,4} = ?`, type: 'set', ans: '{1,4}', hint: `Throw away the shared elements 2 and 3.` }],
    mcq: [`A ⊕ B equals…`, `(A − B) ∪ (B − A)`, `(A ∪ B) ∪ (A ∩ B)`, `A ∩ B′ only`, `(A − B) ∩ (B − A)`] });

  S({ id: '1-37', t: '1', sec: '1.4', kind: 'table', title: `Complement A′`,
    note: venn('comp', 'A′ (complement)') + tbl(['Operation', 'Definition', 'Say it as', 'Example'], [['Complement A′', '{x ∈ U | x ∉ A} = U − A', 'everything not in A', 'U={1,…,7}, A={2,4,6} → A′={1,3,5,7}']]),
    q: `U = {1,…,7}, A = {2,4,6}. A′ = ?`, type: 'set', ans: '{1,3,5,7}', hint: `Everything in U that is not in A.`,
    fu: [{ note: `A′ = U − A.`, q: `U = {1,…,10}, A = {1,2,3,4,5}. A′ = ?`, type: 'set', ans: '{6,7,8,9,10}', hint: `Remove A from U.` }],
    mcq: [`A′ equals…`, `U − A`, `A − U`, `A ∩ U`, `∅ − A`] });

  S({ id: '1-38', t: '1', sec: '1.4', kind: 'def', title: `Counting a union (inclusion–exclusion)`,
    note: `<b>|A ∪ B| = |A| + |B| − |A ∩ B|</b><br>Subtract the overlap because it was counted twice.`,
    q: `|A| = 12, |B| = 9, |A ∩ B| = 4. What is |A ∪ B|?`, type: 'exact', ans: ['17'], hint: `Add the sizes, then subtract the overlap once.`,
    fu: [{ note: `|A ∪ B| = |A| + |B| − |A ∩ B|.`, q: `A = {1,2,3,4,5}, B = {2,4,6}. Use the formula: |A ∪ B| = ?`, type: 'exact', ans: ['6'], hint: `|A| = 5, |B| = 3, |A ∩ B| = 2.` },
      { note: `The overlap A ∩ B is inside both A and B.`, q: `Why do we subtract |A ∩ B|?`, type: 'explain', kw: [['overlap', 'intersection', 'both', 'common', 'shared'], ['twice', 'two times', 'double', 'counted']], ans: `Because the elements in the overlap A ∩ B were counted twice (once in A, once in B).`, hint: `How many times were the shared elements counted?` }],
    mcq: [`|A ∪ B| = ?`, `|A| + |B| − |A ∩ B|`, `|A| + |B|`, `|A| + |B| + |A ∩ B|`, `|A| · |B|`] });

  S({ id: '1-39', t: '1', sec: '1.4', kind: 'tip', title: `Memory tip: cup, cap, XOR`,
    note: `∪ looks like a <b>cup</b>: it holds everything poured in (OR).<br>∩ looks like a <b>cap/bridge</b>: only what's shared (AND).<br>⊕ = "XOR": one or the other, not both.`,
    q: `Which symbol means "in exactly one of them" (XOR)?`, type: 'choice', opts: ['⊕', '∪', '∩', '−'], ans: '⊕', hint: `One or the other, not both.`,
    fu: [{ note: `∩ = cap/bridge = only what's shared.`, q: `The cap ∩ matches which logical word?`, type: 'choice', opts: ['AND', 'OR', 'XOR', 'NOT'], ans: 'AND', hint: `Only what's shared by both.` }],
    mcq: [`The "cup" ∪ corresponds to…`, `OR`, `AND`, `XOR`, `NOT`] });

  S({ id: '1-40', t: '1', sec: '1.4', kind: 'watch', title: `Watch out: A − B ≠ B − A`,
    note: `<b>A − B ≠ B − A</b> in general. Difference is <b>not commutative</b>, but ∪, ∩ and ⊕ are.`,
    q: `Which operations are commutative? (select all)`, type: 'choice', opts: ['∪', '∩', '⊕', '−'], ans: ['∪', '∩', '⊕'], hint: `Exactly one of these four is NOT commutative.`,
    fu: [{ note: `Check with A = {1,2,3}, B = {3,4}.`, q: `A = {1,2,3}, B = {3,4}. A − B = ?`, type: 'set', ans: '{1,2}', hint: `In A but not in B.` },
      { note: `Same sets, other order: B − A keeps what is in B but not A.`, q: `A = {1,2,3}, B = {3,4}. B − A = ?`, type: 'set', ans: '{4}', hint: `In B but not in A.` }],
    mcq: [`TRAP: Which operation is NOT commutative?`, `A − B`, `A ∪ B`, `A ∩ B`, `A ⊕ B`] });

  // ---- 1.5 Set identities (laws) — one statement per law ----
  var LAWS_NOTE = `Using: U = {1,2,3,4,5,6}, A = {1,2,3}, B = {2,3,4}, C = {3,5}.`;
  S({ id: '1-41', t: '1', sec: '1.5', kind: 'table', title: `Commutative law (sets)`,
    note: tbl(['Law', 'Form 1', 'Form 2'], [['Commutative', 'A ∪ B = B ∪ A', 'A ∩ B = B ∩ A']]),
    q: `By the commutative law, A ∩ B = ?`, type: 'exact', ans: ['B ∩ A'], hint: `Swap the order.`,
    fu: [{ note: LAWS_NOTE + `<br>Commutative: A ∪ B = B ∪ A.`, q: `Compute B ∪ A.`, type: 'set', ans: '{1,2,3,4}', hint: `Same as A ∪ B.` }],
    mcq: [`The commutative law says…`, `A ∪ B = B ∪ A`, `A ∪ (B ∪ C) = (A ∪ B) ∪ C`, `A ∪ A = A`, `A ∪ ∅ = A`] });

  S({ id: '1-42', t: '1', sec: '1.5', kind: 'table', title: `Associative law (sets)`,
    note: tbl(['Law', 'Form 1', 'Form 2'], [['Associative', 'A ∪ (B ∪ C) = (A ∪ B) ∪ C', 'A ∩ (B ∩ C) = (A ∩ B) ∩ C']]),
    q: `By the associative law, A ∪ (B ∪ C) = ?`, type: 'exact', ans: ['(A ∪ B) ∪ C'], hint: `Move the brackets, keep the order.`,
    fu: [{ note: LAWS_NOTE + `<br>Associative: (A ∩ B) ∩ C = A ∩ (B ∩ C).`, q: `Compute (A ∩ B) ∩ C.`, type: 'set', ans: '{3}', hint: `First A ∩ B, then intersect with C.` }],
    mcq: [`A ∩ (B ∩ C) = (A ∩ B) ∩ C is the…`, `associative law`, `commutative law`, `distributive law`, `absorption law`] });

  S({ id: '1-43', t: '1', sec: '1.5', kind: 'table', title: `Distributive law (sets)`,
    note: tbl(['Law', 'Form 1', 'Form 2'], [['Distributive', 'A ∪ (B ∩ C) = (A ∪ B) ∩ (A ∪ C)', 'A ∩ (B ∪ C) = (A ∩ B) ∪ (A ∩ C)']]),
    q: `By the distributive law, A ∩ (B ∪ C) = ?`, type: 'exact', ans: ['(A ∩ B) ∪ (A ∩ C)', '(A ∩ C) ∪ (A ∩ B)'], hint: `Hand A ∩ to each part inside the bracket.`,
    fu: [{ note: LAWS_NOTE + `<br>Distributive: A ∪ (B ∩ C) = (A ∪ B) ∩ (A ∪ C).`, q: `Compute A ∪ (B ∩ C).`, type: 'set', ans: '{1,2,3}', hint: `B ∩ C first.` },
      { note: LAWS_NOTE + `<br>The other side of the same law must give the same set.`, q: `Compute (A ∪ B) ∩ (A ∪ C).`, type: 'set', ans: '{1,2,3}', hint: `A ∪ B = {1,2,3,4}; A ∪ C = {1,2,3,5}.` }],
    mcq: [`A ∪ (B ∩ C) = ?`, `(A ∪ B) ∩ (A ∪ C)`, `(A ∪ B) ∪ (A ∪ C)`, `(A ∩ B) ∪ (A ∩ C)`, `A ∪ B ∩ C`] });

  S({ id: '1-44', t: '1', sec: '1.5', kind: 'table', title: `Absorption law (sets)`,
    note: tbl(['Law', 'Form 1', 'Form 2'], [['Absorption', 'A ∪ (A ∩ B) = A', 'A ∩ (A ∪ B) = A']]),
    q: `Simplify A ∪ (A ∩ B).`, type: 'exact', ans: ['A'], hint: `A ∩ B is already inside A.`,
    fu: [{ note: `Absorption: A ∩ (A ∪ B) = A.`, q: `Simplify A ∩ (A ∪ B).`, type: 'exact', ans: ['A'], hint: `A is inside A ∪ B.` },
      { note: LAWS_NOTE + `<br>Absorption: A ∩ (A ∪ B) = A.`, q: `Compute A ∩ (A ∪ B) and check it equals A.`, type: 'set', ans: '{1,2,3}', hint: `A ∪ B = {1,2,3,4}.` }],
    mcq: [`A ∪ (A ∩ B) = ?`, `A`, `B`, `A ∩ B`, `U`] });

  S({ id: '1-45', t: '1', sec: '1.5', kind: 'table', title: `Idempotent law (sets)`,
    note: tbl(['Law', 'Form 1', 'Form 2'], [['Idempotent', 'A ∪ A = A', 'A ∩ A = A']]),
    q: `A ∩ A = ?`, type: 'exact', ans: ['A'], hint: `Intersecting a set with itself changes nothing.`,
    fu: [{ note: `Idempotent: A ∪ A = A.`, q: `A ∪ A = ?`, type: 'exact', ans: ['A'], hint: `Same idea with ∪.` }],
    mcq: [`A ∪ A = A is the…`, `idempotent law`, `identity law`, `domination law`, `complement law`] });

  S({ id: '1-46', t: '1', sec: '1.5', kind: 'table', title: `De Morgan's laws (sets)`,
    note: tbl(['Law', 'Form 1', 'Form 2'], [["De Morgan's", '(A ∪ B)′ = A′ ∩ B′', '(A ∩ B)′ = A′ ∪ B′']]),
    q: `(A ∪ B)′ = ?`, type: 'exact', ans: ['A′ ∩ B′', 'B′ ∩ A′'], hint: `Complement each set, flip the sign.`,
    fu: [{ note: `De Morgan: (A ∩ B)′ = A′ ∪ B′.`, q: `(A ∩ B)′ = ?`, type: 'exact', ans: ['A′ ∪ B′', 'B′ ∪ A′'], hint: `∩ becomes ∪.` },
      { note: LAWS_NOTE + `<br>(A ∪ B)′ = A′ ∩ B′.`, q: `Compute (A ∪ B)′.`, type: 'set', ans: '{5,6}', hint: `A ∪ B = {1,2,3,4}; take what's left in U.` }],
    mcq: [`(A ∩ B)′ = ?`, `A′ ∪ B′`, `A′ ∩ B′`, `A ∪ B`, `(A ∪ B)′`] });

  S({ id: '1-47', t: '1', sec: '1.5', kind: 'table', title: `Complement law`,
    note: tbl(['Law', 'Form 1', 'Form 2'], [['Complement', 'A ∪ A′ = U', 'A ∩ A′ = ∅']]),
    q: `A ∪ A′ = ?`, type: 'exact', ans: ['U'], hint: `A plus everything not in A.`,
    fu: [{ note: `Complement law: A ∩ A′ = ∅.`, q: `A ∩ A′ = ?`, type: 'exact', ans: ['∅'], hint: `Can x be in A and not in A?` }],
    mcq: [`A ∩ A′ = ?`, `∅`, `U`, `A`, `A′`] });

  S({ id: '1-48', t: '1', sec: '1.5', kind: 'table', title: `Double complement law`,
    note: tbl(['Law', 'Form'], [['Double complement', '(A′)′ = A']]),
    q: `(A′)′ = ?`, type: 'exact', ans: ['A'], hint: `Complement twice.`,
    fu: [{ note: LAWS_NOTE + `<br>A′ = U − A, and (A′)′ brings you back to A.`, q: `Compute A′.`, type: 'set', ans: '{4,5,6}', hint: `U minus {1,2,3}.` }],
    mcq: [`(A′)′ = ?`, `A`, `A′`, `U`, `∅`] });

  S({ id: '1-49', t: '1', sec: '1.5', kind: 'table', title: `Complement of U and ∅`,
    note: tbl(['Law', 'Form 1', 'Form 2'], [['Complement of U and ∅', 'U′ = ∅', '∅′ = U']]),
    q: `U′ = ?`, type: 'exact', ans: ['∅'], hint: `What is NOT in the whole world?`,
    fu: [{ note: `∅′ = U.`, q: `∅′ = ?`, type: 'exact', ans: ['U'], hint: `Everything not in the empty set.` }],
    mcq: [`∅′ = ?`, `U`, `∅`, `{∅}`, `undefined`] });

  S({ id: '1-50', t: '1', sec: '1.5', kind: 'table', title: `Identity law (sets)`,
    note: tbl(['Law', 'Form 1', 'Form 2'], [['Identity', 'A ∪ ∅ = A', 'A ∩ U = A']]),
    q: `A ∪ ∅ = ?`, type: 'exact', ans: ['A'], hint: `Adding nothing.`,
    fu: [{ note: `Identity: A ∩ U = A.`, q: `A ∩ U = ?`, type: 'exact', ans: ['A'], hint: `Everything in A is in U.` }],
    mcq: [`A ∩ U = ?`, `A`, `U`, `∅`, `A′`] });

  S({ id: '1-51', t: '1', sec: '1.5', kind: 'table', title: `Domination law (universal / empty)`,
    note: tbl(['Law', 'Form 1', 'Form 2'], [['Domination (universal / empty)', 'A ∪ U = U', 'A ∩ ∅ = ∅']]),
    q: `A ∪ U = ?`, type: 'exact', ans: ['U'], hint: `U already contains everything.`,
    fu: [{ note: `Domination: A ∩ ∅ = ∅.`, q: `A ∩ ∅ = ?`, type: 'exact', ans: ['∅'], hint: `Nothing in common with nothing.` }],
    mcq: [`A ∩ ∅ = ?`, `∅`, `A`, `U`, `A′`] });

  S({ id: '1-52', t: '1', sec: '1.5', kind: 'table', title: `Set difference law`,
    note: tbl(['Law', 'Form'], [['Set difference', 'A − B = A ∩ B′']]),
    q: `Rewrite A − B using ∩ and ′.`, type: 'exact', ans: ['A ∩ B′', 'B′ ∩ A'], hint: `"In A and not in B".`,
    fu: [{ note: LAWS_NOTE + `<br>A − B = A ∩ B′.`, q: `Compute A ∩ B′.`, type: 'set', ans: '{1}', hint: `B′ = {1,5,6}.` }],
    mcq: [`A − B = ?`, `A ∩ B′`, `A′ ∩ B`, `A ∪ B′`, `(A ∩ B)′`] });

  S({ id: '1-53', t: '1', sec: '1.5', kind: 'tip', title: `Memory tip: De Morgan, "break the bar, flip the sign"`,
    note: `"<b>Break the bar, flip the sign.</b>" When the complement (′) goes inside the brackets, ∪ turns into ∩ and ∩ turns into ∪. The same law appears in logic (Chapter 2A), with ∧ and ∨ in place of ∩ and ∪.`,
    q: `Describe the trick for applying De Morgan's law.`, type: 'explain', kw: [['complement', 'bar', '′', 'inside'], ['flip', 'swap', 'turns into', 'changes', 'becomes'], ['∪', 'union', '∩', 'intersection', 'sign']],
    ans: `Break the bar, flip the sign: move the complement inside the brackets and swap ∪ ↔ ∩.`, hint: `Two actions: what happens to the bar, what happens to the sign.`,
    fu: [{ note: `Apply "break the bar, flip the sign" to three sets.`, q: `(A ∩ B ∩ C)′ = ?`, type: 'exact', ans: ['A′ ∪ B′ ∪ C′'], hint: `Every ∩ becomes ∪, every set gets a ′.` }],
    mcq: [`"Break the bar, flip the sign" applied to (A ∪ B)′ gives…`, `A′ ∩ B′`, `A′ ∪ B′`, `A ∩ B`, `(A ∩ B)′`] });

  S({ id: '1-54', t: '1', sec: '1.5', kind: 'proof', title: `Example proof: A − (A ∩ B) = A − B`,
    note: `Prove with the laws, one law per line:` + tbl(['Step', 'Reason'], [['A − (A ∩ B) = A ∩ (A ∩ B)′', 'Set difference law'], ['= A ∩ (A′ ∪ B′)', "De Morgan's law"], ['= (A ∩ A′) ∪ (A ∩ B′)', 'Distributive law'], ['= ∅ ∪ (A ∩ B′)', 'Complement law'], ['= (A ∩ B′) ∪ ∅', 'Commutative law'], ['= A ∩ B′ = A − B', 'Identity law, then set difference law']]),
    q: `Step 1: A − (A ∩ B) = A ∩ (A ∩ B)′. Which law?`, type: 'choice', opts: [`Set difference law`, `De Morgan's law`, `Distributive law`, `Complement law`], ans: `Set difference law`, hint: `X − Y was rewritten as X ∩ Y′.`,
    fu: [{ note: `Step 2: A ∩ (A ∩ B)′ = A ∩ (A′ ∪ B′).`, q: `Which law turns (A ∩ B)′ into A′ ∪ B′?`, type: 'choice', opts: [`De Morgan's law`, `Distributive law`, `Absorption law`, `Identity law`], ans: `De Morgan's law`, hint: `Break the bar, flip the sign.` },
      { note: `Step 3: A ∩ (A′ ∪ B′) = (A ∩ A′) ∪ (A ∩ B′).`, q: `Which law is used in step 3?`, type: 'choice', opts: [`Distributive law`, `Associative law`, `De Morgan's law`, `Complement law`], ans: `Distributive law`, hint: `A ∩ was handed to each part of the bracket.` },
      { note: `Step 4: (A ∩ A′) ∪ (A ∩ B′) = ∅ ∪ (A ∩ B′).`, q: `Which law turns A ∩ A′ into ∅?`, type: 'choice', opts: [`Complement law`, `Identity law`, `Domination law`, `Idempotent law`], ans: `Complement law`, hint: `A set and its complement share nothing.` }],
    mcq: [`In the proof, (A ∩ B′) ∪ ∅ = A ∩ B′ uses the…`, `identity law`, `domination law`, `complement law`, `absorption law`] });

  S({ id: '1-55', t: '1', sec: '1.5', kind: 'proof', title: `Example proof: if A ∩ C = B ∩ C and A ∩ C′ = B ∩ C′, then A = B`,
    note: `A = A ∩ U = A ∩ (C ∪ C′) = (A ∩ C) ∪ (A ∩ C′) <i>(identity, complement, distributive)</i><br>= (B ∩ C) ∪ (B ∩ C′) <i>(given)</i><br>= B ∩ (C ∪ C′) = B ∩ U = B <i>(distributive, complement, identity)</i> ∎`,
    q: `First line: A = A ∩ U. Which law?`, type: 'choice', opts: [`Identity law`, `Complement law`, `Domination law`, `Idempotent law`], ans: `Identity law`, hint: `A ∩ U = A.`,
    fu: [{ note: `A ∩ U = A ∩ (C ∪ C′).`, q: `Why can U be replaced by C ∪ C′?`, type: 'choice', opts: [`Complement law: C ∪ C′ = U`, `Distributive law`, `De Morgan's law`, `Because C = U`], ans: `Complement law: C ∪ C′ = U`, hint: `A set together with its complement is…` },
      { note: `(A ∩ C) ∪ (A ∩ C′) = (B ∩ C) ∪ (B ∩ C′).`, q: `What justifies this step?`, type: 'choice', opts: [`The given hypotheses`, `De Morgan's law`, `Absorption law`, `Idempotent law`], ans: `The given hypotheses`, hint: `Look at what the question told you about A ∩ C and A ∩ C′.` }],
    mcq: [`The proof "A = A ∩ U = A ∩ (C ∪ C′) = …" starts with which law?`, `Identity`, `Domination`, `Absorption`, `Double complement`] });

  // ---- 1.6 Generalised union and intersection ----
  S({ id: '1-56', t: '1', sec: '1.6', kind: 'def', title: `Big union ⋃`,
    note: `<b>⋃ᵢ₌₁ⁿ Aᵢ = A₁ ∪ A₂ ∪ … ∪ Aₙ</b><br>Elements in <b>at least one</b> Aᵢ.`,
    q: `An element is in ⋃ᵢ₌₁ⁿ Aᵢ when it is…`, type: 'choice', opts: [`in at least one Aᵢ`, `in every Aᵢ`, `in exactly one Aᵢ`, `in no Aᵢ`], ans: `in at least one Aᵢ`, hint: `It's a big ∪ (OR).`,
    fu: [{ note: `⋃ = union of all the sets. Here Aᵢ = {i, i+1}: A₁ = {1,2}, A₂ = {2,3}, A₃ = {3,4}.`, q: `Compute ⋃ᵢ₌₁³ Aᵢ where Aᵢ = {i, i+1}.`, type: 'set', ans: '{1,2,3,4}', hint: `Union of {1,2}, {2,3}, {3,4}.` }],
    mcq: [`⋃ᵢ₌₁ⁿ Aᵢ contains elements that are in…`, `at least one Aᵢ`, `every Aᵢ`, `exactly one Aᵢ`, `A₁ only`] });

  S({ id: '1-57', t: '1', sec: '1.6', kind: 'def', title: `Big intersection ⋂`,
    note: `<b>⋂ᵢ₌₁ⁿ Aᵢ = A₁ ∩ A₂ ∩ … ∩ Aₙ</b><br>Elements in <b>every</b> Aᵢ.`,
    q: `An element is in ⋂ᵢ₌₁ⁿ Aᵢ when it is…`, type: 'choice', opts: [`in every Aᵢ`, `in at least one Aᵢ`, `in exactly one Aᵢ`, `in no Aᵢ`], ans: `in every Aᵢ`, hint: `It's a big ∩ (AND).`,
    fu: [{ note: `⋂ = intersection of all. Here Aᵢ = {i, …, 5}: A₁ = {1,…,5}, A₂ = {2,…,5}, A₃ = {3,4,5}.`, q: `Compute ⋂ᵢ₌₁³ Aᵢ where Aᵢ = {i, i+1, …, 5}.`, type: 'set', ans: '{3,4,5}', hint: `What do all three share?` }],
    mcq: [`⋂ᵢ₌₁ⁿ Aᵢ contains elements that are in…`, `every Aᵢ`, `at least one Aᵢ`, `exactly one Aᵢ`, `none of the Aᵢ`] });

  S({ id: '1-58', t: '1', sec: '1.6', kind: 'example', title: `Example: A ∩ B ∩ C and a 3-set union`,
    note: `A = {1,2,3,4,5,6}, B = {2,4,6,8,10}, C = {1,2,8,10} → A ∩ B ∩ C = {2}<br>{1,…,5} ∪ {2,4,6} ∪ {8,9} = {1,2,3,4,5,6,8,9}`,
    q: `A = {1,2,3,4,5,6}, B = {2,4,6,8,10}, C = {1,2,8,10}. A ∩ B ∩ C = ?`, type: 'set', ans: '{2}', hint: `Which number is in all three?`,
    fu: [{ note: `{1,…,5} ∪ {2,4,6} ∪ {8,9} collects everything from the three sets.`, q: `{1,2,3,4,5} ∪ {2,4,6} ∪ {8,9} = ?`, type: 'set', ans: '{1,2,3,4,5,6,8,9}', hint: `Put everything together, no duplicates.` },
      { note: `Same A, B, C as the example; now take the union.`, q: `A = {1,…,6}, B = {2,4,6,8,10}, C = {1,2,8,10}. A ∪ B ∪ C = ?`, type: 'set', ans: '{1,2,3,4,5,6,8,10}', hint: `Everything in at least one of them.` }],
    mcq: [`{1,2,3,4,5,6} ∩ {2,4,6,8,10} ∩ {1,2,8,10} = ?`, `{2}`, `{2,4,6}`, `{1,2}`, `∅`] });

  // ---- 1.7 Cartesian product ----
  S({ id: '1-59', t: '1', sec: '1.7', kind: 'def', title: `Ordered pair (a, b)`,
    note: `An <b>ordered pair</b> (a, b) has a first and second position: (1, 2) ≠ (2, 1) unless a = b.`,
    q: `Is (1, 2) = (2, 1)?`, type: 'choice', opts: [`No: in an ordered pair, order matters`, `Yes: order never matters`, `Yes: they have the same elements`, `Only in a set`], ans: `No: in an ordered pair, order matters`, hint: `Ordered pairs are not sets.`,
    fu: [{ note: `(a, b) = (b, a) only when a = b.`, q: `When is (a, b) = (b, a)?`, type: 'choice', opts: [`Only when a = b`, `Always`, `Never`, `When a and b are numbers`], ans: `Only when a = b`, hint: `First positions must match AND second positions must match.` }],
    mcq: [`Which is TRUE?`, `(1, 2) ≠ (2, 1)`, `(1, 2) = (2, 1)`, `{1, 2} ≠ {2, 1}`, `(1, 2) = {1, 2}`] });

  S({ id: '1-60', t: '1', sec: '1.7', kind: 'def', title: `Cartesian product A × B`,
    note: `<b>A × B = {(a, b) | a ∈ A, b ∈ B}</b>: every way to pair an element of A (first) with an element of B (second).<br>A = {a, b}, B = {1, 2} → A × B = {(a,1), (a,2), (b,1), (b,2)}`,
    q: `A = {a, b}, B = {1, 2}. Write A × B.`, type: 'set', ans: '{(a,1),(a,2),(b,1),(b,2)}', hint: `First element from A, second from B. 4 pairs.`,
    fu: [{ note: `A × B pairs every first element with every second element.`, q: `{1, 2} × {x} = ?`, type: 'set', ans: '{(1,x),(2,x)}', hint: `Only one choice for the second position.` },
      { note: `|A × B| = |A| · |B|.`, q: `|A| = 3, |B| = 4. |A × B| = ?`, type: 'exact', ans: ['12'], hint: `Multiply.` }],
    mcq: [`A × B is…`, `the set of all pairs (a, b) with a ∈ A, b ∈ B`, `the set of all a · b`, `A ∪ B written twice`, `the pairs (a, a) with a ∈ A`] });

  S({ id: '1-61', t: '1', sec: '1.7', kind: 'example', title: `Example: B × A`,
    note: `A = {a, b}, B = {1, 2}<br>A × B = {(a,1), (a,2), (b,1), (b,2)}<br>B × A = {(1,a), (1,b), (2,a), (2,b)}`,
    q: `A = {a, b}, B = {1, 2}. Write B × A.`, type: 'set', ans: '{(1,a),(1,b),(2,a),(2,b)}', hint: `Now the FIRST element comes from B.`,
    fu: [{ note: `Compare: A × B has (a,1); B × A has (1,a).`, q: `Is A × B = B × A here?`, type: 'choice', opts: YN, ans: 'No', hint: `Is (a,1) in B × A?` }],
    mcq: [`A = {a,b}, B = {1,2}. Which pair is in B × A?`, `(1, a)`, `(a, 1)`, `(a, b)`, `(1, 2)`] });

  S({ id: '1-62', t: '1', sec: '1.7', kind: 'def', title: `Products of more sets: |A₁ × … × Aₙ|`,
    note: `• |A × B| = |A| · |B|<br>• |A₁ × … × Aₙ| = |A₁| · … · |Aₙ|<br>A × B × C with A = {a,b}, B = {1,2}, C = {x, y} has 2·2·2 = 8 triples, e.g. (a,1,x).`,
    q: `A = {a, b}, B = {1, 2}, C = {x, y}. |A × B × C| = ?`, type: 'exact', ans: ['8'], hint: `Multiply the three sizes.`,
    fu: [{ note: `Triples (first from A, second from B, third from C).`, q: `List A × B × C for A = {a, b}, B = {1, 2}, C = {x, y}.`, type: 'set', ans: '{(a,1,x),(a,1,y),(a,2,x),(a,2,y),(b,1,x),(b,1,y),(b,2,x),(b,2,y)}', hint: `8 triples, e.g. (a,1,x).` },
      { note: `|A₁ × A₂ × A₃| = |A₁| · |A₂| · |A₃|.`, q: `|A₁| = 2, |A₂| = 3, |A₃| = 5. |A₁ × A₂ × A₃| = ?`, type: 'exact', ans: ['30'], hint: `2 · 3 · 5.` }],
    mcq: [`|A × B × C| with |A| = 2, |B| = 2, |C| = 2:`, `8`, `6`, `4`, `2`] });

  S({ id: '1-63', t: '1', sec: '1.7', kind: 'def', title: `A × ∅ = ∅`,
    note: `<b>A × ∅ = ∅ × A = ∅</b>: there is nothing to pair with.`,
    q: `A = {1, 2}. A × ∅ = ?`, type: 'set', ans: '∅', hint: `What could be the second element of a pair?`,
    fu: [{ note: `|A × ∅| = |A| · 0.`, q: `|{1, 2, 3} × ∅| = ?`, type: 'exact', ans: ['0'], hint: `3 · 0.` }],
    mcq: [`∅ × A = ?`, `∅`, `A`, `{∅}`, `A × A`] });

  S({ id: '1-64', t: '1', sec: '1.7', kind: 'def', title: `A × B ≠ B × A when A ≠ B`,
    note: `If A ≠ B (and both non-empty), then <b>A × B ≠ B × A</b>.`,
    q: `A = {1}, B = {2}. Is A × B = B × A?`, type: 'choice', opts: [`No: A × B = {(1,2)} but B × A = {(2,1)}`, `Yes: both have one pair`, `Yes: × is commutative`, `Both are ∅`], ans: `No: A × B = {(1,2)} but B × A = {(2,1)}`, hint: `Write both out.`,
    fu: [{ note: `B × A takes the first element from B.`, q: `A = {1}, B = {2}. Write B × A.`, type: 'set', ans: '{(2,1)}', hint: `One pair, B first.` }],
    mcq: [`For non-empty A ≠ B, A × B and B × A are…`, `different`, `always equal`, `both empty`, `disjoint from A`] });

  S({ id: '1-65', t: '1', sec: '1.7', kind: 'tip', title: `Memory tip: menu combos`,
    note: `Think of a <b>menu combo</b>: 2 drinks × 3 burgers = 6 combos. The first item always comes from the first set.`,
    q: `A menu has 2 drinks and 3 burgers. How many (drink, burger) combos are there?`, type: 'exact', ans: ['6'], hint: `|A × B| = |A| · |B|.`,
    fu: [{ note: `Combos = product of the sizes.`, q: `4 shirts and 3 trousers. How many (shirt, trouser) outfits?`, type: 'exact', ans: ['12'], hint: `4 × 3.` },
      { note: `In (drink, burger), the first item always comes from the first set.`, q: `In a pair from Drinks × Burgers, where does the first item come from?`, type: 'choice', opts: ['Drinks', 'Burgers', 'Either'], ans: 'Drinks', hint: `First set → first position.` }],
    mcq: [`2 drinks × 3 burgers gives how many combos?`, `6`, `5`, `8`, `9`] });

  /* =====================================================================
     CHAPTER 2A — FUNDAMENTALS OF LOGIC
     ===================================================================== */
  var PROP = [`Proposition (True)`, `Proposition (False)`, `Proposition (truth value not known yet)`, `Not a proposition`];
  // ---- 2.1 Propositions ----
  S({ id: '2A-01', t: '2A', sec: '2.1', kind: 'def', title: `What is a proposition?`,
    note: `A <b>proposition</b> is a declarative sentence that is either <b>TRUE or FALSE, but not both</b>.`,
    q: `What is a proposition?`, type: 'explain', kw: [['declarative', 'statement', 'sentence'], ['true', 'truth value'], ['false'], ['not both', 'either', 'only one', 'exactly one']],
    ans: `A declarative sentence that is either true or false, but not both.`, hint: `What kind of sentence, and which two values (and how many at once)?`,
    fu: [{ note: `A proposition can be false and still be a proposition.`, q: `"2 + 2 = 5" is…`, type: 'choice', opts: PROP, ans: PROP[1], hint: `Can it be judged true or false?` }],
    mcq: [`A proposition is a declarative sentence that is…`, `either true or false, but not both`, `always true`, `a question or a command`, `true and false at the same time`] });

  S({ id: '2A-02', t: '2A', sec: '2.1', kind: 'table', title: `Is it a proposition? "4 is less than 3."`,
    note: tbl(['Sentence', 'Proposition?'], [['"4 is less than 3."', '✔ Yes (False)']]),
    q: `"4 is less than 3." is…`, type: 'choice', opts: PROP, ans: PROP[1], hint: `A false statement is still a statement.`,
    fu: [{ note: `"4 is less than 3" is a proposition with truth value False.`, q: `What is its truth value?`, type: 'exact', ans: ['False', 'F'], hint: `Is 4 &lt; 3?` }],
    mcq: [`"4 is less than 3." is…`, `a proposition (False)`, `not a proposition, because it's false`, `a proposition (True)`, `a command`] });

  S({ id: '2A-03', t: '2A', sec: '2.1', kind: 'table', title: `Is it a proposition? "Washington, DC, is the capital of the USA."`,
    note: tbl(['Sentence', 'Proposition?'], [['"Washington, DC, is the capital of the USA."', '✔ Yes (True)']]),
    q: `"Washington, DC, is the capital of the USA." is…`, type: 'choice', opts: PROP, ans: PROP[0], hint: `Declarative, and you know its truth value.`,
    fu: [{ note: `A declarative sentence with a definite truth value is a proposition.`, q: `What type of sentence is it?`, type: 'choice', opts: ['Declarative', 'Question', 'Command'], ans: 'Declarative', hint: `It states a fact.` }],
    mcq: [`"Washington, DC, is the capital of the USA." is…`, `a proposition (True)`, `a proposition (False)`, `not a proposition`, `a predicate`] });

  S({ id: '2A-04', t: '2A', sec: '2.1', kind: 'table', title: `Is it a proposition? "The sun will come out tomorrow."`,
    note: tbl(['Sentence', 'Proposition?'], [['"The sun will come out tomorrow."', '✔ Yes: it has a truth value even if we don\'t know it yet']]),
    q: `"The sun will come out tomorrow." is…`, type: 'choice', opts: PROP, ans: PROP[2], hint: `Does NOT knowing the value stop it from having one?`,
    fu: [{ note: `It has a truth value even though we don't know it yet.`, q: `Does a sentence need a KNOWN truth value to be a proposition?`, type: 'choice', opts: YN, ans: 'No', hint: `It only needs to HAVE one.` }],
    mcq: [`"The sun will come out tomorrow." is a proposition because…`, `it has a truth value, even if unknown yet`, `it is true`, `it is about the future`, `it is not a proposition`] });

  S({ id: '2A-05', t: '2A', sec: '2.1', kind: 'table', title: `Not a proposition: a question`,
    note: tbl(['Sentence', 'Proposition?'], [['"Why do we study mathematics?"', '✘ No (question)']]),
    q: `"Why do we study mathematics?" is…`, type: 'choice', opts: PROP, ans: PROP[3], hint: `Can you answer it with True/False?`,
    fu: [{ note: `Questions can't be true or false.`, q: `Explain why a question is not a proposition.`, type: 'explain', kw: [['question', 'asks', 'asking'], ['true or false', 'truth value', 'cannot be true', 'cant be true', 'not true or false', 'neither true']], ans: `A question asks something; it can't be true or false, so it has no truth value.`, hint: `What's needed for a proposition?` }],
    mcq: [`"Why do we study mathematics?" is not a proposition because it is…`, `a question`, `false`, `a command`, `unknown`] });

  S({ id: '2A-06', t: '2A', sec: '2.1', kind: 'table', title: `Not a proposition: a command`,
    note: tbl(['Sentence', 'Proposition?'], [['"Quiet, please." / "Study logic."', '✘ No (command)']]),
    q: `"Study logic." is…`, type: 'choice', opts: PROP, ans: PROP[3], hint: `Can an order be true or false?`,
    fu: [{ note: `Commands (orders) can't be true or false.`, q: `What kind of sentence is "Quiet, please."?`, type: 'choice', opts: ['Command', 'Question', 'Declarative'], ans: 'Command', hint: `It tells someone to do something.` }],
    mcq: [`"Quiet, please." is…`, `not a proposition (command)`, `a proposition (True)`, `a proposition (False)`, `a predicate`] });

  S({ id: '2A-07', t: '2A', sec: '2.1', kind: 'tip', title: `Memory tip: can I answer it with True or False?`,
    note: `Ask: "<b>Can I answer it with True or False?</b>" If yes → proposition. Questions and commands can't be true or false.`,
    q: `What quick test tells you whether a sentence is a proposition?`, type: 'explain', kw: [['true or false', 'true false', 'true/false', 'truth value'], ['answer', 'ask', 'can i', 'can you', 'judge']],
    ans: `Ask "Can I answer it with True or False?" If yes, it's a proposition.`, hint: `One question you ask yourself.`,
    fu: [{ note: `Commands can't be true or false.`, q: `"Close the door." is…`, type: 'choice', opts: PROP, ans: PROP[3], hint: `Apply the test.` }],
    mcq: [`Which is a proposition?`, `"7 is prime."`, `"Is 7 prime?"`, `"Check if 7 is prime."`, `"Please be quiet."`] });

  // ---- 2.2 Logical connectives ----
  S({ id: '2A-08', t: '2A', sec: '2.2', kind: 'table', title: `Negation ¬p`,
    note: tbl(['Symbol', 'Name', 'English'], [['¬p', 'Negation', 'not p']]) + tbl(['p', '¬p'], [['T', 'F'], ['F', 'T']]) + `<b>Memory tip:</b> ¬ flips T ↔ F.`,
    q: `Fill in the ¬p column.`, type: 'truthtable', table: tt(['p', '¬p'], TT1), ans: ['F', 'T'], hint: `¬ flips the value.`,
    fu: [{ note: `¬p is called the negation, read "not p".`, q: `What is the name of the connective ¬?`, type: 'exact', ans: ['negation', 'not'], hint: `Starts with "neg".` }],
    mcq: [`If p is True, then ¬p is…`, `False`, `True`, `unknown`, `both`] });

  S({ id: '2A-09', t: '2A', sec: '2.2', kind: 'table', title: `Conjunction p ∧ q`,
    note: tbl(['Symbol', 'Name', 'English'], [['p ∧ q', 'Conjunction', 'p and q (also "but")']]) + tbl(['p', 'q', 'p ∧ q'], [['T', 'T', 'T'], ['T', 'F', 'F'], ['F', 'T', 'F'], ['F', 'F', 'F']]) + `<b>Memory tip:</b> ∧ (AND) is True only when ALL parts are True. Think of a strict parent.`,
    q: `Fill in the p ∧ q column.`, type: 'truthtable', table: tt(['p', 'q', 'p ∧ q'], TT2), ans: ['T', 'F', 'F', 'F'], hint: `Strict parent: everything must be true.`,
    fu: [{ note: `∧ is True only when all parts are True.`, q: `p ∧ q is True when…`, type: 'choice', opts: [`both p and q are True`, `at least one is True`, `they have the same value`, `p is False`], ans: `both p and q are True`, hint: `ALL parts.` }],
    mcq: [`p ∧ q is True only when…`, `p and q are both True`, `p or q is True`, `p and q are both False`, `p is True and q is False`] });

  S({ id: '2A-10', t: '2A', sec: '2.2', kind: 'table', title: `Disjunction p ∨ q`,
    note: tbl(['Symbol', 'Name', 'English'], [['p ∨ q', 'Disjunction', 'p or q (or both)']]) + tbl(['p', 'q', 'p ∨ q'], [['T', 'T', 'T'], ['T', 'F', 'T'], ['F', 'T', 'T'], ['F', 'F', 'F']]) + `<b>Memory tip:</b> ∨ (OR) is True when ANY part is True. False only when both are False.`,
    q: `Fill in the p ∨ q column.`, type: 'truthtable', table: tt(['p', 'q', 'p ∨ q'], TT2), ans: ['T', 'T', 'T', 'F'], hint: `Any true part is enough.`,
    fu: [{ note: `∨ is False only when both parts are False.`, q: `In which row is p ∨ q False?`, type: 'choice', opts: ['p = F, q = F', 'p = T, q = T', 'p = T, q = F', 'p = F, q = T'], ans: 'p = F, q = F', hint: `Only one row.` }],
    mcq: [`p ∨ q is False only when…`, `both p and q are False`, `both are True`, `exactly one is True`, `p is False`] });

  S({ id: '2A-11', t: '2A', sec: '2.2', kind: 'table', title: `Conditional p → q`,
    note: tbl(['Symbol', 'Name', 'English'], [['p → q', 'Conditional', 'if p, then q']]) + tbl(['p', 'q', 'p → q'], [['T', 'T', 'T'], ['T', 'F', 'F'], ['F', 'T', 'T'], ['F', 'F', 'T']]) + `<b>Memory tip:</b> → (IF…THEN) is a promise. It's only broken (False) when p is True but q is False (T → F). If p is False, the promise wasn't tested, so it counts as True.`,
    q: `Fill in the p → q column.`, type: 'truthtable', table: tt(['p', 'q', 'p → q'], TT2), ans: ['T', 'F', 'T', 'T'], hint: `A promise is only broken in one row.`,
    fu: [{ note: `p → q is False only for T → F.`, q: `Which row makes p → q False?`, type: 'choice', opts: ['p = T, q = F', 'p = F, q = T', 'p = F, q = F', 'p = T, q = T'], ans: 'p = T, q = F', hint: `The promise was tested and broken.` },
      { note: `p → q is read "if p, then q".`, q: `Read p → q in English.`, type: 'exact', ans: ['if p then q', 'if p, then q', 'p implies q'], hint: `if … then …` }],
    mcq: [`p → q is False only when…`, `p is True and q is False`, `p is False and q is True`, `both are False`, `both are True`] });

  S({ id: '2A-12', t: '2A', sec: '2.2', kind: 'table', title: `Biconditional p ↔ q`,
    note: tbl(['Symbol', 'Name', 'English'], [['p ↔ q', 'Biconditional', 'p if and only if q']]) + tbl(['p', 'q', 'p ↔ q'], [['T', 'T', 'T'], ['T', 'F', 'F'], ['F', 'T', 'F'], ['F', 'F', 'T']]) + `<b>Memory tip:</b> ↔ (IFF) is True when both have the same value. "Same = True".`,
    q: `Fill in the p ↔ q column.`, type: 'truthtable', table: tt(['p', 'q', 'p ↔ q'], TT2), ans: ['T', 'F', 'F', 'T'], hint: `Same = True.`,
    fu: [{ note: `p ↔ q is read "p if and only if q".`, q: `Which connective is "p if and only if q"?`, type: 'choice', opts: ['↔', '→', '∧', '∨'], ans: '↔', hint: `Two-way arrow.` }],
    mcq: [`p ↔ q is True when…`, `p and q have the same value`, `p and q are both True only`, `exactly one is True`, `p is True`] });

  S({ id: '2A-13', t: '2A', sec: '2.2', kind: 'example', title: `Conditional with a False hypothesis`,
    note: `"If 1 + 1 = 3, then the moon is cheese." → <b>True</b> (F → F is T)<br>"1 + 1 = 3 or a decade is 10 years" → <b>True</b> (one part true)`,
    q: `"If 1 + 1 = 3, then the moon is cheese." is…`, type: 'choice', opts: [`True (F → F is T)`, `False (both parts are false)`, `Not a proposition`, `Unknown`], ans: `True (F → F is T)`, hint: `Was the promise tested?`,
    fu: [{ note: `∨ needs just one true part.`, q: `"1 + 1 = 3 or a decade is 10 years" is…`, type: 'choice', opts: TF, ans: 'True', hint: `Is a decade 10 years?` }],
    mcq: [`"If 1 + 1 = 3, then the moon is cheese." is…`, `True`, `False`, `not a proposition`, `undefined`] });

  S({ id: '2A-14', t: '2A', sec: '2.2', kind: 'example', title: `Example: "but" means "and"`,
    note: `p: 5 is an integer, q: 5 is not an odd integer<br>p ∧ q: "5 is an integer <b>but</b> 5 is not odd." (but = and)`,
    q: `The English word "but" translates to which connective?`, type: 'choice', opts: ['∧', '∨', '→', '¬'], ans: '∧', hint: `"but" works like "and".`,
    fu: [{ note: `p: 5 is an integer (True). q: 5 is not an odd integer (False, 5 is odd).`, q: `What is the truth value of p ∧ q?`, type: 'choice', opts: TF, ans: 'False', hint: `T ∧ F = ?` },
      { note: `Same p (True) and q (False).`, q: `What is the truth value of p → q?`, type: 'choice', opts: TF, ans: 'False', hint: `T → F is the broken promise.` }],
    mcq: [`"5 is an integer but 5 is not odd" uses…`, `∧`, `∨`, `→`, `↔`] });

  S({ id: '2A-15', t: '2A', sec: '2.2', kind: 'example', title: `Examples: → and ↔ in English`,
    note: `p → q: "If I get a bonus, then I will buy a new car."<br>p ↔ q: "My program compiles if and only if it has no syntax errors."`,
    q: `"My program compiles if and only if it has no syntax errors." Which connective?`, type: 'choice', opts: ['↔', '→', '∧', '∨'], ans: '↔', hint: `"if and only if".`,
    fu: [{ note: `p: I get a bonus. q: I will buy a new car.`, q: `Write "If I get a bonus, then I will buy a new car." in symbols.`, type: 'exact', ans: ['p → q'], hint: `if p, then q.` }],
    mcq: [`"If I get a bonus, then I will buy a new car" is a…`, `conditional`, `biconditional`, `conjunction`, `disjunction`] });

  // ---- 2.3 Precedence ----
  S({ id: '2A-16', t: '2A', sec: '2.3', kind: 'table', title: `Precedence of connectives`,
    note: tbl(['Order', 'Symbol'], [['1 (highest)', '¬ not'], ['2', '∧ and'], ['3', '∨ or'], ['4', '→ if…then'], ['5 (lowest)', '↔ iff']]),
    q: `List the five connectives from highest to lowest precedence (symbols, e.g. "¬ ∧ …").`, type: 'exact', ans: ['¬ ∧ ∨ → ↔', '¬, ∧, ∨, →, ↔', '¬ > ∧ > ∨ > → > ↔'], hint: `Not, And, Or, If, Iff.`,
    fu: [{ note: `↔ has the lowest precedence (5).`, q: `Which connective has the LOWEST precedence?`, type: 'choice', opts: ['↔', '→', '∨', '¬'], ans: '↔', hint: `Last in "Not And Or If Iff".` },
      { note: `¬ has the highest precedence (1).`, q: `Which connective has the HIGHEST precedence?`, type: 'choice', opts: ['¬', '∧', '∨', '→'], ans: '¬', hint: `First in "Not And Or If Iff".` }],
    mcq: [`Correct precedence (highest first):`, `¬, ∧, ∨, →, ↔`, `∧, ∨, ¬, →, ↔`, `¬, ∨, ∧, ↔, →`, `→, ↔, ¬, ∧, ∨`] });

  S({ id: '2A-17', t: '2A', sec: '2.3', kind: 'tip', title: `Memory tip: "Not And Or If Iff"`,
    note: `Say "<b>Not And Or If Iff</b>", or remember the shapes get "wider" as you go: ¬ ∧ ∨ → ↔.<br>Just like × before + in algebra: ¬p ∧ q ∨ r means ((¬p) ∧ q) ∨ r.`,
    q: `How is ¬p ∧ q ∨ r grouped?`, type: 'choice', opts: ['((¬p) ∧ q) ∨ r', '¬(p ∧ q) ∨ r', '¬p ∧ (q ∨ r)', '¬(p ∧ (q ∨ r))'], ans: '((¬p) ∧ q) ∨ r', hint: `¬ first, then ∧, then ∨.`,
    fu: [{ note: `¬p ∧ q ∨ r = ((¬p) ∧ q) ∨ r. Evaluate ¬p first, then ∧ q, then ∨ r.`, q: `Fill in the column for ¬p ∧ q ∨ r.`, type: 'truthtable', table: tt(['p', 'q', 'r', '¬p ∧ q ∨ r'], TT3), ans: ['T', 'F', 'T', 'F', 'T', 'T', 'T', 'F'], hint: `Whenever r is T the result is T. Otherwise you need ¬p ∧ q.` },
      { note: `∨ binds tighter than →.`, q: `How is p ∨ q → r grouped?`, type: 'choice', opts: ['(p ∨ q) → r', 'p ∨ (q → r)', '¬(p ∨ q) → r', 'p ∨ q ∨ r'], ans: '(p ∨ q) → r', hint: `Which is higher: ∨ or →?` }],
    mcq: [`¬p ∧ q ∨ r means…`, `((¬p) ∧ q) ∨ r`, `¬(p ∧ q ∨ r)`, `¬p ∧ (q ∨ r)`, `(¬p) ∧ (q ∨ r)`] });

  S({ id: '2A-18', t: '2A', sec: '2.3', kind: 'example', title: `Example: build A = ¬(p ∨ q) → (q ∧ p)`,
    note: `Build the table column by column:` + tbl(['p', 'q', 'p ∨ q', '¬(p ∨ q)', 'q ∧ p', 'A'], [['T', 'T', 'T', 'F', 'T', 'T'], ['T', 'F', 'T', 'F', 'F', 'T'], ['F', 'T', 'T', 'F', 'F', 'T'], ['F', 'F', 'F', 'T', 'F', 'F']]) + `A is false only in the last row, where the hypothesis is T and the conclusion is F.`,
    q: `Fill in the column A = ¬(p ∨ q) → (q ∧ p).`, type: 'truthtable', table: tt(['p', 'q', 'p ∨ q', '¬(p ∨ q)', 'q ∧ p', 'A'], [['T', 'T', 'T', 'F', 'T'], ['T', 'F', 'T', 'F', 'F'], ['F', 'T', 'T', 'F', 'F'], ['F', 'F', 'F', 'T', 'F']]), ans: ['T', 'T', 'T', 'F'], hint: `A is a conditional: hypothesis ¬(p ∨ q), conclusion q ∧ p. Only T → F is false.`,
    fu: [{ note: `First intermediate column: ¬(p ∨ q).`, q: `Fill in the ¬(p ∨ q) column.`, type: 'truthtable', table: tt(['p', 'q', '¬(p ∨ q)'], TT2), ans: ['F', 'F', 'F', 'T'], hint: `p ∨ q is F only in the last row; then flip.` },
      { note: `In the last row: ¬(p ∨ q) = T and q ∧ p = F.`, q: `Why is A False in the last row?`, type: 'choice', opts: [`The hypothesis is T and the conclusion is F`, `Both parts are F`, `The hypothesis is F`, `p and q are both F, so A must be F`], ans: `The hypothesis is T and the conclusion is F`, hint: `When is a conditional false?` }],
    mcq: [`For A = ¬(p ∨ q) → (q ∧ p), in which row is A False?`, `p = F, q = F`, `p = T, q = T`, `p = T, q = F`, `p = F, q = T`] });

  // ---- 2.4 Logical equivalence ----
  S({ id: '2A-19', t: '2A', sec: '2.4', kind: 'def', title: `Logical equivalence ≡`,
    note: `<b>Q ≡ R</b> means Q and R have the <b>same truth value in every row</b> of the truth table (final columns match).`,
    q: `What does Q ≡ R mean?`, type: 'explain', kw: [['same truth value', 'same value', 'same result', 'match', 'identical', 'equal'], ['every row', 'all rows', 'every case', 'all cases', 'every line', 'always', 'each row']],
    ans: `Q and R have the same truth value in every row of the truth table.`, hint: `Compare the final columns. In how many rows must they agree?`,
    fu: [{ note: `To check Q ≡ R, build one truth table and compare the final columns.`, q: `Two final columns agree in 3 rows out of 4. Are they equivalent?`, type: 'choice', opts: YN, ans: 'No', hint: `EVERY row.` }],
    mcq: [`Q ≡ R means…`, `Q and R have the same truth value in every row`, `Q and R are both true`, `Q → R is true`, `Q and R agree in at least one row`] });

  S({ id: '2A-20', t: '2A', sec: '2.4', kind: 'def', title: `Contrapositive: p → q ≡ ¬q → ¬p`,
    note: `<b>Contrapositive: P → Q ≡ ¬Q → ¬P</b>` + tbl(['p', 'q', 'p → q', '¬q → ¬p'], [['T', 'T', 'T', 'T'], ['T', 'F', 'F', 'F'], ['F', 'T', 'T', 'T'], ['F', 'F', 'T', 'T']]),
    q: `Fill in the ¬q → ¬p column.`, type: 'truthtable', table: tt(['p', 'q', '¬q', '¬p', '¬q → ¬p'], [['T', 'T', 'F', 'F'], ['T', 'F', 'T', 'F'], ['F', 'T', 'F', 'T'], ['F', 'F', 'T', 'T']]), ans: ['T', 'F', 'T', 'T'], hint: `Use the ¬q and ¬p columns: false only when ¬q = T and ¬p = F.`,
    fu: [{ note: `Contrapositive = flip and negate both.`, q: `Write the contrapositive of p → q.`, type: 'exact', ans: ['¬q → ¬p'], hint: `Swap, then negate both.` }],
    mcq: [`The contrapositive of p → q is…`, `¬q → ¬p`, `q → p`, `¬p → ¬q`, `p ∧ ¬q`] });

  S({ id: '2A-21', t: '2A', sec: '2.4', kind: 'def', title: `Negating an "if": ¬(p → q) ≡ p ∧ ¬q`,
    note: `<b>Negating an "if": ¬(P → Q) ≡ P ∧ ¬Q</b>` + tbl(['p', 'q', '¬(p → q)', 'p ∧ ¬q'], [['T', 'T', 'F', 'F'], ['T', 'F', 'T', 'T'], ['F', 'T', 'F', 'F'], ['F', 'F', 'F', 'F']]),
    q: `Fill in the p ∧ ¬q column.`, type: 'truthtable', table: tt(['p', 'q', 'p ∧ ¬q'], TT2), ans: ['F', 'T', 'F', 'F'], hint: `True only when p is T and q is F.`,
    fu: [{ note: `¬(p → q) ≡ p ∧ ¬q.`, q: `¬(p → q) ≡ ?`, type: 'exact', ans: ['p ∧ ¬q', '¬q ∧ p'], hint: `"p happened and q didn't".` }],
    mcq: [`¬(p → q) ≡ ?`, `p ∧ ¬q`, `¬p → ¬q`, `¬p ∨ q`, `¬p ∧ q`] });

  S({ id: '2A-22', t: '2A', sec: '2.4', kind: 'tip', title: `Memory tip: contrapositive = flip and negate both`,
    note: `Contrapositive = "<b>flip and negate both</b>". "If it rains, the road is wet" ≡ "If the road is not wet, it didn't rain."<br>Not (if p then q) = "p happened and q didn't": that's exactly the broken-promise row.`,
    q: `Give the contrapositive of "If it rains, the road is wet."`, type: 'explain', kw: [['if'], ['not wet', 'isnt wet', 'is not wet', 'dry'], ['didnt rain', 'did not rain', 'not rain', 'doesnt rain', 'does not rain', 'no rain', 'not raining', 'isnt raining']],
    ans: `If the road is not wet, then it didn't rain.`, hint: `Flip the two parts and negate both.`,
    fu: [{ note: `¬(p → q) = "p happened and q didn't".`, q: `"It is NOT true that if it rains, the road is wet" means…`, type: 'choice', opts: [`It rains and the road is not wet`, `It doesn't rain and the road is wet`, `If it doesn't rain, the road is not wet`, `It doesn't rain or the road is wet`], ans: `It rains and the road is not wet`, hint: `The broken-promise row.` }],
    mcq: [`Contrapositive of "If it rains, the road is wet":`, `If the road is not wet, it didn't rain`, `If the road is wet, it rained`, `If it doesn't rain, the road is not wet`, `It rains and the road is not wet`] });

  S({ id: '2A-23', t: '2A', sec: '2.4', kind: 'tip', title: `p → q ≡ ¬p ∨ q`,
    note: `Also useful: <b>p → q ≡ ¬p ∨ q</b>.`,
    q: `Fill in the ¬p ∨ q column.`, type: 'truthtable', table: tt(['p', 'q', '¬p ∨ q'], TT2), ans: ['T', 'F', 'T', 'T'], hint: `It should match p → q.`,
    fu: [{ note: `p → q ≡ ¬p ∨ q.`, q: `Rewrite p → q using only ¬ and ∨.`, type: 'exact', ans: ['¬p ∨ q', 'q ∨ ¬p'], hint: `"not p, or q".` }],
    mcq: [`p → q ≡ ?`, `¬p ∨ q`, `p ∨ ¬q`, `¬p ∧ q`, `p ∧ ¬q`] });

  S({ id: '2A-24', t: '2A', sec: '2.4', kind: 'watch', title: `Watch out: converse and inverse are NOT equivalent`,
    note: `The <b>converse</b> q → p and the <b>inverse</b> ¬p → ¬q are <b>NOT</b> equivalent to p → q. Only the contrapositive is.`,
    q: `Which is equivalent to p → q?`, type: 'choice', opts: ['¬q → ¬p', 'q → p', '¬p → ¬q', 'p ∧ q'], ans: '¬q → ¬p', hint: `Only one of converse / inverse / contrapositive.`,
    fu: [{ note: `The converse q → p. Compare its column with p → q (T, F, T, T).`, q: `Fill in the q → p column.`, type: 'truthtable', table: tt(['p', 'q', 'q → p'], TT2), ans: ['T', 'T', 'F', 'T'], hint: `False only when q = T and p = F.` },
      { note: `Converse: q → p. Inverse: ¬p → ¬q. Contrapositive: ¬q → ¬p.`, q: `What is ¬p → ¬q called?`, type: 'choice', opts: ['Inverse', 'Converse', 'Contrapositive', 'Negation'], ans: 'Inverse', hint: `It negates without flipping.` }],
    mcq: [`TRAP: Which is NOT equivalent to p → q?`, `q → p (converse)`, `¬q → ¬p`, `¬p ∨ q`, `¬(p ∧ ¬q)`] });

  // ---- 2.5 Laws of logic ----
  S({ id: '2A-25', t: '2A', sec: '2.5', kind: 'def', title: `Logic laws = set laws (swap ∧ ↔ ∩, ∨ ↔ ∪, ¬ ↔ ′)`,
    note: `Logic laws and set laws are the same pattern: swap <b>∧ ↔ ∩, ∨ ↔ ∪, ¬ ↔ ′</b>. Learn one table and you know both.`,
    q: `In the logic ↔ sets correspondence, ∨ matches which set operation?`, type: 'exact', ans: ['∪', 'union'], hint: `OR ↔ cup.`,
    fu: [{ note: `¬ ↔ ′ (complement).`, q: `¬ matches which set symbol?`, type: 'exact', ans: ['′', 'complement'], hint: `The little prime/bar.` },
      { note: `∧ ↔ ∩.`, q: `∧ matches which set operation?`, type: 'exact', ans: ['∩', 'intersection'], hint: `AND ↔ cap.` }],
    mcq: [`∧ corresponds to which set operation?`, `∩`, `∪`, `′`, `−`] });

  S({ id: '2A-26', t: '2A', sec: '2.5', kind: 'table', title: `Double negation law`,
    note: tbl(['Law', 'Logic', 'Sets'], [['Double negation', '¬¬p ≡ p', '(A′)′ = A']]),
    q: `Simplify ¬¬p.`, type: 'exact', ans: ['p'], hint: `Flip twice.`,
    fu: [{ note: `¬¬p ≡ p.`, q: `Fill in the ¬¬p column.`, type: 'truthtable', table: tt(['p', '¬p', '¬¬p'], [['T', 'F'], ['F', 'T']]), ans: ['T', 'F'], hint: `Flip the ¬p column.` }],
    mcq: [`¬¬p ≡ ?`, `p`, `¬p`, `T`, `F`] });

  S({ id: '2A-27', t: '2A', sec: '2.5', kind: 'table', title: `Idempotent law (logic)`,
    note: tbl(['Law', 'Logic', 'Sets'], [['Idempotent', 'p ∧ p ≡ p, p ∨ p ≡ p', 'A ∩ A = A, A ∪ A = A']]),
    q: `Simplify p ∧ p.`, type: 'exact', ans: ['p'], hint: `Same as A ∩ A.`,
    fu: [{ note: `p ∨ p ≡ p.`, q: `Simplify p ∨ p.`, type: 'exact', ans: ['p'], hint: `Same as A ∪ A.` }],
    mcq: [`p ∨ p ≡ ?`, `p`, `T`, `¬p`, `p ∧ p ∧ p`] });

  S({ id: '2A-28', t: '2A', sec: '2.5', kind: 'table', title: `Commutative law (logic)`,
    note: tbl(['Law', 'Logic', 'Sets'], [['Commutative', 'p ∧ q ≡ q ∧ p, p ∨ q ≡ q ∨ p', 'A ∩ B = B ∩ A, A ∪ B = B ∪ A']]),
    q: `By the commutative law, p ∨ q ≡ ?`, type: 'exact', ans: ['q ∨ p'], hint: `Swap the order.`,
    fu: [{ note: `p ∧ q ≡ q ∧ p ↔ A ∩ B = B ∩ A.`, q: `What is the set version of p ∧ q ≡ q ∧ p? Type the right side of A ∩ B = ?`, type: 'exact', ans: ['B ∩ A'], hint: `Swap ∧ for ∩.` }],
    mcq: [`p ∧ q ≡ q ∧ p is the…`, `commutative law`, `associative law`, `distributive law`, `absorption law`] });

  S({ id: '2A-29', t: '2A', sec: '2.5', kind: 'table', title: `Associative law (logic)`,
    note: tbl(['Law', 'Logic', 'Sets'], [['Associative', '(p ∧ q) ∧ r ≡ p ∧ (q ∧ r)<br>(p ∨ q) ∨ r ≡ p ∨ (q ∨ r)', '(A ∩ B) ∩ C = A ∩ (B ∩ C)<br>(A ∪ B) ∪ C = A ∪ (B ∪ C)']]),
    q: `(p ∧ q) ∧ r ≡ ?`, type: 'exact', ans: ['p ∧ (q ∧ r)'], hint: `Move the brackets.`,
    fu: [{ note: `(p ∨ q) ∨ r ≡ p ∨ (q ∨ r).`, q: `(p ∨ q) ∨ r ≡ ?`, type: 'exact', ans: ['p ∨ (q ∨ r)'], hint: `Same idea with ∨.` }],
    mcq: [`(p ∨ q) ∨ r ≡ p ∨ (q ∨ r) is the…`, `associative law`, `commutative law`, `distributive law`, `idempotent law`] });

  S({ id: '2A-30', t: '2A', sec: '2.5', kind: 'table', title: `Distributive law (logic)`,
    note: tbl(['Law', 'Logic', 'Sets'], [['Distributive', 'p ∨ (q ∧ r) ≡ (p ∨ q) ∧ (p ∨ r)<br>p ∧ (q ∨ r) ≡ (p ∧ q) ∨ (p ∧ r)', 'A ∪ (B ∩ C) = (A ∪ B) ∩ (A ∪ C)<br>A ∩ (B ∪ C) = (A ∩ B) ∪ (A ∩ C)']]),
    q: `p ∨ (q ∧ r) ≡ ?`, type: 'exact', ans: ['(p ∨ q) ∧ (p ∨ r)', '(p ∨ r) ∧ (p ∨ q)'], hint: `Hand "p ∨" to each part.`,
    fu: [{ note: `p ∧ (q ∨ r) ≡ (p ∧ q) ∨ (p ∧ r).`, q: `Fill in the p ∧ (q ∨ r) column.`, type: 'truthtable', table: tt(['p', 'q', 'r', 'p ∧ (q ∨ r)'], TT3), ans: ['T', 'T', 'T', 'F', 'F', 'F', 'F', 'F'], hint: `p must be T, and at least one of q, r must be T.` },
      { note: `The second distributive form.`, q: `p ∧ (q ∨ r) ≡ ?`, type: 'exact', ans: ['(p ∧ q) ∨ (p ∧ r)', '(p ∧ r) ∨ (p ∧ q)'], hint: `Hand "p ∧" to each part.` }],
    mcq: [`p ∧ (q ∨ r) ≡ ?`, `(p ∧ q) ∨ (p ∧ r)`, `(p ∨ q) ∧ (p ∨ r)`, `(p ∧ q) ∧ r`, `p ∨ (q ∧ r)`] });

  S({ id: '2A-31', t: '2A', sec: '2.5', kind: 'table', title: `Absorption law (logic)`,
    note: tbl(['Law', 'Logic', 'Sets'], [['Absorption', 'p ∧ (p ∨ q) ≡ p, p ∨ (p ∧ q) ≡ p', 'A ∩ (A ∪ B) = A, A ∪ (A ∩ B) = A']]),
    q: `Simplify p ∧ (p ∨ q).`, type: 'exact', ans: ['p'], hint: `Like A ∩ (A ∪ B).`,
    fu: [{ note: `p ∨ (p ∧ q) ≡ p: its column should equal the p column.`, q: `Fill in the p ∨ (p ∧ q) column.`, type: 'truthtable', table: tt(['p', 'q', 'p ∨ (p ∧ q)'], TT2), ans: ['T', 'T', 'F', 'F'], hint: `It always equals p.` }],
    mcq: [`p ∨ (p ∧ q) ≡ ?`, `p`, `q`, `p ∧ q`, `p ∨ q`] });

  S({ id: '2A-32', t: '2A', sec: '2.5', kind: 'table', title: `De Morgan's laws (logic)`,
    note: tbl(['Law', 'Logic', 'Sets'], [["De Morgan's", '¬(p ∧ q) ≡ ¬p ∨ ¬q<br>¬(p ∨ q) ≡ ¬p ∧ ¬q', '(A ∩ B)′ = A′ ∪ B′<br>(A ∪ B)′ = A′ ∩ B′']]),
    q: `¬(p ∧ q) ≡ ?`, type: 'exact', ans: ['¬p ∨ ¬q', '¬q ∨ ¬p'], hint: `Negate each, swap ∧ for ∨.`,
    fu: [{ note: `¬(p ∨ q) ≡ ¬p ∧ ¬q.`, q: `¬(p ∨ q) ≡ ?`, type: 'exact', ans: ['¬p ∧ ¬q', '¬q ∧ ¬p'], hint: `∨ becomes ∧.` },
      { note: `¬p ∧ ¬q is T only when both p and q are F.`, q: `Fill in the ¬p ∧ ¬q column.`, type: 'truthtable', table: tt(['p', 'q', '¬p ∧ ¬q'], TT2), ans: ['F', 'F', 'F', 'T'], hint: `Both must be False.` }],
    mcq: [`¬(p ∨ q) ≡ ?`, `¬p ∧ ¬q`, `¬p ∨ ¬q`, `p ∧ q`, `¬p ∨ q`] });

  S({ id: '2A-33', t: '2A', sec: '2.5', kind: 'tip', title: `Memory tip: De Morgan in English`,
    note: `"Not (hot and sunny)" = "not hot <b>or</b> not sunny". The negation goes inside and AND ↔ OR swap.`,
    q: `Negate "It is hot and sunny" using De Morgan (in English).`, type: 'explain', kw: [['not hot', 'isnt hot'], ['not sunny', 'isnt sunny'], ['or']], ans: `It is not hot or it is not sunny.`, hint: `Negate each part, and AND becomes OR.`,
    fu: [{ note: `Same law the other way: NOT (A or B) = not A and not B.`, q: `Negate "I am tired or hungry" in English.`, type: 'explain', kw: [['not tired'], ['not hungry'], ['and']], ans: `I am not tired and not hungry.`, hint: `OR becomes AND.` }],
    mcq: [`"Not (hot and sunny)" means…`, `not hot or not sunny`, `not hot and not sunny`, `hot or sunny`, `not hot and sunny`] });

  // ---- 2.6 Logic ↔ Set theory dictionary ----
  S({ id: '2A-34', t: '2A', sec: '2.6', kind: 'table', title: `Dictionary: x ∉ A`,
    note: tbl(['Set statement', 'Logical condition'], [['x ∉ A', '¬(x ∈ A)']]),
    q: `Write x ∉ A using ¬ and ∈.`, type: 'exact', ans: ['¬(x ∈ A)'], hint: `Negate the membership.`,
    fu: [{ note: `x ∉ A ≡ ¬(x ∈ A).`, q: `If x ∈ A is False, then x ∉ A is…`, type: 'choice', opts: TF, ans: 'True', hint: `¬ flips.` }],
    mcq: [`x ∉ A is the same as…`, `¬(x ∈ A)`, `x ∈ A′ ∩ A`, `¬x ∈ ¬A`, `x ⊆ A′`] });

  S({ id: '2A-35', t: '2A', sec: '2.6', kind: 'table', title: `Dictionary: A ⊆ B`,
    note: tbl(['Set statement', 'Logical condition'], [['A ⊆ B', '∀x (x ∈ A → x ∈ B)']]),
    q: `Write A ⊆ B as a logical condition.`, type: 'exact', ans: ['∀x (x ∈ A → x ∈ B)'], hint: `"for all x, if x ∈ A then …".`,
    fu: [{ note: `A ⊆ B ≡ ∀x (x ∈ A → x ∈ B).`, q: `Which connective is inside A ⊆ B's condition?`, type: 'choice', opts: ['→', '∧', '∨', '↔'], ans: '→', hint: `"if in A, then in B".` }],
    mcq: [`A ⊆ B means…`, `∀x (x ∈ A → x ∈ B)`, `∃x (x ∈ A ∧ x ∈ B)`, `∀x (x ∈ A ∧ x ∈ B)`, `∀x (x ∈ B → x ∈ A)`] });

  S({ id: '2A-36', t: '2A', sec: '2.6', kind: 'table', title: `Dictionary: x ∈ A ∩ B`,
    note: tbl(['Set statement', 'Logical condition'], [['x ∈ A ∩ B', '(x ∈ A) ∧ (x ∈ B)']]),
    q: `Write x ∈ A ∩ B as a logical condition.`, type: 'exact', ans: ['(x ∈ A) ∧ (x ∈ B)', 'x ∈ A ∧ x ∈ B'], hint: `∩ ↔ ∧.`,
    fu: [{ note: `∩ ↔ ∧.`, q: `∩ corresponds to which connective?`, type: 'exact', ans: ['∧', 'and'], hint: `AND.` }],
    mcq: [`x ∈ A ∩ B ≡ ?`, `(x ∈ A) ∧ (x ∈ B)`, `(x ∈ A) ∨ (x ∈ B)`, `(x ∈ A) → (x ∈ B)`, `(x ∈ A) ∧ (x ∉ B)`] });

  S({ id: '2A-37', t: '2A', sec: '2.6', kind: 'table', title: `Dictionary: x ∈ A ∪ B`,
    note: tbl(['Set statement', 'Logical condition'], [['x ∈ A ∪ B', '(x ∈ A) ∨ (x ∈ B)']]),
    q: `Write x ∈ A ∪ B as a logical condition.`, type: 'exact', ans: ['(x ∈ A) ∨ (x ∈ B)', 'x ∈ A ∨ x ∈ B'], hint: `∪ ↔ ∨.`,
    fu: [{ note: `x ∈ A ∪ B ≡ (x ∈ A) ∨ (x ∈ B).`, q: `x ∈ A is False and x ∈ B is True. Is x ∈ A ∪ B?`, type: 'choice', opts: YN, ans: 'Yes', hint: `F ∨ T.` }],
    mcq: [`x ∈ A ∪ B ≡ ?`, `(x ∈ A) ∨ (x ∈ B)`, `(x ∈ A) ∧ (x ∈ B)`, `¬(x ∈ A)`, `(x ∈ A) ↔ (x ∈ B)`] });

  S({ id: '2A-38', t: '2A', sec: '2.6', kind: 'table', title: `Dictionary: x ∈ A − B`,
    note: tbl(['Set statement', 'Logical condition'], [['x ∈ A − B', '(x ∈ A) ∧ (x ∉ B)']]),
    q: `Write x ∈ A − B as a logical condition.`, type: 'exact', ans: ['(x ∈ A) ∧ (x ∉ B)', 'x ∈ A ∧ x ∉ B', '(x ∈ A) ∧ ¬(x ∈ B)'], hint: `In A and not in B.`,
    fu: [{ note: `x ∈ A − B ≡ (x ∈ A) ∧ (x ∉ B).`, q: `x ∈ A and x ∈ B. Is x ∈ A − B?`, type: 'choice', opts: YN, ans: 'No', hint: `x must NOT be in B.` }],
    mcq: [`x ∈ A − B ≡ ?`, `(x ∈ A) ∧ (x ∉ B)`, `(x ∈ A) ∨ (x ∉ B)`, `(x ∉ A) ∧ (x ∈ B)`, `(x ∈ A) → (x ∈ B)`] });

  S({ id: '2A-39', t: '2A', sec: '2.6', kind: 'table', title: `Dictionary: x ∈ A ⊕ B`,
    note: tbl(['Set statement', 'Logical condition'], [['x ∈ A ⊕ B', '((x ∈ A) ∧ (x ∉ B)) ∨ ((x ∈ B) ∧ (x ∉ A))']]),
    q: `Which condition matches x ∈ A ⊕ B?`, type: 'choice', opts: ['((x ∈ A) ∧ (x ∉ B)) ∨ ((x ∈ B) ∧ (x ∉ A))', '(x ∈ A) ∧ (x ∈ B)', '((x ∈ A) ∨ (x ∉ B)) ∧ ((x ∈ B) ∨ (x ∉ A))', '(x ∈ A) ∨ (x ∈ B)'], ans: '((x ∈ A) ∧ (x ∉ B)) ∨ ((x ∈ B) ∧ (x ∉ A))', hint: `In A but not B, OR in B but not A.`,
    fu: [{ note: `⊕ = in exactly one of them.`, q: `x ∈ A and x ∈ B. Is x ∈ A ⊕ B?`, type: 'choice', opts: YN, ans: 'No', hint: `Exactly one.` }],
    mcq: [`x ∈ A ⊕ B means x is…`, `in exactly one of A and B`, `in both A and B`, `in neither`, `in at least one`] });

  S({ id: '2A-40', t: '2A', sec: '2.6', kind: 'table', title: `Dictionary: x ∈ A′`,
    note: tbl(['Set statement', 'Logical condition'], [['x ∈ A′', '(x ∈ U) ∧ ¬(x ∈ A)']]),
    q: `Write x ∈ A′ as a logical condition.`, type: 'exact', ans: ['(x ∈ U) ∧ ¬(x ∈ A)', '(x ∈ U) ∧ (x ∉ A)', 'x ∈ U ∧ x ∉ A'], hint: `In the universe, and not in A.`,
    fu: [{ note: `x ∈ A′ ≡ (x ∈ U) ∧ ¬(x ∈ A).`, q: `Complement corresponds to which pair of ideas?`, type: 'choice', opts: [`in U and not in A`, `in U or in A`, `in A and not in U`, `not in U`], ans: `in U and not in A`, hint: `Read the condition aloud.` }],
    mcq: [`x ∈ A′ ≡ ?`, `(x ∈ U) ∧ ¬(x ∈ A)`, `(x ∈ U) ∨ (x ∈ A)`, `¬(x ∈ U)`, `(x ∈ A) ∧ ¬(x ∈ U)`] });

  S({ id: '2A-41', t: '2A', sec: '2.6', kind: 'table', title: `Dictionary: X ∈ P(A)`,
    note: tbl(['Set statement', 'Logical condition'], [['X ∈ P(A)', 'X ⊆ A']]),
    q: `X ∈ P(A) means X ? A. Type the full statement.`, type: 'exact', ans: ['X ⊆ A'], hint: `Elements of the power set are subsets.`,
    fu: [{ note: `X ∈ P(A) ⟺ X ⊆ A.`, q: `Is {1} ∈ P({1, 2})?`, type: 'choice', opts: YN, ans: 'Yes', hint: `Is {1} ⊆ {1, 2}?` }],
    mcq: [`X ∈ P(A) means…`, `X ⊆ A`, `X ∈ A`, `A ⊆ X`, `X = A`] });

  S({ id: '2A-42', t: '2A', sec: '2.6', kind: 'quick', title: `Quick check: divisible by 3 ↔ divisible by 9`,
    note: `Is "x is divisible by 3 ↔ x is divisible by 9" true for all integers? <b>No.</b> For x = 3: T ↔ F = F. (Divisible by 9 → divisible by 3 holds, but not the other way round.)`,
    q: `Is "x is divisible by 3 ↔ x is divisible by 9" true for all integers?`, type: 'choice', opts: YN, ans: 'No', hint: `Try x = 3.`,
    fu: [{ note: `A counterexample makes the two sides differ: one T, one F.`, q: `Give an integer x that breaks it (divisible by 3 but not by 9).`, type: 'exact', ans: ['3', '6', '12', '15', '21', '24', '30', '33', '-3', '-6', '-12', '-15'], hint: `Small multiple of 3 that isn't a multiple of 9.` },
      { note: `One direction does hold.`, q: `Which direction is always true?`, type: 'choice', opts: [`divisible by 9 → divisible by 3`, `divisible by 3 → divisible by 9`, `both`, `neither`], ans: `divisible by 9 → divisible by 3`, hint: `9 = 3 · 3.` }],
    mcq: [`For x = 3, "x divisible by 3 ↔ x divisible by 9" is…`, `False (T ↔ F)`, `True (T ↔ T)`, `True (F ↔ F)`, `not a proposition`] });

  /* =====================================================================
     CHAPTER 2B — QUANTIFIERS & PROOF
     ===================================================================== */
  // ---- 2.7 Predicates and domain ----
  S({ id: '2B-01', t: '2B', sec: '2.7', kind: 'def', title: `Predicate and domain of discourse`,
    note: `A <b>predicate</b> (propositional function) P(x) is a statement with a variable, e.g. P(x): x &gt; 3. It is <b>not a proposition</b> until you either <b>plug in a value</b> or <b>add a quantifier</b>. The <b>domain of discourse</b> is the set of allowed values for x.`,
    q: `When does a predicate P(x) become a proposition?`, type: 'explain', kw: [['plug in', 'substitute', 'value', 'assign', 'replace', 'specific'], ['quantifier', '∀', '∃', 'for all', 'exists']],
    ans: `When you plug in a value for x, or add a quantifier (∀ or ∃).`, hint: `Two ways.`,
    fu: [{ note: `Domain of discourse = the set of allowed values for x.`, q: `What is the domain of discourse?`, type: 'explain', kw: [['set', 'collection', 'all'], ['allowed', 'possible', 'values', 'can take']], ans: `The set of allowed values for the variable x.`, hint: `Which values may x take?` }],
    mcq: [`P(x): x > 3 is…`, `a predicate, not yet a proposition`, `a proposition`, `always true`, `a quantifier`] });

  S({ id: '2B-02', t: '2B', sec: '2.7', kind: 'table', title: `Predicate value: P(4) for P(x): x > 3`,
    note: tbl(['Predicate', 'Value', 'Result'], [['P(x): x &gt; 3', 'P(4)', 'True']]),
    q: `P(x): x &gt; 3. What is P(4)?`, type: 'choice', opts: TF, ans: 'True', hint: `Is 4 &gt; 3?`,
    fu: [{ note: `P(x): x &gt; 3 is strict.`, q: `P(x): x &gt; 3. What is P(3)?`, type: 'choice', opts: TF, ans: 'False', hint: `Is 3 &gt; 3?` }],
    mcq: [`P(x): x > 3. P(4) is…`, `True`, `False`, `not a proposition`, `undefined`] });

  S({ id: '2B-03', t: '2B', sec: '2.7', kind: 'table', title: `Predicate value: P(2) for P(x): x > 3`,
    note: tbl(['Predicate', 'Value', 'Result'], [['P(x): x &gt; 3', 'P(2)', 'False']]),
    q: `P(x): x &gt; 3. What is P(2)?`, type: 'choice', opts: TF, ans: 'False', hint: `Is 2 &gt; 3?`,
    fu: [{ note: `P(x) is true for x = 4, 5, 6, … (integers).`, q: `What is the smallest integer x with P(x) true?`, type: 'exact', ans: ['4'], hint: `The first integer above 3.` }],
    mcq: [`P(x): x > 3. P(2) is…`, `False`, `True`, `2`, `undefined`] });

  S({ id: '2B-04', t: '2B', sec: '2.7', kind: 'table', title: `Predicate value: Q(1,2) for Q(x,y): x = y + 3`,
    note: tbl(['Predicate', 'Value', 'Result'], [['Q(x,y): x = y + 3', 'Q(1,2)', '1 = 5 → False']]),
    q: `Q(x,y): x = y + 3. What is Q(1,2)?`, type: 'choice', opts: TF, ans: 'False', hint: `Is 1 = 2 + 3?`,
    fu: [{ note: `Plug in both values: Q(x,y) is x = y + 3.`, q: `What is Q(5,2)?`, type: 'choice', opts: TF, ans: 'True', hint: `Is 5 = 2 + 3?` }],
    mcq: [`Q(x,y): x = y + 3. Q(1,2) is…`, `False (1 = 5)`, `True`, `3`, `not a proposition`] });

  S({ id: '2B-05', t: '2B', sec: '2.7', kind: 'table', title: `Predicate value: Q(3,0) for Q(x,y): x = y + 3`,
    note: tbl(['Predicate', 'Value', 'Result'], [['Q(x,y): x = y + 3', 'Q(3,0)', '3 = 3 → True']]),
    q: `Q(x,y): x = y + 3. What is Q(3,0)?`, type: 'choice', opts: TF, ans: 'True', hint: `Is 3 = 0 + 3?`,
    fu: [{ note: `Q(x,y) is true exactly when x = y + 3.`, q: `Find y so that Q(10, y) is True.`, type: 'exact', ans: ['7', 'y = 7'], hint: `10 = y + 3.` }],
    mcq: [`Q(x,y): x = y + 3. Which is True?`, `Q(3,0)`, `Q(0,3)`, `Q(1,2)`, `Q(2,1)`] });

  S({ id: '2B-06', t: '2B', sec: '2.7', kind: 'watch', title: `Watch out: always state the domain first`,
    note: `Always state the domain first. The same statement can be true in one domain and false in another, e.g. <b>∃x (x² = 2)</b> is true in ℝ but false in ℤ.`,
    q: `Domain ℤ: is ∃x (x² = 2) true?`, type: 'choice', opts: TF, ans: 'False', hint: `Is there an integer whose square is 2?`,
    fu: [{ note: `In ℝ, x = √2 works.`, q: `Domain ℝ: is ∃x (x² = 2) true?`, type: 'choice', opts: TF, ans: 'True', hint: `√2 is real.` }],
    mcq: [`TRAP: ∃x (x² = 2) is…`, `true in ℝ but false in ℤ`, `always true`, `always false`, `true in ℤ but false in ℝ`] });

  // ---- 2.8 The two quantifiers ----
  S({ id: '2B-07', t: '2B', sec: '2.8', kind: 'table', title: `Universal quantifier ∀x P(x)`,
    note: tbl(['Quantifier', 'Read as', 'TRUE when…', 'FALSE when…'], [['∀x P(x) universal', 'for all / every / any', 'P(x) true for every x', 'you find one counterexample']]),
    q: `∀x P(x) is FALSE when…`, type: 'choice', opts: [`you find one counterexample`, `P(x) is false for every x`, `you find one witness`, `the domain is infinite`], ans: `you find one counterexample`, hint: `One failure is enough.`,
    fu: [{ note: `∀ reads "for all / every / any".`, q: `How do you read ∀x?`, type: 'exact', ans: ['for all x', 'for all', 'for every x', 'for every', 'for any x', 'every x'], hint: `Three common readings start with "for".` }],
    mcq: [`∀x P(x) is TRUE when…`, `P(x) is true for every x`, `P(x) is true for at least one x`, `P(x) is false for some x`, `you find a witness`] });

  S({ id: '2B-08', t: '2B', sec: '2.8', kind: 'table', title: `Existential quantifier ∃x P(x)`,
    note: tbl(['Quantifier', 'Read as', 'TRUE when…', 'FALSE when…'], [['∃x P(x) existential', 'there exists / for some / at least one', 'you find one witness x', 'P(x) false for every x']]),
    q: `∃x P(x) is FALSE when…`, type: 'choice', opts: [`P(x) is false for every x`, `you find one counterexample`, `P(x) is true for one x`, `the domain is ℝ`], ans: `P(x) is false for every x`, hint: `To kill ∃ you must check everything.`,
    fu: [{ note: `∃x P(x) is TRUE when you find one witness.`, q: `What do you need to show ∃x P(x) is TRUE?`, type: 'exact', ans: ['one witness', 'a witness', 'witness', 'an example', 'one example'], hint: `Just one of these.` }],
    mcq: [`∃x reads as…`, `there exists / for some / at least one`, `for all`, `for no`, `exactly one`] });

  S({ id: '2B-09', t: '2B', sec: '2.8', kind: 'tip', title: `Memory tip: ∀ = upside-down A, ∃ = backwards E`,
    note: `∀ is an upside-down A → "<b>All</b>". ∃ is a backwards E → "<b>Exists</b>".<br>To kill a ∀ claim you need just one <b>counterexample</b>. To prove a ∃ claim you need just one <b>witness</b>.`,
    q: `To disprove a ∀ claim you need just one…`, type: 'exact', ans: ['counterexample', 'counter example', 'counter-example'], hint: `It "counters" the claim.`,
    fu: [{ note: `To prove a ∃ claim you need just one witness.`, q: `To prove a ∃ claim you need just one…`, type: 'exact', ans: ['witness', 'example'], hint: `Someone who saw it happen.` }],
    mcq: [`∀ is an upside-down A for…`, `All`, `Any one`, `Assume`, `And`] });

  S({ id: '2B-10', t: '2B', sec: '2.8', kind: 'example', title: `Counterexample: ∀x (x² ≥ 9) on {1,2,3,4}`,
    note: `∀x (x² ≥ 9), domain {1,2,3,4}? x = 1 gives 1 ≥ 9, which is false → statement is <b>False</b>. (x = 1 is a counterexample. Note x = 3 and x = 4 work; one failure is enough.)<br>∀x (x² ≥ 0), x ∈ ℝ → <b>True</b>.`,
    q: `Domain {1,2,3,4}. Give a counterexample to ∀x (x² ≥ 9).`, type: 'exact', ans: ['1', '2', 'x = 1', 'x = 2'], hint: `Find an x whose square is less than 9.`,
    fu: [{ note: `Squares of real numbers are never negative.`, q: `Is ∀x (x² ≥ 0) true for x ∈ ℝ?`, type: 'choice', opts: TF, ans: 'True', hint: `Can a square be negative?` },
      { note: `One counterexample makes a ∀ claim false.`, q: `So, on {1,2,3,4}, ∀x (x² ≥ 9) is…`, type: 'choice', opts: TF, ans: 'False', hint: `You found a counterexample.` }],
    mcq: [`Domain {1,2,3,4}: ∀x (x² ≥ 9) is…`, `False (x = 1 is a counterexample)`, `True (x = 3 works)`, `True (x = 4 works)`, `not a proposition`] });

  S({ id: '2B-11', t: '2B', sec: '2.8', kind: 'example', title: `Witness: ∃x (x/(x² + 1) = 2/5)`,
    note: `∃x ( x / (x² + 1) = 2/5 ), x ∈ ℝ? Try x = 2: 2/(4+1) = 2/5 ✔ → <b>True</b>.<br>You do not need to find every solution.`,
    q: `Give a witness x for ∃x (x / (x² + 1) = 2/5).`, type: 'exact', ans: ['2', 'x = 2', '1/2', '0.5', 'x = 1/2'], hint: `Try small whole numbers.`,
    fu: [{ note: `One witness is enough to prove ∃.`, q: `Do you need to find every solution to prove an ∃ claim?`, type: 'choice', opts: YN, ans: 'No', hint: `"at least one".` }],
    mcq: [`To prove ∃x (x/(x²+1) = 2/5) you…`, `show one x that works, e.g. x = 2`, `check every real number`, `find a counterexample`, `prove it for all x`] });

  S({ id: '2B-12', t: '2B', sec: '2.8', kind: 'def', title: `Negating ∀: ¬∀x P(x) ≡ ∃x ¬P(x)`,
    note: `<b>¬∀x P(x) ≡ ∃x ¬P(x)</b><br>Example (P(x): x takes Discrete Structures): "Not all students take it" = "Some student does not".<br><b>Memory tip:</b> "Push the NOT through: flip the quantifier." ∀ becomes ∃, ∃ becomes ∀, and the ¬ lands on the predicate.`,
    q: `¬∀x P(x) ≡ ?`, type: 'exact', ans: ['∃x ¬P(x)'], hint: `Push the NOT through and flip the quantifier.`,
    fu: [{ note: `"Not all students take it" = "Some student does not".`, q: `Negate in English: "Every student takes Discrete Structures."`, type: 'explain', kw: [['some', 'at least one', 'there is', 'exists', 'a student'], ['does not', 'doesnt', 'not']], ans: `Some student does not take Discrete Structures.`, hint: `"Not every" = "some … not".` },
      { note: `Push ¬ through ∀ onto the predicate.`, q: `Negate ∀x (x &gt; 0). Write it with no ¬ in front of the quantifier.`, type: 'exact', ans: ['∃x ¬(x > 0)', '∃x (x ≤ 0)', '∃x x ≤ 0'], hint: `∃x, then the negated inequality.` }],
    mcq: [`¬∀x P(x) ≡ ?`, `∃x ¬P(x)`, `∀x ¬P(x)`, `¬∃x P(x)`, `∃x P(x)`] });

  S({ id: '2B-13', t: '2B', sec: '2.8', kind: 'def', title: `Negating ∃: ¬∃x P(x) ≡ ∀x ¬P(x)`,
    note: `<b>¬∃x P(x) ≡ ∀x ¬P(x)</b><br>Example: "No student takes it" = "Every student does not".<br><b>Memory tip:</b> Push the NOT through: flip the quantifier.`,
    q: `¬∃x P(x) ≡ ?`, type: 'exact', ans: ['∀x ¬P(x)'], hint: `∃ becomes ∀.`,
    fu: [{ note: `¬∃ = "for all, not".`, q: `Negate ∃x (x² = 2) so that no ¬ stands in front of the quantifier.`, type: 'exact', ans: ['∀x ¬(x² = 2)', '∀x (x² ≠ 2)', '∀x x² ≠ 2'], hint: `∀x, then "not equal".` }],
    mcq: [`"No student takes it" ≡ ?`, `∀x ¬P(x)`, `∃x ¬P(x)`, `¬∀x P(x)`, `∃x P(x)`] });

  S({ id: '2B-14', t: '2B', sec: '2.8', kind: 'tip', title: `Golden rule: ∀ goes with →, ∃ goes with ∧`,
    note: `When the domain is wider than the group you're talking about:<br><b>∀ goes with → &nbsp;·&nbsp; ∃ goes with ∧</b>`,
    q: `Which pairing is the golden rule?`, type: 'choice', opts: [`∀ with →, ∃ with ∧`, `∀ with ∧, ∃ with →`, `both with ∧`, `both with →`], ans: `∀ with →, ∃ with ∧`, hint: `"Every student…" is an if-then.`,
    fu: [{ note: `Domain: all animals. D(x): x is a dog, B(x): x barks.`, q: `Translate "All dogs bark."`, type: 'exact', ans: ['∀x (D(x) → B(x))'], hint: `∀ with →.` }],
    mcq: [`"Some student is tired" (domain: all people) uses…`, `∃x (S(x) ∧ T(x))`, `∃x (S(x) → T(x))`, `∀x (S(x) ∧ T(x))`, `∀x (S(x) → T(x))`] });

  S({ id: '2B-15', t: '2B', sec: '2.8', kind: 'table', title: `Translate: "Every student in this class has studied calculus."`,
    note: tbl(['Sentence (domain: all people)', '✔ Correct', '✘ Wrong (why)'], [['"Every student in this class has studied calculus."', '∀x (S(x) → C(x))', '∀x (S(x) ∧ C(x)) says everyone is a student in this class']]),
    q: `Domain: all people. S(x): x is a student in this class, C(x): x has studied calculus. Translate "Every student in this class has studied calculus."`, type: 'exact', ans: ['∀x (S(x) → C(x))'], hint: `∀ goes with →.`,
    fu: [{ note: `∀x (S(x) ∧ C(x)) claims something about EVERY person.`, q: `Why is ∀x (S(x) ∧ C(x)) wrong?`, type: 'choice', opts: [`It says everyone is a student in this class`, `It is too weak`, `∧ can't be used with ∀ ever`, `It is the same as the correct answer`], ans: `It says everyone is a student in this class`, hint: `Read it out for a random person.` }],
    mcq: [`"Every student in this class has studied calculus" =`, `∀x (S(x) → C(x))`, `∀x (S(x) ∧ C(x))`, `∃x (S(x) ∧ C(x))`, `∃x (S(x) → C(x))`] });

  S({ id: '2B-16', t: '2B', sec: '2.8', kind: 'table', title: `Translate: "Some student in this class has visited Mexico."`,
    note: tbl(['Sentence (domain: all people)', '✔ Correct', '✘ Wrong (why)'], [['"Some student in this class has visited Mexico."', '∃x (S(x) ∧ M(x))', '∃x (S(x) → M(x)) is true just because some non-student exists (F → anything = T)']]),
    q: `Domain: all people. S(x): student in this class, M(x): has visited Mexico. Translate "Some student in this class has visited Mexico."`, type: 'exact', ans: ['∃x (S(x) ∧ M(x))'], hint: `∃ goes with ∧.`,
    fu: [{ note: `For a non-student, S(x) → M(x) is F → … = T.`, q: `Why is ∃x (S(x) → M(x)) wrong?`, type: 'choice', opts: [`It is true just because some non-student exists`, `It is always false`, `It needs ∀ instead`, `It means every student visited Mexico`], ans: `It is true just because some non-student exists`, hint: `What is F → anything?` }],
    mcq: [`"Some student has visited Mexico" (domain: all people) =`, `∃x (S(x) ∧ M(x))`, `∃x (S(x) → M(x))`, `∀x (S(x) → M(x))`, `∀x (S(x) ∧ M(x))`] });

  S({ id: '2B-17', t: '2B', sec: '2.8', kind: 'table', title: `Translate: "Every student has visited Canada or Mexico."`,
    note: tbl(['Sentence (domain: all people)', '✔ Correct', 'Note'], [['"Every student has visited Canada or Mexico."', '∀x (S(x) → (C(x) ∨ M(x)))', 'If the domain is only students: ∀x (C(x) ∨ M(x))']]),
    q: `Domain: all people. Translate "Every student has visited Canada or Mexico." (S, C, M)`, type: 'exact', ans: ['∀x (S(x) → (C(x) ∨ M(x)))', '∀x (S(x) → C(x) ∨ M(x))'], hint: `∀ with →, and the "or" goes in the conclusion.`,
    fu: [{ note: `If the domain is only students, you don't need S(x).`, q: `Domain: students only. Translate the same sentence.`, type: 'exact', ans: ['∀x (C(x) ∨ M(x))'], hint: `Drop the S(x) →.` }],
    mcq: [`Domain: only students. "Every student has visited Canada or Mexico" =`, `∀x (C(x) ∨ M(x))`, `∀x (S(x) ∧ (C(x) ∨ M(x)))`, `∃x (C(x) ∨ M(x))`, `∀x (C(x) ∧ M(x))`] });

  var QCN = `Domain: students at your school. P(x): x speaks Russian, Q(x): x knows C++.`;
  S({ id: '2B-18', t: '2B', sec: '2.8', kind: 'quick', title: `Quick check a) Some student speaks Russian and knows C++`,
    note: QCN + `<br>a) Some student speaks Russian and knows C++ → <b>∃x (P(x) ∧ Q(x))</b>`,
    q: QCN + `<br>Translate: "Some student speaks Russian and knows C++."`, type: 'exact', ans: ['∃x (P(x) ∧ Q(x))'], hint: `"Some" → ∃.`,
    fu: [{ note: QCN, q: `Translate: "Some student does not speak Russian."`, type: 'exact', ans: ['∃x ¬P(x)'], hint: `∃ then ¬P(x).` }],
    mcq: [`"Some student speaks Russian and knows C++" =`, `∃x (P(x) ∧ Q(x))`, `∀x (P(x) ∧ Q(x))`, `∃x (P(x) ∨ Q(x))`, `∃x (P(x) → Q(x))`] });

  S({ id: '2B-19', t: '2B', sec: '2.8', kind: 'quick', title: `Quick check b) Every student speaks Russian or knows C++`,
    note: QCN + `<br>b) Every student speaks Russian or knows C++ → <b>∀x (P(x) ∨ Q(x))</b>`,
    q: QCN + `<br>Translate: "Every student speaks Russian or knows C++."`, type: 'exact', ans: ['∀x (P(x) ∨ Q(x))'], hint: `"Every" → ∀. The domain is already students.`,
    fu: [{ note: QCN, q: `Translate: "Every student speaks Russian and knows C++."`, type: 'exact', ans: ['∀x (P(x) ∧ Q(x))'], hint: `Same, with "and".` }],
    mcq: [`"Every student speaks Russian or knows C++" =`, `∀x (P(x) ∨ Q(x))`, `∃x (P(x) ∨ Q(x))`, `∀x (P(x) ∧ Q(x))`, `∀x P(x) ∧ Q(x)`] });

  S({ id: '2B-20', t: '2B', sec: '2.8', kind: 'quick', title: `Quick check c) No student speaks Russian or knows C++`,
    note: QCN + `<br>c) No student speaks Russian or knows C++ → <b>¬∃x (P(x) ∨ Q(x)) ≡ ∀x (¬P(x) ∧ ¬Q(x))</b>`,
    q: QCN + `<br>Translate: "No student speaks Russian or knows C++." (start with ¬∃)`, type: 'exact', ans: ['¬∃x (P(x) ∨ Q(x))'], hint: `"No one" = "there is not one who…".`,
    fu: [{ note: `¬∃x (P(x) ∨ Q(x)) ≡ ∀x (¬P(x) ∧ ¬Q(x)) (push the NOT through, then De Morgan).`, q: `Write the equivalent form that starts with ∀.`, type: 'exact', ans: ['∀x (¬P(x) ∧ ¬Q(x))'], hint: `Flip ∃ to ∀, then De Morgan on the ∨.` }],
    mcq: [`"No student speaks Russian or knows C++" ≡`, `∀x (¬P(x) ∧ ¬Q(x))`, `∀x (¬P(x) ∨ ¬Q(x))`, `∃x (¬P(x) ∧ ¬Q(x))`, `¬∀x (P(x) ∨ Q(x))`] });

  // ---- 2.9 Nested quantifiers ----
  S({ id: '2B-21', t: '2B', sec: '2.9', kind: 'def', title: `Nested quantifiers: read left to right`,
    note: `<b>Read left to right.</b> In ∀x ∃y P(x,y), y is chosen <b>after</b> x, so y may depend on x. In ∃y ∀x P(x,y), <b>one fixed y</b> must work for all x.`,
    q: `In ∀x ∃y P(x,y), may y depend on x? Explain why.`, type: 'explain', kw: [['yes', 'can', 'may'], ['after', 'chosen after', 'x first', 'left to right', 'first', 'depends']],
    ans: `Yes: we read left to right, so y is chosen after x and may depend on it.`, hint: `Which variable is chosen first?`,
    fu: [{ note: `In ∃y ∀x P(x,y), one fixed y must work for all x.`, q: `In ∃y ∀x P(x,y)…`, type: 'choice', opts: [`one fixed y must work for every x`, `each x gets its own y`, `y depends on x`, `x is chosen first`], ans: `one fixed y must work for every x`, hint: `y comes first.` }],
    mcq: [`Nested quantifiers are read…`, `left to right`, `right to left`, `inside out`, `in any order`] });

  S({ id: '2B-22', t: '2B', sec: '2.9', kind: 'table', title: `∀x ∀y: true for every pair`,
    note: tbl(['Form', 'Meaning', 'Example (x, y ∈ ℝ)'], [['∀x ∀y P(x,y)', 'true for every pair', '∀x∀y (x + y = y + x) ✔']]),
    q: `x, y ∈ ℝ. Is ∀x∀y (x + y = y + x) true?`, type: 'choice', opts: TF, ans: 'True', hint: `Addition order.`,
    fu: [{ note: `∀x ∀y P(x,y) needs P true for EVERY pair.`, q: `x, y ∈ ℝ. Is ∀x∀y (x − y = y − x) true?`, type: 'choice', opts: TF, ans: 'False', hint: `Try x = 1, y = 0.` }],
    mcq: [`∀x ∀y P(x,y) means P is true…`, `for every pair (x, y)`, `for at least one pair`, `for one y and all x`, `for x = y only`] });

  S({ id: '2B-23', t: '2B', sec: '2.9', kind: 'table', title: `∀x ∃y: each x has its own y`,
    note: tbl(['Form', 'Meaning', 'Example (x, y ∈ ℝ)'], [['∀x ∃y P(x,y)', 'each x has its own y', '∀x∃y (x + y = 0) ✔ choose y = −x']]),
    q: `∀x∃y (x + y = 0), x, y ∈ ℝ: which y works for a given x?`, type: 'exact', ans: ['-x', 'y = -x'], hint: `Solve x + y = 0 for y.`,
    fu: [{ note: `Every x has its own y = −x.`, q: `So is ∀x∃y (x + y = 0) true in ℝ?`, type: 'choice', opts: TF, ans: 'True', hint: `You found a y for every x.` }],
    mcq: [`∀x∃y (x + y = 0) over ℝ is…`, `True (choose y = −x)`, `False (no y works for all x)`, `True (choose y = 0)`, `False (x could be 0)`] });

  S({ id: '2B-24', t: '2B', sec: '2.9', kind: 'table', title: `∃y ∀x: one y works for all x`,
    note: tbl(['Form', 'Meaning', 'Example (x, y ∈ ℝ)'], [['∃y ∀x P(x,y)', 'one y works for all x', '∃y∀x (y &gt; x) ✘ (no biggest real; take x = y)']]),
    q: `x, y ∈ ℝ. Is ∃y∀x (y &gt; x) true?`, type: 'choice', opts: TF, ans: 'False', hint: `Is there a biggest real number?`,
    fu: [{ note: `Any proposed y fails for x = y (y &gt; y is false).`, q: `Explain why ∃y∀x (y &gt; x) is false in ℝ.`, type: 'explain', kw: [['biggest', 'largest', 'greatest', 'maximum', 'no'], ['x = y', 'x=y', 'take x', 'choose x', 'same', 'itself']], ans: `There is no biggest real: whatever y you pick, take x = y and y > x fails.`, hint: `Try x equal to your y.` }],
    mcq: [`∃y∀x (y > x) over ℝ is false because…`, `there is no biggest real number`, `y must depend on x`, `x could be negative`, `ℝ is uncountable`] });

  S({ id: '2B-25', t: '2B', sec: '2.9', kind: 'table', title: `∃x ∃y: at least one pair`,
    note: tbl(['Form', 'Meaning', 'Example (x, y ∈ ℝ)'], [['∃x ∃y P(x,y)', 'at least one pair', '∃x∃y (x + y = 10) ✔ (x=4, y=6)']]),
    q: `∃x∃y (x + y = 10): with x = 4, which y makes it work?`, type: 'exact', ans: ['6', 'y = 6'], hint: `4 + y = 10.`,
    fu: [{ note: `∃x ∃y needs just one pair.`, q: `How many pairs do you need to show ∃x∃y P(x,y) is true?`, type: 'exact', ans: ['1', 'one', 'at least one'], hint: `At least…` }],
    mcq: [`∃x ∃y P(x,y) is true when…`, `at least one pair works`, `every pair works`, `one y works for all x`, `each x has its own y`] });

  S({ id: '2B-26', t: '2B', sec: '2.9', kind: 'tip', title: `Memory tip: "everyone has their own" vs "one for everyone"`,
    note: `∀x ∃y = "<b>everyone has their own</b>" (every student has a project).<br>∃y ∀x = "<b>one for everyone</b>" (there is one project that every student works on). Swapping ∀ and ∃ changes the meaning!`,
    q: `"There is one project that every student works on." Which form?`, type: 'choice', opts: ['∃y ∀x', '∀x ∃y', '∀x ∀y', '∃x ∃y'], ans: '∃y ∀x', hint: `One for everyone.`,
    fu: [{ note: `∀x ∃y = everyone has their own.`, q: `"Every student has a project." Which form?`, type: 'choice', opts: ['∀x ∃y', '∃y ∀x', '∃x ∃y', '∀x ∀y'], ans: '∀x ∃y', hint: `Everyone has their own.` }],
    mcq: [`∀x ∃y means…`, `everyone has their own`, `one for everyone`, `no one has one`, `exactly one pair`] });

  var PROJ = tbl(['Student', 'Project A', 'Project B'], [['Ali', 'Yes', 'No'], ['Mei', 'No', 'Yes'], ['Ravi', 'Yes', 'No']]);
  S({ id: '2B-27', t: '2B', sec: '2.9', kind: 'example', title: `Example: R(x,y) = student x works on project y`,
    note: `R(x,y): student x works on project y.` + PROJ + `∀x ∃y R(x,y): every row has a "Yes" → <b>True</b><br>∃y ∀x R(x,y): no column is all "Yes" → <b>False</b>`,
    q: PROJ + `Is ∀x ∃y R(x,y) true?`, type: 'choice', opts: TF, ans: 'True', hint: `Does every row have a Yes?`,
    fu: [{ note: `∃y ∀x R(x,y) needs a column that is all "Yes".`, q: PROJ + `Is ∃y ∀x R(x,y) true?`, type: 'choice', opts: TF, ans: 'False', hint: `Look for a full column of Yes.` },
      { note: `Change the table: now Mei also works on Project A.`, q: tbl(['Student', 'Project A', 'Project B'], [['Ali', 'Yes', 'No'], ['Mei', 'Yes', 'Yes'], ['Ravi', 'Yes', 'No']]) + `Now is ∃y ∀x R(x,y) true?`, type: 'choice', opts: TF, ans: 'True', hint: `Check the Project A column.` }],
    mcq: [`In a student/project table, ∃y ∀x R(x,y) is true when…`, `some column is all "Yes"`, `every row has a "Yes"`, `some row is all "Yes"`, `there is at least one "Yes"`] });

  S({ id: '2B-28', t: '2B', sec: '2.9', kind: 'def', title: `Negating nested quantifiers: ¬∀x∃y P ≡ ∃x∀y ¬P`,
    note: `Flip every quantifier, then negate P:<br><b>¬∀x∃y P(x,y) ≡ ∃x∀y ¬P(x,y)</b><br>"Not every student has a project" = "some student has no project".`,
    q: `¬∀x∃y P(x,y) ≡ ?`, type: 'exact', ans: ['∃x∀y ¬P(x,y)', '∃x ∀y ¬P(x, y)'], hint: `Flip each quantifier, ¬ lands on P.`,
    fu: [{ note: `"Not every student has a project" = "some student has no project".`, q: `"Not every student has a project" means…`, type: 'choice', opts: [`Some student has no project`, `No student has a project`, `Every student has no project`, `Some project has no student`], ans: `Some student has no project`, hint: `¬∀ = ∃¬.` }],
    mcq: [`¬∀x∃y P(x,y) ≡ ?`, `∃x∀y ¬P(x,y)`, `∀x∃y ¬P(x,y)`, `∃x∃y ¬P(x,y)`, `∀x∀y ¬P(x,y)`] });

  S({ id: '2B-29', t: '2B', sec: '2.9', kind: 'def', title: `Negating nested quantifiers: ¬∃y∀x P ≡ ∀y∃x ¬P`,
    note: `<b>¬∃y∀x P(x,y) ≡ ∀y∃x ¬P(x,y)</b><br>"No project serves everyone" = "every project misses some student".`,
    q: `¬∃y∀x P(x,y) ≡ ?`, type: 'exact', ans: ['∀y∃x ¬P(x,y)', '∀y ∃x ¬P(x, y)'], hint: `∃ → ∀, ∀ → ∃, ¬ on P.`,
    fu: [{ note: `"No project serves everyone" = "every project misses some student".`, q: `"No project serves everyone" means…`, type: 'choice', opts: [`Every project misses some student`, `Some project misses every student`, `No student has a project`, `Every student misses some project`], ans: `Every project misses some student`, hint: `¬∃y∀x = ∀y∃x¬.` }],
    mcq: [`¬∃y∀x P(x,y) ≡ ?`, `∀y∃x ¬P(x,y)`, `∃y∀x ¬P(x,y)`, `∀y∀x ¬P(x,y)`, `∃y∃x ¬P(x,y)`] });

  S({ id: '2B-30', t: '2B', sec: '2.9', kind: 'example', title: `Translate ∀x (C(x) ∨ ∃y (C(y) ∧ F(x,y)))`,
    note: `C(x): x has a computer; F(x,y): x and y are friends.<br>∀x ( C(x) ∨ ∃y ( C(y) ∧ F(x,y) ) )<br>→ "<b>Every student has a computer or has a friend who has a computer.</b>"`,
    q: `C(x): x has a computer; F(x,y): x and y are friends. Translate ∀x (C(x) ∨ ∃y (C(y) ∧ F(x,y))) into English.`, type: 'explain', kw: [['every', 'all', 'each'], ['computer'], ['or'], ['friend']],
    ans: `Every student has a computer or has a friend who has a computer.`, hint: `Read left to right: for every x, …`,
    fu: [{ note: `∃y (C(y) ∧ F(x,y)) = "x has a friend y who has a computer".`, q: `Which part means "has a friend who has a computer"?`, type: 'choice', opts: ['∃y (C(y) ∧ F(x,y))', 'C(x)', '∀x C(x)', 'F(x,y) → C(y)'], ans: '∃y (C(y) ∧ F(x,y))', hint: `"there is a y who…".` }],
    mcq: [`∀x (C(x) ∨ ∃y (C(y) ∧ F(x,y))) means…`, `everyone has a computer or a friend with one`, `everyone has a computer and a friend`, `someone has a computer`, `every friend has a computer`] });

  // ---- 2.10 Proof techniques ----
  var TERMS = [`Assumed to be true (no proof needed)`, `Introduces a concept`, `Basic term not explicitly defined`, `A statement proven true from the above`];
  S({ id: '2B-31', t: '2B', sec: '2.10', kind: 'table', title: `Term: axiom`,
    note: tbl(['Term', 'Role'], [['Axiom', TERMS[0]]]),
    q: `What is an axiom?`, type: 'choice', opts: TERMS, ans: TERMS[0], hint: `It's never proved.`,
    fu: [{ note: `Axiom = assumed true.`, q: `Does an axiom need a proof?`, type: 'choice', opts: YN, ans: 'No', hint: `It's assumed.` }],
    mcq: [`A statement assumed true without proof is a(n)…`, `axiom`, `theorem`, `definition`, `undefined term`] });

  S({ id: '2B-32', t: '2B', sec: '2.10', kind: 'table', title: `Term: definition`,
    note: tbl(['Term', 'Role'], [['Definition', TERMS[1]]]),
    q: `What does a definition do?`, type: 'choice', opts: TERMS, ans: TERMS[1], hint: `e.g. "n is even if n = 2k".`,
    fu: [{ note: `"n is even if n = 2k for some k ∈ ℤ" is a definition: it introduces the concept "even".`, q: `"n is even if n = 2k" is a…`, type: 'choice', opts: ['Definition', 'Axiom', 'Theorem', 'Undefined term'], ans: 'Definition', hint: `It introduces a concept.` }],
    mcq: [`A definition…`, `introduces a concept`, `is proven from axioms`, `is assumed without proof`, `is never written down`] });

  S({ id: '2B-33', t: '2B', sec: '2.10', kind: 'table', title: `Term: undefined term`,
    note: tbl(['Term', 'Role'], [['Undefined term', TERMS[2]]]),
    q: `What is an undefined term?`, type: 'choice', opts: TERMS, ans: TERMS[2], hint: `The basic building blocks.`,
    fu: [{ note: `Undefined term = basic term not explicitly defined.`, q: `Is an undefined term explicitly defined?`, type: 'choice', opts: YN, ans: 'No', hint: `The name says it.` }],
    mcq: [`A basic term not explicitly defined is a(n)…`, `undefined term`, `axiom`, `theorem`, `lemma`] });

  S({ id: '2B-34', t: '2B', sec: '2.10', kind: 'table', title: `Term: theorem`,
    note: tbl(['Term', 'Role'], [['Theorem', TERMS[3]]]),
    q: `What is a theorem?`, type: 'choice', opts: TERMS, ans: TERMS[3], hint: `It needs a proof.`,
    fu: [{ note: `A theorem is proven true from axioms, definitions and undefined terms.`, q: `A statement proven true from axioms and definitions is called a…`, type: 'exact', ans: ['theorem'], hint: `Starts with "th".` }],
    mcq: [`A theorem is…`, `a statement proven true`, `assumed true`, `a definition`, `an undefined term`] });

  S({ id: '2B-35', t: '2B', sec: '2.10', kind: 'table', title: `Proving p → q: direct proof`,
    note: tbl(['Method', 'Assume', 'Show', 'Use when…'], [['Direct', 'p', 'q', 'the hypothesis gives a nice algebraic form']]),
    q: `In a direct proof of p → q, you assume … and show …`, type: 'choice', opts: [`assume p, show q`, `assume ¬q, show ¬p`, `assume p and ¬q, find a contradiction`, `assume q, show p`], ans: `assume p, show q`, hint: `Straight from hypothesis to conclusion.`,
    fu: [{ note: `Direct proof: use when the hypothesis gives a nice algebraic form.`, q: `When is a direct proof a good choice?`, type: 'choice', opts: [`When the hypothesis gives a nice algebraic form`, `When "not q" is easier`, `When assuming the opposite gives a clash`, `Never`], ans: `When the hypothesis gives a nice algebraic form`, hint: `What do you start from?` }],
    mcq: [`Direct proof of p → q:`, `assume p, show q`, `assume q, show p`, `assume ¬p, show ¬q`, `assume ¬q, show ¬p`] });

  S({ id: '2B-36', t: '2B', sec: '2.10', kind: 'table', title: `Proving p → q: contrapositive`,
    note: tbl(['Method', 'Assume', 'Show', 'Use when…'], [['Contrapositive', '¬q', '¬p', '"not q" is easier to work with (works because p → q ≡ ¬q → ¬p)']]),
    q: `In a proof by contrapositive of p → q, you assume … and show …`, type: 'choice', opts: [`assume ¬q, show ¬p`, `assume p, show q`, `assume ¬p, show ¬q`, `assume p and ¬q, find a contradiction`], ans: `assume ¬q, show ¬p`, hint: `Flip and negate.`,
    fu: [{ note: `It works because p → q ≡ ¬q → ¬p.`, q: `Why is proof by contrapositive valid?`, type: 'explain', kw: [['equivalent', '≡', 'same truth', 'same as', 'logically'], ['contrapositive', '¬q → ¬p', 'not q', 'q → p']], ans: `Because p → q is logically equivalent to its contrapositive ¬q → ¬p.`, hint: `Which law from 2.4?` }],
    mcq: [`Proof by contrapositive works because…`, `p → q ≡ ¬q → ¬p`, `p → q ≡ q → p`, `p → q ≡ ¬p → ¬q`, `p → q ≡ p ∧ ¬q`] });

  S({ id: '2B-37', t: '2B', sec: '2.10', kind: 'table', title: `Proving p → q: contradiction`,
    note: tbl(['Method', 'Assume', 'Show', 'Use when…'], [['Contradiction', 'p and ¬q', 'something impossible', 'assuming the opposite gives a clash']]),
    q: `In a proof by contradiction of p → q, you assume…`, type: 'choice', opts: [`p and ¬q`, `¬q only`, `p only`, `¬p and q`], ans: `p and ¬q`, hint: `Assume the claim fails.`,
    fu: [{ note: `Then you show something impossible.`, q: `What must you reach after assuming p and ¬q?`, type: 'choice', opts: [`Something impossible (a contradiction)`, `q`, `¬p`, `p ∨ q`], ans: `Something impossible (a contradiction)`, hint: `A clash.` }],
    mcq: [`Proof by contradiction of p → q assumes…`, `p ∧ ¬q`, `¬p ∧ q`, `¬q only`, `q ∧ p`] });

  S({ id: '2B-38', t: '2B', sec: '2.10', kind: 'tip', title: `Memory tip: even = 2k, odd = 2k + 1`,
    note: `<b>Even: n = 2k &nbsp; Odd: n = 2k + 1</b> (k ∈ ℤ). Almost every proof in this chapter starts by writing one of these, then expand → factor out 2.`,
    q: `Definition of odd: n = ?`, type: 'exact', ans: ['2k + 1', '2k+1'], hint: `One more than an even number.`,
    fu: [{ note: `Even: n = 2k.`, q: `Definition of even: n = ?`, type: 'exact', ans: ['2k'], hint: `Twice an integer.` },
      { note: `Odd: n = 2k + 1.`, q: `Write 7 as 2k + 1. What is k?`, type: 'exact', ans: ['3', 'k = 3'], hint: `7 = 2·? + 1.` }],
    mcq: [`An odd integer can be written as…`, `2k + 1 (k ∈ ℤ)`, `2k`, `k + 1`, `k²`] });

  S({ id: '2B-39', t: '2B', sec: '2.10', kind: 'proof', title: `Direct proof: if x is odd, then x² is odd`,
    note: tbl(['Step', 'Reason'], [['Let a be any odd integer, a = 2n + 1', 'Definition of odd (a is arbitrary)'], ['a² = (2n + 1)² = 4n² + 4n + 1', 'Expand'], ['= 2(2n² + 2n) + 1 = 2m + 1, m ∈ ℤ', 'Factor out 2 → a² is odd ∎']]) + `Because a was arbitrary, the result holds for all integers (universal generalisation).`,
    q: `Complete: 4n² + 4n + 1 = 2( ? ) + 1. Type what goes in the brackets.`, type: 'exact', ans: ['2n² + 2n', '2n^2+2n', '2n(n+1)'], hint: `Factor 2 out of 4n² + 4n.`,
    fu: [{ note: `a = 2n + 1 → a² = (2n + 1)².`, q: `Expand (2n + 1)².`, type: 'exact', ans: ['4n² + 4n + 1', '4n^2+4n+1'], hint: `(a + b)² = a² + 2ab + b².` },
      { note: `Because a was arbitrary, the result holds for all odd integers (universal generalisation).`, q: `Why does the proof say "let a be ANY odd integer"?`, type: 'explain', kw: [['arbitrary', 'any', 'general'], ['all', 'every']], ans: `Because a is arbitrary, the argument works for every odd integer, so it proves the ∀ statement (universal generalisation).`, hint: `What does an arbitrary element let you conclude?` }],
    mcq: [`In the proof "x odd → x² odd", why is a² odd?`, `a² = 2(2n² + 2n) + 1`, `a² = 4n²`, `a = 2n`, `because 3² = 9 is odd`] });

  S({ id: '2B-40', t: '2B', sec: '2.10', kind: 'proof', title: `Contrapositive proof: if n³ + 5 is odd, then n is even`,
    note: `Direct start stalls (n = ∛(2k − 4) tells us nothing). So prove: <b>if n is odd, then n³ + 5 is even.</b>` + tbl(['Step', 'Reason'], [['n = 2k + 1', 'Assume n odd (¬q)'], ['n³ + 5 = (2k+1)³ + 5 = 8k³ + 12k² + 6k + 6', 'Expand'], ['= 2(4k³ + 6k² + 3k + 3)', 'Even (¬p) ∎']]) + `Same idea: if n² + 3 is odd then n is even. Assume n = 2k+1: n² + 3 = 4k² + 4k + 4 = 2(2k² + 2k + 2), which is even.`,
    q: `To prove "if n³ + 5 is odd, then n is even" by contrapositive, which statement do you actually prove?`, type: 'choice', opts: [`If n is odd, then n³ + 5 is even`, `If n is even, then n³ + 5 is odd`, `If n³ + 5 is even, then n is odd`, `n³ + 5 is odd and n is odd`], ans: `If n is odd, then n³ + 5 is even`, hint: `¬q → ¬p.`,
    fu: [{ note: `8k³ + 12k² + 6k + 6 = 2( ? ).`, q: `Factor: 8k³ + 12k² + 6k + 6 = 2( ? ). Type the bracket.`, type: 'exact', ans: ['4k³ + 6k² + 3k + 3', '4k^3+6k^2+3k+3'], hint: `Halve every term.` },
      { note: `Same idea for n² + 3 with n = 2k + 1: n² + 3 = 4k² + 4k + 4.`, q: `4k² + 4k + 4 = 2( ? ). Type the bracket.`, type: 'exact', ans: ['2k² + 2k + 2', '2k^2+2k+2'], hint: `Halve every term.` }],
    mcq: [`For "n³ + 5 odd → n even", the contrapositive assumes…`, `n is odd`, `n is even`, `n³ + 5 is odd`, `n³ + 5 is even`] });

  S({ id: '2B-41', t: '2B', sec: '2.10', kind: 'proof', title: `Contradiction: if a² is even, then a is even`,
    note: `<b>If a² is even, then a is even.</b> Assume a² even <b>and</b> a odd: a = 2c+1 → a² = 2(2c²+2c)+1 is odd. Contradiction ✔`,
    q: `To prove "if a² is even, then a is even" by contradiction, what do you assume?`, type: 'choice', opts: [`a² is even and a is odd`, `a is odd`, `a² is odd and a is even`, `a is even`], ans: `a² is even and a is odd`, hint: `p and ¬q.`,
    fu: [{ note: `a = 2c + 1 → a² = 4c² + 4c + 1 = 2( ? ) + 1.`, q: `a = 2c + 1. Then a² = 2( ? ) + 1. Type the bracket.`, type: 'exact', ans: ['2c² + 2c', '2c^2+2c'], hint: `Expand, then factor 2.` }],
    mcq: [`In the proof "a² even → a even" by contradiction, the clash is…`, `a² is both even and odd`, `a is both even and odd`, `a = 0`, `a² < 0`] });

  S({ id: '2B-42', t: '2B', sec: '2.10', kind: 'proof', title: `Contradiction: if x + y ≥ 2, then x ≥ 1 or y ≥ 1`,
    note: `<b>If x + y ≥ 2, then x ≥ 1 or y ≥ 1.</b> Assume x &lt; 1 and y &lt; 1 → x + y &lt; 2. Contradicts x + y ≥ 2 ✔`,
    q: `What do you assume (the negation of the conclusion)?`, type: 'choice', opts: [`x &lt; 1 and y &lt; 1`, `x &lt; 1 or y &lt; 1`, `x ≥ 1 and y ≥ 1`, `x + y &lt; 2`], ans: `x &lt; 1 and y &lt; 1`, hint: `¬(A ∨ B) = ¬A ∧ ¬B.`,
    fu: [{ note: `x &lt; 1 and y &lt; 1 → x + y &lt; ?`, q: `If x &lt; 1 and y &lt; 1, then x + y &lt; ?`, type: 'exact', ans: ['2'], hint: `Add the inequalities.` }],
    mcq: [`Negation of "x ≥ 1 or y ≥ 1":`, `x < 1 and y < 1`, `x < 1 or y < 1`, `x ≤ 1 and y ≤ 1`, `x + y < 2`] });

  S({ id: '2B-43', t: '2B', sec: '2.10', kind: 'proof', title: `Contradiction: there is no greatest integer`,
    note: `<b>No greatest integer.</b> Suppose N is the greatest. M = N + 1 is an integer and M &gt; N. Contradiction ✔`,
    q: `Suppose N is the greatest integer. Which integer gives the contradiction?`, type: 'exact', ans: ['N + 1', 'N+1', 'M = N + 1'], hint: `Something bigger than N.`,
    fu: [{ note: `M = N + 1 &gt; N contradicts "N is the greatest".`, q: `What is contradicted?`, type: 'choice', opts: [`That N is the greatest integer`, `That N + 1 is an integer`, `That integers exist`, `That N &gt; 0`], ans: `That N is the greatest integer`, hint: `What did we suppose?` }],
    mcq: [`The proof "no greatest integer" uses…`, `contradiction with M = N + 1`, `a direct proof`, `a counterexample N = 0`, `contrapositive`] });

  S({ id: '2B-44', t: '2B', sec: '2.10', kind: 'proof', title: `Contradiction: there are infinitely many primes`,
    note: `<b>Infinitely many primes.</b> Suppose the only primes are p₁,…,pₙ. Let q = p₁p₂…pₙ + 1. Each pᵢ leaves remainder 1, so none divides q. But q &gt; 1 has some prime divisor r, which is not on the list. Contradiction ✔ (q itself need not be prime.)`,
    q: `Suppose the only primes are p₁, …, pₙ. Which number q do you build?`, type: 'exact', ans: ['p₁p₂…pₙ + 1', 'p1p2…pn+1', 'p1*p2*…*pn+1', 'p₁·p₂·…·pₙ + 1', 'p1p2pn+1'], hint: `Multiply all of them, then add something small.`,
    fu: [{ note: `q = p₁p₂…pₙ + 1, so dividing q by any pᵢ leaves a remainder.`, q: `What remainder does q leave when divided by any pᵢ?`, type: 'exact', ans: ['1'], hint: `The "+ something".` },
      { note: `With the first six primes: q = 2·3·5·7·11·13 + 1 = 30031 = 59 × 509.`, q: `Is q = 30031 prime?`, type: 'choice', opts: [`No: 30031 = 59 × 509, so q need not be prime`, `Yes: the proof shows q is always prime`, `Yes: no small prime divides it`, `It can't be decided`], ans: `No: 30031 = 59 × 509, so q need not be prime`, hint: `Read the last sentence of the note.` }],
    mcq: [`TRAP: In the "infinitely many primes" proof, q = p₁…pₙ + 1 is…`, `not necessarily prime, but has a prime divisor not on the list`, `always prime`, `always even`, `equal to pₙ + 1`] });

  S({ id: '2B-45', t: '2B', sec: '2.10', kind: 'watch', title: `Watch out: examples are not a proof`,
    note: `Checking examples (x = 3 gives 9, odd) is <b>not</b> a proof of a ∀ statement. You need a general argument that works for an <b>arbitrary</b> x. If one method stalls, switch to another.`,
    q: `Does checking x = 1, 3, 5 prove "for all odd x, x² is odd"?`, type: 'choice', opts: [`No: you need a general argument for an arbitrary x`, `Yes: three examples are enough`, `Yes, if the examples are odd`, `Only for small x`], ans: `No: you need a general argument for an arbitrary x`, hint: `What does ∀ demand?`,
    fu: [{ note: `If one method stalls, switch to another.`, q: `Your direct proof gets stuck. What should you do?`, type: 'choice', opts: [`Switch to another method (contrapositive or contradiction)`, `Check more examples`, `Give up: it's false`, `Assume the conclusion`], ans: `Switch to another method (contrapositive or contradiction)`, hint: `Read the last sentence of the note.` }],
    mcq: [`TRAP: To prove a ∀ statement you need…`, `a general argument for an arbitrary element`, `many examples`, `one example`, `one counterexample`] });

  /* =====================================================================
     CHAPTER 3A — RELATIONS
     ===================================================================== */
  var ABCD = ['a', 'b', 'c', 'd'], N123 = ['1', '2', '3'];
  var M4 = [[1, 0, 0, 0], [0, 1, 1, 0], [0, 1, 1, 0], [0, 0, 0, 1]];
  var R4 = `R on A = {a, b, c, d}: R = {(a,a), (b,b), (c,c), (d,d), (b,c), (c,b)}`;
  // ---- 3.1 What is a relation? ----
  S({ id: '3A-01', t: '3A', sec: '3.1', kind: 'def', title: `What is a relation?`,
    note: `A (binary) <b>relation</b> R from A to B is any <b>subset of A × B</b>. If (a, b) ∈ R we write a R b ("a is related to b"). A relation <b>on A</b> is a subset of A × A.`,
    q: `What is a relation from A to B?`, type: 'explain', kw: [['subset', 'part of', 'some of'], ['a × b', 'a x b', 'cartesian product', 'product', 'ordered pairs', 'pairs']],
    ans: `Any subset of A × B (a set of ordered pairs (a, b)).`, hint: `Which set from Chapter 1 does it live inside?`,
    fu: [{ note: `A relation on A is a subset of A × A.`, q: `A relation ON A is a subset of…`, type: 'exact', ans: ['A × A', 'A²'], hint: `Both positions come from A.` },
      { note: `(a, b) ∈ R is written a R b.`, q: `A = {1, 2}. Is {(1,1), (2,1)} a relation on A?`, type: 'choice', opts: YN, ans: 'Yes', hint: `Is it a subset of A × A?` }],
    mcq: [`A relation from A to B is…`, `any subset of A × B`, `a function from A to B`, `A ∪ B`, `exactly A × B`] });

  S({ id: '3A-02', t: '3A', sec: '3.1', kind: 'example', title: `Example: x R y if x divides y`,
    note: `X = {2, 3, 4}, Y = {3, 4, 5, 6, 7}, x R y if <b>x divides y</b>:<br>R = {(2,4), (2,6), (3,3), (3,6), (4,4)} &nbsp; Domain = {2,3,4}, Range = {3,4,6}`,
    q: `X = {2, 3, 4}, Y = {3, 4, 5, 6, 7}, x R y if x divides y. List R.`, type: 'set', ans: '{(2,4),(2,6),(3,3),(3,6),(4,4)}', hint: `For each x, which y in Y are multiples of x?`,
    fu: [{ note: `Domain = all first elements used.`, q: `What is the domain of this R?`, type: 'set', ans: '{2,3,4}', hint: `First elements of the pairs.` },
      { note: `Range = all second elements used.`, q: `What is the range of this R?`, type: 'set', ans: '{3,4,6}', hint: `Second elements of the pairs.` }],
    mcq: [`X = {2,3,4}, Y = {3,4,5,6,7}, x | y. Which pair is in R?`, `(3, 6)`, `(2, 5)`, `(4, 6)`, `(6, 3)`] });

  S({ id: '3A-03', t: '3A', sec: '3.1', kind: 'def', title: `Domain and range of a relation`,
    note: `<b>Domain</b> = all first elements used; <b>Range</b> = all second elements used.`,
    q: `R = {(1,a), (1,b), (3,a)}. What is the domain?`, type: 'set', ans: '{1,3}', hint: `First positions.`,
    fu: [{ note: `Range = all second elements used.`, q: `R = {(1,a), (1,b), (3,a)}. What is the range?`, type: 'set', ans: '{a,b}', hint: `Second positions.` }],
    mcq: [`The range of a relation is…`, `all second elements used`, `all first elements used`, `the whole set B`, `A × B`] });

  // ---- 3.2 Four ways to show a relation ----
  S({ id: '3A-04', t: '3A', sec: '3.2', kind: 'def', title: `Representation 1: set of pairs`,
    note: `Example: ` + R4 + `<br><b>1. Set of pairs:</b> list the ordered pairs, as above.`,
    q: `This is the matrix of a relation R on {a, b, c, d}. List R as a set of pairs.` + mx(ABCD, ABCD, M4, true), type: 'set', ans: '{(a,a),(b,b),(c,c),(d,d),(b,c),(c,b)}', hint: `Each 1 in row x, column y gives the pair (x, y).`,
    fu: [{ note: `Every 1 in the matrix is one pair.`, q: `How many ordered pairs does R have?`, type: 'exact', ans: ['6'], hint: `Count the 1s.` }],
    mcq: [`In the set-of-pairs method you…`, `list the ordered pairs`, `draw two ovals`, `write a 0/1 grid`, `draw loops`] });

  S({ id: '3A-05', t: '3A', sec: '3.2', kind: 'def', title: `Representation 2: arrow diagram`,
    note: `<b>2. Arrow diagram:</b> two ovals (A and B), arrow from a to b for each pair. Best for relations <b>from</b> A <b>to</b> B.`,
    q: `An arrow diagram is best for…`, type: 'choice', opts: [`relations from A to B`, `relations on one set`, `testing transitivity`, `computing M ⊙ M`], ans: `relations from A to B`, hint: `Two ovals = two sets.`,
    fu: [{ note: `Digraph: best for relations on one set.`, q: `Which picture is best for a relation ON one set?`, type: 'choice', opts: ['Digraph', 'Arrow diagram', 'Venn diagram', 'Truth table'], ans: 'Digraph', hint: `One dot per element, with loops.` }],
    mcq: [`An arrow diagram uses…`, `two ovals with arrows from A to B`, `one dot per element with loops`, `a 0/1 grid`, `a truth table`] });

  S({ id: '3A-06', t: '3A', sec: '3.2', kind: 'def', title: `Representation 3: digraph`,
    note: `<b>3. Digraph:</b> one dot per element; arrow a → b for each pair; a <b>loop</b> for (a, a). Best for relations <b>on</b> one set.<br>Example: ` + R4,
    q: R4 + `. How many loops does its digraph have?`, type: 'exact', ans: ['4'], hint: `One loop per pair of the form (x, x).`,
    fu: [{ note: `Non-loop arrows come from pairs (x, y) with x ≠ y.`, q: `How many non-loop arrows does the digraph have?`, type: 'exact', ans: ['2'], hint: `(b,c) and …` }],
    mcq: [`In a digraph, the pair (a, a) is drawn as…`, `a loop at a`, `an arrow from a to b`, `nothing`, `two arrows`] });

  S({ id: '3A-07', t: '3A', sec: '3.2', kind: 'def', title: `Representation 4: matrix M_R`,
    note: `<b>4. Matrix M<sub>R</sub>:</b> rows = elements of A, columns = elements of B. mᵢⱼ = 1 if (aᵢ, bⱼ) ∈ R, else 0. (Outlined cells = main diagonal.)` + mx(ABCD, ABCD, M4, true),
    q: `Fill in the matrix of ` + R4 + `.`, type: 'matrix', grid: { rows: ABCD, cols: ABCD }, ans: M4, hint: `Put a 1 in row x, column y for each pair (x, y).`,
    fu: [{ note: `mᵢⱼ = 1 if (aᵢ, bⱼ) ∈ R, else 0.`, q: `In this matrix, what is the entry in row b, column c?`, type: 'exact', ans: ['1'], hint: `Is (b, c) ∈ R?` }],
    mcq: [`In M_R, mᵢⱼ = 1 means…`, `(aᵢ, bⱼ) ∈ R`, `(bⱼ, aᵢ) ∈ R`, `i = j`, `aᵢ = bⱼ`] });

  S({ id: '3A-08', t: '3A', sec: '3.2', kind: 'example', title: `Example: "divides" relation as a matrix`,
    note: `From {2,3,4} to {5,6,7,8}, x R y if x | y:` + mx(['2', '3', '4'], ['5', '6', '7', '8'], [[0, 1, 0, 1], [0, 1, 0, 0], [0, 0, 0, 1]]),
    q: `Fill in the matrix: from {2,3,4} to {5,6,7,8}, x R y if x divides y.`, type: 'matrix', grid: { rows: ['2', '3', '4'], cols: ['5', '6', '7', '8'] }, ans: [[0, 1, 0, 1], [0, 1, 0, 0], [0, 0, 0, 1]], hint: `2 divides the even numbers; 3 divides 6; 4 divides 8.`,
    fu: [{ note: `Same rule, new sets: from {1, 2} to {2, 3, 4}, x R y if x | y.`, q: `Fill in the matrix from {1,2} to {2,3,4}, x R y if x divides y.`, type: 'matrix', grid: { rows: ['1', '2'], cols: ['2', '3', '4'] }, ans: [[1, 1, 1], [1, 0, 1]], hint: `1 divides everything.` }],
    mcq: [`From {2,3,4} to {5,6,7,8}, x | y. Which row has two 1s?`, `row 2 (6 and 8)`, `row 3`, `row 4`, `none`] });

  var DEG = [[1, 0, 0, 0], [0, 1, 0, 0], [1, 1, 1, 0], [0, 1, 0, 1]];
  S({ id: '3A-09', t: '3A', sec: '3.2', kind: 'def', title: `In-degree and out-degree`,
    note: `<b>Out-degree</b> of a = number of arrows <b>leaving</b> a = <b>row sum</b>.<br><b>In-degree</b> of a = number of arrows <b>arriving</b> at a = <b>column sum</b>. A loop counts once for each.` + mx(ABCD, ABCD, DEG, true) + tbl(['', 'a', 'b', 'c', 'd'], [['In', '2', '3', '1', '1'], ['Out', '1', '1', '3', '2']]),
    q: mx(ABCD, ABCD, DEG, true) + `What is the out-degree of c?`, type: 'exact', ans: ['3'], hint: `Row sum of row c.`,
    fu: [{ note: `In-degree = column sum.`, q: mx(ABCD, ABCD, DEG, true) + `What is the in-degree of b?`, type: 'exact', ans: ['3'], hint: `Add column b.` },
      { note: `A loop counts once for in and once for out.`, q: mx(ABCD, ABCD, DEG, true) + `What is the in-degree of a?`, type: 'exact', ans: ['2'], hint: `Column a: the loop counts.` }],
    mcq: [`The out-degree of a vertex is…`, `its row sum`, `its column sum`, `the diagonal entry`, `the number of loops`] });

  var DEG2 = [[1, 1, 0], [0, 0, 1], [1, 1, 1]];
  S({ id: '3A-10', t: '3A', sec: '3.2', kind: 'tip', title: `Memory tip: Out = Row, In = column`,
    note: `<b>Out = Row</b> (read across) · <b>In = column</b> (read down)`,
    q: mx(N123, N123, DEG2, true) + `Relation on {1,2,3}. What is the out-degree of 3?`, type: 'exact', ans: ['3'], hint: `Out = Row.`,
    fu: [{ note: `In = column (read down).`, q: mx(N123, N123, DEG2, true) + `What is the in-degree of 2?`, type: 'exact', ans: ['2'], hint: `Read down column 2.` }],
    mcq: [`In-degree is read…`, `down a column`, `across a row`, `along the diagonal`, `from the loops only`] });

  // ---- 3.3 Properties of relations (one statement per row) ----
  var PROWS = {
    refl: ['Reflexive', '(x,x) ∈ R for every x', 'diagonal all 1', 'loop at every vertex'],
    irr: ['Irreflexive', '(x,x) ∉ R for every x', 'diagonal all 0', 'no loops at all'],
    nrefl: ['Not reflexive', 'at least one (x,x) ∉ R', 'at least one 0 on diagonal', 'some vertex has no loop'],
    sym: ['Symmetric', '(x,y) ∈ R → (y,x) ∈ R', 'M = Mᵀ (mirror image across diagonal)', 'every arrow has a return arrow'],
    anti: ['Antisymmetric', '(x,y) ∈ R ∧ (y,x) ∈ R → x = y', 'for i ≠ j: never both mᵢⱼ = 1 and mⱼᵢ = 1', 'at most one arrow between two different vertices'],
    asym: ['Asymmetric', 'antisymmetric + irreflexive', 'above + diagonal all 0', 'all one-way streets, no loops'],
    trans: ['Transitive', '(x,y), (y,z) ∈ R → (x,z) ∈ R', 'wherever M ⊙ M has 1, M has 1', 'every 2-step path a→b→c has a shortcut a→c']
  };
  function prow(k) { return tbl(['Property', 'Rule', 'Matrix test', 'Digraph test'], [PROWS[k]]); }
  S({ id: '3A-11', t: '3A', sec: '3.3', kind: 'table', title: `Property: reflexive`,
    note: prow('refl') + `<b>Picture:</b> everyone looks in the mirror (loops).`,
    q: `What is the matrix test for reflexive?`, type: 'choice', opts: [`diagonal all 1`, `diagonal all 0`, `M = Mᵀ`, `M ⊙ M = 0`], ans: `diagonal all 1`, hint: `Every (x, x) must be in R.`,
    fu: [{ note: `Reflexive needs (x,x) for EVERY x in the set.`, q: `On {1,2,3}: is R = {(1,1), (2,2), (1,3)} reflexive?`, type: 'choice', opts: YN, ans: 'No', hint: `Is (3,3) there?` }],
    mcq: [`Reflexive in a digraph means…`, `a loop at every vertex`, `no loops at all`, `every arrow has a return arrow`, `no arrows`] });

  S({ id: '3A-12', t: '3A', sec: '3.3', kind: 'table', title: `Property: irreflexive`,
    note: prow('irr'),
    q: `What is the digraph test for irreflexive?`, type: 'choice', opts: [`no loops at all`, `a loop at every vertex`, `some vertex has no loop`, `every arrow has a return arrow`], ans: `no loops at all`, hint: `(x, x) ∉ R for every x.`,
    fu: [{ note: `Irreflexive: no (x, x) pairs at all.`, q: `On {1,2,3}: is R = {(1,2), (2,3)} irreflexive?`, type: 'choice', opts: YN, ans: 'Yes', hint: `Any loops?` }],
    mcq: [`Irreflexive matrix test:`, `diagonal all 0`, `diagonal all 1`, `M = Mᵀ`, `at least one 0 on diagonal`] });

  S({ id: '3A-13', t: '3A', sec: '3.3', kind: 'table', title: `Property: not reflexive`,
    note: prow('nrefl'),
    q: `"Not reflexive" means…`, type: 'choice', opts: [`at least one (x,x) ∉ R`, `no (x,x) ∈ R at all`, `R is irreflexive`, `R is symmetric`], ans: `at least one (x,x) ∉ R`, hint: `Just one missing loop is enough.`,
    fu: [{ note: `R₄ = {(1,1)} on {1,2}: (2,2) missing, but (1,1) present.`, q: `On {1, 2}: R = {(1,1)} is…`, type: 'choice', opts: [`Not reflexive and not irreflexive`, `Reflexive`, `Irreflexive`, `Both reflexive and irreflexive`], ans: `Not reflexive and not irreflexive`, hint: `Some loops, but not all.` }],
    mcq: [`"Not reflexive" matrix test:`, `at least one 0 on the diagonal`, `diagonal all 0`, `diagonal all 1`, `M ≠ Mᵀ`] });

  S({ id: '3A-14', t: '3A', sec: '3.3', kind: 'table', title: `Property: symmetric`,
    note: prow('sym') + `<b>Picture:</b> two-way friendship: if I follow you, you follow me.`,
    q: `R = {(1,2), (2,3), (3,3)} on {1,2,3}. Fill in the matrix of the SMALLEST symmetric relation containing R (add the missing mirror pairs).`, type: 'matrix', grid: { rows: N123, cols: N123 }, ans: [[0, 1, 0], [1, 0, 1], [0, 1, 1]], hint: `Every 1 at (i, j) needs a 1 at (j, i).`,
    fu: [{ note: `Symmetric: every arrow has a return arrow.`, q: `Is {(a,b), (b,a), (a,a)} symmetric?`, type: 'choice', opts: YN, ans: 'Yes', hint: `(a,b) has (b,a); (a,a) mirrors itself.` }],
    mcq: [`Symmetric matrix test:`, `M = Mᵀ`, `diagonal all 1`, `M ⊙ M = M`, `no mirror 1s`] });

  S({ id: '3A-15', t: '3A', sec: '3.3', kind: 'table', title: `Property: antisymmetric`,
    note: prow('anti') + `<b>Picture:</b> no mutual pairs (except with yourself), like ≤.`,
    q: `Antisymmetric in a digraph means…`, type: 'choice', opts: [`at most one arrow between two different vertices`, `every arrow has a return arrow`, `no loops`, `a loop at every vertex`], ans: `at most one arrow between two different vertices`, hint: `No mutual pairs.`,
    fu: [{ note: `Antisymmetric fails if (x,y) and (y,x) are both in R with x ≠ y.`, q: `Is R = {(1,2), (2,1), (3,3)} antisymmetric?`, type: 'choice', opts: YN, ans: 'No', hint: `Look at 1 and 2.` }],
    mcq: [`≤ on ℤ is…`, `antisymmetric`, `symmetric`, `irreflexive`, `asymmetric`] });

  S({ id: '3A-16', t: '3A', sec: '3.3', kind: 'table', title: `Property: asymmetric`,
    note: prow('asym'),
    q: `Asymmetric = ?`, type: 'choice', opts: [`antisymmetric + irreflexive`, `symmetric + irreflexive`, `not symmetric`, `antisymmetric + reflexive`], ans: `antisymmetric + irreflexive`, hint: `One-way streets, no loops.`,
    fu: [{ note: `Asymmetric: all one-way streets and no loops.`, q: `On {1,2,3}: is R = {(1,2), (2,3)} asymmetric?`, type: 'choice', opts: YN, ans: 'Yes', hint: `Any loops? Any two-way pairs?` },
      { note: `≤ contains (1,1), a loop.`, q: `Is ≤ on ℤ asymmetric?`, type: 'choice', opts: YN, ans: 'No', hint: `Is (1,1) in ≤?` }],
    mcq: [`Which is asymmetric?`, `< on ℤ`, `≤ on ℤ`, `= on ℤ`, `"same parity" on ℤ`] });

  S({ id: '3A-17', t: '3A', sec: '3.3', kind: 'table', title: `Property: transitive`,
    note: prow('trans') + `<b>Picture:</b> "friend of a friend is a friend" / shortcut rule.`,
    q: `Transitive in a digraph means…`, type: 'choice', opts: [`every 2-step path a→b→c has a shortcut a→c`, `every arrow has a return arrow`, `a loop at every vertex`, `no arrows between different vertices`], ans: `every 2-step path a→b→c has a shortcut a→c`, hint: `Shortcut rule.`,
    fu: [{ note: `(x,y), (y,z) ∈ R → (x,z) ∈ R.`, q: `On {1,2,3}: is R = {(1,2), (2,3)} transitive?`, type: 'choice', opts: YN, ans: 'No', hint: `(1,2), (2,3): is (1,3) there?` }],
    mcq: [`Transitive rule:`, `(x,y), (y,z) ∈ R → (x,z) ∈ R`, `(x,y) ∈ R → (y,x) ∈ R`, `(x,x) ∈ R for all x`, `(x,y) ∈ R → x = y`] });

  S({ id: '3A-18', t: '3A', sec: '3.3', kind: 'tip', title: `Memory tip: pictures for the properties`,
    note: `<b>Reflexive</b> = everyone looks in the mirror (loops).<br><b>Symmetric</b> = two-way friendship: if I follow you, you follow me.<br><b>Antisymmetric</b> = no mutual pairs (except with yourself), like ≤.<br><b>Transitive</b> = "friend of a friend is a friend" / shortcut rule.`,
    q: `"Friend of a friend is a friend" describes which property?`, type: 'choice', opts: ['Transitive', 'Symmetric', 'Reflexive', 'Antisymmetric'], ans: 'Transitive', hint: `Shortcut rule.`,
    fu: [{ note: `Mirror = loops.`, q: `"Everyone looks in the mirror" describes…`, type: 'choice', opts: ['Reflexive', 'Symmetric', 'Transitive', 'Irreflexive'], ans: 'Reflexive', hint: `Loops.` },
      { note: `Two-way friendship.`, q: `"If I follow you, you follow me" describes…`, type: 'choice', opts: ['Symmetric', 'Antisymmetric', 'Transitive', 'Reflexive'], ans: 'Symmetric', hint: `Return arrows.` }],
    mcq: [`"No mutual pairs (except with yourself), like ≤" is…`, `antisymmetric`, `symmetric`, `asymmetric`, `irreflexive`] });

  S({ id: '3A-19', t: '3A', sec: '3.3', kind: 'watch', title: `Watch out: antisymmetric ≠ "not symmetric"`,
    note: `<b>Antisymmetric ≠ "not symmetric".</b> A relation can be <b>both</b> symmetric and antisymmetric, e.g. {(a,a),(b,b),(c,c)}, and it can be <b>neither</b>, e.g. {(a,c),(c,a),(b,a),(a,a),(b,b)} on {a,b,c}: (a,c),(c,a) breaks antisymmetry; (b,a) without (a,b) breaks symmetry.<br>Likewise "not reflexive" ≠ "irreflexive".`,
    q: `On {a,b,c}: R = {(a,a), (b,b), (c,c)}. Which properties hold? (select all)`, type: 'choice', opts: ['Symmetric', 'Antisymmetric', 'Irreflexive', 'Asymmetric'], ans: ['Symmetric', 'Antisymmetric'], hint: `Only loops: any non-mirrored arrow? any mutual pair between different elements?`,
    fu: [{ note: `{(a,c),(c,a),(b,a),(a,a),(b,b)}: (a,c),(c,a) breaks antisymmetry; (b,a) without (a,b) breaks symmetry.`, q: `R = {(a,c), (c,a), (b,a), (a,a), (b,b)} on {a,b,c} is…`, type: 'choice', opts: [`Neither symmetric nor antisymmetric`, `Symmetric only`, `Antisymmetric only`, `Both`], ans: `Neither symmetric nor antisymmetric`, hint: `Test each property separately.` },
      { note: `"Not reflexive" = at least one loop missing; "irreflexive" = no loops at all.`, q: `Are "not reflexive" and "irreflexive" the same?`, type: 'choice', opts: YN, ans: 'No', hint: `Think of R = {(1,1)} on {1,2}.` }],
    mcq: [`TRAP: {(a,a),(b,b),(c,c)} on {a,b,c} is…`, `both symmetric and antisymmetric`, `symmetric but not antisymmetric`, `antisymmetric but not symmetric`, `neither`] });

  var RFX = [`Reflexive`, `Irreflexive`, `Neither (not reflexive, not irreflexive)`];
  S({ id: '3A-20', t: '3A', sec: '3.3', kind: 'example', title: `Example: which are reflexive? (on {1, 2, 3})`,
    note: `R₁ = {(1,1),(1,2),(2,1),(2,2),(3,1),(3,3)} → <b>Reflexive</b> (has all of (1,1),(2,2),(3,3))<br>R₂ = {(1,1),(1,3),(2,2),(3,1)} → <b>Not reflexive</b> (missing (3,3))<br>R₃ = {(2,3)} → <b>Irreflexive</b> (no (x,x) at all)<br>R₄ = {(1,1)} → <b>Not reflexive and not irreflexive</b>`,
    q: `On {1,2,3}: R₁ = {(1,1),(1,2),(2,1),(2,2),(3,1),(3,3)} is…`, type: 'choice', opts: RFX, ans: RFX[0], hint: `Check (1,1), (2,2), (3,3).`,
    fu: [{ note: `R₂ is missing (3,3), but has (1,1) and (2,2).`, q: `On {1,2,3}: R₂ = {(1,1),(1,3),(2,2),(3,1)} is…`, type: 'choice', opts: RFX, ans: RFX[2], hint: `Some loops present, one missing.` },
      { note: `R₃ has no (x,x) at all.`, q: `On {1,2,3}: R₃ = {(2,3)} is…`, type: 'choice', opts: RFX, ans: RFX[1], hint: `Any loops?` },
      { note: `R₄ has one loop only.`, q: `On {1,2,3}: R₄ = {(1,1)} is…`, type: 'choice', opts: RFX, ans: RFX[2], hint: `Not all loops, not zero loops.` }],
    mcq: [`On {1,2,3}, R = {(2,3)} is…`, `irreflexive`, `reflexive`, `neither`, `symmetric`] });

  S({ id: '3A-21', t: '3A', sec: '3.3', kind: 'example', title: `Example: R = {(1,2), (2,2), (3,4), (4,1)}`,
    note: `R = {(1,2), (2,2), (3,4), (4,1)} on {1,2,3,4}:<br>Not symmetric ((1,2) but no (2,1)) · Antisymmetric (no mutual pair) · Not asymmetric (because (2,2) ∈ R).<br>And "&lt;" on ℤ is asymmetric.`,
    q: `R = {(1,2), (2,2), (3,4), (4,1)} on {1,2,3,4}. Which properties hold? (select all)`, type: 'choice', opts: ['Symmetric', 'Antisymmetric', 'Asymmetric', 'Reflexive'], ans: ['Antisymmetric'], hint: `Only one holds. (2,2) is a loop.`,
    fu: [{ note: `Matrix of R = {(1,2), (2,2), (3,4), (4,1)}.`, q: `Fill in the matrix of R.`, type: 'matrix', grid: { rows: ['1', '2', '3', '4'], cols: ['1', '2', '3', '4'] }, ans: [[0, 1, 0, 0], [0, 1, 0, 0], [0, 0, 0, 1], [1, 0, 0, 0]], hint: `Four 1s.` },
      { note: `&lt; on ℤ: never x &lt; x, and never both x &lt; y and y &lt; x.`, q: `"&lt;" on ℤ is…`, type: 'choice', opts: ['Asymmetric', 'Symmetric', 'Reflexive', 'An equivalence relation'], ans: 'Asymmetric', hint: `One-way, no loops.` }],
    mcq: [`R = {(1,2),(2,2),(3,4),(4,1)} is not asymmetric because…`, `(2,2) ∈ R`, `(1,2) ∈ R`, `it is symmetric`, `(4,1) ∈ R`] });

  S({ id: '3A-22', t: '3A', sec: '3.3', kind: 'def', title: `Testing transitivity with the Boolean product`,
    note: `<b>Method</b><br>1. Compute N = M ⊙ M using Boolean arithmetic: multiply = AND, add = OR (so 1 + 1 = 1).<br>2. R is transitive iff every 1 in N is also a 1 in M (N "fits inside" M).<br>3. If some nᵢⱼ = 1 but mᵢⱼ = 0 → not transitive.`,
    q: `How do you test transitivity with M ⊙ M?`, type: 'explain', kw: [['m ⊙ m', 'm⊙m', 'boolean product', 'product', 'square', 'multiply'], ['every 1', 'each 1', '1s', 'ones', 'all 1'], ['also', 'inside', 'fits', 'in m', 'appear in m']],
    ans: `Compute N = M ⊙ M (AND/OR arithmetic); R is transitive iff every 1 in N is also a 1 in M.`, hint: `Compute something, then compare its 1s with M.`,
    fu: [{ note: `Boolean arithmetic: add = OR.`, q: `In Boolean arithmetic, 1 + 1 = ?`, type: 'exact', ans: ['1'], hint: `OR.` },
      { note: `If some nᵢⱼ = 1 but mᵢⱼ = 0 → not transitive.`, q: `n₁₃ = 1 but m₁₃ = 0. Is R transitive?`, type: 'choice', opts: YN, ans: 'No', hint: `N must fit inside M.` }],
    mcq: [`R is transitive iff…`, `every 1 in M ⊙ M is also a 1 in M`, `M ⊙ M = 0`, `M = Mᵀ`, `the diagonal of M ⊙ M is all 1`] });

  var MT = [[0, 1, 1], [0, 0, 1], [0, 0, 0]], MNT = [[1, 1, 0], [0, 0, 1], [0, 0, 0]];
  S({ id: '3A-23', t: '3A', sec: '3.3', kind: 'example', title: `Transitive ✔: R = {(1,2), (2,3), (1,3)}`,
    note: `R = {(1,2),(2,3),(1,3)}:` + mx(N123, N123, MT, true) + `⊙ itself =` + mx(N123, N123, [[0, 0, 1], [0, 0, 0], [0, 0, 0]], true) + `N has a 1 only at (1,3), and M has it too ✔`,
    q: `M is the matrix of R = {(1,2),(2,3),(1,3)}:` + mx(N123, N123, MT, true) + `Compute N = M ⊙ M.`, type: 'matrix', grid: { rows: N123, cols: N123 }, ans: [[0, 0, 1], [0, 0, 0], [0, 0, 0]], hint: `nᵢⱼ = 1 if there's a k with mᵢₖ = 1 AND mₖⱼ = 1.`,
    fu: [{ note: `N has a 1 only at (1,3), and M has it too.`, q: `So is R = {(1,2),(2,3),(1,3)} transitive?`, type: 'choice', opts: YN, ans: 'Yes', hint: `Does N fit inside M?` }],
    mcq: [`For R = {(1,2),(2,3),(1,3)}, M ⊙ M has a 1 only at…`, `(1,3)`, `(1,2)`, `(2,3)`, `(3,1)`] });

  S({ id: '3A-24', t: '3A', sec: '3.3', kind: 'example', title: `Not transitive ✘: R = {(1,1), (1,2), (2,3)}`,
    note: `R = {(1,1),(1,2),(2,3)}:` + mx(N123, N123, MNT, true) + `⊙ itself =` + mx(N123, N123, [[1, 1, 1], [0, 0, 0], [0, 0, 0]], true) + `n₁₃ = 1 but m₁₃ = 0: (1,2),(2,3) ∈ R but (1,3) ∉ R ✘`,
    q: `M is the matrix of R = {(1,1),(1,2),(2,3)}:` + mx(N123, N123, MNT, true) + `Compute N = M ⊙ M.`, type: 'matrix', grid: { rows: N123, cols: N123 }, ans: [[1, 1, 1], [0, 0, 0], [0, 0, 0]], hint: `Row 1 of M times each column of M (AND, then OR).`,
    fu: [{ note: `n₁₃ = 1 but m₁₃ = 0.`, q: `Which pair is missing from R for transitivity?`, type: 'set', ans: '{(1,3)}', hint: `(1,2), (2,3) → ?` },
      { note: `One missing shortcut is enough.`, q: `Is R = {(1,1),(1,2),(2,3)} transitive?`, type: 'choice', opts: YN, ans: 'No', hint: `N doesn't fit inside M.` }],
    mcq: [`R = {(1,1),(1,2),(2,3)} is not transitive because…`, `(1,3) ∉ R`, `(2,2) ∉ R`, `(3,3) ∉ R`, `(2,1) ∉ R`] });

  S({ id: '3A-25', t: '3A', sec: '3.3', kind: 'tip', title: `Shortcut: hunt for chains`,
    note: `For small relations, just hunt for <b>chains</b> (x,y),(y,z) and check that (x,z) is there. E.g. {(a,a),(b,c),(c,b),(d,d)}: (b,c),(c,b) needs (b,b), which is missing → not transitive.`,
    q: `R = {(a,a), (b,c), (c,b), (d,d)}. Which pair does the chain (b,c),(c,b) require?`, type: 'exact', ans: ['(b,b)'], hint: `(x,y),(y,z) needs (x,z). Here x = b, z = b.`,
    fu: [{ note: `The chain (c,b),(b,c) needs (c,c) too.`, q: `Which pair does the chain (c,b),(b,c) require?`, type: 'exact', ans: ['(c,c)'], hint: `x = c, z = c.` },
      { note: `Required pairs are missing.`, q: `Is {(a,a), (b,c), (c,b), (d,d)} transitive?`, type: 'choice', opts: YN, ans: 'No', hint: `Is (b,b) in R?` }],
    mcq: [`To test transitivity by hand, you look for…`, `chains (x,y),(y,z) and check (x,z)`, `mirror pairs (x,y),(y,x)`, `loops (x,x)`, `the transpose`] });

  // ---- 3.4 The two special relations ----
  var EQ = [[1, 0, 1], [0, 1, 0], [1, 0, 1]];
  S({ id: '3A-26', t: '3A', sec: '3.4', kind: 'def', title: `Equivalence relation (R + S + T)`,
    note: `<b>Equivalence relation</b> = <b>R</b>eflexive + <b>S</b>ymmetric + <b>T</b>ransitive.<br>Example: R = {(1,1),(1,3),(2,2),(3,1),(3,3)} on {1,2,3}: diagonal all 1 ✔ · M = Mᵀ ✔ · M ⊙ M = M ✔<br>Also: "same parity" on {1,…,5}: {1,3,5} all related, {2,4} all related.`,
    q: `An equivalence relation is… (select all three properties)`, type: 'choice', opts: ['Reflexive', 'Symmetric', 'Antisymmetric', 'Transitive'], ans: ['Reflexive', 'Symmetric', 'Transitive'], hint: `RST.`,
    fu: [{ note: `R = {(1,1),(1,3),(2,2),(3,1),(3,3)}:` + mx(N123, N123, EQ, true), q: `Compute M ⊙ M for this R.`, type: 'matrix', grid: { rows: N123, cols: N123 }, ans: [[1, 0, 1], [0, 1, 0], [1, 0, 1]], hint: `It should come out equal to M.` },
      { note: `"Same parity" on {1,…,5}: {1,3,5} all related, {2,4} all related.`, q: `"Same parity" on {1,…,5}: list all elements related to 1.`, type: 'set', ans: '{1,3,5}', hint: `Same parity as 1 = odd.` }],
    mcq: [`An equivalence relation is…`, `reflexive, symmetric, transitive`, `reflexive, antisymmetric, transitive`, `symmetric and irreflexive`, `asymmetric and transitive`] });

  S({ id: '3A-27', t: '3A', sec: '3.4', kind: 'def', title: `Partial order (R + A + T)`,
    note: `<b>Partial order</b> = <b>R</b>eflexive + <b>A</b>ntisymmetric + <b>T</b>ransitive.<br>Examples: ≤ on {1,2,3}: {(1,1),(1,2),(1,3),(2,2),(2,3),(3,3)}; "x divides y" on the positive integers.<br>≤ is <b>not</b> an equivalence relation: (2,3) ∈ R but (3,2) ∉ R.`,
    q: `A partial order is… (select all three properties)`, type: 'choice', opts: ['Reflexive', 'Symmetric', 'Antisymmetric', 'Transitive'], ans: ['Reflexive', 'Antisymmetric', 'Transitive'], hint: `RAT.`,
    fu: [{ note: `≤ on {1,2,3}: all pairs (x, y) with x ≤ y.`, q: `List ≤ on {1,2,3} as a set of pairs.`, type: 'set', ans: '{(1,1),(1,2),(1,3),(2,2),(2,3),(3,3)}', hint: `6 pairs.` },
      { note: `≤ is not symmetric: (2,3) ∈ R but (3,2) ∉ R.`, q: `Why is ≤ NOT an equivalence relation?`, type: 'choice', opts: [`(2,3) ∈ R but (3,2) ∉ R, so not symmetric`, `It is not reflexive`, `It is not transitive`, `It has loops`], ans: `(2,3) ∈ R but (3,2) ∉ R, so not symmetric`, hint: `Which of R, S, T fails?` },
      { note: `"x divides y" on the positive integers is a partial order.`, q: `"x divides y" on the positive integers is…`, type: 'choice', opts: [`A partial order`, `An equivalence relation`, `Neither`, `Both`], ans: `A partial order`, hint: `Reflexive, antisymmetric (on positives), transitive.` }],
    mcq: [`A partial order is…`, `reflexive, antisymmetric, transitive`, `reflexive, symmetric, transitive`, `irreflexive and transitive`, `symmetric and antisymmetric`] });

  S({ id: '3A-28', t: '3A', sec: '3.4', kind: 'tip', title: `Memory tip: RST vs RAT`,
    note: `<b>Equivalence = R·S·T</b> (think "ReST": things that are "the same" rest together)<br><b>Partial order = R·A·T</b> (a RAT climbs a ladder: there's an order, ≤)<br>Only the middle letter changes: Symmetric ↔ Antisymmetric.`,
    q: `Which property changes between equivalence (RST) and partial order (RAT)?`, type: 'choice', opts: [`Symmetric ↔ Antisymmetric`, `Reflexive ↔ Irreflexive`, `Transitive ↔ Symmetric`, `Nothing changes`], ans: `Symmetric ↔ Antisymmetric`, hint: `Only the middle letter.`,
    fu: [{ note: `A RAT climbs a ladder: there's an order.`, q: `"A RAT climbs a ladder" reminds you of…`, type: 'choice', opts: ['Partial order', 'Equivalence relation', 'Function', 'Bijection'], ans: 'Partial order', hint: `Ladder = order.` }],
    mcq: [`"ReST" stands for the properties of…`, `an equivalence relation`, `a partial order`, `a function`, `an asymmetric relation`] });

  var QC5 = [[1, 0, 1, 0, 1], [0, 1, 0, 1, 0], [1, 0, 1, 0, 1], [0, 1, 0, 1, 0], [1, 0, 1, 0, 1]], N5 = ['1', '2', '3', '4', '5'];
  S({ id: '3A-29', t: '3A', sec: '3.4', kind: 'quick', title: `Quick check: is this an equivalence relation?`,
    note: `R = {(1,1),(1,3),(1,5),(2,2),(2,4),(3,1),(3,3),(3,5),(4,2),(4,4),(5,1),(5,3),(5,5)} on {1,…,5}. Equivalence relation?<br><b>Answer: Yes.</b> Diagonal all 1 (reflexive), matrix equals its transpose (symmetric), M ⊙ M = M (transitive). It groups odd numbers {1,3,5} and even numbers {2,4}.`,
    q: `R = {(1,1),(1,3),(1,5),(2,2),(2,4),(3,1),(3,3),(3,5),(4,2),(4,4),(5,1),(5,3),(5,5)} on {1,…,5}. Is R an equivalence relation?`, type: 'choice', opts: YN, ans: 'Yes', hint: `Check R, S, T.`,
    fu: [{ note: `Fill the 5 × 5 matrix: 1 where (x, y) ∈ R.`, q: `Fill in the matrix of R.`, type: 'matrix', grid: { rows: N5, cols: N5 }, ans: QC5, hint: `Odd with odd, even with even.` },
      { note: `R groups odd numbers {1,3,5} and even numbers {2,4}.`, q: `List all elements related to 2.`, type: 'set', ans: '{2,4}', hint: `Same group as 2.` }],
    mcq: [`R on {1,…,5} relating numbers of the same parity groups them into…`, `{1,3,5} and {2,4}`, `{1,2} and {3,4,5}`, `{1,…,5}`, `five singletons`] });

  /* =====================================================================
     CHAPTER 3B — FUNCTIONS
     ===================================================================== */
  var X3 = ['1', '2', '3'], Yabc = ['a', 'b', 'c'];
  // ---- 3.5 What is a function? ----
  S({ id: '3B-01', t: '3B', sec: '3.5', kind: 'def', title: `What is a function?`,
    note: `A <b>function</b> f : X → Y is a relation from X to Y such that:<br>① <b>Every</b> x ∈ X is used (domain = X), and<br>② each x goes to <b>exactly one</b> y: if (x, y) and (x, y′) ∈ f then y = y′.`,
    q: `What two conditions make a relation f from X to Y a function?`, type: 'explain', kw: [['every x', 'each x', 'all x', 'every element', 'every input', 'all elements', 'every'], ['exactly one', 'only one', 'one y', 'unique', 'single', 'one output']],
    ans: `Every x ∈ X is used, and each x goes to exactly one y.`, hint: `One condition about "every x", one about "how many y's".`,
    fu: [{ note: `Each x must go to exactly one y.`, q: `X = {1, 2}. Is f = {(1,a), (2,b), (1,c)} a function?`, type: 'choice', opts: [`No: 1 has two arrows`, `Yes`, `No: 2 has no arrow`, `No: c is not used`], ans: `No: 1 has two arrows`, hint: `Look at the pairs starting with 1.` }],
    mcq: [`f : X → Y is a function when…`, `every x is used and goes to exactly one y`, `every y is hit exactly once`, `some x goes to two y's`, `X = Y`] });

  S({ id: '3B-02', t: '3B', sec: '3.5', kind: 'def', title: `Domain, codomain, range`,
    note: `X = <b>domain</b>, Y = <b>codomain</b>, {y | (x,y) ∈ f} = <b>range</b> (the y's actually hit). Range ⊆ codomain.`,
    q: `f : {1,2,3} → {a,b,c}, f = {(1,a), (2,b), (3,a)}. What is the range?`, type: 'set', ans: '{a,b}', hint: `Only the y's actually hit.`,
    fu: [{ note: `Codomain = Y, the whole target set.`, q: `Same f. What is the codomain?`, type: 'set', ans: '{a,b,c}', hint: `The set after the arrow.` },
      { note: `Range ⊆ codomain, always.`, q: `Is the range always a subset of the codomain?`, type: 'choice', opts: YN, ans: 'Yes', hint: `Can f hit something outside Y?` }],
    mcq: [`The range of f is…`, `the y's actually hit`, `the whole set Y`, `the set X`, `X × Y`] });

  S({ id: '3B-03', t: '3B', sec: '3.5', kind: 'tip', title: `Memory tip: exactly ONE arrow out`,
    note: `"<b>Every x has exactly ONE arrow out.</b>" No x left alone, and no x with two arrows.`,
    q: `Complete the tip: "Every x has exactly …"`, type: 'exact', ans: ['one arrow out', 'one arrow', '1 arrow out'], hint: `How many arrows leave each x?`,
    fu: [{ note: `No x left alone, no x with two arrows.`, q: `Which breaks the function rule?`, type: 'choice', opts: [`An x with two arrows out`, `A y with two arrows in`, `A y with no arrow in`, `Two x's going to the same y`], ans: `An x with two arrows out`, hint: `Functions look at arrows LEAVING X.` }],
    mcq: [`For a function, every x has…`, `exactly one arrow out`, `at least one arrow in`, `at most one arrow out`, `two arrows out`] });

  S({ id: '3B-04', t: '3B', sec: '3.5', kind: 'example', title: `Arrow diagram: ✔ function, range = {a, b}`,
    note: arrows(X3, Yabc, [['1', 'a'], ['2', 'b'], ['3', 'a']], '✔ Function, range = {a, b}'),
    q: arrows(X3, Yabc, [['1', 'a'], ['2', 'b'], ['3', 'a']], '') + `Is this a function?`, type: 'choice', opts: [`Yes: every x has exactly one arrow out`, `No: a has two arrows in`, `No: c has no arrow in`, `No: it is not onto`], ans: `Yes: every x has exactly one arrow out`, hint: `Look only at arrows LEAVING X.`,
    fu: [{ note: `Range = the y's actually hit: a and b.`, q: `What is the range?`, type: 'set', ans: '{a,b}', hint: `Which y's get an arrow?` }],
    mcq: [`1→a, 2→b, 3→a. This is…`, `a function with range {a, b}`, `not a function (a has 2 arrows in)`, `not a function (c unused)`, `a bijection`] });

  S({ id: '3B-05', t: '3B', sec: '3.5', kind: 'example', title: `Arrow diagram: ✘ not a function, 4 has no arrow`,
    note: arrows(['1', '2', '3', '4'], Yabc, [['1', 'a'], ['2', 'a'], ['3', 'b']], '✘ Not a function: 4 has no arrow'),
    q: arrows(['1', '2', '3', '4'], Yabc, [['1', 'a'], ['2', 'a'], ['3', 'b']], '') + `Is this a function from {1,2,3,4}?`, type: 'choice', opts: [`No: 4 has no arrow`, `No: a has two arrows in`, `Yes`, `No: c has no arrow in`], ans: `No: 4 has no arrow`, hint: `Every x must be used.`,
    fu: [{ note: `Rule ①: every x ∈ X is used.`, q: `Which condition fails?`, type: 'choice', opts: [`Every x must be used`, `Each x has exactly one y`, `Range = codomain`, `One-to-one`], ans: `Every x must be used`, hint: `No x left alone.` }],
    mcq: [`X = {1,2,3,4}; arrows 1→a, 2→a, 3→b. Not a function because…`, `4 has no arrow`, `a has two arrows`, `c has no arrow`, `b has one arrow`] });

  S({ id: '3B-06', t: '3B', sec: '3.5', kind: 'example', title: `Arrow diagram: ✘ not a function, 1 has two arrows`,
    note: arrows(X3, Yabc, [['1', 'a'], ['1', 'b'], ['2', 'b'], ['3', 'c']], '✘ Not a function: 1 has two arrows'),
    q: arrows(X3, Yabc, [['1', 'a'], ['1', 'b'], ['2', 'b'], ['3', 'c']], '') + `Is this a function?`, type: 'choice', opts: [`No: 1 has two arrows`, `No: b has two arrows in`, `Yes`, `No: 3 has no arrow`], ans: `No: 1 has two arrows`, hint: `Count arrows leaving each x.`,
    fu: [{ note: `Rule ②: each x goes to exactly one y.`, q: `Which condition fails?`, type: 'choice', opts: [`Each x has exactly one y`, `Every x must be used`, `Range = codomain`, `Onto`], ans: `Each x has exactly one y`, hint: `No x with two arrows.` }],
    mcq: [`1→a, 1→b, 2→b, 3→c is not a function because…`, `1 has two arrows out`, `b has two arrows in`, `c has one arrow`, `3 has no arrow`] });

  S({ id: '3B-07', t: '3B', sec: '3.5', kind: 'def', title: `Function notation f(x)`,
    note: `Notation: for f = {(1,a), (2,b), (3,a)} write f(1) = a, f(2) = b, f(3) = a.<br>For f(x) = x²: f(2) = 4, f(−3.5) = 12.25, f(0) = 0.`,
    q: `f(x) = x². f(−3.5) = ?`, type: 'exact', ans: ['12.25'], hint: `(−3.5) × (−3.5).`,
    fu: [{ note: `f = {(1,a), (2,b), (3,a)}: f(x) is the partner of x.`, q: `f = {(1,a), (2,b), (3,a)}. f(3) = ?`, type: 'exact', ans: ['a'], hint: `Find the pair starting with 3.` },
      { note: `f(x) = x².`, q: `f(x) = x². f(−3) = ?`, type: 'exact', ans: ['9'], hint: `A negative squared is positive.` }],
    mcq: [`f = {(1,a),(2,b),(3,a)}. f(2) = ?`, `b`, `a`, `2`, `undefined`] });

  // ---- 3.6 One-to-one, onto, bijection ----
  S({ id: '3B-08', t: '3B', sec: '3.6', kind: 'table', title: `One-to-one (injective)`,
    note: tbl(['Type', 'Also called', 'Rule', 'Arrow test (look at Y)'], [['One-to-one', 'injective', 'f(x₁) = f(x₂) → x₁ = x₂', 'each y has <b>at most one</b> arrow in']]),
    q: `Arrow test for one-to-one: each y has…`, type: 'choice', opts: [`at most one arrow in`, `at least one arrow in`, `exactly one arrow in`, `exactly one arrow out`], ans: `at most one arrow in`, hint: `No sharing.`,
    fu: [{ note: `Two x's sharing a y breaks one-to-one.`, q: `f = {(1,a), (2,a), (3,b)}. Is f one-to-one?`, type: 'choice', opts: YN, ans: 'No', hint: `Does any y have two arrows in?` }],
    mcq: [`One-to-one is also called…`, `injective`, `surjective`, `bijective`, `reflexive`] });

  S({ id: '3B-09', t: '3B', sec: '3.6', kind: 'table', title: `Onto (surjective)`,
    note: tbl(['Type', 'Also called', 'Rule', 'Arrow test (look at Y)'], [['Onto', 'surjective', '∀y ∈ Y ∃x ∈ X, f(x) = y', 'each y has <b>at least one</b> arrow in (range = Y)']]),
    q: `Arrow test for onto: each y has…`, type: 'choice', opts: [`at least one arrow in`, `at most one arrow in`, `exactly one arrow out`, `no arrows in`], ans: `at least one arrow in`, hint: `No one left out.`,
    fu: [{ note: `Onto: range = Y.`, q: `f : {1,2,3} → {a,b}, f = {(1,a), (2,b), (3,a)}. Is f onto?`, type: 'choice', opts: YN, ans: 'Yes', hint: `Are a and b both hit?` }],
    mcq: [`Onto is also called…`, `surjective`, `injective`, `bijective`, `transitive`] });

  S({ id: '3B-10', t: '3B', sec: '3.6', kind: 'table', title: `Bijection (one-to-one correspondence)`,
    note: tbl(['Type', 'Also called', 'Rule', 'Arrow test (look at Y)'], [['Bijection', 'one-to-one correspondence', 'one-to-one <b>and</b> onto', 'each y has <b>exactly one</b> arrow in']]),
    q: `A bijection is…`, type: 'choice', opts: [`one-to-one and onto`, `one-to-one or onto`, `onto but not one-to-one`, `any function`], ans: `one-to-one and onto`, hint: `Both.`,
    fu: [{ note: `Bijection: each y has exactly one arrow in.`, q: `f : {1,2,3} → {a,b,c}, f = {(1,b), (2,c), (3,a)}. Is f a bijection?`, type: 'choice', opts: YN, ans: 'Yes', hint: `Does each of a, b, c get exactly one arrow?` }],
    mcq: [`A bijection is also called…`, `a one-to-one correspondence`, `a partial order`, `a surjection only`, `an injection only`] });

  var FT = [`One-to-one, not onto`, `Onto, not one-to-one`, `Bijection`, `Neither one-to-one nor onto`];
  S({ id: '3B-11', t: '3B', sec: '3.6', kind: 'example', title: `Diagram: one-to-one, not onto (d has no arrow)`,
    note: arrows(X3, ['a', 'b', 'c', 'd'], [['1', 'b'], ['2', 'c'], ['3', 'a']], 'One-to-one, not onto (d has no arrow)'),
    q: arrows(X3, ['a', 'b', 'c', 'd'], [['1', 'b'], ['2', 'c'], ['3', 'a']], '') + `Classify f.`, type: 'choice', opts: FT, ans: FT[0], hint: `Look at arrows arriving in Y.`,
    fu: [{ note: `d has no arrow in, so f is not onto.`, q: `Which y has no arrow in?`, type: 'exact', ans: ['d'], hint: `Look at Y.` }],
    mcq: [`1→b, 2→c, 3→a into {a,b,c,d} is…`, `one-to-one, not onto`, `onto, not one-to-one`, `a bijection`, `not a function`] });

  S({ id: '3B-12', t: '3B', sec: '3.6', kind: 'example', title: `Diagram: not one-to-one, not onto`,
    note: arrows(X3, Yabc, [['1', 'a'], ['2', 'b'], ['3', 'a']], 'Not one-to-one (a has 2 arrows), not onto'),
    q: arrows(X3, Yabc, [['1', 'a'], ['2', 'b'], ['3', 'a']], '') + `Classify f : {1,2,3} → {a,b,c}.`, type: 'choice', opts: FT, ans: FT[3], hint: `a has 2 arrows in; what about c?`,
    fu: [{ note: `a has 2 arrows in (not one-to-one); c has none (not onto).`, q: `Which y has two arrows in?`, type: 'exact', ans: ['a'], hint: `Look at Y.` }],
    mcq: [`1→a, 2→b, 3→a into {a,b,c} is…`, `neither one-to-one nor onto`, `one-to-one only`, `onto only`, `a bijection`] });

  S({ id: '3B-13', t: '3B', sec: '3.6', kind: 'example', title: `Diagram: bijection (exactly one each)`,
    note: arrows(X3, Yabc, [['1', 'a'], ['2', 'c'], ['3', 'b']], 'Bijection (exactly one each)'),
    q: arrows(X3, Yabc, [['1', 'a'], ['2', 'c'], ['3', 'b']], '') + `Classify f.`, type: 'choice', opts: FT, ans: FT[2], hint: `Each y: exactly one arrow?`,
    fu: [{ note: `Bijection → f⁻¹ just reverses the arrows: f = {(1,a), (2,c), (3,b)}.`, q: `List f as a set of pairs.`, type: 'set', ans: '{(1,a),(2,c),(3,b)}', hint: `Read each arrow.` }],
    mcq: [`1→a, 2→c, 3→b into {a,b,c} is…`, `a bijection`, `not onto`, `not one-to-one`, `not a function`] });

  S({ id: '3B-14', t: '3B', sec: '3.6', kind: 'tip', title: `Memory tip: ≤ 1, ≥ 1, = 1`,
    note: `Functions look at arrows <b>leaving X</b> (exactly 1 each). The three types look at arrows <b>arriving in Y</b>:<br><b>One-to-one</b> = "no sharing": ≤ 1 · <b>Onto</b> = "no one left out": ≥ 1 · <b>Bijection</b> = "perfect pairing": = 1 (like a dance where everyone has exactly one partner).`,
    q: `"No one left out" (≥ 1 arrow into each y) describes…`, type: 'choice', opts: ['Onto', 'One-to-one', 'Bijection', 'Function'], ans: 'Onto', hint: `Every y is hit.`,
    fu: [{ note: `One-to-one = "no sharing": ≤ 1.`, q: `"No sharing" describes…`, type: 'choice', opts: ['One-to-one', 'Onto', 'Bijection', 'Function'], ans: 'One-to-one', hint: `At most one arrow in.` },
      { note: `Bijection = perfect pairing, like a dance where everyone has exactly one partner.`, q: `"A dance where everyone has exactly one partner" describes…`, type: 'choice', opts: ['Bijection', 'Onto', 'One-to-one', 'Function'], ans: 'Bijection', hint: `= 1.` }],
    mcq: [`The three types (1-1, onto, bijection) look at arrows…`, `arriving in Y`, `leaving X`, `inside X`, `loops`] });

  S({ id: '3B-15', t: '3B', sec: '3.6', kind: 'proof', title: `Prove one-to-one: f(n) = 2n + 1 on ℤ⁺`,
    note: `Assume f(n₁) = f(n₂)<br>2n₁ + 1 = 2n₂ + 1 &nbsp;(−1)<br>2n₁ = 2n₂ &nbsp;(÷2)<br>n₁ = n₂ ✔ one-to-one`,
    q: `What is the FIRST line of a proof that f(n) = 2n + 1 is one-to-one?`, type: 'choice', opts: [`Assume f(n₁) = f(n₂)`, `Assume n₁ = n₂`, `Let n = 3`, `Assume f is onto`], ans: `Assume f(n₁) = f(n₂)`, hint: `Start from equal outputs.`,
    fu: [{ note: `Same method: 3n₁ − 7 = 3n₂ − 7 → 3n₁ = 3n₂ → n₁ = n₂.`, q: `Is f(n) = 3n − 7 (on ℤ⁺) one-to-one?`, type: 'choice', opts: YN, ans: 'Yes', hint: `Add 7, divide by 3.` }],
    mcq: [`From 2n₁ + 1 = 2n₂ + 1 you conclude…`, `n₁ = n₂`, `n₁ ≠ n₂`, `f is onto`, `nothing`] });

  S({ id: '3B-16', t: '3B', sec: '3.6', kind: 'proof', title: `Disprove one-to-one: f(n) = 2ⁿ − n², ℤ⁺ → ℤ`,
    note: `Find two different inputs with the same output:<br>f(2) = 4 − 4 = 0<br>f(4) = 16 − 16 = 0<br>2 ≠ 4 but f(2) = f(4) ✘ not one-to-one`,
    q: `f(n) = 2ⁿ − n². f(4) = ?`, type: 'exact', ans: ['0'], hint: `2⁴ − 4².`,
    fu: [{ note: `f(2) = 2² − 2².`, q: `f(n) = 2ⁿ − n². f(2) = ?`, type: 'exact', ans: ['0'], hint: `4 − 4.` },
      { note: `f(n) = 2ⁿ − n² at n = 3.`, q: `f(3) = ?`, type: 'exact', ans: ['-1'], hint: `8 − 9.` }],
    mcq: [`f(n) = 2ⁿ − n² is not one-to-one because…`, `f(2) = f(4) = 0`, `f(1) = 1`, `f(3) < 0`, `it isn't onto`] });

  S({ id: '3B-17', t: '3B', sec: '3.6', kind: 'tip', title: `Strategy: proving / disproving one-to-one`,
    note: `<b>To prove one-to-one:</b> start from f(x₁) = f(x₂) and use algebra to reach x₁ = x₂.<br><b>To disprove:</b> give one counterexample (two inputs, same output).`,
    q: `How do you prove a function is one-to-one, and how do you disprove it?`, type: 'explain', kw: [['assume', 'suppose', 'start', 'f x1 f x2', 'f x₁ f x₂', 'equal outputs'], ['algebra', 'reach', 'show', 'conclude', 'x1 x2', 'x₁ x₂'], ['counterexample', 'two inputs', 'two different inputs', 'same output']],
    ans: `Prove: assume f(x₁) = f(x₂) and use algebra to reach x₁ = x₂. Disprove: give a counterexample, two different inputs with the same output.`, hint: `One sentence for each.`,
    fu: [{ note: `To disprove: two different inputs, same output.`, q: `g(x) = x² on ℤ. Which pair disproves one-to-one?`, type: 'choice', opts: [`1 and −1`, `1 and 2`, `0 and 1`, `2 and 4`], ans: `1 and −1`, hint: `Different inputs, same square.` }],
    mcq: [`To disprove one-to-one you need…`, `two different inputs with the same output`, `one input with two outputs`, `a y with no arrow`, `a general algebra proof`] });

  // ---- 3.7 Inverse function ----
  S({ id: '3B-18', t: '3B', sec: '3.7', kind: 'def', title: `Inverse function f⁻¹`,
    note: `For f : X → Y, the <b>inverse</b> f⁻¹ : Y → X just reverses every arrow. It is a function <b>if and only if f is a bijection</b>.`,
    q: `f⁻¹ is a function if and only if f is…`, type: 'choice', opts: [`a bijection`, `one-to-one`, `onto`, `any function`], ans: `a bijection`, hint: `Both conditions are needed.`,
    fu: [{ note: `Reversing f = {(1,a), (2,a)} gives a with two arrows out.`, q: `f = {(1,a), (2,a)}. Is f⁻¹ a function?`, type: 'choice', opts: YN, ans: 'No', hint: `Reverse the arrows: how many leave a?` }],
    mcq: [`f⁻¹ : Y → X…`, `reverses every arrow of f`, `is 1/f`, `always exists`, `is f ∘ f`] });

  S({ id: '3B-19', t: '3B', sec: '3.7', kind: 'example', title: `Inverse from pairs: swap each pair`,
    note: `f = {(1,a), (2,c), (3,b)} → f⁻¹ = {(a,1), (c,2), (b,3)} (swap each pair)`,
    q: `f = {(1,a), (2,c), (3,b)}. Write f⁻¹.`, type: 'set', ans: '{(a,1),(c,2),(b,3)}', hint: `Swap each pair.`,
    fu: [{ note: `Swap each pair.`, q: `f = {(1,x), (2,y), (3,z)}. Write f⁻¹.`, type: 'set', ans: '{(x,1),(y,2),(z,3)}', hint: `(1,x) becomes (x,1).` }],
    mcq: [`f = {(1,a),(2,c),(3,b)}. f⁻¹(c) = ?`, `2`, `3`, `1`, `b`] });

  S({ id: '3B-20', t: '3B', sec: '3.7', kind: 'example', title: `Inverse from a formula: f(x) = 9x + 5`,
    note: `f(x) = 9x + 5, x ∈ ℝ<br>1. Write y = 9x + 5<br>2. Solve for x: x = (y − 5)/9<br>3. So f⁻¹(y) = (y − 5)/9`,
    q: `f(x) = 9x + 5. f⁻¹(y) = ?`, type: 'exact', ans: ['(y - 5)/9', '(y-5)/9', '(y - 5) / 9', 'y/9 - 5/9'], hint: `y = 9x + 5. Solve for x.`,
    fu: [{ note: `Same 3 steps: y = 2x − 3 → solve for x.`, q: `f(x) = 2x − 3. f⁻¹(y) = ?`, type: 'exact', ans: ['(y + 3)/2', '(y+3)/2', 'y/2 + 3/2'], hint: `Add 3, divide by 2.` },
      { note: `f⁻¹(y) = (y − 5)/9 undoes f(x) = 9x + 5.`, q: `f(x) = 9x + 5. f⁻¹(14) = ?`, type: 'exact', ans: ['1'], hint: `(14 − 5)/9.` }],
    mcq: [`f(x) = 9x + 5. f⁻¹(y) = ?`, `(y − 5)/9`, `1/(9y + 5)`, `9y − 5`, `(y + 5)/9`] });

  S({ id: '3B-21', t: '3B', sec: '3.7', kind: 'watch', title: `Watch out: f⁻¹ is not 1/f`,
    note: `<b>f⁻¹ means inverse, not 1/f.</b> If f is not one-to-one, reversing arrows gives a y with two arrows out. If f is not onto, some y has no arrow out. Either way, f⁻¹ is not a function.`,
    q: `f(x) = 2x. Is f⁻¹(x) = 1/(2x)?`, type: 'choice', opts: [`No: f⁻¹ means inverse, f⁻¹(y) = y/2`, `Yes: f⁻¹ = 1/f`, `Yes, for x ≠ 0`, `f has no inverse`], ans: `No: f⁻¹ means inverse, f⁻¹(y) = y/2`, hint: `f⁻¹ undoes f.`,
    fu: [{ note: `Not onto → some y has no arrow out in f⁻¹.`, q: `f is not onto. What goes wrong with f⁻¹?`, type: 'choice', opts: [`Some y has no arrow out`, `Some y has two arrows out`, `Nothing`, `f⁻¹ = 1/f`], ans: `Some y has no arrow out`, hint: `A y that was never hit…` },
      { note: `Not one-to-one → some y has two arrows out in f⁻¹.`, q: `f is not one-to-one. What goes wrong with f⁻¹?`, type: 'choice', opts: [`Some y has two arrows out`, `Some y has no arrow out`, `Nothing`, `X becomes empty`], ans: `Some y has two arrows out`, hint: `A y that was shared…` }],
    mcq: [`TRAP: f⁻¹ means…`, `the inverse function`, `1/f`, `−f`, `f ∘ f`] });

  // ---- 3.8 Composition ----
  S({ id: '3B-22', t: '3B', sec: '3.8', kind: 'def', title: `Composition f ∘ g`,
    note: `If g : X → Y and f : Y → Z, then f ∘ g : X → Z with<br><b>(f ∘ g)(x) = f( g(x) )</b><br>Do <b>g first</b>, then f. Read f ∘ g as "f after g", like (shoes ∘ socks)(you): socks go on first!`,
    q: `In f ∘ g, which function is applied first?`, type: 'choice', opts: ['g', 'f', 'whichever is simpler', 'both at once'], ans: 'g', hint: `"f after g".`,
    fu: [{ note: `(f ∘ g)(x) = f(g(x)).`, q: `(f ∘ g)(x) = ?`, type: 'exact', ans: ['f(g(x))'], hint: `g inside, f outside.` },
      { note: `(shoes ∘ socks)(you): socks go on first.`, q: `In (shoes ∘ socks)(you), what goes on first?`, type: 'exact', ans: ['socks'], hint: `The one on the right.` }],
    mcq: [`(f ∘ g)(x) = ?`, `f(g(x))`, `g(f(x))`, `f(x) · g(x)`, `f(x) + g(x)`] });

  S({ id: '3B-23', t: '3B', sec: '3.8', kind: 'example', title: `Composition from pairs`,
    note: `g = {(1,a), (2,a), (3,c)}, f = {(a,y), (b,x), (c,z)}<br>1 →g→ a →f→ y, &nbsp;2 → a → y, &nbsp;3 → c → z<br>f ∘ g = {(1,y), (2,y), (3,z)}`,
    q: `g = {(1,a), (2,a), (3,c)}, f = {(a,y), (b,x), (c,z)}. Write f ∘ g.`, type: 'set', ans: '{(1,y),(2,y),(3,z)}', hint: `Follow 1 → g → f, then 2, then 3.`,
    fu: [{ note: `Follow each x through g, then f.`, q: `g = {(1,b), (2,c), (3,a)}, f = {(a,z), (b,y), (c,x)}. Write f ∘ g.`, type: 'set', ans: '{(1,y),(2,x),(3,z)}', hint: `1 → b → y.` }],
    mcq: [`g = {(1,a),(2,a),(3,c)}, f = {(a,y),(b,x),(c,z)}. (f ∘ g)(3) = ?`, `z`, `c`, `y`, `x`] });

  S({ id: '3B-24', t: '3B', sec: '3.8', kind: 'example', title: `Composition from formulas: f ∘ g ≠ g ∘ f`,
    note: `f(x) = log₃x, g(x) = x⁴<br>f(g(x)) = log₃(x⁴)<br>g(f(x)) = (log₃x)⁴<br>So <b>f ∘ g ≠ g ∘ f</b> in general!`,
    q: `f(x) = log₃x, g(x) = x⁴. f(g(x)) = ?`, type: 'exact', ans: ['log₃(x⁴)', 'log3(x^4)', 'log_3(x^4)', 'log₃x⁴'], hint: `Put x⁴ inside log₃.`,
    fu: [{ note: `g(f(x)): put log₃x inside g.`, q: `Same f and g. g(f(x)) = ?`, type: 'exact', ans: ['(log₃x)⁴', '(log3(x))^4', '(log3x)^4', '(log_3(x))^4', '(log_3x)^4', '(log₃(x))⁴'], hint: `Raise log₃x to the 4th power.` },
      { note: `f(x) = x + 1, g(x) = 2x. (f ∘ g)(3) = f(g(3)).`, q: `f(x) = x + 1, g(x) = 2x. (f ∘ g)(3) = ?`, type: 'exact', ans: ['7'], hint: `g(3) = 6 first.` },
      { note: `(g ∘ f)(3) = g(f(3)).`, q: `f(x) = x + 1, g(x) = 2x. (g ∘ f)(3) = ?`, type: 'exact', ans: ['8'], hint: `f(3) = 4 first.` }],
    mcq: [`f(x) = log₃x, g(x) = x⁴. g(f(x)) = ?`, `(log₃x)⁴`, `log₃(x⁴)`, `4 log₃x only`, `log₃(4x)`] });

  S({ id: '3B-25', t: '3B', sec: '3.8', kind: 'example', title: `Decomposing a function`,
    note: `w(x) = 2x, h(x) = sin x, g(x) = √x → f(x) = g(h(w(x))) = √(sin 2x)`,
    q: `f(x) = √(sin 2x) = g(h(w(x))) with w(x) = 2x, h(x) = sin x, g(x) = √x. Which function is applied FIRST?`, type: 'choice', opts: ['w (doubling)', 'h (sin)', 'g (square root)', 'all at once'], ans: 'w (doubling)', hint: `The innermost one.`,
    fu: [{ note: `g(h(w(x))): innermost first.`, q: `In which order are they applied?`, type: 'choice', opts: ['w, then h, then g', 'g, then h, then w', 'h, then w, then g', 'w, then g, then h'], ans: 'w, then h, then g', hint: `Inside out.` }],
    mcq: [`√(sin 2x) = g(h(w(x))) where…`, `w(x) = 2x, h(x) = sin x, g(x) = √x`, `w(x) = √x, h(x) = sin x, g(x) = 2x`, `w(x) = sin x, h(x) = 2x, g(x) = √x`, `w(x) = 2x, h(x) = √x, g(x) = sin x`] });

  /* =====================================================================
     ★ CHEAT SHEET (mixed revision, new numbers)
     ===================================================================== */
  S({ id: 'CS-01', t: 'S', sec: 'Cheat: Sets', kind: 'cheat', title: `Cheat sheet: order, duplicates, ∅ ⊆ A, A ⊆ A`,
    note: `Order & duplicates don't matter · ∅ ⊆ every set · A ⊆ A`,
    q: `Simplify {3, 3, 1, 2, 1}.`, type: 'set', ans: '{1,2,3}', hint: `Remove duplicates; order is free.`,
    fu: [{ note: `∅ ⊆ every set · A ⊆ A.`, q: `Which are true for A = {5}? (select all)`, type: 'choice', opts: ['∅ ⊆ A', 'A ⊆ A', '∅ ∈ A', '5 ⊆ A'], ans: ['∅ ⊆ A', 'A ⊆ A'], hint: `Subset facts that always hold.` }],
    mcq: [`{3,3,1,2,1} = ?`, `{1,2,3}`, `{3,3,1,2,1} with 5 elements`, `{1,2}`, `(3,3,1,2,1)`] });

  S({ id: 'CS-02', t: 'S', sec: 'Cheat: Sets', kind: 'cheat', title: `Cheat sheet: |P(A)| = 2ⁿ, proper subsets = 2ⁿ − 1`,
    note: `|P(A)| = 2ⁿ · proper subsets = 2ⁿ − 1`,
    q: `|A| = 6. |P(A)| = ?`, type: 'exact', ans: ['64'], hint: `2⁶.`,
    fu: [{ note: `Proper subsets = 2ⁿ − 1.`, q: `|A| = 6. How many proper subsets?`, type: 'exact', ans: ['63'], hint: `2⁶ − 1.` }],
    mcq: [`|A| = 6. |P(A)| = ?`, `64`, `36`, `12`, `63`] });

  S({ id: 'CS-03', t: 'S', sec: 'Cheat: Sets', kind: 'cheat', title: `Cheat sheet: |A ∪ B| = |A| + |B| − |A ∩ B|`,
    note: `|A ∪ B| = |A| + |B| − |A ∩ B|`,
    q: `|A| = 20, |B| = 15, |A ∩ B| = 7. |A ∪ B| = ?`, type: 'exact', ans: ['28'], hint: `20 + 15 − 7.`,
    fu: [{ note: `Rearrange: |A ∩ B| = |A| + |B| − |A ∪ B|.`, q: `|A ∪ B| = 30, |A| = 18, |B| = 17. |A ∩ B| = ?`, type: 'exact', ans: ['5'], hint: `18 + 17 − 30.` }],
    mcq: [`|A| = 10, |B| = 10, |A ∩ B| = 10. |A ∪ B| = ?`, `10`, `20`, `30`, `0`] });

  S({ id: 'CS-04', t: 'S', sec: 'Cheat: Sets', kind: 'cheat', title: `Cheat sheet: A − B = A ∩ B′, A ⊕ B = (A−B) ∪ (B−A)`,
    note: `A − B = A ∩ B′ · A ⊕ B = (A − B) ∪ (B − A)`,
    q: `A = {1,2,3,4}, B = {3,4,5}. A ⊕ B = ?`, type: 'set', ans: '{1,2,5}', hint: `(A − B) ∪ (B − A).`,
    fu: [{ note: `A ⊕ B = (A − B) ∪ (B − A).`, q: `Write A ⊕ B using − and ∪.`, type: 'exact', ans: ['(A − B) ∪ (B − A)', '(B − A) ∪ (A − B)'], hint: `Two differences, joined.` },
      { note: `U = {1,…,6}, A = {1,2,3,4}, B = {3,4,5}. A − B = A ∩ B′.`, q: `Compute A ∩ B′.`, type: 'set', ans: '{1,2}', hint: `B′ = {1,2,6}.` }],
    mcq: [`A − B = ?`, `A ∩ B′`, `A ∪ B′`, `A′ ∩ B`, `(A ∪ B)′`] });

  S({ id: 'CS-05', t: 'S', sec: 'Cheat: Sets', kind: 'cheat', title: `Cheat sheet: De Morgan for sets`,
    note: `(A ∪ B)′ = A′ ∩ B′ · (A ∩ B)′ = A′ ∪ B′`,
    q: `U = {1,…,8}, A = {1,2,3}, B = {3,4}. (A ∩ B)′ = ?`, type: 'set', ans: '{1,2,4,5,6,7,8}', hint: `A ∩ B = {3}.`,
    fu: [{ note: `(A ∪ B)′ = A′ ∩ B′.`, q: `Same U, A, B. (A ∪ B)′ = ?`, type: 'set', ans: '{5,6,7,8}', hint: `A ∪ B = {1,2,3,4}.` }],
    mcq: [`(A ∪ B)′ = ?`, `A′ ∩ B′`, `A′ ∪ B′`, `A ∩ B`, `A′ − B′`] });

  S({ id: 'CS-06', t: 'S', sec: 'Cheat: Sets', kind: 'cheat', title: `Cheat sheet: |A × B| = |A|·|B|, (a,b) ≠ (b,a)`,
    note: `|A × B| = |A| · |B| · (a, b) ≠ (b, a)`,
    q: `|A| = 4, |B| = 5. |A × B| = ?`, type: 'exact', ans: ['20'], hint: `Multiply.`,
    fu: [{ note: `(a, b) ≠ (b, a) unless a = b.`, q: `Is (3, 7) = (7, 3)?`, type: 'choice', opts: YN, ans: 'No', hint: `Ordered.` }],
    mcq: [`|A| = 4, |B| = 5. |B × A| = ?`, `20`, `9`, `45`, `54`] });

  S({ id: 'CS-07', t: 'S', sec: 'Cheat: Logic', kind: 'cheat', title: `Cheat sheet: ∧ all, ∨ any, → false only T→F, ↔ same`,
    note: `∧ all true · ∨ any true · → false only T→F · ↔ same values`,
    q: `Fill in the (p ∨ q) ↔ p column.`, type: 'truthtable', table: tt(['p', 'q', '(p ∨ q) ↔ p'], TT2), ans: ['T', 'T', 'F', 'T'], hint: `Compute p ∨ q, then compare with p: same = T.`,
    fu: [{ note: `→ is false only for T → F.`, q: `Fill in the column (p ∧ q) → q.`, type: 'truthtable', table: tt(['p', 'q', '(p ∧ q) → q'], TT2), ans: ['T', 'T', 'T', 'T'], hint: `Can p ∧ q be T while q is F?` }],
    mcq: [`Which connective is false only for T, F?`, `→`, `∧`, `∨`, `↔`] });

  S({ id: 'CS-08', t: 'S', sec: 'Cheat: Logic', kind: 'cheat', title: `Cheat sheet: precedence ¬ ∧ ∨ → ↔`,
    note: `Precedence: ¬ ∧ ∨ → ↔`,
    q: `How is p ∨ q ∧ r grouped?`, type: 'choice', opts: ['p ∨ (q ∧ r)', '(p ∨ q) ∧ r', '¬(p ∨ q) ∧ r', 'p ∨ q ∨ r'], ans: 'p ∨ (q ∧ r)', hint: `∧ binds tighter than ∨.`,
    fu: [{ note: `¬ first, then →, then ↔ (lowest).`, q: `How is ¬p → q ↔ r grouped?`, type: 'choice', opts: ['((¬p) → q) ↔ r', '¬(p → q) ↔ r', '¬p → (q ↔ r)', '¬(p → (q ↔ r))'], ans: '((¬p) → q) ↔ r', hint: `↔ is applied last.` }],
    mcq: [`p ∨ q ∧ r means…`, `p ∨ (q ∧ r)`, `(p ∨ q) ∧ r`, `p ∧ q ∨ r`, `(p ∧ q) ∨ r`] });

  S({ id: 'CS-09', t: 'S', sec: 'Cheat: Logic', kind: 'cheat', title: `Cheat sheet: p → q ≡ ¬q → ¬p ≡ ¬p ∨ q`,
    note: `p → q ≡ ¬q → ¬p ≡ ¬p ∨ q`,
    q: `s: it is sunny, g: we go out. Write s → g as a disjunction.`, type: 'exact', ans: ['¬s ∨ g', 'g ∨ ¬s'], hint: `¬p ∨ q.`,
    fu: [{ note: `Contrapositive: ¬q → ¬p.`, q: `Write the contrapositive of s → g.`, type: 'exact', ans: ['¬g → ¬s'], hint: `Flip and negate both.` }],
    mcq: [`p → q ≡ ?`, `¬q → ¬p`, `q → p`, `¬p → ¬q`, `p ∧ q`] });

  S({ id: 'CS-10', t: 'S', sec: 'Cheat: Logic', kind: 'cheat', title: `Cheat sheet: ¬(p → q) ≡ p ∧ ¬q`,
    note: `¬(p → q) ≡ p ∧ ¬q`,
    q: `Negate s → g (no ¬ in front of a bracket).`, type: 'exact', ans: ['s ∧ ¬g', '¬g ∧ s'], hint: `"s happened and g didn't".`,
    fu: [{ note: `Not (if p then q) = p and not q.`, q: `Negate "If I study, I pass." in English.`, type: 'explain', kw: [['study'], ['and', 'but'], ['not pass', 'dont pass', 'do not pass', 'fail']], ans: `I study and I don't pass.`, hint: `The broken-promise row.` }],
    mcq: [`¬(p → q) ≡ ?`, `p ∧ ¬q`, `¬p → ¬q`, `¬p ∧ q`, `¬p ∨ q`] });

  S({ id: 'CS-11', t: 'S', sec: 'Cheat: Logic', kind: 'cheat', title: `Cheat sheet: De Morgan for logic`,
    note: `¬(p ∧ q) ≡ ¬p ∨ ¬q · ¬(p ∨ q) ≡ ¬p ∧ ¬q`,
    q: `Simplify ¬(a ∨ ¬b) (no ¬ in front of a bracket, no double ¬).`, type: 'exact', ans: ['¬a ∧ b', 'b ∧ ¬a'], hint: `De Morgan, then double negation.`,
    fu: [{ note: `¬(p ∧ q) ≡ ¬p ∨ ¬q.`, q: `Fill in the ¬(p ∧ q) column.`, type: 'truthtable', table: tt(['p', 'q', '¬(p ∧ q)'], TT2), ans: ['F', 'T', 'T', 'T'], hint: `Flip the p ∧ q column.` }],
    mcq: [`¬(p ∧ q) ≡ ?`, `¬p ∨ ¬q`, `¬p ∧ ¬q`, `p ∨ q`, `¬p ∧ q`] });

  S({ id: 'CS-12', t: 'S', sec: 'Cheat: Quantifiers', kind: 'cheat', title: `Cheat sheet: ∀ false ⇐ 1 counterexample, ∃ true ⇐ 1 witness`,
    note: `∀ false ⇐ 1 counterexample · ∃ true ⇐ 1 witness`,
    q: `Give a counterexample to ∀n ∈ ℤ⁺ (n² &gt; n).`, type: 'exact', ans: ['1', 'n = 1'], hint: `Try the smallest positive integer.`,
    fu: [{ note: `One witness proves ∃.`, q: `Give a witness for ∃x ∈ ℤ (x² = 49).`, type: 'exact', ans: ['7', '-7', 'x = 7', 'x = -7'], hint: `Square root of 49.` }],
    mcq: [`To prove ∃x P(x) you need…`, `one witness`, `one counterexample`, `a proof for every x`, `two examples`] });

  S({ id: 'CS-13', t: 'S', sec: 'Cheat: Quantifiers', kind: 'cheat', title: `Cheat sheet: ¬∀x P ≡ ∃x ¬P, ¬∃x P ≡ ∀x ¬P`,
    note: `¬∀x P ≡ ∃x ¬P · ¬∃x P ≡ ∀x ¬P`,
    q: `Negate ∀x ∃y (x &lt; y) so that ¬ applies only to the inequality.`, type: 'exact', ans: ['∃x ∀y ¬(x < y)', '∃x ∀y (x ≥ y)', '∃x∀y x ≥ y'], hint: `Flip both quantifiers.`,
    fu: [{ note: `¬∃x P ≡ ∀x ¬P.`, q: `Negate ∃x (x &gt; 5) without a ¬ in front of ∃.`, type: 'exact', ans: ['∀x ¬(x > 5)', '∀x (x ≤ 5)', '∀x x ≤ 5'], hint: `∀x, then the opposite inequality.` }],
    mcq: [`¬∃x P(x) ≡ ?`, `∀x ¬P(x)`, `∃x ¬P(x)`, `¬∀x P(x)`, `∀x P(x)`] });

  S({ id: 'CS-14', t: 'S', sec: 'Cheat: Quantifiers', kind: 'cheat', title: `Cheat sheet: ∀ pairs with →, ∃ pairs with ∧`,
    note: `∀ pairs with → · ∃ pairs with ∧`,
    q: `Domain: all animals. C(x): x is a cat, B(x): x is black. Translate "Some cat is black."`, type: 'exact', ans: ['∃x (C(x) ∧ B(x))'], hint: `∃ with ∧.`,
    fu: [{ note: `∀ with →.`, q: `Same domain. Translate "Every cat is black."`, type: 'exact', ans: ['∀x (C(x) → B(x))'], hint: `∀ with →.` }],
    mcq: [`"Every cat is black" (domain: animals) =`, `∀x (C(x) → B(x))`, `∀x (C(x) ∧ B(x))`, `∃x (C(x) ∧ B(x))`, `∃x (C(x) → B(x))`] });

  S({ id: 'CS-15', t: 'S', sec: 'Cheat: Quantifiers', kind: 'cheat', title: `Cheat sheet: ∀x∃y ≠ ∃y∀x`,
    note: `∀x∃y (each has own) ≠ ∃y∀x (one for all)`,
    q: `x, y ∈ ℤ. Is ∀x ∃y (y &gt; x) true?`, type: 'choice', opts: TF, ans: 'True', hint: `For each x, try y = x + 1.`,
    fu: [{ note: `∃y∀x: one y must beat every x, including x = y.`, q: `x, y ∈ ℤ. Is ∃y ∀x (y &gt; x) true?`, type: 'choice', opts: TF, ans: 'False', hint: `Is there a biggest integer?` }],
    mcq: [`∃y∀x P(x,y) means…`, `one y works for all x`, `each x has its own y`, `every pair works`, `some pair works`] });

  S({ id: 'CS-16', t: 'S', sec: 'Cheat: Proofs', kind: 'cheat', title: `Cheat sheet: three proofs of p → q`,
    note: `Direct: assume p, show q<br>Contrapositive: assume ¬q, show ¬p<br>Contradiction: assume p ∧ ¬q, find impossibility`,
    q: `"Assume p ∧ ¬q and find an impossibility" is which method?`, type: 'choice', opts: ['Contradiction', 'Contrapositive', 'Direct', 'Counterexample'], ans: 'Contradiction', hint: `Assume the opposite.`,
    fu: [{ note: `Contrapositive: assume ¬q, show ¬p.`, q: `"Assume ¬q, show ¬p" is which method?`, type: 'choice', opts: ['Contrapositive', 'Contradiction', 'Direct', 'Induction'], ans: 'Contrapositive', hint: `Flip and negate.` }],
    mcq: [`Direct proof of p → q:`, `assume p, show q`, `assume ¬q, show ¬p`, `assume p ∧ ¬q`, `assume q, show p`] });

  S({ id: 'CS-17', t: 'S', sec: 'Cheat: Proofs', kind: 'cheat', title: `Cheat sheet: even = 2k, odd = 2k + 1`,
    note: `Even = 2k · Odd = 2k + 1`,
    q: `Two odd numbers: (2a + 1) + (2b + 1) = 2( ? ). Type the bracket.`, type: 'exact', ans: ['a + b + 1', 'a+b+1', 'b+a+1'], hint: `2a + 2b + 2.`,
    fu: [{ note: `2(a + b + 1) is of the form 2k.`, q: `So the sum of two odd numbers is…`, type: 'choice', opts: ['Even', 'Odd', 'Either', 'Prime'], ans: 'Even', hint: `2k form.` }],
    mcq: [`An even integer is…`, `2k for some k ∈ ℤ`, `2k + 1`, `k²`, `k + 2`] });

  var CSM = [[0, 1, 1], [1, 0, 1], [0, 0, 1]];
  S({ id: 'CS-18', t: 'S', sec: 'Cheat: Relations', kind: 'cheat', title: `Cheat sheet: R ⊆ A × B, out = row sum, in = column sum`,
    note: `R ⊆ A × B · out-degree = row sum · in-degree = column sum`,
    q: mx(N123, N123, CSM, true) + `Relation on {1,2,3}. Out-degree of 1?`, type: 'exact', ans: ['2'], hint: `Row sum.`,
    fu: [{ note: `In-degree = column sum.`, q: mx(N123, N123, CSM, true) + `In-degree of 3?`, type: 'exact', ans: ['3'], hint: `Column sum.` }],
    mcq: [`In-degree = ?`, `column sum`, `row sum`, `diagonal sum`, `number of loops`] });

  var CSP = [[1, 1, 0], [0, 1, 0], [0, 1, 1]];
  S({ id: 'CS-19', t: 'S', sec: 'Cheat: Relations', kind: 'cheat', title: `Cheat sheet: matrix tests for the properties`,
    note: `Reflexive: diagonal all 1 · Irreflexive: diagonal all 0<br>Symmetric: M = Mᵀ · Antisymmetric: no mirror 1s off diagonal`,
    q: mx(N123, N123, CSP, true) + `Which properties hold? (select all)`, type: 'choice', opts: ['Reflexive', 'Irreflexive', 'Symmetric', 'Antisymmetric'], ans: ['Reflexive', 'Antisymmetric'], hint: `Check the diagonal, then look for mirror pairs off the diagonal.`,
    fu: [{ note: `It is also transitive (check M ⊙ M), so it's R + A + T.`, q: mx(N123, N123, CSP, true) + `This relation is also transitive. So it is…`, type: 'choice', opts: ['A partial order', 'An equivalence relation', 'Both', 'Neither'], ans: 'A partial order', hint: `RAT or RST?` }],
    mcq: [`Antisymmetric matrix test:`, `no mirror 1s off the diagonal`, `M = Mᵀ`, `diagonal all 0`, `diagonal all 1`] });

  var CYC = [[0, 1, 0], [0, 0, 1], [1, 0, 0]];
  S({ id: 'CS-20', t: 'S', sec: 'Cheat: Relations', kind: 'cheat', title: `Cheat sheet: asymmetric, and transitivity via M ⊙ M`,
    note: `Asymmetric = antisymmetric + irreflexive · Transitive: 1s of M ⊙ M ⊆ 1s of M`,
    q: `M is the matrix of R = {(1,2), (2,3), (3,1)}:` + mx(N123, N123, CYC, true) + `Compute M ⊙ M.`, type: 'matrix', grid: { rows: N123, cols: N123 }, ans: [[0, 0, 1], [1, 0, 0], [0, 1, 0]], hint: `1 → 2 → 3, so (1,3) …`,
    fu: [{ note: `Compare the 1s of M ⊙ M with the 1s of M.`, q: `Is R = {(1,2), (2,3), (3,1)} transitive?`, type: 'choice', opts: YN, ans: 'No', hint: `Is (1,3) in M?` },
      { note: `Asymmetric = antisymmetric + irreflexive.`, q: `Is R = {(1,2), (2,3), (3,1)} asymmetric?`, type: 'choice', opts: YN, ans: 'Yes', hint: `No loops, no mutual pairs?` }],
    mcq: [`Asymmetric = ?`, `antisymmetric + irreflexive`, `not symmetric`, `symmetric + irreflexive`, `antisymmetric + reflexive`] });

  S({ id: 'CS-21', t: 'S', sec: 'Cheat: Relations', kind: 'cheat', title: `Cheat sheet: equivalence = RST, partial order = RAT`,
    note: `Equivalence = RST · Partial order = RAT`,
    q: `"=" on a set is…`, type: 'choice', opts: ['Both an equivalence relation and a partial order', 'Only an equivalence relation', 'Only a partial order', 'Neither'], ans: 'Both an equivalence relation and a partial order', hint: `It's reflexive, symmetric AND antisymmetric, and transitive.`,
    fu: [{ note: `&lt; is not reflexive.`, q: `"&lt;" on ℤ is…`, type: 'choice', opts: ['Neither', 'An equivalence relation', 'A partial order', 'Both'], ans: 'Neither', hint: `Is x &lt; x?` }],
    mcq: [`Partial order = ?`, `R·A·T`, `R·S·T`, `S·A·T`, `R·S·A`] });

  S({ id: 'CS-22', t: 'S', sec: 'Cheat: Functions', kind: 'cheat', title: `Cheat sheet: every x has exactly one arrow out`,
    note: `Every x has exactly one arrow out`,
    q: `f = {(1,a), (2,a), (3,a)} from {1,2,3} to {a,b}. Is f a function?`, type: 'choice', opts: [`Yes: every x has exactly one arrow out`, `No: a has three arrows in`, `No: b is unused`, `No: not one-to-one`], ans: `Yes: every x has exactly one arrow out`, hint: `Only arrows OUT of X matter.`,
    fu: [{ note: `Same f: a is shared and b is never hit.`, q: `Is f = {(1,a), (2,a), (3,a)} onto {a,b}?`, type: 'choice', opts: YN, ans: 'No', hint: `Is b hit?` }],
    mcq: [`A constant map {(1,a),(2,a),(3,a)} is…`, `a function`, `not a function`, `a bijection`, `one-to-one`] });

  S({ id: 'CS-23', t: 'S', sec: 'Cheat: Functions', kind: 'cheat', title: `Cheat sheet: 1-1 ≤ 1, onto ≥ 1, bijection = 1`,
    note: `1-1: ≤ 1 arrow into each y · Onto: ≥ 1 · Bijection: exactly 1`,
    q: `f : {1,2,3} → {a,b,c}, f = {(1,c), (2,a), (3,b)}. Which hold? (select all)`, type: 'choice', opts: ['One-to-one', 'Onto', 'Bijection'], ans: ['One-to-one', 'Onto', 'Bijection'], hint: `Count arrows into each y.`,
    fu: [{ note: `f(x) = x² on ℤ: f(1) = f(−1).`, q: `Is f(x) = x² on ℤ one-to-one?`, type: 'choice', opts: YN, ans: 'No', hint: `Try 1 and −1.` }],
    mcq: [`Bijection means each y has…`, `exactly 1 arrow in`, `≥ 1 arrow in`, `≤ 1 arrow in`, `0 arrows in`] });

  S({ id: 'CS-24', t: 'S', sec: 'Cheat: Functions', kind: 'cheat', title: `Cheat sheet: f⁻¹ exists ⟺ f is a bijection`,
    note: `f⁻¹ exists ⟺ f is a bijection (swap pairs / solve for x)`,
    q: `f(x) = (x + 4)/3. f⁻¹(y) = ?`, type: 'exact', ans: ['3y - 4', '3y−4', '-4 + 3y'], hint: `y = (x + 4)/3. Solve for x.`,
    fu: [{ note: `Swap pairs.`, q: `f = {(1,c), (2,a), (3,b)}. Write f⁻¹.`, type: 'set', ans: '{(c,1),(a,2),(b,3)}', hint: `Swap each pair.` }],
    mcq: [`f⁻¹ exists as a function ⟺ …`, `f is a bijection`, `f is onto`, `f is one-to-one`, `f is any function`] });

  S({ id: 'CS-25', t: 'S', sec: 'Cheat: Functions', kind: 'cheat', title: `Cheat sheet: (f ∘ g)(x) = f(g(x)), g first`,
    note: `(f ∘ g)(x) = f(g(x)): g first · f ∘ g ≠ g ∘ f`,
    q: `f(x) = x², g(x) = x + 3. (f ∘ g)(2) = ?`, type: 'exact', ans: ['25'], hint: `g(2) = 5 first.`,
    fu: [{ note: `(g ∘ f)(2) = g(f(2)).`, q: `Same f, g. (g ∘ f)(2) = ?`, type: 'exact', ans: ['7'], hint: `f(2) = 4 first.` }],
    mcq: [`In f ∘ g, which is applied first?`, `g`, `f`, `either`, `neither`] });

  /* =====================================================================
     ★ TOP 10 COMMON MISTAKES
     ===================================================================== */
  function mistake(n, wrong, right) { return tbl(['#', 'Mistake', 'Correct idea'], [[String(n), wrong, right]]); }
  S({ id: 'TM-01', t: 'S', sec: 'Top 10 mistakes', kind: 'mistake', title: `Mistake 1: writing 1 ∈ {{1}, 2}`,
    note: mistake(1, 'Writing 1 ∈ {{1},2}', 'The element is {1}, not 1'),
    q: `Is 1 ∈ {{1}, 2}?`, type: 'choice', opts: [`No: the element is {1}, not 1`, `Yes`, `Yes, because {1} contains 1`, `It's undefined`], ans: `No: the element is {1}, not 1`, hint: `List the elements: {1} and 2.`,
    fu: [{ note: `The elements of {{1}, 2} are {1} and 2.`, q: `List the elements of {{1}, 2} that are SETS.`, type: 'set', ans: '{{1}}', hint: `Only one element is itself a set.` }],
    mcq: [`TRAP: Which is TRUE?`, `{1} ∈ {{1}, 2}`, `1 ∈ {{1}, 2}`, `{2} ∈ {{1}, 2}`, `|{{1}, 2}| = 3`] });

  S({ id: 'TM-02', t: 'S', sec: 'Top 10 mistakes', kind: 'mistake', title: `Mistake 2: forgetting ∅ in a power set`,
    note: mistake(2, 'Forgetting ∅ in a power set', '∅ and A itself are always in P(A)'),
    q: `Write P({7}).`, type: 'set', ans: '{∅,{7}}', hint: `Two subsets: don't forget the empty one.`,
    fu: [{ note: `|P(A)| = 2ⁿ counts ∅ and A.`, q: `|P({a, b, c})| = ?`, type: 'exact', ans: ['8'], hint: `2³.` }],
    mcq: [`TRAP: P({7}) = ?`, `{∅, {7}}`, `{{7}}`, `{7}`, `{∅}`] });

  S({ id: 'TM-03', t: 'S', sec: 'Top 10 mistakes', kind: 'mistake', title: `Mistake 3: mixing up equal and equivalent`,
    note: mistake(3, 'Mixing up equal and equivalent sets', 'Equal = same elements; equivalent = same size'),
    q: `{1, 2} and {x, y} are…`, type: 'choice', opts: [`Equivalent, not equal`, `Equal`, `Both`, `Neither`], ans: `Equivalent, not equal`, hint: `Same size? Same elements?`,
    fu: [{ note: `Equal = same elements.`, q: `{2, 1} and {1, 2} are…`, type: 'choice', opts: [`Equal (and so also equivalent)`, `Equivalent only`, `Neither`], ans: `Equal (and so also equivalent)`, hint: `Order doesn't matter.` }],
    mcq: [`TRAP: "Equivalent sets" means…`, `same size`, `same elements`, `disjoint`, `one is a subset of the other`] });

  S({ id: 'TM-04', t: 'S', sec: 'Top 10 mistakes', kind: 'mistake', title: `Mistake 4: thinking F → T or F → F is false`,
    note: mistake(4, 'Thinking F → T or F → F is false', 'Conditional is false only for T → F'),
    q: `Fill in the p → q column for these rows.`, type: 'truthtable', table: tt(['p', 'q', 'p → q'], [['F', 'T'], ['F', 'F']]), ans: ['T', 'T'], hint: `The promise wasn't tested.`,
    fu: [{ note: `Only T → F is false.`, q: `"If pigs fly, then 2 + 2 = 4." is…`, type: 'choice', opts: TF, ans: 'True', hint: `F → T.` }],
    mcq: [`TRAP: F → F is…`, `True`, `False`, `undefined`, `not a proposition`] });

  S({ id: 'TM-05', t: 'S', sec: 'Top 10 mistakes', kind: 'mistake', title: `Mistake 5: using the converse as if equivalent`,
    note: mistake(5, 'Using the converse as if equivalent', 'Only the contrapositive ¬q → ¬p is equivalent'),
    q: `Which is equivalent to "If it's a dog, it's an animal"?`, type: 'choice', opts: [`If it's not an animal, it's not a dog`, `If it's an animal, it's a dog`, `If it's not a dog, it's not an animal`, `It's a dog and an animal`], ans: `If it's not an animal, it's not a dog`, hint: `Contrapositive only.`,
    fu: [{ note: `Converse: q → p. Not equivalent.`, q: `"If it's an animal, it's a dog" is the…`, type: 'choice', opts: ['Converse', 'Contrapositive', 'Inverse', 'Negation'], ans: 'Converse', hint: `Just flipped.` }],
    mcq: [`TRAP: The only form equivalent to p → q is…`, `¬q → ¬p`, `q → p`, `¬p → ¬q`, `q ∧ p`] });

  S({ id: 'TM-06', t: 'S', sec: 'Top 10 mistakes', kind: 'mistake', title: `Mistake 6: ∀x (S(x) ∧ C(x)) for "every student…"`,
    note: mistake(6, 'Writing ∀x (S(x) ∧ C(x)) for "every student…"', 'Use → with ∀, ∧ with ∃'),
    q: `Domain: all people. S(x): x is a student, E(x): x is enrolled. Translate "Every student is enrolled."`, type: 'exact', ans: ['∀x (S(x) → E(x))'], hint: `∀ with →.`,
    fu: [{ note: `∃ with ∧.`, q: `Translate "Some student is enrolled."`, type: 'exact', ans: ['∃x (S(x) ∧ E(x))'], hint: `∃ with ∧.` }],
    mcq: [`TRAP: "Every student is enrolled" (domain: people) =`, `∀x (S(x) → E(x))`, `∀x (S(x) ∧ E(x))`, `∃x (S(x) ∧ E(x))`, `∀x S(x) ∧ E(x)`] });

  S({ id: 'TM-07', t: 'S', sec: 'Top 10 mistakes', kind: 'mistake', title: `Mistake 7: swapping ∀ and ∃ freely`,
    note: mistake(7, 'Swapping ∀ and ∃ freely', 'Order changes meaning; read left to right'),
    q: `L(x,y): x loves y. What does ∃y ∀x L(x,y) mean?`, type: 'choice', opts: [`There is someone whom everybody loves`, `Everybody loves somebody`, `Somebody loves everybody`, `Everybody loves everybody`], ans: `There is someone whom everybody loves`, hint: `y is fixed first.`,
    fu: [{ note: `∀x ∃y: each x has their own y.`, q: `What does ∀x ∃y L(x,y) mean?`, type: 'choice', opts: [`Everybody loves somebody`, `There is someone whom everybody loves`, `Somebody loves everybody`, `Nobody loves anybody`], ans: `Everybody loves somebody`, hint: `Each x picks their own y.` }],
    mcq: [`TRAP: ∀x∃y P(x,y) and ∃y∀x P(x,y) are…`, `different in general`, `always equivalent`, `both always true`, `negations of each other`] });

  S({ id: 'TM-08', t: 'S', sec: 'Top 10 mistakes', kind: 'mistake', title: `Mistake 8: proving a ∀ claim with examples`,
    note: mistake(8, 'Proving a ∀ claim with examples', 'Use an arbitrary element and a general argument'),
    q: `n² + n + 41 is prime for n = 1, 2, …, 39. Does that prove it is prime for all n?`, type: 'choice', opts: [`No: examples never prove a ∀ claim`, `Yes: 39 examples is enough`, `Yes, for n &lt; 100`, `Only if one example is a proof`], ans: `No: examples never prove a ∀ claim`, hint: `Try n = 40.`,
    fu: [{ note: `n = 40: 40² + 40 + 41 = 1681 = 41², not prime.`, q: `Compute n² + n + 41 for n = 40.`, type: 'exact', ans: ['1681'], hint: `1600 + 40 + 41.` }],
    mcq: [`TRAP: To prove a ∀ claim you should…`, `argue for an arbitrary element`, `check many examples`, `check one example`, `find a witness`] });

  S({ id: 'TM-09', t: 'S', sec: 'Top 10 mistakes', kind: 'mistake', title: `Mistake 9: "antisymmetric" = "not symmetric"`,
    note: mistake(9, '"Antisymmetric" = "not symmetric"', 'Different! A relation can be both or neither'),
    q: `R = {(1,1), (2,2)} on {1, 2} is…`, type: 'choice', opts: [`Both symmetric and antisymmetric`, `Symmetric only`, `Antisymmetric only`, `Neither`], ans: `Both symmetric and antisymmetric`, hint: `Only loops.`,
    fu: [{ note: `(1,2),(2,1) breaks antisymmetry; (3,1) without (1,3) breaks symmetry.`, q: `R = {(1,2), (2,1), (3,1)} on {1,2,3} is…`, type: 'choice', opts: [`Neither`, `Symmetric only`, `Antisymmetric only`, `Both`], ans: `Neither`, hint: `Test each property.` }],
    mcq: [`TRAP: A relation that is not symmetric is…`, `not necessarily antisymmetric`, `always antisymmetric`, `always asymmetric`, `always reflexive`] });

  S({ id: 'TM-10', t: 'S', sec: 'Top 10 mistakes', kind: 'mistake', title: `Mistake 10: computing f ∘ g as "f first"`,
    note: mistake(10, 'Computing f ∘ g as "f first"', 'Apply g first, then f'),
    q: `f(x) = x + 1, g(x) = x². (f ∘ g)(3) = ?`, type: 'exact', ans: ['10'], hint: `g(3) = 9 first.`,
    fu: [{ note: `(g ∘ f)(3) = g(f(3)).`, q: `Same f, g. (g ∘ f)(3) = ?`, type: 'exact', ans: ['16'], hint: `f(3) = 4 first.` }],
    mcq: [`TRAP: f(x) = x + 1, g(x) = x². (f ∘ g)(3) = ?`, `10`, `16`, `9`, `4`] });

  var DATA = { version: 1, topics: TOPICS, statements: LIST };
  if (typeof module !== 'undefined' && module.exports) module.exports = DATA;
  else root.DS_DATA = DATA;
})(this);

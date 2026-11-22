/* =========================================================================
   app.js — Discrete Structures · Memorise
   Plain JavaScript single-page app (hash routing, localStorage).
   Screens: home · topic · study · results · quiz · trap quiz · manage
   ========================================================================= */
(function () {
  'use strict';

  /* ---------------------------------------------------------------------
     Storage helpers (every access wrapped: private mode can throw)
     --------------------------------------------------------------------- */
  var KEY = { data: 'ds.data.v1', progress: 'ds.progress.v1', session: 'ds.session.v1', last: 'ds.lastResult.v1', sound: 'ds.sound' };
  function load(k, fallback) { try { var v = localStorage.getItem(k); return v ? JSON.parse(v) : fallback; } catch (e) { return fallback; } }
  function save(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { toast('Could not save (storage full or blocked).'); } }
  function drop(k) { try { localStorage.removeItem(k); } catch (e) { /* ignore */ } }

  /* ---------------------------------------------------------------------
     Data
     --------------------------------------------------------------------- */
  var TOPICS = window.DS_DATA.topics;
  var STATEMENTS, BY_ID;
  function loadData() {
    var custom = load(KEY.data, null);
    STATEMENTS = (custom && Array.isArray(custom.statements)) ? custom.statements : JSON.parse(JSON.stringify(window.DS_DATA.statements));
    BY_ID = {};
    STATEMENTS.forEach(function (s) { BY_ID[s.id] = s; });
  }
  function usingCustom() { return !!load(KEY.data, null); }
  function saveData() { save(KEY.data, { version: 1, statements: STATEMENTS }); loadData(); }
  function topicById(id) { return TOPICS.filter(function (t) { return t.id === id; })[0]; }
  function stmtsOf(topicId) { return STATEMENTS.filter(function (s) { return s.topic === topicId; }); }

  /* ---------------------------------------------------------------------
     Progress
     --------------------------------------------------------------------- */
  var progress = load(KEY.progress, null) || { stmts: {}, quiz: {}, bestStreak: 0, sessions: 0 };
  function saveProgress() { save(KEY.progress, progress); }
  function topicPct(topicId) {
    var list = stmtsOf(topicId); if (!list.length) return 0;
    var sum = list.reduce(function (a, s) { var p = progress.stmts[s.id]; return a + (p ? p.score : 0); }, 0);
    return Math.round(sum / list.length);
  }
  function overallPct() {
    if (!STATEMENTS.length) return 0;
    var sum = STATEMENTS.reduce(function (a, s) { var p = progress.stmts[s.id]; return a + (p ? p.score : 0); }, 0);
    return Math.round(sum / STATEMENTS.length);
  }
  function masteredCount(list) { return (list || STATEMENTS).filter(function (s) { var p = progress.stmts[s.id]; return p && p.status === 'mastered'; }).length; }
  function spaceLabel(p) { return p >= 100 ? 'To the moon' : p >= 70 ? 'Orbit reached' : p >= 40 ? 'In the atmosphere' : p > 0 ? 'Lift-off' : 'On the launch pad'; }

  /* ---------------------------------------------------------------------
     Small utilities
     --------------------------------------------------------------------- */
  var $app = document.getElementById('app');
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  var toastTimer;
  function toast(msg) { var t = document.getElementById('toast'); t.textContent = msg; t.classList.add('show'); clearTimeout(toastTimer); toastTimer = setTimeout(function () { t.classList.remove('show'); }, 2600); }
  function countUp(el, to, suffix) {
    suffix = suffix || '';
    if (reduceMotion) { el.textContent = to + suffix; return; }
    var start = performance.now(), dur = 900;
    function step(now) { var k = Math.min(1, (now - start) / dur); el.textContent = Math.round(to * (1 - Math.pow(1 - k, 3))) + suffix; if (k < 1) requestAnimationFrame(step); }
    requestAnimationFrame(step);
  }
  function animateBars() { setTimeout(function () { document.querySelectorAll('.bar > span[data-w]').forEach(function (b) { b.style.width = b.getAttribute('data-w') + '%'; }); }, 30); }
  function runCounters() { document.querySelectorAll('[data-count]').forEach(function (el) { countUp(el, +el.getAttribute('data-count'), el.getAttribute('data-suffix') || ''); }); }
  var KIND_LABEL = { def: 'Definition', table: 'Definition', example: 'Example', proof: 'Example · proof', tip: 'Memory tip', watch: 'Watch out', quick: 'Quick check', cheat: 'Cheat sheet', mistake: 'Common mistake' };
  function accentClass(t) { return 'acc-' + (t ? t.accent : 'coral'); }
  function topicEyebrow(t) { return t.id === 'S' ? '★ · ' + t.name : 'Chapter ' + t.num + ' · ' + t.name; }

  /* ---------------------------------------------------------------------
     Sound (WebAudio chime; no files)
     --------------------------------------------------------------------- */
  var soundOn = load(KEY.sound, true), actx = null;
  function chime(good) {
    if (!soundOn) return;
    try {
      actx = actx || new (window.AudioContext || window.webkitAudioContext)();
      var notes = good ? [659.25, 987.77] : [220, 196];
      notes.forEach(function (f, i) {
        var o = actx.createOscillator(), g = actx.createGain(), t0 = actx.currentTime + i * 0.09;
        o.type = good ? 'triangle' : 'sine'; o.frequency.value = f;
        g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(0.18, t0 + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.28);
        o.connect(g).connect(actx.destination); o.start(t0); o.stop(t0 + 0.3);
      });
    } catch (e) { /* audio not available */ }
  }
  var soundBtn = document.getElementById('soundToggle');
  function paintSound() { soundBtn.setAttribute('aria-pressed', String(soundOn)); soundBtn.querySelector('span').textContent = soundOn ? 'ON' : 'OFF'; }
  soundBtn.addEventListener('click', function () { soundOn = !soundOn; save(KEY.sound, soundOn); paintSound(); if (soundOn) chime(true); });
  paintSound();

  /* ---------------------------------------------------------------------
     Router
     --------------------------------------------------------------------- */
  var cleanup = null;
  function go(hash) { if (location.hash === hash) render(); else location.hash = hash; }
  function render() {
    if (cleanup) { cleanup(); cleanup = null; }
    var parts = (location.hash.replace(/^#\/?/, '') || '').split('/');
    var view = parts[0] || 'home', arg = decodeURIComponent(parts[1] || '');
    document.querySelectorAll('[data-nav]').forEach(function (a) { a.classList.toggle('active', a.getAttribute('data-nav') === view || (view === 'home' && a.getAttribute('data-nav') === 'home')); });
    if (view === 'topic' && topicById(arg)) viewTopic(arg);
    else if (view === 'study') viewStudy();
    else if (view === 'results') viewResults();
    else if (view === 'quiz' && topicById(arg)) viewQuiz(arg, false);
    else if (view === 'trap') viewQuiz(arg || null, true);
    else if (view === 'manage') viewManage(arg);
    else viewHome();
    window.scrollTo(0, 0);
  }
  window.addEventListener('hashchange', render);

  /* =====================================================================
     HOME
     ===================================================================== */
  function viewHome() {
    var sess = load(KEY.session, null);
    var pct = overallPct();
    var html = '<section class="hero">' +
      '<p class="eyebrow enter">Discrete Structures</p>' +
      '<h1 class="enter-2">Memorise beyond <span class="nowrap">expectations.</span></h1>' +
      '<p class="lead enter-3">Every screen pairs a note with questions about it. Read the note, launch the test, and climb from the launch pad to the moon, one chapter at a time.</p>' +
      '<div class="row enter-3"><button class="btn" id="startBtn">' + (sess ? 'Resume session' : 'Start studying') + ' <span aria-hidden="true">🚀</span></button>' +
      '<a class="link" href="#/trap">Trap quiz</a></div>' +
      (sess ? '<p class="resume">Session in progress: <b>' + esc(topicEyebrow(topicById(sess.topic))) + '</b> · <button class="link back" id="dropSess" style="padding:0;min-height:0">discard it</button></p>' : '') +
      '</section>' +
      '<section class="stats" aria-label="Your stats">' +
      stat(pct, '%', 'Overall memorised') + stat(masteredCount(), '', 'Statements mastered') +
      stat(progress.bestStreak || 0, '', 'Best quiz streak') + stat(progress.sessions || 0, '', 'Sessions done') + '</section>' +
      '<section class="overall acc-coral"><div class="row between"><span class="eyebrow" style="margin:0">' + spaceLabel(pct) + '</span><span class="eyebrow" style="margin:0;color:var(--white)">' + pct + '% of the subject</span></div>' +
      '<div class="bar"><span data-w="' + pct + '"></span></div></section>' +
      '<h2>Choose your mission</h2><section class="topics">' + TOPICS.map(topicCard).join('') + '</section>' +
      '<section class="card trapcard"><p class="eyebrow" style="color:var(--bad)">Trap quiz</p><h3>Only the traps: every WATCH OUT box + the Top 10 mistakes</h3>' +
      '<p>20 seconds per question. Keep your streak alive.</p><div class="row"><a class="btn" href="#/trap">Launch trap quiz</a></div></section>';
    $app.innerHTML = html;
    document.getElementById('startBtn').onclick = function () {
      if (sess) { go('#/study'); return; }
      var next = TOPICS.filter(function (t) { return topicPct(t.id) < 100; })[0] || TOPICS[0];
      go('#/topic/' + encodeURIComponent(next.id));
    };
    var d = document.getElementById('dropSess');
    if (d) d.onclick = function () { if (confirm('Discard the session in progress?')) { drop(KEY.session); render(); } };
    runCounters(); animateBars();
  }
  function stat(n, suffix, label) { return '<div class="stat"><div class="num" data-count="' + n + '" data-suffix="' + suffix + '">0' + suffix + '</div><div class="lbl">' + label + '</div></div>'; }
  function topicCard(t) {
    var list = stmtsOf(t.id), p = topicPct(t.id);
    return '<article class="card topic ' + accentClass(t) + '"><div class="head"><div class="num">' + esc(t.num) + '</div><div><h3>' + esc(t.name) + '</h3><p>' + esc(t.sub) + '</p></div></div>' +
      '<div class="meta"><span>' + spaceLabel(p) + '</span><span style="color:var(--white)">' + p + '%</span></div>' +
      '<div class="bar"><span data-w="' + p + '"></span></div>' +
      '<div class="meta"><span>' + list.length + ' statements</span><span>' + masteredCount(list) + ' mastered</span></div>' +
      '<div class="row"><a class="btn small" href="#/topic/' + encodeURIComponent(t.id) + '">Launch session</a><a class="link" href="#/quiz/' + encodeURIComponent(t.id) + '">Quiz</a></div></article>';
  }

  /* =====================================================================
     TOPIC PAGE
     ===================================================================== */
  function viewTopic(tid) {
    var t = topicById(tid), list = stmtsOf(tid), p = topicPct(tid);
    var html = '<a class="link back" href="#/">Back to base</a>' +
      '<section class="hero ' + accentClass(t) + '" style="padding-top:10px"><p class="eyebrow enter">' + esc(topicEyebrow(t)) + '</p><h1 class="enter-2">' + esc(t.name) + '</h1>' +
      '<p class="lead enter-3">' + esc(t.sub) + '</p>' +
      '<div class="row between" style="max-width:520px"><span class="tag">' + spaceLabel(p) + '</span><span class="eyebrow" style="margin:0;color:var(--white)">' + p + '% memorised</span></div>' +
      '<div class="bar" style="max-width:520px;margin-top:8px"><span data-w="' + p + '"></span></div>' +
      '<div class="row" style="margin-top:20px"><button class="btn" id="allBtn">Launch full session (' + list.length + ')</button>' +
      '<button class="btn ghost" id="tenBtn">Quick launch: next 10</button><a class="link" href="#/quiz/' + encodeURIComponent(tid) + '">Quiz mode</a></div>' +
      '<p style="font-size:.92rem">Full session = every statement in note order. Quick launch picks “needs review” first, then statements you haven’t seen.</p></section>' +
      '<h2>Statements</h2><ul class="slist">' + list.map(function (s) {
        var pr = progress.stmts[s.id], cls = pr ? (pr.status === 'mastered' ? 'm' : 'r') : '';
        var st = pr ? (pr.status === 'mastered' ? '<span class="ok-text">✔ ' + pr.score + '%</span>' : '<span class="bad-text">↻ review</span>') : '<span>new</span>';
        return '<li><span class="dot ' + cls + '" aria-hidden="true"></span><span style="flex:1">' + s.title + '</span>' + st + '</li>';
      }).join('') + '</ul>';
    $app.innerHTML = html;
    document.getElementById('allBtn').onclick = function () { startSession(tid, list.map(function (s) { return s.id; })); };
    document.getElementById('tenBtn').onclick = function () {
      var order = list.map(function (s, i) {
        var pr = progress.stmts[s.id], pri = !pr ? 1 : pr.status === 'review' ? 0 : 2;
        return { id: s.id, pri: pri, score: pr ? pr.score : 0, i: i };
      }).sort(function (a, b) { return a.pri - b.pri || a.score - b.score || a.i - b.i; }).slice(0, 10).sort(function (a, b) { return a.i - b.i; });
      startSession(tid, order.map(function (o) { return o.id; }));
    };
    animateBars();
  }

  /* =====================================================================
     STUDY SESSION ENGINE
     A session walks every statement (main item + follow-ups). Each item:
     NOTE phase → ANSWER phase → CHECK (≤ 3 attempts) → next item.
     ===================================================================== */
  var POINTS = [100, 60, 30];
  var S = null;        // current session (persisted)
  var live = null;     // per-item UI state (not persisted)
  function startSession(topic, ids) {
    var existing = load(KEY.session, null);
    if (existing && !confirm('This replaces your session in progress. Continue?')) return;
    S = { topic: topic, ids: ids, round: 1, pos: 0, sub: 0, phase: 'note', attempts: 0, roundRes: {}, first: {}, final: {}, started: Date.now() };
    save(KEY.session, S);
    go('#/study');
  }
  function itemsCount(ids) { return ids.reduce(function (a, id) { var s = BY_ID[id]; return a + (s ? 1 + s.followUps.length : 0); }, 0); }
  function itemIndex() { return itemsCount(S.ids.slice(0, S.pos)) + S.sub + 1; }
  function curStmt() { return BY_ID[S.ids[S.pos]]; }
  function curItem() { var s = curStmt(); return S.sub === 0 ? s : s.followUps[S.sub - 1]; }
  function persist() { save(KEY.session, S); }

  function viewStudy() {
    S = load(KEY.session, null);
    if (!S) { go('#/'); return; }
    // drop statements that were deleted in Manage Notes
    S.ids = S.ids.filter(function (id) { return BY_ID[id]; });
    if (S.pos >= S.ids.length) { finishRound(); return; }
    if (S.sub > curStmt().followUps.length) S.sub = 0;
    live = { resp: null };
    if (S.phase === 'checked') { advance(); return; } // reload after grading → move on
    if (S.phase !== 'note') S.phase = 'answer';     // reload mid-question → back to answering
    S.attempts = S.attempts || 0;
    drawStudy(false);
  }

  function studyFrame(inner) {
    var t = topicById(S.topic), total = itemsCount(S.ids), idx = itemIndex();
    return '<div class="stage ' + accentClass(t) + '">' +
      '<div class="stage-top"><span class="eyebrow" style="margin:0">' + esc(topicEyebrow(t)) + (S.round > 1 ? ' · <span style="color:var(--bad)">Review round</span>' : '') + '</span>' +
      '<button class="link" id="endBtn">End session</button></div>' +
      '<div class="bar progress-line"><span style="width:' + Math.round(((idx - 1) / Math.max(total, 1)) * 100) + '%"></span></div>' +
      inner + '</div>';
  }

  function drawStudy(animate) {
    var st = curStmt(), it = curItem(), isFu = S.sub > 0, total = itemsCount(S.ids), idx = itemIndex();
    var label = isFu ? 'Follow-up ' + S.sub + ' of ' + st.followUps.length : (KIND_LABEL[st.kind] || 'Note');
    var inner;
    if (S.phase === 'note') {
      inner = '<article class="qcard ' + (animate ? 'arrive' : 'arrive') + '" id="qcard" aria-live="polite">' +
        '<p class="eyebrow">Note ' + idx + ' of ' + total + '</p>' +
        '<span class="kind ' + (isFu ? 'q' : st.kind) + '">' + label + '</span>' +
        '<h2 class="note-title">' + (isFu ? 'Follow-up · ' : '') + st.title + '</h2>' +
        '<div class="note">' + it.note + '</div>' +
        '<div class="actions"><span class="attempts">Read carefully. The note hides when the test starts.</span>' +
        '<button class="btn" id="readBtn">I’ve read it, test me <span aria-hidden="true">🚀</span></button></div></article>';
    } else {
      inner = '<article class="qcard arrive" id="qcard">' +
        '<p class="eyebrow">Question ' + idx + ' of ' + total + '</p>' +
        '<span class="kind q">' + (isFu ? label : 'Question') + '</span>' +
        '<div class="question">' + it.question + '</div>' +
        '<div class="answer-wrap" id="answerWrap">' + answerWidget(it) + '</div>' +
        '<div id="fb" aria-live="polite"></div>' +
        '<div class="actions" id="acts"><span class="attempts" id="att">Attempt ' + Math.min(S.attempts + 1, 3) + ' of 3</span>' +
        '<button class="btn" id="checkBtn">Check</button></div></article>';
    }
    $app.innerHTML = studyFrame(inner);
    document.getElementById('endBtn').onclick = function () {
      if (confirm('End this session now? Statements you finished are saved.')) finishSession(true);
    };
    if (S.phase === 'note') {
      document.getElementById('readBtn').onclick = function () {
        var card = document.getElementById('qcard');
        var proceed = function () { S.phase = 'answer'; S.attempts = 0; persist(); live = { resp: null }; drawStudy(true); focusAnswer(); };
        if (reduceMotion) proceed(); else { card.classList.add('launch'); setTimeout(proceed, 340); }
      };
      document.getElementById('readBtn').focus({ preventScroll: true });
    } else {
      bindAnswerWidget(it, doCheck);
      document.getElementById('checkBtn').onclick = doCheck;
    }
  }
  function focusAnswer() { var a = document.querySelector('.answer'); if (a) a.focus({ preventScroll: true }); }

  function doCheck() {
    var it = curItem(), resp = collect(it);
    if (resp === null) { toast(it.type === 'truthtable' ? 'Fill every T/F cell first.' : it.type === 'choice' ? 'Pick an option first.' : 'Type an answer first.'); return; }
    var res = window.Checker.check(it, resp);
    S.attempts += 1;
    var verdict = res.verdict, done = verdict === 'correct' || S.attempts >= 3;
    paintCells(it, res);
    var fb = document.getElementById('fb'), acts = document.getElementById('acts');
    fb.innerHTML = feedbackHTML(it, res, done);
    chime(verdict === 'correct');
    if (done) {
      var score = verdict === 'correct' ? POINTS[S.attempts - 1] : 0;
      record(score, verdict !== 'correct');
      lockWidget();
      acts.innerHTML = '<span class="attempts">' + (verdict === 'correct' ? '+' + score + '% for this question' : 'Marked “needs review”') + '</span><button class="btn" id="nextBtn">Next <span aria-hidden="true">→</span></button>';
      var nb = document.getElementById('nextBtn'); nb.onclick = advance; nb.focus({ preventScroll: true });
      S.phase = 'checked'; persist();
    } else {
      document.getElementById('att').textContent = 'Attempt ' + (S.attempts + 1) + ' of 3';
      document.getElementById('checkBtn').textContent = 'Check again';
      persist();
    }
  }

  function record(score, failed) {
    var id = S.ids[S.pos], r = S.roundRes[id] || (S.roundRes[id] = { scores: [], failed: false });
    r.scores[S.sub] = score; if (failed) r.failed = true;
  }

  function advance() {
    var st = curStmt();
    if (S.sub < st.followUps.length) { S.sub += 1; }
    else {
      // statement finished: save its result
      var r = S.roundRes[st.id] || { scores: [100], failed: false };
      var sc = r.scores.filter(function (x) { return typeof x === 'number'; });
      var score = Math.round(sc.reduce(function (a, b) { return a + b; }, 0) / Math.max(sc.length, 1));
      progress.stmts[st.id] = { score: score, status: r.failed ? 'review' : 'mastered', t: Date.now() };
      saveProgress();
      if (S.round === 1) S.first[st.id] = { score: score, failed: r.failed };
      S.final[st.id] = { score: score, failed: r.failed };
      S.pos += 1; S.sub = 0;
    }
    S.phase = 'note'; S.attempts = 0; persist();
    if (S.pos >= S.ids.length) finishRound(); else drawStudy(true);
  }

  function finishRound() {
    var failed = S.ids.filter(function (id) { return S.roundRes[id] && S.roundRes[id].failed; });
    if (failed.length && S.round < 2) {
      S.round += 1; S.ids = failed; S.pos = 0; S.sub = 0; S.phase = 'note'; S.attempts = 0; S.roundRes = {};
      persist(); toast('Review round: ' + failed.length + ' statement' + (failed.length > 1 ? 's' : '') + ' to repeat.');
      drawStudy(true); return;
    }
    finishSession(false);
  }

  function finishSession(early) {
    var firstIds = Object.keys(S.first);
    var score = firstIds.length ? Math.round(firstIds.reduce(function (a, id) { return a + S.first[id].score; }, 0) / firstIds.length) : 0;
    var mastered = [], review = [];
    Object.keys(S.final).forEach(function (id) { (S.final[id].failed ? review : mastered).push(id); });
    progress.sessions = (progress.sessions || 0) + 1; saveProgress();
    save(KEY.last, { topic: S.topic, score: score, mastered: mastered, review: review, early: early, done: firstIds.length });
    drop(KEY.session); S = null;
    go('#/results');
  }

  /* ---------- answer widgets ---------- */
  var SYMBOLS = ['∈', '∉', '⊆', '⊂', '∪', '∩', '−', '⊕', '′', '∅', '×', 'ℕ', 'ℤ', 'ℚ', 'ℝ', '¬', '∧', '∨', '→', '↔', '≡', '∀', '∃', '⊙', '{', '}', '(', ')', ','];
  function toolbarHTML() {
    return '<div class="toolbar" role="group" aria-label="Math symbols">' + SYMBOLS.map(function (s) { return '<button type="button" data-sym="' + esc(s) + '" aria-label="Insert ' + esc(s) + '">' + esc(s) + '</button>'; }).join('') + '</div>' +
      '<p class="ascii-help">You can also type: <code>in</code> <code>subset</code> <code>U</code> <code>n</code> <code>not</code>/<code>~</code> <code>and</code>/<code>&amp;</code> <code>or</code>/<code>|</code> <code>-&gt;</code> <code>&lt;-&gt;</code> <code>forall</code> <code>exists</code> <code>{}</code>/<code>empty</code> <code>\'</code> (complement)</p>';
  }
  function answerWidget(it) {
    if (it.type === 'explain') return '<label class="sr-only" for="ans">Your answer</label><textarea class="answer" id="ans" placeholder="Explain in your own words…"></textarea>' + toolbarHTML() + '<p class="ascii-help">Ctrl/⌘ + Enter to check</p>';
    if (it.type === 'exact' || it.type === 'set') {
      return '<label class="sr-only" for="ans">Your answer</label><input class="answer" id="ans" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="' + (it.type === 'set' ? 'e.g. {1, 2, 3} or {(a,1), (b,2)}' : 'Type your answer') + '">' +
        '<div class="preview" id="pv"></div>' + toolbarHTML();
    }
    if (it.type === 'choice') {
      var multi = Array.isArray(it.answer);
      return (multi ? '<p class="attempts">Select all that apply</p>' : '') + '<div class="choices' + (it.options.length > 3 && it.options.every(function (o) { return o.length < 30; }) ? ' cols' : '') + '" role="group">' +
        it.options.map(function (o, i) { return '<button type="button" class="choice' + (multi ? ' multi' : '') + '" data-i="' + i + '" aria-pressed="false"><span class="box" aria-hidden="true"></span><span>' + o + '</span></button>'; }).join('') + '</div>';
    }
    if (it.type === 'truthtable') {
      var cols = it.table.cols;
      return '<p class="attempts">Tap a cell to cycle T / F</p><div class="tt-scroll"><table class="tt"><thead><tr>' + cols.map(function (c, i) { return '<th' + (i === cols.length - 1 ? ' style="color:var(--yellow)"' : '') + '>' + c + '</th>'; }).join('') + '</tr></thead><tbody>' +
        it.table.rows.map(function (r, i) { return '<tr>' + r.map(function (v) { return '<td>' + v + '</td>'; }).join('') + '<td><button type="button" class="cell" data-r="' + i + '" aria-label="Row ' + (i + 1) + ' result">?</button></td></tr>'; }).join('') + '</tbody></table></div>';
    }
    if (it.type === 'matrix') {
      return '<p class="attempts">Tap a cell to toggle 0 / 1</p><div class="tt-scroll"><table class="grid"><thead><tr><th></th>' + it.grid.cols.map(function (c) { return '<th>' + c + '</th>'; }).join('') + '</tr></thead><tbody>' +
        it.grid.rows.map(function (r, i) { return '<tr><th>' + r + '</th>' + it.grid.cols.map(function (c, j) { return '<td><button type="button" class="cell" data-r="' + i + '" data-c="' + j + '" aria-label="Row ' + esc(r) + ', column ' + esc(c) + '">0</button></td>'; }).join('') + '</tr>'; }).join('') + '</tbody></table></div>';
    }
    return '';
  }
  var lastInput = null;
  function bindAnswerWidget(it, onSubmit) {
    var wrap = document.getElementById('answerWrap');
    live = live || { resp: null };
    var input = document.getElementById('ans');
    if (input) {
      lastInput = input;
      input.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' && (input.tagName === 'INPUT' || e.ctrlKey || e.metaKey)) { e.preventDefault(); onSubmit(); }
      });
      var pv = document.getElementById('pv');
      if (pv) input.addEventListener('input', function () {
        var conv = window.Checker.toSymbols(input.value);
        pv.innerHTML = conv.trim() && conv !== input.value ? 'Reads as: <b>' + esc(conv) + '</b>' : '';
      });
    }
    wrap.querySelectorAll('[data-sym]').forEach(function (b) {
      b.addEventListener('mousedown', function (e) { e.preventDefault(); }); // keep caret in input
      b.addEventListener('click', function () { insertAtCaret(lastInput, b.getAttribute('data-sym')); });
    });
    if (it.type === 'choice') {
      var multi = Array.isArray(it.answer);
      wrap.querySelectorAll('.choice').forEach(function (b) {
        b.addEventListener('click', function () {
          if (b.disabled) return;
          if (!multi) wrap.querySelectorAll('.choice').forEach(function (o) { o.setAttribute('aria-pressed', 'false'); o.querySelector('.box').textContent = ''; });
          var on = b.getAttribute('aria-pressed') !== 'true' || !multi;
          b.setAttribute('aria-pressed', String(on)); b.querySelector('.box').textContent = on ? '✔' : '';
        });
      });
    }
    if (it.type === 'truthtable') wrap.querySelectorAll('.cell').forEach(function (c) {
      c.addEventListener('click', function () { c.classList.remove('bad', 'good'); c.textContent = c.textContent === 'T' ? 'F' : 'T'; c.classList.toggle('on', c.textContent === 'T'); });
    });
    if (it.type === 'matrix') wrap.querySelectorAll('.cell').forEach(function (c) {
      c.addEventListener('click', function () { c.classList.remove('bad', 'good'); c.textContent = c.textContent === '1' ? '0' : '1'; c.classList.toggle('on', c.textContent === '1'); });
    });
  }
  function insertAtCaret(el, text) {
    if (!el) return;
    var s = el.selectionStart != null ? el.selectionStart : el.value.length, e = el.selectionEnd != null ? el.selectionEnd : el.value.length;
    el.value = el.value.slice(0, s) + text + el.value.slice(e);
    el.focus(); el.setSelectionRange(s + text.length, s + text.length);
    el.dispatchEvent(new Event('input'));
  }
  function collect(it) {
    var wrap = document.getElementById('answerWrap');
    if (it.type === 'explain' || it.type === 'exact' || it.type === 'set') { var v = document.getElementById('ans').value; return v.trim() ? v : null; }
    if (it.type === 'choice') {
      var sel = []; wrap.querySelectorAll('.choice[aria-pressed="true"]').forEach(function (b) { sel.push(it.options[+b.getAttribute('data-i')]); });
      if (!sel.length) return null; return Array.isArray(it.answer) ? sel : sel[0];
    }
    if (it.type === 'truthtable') {
      var vals = []; wrap.querySelectorAll('.cell').forEach(function (c) { vals.push(c.textContent); });
      return vals.indexOf('?') >= 0 ? null : vals;
    }
    if (it.type === 'matrix') {
      var m = it.grid.rows.map(function () { return []; });
      wrap.querySelectorAll('.cell').forEach(function (c) { m[+c.getAttribute('data-r')][+c.getAttribute('data-c')] = +c.textContent; });
      return m;
    }
    return null;
  }
  function paintCells(it, res) {
    var wrap = document.getElementById('answerWrap');
    if (it.type === 'truthtable') wrap.querySelectorAll('.cell').forEach(function (c, i) { var bad = res.wrongCells.indexOf(i) >= 0; c.classList.toggle('bad', bad); c.classList.toggle('good', !bad); if (bad) c.setAttribute('aria-label', 'Row ' + (i + 1) + ': wrong'); });
    if (it.type === 'matrix') wrap.querySelectorAll('.cell').forEach(function (c) {
      var r = +c.getAttribute('data-r'), k = +c.getAttribute('data-c');
      var bad = res.wrongCells.some(function (w) { return w[0] === r && w[1] === k; });
      c.classList.toggle('bad', bad); c.classList.toggle('good', !bad);
    });
  }
  function lockWidget() {
    var wrap = document.getElementById('answerWrap'); if (!wrap) return;
    wrap.querySelectorAll('button').forEach(function (b) { b.disabled = true; });
    var a = document.getElementById('ans'); if (a) a.readOnly = true;
  }
  var VERDICT = { correct: ['✔', 'Correct'], almost: ['≈', 'Almost'], wrong: ['✘', 'Wrong'] };
  function feedbackHTML(it, res, done) {
    var v = res.verdict, h = '<div class="feedback ' + v + '"><div class="verdict"><span class="ico" aria-hidden="true">' + VERDICT[v][0] + '</span>' + VERDICT[v][1] + (it.type === 'explain' ? ' · ' + res.pct + '% of key ideas' : '') + '</div>';
    if (it.type === 'explain') {
      h += '<div class="chips">' + res.found.map(function (k) { return '<span class="chip hit">' + esc(k) + '</span>'; }).join('') +
        res.missed.map(function (k) { return '<span class="chip miss">' + esc(k) + '</span>'; }).join('') + '</div>';
    }
    if (it.type === 'set' && v !== 'correct') {
      if (res.unreadable) h += '<p>I couldn’t read that as a set. Use braces and commas, e.g. {1, 2} or {(a,1), (b,2)}.</p>';
      else {
        var bits = [];
        if (res.missingCount) bits.push(res.missingCount + ' element' + (res.missingCount > 1 ? 's are' : ' is') + ' missing');
        if (res.extra.length) bits.push('these shouldn’t be there: ' + esc(res.extra.join(', ')));
        h += '<p>' + bits.join('; ') + '.</p>';
      }
    }
    if ((it.type === 'truthtable' || it.type === 'matrix') && v !== 'correct') h += '<p>' + res.wrongCells.length + ' cell' + (res.wrongCells.length > 1 ? 's are' : ' is') + ' wrong (outlined in red).</p>';
    if (!done) h += '<p><b>Hint:</b> ' + it.hint + '</p><p style="color:var(--text)">Edit your answer and check again.</p>';
    if (done) {
      if (v !== 'correct') h += '<span class="review-flag">↻ Needs review</span>';
      if (v !== 'correct' || it.type === 'explain') h += '<div class="reveal"><div class="lbl">' + (v === 'correct' ? 'Reference answer' : 'The answer') + '</div>' + answerHTML(it) + '</div>';
      h += '<div class="reveal"><div class="lbl">The original note</div><div class="note">' + it.note + '</div></div>';
    }
    return h + '</div>';
  }
  function answerHTML(it) {
    var a = it.answer;
    if (it.type === 'exact') return '<p>' + esc(a[0]) + (a.length > 1 ? ' <span style="color:var(--muted)">(also accepted: ' + esc(a.slice(1).join(' · ')) + ')</span>' : '') + '</p>';
    if (it.type === 'choice') return '<p>' + (Array.isArray(a) ? a.join(', ') : a) + '</p>';
    if (it.type === 'truthtable') return '<table class="tt"><thead><tr>' + it.table.cols.map(function (c) { return '<th>' + c + '</th>'; }).join('') + '</tr></thead><tbody>' +
      it.table.rows.map(function (r, i) { return '<tr>' + r.map(function (x) { return '<td>' + x + '</td>'; }).join('') + '<td><b>' + a[i] + '</b></td></tr>'; }).join('') + '</tbody></table>';
    if (it.type === 'matrix') return '<table class="mx"><thead><tr><th></th>' + it.grid.cols.map(function (c) { return '<th>' + c + '</th>'; }).join('') + '</tr></thead><tbody>' +
      a.map(function (r, i) { return '<tr><th>' + it.grid.rows[i] + '</th>' + r.map(function (x) { return '<td class="' + (x ? 'one' : '') + '">' + x + '</td>'; }).join('') + '</tr>'; }).join('') + '</tbody></table>';
    return '<p>' + esc(a) + '</p>';
  }

  /* =====================================================================
     RESULTS
     ===================================================================== */
  function viewResults() {
    var r = load(KEY.last, null);
    if (!r) { go('#/'); return; }
    var t = topicById(r.topic), tp = topicPct(r.topic);
    function li(id) { var s = BY_ID[id]; return s ? '<li>' + s.title + '</li>' : ''; }
    $app.innerHTML = '<div class="stage ' + accentClass(t) + '"><p class="eyebrow enter">' + esc(topicEyebrow(t)) + ' · Mission report</p>' +
      '<div class="big-pct enter-2" data-count="' + r.score + '" data-suffix="%">0%</div>' +
      '<h2 class="enter-3">' + spaceLabel(r.score) + (r.score >= 70 ? '!' : '') + '</h2>' +
      '<p class="lead">Session score (first try) across ' + r.done + ' statement' + (r.done === 1 ? '' : 's') + (r.early ? ', session ended early' : '') + '. ' +
      'This chapter is now <b>' + tp + '% memorised</b>.</p><div class="bar" style="margin:10px 0 24px"><span data-w="' + tp + '"></span></div>' +
      '<details class="acc" open><summary><span class="ok-text">✔ Mastered (' + r.mastered.length + ')</span></summary><ul>' + (r.mastered.map(li).join('') || '<li>None yet</li>') + '</ul></details>' +
      '<details class="acc"' + (r.review.length ? ' open' : '') + '><summary><span class="bad-text">↻ Needs review (' + r.review.length + ')</span></summary><ul>' + (r.review.map(li).join('') || '<li>Nothing. Clean flight!</li>') + '</ul></details>' +
      '<div class="row" style="margin-top:20px">' + (r.review.length ? '<button class="btn" id="againBtn">Review these again</button>' : '') +
      '<a class="btn ghost" href="#/topic/' + encodeURIComponent(r.topic) + '">Chapter page</a><a class="link" href="#/">Back to base</a></div></div>';
    var ab = document.getElementById('againBtn');
    if (ab) ab.onclick = function () { startSession(r.topic, r.review.filter(function (id) { return BY_ID[id]; })); };
    runCounters(); animateBars();
  }

  /* =====================================================================
     QUIZ (MCQ game) and TRAP QUIZ
     ===================================================================== */
  var QUIZ_SECONDS = 20;
  function viewQuiz(tid, trap) {
    var pool = trap ? STATEMENTS.filter(function (s) { return (s.kind === 'watch' || s.kind === 'mistake') && (!tid || s.topic === tid); }) : stmtsOf(tid);
    pool = pool.filter(function (s) { return s.mcq && s.mcq.options && s.mcq.options.length >= 2; });
    var t = trap ? null : topicById(tid);
    var Q = { list: shuffle(pool).map(function (s) {
      var opts = s.mcq.options.map(function (o, i) { return { text: o, ok: i === s.mcq.answer }; });
      return { id: s.id, q: s.mcq.question, opts: shuffle(opts) };
    }), i: 0, right: 0, streak: 0, best: 0, missed: [] };
    var timer = null, t0 = 0, answered = false;
    cleanup = function () { clearInterval(timer); };
    var title = trap ? 'Trap quiz' : t.name, eyebrow = trap ? 'Watch outs + Top 10 mistakes' : topicEyebrow(t), acc = trap ? 'acc-coral' : accentClass(t);
    if (!Q.list.length) { $app.innerHTML = '<p>No questions here yet.</p><a class="link back" href="#/">Back</a>'; return; }

    function draw() {
      answered = false;
      var item = Q.list[Q.i];
      $app.innerHTML = '<div class="stage ' + acc + '"><div class="stage-top"><span class="eyebrow" style="margin:0">' + esc(eyebrow) + ' · Q ' + (Q.i + 1) + ' / ' + Q.list.length + '</span>' +
        '<span class="streak" aria-live="polite">🔥 Streak ' + Q.streak + '</span></div>' +
        '<div class="timer" id="timer" role="progressbar" aria-label="Time left" aria-valuemin="0" aria-valuemax="' + QUIZ_SECONDS + '"><span id="tbar"></span></div>' +
        '<article class="qcard arrive"><span class="kind q">' + esc(title) + '</span><div class="question">' + esc(item.q) + '</div>' +
        '<div class="answer-wrap"><div class="choices" id="opts">' + item.opts.map(function (o, k) { return '<button type="button" class="choice" data-k="' + k + '"><span class="box" aria-hidden="true">' + 'ABCD'[k] + '</span><span>' + esc(o.text) + '</span></button>'; }).join('') + '</div></div>' +
        '<div id="fb" aria-live="polite"></div><div class="actions"><span class="attempts">' + QUIZ_SECONDS + ' seconds per question</span><button class="link" id="quitBtn">Stop quiz</button></div></article></div>';
      document.querySelectorAll('#opts .choice').forEach(function (b) { b.onclick = function () { pick(+b.getAttribute('data-k')); }; });
      document.getElementById('quitBtn').onclick = function () { clearInterval(timer); end(true); };
      t0 = Date.now(); clearInterval(timer);
      var bar = document.getElementById('tbar'), tbox = document.getElementById('timer');
      timer = setInterval(function () {
        var left = Math.max(0, QUIZ_SECONDS - (Date.now() - t0) / 1000);
        bar.style.width = (left / QUIZ_SECONDS * 100) + '%'; tbox.classList.toggle('low', left < 5); tbox.setAttribute('aria-valuenow', Math.ceil(left));
        if (left <= 0) { clearInterval(timer); pick(-1); }
      }, 100);
    }
    function pick(k) {
      if (answered) return; answered = true; clearInterval(timer);
      var item = Q.list[Q.i], ok = k >= 0 && item.opts[k].ok;
      document.querySelectorAll('#opts .choice').forEach(function (b, j) {
        b.disabled = true;
        if (item.opts[j].ok) b.classList.add('is-correct');
        else if (j === k) b.classList.add('is-wrong');
      });
      if (ok) { Q.right++; Q.streak++; Q.best = Math.max(Q.best, Q.streak); popFx(Q.streak > 1 ? '🔥 ' + Q.streak : '+1'); }
      else { Q.streak = 0; Q.missed.push(item); }
      var topStreak = document.querySelector('.stage-top .streak'); if (topStreak) topStreak.textContent = '🔥 Streak ' + Q.streak;
      chime(ok);
      var correct = item.opts.filter(function (o) { return o.ok; })[0].text, s = BY_ID[item.id];
      document.getElementById('fb').innerHTML = '<div class="feedback ' + (ok ? 'correct' : 'wrong') + '"><div class="verdict"><span class="ico" aria-hidden="true">' + (ok ? '✔' : '✘') + '</span>' +
        (ok ? 'Correct' : k < 0 ? 'Time’s up' : 'Wrong') + '</div>' + (ok ? '' : '<p>Correct answer: <b>' + esc(correct) + '</b></p>') +
        '<p style="color:var(--text)">From: ' + (s ? s.title : '') + '</p></div>';
      var acts = document.querySelector('.actions');
      acts.innerHTML = '<span class="streak">🔥 Streak ' + Q.streak + '</span><button class="btn" id="qNext">' + (Q.i + 1 < Q.list.length ? 'Next' : 'Finish') + ' <span aria-hidden="true">→</span></button>';
      var nb = document.getElementById('qNext'); nb.focus({ preventScroll: true });
      nb.onclick = function () { Q.i++; if (Q.i < Q.list.length) draw(); else end(false); };
    }
    function end(early) {
      var asked = early ? Q.i + (answered ? 1 : 0) : Q.list.length;
      var pct = asked ? Math.round(Q.right / asked * 100) : 0, key = trap ? 'trap' : tid;
      var prev = progress.quiz[key] || { best: 0, streak: 0 };
      progress.quiz[key] = { best: Math.max(prev.best, early ? prev.best : pct), streak: Math.max(prev.streak, Q.best), last: pct };
      progress.bestStreak = Math.max(progress.bestStreak || 0, Q.best); saveProgress();
      $app.innerHTML = '<div class="stage ' + acc + '"><p class="eyebrow enter">' + esc(eyebrow) + ' · Quiz report</p>' +
        '<div class="big-pct enter-2" data-count="' + pct + '" data-suffix="%">0%</div><h2 class="enter-3">' + spaceLabel(pct) + '</h2>' +
        '<p class="lead">' + Q.right + ' of ' + asked + ' correct · best streak <b>' + Q.best + '</b> · all-time best streak <b>' + progress.bestStreak + '</b></p>' +
        '<details class="acc"' + (Q.missed.length ? ' open' : '') + '><summary><span class="bad-text">✘ Missed (' + Q.missed.length + ')</span></summary><ul>' +
        (Q.missed.map(function (m) { var c = m.opts.filter(function (o) { return o.ok; })[0].text; return '<li>' + esc(m.q) + '<br><span class="ok-text">→ ' + esc(c) + '</span></li>'; }).join('') || '<li>None. Perfect flight!</li>') + '</ul></details>' +
        '<div class="row" style="margin-top:20px"><button class="btn" id="again">Play again</button>' + (trap ? '' : '<a class="btn ghost" href="#/topic/' + encodeURIComponent(tid) + '">Study this chapter</a>') + '<a class="link" href="#/">Back to base</a></div></div>';
      document.getElementById('again').onclick = function () { render(); };
      runCounters();
    }
    function popFx(text) {
      if (reduceMotion) return;
      var p = document.createElement('div'); p.className = 'pop'; p.textContent = text; p.setAttribute('aria-hidden', 'true');
      document.body.appendChild(p); setTimeout(function () { p.remove(); }, 950);
    }
    draw();
  }

  /* =====================================================================
     MANAGE NOTES (add / edit / delete / export / import)
     ===================================================================== */
  var TYPES = ['explain', 'exact', 'set', 'truthtable', 'matrix', 'choice'];
  var KINDS = Object.keys(KIND_LABEL);
  var mgr = { topic: '', q: '' };
  function viewManage(editId) {
    if (editId) { viewEdit(editId === '__new' ? null : editId); return; }
    var list = STATEMENTS.filter(function (s) {
      return (!mgr.topic || s.topic === mgr.topic) && (!mgr.q || (s.id + ' ' + s.title + ' ' + s.note).toLowerCase().indexOf(mgr.q.toLowerCase()) >= 0);
    });
    $app.innerHTML = '<p class="eyebrow enter">Mission control</p><h1 class="enter-2">Manage notes</h1>' +
      '<p class="lead">Add, edit or delete statements. Changes are saved in this browser (localStorage). Export a JSON backup to move them to another device.' +
      (usingCustom() ? ' <b>You are using your edited notes.</b>' : '') + '</p>' +
      '<div class="row"><a class="btn" href="#/manage/__new">+ Add statement</a><button class="btn ghost" id="expBtn">Export JSON</button>' +
      '<label class="btn ghost" for="impFile" style="cursor:pointer">Import JSON</label><input type="file" id="impFile" accept=".json,application/json" class="sr-only">' +
      (usingCustom() ? '<button class="link" id="resetBtn">Reset to built-in notes</button>' : '') + '</div>' +
      '<div class="mgr-tools"><select class="input" id="fTopic" aria-label="Filter by chapter"><option value="">All chapters (' + STATEMENTS.length + ')</option>' +
      TOPICS.map(function (t) { return '<option value="' + esc(t.id) + '"' + (mgr.topic === t.id ? ' selected' : '') + '>' + esc(t.num + ' · ' + t.name) + '</option>'; }).join('') + '</select>' +
      '<input class="input" id="fQ" placeholder="Search id, title or note…" value="' + esc(mgr.q) + '" aria-label="Search"><span class="eyebrow" style="align-self:center;margin:0">' + list.length + ' shown</span></div>' +
      '<div class="slist" id="mlist">' + list.map(function (s) {
        return '<div class="card mrow" style="padding:12px 14px"><div class="t"><span class="id">' + esc(s.id) + '</span> · <span class="tag" style="font-size:.72rem">' + esc(s.type) + '</span><div>' + s.title + '</div></div>' +
          '<div class="row"><a class="btn small ghost" href="#/manage/' + encodeURIComponent(s.id) + '">Edit</a><button class="link back" data-del="' + esc(s.id) + '">Delete</button></div></div>';
      }).join('') + '</div>';
    document.getElementById('fTopic').onchange = function (e) { mgr.topic = e.target.value; viewManage(); };
    var fq = document.getElementById('fQ');
    fq.oninput = function (e) { mgr.q = e.target.value; clearTimeout(fq._t); fq._t = setTimeout(function () { viewManage(); var n = document.getElementById('fQ'); n.focus(); n.setSelectionRange(n.value.length, n.value.length); }, 250); };
    document.querySelectorAll('[data-del]').forEach(function (b) {
      b.onclick = function () {
        var id = b.getAttribute('data-del');
        if (!confirm('Delete statement ' + id + '? (You can restore built-in notes with Reset.)')) return;
        STATEMENTS = STATEMENTS.filter(function (s) { return s.id !== id; }); saveData(); toast('Deleted ' + id); viewManage();
      };
    });
    document.getElementById('expBtn').onclick = function () {
      var blob = new Blob([JSON.stringify({ version: 1, topics: TOPICS, statements: STATEMENTS }, null, 2)], { type: 'application/json' });
      var a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'discrete-structures-notes.json';
      document.body.appendChild(a); a.click(); setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 500);
    };
    document.getElementById('impFile').onchange = function (e) {
      var f = e.target.files[0]; if (!f) return;
      var rd = new FileReader();
      rd.onload = function () {
        try {
          var j = JSON.parse(rd.result), arr = Array.isArray(j) ? j : j.statements;
          if (!Array.isArray(arr)) throw new Error('No "statements" array found.');
          var problems = []; arr.forEach(function (s) { problems = problems.concat(validate(s)); });
          if (problems.length) throw new Error(problems.slice(0, 6).join('\n'));
          if (!confirm('Replace your notes with ' + arr.length + ' imported statements?')) return;
          STATEMENTS = arr; saveData(); toast('Imported ' + arr.length + ' statements'); viewManage();
        } catch (err) { alert('Import failed:\n' + err.message); }
      };
      rd.readAsText(f);
    };
    var rb = document.getElementById('resetBtn');
    if (rb) rb.onclick = function () { if (confirm('Throw away your edits and restore the built-in notes?')) { drop(KEY.data); loadData(); toast('Built-in notes restored'); viewManage(); } };
  }

  // Form <-> statement conversion. Answers are edited as plain text.
  function answerToText(it) {
    var a = it.answer;
    if (it.type === 'exact') return (a || []).join('\n');
    if (it.type === 'choice') return Array.isArray(a) ? a.join('\n') : (a || '');
    if (it.type === 'truthtable') return (a || []).join(', ');
    if (it.type === 'matrix') return (a || []).map(function (r) { return r.join(' '); }).join('\n');
    return a || '';
  }
  function textToAnswer(type, txt, multi) {
    var lines = txt.split('\n').map(function (l) { return l.trim(); }).filter(Boolean);
    if (type === 'exact') return lines;
    if (type === 'choice') return multi ? lines : (lines[0] || '');
    if (type === 'truthtable') return txt.split(/[\s,]+/).filter(Boolean).map(function (x) { return x.toUpperCase().charAt(0); });
    if (type === 'matrix') return lines.map(function (l) { return l.split(/[\s,]+/).filter(Boolean).map(Number); });
    return txt.trim();
  }
  function validate(s) {
    var e = [], w = (s && s.id) || '(no id)';
    if (!s || typeof s !== 'object') return ['A statement is not an object.'];
    if (!s.id) e.push(w + ': id is required');
    if (!topicById(s.topic)) e.push(w + ': unknown topic "' + s.topic + '"');
    [s].concat(s.followUps || []).forEach(function (it, i) {
      var where = i ? w + ' follow-up ' + i : w;
      if (!it.question) e.push(where + ': question is required');
      if (TYPES.indexOf(it.type) < 0) e.push(where + ': type must be one of ' + TYPES.join(', '));
      if (it.type === 'explain' && !(it.keywords && it.keywords.length)) e.push(where + ': explain needs keywords');
      if (it.type === 'exact' && !(Array.isArray(it.answer) && it.answer.length)) e.push(where + ': exact needs at least one accepted answer');
      if (it.type === 'set' && !window.Checker.setElements(it.answer)) e.push(where + ': set answer can’t be parsed');
      if (it.type === 'choice') { var ans = Array.isArray(it.answer) ? it.answer : [it.answer]; if (!it.options || ans.some(function (a) { return it.options.indexOf(a) < 0; })) e.push(where + ': choice answer must be one of the options'); }
      if (it.type === 'truthtable' && !(it.table && it.table.rows && it.answer && it.table.rows.length === it.answer.length)) e.push(where + ': truth table needs one T/F answer per row');
      if (it.type === 'matrix' && !(it.grid && it.answer && it.answer.length === it.grid.rows.length && it.answer.every(function (r) { return r.length === it.grid.cols.length; }))) e.push(where + ': matrix answer size must match the grid');
    });
    if (s.followUps && s.followUps.length > 3) e.push(w + ': at most 3 follow-ups');
    if (!s.mcq || !s.mcq.question || !s.mcq.options || s.mcq.options.length !== 4) e.push(w + ': MCQ needs a question and 4 options');
    return e;
  }
  function viewEdit(id) {
    var s = id ? BY_ID[id] : null;
    if (id && !s) { go('#/manage'); return; }
    var d = s || { id: '', topic: mgr.topic || '1', section: '', kind: 'def', title: '', note: '', question: '', type: 'explain', answer: '', keywords: [], hint: '', followUps: [], mcq: { question: '', options: ['', '', '', ''], answer: 0 } };
    function f(label, html, help) { return '<div class="field"><label>' + label + '</label>' + html + (help ? '<small>' + help + '</small>' : '') + '</div>'; }
    function opt(list, val) { return list.map(function (x) { return '<option' + (x === val ? ' selected' : '') + '>' + x + '</option>'; }).join(''); }
    var tableTxt = d.table ? d.table.cols.join(' | ') + '\n' + d.table.rows.map(function (r) { return r.join(' | '); }).join('\n') : '';
    var gridTxt = d.grid ? d.grid.rows.join(', ') + '\n' + d.grid.cols.join(', ') : '';
    $app.innerHTML = '<a class="link back" href="#/manage">All notes</a><h2>' + (s ? 'Edit ' + esc(s.id) : 'New statement') + '</h2>' +
      '<form id="ef" class="card" novalidate><div class="two">' +
      f('ID', '<input class="input" name="id" value="' + esc(d.id) + '" required>', 'Unique, e.g. 1-66') +
      f('Chapter', '<select class="input" name="topic">' + TOPICS.map(function (t) { return '<option value="' + esc(t.id) + '"' + (t.id === d.topic ? ' selected' : '') + '>' + esc(t.num + ' · ' + t.name) + '</option>'; }).join('') + '</select>') +
      f('Section', '<input class="input" name="section" value="' + esc(d.section) + '">', 'e.g. 1.4 (used in COVERAGE.md)') +
      f('Kind', '<select class="input" name="kind">' + opt(KINDS, d.kind) + '</select>', 'watch + mistake are used by the Trap quiz') + '</div>' +
      f('Title', '<input class="input" name="title" value="' + esc(d.title) + '">') +
      f('Note (HTML allowed)', '<textarea class="input" name="note" rows="5">' + esc(d.note) + '</textarea>', 'Shown in the NOTE phase. Tables: &lt;table class="nt"&gt;…') +
      '<div class="preview-box" id="notePv">' + d.note + '</div>' +
      f('Question (HTML allowed)', '<textarea class="input" name="question" rows="3">' + esc(d.question) + '</textarea>') +
      '<div class="two">' + f('Answer type', '<select class="input" name="type">' + opt(TYPES, d.type) + '</select>') +
      f('Multi-select (choice only)', '<select class="input" name="multi"><option value="0">No</option><option value="1"' + (Array.isArray(d.answer) && d.type === 'choice' ? ' selected' : '') + '>Yes</option></select>') + '</div>' +
      f('Answer', '<textarea class="input" name="answer" rows="3">' + esc(answerToText(d)) + '</textarea>',
        'explain: reference answer · exact: one accepted form per line · set: {1,2,3} · choice: the correct option(s), one per line · truthtable: T, F, T, T · matrix: one row per line, e.g. 1 0 1') +
      f('Keywords (explain only)', '<textarea class="input" name="keywords" rows="3">' + esc((d.keywords || []).map(function (g) { return g.join(' | '); }).join('\n')) + '</textarea>', 'One required keyword per line; synonyms separated by |') +
      f('Options (choice only)', '<textarea class="input" name="options" rows="3">' + esc((d.options || []).join('\n')) + '</textarea>', 'One option per line') +
      f('Truth table (truthtable only)', '<textarea class="input" name="table" rows="4">' + esc(tableTxt) + '</textarea>', 'Line 1: column headers separated by | (last = result). Then one line per row with the GIVEN values, e.g. T | F') +
      f('Grid (matrix only)', '<textarea class="input" name="grid" rows="2">' + esc(gridTxt) + '</textarea>', 'Line 1: row labels, line 2: column labels (comma-separated)') +
      f('Hint', '<input class="input" name="hint" value="' + esc(d.hint) + '">') +
      f('Follow-ups (JSON, advanced)', '<textarea class="input" name="followUps" rows="6">' + esc(JSON.stringify(d.followUps || [], null, 2)) + '</textarea>', 'Array of 1–3 objects with the same fields: {"note","question","type","answer","hint", …}') +
      f('MCQ question', '<input class="input" name="mq" value="' + esc(d.mcq.question) + '">') +
      '<div class="two">' + [0, 1, 2, 3].map(function (i) { return f('MCQ option ' + 'ABCD'[i] + (i === d.mcq.answer ? ' (correct)' : ''), '<input class="input" name="mo' + i + '" value="' + esc(d.mcq.options[i] || '') + '">'); }).join('') + '</div>' +
      f('Correct MCQ option', '<select class="input" name="ma">' + [0, 1, 2, 3].map(function (i) { return '<option value="' + i + '"' + (i === d.mcq.answer ? ' selected' : '') + '>' + 'ABCD'[i] + '</option>'; }).join('') + '</select>') +
      '<p class="err" id="ferr" role="alert"></p><div class="row"><button class="btn" type="submit">Save</button><a class="link back" href="#/manage">Cancel</a></div></form>';
    var form = document.getElementById('ef');
    form.note.oninput = function () { document.getElementById('notePv').innerHTML = form.note.value; };
    form.onsubmit = function (ev) {
      ev.preventDefault();
      var errEl = document.getElementById('ferr'); errEl.textContent = '';
      var type = form.type.value, out;
      try {
        var tlines = form.table.value.split('\n').map(function (l) { return l.trim(); }).filter(Boolean);
        var glines = form.grid.value.split('\n').map(function (l) { return l.trim(); }).filter(Boolean);
        out = {
          id: form.id.value.trim(), topic: form.topic.value, section: form.section.value.trim(), kind: form.kind.value, title: form.title.value.trim() || form.id.value.trim(),
          note: form.note.value, question: form.question.value, type: type,
          answer: textToAnswer(type, form.answer.value, form.multi.value === '1'),
          hint: form.hint.value.trim(),
          followUps: JSON.parse(form.followUps.value || '[]'),
          mcq: { question: form.mq.value.trim(), options: [0, 1, 2, 3].map(function (i) { return form['mo' + i].value.trim(); }), answer: +form.ma.value }
        };
        if (type === 'explain') out.keywords = form.keywords.value.split('\n').map(function (l) { return l.split('|').map(function (x) { return x.trim(); }).filter(Boolean); }).filter(function (g) { return g.length; });
        if (type === 'choice') out.options = form.options.value.split('\n').map(function (l) { return l.trim(); }).filter(Boolean);
        if (type === 'truthtable' && tlines.length) out.table = { cols: tlines[0].split('|').map(function (x) { return x.trim(); }), rows: tlines.slice(1).map(function (l) { return l.split('|').map(function (x) { return x.trim(); }); }) };
        if (type === 'matrix' && glines.length >= 2) out.grid = { rows: glines[0].split(',').map(function (x) { return x.trim(); }), cols: glines[1].split(',').map(function (x) { return x.trim(); }) };
        out.followUps = out.followUps.map(function (fu, i) { fu.id = fu.id || out.id + '-f' + (i + 1); return fu; });
      } catch (e2) { errEl.textContent = 'Follow-ups must be valid JSON: ' + e2.message; return; }
      var problems = validate(out);
      if ((!s || s.id !== out.id) && BY_ID[out.id]) problems.unshift('ID ' + out.id + ' already exists');
      if (problems.length) { errEl.textContent = problems.join('\n'); return; }
      if (s) STATEMENTS[STATEMENTS.indexOf(s)] = out; else STATEMENTS.push(out);
      saveData(); toast('Saved ' + out.id); go('#/manage');
    };
  }

  /* ---------------------------------------------------------------------
     Boot
     --------------------------------------------------------------------- */
  loadData();
  render();
})();

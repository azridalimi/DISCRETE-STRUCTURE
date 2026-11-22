# Discrete Structures · Memorise

A study web app that helps you **memorise and understand** the Discrete Structures notes.
Every screen pairs a **note** with **questions** about it: you read the note, it hides, then you answer.

Plain HTML + CSS + JavaScript. No backend, no framework, no build step.
**Open `index.html` by double-clicking it.** (Fonts load from Google Fonts when you're online; offline it falls back to system fonts.)

## What's inside

| Mode | What it does |
|---|---|
| **Study** (Launch session) | NOTE → ANSWER → CHECK for every statement and every follow-up. 3 attempts per question, hints on wrong/almost, then the answer. Failed statements repeat in a review round. |
| **Quiz** | One MCQ per statement in the chapter, random order, 20 s timer, streak counter, sound + animation. |
| **Trap quiz** | Only the WATCH OUT boxes + the Top 10 common mistakes. |
| **Manage notes** | Add / edit / delete statements, Export / Import JSON. Saved in `localStorage`. |

Scoring per question: 1st try 100 %, 2nd 60 %, 3rd 30 %, failed 0 %. A statement's score is the average of its main question and follow-ups. Progress is saved per statement in `localStorage`; the home page shows each chapter's % and the overall %.

## File structure

```
index.html            page shell (header, space background, script tags)
css/styles.css        all styling; colours and fonts are CSS variables in :root
js/checker.js         answer checking: ASCII → symbols, set parser, keyword scoring
js/data.js            ALL notes and questions (241 statements, 306 follow-ups)
js/app.js             the app: routing, study engine, quiz, results, manage page
COVERAGE.md           every PDF sub-heading → the statement IDs that cover it
tools/build_coverage.js   regenerates COVERAGE.md from data.js
tests/test_checker.js     unit tests for the checker
tests/validate_data.js    structural checks on data.js (ids, types, answers…)
tests/verify_answers.js   recomputes every invented answer (sets, truth tables,
                          M ⊙ M, f ∘ g, inverses…) and compares with data.js
tests/e2e.js              Playwright test of the full flow in a real browser
```

## Answer types

| type | You answer with | Checked by |
|---|---|---|
| `explain` | your own words | % of keyword groups found (synonyms + typo tolerance for 6+ letter words): ≥ 70 % correct, 40–69 % almost |
| `exact` | one value / expression | exact match after normalising spaces, case and symbols (any form in `answer[]`) |
| `set` | `{3, 1, 2}`, `{(a,1), (b,2)}`, `{∅, {1}}` | compared as sets: order and duplicates don't matter, pairs stay ordered |
| `truthtable` | tap cells T/F | per row; wrong cells are outlined |
| `matrix` | tap cells 0/1 | per cell; wrong cells are outlined |
| `choice` | pick option(s) | exact; an array `answer` means multi-select |

Typed ASCII is converted before checking: `in`→∈, `subset`→⊆, `U`/`union`→∪, `n`/`intersect`→∩, `not`/`~`/`!`→¬, `and`/`&`→∧, `or`/`|`→∨, `->`→→, `<->`→↔, `forall`→∀, `exists`→∃, `{}`/`empty`→∅, `'`→′.
`U`, `n`, `x`, `o` only become ∪ ∩ × ∘ **between two operands** (`A U B`), so `U` on its own still means the universal set.

## How to add new notes

**Option A: in the app (easiest).** Go to **Manage notes → + Add statement**, fill in the form and save. Use **Export JSON** to back up or move your notes to another device; **Import JSON** loads them back. **Reset** restores the built-in notes.

**Option B: in `js/data.js` (permanent, for everyone).** Add a `S({...})` call in the right chapter block. Short keys are expanded by the `S()` helper:

```js
S({ id: '1-66', t: '1', sec: '1.4', kind: 'example', title: `Example: union of three sets`,
  note: `{1,2} ∪ {2,3} ∪ {5} = {1,2,3,5}`,          // HTML allowed: tbl(), mx(), venn() helpers exist
  q: `{1,2} ∪ {2,3} ∪ {5} = ?`, type: 'set', ans: '{1,2,3,5}',
  hint: `Everything in at least one set.`,
  fu: [{ note: `…`, q: `…`, type: 'exact', ans: ['4'], hint: `…` }],   // 1–3 follow-ups
  mcq: [`Question?`, `correct option`, `distractor`, `distractor`, `distractor`] });  // first option = correct
```

- `kind`: `def`, `table`, `example`, `proof`, `tip`, `watch`, `quick`, `cheat`, `mistake` (`watch` + `mistake` feed the Trap quiz).
- `explain` needs `kw: [['keyword', 'synonym', …], …]`; `choice` needs `opts: [...]`;
  `truthtable` needs `table: tt(['p','q','p ∧ q'], TT2)`; `matrix` needs `grid: { rows: [...], cols: [...] }`.

Then run the checks:

```bash
node tests/validate_data.js
```

```bash
node tests/verify_answers.js
```

```bash
node tools/build_coverage.js
```

> Note: if you've edited notes in the app, your saved copy (localStorage) takes priority over `data.js`. Use **Manage notes → Reset** to see changes made to `data.js`.

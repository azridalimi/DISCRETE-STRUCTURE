# COVERAGE: PDF → statement IDs

Generated from `js/data.js` by `node tools/build_coverage.js`. Every PDF sub-heading is listed with the statements that cover it. Each row is one statement (a note + main question + follow-ups + 1 MCQ). The **Covers** column names the exact PDF item (definition, table row, example, memory tip, watch out or quick check).

**Totals:** 241 statements · 306 follow-up questions · 241 MCQs

| Kind | Count |
|---|---|
| DEFINITION | 44 |
| TABLE ROW | 87 |
| EXAMPLE | 30 |
| EXAMPLE (proof) | 10 |
| MEMORY TIP | 21 |
| WATCH OUT | 8 |
| QUICK CHECK | 6 |
| CHEAT SHEET | 25 |
| TOP-10 MISTAKE | 10 |

## Chapter 1 · Set Theory

### 1.1 What is a set?

| ID | Kind | Covers | Answer type | Follow-ups |
|---|---|---|---|---|
| 1-01 | DEFINITION | What is a set? | explain | choice |
| 1-02 | DEFINITION | Golden rule 1: order doesn't matter | choice | choice |
| 1-03 | DEFINITION | Golden rule 2: duplicates don't count | set | exact |
| 1-04 | DEFINITION | Notation: capitals, lowercase, ∈ and ∉ | explain | choice |
| 1-05 | EXAMPLE | Example: membership in A = {{1}, {2}, 3, 4} | choice | exact, choice |
| 1-06 | TABLE ROW | Describing a set: complete list (roster) | set | set |
| 1-07 | TABLE ROW | Describing a set: pattern + ellipsis | choice | set |
| 1-08 | TABLE ROW | Describing a set: set-builder notation | exact | set |
| 1-09 | EXAMPLE | Example: set-builder | set | set, choice |
| 1-10 | TABLE ROW | Number set ℕ (natural numbers) | choice | exact |
| 1-11 | TABLE ROW | Number set ℤ (integers) | choice | choice |
| 1-12 | TABLE ROW | Number set ℚ (rationals) | exact | choice |
| 1-13 | TABLE ROW | Number set ℝ (reals) | choice | choice |
| 1-14 | MEMORY TIP | Memory tip: ℕ ⊂ ℤ ⊂ ℚ ⊂ ℝ | exact | exact, exact |

### 1.2 Types of sets

| ID | Kind | Covers | Answer type | Follow-ups |
|---|---|---|---|---|
| 1-15 | TABLE ROW | Empty set ∅ | set | exact |
| 1-16 | TABLE ROW | Equal sets A = B | set | choice |
| 1-17 | TABLE ROW | Equivalent sets | choice | explain |
| 1-18 | TABLE ROW | Finite set | exact | choice |
| 1-19 | TABLE ROW | Infinite set: countable vs uncountable | choice | choice |
| 1-20 | TABLE ROW | Universal set U | explain | set |
| 1-21 | WATCH OUT | Watch out: Equal ≠ Equivalent | choice | choice |
| 1-22 | WATCH OUT | Watch out: always check the domain | set | choice |

### 1.3 Subsets, cardinality and power set

| ID | Kind | Covers | Answer type | Follow-ups |
|---|---|---|---|---|
| 1-23 | DEFINITION | Subset ⊆ | explain | choice, choice |
| 1-24 | DEFINITION | ∅ ⊆ A and A ⊆ A | choice | choice |
| 1-25 | DEFINITION | A = B ⟺ A ⊆ B and B ⊆ A | explain | exact |
| 1-26 | DEFINITION | Proper subset ⊂ | choice | choice |
| 1-27 | EXAMPLE | Example: all subsets of {1, 2, 3} | set | exact, set |
| 1-28 | DEFINITION | Cardinality \|S\| | exact | exact, exact |
| 1-29 | DEFINITION | Power set P(A) | set | exact, exact |
| 1-30 | MEMORY TIP | Memory tip: why 2ⁿ? | explain | exact, choice |
| 1-31 | QUICK CHECK | Quick check: proper subsets of A | choice | explain |

### 1.4 Operations on sets (with Venn diagrams)

| ID | Kind | Covers | Answer type | Follow-ups |
|---|---|---|---|---|
| 1-32 | TABLE ROW | Union A ∪ B | set | set |
| 1-33 | TABLE ROW | Intersection A ∩ B | set | set |
| 1-34 | TABLE ROW | Disjoint sets | choice | set |
| 1-35 | TABLE ROW | Difference A − B | set | set, set |
| 1-36 | TABLE ROW | Symmetric difference A ⊕ B | set | set |
| 1-37 | TABLE ROW | Complement A′ | set | set |
| 1-38 | DEFINITION | Counting a union (inclusion–exclusion) | exact | exact, explain |
| 1-39 | MEMORY TIP | Memory tip: cup, cap, XOR | choice | choice |
| 1-40 | WATCH OUT | Watch out: A − B ≠ B − A | choice | set, set |

### 1.5 Set identities (laws)

| ID | Kind | Covers | Answer type | Follow-ups |
|---|---|---|---|---|
| 1-41 | TABLE ROW | Commutative law (sets) | exact | set |
| 1-42 | TABLE ROW | Associative law (sets) | exact | set |
| 1-43 | TABLE ROW | Distributive law (sets) | exact | set, set |
| 1-44 | TABLE ROW | Absorption law (sets) | exact | exact, set |
| 1-45 | TABLE ROW | Idempotent law (sets) | exact | exact |
| 1-46 | TABLE ROW | De Morgan's laws (sets) | exact | exact, set |
| 1-47 | TABLE ROW | Complement law | exact | exact |
| 1-48 | TABLE ROW | Double complement law | exact | set |
| 1-49 | TABLE ROW | Complement of U and ∅ | exact | exact |
| 1-50 | TABLE ROW | Identity law (sets) | exact | exact |
| 1-51 | TABLE ROW | Domination law (universal / empty) | exact | exact |
| 1-52 | TABLE ROW | Set difference law | exact | set |
| 1-53 | MEMORY TIP | Memory tip: De Morgan, "break the bar, flip the sign" | explain | exact |
| 1-54 | EXAMPLE (proof) | Example proof: A − (A ∩ B) = A − B | choice | choice, choice, choice |
| 1-55 | EXAMPLE (proof) | Example proof: if A ∩ C = B ∩ C and A ∩ C′ = B ∩ C′, then A = B | choice | choice, choice |

### 1.6 Generalised union and intersection

| ID | Kind | Covers | Answer type | Follow-ups |
|---|---|---|---|---|
| 1-56 | DEFINITION | Big union ⋃ | choice | set |
| 1-57 | DEFINITION | Big intersection ⋂ | choice | set |
| 1-58 | EXAMPLE | Example: A ∩ B ∩ C and a 3-set union | set | set, set |

### 1.7 Cartesian product

| ID | Kind | Covers | Answer type | Follow-ups |
|---|---|---|---|---|
| 1-59 | DEFINITION | Ordered pair (a, b) | choice | choice |
| 1-60 | DEFINITION | Cartesian product A × B | set | set, exact |
| 1-61 | EXAMPLE | Example: B × A | set | choice |
| 1-62 | DEFINITION | Products of more sets: \|A₁ × … × Aₙ\| | exact | set, exact |
| 1-63 | DEFINITION | A × ∅ = ∅ | set | exact |
| 1-64 | DEFINITION | A × B ≠ B × A when A ≠ B | choice | set |
| 1-65 | MEMORY TIP | Memory tip: menu combos | exact | exact, choice |

## Chapter 2A · Fundamentals of Logic

### 2.1 Propositions

| ID | Kind | Covers | Answer type | Follow-ups |
|---|---|---|---|---|
| 2A-01 | DEFINITION | What is a proposition? | explain | choice |
| 2A-02 | TABLE ROW | Is it a proposition? "4 is less than 3." | choice | exact |
| 2A-03 | TABLE ROW | Is it a proposition? "Washington, DC, is the capital of the USA." | choice | choice |
| 2A-04 | TABLE ROW | Is it a proposition? "The sun will come out tomorrow." | choice | choice |
| 2A-05 | TABLE ROW | Not a proposition: a question | choice | explain |
| 2A-06 | TABLE ROW | Not a proposition: a command | choice | choice |
| 2A-07 | MEMORY TIP | Memory tip: can I answer it with True or False? | explain | choice |

### 2.2 Logical connectives: one master truth table

| ID | Kind | Covers | Answer type | Follow-ups |
|---|---|---|---|---|
| 2A-08 | TABLE ROW | Negation ¬p | truthtable | exact |
| 2A-09 | TABLE ROW | Conjunction p ∧ q | truthtable | choice |
| 2A-10 | TABLE ROW | Disjunction p ∨ q | truthtable | choice |
| 2A-11 | TABLE ROW | Conditional p → q | truthtable | choice, exact |
| 2A-12 | TABLE ROW | Biconditional p ↔ q | truthtable | choice |
| 2A-13 | EXAMPLE | Conditional with a False hypothesis | choice | choice |
| 2A-14 | EXAMPLE | Example: "but" means "and" | choice | choice, choice |
| 2A-15 | EXAMPLE | Examples: → and ↔ in English | choice | exact |

### 2.3 Precedence (order of operations)

| ID | Kind | Covers | Answer type | Follow-ups |
|---|---|---|---|---|
| 2A-16 | TABLE ROW | Precedence of connectives | exact | choice, choice |
| 2A-17 | MEMORY TIP | Memory tip: "Not And Or If Iff" | choice | truthtable, choice |
| 2A-18 | EXAMPLE | Example: build A = ¬(p ∨ q) → (q ∧ p) | truthtable | truthtable, choice |

### 2.4 Logical equivalence ≡

| ID | Kind | Covers | Answer type | Follow-ups |
|---|---|---|---|---|
| 2A-19 | DEFINITION | Logical equivalence ≡ | explain | choice |
| 2A-20 | DEFINITION | Contrapositive: p → q ≡ ¬q → ¬p | truthtable | exact |
| 2A-21 | DEFINITION | Negating an "if": ¬(p → q) ≡ p ∧ ¬q | truthtable | exact |
| 2A-22 | MEMORY TIP | Memory tip: contrapositive = flip and negate both | explain | choice |
| 2A-23 | MEMORY TIP | p → q ≡ ¬p ∨ q | truthtable | exact |
| 2A-24 | WATCH OUT | Watch out: converse and inverse are NOT equivalent | choice | truthtable, choice |

### 2.5 Laws of logic: side by side with the set laws

| ID | Kind | Covers | Answer type | Follow-ups |
|---|---|---|---|---|
| 2A-25 | DEFINITION | Logic laws = set laws (swap ∧ ↔ ∩, ∨ ↔ ∪, ¬ ↔ ′) | exact | exact, exact |
| 2A-26 | TABLE ROW | Double negation law | exact | truthtable |
| 2A-27 | TABLE ROW | Idempotent law (logic) | exact | exact |
| 2A-28 | TABLE ROW | Commutative law (logic) | exact | exact |
| 2A-29 | TABLE ROW | Associative law (logic) | exact | exact |
| 2A-30 | TABLE ROW | Distributive law (logic) | exact | truthtable, exact |
| 2A-31 | TABLE ROW | Absorption law (logic) | exact | truthtable |
| 2A-32 | TABLE ROW | De Morgan's laws (logic) | exact | exact, truthtable |
| 2A-33 | MEMORY TIP | Memory tip: De Morgan in English | explain | explain |

### 2.6 Logic ↔ Set theory dictionary

| ID | Kind | Covers | Answer type | Follow-ups |
|---|---|---|---|---|
| 2A-34 | TABLE ROW | Dictionary: x ∉ A | exact | choice |
| 2A-35 | TABLE ROW | Dictionary: A ⊆ B | exact | choice |
| 2A-36 | TABLE ROW | Dictionary: x ∈ A ∩ B | exact | exact |
| 2A-37 | TABLE ROW | Dictionary: x ∈ A ∪ B | exact | choice |
| 2A-38 | TABLE ROW | Dictionary: x ∈ A − B | exact | choice |
| 2A-39 | TABLE ROW | Dictionary: x ∈ A ⊕ B | choice | choice |
| 2A-40 | TABLE ROW | Dictionary: x ∈ A′ | exact | choice |
| 2A-41 | TABLE ROW | Dictionary: X ∈ P(A) | exact | choice |
| 2A-42 | QUICK CHECK | Quick check: divisible by 3 ↔ divisible by 9 | choice | exact, choice |

## Chapter 2B · Quantifiers & Proof

### 2.7 Predicates and domain

| ID | Kind | Covers | Answer type | Follow-ups |
|---|---|---|---|---|
| 2B-01 | DEFINITION | Predicate and domain of discourse | explain | explain |
| 2B-02 | TABLE ROW | Predicate value: P(4) for P(x): x > 3 | choice | choice |
| 2B-03 | TABLE ROW | Predicate value: P(2) for P(x): x > 3 | choice | exact |
| 2B-04 | TABLE ROW | Predicate value: Q(1,2) for Q(x,y): x = y + 3 | choice | choice |
| 2B-05 | TABLE ROW | Predicate value: Q(3,0) for Q(x,y): x = y + 3 | choice | exact |
| 2B-06 | WATCH OUT | Watch out: always state the domain first | choice | choice |

### 2.8 The two quantifiers (incl. negating, translating, quick check)

| ID | Kind | Covers | Answer type | Follow-ups |
|---|---|---|---|---|
| 2B-07 | TABLE ROW | Universal quantifier ∀x P(x) | choice | exact |
| 2B-08 | TABLE ROW | Existential quantifier ∃x P(x) | choice | exact |
| 2B-09 | MEMORY TIP | Memory tip: ∀ = upside-down A, ∃ = backwards E | exact | exact |
| 2B-10 | EXAMPLE | Counterexample: ∀x (x² ≥ 9) on {1,2,3,4} | exact | choice, choice |
| 2B-11 | EXAMPLE | Witness: ∃x (x/(x² + 1) = 2/5) | exact | choice |
| 2B-12 | DEFINITION | Negating ∀: ¬∀x P(x) ≡ ∃x ¬P(x) | exact | explain, exact |
| 2B-13 | DEFINITION | Negating ∃: ¬∃x P(x) ≡ ∀x ¬P(x) | exact | exact |
| 2B-14 | MEMORY TIP | Golden rule: ∀ goes with →, ∃ goes with ∧ | choice | exact |
| 2B-15 | TABLE ROW | Translate: "Every student in this class has studied calculus." | exact | choice |
| 2B-16 | TABLE ROW | Translate: "Some student in this class has visited Mexico." | exact | choice |
| 2B-17 | TABLE ROW | Translate: "Every student has visited Canada or Mexico." | exact | exact |
| 2B-18 | QUICK CHECK | Quick check a) Some student speaks Russian and knows C++ | exact | exact |
| 2B-19 | QUICK CHECK | Quick check b) Every student speaks Russian or knows C++ | exact | exact |
| 2B-20 | QUICK CHECK | Quick check c) No student speaks Russian or knows C++ | exact | exact |

### 2.9 Nested quantifiers

| ID | Kind | Covers | Answer type | Follow-ups |
|---|---|---|---|---|
| 2B-21 | DEFINITION | Nested quantifiers: read left to right | explain | choice |
| 2B-22 | TABLE ROW | ∀x ∀y: true for every pair | choice | choice |
| 2B-23 | TABLE ROW | ∀x ∃y: each x has its own y | exact | choice |
| 2B-24 | TABLE ROW | ∃y ∀x: one y works for all x | choice | explain |
| 2B-25 | TABLE ROW | ∃x ∃y: at least one pair | exact | exact |
| 2B-26 | MEMORY TIP | Memory tip: "everyone has their own" vs "one for everyone" | choice | choice |
| 2B-27 | EXAMPLE | Example: R(x,y) = student x works on project y | choice | choice, choice |
| 2B-28 | DEFINITION | Negating nested quantifiers: ¬∀x∃y P ≡ ∃x∀y ¬P | exact | choice |
| 2B-29 | DEFINITION | Negating nested quantifiers: ¬∃y∀x P ≡ ∀y∃x ¬P | exact | choice |
| 2B-30 | EXAMPLE | Translate ∀x (C(x) ∨ ∃y (C(y) ∧ F(x,y))) | explain | choice |

### 2.10 Proof techniques

| ID | Kind | Covers | Answer type | Follow-ups |
|---|---|---|---|---|
| 2B-31 | TABLE ROW | Term: axiom | choice | choice |
| 2B-32 | TABLE ROW | Term: definition | choice | choice |
| 2B-33 | TABLE ROW | Term: undefined term | choice | choice |
| 2B-34 | TABLE ROW | Term: theorem | choice | exact |
| 2B-35 | TABLE ROW | Proving p → q: direct proof | choice | choice |
| 2B-36 | TABLE ROW | Proving p → q: contrapositive | choice | explain |
| 2B-37 | TABLE ROW | Proving p → q: contradiction | choice | choice |
| 2B-38 | MEMORY TIP | Memory tip: even = 2k, odd = 2k + 1 | exact | exact, exact |
| 2B-39 | EXAMPLE (proof) | Direct proof: if x is odd, then x² is odd | exact | exact, explain |
| 2B-40 | EXAMPLE (proof) | Contrapositive proof: if n³ + 5 is odd, then n is even | choice | exact, exact |
| 2B-41 | EXAMPLE (proof) | Contradiction: if a² is even, then a is even | choice | exact |
| 2B-42 | EXAMPLE (proof) | Contradiction: if x + y ≥ 2, then x ≥ 1 or y ≥ 1 | choice | exact |
| 2B-43 | EXAMPLE (proof) | Contradiction: there is no greatest integer | exact | choice |
| 2B-44 | EXAMPLE (proof) | Contradiction: there are infinitely many primes | exact | exact, choice |
| 2B-45 | WATCH OUT | Watch out: examples are not a proof | choice | choice |

## Chapter 3A · Relations

### 3.1 What is a relation?

| ID | Kind | Covers | Answer type | Follow-ups |
|---|---|---|---|---|
| 3A-01 | DEFINITION | What is a relation? | explain | exact, choice |
| 3A-02 | EXAMPLE | Example: x R y if x divides y | set | set, set |
| 3A-03 | DEFINITION | Domain and range of a relation | set | set |

### 3.2 Four ways to show a relation (incl. in/out-degree)

| ID | Kind | Covers | Answer type | Follow-ups |
|---|---|---|---|---|
| 3A-04 | DEFINITION | Representation 1: set of pairs | set | exact |
| 3A-05 | DEFINITION | Representation 2: arrow diagram | choice | choice |
| 3A-06 | DEFINITION | Representation 3: digraph | exact | exact |
| 3A-07 | DEFINITION | Representation 4: matrix M_R | matrix | exact |
| 3A-08 | EXAMPLE | Example: "divides" relation as a matrix | matrix | matrix |
| 3A-09 | DEFINITION | In-degree and out-degree | exact | exact, exact |
| 3A-10 | MEMORY TIP | Memory tip: Out = Row, In = column | exact | exact |

### 3.3 Properties of relations (incl. Boolean product)

| ID | Kind | Covers | Answer type | Follow-ups |
|---|---|---|---|---|
| 3A-11 | TABLE ROW | Property: reflexive | choice | choice |
| 3A-12 | TABLE ROW | Property: irreflexive | choice | choice |
| 3A-13 | TABLE ROW | Property: not reflexive | choice | choice |
| 3A-14 | TABLE ROW | Property: symmetric | matrix | choice |
| 3A-15 | TABLE ROW | Property: antisymmetric | choice | choice |
| 3A-16 | TABLE ROW | Property: asymmetric | choice | choice, choice |
| 3A-17 | TABLE ROW | Property: transitive | choice | choice |
| 3A-18 | MEMORY TIP | Memory tip: pictures for the properties | choice | choice, choice |
| 3A-19 | WATCH OUT | Watch out: antisymmetric ≠ "not symmetric" | choice | choice, choice |
| 3A-20 | EXAMPLE | Example: which are reflexive? (on {1, 2, 3}) | choice | choice, choice, choice |
| 3A-21 | EXAMPLE | Example: R = {(1,2), (2,2), (3,4), (4,1)} | choice | matrix, choice |
| 3A-22 | DEFINITION | Testing transitivity with the Boolean product | explain | exact, choice |
| 3A-23 | EXAMPLE | Transitive ✔: R = {(1,2), (2,3), (1,3)} | matrix | choice |
| 3A-24 | EXAMPLE | Not transitive ✘: R = {(1,1), (1,2), (2,3)} | matrix | set, choice |
| 3A-25 | MEMORY TIP | Shortcut: hunt for chains | exact | exact, choice |

### 3.4 The two special relations

| ID | Kind | Covers | Answer type | Follow-ups |
|---|---|---|---|---|
| 3A-26 | DEFINITION | Equivalence relation (R + S + T) | choice | matrix, set |
| 3A-27 | DEFINITION | Partial order (R + A + T) | choice | set, choice, choice |
| 3A-28 | MEMORY TIP | Memory tip: RST vs RAT | choice | choice |
| 3A-29 | QUICK CHECK | Quick check: is this an equivalence relation? | choice | matrix, set |

## Chapter 3B · Functions

### 3.5 What is a function?

| ID | Kind | Covers | Answer type | Follow-ups |
|---|---|---|---|---|
| 3B-01 | DEFINITION | What is a function? | explain | choice |
| 3B-02 | DEFINITION | Domain, codomain, range | set | set, choice |
| 3B-03 | MEMORY TIP | Memory tip: exactly ONE arrow out | exact | choice |
| 3B-04 | EXAMPLE | Arrow diagram: ✔ function, range = {a, b} | choice | set |
| 3B-05 | EXAMPLE | Arrow diagram: ✘ not a function, 4 has no arrow | choice | choice |
| 3B-06 | EXAMPLE | Arrow diagram: ✘ not a function, 1 has two arrows | choice | choice |
| 3B-07 | DEFINITION | Function notation f(x) | exact | exact, exact |

### 3.6 One-to-one, onto, bijection

| ID | Kind | Covers | Answer type | Follow-ups |
|---|---|---|---|---|
| 3B-08 | TABLE ROW | One-to-one (injective) | choice | choice |
| 3B-09 | TABLE ROW | Onto (surjective) | choice | choice |
| 3B-10 | TABLE ROW | Bijection (one-to-one correspondence) | choice | choice |
| 3B-11 | EXAMPLE | Diagram: one-to-one, not onto (d has no arrow) | choice | exact |
| 3B-12 | EXAMPLE | Diagram: not one-to-one, not onto | choice | exact |
| 3B-13 | EXAMPLE | Diagram: bijection (exactly one each) | choice | set |
| 3B-14 | MEMORY TIP | Memory tip: ≤ 1, ≥ 1, = 1 | choice | choice, choice |
| 3B-15 | EXAMPLE (proof) | Prove one-to-one: f(n) = 2n + 1 on ℤ⁺ | choice | choice |
| 3B-16 | EXAMPLE (proof) | Disprove one-to-one: f(n) = 2ⁿ − n², ℤ⁺ → ℤ | exact | exact, exact |
| 3B-17 | MEMORY TIP | Strategy: proving / disproving one-to-one | explain | choice |

### 3.7 Inverse function

| ID | Kind | Covers | Answer type | Follow-ups |
|---|---|---|---|---|
| 3B-18 | DEFINITION | Inverse function f⁻¹ | choice | choice |
| 3B-19 | EXAMPLE | Inverse from pairs: swap each pair | set | set |
| 3B-20 | EXAMPLE | Inverse from a formula: f(x) = 9x + 5 | exact | exact, exact |
| 3B-21 | WATCH OUT | Watch out: f⁻¹ is not 1/f | choice | choice, choice |

### 3.8 Composition

| ID | Kind | Covers | Answer type | Follow-ups |
|---|---|---|---|---|
| 3B-22 | DEFINITION | Composition f ∘ g | choice | exact, exact |
| 3B-23 | EXAMPLE | Composition from pairs | set | set |
| 3B-24 | EXAMPLE | Composition from formulas: f ∘ g ≠ g ∘ f | exact | exact, exact, exact |
| 3B-25 | EXAMPLE | Decomposing a function | choice | choice |

## ★ Cheat Sheet & Top 10 Mistakes

### Cheat sheet · Sets

| ID | Kind | Covers | Answer type | Follow-ups |
|---|---|---|---|---|
| CS-01 | CHEAT SHEET | Cheat sheet: order, duplicates, ∅ ⊆ A, A ⊆ A | set | choice |
| CS-02 | CHEAT SHEET | Cheat sheet: \|P(A)\| = 2ⁿ, proper subsets = 2ⁿ − 1 | exact | exact |
| CS-03 | CHEAT SHEET | Cheat sheet: \|A ∪ B\| = \|A\| + \|B\| − \|A ∩ B\| | exact | exact |
| CS-04 | CHEAT SHEET | Cheat sheet: A − B = A ∩ B′, A ⊕ B = (A−B) ∪ (B−A) | set | exact, set |
| CS-05 | CHEAT SHEET | Cheat sheet: De Morgan for sets | set | set |
| CS-06 | CHEAT SHEET | Cheat sheet: \|A × B\| = \|A\|·\|B\|, (a,b) ≠ (b,a) | exact | choice |

### Cheat sheet · Logic

| ID | Kind | Covers | Answer type | Follow-ups |
|---|---|---|---|---|
| CS-07 | CHEAT SHEET | Cheat sheet: ∧ all, ∨ any, → false only T→F, ↔ same | truthtable | truthtable |
| CS-08 | CHEAT SHEET | Cheat sheet: precedence ¬ ∧ ∨ → ↔ | choice | choice |
| CS-09 | CHEAT SHEET | Cheat sheet: p → q ≡ ¬q → ¬p ≡ ¬p ∨ q | exact | exact |
| CS-10 | CHEAT SHEET | Cheat sheet: ¬(p → q) ≡ p ∧ ¬q | exact | explain |
| CS-11 | CHEAT SHEET | Cheat sheet: De Morgan for logic | exact | truthtable |

### Cheat sheet · Quantifiers

| ID | Kind | Covers | Answer type | Follow-ups |
|---|---|---|---|---|
| CS-12 | CHEAT SHEET | Cheat sheet: ∀ false ⇐ 1 counterexample, ∃ true ⇐ 1 witness | exact | exact |
| CS-13 | CHEAT SHEET | Cheat sheet: ¬∀x P ≡ ∃x ¬P, ¬∃x P ≡ ∀x ¬P | exact | exact |
| CS-14 | CHEAT SHEET | Cheat sheet: ∀ pairs with →, ∃ pairs with ∧ | exact | exact |
| CS-15 | CHEAT SHEET | Cheat sheet: ∀x∃y ≠ ∃y∀x | choice | choice |

### Cheat sheet · Proofs of p → q

| ID | Kind | Covers | Answer type | Follow-ups |
|---|---|---|---|---|
| CS-16 | CHEAT SHEET | Cheat sheet: three proofs of p → q | choice | choice |
| CS-17 | CHEAT SHEET | Cheat sheet: even = 2k, odd = 2k + 1 | exact | choice |

### Cheat sheet · Relations

| ID | Kind | Covers | Answer type | Follow-ups |
|---|---|---|---|---|
| CS-18 | CHEAT SHEET | Cheat sheet: R ⊆ A × B, out = row sum, in = column sum | exact | exact |
| CS-19 | CHEAT SHEET | Cheat sheet: matrix tests for the properties | choice | choice |
| CS-20 | CHEAT SHEET | Cheat sheet: asymmetric, and transitivity via M ⊙ M | matrix | choice, choice |
| CS-21 | CHEAT SHEET | Cheat sheet: equivalence = RST, partial order = RAT | choice | choice |

### Cheat sheet · Functions

| ID | Kind | Covers | Answer type | Follow-ups |
|---|---|---|---|---|
| CS-22 | CHEAT SHEET | Cheat sheet: every x has exactly one arrow out | choice | choice |
| CS-23 | CHEAT SHEET | Cheat sheet: 1-1 ≤ 1, onto ≥ 1, bijection = 1 | choice | choice |
| CS-24 | CHEAT SHEET | Cheat sheet: f⁻¹ exists ⟺ f is a bijection | exact | set |
| CS-25 | CHEAT SHEET | Cheat sheet: (f ∘ g)(x) = f(g(x)), g first | exact | exact |

### Top 10 common mistakes

| ID | Kind | Covers | Answer type | Follow-ups |
|---|---|---|---|---|
| TM-01 | TOP-10 MISTAKE | Mistake 1: writing 1 ∈ {{1}, 2} | choice | set |
| TM-02 | TOP-10 MISTAKE | Mistake 2: forgetting ∅ in a power set | set | exact |
| TM-03 | TOP-10 MISTAKE | Mistake 3: mixing up equal and equivalent | choice | choice |
| TM-04 | TOP-10 MISTAKE | Mistake 4: thinking F → T or F → F is false | truthtable | choice |
| TM-05 | TOP-10 MISTAKE | Mistake 5: using the converse as if equivalent | choice | choice |
| TM-06 | TOP-10 MISTAKE | Mistake 6: ∀x (S(x) ∧ C(x)) for "every student…" | exact | exact |
| TM-07 | TOP-10 MISTAKE | Mistake 7: swapping ∀ and ∃ freely | choice | choice |
| TM-08 | TOP-10 MISTAKE | Mistake 8: proving a ∀ claim with examples | choice | exact |
| TM-09 | TOP-10 MISTAKE | Mistake 9: "antisymmetric" = "not symmetric" | choice | choice |
| TM-10 | TOP-10 MISTAKE | Mistake 10: computing f ∘ g as "f first" | exact | exact |

## How the Trap Quiz is built

It uses every statement whose kind is WATCH OUT or TOP-10 MISTAKE: 1-21, 1-22, 1-40, 2A-24, 2B-06, 2B-45, 3A-19, 3B-21, TM-01, TM-02, TM-03, TM-04, TM-05, TM-06, TM-07, TM-08, TM-09, TM-10.

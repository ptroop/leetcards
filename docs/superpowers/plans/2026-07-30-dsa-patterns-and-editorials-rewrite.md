# DSA Patterns and Editorials Rewrite Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Teach every selected DSA pattern and imported LeetCode problem through invariant-first derivation, complete traces, and efficient C/C++ implementations.

**Architecture:** Pattern lessons use a dedicated semantic schema layered on the authored lesson system. Problem editorials reference pattern IDs and retain problem-specific derivation; deterministic visual specs expose the exact state changed at each step.

**Tech Stack:** JavaScript ES modules, React, existing DSA simulators, technical SVG sketches, Node tests, local C/C++ compilers

## Global Constraints

- Preserve college DSA assignment lessons unchanged.
- Keep excluded graph and storage-tree topics absent.
- Every code-bearing pattern and problem lesson provides C and C++.
- Do not copy external editorial wording or source code.
- Use `Step x/y`; do not use a decorative range slider.
- Compile representative and generated code fixtures locally; do not embed a compiler in the browser.

## File Structure

- Create `src/data/dsaPatternSchema.js`
- Create `src/data/lessons/dsaPatternLessons.js`
- Modify `src/data/dsaFocusedSubtopics.js`
- Modify `src/data/dsaVisuals.js`
- Modify `src/data/leetcodeProblemLessons.js`
- Modify `src/data/problemTeachingPatterns.js`
- Modify `src/components/ProblemLessonReader.jsx`
- Create `tests/dsa-content-quality.test.js`
- Create `scripts/verify-dsa-snippets.mjs`

### Task 1: Define the invariant-first pattern schema

**Files:**
- Create: `src/data/dsaPatternSchema.js`
- Test: `tests/dsa-content-quality.test.js`

**Interfaces:**
- Produces: `definePatternLesson(record)`, `validatePatternLesson(record)`.
- Required fields: `topicId`, `problemClass`, `repeatedWork`, `insight`, `state`, `invariant`, `movementRules`, `trace`, `correctness`, `complexity`, `useWhen`, `avoidWhen`, `relatedProblems`, `codeExamples`.

- [ ] **Step 1: Write a failing schema test**

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { definePatternLesson, validatePatternLesson } from '../src/data/dsaPatternSchema.js';

const twoPointers = {
  topicId: 'dsa-two-pointers',
  problemClass: 'A linear sequence where a pair or interval can be updated from boundary information.',
  repeatedWork: 'Trying every pair examines O(n²) combinations.',
  insight: 'Sorted order lets one comparison discard an entire row or column of candidate pairs.',
  state: ['left index', 'right index', 'current comparison'],
  invariant: 'No discarded pair can satisfy the target.',
  movementRules: ['Move left rightward when the sum is too small.', 'Move right leftward when the sum is too large.'],
  trace: [{ step: 1, state: 'left=0, right=4, sum=12', action: 'move right', reason: 'Every pair using value 9 is too large.' }],
  correctness: 'Each move removes only impossible candidates; equality returns a valid pair.',
  complexity: { time: 'O(n)', space: 'O(1)', reason: 'Each pointer moves inward at most n times.' },
  useWhen: ['sorted pair search', 'opposite-end comparison'],
  avoidWhen: ['moving one pointer cannot discard candidates safely'],
  relatedProblems: ['two-sum-ii', 'container-with-most-water'],
  codeExamples: { variants: [{ id: 'c', code: 'int pair_sum(const int *a, int n, int target) { return 0; }' }, { id: 'cpp', code: 'bool pair_sum(const std::vector<int>& a, int target) { return false; }' }] },
};

test('pattern records require an invariant and a reasoned trace', () => {
  assert.deepEqual(validatePatternLesson(twoPointers), []);
  assert.equal(definePatternLesson(twoPointers).topicId, 'dsa-two-pointers');
  assert.ok(validatePatternLesson({ ...twoPointers, invariant: '' }).includes('invariant'));
});
```

- [ ] **Step 2: Run and verify failure**

Run: `node --test tests/dsa-content-quality.test.js`  
Expected: FAIL because the schema module does not exist.

- [ ] **Step 3: Implement strict validation**

```js
const text = (value) => typeof value === 'string' && value.trim().length > 0;
const list = (value) => Array.isArray(value) && value.length > 0;

export function validatePatternLesson(record) {
  const errors = [];
  for (const key of ['topicId', 'problemClass', 'repeatedWork', 'insight', 'invariant', 'correctness']) {
    if (!text(record?.[key])) errors.push(key);
  }
  for (const key of ['state', 'movementRules', 'trace', 'useWhen', 'avoidWhen', 'relatedProblems']) {
    if (!list(record?.[key])) errors.push(key);
  }
  if (!record?.trace?.every((entry) => (
    Number.isInteger(entry.step)
    && text(entry.state)
    && text(entry.action)
    && text(entry.reason)
  ))) errors.push('trace:entry');
  if (!['time', 'space', 'reason'].every((key) => text(record?.complexity?.[key]))) {
    errors.push('complexity');
  }
  if (!Array.isArray(record?.codeExamples?.variants)
      || record.codeExamples.variants.map((variant) => variant.id).join(',') !== 'c,cpp'
      || !record.codeExamples.variants.every((variant) => text(variant.code))) {
    errors.push('codeExamples');
  }
  return errors;
}

export function definePatternLesson(record) {
  const errors = validatePatternLesson(record);
  if (errors.length) throw new TypeError(`${record?.topicId ?? 'pattern'}: ${errors.join(', ')}`);
  return Object.freeze(record);
}
```

- [ ] **Step 4: Run tests**

Run: `node --test tests/dsa-content-quality.test.js`  
Expected: PASS.

- [ ] **Step 5: Commit**

```powershell
git add src/data/dsaPatternSchema.js tests/dsa-content-quality.test.js
git commit -m "feat: define invariant-first DSA pattern schema"
```

### Task 2: Rewrite sequence, pointer, window, and prefix patterns

**Files:**
- Create: `src/data/lessons/dsaPatternLessons.js`
- Modify: `src/data/dsaVisuals.js`
- Modify: `tests/dsa-content-quality.test.js`

**Interfaces:**
- `dsaPatternLessons` exports validated records keyed by topic ID.

- [ ] **Step 1: Add targeted quality tests**

```js
import { dsaPatternLessonById } from '../src/data/lessons/dsaPatternLessons.js';

const patternText = (id) => JSON.stringify(dsaPatternLessonById.get(id));

test('sliding window and Kadane are derived from maintained state', () => {
  assert.match(patternText('dsa-sliding'), /window|expand|shrink|invariant|left|right/i);
  assert.match(patternText('dsa-longest-substring'), /last seen|duplicate|left boundary|max/i);
  assert.match(patternText('dsa-kadane'), /best ending here|restart|extend|global best/i);
  assert.match(patternText('dsa-prefix'), /prefix|range|subtract|precompute/i);
});
```

- [ ] **Step 2: Run and verify failure**

Run: `node --test tests/dsa-content-quality.test.js`  
Expected: FAIL.

- [ ] **Step 3: Author the first pattern family**

Author complete records for:

```text
dsa-complexity, dsa-matrix, dsa-sequence-terms, dsa-frequency-anagram,
dsa-palindrome, dsa-two-pointers, dsa-sliding, dsa-longest-substring,
dsa-k-distinct, dsa-fast-slow, dsa-prefix, dsa-difference, dsa-kadane,
dsa-longest-consecutive, dsa-cyclic-placement, dsa-intervals,
dsa-monotonic, dsa-top-k, dsa-quickselect, dsa-k-way-merge
```

For each visual frame encode concrete pointer positions, window bounds, counts, deque contents, heap contents, or prefix values. Captions must state the reason for the move.

- [ ] **Step 4: Run tests**

Run: `node --test tests/dsa-content-quality.test.js tests/dsa-focused-snippets.test.js`  
Expected: PASS.

- [ ] **Step 5: Commit**

```powershell
git add src/data/lessons/dsaPatternLessons.js src/data/dsaVisuals.js tests/dsa-content-quality.test.js
git commit -m "content: rewrite sequence and window patterns"
```

### Task 3: Split and rewrite linked lists, stacks, queues, trees, and BSTs

**Files:**
- Modify: `src/data/lessons/dsaPatternLessons.js`
- Modify: `src/data/dsaFocusedSubtopics.js`
- Modify: `src/data/dsaVisuals.js`
- Modify: `tests/dsa-content-quality.test.js`

**Interfaces:**
- Every important operation/problem remains a separately routable topic.

- [ ] **Step 1: Add separation and technique checks**

```js
test('linked-list techniques are separate and explain the reusable invariant', () => {
  assert.match(patternText('dsa-sll-dummy-head'), /head might change|sentinel|dummy\.next/i);
  assert.match(patternText('dsa-sll-fast-slow-technique'), /middle|cycle|nth from end|gap/i);
  assert.match(patternText('dsa-sll-three-pointer-reversal'), /prev|curr|next|save|reverse/i);
  assert.notEqual(
    dsaPatternLessonById.get('dsa-sll-cycle-detection'),
    dsaPatternLessonById.get('dsa-sll-cycle-entry'),
  );
});

test('stack, queue, tree, and BST interview problems have independent records', () => {
  for (const id of [
    'dsa-valid-parentheses', 'dsa-min-stack', 'dsa-next-greater-element',
    'dsa-circular-queue', 'dsa-queue-using-stacks', 'dsa-sliding-window-maximum',
    'dsa-tree-symmetric', 'dsa-tree-diameter', 'dsa-tree-lca',
    'dsa-bst-validate', 'dsa-bst-delete', 'dsa-bst-kth-smallest',
  ]) assert.ok(dsaPatternLessonById.has(id), id);
});
```

- [ ] **Step 2: Run and verify failure**

Run: `node --test tests/dsa-content-quality.test.js`  
Expected: FAIL.

- [ ] **Step 3: Author structure and problem records**

Cover every non-college focused ID from `dsa-sll-dummy-head` through `dsa-bst-lca`, plus the foundational `dsa-linked`, `dsa-stack-queue`, `dsa-hash`, `dsa-heap`, `dsa-binary-tree`, `dsa-bst`, `dsa-avl`, and `dsa-red-black`.

Use explicit node IDs and links for linked-list traces. Draw the cycle back edge. For trees, distinguish node identity from value and show recursive return values. For queues and stacks, show the exact operation end. For BST deletion, separately trace leaf, one-child, and two-child cases.

- [ ] **Step 4: Run tests**

Run: `node --test tests/dsa-content-quality.test.js tests/curriculum.test.js tests/dsa-focused-snippets.test.js`  
Expected: PASS.

- [ ] **Step 5: Commit**

```powershell
git add src/data/lessons/dsaPatternLessons.js src/data/dsaFocusedSubtopics.js src/data/dsaVisuals.js tests/dsa-content-quality.test.js
git commit -m "content: rewrite DSA structures and focused problems"
```

### Task 4: Rewrite recursion, backtracking, greedy, and DP patterns

**Files:**
- Modify: `src/data/lessons/dsaPatternLessons.js`
- Modify: `src/data/dsaVisuals.js`
- Modify: `tests/dsa-content-quality.test.js`

**Interfaces:**
- DP records explicitly define state, transition, base case, evaluation order, and answer location.

- [ ] **Step 1: Add DP derivation checks**

```js
test('DP lessons derive state and transitions instead of presenting a table without meaning', () => {
  for (const id of [
    'dsa-dp', 'dsa-dp-take-skip', 'dsa-dp-grid', 'dsa-knapsack',
    'dsa-coin-change-min', 'dsa-coin-change-ways', 'dsa-lis',
    'dsa-lcs', 'dsa-edit-distance', 'dsa-dp-compression',
  ]) {
    const value = patternText(id);
    assert.match(value, /state/i, id);
    assert.match(value, /transition|recurrence/i, id);
    assert.match(value, /base/i, id);
    assert.match(value, /order/i, id);
  }
  assert.match(patternText('dsa-coin-change-min'), /unreachable|infinity|min/i);
  assert.match(patternText('dsa-coin-change-ways'), /combinations|coin outer|amount inner/i);
});
```

- [ ] **Step 2: Run and verify failure**

Run: `node --test tests/dsa-content-quality.test.js`  
Expected: FAIL.

- [ ] **Step 3: Author recursive and optimization records**

Cover:

```text
dsa-sorting, dsa-search, dsa-recursion, dsa-subsets, dsa-permutations,
dsa-combination-sum, dsa-divide, dsa-greedy, dsa-dp, dsa-dp-take-skip,
dsa-dp-grid, dsa-knapsack, dsa-coin-change-min, dsa-coin-change-ways,
dsa-lis, dsa-lcs, dsa-edit-distance, dsa-dp-compression, dsa-bitwise
```

Backtracking traces must show choice, recursive state, undo, and pruning. DP sketches must highlight dependency cells and explain why iteration order is valid. Coin-change minimum and counting remain separate lessons with different state meaning and loop-order consequences.

- [ ] **Step 4: Run tests**

Run: `node --test tests/dsa-content-quality.test.js tests/curriculum.test.js`  
Expected: PASS.

- [ ] **Step 5: Commit**

```powershell
git add src/data/lessons/dsaPatternLessons.js src/data/dsaVisuals.js tests/dsa-content-quality.test.js
git commit -m "content: rewrite recursion greedy and DP patterns"
```

### Task 5: Upgrade imported LeetCode editorials

**Files:**
- Modify: `src/data/leetcodeProblemLessons.js`
- Modify: `src/data/problemTeachingPatterns.js`
- Modify: `src/components/ProblemLessonReader.jsx`
- Modify: `tests/questions.test.js`
- Modify: `tests/dsa-content-quality.test.js`

**Interfaces:**
- Each editorial provides `restatement`, `exampleTrace`, `bruteForce`, `insight`, `patternId`, `invariant`, `derivation`, `efficientTrace`, `code`, `complexity`, `wrongApproaches`, `edgeCases`, and `solutionComparison`.

- [ ] **Step 1: Add editorial semantic checks**

```js
import { leetcodeProblemLessons } from '../src/data/leetcodeProblemLessons.js';

test('every imported editorial is problem-specific and complete', () => {
  for (const lesson of leetcodeProblemLessons) {
    for (const key of [
      'restatement', 'exampleTrace', 'bruteForce', 'insight', 'patternId',
      'invariant', 'derivation', 'efficientTrace', 'code', 'complexity',
      'wrongApproaches', 'edgeCases', 'solutionComparison',
    ]) assert.ok(lesson[key]?.length || typeof lesson[key] === 'object', `${lesson.slug}: ${key}`);
    assert.deepEqual(lesson.code.variants.map((variant) => variant.id), ['c', 'cpp']);
  }
});
```

- [ ] **Step 2: Run and verify failure**

Run: `node --test tests/dsa-content-quality.test.js tests/questions.test.js`  
Expected: FAIL for missing editorial fields.

- [ ] **Step 3: Reconcile all 134 imported problem lessons**

For each existing slug, write a problem-specific derivation and trace. Reuse pattern definitions by `patternId`, but never substitute a generic pattern paragraph for the problem’s own reasoning. If imported code is suboptimal, describe its actual complexity and present the efficient alternative. Keep source metadata out of the visible lesson because the user explicitly does not need dates, runtime, memory, URL, or submission history.

Update `ProblemLessonReader.jsx` to render the fields in learning order:

```text
Problem → hand trace → straightforward approach → bottleneck → insight
→ pattern/invariant → derivation → efficient trace → C/C++
→ code explanation → complexity → mistakes/edge cases → comparison
```

- [ ] **Step 4: Run tests**

Run: `node --test tests/dsa-content-quality.test.js tests/questions.test.js`  
Expected: PASS for all 134 records.

- [ ] **Step 5: Commit**

```powershell
git add src/data/leetcodeProblemLessons.js src/data/problemTeachingPatterns.js src/components/ProblemLessonReader.jsx tests/questions.test.js tests/dsa-content-quality.test.js
git commit -m "content: upgrade imported problem editorials"
```

### Task 6: Compile DSA code outside the browser

**Files:**
- Create: `scripts/verify-dsa-snippets.mjs`
- Modify: `package.json`
- Modify: `tests/dsa-content-quality.test.js`

**Interfaces:**
- Produces: `npm.cmd run verify:dsa-snippets`.
- Uses local `gcc`/`clang` and `g++`/`clang++`; skips with a clear message only when a compiler is unavailable.

- [ ] **Step 1: Add a failing package-script test**

```js
import { readFile } from 'node:fs/promises';

test('DSA snippets are compiled locally rather than in the browser', async () => {
  const pkg = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8'));
  assert.equal(pkg.scripts['verify:dsa-snippets'], 'node scripts/verify-dsa-snippets.mjs');
  const app = await readFile(new URL('../src/App.jsx', import.meta.url), 'utf8');
  assert.doesNotMatch(app, /compiler|webassembly compiler|compile service/i);
});
```

- [ ] **Step 2: Run and verify failure**

Run: `node --test tests/dsa-content-quality.test.js`  
Expected: FAIL because the script is absent.

- [ ] **Step 3: Implement local extraction and compilation**

The verifier imports DSA pattern and problem records, writes each variant to a temporary directory under `os.tmpdir()`, selects an available compiler with `spawnSync`, compiles C with `-std=c11 -Wall -Wextra -Werror`, compiles C++ with `-std=c++20 -Wall -Wextra -Werror`, reports the topic/slug and language on failure, and removes its temporary directory in `finally`.

Add:

```json
"verify:dsa-snippets": "node scripts/verify-dsa-snippets.mjs"
```

to `package.json` scripts.

- [ ] **Step 4: Run verification**

Run: `npm.cmd run verify:dsa-snippets`  
Expected: every extracted translation unit compiles, or the command reports that no supported compiler is installed without changing browser code.

Run: `npm.cmd test`  
Expected: PASS.

- [ ] **Step 5: Commit**

```powershell
git add scripts/verify-dsa-snippets.mjs package.json tests/dsa-content-quality.test.js
git commit -m "test: compile DSA solutions locally"
```

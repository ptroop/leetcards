# Curriculum Migration Regression Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove obsolete generic teaching paths, protect excluded collections, and prove the rewritten curriculum renders, scrolls, compiles, and builds.

**Architecture:** Snapshot hashes protect excluded data files, semantic audits cover authored records, route-level source tests protect reader behavior, and a single verification command runs the complete delivery gate.

**Tech Stack:** Node test runner, crypto hashes, Vite build, existing verification scripts

## Global Constraints

- Delete generic content paths only after every in-scope topic has an authored record.
- Preserve public route and lesson lookup interfaces.
- Preserve all excluded content.
- Do not push or deploy as part of this plan.

## File Structure

- Create `tests/fixtures/protected-content-hashes.json`
- Create `tests/protected-content.test.js`
- Create `scripts/audit-authored-curriculum.mjs`
- Modify `src/data/lessonCatalog.js`
- Modify or delete obsolete generic helpers only when no imports remain.
- Modify `tests/curriculum.test.js`
- Modify `package.json`

### Task 1: Freeze excluded-content hashes

**Files:**
- Create: `tests/fixtures/protected-content-hashes.json`
- Create: `tests/protected-content.test.js`

**Interfaces:**
- Protects `qualcommPrep*.js`, `qualcommIndiaWebQuestions.js`, `qualcommSourceCoverage.js`, `linuxLabs.js`, `collegeMcuLabs.js`, `collegeDsaLabs.js`, and `stm32CollegeMcuSources.js`.

- [ ] **Step 1: Write the failing hash test**

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';

const hashes = JSON.parse(
  await readFile(new URL('./fixtures/protected-content-hashes.json', import.meta.url), 'utf8'),
);

test('excluded prep and college content remains unchanged', async () => {
  for (const [relativePath, expected] of Object.entries(hashes)) {
    const bytes = await readFile(new URL(`../${relativePath}`, import.meta.url));
    const actual = createHash('sha256').update(bytes).digest('hex');
    assert.equal(actual, expected, relativePath);
  }
});
```

- [ ] **Step 2: Run and verify failure**

Run: `node --test tests/protected-content.test.js`  
Expected: FAIL because the fixture does not exist.

- [ ] **Step 3: Record current protected-file SHA-256 values**

Run this exact PowerShell command for every protected path listed in the task interface:

```powershell
Get-FileHash -Algorithm SHA256 src/data/qualcommPrep.js,src/data/qualcommPrepProfilesC.js,src/data/qualcommPrepProfilesDsa.js,src/data/qualcommPrepProfilesEmbedded.js,src/data/qualcommPrepProfilesInterview.js,src/data/qualcommPrepProfilesLinux.js,src/data/qualcommIndiaWebQuestions.js,src/data/qualcommSourceCoverage.js,src/data/linuxLabs.js,src/data/collegeMcuLabs.js,src/data/collegeDsaLabs.js,src/data/stm32CollegeMcuSources.js | Select-Object Path,Hash
```

Convert the output into a JSON object whose keys are repository-relative paths such as `src/data/linuxLabs.js` and whose values are the corresponding lowercase SHA-256 hashes. The fixture must contain exactly 12 entries.

- [ ] **Step 4: Run the hash test**

Run: `node --test tests/protected-content.test.js`  
Expected: PASS.

- [ ] **Step 5: Commit**

```powershell
git add tests/fixtures/protected-content-hashes.json tests/protected-content.test.js
git commit -m "test: protect excluded curriculum content"
```

### Task 2: Remove generic filler generators

**Files:**
- Modify: `src/data/lessonCatalog.js`
- Modify or delete: `src/data/deepProfiles.js`
- Modify or delete: `src/data/topicNotes.js`
- Modify or delete: `src/data/realApplications.js`
- Modify: `tests/curriculum.test.js`

**Interfaces:**
- `lessons` and `lessonByTopicId` remain exported from `lessonCatalog.js`.

- [ ] **Step 1: Add a failing obsolete-pattern test**

```js
import { readFile } from 'node:fs/promises';

test('core lessons are not manufactured from generic state filler', async () => {
  const catalog = await readFile(new URL('../src/data/lessonCatalog.js', import.meta.url), 'utf8');
  assert.doesNotMatch(catalog, /expandedDeepLesson|standardLesson|briefLesson/);
  assert.doesNotMatch(catalog, /state \$\{index \+ 1\}/);
  assert.doesNotMatch(catalog, /withTeachingFoundation/);
});
```

- [ ] **Step 2: Run and verify failure**

Run: `node --test tests/curriculum.test.js`  
Expected: FAIL while the old generators are present.

- [ ] **Step 3: Delete only dead generic paths**

Make `lessonCatalog.js` choose among:

```text
protected legacy lesson → authored core lesson → explicit error for an uncovered topic
```

Remove generic helper functions and imports after `rg` confirms no remaining consumers. Keep helper modules only if protected legacy lessons still require them. Do not alter protected lesson output.

- [ ] **Step 4: Run full tests**

Run: `npm.cmd test`  
Expected: PASS and no uncovered-topic exception.

- [ ] **Step 5: Commit**

```powershell
git add src/data/lessonCatalog.js src/data/deepProfiles.js src/data/topicNotes.js src/data/realApplications.js tests/curriculum.test.js
git commit -m "refactor: remove generic lesson filler"
```

If a helper file is deleted, stage it with `git add -u -- <path>` rather than listing a missing path as an ordinary addition.

### Task 3: Add a semantic curriculum audit

**Files:**
- Create: `scripts/audit-authored-curriculum.mjs`
- Modify: `package.json`
- Modify: `tests/curriculum.test.js`

**Interfaces:**
- Produces: `npm.cmd run audit:curriculum`.

- [ ] **Step 1: Add a failing script contract**

```js
test('package exposes the semantic curriculum audit', async () => {
  const pkg = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8'));
  assert.equal(pkg.scripts['audit:curriculum'], 'node scripts/audit-authored-curriculum.mjs');
});
```

- [ ] **Step 2: Run and verify failure**

Run: `node --test tests/curriculum.test.js`  
Expected: FAIL because the script is absent.

- [ ] **Step 3: Implement the audit**

The audit must:

- enumerate all topics;
- skip only protected topics;
- require one authored record per in-scope ID;
- validate semantic fields by depth;
- validate C/C++ language pairs where code exists outside C++;
- validate technical sketches and interactive steps;
- validate every DSA pattern record;
- validate every imported problem editorial;
- print counts by section and a precise list of failures;
- exit nonzero on any failure.

Add:

```json
"audit:curriculum": "node scripts/audit-authored-curriculum.mjs"
```

to `package.json`.

- [ ] **Step 4: Run the audit**

Run: `npm.cmd run audit:curriculum`  
Expected: exit 0 and print authored/protected counts by section.

- [ ] **Step 5: Commit**

```powershell
git add scripts/audit-authored-curriculum.mjs package.json tests/curriculum.test.js
git commit -m "test: add semantic curriculum audit"
```

### Task 4: Protect scrolling, routing, and meaningful visuals

**Files:**
- Modify: `tests/curriculum.test.js`
- Modify: `tests/questions.test.js`
- Modify: `src/styles.css` only if a test exposes a current overflow lock

**Interfaces:**
- Lesson and problem routes retain current hash formats.

- [ ] **Step 1: Add reader regression tests**

```js
test('lesson readers do not trap vertical scrolling', async () => {
  const css = await readFile(new URL('../src/styles.css', import.meta.url), 'utf8');
  assert.doesNotMatch(css, /\.lesson-reader[^{]*\{[^}]*overflow-y:\s*hidden/s);
  assert.doesNotMatch(css, /\.lesson-content[^{]*\{[^}]*max-height:[^;}]+;[^}]*overflow:\s*hidden/s);
});

test('technical visuals expose a question and never use decorative range controls', async () => {
  const source = await readFile(new URL('../src/components/TechnicalSketch.jsx', import.meta.url), 'utf8');
  assert.match(source, /sketch\.question/);
  assert.doesNotMatch(source, /type="range"/);
});
```

- [ ] **Step 2: Run the focused tests**

Run: `node --test tests/curriculum.test.js tests/questions.test.js`  
Expected: PASS, or FAIL with the exact overflow declaration that must be removed.

- [ ] **Step 3: Fix only exposed reader regressions**

If scrolling fails, remove the narrow overflow lock and retain page-level scrolling:

```css
.lesson-reader,
.lesson-content {
  min-height: 0;
  overflow: visible;
}
```

Do not introduce an inner scroll container.

- [ ] **Step 4: Run tests and build**

Run: `npm.cmd test`  
Expected: all applicable tests pass.

Run: `npm.cmd run build`  
Expected: production build succeeds.

- [ ] **Step 5: Commit**

```powershell
git add src/styles.css tests/curriculum.test.js tests/questions.test.js
git commit -m "test: protect lesson reading regressions"
```

### Task 5: Add the complete verification command

**Files:**
- Modify: `package.json`
- Modify: `tests/security.test.js`

**Interfaces:**
- Produces: `npm.cmd run verify`.

- [ ] **Step 1: Add a failing verification-script test**

```js
test('one command runs the complete local delivery gate', async () => {
  const pkg = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8'));
  assert.equal(
    pkg.scripts.verify,
    'npm run audit:curriculum && npm run verify:dsa-snippets && npm run verify:college-dsa && npm test && npm run build',
  );
});
```

- [ ] **Step 2: Run and verify failure**

Run: `node --test tests/security.test.js`  
Expected: FAIL because `verify` is missing or differs.

- [ ] **Step 3: Add the exact verification script**

```json
"verify": "npm run audit:curriculum && npm run verify:dsa-snippets && npm run verify:college-dsa && npm test && npm run build"
```

- [ ] **Step 4: Run the final delivery gate**

Run: `npm.cmd run verify`  
Expected: curriculum audit passes, snippets compile or report supported skip behavior, college DSA verification passes, tests pass, and production build succeeds.

Run: `git diff --check`  
Expected: no output.

- [ ] **Step 5: Commit**

```powershell
git add package.json tests/security.test.js
git commit -m "chore: add complete curriculum verification gate"
```

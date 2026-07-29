# Lesson Schema and Technical Sketches Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add semantic authored-lesson records and a reusable, accessible SVG technical-sketch system without changing excluded lesson collections.

**Architecture:** Authored records are validated independently from rendered lesson blocks. A deterministic adapter converts records into the existing block model, while a dedicated technical-sketch component renders domain-specific SVG primitives and delegates existing DSA state traces to the current mechanism renderer.

**Tech Stack:** React 19, JavaScript ES modules, inline SVG, CSS, Node test runner

## Global Constraints

- Preserve Qualcomm Prep and all college assignment lesson records.
- Avoid new runtime dependencies.
- Every sketch has a teaching question, accessible title, accessible description, and text equivalent.
- Static sketches are the default; interaction is allowed only for meaningful state transitions.
- Generated presentation code may normalize records but may not invent explanations.

## File Structure

- Create `src/data/authoredLessonSchema.js`: semantic record constants, validation, and record-to-block adapter.
- Create `src/data/coreLessonRegistry.js`: registry for in-scope authored records and protected-topic predicates.
- Create `src/data/technicalSketches.js`: validated diagram specifications keyed by sketch ID.
- Create `src/components/TechnicalSketch.jsx`: accessible SVG renderer and domain primitives.
- Modify `src/components/LessonBlock.jsx`: render `technical-sketch` blocks.
- Modify `src/data/lessonCatalog.js`: prefer authored records for migrated topic IDs.
- Modify `src/styles.css`: notebook-like sketch styling.
- Create `tests/authored-lessons.test.js`: schema, adapter, protection, and sketch contract tests.

### Task 1: Define the authored lesson schema

**Files:**
- Create: `src/data/authoredLessonSchema.js`
- Test: `tests/authored-lessons.test.js`

**Interfaces:**
- Produces: `LESSON_DEPTHS`, `defineAuthoredLesson(record)`, `validateAuthoredLesson(record)`, and `authoredLessonToBlocks(record)`.
- `record` contains `topicId`, `title`, `depth`, `definition`, `motivation`, `mechanism`, `workedExample`, `realUse`, `failureModes`, `verification`, `recall`, and optional `codeExamples`, `diagramSpec`, `interactiveSpec`.

- [ ] **Step 1: Write failing schema tests**

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  authoredLessonToBlocks,
  defineAuthoredLesson,
  validateAuthoredLesson,
} from '../src/data/authoredLessonSchema.js';

const validDeepLesson = {
  topicId: 'electronics-pullups',
  title: 'Pull-up and pull-down resistors',
  depth: 'deep',
  definition: 'A pull resistor gives a high-impedance digital input a weak default connection to a supply rail.',
  motivation: 'An undriven CMOS input can collect charge and cross logic thresholds unpredictably.',
  mechanism: ['The resistor supplies the default level.', 'A low-impedance driver overrides that weak path.'],
  workedExample: { setup: '3.3 V with a 10 kΩ pull-up', steps: ['Switch open: input reads high.', 'Switch closed: about 0.33 mA flows.'] },
  realUse: 'I2C lines use pull-ups because attached devices pull the shared bus low with open-drain outputs.',
  failureModes: [{ symptom: 'Random button presses', cause: 'The input is floating', check: 'Measure the idle pin voltage.' }],
  verification: ['Read the idle pin with a multimeter.', 'Inspect the edge with an oscilloscope.'],
  recall: ['A pull resistor defines the idle state.', 'The active driver must be stronger than the pull path.'],
};

test('a deep authored lesson validates and adapts without inventing content', () => {
  assert.deepEqual(validateAuthoredLesson(validDeepLesson), []);
  const blocks = authoredLessonToBlocks(defineAuthoredLesson(validDeepLesson));
  assert.equal(blocks[0].type, 'definition');
  assert.match(JSON.stringify(blocks), /0\.33 mA/);
  assert.match(JSON.stringify(blocks), /Random button presses/);
});

test('a deep lesson rejects missing causal fields', () => {
  const errors = validateAuthoredLesson({ ...validDeepLesson, mechanism: [] });
  assert.ok(errors.includes('mechanism'));
});
```

- [ ] **Step 2: Run the focused test and verify failure**

Run: `node --test tests/authored-lessons.test.js`  
Expected: FAIL because `src/data/authoredLessonSchema.js` does not exist.

- [ ] **Step 3: Implement validation and deterministic block adaptation**

```js
export const LESSON_DEPTHS = Object.freeze(['brief', 'standard', 'deep']);

const nonEmptyText = (value) => typeof value === 'string' && value.trim().length > 0;
const nonEmptyList = (value) => Array.isArray(value) && value.length > 0;

export function validateAuthoredLesson(record) {
  const errors = [];
  for (const key of ['topicId', 'title', 'definition', 'motivation', 'realUse']) {
    if (!nonEmptyText(record?.[key])) errors.push(key);
  }
  if (!LESSON_DEPTHS.includes(record?.depth)) errors.push('depth');
  if (!nonEmptyList(record?.mechanism)) errors.push('mechanism');
  if (record?.depth !== 'brief' && !record?.workedExample?.steps?.length) errors.push('workedExample');
  if (record?.depth === 'deep' && !nonEmptyList(record?.failureModes)) errors.push('failureModes');
  if (record?.depth === 'deep' && !nonEmptyList(record?.verification)) errors.push('verification');
  if (!nonEmptyList(record?.recall)) errors.push('recall');
  return errors;
}

export function defineAuthoredLesson(record) {
  const errors = validateAuthoredLesson(record);
  if (errors.length) throw new TypeError(`${record?.topicId ?? 'lesson'}: ${errors.join(', ')}`);
  return Object.freeze(record);
}

export function authoredLessonToBlocks(record) {
  const blocks = [
    { type: 'definition', heading: 'What it is', body: record.definition },
    { type: 'explanation', heading: 'Why it exists', body: record.motivation },
    { type: 'steps', heading: 'How it works', items: record.mechanism },
  ];
  if (record.workedExample) {
    blocks.push({
      type: 'worked-example',
      heading: record.workedExample.setup,
      items: record.workedExample.steps,
    });
  }
  if (record.diagramSpec) blocks.push({ type: 'technical-sketch', ...record.diagramSpec });
  blocks.push({ type: 'application', heading: 'Where this is used', body: record.realUse });
  if (record.failureModes?.length) {
    blocks.push({ type: 'failure-table', heading: 'What failure looks like', items: record.failureModes });
  }
  if (record.verification?.length) {
    blocks.push({ type: 'steps', heading: 'How to verify it', items: record.verification });
  }
  if (record.codeExamples) blocks.push({ type: 'code-pair', ...record.codeExamples });
  blocks.push({ type: 'recall-list', heading: 'Keep these facts', items: record.recall });
  return blocks;
}
```

- [ ] **Step 4: Run the focused test**

Run: `node --test tests/authored-lessons.test.js`  
Expected: PASS.

- [ ] **Step 5: Commit the schema**

```powershell
git add src/data/authoredLessonSchema.js tests/authored-lessons.test.js
git commit -m "feat: add semantic authored lesson schema"
```

### Task 2: Add the protected core registry

**Files:**
- Create: `src/data/coreLessonRegistry.js`
- Modify: `tests/authored-lessons.test.js`

**Interfaces:**
- Consumes: `defineAuthoredLesson(record)`.
- Produces: `registerCoreLessons(records)`, `coreLessonByTopicId`, `isProtectedTopic(topic)`.

- [ ] **Step 1: Add failing registry tests**

```js
import { allTopics } from '../src/data/topics.js';
import {
  coreLessonByTopicId,
  isProtectedTopic,
  registerCoreLessons,
} from '../src/data/coreLessonRegistry.js';

test('excluded collections are protected from core registration', () => {
  const protectedTopics = allTopics.filter(isProtectedTopic);
  assert.ok(protectedTopics.some((topic) => topic.sectionId === 'qualcomm-prep'));
  assert.ok(protectedTopics.some((topic) => topic.id === 'linux-a01'));
  assert.ok(protectedTopics.some((topic) => topic.group === 'College MCU C Labs'));
  assert.ok(protectedTopics.some((topic) => topic.group === 'College DSA C Labs'));
  assert.throws(
    () => registerCoreLessons([{ ...validDeepLesson, topicId: 'linux-a01' }]),
    /protected topic/,
  );
  assert.equal(coreLessonByTopicId.has('linux-a01'), false);
});
```

- [ ] **Step 2: Run and verify failure**

Run: `node --test tests/authored-lessons.test.js`  
Expected: FAIL because the registry module does not exist.

- [ ] **Step 3: Implement registry protection**

```js
import { defineAuthoredLesson } from './authoredLessonSchema.js';
import { topicById } from './topics.js';

export const isProtectedTopic = (topic) => Boolean(
  topic
  && (
    topic.sectionId === 'qualcomm-prep'
    || /^linux-a\d+$/i.test(topic.id)
    || topic.group === 'College MCU C Labs'
    || topic.group === 'College DSA C Labs'
  )
);

export const coreLessonByTopicId = new Map();

export function registerCoreLessons(records) {
  for (const input of records) {
    const topic = topicById.get(input.topicId);
    if (!topic) throw new TypeError(`unknown topic: ${input.topicId}`);
    if (isProtectedTopic(topic)) throw new TypeError(`protected topic: ${input.topicId}`);
    coreLessonByTopicId.set(input.topicId, defineAuthoredLesson(input));
  }
  return coreLessonByTopicId;
}
```

- [ ] **Step 4: Run tests**

Run: `node --test tests/authored-lessons.test.js`  
Expected: PASS.

- [ ] **Step 5: Commit the registry**

```powershell
git add src/data/coreLessonRegistry.js tests/authored-lessons.test.js
git commit -m "feat: protect excluded lesson collections"
```

### Task 3: Define and validate technical-sketch specifications

**Files:**
- Create: `src/data/technicalSketches.js`
- Modify: `tests/authored-lessons.test.js`

**Interfaces:**
- Produces: `defineTechnicalSketch(spec)`, `technicalSketchById`.
- Sketch kinds: `circuit`, `timing`, `memory`, `process`, `object-lifetime`, `data-structure`.

- [ ] **Step 1: Add failing sketch-contract tests**

```js
import {
  defineTechnicalSketch,
  technicalSketchById,
} from '../src/data/technicalSketches.js';

test('every technical sketch states its teaching question and text equivalent', () => {
  for (const sketch of technicalSketchById.values()) {
    assert.ok(sketch.question.endsWith('?'), sketch.id);
    assert.ok(sketch.title.length > 5, sketch.id);
    assert.ok(sketch.description.length > 30, sketch.id);
    assert.ok(sketch.textEquivalent.length > 50, sketch.id);
  }
});

test('interactive sketches require semantic steps instead of a decorative slider', () => {
  assert.throws(() => defineTechnicalSketch({
    id: 'bad',
    kind: 'circuit',
    title: 'Bad sketch',
    question: 'What changes?',
    description: 'A deliberately invalid interactive sketch for the contract test.',
    textEquivalent: 'The invalid sketch does not contain meaningful state transitions.',
    interactive: true,
    steps: [],
  }), /steps/);
});
```

- [ ] **Step 2: Run and verify failure**

Run: `node --test tests/authored-lessons.test.js`  
Expected: FAIL because the sketch module does not exist.

- [ ] **Step 3: Implement the sketch contract and initial pull-up sketch**

```js
const kinds = new Set(['circuit', 'timing', 'memory', 'process', 'object-lifetime', 'data-structure']);

export function defineTechnicalSketch(spec) {
  for (const key of ['id', 'title', 'question', 'description', 'textEquivalent']) {
    if (!spec?.[key]?.trim()) throw new TypeError(`${spec?.id ?? 'sketch'}: ${key}`);
  }
  if (!kinds.has(spec.kind)) throw new TypeError(`${spec.id}: kind`);
  if (spec.interactive && (!Array.isArray(spec.steps) || spec.steps.length < 2)) {
    throw new TypeError(`${spec.id}: steps`);
  }
  return Object.freeze(spec);
}

const sketches = [
  defineTechnicalSketch({
    id: 'pull-up-open-drain',
    kind: 'circuit',
    title: 'A weak default, overridden by a strong low',
    question: 'Why is the input high when the transistor is off and low when it is on?',
    description: 'A 3.3 V rail feeds an input node through 10 kΩ; an open-drain transistor can connect the node to ground.',
    textEquivalent: 'With the transistor off, negligible input current means the resistor holds the input near 3.3 V. With it on, about 0.33 mA flows through the resistor and the input is near ground.',
    interactive: true,
    primitives: [
      { type: 'rail', id: 'vcc', label: '3.3 V' },
      { type: 'resistor', id: 'pull', label: '10 kΩ', from: 'vcc', to: 'input' },
      { type: 'junction', id: 'input', label: 'MCU input' },
      { type: 'open-drain', id: 'driver', from: 'input', to: 'gnd' },
      { type: 'ground', id: 'gnd' },
    ],
    steps: [
      { id: 'off', action: 'Transistor off', reason: 'The drain-to-ground path is open.', invariant: 'The input draws negligible DC current.', result: 'Vin ≈ 3.3 V; logic 1.' },
      { id: 'on', action: 'Transistor on', reason: 'The transistor provides a low-impedance path.', invariant: 'The resistor limits supply current.', result: 'Vin ≈ 0 V; I ≈ 0.33 mA; logic 0.' },
    ],
  }),
];

export const technicalSketchById = new Map(sketches.map((sketch) => [sketch.id, sketch]));
```

- [ ] **Step 4: Run tests**

Run: `node --test tests/authored-lessons.test.js`  
Expected: PASS.

- [ ] **Step 5: Commit the sketch data contract**

```powershell
git add src/data/technicalSketches.js tests/authored-lessons.test.js
git commit -m "feat: define technical sketch contracts"
```

### Task 4: Render accessible hand-drawn SVG sketches

**Files:**
- Create: `src/components/TechnicalSketch.jsx`
- Modify: `src/components/LessonBlock.jsx`
- Modify: `src/styles.css`
- Modify: `tests/authored-lessons.test.js`

**Interfaces:**
- Consumes: a `technical-sketch` lesson block containing `sketchId`.
- Produces: `<TechnicalSketch sketchId="pull-up-open-drain" />`.

- [ ] **Step 1: Add failing source-level render tests**

```js
import { readFile } from 'node:fs/promises';

test('technical sketches render accessible SVG and semantic step controls', async () => {
  const source = await readFile(new URL('../src/components/TechnicalSketch.jsx', import.meta.url), 'utf8');
  assert.match(source, /role="img"/);
  assert.match(source, /<title id=/);
  assert.match(source, /<desc id=/);
  assert.match(source, /Step \{stepIndex \+ 1\}\/\{sketch\.steps\.length\}/);
  assert.doesNotMatch(source, /type="range"/);
});

test('lesson blocks route technical sketches to their renderer', async () => {
  const source = await readFile(new URL('../src/components/LessonBlock.jsx', import.meta.url), 'utf8');
  assert.match(source, /block\.type === 'technical-sketch'/);
  assert.match(source, /<TechnicalSketch sketchId=\{block\.sketchId\}/);
});
```

- [ ] **Step 2: Run and verify failure**

Run: `node --test tests/authored-lessons.test.js`  
Expected: FAIL because the component does not exist.

- [ ] **Step 3: Implement the circuit renderer and semantic controls**

Implement `TechnicalSketch.jsx` with:

```jsx
import { useState } from 'react';
import { technicalSketchById } from '../data/technicalSketches.js';

export default function TechnicalSketch({ sketchId }) {
  const sketch = technicalSketchById.get(sketchId);
  const [stepIndex, setStepIndex] = useState(0);
  if (!sketch) return null;
  const step = sketch.steps?.[stepIndex];
  const titleId = `${sketch.id}-title`;
  const descriptionId = `${sketch.id}-description`;

  return (
    <figure className="technical-sketch">
      <p className="sketch-question">{sketch.question}</p>
      <svg
        viewBox="0 0 720 360"
        role="img"
        aria-labelledby={`${titleId} ${descriptionId}`}
      >
        <title id={titleId}>{sketch.title}</title>
        <desc id={descriptionId}>{sketch.description}</desc>
        {sketch.primitives.map((primitive) => (
          <SketchPrimitive
            key={primitive.id}
            primitive={primitive}
            activeStepId={step?.id}
          />
        ))}
      </svg>
      {step && (
        <figcaption>
          <span>Step {stepIndex + 1}/{sketch.steps.length}</span>
          <strong>{step.action}</strong>
          <p>{step.reason}</p>
          <p><b>Still true:</b> {step.invariant}</p>
          <p><b>Result:</b> {step.result}</p>
          <div className="sketch-controls">
            <button type="button" disabled={stepIndex === 0} onClick={() => setStepIndex((value) => value - 1)}>Previous</button>
            <button type="button" disabled={stepIndex === sketch.steps.length - 1} onClick={() => setStepIndex((value) => value + 1)}>Next</button>
          </div>
        </figcaption>
      )}
      <details><summary>Text explanation</summary><p>{sketch.textEquivalent}</p></details>
    </figure>
  );
}
```

Define the dispatcher before `TechnicalSketch`:

```jsx
function SketchPrimitive({ primitive, activeStepId }) {
  const props = { primitive, activeStepId };
  switch (primitive.type) {
    case 'rail': return <RailPrimitive {...props} />;
    case 'resistor': return <ResistorPrimitive {...props} />;
    case 'junction': return <JunctionPrimitive {...props} />;
    case 'open-drain': return <OpenDrainPrimitive {...props} />;
    case 'ground': return <GroundPrimitive {...props} />;
    default: throw new TypeError(`unsupported sketch primitive: ${primitive.type}`);
  }
}
```

Implement each primitive as a deterministic `<g>` containing `<path>`, `<line>`, `<circle>`, and `<text>` elements positioned from the pull-up sketch’s named layout map:

```js
const points = Object.freeze({
  vcc: { x: 250, y: 35 },
  input: { x: 250, y: 180 },
  driver: { x: 250, y: 255 },
  gnd: { x: 250, y: 325 },
});
```

Every electrical stroke uses `className="sketch-stroke"` and `vectorEffect="non-scaling-stroke"`. The `off` step adds `sketch-active` to the VCC-to-input path; the `on` step adds it to the full VCC-to-ground path. Add the `TechnicalSketch` import and a `technical-sketch` branch in `LessonBlock.jsx`.

Add CSS variables and sketch classes:

```css
:root {
  --paper: #f5f1e8;
  --ink: #211f1a;
  --sketch-accent: #b34b35;
  --sketch-muted: #766f63;
}

.technical-sketch {
  border-block: 1px solid color-mix(in srgb, var(--ink) 18%, transparent);
  padding-block: clamp(1.5rem, 4vw, 3rem);
}

.technical-sketch svg {
  width: 100%;
  color: var(--ink);
  overflow: visible;
}

.sketch-stroke {
  fill: none;
  stroke: currentColor;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 2.2;
}

.sketch-active {
  color: var(--sketch-accent);
}
```

- [ ] **Step 4: Run focused and full tests**

Run: `node --test tests/authored-lessons.test.js`  
Expected: PASS.

Run: `npm.cmd test`  
Expected: existing tests remain green.

- [ ] **Step 5: Commit the renderer**

```powershell
git add src/components/TechnicalSketch.jsx src/components/LessonBlock.jsx src/styles.css tests/authored-lessons.test.js
git commit -m "feat: render accessible technical sketches"
```

### Task 5: Prefer authored lessons without disrupting legacy content

**Files:**
- Modify: `src/data/lessonCatalog.js`
- Modify: `src/data/contentModel.js`
- Modify: `tests/authored-lessons.test.js`

**Interfaces:**
- Consumes: `coreLessonByTopicId`, `authoredLessonToBlocks`.
- Produces: the existing `lessonByTopicId` interface with authored records adapted to current lesson blocks.

- [ ] **Step 1: Add a failing authored-precedence test**

```js
test('lesson catalog prefers an authored core record and leaves protected lessons on their existing path', async () => {
  const source = await readFile(new URL('../src/data/lessonCatalog.js', import.meta.url), 'utf8');
  assert.match(source, /coreLessonByTopicId\.get\(topic\.id\)/);
  assert.match(source, /authoredLessonToBlocks/);
  assert.match(source, /isProtectedTopic/);
});
```

- [ ] **Step 2: Run and verify failure**

Run: `node --test tests/authored-lessons.test.js`  
Expected: FAIL because the catalog does not consume the authored registry.

- [ ] **Step 3: Add the authored-record branch**

In `lessonCatalog.js`, import the registry and adapter, then place this branch before generic lesson generation:

```js
const authoredLessonFor = (topic) => {
  const record = coreLessonByTopicId.get(topic.id);
  if (!record) return null;
  return {
    topicId: record.topicId,
    title: record.title,
    depth: record.depth,
    summary: record.definition,
    blocks: authoredLessonToBlocks(record),
  };
};

const lessonForTopic = (topic) => {
  if (!isProtectedTopic(topic)) {
    const authored = authoredLessonFor(topic);
    if (authored) return authored;
  }
  return lessonFor(topic);
};
```

Build `lessons` from `lessonForTopic(topic)` while preserving the existing exported names.

- [ ] **Step 4: Run regression checks**

Run: `node --test tests/authored-lessons.test.js tests/qualcomm-prep.test.js tests/linux-labs.test.js`  
Expected: PASS.

Run: `npm.cmd run build`  
Expected: production build succeeds.

- [ ] **Step 5: Commit authored precedence**

```powershell
git add src/data/lessonCatalog.js src/data/contentModel.js tests/authored-lessons.test.js
git commit -m "feat: prefer authored core lessons"
```

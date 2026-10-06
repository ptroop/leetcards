import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import {
  authoredLessonToBlocks,
  defineAuthoredLesson,
  validateAuthoredLesson,
} from '../src/data/authoredLessonSchema.js';
import { allTopics } from '../src/data/topics.js';
import {
  coreLessonByTopicId,
  isProtectedTopic,
  registerCoreLessons,
} from '../src/data/coreLessonRegistry.js';
import {
  defineTechnicalSketch,
  technicalSketchById,
} from '../src/data/technicalSketches.js';
import { validateLesson } from '../src/data/contentModel.js';

const validDeepLesson = {
  topicId: 'electronics-pullups',
  title: 'Pull-up and pull-down resistors',
  depth: 'deep',
  definition: 'A pull resistor gives a high-impedance digital input a weak default connection to a supply rail.',
  motivation: 'An undriven CMOS input can collect charge and cross logic thresholds unpredictably.',
  mechanism: [
    'The resistor supplies the default level.',
    'A low-impedance driver overrides that weak path.',
  ],
  workedExample: {
    setup: '3.3 V with a 10 kΩ pull-up',
    steps: [
      'Switch open: input reads high.',
      'Switch closed: about 0.33 mA flows.',
    ],
  },
  realUse: 'I2C lines use pull-ups because attached devices pull the shared bus low with open-drain outputs.',
  failureModes: [{
    symptom: 'Random button presses',
    cause: 'The input is floating',
    check: 'Measure the idle pin voltage.',
  }],
  verification: [
    'Read the idle pin with a multimeter.',
    'Inspect the edge with an oscilloscope.',
  ],
  recall: [
    'A pull resistor defines the idle state.',
    'The active driver must be stronger than the pull path.',
  ],
};

test('a deep authored lesson validates and adapts without inventing content', () => {
  assert.deepEqual(validateAuthoredLesson(validDeepLesson), []);

  const blocks = authoredLessonToBlocks(defineAuthoredLesson(validDeepLesson));

  assert.equal(blocks[0].type, 'definition');
  assert.match(JSON.stringify(blocks), /0\.33 mA/);
  assert.match(JSON.stringify(blocks), /Random button presses/);
});

test('a deep authored lesson rejects a missing causal mechanism', () => {
  const errors = validateAuthoredLesson({ ...validDeepLesson, mechanism: [] });

  assert.ok(errors.includes('mechanism'));
});

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

test('technical sketches render accessible SVG and semantic step controls', async () => {
  const source = await readFile(
    new URL('../src/components/TechnicalSketch.jsx', import.meta.url),
    'utf8',
  );

  assert.match(source, /role="img"/);
  assert.match(source, /<title id=/);
  assert.match(source, /<desc id=/);
  assert.match(source, /Step \{stepIndex \+ 1\}\/\{sketch\.steps\.length\}/);
  assert.doesNotMatch(source, /type="range"/);
});

test('lesson blocks render authored examples, failures, recall, and technical sketches', async () => {
  const source = await readFile(
    new URL('../src/components/LessonBlock.jsx', import.meta.url),
    'utf8',
  );

  assert.match(source, /block\.type === 'technical-sketch'/);
  assert.match(source, /<TechnicalSketch sketchId=\{block\.sketchId\}/);
  assert.match(source, /block\.type === 'worked-example'/);
  assert.match(source, /block\.type === 'failure-table'/);
  assert.match(source, /block\.type === 'recall-list'/);
});

test('technical sketches reuse the existing editorial type tokens', async () => {
  const styles = await readFile(new URL('../src/styles.css', import.meta.url), 'utf8');

  assert.match(styles, /\.sketch-question[\s\S]*font-family: var\(--serif\)/);
  assert.match(styles, /\.sketch-primitive text[\s\S]*font-family: var\(--mono\)/);
  assert.doesNotMatch(styles, /--font-serif|--font-mono|--font-sans/);
});

test('technical sketches support reusable annotated flows for static mechanisms', async () => {
  const source = await readFile(
    new URL('../src/components/TechnicalSketch.jsx', import.meta.url),
    'utf8',
  );

  assert.match(source, /function AnnotatedFlowSketch/);
  assert.match(source, /sketch\.layout === 'annotated-flow'/);
  assert.match(source, /sketch\.nodes\.map/);
  assert.match(source, /sketch\.edges\.map/);
});

test('mechanism visuals use prediction before reveal and never leak the next caption', async () => {
  const source = await readFile(
    new URL('../src/components/MechanismVisual.jsx', import.meta.url),
    'utf8',
  );

  assert.match(source, /Pattern model/);
  assert.match(source, /Reach for it when/);
  assert.match(source, /Why this move is safe/);
  assert.match(source, /Reveal reasoning/);
  assert.match(source, /currentFrame\.codeLine/);
  assert.doesNotMatch(source, /nextFrame\?\.caption/);
});

test('lesson catalog prefers authored core records and preserves protected legacy paths', async () => {
  const source = await readFile(
    new URL('../src/data/lessonCatalog.js', import.meta.url),
    'utf8',
  );

  assert.match(source, /coreLessonByTopicId\.get\(topic\.id\)/);
  assert.match(source, /authoredLessonToBlocks/);
  assert.match(source, /isProtectedTopic/);
});

test('deep authored blocks satisfy the semantic lesson contract', () => {
  const record = defineAuthoredLesson({
    ...validDeepLesson,
    diagramSpec: {
      heading: 'Follow the circuit states',
      sketchId: 'pull-up-open-drain',
    },
  });
  const lesson = {
    topicId: record.topicId,
    title: record.title,
    depth: record.depth,
    summary: record.definition,
    blocks: authoredLessonToBlocks(record),
  };

  assert.deepEqual(validateLesson(lesson), { valid: true, errors: [] });
});

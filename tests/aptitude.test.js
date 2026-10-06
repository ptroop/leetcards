import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { aptitudeGroups, aptitudePatterns, aptitudeQuestionCount, aptitudeSources, puzzleQuestionCount } from '../src/data/aptitudePractice.js';
import { parseRoute, routeForAptitude } from '../src/data/routes.js';

test('aptitude collection is complete, unique, and honest about provenance', () => {
  const questions = aptitudeGroups.flatMap((group) => group.questions);
  const sourceById = new Map(aptitudeSources.map((source) => [source.id, source]));
  assert.equal(aptitudeQuestionCount, 71);
  assert.equal(puzzleQuestionCount, 27);
  assert.equal(new Set(questions.map((question) => question.id)).size, questions.length);
  assert.equal(new Set(aptitudeSources.map((source) => source.url)).size, aptitudeSources.length);
  assert.ok(aptitudeGroups.some((group) => group.id === 'qualcomm-reported'));
  assert.ok(aptitudeGroups.some((group) => group.id === 'verbal'));
  for (const question of questions) {
    assert.ok(question.prompt.length >= 10, question.id);
    assert.ok(question.answer.length >= 2, question.id);
    assert.ok(question.steps.length >= 2, question.id);
    assert.ok(question.trap.length >= 20, question.id);
    assert.ok(question.sources.length > 0, question.id);
    for (const sourceId of question.sources) assert.ok(sourceById.has(sourceId), `${question.id}: ${sourceId}`);
    if (question.reported) {
      assert.ok(question.sources.some((id) => sourceById.get(id).type === 'candidate'), question.id);
    }
  }
});

test('pattern priorities are backed by distinct Qualcomm accounts and actual worked variants', () => {
  const questionIds = new Set(aptitudeGroups.flatMap((group) => group.questions.map((question) => question.id)));
  const sourceById = new Map(aptitudeSources.map((source) => [source.id, source]));
  assert.equal(aptitudePatterns.length, 17);
  const puzzlePatterns = aptitudePatterns.filter((pattern) => pattern.id.startsWith('puzzle-'));
  assert.equal(puzzlePatterns.length, 6);
  const puzzleQuestionIds = aptitudeGroups
    .filter((group) => ['qualcomm-reported', 'classic-puzzles'].includes(group.id))
    .flatMap((group) => group.questions.map((question) => question.id));
  const coveredPuzzleIds = new Set(puzzlePatterns.flatMap((pattern) => pattern.questionIds));
  for (const id of puzzleQuestionIds) assert.ok(coveredPuzzleIds.has(id), id);
  assert.deepEqual([...new Set(aptitudePatterns.map((pattern) => pattern.tier))], ['Start here', 'Next', 'Optional section']);
  for (const pattern of aptitudePatterns) {
    assert.ok(pattern.method.length >= 65, pattern.id);
    assert.ok(pattern.questionIds.length >= 3, pattern.id);
    assert.ok(pattern.sourceIds.length >= 2, pattern.id);
    assert.equal(new Set(pattern.sourceIds).size, pattern.sourceIds.length, pattern.id);
    for (const id of pattern.questionIds) assert.ok(questionIds.has(id), `${pattern.id}: ${id}`);
    for (const id of pattern.sourceIds) assert.ok(sourceById.has(id), `${pattern.id}: ${id}`);
    if (pattern.tier === 'Start here') {
      assert.ok(pattern.sourceIds.filter((id) => sourceById.get(id).type === 'candidate').length >= 3, pattern.id);
    }
  }
});

test('nine-ball decision tree distinguishes all balls and directions in three weighings', () => {
  const left = ['A', 'B', 'C'];
  const right = ['D', 'E', 'F'];
  const weigh = (scenario, leftPan, rightPan) => {
    const weight = (ball) => 10 + (ball === scenario.ball ? scenario.delta : 0);
    const difference = leftPan.reduce((sum, ball) => sum + weight(ball), 0)
      - rightPan.reduce((sum, ball) => sum + weight(ball), 0);
    return Math.sign(difference);
  };
  const sequences = new Set();
  for (const ball of [...left, ...right, 'G', 'H', 'I']) {
    for (const delta of [-1, 1]) {
      const scenario = { ball, delta };
      const first = weigh(scenario, left, right);
      let second;
      let third;
      if (first === 0) {
        second = weigh(scenario, ['G'], ['H']);
        third = weigh(scenario, second === 0 ? ['I'] : ['G'], ['A']);
      } else {
        second = weigh(scenario, ['A', 'D'], ['B', 'E']);
        const leftCandidate = second === 0 ? 'C' : second === first ? 'A' : 'B';
        third = weigh(scenario, [leftCandidate], ['G']);
      }
      sequences.add(`${first},${second},${third}`);
    }
  }
  assert.equal(sequences.size, 18);
});

test('aptitude route and both entry points are wired', async () => {
  assert.deepEqual(parseRoute(routeForAptitude()), { view: 'aptitude' });
  const app = await readFile(new URL('../src/App.jsx', import.meta.url), 'utf8');
  const library = await readFile(new URL('../src/components/LibraryView.jsx', import.meta.url), 'utf8');
  const aptitude = await readFile(new URL('../src/components/AptitudeView.jsx', import.meta.url), 'utf8');
  assert.match(app, /AptitudeView/);
  assert.match(app, /onClick=\{openAptitude\}/);
  assert.match(library, /onOpenAptitude/);
  assert.match(aptitude, /Puzzles <span>\{puzzleQuestionCount\}/);
});

import test from 'node:test';
import assert from 'node:assert/strict';
import { filterFolderQuestions, folderQuestions, folderSources, folderSourceById, normalizeQuestionText } from '../src/data/folderInterviewQuestions.js';
import { topicById } from '../src/data/curriculum.js';
import { parseRoute, routeForFolderQuestions } from '../src/data/routes.js';

test('folder provenance accounts for all 64 files and the four nested screenshots', () => {
  const files = folderSources.filter((s) => s.sha256);
  assert.equal(files.length, 64);
  assert.equal(new Set(files.map((s) => s.path)).size, 64);
  const archive = files.find((s) => s.kind === 'nested-archive');
  assert.equal(archive.children.length, 4);
  for (const child of archive.children) {
    assert.ok(folderSourceById.get(child).path.includes('.zip!/'));
    assert.ok(folderSourceById.get(child).questionIds.length);
  }
  const ids = new Set(folderQuestions.map((q) => q.id));
  assert.equal(ids.size, folderQuestions.length);
  for (const source of files) {
    assert.match(source.sha256, /^[a-f0-9]{64}$/);
    assert.ok(source.questionIds.length, source.path);
    for (const id of source.questionIds) assert.ok(ids.has(id), `${source.id}: ${id}`);
  }
  for (const q of folderQuestions) {
    assert.ok(q.sources.length, q.prompt);
    for (const c of q.sources) assert.ok(folderSourceById.has(c.sourceId), c.sourceId);
    if (q.topicId) assert.ok(topicById.has(q.topicId), q.topicId);
    if (q.status === 'clarify') assert.ok(q.clarification || q.answer, q.prompt);
  }
});

test('search combines topic, source, status and all query terms without leaking company results', () => {
  const chelsio = filterFolderQuestions({ company: 'chelsio', query: 'linked list' });
  assert.ok(chelsio.length);
  assert.ok(chelsio.every((q) => q.company === 'chelsio' || q.company === 'shared'));
  const nested = filterFolderQuestions({ company: 'qualcomm', sourceId: 'S064', query: 'DAM DESIGN' });
  assert.equal(nested.length, 1);
  assert.equal(nested[0].examples.length, 3);
  assert.equal(filterFolderQuestions({ company: 'qualcomm', query: 'nonexistentphrase123' }).length, 0);
  const clarified = filterFolderQuestions({ company: 'qualcomm', status: 'clarify' });
  assert.ok(clarified.length > 0);
  assert.ok(clarified.every((q) => q.status === 'clarify'));
  assert.ok(filterFolderQuestions({ company: 'chelsio', sourceId: 'S015' }).length);
  assert.equal(normalizeQuestionText('Café — MAC/IP'), 'cafe mac ip');
});

test('user recollections and incomplete titles remain distinct from company reports', () => {
  const user = folderQuestions.filter((q) => q.status === 'user-recalled');
  assert.equal(user.length, 2);
  assert.ok(user.every((q) => q.company === 'shared' && q.sources[0].sourceId === 'U001'));
  assert.ok(user.some((q) => /camera/i.test(q.prompt) && /expected|observable/.test(q.answer)));
  assert.ok(user.some((q) => /terminal/i.test(q.prompt) && /pause/.test(q.code)));
  assert.ok(folderQuestions.some((q) => /Number of moves/.test(q.prompt) && q.status === 'clarify'));
});

test('both company routes round-trip; longer unknown paths retain the existing fallback', () => {
  for (const company of ['chelsio', 'qualcomm']) {
    assert.deepEqual(parseRoute(routeForFolderQuestions(company)), { view: 'folder-questions', company });
  }
  assert.deepEqual(parseRoute('#/chelsio/unknown'), { view: 'library' });
});

test('image-based code questions retain code rather than empty output-question placeholders', () => {
  const mcqs = folderQuestions.filter((q) => q.sources.some((c) => c.sourceId === 'S057'));
  assert.ok(mcqs.filter((q) => q.code).length >= 9);
  assert.ok(mcqs.some((q) => /register/.test(q.code ?? '') && /diagnostic/.test(q.answer)));
  assert.ok(folderQuestions.some((q) => /Nodes\[8\]->data/.test(q.prompt) && /Nodes\[8\]\.data/.test(q.answer)));
  assert.ok(!folderQuestions.some((q) => /^What is the output of the following program\?$/.test(q.prompt)));
});


test('topic matching does not mistake literals, swapping or context switching for networking', () => {
  const find = (text) => folderQuestions.find((q) => q.prompt === text);
  assert.equal(find('Set a bit').topicId, 'qualcomm-c-bits-endian');
  assert.equal(find('Explain context switching in detail.').topicId, 'os-scheduling');
  assert.equal(find('What is swapping? Explain with details').topicId, 'qualcomm-linux-kernel-vm');
  assert.equal(find('Compare returning a pointer to a string literal with a pointer to a local array.').area, 'C & C++');
  const switches = folderQuestions.find((q) => q.prompt.startsWith('Three switches control three incandescent bulbs'));
  assert.equal(switches.area, 'Logic & puzzles');
  assert.notEqual(switches.topicId, 'net-ethernet');
});

test('the published dam implementation matches all linked examples and brute-force height bounds', async () => {
  const { spawnSync } = await import('node:child_process');
  const dam = folderQuestions.find((q) => q.sources[0].sourceId === 'S064');
  const script = `${dam.code}\nimport json\nexamples = json.loads(${JSON.stringify(JSON.stringify(dam.examples))})\nfor e in examples:\n    assert max_mud_height(e['positions'],e['heights']) == e['expected']\nfor a in range(9):\n    for b in range(9):\n        for distance in range(1,13):\n            expected = max((min(a+t,b+distance-t) for t in range(1,distance)), default=0)\n            assert max_mud_height([0,distance],[a,b]) == expected\nassert max_mud_height([],[]) == 0\nassert max_mud_height([5],[9]) == 0\nassert max_mud_height([10,1],[5,1]) == 7\ntry:\n    max_mud_height([1,1],[2,3])\n    raise AssertionError('duplicate positions accepted')\nexcept ValueError:\n    pass\n`;
  const result = spawnSync('python', ['-c', script], { encoding: 'utf8', timeout: 10000 });
  assert.equal(result.status, 0, result.stderr);
});

test('external exercises have the common tag and remain separately filterable', () => {
  const questions = filterFolderQuestions({ company: 'qualcomm', status: 'practice' });
  assert.equal(questions.length, 126);
  assert.ok(questions.every((q) => q.tag === 'External practice' && q.answer && q.sources.length));
  assert.ok(!questions.some((q) => q.status === 'reported'));
});


test('online reports have explicit provenance and a separate statement filter', () => {
  const entries = filterFolderQuestions({ company: 'qualcomm', status: 'reported-online' });
  assert.equal(entries.length, 43);
  for (const q of entries) {
    assert.equal(q.tag, 'External practice');
    assert.ok(q.references.length && q.answer);
    assert.equal(folderSourceById.get(q.sources[0].sourceId).kind, 'candidate-report');
  }
  assert.equal(filterFolderQuestions({ company: 'chelsio', status: 'reported-online' }).length, 0);
});

test('new C11 quizzes distinguish defined output from undefined behavior', async () => {
  const { mkdtempSync, writeFileSync, rmSync } = await import('node:fs');
  const { tmpdir } = await import('node:os');
  const { join } = await import('node:path');
  const { spawnSync } = await import('node:child_process');
  const quizzes = folderQuestions.filter((q) => q.quizKind);
  assert.equal(quizzes.length, 16);
  const dir = mkdtempSync(join(tmpdir(), 'leetcards-c-quizzes-'));
  try {
    for (const q of quizzes) {
      assert.equal(q.area, 'C & C++');
      assert.equal(q.tag, 'External practice');
      if (q.quizKind === 'undefined') {
        assert.equal(q.expectedOutput, undefined);
        assert.match(q.answer, /undefined/i);
        continue; // An observed output cannot validate undefined behavior.
      }
      const source = join(dir, 'quiz.c');
      const binary = join(dir, 'quiz');
      writeFileSync(source, q.code);
      for (const optimization of ['-O0', '-O2']) {
        const compile = spawnSync('cc', ['-std=c11', '-pedantic-errors', optimization, source, '-o', binary], { encoding: 'utf8', timeout: 10000 });
        assert.equal(compile.status, 0, `${q.prompt}: ${compile.stderr}`);
        const run = spawnSync(binary, [], { encoding: 'utf8', timeout: 2000 });
        assert.equal(run.status, 0, q.prompt);
        assert.equal(run.stdout, q.expectedOutput, `${q.prompt}: ${optimization}`);
      }
    }
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

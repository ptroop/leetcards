import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  decodeCapturePayload,
  encodeCapturePayload,
  validateCapturePayload,
  validateProfileImportPayload,
} from '../src/data/capture.js';
import { problemFamilySpecs } from '../src/data/dsaProblemFamilies.js';
import {
  matchCapturedQuestion,
  questionById,
  questionCards,
  searchQuestionCards,
} from '../src/data/questionCards.js';
import {
  getLeetcodeProblemLesson,
  leetcodeProblemLessons,
} from '../src/data/leetcodeProblemLessons.js';
import {
  parseRoute,
  routeForCapture,
  routeForProblem,
  routeForQuestion,
  routeForQuestions,
} from '../src/data/routes.js';

const projectRoot = fileURLToPath(new URL('..', import.meta.url));

const maximumSubarrayCapture = {
  version: 1,
  provider: 'leetcode',
  slug: 'maximum-subarray',
  title: 'Maximum Subarray',
  difficulty: 'medium',
  tags: ['Array', 'Dynamic Programming'],
  url: 'https://leetcode.com/problems/maximum-subarray/',
  capturedAt: '2026-07-25T06:30:00.000Z',
};

const profileImport = {
  version: 2,
  provider: 'leetcode',
  kind: 'solved-profile',
  problems: [
    {
      slug: 'maximum-subarray',
      title: 'Maximum Subarray',
      language: 'C++',
      code: 'class Solution { public: int maxSubArray(vector<int>& nums); };',
    },
    {
      slug: 'coin-change',
      title: 'Coin Change',
      language: 'C',
      code: 'int coinChange(int *coins, int count, int amount);',
    },
  ],
};

test('every authored problem family becomes a complete question card', () => {
  assert.equal(questionCards.length, Object.keys(problemFamilySpecs).length);
  assert.equal(questionById.size, questionCards.length);

  for (const card of questionCards) {
    assert.ok(card.title.length > 4, `${card.id} has no title`);
    assert.ok(card.summary.length > 40, `${card.id} has a weak summary`);
    assert.ok(card.recognition.length > 15, `${card.id} has no recognition clue`);
    assert.ok(card.invariant.length > 30, `${card.id} has no invariant`);
    assert.ok(card.move.length > 15, `${card.id} has no state move`);
    assert.ok(card.boundary.length > 15, `${card.id} has no misuse boundary`);
    assert.match(card.complexity, /O\(|Exponential/i, `${card.id} has no complexity`);
    assert.ok(card.cCode.length > 20, `${card.id} has no C implementation`);
    assert.ok(card.cppCode.length > 20, `${card.id} has no C++ implementation`);
    assert.ok(card.visual.frames.length >= 5, `${card.id} has no complete trace`);
    assert.equal(card.flashcards.length, 5, `${card.id} has incomplete recall cards`);
    assert.ok(card.teachingPattern.definition.length > 120, `${card.id} has no pattern definition`);
    assert.ok(card.correctness.length > 80, `${card.id} has no correctness argument`);
    assert.ok(card.derivation.length >= 5, `${card.id} has no derivation`);
  }
});

test('every authored problem has its own detailed problem lesson', () => {
  assert.ok(leetcodeProblemLessons.length >= 139);
  assert.equal(
    new Set(leetcodeProblemLessons.map((lesson) => lesson.slug)).size,
    leetcodeProblemLessons.length,
  );

  for (const lesson of leetcodeProblemLessons) {
    assert.match(lesson.slug, /^[a-z0-9]+(?:-[a-z0-9]+)*$/);
    assert.ok(lesson.problem.length >= 45, `${lesson.slug} has no plain-language problem`);
    assert.ok(lesson.bruteForce.length >= 45, `${lesson.slug} has no baseline`);
    assert.ok(lesson.keyObservation.length >= 70, `${lesson.slug} has no turning point`);
    assert.ok(lesson.pattern.definition.length >= 120, `${lesson.slug} has no pattern definition`);
    assert.ok(lesson.pattern.invariant.length >= 60, `${lesson.slug} has no invariant`);
    assert.ok(lesson.derivation.length >= 6, `${lesson.slug} has no causal derivation`);
    assert.ok(lesson.example.length >= 1, `${lesson.slug} has no worked trace`);
    assert.ok(lesson.correctness.length >= 80, `${lesson.slug} has no correctness explanation`);
    assert.match(lesson.complexity, /O\(/, `${lesson.slug} has no target complexity`);
    assert.ok(lesson.edgeCases.length >= 2, `${lesson.slug} has no edge-case defense`);
    assert.ok(lesson.pitfalls.length >= 3, `${lesson.slug} has no mistake defense`);
  }
});

test('Kadane lesson derives the recurrence and handles the cases that generic summaries miss', () => {
  const kadane = getLeetcodeProblemLesson('maximum-subarray');
  const text = JSON.stringify(kadane);

  assert.match(kadane.bruteForce, /O\(n²\)/);
  assert.match(kadane.keyObservation, /start at `a\[i\]`|extend the best/i);
  assert.match(kadane.pattern.invariant, /bestEnding/);
  assert.match(kadane.implementation, /bestEnding=max\(x,bestEnding\+x\)/);
  assert.match(text, /all-negative/i);
  assert.match(text, /illegal empty subarray/i);
  assert.match(text, /-2, 1, -2, 4, 3, 5, 6, 1, 5/);
  assert.match(kadane.correctness, /exhaustive cases/i);
});

test('every imported editorial exposes the complete problem-specific teaching sequence', () => {
  for (const lesson of leetcodeProblemLessons) {
    for (const key of [
      'restatement', 'exampleTrace', 'bruteForce', 'insight', 'patternId',
      'invariant', 'derivation', 'efficientTrace', 'code', 'complexity',
      'wrongApproaches', 'edgeCases', 'solutionComparison',
    ]) {
      const value = lesson[key];
      assert.ok(
        typeof value === 'string' ? value.length > 0 : value && Object.keys(value).length > 0,
        `${lesson.slug}: ${key}`,
      );
    }
  }
});

test('question search covers titles, aliases, constraints, and groups', () => {
  assert.equal(searchQuestionCards('maximum subarray')[0].id, 'dsa-kadane');
  assert.equal(searchQuestionCards('house robber')[0].id, 'dsa-dp-take-skip');
  assert.equal(searchQuestionCards('two sum ii')[0].id, 'dsa-two-pointers');
  assert.equal(searchQuestionCards('maximum average subarray')[0].id, 'dsa-sliding');
  assert.ok(searchQuestionCards('backtracking').length >= 3);
  assert.equal(searchQuestionCards('no matching question').length, 0);
});

test('safe captures match only supported questions', () => {
  assert.equal(matchCapturedQuestion(maximumSubarrayCapture)?.id, 'dsa-kadane');
  assert.equal(matchCapturedQuestion({
    ...maximumSubarrayCapture,
    slug: 'coin-change-ii',
    title: 'Coin Change II',
    url: 'https://leetcode.com/problems/coin-change-ii/',
  })?.id, 'dsa-coin-change-ways');
  assert.equal(matchCapturedQuestion({
    ...maximumSubarrayCapture,
    slug: 'two-sum-ii-input-array-is-sorted',
    title: 'Two Sum II - Input Array Is Sorted',
    url: 'https://leetcode.com/problems/two-sum-ii-input-array-is-sorted/',
  })?.id, 'dsa-two-pointers');
  assert.equal(matchCapturedQuestion({
    ...maximumSubarrayCapture,
    slug: 'maximum-average-subarray-i',
    title: 'Maximum Average Subarray I',
    url: 'https://leetcode.com/problems/maximum-average-subarray-i/',
  })?.id, 'dsa-sliding');
  assert.equal(matchCapturedQuestion({
    ...maximumSubarrayCapture,
    slug: 'design-a-number-container-system',
    title: 'Design a Number Container System',
    url: 'https://leetcode.com/problems/design-a-number-container-system/',
  }), null);
});

test('capture payloads round-trip and reject untrusted sources', () => {
  const encoded = encodeCapturePayload(maximumSubarrayCapture);
  assert.deepEqual(decodeCapturePayload(encoded), maximumSubarrayCapture);

  assert.throws(
    () => validateCapturePayload({
      ...maximumSubarrayCapture,
      url: 'https://example.com/problems/maximum-subarray/',
    }),
    /must come from leetcode\.com/,
  );
  assert.throws(
    () => validateCapturePayload({
      ...maximumSubarrayCapture,
      slug: 'different-problem',
    }),
    /slug does not match/,
  );
  assert.throws(
    () => decodeCapturePayload('a'.repeat(16_001)),
    /too large/,
  );
});

test('bulk profile imports retain only one accepted implementation per unique problem', () => {
  assert.deepEqual(validateProfileImportPayload(profileImport), profileImport);

  assert.throws(
    () => validateProfileImportPayload({
      ...profileImport,
      problems: [...profileImport.problems, profileImport.problems[0]],
    }),
    /repeats maximum-subarray/,
  );
  assert.throws(
    () => validateProfileImportPayload({
      ...profileImport,
      problems: [{
        ...profileImport.problems[0],
        slug: '../account',
      }],
    }),
    /invalid slug/,
  );
  assert.throws(
    () => validateProfileImportPayload({
      ...profileImport,
      problems: [{
        ...profileImport.problems[0],
        code: '',
      }],
    }),
    /has no accepted code/,
  );
  assert.deepEqual(
    Object.keys(validateProfileImportPayload(profileImport)),
    ['version', 'provider', 'kind', 'problems'],
  );
});

test('question and capture routes are explicit and reversible', () => {
  assert.equal(routeForQuestions(), '#/questions');
  assert.deepEqual(parseRoute(routeForQuestions()), { view: 'questions' });
  assert.deepEqual(
    parseRoute(routeForQuestion('dsa-kadane')),
    { view: 'question', questionId: 'dsa-kadane' },
  );
  assert.equal(routeForProblem('maximum-subarray'), '#/problem/maximum-subarray');
  assert.deepEqual(
    parseRoute(routeForProblem('maximum-subarray')),
    { view: 'problem', slug: 'maximum-subarray' },
  );

  const payload = encodeCapturePayload(maximumSubarrayCapture);
  assert.deepEqual(
    parseRoute(routeForCapture(payload)),
    { view: 'capture', payload },
  );
});

test('safe extension uses temporary active-tab access only', async () => {
  const manifest = JSON.parse(
    await readFile(join(projectRoot, 'extension', 'manifest.json'), 'utf8'),
  );
  const popup = await readFile(join(projectRoot, 'extension', 'popup.js'), 'utf8');
  const popupHtml = await readFile(join(projectRoot, 'extension', 'popup.html'), 'utf8');
  const profileImporter = await readFile(
    join(projectRoot, 'extension', 'profile-import.js'),
    'utf8',
  );
  const profileImporterHtml = await readFile(
    join(projectRoot, 'extension', 'profile-import.html'),
    'utf8',
  );

  assert.equal(manifest.manifest_version, 3);
  assert.equal(manifest.version, '1.1.0');
  assert.deepEqual(manifest.permissions, ['activeTab', 'scripting']);
  assert.equal(manifest.host_permissions, undefined);
  assert.equal(manifest.optional_host_permissions, undefined);
  assert.doesNotMatch(JSON.stringify(manifest), /cookies|history|webRequest|<all_urls>|incognito/i);
  assert.match(manifest.content_security_policy.extension_pages, /script-src 'self'/);
  assert.match(manifest.content_security_policy.extension_pages, /object-src 'none'/);
  assert.deepEqual(Object.keys(manifest.icons), ['16', '32', '48', '128']);
  for (const icon of Object.values(manifest.icons)) {
    const contents = await readFile(join(projectRoot, 'extension', icon));
    assert.deepEqual([...contents.subarray(0, 8)], [137, 80, 78, 71, 13, 10, 26, 10]);
  }
  assert.match(popup, /location\.origin !== 'https:\/\/leetcode\.com'/);
  assert.match(popup, /world: 'ISOLATED'/);
  assert.doesNotMatch(popup, /\bfetch\s*\(|XMLHttpRequest|document\.cookie|chrome\.cookies/);
  assert.doesNotMatch(popupHtml, /<script[^>]+src=["']https?:\/\//i);
  assert.match(profileImporter, /location\.origin !== 'https:\/\/leetcode\.com'/);
  assert.match(profileImporter, /world: 'ISOLATED'/);
  assert.match(profileImporter, /\/api\/submissions\/\?offset=/);
  assert.match(profileImporter, /requestJson\('\/graphql\/'/);
  assert.match(profileImporter, /status_display !== 'Accepted'/);
  assert.match(profileImporter, /credentials: 'include'/);
  assert.match(profileImporter, /MAX_PROBLEMS = 5_000/);
  assert.match(profileImporter, /MAX_TOTAL_CODE_LENGTH = 25_000_000/);
  assert.doesNotMatch(profileImporter, /document\.cookie|chrome\.cookies|localStorage|sessionStorage/);
  assert.doesNotMatch(
    profileImporter,
    /https?:\/\/(?!(?:leetcode\.com|ptroop\.github\.io))/,
  );
  assert.match(popup, /https:\/\/ptroop\.github\.io\/leetcards\/#\/capture\//);
  assert.match(profileImporterHtml, /https:\/\/ptroop\.github\.io\/leetcards\/#\/questions/);
  assert.doesNotMatch(`${popup}\n${profileImporterHtml}`, /rooptr\.github\.io/);
  assert.doesNotMatch(profileImporterHtml, /<script[^>]+src=["']https?:\/\//i);
});

test('Questions opens dedicated problem lessons and keeps accepted code as local text', async () => {
  const view = await readFile(
    join(projectRoot, 'src', 'components', 'QuestionsView.jsx'),
    'utf8',
  );
  const reader = await readFile(
    join(projectRoot, 'src', 'components', 'QuestionReader.jsx'),
    'utf8',
  );
  const problemReader = await readFile(
    join(projectRoot, 'src', 'components', 'ProblemLessonReader.jsx'),
    'utf8',
  );
  const hook = await readFile(
    join(projectRoot, 'src', 'hooks', 'useCapturedQuestions.js'),
    'utf8',
  );

  assert.match(view, /accept="application\/json,\.json"/);
  assert.match(view, /Bring in every solved problem at once/);
  assert.match(hook, /validateProfileImportPayload/);
  assert.match(hook, /getLeetcodeProblemLesson/);
  assert.match(hook, /saveCapturedQuestions/);
  assert.match(hook, /record\.problemSlug \|\| record\.questionId/);
  assert.match(reader, /Your accepted code/);
  assert.match(reader, /<pre><code>\{capture\.code\}<\/code><\/pre>/);
  assert.doesNotMatch(reader, /dangerouslySetInnerHTML/);
  assert.doesNotMatch(reader, /How to solve it/);
  assert.match(problemReader, /Begin with the obvious idea/);
  assert.match(problemReader, /The turning point/);
  assert.match(problemReader, /Pattern definition/);
  assert.match(problemReader, /Interactive derivation/);
  assert.match(problemReader, /Worked trace/);
  assert.match(problemReader, /Why this is correct/);
  assert.match(problemReader, /Target complexity/);
  assert.match(problemReader, /Your accepted implementation/);
  assert.doesNotMatch(problemReader, /dangerouslySetInnerHTML/);
});

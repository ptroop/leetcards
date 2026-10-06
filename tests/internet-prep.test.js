import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import {
  qualcommIndiaReportedQuestions,
  qualcommIndiaWebAudit,
  qualcommIndiaWebSources,
} from '../src/data/qualcommIndiaWebQuestions.js';
import { completeQualcommAnswer } from '../src/data/qualcommInterviewAnswers.js';
import { parseRoute, routeForInternet } from '../src/data/routes.js';

test('the public Qualcomm India archive is broad, deduplicated, and source-linked', () => {
  assert.equal(qualcommIndiaWebAudit.questionCount, 264);
  assert.equal(qualcommIndiaWebAudit.sourceCount, 38);
  assert.equal(qualcommIndiaWebAudit.highConfidenceSourceCount, 25);
  assert.ok(qualcommIndiaWebAudit.repeatedQuestionCount > 50);
  assert.equal(qualcommIndiaWebAudit.reviewedThrough, '22 September 2026');
  assert.equal(new Set(qualcommIndiaWebSources.map((source) => source.id)).size, 38);
  assert.equal(new Set(qualcommIndiaWebSources.map((source) => source.url)).size, 38);
  assert.equal(new Set(qualcommIndiaReportedQuestions.map((question) => question.id)).size, 264);

  const sourceIds = new Set(qualcommIndiaWebSources.map((source) => source.id));
  for (const question of qualcommIndiaReportedQuestions) {
    assert.ok(question.prompt.length >= 10, `${question.id} has a malformed prompt`);
    assert.ok(question.answerFocus.length >= 45, `${question.id} has a shallow answer map`);
    assert.ok(question.sources.length > 0, `${question.id} has no source`);
    for (const sourceId of question.sources) {
      assert.ok(sourceIds.has(sourceId), `${question.id} cites unknown ${sourceId}`);
    }
  }
});

test('the archive excludes unknown dumps and labels community evidence explicitly', () => {
  const publishers = new Set(qualcommIndiaWebSources.map((source) => source.publisher));
  assert.equal(qualcommIndiaWebSources.some((source) => source.confidence === 'low'), false);
  assert.equal([...publishers].some((publisher) => /quora/i.test(publisher)), false);

  for (const source of qualcommIndiaWebSources) {
    assert.match(
      source.url,
      /^https:\/\/(?:www\.)?(?:geeksforgeeks\.org|leetcode\.com|jointaro\.com|glassdoor\.(?:com|co\.in)|ambitionbox\.com|naukri\.com|oahelper\.in|reddit\.com)\//,
      `unreviewed source domain: ${source.url}`,
    );
  }
});

test('every reported question has a complete interview answer, not an answer map', () => {
  for (const question of qualcommIndiaReportedQuestions) {
    const answer = completeQualcommAnswer(question);
    assert.ok(answer.direct.length >= 50, `${question.id}: direct answer`);
    assert.ok(answer.foundation.length >= 70, `${question.id}: foundation`);
    assert.ok(answer.mechanism.length >= 2, `${question.id}: mechanism`);
    assert.ok(answer.failure, `${question.id}: failure boundary`);
  }
});

test('reported coverage includes the requested embedded-systems interview areas', () => {
  const searchable = qualcommIndiaReportedQuestions
    .map((question) => `${question.prompt} ${question.answerFocus}`)
    .join('\n');

  for (const pattern of [
    /\bvolatile\b/i,
    /\bmemmove\b/i,
    /\bstruct\b/i,
    /C\+\+/i,
    /\bprocess\b/i,
    /\bvirtual memory\b/i,
    /\bmutex\b/i,
    /\bdevice driver\b/i,
    /\bDMA\b/i,
    /\bRTOS\b/i,
    /\binterrupt\b/i,
    /\bI2C\b/i,
    /\bSPI\b/i,
    /\bUART\b/i,
    /\bTCP\b/i,
    /\blinked list\b/i,
    /\bproject\b/i,
  ]) {
    assert.match(searchable, pattern);
  }
});

test('the internet archive has a dedicated top-level route and visible top action', async () => {
  assert.deepEqual(parseRoute('#/internet'), { view: 'internet' });
  assert.equal(routeForInternet(), '#/internet');

  const app = await readFile(new URL('../src/App.jsx', import.meta.url), 'utf8');
  const view = await readFile(
    new URL('../src/components/InternetPrepView.jsx', import.meta.url),
    'utf8',
  );

  assert.match(app, />From the internet</);
  assert.match(app, /<InternetPrepView/);
  assert.match(view, /speculation and[\s\S]*unknown question-dump sites are excluded/);
  assert.match(view, /Study the full explanation/);
  assert.match(view, /Direct answer/);
  assert.match(view, /What is happening underneath/);
  assert.match(view, /target="_blank"/);
});

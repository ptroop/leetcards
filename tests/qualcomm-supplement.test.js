import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { qualcommIndiaReportedQuestions, qualcommIndiaWebAudit, qualcommIndiaWebSourceById } from '../src/data/qualcommInternetCollection.js';
import { supplementalQualcommQuestions } from '../src/data/qualcommInternetSupplement.js';
import { completeQualcommAnswer } from '../src/data/qualcommInterviewAnswers.js';
import { lessonByTopicId } from '../src/data/lessonCatalog.js';

test('supplement keeps source-role boundaries and gives each new prompt a worked answer', () => {
  assert.equal(qualcommIndiaWebAudit.sourceCount, 42);
  assert.equal(qualcommIndiaWebAudit.questionCount, 273);
  assert.equal(supplementalQualcommQuestions.length, 9);
  assert.equal(new Set(qualcommIndiaReportedQuestions.map((question) => question.id)).size, 273);
  for (const question of supplementalQualcommQuestions) {
    assert.ok(question.sources.every((id) => qualcommIndiaWebSourceById.has(id)), question.id);
    const answer = completeQualcommAnswer(question);
    assert.ok(answer.direct.length >= 70, question.id);
    assert.ok(answer.foundation.length >= 70, question.id);
    assert.ok(answer.mechanism.length >= 3, question.id);
    assert.ok(answer.failure.length >= 50, question.id);
    assert.ok(answer.lessonId && lessonByTopicId.has(answer.lessonId), question.id);
  }
  const hardware = qualcommIndiaWebSourceById.get('gfg-hardware-campus-2025');
  assert.match(hardware.role, /not firmware-role evidence/);
  assert.ok(supplementalQualcommQuestions
    .filter((question) => question.topicId.startsWith('electronics-'))
    .every((question) => question.sources.includes(hardware.id)));
});

test('shell and Linux driver gaps have authored general lessons alongside local Qualcomm Prep', async () => {
  for (const id of ['os-shell-scripting', 'os-driver-model', 'os-driver-interrupts', 'os-driver-debugging', 'electronics-logic-levels', 'electronics-setup-hold']) {
    const lesson = lessonByTopicId.get(id);
    assert.ok(lesson, id);
    assert.equal(lesson.contentSource, 'authored-record');
    assert.ok(lesson.blocks.some((block) => block.type === 'failure-table'));
  }
  const localProfiles = await readFile(new URL('../src/data/qualcommPrepProfilesLinux.js', import.meta.url), 'utf8');
  assert.match(localProfiles, /'qualcomm-linux-shell-tools'/);
  assert.match(localProfiles, /'qualcomm-linux-shell-programs'/);
});

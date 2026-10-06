import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { commonInterviewCommunityReading, commonInterviewGroups, commonInterviewSources } from '../src/data/commonInterviewQuestions.js';
import { curriculum, topicById } from '../src/data/topics.js';
import { getLeetcodeProblemLesson } from '../src/data/leetcodeProblemLessons.js';
import { questionById } from '../src/data/questionCards.js';
import { parseRoute, routeForCommonInterviews } from '../src/data/routes.js';

test('common interview practice covers the retained patterns with an authored destination', () => {
  assert.ok(commonInterviewGroups.length >= 15);
  const entries = commonInterviewGroups.flatMap((group) => group.questions);
  assert.ok(entries.length >= 90);
  assert.equal(new Set(entries.map((item) => item.id)).size, entries.length);
  for (const group of commonInterviewGroups) {
    assert.ok(group.questions.length >= 2, group.name);
    for (const item of group.questions) {
      assert.ok(item.title && item.summary, `${group.name}: incomplete question`);
      if (item.destination === 'problem') assert.ok(getLeetcodeProblemLesson(item.slug), item.id);
      else if (item.destination === 'question') assert.ok(questionById.get(item.questionId), item.id);
      else assert.equal(topicById.get(item.topicId)?.sectionId, 'dsa', item.id);
    }
  }
  assert.deepEqual(parseRoute(routeForCommonInterviews()), { view: 'common-interviews' });
});

test('current DSA curriculum omits general trees and graphs while retaining basic BST', () => {
  const dsa = curriculum.find((section) => section.id === 'dsa');
  const ids = dsa.topics.map((topic) => topic.id);
  assert.ok(ids.includes('dsa-bst'));
  for (const id of ['dsa-bst-search', 'dsa-bst-insert', 'dsa-bst-validate', 'dsa-bst-delete']) {
    assert.ok(ids.includes(id), id);
  }
  assert.ok(ids.every((id) => !id.startsWith('dsa-tree-')));
  assert.ok(ids.every((id) => !['dsa-binary-tree', 'dsa-avl', 'dsa-red-black', 'dsa-bst-kth-smallest', 'dsa-bst-lca'].includes(id)));
  const collection = commonInterviewGroups.flatMap((group) => group.questions);
  assert.ok(collection.every((item) => !/graph|trie|^dsa-tree-|symmetric-tree|same-tree/.test(item.id)));
});

test('the new tab is reachable from navigation and has searchable sections', async () => {
  const app = await readFile(new URL('../src/App.jsx', import.meta.url), 'utf8');
  const view = await readFile(new URL('../src/components/CommonInterviewView.jsx', import.meta.url), 'utf8');
  assert.match(app, /Common interviews/);
  assert.match(app, /<CommonInterviewView/);
  assert.match(view, /type="search"/);
  assert.match(view, /onOpenProblem/);
  assert.match(view, /onOpenQuestion/);
  assert.match(view, /onOpenLesson/);
});

test('Striver cross-check adds distinct worked questions and keeps anecdote separate from evidence', () => {
  const ids = new Set(commonInterviewGroups.flatMap((group) => group.questions.map((item) => item.id)));
  for (const id of ['subarray-sum-equals-k', 'majority-element-ii', 'next-permutation']) {
    assert.ok(ids.has(id), id);
    const lesson = getLeetcodeProblemLesson(id);
    assert.ok(lesson.example.length >= 2 && lesson.edgeCases.length >= 3, id);
  }
  assert.ok(commonInterviewSources.some((source) => source.url.includes('strivers-75-sheet')));
  assert.ok(commonInterviewSources.every((source) => !source.url.includes('reddit.com')));
  assert.ok(commonInterviewCommunityReading.every((source) => source.url.includes('reddit.com')));
});

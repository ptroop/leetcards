import { allTopics } from '../src/data/topics.js';
import { lessons } from '../src/data/lessonCatalog.js';
import { isProtectedTopic } from '../src/data/coreLessonRegistry.js';
import { qualcommIndiaReportedQuestions } from '../src/data/qualcommIndiaWebQuestions.js';
import { completeQualcommAnswer } from '../src/data/qualcommInterviewAnswers.js';

const lessonById = new Map(lessons.map((lesson) => [lesson.topicId, lesson]));
const failures = [];
const slopPatterns = [
  /\bdelve(?:s|d|ing)?\b/i,
  /\btapestry\b/i,
  /\bin today'?s (?:fast-paced|digital|ever-changing) world\b/i,
  /\bit is important to note\b/i,
  /\bunlock (?:the|its) (?:power|potential)\b/i,
  /\bgame[- ]changer\b/i,
  /\bever-evolving landscape\b/i,
  /\bseamlessly (?:integrates?|blends?)\b/i,
  /\bcomprehensive guide\b/i,
];

const flattenedText = (value) => JSON.stringify(value)
  .replaceAll('\\n', ' ')
  .replaceAll('\\t', ' ');

for (const lesson of lessons) {
  const lessonText = flattenedText(lesson);
  if ((lesson.summary?.trim().length ?? 0) < 45) {
    failures.push(`${lesson.topicId}: summary is too shallow`);
  }
  for (const pattern of slopPatterns) {
    if (pattern.test(lessonText)) failures.push(`${lesson.topicId}: filler phrase ${pattern}`);
  }
}

for (const topic of allTopics.filter((entry) => !isProtectedTopic(entry))) {
  const lesson = lessonById.get(topic.id);
  if (!lesson) continue;
  const types = new Set(lesson.blocks.map((block) => block.type));
  for (const required of ['definition', 'steps', 'application', 'recall-list']) {
    if (!types.has(required)) failures.push(`${topic.id}: missing ${required}`);
  }
  if (topic.level !== 'brief' && !types.has('worked-example')) {
    failures.push(`${topic.id}: missing worked example`);
  }
  if (topic.level === 'deep') {
    if (!types.has('failure-table')) failures.push(`${topic.id}: missing failure diagnosis`);
    const verification = lesson.blocks.find(
      (block) => block.type === 'steps' && block.heading === 'How to verify it',
    );
    if (!verification?.items?.length) failures.push(`${topic.id}: missing verification steps`);
  }
}

for (const question of qualcommIndiaReportedQuestions) {
  const answer = completeQualcommAnswer(question);
  if (answer.direct.length < 50) failures.push(`${question.id}: direct answer is too shallow`);
  if (answer.foundation.length < 70) failures.push(`${question.id}: missing conceptual foundation`);
  if (answer.mechanism.length < 2) failures.push(`${question.id}: missing causal mechanism`);
  if (!answer.failure) failures.push(`${question.id}: missing interview trap or failure boundary`);
  if (!question.sources.length) failures.push(`${question.id}: missing provenance`);
}

if (failures.length) {
  console.error(`Writing-quality audit failed (${failures.length}):`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exitCode = 1;
} else {
  console.log(`Writing-quality audit passed: ${lessons.length} lessons and ${qualcommIndiaReportedQuestions.length} reported interview answers.`);
}

import { allTopics } from '../src/data/topics.js';
import { lessons } from '../src/data/lessonCatalog.js';
import { validateLesson } from '../src/data/contentModel.js';
import { isProtectedTopic } from '../src/data/coreLessonRegistry.js';
import { technicalSketchById } from '../src/data/technicalSketches.js';

const lessonById = new Map(lessons.map((lesson) => [lesson.topicId, lesson]));
const failures = [];
const counts = new Map();
let protectedCount = 0;

for (const topic of allTopics) {
  if (isProtectedTopic(topic)) {
    protectedCount += 1;
    continue;
  }

  const lesson = lessonById.get(topic.id);
  if (!lesson) {
    failures.push(`${topic.id}: missing lesson`);
    continue;
  }

  counts.set(topic.sectionId, (counts.get(topic.sectionId) ?? 0) + 1);
  if (lesson.contentSource !== 'authored-record') {
    failures.push(`${topic.id}: ${lesson.contentSource ?? 'unknown'} source`);
  }

  const validation = validateLesson(lesson);
  if (!validation.valid) {
    failures.push(`${topic.id}: invalid lesson (${validation.errors.join(', ')})`);
  }

  if (topic.level === 'deep') {
    const sketch = lesson.blocks.find((block) => block.type === 'technical-sketch');
    if (!sketch?.sketchId || !technicalSketchById.has(sketch.sketchId)) {
      failures.push(`${topic.id}: missing validated technical sketch`);
    }
  }

  for (const pair of lesson.blocks.filter((block) => block.type === 'code-pair')) {
    const ids = pair.variants.map((variant) => variant.id);
    if (topic.id === 'os-shell-scripting') {
      if (ids.length !== 1 || ids[0] !== 'sh') {
        failures.push(`${topic.id}: shell lesson must retain its POSIX shell implementation`);
      }
    } else if (topic.sectionId !== 'cpp' && (!ids.includes('c') || !ids.includes('cpp'))) {
      failures.push(`${topic.id}: code pair must include C and C++`);
    }
  }
}

for (const [section, count] of [...counts].sort()) {
  console.log(`${section}: ${count} authored lessons`);
}
console.log(`protected legacy lessons: ${protectedCount}`);

if (failures.length) {
  console.error(`\nCurriculum audit failed (${failures.length}):`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exitCode = 1;
} else {
  console.log(`Authored curriculum audit passed: ${[...counts.values()].reduce((a, b) => a + b, 0)} lessons.`);
}

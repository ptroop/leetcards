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

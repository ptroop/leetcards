import { allTopics } from '../topics.js';
import { profileBackedLesson } from './profileBackedLesson.js';

export const stm32Lessons = Object.freeze(
  allTopics.filter((topic) => topic.sectionId === 'stm32').map(profileBackedLesson),
);

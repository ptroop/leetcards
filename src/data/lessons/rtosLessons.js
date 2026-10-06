import { allTopics } from '../topics.js';
import { profileBackedLesson } from './profileBackedLesson.js';

export const rtosLessons = Object.freeze(
  allTopics.filter((topic) => topic.sectionId === 'rtos').map(profileBackedLesson),
);

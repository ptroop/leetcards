import { allTopics } from '../topics.js';
import { profileBackedLesson } from './profileBackedLesson.js';

export const networkingLessons = Object.freeze(
  allTopics.filter((topic) => topic.sectionId === 'networking').map(profileBackedLesson),
);

import { allTopics } from '../topics.js';
import { profileBackedLesson } from './profileBackedLesson.js';

export const embeddedLessons = Object.freeze(
  allTopics
    .filter((topic) => topic.sectionId === 'embedded' && !topic.id.startsWith('college-mcu-'))
    .map(profileBackedLesson),
);

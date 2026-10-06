import { registerCoreLessons } from './coreLessonRegistry.js';
import { architectureLessons } from './lessons/architectureLessons.js';
import { cLessons } from './lessons/cLessons.js';
import { cppLessons } from './lessons/cppLessons.js';
import { dsaPatternLessons } from './lessons/dsaPatternLessons.js';
import { embeddedLessons } from './lessons/embeddedLessons.js';
import { engineeringLessons } from './lessons/engineeringLessons.js';
import { electronicsLessons } from './lessons/electronicsLessons.js';
import { electronicsInterviewLessons } from './lessons/electronicsInterviewLessons.js';
import { networkingLessons } from './lessons/networkingLessons.js';
import { linuxLessons } from './lessons/linuxLessons.js';
import { linuxInterviewLessons } from './lessons/linuxInterviewLessons.js';
import { linuxCppGuidance } from './linuxCppGuidance.js';
import { rtosLessons } from './lessons/rtosLessons.js';
import { stm32Lessons } from './lessons/stm32Lessons.js';

export const coreLessons = Object.freeze([
  ...cLessons,
  ...cppLessons,
  ...architectureLessons,
  ...linuxLessons,
  ...linuxInterviewLessons.map((lesson) => ({
    ...lesson,
    additionalBlocks: [
      ...(lesson.additionalBlocks ?? []),
      {
        type: 'prose',
        heading: 'The same Linux contract in C++',
        body: linuxCppGuidance[lesson.topicId],
      },
    ],
  })),
  ...networkingLessons,
  ...engineeringLessons,
  ...electronicsLessons,
  ...electronicsInterviewLessons,
  ...embeddedLessons,
  ...stm32Lessons,
  ...rtosLessons,
  ...dsaPatternLessons,
]);

registerCoreLessons(coreLessons);

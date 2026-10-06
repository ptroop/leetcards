import { defineAuthoredLesson } from '../authoredLessonSchema.js';
import { deepProfiles } from '../deepProfiles.js';
import { focusedLinuxById } from '../focusedCurriculum.js';
import { linuxCppGuidanceFor } from '../linuxCppGuidance.js';
import { linuxMechanismSpecs } from '../linuxMechanisms.js';
import { realApplicationFor } from '../realApplications.js';
import { topicNotes } from '../topicNotes.js';
import { allTopics } from '../topics.js';
import { profileBackedLesson } from './profileBackedLesson.js';

const linuxTopics = allTopics.filter((topic) => (
  topic.sectionId === 'os-linux' && !topic.id.startsWith('linux-a')
));

const asCpp20PosixSource = (source) => source
  .replaceAll('_Static_assert', 'static_assert')
  .replaceAll('(struct task){', 'task{')
  .replace('char *shared = mmap(', 'char *shared = (char *)mmap(')
  .replace(
    'struct shared_result *shared = mmap(',
    'struct shared_result *shared = (struct shared_result *)mmap(',
  )
  .replace(
    'struct task *task = calloc(1, sizeof *task);',
    'struct task *task = (struct task *)calloc(1, sizeof *task);',
  )
  .replace(
    'struct task *task = opaque;',
    'struct task *task = (struct task *)opaque;',
  )
  .replace('#include <signal.h>', '#include <signal.h>\n#include <string.h>')
  .replace(
    'struct sigaction action = {0};',
    'struct sigaction action;\n    memset(&action, 0, sizeof action);',
  );

const mechanismLesson = (topic, spec) => defineAuthoredLesson({
  topicId: topic.id,
  title: topic.title,
  depth: topic.level,
  definition: spec.summary,
  motivation: realApplicationFor(topic),
  mechanism: spec.steps,
  workedExample: { setup: spec.prediction, steps: spec.steps },
  realUse: realApplicationFor(topic),
  failureModes: [{
    symptom: spec.failure,
    cause: 'The caller assumed a user-space result that the kernel contract does not guarantee.',
    check: spec.practice,
  }],
  verification: [spec.practice, 'Inspect return values, errno, cleanup, and the exact kernel-visible object state.'],
  diagramSpec: { heading: 'Trace the kernel object transition', sketchId: 'linux-kernel-transition' },
  codeExamples: {
    heading: `${topic.title} in C and C++`,
    note: 'The C++ form keeps the POSIX operation visible while applying C++ type and ownership rules.',
    variants: [
      { id: 'c', label: 'C', standard: 'C17 / POSIX', code: spec.code },
      { id: 'cpp', label: 'C++', standard: 'C++20 / POSIX', code: asCpp20PosixSource(spec.code) },
    ],
  },
  additionalBlocks: [{
    type: 'prose',
    heading: 'The same Linux contract in C++',
    body: linuxCppGuidanceFor(topic),
  }, {
    type: 'visual',
    heading: 'Trace one execution',
    kind: 'timeline',
    invariant: spec.summary,
    frames: spec.steps.map((caption, index) => ({
      caption: `${index + 1}. ${caption}`,
      values: spec.steps.map((_, stepIndex) => `state ${stepIndex + 1}`),
      markers: [`Step ${index + 1}/${spec.steps.length}`],
      active: [`state ${index + 1}`],
    })),
  }],
  recall: [
    `Define ${topic.title.toLowerCase()} from the kernel object’s perspective.`,
    'Explain partial work, interruption, blocking, and cleanup.',
    'Rebuild both language variants from the same POSIX contract.',
  ],
});

const focusedLesson = (topic, spec) => defineAuthoredLesson({
  topicId: topic.id,
  title: topic.title,
  depth: topic.level,
  definition: spec.definition,
  motivation: spec.application,
  mechanism: [spec.explanation, ...spec.steps],
  workedExample: {
    setup: spec.prediction,
    steps: spec.steps,
  },
  realUse: spec.application,
  failureModes: [{
    symptom: spec.failure,
    cause: 'The user-space operation no longer matches the kernel object state or synchronization contract.',
    check: 'Trace the syscall boundary and inspect the kernel-visible state before changing the implementation.',
  }],
  verification: [
    'Compile both variants with warnings enabled and run the same deterministic case.',
    'Use strace, /proc, or debugger state to identify the exact kernel object transition.',
  ],
  diagramSpec: {
    heading: 'User space, kernel state, and the observable result',
    sketchId: 'linux-kernel-transition',
  },
  codeExamples: {
    heading: `${topic.title} in C and C++`,
    note: 'Both variants use the same Linux contract; C++ adds typed ownership and error handling without replacing the syscall or POSIX primitive.',
    variants: [
      { id: 'c', label: 'C', standard: 'C17 / POSIX', code: spec.c },
      { id: 'cpp', label: 'C++', standard: 'C++20 / POSIX', code: spec.cpp },
    ],
  },
  additionalBlocks: [{
    type: 'prose',
    heading: 'The same Linux contract in C++',
    body: linuxCppGuidanceFor(topic),
  }, {
    type: 'visual',
    heading: 'Trace the kernel-visible state',
    kind: 'timeline',
    invariant: spec.definition,
    frames: spec.steps.map((caption, index) => ({
      caption: `${index + 1}. ${caption}`,
      values: spec.steps.map((_, stepIndex) => `state ${stepIndex + 1}`),
      markers: [`Step ${index + 1}/${spec.steps.length}`],
      active: [`state ${index + 1}`],
    })),
  }],
  recall: [
    `Define ${topic.title.toLowerCase()} in terms of the kernel object it changes.`,
    'Trace the user-space call, blocking or wake behavior, return value, and cleanup.',
    'Reconstruct both C and C++ variants from the same contract.',
  ],
});

export const linuxLessons = Object.freeze(linuxTopics.flatMap((topic) => {
  const focused = focusedLinuxById.get(topic.id);
  if (focused) return [focusedLesson(topic, focused)];
  const mechanism = linuxMechanismSpecs[topic.id];
  if (mechanism) return [mechanismLesson(topic, mechanism)];
  if (topicNotes[topic.id] && (topic.level !== 'deep' || deepProfiles[topic.id])) {
    const record = profileBackedLesson(topic);
    return [{
      ...record,
      additionalBlocks: [
        ...(record.additionalBlocks ?? []),
        {
          type: 'prose',
          heading: 'The same Linux contract in C++',
          body: linuxCppGuidanceFor(topic),
        },
      ],
    }];
  }
  return [];
}));

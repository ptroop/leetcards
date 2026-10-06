import { defineAuthoredLesson } from '../authoredLessonSchema.js';
import { dsaCImplementations } from '../dsaCImplementations.js';
import {
  problemFamilyGuidance,
  problemFamilyNarrative,
  problemFamilyScope,
} from '../dsaProblemFamilies.js';
import { dsaFocusedById } from '../dsaFocusedSubtopics.js';
import { visualForDsa } from '../dsaVisuals.js';
import { patternGuideForTopic } from '../dsaPatternGuides.js';
import { realApplicationFor } from '../realApplications.js';
import { allTopics } from '../topics.js';

const topics = allTopics.filter((topic) => (
  topic.sectionId === 'dsa' && !topic.id.startsWith('college-dsa-')
));

const codePair = (topic, c, cpp) => ({
  heading: `${topic.title} in C and C++`,
  note: 'The language changes storage and cleanup; the invariant, state transitions, and complexity must remain identical.',
  variants: [
    { id: 'c', label: 'C', standard: 'C17', code: c },
    { id: 'cpp', label: 'C++', standard: 'C++20', code: cpp },
  ],
});

const visualBlock = (topic, invariant, prediction) => ({
  type: 'visual',
  heading: 'Run the complete trace',
  invariant,
  prediction,
  guide: patternGuideForTopic(topic.id),
  ...visualForDsa(topic.id),
});

const focusedRecord = (topic, spec) => defineAuthoredLesson({
  topicId: topic.id,
  title: topic.title,
  depth: 'deep',
  definition: spec.definition,
  motivation: spec.application,
  mechanism: spec.trace,
  workedExample: { setup: spec.prediction, steps: spec.trace },
  realUse: spec.application,
  failureModes: [{
    symptom: spec.trap,
    cause: 'A pointer, boundary, ownership, or ordering update violated the stated invariant.',
    check: 'Replay the smallest failing case and mark the first state that no longer satisfies the invariant.',
  }],
  verification: [
    `Trace empty, one-element, and smallest non-trivial inputs, then justify ${spec.complexity}.`,
    'Compile and run the C and C++ variants against the same boundary cases.',
  ],
  diagramSpec: { heading: 'State, invariant, update, and proof', sketchId: 'dsa-invariant-state' },
  codeExamples: codePair(topic, spec.c, spec.cpp),
  additionalBlocks: [
    { type: 'prose', heading: 'How to recognize it', body: `Use this when ${spec.recognition[0]}, especially when ${spec.recognition[1]}.` },
    { type: 'prose', heading: 'The invariant', body: spec.invariant },
    ...(spec.techniques.length ? [{ type: 'concepts', heading: 'Reusable technique', items: spec.techniques }] : []),
    visualBlock(topic, spec.invariant, spec.prediction),
    ...(spec.related.length ? [{ type: 'related-lessons', heading: 'Problems built from the same move', items: spec.related }] : []),
    { type: 'practice', heading: 'Prove it on boundaries', body: `Trace the empty, one-element, and smallest non-trivial input. Then prove ${spec.complexity}.` },
  ],
  lessonMetadata: {
    recognition: spec.recognition,
    invariant: spec.invariant,
    avoidWhen: spec.trap,
    complexity: spec.complexity,
    cTemplate: spec.c,
    cppTemplate: spec.cpp,
  },
  recall: [
    `Define ${topic.title.toLowerCase()} and state its invariant.`,
    'Replay every pointer, index, stack, queue, or recursive-state update.',
    'Reconstruct both implementations from the proof.',
  ],
});

const familyRecord = (topic) => {
  const guidance = problemFamilyGuidance[topic.id];
  const narrative = problemFamilyNarrative[topic.id];
  const c = dsaCImplementations[topic.id];
  if (!guidance || !narrative || !c) {
    throw new Error(`Missing authored DSA family data: ${topic.id}`);
  }
  const [clueOne, clueTwo, avoidWhen, complexity, cpp] = guidance;
  const visual = visualForDsa(topic.id);
  const trace = visual.frames.map((frame) => frame.caption);
  const application = realApplicationFor(topic);

  return defineAuthoredLesson({
    topicId: topic.id,
    title: topic.title,
    depth: 'deep',
    definition: narrative.summary,
    motivation: application,
    mechanism: [
      `Recognition: ${clueOne}.`,
      `Second clue: ${clueTwo}.`,
      `Invariant: ${narrative.invariant}`,
      ...trace,
    ],
    workedExample: { setup: narrative.prediction, steps: trace },
    realUse: application,
    failureModes: [{
      symptom: `The template fails when ${avoidWhen}.`,
      cause: 'The pattern was selected without proving that its invariant survives the update.',
      check: 'Construct the smallest counterexample and inspect the first invalid state transition.',
    }],
    verification: [
      `State why the implementation is ${complexity}.`,
      'Trace adversarial and boundary inputs before compiling both language variants.',
    ],
    diagramSpec: { heading: 'State, invariant, update, and proof', sketchId: 'dsa-invariant-state' },
    codeExamples: codePair(topic, c, cpp),
    additionalBlocks: [
      { type: 'prose', heading: 'Recognition clues', body: `Reach for this pattern when ${clueOne}, especially when ${clueTwo}.` },
      { type: 'prose', heading: 'The invariant', body: narrative.invariant },
      ...(problemFamilyScope[topic.id] ? [{ type: 'prose', heading: 'What this includes', body: problemFamilyScope[topic.id] }] : []),
      { type: 'visual', heading: 'Trace the algorithm', invariant: narrative.invariant, prediction: narrative.prediction, guide: patternGuideForTopic(topic.id), ...visual },
      { type: 'practice', heading: 'Transfer test', body: `State recognition, invariant, update, stopping condition, and ${complexity} before writing code.` },
    ],
    lessonMetadata: {
      recognition: [clueOne, clueTwo],
      invariant: narrative.invariant,
      avoidWhen,
      complexity,
      cTemplate: c,
      cppTemplate: cpp,
    },
    recall: [
      `Explain the ${topic.title.toLowerCase()} invariant.`,
      'Connect every visual state to the update rule.',
      'Reconstruct both language implementations from the proof.',
    ],
  });
};

export const dsaPatternLessons = Object.freeze(topics.flatMap((topic) => {
  const focused = dsaFocusedById.get(topic.id);
  if (focused) return [focusedRecord(topic, focused)];
  if (problemFamilyGuidance[topic.id] && problemFamilyNarrative[topic.id]) {
    return [familyRecord(topic)];
  }
  return [];
}));

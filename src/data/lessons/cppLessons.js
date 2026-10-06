import { defineAuthoredLesson } from '../authoredLessonSchema.js';
import { cppConceptsFor } from '../cppConcepts.js';
import { cppProfileFor } from '../cppLessonProfiles.js';
import { allTopics } from '../topics.js';

const cppTopics = allTopics.filter((topic) => topic.sectionId === 'cpp');

const sentenceList = (profile, concepts) => [
  profile.explanation,
  ...concepts.map((concept) => `${concept.term}: ${concept.definition} ${concept.example}`),
  ...profile.steps,
];

export const cppLessons = Object.freeze(cppTopics.map((topic) => {
  const profile = cppProfileFor(topic.id);
  const concepts = cppConceptsFor(topic.id);

  return defineAuthoredLesson({
    topicId: topic.id,
    title: topic.title,
    depth: topic.level,
    definition: profile.definition,
    motivation: profile.application,
    mechanism: sentenceList(profile, concepts),
    workedExample: topic.level === 'brief' ? undefined : {
      setup: profile.prediction,
      steps: profile.steps,
    },
    realUse: profile.application,
    failureModes: topic.level === 'deep' ? [{
      symptom: profile.failure,
      cause: 'The language or lifetime rule described above was violated.',
      check: profile.example,
    }] : undefined,
    verification: topic.level === 'deep'
      ? [profile.example, 'Compile with strong warnings and run the example with AddressSanitizer and UndefinedBehaviorSanitizer where applicable.']
      : undefined,
    diagramSpec: topic.level === 'deep' ? {
      heading: 'From language rule to observable object state',
      sketchId: 'cpp-language-state',
    } : undefined,
    codeExamples: {
      heading: 'See the rule in compilable C++',
      note: `${profile.standard}. Trace object lifetime and observable state before changing the example.`,
      variants: [{
        id: 'cpp',
        label: 'C++',
        standard: profile.standard,
        code: profile.code,
      }],
    },
    additionalBlocks: [
      { type: 'prose', heading: 'How it works', body: profile.explanation },
      { type: 'concepts', heading: 'Define every moving part', items: concepts },
      { type: 'code', language: profile.standard, heading: 'See the rule in code', code: profile.code },
      { type: 'example', heading: 'Run this check', body: profile.example },
      { type: 'failure', heading: 'Where the model breaks', body: profile.failure },
      ...(topic.level === 'brief' ? [] : [{ type: 'practice', heading: 'Prove it to yourself', body: profile.example }]),
    ],
    recall: [
      `Define ${topic.title.toLowerCase()} without using the example as the definition.`,
      'State the governing language or library rule.',
      'Predict the first observable failure when that rule is broken.',
    ],
  });
}));

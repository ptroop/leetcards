export const LESSON_DEPTHS = Object.freeze(['brief', 'standard', 'deep']);

const nonEmptyText = (value) => typeof value === 'string' && value.trim().length > 0;
const nonEmptyList = (value) => Array.isArray(value) && value.length > 0;

export function validateAuthoredLesson(record) {
  const errors = [];

  for (const key of ['topicId', 'title', 'definition', 'motivation', 'realUse']) {
    if (!nonEmptyText(record?.[key])) errors.push(key);
  }

  if (!LESSON_DEPTHS.includes(record?.depth)) errors.push('depth');
  if (!nonEmptyList(record?.mechanism)) errors.push('mechanism');
  if (record?.depth !== 'brief' && !nonEmptyList(record?.workedExample?.steps)) {
    errors.push('workedExample');
  }
  if (record?.depth === 'deep' && !nonEmptyList(record?.failureModes)) {
    errors.push('failureModes');
  }
  if (record?.depth === 'deep' && !nonEmptyList(record?.verification)) {
    errors.push('verification');
  }
  if (!nonEmptyList(record?.recall)) errors.push('recall');

  return errors;
}

export function defineAuthoredLesson(record) {
  const errors = validateAuthoredLesson(record);
  if (errors.length > 0) {
    throw new TypeError(`${record?.topicId ?? 'lesson'}: ${errors.join(', ')}`);
  }
  return Object.freeze(record);
}

export function authoredLessonToBlocks(record) {
  const blocks = [
    { type: 'definition', heading: 'What it is', body: record.definition },
    { type: 'explanation', heading: 'Why it exists', body: record.motivation },
    { type: 'steps', heading: 'Mechanism in order', items: record.mechanism },
  ];

  if (record.workedExample) {
    blocks.push({
      type: 'worked-example',
      heading: record.workedExample.setup,
      items: record.workedExample.steps,
    });
  }

  if (record.diagramSpec) {
    blocks.push({ type: 'technical-sketch', ...record.diagramSpec });
  }

  blocks.push({
    type: 'application',
    heading: 'Where this is used',
    body: record.realUse,
  });

  if (record.failureModes?.length) {
    blocks.push({
      type: 'failure-table',
      heading: 'What failure looks like',
      items: record.failureModes,
    });
  }

  if (record.verification?.length) {
    blocks.push({
      type: 'steps',
      heading: 'How to verify it',
      items: record.verification,
    });
  }

  if (record.codeExamples) {
    blocks.push({ type: 'code-pair', ...record.codeExamples });
  }

  if (record.additionalBlocks?.length) {
    blocks.push(...record.additionalBlocks);
  }

  blocks.push({
    type: 'recall-list',
    heading: 'Keep these facts',
    items: record.recall,
  });

  return blocks;
}

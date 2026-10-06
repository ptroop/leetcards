import {
  qualcommIndiaReportedQuestions as existingQuestions,
  qualcommIndiaWebSources as existingSources,
} from './qualcommIndiaWebQuestions.js';
import { supplementalQualcommQuestions, supplementalQualcommSources } from './qualcommInternetSupplement.js';

export const qualcommIndiaWebSources = Object.freeze([...existingSources, ...supplementalQualcommSources]);
export const qualcommIndiaReportedQuestions = Object.freeze([...existingQuestions, ...supplementalQualcommQuestions]);
export const qualcommIndiaWebSourceById = new Map(qualcommIndiaWebSources.map((source) => [source.id, source]));

const normalizedPrompts = new Set();
for (const question of qualcommIndiaReportedQuestions) {
  const key = question.prompt.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
  if (normalizedPrompts.has(key)) throw new Error(`Duplicate Qualcomm interview question: ${question.prompt}`);
  normalizedPrompts.add(key);
  for (const sourceId of question.sources) {
    if (!qualcommIndiaWebSourceById.has(sourceId)) throw new Error(`Missing source ${sourceId}`);
  }
}

export const qualcommIndiaWebAudit = {
  sourceCount: qualcommIndiaWebSources.length,
  questionCount: qualcommIndiaReportedQuestions.length,
  highConfidenceSourceCount: qualcommIndiaWebSources.filter((source) => source.confidence === 'high').length,
  repeatedQuestionCount: qualcommIndiaReportedQuestions.filter((question) => question.sources.length > 1).length,
  reviewedThrough: '23 September 2026',
};

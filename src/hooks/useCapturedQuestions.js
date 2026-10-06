import { useCallback, useEffect, useState } from 'react';
import {
  decodeCapturePayload,
  validateProfileImportPayload,
} from '../data/capture.js';
import {
  loadCapturedQuestions,
  saveCapturedQuestion,
  saveCapturedQuestions,
} from '../data/capturedQuestionsStore.js';
import { getLeetcodeProblemLesson } from '../data/leetcodeProblemLessons.js';
import { matchCapturedQuestion } from '../data/questionCards.js';

export default function useCapturedQuestions() {
  const [capturedQuestions, setCapturedQuestions] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [storageError, setStorageError] = useState('');
  const [importResult, setImportResult] = useState({ status: 'idle' });
  const [profileImportResult, setProfileImportResult] = useState({ status: 'idle' });

  useEffect(() => {
    let active = true;

    loadCapturedQuestions()
      .then((records) => {
        if (active) setCapturedQuestions(records);
      })
      .catch((error) => {
        if (active) setStorageError(error.message);
      })
      .finally(() => {
        if (active) setLoaded(true);
      });

    return () => {
      active = false;
    };
  }, []);

  const importCapture = useCallback(async (encodedPayload) => {
    setImportResult({ status: 'loading' });

    try {
      const capture = decodeCapturePayload(encodedPayload);
      const match = matchCapturedQuestion(capture);
      const problemLesson = getLeetcodeProblemLesson(capture.slug);

      const record = {
        slug: capture.slug,
        title: capture.title,
        difficulty: capture.difficulty,
        tags: capture.tags,
        url: capture.url,
        capturedAt: capture.capturedAt,
        questionId: match?.id ?? null,
        problemSlug: problemLesson?.slug ?? null,
      };

      await saveCapturedQuestion(record);
      setCapturedQuestions((current) => [
        record,
        ...current.filter((item) => item.slug !== record.slug),
      ]);

      const result = match
        ? { status: 'saved', capture, question: match, problemLesson }
        : problemLesson
          ? { status: 'saved', capture, problemLesson }
        : { status: 'saved-unmatched', capture };
      setImportResult(result);
      return result;
    } catch (error) {
      const result = {
        status: 'error',
        message: error instanceof Error ? error.message : 'Capture failed',
      };
      setImportResult(result);
      return result;
    }
  }, []);

  const importProfileFile = useCallback(async (file) => {
    setProfileImportResult({ status: 'loading' });

    try {
      if (!(file instanceof File)) throw new Error('Choose a Leetcards JSON export');
      if (file.size > 25_000_000) throw new Error('The profile import exceeds 25 MB');

      let parsed;
      try {
        parsed = JSON.parse(await file.text());
      } catch {
        throw new Error('The selected file is not valid JSON');
      }

      const profile = validateProfileImportPayload(parsed);
      const records = profile.problems.map((problem) => {
        const match = matchCapturedQuestion(problem);
        const problemLesson = getLeetcodeProblemLesson(problem.slug);
        return {
          slug: problem.slug,
          title: problem.title,
          difficulty: 'unknown',
          tags: [],
          url: `https://leetcode.com/problems/${problem.slug}/`,
          capturedAt: null,
          questionId: match?.id ?? null,
          problemSlug: problemLesson?.slug ?? null,
          source: 'profile-import',
          language: problem.language,
          code: problem.code,
        };
      });

      await saveCapturedQuestions(records);
      setCapturedQuestions((current) => {
        const importedSlugs = new Set(records.map((record) => record.slug));
        return [
          ...records,
          ...current.filter((record) => !importedSlugs.has(record.slug)),
        ].sort((left, right) => left.title.localeCompare(right.title));
      });

      const matched = records.filter((record) => record.problemSlug || record.questionId).length;
      const result = {
        status: 'saved',
        imported: records.length,
        matched,
        unmatched: records.length - matched,
      };
      setProfileImportResult(result);
      return result;
    } catch (error) {
      const result = {
        status: 'error',
        message: error instanceof Error ? error.message : 'Profile import failed',
      };
      setProfileImportResult(result);
      return result;
    }
  }, []);

  return {
    capturedQuestions,
    importCapture,
    importResult,
    importProfileFile,
    profileImportResult,
    loaded,
    storageError,
  };
}

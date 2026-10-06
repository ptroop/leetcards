const MAX_SUBMISSION_PAGES = 500;
const SUBMISSION_PAGE_SIZE = 20;
const REQUEST_DELAY_MS = 550;
const MAX_PROBLEMS = 5_000;
const MAX_CODE_LENGTH = 500_000;
const MAX_TOTAL_CODE_LENGTH = 25_000_000;

const progressTitle = document.querySelector('#progress-title');
const progressDetail = document.querySelector('#progress-detail');
const progressBar = document.querySelector('#progress');
const progressCount = document.querySelector('#progress-count');
const solvedCount = document.querySelector('#solved-count');
const resultSection = document.querySelector('#result');
const resultDetail = document.querySelector('#result-detail');
const downloadButton = document.querySelector('#download');
const errorSection = document.querySelector('#error');
const errorMessage = document.querySelector('#error-message');
const retryButton = document.querySelector('#retry');

let preparedExport = null;

const setProgress = ({
  title,
  detail,
  current = 0,
  total = 0,
  solved = 0,
}) => {
  progressTitle.textContent = title;
  progressDetail.textContent = detail;
  progressBar.max = Math.max(total, 1);
  progressBar.value = Math.min(current, Math.max(total, 1));
  progressCount.textContent = `${current} / ${total}`;
  solvedCount.textContent = `${solved} unique accepted problem${solved === 1 ? '' : 's'}`;
};

const downloadExport = () => {
  if (!preparedExport) return;
  const blob = new Blob([JSON.stringify(preparedExport, null, 2)], {
    type: 'application/json',
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = 'leetcards-leetcode-import.json';
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1_000);
};

const collectAcceptedProblems = async ({
  maxSubmissionPages,
  submissionPageSize,
  requestDelayMs,
  maxProblems,
  maxCodeLength,
  maxTotalCodeLength,
  runId,
}) => {
  if (location.origin !== 'https://leetcode.com') {
    throw new Error('Open your LeetCode profile or problem library before starting the export.');
  }

  const report = (payload) => {
    try {
      const pending = chrome.runtime.sendMessage({
        type: 'leetcards-profile-progress',
        runId,
        ...payload,
      });
      if (pending?.catch) pending.catch(() => {});
    } catch {
      // Progress reporting is optional; collection can still complete.
    }
  };

  const wait = (milliseconds) => new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
  });

  const requestJson = async (url, options = {}, retries = 3) => {
    let lastError;
    for (let attempt = 0; attempt < retries; attempt += 1) {
      try {
        const response = await fetch(url, {
          credentials: 'include',
          ...options,
          headers: {
            accept: 'application/json',
            ...options.headers,
          },
        });

        if (response.status === 401 || response.status === 403) {
          throw new Error('LeetCode did not recognize a signed-in session in this tab.');
        }
        if (response.ok) return await response.json();
        if (response.status !== 429 && response.status < 500) {
          throw new Error(`LeetCode returned ${response.status} while reading submissions.`);
        }
        lastError = new Error(`LeetCode temporarily returned ${response.status}.`);
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('LeetCode could not be reached.');
        if (/signed-in session|returned 4\d\d/.test(lastError.message)) throw lastError;
      }
      await wait(700 * (2 ** attempt));
    }
    throw lastError ?? new Error('LeetCode could not be reached.');
  };

  const acceptedBySlug = new Map();
  let offset = 0;
  let hasNext = true;

  for (let page = 0; page < maxSubmissionPages && hasNext; page += 1) {
    report({
      stage: 'submissions',
      current: page,
      total: Math.max(page + 1, 1),
      solved: acceptedBySlug.size,
    });

    const data = await requestJson(
      `/api/submissions/?offset=${offset}&limit=${submissionPageSize}`,
    );
    const submissions = Array.isArray(data?.submissions_dump)
      ? data.submissions_dump
      : Array.isArray(data?.submissions)
        ? data.submissions
        : null;

    if (!submissions) {
      throw new Error('LeetCode changed the submissions response. Update the Leetcards extension.');
    }

    for (const submission of submissions) {
      if (submission?.status_display !== 'Accepted') continue;
      const slug = typeof submission.title_slug === 'string'
        ? submission.title_slug.trim().toLowerCase()
        : '';
      if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) continue;
      if (acceptedBySlug.has(slug)) continue;
      if (acceptedBySlug.size >= maxProblems) {
        throw new Error(`The export exceeds the ${maxProblems}-problem safety limit.`);
      }

      acceptedBySlug.set(slug, {
        id: submission.id ?? (
          typeof submission.url === 'string'
            ? submission.url.match(/\/submissions\/detail\/(\d+)/)?.[1]
            : null
        ),
        slug,
        title: typeof submission.title === 'string' && submission.title.trim()
          ? submission.title.replace(/\s+/g, ' ').trim().slice(0, 140)
          : slug.split('-').map((part) => (
            part ? `${part[0].toUpperCase()}${part.slice(1)}` : ''
          )).join(' '),
        fallbackLanguage: typeof submission.lang === 'string'
          ? submission.lang.slice(0, 40)
          : '',
      });
    }

    hasNext = Boolean(data?.has_next);
    offset += submissionPageSize;

    if (submissions.length === 0) hasNext = false;
    if (hasNext) await wait(requestDelayMs);
  }

  if (hasNext) {
    throw new Error('The submission history exceeded the export page safety limit.');
  }
  if (acceptedBySlug.size === 0) {
    throw new Error('No accepted submissions were found for the signed-in account.');
  }

  const accepted = [...acceptedBySlug.values()];
  const problems = [];
  let totalCodeLength = 0;

  for (let index = 0; index < accepted.length; index += 1) {
    const submission = accepted[index];
    const submissionId = Number(submission.id);
    if (!Number.isSafeInteger(submissionId) || submissionId <= 0) {
      throw new Error(`LeetCode did not provide a valid submission ID for ${submission.title}.`);
    }
    report({
      stage: 'code',
      current: index,
      total: accepted.length,
      solved: accepted.length,
      title: submission.title,
    });

    const query = `
      query submissionDetails($submissionId: Int!) {
        submissionDetails(submissionId: $submissionId) {
          code
          lang {
            name
            verboseName
          }
          question {
            titleSlug
          }
        }
      }
    `;
    const data = await requestJson('/graphql/', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        operationName: 'submissionDetails',
        query,
        variables: { submissionId },
      }),
    });
    const details = data?.data?.submissionDetails;
    const code = typeof details?.code === 'string' ? details.code : '';
    const detailSlug = details?.question?.titleSlug;

    if (detailSlug && detailSlug !== submission.slug) {
      throw new Error(`LeetCode returned mismatched code for ${submission.title}.`);
    }
    if (!code) {
      throw new Error(`Accepted code was unavailable for ${submission.title}.`);
    }
    if (code.length > maxCodeLength) {
      throw new Error(`${submission.title} exceeds the per-solution safety limit.`);
    }

    totalCodeLength += code.length;
    if (totalCodeLength > maxTotalCodeLength) {
      throw new Error('The accepted code exceeds the total export safety limit.');
    }

    problems.push({
      slug: submission.slug,
      title: submission.title,
      language: (
        details?.lang?.verboseName
        || details?.lang?.name
        || submission.fallbackLanguage
        || 'unknown'
      ).replace(/\s+/g, ' ').trim().slice(0, 40),
      code,
    });

    if (index + 1 < accepted.length) await wait(requestDelayMs);
  }

  report({
    stage: 'complete',
    current: problems.length,
    total: problems.length,
    solved: problems.length,
  });

  return {
    version: 2,
    provider: 'leetcode',
    kind: 'solved-profile',
    problems,
  };
};

const runExport = async () => {
  resultSection.hidden = true;
  errorSection.hidden = true;
  preparedExport = null;
  setProgress({
    title: 'Connecting to LeetCode',
    detail: 'Checking the signed-in source tab.',
  });

  const sourceTab = Number(new URLSearchParams(location.search).get('sourceTab'));
  if (!Number.isInteger(sourceTab) || sourceTab <= 0) {
    errorMessage.textContent = 'The source LeetCode tab could not be identified. Start again from the extension popup.';
    errorSection.hidden = false;
    return;
  }

  const runId = crypto.randomUUID();
  const onProgress = (message) => {
    if (message?.type !== 'leetcards-profile-progress' || message.runId !== runId) return;
    if (message.stage === 'submissions') {
      setProgress({
        title: 'Finding unique accepted problems',
        detail: 'Paging through submission history without saving dates, runtime, memory, or failures.',
        current: message.current,
        total: message.total,
        solved: message.solved,
      });
    } else if (message.stage === 'code') {
      setProgress({
        title: 'Reading one accepted solution per problem',
        detail: message.title ? `Reading ${message.title}.` : 'Reading accepted code.',
        current: message.current,
        total: message.total,
        solved: message.solved,
      });
    } else if (message.stage === 'complete') {
      setProgress({
        title: 'Preparing the local import file',
        detail: 'Validation passed. Nothing has been uploaded.',
        current: message.current,
        total: message.total,
        solved: message.solved,
      });
    }
  };
  chrome.runtime.onMessage.addListener(onProgress);

  try {
    const [execution] = await chrome.scripting.executeScript({
      target: { tabId: sourceTab },
      world: 'ISOLATED',
      func: collectAcceptedProblems,
      args: [{
        maxSubmissionPages: MAX_SUBMISSION_PAGES,
        submissionPageSize: SUBMISSION_PAGE_SIZE,
        requestDelayMs: REQUEST_DELAY_MS,
        maxProblems: MAX_PROBLEMS,
        maxCodeLength: MAX_CODE_LENGTH,
        maxTotalCodeLength: MAX_TOTAL_CODE_LENGTH,
        runId,
      }],
    });

    if (!execution?.result) {
      throw new Error('The LeetCode tab returned no import data.');
    }

    preparedExport = execution.result;
    setProgress({
      title: 'Export complete',
      detail: 'The local JSON file is ready to download.',
      current: preparedExport.problems.length,
      total: preparedExport.problems.length,
      solved: preparedExport.problems.length,
    });
    resultDetail.textContent = `${preparedExport.problems.length} unique accepted problems are ready. Import the downloaded file from the Questions page in Leetcards.`;
    resultSection.hidden = false;
    downloadExport();
  } catch (error) {
    errorMessage.textContent = error instanceof Error
      ? error.message
      : 'The LeetCode export failed.';
    errorSection.hidden = false;
  } finally {
    chrome.runtime.onMessage.removeListener(onProgress);
  }
};

downloadButton.addEventListener('click', downloadExport);
retryButton.addEventListener('click', runExport);
runExport();

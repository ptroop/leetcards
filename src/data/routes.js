const clean = (value) => {
  try {
    return decodeURIComponent(value ?? '');
  } catch {
    return '';
  }
};

export function parseRoute(hash = '') {
  const parts = hash.replace(/^#\/?/, '').split('/').filter(Boolean);
  if (parts.length === 0) return { view: 'library' };
  if (parts[0] === 'category' && parts.length === 2) {
    return { view: 'category', sectionId: clean(parts[1]) };
  }
  if (parts[0] === 'lesson' && parts.length === 2) {
    return { view: 'lesson', topicId: clean(parts[1]) };
  }
  if (parts[0] === 'questions' && parts.length === 1) {
    return { view: 'questions' };
  }
  if (parts[0] === 'internet' && parts.length === 1) {
    return { view: 'internet' };
  }
  if (parts[0] === 'common-interviews' && parts.length === 1) {
    return { view: 'common-interviews' };
  }
  if (parts[0] === 'aptitude' && parts.length === 1) {
    return { view: 'aptitude' };
  }
  if (parts[0] === 'question' && parts.length === 2) {
    return { view: 'question', questionId: clean(parts[1]) };
  }
  if (parts[0] === 'problem' && parts.length === 2) {
    return { view: 'problem', slug: clean(parts[1]) };
  }
  if (parts[0] === 'capture' && parts.length === 2) {
    return { view: 'capture', payload: clean(parts[1]) };
  }
  return { view: 'library' };
}

export const routeForLibrary = () => '#/';
export const routeForCategory = (sectionId) => `#/category/${encodeURIComponent(sectionId)}`;
export const routeForLesson = (topicId) => `#/lesson/${encodeURIComponent(topicId)}`;
export const routeForQuestions = () => '#/questions';
export const routeForInternet = () => '#/internet';
export const routeForCommonInterviews = () => '#/common-interviews';
export const routeForAptitude = () => '#/aptitude';
export const routeForQuestion = (questionId) => `#/question/${encodeURIComponent(questionId)}`;
export const routeForProblem = (slug) => `#/problem/${encodeURIComponent(slug)}`;
export const routeForCapture = (payload) => `#/capture/${encodeURIComponent(payload)}`;

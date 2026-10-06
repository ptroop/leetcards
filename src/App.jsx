import { useEffect, useMemo, useRef, useState } from 'react';
import AptitudeView from './components/AptitudeView.jsx';
import BrandMark from './components/BrandMark.jsx';
import CategoryView from './components/CategoryView.jsx';
import CaptureImportView from './components/CaptureImportView.jsx';
import CommonInterviewView from './components/CommonInterviewView.jsx';
import GlossaryDrawer from './components/GlossaryDrawer.jsx';
import InternetPrepView from './components/InternetPrepView.jsx';
import LessonReader from './components/LessonReader.jsx';
import LibraryView from './components/LibraryView.jsx';
import ProblemLessonReader from './components/ProblemLessonReader.jsx';
import QuestionReader from './components/QuestionReader.jsx';
import QuestionsView from './components/QuestionsView.jsx';
import { curriculum, topicById } from './data/curriculum.js';
import { getLessonForTopic } from './data/contentModel.js';
import { questionById } from './data/questionCards.js';
import { getLeetcodeProblemLesson } from './data/leetcodeProblemLessons.js';
import {
  parseRoute,
  routeForAptitude,
  routeForCommonInterviews,
  routeForCategory,
  routeForLesson,
  routeForInternet,
  routeForLibrary,
  routeForProblem,
  routeForQuestion,
  routeForQuestions,
} from './data/routes.js';
import { searchTopics } from './data/search.js';
import useCapturedQuestions from './hooks/useCapturedQuestions.js';

const currentRoute = () => parseRoute(window.location.hash);

export default function App() {
  const [route, setRoute] = useState(currentRoute);
  const [query, setQuery] = useState('');
  const [glossaryOpen, setGlossaryOpen] = useState(false);
  const [questionReturn, setQuestionReturn] = useState('questions');
  const searchRef = useRef(null);
  const glossaryButtonRef = useRef(null);
  const capturePayloadRef = useRef('');
  const {
    capturedQuestions,
    importCapture,
    importResult,
    importProfileFile,
    profileImportResult,
    loaded: capturedLoaded,
    storageError: captureStorageError,
  } = useCapturedQuestions();

  const results = useMemo(() => searchTopics(query), [query]);
  const selectedTopic = route.view === 'lesson' ? topicById.get(route.topicId) : null;
  const selectedLesson = selectedTopic ? getLessonForTopic(selectedTopic.id) : null;
  const selectedQuestion = route.view === 'question'
    ? questionById.get(route.questionId)
    : null;
  const selectedProblem = route.view === 'problem'
    ? getLeetcodeProblemLesson(route.slug)
    : null;
  const selectedProblemCapture = selectedProblem
    ? capturedQuestions.find((capture) => capture.slug === selectedProblem.slug) ?? null
    : null;
  const selectedCategory = route.view === 'category'
    ? curriculum.find((item) => item.id === route.sectionId)
    : selectedTopic
      ? curriculum.find((item) => item.id === selectedTopic.sectionId)
      : null;

  const categoryTopics = selectedCategory?.topics ?? [];
  const selectedIndex = selectedTopic
    ? categoryTopics.findIndex((topic) => topic.id === selectedTopic.id)
    : -1;
  const previous = selectedIndex > 0 ? categoryTopics[selectedIndex - 1] : null;
  const next = selectedIndex >= 0 ? categoryTopics[selectedIndex + 1] ?? null : null;

  useEffect(() => {
    const updateRoute = () => {
      setRoute(currentRoute());
      setGlossaryOpen(false);
      window.scrollTo({ top: 0, behavior: 'auto' });
    };
    window.addEventListener('hashchange', updateRoute);
    if (!window.location.hash) window.history.replaceState(null, '', routeForLibrary());
    return () => window.removeEventListener('hashchange', updateRoute);
  }, []);

  useEffect(() => {
    const handleKeys = (event) => {
      if (event.key === 'Escape' && glossaryOpen) {
        setGlossaryOpen(false);
        return;
      }
      if (event.key !== '/' || /input|textarea/i.test(document.activeElement?.tagName)) return;
      event.preventDefault();
      searchRef.current?.focus();
    };
    window.addEventListener('keydown', handleKeys);
    return () => window.removeEventListener('keydown', handleKeys);
  }, [glossaryOpen]);

  useEffect(() => {
    if (route.view !== 'capture' || !route.payload) return;
    if (capturePayloadRef.current === route.payload) return;
    capturePayloadRef.current = route.payload;
    importCapture(route.payload);
  }, [importCapture, route]);

  const navigate = (hash) => {
    setQuery('');
    setGlossaryOpen(false);
    if (window.location.hash === hash) {
      setRoute(parseRoute(hash));
      window.scrollTo({ top: 0, behavior: 'auto' });
      return;
    }
    window.location.hash = hash;
  };

  const openCategory = (sectionId) => navigate(routeForCategory(sectionId));
  const openLesson = (topicId) => navigate(routeForLesson(topicId));
  const openQuestion = (questionId) => {
    setQuestionReturn('questions');
    navigate(routeForQuestion(questionId));
  };
  const openProblem = (slug) => {
    setQuestionReturn('questions');
    navigate(routeForProblem(slug));
  };
  const openQuestions = () => navigate(routeForQuestions());
  const openInternetPrep = () => navigate(routeForInternet());
  const openCommonInterviews = () => navigate(routeForCommonInterviews());
  const openAptitude = () => navigate(routeForAptitude());
  const openQualcommPrep = () => navigate(routeForCategory('qualcomm-prep'));
  const openLibrary = () => navigate(routeForLibrary());

  const pageContext = selectedTopic
    ? `${selectedTopic.sectionTitle} / ${selectedTopic.title}`
    : selectedQuestion
      ? `Questions / ${selectedQuestion.title}`
      : selectedProblem
        ? `Solved questions / ${selectedProblem.title}`
      : route.view === 'questions'
        ? 'Question practice'
        : route.view === 'aptitude'
          ? 'Aptitude & puzzles'
        : route.view === 'common-interviews'
          ? 'Common interview questions'
        : route.view === 'internet'
          ? 'Qualcomm India / reported online'
        : route.view === 'capture'
          ? 'Safe capture'
          : selectedCategory
            ? selectedCategory.title
            : 'Close-to-the-metal learning';

  return (
    <div className="app-shell">
      <header className="topbar" inert={glossaryOpen ? true : undefined} aria-hidden={glossaryOpen}>
        <button className="wordmark" type="button" onClick={openLibrary}>
          <BrandMark className="wordmark-glyph" />
          <span>Leetcards</span>
        </button>
        <p className="topbar-context">{pageContext}</p>
        <div className="topbar-actions">
          {route.view !== 'aptitude' && (
            <button type="button" onClick={openAptitude} aria-label="Aptitude and puzzles">
              <span className="topbar-label-wide">Aptitude & puzzles</span>
              <span className="topbar-label-short" aria-hidden="true">Aptitude</span>
            </button>
          )}
          {route.view !== 'common-interviews' && (
            <button type="button" onClick={openCommonInterviews} aria-label="Common interviews">
              <span className="topbar-label-wide">Common interviews</span>
              <span className="topbar-label-short" aria-hidden="true">Common</span>
            </button>
          )}
          {route.view !== 'internet' && (
            <button type="button" onClick={openInternetPrep} aria-label="From the internet">
              <span className="topbar-label-wide">From the internet</span>
              <span className="topbar-label-short" aria-hidden="true">Internet</span>
            </button>
          )}
          {selectedCategory?.id !== 'qualcomm-prep' && (
            <button type="button" onClick={openQualcommPrep} aria-label="Qualcomm Prep">
              <span className="topbar-label-wide">Qualcomm Prep</span>
              <span className="topbar-label-short" aria-hidden="true">Qualcomm</span>
            </button>
          )}
          {route.view !== 'questions' && (
            <button type="button" onClick={openQuestions}>Questions</button>
          )}
          {selectedTopic && (
            <button
              ref={glossaryButtonRef}
              type="button"
              onClick={() => setGlossaryOpen(true)}
            >
              Glossary
            </button>
          )}
        </div>
      </header>

      <div className="page-surface" inert={glossaryOpen ? true : undefined} aria-hidden={glossaryOpen}>
        {route.view === 'library' && (
          <LibraryView
            curriculum={curriculum}
            query={query}
            results={results}
            onQueryChange={setQuery}
            onOpenCategory={openCategory}
            onOpenLesson={openLesson}
            onOpenAptitude={openAptitude}
            searchRef={searchRef}
          />
        )}

        {route.view === 'category' && selectedCategory && (
          <CategoryView
            category={selectedCategory}
            query={query}
            results={results}
            onQueryChange={setQuery}
            onOpenLesson={openLesson}
            onBack={openLibrary}
            searchRef={searchRef}
          />
        )}

        {route.view === 'lesson' && selectedTopic && selectedLesson && (
          <main className="reader-main">
            <LessonReader
              topic={selectedTopic}
              lesson={selectedLesson}
              previous={previous}
              next={next}
              onNavigate={(topic) => openLesson(topic.id)}
              onBack={() => openCategory(selectedTopic.sectionId)}
              onGlossary={() => setGlossaryOpen(true)}
            />
          </main>
        )}

        {route.view === 'questions' && (
          <QuestionsView
            capturedQuestions={capturedQuestions}
            capturedLoaded={capturedLoaded}
            captureError={captureStorageError}
            onImportProfile={importProfileFile}
            profileImportResult={profileImportResult}
            onOpenQuestion={openQuestion}
            onOpenProblem={openProblem}
            onBack={openLibrary}
          />
        )}

        {route.view === 'internet' && (
          <InternetPrepView
            onBack={openLibrary}
            onOpenLesson={openLesson}
          />
        )}

        {route.view === 'common-interviews' && (
          <CommonInterviewView
            onBack={openLibrary}
            onOpenProblem={(slug) => {
              setQuestionReturn('common-interviews');
              navigate(routeForProblem(slug));
            }}
            onOpenQuestion={(questionId) => {
              setQuestionReturn('common-interviews');
              navigate(routeForQuestion(questionId));
            }}
            onOpenLesson={openLesson}
          />
        )}

        {route.view === 'aptitude' && (
          <AptitudeView onBack={openLibrary} onOpenLesson={openLesson} />
        )}

        {route.view === 'question' && selectedQuestion && (
          <QuestionReader
            question={selectedQuestion}
            captures={capturedQuestions}
            onBack={questionReturn === 'common-interviews' ? openCommonInterviews : openQuestions}
            onOpenLesson={openLesson}
          />
        )}

        {route.view === 'problem' && selectedProblem && (
          <ProblemLessonReader
            lesson={selectedProblem}
            capture={selectedProblemCapture}
            isCommonInterview={questionReturn === 'common-interviews'}
            onBack={questionReturn === 'common-interviews' ? openCommonInterviews : openQuestions}
          />
        )}

        {route.view === 'capture' && (
          <CaptureImportView
            result={importResult}
            onOpenQuestion={openQuestion}
            onOpenProblem={openProblem}
            onOpenQuestions={openQuestions}
          />
        )}

        {route.view !== 'library'
          && route.view !== 'internet'
          && route.view !== 'common-interviews'
          && route.view !== 'aptitude'
          && route.view !== 'questions'
          && route.view !== 'capture'
          && !selectedCategory
          && !selectedTopic
          && !selectedQuestion
          && !selectedProblem && (
          <main className="library-view">
            <div className="library-empty">
              <h1>That lesson is not in the library.</h1>
              <button className="text-back" type="button" onClick={openLibrary}>Return to categories</button>
            </div>
          </main>
          )}
      </div>

      <GlossaryDrawer
        topic={selectedTopic}
        lesson={selectedLesson}
        open={glossaryOpen}
        onClose={() => setGlossaryOpen(false)}
        triggerRef={glossaryButtonRef}
      />
    </div>
  );
}

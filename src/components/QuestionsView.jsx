import { useMemo, useState } from 'react';
import { searchQuestionCards } from '../data/questionCards.js';
import { getLeetcodeProblemLesson } from '../data/leetcodeProblemLessons.js';

function ProfileImport({ result, onImport }) {
  const handleFile = async (event) => {
    const [file] = event.target.files;
    event.target.value = '';
    if (file) await onImport(file);
  };

  return (
    <section className="profile-import" aria-labelledby="profile-import-title">
      <div>
        <p className="eyebrow">Bulk profile import</p>
        <h2 id="profile-import-title">Bring in every solved problem at once.</h2>
        <p>
          Use the extension on your signed-in LeetCode profile, then choose its
          local JSON export here. One accepted solution per problem stays in
          this browser.
        </p>
      </div>
      <label className="profile-import-button">
        <span>{result.status === 'loading' ? 'Importing profile…' : 'Choose profile export'}</span>
        <input
          type="file"
          accept="application/json,.json"
          disabled={result.status === 'loading'}
          onChange={handleFile}
        />
      </label>
      {result.status === 'saved' && (
        <p className="profile-import-status" role="status">
          Imported {result.imported} solved problems. {result.matched} connect
          to an authored explanation; {result.unmatched} remain saved for the
          next content pass.
        </p>
      )}
      {result.status === 'error' && (
        <p className="profile-import-status profile-import-error" role="alert">
          {result.message}
        </p>
      )}
    </section>
  );
}

function CapturedQuestions({
  records,
  loaded,
  error,
  onOpenQuestion,
  onOpenProblem,
}) {
  return (
    <section className="captured-questions" aria-labelledby="captured-questions-title">
      <div className="index-heading">
        <h2 id="captured-questions-title">Captured from LeetCode</h2>
        <span>{loaded ? `${records.length} solved` : 'Loading'}</span>
      </div>

      {error && (
        <div className="question-notice question-notice-error" role="status">
          <strong>Local capture is unavailable.</strong>
          <p>{error}</p>
        </div>
      )}

      {!error && loaded && records.length === 0 && (
        <div className="question-notice">
          <strong>Your solved list starts locally.</strong>
          <p>
            Export your solved profile once, or capture one problem from its
            LeetCode page. Both routes stay local.
          </p>
        </div>
      )}

      {records.length > 0 && (
        <div className="captured-index">
          {records.map((record) => (
            <article key={record.slug}>
              {getLeetcodeProblemLesson(record.slug) ? (
                <button type="button" onClick={() => onOpenProblem(record.slug)}>
                  <span>
                    <small>
                      {record.language || record.difficulty}
                      {record.code ? ' · accepted code saved' : ''}
                    </small>
                    <strong>{record.title}</strong>
                  </span>
                  <span className="captured-action">Open explanation</span>
                </button>
              ) : record.questionId ? (
                <button type="button" onClick={() => onOpenQuestion(record.questionId)}>
                  <span>
                    <small>
                      {record.language || record.difficulty}
                      {record.code ? ' · accepted code saved' : ''}
                    </small>
                    <strong>{record.title}</strong>
                  </span>
                  <span className="captured-action">Open pattern lesson</span>
                </button>
              ) : (
                <div className="captured-copy">
                  <small>
                    {record.language || record.difficulty}
                    {record.code ? ' · accepted code saved' : ''}
                  </small>
                  <strong>{record.title}</strong>
                  <span className="captured-action">Explanation pending</span>
                </div>
              )}
              <a href={record.url} target="_blank" rel="noreferrer">
                Open on LeetCode
              </a>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

export default function QuestionsView({
  capturedQuestions,
  capturedLoaded,
  captureError,
  onImportProfile,
  profileImportResult,
  onOpenQuestion,
  onOpenProblem,
  onBack,
}) {
  const [query, setQuery] = useState('');
  const results = useMemo(() => searchQuestionCards(query), [query]);
  const groups = useMemo(() => (
    results.reduce((entries, card) => {
      const existing = entries.find((entry) => entry.name === card.group);
      if (existing) existing.cards.push(card);
      else entries.push({ name: card.group, cards: [card] });
      return entries;
    }, [])
  ), [results]);

  return (
    <main className="questions-view">
      <button className="text-back" type="button" onClick={onBack}>All categories</button>

      <header className="questions-hero">
        <p className="eyebrow">Question practice</p>
        <h1>Learn how to reach the solution.</h1>
        <p>
          Read the signal, choose the state, trace the move, and recall the
          invariant before looking at code.
        </p>
      </header>

      <ProfileImport result={profileImportResult} onImport={onImportProfile} />

      <CapturedQuestions
        records={capturedQuestions}
        loaded={capturedLoaded}
        error={captureError}
        onOpenQuestion={onOpenQuestion}
        onOpenProblem={onOpenProblem}
      />

      <label className="library-search questions-search">
        <span className="sr-only">Search questions</span>
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search a question, pattern, or constraint"
        />
      </label>

      <section className="question-library" aria-labelledby="question-library-title">
        <div className="index-heading">
          <h2 id="question-library-title">Question library</h2>
          <span>{results.length} explanations</span>
        </div>

        {groups.length === 0 ? (
          <div className="library-empty" role="status">
            <h2>No question found</h2>
            <p>Try a pattern such as sliding window, coin change, or backtracking.</p>
          </div>
        ) : (
          groups.map((group) => (
            <section className="question-group" key={group.name}>
              <h3>{group.name}</h3>
              <div className="question-index">
                {group.cards.map((card) => (
                  <button type="button" key={card.id} onClick={() => onOpenQuestion(card.id)}>
                    <span>
                      <strong>{card.title}</strong>
                      <small>{card.recognition}</small>
                    </span>
                    <span className="question-open">Study pattern</span>
                  </button>
                ))}
              </div>
            </section>
          ))
        )}
      </section>
    </main>
  );
}

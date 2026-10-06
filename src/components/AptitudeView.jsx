import { useMemo, useState } from 'react';
import { aptitudeGroups, aptitudePatterns, aptitudeQuestionCount, aptitudeSources, puzzleQuestionCount } from '../data/aptitudePractice.js';

const sourcesById = new Map(aptitudeSources.map((source) => [source.id, source]));
const localPuzzleLessons = [
  ['qualcomm-puzzles-measurement', 'Jugs, ropes & hourglasses'],
  ['qualcomm-puzzles-cubes-cuts', 'Painted cubes & cuts'],
  ['qualcomm-puzzles-balance-motion', 'Balance & motion'],
  ['qualcomm-puzzles-logic', 'Logic & labels'],
  ['qualcomm-puzzles-math-signals', 'Math & signals'],
];

function PracticeQuestion({ question }) {
  return (
    <details className="aptitude-question">
      <summary>
        <span>{question.prompt}</span>
        <small>{question.reported ? 'Reported prompt' : 'Original practice'}</small>
      </summary>
      <div className="aptitude-answer">
        <p className="eyebrow">Answer</p>
        <p className="aptitude-answer-lead">{question.answer}</p>
        <h3>Reason it through</h3>
        <ol>{question.steps.map((step) => <li key={step}>{step}</li>)}</ol>
        <p className="aptitude-trap"><strong>Watch for:</strong> {question.trap}</p>
        <div className="aptitude-source-links">
          <span>{question.reported ? 'Reported in' : 'Pattern evidence'}</span>
          {question.sources.map((id) => {
            const source = sourcesById.get(id);
            return <a key={id} href={source.url} target="_blank" rel="noreferrer">{source.title} ↗</a>;
          })}
        </div>
      </div>
    </details>
  );
}

export default function AptitudeView({ onBack, onOpenLesson }) {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [selectedPattern, setSelectedPattern] = useState(null);
  const [activeMode, setActiveMode] = useState('all');
  const needle = query.trim().toLowerCase();
  const pattern = aptitudePatterns.find((item) => item.id === selectedPattern);
  const isPuzzleGroup = (id) => id === 'qualcomm-reported' || id === 'classic-puzzles';
  const modeGroups = aptitudeGroups.filter((group) => activeMode === 'all'
    || (activeMode === 'puzzles' ? isPuzzleGroup(group.id) : !isPuzzleGroup(group.id)));
  const modePatterns = aptitudePatterns.filter((item) => activeMode === 'all'
    || (activeMode === 'puzzles' ? item.id.startsWith('puzzle-') : !item.id.startsWith('puzzle-')));
  const visibleGroups = useMemo(() => aptitudeGroups
    .filter((group) => activeMode === 'all'
      || (activeMode === 'puzzles' ? isPuzzleGroup(group.id) : !isPuzzleGroup(group.id)))
    .filter((group) => filter === 'all' || group.id === filter)
    .map((group) => ({
      ...group,
      questions: group.questions.filter((question) =>
        (!pattern || pattern.questionIds.includes(question.id))
        && (!needle || `${question.prompt} ${question.answer} ${group.title}`.toLowerCase().includes(needle))),
    }))
    .filter((group) => group.questions.length), [activeMode, filter, needle, pattern]);
  const visibleCount = visibleGroups.reduce((sum, group) => sum + group.questions.length, 0);
  const choosePattern = (id) => {
    setSelectedPattern((previous) => previous === id ? null : id);
    setActiveMode(id.startsWith('puzzle-') ? 'puzzles' : 'all');
    setFilter('all');
    setQuery('');
    window.requestAnimationFrame(() => document.getElementById('aptitude-questions')?.scrollIntoView({ behavior: 'auto' }));
  };
  const chooseMode = (mode) => {
    setActiveMode(mode);
    setFilter('all');
    setSelectedPattern(null);
    setQuery('');
    window.requestAnimationFrame(() => document.getElementById('aptitude-pattern-title')?.scrollIntoView({ behavior: 'auto' }));
  };

  return (
    <main className="aptitude-view">
      <button className="text-back" type="button" onClick={onBack}>← All categories</button>
      <header className="aptitude-hero">
        <p className="eyebrow">OA & interview practice</p>
        <h1>Aptitude, with the reasoning left in.</h1>
        <p>Quantitative questions, logic sets, and interview puzzles. Try a question before opening its answer; then check the assumption that makes the solution work.</p>
        <div className="aptitude-mode-switch" aria-label="Practice collection">
          <button type="button" aria-pressed={activeMode === 'all'} className={activeMode === 'all' ? 'is-active' : ''} onClick={() => chooseMode('all')}>Everything <span>{aptitudeQuestionCount}</span></button>
          <button type="button" aria-pressed={activeMode === 'aptitude'} className={activeMode === 'aptitude' ? 'is-active' : ''} onClick={() => chooseMode('aptitude')}>Aptitude <span>{aptitudeQuestionCount - puzzleQuestionCount}</span></button>
          <button type="button" aria-pressed={activeMode === 'puzzles'} className={activeMode === 'puzzles' ? 'is-active' : ''} onClick={() => chooseMode('puzzles')}>Puzzles <span>{puzzleQuestionCount}</span></button>
        </div>
      </header>
      <aside className="aptitude-provenance">
        <strong>What was actually reported?</strong>
        <p>Candidate accounts name Qualcomm prompts and OA topic areas. “Reported prompt” means a paraphrase of an identifiable account. “Original practice” is our worked example for a repeated topic or public classic. The study order below uses recurrence across the reviewed Qualcomm accounts, other-company OA reports, and IndiaBIX/GfG practice catalogs—not a measured frequency for all interviews.</p>
        <p>The downloaded Qualcomm folder’s puzzle lessons remain available below; this section adds standalone questions and broader aptitude practice.</p>
      </aside>
      {activeMode !== 'aptitude' && <div className="aptitude-local-lessons" aria-label="Local Qualcomm puzzle lessons">
        {localPuzzleLessons.map(([id, label]) => <button key={id} type="button" onClick={() => onOpenLesson(id)}>{label} <span aria-hidden="true">↗</span></button>)}
      </div>}
      <section className="aptitude-patterns" aria-labelledby="aptitude-pattern-title">
        <div className="aptitude-group-heading"><h2 id="aptitude-pattern-title">{activeMode === 'puzzles' ? 'Puzzle-solving patterns' : 'Patterns worth drilling first'}</h2><span>{modePatterns.length} families</span></div>
        <p className="aptitude-group-intro">The report count is the number of distinct Qualcomm candidate accounts reviewed here that mention the family. It is a source count, not the chance of seeing it in your test.</p>
        <div className="aptitude-pattern-list">
          {modePatterns.map((item) => {
            const evidence = item.sourceIds.map((id) => sourcesById.get(id));
            const qualcommReports = evidence.filter((source) => source.type === 'candidate').length;
            const otherReports = evidence.filter((source) => source.type === 'candidate-other').length;
            return (
              <article className="aptitude-pattern" key={item.id}>
                <div className="aptitude-pattern-top"><h3>{item.title}</h3><span>{item.tier}</span></div>
                <p>{item.method}</p>
                <div className="aptitude-pattern-proof">
                  <span>{qualcommReports} Qualcomm {qualcommReports === 1 ? 'account' : 'accounts'}</span>
                  {otherReports > 0 && <span>{otherReports} other-company {otherReports === 1 ? 'account' : 'accounts'}</span>}
                  {evidence.some((source) => source.type === 'editorial') && <span>practice-bank cross-check</span>}
                </div>
                <div className="aptitude-pattern-actions">
                  <button type="button" onClick={() => choosePattern(item.id)} aria-pressed={selectedPattern === item.id}>{selectedPattern === item.id ? 'Show all questions' : `Practice ${item.questionIds.length} variants`}</button>
                  <details><summary>Evidence</summary><div>{evidence.map((source) => <a key={source.id} href={source.url} target="_blank" rel="noreferrer">{source.title} ↗</a>)}</div></details>
                </div>
              </article>
            );
          })}
        </div>
      </section>
      <label className="library-search aptitude-search">
        <span className="sr-only">Search aptitude questions</span>
        <input type="search" value={query} onChange={(event) => { setQuery(event.target.value); setSelectedPattern(null); }} placeholder="Search probability, jugs, speed, seating…" />
        <span>{visibleCount} / {aptitudeQuestionCount}</span>
      </label>
      <div className="aptitude-filters" id="aptitude-questions" aria-label="Aptitude area">
        <button type="button" className={filter === 'all' && !pattern ? 'is-active' : ''} aria-pressed={filter === 'all' && !pattern} onClick={() => { setFilter('all'); setSelectedPattern(null); }}>All</button>
        {modeGroups.map((group) => (
          <button key={group.id} type="button" className={filter === group.id && !pattern ? 'is-active' : ''} aria-pressed={filter === group.id && !pattern} onClick={() => { setFilter(group.id); setSelectedPattern(null); }}>{group.title}</button>
        ))}
      </div>
      {pattern && <p className="aptitude-active-pattern">Showing {pattern.title} · <button type="button" onClick={() => setSelectedPattern(null)}>Clear pattern</button></p>}
      {visibleGroups.length ? visibleGroups.map((group) => (
        <section className="aptitude-group" key={group.id}>
          <div className="aptitude-group-heading"><h2>{group.title}</h2><span>{group.questions.length} questions</span></div>
          <p className="aptitude-group-intro">{group.intro}</p>
          <div className="aptitude-list">{group.questions.map((question) => <PracticeQuestion key={question.id} question={question} />)}</div>
        </section>
      )) : <p className="aptitude-empty" role="status">No matching questions. Try a shorter search or another area.</p>}
      <footer className="aptitude-footer">
        <p>Source-led selection, reviewed September 2026. Interview formats vary by team and year; practise method and explanation, not a claimed fixed paper.</p>
      </footer>
    </main>
  );
}

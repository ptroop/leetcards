import { useMemo, useState } from 'react';
import { commonInterviewCommunityReading, commonInterviewGroups, commonInterviewSources } from '../data/commonInterviewQuestions.js';

const normalize = (value) => value.toLowerCase().trim();

export default function CommonInterviewView({ onBack, onOpenProblem, onOpenQuestion, onOpenLesson }) {
  const [query, setQuery] = useState('');
  const filtered = useMemo(() => {
    const needle = normalize(query);
    if (!needle) return commonInterviewGroups;
    return commonInterviewGroups
      .map((group) => ({
        ...group,
        questions: group.questions.filter((item) => normalize(
          `${group.name} ${item.title} ${item.summary} ${item.insight ?? ''} ${item.pattern}`,
        ).includes(needle)),
      }))
      .filter((group) => group.questions.length > 0);
  }, [query]);

  const open = (item) => {
    if (item.destination === 'problem') onOpenProblem(item.slug);
    else if (item.destination === 'question') onOpenQuestion(item.questionId);
    else onOpenLesson(item.topicId);
  };

  const count = filtered.reduce((total, group) => total + group.questions.length, 0);

  return (
    <main className="common-interview-view">
      <button className="text-back" type="button" onClick={onBack}>All categories</button>
      <header className="common-interview-hero">
        <p className="eyebrow">Across companies</p>
        <h1>Common interview questions, by pattern.</h1>
        <p>
          Start with the question. Open the worked explanation to see the state,
          key move, proof, and implementation plan.
        </p>
      </header>

      <div className="common-interview-method">
        <p>
          Cross-checked in September 2026 against public practice lists, including Striver’s India-focused
          sheet. This is an editorial study selection, not a measured ranking or a claim that a named
          company asked every question.
          This collection stays within the current curriculum: no general trees
          or graphs; basic BST is included.
        </p>
        <div aria-label="Selection sources">
          {commonInterviewSources.map((source) => (
            <a key={source.url} href={source.url} target="_blank" rel="noreferrer">{source.title}</a>
          ))}
        </div>
        <p>
          Practice by pattern first. Then search an unfamiliar problem without using its category
          as a hint, explain the brute-force idea and invariant aloud, and revisit misses later.
          Community reports disagree on how many questions are “enough”; they are advice about
          practice, not verified interview-frequency data.
        </p>
        <details>
          <summary>Community discussions behind the practice advice</summary>
          <div aria-label="Community discussions">
            {commonInterviewCommunityReading.map((source) => (
              <a key={source.url} href={source.url} target="_blank" rel="noreferrer">{source.title}</a>
            ))}
          </div>
        </details>
      </div>

      <label className="library-search common-interview-search">
        <span className="sr-only">Search common interview questions</span>
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search a question or pattern"
        />
      </label>

      <div className="common-interview-count" aria-live="polite">
        {count} questions across {filtered.length} patterns
      </div>
      {filtered.length === 0 ? (
        <div className="library-empty" role="status">
          <h2>No match in this collection</h2>
          <p>Try a pattern name such as sliding window, linked list, or dynamic programming.</p>
        </div>
      ) : filtered.map((group) => (
        <section className="common-interview-group" key={group.name} aria-label={group.name}>
          <div className="common-interview-group-head">
            <h2>{group.name}</h2>
            <span>{group.questions.length}</span>
          </div>
          <div className="common-interview-list">
            {group.questions.map((item) => (
              <button key={`${group.name}-${item.id}`} type="button" onClick={() => open(item)}>
                <span>
                  <strong>{item.title}</strong>
                  <small>{item.summary}</small>
                </span>
                <span className="common-interview-open">Open explanation <span aria-hidden="true">↗</span></span>
              </button>
            ))}
          </div>
        </section>
      ))}
    </main>
  );
}

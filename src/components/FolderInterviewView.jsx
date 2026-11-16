import { useMemo, useState } from 'react';
import { filterFolderQuestions, folderQuestions, folderSources, folderSourceById } from '../data/folderInterviewQuestions.js';
import { topicById } from '../data/curriculum.js';

const labels = { reported: 'Reported prompt', 'topic-only': 'Topic recollection', clarify: 'Clarify the constraints', 'user-recalled': 'User recollection · company unconfirmed' };

export default function FolderInterviewView({ company, onBack, onOpenLesson, onOpenCompany }) {
  const [query, setQuery] = useState('');
  const [area, setArea] = useState('');
  const [sourceId, setSourceId] = useState('');
  const [status, setStatus] = useState('');
  const name = company === 'chelsio' ? 'Chelsio' : 'Qualcomm';
  const companyQuestions = useMemo(() => folderQuestions.filter((q) => q.company === company || q.company === 'shared'), [company]);
  const sources = useMemo(() => folderSources.filter((source) => source.path.startsWith(`${name}/`)), [name]);
  const areas = [...new Set(companyQuestions.map((q) => q.area))].sort();
  const filtered = useMemo(() => filterFolderQuestions({ company, query, area, sourceId, status }), [company, query, area, sourceId, status]);
  const reset = () => { setQuery(''); setArea(''); setSourceId(''); setStatus(''); };

  return (
    <main className="folder-interview-view">
      <button className="text-back" type="button" onClick={onBack}>← All categories</button>
      <header className="category-hero">
        <p className="eyebrow">Interview question collection</p>
        <h1>{name} questions.</h1>
        <p>Programming, systems, networking, logical reasoning and practical testing from the supplied interview folders.</p>
      </header>
      <nav className="folder-company-switch" aria-label="Company questions">
        <button type="button" aria-current={company === 'chelsio' ? 'page' : undefined} onClick={() => onOpenCompany('chelsio')}>Chelsio</button>
        <button type="button" aria-current={company === 'qualcomm' ? 'page' : undefined} onClick={() => onOpenCompany('qualcomm')}>Qualcomm</button>
      </nav>
      <p className="folder-method">Candidate recollections and study material, including document images and nested archives. Reworded variants are retained; counts are prompts, not unique problems or interview frequency. Incomplete statements are labeled. Related lessons explain the topic; worked answers appear where provided below.</p>
      <label className="library-search">
        <span className="sr-only">Search {name} folder questions</span>
        <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search questions, code, puzzles or source files" />
      </label>
      <div className="folder-filters">
        <label>Topic<select value={area} onChange={(e) => setArea(e.target.value)}><option value="">All topics</option>{areas.map((item) => <option key={item}>{item}</option>)}</select></label>
        <label>Source<select value={sourceId} onChange={(e) => setSourceId(e.target.value)}><option value="">All sources</option>{sources.filter((s) => s.kind !== 'nested-archive').map((s) => <option value={s.id} key={s.id}>{s.path.replace(`${name}/`, '')}</option>)}<option value="U001">User recollections</option></select></label>
        <label>Statement<select value={status} onChange={(e) => setStatus(e.target.value)}><option value="">All statements</option>{Object.entries(labels).map(([id, label]) => <option value={id} key={id}>{label}</option>)}</select></label>
        <button type="button" onClick={reset}>Reset filters</button>
      </div>
      <p className="common-interview-count" role="status">{filtered.length} of {companyQuestions.length} prompts · {sources.length} source files</p>
      <section className="folder-question-list" aria-label={`${name} question bank`}>
        {!filtered.length && <div className="library-empty"><h2>No matching questions</h2><p>Try fewer search words or reset the filters.</p></div>}
        {filtered.map((question) => {
          const topic = topicById.get(question.topicId);
          return (
            <details className="folder-question" key={question.id} id={question.id}>
              <summary><span className="eyebrow">{question.area} · {labels[question.status]}</span><span className="folder-question-title">{question.prompt}</span></summary>
              <div className="folder-question-body">
                {question.examples && <table className="folder-examples"><caption>Dam Design examples checked against the linked post</caption><thead><tr><th scope="col">Wall positions</th><th scope="col">Wall heights</th><th scope="col">Maximum mud height</th></tr></thead><tbody>{question.examples.map((example) => <tr key={example.positions.join(',')}><td>{example.positions.join(', ')}</td><td>{example.heights.join(', ')}</td><td>{example.expected}</td></tr>)}</tbody></table>}
                {question.diagram === 'five-regions' && <svg viewBox="0 0 360 200" role="img" aria-label="Rectangle with three upper regions and two lower regions"><path d="M20 20H340V180H20ZM20 100H340M125 20V100M235 20V100M180 100V180" fill="none" stroke="currentColor" strokeWidth="3" /></svg>}
                {question.code && <pre><code>{question.code}</code></pre>}
                {question.clarification && <p className="folder-clarification"><strong>Clarification:</strong> {question.clarification}</p>}
                {question.answer && <section><h2>Reasoning and answer</h2><p>{question.answer}</p></section>}
                {question.status === 'topic-only' && <p>The source records a topic rather than a complete question. Use the related lesson to prepare; the original constraints were not supplied.</p>}
                {topic && <button type="button" className="text-back" onClick={() => onOpenLesson(topic.id)}>Study related lesson: {topic.title} ↗</button>}
                <details className="folder-provenance"><summary>Question sources ({question.sources.length})</summary><ul>{question.sources.map((citation, i) => <li key={`${citation.sourceId}-${i}`}>{folderSourceById.get(citation.sourceId)?.path} · {citation.location}</li>)}</ul></details>
                {question.references?.map((ref) => <p key={ref.url}><a href={ref.url} target="_blank" rel="noreferrer">{ref.title} ↗</a></p>)}
              </div>
            </details>
          );
        })}
      </section>
      <details className="folder-source-index"><summary>Source inventory · {sources.length} files</summary><p>Alternate formats, supplied solution programs and archive containers are tracked alongside question sources.</p><ul>{sources.map((s) => <li key={s.id}>{s.path.replace(`${name}/`, '')} <small>· {s.kind.replaceAll('-', ' ')} · {s.questionIds.length} linked prompts</small>{s.notes && <p>{s.notes}</p>}</li>)}</ul></details>
    </main>
  );
}

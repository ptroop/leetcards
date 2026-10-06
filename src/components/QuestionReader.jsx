import MechanismVisual from './MechanismVisual.jsx';
import { CodePairBlock } from './LessonBlock.jsx';

function FlashcardDeck({ cards }) {
  return (
    <section className="question-flashcards" aria-labelledby="flashcards-title">
      <header>
        <h2 id="flashcards-title">Recall cards</h2>
        <p>Answer first, then reveal the compact check.</p>
      </header>
      <div>
        {cards.map((card) => (
          <details key={card.prompt}>
            <summary>{card.prompt}</summary>
            <p>{card.answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

function AcceptedSolutions({ captures }) {
  const accepted = captures.filter((capture) => capture.code);
  if (accepted.length === 0) return null;

  return (
    <section className="accepted-solutions" aria-labelledby="accepted-solutions-title">
      <header>
        <p className="eyebrow">Your accepted code</p>
        <h2 id="accepted-solutions-title">Read your implementation against the invariant.</h2>
        <p>
          The explanation above supplies the reasoning model. Expand your saved
          solution and identify where its state, movement, boundary checks, and
          complexity express that model.
        </p>
      </header>
      <div>
        {accepted.map((capture) => (
          <details key={capture.slug}>
            <summary>
              <span>{capture.title}</span>
              <small>{capture.language}</small>
            </summary>
            <pre><code>{capture.code}</code></pre>
          </details>
        ))}
      </div>
    </section>
  );
}

export default function QuestionReader({
  question,
  captures,
  onBack,
  onOpenLesson,
}) {
  const solvedCopies = captures.filter((capture) => capture.questionId === question.id);

  return (
    <main className="reader-main">
      <article className="question-reader">
        <button className="text-back lesson-back" type="button" onClick={onBack}>
          All questions
        </button>

        <header className="question-hero">
          <div className="lesson-meta">
            <span>{question.group}</span>
            <span aria-hidden="true">/</span>
            <span>{solvedCopies.length > 0 ? 'captured as solved' : 'practice question'}</span>
          </div>
          <h1>{question.title}</h1>
          <p>{question.summary}</p>
        </header>

        <section className="pattern-definition question-pattern-definition" aria-labelledby="question-pattern-title">
          <p className="eyebrow">Pattern definition</p>
          <h2 id="question-pattern-title">{question.teachingPattern.name}</h2>
          <p>{question.teachingPattern.definition}</p>
          <dl>
            <div>
              <dt>When the question is pointing here</dt>
              <dd>{question.recognition}</dd>
            </div>
            <div>
              <dt>The state you must be able to say aloud</dt>
              <dd>{question.invariant}</dd>
            </div>
            <div>
              <dt>When this pattern is the wrong tool</dt>
              <dd>{question.boundary}</dd>
            </div>
          </dl>
        </section>

        <section className="pattern-derivation" aria-labelledby="pattern-derivation-title">
          <p className="eyebrow">Derive it</p>
          <h2 id="pattern-derivation-title">The code follows these decisions.</h2>
          <ol>
            {question.derivation.map((step, index) => (
              <li key={step}>
                <span>{String(index + 1).padStart(2, '0')}</span>
                <p>{step}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="question-trace" aria-labelledby="question-trace-title">
          <p className="eyebrow">Interactive trace</p>
          <h2 id="question-trace-title">Move through one complete execution.</h2>
          <MechanismVisual block={{
            ...question.visual,
            type: 'visual',
            guide: question.teachingPattern,
            invariant: question.teachingPattern?.invariant,
            prediction: question.patternQuestion,
          }} />
        </section>

        <section className="problem-proof question-proof" aria-labelledby="question-proof-title">
          <p className="eyebrow">Why it works</p>
          <h2 id="question-proof-title">Name what cannot be skipped.</h2>
          <p>{question.correctness}</p>
          <p>{question.invariant}</p>
        </section>

        <CodePairBlock
          className="question-code"
          block={{
            heading: 'Implementation shape',
            note: `Target: ${question.complexity}. Read each update against the invariant above; the code is the final expression of the argument.`,
            variants: [
              {
                id: 'c',
                label: 'C',
                standard: 'C17',
                code: question.cCode,
              },
              {
                id: 'cpp',
                label: 'C++',
                standard: 'C++20',
                code: question.cppCode,
              },
            ],
          }}
        />

        <AcceptedSolutions captures={solvedCopies} />

        <section className="question-pitfalls" aria-labelledby="question-pitfalls-title">
          <p className="eyebrow">Failure checks</p>
          <h2 id="question-pitfalls-title">Mistakes that reveal a memorized pattern.</h2>
          <ul>
            {[...question.pitfalls, question.boundary].map((item) => <li key={item}>{item}</li>)}
          </ul>
        </section>

        <FlashcardDeck cards={question.flashcards} />

        <footer className="question-concept-link">
          <p>Need the full mechanism, failure cases, and paired C and C++ implementation?</p>
          <button type="button" className="underlined-button" onClick={() => onOpenLesson(question.lessonTopicId)}>
            Open the concept lesson
          </button>
        </footer>
      </article>
    </main>
  );
}

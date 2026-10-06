import { useEffect, useState } from 'react';

function ReasoningStepper({ lesson }) {
  const steps = lesson.derivation;
  const [index, setIndex] = useState(0);

  useEffect(() => {
    setIndex(0);
  }, [lesson.slug]);

  const current = steps[index];

  return (
    <section className="reasoning-stepper" aria-labelledby="reasoning-stepper-title">
      <header>
        <div>
          <p className="eyebrow">Interactive derivation</p>
          <h2 id="reasoning-stepper-title">Build the algorithm one decision at a time.</h2>
        </div>
        <span aria-live="polite">Step {index + 1}/{steps.length}</span>
      </header>

      <div className="reasoning-stage">
        <ol aria-label="Derivation steps">
          {steps.map((step, stepIndex) => (
            <li key={step}>
              <button
                type="button"
                className={stepIndex === index ? 'is-active' : ''}
                aria-current={stepIndex === index ? 'step' : undefined}
                onClick={() => setIndex(stepIndex)}
              >
                <span>{String(stepIndex + 1).padStart(2, '0')}</span>
                <span>{stepIndex < index ? 'Understood' : stepIndex === index ? 'Current decision' : 'Next decision'}</span>
              </button>
            </li>
          ))}
        </ol>

        <div className="reasoning-focus" key={`${lesson.slug}-${index}`}>
          <p>{current}</p>
          <small>
            {index === 0
              ? 'Do not move on until every state word has one exact meaning.'
              : index === steps.length - 1
                ? 'The implementation now follows from the argument; it is no longer a memorized template.'
                : 'This decision must preserve the invariant before the next step begins.'}
          </small>
        </div>
      </div>

      <footer>
        <button type="button" onClick={() => setIndex((value) => Math.max(0, value - 1))} disabled={index === 0}>
          Previous
        </button>
        <button
          type="button"
          onClick={() => setIndex((value) => Math.min(steps.length - 1, value + 1))}
          disabled={index === steps.length - 1}
        >
          Next
        </button>
      </footer>
    </section>
  );
}

function WorkedTrace({ steps }) {
  return (
    <section className="problem-worked-trace" aria-labelledby="worked-trace-title">
      <p className="eyebrow">Worked trace</p>
      <h2 id="worked-trace-title">Watch the state change on a real input.</h2>
      <ol>
        {steps.map((step, index) => (
          <li key={step}>
            <span>{index + 1}</span>
            <p>{step}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}

function AcceptedCode({ capture, target, isCommonInterview }) {
  if (!capture?.code) {
    return (
      <section className="problem-code-empty">
        <p className="eyebrow">Implementation</p>
        <h2>{isCommonInterview ? 'Implementation plan above; reference code is not included yet.' : 'No accepted code was saved for this problem.'}</h2>
        {!isCommonInterview && <p>Import the profile export again to place your local solution beside this explanation.</p>}
      </section>
    );
  }

  return (
    <section className="problem-accepted-code" aria-labelledby="accepted-code-title">
      <header>
        <div>
          <p className="eyebrow">Your accepted implementation</p>
          <h2 id="accepted-code-title">Now read the code as the proof written in syntax.</h2>
        </div>
        <span>{capture.language}</span>
      </header>
      <div className="code-reading-guide">
        <p>
          Find the variables that represent the invariant, the line that makes
          the state transition, and the boundary that ends the search.
        </p>
        <p><strong>Efficient target:</strong> {target}</p>
      </div>
      <details>
        <summary>Open accepted code</summary>
        <pre><code>{capture.code}</code></pre>
      </details>
    </section>
  );
}

export default function ProblemLessonReader({ lesson, capture, isCommonInterview = false, onBack }) {
  return (
    <main className="reader-main">
      <article className="problem-lesson-reader">
        <button className="text-back lesson-back" type="button" onClick={onBack}>
          ← {isCommonInterview ? 'Common interviews' : 'Solved questions'}
        </button>

        <header className="problem-lesson-hero">
          <div className="lesson-meta">
            <span>{isCommonInterview ? 'Interview practice' : 'LeetCode solution'}</span>
            <span aria-hidden="true">/</span>
            <span>{lesson.pattern.name}</span>
          </div>
          <h1>{lesson.title}</h1>
          <p>{lesson.problem}</p>
        </header>

        <section className="problem-explanation-lead">
          <div>
            <p className="eyebrow">Begin with the obvious idea</p>
            <h2>The slower solution is useful—because it exposes the repeated work.</h2>
            <p>{lesson.bruteForce}</p>
          </div>
          <aside>
            <span>The turning point</span>
            <p>{lesson.keyObservation}</p>
          </aside>
        </section>

        <section className="pattern-definition" aria-labelledby="pattern-definition-title">
          <p className="eyebrow">Pattern definition</p>
          <h2 id="pattern-definition-title">{lesson.pattern.name}</h2>
          <p>{lesson.pattern.definition}</p>
          <dl>
            <div>
              <dt>When to recognize it</dt>
              <dd>{lesson.pattern.recognition}</dd>
            </div>
            <div>
              <dt>The invariant</dt>
              <dd>{lesson.pattern.invariant}</dd>
            </div>
          </dl>
        </section>

        <ReasoningStepper lesson={lesson} />
        <WorkedTrace steps={lesson.example} />

        <section className="problem-proof" aria-labelledby="problem-proof-title">
          <p className="eyebrow">Why this is correct</p>
          <h2 id="problem-proof-title">The algorithm does not skip a possible answer.</h2>
          <p>{lesson.correctness}</p>
          <p>{lesson.keyObservation}</p>
        </section>

        <section className="implementation-plan" aria-labelledby="implementation-plan-title">
          <p className="eyebrow">Implementation plan</p>
          <h2 id="implementation-plan-title">Write these decisions in this order.</h2>
          <p>{lesson.implementation}</p>
          <div>
            <strong>Target complexity</strong>
            <span>{lesson.complexity}</span>
          </div>
        </section>

        <AcceptedCode capture={capture} target={lesson.complexity} isCommonInterview={isCommonInterview} />

        <section className="problem-defenses" aria-labelledby="problem-defenses-title">
          <p className="eyebrow">Defend the solution</p>
          <h2 id="problem-defenses-title">Inputs and mistakes that expose weak understanding.</h2>
          <div>
            <article>
              <h3>Edge cases</h3>
              <ul>
                {lesson.edgeCases.map((item) => <li key={item}>{item}</li>)}
              </ul>
            </article>
            <article>
              <h3>Common mistakes</h3>
              <ul>
                {lesson.pitfalls.map((item) => <li key={item}>{item}</li>)}
              </ul>
            </article>
          </div>
        </section>
      </article>
    </main>
  );
}

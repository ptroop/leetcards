# Leetcards content and code quality standard

Reviewed through 22 September 2026.

## What the evidence says

- Unguarded answer-giving can improve immediate exercise performance while reducing later unaided performance. Leetcards therefore asks for a prediction, shows the mechanism, and ends with retrieval rather than treating recognition as learning. Source: [PNAS randomized trial](https://doi.org/10.1073/pnas.2422633122).
- A tutor must preserve learner agency, critical thinking, privacy, and human verification. Source: [UNESCO guidance for generative AI in education](https://www.unesco.org/en/articles/guidance-generative-ai-education-and-research).
- Readers complain about prose that is polished but interchangeable: vague attribution, filler openings, repeated conclusions, passive voice, and generic claims without concrete nouns or evidence. Corpus research also finds a rise in recognizable generated-language markers. Sources: [Cambridge analysis](https://www.cambridge.org/news-and-insights/does-chat-gpt-make-the-grade-cambridge-research), [undergraduate-writing study](https://www.sciencedirect.com/science/article/pii/S2666920X2500147X), and [community editor report](https://www.reddit.com/r/WritingWithAI/comments/1qwyhvt/what_i_learned_as_an_exjournalist_from/).
- Developers report that nearly-correct output and extra debugging are their largest AI-tool frustrations; more respondents distrust accuracy than trust it. Source: [Stack Overflow 2025 Developer Survey](https://survey.stackoverflow.co/2025/ai).
- Generated code can appear functional while failing security or repository-quality constraints. Sources: [Veracode 2025 GenAI Code Security Report](https://www.veracode.com/wp-content/uploads/2025_GenAI_Code_Security_Report_Final.pdf), [METR real-repository study](https://metr.org/blog/2025-07-10-early-2025-ai-experienced-os-dev-study/), and [METR holistic evaluation update](https://metr.org/blog/2025-08-12-research-update-towards-reconciling-slowdown-with-time-horizons/).
- Practitioner complaints repeatedly identify huge diffs, invented APIs, tests that reproduce the same mistaken assumption, abstractions with no need, comments that restate code, and changes nobody can explain. These reports are anecdotal, so they inform review checks rather than factual performance claims. Sources: [ExperiencedDevs discussion](https://www.reddit.com/r/ExperiencedDevs/comments/1kr8clp/ai_slop_prs_are_burning_me_and_my_team_out_hard/) and [Hacker News discussion](https://news.ycombinator.com/item?id=45278819).

## Lesson contract

Every lesson must answer six questions in this order:

1. What is it? Give the definition before terminology branches.
2. Why does it exist? Name the concrete problem or constraint.
3. What state changes? Trace the mechanism in causal order.
4. Where is it used? Name a real software, operating-system, or hardware path.
5. How does it fail? Pair symptom, cause, and discriminating check.
6. Can the learner reconstruct it? Require prediction, trace, implementation, or recall.

Short topics may compress the middle, but they may not omit the definition or causal rule. Deep topics require a worked example, failure diagnosis, verification steps, and an explanatory visual.

## Writing rules

- Start with the answer. Do not open with scene-setting.
- Prefer exact nouns, values, registers, syscalls, signals, and data structures over adjectives.
- Do not claim “research shows” without naming and linking the source.
- Do not use an analogy where a real system path is clearer.
- Do not repeat the same point under several headings.
- Do not call a list of labels an explanation; connect each step with cause and effect.
- Do not hide uncertainty. Candidate reports are recollections, not official Qualcomm material.

## Code rules

- Match the repository’s existing architecture before adding an abstraction.
- Keep changes proportional to the requirement and inspect every changed file.
- Compile examples with warnings enabled and test observable behavior, not merely execution or coverage.
- Verify failure paths, ownership, bounds, concurrency, security boundaries, and cleanup.
- Never invent an API, dependency, external service, test expectation, or compatibility requirement.
- A passing test is insufficient when the test and implementation encode the same unstated assumption.

Run `npm run audit:writing`, `npm run audit:code`, and then `npm run verify` before release.

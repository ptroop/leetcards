# Core Curriculum Teaching System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace Leetcards’ generic core lessons and meaningless visuals with concise, authored explanations, technical-sketch diagrams, and pattern-first DSA editorials.

**Architecture:** The work is split into four independently testable plans. First establish semantic lesson records and the SVG sketch renderer; then migrate systems content and DSA content independently; finally remove obsolete generators and enforce whole-curriculum regression checks.

**Tech Stack:** React 19, JavaScript ES modules, SVG, CSS, Node’s built-in test runner, Vite 8

## Global Constraints

- Do not rewrite Qualcomm Prep, college Linux assignments, college MCU assignments, or college DSA assignments.
- Use original explanations and examples; do not copy NeetCode, AlgoMonster, Anthropic, or Claude assets or wording.
- Keep lessons dense and causal; use brief, standard, or deep depth according to mechanism complexity.
- Outside the C++ category, code-bearing core lessons expose both C and C++ unless an excluded assignment is explicitly C-only.
- ASCII diagrams are not primary teaching visuals.
- Static SVG sketches are preferred unless stepping through state teaches a meaningful invariant.
- Interactive visuals expose current state, action, reason, invariant, result, and `Step x/y`.
- Do not add a progress slider that merely mirrors Next/Previous controls.
- No browser screenshot review is required; automated render and regression checks are required.
- Preserve the existing prerequisite-first category and lesson order.
- Keep the app runnable after every committed task.

## Plan Sequence

1. [Lesson schema and technical-sketch foundation](./2026-07-30-lesson-schema-and-technical-sketches.md)
2. [Core systems curriculum rewrite](./2026-07-30-core-systems-curriculum-rewrite.md)
3. [DSA patterns and problem editorials rewrite](./2026-07-30-dsa-patterns-and-editorials-rewrite.md)
4. [Migration cleanup and curriculum regression](./2026-07-30-curriculum-migration-regression.md)

## Execution Gate

Each linked plan has its own red-green-refactor cycles and commits. Execute them in the listed order because later plans consume the authored lesson schema and sketch primitives introduced by the first plan.

The complete delivery gate is:

```powershell
npm.cmd test
npm.cmd run verify:college-dsa
npm.cmd run build
git diff --check
```

Expected result: all applicable tests pass, the college DSA verifier passes, the production build succeeds, and `git diff --check` prints no errors.


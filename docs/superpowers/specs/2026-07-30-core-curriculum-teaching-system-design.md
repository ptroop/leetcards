# Leetcards Core Curriculum Teaching System

**Date:** 2026-07-30  
**Status:** Approved design  
**Scope:** Core curriculum and imported LeetCode lessons  
**Explicit exclusions:** Qualcomm Prep, college Linux assignments, college MCU assignments, and college DSA assignments

## 1. Goal

Leetcards must teach each concept rather than merely name it, decorate it, or attach a generic interaction to it.

The writing should be:

- dense but readable;
- short when a topic is simple and deep when the mechanism demands depth;
- concrete, causal, and technically precise;
- grounded in real uses rather than decorative analogies;
- structured so a learner can reconstruct the idea instead of memorizing a slogan.

DSA patterns and problem editorials should provide the clarity and derivation associated with strong pattern-first teaching sites such as NeetCode and AlgoMonster, while using original wording, examples, diagrams, and implementations.

## 2. In-scope curriculum

The rewrite covers:

- C and C tricks;
- C++;
- Linux and OS foundations;
- computer architecture;
- networking;
- Git;
- debugging;
- testing;
- electronics;
- schematic reading;
- general embedded systems;
- STM32F446RE;
- RTOS and embedded concurrency;
- selected DSA patterns and structures;
- imported LeetCode problem lessons.

Existing scope exclusions remain in force. Curriculum ordering remains prerequisite-first. C and C++ implementations are supplied wherever code is useful outside the C++ category, except where an existing assignment is explicitly C-only and excluded from this rewrite.

## 3. Authored lesson contract

Every rewritten concept lesson must answer the following questions in this order:

1. **What is it?** A direct definition using the correct technical vocabulary.
2. **Why does it exist?** The problem or constraint that caused the concept to be used.
3. **How does it work?** The mechanism, state changes, and causal chain.
4. **Can I follow one concrete example?** A worked trace with actual values, addresses, bits, registers, objects, commands, or signals.
5. **Where is it used?** A real implementation or engineering situation.
6. **What usually goes wrong?** A failure mode, misconception, or debugging symptom.
7. **How do I use or verify it?** Code, a command, a measurement, a test, or a datasheet check where relevant.
8. **What must I remember?** A compact recall section containing only durable facts.

These are semantic requirements, not mandatory visible headings. A short lesson may combine adjacent answers when that improves flow.

### 3.1 Variable depth

Lesson length is selected by mechanism complexity:

- **Brief:** terminology, a narrow tool command, or a concept with one simple rule.
- **Standard:** a concept with several moving parts and one useful worked example.
- **Deep:** ownership, lifetime, concurrency, protocols, hardware behavior, OS transitions, memory, architecture, or concepts with important failure modes.

Depth is not inferred from a generic word count. A lesson is complete when its causal model is complete.

### 3.2 Prohibited content patterns

The rewritten core lessons must not contain:

- generic “observe the state” filler;
- a definition repeated as a supposed real-world example;
- timeline frames containing only a keyword and “state 1/state 2”;
- a widget whose controls do not correspond to the taught mechanism;
- unexplained code dumps;
- unexplained formulas or register names;
- claims that an interaction teaches something when the learner cannot predict or inspect a meaningful state transition.

## 4. DSA pattern lesson contract

Each important DSA pattern is its own subtopic. It must include:

1. the family of problems the pattern solves;
2. the brute-force work being repeated;
3. the observation that removes that repeated work;
4. the maintained state and invariant;
5. exact pointer, boundary, queue, stack, or table update rules;
6. one complete input trace;
7. C and C++ implementations;
8. a short correctness argument;
9. time and space complexity derived from the operations;
10. signals that indicate when to use the pattern;
11. cases where the pattern does not apply;
12. related problems grouped by the same invariant.

Linked-list techniques such as dummy heads, fast/slow pointers, nth-from-end gaps, cycle entry, in-place reversal, and list partitioning remain separate lessons rather than one combined code block.

## 5. Problem editorial contract

Each imported LeetCode problem lesson must include:

1. a plain restatement of the task and constraints;
2. a small input walked through by hand;
3. the straightforward or brute-force approach and why it becomes too expensive;
4. the key insight leading to the efficient approach;
5. the associated pattern and invariant;
6. a step-by-step derivation of the algorithm;
7. a complete trace of the efficient algorithm;
8. C and C++ solutions;
9. an explanation of meaningful code blocks and state variables;
10. derived time and space complexity;
11. common wrong approaches and edge cases;
12. a comparison against the imported solution when it is less efficient, less safe, or harder to reason about.

Problem lessons must not manufacture a “how to solve” section from generic templates. Their explanations must be problem-specific.

## 6. Technical sketch visual system

ASCII diagrams will not be used as primary teaching visuals. Leetcards will use a reusable SVG-based technical sketch system that feels hand drawn while remaining precise and accessible.

### 6.1 Visual character

- warm paper-toned background;
- near-black ink;
- one muted accent for the active signal or changing state;
- slightly irregular, sketch-like strokes;
- restrained handwritten annotations paired with the site’s readable body type;
- no gradients, heavy shadows, glossy controls, or decorative dashboard chrome;
- stable geometry so diagrams do not become visually noisy.

The style should evoke a careful engineer’s notebook, not a cartoon and not a visual copy of another product.

### 6.2 Diagram primitives

Reusable primitives will cover:

- wires, junctions, rails, ground, and standard component symbols;
- MCU pins, buses, registers, bit fields, and peripheral blocks;
- signal arrows and highlighted current/data paths;
- timing traces, clocks, edges, setup/hold windows, ACK/NACK, and sampled values;
- stack frames, heap blocks, ownership links, pages, cache lines, and address translation;
- arrays, windows, pointers, linked-list nodes, trees, queues, stacks, grids, and DP dependencies;
- terminal commands, process trees, file descriptors, pipes, and syscall boundary transitions.

All visual primitives require accessible titles, descriptions, and a text equivalent.

### 6.3 Static versus interactive rule

A visual is static when one annotated state or a short sequence of panels communicates the mechanism completely.

A visual is interactive only when manipulating or stepping through state teaches a meaningful rule. An interaction must expose:

- the current state;
- the action taken;
- why that action is legal;
- the invariant that remains true;
- the resulting state;
- a concise `Step x/y` indicator.

No progress slider will move merely because a Next button was clicked. Sliders are reserved for genuine continuous or index-controlled exploration.

### 6.4 Domain-specific visual choices

- **Electronics:** annotated schematic fragments, voltage/current paths, equivalent states, and expected meter or oscilloscope readings.
- **Protocols:** timing diagrams and transaction frames.
- **Architecture:** address breakdowns, cache mapping, pipelines, and memory-translation paths.
- **Linux:** process/file-descriptor diagrams, memory layouts, scheduler or syscall transitions, and IPC flow.
- **C/C++:** object lifetime, storage duration, ownership, dispatch, layout, and exception-unwinding diagrams.
- **DSA:** state-specific pointer and boundary movement, not generic animation.
- **STM32:** schematic → pin/alternate function → register/peripheral → waveform → debugger observation.

## 7. Example: pull-up and pull-down resistors

The pull-resistor lesson will define a floating input before introducing the resistor.

It will explain that a high-impedance input does not choose a stable logic level by itself. A pull-up provides a weak path to `VCC`; a pull-down provides a weak path to ground. A switch or open-drain transistor can then override that weak default.

The primary diagram will be an SVG schematic with:

- `VCC`, resistor, input node, open-drain transistor, and ground;
- standard symbols and junction marks;
- an highlighted path for the transistor-off state;
- an highlighted path for the transistor-on state;
- input voltage and expected digital reading in both states;
- optional meter-probe markers.

The worked explanation will derive:

- transistor off: negligible DC input current, so the resistor holds the node near `VCC`;
- transistor on: the node is pulled near ground;
- current while low: approximately `(VCC - Vlow) / Rpull-up`;
- stronger pull-up: faster rising edge but greater low-state current;
- weaker pull-up: lower current but slower rise because the resistor and bus capacitance form an RC network.

The lesson will connect this mechanism to buttons, reset lines, interrupt lines, and open-drain buses such as I2C. It will show the real failure symptoms of a missing or badly selected resistor: random input changes, slow edges, excessive current, or a bus that cannot meet timing.

## 8. Content architecture

Generic lesson generators will remain only for narrow presentation normalization. They must not invent teaching content.

Core content will be authored through typed, domain-aware lesson records:

- `definition`;
- `motivation`;
- `mechanism`;
- `workedExample`;
- `realUse`;
- `failureModes`;
- `verification`;
- `recall`;
- optional `codeExamples`;
- optional `diagramSpec`;
- optional `interactiveSpec`.

Domain-specific profiles may add fields such as:

- `invariant`, `trace`, and `proof` for DSA;
- `voltageStates`, `currentPaths`, and `measurements` for electronics;
- `registers`, `timingConstraints`, and `debugChecks` for STM32;
- `kernelPath`, `errnoCases`, and `observableCommands` for Linux;
- `lifetimeEvents`, `ownership`, and `dispatch` for C++.

The renderer may adapt presentation by domain, but it must not dilute or paraphrase away authored explanations.

## 9. Validation strategy

Tests will verify meaning and coverage, not merely text length.

### 9.1 Schema tests

- every in-scope topic has the required semantic fields for its depth;
- every code-bearing non-C++ lesson has the required language implementations;
- each visual has a teaching question, accessible description, and text equivalent;
- interactive scenes declare meaningful states, actions, invariants, and terminal conditions;
- excluded collections are not rewritten by the core-content migration.

### 9.2 Topic-specific contract tests

Critical lessons receive factual assertions. Examples:

- pull-up/pull-down covers floating inputs, both transistor states, resistor trade-off, and RC rise time;
- constructors cover default, parameterized, copy, move, delegating, conversion, explicit, defaulted, and deleted forms;
- exception handling covers stack unwinding and exception-safety guarantees;
- cache lessons cover line, set, tag, hit, miss, replacement, locality, and write behavior;
- virtual memory covers page tables, TLBs, page faults, permissions, and observable process behavior;
- linked-list cycle lessons separately cover detection and cycle-entry derivation;
- sliding-window lessons define the maintained window invariant.

### 9.3 Render and regression tests

- every lesson route renders;
- lesson pages remain scrollable;
- diagrams render from valid specifications;
- keyboard and reduced-motion behavior are preserved;
- existing Qualcomm Prep and college assignment content remains byte-for-byte or snapshot stable where practical;
- production build and the full automated test suite pass.

Per the user’s direction, browser screenshot review is not part of this rewrite. Automated rendering and structural regression checks remain required.

## 10. Migration approach

The rewrite will proceed in dependency order:

1. create semantic schemas and tests;
2. replace generic visual generation with explicit diagram specifications;
3. rewrite foundations in C, C++, electronics, Linux, and architecture;
4. rewrite embedded, STM32, RTOS, networking, Git, debugging, and testing;
5. rewrite DSA pattern lessons;
6. reconcile imported problem editorials against the stronger pattern lessons;
7. remove obsolete filler and meaningless interactions;
8. run coverage, code-compilation, regression, and production-build checks.

Each migration batch must leave the app runnable and preserve excluded content.

## 11. Success criteria

The rewrite is successful when:

- opening any in-scope concept produces an actual definition and causal explanation;
- the learner can trace at least one concrete example for every mechanism-heavy lesson;
- practical uses deepen the technical model rather than replacing it with analogy;
- visuals answer a named technical question and remain understandable without interaction;
- interactions exist only where state manipulation improves understanding;
- DSA patterns and problems explain the efficient solution from invariant to implementation;
- C and C++ coverage follows the established language rules;
- no excluded prep or college-assignment collection is unintentionally changed;
- automated tests and the production build pass.

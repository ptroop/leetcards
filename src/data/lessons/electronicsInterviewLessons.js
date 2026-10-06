import { defineAuthoredLesson } from '../authoredLessonSchema.js';

export const electronicsInterviewLessons = Object.freeze([
  defineAuthoredLesson({
    topicId: 'electronics-logic-levels',
    title: 'Logic thresholds and noise margins',
    depth: 'deep',
    definition: 'A digital input does not classify every voltage perfectly. It guarantees low at or below VIL(max) and high at or above VIH(min). A driver guarantees VOL(max) and VOH(min) under specified load; the gaps between guaranteed output and required input levels are noise margins.',
    motivation: 'A 3.3 V MCU driving another chip can fail even when both data sheets say “3.3 V” if output-high at the actual load falls below the receiver’s input-high requirement.',
    mechanism: [
      'Find VOH(min) and VOL(max) for the output pin at the relevant supply voltage, current, and temperature.',
      'Find VIH(min) and VIL(max) for the receiver under its operating conditions.',
      'Compute high margin as VOH(min) − VIH(min) and low margin as VIL(max) − VOL(max). Negative margin means guaranteed operation is not established.',
      'Check rise/fall time, pull-up strength, shared ground, cable noise, and hysteresis as separate constraints; margin alone does not prove timing correctness.',
    ],
    workedExample: {
      setup: 'A driver guarantees VOH ≥ 2.7 V and VOL ≤ 0.4 V; a receiver needs VIH ≥ 2.0 V or VIL ≤ 0.8 V.',
      steps: ['High noise margin is 2.7 − 2.0 = 0.7 V.', 'Low noise margin is 0.8 − 0.4 = 0.4 V.', 'A scope trace crossing 2.0 V is not enough by itself; verify the guaranteed driver level at the real load and the edge timing.'],
    },
    diagramSpec: { heading: 'Compare guaranteed output levels with receiver thresholds', sketchId: 'electronics-noise-margin' },
    realUse: 'When a UART receive line works on a short bench lead but fails over a longer cable, measure levels and edges before rewriting the parser.',
    failureModes: [{
      symptom: 'Intermittent bit errors or a pin that reads high on one board but low on another.',
      cause: 'Insufficient voltage margin, different input thresholds, slow open-drain rise, ground offset, or measurement with the wrong reference ground.',
      check: 'Read both data sheets at the real supply and load, then probe the receiver pin with the correct ground reference while the interface is active.',
    }],
    verification: ['Calculate both margins from guaranteed values, not typical values.', 'Scope the receiver pin during the worst-case load and compare threshold crossings and timing.'],
    recall: ['Define VIL, VIH, VOL, and VOH with direction and guarantee.', 'Calculate both noise margins.', 'Explain why “both chips are 3.3 V” is not proof of a valid digital interface.'],
  }),
  defineAuthoredLesson({
    topicId: 'electronics-setup-hold',
    title: 'Setup, hold, and sampling at a clock edge',
    depth: 'deep',
    definition: 'A clocked receiver requires input data to be stable for a specified time before its capture edge (setup) and after it (hold). The forbidden change window exists because the storage element is a physical circuit with finite resolution time.',
    motivation: 'An SPI controller may sample the correct bit in a slow test yet fail at higher clock rates because the data arrives too late relative to the selected CPHA/CPOL sampling edge.',
    mechanism: [
      'Mark the active capture edge and draw the required stable interval extending setup time before and hold time after it.',
      'For setup, compare the latest possible data arrival—including propagation and jitter—with the earliest capture edge.',
      'For hold, compare the earliest possible data change with the latest capture edge; clock skew can hurt hold even at low frequency.',
      'If a signal crosses clock domains, use an appropriate synchronizer or asynchronous interface; simply slowing one clock does not eliminate metastability risk.',
    ],
    workedExample: {
      setup: 'A receiver needs data stable 8 ns before and 2 ns after its rising edge.',
      steps: ['If data last changes 12 ns before the edge, setup has 4 ns of margin.', 'If the next data change occurs 1 ns after the edge, hold fails by 1 ns.', 'A lower clock frequency lengthens the period but does not automatically repair that 1 ns hold violation.'],
    },
    diagramSpec: { heading: 'Mark the stable-data window around the capture edge', sketchId: 'electronics-setup-hold-window' },
    realUse: 'Use this timing picture when matching an MCU SPI mode and clock rate to a sensor’s data-sheet timing diagram, or when interpreting a logic-analyzer capture that decodes the wrong bit.',
    failureModes: [{
      symptom: 'A peripheral occasionally captures the previous or next bit, especially at high speed or after temperature changes.',
      cause: 'Setup or hold budget was violated, the wrong sampling edge was chosen, or an asynchronous input was sampled without synchronization.',
      check: 'Probe clock and data at the receiver pins, calculate worst-case timing from both data sheets, and change one timing parameter at a time.',
    }],
    verification: ['Label the correct capture edge from the protocol mode.', 'Measure or calculate both setup and hold margins, including propagation and skew.', 'Retest at minimum/maximum supported clock rates and supply conditions.'],
    recall: ['State what setup and hold constrain physically.', 'Explain why reducing frequency may help setup but not necessarily hold.', 'Distinguish synchronous timing failure from a software data race.'],
  }),
]);

import { lessonByTopicId } from './lessonCatalog.js';

const lessonFallbacks = {
  'dsa-binary-tree': 'dsa-bst',
  'qualcomm-c-memory-routines': 'c-tricks',
  'qualcomm-linux-kernel-memory-dma': 'arch-dma',
};

const standaloneTopicAnswers = {
  'qualcomm-linux-device-drivers': {
    foundation: 'A Linux device driver owns the kernel-side policy for a device and exposes a controlled interface to the rest of the kernel or to user space. The important boundary is not “hardware versus software”; it is ownership of registers, interrupts, DMA buffers, lifetimes, and concurrent callers.',
    mechanism: [
      'Discovery or module loading registers a driver and matches it to a device description or bus identity.',
      'Probe acquires clocks, regulators, memory regions, GPIOs, interrupts, and DMA resources; failure must unwind them in reverse order.',
      'File operations, subsystem callbacks, or bus methods validate a request, synchronize shared state, operate the device, and return observable status.',
      'Remove blocks new work, drains asynchronous work, releases resources, and leaves no callback able to touch freed state.',
    ],
    failure: 'The common interview trap is describing only read/write callbacks. Real failures come from teardown races, wrong execution context, unsafe user pointers, stale DMA ownership, interrupt acknowledgement mistakes, and incomplete probe-error cleanup.',
  },
  'qualcomm-multimedia-dsp': {
    foundation: 'A DSP pipeline transforms a timed stream while respecting numeric precision, memory bandwidth, latency, and energy limits. The answer must connect the mathematical operation to data layout and the hardware that executes it.',
    mechanism: [
      'Define the input sample format, rate, frame or block size, and acceptable latency.',
      'Trace each transform, filter, prediction, quantization, or coding stage and state where information is lost.',
      'Map the hot loops to MAC, SIMD, cache, DMA, and scratch-memory behavior rather than counting arithmetic alone.',
      'Verify against a reference model with fixed vectors, tolerance rules, timing measurements, and preserved failing traces.',
    ],
    failure: 'A numerically correct algorithm can still fail through overflow, saturation, coefficient quantization, cache misses, DMA starvation, frame-boundary errors, or a latency budget exceeded only under sustained load.',
  },
};

const topicFailureNotes = {
  'net-udp': 'Do not reduce the comparison to “TCP is reliable, UDP is fast.” TCP is a byte stream with connection state, ordering, retransmission, flow control, and congestion control; UDP preserves datagram boundaries and leaves loss, ordering, pacing, and recovery policy to the application.',
  'os-reclamation': 'Do not use fragmentation, paging, swapping, and thrashing as synonyms. Name the scarce resource, the unit being moved or allocated, and the measurement—fault rate, swap I/O, allocation failure, or unusable holes—that distinguishes the failure.',
  'embedded-mcu': 'A block diagram becomes useless when it is only a box list. Trace one trigger and one data path through clocks, registers, interrupts or DMA, memory, and the observable output.',
  'arch-performance': 'Never quote latency or throughput without workload, percentile or averaging rule, units, and operating conditions. A faster average can hide deadline misses or a saturated queue.',
};

const codingPrompt = /\b(?:implement|write|code|program|reverse|merge|delete|insert|travers|find|design)\b/i;

const firstBlock = (lesson, type) => lesson?.blocks.find((block) => block.type === type);

const compactMechanism = (lesson) => {
  const steps = firstBlock(lesson, 'steps');
  if (steps?.items?.length) return steps.items.slice(0, 5);

  const example = firstBlock(lesson, 'worked-example');
  if (example?.items?.length) return example.items.slice(0, 5);

  return [];
};

const compactFailure = (lesson) => {
  const table = firstBlock(lesson, 'failure-table');
  if (table?.items?.length) {
    const item = table.items[0];
    return `${item.symptom}. Cause: ${item.cause} Check: ${item.check}`;
  }

  return firstBlock(lesson, 'failure')?.body ?? null;
};

const implementationFor = (lesson, prompt) => {
  if (!codingPrompt.test(prompt) || !lesson) return null;
  return firstBlock(lesson, 'code-pair') ?? firstBlock(lesson, 'code') ?? null;
};

export function completeQualcommAnswer(question) {
  const lessonId = lessonFallbacks[question.topicId] ?? question.topicId;
  const lesson = lessonByTopicId.get(lessonId);
  if (question.answer) return { ...question.answer, lessonId: lesson ? lessonId : null };
  const standalone = standaloneTopicAnswers[question.topicId];

  return {
    direct: question.answerFocus,
    foundation: standalone?.foundation ?? lesson?.summary ?? question.answerFocus,
    mechanism: standalone?.mechanism ?? compactMechanism(lesson),
    failure: standalone?.failure ?? compactFailure(lesson) ?? topicFailureNotes[question.topicId],
    implementation: implementationFor(lesson, question.prompt),
    lessonId: lesson ? lessonId : null,
  };
}

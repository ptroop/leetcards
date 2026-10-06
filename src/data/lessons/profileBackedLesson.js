import { defineAuthoredLesson } from '../authoredLessonSchema.js';
import { deepProfileFor } from '../deepProfiles.js';
import { realApplicationFor } from '../realApplications.js';
import { noteForTopic } from '../topicNotes.js';

const domainSketchIds = Object.freeze({
  networking: 'network-packet-path',
  embedded: 'embedded-observe-chain',
  stm32: 'stm32-implementation-chain',
  rtos: 'rtos-state-transition',
  'os-linux': 'linux-kernel-transition',
});

const mechanismDefinitions = Object.freeze({
  'embedded-uart': 'UART is an asynchronous serial link that reconstructs each character from an agreed baud rate, a low start bit, configured data and parity bits, and one or more high stop bits without sharing a clock wire.',
  'embedded-spi': 'SPI is a synchronous full-duplex shift exchange in which a controller selects one target, drives SCLK and MOSI, and simultaneously samples MISO according to the configured clock polarity and phase.',
  'embedded-i2c': 'I2C is an addressed open-drain bus where START and STOP conditions frame bytes, every byte has an ACK or NACK phase, and pull-up resistors create the high level that no participant actively drives.',
  'embedded-dma': 'Embedded DMA is a hardware transfer engine that moves configured data between a peripheral and memory while software controls buffer ownership, completion, alignment, and any required cache maintenance.',
  'stm32-startup': 'STM32F446RE startup begins at reset with the vector-table stack pointer and Reset_Handler, initializes memory required by C and C++, configures the runtime environment, and then enters main.',
  'stm32-clock': 'The STM32F446RE clock tree selects and scales HSI, HSE, or PLL outputs into core, AHB, APB, timer, and peripheral clocks whose frequencies determine every timing register calculation.',
  'stm32-interrupts': 'STM32 interrupt handling connects a peripheral flag through EXTI or an internal request to an NVIC line, priority decision, vector-table entry, handler, flag acknowledgement, and exception return.',
  'rtos-tasks': 'An RTOS task is an independently stacked execution context whose scheduler state is running, ready, blocked, or suspended; events and timeouts change eligibility, and a context switch saves one task before restoring another.',
});

const mechanismProfiles = Object.freeze({
  'embedded-uart': {
    prediction: 'With no clock wire, where must the receiver sample each UART bit after detecting the start edge?',
    trace: ['Idle remains high until the transmitter drives a start bit low.', 'The receiver validates the edge and samples near each bit center at the configured baud.', 'Data, optional parity, and stop bits are shifted and checked.', 'The completed character enters a register or FIFO and raises a flag, interrupt, or DMA request.'],
    failure: 'Baud error moves sampling toward transitions, framing or parity settings can disagree, and unread receive data can overrun the hardware buffer.',
    probe: 'Calculate 115200 8-N-1 bit and character time, then verify start, eight data bits, and stop with a logic analyzer.',
  },
  'embedded-spi': {
    prediction: 'Why must a controller transmit clocked bits even when it only wants to receive sensor data?',
    trace: ['Assert chip select and satisfy setup time.', 'For each SCLK cycle both devices shift one output bit and sample one input bit on edges selected by CPOL and CPHA.', 'Read the receive register for every transmitted word.', 'Release chip select only at the device protocol boundary.'],
    failure: 'Wrong CPOL or CPHA shifts sampling, early chip-select release aborts a command, and unread receive words cause overrun.',
    probe: 'Capture CS, SCLK, MOSI, and MISO and mark the exact sample edge for one register-read transaction.',
  },
  'embedded-i2c': {
    prediction: 'Which participant drives SDA during the address ACK and why can neither participant drive a high level?',
    trace: ['START pulls SDA low while SCL is high.', 'The controller sends address plus direction and releases SDA for ACK.', 'Data bytes alternate with ACK or NACK phases; repeated START may change direction.', 'STOP releases SDA high while SCL is high.'],
    failure: 'Missing pull-ups prevent valid highs, reset can leave SDA stuck, clock stretching delays progress, and ACK ownership mistakes corrupt transactions.',
    probe: 'Trace a register read and identify the SDA driver during every address, data, ACK, NACK, repeated START, and STOP phase.',
  },
  'embedded-dma': {
    prediction: 'Who owns a receive buffer while DMA is writing it and what event transfers ownership back to software?',
    trace: ['Configure source, destination, width, count, trigger, and direction.', 'Hand the prepared buffer to DMA and start the request path.', 'DMA arbitrates for the bus and transfers while the CPU runs other work.', 'Completion or a producer position returns a safe region to software after required cache maintenance.'],
    failure: 'Concurrent buffer access, wrong width or count, stale cache lines, and ignored error flags produce torn or invisible data.',
    probe: 'Transfer a known pattern, inspect DMA count and flags, and verify buffer boundaries and physical request timing.',
  },
  'stm32-startup': {
    prediction: 'Which code copies initialized data and clears zero-initialized data before main executes?',
    trace: ['Reset loads MSP and Reset_Handler from the vector table.', 'Startup code establishes clocks required by the runtime and copies .data from flash to SRAM.', 'It clears .bss and runs C++ static initialization when present.', 'main begins only after those language-level invariants hold.'],
    failure: 'A wrong linker symbol, vector base, stack pointer, or copy range causes faults before application logging starts.',
    probe: 'Halt at Reset_Handler over SWD and verify vector, MSP, .data, .bss, and the branch into main against the map file.',
  },
  'stm32-clock': {
    prediction: 'When an APB prescaler is greater than one, why can the timer kernel clock differ from the APB bus clock?',
    trace: ['Choose HSI or HSE and configure PLL factors within datasheet limits.', 'Set flash latency and voltage scaling before increasing core frequency.', 'Select AHB and APB prescalers and switch SYSCLK.', 'Derive peripheral and timer clocks before calculating baud, PWM, ADC, and timeout registers.'],
    failure: 'Wrong oscillator assumptions, flash latency, PLL limits, or timer clock doubling make every dependent timing value wrong.',
    probe: 'Read RCC registers, output MCO or timer PWM, and compare the measured frequency with the complete clock-tree arithmetic.',
  },
  'stm32-interrupts': {
    prediction: 'What happens if an STM32 handler returns without clearing the peripheral flag that asserted its NVIC request?',
    trace: ['The peripheral event sets a status flag and interrupt request.', 'NVIC compares enabled pending priorities and enters the selected vector.', 'The handler captures required state and clears the source with the documented sequence.', 'Exception return restores the interrupted context; a still-pending source immediately re-enters.'],
    failure: 'Wrong vector names, disabled NVIC lines, uncleared flags, excessive handler work, and invalid priority grouping cause silence, storms, or latency.',
    probe: 'Toggle a GPIO on handler entry and exit, then correlate pulse width with peripheral flags, NVIC pending state, and measured latency.',
  },
  'rtos-tasks': {
    prediction: 'If the highest-priority task blocks on an empty queue, which task can run next?',
    trace: ['A task runs until it blocks, yields, is preempted, or is suspended.', 'Blocking removes it from ready selection and records a wait object or timeout.', 'An event or tick makes the task ready again.', 'The scheduler saves the old context and restores the highest-priority eligible task.'],
    failure: 'A task that polls instead of blocking consumes CPU, while wrong priority, stack size, or wake logic creates starvation or corruption.',
    probe: 'Trace running, ready, and blocked lists while a queue receive blocks and an ISR later wakes the consumer.',
  },
});

const signalVisuals = Object.freeze({
  'embedded-uart': {
    type: 'visual',
    heading: 'Sample one UART character',
    kind: 'signals',
    invariant: 'The receiver samples each bit near its center using the agreed baud period.',
    frames: [
      { caption: 'Idle', values: ['RX: high', 'sample clock: waiting'], markers: ['idle'], active: ['RX'] },
      { caption: 'Start detected', values: ['RX: low start', 'sample clock: align to center'], markers: ['start'], active: ['RX', 'sample clock'] },
      { caption: 'Data and stop', values: ['RX: d0…d7 then high', 'sample clock: one center sample per bit'], markers: ['8-N-1'], active: ['RX'] },
    ],
  },
  'embedded-spi': {
    type: 'visual',
    heading: 'Clock one SPI word',
    kind: 'signals',
    invariant: 'Both sides shift and sample one bit per configured SCLK cycle while chip select remains active.',
    frames: [
      { caption: 'Select target', values: ['CS: active', 'SCLK: idle', 'MOSI/MISO: prepare'], markers: ['setup'], active: ['CS'] },
      { caption: 'Exchange bits', values: ['SCLK: toggling', 'MOSI: command bits', 'MISO: response bits'], markers: ['CPOL/CPHA'], active: ['SCLK', 'MOSI', 'MISO'] },
      { caption: 'Finish transaction', values: ['CS: inactive', 'SCLK: idle', 'RX register: complete'], markers: ['hold'], active: ['CS'] },
    ],
  },
  'embedded-i2c': {
    type: 'visual',
    heading: 'Trace an I2C transfer',
    kind: 'signals',
    invariant: 'SDA changes while SCL is low except for START and STOP, and the receiver owns each ACK phase.',
    frames: [
      { caption: 'START and address', values: ['SCL: high at START', 'SDA: high→low then address'], markers: ['START'], active: ['SCL', 'SDA'] },
      { caption: 'ACK and data', values: ['SCL: nine pulses', 'SDA: byte then receiver ACK'], markers: ['ACK'], active: ['SCL', 'SDA'] },
      { caption: 'NACK and STOP', values: ['SCL: high at STOP', 'SDA: low→high'], markers: ['STOP'], active: ['SCL', 'SDA'] },
    ],
  },
});

export function profileBackedLesson(topic) {
  const note = mechanismDefinitions[topic.id]
    ? { mechanism: mechanismDefinitions[topic.id], example: mechanismProfiles[topic.id].probe }
    : noteForTopic(topic.id);
  const application = realApplicationFor(topic);
  const profile = topic.level === 'deep'
    ? (mechanismProfiles[topic.id] ?? deepProfileFor(topic.id))
    : null;
  const mechanism = profile?.trace ?? [
    note.mechanism,
    `In the concrete case, ${note.example}`,
    `The observable state is carried by ${topic.keywords.join(', ')}.`,
  ];

  return defineAuthoredLesson({
    topicId: topic.id,
    title: topic.title,
    depth: topic.level,
    definition: note.mechanism,
    motivation: application,
    mechanism,
    workedExample: topic.level === 'brief' ? undefined : {
      setup: profile?.prediction ?? `Work through ${topic.title.toLowerCase()} using one concrete system state`,
      steps: profile?.trace ?? [
        `Start from this case: ${note.example}`,
        `Identify the initial ${topic.keywords.join(', ')} state.`,
        'Apply the governing rule and record the resulting externally observable state.',
      ],
    },
    realUse: application,
    failureModes: topic.level === 'deep' ? [{
      symptom: profile.failure,
      cause: 'One state, timing, ownership, or boundary assumption no longer matches the mechanism.',
      check: profile.probe,
    }] : undefined,
    verification: topic.level === 'brief' ? undefined : [
      profile?.probe ?? note.example,
      'Predict the result first, then compare the measured state with the mechanism rather than only checking the final output.',
    ],
    diagramSpec: topic.level === 'deep' ? {
      heading: 'Trace the mechanism through observable state',
      sketchId: domainSketchIds[topic.sectionId],
    } : undefined,
    additionalBlocks: [
      ...(signalVisuals[topic.id] ? [signalVisuals[topic.id]] : []),
      ...(topic.sectionId === 'stm32' ? [{
        type: 'practice',
        heading: 'Prove the STM32 implementation',
        body: `On the Nucleo-F446RE, trace the schematic and pin, inspect the controlling register beside the HAL or CMSIS path, calculate the timing constraint, inspect state over SWD, and run a repeatable hardware test. ${profile?.probe ?? note.example}`,
      }] : []),
    ],
    recall: [
      `Define ${topic.title.toLowerCase()} in one precise sentence.`,
      'Name the state that changes and the rule that changes it.',
      'Name the first measurement that would disprove your explanation.',
    ],
  });
}

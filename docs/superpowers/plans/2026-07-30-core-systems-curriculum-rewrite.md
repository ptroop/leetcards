# Core Systems Curriculum Rewrite Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace generic explanations across C, C++, Linux, architecture, electronics, embedded, STM32, RTOS, networking, Git, debugging, and testing with authored causal lessons.

**Architecture:** Domain files register complete authored records through the shared core registry. Each domain owns its factual checks and sketch specifications; `coreLessons.js` imports domains in prerequisite order and performs registration once.

**Tech Stack:** JavaScript ES modules, shared authored-lesson schema, technical SVG sketches, Node test runner

## Global Constraints

- Do not modify Qualcomm Prep or any college assignment content.
- Keep existing topic IDs and prerequisite order.
- Use C and C++ pairs where code is useful outside the C++ category.
- Each deep lesson includes a worked trace, real use, failure modes, verification, and recall.
- Every visual answers one named technical question.

## File Structure

- Create `src/data/coreLessons.js`: imports and registers all domain records.
- Create `src/data/lessons/cLessons.js`
- Create `src/data/lessons/cppLessons.js`
- Create `src/data/lessons/linuxLessons.js`
- Create `src/data/lessons/architectureLessons.js`
- Create `src/data/lessons/electronicsLessons.js`
- Create `src/data/lessons/embeddedLessons.js`
- Create `src/data/lessons/stm32Lessons.js`
- Create `src/data/lessons/rtosLessons.js`
- Create `src/data/lessons/networkingLessons.js`
- Create `src/data/lessons/engineeringLessons.js`
- Create `tests/core-lesson-content.test.js`

### Task 1: Register domain lesson modules

**Files:**
- Create: `src/data/coreLessons.js`
- Create: `src/data/lessons/cLessons.js`
- Modify: `src/data/coreLessonRegistry.js`
- Modify: `src/data/lessonCatalog.js`
- Test: `tests/core-lesson-content.test.js`

**Interfaces:**
- Each domain exports a frozen array named `<domain>Lessons`.
- `coreLessons.js` exports `coreLessons` and calls `registerCoreLessons(coreLessons)`.

- [ ] **Step 1: Write a failing registration test**

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { allTopics } from '../src/data/topics.js';
import { coreLessonByTopicId, isProtectedTopic } from '../src/data/coreLessonRegistry.js';
import '../src/data/coreLessons.js';

test('the first authored C record is registered without touching protected topics', () => {
  assert.ok(coreLessonByTopicId.has('c-types'));
  for (const topic of allTopics.filter(isProtectedTopic)) {
    assert.equal(coreLessonByTopicId.has(topic.id), false, topic.id);
  }
});
```

- [ ] **Step 2: Run and verify failure**

Run: `node --test tests/core-lesson-content.test.js`  
Expected: FAIL and list missing topic IDs.

- [ ] **Step 3: Add the registration entry point and one complete C record**

Create `cLessons.js` with a complete `c-types` authored record using the agreed schema. Create `coreLessons.js`:

```js
import { registerCoreLessons } from './coreLessonRegistry.js';
import { cLessons } from './lessons/cLessons.js';

export const coreLessons = Object.freeze([
  ...cLessons,
]);

registerCoreLessons(coreLessons);
```

Import `./coreLessons.js` once from `lessonCatalog.js` before lessons are constructed.

- [ ] **Step 4: Run the registration test**

Run: `node --test tests/core-lesson-content.test.js`

Expected: PASS.

- [ ] **Step 5: Commit the domain wiring**

```powershell
git add src/data/coreLessons.js src/data/lessons/cLessons.js src/data/coreLessonRegistry.js src/data/lessonCatalog.js tests/core-lesson-content.test.js
git commit -m "feat: register authored domain lessons"
```

### Task 2: Rewrite C and engineering foundations

**Files:**
- Modify: `src/data/lessons/cLessons.js`
- Create: `src/data/lessons/engineeringLessons.js`
- Modify: `src/data/coreLessons.js`
- Modify: `tests/core-lesson-content.test.js`

**Interfaces:**
- `cLessons` covers all 20 `c-*` topic IDs.
- `engineeringLessons` covers Git, debugging, and testing topic IDs.

- [ ] **Step 1: Add factual contract tests**

```js
const lesson = (id) => coreLessonByTopicId.get(id);
const text = (id) => JSON.stringify(lesson(id));

test('C foundations teach representation, lifetime, and failure rather than slogans', () => {
  assert.match(text('c-integer-rules'), /promotion|usual arithmetic conversion|signed|unsigned/i);
  assert.match(text('c-stack-heap'), /stack frame|automatic storage|allocator|lifetime/i);
  assert.match(text('c-aliasing'), /effective type|strict alias|undefined behavior|memcpy/i);
  assert.match(text('c-undefined'), /undefined behavior|compiler|sanitizer/i);
  assert.match(text('c-tricks'), /bit|mask|branch|overflow|sentinel/i);
});

test('engineering lessons teach observable workflows', () => {
  assert.match(text('git-index'), /working tree|index|commit/i);
  assert.match(text('debug-gdb'), /breakpoint|backtrace|watchpoint|frame/i);
  assert.match(text('test-fuzz'), /generated input|invariant|sanitizer|crash/i);
});

test('C and engineering topic coverage is complete', () => {
  for (const topic of allTopics.filter((entry) => ['c', 'engineering'].includes(entry.sectionId))) {
    assert.ok(coreLessonByTopicId.has(topic.id), topic.id);
  }
});
```

- [ ] **Step 2: Run and verify failure**

Run: `node --test tests/core-lesson-content.test.js`  
Expected: FAIL for missing or shallow records.

- [ ] **Step 3: Author all C and engineering records**

Cover:

```text
c-types, c-integer-rules, c-expressions, c-control, c-multidimensional,
c-pointers, c-qualifiers, c-alignment-endianness, c-aliasing, c-memory,
c-stack-heap, c-allocation-failure, c-structs, c-strings, c-io,
c-preprocessor, c-translation, c-linker, c-undefined, c-tricks

git-model, git-index, git-basics, git-history, git-conflicts, git-tags,
git-collaboration, git-recovery, debug-method, debug-gdb, debug-memory,
debug-tracing, test-unit, test-failure, test-fuzz, test-static, test-embedded
```

Use deep depth for pointer semantics, memory/lifetime, aliasing, linking, undefined behavior, GDB memory debugging, fuzzing, and embedded testing. Use brief or standard depth for narrow Git commands and simple terminology.

- [ ] **Step 4: Run domain and full tests**

Run: `node --test tests/core-lesson-content.test.js tests/cpp-snippets.test.js`  
Expected: PASS for C and engineering assertions.

- [ ] **Step 5: Commit**

```powershell
git add src/data/lessons/cLessons.js src/data/lessons/engineeringLessons.js src/data/coreLessons.js tests/core-lesson-content.test.js
git commit -m "content: rewrite C and engineering foundations"
```

### Task 3: Rewrite the complete C++ learning sequence

**Files:**
- Create: `src/data/lessons/cppLessons.js`
- Modify: `src/data/coreLessons.js`
- Modify: `tests/core-lesson-content.test.js`

**Interfaces:**
- `cppLessons` covers every existing `cpp-*` topic ID.
- C++ examples may be C++-only because the category teaches C++ itself.

- [ ] **Step 1: Add comprehensive C++ semantic checks**

```js
test('C++ object lifetime and special members are explicitly taught', () => {
  const constructors = [
    text('cpp-constructors'),
    text('cpp-ctor-default-parameterized'),
    text('cpp-ctor-copy-move'),
    text('cpp-ctor-control'),
  ].join(' ');
  assert.match(constructors, /default constructor/i);
  assert.match(constructors, /parameterized/i);
  assert.match(constructors, /copy constructor/i);
  assert.match(constructors, /move constructor/i);
  assert.match(constructors, /delegating/i);
  assert.match(constructors, /conversion constructor/i);
  assert.match(constructors, /\bexplicit\b/i);
  assert.match(constructors, /=\s*delete|deleted/i);
  assert.match(constructors, /=\s*default|defaulted/i);
  assert.match(text('cpp-destructor-kinds'), /trivial|non-trivial|virtual|defaulted/i);
  assert.match(text('cpp-special-member-rules'), /rule of three|rule of five|rule of zero/i);
});

test('C++ abstraction, templates, STL, exceptions, and modern utilities are complete', () => {
  assert.match(text('cpp-encapsulation'), /public|private|protected|getter|setter|invariant/i);
  assert.match(text('cpp-diamond-inheritance'), /diamond|virtual base/i);
  assert.match(text('cpp-virtual-dispatch-slicing'), /vtable|object slicing|dynamic type/i);
  assert.match(text('cpp-unwinding-safety'), /stack unwinding|basic guarantee|strong guarantee|no-throw/i);
  assert.match(text('cpp-template-advanced'), /partial specialization|variadic|instantiation|forward/i);
  assert.match(text('cpp-iterators'), /begin|end|cbegin|cend|rbegin|rend/i);
  assert.match(text('cpp-lambdas'), /capture by value|capture by reference|generic lambda|algorithm/i);
  assert.match(text('cpp-shared-weak-ownership'), /use_count|cycle|weak_ptr|lock/i);
  assert.match(text('cpp-optional-variant-any'), /optional|variant|visit|any/i);
  assert.match(text('cpp-modern-syntax'), /auto|override|final|nullptr|enum class|structured binding|range-based|decltype/i);
});
```

- [ ] **Step 2: Run and verify failure**

Run: `node --test tests/core-lesson-content.test.js`  
Expected: FAIL for absent C++ authored records.

- [ ] **Step 3: Author all C++ records in existing prerequisite order**

Use the exact 45 C++ topic IDs from `src/data/topics.js`. Keep distinct records for constructor families, destructor kinds, value categories/move, perfect forwarding, ownership models, inheritance/dispatch/slicing, exception control flow/safety, templates/specialization, STL/iterators/lambdas, type-safe utilities, testing, and concurrency.

Each object-lifetime lesson must show construction and destruction events on a technical sketch. Polymorphism must distinguish static type, dynamic type, object layout, vptr lookup, override selection, and slicing. Exception lessons must trace automatic-object destruction during unwinding.

- [ ] **Step 4: Run C++ tests**

Run: `node --test tests/core-lesson-content.test.js tests/cpp-snippets.test.js`  
Expected: PASS.

- [ ] **Step 5: Commit**

```powershell
git add src/data/lessons/cppLessons.js src/data/coreLessons.js tests/core-lesson-content.test.js
git commit -m "content: rewrite complete C++ curriculum"
```

### Task 4: Rewrite architecture and Linux concepts

**Files:**
- Create: `src/data/lessons/architectureLessons.js`
- Create: `src/data/lessons/linuxLessons.js`
- Modify: `src/data/coreLessons.js`
- Modify: `src/data/technicalSketches.js`
- Modify: `tests/core-lesson-content.test.js`

**Interfaces:**
- Linux authored records exclude `linux-a01` through `linux-a22`.
- Code-bearing Linux concept records expose `{ id: 'c' }` and `{ id: 'cpp' }` variants.

- [ ] **Step 1: Add mechanism-specific tests**

```js
test('architecture lessons expose the state that causes performance and correctness effects', () => {
  assert.match(text('arch-cache'), /cache line|set|tag|offset|hit|miss|evict|locality|write-back|write-through/i);
  assert.match(text('arch-mmu'), /virtual address|page table|TLB|page fault|permission|physical frame/i);
  assert.match(text('arch-pipeline'), /fetch|decode|execute|hazard|stall|forward/i);
  assert.match(text('arch-dma'), /bus master|descriptor|cache coherence|interrupt/i);
});

test('Linux concepts teach kernel transitions and paired use from C and C++', () => {
  assert.match(text('os-syscalls'), /user mode|kernel mode|register|trap|return|errno/i);
  assert.match(text('os-process-create'), /fork|copy-on-write|task|file descriptor|return value/i);
  assert.match(text('os-zombie-orphan'), /exit status|wait|zombie|orphan|reparent/i);
  assert.match(text('os-mutex'), /atomic|owner|contended|futex|sleep|wake/i);
  assert.match(text('os-semaphores'), /count|wait|post|blocking|memory ordering/i);
  for (const id of ['os-process-create', 'os-exec', 'os-exit', 'os-wait', 'os-mutex', 'os-semaphores']) {
    assert.deepEqual(lesson(id).codeExamples.variants.map((variant) => variant.id), ['c', 'cpp']);
  }
});
```

- [ ] **Step 2: Run and verify failure**

Run: `node --test tests/core-lesson-content.test.js`  
Expected: FAIL.

- [ ] **Step 3: Author architecture and non-assignment Linux records**

Cover all 12 architecture IDs and every `os-*` topic ID. Preserve the existing Linux assignment records and their current placement. Add static or stepped sketches for:

- calling convention and stack frames;
- pipeline hazards;
- cache address split, hit, miss, and eviction;
- TLB lookup, page-table walk, and page fault;
- user-to-kernel syscall entry and return;
- fork/exec/exit/wait and zombie state;
- file-descriptor duplication and pipes;
- signal delivery and masks;
- mutex fast path, futex wait, and wake;
- deadlock wait-for cycle.

- [ ] **Step 4: Run Linux and architecture regression**

Run: `node --test tests/core-lesson-content.test.js tests/linux-labs.test.js`  
Expected: PASS, including unchanged assignment tests.

- [ ] **Step 5: Commit**

```powershell
git add src/data/lessons/architectureLessons.js src/data/lessons/linuxLessons.js src/data/coreLessons.js src/data/technicalSketches.js tests/core-lesson-content.test.js
git commit -m "content: rewrite architecture and Linux concepts"
```

### Task 5: Rewrite electronics and schematic reading

**Files:**
- Create: `src/data/lessons/electronicsLessons.js`
- Modify: `src/data/coreLessons.js`
- Modify: `src/data/technicalSketches.js`
- Modify: `tests/core-lesson-content.test.js`

**Interfaces:**
- `electronicsLessons` covers all electronics and `schematic-*` topic IDs.

- [ ] **Step 1: Add electronics factual checks**

```js
test('pull resistors are derived from input behavior and electrical trade-offs', () => {
  const pull = text('electronics-pullups');
  assert.match(pull, /floating|high-impedance|pull-up|pull-down|open-drain/i);
  assert.match(pull, /VCC|ground|logic 1|logic 0/i);
  assert.match(pull, /I\s*=|current|10 kΩ|0\.33 mA/i);
  assert.match(pull, /capacitance|RC|rise time/i);
  assert.match(pull, /I2C|button|reset|interrupt/i);
});

test('schematic lessons connect symbols to measurements and datasheets', () => {
  assert.match(text('schematic-basics'), /reference designator|net label|junction|power rail|ground/i);
  assert.match(text('schematic-datasheet'), /absolute maximum|recommended operating|pin function|timing/i);
  assert.match(text('schematic-trace'), /MCU pin|alternate function|connector|physical component/i);
  assert.match(text('schematic-measure'), /multimeter|logic analyzer|oscilloscope|expected/i);
});
```

- [ ] **Step 2: Run and verify failure**

Run: `node --test tests/core-lesson-content.test.js`  
Expected: FAIL.

- [ ] **Step 3: Author electronics records and circuit sketches**

Cover:

```text
electronics-ohm, electronics-kcl-kvl, electronics-passives,
electronics-digital, electronics-pullups, electronics-debounce,
electronics-decoupling, electronics-regulators, electronics-transistors,
electronics-analog-front-end, electronics-protection,
electronics-measurement-safety, schematic-basics, schematic-board,
schematic-datasheet, schematic-trace, schematic-measure
```

Each circuit lesson includes actual voltage/current behavior and expected measurements. Use annotated schematics for pull resistors, RC debounce, decoupling current loops, regulator input/output capacitors, transistor switching, analog input protection, reset/boot, clocks, and debug connectors.

- [ ] **Step 4: Run tests**

Run: `node --test tests/core-lesson-content.test.js tests/authored-lessons.test.js`  
Expected: PASS.

- [ ] **Step 5: Commit**

```powershell
git add src/data/lessons/electronicsLessons.js src/data/coreLessons.js src/data/technicalSketches.js tests/core-lesson-content.test.js
git commit -m "content: rewrite electronics and schematic reading"
```

### Task 6: Rewrite general embedded and STM32F446RE lessons

**Files:**
- Create: `src/data/lessons/embeddedLessons.js`
- Create: `src/data/lessons/stm32Lessons.js`
- Modify: `src/data/coreLessons.js`
- Modify: `src/data/technicalSketches.js`
- Modify: `tests/core-lesson-content.test.js`

**Interfaces:**
- General embedded records remain vendor-neutral.
- Each STM32 record connects concept, NUCLEO-F446RE schematic/pin, peripheral/register, HAL/CMSIS usage, timing, debugging, and testing.

- [ ] **Step 1: Add general-versus-STM32 contract tests**

```js
test('embedded protocol lessons teach complete transactions', () => {
  assert.match(text('embedded-uart'), /start bit|data bits|parity|stop bit|baud|sampling/i);
  assert.match(text('embedded-spi'), /SCLK|MOSI|MISO|chip select|CPOL|CPHA|full-duplex/i);
  assert.match(text('embedded-i2c'), /START|address|read\/write|ACK|NACK|data|STOP|open-drain/i);
});

test('STM32 lessons bridge general concepts to F446RE implementation and observation', () => {
  for (const id of ['stm32-gpio', 'stm32-uart', 'stm32-spi', 'stm32-i2c', 'stm32-adc']) {
    const value = text(id);
    assert.match(value, /STM32F446|NUCLEO-F446RE/i);
    assert.match(value, /schematic|pin|alternate function/i);
    assert.match(value, /register|HAL|CMSIS/i);
    assert.match(value, /debug|logic analyzer|oscilloscope|measurement/i);
  }
});
```

- [ ] **Step 2: Run and verify failure**

Run: `node --test tests/core-lesson-content.test.js`  
Expected: FAIL.

- [ ] **Step 3: Author general embedded and STM32 records**

Cover all existing `embedded-*` and `stm32-*` IDs, excluding the protected college MCU group. Build timing sketches for UART, SPI, I2C, CAN, PWM, ADC+DMA, interrupt entry, and watchdog refresh. Build STM32 sketches using the chain:

```text
NUCLEO-F446RE schematic → STM32 pin/alternate function → peripheral register state
→ HAL/CMSIS operation → expected waveform/debugger observation
```

Include clock-tree arithmetic, NVIC priority effects, DMA ownership/cache considerations, flash erase/program constraints, boot options, SWD fault diagnosis, low-power wake sources, and FreeRTOS integration.

- [ ] **Step 4: Run embedded regression**

Run: `node --test tests/core-lesson-content.test.js tests/curriculum.test.js`  
Expected: PASS, including unchanged college MCU assertions.

- [ ] **Step 5: Commit**

```powershell
git add src/data/lessons/embeddedLessons.js src/data/lessons/stm32Lessons.js src/data/coreLessons.js src/data/technicalSketches.js tests/core-lesson-content.test.js
git commit -m "content: rewrite embedded and STM32 lessons"
```

### Task 7: Rewrite RTOS, networking, Git/debugging/testing integration

**Files:**
- Create: `src/data/lessons/rtosLessons.js`
- Create: `src/data/lessons/networkingLessons.js`
- Modify: `src/data/lessons/engineeringLessons.js`
- Modify: `src/data/coreLessons.js`
- Modify: `src/data/technicalSketches.js`
- Modify: `tests/core-lesson-content.test.js`

**Interfaces:**
- RTOS records distinguish task context from ISR context.
- Networking records connect packet fields, kernel sockets, and observable diagnostic commands.

- [ ] **Step 1: Add RTOS and networking checks**

```js
test('RTOS lessons teach scheduling and synchronization mechanisms', () => {
  assert.match(text('rtos-tasks'), /ready|running|blocked|context switch|stack/i);
  assert.match(text('rtos-inversion'), /priority inversion|inheritance|medium-priority/i);
  assert.match(text('rtos-isr'), /FromISR|deferred|yield|priority/i);
  assert.match(text('rtos-budgeting'), /worst-case|deadline|utilization|jitter/i);
});

test('networking lessons connect wire behavior to socket symptoms', () => {
  assert.match(text('net-tcp'), /sequence|acknowledgment|window|retransmission|congestion/i);
  assert.match(text('net-mtu'), /fragment|path MTU|MSS|ICMP/i);
  assert.match(text('net-timewait'), /four-tuple|delayed segment|active close/i);
  assert.match(text('net-debug'), /ip|ss|tcpdump|ping|traceroute|dig/i);
});
```

- [ ] **Step 2: Run and verify failure**

Run: `node --test tests/core-lesson-content.test.js`  
Expected: FAIL.

- [ ] **Step 3: Author RTOS and networking records**

Cover all 14 `rtos-*` and 17 `net-*` IDs. Add process/task state, queue, mutex, priority inversion, ISR handoff, packet encapsulation, ARP, routing, TCP state, UDP loss, TLS boundary, and socket-I/O sketches.

Review engineering records so embedded tests link naturally to hardware-in-the-loop, fault injection, serial logs, logic-analyzer traces, and deterministic timing assertions.

- [ ] **Step 4: Restore the complete non-DSA coverage assertion and run tests**

Restore Task 1’s test to cover every non-protected, non-DSA core topic.

Run: `node --test tests/core-lesson-content.test.js`  
Expected: PASS with no missing authored IDs.

Run: `npm.cmd test`  
Expected: all applicable tests pass.

- [ ] **Step 5: Commit**

```powershell
git add src/data/lessons/rtosLessons.js src/data/lessons/networkingLessons.js src/data/lessons/engineeringLessons.js src/data/coreLessons.js src/data/technicalSketches.js tests/core-lesson-content.test.js
git commit -m "content: complete systems curriculum rewrite"
```

import test from 'node:test';
import assert from 'node:assert/strict';
import { electronicsLessons } from '../src/data/lessons/electronicsLessons.js';
import { electronicsInterviewLessons } from '../src/data/lessons/electronicsInterviewLessons.js';
import { cLessons } from '../src/data/lessons/cLessons.js';
import { engineeringLessons } from '../src/data/lessons/engineeringLessons.js';
import { architectureLessons } from '../src/data/lessons/architectureLessons.js';
import { cppLessons } from '../src/data/lessons/cppLessons.js';
import { getLessonForTopic } from '../src/data/contentModel.js';
import { allTopics } from '../src/data/topics.js';
import { technicalSketchById } from '../src/data/technicalSketches.js';

const allElectronicsLessons = [...electronicsLessons, ...electronicsInterviewLessons];
const lessonById = new Map(allElectronicsLessons.map((lesson) => [lesson.topicId, lesson]));
const text = (id) => JSON.stringify(lessonById.get(id));
const cLessonById = new Map(cLessons.map((lesson) => [lesson.topicId, lesson]));
const cText = (id) => JSON.stringify(cLessonById.get(id));
const engineeringLessonById = new Map(
  engineeringLessons.map((lesson) => [lesson.topicId, lesson]),
);
const engineeringText = (id) => JSON.stringify(engineeringLessonById.get(id));
const architectureLessonById = new Map(
  architectureLessons.map((lesson) => [lesson.topicId, lesson]),
);
const architectureText = (id) => JSON.stringify(architectureLessonById.get(id));
const cppLessonById = new Map(cppLessons.map((lesson) => [lesson.topicId, lesson]));

test('pull resistors are derived from input behavior and electrical trade-offs', () => {
  const pull = text('electronics-pullups');

  assert.match(pull, /floating|high-impedance/i);
  assert.match(pull, /pull-up|pull-down|open-drain/i);
  assert.match(pull, /VCC|ground|logic 1|logic 0/i);
  assert.match(pull, /I\s*=|current|10 kΩ|0\.33 mA/i);
  assert.match(pull, /capacitance|RC|rise time/i);
  assert.match(pull, /I2C|button|reset|interrupt/i);
  assert.equal(lessonById.get('electronics-pullups').diagramSpec.sketchId, 'pull-up-open-drain');
});

test('the pull-resistor topic uses the authored record in the application catalog', () => {
  const lesson = getLessonForTopic('electronics-pullups');

  assert.equal(lesson.contentSource, 'authored-record');
  assert.ok(lesson.blocks.some((block) => block.type === 'technical-sketch'));
  assert.ok(lesson.blocks.some((block) => block.type === 'worked-example'));
  assert.ok(lesson.blocks.some((block) => block.type === 'failure-table'));
});

test('every electronics and schematic topic has an authored record at its intended depth', () => {
  const topics = allTopics.filter((topic) => topic.sectionId === 'electronics');

  assert.equal(allElectronicsLessons.length, topics.length);
  for (const topic of topics) {
    const record = lessonById.get(topic.id);
    assert.ok(record, topic.id);
    assert.equal(record.depth, topic.level, `${topic.id}: depth`);
  }
});

test('electronics mechanisms contain the facts needed to reason and measure', () => {
  assert.match(text('electronics-ohm'), /V\s*=\s*I|I\s*=\s*V|P\s*=\s*V/i);
  assert.match(text('electronics-kcl-kvl'), /node|loop|conservation/i);
  assert.match(text('electronics-decoupling'), /charge|current loop|impedance|placement|ESR|ESL/i);
  assert.match(text('electronics-transistors'), /BJT|MOSFET|gate|base|saturation|body diode/i);
  assert.match(text('electronics-protection'), /flyback|ESD|clamp|series resistor|TVS/i);
  assert.match(text('electronics-measurement-safety'), /earth|ground clip|short|differential probe/i);
});

test('schematic reading follows nets from symbols to expected measurements', () => {
  assert.match(text('schematic-basics'), /reference designator|net label|junction|power rail|ground/i);
  assert.match(text('schematic-board'), /power tree|reset|boot|clock|debug connector/i);
  assert.match(text('schematic-datasheet'), /absolute maximum|recommended operating|pin|timing/i);
  assert.match(text('schematic-trace'), /MCU pin|alternate function|connector|physical/i);
  assert.match(text('schematic-measure'), /multimeter|logic analyzer|oscilloscope|expected/i);
});

test('every deep electronics lesson references a validated explanatory sketch', () => {
  for (const lesson of allElectronicsLessons.filter((record) => record.depth === 'deep')) {
    assert.ok(lesson.diagramSpec?.sketchId, `${lesson.topicId}: sketch`);
    assert.ok(
      technicalSketchById.has(lesson.diagramSpec.sketchId),
      `${lesson.topicId}: unknown sketch`,
    );
  }
});

test('every C topic has an authored record at the intended depth', () => {
  const topics = allTopics.filter((topic) => topic.sectionId === 'c');

  assert.equal(cLessons.length, topics.length);
  for (const topic of topics) {
    const record = cLessonById.get(topic.id);
    assert.ok(record, topic.id);
    assert.equal(record.depth, topic.level, `${topic.id}: depth`);
  }
});

test('C lessons explicitly teach representation, lifetime, and compiler rules', () => {
  assert.match(cText('c-integer-rules'), /promotion|usual arithmetic conversion|signed|unsigned|overflow/i);
  assert.match(cText('c-expressions'), /sequenc|side effect|short-circuit/i);
  assert.match(cText('c-qualifiers'), /const|volatile|restrict|optimization/i);
  assert.match(cText('c-aliasing'), /effective type|strict alias|undefined behavior|memcpy/i);
  assert.match(cText('c-memory'), /storage duration|lifetime|ownership/i);
  assert.match(cText('c-stack-heap'), /stack frame|automatic storage|allocator|fragmentation/i);
  assert.match(cText('c-undefined'), /undefined|unspecified|implementation-defined/i);
  assert.match(cText('c-tricks'), /bit|mask|overflow|sentinel|branch/i);
});

test('deep C lessons use validated explanatory sketches', () => {
  for (const lesson of cLessons.filter((record) => record.depth === 'deep')) {
    assert.ok(technicalSketchById.has(lesson.diagramSpec?.sketchId), lesson.topicId);
  }
});

test('the C category resolves through authored records in the application catalog', () => {
  for (const topic of allTopics.filter((entry) => entry.sectionId === 'c')) {
    assert.equal(getLessonForTopic(topic.id).contentSource, 'authored-record', topic.id);
  }
});

test('every Git, debugging, and testing topic has an authored record at the intended depth', () => {
  const topics = allTopics.filter((topic) => topic.sectionId === 'engineering');

  assert.equal(engineeringLessons.length, topics.length);
  for (const topic of topics) {
    const record = engineeringLessonById.get(topic.id);
    assert.ok(record, topic.id);
    assert.equal(record.depth, topic.level, `${topic.id}: depth`);
  }
});

test('Git lessons teach snapshots, history transformations, and safe recovery', () => {
  assert.match(engineeringText('git-index'), /working tree|index|HEAD|staged snapshot/i);
  assert.match(engineeringText('git-history'), /merge|rebase|cherry-pick|revert|public history/i);
  assert.match(engineeringText('git-recovery'), /reflog|bisect|reset|restore/i);
});

test('debugging lessons teach evidence-driven diagnosis and observation tools', () => {
  assert.match(engineeringText('debug-method'), /reproduce|hypothesis|first bad transition|one variable/i);
  assert.match(engineeringText('debug-gdb'), /breakpoint|watchpoint|backtrace|frame|condition/i);
  assert.match(engineeringText('debug-memory'), /ASan|UBSan|Valgrind|use-after-free|out-of-bounds/i);
  assert.match(engineeringText('debug-tracing'), /core dump|strace|ltrace|perf/i);
});

test('testing lessons cover generated evidence and real embedded hardware', () => {
  assert.match(engineeringText('test-fuzz'), /generated input|property|invariant|minimi|sanitizer/i);
  assert.match(engineeringText('test-embedded'), /HIL|fault injection|timing|logic analyzer|power cycle/i);
});

test('deep engineering lessons use validated explanatory sketches', () => {
  for (const lesson of engineeringLessons.filter((record) => record.depth === 'deep')) {
    assert.ok(technicalSketchById.has(lesson.diagramSpec?.sketchId), lesson.topicId);
  }
});

test('the engineering category resolves through authored records in the application catalog', () => {
  for (const topic of allTopics.filter((entry) => entry.sectionId === 'engineering')) {
    assert.equal(getLessonForTopic(topic.id).contentSource, 'authored-record', topic.id);
  }
});

test('every computer-architecture topic has an authored record at the intended depth', () => {
  const topics = allTopics.filter((topic) => topic.sectionId === 'architecture');

  assert.equal(architectureLessons.length, topics.length);
  for (const topic of topics) {
    const record = architectureLessonById.get(topic.id);
    assert.ok(record, topic.id);
    assert.equal(record.depth, topic.level, `${topic.id}: depth`);
  }
});

test('architecture lessons trace instructions through execution and the memory hierarchy', () => {
  assert.match(architectureText('arch-datapath'), /program counter|decode|register|ALU|write.?back/i);
  assert.match(architectureText('arch-calling'), /argument|return address|stack frame|callee|caller/i);
  assert.match(architectureText('arch-pipeline'), /data hazard|control hazard|forward|stall|flush/i);
  assert.match(architectureText('arch-cache'), /cache line|hit|miss|associativ|evict|locality/i);
  assert.match(architectureText('arch-mmu'), /virtual address|page table|TLB|page fault|physical/i);
});

test('architecture lessons explain multicore visibility, DMA, and measurement', () => {
  assert.match(architectureText('arch-coherence'), /MESI|coherence|memory order|barrier|false sharing/i);
  assert.match(architectureText('arch-dma'), /DMA|bus|peripheral|cache|descriptor/i);
  assert.match(architectureText('arch-performance'), /counter|benchmark|warm.?up|variance|perf/i);
});

test('deep architecture lessons use validated explanatory sketches', () => {
  for (const lesson of architectureLessons.filter((record) => record.depth === 'deep')) {
    assert.ok(technicalSketchById.has(lesson.diagramSpec?.sketchId), lesson.topicId);
  }
});

test('the architecture category resolves through authored records in the application catalog', () => {
  for (const topic of allTopics.filter((entry) => entry.sectionId === 'architecture')) {
    assert.equal(getLessonForTopic(topic.id).contentSource, 'authored-record', topic.id);
  }
});

test('all 45 C++ topics are registered as definition-first authored records', () => {
  const topics = allTopics.filter((topic) => topic.sectionId === 'cpp');
  assert.equal(cppLessons.length, topics.length);

  for (const topic of topics) {
    const record = cppLessonById.get(topic.id);
    assert.ok(record, topic.id);
    assert.equal(record.depth, topic.level, `${topic.id}: depth`);
    assert.ok(record.codeExamples.variants[0].code.length > 20, `${topic.id}: code`);
  }
});

test('the C++ category resolves through authored records in the application catalog', () => {
  for (const topic of allTopics.filter((entry) => entry.sectionId === 'cpp')) {
    assert.equal(getLessonForTopic(topic.id).contentSource, 'authored-record', topic.id);
  }
});

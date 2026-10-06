import { defineAuthoredLesson } from '../authoredLessonSchema.js';

export const linuxInterviewLessons = Object.freeze([
  defineAuthoredLesson({
    topicId: 'os-shell-scripting',
    title: 'Shell scripting and safe text processing',
    depth: 'deep',
    definition: 'A shell script composes programs through arguments, exit statuses, environment, files, and pipes. The shell parses syntax first; quoting decides whether data remains one argument or is split and expanded.',
    motivation: 'A board-test script might select failed UART runs from a log, extract fields, and return a failing status to CI. A one-line pipeline is useful only if it reports the right records and failures.',
    mechanism: [
      'Define the input format and exact output. Use grep -F for literal matches, sed for stream substitutions, awk for whitespace fields and calculations, and cut only when the delimiter contract is fixed.',
      'Quote path and pattern expansions. Unquoted variables can split on spaces and expand wildcard characters into filenames.',
      'A pipeline passes bytes from each command’s stdout to the next command’s stdin. Redirection changes file descriptors; > truncates stdout, >> appends, and 2> redirects stderr.',
      'Check status deliberately. In POSIX sh, a pipeline reports its final command status; Bash pipefail can also surface an earlier stage failure.',
      'Do not parse ls -l for arbitrary filenames or dates. Use find or stat with a machine-readable format when the script owns the input contract.',
    ],
    workedExample: {
      setup: 'A Qualcomm folder exercise asks for permissions, link count, month, and day from a supplied ls -l sample.',
      steps: [
        'The sample has repeated spaces. cut -d" " treats each one as a delimiter and produces empty fields, so apparent columns shift.',
        'For this fixed sample, awk collapses runs of whitespace; $1, $2, $6, and $7 are the requested display fields.',
        'For a real directory, obtain metadata from stat or find rather than parsing human-formatted ls output.',
      ],
    },
    realUse: 'Shell scripts glue together firmware builds, test logs, flashing tools, and failure reports. Keeping stdout as data and stderr as diagnostics lets automation detect a failed stage.',
    failureModes: [{
      symptom: 'A script passes tests with simple names but loses files with spaces or returns success after an earlier command failed.',
      cause: 'Unquoted expansion, line-based filename parsing, or assuming POSIX pipelines have pipefail semantics.',
      check: 'Test empty input, repeated spaces, filenames with spaces, and a failing first pipeline command; inspect output and exit status separately.',
    }],
    verification: [
      'Run the supplied ls sample through cut and awk and compare exact columns.',
      'Use shellcheck when available and run scripts with empty input, special characters, and deliberate command failures.',
    ],
    diagramSpec: {
      heading: 'Follow text, arguments, bytes, and status through a shell pipeline',
      sketchId: 'shell-pipeline-flow',
    },
    codeExamples: {
      heading: 'The fixed-format folder exercise in POSIX shell',
      note: 'This deliberately parses only the supplied ls display sample. It is not a general directory-listing parser.',
      variants: [{
        id: 'sh', label: 'POSIX shell', standard: 'POSIX sh + awk',
        code: `#!/bin/sh
set -eu
input=\${1:?usage: extract-ls-fields INPUT OUTPUT}
output=\${2:?usage: extract-ls-fields INPUT OUTPUT}
awk 'NF >= 8 && $1 ~ /^[bcdlps-]/ { print $1, $2, $6, $7 }' "$input" > "$output"`,
      }],
    },
    additionalBlocks: [{
      type: 'prose',
      heading: 'When C or C++ is the better boundary',
      body: 'If filenames, metadata, or error handling must be exact for arbitrary directories, use readdir/fstatat in C or std::filesystem with explicit error_code handling in C++. The shell exercise remains shell because it tests command composition, not a replacement filesystem API.',
    }],
    recall: [
      'Explain grep, sed, cut, awk, redirection, and a pipeline by what each does to records or file descriptors.',
      'Predict the result of unquoted expansion and why cut fails on repeated spaces.',
      'State when a display-oriented ls pipeline must be replaced by find/stat or a C/C++ directory walk.',
    ],
  }),
  defineAuthoredLesson({
    topicId: 'os-driver-model',
    title: 'Linux driver model and device file path',
    depth: 'deep',
    definition: 'A Linux driver binds to a device, owns its kernel-side resources, and exposes operations through a subsystem or device interface. A character device is one possible interface; the driver model also governs matching, probe, removal, and lifetime.',
    motivation: 'A userspace sensor reader can call read on /dev/sensor0, but that call is only the end of a chain: descriptor lookup, VFS dispatch, driver state, bus transaction, and copy to userspace.',
    mechanism: [
      'A bus or platform description enumerates a device. The driver core compares the device identity or compatible string with a registered driver.',
      'Probe acquires resources such as registers, clocks, regulators, GPIOs, IRQs, and DMA capability. It initializes state before exposing an interface to callers.',
      'For a character interface, open creates or finds per-open state. read validates length and blocking policy, obtains data, and safely copies it to userspace; it may return fewer bytes than requested.',
      'Remove prevents new activity, drains work and callbacks, then releases resources. Error paths during probe unwind everything already acquired.',
      'Kernel drivers are ordinarily written in C. A C++ userspace client still crosses the same open/read/ioctl syscall boundary; C++ does not make kernel C++ code necessary.',
    ],
    workedExample: {
      setup: 'A sensor probe succeeds, a userspace process opens its device node, and then the sensor is removed.',
      steps: [
        'The driver binds and registers an interface only after its hardware and state are ready.',
        'read reaches the driver via the VFS and either returns available bytes, blocks under the documented policy, or reports an error.',
        'Removal first stops new hardware work and waits for pending IRQ/work references; a stale file descriptor must not reach freed state.',
      ],
    },
    diagramSpec: { heading: 'Follow a userspace operation into a driver and back', sketchId: 'linux-kernel-transition' },
    realUse: 'The model separates a hardware controller, its Linux driver, and a user application. When read returns EIO, you can check which boundary failed instead of blaming the application parser.',
    failureModes: [{
      symptom: 'The device node exists but reads time out or removal triggers a use-after-free.',
      cause: 'The node was exposed before hardware initialization, or asynchronous work retained a pointer after teardown.',
      check: 'Trace probe completion, open/read return values, reference ownership, IRQ/work cancellation, and cleanup order.',
    }],
    verification: [
      'Inspect device matching under /sys, then use strace to see user-level open/read/ioctl results and dmesg or tracepoints for kernel events.',
      'Inject a failure after each probe resource acquisition and verify no clock, IRQ, mapping, or registered interface remains.',
    ],
    recall: ['Trace read from userspace to the driver callback.', 'Explain probe/remove lifetime and probe-error unwinding.', 'Distinguish a character device from the driver model that discovers and owns the device.'],
  }),
  defineAuthoredLesson({
    topicId: 'os-driver-interrupts',
    title: 'Driver interrupts and DMA ownership',
    depth: 'deep',
    definition: 'An interrupt notifies the CPU that a device needs service; DMA lets a device exchange data with memory without a CPU copy of every byte. Both require explicit ownership, ordering, and teardown rules.',
    motivation: 'A sensor can assert an IRQ when a buffer is ready. The driver must acknowledge the device, defer slow work, map the buffer for DMA correctly, and wake readers only after the data is safe to consume.',
    mechanism: [
      'Identify the interrupt source and acknowledge it according to the device manual. On a shared line, return IRQ_NONE if this device did not assert it.',
      'Keep the hard-IRQ handler bounded and non-sleeping. Use a threaded IRQ or workqueue when handling may sleep or take substantial time.',
      'Choose coherent DMA memory for structures requiring simultaneous CPU/device visibility or a streaming mapping for a transfer. A CPU virtual pointer is not a device DMA address.',
      'For streaming DMA, map with the correct direction and check mapping errors. Transfer ownership between CPU and device with the DMA API, including sync/unmap at the documented points.',
      'Disable new device activity, synchronize IRQ or work completion, and unmap or free buffers before final teardown.',
    ],
    workedExample: {
      setup: 'The device writes a received frame into a DMA buffer and raises an interrupt.',
      steps: [
        'The driver recognizes and acknowledges its interrupt; the hard handler schedules deferred handling.',
        'The deferred path completes the DMA ownership transition before the CPU reads the frame.',
        'Only after validating length and status does the driver publish the frame to waiting readers.',
      ],
    },
    diagramSpec: { heading: 'Transfer a DMA buffer between device and CPU ownership', sketchId: 'architecture-dma-ownership' },
    realUse: 'A network or sensor driver that works on one board can return stale data on another if cache and DMA ownership were assumed rather than established.',
    failureModes: [{
      symptom: 'Repeated interrupt storms, stale data, or sporadic frame corruption under load.',
      cause: 'Uncleared device status, sleeping in hard-IRQ context, wrong DMA direction, missing synchronization, or teardown racing with completion.',
      check: 'Compare device status and interrupt counts, then trace mapping, completion, CPU access, and unmap in timestamp order.',
    }],
    verification: ['Exercise shared and spurious interrupts.', 'Run repeated transfers under load and compare every byte with a known source.', 'Force removal while work is pending and verify completion cannot touch freed memory.'],
    recall: ['State what can run in hard-IRQ context versus a thread.', 'Explain why a virtual pointer is not a DMA address.', 'Show CPU/device ownership before and after a streaming DMA transfer.'],
  }),
  defineAuthoredLesson({
    topicId: 'os-driver-debugging',
    title: 'Debugging a Linux device driver',
    depth: 'deep',
    definition: 'Driver debugging locates the failed boundary—userspace contract, kernel callback, bus transaction, interrupt, DMA buffer, or physical signal—using evidence that discriminates between hypotheses.',
    motivation: 'A sensor read that hangs could be a userspace timeout, a blocked wait queue, an IRQ never arriving, an IRQ not acknowledged, an I2C NACK, or a power rail that never rose.',
    mechanism: [
      'Record the exact userspace call, return value, errno, and timing with strace. This establishes whether the application entered the kernel and whether it blocked or failed.',
      'Read kernel logs and decode any oops: identify the faulting instruction, call trace, execution context, and taint or module state before changing code.',
      'Use ftrace or tracepoints to time probe, IRQ, worker, and wakeup paths. Avoid assuming a printed log line proves ordering across CPUs.',
      'Inspect /sys and /proc for binding, power, interrupts, and device state; compare registers and bus waveforms when hardware behavior is in doubt.',
      'Reproduce with one controlled change, preserve the failing trace, then write a regression test for the actual failure mode.',
    ],
    workedExample: {
      setup: 'read(/dev/sensor0) blocks forever after a reset.',
      steps: [
        'strace shows the process entered read and did not return, so parsing after read is not the cause.',
        'Interrupt count stays flat: check the pin, power/clock enable, IRQ mask, trigger type, and the sensor status register.',
        'A logic analyzer shows a valid bus transaction but no IRQ edge; the next test targets the sensor interrupt configuration, not the userspace buffer.',
      ],
    },
    diagramSpec: { heading: 'Narrow a driver fault with the next discriminating measurement', sketchId: 'debug-hypothesis-loop' },
    realUse: 'This evidence ladder avoids patching the driver’s read callback when the actual fault is a missing device clock or an electrical level mismatch.',
    failureModes: [{
      symptom: 'Adding printk appears to fix a race, or a kernel oops is dismissed as an application bug.',
      cause: 'Logging changed timing, or the failing context and object lifetime were never traced.',
      check: 'Use reproducible timestamps and tracepoints, then test with logs reduced and with race detectors or fault injection where applicable.',
    }],
    verification: ['Capture one failed call and one successful call with the same workload.', 'Compare syscall, kernel trace, and physical measurements on a common timeline.', 'Rerun the precise failing condition after the fix without relying on added logging.'],
    recall: ['Choose strace for syscall-visible behavior and ftrace for kernel execution.', 'Name the next measurement that separates two plausible causes.', 'Explain why logs alone do not prove device timing or memory ownership.'],
  }),
]);

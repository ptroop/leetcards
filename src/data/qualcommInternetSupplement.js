// Additions are kept apart from the earlier, hash-protected archive. Prompts are
// paraphrased from first-person reports; a reported topic is not a verbatim test.
export const supplementalQualcommSources = [
  {
    id: 'gfg-goa-systems-2026', publisher: 'GeeksforGeeks',
    title: 'Qualcomm Software Engineer on-campus experience, systems-oriented panel',
    url: 'https://www.geeksforgeeks.org/interview-experiences/qualcomm-interview-experience-for-software-engineer-role-on-campus-placements/',
    location: 'Goa, India', role: 'Software engineer, embedded/systems-oriented panel',
    reportType: 'firsthand', confidence: 'high', reportedAt: 'August 2026',
  },
  {
    id: 'jointaro-senior-hyd-2025', publisher: 'Jointaro',
    title: 'Qualcomm Senior Engineer interview experience',
    url: 'https://www.jointaro.com/interviews/companies/qualcomm/experiences/senior-engineer-hyderabad-april-1-2025-no-offer-neutral-0813d769/',
    location: 'Hyderabad, India', role: 'Senior engineer, embedded/C/OS screening',
    reportType: 'firsthand', confidence: 'medium', reportedAt: 'April 2025',
  },
  {
    id: 'jointaro-engineer-hyd-2025', publisher: 'Jointaro',
    title: 'Qualcomm Engineer interview experience',
    url: 'https://www.jointaro.com/interviews/companies/qualcomm/experiences/engineer-hyderabad-april-1-2025-no-offer-neutral-7bb1490e/',
    location: 'Hyderabad, India', role: 'Engineer, C and thread synchronization',
    reportType: 'firsthand', confidence: 'medium', reportedAt: 'April 2025',
  },
  {
    id: 'gfg-hardware-campus-2025', publisher: 'GeeksforGeeks',
    title: 'Qualcomm hardware-role on-campus experience',
    url: 'https://www.geeksforgeeks.org/interview-experiences/qualcomm-interview-experience-on-campus-4/',
    location: 'India', role: 'Hardware role; adjacent electronics, not firmware-role evidence',
    reportType: 'firsthand', confidence: 'high', reportedAt: 'Published July 2025',
  },
];

const item = (id, topicId, prompt, answer, sources) => ({
  id, topicId, prompt, answerFocus: answer.direct, answer, sources,
});

export const supplementalQualcommQuestions = [
  item('qi-c-dangling-self-test', 'c-pointers',
    'How would you find a dangling pointer in your own C program?', {
      direct: 'A dangling pointer still holds an address after the pointed-to object has ended its lifetime. No portable C test can inspect an arbitrary pointer and prove that its target is alive; track ownership and use dynamic diagnostics.',
      foundation: 'A free invalidates the allocation, not every copy of its address. Setting one variable to NULL does not repair aliases. Returning the address of an automatic local object creates the same lifetime error without free.',
      mechanism: ['Identify every allocation or local-object lifetime and every alias that can outlive it.', 'Reproduce the suspected use-after-free under AddressSanitizer; use a debugger to connect the report to the last valid owner and the freeing path.', 'Fix ownership so no use can occur after lifetime end, then rerun the smallest failing case and the full suite.'],
      failure: 'Do not suggest checking whether p is non-NULL: a dangling pointer is often non-NULL, and dereferencing it merely to test it is already undefined behavior.',
    }, ['jointaro-senior-hyd-2025']),
  item('qi-embedded-bootloader-purpose', 'embedded-bootloader',
    'What does a bootloader do before starting embedded firmware?', {
      direct: 'A bootloader is code entered before the application that chooses, validates, and transfers control to a firmware image. Depending on the product, it may also receive updates and retain a recoverable fallback image.',
      foundation: 'Reset first establishes a defined execution state. The boot path checks an image header, length, integrity or authenticity policy, and addresses before setting the required stack/vector state and jumping to the application entry.',
      mechanism: ['State where reset starts on this MCU and which image owns the reset vector.', 'Validate candidate image bounds and the product-specific integrity or signature policy.', 'Quiesce peripherals/interrupts as needed, set the application vector and stack according to the architecture, then transfer control.', 'On invalid or interrupted update, remain in recovery or boot the previous verified image.'],
      failure: 'A CRC detects accidental corruption but does not authenticate a malicious image. A bootloader also cannot assume that a half-written image is executable.',
    }, ['jointaro-senior-hyd-2025']),
  item('qi-c-reverse-words-in-place-2026', 'c-strings',
    'Reverse the order of words in a single-spaced C string in place.', {
      direct: 'Reverse every character in the mutable string, then reverse each word individually. The first reversal changes word order but reverses letters; the second restores letters inside each new word position.',
      foundation: 'The report specified one space between words and no extra array. Under that contract, the transformation needs two linear passes and constant extra storage. It requires a writable null-terminated buffer, not a string literal.',
      mechanism: ['Reverse the whole string excluding the null terminator.', 'Walk each space-delimited word and reverse its character range.', 'Return the original buffer; for an empty string or one word the same logic remains valid.'],
      failure: 'strlen in every inner iteration would make the algorithm quadratic. Do not write into a string literal or forget that the final word has no trailing space.',
      implementation: {
        type: 'code', language: 'C17', heading: 'Two reversals, O(n) time and O(1) extra space',
        code: `#include <stddef.h>
#include <string.h>

static void reverse_range(char *s, size_t first, size_t end) {
    while (first < end && first < --end) {
        char temp = s[first];
        s[first++] = s[end];
        s[end] = temp;
    }
}

void reverse_words(char *s) {
    size_t n = strlen(s);
    reverse_range(s, 0, n);
    for (size_t first = 0; first < n; ) {
        size_t end = first;
        while (end < n && s[end] != ' ') ++end;
        reverse_range(s, first, end);
        first = end + 1;
    }
}`,
      },
    }, ['gfg-goa-systems-2026']),
  item('qi-embedded-interrupt-sources', 'embedded-interrupts',
    'Compare a hardware interrupt with a software-triggered exception.', {
      direct: 'A hardware interrupt originates from a peripheral or external signal, while a software-triggered exception is requested by an instruction or software-controlled event. Both enter a defined exception handler, but their cause and timing differ.',
      foundation: 'On Cortex-M, peripheral IRQs, faults, and software-triggered exceptions all use the exception/vector mechanism. A system call on a Cortex-M RTOS may use SVC; a timer or UART peripheral raises an IRQ through NVIC.',
      mechanism: ['Name the source and its pending/enable state.', 'Show exception entry: finish the permitted instruction boundary, save architectural state, select the vector, and apply priority rules.', 'Show handler acknowledgement or fault resolution before exception return restores interrupted execution.'],
      failure: 'Do not equate every software interrupt with a Linux syscall. The exact mechanism depends on architecture and operating environment.',
    }, ['gfg-goa-systems-2026']),
  item('qi-embedded-irq-flags', 'embedded-interrupts',
    'Why must an interrupt handler inspect and clear the peripheral cause?', {
      direct: 'The handler must identify which event asserted the interrupt and clear or acknowledge that event using the peripheral’s documented sequence. Otherwise the cause may remain pending and the CPU can re-enter the handler immediately.',
      foundation: 'NVIC pending state and a peripheral status flag are different pieces of state. Clearing only a controller pending bit may not remove a level asserted by the peripheral; clearing a flag too early can lose an event.',
      mechanism: ['Read the relevant status and enabled-interrupt bits to select a real cause.', 'Service or snapshot the event without blocking in the hard handler.', 'Apply the peripheral-specific clear sequence, then verify that the source is deasserted before returning.'],
      failure: 'Blindly writing zero to a status register is not universal: flags may be write-one-to-clear, clear-on-read, or require a documented read sequence.',
    }, ['gfg-goa-systems-2026']),
  item('qi-embedded-multiclient-timer', 'embedded-timers',
    'Design a timer service that runs several client callbacks at their deadlines.', {
      direct: 'Keep one monotonic time base and a collection of client deadlines. Program the next hardware wakeup, then dispatch expired callbacks outside the shortest possible interrupt path.',
      foundation: 'The interview report describes a timer module serving multiple clients, so the central invariant is that each live client has one next deadline and cancellation prevents later callback execution. Callback ownership and wraparound matter as much as the timer register.',
      mechanism: ['Define monotonic timestamp width, deadline ordering, and whether callbacks may reschedule or cancel themselves.', 'Under a short lock or interrupt mask, insert or remove a deadline and arm the earliest timer.', 'On expiry, snapshot due clients, update timer state, and run callbacks in a safe context according to their blocking requirements.', 'Test simultaneous expiries, cancellation races, counter wraparound, and a slow callback.'],
      failure: 'Do not call arbitrary client code while holding the timer lock or from a hard ISR if it may block. Doing so can deadlock or ruin latency for every client.',
    }, ['gfg-embedded-app']),
  item('qi-linux-sync-two-threads-c', 'os-mutex',
    'How would you synchronize two threads in C? Show one concrete ordered example.', {
      direct: 'Use a mutex to protect a shared turn predicate and a condition variable to sleep until the predicate changes. Each thread checks its condition in a while loop, performs its turn, changes the predicate, then signals the other.',
      foundation: 'The report says two-thread synchronization but does not specify the required behavior; alternation is one concrete exercise. A mutex alone prevents simultaneous entry but does not establish alternation. A condition variable does not store a notification, so the shared predicate is the durable state. The loop handles spurious wakeups and changed state.',
      mechanism: ['Initialize turn and a mutex/condition variable before creating threads.', 'Lock, wait in a while loop until turn belongs to this thread, perform the bounded action, update turn, signal, then unlock.', 'Join both threads and destroy synchronization objects after no thread can use them.'],
      failure: 'Using if instead of while around pthread_cond_wait is incorrect; a wakeup does not guarantee the predicate is true. This demo prints under the lock to show order; real work should avoid slow I/O inside the critical section.',
      implementation: {
        type: 'code', language: 'C17', heading: 'Two threads alternate with a predicate and condition variable',
        code: `#include <pthread.h>
#include <stdbool.h>
#include <stdio.h>

struct shared {
    pthread_mutex_t mutex;
    pthread_cond_t changed;
    int turn;
    bool stop;
};

struct worker_arg {
    struct shared *shared;
    int id;
};

static void *worker(void *opaque)
{
    struct worker_arg *arg = opaque;
    struct shared *s = arg->shared;
    for (int round = 0; round < 5; ++round) {
        pthread_mutex_lock(&s->mutex);
        while (!s->stop && s->turn != arg->id)
            pthread_cond_wait(&s->changed, &s->mutex);
        if (s->stop) {
            pthread_mutex_unlock(&s->mutex);
            return NULL;
        }
        printf("thread %d, round %d\\n", arg->id, round);
        s->turn = 1 - arg->id;
        pthread_cond_signal(&s->changed);
        pthread_mutex_unlock(&s->mutex);
    }
    return NULL;
}

int main(void)
{
    struct shared s = {
        PTHREAD_MUTEX_INITIALIZER, PTHREAD_COND_INITIALIZER, 0, false
    };
    struct worker_arg a = { &s, 0 }, b = { &s, 1 };
    pthread_t first, second;
    if (pthread_create(&first, NULL, worker, &a) != 0) return 1;
    if (pthread_create(&second, NULL, worker, &b) != 0) {
        pthread_mutex_lock(&s.mutex);
        s.stop = true;
        pthread_cond_signal(&s.changed);
        pthread_mutex_unlock(&s.mutex);
        pthread_join(first, NULL);
        return 1;
    }
    pthread_join(first, NULL);
    pthread_join(second, NULL);
    pthread_cond_destroy(&s.changed);
    pthread_mutex_destroy(&s.mutex);
    return 0;
}`,
      },
    }, ['jointaro-engineer-hyd-2025']),
  item('qi-electronics-noise-margin', 'electronics-logic-levels',
    'What do logic-high and logic-low noise margins tell you?', {
      direct: 'Noise margin is the voltage allowance between a driver’s guaranteed output level and a receiver’s required input threshold. High margin is VOH(min) minus VIH(min); low margin is VIL(max) minus VOL(max).',
      foundation: 'Digital signals are real voltages with uncertain edges and noise. A receiver only guarantees high above VIH and low below VIL; a driver guarantees its high is at least VOH and its low is at most VOL under specified load.',
      mechanism: ['Read the driver output-level limits and receiver input thresholds from their datasheets at the intended supply and load.', 'Compute both margins with the guaranteed worst-case values.', 'Check that ground offset, interference, slow edges, and input hysteresis leave adequate margin on the actual board.'],
      failure: 'This was reported for a hardware-role interview, not specifically a firmware opening. A nominal 3.3 V label alone does not prove two devices have compatible thresholds.',
    }, ['gfg-hardware-campus-2025']),
  item('qi-electronics-setup-hold', 'electronics-setup-hold',
    'What are setup and hold times around a clock edge?', {
      direct: 'Setup time is how long data must be stable before the capturing clock edge; hold time is how long it must remain stable after that edge. Violating either can make captured state unreliable.',
      foundation: 'A flip-flop samples analog voltage over a finite aperture, not at a mathematically instantaneous point. Timing budgets include source clock skew, propagation delay, jitter, and the receiver’s setup/hold requirements.',
      mechanism: ['Draw the active edge and the interval that must contain stable input data.', 'For setup, compare latest-arriving data with the earliest possible capture edge.', 'For hold, compare earliest-changing data with the latest relevant capture edge and account for skew.'],
      failure: 'This exact theme came from a hardware-role report. Do not call every late sample a software race; it is an electrical timing constraint that may manifest as metastability or incorrect data.',
    }, ['gfg-hardware-campus-2025']),
];

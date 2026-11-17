import bank from './folderInterviewQuestions.json' with { type: 'json' };

export const folderSources = bank.sources;
export const folderSourceById = new Map(folderSources.map((source) => [source.id, source]));
export const normalizeQuestionText = (value = '') => value.normalize('NFKD').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();

const topicRules = [
  [/pthread/, 'Linux & OS', 'qualcomm-linux-processes-signals'],
  [/bitewise recurrence/, 'DSA & programming', 'qualcomm-problem-bitwise-recurrence'],
  [/memory structure of c/, 'C & C++', 'qualcomm-c-storage-lifetime'],
  [/structures|structure/, 'C & C++', 'qualcomm-c-aggregate-layout'],
  [/synchronous.*communication/, 'Linux & OS', 'qualcomm-linux-ipc'],
  [/bind/, 'Networking', 'net-sockets'],
  [/triangular arrangement/, 'Logic & puzzles', 'qualcomm-puzzles-logic'],
  [/monolithic|microkernel/, 'Linux & OS', 'qualcomm-linux-kernel-vm'],
  [/self.introduction|interviews|will you work|did you applied/, 'Projects & interview', 'qualcomm-behavioral-rounds'],
  [/two brand new systems/, 'Networking', 'net-debug'],
  [/audio hardware/, 'Linux & OS', 'qualcomm-linux-processes-signals'],
  [/all layers.*protocols/, 'Networking', 'net-layers'],
  [/bitwise|hexadecimal|binary./, 'C & C++', 'qualcomm-c-bits-endian'],
  [/thread.*matrix|threads.*highest/, 'Linux & OS', 'qualcomm-linux-thread-matrix'],
  [/ipc|fifo|pipes|shared memory/, 'Linux & OS', 'qualcomm-linux-ipc'],
  [/locking mechanisms/, 'Linux & OS', 'qualcomm-linux-synchronization'],
  [/kernel|pcb|tcb|position independent/, 'Linux & OS', 'qualcomm-linux-kernel-vm'],
  [/bootloader|booting/, 'Linux & OS', 'qualcomm-linux-boot-linking'],
  [/callback|pointers|read an integer/, 'C & C++', 'qualcomm-c-pointers-arrays'],
  [/data structures|hashing|unpaired/, 'DSA & programming', 'qualcomm-dsa-hashing-distinct'],
  [/context switching/, 'Linux & OS', 'os-scheduling'],
  [/if you execute|int a/, 'C & C++', 'qualcomm-c-output-semantics'],
  [/linked.list|link list|nth.*node|list.*palindrome|reverse.*list/, 'DSA & programming', 'qualcomm-dsa-linked-lists'],
  [/set.*bits?|clear.*bits?|bits?.*set|power of 2|power of two/, 'C & C++', 'qualcomm-c-bits-endian'],
  [/plain char|unsigned.char|short.circuit|precedence|pointer.*string literal/, 'C & C++', 'qualcomm-c-output-semantics'],
  [/context switching|scheduling|multitasking/, 'Linux & OS', 'os-scheduling'],
  [/ipc|signal|fork|exec/, 'Linux & OS', 'qualcomm-linux-processes-signals'],
  [/socket|tcp client|tcp server/, 'Networking', 'net-sockets'],
  [/endian/, 'C & C++', 'qualcomm-c-bits-endian'],
  [/operating system/, 'Linux & OS', 'qualcomm-linux-kernel-vm'],
  [/filters|rectifiers/, 'Embedded & electronics', 'qualcomm-arch-memory-digital'],
  [/constructor|destructor/, 'C & C++', 'cpp-object-model'],
  [/number of moves|no of moves|how many sentences|anagram|01 is 0|incomplete mathematical/, 'Logic & puzzles', 'qualcomm-problem-clarification'],
  [/routing/, 'Networking', 'net-routing-decision'],
  [/ip header|what.*\bip\b.*type/, 'Networking', 'net-ip'],
  [/explain mac|types of ports/, 'Networking', 'net-ethernet'],
  [/google.com|all layers.*protocol/, 'Networking', 'net-layers'],
  [/iterative.*server|concurrent.*server/, 'Networking', 'net-sockets'],
  [/system call|function calls and library|exception in a system|copy.on.write/, 'Linux & OS', 'qualcomm-linux-kernel-vm'],
  [/locking mechanism/, 'Linux & OS', 'qualcomm-linux-synchronization'],
  [/multi.?tasking|preemption/, 'Linux & OS', 'os-scheduling'],
  [/linux commands|ls -l|ubuntu|windows/, 'Linux & OS', 'qualcomm-linux-shell-tools'],
  [/memory leak|dynamic variable|stack segment|code segment|stack.*errors/, 'C & C++', 'qualcomm-c-storage-lifetime'],
  [/call back function/, 'C & C++', 'qualcomm-c-pointers-arrays'],
  [/circular.*shift|powers of two/, 'C & C++', 'qualcomm-c-bits-endian'],
  [/int \*|void \*|int a\[|argc|precedence|floating point/, 'C & C++', 'qualcomm-c-output-semantics'],
  [/word order/, 'C & C++', 'qualcomm-c-strings-files'],
  [/continue 1,20|ten sticks|10 sticks/, 'Logic & puzzles', 'qualcomm-puzzles-logic'],
  [/0\/n|n\/0|0\/0/, 'Logic & puzzles', 'qualcomm-puzzles-math-signals'],
  [/mc v|rts|general purpose.*embedded/, 'Embedded & electronics', 'qualcomm-embedded-rtos-interrupts'],
  [/open.*phone|which system is faster/, 'Embedded & electronics', 'qualcomm-arch-isa-cpu'],
  [/interview|interested in embedded|development or testing|good.*programming|joining this course/, 'Projects & interview', 'qualcomm-behavioral-rounds'],
  [/dam design|mud height/, 'DSA & programming', 'qualcomm-problem-dam-design'],
  [/prefix cost/, 'DSA & programming', 'qualcomm-problem-prefix-cost'],
  [/palindromic substring|palindrome substrings/, 'DSA & programming', 'qualcomm-problem-palindrome-intervals'],
  [/shortest.*distinct|minimum.*subarray/, 'DSA & programming', 'qualcomm-problem-k-distinct-window'],
  [/bitwise recurrence/, 'DSA & programming', 'qualcomm-problem-bitwise-recurrence'],
  [/tyre|horse|heavier.*ball|nine balls|egg|trains|ten.*triang/, 'Logic & puzzles', 'qualcomm-puzzles-balance-motion'],
  [/cube|cake|painted/, 'Logic & puzzles', 'qualcomm-puzzles-cubes-cuts'],
  [/litre|liter|bucket|jar|rope|hourglass/, 'Logic & puzzles', 'qualcomm-puzzles-measurement'],
  [/clock|fourier|area under|zero divide|divide by zero/, 'Logic & puzzles', 'qualcomm-puzzles-math-signals'],
  [/basket|coconut|one stroke|one-stroke|series.*20|three copies|make six/, 'Logic & puzzles', 'qualcomm-puzzles-logic'],
  [/camera|headphone|black.box.*white.box|test cases|test.*device|watch|carrom/, 'Testing & debugging', 'qualcomm-testing-devices'],
  [/project|inverted search|mini shell|car black box/, 'Projects & interview', 'qualcomm-project-explanation'],
  [/introduc|yourself|hobbies|why qualcomm|why.*chelsio|about.*company|role|resume|emertxe|job|organization|feel down|find solution|what.*looking|coding\?|did.*appl|device drivers, why/, 'Projects & interview', 'qualcomm-behavioral-rounds'],
  [/three.way|3.way|tcp.*handshake|tcp.*reliab/, 'Networking', 'net-tcp'],
  [/termination.*tcp|tcp.*clos|tcp.*termin|server crashes/, 'Networking', 'net-timewait'],
  [/arp|rarp|icmp/, 'Networking', 'net-arp'],
  [/dns|dhcp|nslookup|snmp|tftp/, 'Networking', 'net-dns'],
  [/ip address|netmask|ipv4|ipv6|subnet/, 'Networking', 'net-ip'],
  [/switch|router|hub|mac address|ethernet|broadcast|mbps|mbps/, 'Networking', 'net-ethernet'],
  [/osi|tcp.?ip|tcp model|tcp.*layers|headers.*wire|lan.*wan|encapsulation/, 'Networking', 'net-layers'],
  [/select|synchronous i.o|raw socket|sendto|socket|bind\(|accept|port number|network byte/, 'Networking', 'net-sockets'],
  [/tcp|udp/, 'Networking', 'net-tcp'],
  [/network|communicat.*systems|two.*devices|ping|traceroute|netstat|ifconfig/, 'Networking', 'net-debug'],
  [/shell|script|grep|sed|cut command|file.*email|tree command/, 'Linux & OS', 'os-shell-scripting'],
  [/driver|insmod|major numbers|minor numbers|nic/, 'Linux & OS', 'os-driver-model'],
  [/mutex|semaphore|spin.?lock|deadlock|synchron|race condition|atomicity|mutual exclusion|critical section|priority inversion/, 'Linux & OS', 'qualcomm-linux-synchronization'],
  [/ipc|fifo|pipes|message queue|memory queue|shared memory|communication problems/, 'Linux & OS', 'qualcomm-linux-ipc'],
  [/fork|exec|process|thread|signal|blocking|terminal/, 'Linux & OS', 'qualcomm-linux-processes-signals'],
  [/schedul|round robin|fcfs|deadline|rate.monotonic/, 'Linux & OS', 'os-scheduling'],
  [/boot|linking|where.*os.*stored|hard disk|partition|install.*linux/, 'Linux & OS', 'qualcomm-linux-boot-linking'],
  [/kernel|virtual memory|page|paging|mmu|tlb|logical address|physical address|file.system|inode|i.node|vfs|swapping|operating system/, 'Linux & OS', 'qualcomm-linux-kernel-vm'],
  [/hysteresis|feedback|control system/, 'Embedded & electronics', 'qualcomm-embedded-feedback'],
  [/uart|baud/, 'Embedded & electronics', 'qualcomm-embedded-uart'],
  [/i2c|spi|can protocol|communication protocols|buses/, 'Embedded & electronics', 'qualcomm-embedded-buses'],
  [/rtos|real.time|interrupt|isr/, 'Embedded & electronics', 'qualcomm-embedded-rtos-interrupts'],
  [/cpu|register|arm|x86|risc|cisc|gpu/, 'Embedded & electronics', 'qualcomm-arch-isa-cpu'],
  [/cache|dma|memory.mapped|port.mapped|latch|flip.flop|digital|memory.*types|types.*memory/, 'Embedded & electronics', 'qualcomm-arch-memory-digital'],
  [/adc|microcontroller|gpio|8051|electronics|sensor|parking/, 'Embedded & electronics', 'qualcomm-embedded-mcu-memory'],
  [/linked|link list|node|list.*palindrome/, 'DSA & programming', 'qualcomm-dsa-linked-lists'],
  [/hash|distinct|pair|consecutive/, 'DSA & programming', 'qualcomm-dsa-hashing-distinct'],
  [/stack.*queue|enqueue|dequeue|push|pop|infix|postfix|prefix expression/, 'DSA & programming', 'qualcomm-dsa-stack-queue'],
  [/tree|convolution/, 'DSA & programming', 'qualcomm-dsa-trees-convolution'],
  [/complexity|search|sort|divide and conquer/, 'DSA & programming', 'qualcomm-dsa-complexity-search'],
  [/bits?|endian|hex|power of 2|power of two|rotate/, 'C & C++', 'qualcomm-c-bits-endian'],
  [/struct|union|enum|padding|alignment/, 'C & C++', 'qualcomm-c-aggregate-layout'],
  [/storage|static|volatile|bss|memory segment|heap|stack overflow|constructor|destructor/, 'C & C++', 'qualcomm-c-storage-lifetime'],
  [/pointer|ptr|array|malloc|calloc|allocation|pass by|const/, 'C & C++', 'qualcomm-c-pointers-arrays'],
  [/macro|compilation|makefile|inline|stdio/, 'C & C++', 'qualcomm-c-macros-build'],
  [/string|words|palindrome|pattern|fibonacci|file/, 'C & C++', 'qualcomm-c-strings-files'],
  [/overflow|average|sum.*100|swap|prime|factorial|recursion|even|odd/, 'C & C++', 'qualcomm-c-safe-arithmetic'],
  [/output|printf|char|operator|loop|increment/, 'C & C++', 'qualcomm-c-output-semantics'],
];

export const folderQuestions = bank.questions.map((question) => {
  const rule = topicRules.find(([pattern]) => new RegExp(`\\b(?:${pattern.source})(?:s|es|ed|ing|tion|ization|isation)?\\b`, 'i').test(question.prompt));
  return { ...question, area: question.area ?? rule?.[1] ?? 'Other reported topics', topicId: rule?.[2] ?? null };
});

export function filterFolderQuestions({ company, query = '', area = '', sourceId = '', status = '' }) {
  const words = normalizeQuestionText(query).split(' ').filter(Boolean);
  return folderQuestions.filter((question) => {
    if (question.company !== company && question.company !== 'shared') return false;
    if (area && question.area !== area) return false;
    if (status && question.status !== status) return false;
    if (sourceId && !question.sources.some((source) => source.sourceId === sourceId)
      && !folderSourceById.get(sourceId)?.questionIds.includes(question.id)) return false;
    const text = normalizeQuestionText([
      question.prompt, question.code, question.answer, question.clarification, question.area,
      ...question.sources.map(({ sourceId: id }) => folderSourceById.get(id)?.path ?? ''),
    ].filter(Boolean).join(' '));
    return words.every((word) => text.includes(word));
  });
}

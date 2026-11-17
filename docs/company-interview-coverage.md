# Leetcards company interview question coverage

## Delivered behavior

- New Chelsio tab at `#/chelsio`.
- Qualcomm folder questions at `#/qualcomm-questions`, linked from Qualcomm Prep.
- Company switching, question/code/source search, topic/source/statement filters, expandable questions, related lessons and provenance.
- Dam Design compared visually against all five images in the supplied LeetCode discussion. Its three examples and tested Python implementation are included.

## Coverage and interpretation

- 64 extracted source files: 20 Chelsio files and 44 Qualcomm files, including the nested archive and its four screenshots.
- 49 text extractions; OCR and visual review across 73 document images, photographs and rendered PDF pages.
- Original folder import: 733 prompt entries: 411 Chelsio, 320 Qualcomm, and two user recollections shown in both company views.
- Counts include reworded variants and topic recollections; they are not a count of unique coding problems or company interview frequency.
- The original import has 90 entries containing standalone reasoning/answers. The remaining entries link to related existing lessons; this is not a claim that all 733 entries have new standalone answers.
- 138 entries preserve topic-only recollections. 22 entries explicitly flag missing or conflicting constraints. Empty or vague reports were not expanded into invented exact questions.
- The original source PDFs, documents and photographs are retained locally and are not included in the web app.

## Verification

- 156 tests: 155 passed, one pre-existing local-folder check skipped because `Downloads/qual` is absent. The new ledger was separately checked against all 64 actual source-file hashes.
- Initial seven focused checks passed: provenance completeness, nested-source mapping, filtering, company isolation, routes, image code preservation, topic matching and Dam Design correctness.
- Dam Design checked against all three post examples and 972 independent small-gap height bounds, plus empty/single/unsorted/duplicate-position cases.
- Authored curriculum, writing-quality and code-quality audits passed.
- Focused DSA C/C++ verification and 10 college DSA C compilation checks passed.
- Production build and PWA cache generation passed. Vite reports a large main JavaScript bundle; the site already bundles a substantial curriculum.
- Desktop and 390px mobile layouts inspected in the ChatGPT browser; camera search, company switching, Dam Design rendering, table and code overflow verified.


## External research expansion — November 17, 2026

- Current bank: **902 prompts**, comprising the original 733, **126 potential interview exercises**, and **43 online candidate-reported Qualcomm prompts**. All 169 outside additions show the common **External practice** badge.
- Potential exercises cover C ownership, concurrency, Linux/processes, DMA/drivers, TCP/network debugging, UART/I2C/SPI, DSA, puzzles, camera testing and project discussion. Each has editorial reasoning; related variants are not counted as independent interview evidence.
- Candidate-reported questions have their own **Reported online · candidate account** statement filter, source link, role context and explicit unofficial status. Article update dates are distinguished from interview dates.
- Ten detailed Qualcomm candidate accounts were used. These establish reported topics and prompts, not verified company policy or future-question probabilities:
  - [Senior Engineer / Hyderabad Linux Kernel team](https://www.reddit.com/r/qualcomm/comments/1x9u673/qualcomm_interview_experience_for_senior_engineer/)
  - [SDE off-campus 2023 / Chennai](https://www.geeksforgeeks.org/interview-experiences/qualcomm-interview-experience-for-sde-off-campus-2023/)
  - [Associate Engineer](https://www.geeksforgeeks.org/interview-experiences/qualcomm-interview-experience-associate-engineer-full-time/)
  - [Embedded Software Engineer / June 2025](https://leetcode.com/discuss/post/6831002/)
  - [Embedded SW application developer / C and RTOS](https://www.geeksforgeeks.org/interview-experiences/qualcomm-interview-set-2/)
  - [Embedded System / architecture and puzzles](https://www.geeksforgeeks.org/interview-experiences/qualcomm-interview-experience-for-embedded-system/)
- [Chelsio candidate accounts](https://www.glassdoor.com/Interview/Chelsio-Communications-Interview-Questions-E261022.htm) were checked for C pointers, allocation, synchronization and networking coverage. Their incomplete bitwise/rotation descriptions were not presented as reconstructed exact questions.
- Technical background for new scenarios includes the [Linux NAPI API](https://docs.kernel.org/networking/napi.html), [memory barriers](https://docs.kernel.org/core-api/wrappers/memory-barriers.html), [I2C protocol](https://docs.kernel.org/i2c/i2c-protocol.html), [SPI API](https://docs.kernel.org/driver-api/spi.html), and [TCP RFC 9293](https://www.rfc-editor.org/rfc/rfc9293.html). These documents support concepts; they do not claim the exercises appeared in interviews.
- The original 64-file inventory remains intact. Online sources have no fabricated local-file hashes. Shared practice and user recollections are available in both company source filters.

- Latest research pass: all 17 test files pass; all nine focused folder-bank tests pass, including the then-current 31 online reports and 74 practice entries. Production build and PWA cache generation pass. The large-bundle warning remains.

## Files accounted for

| Source | File | Classification | Linked prompts |
|---|---|---|---:|
| S001 | Chelsio/Advanced C Module.docx | questions | 68 |
| S002 | Chelsio/CPP Module.docx | questions | 1 |
| S003 | Chelsio/Chelsio_interview_questions.pdf | questions | 9 |
| S004 | Chelsio/Data Structures.docx | questions | 16 |
| S005 | Chelsio/General questions.docx | questions | 26 |
| S006 | Chelsio/IMG_20190507_204347.jpg | questions | 4 |
| S007 | Chelsio/July 2023 questions.docx | questions | 17 |
| S008 | Chelsio/June 2024.docx | questions | 34 |
| S009 | Chelsio/LI Module.docx | questions | 108 |
| S010 | Chelsio/MC Module.docx | questions | 8 |
| S011 | Chelsio/Unsorted Data/April 2023 questions.docx | questions | 9 |
| S012 | Chelsio/Unsorted Data/Chelsio_questions.docx | questions | 8 |
| S013 | Chelsio/Unsorted Data/May 2024.docx | questions | 16 |
| S014 | Chelsio/Unsorted Data/Sept 2023 questions.docx | questions | 22 |
| S015 | Chelsio/Unsorted Data/li_interview_essentials_1.0.doc (1).docx | alternate-format | 59 |
| S016 | Chelsio/chelsio.txt | questions | 5 |
| S017 | Chelsio/li_interview_essentials_1.0.doc (1).pdf | questions | 60 |
| S018 | Chelsio/li_interview_essentials_2.0.doc (1).pdf | questions | 38 |
| S019 | Chelsio/li_interview_essentials_3.0.doc (1).pdf | questions | 12 |
| S020 | Chelsio/li_interview_essentials_4.0.doc (1).pdf | questions | 10 |
| S021 | Qualcomm/27-July-2022 Hacker rank/WhatsApp Unknown 2022-07-28 at 9.27.55 AM.zip | nested-archive | 4 |
| S022 | Qualcomm/Module_Wise_Questions/C MCQ- Qualcomm.docx | questions | 8 |
| S023 | Qualcomm/Module_Wise_Questions/C Programming- Qualcomm.docx | questions | 17 |
| S024 | Qualcomm/Module_Wise_Questions/C Subjective- Qualcomm.docx | questions | 21 |
| S025 | Qualcomm/Module_Wise_Questions/DS Programming- Qualcomm.docx | questions | 8 |
| S026 | Qualcomm/Module_Wise_Questions/DS Subjective- Qualcomm.docx | questions | 11 |
| S027 | Qualcomm/Module_Wise_Questions/LI Subjective- Qualcomm.docx | questions | 18 |
| S028 | Qualcomm/Module_Wise_Questions/LS Programming- Qualcomm.docx | questions | 4 |
| S029 | Qualcomm/Module_Wise_Questions/LS Subjective- Qualcomm.docx | questions | 4 |
| S030 | Qualcomm/Module_Wise_Questions/MC Subjective- Qualcomm.docx | questions | 17 |
| S031 | Qualcomm/Module_Wise_Questions/Other Questions- Qualcomm.docx | questions | 25 |
| S032 | Qualcomm/Module_Wise_Questions/Qualcomm Interview Question Solutions.docx | student-solutions | 10 |
| S033 | Qualcomm/ProgramSolutions/Copy of Copy of pattern_num_1_12_124.c | solution-code | 1 |
| S034 | Qualcomm/ProgramSolutions/Copy of pattern_num_1_12_124.c | solution-code | 1 |
| S035 | Qualcomm/ProgramSolutions/Qualcom interview questions15122021.jpeg | questions | 1 |
| S036 | Qualcomm/ProgramSolutions/Qualcomm 10122021.docx | questions | 9 |
| S037 | Qualcomm/ProgramSolutions/Qualcomm _26052021.odt | questions | 5 |
| S038 | Qualcomm/ProgramSolutions/Qualcomm-1.jpg | questions | 7 |
| S039 | Qualcomm/ProgramSolutions/Qualcomm-2.jpg | questions | 1 |
| S040 | Qualcomm/ProgramSolutions/pattern_num_1_12_124.c | solution-code | 1 |
| S041 | Qualcomm/ProgramSolutions/print_pattern_1_12_123.c | solution-code | 1 |
| S042 | Qualcomm/ProgramSolutions/qualcom 21 nov.jpg | questions | 4 |
| S043 | Qualcomm/ProgramSolutions/qualcomm_tech_HR_rounds_june_2020 (1).docx | questions | 13 |
| S044 | Qualcomm/ProgramSolutions/reverse_string.c | solution-code | 2 |
| S045 | Qualcomm/QUALCOMM QUESTIONS.docx | questions | 21 |
| S046 | Qualcomm/QUALCOMM Questions.2 docx | questions | 13 |
| S047 | Qualcomm/Qualcom interview questions15-122021.jpeg | questions | 1 |
| S048 | Qualcomm/Qualcomm 10122021.odt | questions | 9 |
| S049 | Qualcomm/Qualcomm Interview Preparation Guideline.docx | questions | 1 |
| S050 | Qualcomm/Qualcomm Interview Question_.pdf | questions | 15 |
| S051 | Qualcomm/Qualcomm Interview Questions 17-12-2021.docx | questions | 49 |
| S052 | Qualcomm/Qualcomm-3.jpg | questions | 5 |
| S053 | Qualcomm/Qualcomm.pdf | questions | 20 |
| S054 | Qualcomm/Qualcomm1.pdf | questions | 11 |
| S055 | Qualcomm/Qualcomm2.jpg | questions | 3 |
| S056 | Qualcomm/Qualcomm3.jpg | questions | 11 |
| S057 | Qualcomm/Qualcomm_interview_questions.docx | questions | 9 |
| S058 | Qualcomm/qualcomm.jpg | questions | 17 |
| S059 | Qualcomm/qualcomm_tech_HR_rounds_june_2020.docx | questions | 13 |
| S060 | Qualcomm/technical round - Aug 2022.docx | questions | 16 |
| S061 | Qualcomm/27-July-2022 Hacker rank/WhatsApp Unknown 2022-07-28 at 9.27.55 AM.zip!/WhatsApp Image 2022-07-28 at 9.27.42 AM.jpeg | questions | 1 |
| S062 | Qualcomm/27-July-2022 Hacker rank/WhatsApp Unknown 2022-07-28 at 9.27.55 AM.zip!/WhatsApp Image 2022-07-28 at 9.27.43 AM (1).jpeg | questions | 1 |
| S063 | Qualcomm/27-July-2022 Hacker rank/WhatsApp Unknown 2022-07-28 at 9.27.55 AM.zip!/WhatsApp Image 2022-07-28 at 9.27.43 AM.jpeg | questions | 1 |
| S064 | Qualcomm/27-July-2022 Hacker rank/WhatsApp Unknown 2022-07-28 at 9.27.55 AM.zip!/WhatsApp Image 2022-07-28 at 9.27.44 AM.jpeg | questions | 1 |

## Remaining source ambiguity

- **How can we communicate between two unrelated processes without using any IPC mechanisms or any kernel help? (he told me to think and try to find a solution).**
  Ordinary isolated processes need some shared channel or external side effect. Ask which mechanisms are prohibited and whether timing, files or hardware are allowed; no general direct memory access follows from the wording.
- **Given an array and asked to print the length of largest subarray of consecutive numbers with O(n) time complexity**
  Clarify contiguous subarray versus an unordered consecutive-value sequence. The familiar O(n) hash-set solution solves the latter, not every contiguous variant.
- **Why 01 is 0. Mathematically proof**
  The extracted source reads “01”. The exponent or formatting may be missing; confirm whether this asks about 0^1, 0!, or another expression before proving anything.
- **If you have round cake and you can make max 4 cuts. What is the maximum number of Pieces you can make?**
  Clarify the model. Four straight cuts of a flat disk give at most 11 regions. Four planes through a solid cake give at most 15 regions. Sixteen equal pieces with four cuts requires rearranging/stacking pieces or other changed rules. The source answer “9” is not a general maximum.
- **no of moves,**
  The source gives a title only. Ask for inputs, legal operations, target, constraints and examples. A web result with the same title cannot establish the original task.
- **count string permutation,**
  The source gives a title only. Ask for inputs, legal operations, target, constraints and examples. A web result with the same title cannot establish the original task.
- **best sum any tree path,**
  The source gives a title only. Ask for inputs, legal operations, target, constraints and examples. A web result with the same title cannot establish the original task.
- **how many sentences in anagram...totally six programs**
  The source gives a title only. Ask for inputs, legal operations, target, constraints and examples. A web result with the same title cannot establish the original task.
- **Number of moves**
  The source gives a title only. Ask for inputs, legal operations, target, constraints and examples. A web result with the same title cannot establish the original task.
- **How many sentences?.................... (4)**
  The source gives a title only. Ask for inputs, legal operations, target, constraints and examples. A web result with the same title cannot establish the original task.
- **Logical questions like if u have a round cake and u can make max 4 cuts ..what is the maximum number of pieces u can get.**
  Clarify the model. Four straight cuts of a flat disk give at most 11 regions. Four planes through a solid cake give at most 15 regions. Sixteen equal pieces with four cuts requires rearranging/stacking pieces or other changed rules. The source answer “9” is not a general maximum.
- **How many sentences?**
  The source gives a title only. Ask for inputs, legal operations, target, constraints and examples. A web result with the same title cannot establish the original task.
- **puzzle-100 floors building, egg will break falling from which floor?**
  The number of eggs is missing. With two eggs, choose decreasing intervals 14,13,12,… so the first drops are at floors 14,27,39,…; after a break, linearly test the previous interval using the remaining egg. At most 14 drops suffice because 14×15/2≥100.
- **Given an integer array, print the length of the longest subarray of consecutive numbers with O(n) time complexity. [Apr - 2023]**
  Clarify contiguous subarray versus an unordered consecutive-value sequence. The familiar O(n) hash-set solution solves the latter, not every contiguous variant.
- **WAP for a 4-bit system to add two hexadecimal numbers, 0x9000 and 0x8000?**
  The constants exceed four bits. Clarify whether “4-bit” means the CPU word size, four hexadecimal digits, or a four-bit result, and whether carry must be returned.
- **Cut a round cake three times into eight equal pieces; examine the four-cut, sixteen-piece variation.**
  Clarify the model. Four straight cuts of a flat disk give at most 11 regions. Four planes through a solid cake give at most 15 regions. Sixteen equal pieces with four cuts requires rearranging/stacking pieces or other changed rules. The source answer “9” is not a general maximum.
- **Design feedback control that stabilizes a varying voltage using a feedback sensor and hysteresis.**
  Clarify plant dynamics, actuator, sample period and acceptable error. Hysteresis uses separate upper and lower switching thresholds to prevent chatter. Bound the output and account for sensor noise, delay and saturation; the photograph does not provide a complete control specification.
- **Can the photographed five-region rectangle be drawn in one stroke without skipping or retracing a segment?**
  The wording says “cut each segment”; this answer interprets the pictured task as traversing every drawn edge exactly once. A different cutting rule requires clarification.
- **A person stands between two approaching trains separated by 100 m, traveling at 100 and 200 km/h. When will a train reach the person?**
  The photo does not fix the person’s position or motion. Preserve those missing assumptions instead of inventing a numeric impact time.
- **What is the maximum number of pieces from four cuts of a round cake?**
  Clarify the model. Four straight cuts of a flat disk give at most 11 regions. Four planes through a solid cake give at most 15 regions. Sixteen equal pieces with four cuts requires rearranging/stacking pieces or other changed rules. The source answer “9” is not a general maximum.
- **Find the highest safe floor in a 100-floor building using eggs.**
  The number of eggs is missing. With two eggs, choose decreasing intervals 14,13,12,… so the first drops are at floors 14,27,39,…; after a break, linearly test the previous interval using the remaining egg. At most 14 drops suffice because 14×15/2≥100.
- **Incomplete mathematical prompt: the source says “What is ?”.**
  The source has no expression or diagram attached to this line. It is retained as an unresolved fragment; there is no reliable question or answer to reconstruct.

## Additional puzzles, Linux/OS, C quizzes and Qualcomm DSA

This expansion adds 64 entries: 16 puzzles, 20 Linux/OS scenarios, 16 original C11 code quizzes and 12 Qualcomm DSA prompts from four additional candidate accounts. All carry the External practice badge. The original folder inventory is unchanged; repeated interview topics may have independent source variants and are not claimed as unique problems.

- Puzzles: coloring invariants, information bounds, pooled binary testing, conditional probability, fair randomness from a biased coin, lamp protocols, backward induction, exact weighing, Ramsey reasoning, circular-route invariants and a magic square. The apple/orange-box puzzle already in the folder bank was not duplicated. Assumptions are stated, including initial lamp state, host policy and voting threshold.
- Linux internals and OS: exec image replacement, close-on-exec races, signal disposition/masks, mmap copy-on-write and SIGBUS, minor faults, edge-triggered/one-shot epoll, futex comparison/wakeup, short reads, EINTR, unlink lifetime and waitpid. Each has a direct Linux manual-page reference.
- C11 quizzes: sizeof side effects, array parameter adjustment, sequencing, unsigned wraparound, initialization, string terminators, array pointers, static state, macro precedence, dangling else and designated initializers. Four undefined-behavior examples explicitly have no expected output; they are never executed as answer validation. The snippets are original practice, not alleged recovered Qualcomm quizzes.
- Reported DSA: cycle length, kth-from-end, hash tables, tree left view, tree node distance, substring/word matching, linked stacks, BFS, tree deletion constraints, climbing-stairs DP, in-place word reversal and cycle removal.

Additional candidate accounts (unofficial; update date is not interview date):

- [Associate Software Engineer off-campus](https://www.geeksforgeeks.org/interview-experiences/qualcomm-interview-experience-for-associate-software-engineer-off-campus/): interview date unspecified; article updated July 2025.
- [Experienced Associate Software Engineer](https://www.geeksforgeeks.org/interview-experiences/qualcomm-interview-experience-set-8-experienced/): Hyderabad F2F January 7, 2017; article updated July 2025.
- [Off-campus referral](https://www.geeksforgeeks.org/interview-experiences/qualcomm-interview-experience-off-campus/): interview date unspecified; article updated July 2025.
- [Software Engineer / BITS Goa](https://www.geeksforgeeks.org/interview-experiences/qualcomm-interview-experience-for-software-engineer-role-on-campus-placements/): interview August 3, 2026; article updated August 22, 2026.

The 12 defined C programs are compiled in strict C11 mode and run at both -O0 and -O2 against their published answers. Compiler output is supporting evidence on this toolchain; the explanations distinguish language guarantees from undefined behavior.

Validation for this batch: all 17 test files and all 10 focused bank checks pass. All 24 defined-C executions match expected output. Production build, PWA cache generation and git diff whitespace check pass; the existing large-bundle warning remains. This batch changes data, tests and documentation; no new browser layout check was performed.

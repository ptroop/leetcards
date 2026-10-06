import { getLeetcodeProblemLesson } from './leetcodeProblemLessons.js';
import { questionById, questionCards } from './questionCards.js';
import { topicById } from './topics.js';

// Editorial selection informed by the linked public practice lists. No company or
// frequency claim is attached to an individual question.
const groups = [
  ['Counting and hashing', [
    'two-sum', 'contains-duplicate', 'valid-anagram', 'group-anagrams', 'longest-common-prefix',
    'isomorphic-strings', 'first-unique-character-in-a-string', 'longest-consecutive-sequence',
    'majority-element-ii',
  ]],
  ['Two pointers', [
    'valid-palindrome', '3sum', 'container-with-most-water', 'trapping-rain-water',
    'squares-of-a-sorted-array', 'sort-colors', 'move-zeroes', 'merge-sorted-array',
    'remove-duplicates-from-sorted-array',
  ]],
  ['Sliding windows', [
    'longest-substring-without-repeating-characters',
    'longest-repeating-character-replacement', 'minimum-window-substring',
    'number-of-substrings-containing-all-three-characters',
    'dsa-sliding', 'dsa-k-distinct', 'dsa-sliding-window-maximum',
  ]],
  ['Prefix sums and running state', [
    'product-of-array-except-self', 'find-pivot-index', 'contiguous-array',
    'dsa-prefix', 'subarray-sum-equals-k', 'best-time-to-buy-and-sell-stock',
    'max-consecutive-ones',
  ]],
  ['Maximum subarray', [
    'maximum-subarray', 'maximum-product-subarray',
  ]],
  ['Binary search', [
    'binary-search', 'search-insert-position', 'search-in-rotated-sorted-array',
    'find-first-and-last-position-of-element-in-sorted-array',
    'koko-eating-bananas', 'search-a-2d-matrix',
  ]],
  ['Stacks and monotonic structures', [
    'dsa-valid-parentheses', 'dsa-min-stack', 'dsa-next-greater-element',
    'daily-temperatures',
    'remove-k-digits', 'asteroid-collision', 'next-greater-element-ii',
  ]],
  ['Linked lists and fast/slow pointers', [
    'reverse-linked-list', 'merge-two-sorted-lists', 'linked-list-cycle',
    'linked-list-cycle-ii', 'middle-of-the-linked-list',
    'remove-nth-node-from-end-of-list', 'palindrome-linked-list',
    'add-two-numbers', 'intersection-of-two-linked-lists', 'sort-list', 'rotate-list',
  ]],
  ['Queues and circular buffers', [
    'implement-stack-using-queues', 'dsa-queue-using-stacks', 'dsa-circular-queue',
  ]],
  ['Heaps and selection', [
    'last-stone-weight', 'merge-k-sorted-lists', 'dsa-top-k', 'dsa-quickselect',
  ]],
  ['Sorting and intervals', [
    'dsa-sorting', 'next-permutation', 'merge-intervals',
  ]],
  ['Backtracking', [
    'dsa-subsets', 'dsa-permutations', 'dsa-combination-sum',
  ]],
  ['Greedy decisions', [
    'jump-game', 'best-time-to-buy-and-sell-stock-ii',
    'maximum-units-on-a-truck', 'task-scheduler',
  ]],
  ['Dynamic programming', [
    'climbing-stairs', 'min-cost-climbing-stairs', 'house-robber',
    'coin-change', 'best-time-to-buy-and-sell-stock-with-cooldown',
    'dsa-dp-grid', 'dsa-knapsack', 'dsa-coin-change-ways',
    'dsa-lis', 'dsa-lcs', 'dsa-edit-distance',
  ]],
  ['Bit manipulation', [
    'single-number', 'missing-number', 'counting-bits', 'number-of-1-bits',
    'reverse-bits', 'power-of-two', 'sum-of-two-integers',
  ]],
  ['Matrices', [
    'rotate-image', 'spiral-matrix', 'set-matrix-zeroes',
    'search-a-2d-matrix-ii',
  ]],
  ['Parsing and arithmetic', [
    'string-to-integer-atoi', 'roman-to-integer', 'plus-one',
    'palindrome-number', 'happy-number',
  ]],
  ['Basic BST', [
    'dsa-bst-search', 'dsa-bst-insert', 'validate-binary-search-tree',
    'delete-node-in-a-bst',
  ]],
];

const specificQuestions = {
  'dsa-sliding': ['Maximum Average Subarray I', 'Find the maximum average of any contiguous window of fixed length k.'],
  'dsa-k-distinct': ['Subarrays with K Different Integers', 'Count contiguous subarrays containing exactly k distinct values.'],
  'dsa-sliding-window-maximum': ['Sliding Window Maximum', 'Report the maximum value in every fixed-width window.'],
  'dsa-prefix': ['Range Sum Query', 'Answer repeated sums of inclusive ranges after one preprocessing pass.'],
  'dsa-valid-parentheses': ['Valid Parentheses', 'Check whether opening and closing brackets form a properly nested sequence.'],
  'dsa-min-stack': ['Min Stack', 'Implement a stack that also returns its current minimum in constant time.'],
  'dsa-next-greater-element': ['Next Greater Element', 'For each value, locate the first larger value to its right.'],
  'dsa-queue-using-stacks': ['Implement Queue using Stacks', 'Implement FIFO enqueue and dequeue with two LIFO stacks.'],
  'dsa-circular-queue': ['Design Circular Queue', 'Implement bounded enqueue and dequeue with wraparound indexes.'],
  'dsa-top-k': ['Top K Frequent Elements', 'Return the k values that occur most often.'],
  'dsa-quickselect': ['Kth Largest Element in an Array', 'Return the kth largest value without fully sorting the array.'],
  'dsa-intervals': ['Merge Intervals', 'Coalesce every pair of overlapping input intervals.'],
  'dsa-sorting': ['Sort an Array', 'Order values using comparison sorting and explain its cost.'],
  'dsa-subsets': ['Subsets', 'Enumerate every subset of the given distinct values.'],
  'dsa-permutations': ['Permutations', 'Enumerate every ordering of the given distinct values.'],
  'dsa-combination-sum': ['Combination Sum', 'Find combinations of reusable candidates that total the target.'],
  'dsa-dp-grid': ['Unique Paths', 'Count paths through a rectangular grid using right and down moves.'],
  'dsa-knapsack': ['Partition Equal Subset Sum', 'Determine whether some subset totals half the array sum.'],
  'dsa-coin-change-ways': ['Coin Change II', 'Count unordered combinations of reusable coins that make the amount.'],
  'dsa-lis': ['Longest Increasing Subsequence', 'Find the maximum length of a strictly increasing subsequence.'],
  'dsa-lcs': ['Longest Common Subsequence', 'Find the maximum length of a subsequence shared by two strings.'],
  'dsa-edit-distance': ['Edit Distance', 'Find the minimum insertions, deletions, and substitutions between two strings.'],
  'dsa-bst-search': ['Search in a Binary Search Tree', 'Find a key by following the BST ordering rule.'],
  'dsa-bst-insert': ['Insert into a Binary Search Tree', 'Place a new key while preserving BST ordering.'],
};

const resolve = (id) => {
  const problem = getLeetcodeProblemLesson(id);
  if (problem) return {
    id, title: problem.title, summary: problem.problem,
    insight: problem.keyObservation, destination: 'problem',
    slug: id, pattern: problem.pattern.name,
  };
  const question = questionById.get(id)
    ?? questionCards.find((card) => card.aliases.includes(id));
  if (question) return {
    id, title: specificQuestions[id]?.[0] ?? question.title,
    summary: specificQuestions[id]?.[1] ?? question.summary,
    insight: question.move, destination: 'question',
    questionId: question.id, pattern: question.teachingPattern.name,
  };
  const topic = topicById.get(id);
  if (topic?.sectionId === 'dsa') return {
    id, title: specificQuestions[id]?.[0] ?? topic.title,
    summary: specificQuestions[id]?.[1] ?? topic.keywords.join(' · '),
    insight: null, destination: 'lesson', topicId: id,
    pattern: 'Technique lesson',
  };
  throw new Error(`Common interview question has no authored lesson: ${id}`);
};

export const commonInterviewGroups = groups.map(([name, ids]) => ({
  name,
  questions: ids.map(resolve),
}));

export const commonInterviewSources = [
  { title: 'Striver 75 (India)', url: 'https://takeuforward.org/prep-hub/strivers-75-sheet' },
  { title: 'Striver A2Z', url: 'https://takeuforward.org/prep-hub/strivers-a2z-dsa-sheet' },
  { title: 'Striver 150', url: 'https://takeuforward.org/prep-hub/strivers-150-master-patterns-in-dsa' },
  { title: 'NeetCode 150', url: 'https://neetcode.io/practice/practice/neetcode150' },
  { title: 'Grind 75', url: 'https://www.techinterviewhandbook.org/grind75/?grouping=topics&mode=all' },
  { title: 'LeetCode Top Interview 150', url: 'https://leetcode.com/studyplan/top-interview-150/' },
  { title: 'AlgoMonster 50', url: 'https://algo.monster/practice' },
];

// Community discussions inform practice method, not question frequency.
export const commonInterviewCommunityReading = [
  { title: 'Pattern recognition without a category label', url: 'https://www.reddit.com/r/leetcode/comments/1w2axhp/am_i_stupid_how_could_nc_150_or_blind_75_be_enough/' },
  { title: 'Choosing a structured problem set', url: 'https://www.reddit.com/r/leetcode/comments/1nlr72w/whats_the_best_leetcode_problem_set_for_interview/' },
];

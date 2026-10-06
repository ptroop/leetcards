import { patternFor } from './problemTeachingPatterns.js';

const exactPattern = {
  'dsa-complexity': 'running-state',
  'dsa-matrix': 'matrix',
  'dsa-linked': 'linked-list',
  'dsa-stack-queue': 'stack',
  'dsa-hash': 'counting',
  'dsa-heap': 'heap',
  'dsa-binary-tree': 'tree',
  'dsa-bst': 'bst',
  'dsa-avl': 'bst',
  'dsa-red-black': 'bst',
  'dsa-sorting': 'simulation',
  'dsa-search': 'binary',
  'dsa-two-pointers': 'two-pointers',
  'dsa-sliding': 'window',
  'dsa-fast-slow': 'fast-slow',
  'dsa-prefix': 'prefix',
  'dsa-difference': 'prefix',
  'dsa-intervals': 'greedy',
  'dsa-monotonic': 'stack',
  'dsa-recursion': 'backtracking',
  'dsa-divide': 'recursion',
  'dsa-greedy': 'greedy',
  'dsa-dp': 'dp',
  'dsa-bitwise': 'bits',
  'dsa-sequence-terms': 'simulation',
  'dsa-frequency-anagram': 'counting',
  'dsa-palindrome': 'two-pointers',
  'dsa-longest-substring': 'window',
  'dsa-k-distinct': 'window',
  'dsa-kadane': 'kadane',
  'dsa-longest-consecutive': 'counting',
  'dsa-cyclic-placement': 'running-state',
  'dsa-top-k': 'heap',
  'dsa-quickselect': 'running-state',
  'dsa-k-way-merge': 'heap',
  'dsa-subsets': 'backtracking',
  'dsa-permutations': 'backtracking',
  'dsa-combination-sum': 'backtracking',
  'dsa-dp-take-skip': 'dp',
  'dsa-dp-grid': 'dp',
  'dsa-knapsack': 'dp',
  'dsa-coin-change-min': 'dp',
  'dsa-coin-change-ways': 'dp',
  'dsa-lis': 'dp',
  'dsa-lcs': 'dp',
  'dsa-edit-distance': 'dp',
  'dsa-dp-compression': 'dp',
};

const prefixPattern = [
  [/^dsa-(sll|dll|circular-linked|merge-two|remove-nth|partition-list|reorder-list|palindrome-list|add-two-numbers)/, 'linked-list'],
  [/^dsa-(middle|nth-from-end|linked-list-cycle|sll-cycle)/, 'fast-slow'],
  [/^dsa-(valid-parentheses|infix|postfix|prefix-expression|next-greater|stock-span|daily-temperatures|min-stack)/, 'stack'],
  [/^dsa-(queue|circular-queue|sliding-window-maximum)/, 'stack'],
  [/^dsa-(tree|symmetric|same-tree|invert-tree|level-order|diameter|balanced-tree|path-sum|lowest-common)/, 'tree'],
  [/^dsa-(bst|validate-bst|kth-smallest|sorted-array-to-bst)/, 'bst'],
  [/^dsa-(binary-search|search-rotated|first-last|search-insert)/, 'binary'],
  [/^dsa-(matrix|spiral|rotate-image|set-matrix|search-2d)/, 'matrix'],
  [/^dsa-(heap|top-k|kth-largest|merge-k)/, 'heap'],
  [/^dsa-(two-sum-sorted|container-water|three-sum|remove-duplicates)/, 'two-pointers'],
  [/^dsa-(substring|minimum-window|permutation-in-string|fixed-window)/, 'window'],
  [/^dsa-(prefix-sum|subarray-sum|range-sum)/, 'prefix'],
  [/^dsa-(bit|single-number|counting-bits|reverse-bits|power-of-two)/, 'bits'],
  [/^dsa-(backtrack|subsets|permutations|combination)/, 'backtracking'],
  [/^dsa-(dp|coin|knapsack|house-robber|climbing|lis|lcs|edit-distance)/, 'dp'],
];

export const patternIdForTopic = (topicId) => {
  if (exactPattern[topicId]) return exactPattern[topicId];
  return prefixPattern.find(([matcher]) => matcher.test(topicId))?.[1] ?? 'simulation';
};

export const patternGuideForTopic = (topicId) => {
  const id = patternIdForTopic(topicId);
  const guide = patternFor(id);
  return {
    id,
    name: guide.name,
    definition: guide.definition,
    recognition: guide.recognition,
    invariant: guide.invariant,
    method: guide.method,
    correctness: guide.correctness,
    pitfalls: guide.pitfalls,
  };
};

import { problemFamilyVisuals } from './dsaProblemFamilies.js';
import { focusedDsaVisuals } from './dsaFocusedSubtopics.js';

const frame = (caption, values, markers = [], active = [], teaching = {}) => ({
  caption,
  values,
  markers,
  active,
  ...teaching,
});

const baseDsaVisuals = {
  'dsa-complexity': {
    kind: 'timeline',
    frames: [
      frame('One push can trigger an expensive resize, so a single operation is not the whole story.', ['capacity 4', 'size 4', 'push → copy 4'], ['cost=5'], ['push → copy 4']),
      frame('Charge earlier cheap pushes one saved credit each.', ['push 1', 'push 2', 'push 3', 'push 4'], ['four credits'], ['push 1', 'push 2', 'push 3', 'push 4']),
      frame('Across many pushes, total copying stays proportional to the number of inserted items.', ['n pushes', 'fewer than 2n copies'], ['amortized O(1)'], ['fewer than 2n copies']),
    ],
  },
  'dsa-matrix': {
    kind: 'grid',
    frames: [
      frame('Start at row 0, column 0; the linear offset is row × width + column.', [['A', 'B', 'C'], ['D', 'E', 'F']], ['r=0', 'c=0'], ['0:0']),
      frame('Moving right changes the offset by one, so adjacent elements share nearby memory.', [['A', 'B', 'C'], ['D', 'E', 'F']], ['r=0', 'c=1'], ['0:1']),
      frame('Moving to the next row advances by the full row stride.', [['A', 'B', 'C'], ['D', 'E', 'F']], ['r=1', 'c=0'], ['1:0']),
    ],
  },
  'dsa-linked': {
    kind: 'linked-list',
    frames: [
      frame('Before reversal, prev is null and current points at node A.', ['A→B', 'B→C', 'C→∅'], ['prev=∅', 'cur=A'], ['A→B']),
      frame('Save A.next, reverse A.next toward prev, then advance both pointers.', ['A→∅', 'B→C', 'C→∅'], ['prev=A', 'cur=B'], ['A→∅']),
      frame('Repeating the same local rewrite produces the fully reversed chain.', ['C→B', 'B→A', 'A→∅'], ['prev=C', 'cur=∅'], ['C→B', 'B→A']),
    ],
  },
  'dsa-stack-queue': {
    kind: 'stack-queue',
    frames: [
      frame('A stack removes from the same end where it inserts.', ['bottom', 'A', 'B', 'top'], ['push C'], ['top']),
      frame('After push, C becomes the only legal pop target.', ['bottom', 'A', 'B', 'C', 'top'], ['pop→C'], ['C']),
      frame('A circular queue advances head and tail modulo capacity.', ['D', 'E', '·', 'B', 'C'], ['head=3', 'tail=2'], ['B', 'C', 'D', 'E']),
    ],
  },
  'dsa-hash': {
    kind: 'buckets',
    frames: [
      frame('The hash compresses a key into a bucket index.', ['0:·', '1:cat', '2:·', '3:·'], ['h(cat)=1'], ['1:cat']),
      frame('A collision means two keys choose the same bucket; the key must still be compared.', ['0:·', '1:cat→act', '2:·', '3:·'], ['h(act)=1'], ['1:cat→act']),
      frame('Resizing redistributes entries because the bucket count changed.', ['0:act', '1:cat', '2:·', '3:·', '4:·', '5:·', '6:·', '7:·'], ['capacity=8'], ['0:act', '1:cat']),
    ],
  },
  'dsa-heap': {
    kind: 'tree',
    frames: [
      frame('Insert 3 at the next complete-tree position.', ['2', '5', '4', '9', '7', '3'], ['new=3'], ['3']),
      frame('Compare with its parent; 3 is smaller than 4, so swap.', ['2', '5', '3', '9', '7', '4'], ['sift up'], ['3', '4']),
      frame('The root remains the minimum and the complete-tree shape is preserved.', ['2', '5', '3', '9', '7', '4'], ['min=2'], ['2']),
    ],
  },
  'dsa-binary-tree': {
    kind: 'tree',
    frames: [
      frame('Preorder records the node before exploring either subtree.', ['A', 'B', 'C', 'D', 'E'], ['visit A'], ['A']),
      frame('The left subtree is completed before the right subtree begins.', ['A', 'B', 'C', 'D', 'E'], ['A→B→D→E'], ['B', 'D', 'E']),
      frame('Traversal state is the current node plus the suspended return path.', ['A', 'B', 'C', 'D', 'E'], ['next C'], ['C']),
    ],
  },
  'dsa-bst': {
    kind: 'tree',
    frames: [
      frame('Compare 6 with root 8; smaller keys can only be in the left subtree.', ['8', '3', '10', '1', '6'], ['target=6'], ['8']),
      frame('Compare with 3; 6 is larger, so move right.', ['8', '3', '10', '1', '6'], ['target=6'], ['3']),
      frame('The ordering invariant leads directly to 6 without scanning unrelated nodes.', ['8', '3', '10', '1', '6'], ['found'], ['6']),
    ],
  },
  'dsa-avl': {
    kind: 'tree',
    frames: [
      frame('Inserting 3 makes node 5 left-heavy by two levels.', ['5', '4', null, '3'], ['balance(5)=+2'], ['5', '4', '3']),
      frame('A right rotation promotes 4 and moves its right subtree.', ['4', '3', '5'], ['rotate right'], ['4']),
      frame('The search ordering remains unchanged while heights become balanced.', ['4', '3', '5'], ['balances=0'], ['3', '4', '5']),
    ],
  },
  'dsa-red-black': {
    kind: 'tree',
    frames: [
      frame('A new red node can create a red-red edge with its parent.', ['10B', '5R', null, '1R'], ['violation'], ['5R', '1R']),
      frame('Rotation repairs the local shape; recoloring repairs black-height.', ['5B', '1R', '10R'], ['rotate + recolor'], ['5B']),
      frame('Every root-to-leaf path again carries the same number of black nodes.', ['5B', '1R', '10R'], ['black height=1'], ['5B']),
    ],
  },
  'dsa-sorting': {
    kind: 'array',
    frames: [
      frame('Insertion sort takes one value and shifts the larger sorted prefix before inserting it.', [2, 4, 7, 3, 6], ['sorted prefix', 'key=3'], [3, 4, 7]),
      frame('Selection sort finds the minimum of the unsorted suffix and fixes one final position.', [2, 7, 6, 4, 3], ['min=2', 'position 0 fixed'], [2]),
      frame('Merge sort combines two already-sorted halves by taking the smaller front value.', [2, 5, 7, 3, 4, 6], ['merge [2,5,7] + [3,4,6]'], [2, 3]),
      frame('Quicksort partitions values so the pivot reaches its final position before the sides recurse.', [2, 3, 5, 7, 6], ['pivot=5', 'pivot fixed'], [5]),
      frame('Heap sort removes the root extreme into the final suffix, then repairs the smaller heap.', [6, 4, 5, 2, 3, 7], ['heap size=5', '7 fixed'], [6, 7]),
    ],
  },
  'dsa-search': {
    kind: 'pointer-array',
    frames: [
      frame('The closed interval [0,5] contains every position where 9 could still be.', [1, 3, 5, 7, 9, 12], ['L=0', 'M=2', 'R=5', 'target=9'], [5], { phase: 'Model', decision: 'Define the candidate interval before comparing anything.', reason: 'The entire sorted array is initially possible, so the invariant holds.', question: 'What does [L,R] promise to contain?', codeLine: 'while (left <= right)' }),
      frame('Read the middle value 5 at index 2.', [1, 3, 5, 7, 9, 12], ['L=0', 'M=2', 'R=5', 'a[M]=5'], [5], { phase: 'Compare', decision: 'Compare a[mid] with the target.', reason: 'One comparison is enough because sorted order describes every value on each side.', question: 'Can index 2 or anything left of it still contain 9?', codeLine: 'mid = left + (right - left) / 2;' }),
      frame('Because 5 < 9, indexes 0 through 2 are impossible.', [1, 3, 5, 7, 9, 12], ['L=3', 'M=4', 'R=5'], [7, 9, 12], { phase: 'Discard', decision: 'Move left to mid + 1.', reason: 'Every discarded value is at most 5, so none can equal 9.', question: 'Which whole half has been disproved?', codeLine: 'left = mid + 1;' }),
      frame('The new middle is 9 at index 4.', [1, 3, 5, 7, 9, 12], ['L=3', 'M=4', 'R=5', 'a[M]=9'], [9], { phase: 'Compare', decision: 'The comparison matches; index 4 is the answer.', reason: 'Equality satisfies the search contract immediately.', question: 'If this asked for the first 9, would equality be enough?', codeLine: 'if (a[mid] == target) return mid;' }),
      frame('Binary search returns index 4; every excluded index was disproved by sorted order.', [1, 3, 5, 7, 9, 12], ['answer=4', 'cost=O(log n)'], [9], { phase: 'Prove', decision: 'Return the located index.', reason: 'The candidate interval shrank on every non-matching step and never discarded a valid answer.', result: 'Index 4 is correct. Each comparison halves the remaining interval, so the cost is O(log n).' }),
    ],
  },
  'dsa-two-pointers': {
    kind: 'pointer-array',
    frames: [
      frame('Place one pointer at each end of the sorted array; target is 9.', [1, 2, 4, 7, 11], ['L=0', 'R=4', 'target=9'], [1, 11], { phase: 'Model', decision: 'Start with the smallest and largest remaining values.', reason: 'Every possible pair lies inside these two boundaries.', question: 'If their sum is too large, which pointer can safely move?', codeLine: 'left = 0; right = n - 1;' }),
      frame('The current sum is 12, which is too large.', [1, 2, 4, 7, 11], ['L=0', 'R=4', 'sum=12'], [1, 11], { phase: 'Compare', decision: 'Reject pairs that use 11.', reason: 'Pairing 11 with the smallest available value already overshoots 9; every larger left value also overshoots.', question: 'Why would moving left be useless here?', codeLine: 'sum = a[left] + a[right];' }),
      frame('Move right from 11 to 7; the new sum is 8.', [1, 2, 4, 7, 11], ['L=0', 'R=3', 'sum=8'], [1, 7], { phase: 'Discard', decision: 'Decrease right because the previous sum was too large.', reason: 'Sorted order proves the removed right endpoint cannot participate in any valid remaining pair.', question: 'The sum is now too small. Which pointer can increase it?', codeLine: 'if (sum > target) right--;' }),
      frame('Move left from 1 to 2; the new sum is exactly 9.', [1, 2, 4, 7, 11], ['L=1', 'R=3', 'sum=9'], [2, 7], { phase: 'Update', decision: 'Increase left because 8 was too small.', reason: 'Keeping 1 and moving right inward would only make the sum smaller.', question: 'Which indexes form the answer?', codeLine: 'else if (sum < target) left++;' }),
      frame('Two pointers return indexes 1 and 3: values 2 and 7.', [1, 2, 4, 7, 11], ['L=1', 'R=3', 'answer=[1,3]', 'cost=O(n)'], [2, 7], { phase: 'Prove', decision: 'Return the matching pair.', reason: 'Every pointer move eliminated an entire impossible family, so no discarded pair could equal the target.', result: 'The answer is [1,3]. Each pointer moves inward at most n times, so the scan is O(n).' }),
    ],
  },
  'dsa-sliding': {
    kind: 'window',
    frames: [
      frame('Grow the right edge through a, b, c; the window is unique.', ['a', 'b', 'c', 'a', 'd'], ['L=0', 'R=2', 'unique=3', 'best=3'], ['a', 'b', 'c'], { phase: 'Grow', decision: 'Include c and update the best length to 3.', reason: 'The frequency of every character in [L,R] is one, so the uniqueness invariant holds.', question: 'What must happen when the next a enters?', codeLine: 'count[s[right]]++;' }),
      frame('Add the a at index 3; the window now contains two a characters.', ['a', 'b', 'c', 'a', 'd'], ['L=0', 'R=3', 'count(a)=2'], ['a', 'b', 'c', 'a'], { phase: 'Violate', decision: 'Mark the window invalid before updating the answer.', reason: 'A variable window may temporarily violate its rule; it must repair before measuring.', question: 'How far must left move—not farther?', codeLine: 'while (count[s[right]] > 1) {' }),
      frame('Remove the left a; [b,c,a] is valid again.', ['a', 'b', 'c', 'a', 'd'], ['L=1', 'R=3', 'unique=3', 'best=3'], ['b', 'c', 'a'], { phase: 'Repair', decision: 'Advance left once and decrement the leaving character.', reason: 'Removing index 0 deletes the only duplicate. Further shrinking would throw away a valid candidate for no reason.', question: 'Can the next d extend this repaired window?', codeLine: 'count[s[left++]]--;' }),
      frame('Add d; [b,c,a,d] is unique and becomes the new best.', ['a', 'b', 'c', 'a', 'd'], ['L=1', 'R=4', 'unique=4', 'best=4'], ['b', 'c', 'a', 'd'], { phase: 'Measure', decision: 'Update best after the invariant has been restored.', reason: 'Every substring ending at R and starting at or after L is valid; [L,R] is the longest of them.', question: 'Why is best updated after repair rather than before it?', codeLine: 'best = max(best, right - left + 1);' }),
      frame('The final longest unique window has length 4: b c a d.', ['a', 'b', 'c', 'a', 'd'], ['L=1', 'R=4', 'answer=4', 'cost=O(n)'], ['b', 'c', 'a', 'd'], { phase: 'Prove', decision: 'Return best = 4.', reason: 'Right enters each index once and left removes each index at most once; all valid ending positions were measured.', result: 'The answer is 4. Two monotone boundaries make the total work O(n), not O(n²).' }),
    ],
  },
  'dsa-fast-slow': {
    kind: 'linked-list',
    frames: [
      frame('Slow and fast both start at A in the chain A→B→C→D→B.', ['A→B', 'B→C', 'C→D', 'D→B'], ['slow=A', 'fast=A'], ['A→B'], { phase: 'Model', decision: 'Start two references at the head.', reason: 'A cycle is detected by relative motion, so no visited-address table is required.', question: 'What must be checked before moving fast twice?', codeLine: 'slow = fast = head;' }),
      frame('Slow moves to B while fast moves to C.', ['A→B', 'B→C', 'C→D', 'D→B'], ['slow=B', 'fast=C'], ['B→C', 'C→D'], { phase: 'Advance', decision: 'Move slow one edge and fast two.', reason: 'If the list is acyclic, fast reaches null; inside a cycle, fast gains one node on slow each round.', question: 'Where will each pointer move next?', codeLine: 'slow = slow->next; fast = fast->next->next;' }),
      frame('Slow moves to C while fast wraps from C through B to C.', ['A→B', 'B→C', 'C→D', 'D→B'], ['slow=C', 'fast=C'], ['C→D', 'D→B'], { phase: 'Meet', decision: 'Detect that both references name the same node.', reason: 'An acyclic list cannot revisit a node; a collision is possible only after both pointers enter a cycle.', question: 'What exactly does a collision prove—and what does it not yet prove?', codeLine: 'if (slow == fast) break;' }),
      frame('Reset one pointer to A; move both one edge at a time.', ['A→B', 'B→C', 'C→D', 'D→B'], ['entry=A', 'meet=C'], ['A→B', 'C→D'], { phase: 'Locate', decision: 'Convert the collision into a cycle-entry search.', reason: 'The distance from head to entry equals the remaining collision-to-entry distance modulo the cycle length.', question: 'Where will one-step motion make them meet?', codeLine: 'slow = head;' }),
      frame('Both pointers meet at B, so B is the cycle entry and a cycle is proved.', ['A→B', 'B→C', 'C→D', 'D→B'], ['slow=B', 'fast=B', 'answer=B'], ['B→C'], { phase: 'Prove', decision: 'Return node B.', reason: 'Equal-speed motion preserves the distance equation until both references reach the entry.', result: 'A cycle exists and starts at B. The algorithm uses O(n) time and O(1) extra space.' }),
    ],
  },
  'dsa-prefix': {
    kind: 'array',
    frames: [
      frame('Create prefix[0]=0 before consuming input [3,1,4,2].', [0, '·', '·', '·', '·'], ['prefix[0]=0'], [0], { phase: 'Define', decision: 'Use an exclusive prefix: prefix[i] sums the first i values.', reason: 'The leading zero makes ranges starting at index 0 use the same subtraction formula.', question: 'What should prefix[1] store?', codeLine: 'prefix[0] = 0;' }),
      frame('Add 3, then 1; prefix becomes [0,3,4,…].', [0, 3, 4, '·', '·'], ['input[0]=3', 'input[1]=1'], [3, 4], { phase: 'Build', decision: 'Accumulate each value exactly once.', reason: 'prefix[i+1] now equals input[0] through input[i].', question: 'Which previous cell does prefix[3] need?', codeLine: 'prefix[i + 1] = prefix[i] + a[i];' }),
      frame('Finish the table: [0,3,4,8,10].', [0, 3, 4, 8, 10], ['input=[3,1,4,2]'], [8, 10], { phase: 'Build', decision: 'Store all prefix boundaries.', reason: 'Every table cell has the same meaning, independent of the later queries.', question: 'For range [1,2], which two boundaries surround it?', codeLine: 'prefix[i + 1] = prefix[i] + a[i];' }),
      frame('Subtract prefix[1] from prefix[3]: 8−3=5.', [0, 3, 4, 8, 10], ['L=1', 'R=2', '8−3=5'], [3, 8], { phase: 'Cancel', decision: 'Use the boundary after R minus the boundary at L.', reason: 'Both prefixes contain indexes before L; subtraction cancels them and leaves exactly indexes L through R.', question: 'Why is the right boundary R+1?', codeLine: 'sum = prefix[right + 1] - prefix[left];' }),
      frame('The range-sum answer is 5, obtained in O(1) after O(n) preprocessing.', [0, 3, 4, 8, 10], ['answer=5', 'query=O(1)'], [3, 8], { phase: 'Prove', decision: 'Return 5.', reason: 'The two boundaries cancel every value outside [1,2] and retain 1+4.', result: 'The answer is 5. Prefix sums trade O(n) one-time work for O(1) range queries.' }),
    ],
  },
  'dsa-difference': {
    kind: 'array',
    frames: [
      frame('A range update adds at the start boundary and subtracts after the end.', [0, 0, 0, 0, 0], ['add 3 to [1,3]'], []),
      frame('Only two difference cells change.', [0, 3, 0, 0, -3], ['diff[1]+=3', 'diff[4]−=3'], [3, -3]),
      frame('A prefix sum materializes the final values once all updates are recorded.', [0, 3, 3, 3, 0], ['accumulate'], [3, 3, 3]),
    ],
  },
  'dsa-intervals': {
    kind: 'timeline',
    frames: [
      frame('Sort intervals by start so unseen intervals cannot begin earlier.', ['[1,4]', '[3,6]', '[8,9]'], ['current=[1,4]'], ['[1,4]']),
      frame('Because 3 ≤ 4, the next interval overlaps and extends the current end.', ['[1,6]', '[8,9]'], ['merge'], ['[1,6]']),
      frame('A gap closes the current interval and starts a new one.', ['[1,6]', '[8,9]'], ['emit [1,6]'], ['[8,9]']),
    ],
  },
  'dsa-monotonic': {
    kind: 'stack-queue',
    frames: [
      frame('Push index 0 for value 6; it has no next-greater answer yet.', [6], ['i=0', 'stack=[0]'], [6], { phase: 'Model', decision: 'Store the unresolved index, not only its value.', reason: 'The answer must be written back to index 0 later.', question: 'When value 4 arrives, can it resolve 6?', codeLine: 'stack[top++] = i;' }),
      frame('Value 4 is smaller than stack top 6, so push index 1.', [6, 4], ['i=1', 'stack=[0,1]', 'values=6>4'], [6, 4], { phase: 'Preserve', decision: 'Keep both indexes unresolved in decreasing-value order.', reason: 'Four is not greater than six, so neither item has found its first greater value.', question: 'What will value 5 resolve?', codeLine: 'while (top && a[stack[top-1]] < a[i])' }),
      frame('Value 5 pops index 1; nextGreater[1]=5.', [6, 4, 5], ['i=2', 'answer[1]=5', 'stack=[0,2]'], [4, 5], { phase: 'Resolve', decision: 'Pop 4, write its answer, then push index 2.', reason: 'Five is the first later greater value seen by 4. Six remains unresolved because 5 is smaller.', question: 'Why can index 1 never need to return?', codeLine: 'answer[stack[--top]] = a[i];' }),
      frame('Value 8 pops 5 and then 6; both receive 8.', [6, 4, 5, 8], ['i=3', 'answer[2]=8', 'answer[0]=8'], [6, 5, 8], { phase: 'Resolve', decision: 'Keep popping while the top value is smaller than 8.', reason: 'The nearest unresolved items are on top; 8 is their first greater value because earlier arrivals failed to pop them.', question: 'What remains on the stack after 8 is pushed?', codeLine: 'while (top && a[stack[top-1]] < a[i])' }),
      frame('The final answers are [8,5,8,−1]; index 3 stays unresolved.', [8, 5, 8, -1], ['answer complete', 'each index push/pop once'], [8, 5, 8], { phase: 'Prove', decision: 'Assign −1 to the leftover index.', reason: 'Every index is pushed once and popped at most once; unresolved leftovers have no greater value to their right.', result: 'The answers are [8,5,8,−1]. The total cost is O(n), despite the nested-looking while loop.' }),
    ],
  },
  'dsa-recursion': {
    kind: 'recursion-tree',
    frames: [
      frame('Choose A and record that choice in the current path.', ['∅', 'A', 'B', 'AB'], ['path=[A]'], ['A']),
      frame('Explore descendants while the choice remains active.', ['∅', 'A', 'B', 'AB'], ['path=[A,B]'], ['A', 'AB']),
      frame('Undo B before exploring the sibling branch; shared state is restored.', ['∅', 'A', 'B', 'AB'], ['pop B', 'path=[A]'], ['A']),
    ],
  },
  'dsa-divide': {
    kind: 'recursion-tree',
    frames: [
      frame('Split one eight-item range into two independent halves.', ['[0..7]', '[0..3]', '[4..7]'], ['divide'], ['[0..7]']),
      frame('Continue until each leaf is small enough to solve directly.', ['[0..1]', '[2..3]', '[4..5]', '[6..7]'], ['base cases'], ['[0..1]', '[2..3]', '[4..5]', '[6..7]']),
      frame('Combine correct children level by level into the final answer.', ['2-item results', '4-item results', '8-item result'], ['combine upward'], ['8-item result']),
    ],
  },
  'dsa-greedy': {
    kind: 'timeline',
    frames: [
      frame('Sort intervals by finishing time so the earliest safe completion is visible.', ['A[1,3]', 'B[2,5]', 'C[4,6]'], ['choose A'], ['A[1,3]']),
      frame('Discard B because it overlaps the chosen interval.', ['A chosen', 'B rejected', 'C candidate'], ['last end=3'], ['B rejected']),
      frame('Choose C; an exchange proof shows an optimal schedule can begin with A.', ['A', 'C'], ['safe local choice'], ['A', 'C']),
    ],
  },
  'dsa-dp': {
    kind: 'dp-grid',
    frames: [
      frame('Define dp[i] as the number of ways to reach stair i using jumps of 1 or 2.', [1, '·', '·', '·', '·'], ['dp[0]=1', 'one empty way'], [1], { phase: 'Define', decision: 'Give one table cell an exact sentence meaning.', reason: 'A recurrence is only correct relative to a precise state definition.', question: 'Which earlier states can be the final jump into stair 1?', codeLine: 'dp[0] = 1;' }),
      frame('Stair 1 has one predecessor, so dp[1]=1.', [1, 1, '·', '·', '·'], ['from stair 0'], [1], { phase: 'Base', decision: 'Fill the smallest state directly.', reason: 'Only one 1-step jump reaches stair 1.', question: 'What are the exhaustive final jumps into stair 2?', codeLine: 'dp[1] = 1;' }),
      frame('Stair 2 can follow stair 1 or stair 0, so dp[2]=2.', [1, 1, 2, '·', '·'], ['dp[2]=dp[1]+dp[0]'], [1, 1, 2], { phase: 'Transition', decision: 'Partition solutions by their final jump.', reason: 'Every route to stair 2 ends with exactly one of those two jumps, and the groups do not overlap.', question: 'Which dependencies must be final before computing dp[3]?', codeLine: 'dp[i] = dp[i - 1] + dp[i - 2];' }),
      frame('Compute left to right: dp[3]=3 and dp[4]=5.', [1, 1, 2, 3, 5], ['dependency direction →'], [2, 3, 5], { phase: 'Order', decision: 'Evaluate only after both dependencies exist.', reason: 'The recurrence reads smaller indexes, so increasing i is a valid topological order.', question: 'Can the table be compressed safely?', codeLine: 'for (i = 2; i <= n; ++i)' }),
      frame('The final result dp[4]=5; only the previous two states are needed.', [1, 1, 2, 3, 5], ['answer=5', 'space can be O(1)'], [5], { phase: 'Prove', decision: 'Return dp[4] and optionally compress storage.', reason: 'Induction covers every state: bases are correct, and the recurrence partitions every route by its final jump.', result: 'The answer is 5. Time is O(n); space is O(n), or O(1) after dependency analysis.' }),
    ],
  },
  'dsa-bitwise': {
    kind: 'array',
    frames: [
      frame('Each bit position names one independent boolean flag.', ['b3', 'b2', 'b1', 'b0'], ['mask=0101'], ['b2', 'b0']),
      frame('OR with 0010 sets bit 1 without changing the others.', ['0', '1', '1', '1'], ['0101 | 0010'], ['b1']),
      frame('AND with a one-bit mask tests membership without modifying the value.', ['0', '1', '1', '1'], ['0111 & 0100 ≠ 0'], ['b2']),
    ],
  },
};

const markerNumber = (markers, name) => {
  const match = markers?.join(' ').match(new RegExp(`${name}=(\\d+)`, 'i'));
  return match ? Number(match[1]) : null;
};

const authoredFrameTeaching = {
  'dsa-two-pointers': [
    { phase: 'Model', decision: 'Place pointers at the smallest and largest candidates.', question: 'If the sum is too large, which endpoint can be eliminated?', reason: 'Sorted order lets one comparison describe whole families of pairs.', codeLine: 'left = 0; right = n - 1;' },
    { phase: 'Compare', decision: 'Compare 12 with target 9.', question: 'Why is moving left unable to help?', reason: 'Increasing the left value while keeping 11 can only increase an already-too-large sum.', codeLine: 'sum = a[left] + a[right];' },
    { phase: 'Discard', decision: 'Move right from 11 to 7.', question: 'Which pairs disappeared with 11?', reason: 'Even the smallest partner made 11 overshoot, so every remaining partner with 11 is impossible.', codeLine: 'if (sum > target) right--;' },
    { phase: 'Compare', decision: 'Compare 8 with target 9.', question: 'Why is moving right unable to help now?', reason: 'Moving right inward would choose a smaller value and reduce an already-too-small sum.', codeLine: 'sum = a[left] + a[right];' },
    { phase: 'Discard', decision: 'Move left from 1 to 2.', question: 'What is the new candidate sum?', reason: 'Every remaining pair that uses 1 is too small, so removing 1 cannot remove an answer.', codeLine: 'else if (sum < target) left++;' },
    { phase: 'Prove', decision: 'Return values 2 and 7.', reason: 'Every discarded endpoint was disproved for all possible partners still inside the interval.', result: 'The final answer is 2 + 7 = 9. Each pointer moves at most n positions, so time is O(n).' },
  ],
  'dsa-sliding': [
    { phase: 'Model', decision: 'Build the first complete width-three window.', question: 'What does the running sum represent?', reason: 'It equals exactly the values between left and right; no outside value is included.', codeLine: 'sum = a[0] + a[1] + a[2];' },
    { phase: 'Measure', decision: 'Record 8 as the best complete window so far.', question: 'Which value must leave when the window moves?', reason: 'Only complete windows of width three are valid candidates.', codeLine: 'best = sum;' },
    { phase: 'Slide', decision: 'Subtract outgoing 2 and add incoming 1.', question: 'Why not recompute all three values?', reason: 'The old and new windows overlap in two positions; only one contribution leaves and one enters.', codeLine: 'sum += a[right] - a[right - width];' },
    { phase: 'Slide', decision: 'Subtract outgoing 1 and add incoming 3 to obtain 9.', question: 'Does this window beat the current best?', reason: 'The same O(1) update preserves the exact-sum invariant.', codeLine: 'sum += a[right] - a[right - width];' },
    { phase: 'Measure', decision: 'Update best from 8 to 9.', question: 'What remains unchanged when best changes?', reason: 'Best summarizes completed windows; sum continues to describe only the current one.', codeLine: 'best = max(best, sum);' },
    { phase: 'Prove', decision: 'Keep 9 after the final window sums to 6.', reason: 'Every width-three window was measured exactly once and none exceeded 9.', result: 'The maximum fixed-window sum is 9. Build once, then slide in O(1), for O(n) total time.' },
  ],
  'dsa-longest-substring': [
    { phase: 'Model', decision: 'Start a window and a last-seen table.', question: 'What must left mean at all times?', reason: 'Left is the earliest index that can begin a unique window ending at right.', codeLine: 'left = 0; best = 0;' },
    { phase: 'Grow', decision: 'Extend right to b and record its index.', question: 'When is it legal to measure the window?', reason: 'The current window contains no duplicate, so its full length is a valid candidate.', codeLine: 'last[s[right]] = right;' },
    { phase: 'Measure', decision: 'Extend through c and set best to 3.', question: 'What information will a repeated a need?', reason: 'The table remembers the precise boundary that a future duplicate must cross.', codeLine: 'best = max(best, right - left + 1);' },
    { phase: 'Repair', decision: 'Jump left to one past the previous a.', question: 'Why use max(left, previous + 1)?', reason: 'A stale occurrence before left must never move the window backward.', codeLine: 'left = max(left, last[a] + 1);' },
    { phase: 'Repair', decision: 'Jump past the previous b.', question: 'Which indexes have now been permanently discarded?', reason: 'Any substring ending here that starts before the duplicate b is invalid.', codeLine: 'left = max(left, last[b] + 1);' },
    { phase: 'Measure', decision: 'Keep best at 3 after repairing c.', question: 'Does equal length change the numeric answer?', reason: 'The repaired window is valid but does not exceed the best already proved.', codeLine: 'best = max(best, right - left + 1);' },
    { phase: 'Finish', decision: 'Process the final b values without moving left backward.', question: 'Why can no later one-character window improve best?', reason: 'Their valid lengths are below the recorded maximum.', codeLine: 'left = max(left, last[b] + 1);' },
    { phase: 'Prove', decision: 'Return 3.', reason: 'Every right endpoint was processed once and left only moved forward; every valid candidate ending at each right was measured.', result: 'The final answer is 3, with O(n) time and bounded alphabet storage.' },
  ],
  'dsa-k-distinct': [
    { phase: 'Grow', decision: 'Add e and count valid suffixes ending here.', question: 'How many substrings end at right inside [left,right]?', reason: 'Every suffix that starts from left through right is also at-most-K valid.', codeLine: 'answer += right - left + 1;' },
    { phase: 'Grow', decision: 'Add c; distinct becomes two.', question: 'Must the window shrink at exactly K?', reason: 'At-most-K allows exactly K, so the invariant still holds.', codeLine: 'freq[c]++;' },
    { phase: 'Grow', decision: 'Add another e without increasing distinct.', question: 'What changes in the map?', reason: 'Only e’s frequency changes; the number of live keys remains two.', codeLine: 'freq[e]++;' },
    { phase: 'Violate', decision: 'Add b; distinct becomes three.', question: 'Which left removals actually reduce distinct?', reason: 'The window is invalid until some frequency reaches zero.', codeLine: 'while (distinct > k)' },
    { phase: 'Repair', decision: 'Remove e then c; erase c when its count reaches zero.', question: 'Why stop immediately at two keys?', reason: 'The first valid left gives the longest valid suffix family for this right endpoint.', codeLine: 'if (--freq[s[left++] ] == 0) distinct--;' },
    { phase: 'Repeat', decision: 'Add a and repair the window again.', question: 'What does right-left+1 count now?', reason: 'It counts every valid at-most-K substring ending at the current right.', codeLine: 'answer += right - left + 1;' },
    { phase: 'Prove', decision: 'Compute exactly K as atMost(K) − atMost(K−1).', reason: 'Every substring with fewer than K distinct values appears in both counts and cancels.', result: 'The difference leaves exactly-K substrings, with each at-most scan taking O(n).' },
  ],
  'dsa-kadane': [
    { phase: 'Define', decision: 'Initialize both states from the first element.', question: 'Why not initialize best to zero?', reason: 'The answer must be a non-empty subarray, including when every value is negative.', codeLine: 'ending = best = a[0];' },
    { phase: 'Choose', decision: 'Start fresh at 1 instead of extending −2.', question: 'Which is larger: 1 or −2+1?', reason: 'Every subarray ending here either starts here or extends the best ending at the previous index.', codeLine: 'ending = max(a[i], ending + a[i]);' },
    { phase: 'Update', decision: 'Extend with −3, so ending becomes −2.', question: 'Why keep a negative ending at all?', reason: 'It is still the best non-empty subarray ending exactly at this index; best separately remembers the global answer.', codeLine: 'best = max(best, ending);' },
    { phase: 'Choose', decision: 'Restart at 4 because 4 > −2+4.', question: 'What range boundary changes when restart wins?', reason: 'A negative prefix can only reduce every future extension that includes it.', codeLine: 'ending = max(4, -2 + 4);' },
    { phase: 'Grow', decision: 'Extend through −1, 2, 1 to reach 6.', question: 'Why does one negative value remain inside the answer?', reason: 'The whole running sum stays better than restarting after −1; local negativity alone is not the rule.', codeLine: 'ending = max(a[i], ending + a[i]);' },
    { phase: 'Prove', decision: 'Return best = 6 for [4,−1,2,1].', reason: 'The recurrence exhausts the only two forms of a subarray ending at each index; best then covers every endpoint.', result: 'Kadane returns 6 in O(n) time and O(1) extra space.' },
  ],
  'dsa-coin-change-min': [
    { phase: 'Define', decision: 'Set dp[0]=0 and every positive amount unreachable.', question: 'What exactly does dp[x] mean?', reason: 'The state stores a minimum number of coins, not a count of combinations.', codeLine: 'dp[0] = 0; others = INF;' },
    { phase: 'Transition', decision: 'Use coin 1 to reach amount 1.', question: 'Which smaller amount remains after taking coin 1?', reason: 'A final coin 1 leaves the already solved amount 0.', codeLine: 'dp[x] = min(dp[x], dp[x-coin] + 1);' },
    { phase: 'Transition', decision: 'Extend amount 1 to build amount 2.', question: 'Can coin 3 or 4 participate yet?', reason: 'Only transitions from non-negative, reachable predecessor amounts are legal.', codeLine: 'if (coin <= x && dp[x-coin] != INF)' },
    { phase: 'Compare', decision: 'Choose one coin 3 over three coin-1 pieces.', question: 'Why is this minimization rather than addition?', reason: 'The state asks for the cheapest construction, so competing final coins are alternatives.', codeLine: 'dp[3] = min(3, dp[0] + 1);' },
    { phase: 'Build', decision: 'Use coin 4 for amount 4 and combine 4+1 for amount 5.', question: 'Which table entries are now trustworthy?', reason: 'Every predecessor is smaller than the current amount and has already reached its final minimum.', codeLine: 'for (x = 1; x <= amount; ++x)' },
    { phase: 'Compare', decision: 'For amount 6, compare predecessors 5, 3, and 2.', question: 'Which final coin gives the minimum?', reason: 'These are every possible final denomination, so taking their minimum is exhaustive.', codeLine: 'dp[6] = 1 + min(dp[5], dp[3], dp[2]);' },
    { phase: 'Prove', decision: 'Return 2 using 3+3.', reason: 'Induction proves each amount: every valid construction has one final coin and the recurrence tests all of them.', result: 'The minimum result is 2. Complexity is O(amount × number of coins).' },
  ],
};

const enhanceFrame = (topicId, item) => {
  if (topicId === 'dsa-stack-queue' && /circular queue/i.test(item.caption)) {
    return { ...item, capacity: 5, head: 3, tail: 2 };
  }
  if (topicId === 'dsa-two-pointers' || topicId === 'dsa-search') {
    const left = markerNumber(item.markers, 'L');
    const right = markerNumber(item.markers, 'R');
    const middle = markerNumber(item.markers, 'M');
    const pointers = Object.fromEntries(
      Object.entries({ left, middle, right }).filter(([, value]) => Number.isInteger(value)),
    );
    return { ...item, pointers };
  }
  if (topicId === 'dsa-sliding') {
    const left = markerNumber(item.markers, 'L');
    const right = markerNumber(item.markers, 'R');
    return { ...item, pointers: { left, right }, window: [left, right] };
  }
  return item;
};

const completeVisual = (topicId, visual) => {
  const teaching = authoredFrameTeaching[topicId] ?? [];
  const enhanced = visual.frames.map((item, index) => enhanceFrame(topicId, {
    phase: index === 0 ? 'Model' : index === visual.frames.length - 1 ? 'Prove' : 'Update',
    decision: item.caption,
    ...item,
    ...(teaching[index] ?? {}),
  }));
  if (enhanced.length >= 5) return { ...visual, frames: enhanced };
  const first = enhanced[0];
  const last = enhanced.at(-1);
  return {
    ...visual,
    frames: [
      {
        ...first,
        phase: 'Model',
        caption: `Initial state: ${first.caption}`,
        decision: 'Name the live state before the first update.',
      },
      ...enhanced,
      {
        ...last,
        phase: 'Prove',
        caption: `Result complete: ${last.caption}`,
        decision: 'Stop only after the result follows from the final state.',
        result: 'The trace is complete. Recheck the final state against the invariant and the stated complexity.',
      },
    ],
  };
};

export const dsaVisuals = Object.fromEntries(
  Object.entries({ ...baseDsaVisuals, ...problemFamilyVisuals, ...focusedDsaVisuals })
    .map(([topicId, visual]) => [topicId, completeVisual(topicId, visual)]),
);

export const visualForDsa = (topicId) => dsaVisuals[topicId] ?? {
  kind: 'timeline',
  frames: [
    frame('Write the initial state and the invariant before the first operation.', ['input', 'state'], ['T0'], ['input']),
    frame('Apply one operation and highlight only the state that changed.', ['input', 'state′'], ['T1'], ['state′']),
  ],
};

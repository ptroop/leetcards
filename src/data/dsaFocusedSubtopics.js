const cSingly = `#include <stddef.h>
#include <stdlib.h>

typedef struct Node {
    int value;
    struct Node *next;
} Node;

`;

const cppSingly = `#include <cstddef>

struct Node {
    int value;
    Node *next;
};

`;

const cTree = `#include <stddef.h>
#include <stdlib.h>

typedef struct TreeNode {
    int value;
    struct TreeNode *left;
    struct TreeNode *right;
} TreeNode;

`;

const cppTree = `#include <algorithm>
#include <cstddef>
#include <queue>
#include <vector>

struct TreeNode {
    int value;
    TreeNode *left;
    TreeNode *right;
};

`;

const problem = ({
  id,
  after,
  title,
  group,
  keywords,
  definition,
  application,
  recognition,
  invariant,
  prediction,
  trace,
  sample,
  kind,
  complexity,
  trap,
  c,
  cpp,
  techniques = [],
  related = [],
}) => Object.freeze({
  id,
  after,
  title,
  group,
  keywords,
  level: 'deep',
  definition,
  application,
  recognition,
  invariant,
  prediction,
  trace,
  sample,
  kind,
  complexity,
  trap,
  c,
  cpp,
  techniques,
  related,
});

const singlyProblems = [
  problem({
    id: 'dsa-sll-dummy-head',
    after: 'dsa-linked',
    title: 'Dummy head: one predecessor for every mutation',
    group: 'Linked-list techniques',
    keywords: ['dummy head', 'sentinel node', 'delete head', 'merge', 'partition'],
    definition: 'A dummy head is a temporary sentinel node placed before the real head so every real node, including the first, has a predecessor whose next link can be changed uniformly.',
    application: 'List-building code in allocators, parsers, and schedulers uses a sentinel to keep the mutation loop independent of whether the first real record changes.',
    recognition: ['the operation may replace or remove the head', 'the algorithm repeatedly appends, deletes, or partitions nodes through predecessor links'],
    invariant: 'Dummy.next always owns the current real head, and current always points to a predecessor whose next field is the candidate link being inspected or changed.',
    prediction: 'When the original head is deleted, which assignment updates the returned head without a special branch?',
    trace: ['Place a stack-allocated dummy before head.', 'Perform every mutation through predecessor->next, including the first node.', 'Return dummy.next because it owns the possibly changed real head.'],
    sample: ['dummy→3', '3→6', '6→8', 'remove=3'],
    kind: 'linked-list',
    complexity: 'O(n) time for a search and O(1) extra space',
    trap: 'The dummy is temporary bookkeeping, not a heap node to return; return dummy.next, never the address of the local dummy.',
    techniques: [{
      term: 'Dummy-head rule',
      definition: 'Whenever the real head might change, create one sentinel before it and mutate links through predecessors so head, middle, and tail cases follow one control path.',
      example: 'Deletion, sorted merge, partitioning, remove-nth-from-end, and k-group reversal all return dummy.next.',
    }],
    related: [
      { id: 'dsa-sll-delete', title: 'Delete a node', reason: 'The predecessor can be the dummy when the first node is removed.' },
      { id: 'dsa-sll-merge-sorted', title: 'Merge two sorted lists', reason: 'A dummy gives the result list a permanent tail anchor.' },
      { id: 'dsa-sll-partition', title: 'Partition a linked list', reason: 'Two dummy heads build the less-than and greater-or-equal chains uniformly.' },
      { id: 'dsa-sll-remove-nth', title: 'Remove the nth node from the end', reason: 'Starting at the dummy allows the deleted node to be the original head.' },
    ],
    c: `${cSingly}Node *remove_first_value(Node *head, int value) {
    Node dummy = {0, head};
    Node *previous = &dummy;
    while (previous->next != NULL && previous->next->value != value) {
        previous = previous->next;
    }
    if (previous->next != NULL) {
        Node *removed = previous->next;
        previous->next = removed->next;
        free(removed);
    }
    return dummy.next;
}`,
    cpp: `${cppSingly}Node *remove_first_value(Node *head, int value) {
    Node dummy{0, head};
    Node *previous = &dummy;
    while (previous->next != nullptr && previous->next->value != value) {
        previous = previous->next;
    }
    if (previous->next != nullptr) {
        Node *removed = previous->next;
        previous->next = removed->next;
        delete removed;
    }
    return dummy.next;
}`,
  }),
  problem({
    id: 'dsa-sll-fast-slow-technique',
    after: 'dsa-fast-slow',
    title: 'Fast and slow pointers: one distance relationship',
    group: 'Linked-list techniques',
    keywords: ['fast slow pointers', 'middle', 'cycle', 'nth from end', 'gap'],
    definition: 'Fast-and-slow pointer algorithms create a controlled distance relationship between two traversals, then read information from where the slower pointer stands when the faster pointer meets a boundary or another pointer.',
    application: 'Diagnostics can find a midpoint, bounded look-behind position, or accidental cycle in a forward-only ownership chain without storing visited addresses.',
    recognition: ['the answer depends on relative position rather than node values', 'one pass and constant extra memory are required'],
    invariant: 'The algorithm states and preserves one measurable relationship: a 2:1 distance, a fixed n-node gap, or a modular distance inside a cycle.',
    prediction: 'What changes between middle, cycle, and nth-from-end problems: the pointer mechanism or only the stopping event and interpretation?',
    trace: ['Choose the distance relationship required by the question.', 'Advance pointers while preserving that relationship.', 'Interpret end, meeting, or null as the proof event for this problem.'],
    sample: ['1→2', '2→3', '3→4', '4→5', '5→∅'],
    kind: 'linked-list',
    complexity: 'O(n) time and O(1) extra space',
    trap: '“Use two pointers” is not a proof; state their speed or fixed gap, the loop guard, and exactly what the stopping event means.',
    techniques: [{
      term: 'Distance invariant',
      definition: 'The two pointers are useful because their traveled distances remain mathematically related, not merely because two variables exist.',
      example: 'Fast travels twice slow for middle and cycle; fast remains n links ahead for nth-from-end.',
    }],
    related: [
      { id: 'dsa-sll-middle', title: 'Find the middle node', reason: 'Fast moves twice as far, so slow reaches half the list.' },
      { id: 'dsa-sll-cycle-detection', title: 'Detect a cycle', reason: 'Inside a loop, fast gains one cycle position per iteration until it meets slow.' },
      { id: 'dsa-sll-cycle-entry', title: 'Find the cycle entry', reason: 'After meeting, equal-speed pointers preserve the derived distance to the entry.' },
      { id: 'dsa-sll-nth-from-end', title: 'Find the nth node from the end', reason: 'A fixed n-node gap converts an unknown length into a boundary event.' },
    ],
    c: `${cSingly}Node *middle_with_fast_slow(Node *head) {
    Node *slow = head;
    Node *fast = head;
    while (fast != NULL && fast->next != NULL) {
        slow = slow->next;
        fast = fast->next->next;
    }
    return slow;
}`,
    cpp: `${cppSingly}Node *middle_with_fast_slow(Node *head) {
    Node *slow = head;
    Node *fast = head;
    while (fast != nullptr && fast->next != nullptr) {
        slow = slow->next;
        fast = fast->next->next;
    }
    return slow;
}`,
  }),
  problem({
    id: 'dsa-sll-three-pointer-reversal',
    after: 'dsa-linked',
    title: 'In-place reversal: previous, current, and next',
    group: 'Linked-list techniques',
    keywords: ['reverse in place', 'previous current next', 'three pointers', 'reverse sublist'],
    definition: 'Three-pointer reversal turns one forward link backward at a time while next preserves the only remaining route to the unreversed suffix.',
    application: 'Forward-only histories and packet chains can reverse processing order in place without allocating a second list or copying payloads.',
    recognition: ['a whole list or bounded segment must change direction', 'constant auxiliary storage is required'],
    invariant: 'Previous heads the fully reversed prefix, current heads the untouched suffix, and next temporarily preserves the route that would otherwise be destroyed.',
    prediction: 'Which single omitted assignment loses the entire unprocessed suffix?',
    trace: ['Save current->next before changing any link.', 'Point current->next at previous.', 'Advance previous and current; when current is null, previous is the new head.'],
    sample: ['A→B', 'B→C', 'C→∅'],
    kind: 'linked-list',
    complexity: 'O(n) time and O(1) extra space',
    trap: 'Reversing current->next before saving next disconnects every remaining node and makes recovery impossible.',
    techniques: [{
      term: 'Three-pointer reversal',
      definition: 'previous stores the completed reversed prefix, current identifies the link to flip now, and next protects the unprocessed suffix before that flip.',
      example: 'The same loop reverses an entire list, a second half, or one k-node group.',
    }],
    related: [
      { id: 'dsa-sll-reverse-iterative', title: 'Reverse an entire list', reason: 'This is the direct whole-list form of the three-pointer loop.' },
      { id: 'dsa-sll-palindrome', title: 'Palindrome linked list', reason: 'Reverse the second half, compare it, and restore it.' },
      { id: 'dsa-sll-reorder', title: 'Reorder a linked list', reason: 'Reverse the second half before alternating the two halves.' },
      { id: 'dsa-sll-reverse-k-group', title: 'Reverse nodes in k-sized groups', reason: 'Apply the same link flip to one verified group at a time.' },
    ],
    c: `${cSingly}Node *reverse_with_three_pointers(Node *head) {
    Node *previous = NULL;
    Node *current = head;
    while (current != NULL) {
        Node *next = current->next;
        current->next = previous;
        previous = current;
        current = next;
    }
    return previous;
}`,
    cpp: `${cppSingly}Node *reverse_with_three_pointers(Node *head) {
    Node *previous = nullptr;
    Node *current = head;
    while (current != nullptr) {
        Node *next = current->next;
        current->next = previous;
        previous = current;
        current = next;
    }
    return previous;
}`,
  }),
  problem({
    id: 'dsa-sll-traversal',
    after: 'dsa-linked',
    title: 'Traverse and measure a singly linked list',
    group: 'Singly linked lists',
    keywords: ['linked list traversal', 'length', 'head', 'next'],
    definition: 'Singly linked-list traversal starts at head and follows each next link exactly once until the null link that terminates the chain.',
    application: 'Memory allocators, kernel queues, and intrusive device-driver lists walk linked records when elements cannot be stored contiguously or moved safely.',
    recognition: ['the input is a head pointer rather than an indexed range', 'every reachable node must be visited once without changing links'],
    invariant: 'Before each iteration, current is either the next unvisited reachable node or null, and count equals the number of nodes already visited.',
    prediction: 'After reading the current node, which pointer is the only route to the rest of the list?',
    trace: ['Start at head with count zero.', 'Read the current value, then follow next.', 'Stop at null; count is the exact reachable length.'],
    sample: ['4→7', '7→9', '9→∅'],
    kind: 'linked-list',
    complexity: 'O(n) time and O(1) extra space',
    trap: 'Do not advance before processing the current node, and never dereference current after it becomes null.',
    c: `${cSingly}size_t list_length(const Node *head) {
    size_t count = 0;
    for (const Node *current = head; current != NULL; current = current->next) {
        count++;
    }
    return count;
}`,
    cpp: `${cppSingly}std::size_t list_length(const Node *head) {
    std::size_t count = 0;
    for (const Node *current = head; current != nullptr; current = current->next) {
        ++count;
    }
    return count;
}`,
  }),
  problem({
    id: 'dsa-sll-insert',
    after: 'dsa-linked',
    title: 'Insert at the head, tail, and a position',
    group: 'Singly linked lists',
    keywords: ['insert head', 'insert tail', 'insert position', 'linked list'],
    definition: 'Linked-list insertion allocates one node and changes the smallest set of links needed to make that node reachable at the requested position.',
    application: 'Free lists and packet queues insert descriptors without shifting later elements; the same link-ordering rule prevents a newly allocated record from being lost.',
    recognition: ['one new node must become reachable without relocating existing nodes', 'the insertion point is described by a predecessor link'],
    invariant: 'The prefix before the insertion point remains unchanged, and the new node points to the old successor before the predecessor points to the new node.',
    prediction: 'Which link must be saved before the predecessor is redirected?',
    trace: ['Find the link that currently reaches the insertion position.', 'Point the new node at the old successor.', 'Redirect the predecessor link; the chain is complete.'],
    sample: ['2→5', 'new=4', '2→4', '4→5'],
    kind: 'linked-list',
    complexity: 'O(1) at the head and O(n) to locate a tail or position',
    trap: 'Writing predecessor->next first can discard the old suffix, and allocation failure must leave the original list unchanged.',
    c: `${cSingly}int list_insert(Node **head, size_t position, int value) {
    if (head == NULL) return 0;
    Node **link = head;
    for (size_t index = 0; index < position && *link != NULL; index++) {
        link = &(*link)->next;
    }
    Node *node = malloc(sizeof *node);
    if (node == NULL) return 0;
    node->value = value;
    node->next = *link;
    *link = node;
    return 1;
}`,
    cpp: `${cppSingly}bool list_insert(Node *&head, std::size_t position, int value) {
    Node **link = &head;
    for (std::size_t index = 0; index < position && *link != nullptr; ++index) {
        link = &(*link)->next;
    }
    Node *node = new Node{value, *link};
    *link = node;
    return true;
}`,
  }),
  problem({
    id: 'dsa-sll-delete',
    after: 'dsa-linked',
    title: 'Delete a node by value or position',
    group: 'Singly linked lists',
    keywords: ['delete node', 'remove value', 'dummy head', 'sentinel'],
    definition: 'Linked-list deletion redirects the link that owns a target node to the target successor, then releases the now-unreachable target exactly once.',
    application: 'Schedulers and connection tables remove cancelled records while preserving every remaining record; a dummy predecessor handles cancellation of the first record without a separate branch.',
    recognition: ['one matching node must be unlinked while the rest remain reachable', 'the target may be the head, middle, tail, or absent'],
    invariant: 'Previous always identifies a live predecessor, including the dummy before the real head, and previous->next is the current candidate link.',
    prediction: 'If the first real node matches, which ordinary predecessor assignment removes it?',
    trace: ['Place a dummy before head and advance previous until previous->next matches.', 'Save the target and redirect previous->next to target->next.', 'Free only the detached target and return dummy.next.'],
    sample: ['3→6', '6→8', 'remove=6', '3→8'],
    kind: 'linked-list',
    complexity: 'O(n) time and O(1) extra space',
    trap: 'Freeing before saving target->next creates a use-after-free, while skipping the redirect leaves a dangling link in the list.',
    techniques: [{
      term: 'Dummy head',
      definition: 'The dummy is a guaranteed predecessor before the first real node, so deleting head, middle, or tail uses the same previous->next update.',
      example: 'When head matches, previous is &dummy and previous->next is exactly the real head.',
    }],
    related: [
      { id: 'dsa-sll-dummy-head', title: 'Dummy-head technique', reason: 'Explains why the first node no longer needs an edge-case branch.' },
      { id: 'dsa-sll-remove-nth', title: 'Remove the nth node from the end', reason: 'Combines the same dummy predecessor with a fixed pointer gap.' },
    ],
    c: `${cSingly}Node *list_remove_first(Node *head, int value) {
    Node dummy = {0, head};
    Node *previous = &dummy;
    while (previous->next != NULL && previous->next->value != value) {
        previous = previous->next;
    }
    if (previous->next != NULL) {
        Node *removed = previous->next;
        previous->next = removed->next;
        free(removed);
    }
    return dummy.next;
}`,
    cpp: `${cppSingly}Node *list_remove_first(Node *head, int value) {
    Node dummy{0, head};
    Node *previous = &dummy;
    while (previous->next != nullptr && previous->next->value != value) {
        previous = previous->next;
    }
    if (previous->next != nullptr) {
        Node *removed = previous->next;
        previous->next = removed->next;
        delete removed;
    }
    return dummy.next;
}`,
  }),
  problem({
    id: 'dsa-sll-reverse-iterative',
    after: 'dsa-linked',
    title: 'Reverse a singly linked list iteratively',
    group: 'Singly linked lists',
    keywords: ['reverse linked list', 'iterative', 'three pointers'],
    definition: 'Iterative reversal changes every next link to point toward its former predecessor while preserving the only route to the unreversed suffix.',
    application: 'Undo histories and forward-only command chains are reversed when processing must replay the newest reachable record first without allocating another list.',
    recognition: ['all links must change direction in place', 'only constant extra storage is allowed'],
    invariant: 'Previous heads a completely reversed prefix, current heads the untouched suffix, and next temporarily preserves the route between them.',
    prediction: 'What must be saved before current->next is overwritten?',
    trace: ['Previous is null and current is the old head.', 'Save next, reverse one link, and advance both pointers.', 'Current reaches null; previous is the new head.'],
    sample: ['A→B', 'B→C', 'C→∅'],
    kind: 'linked-list',
    complexity: 'O(n) time and O(1) extra space',
    trap: 'Changing current->next before saving the old next pointer loses the unreversed suffix permanently.',
    techniques: [{
      term: 'Three-pointer reversal',
      definition: 'Previous owns the reversed prefix, current is the node being redirected, and next preserves the untouched suffix before the link is overwritten.',
      example: 'The exact same move is reused on the second half of palindrome and reorder-list solutions, and inside each verified k-node group.',
    }],
    related: [
      { id: 'dsa-sll-three-pointer-reversal', title: 'Three-pointer reversal technique', reason: 'See the reusable invariant independently of this one problem.' },
      { id: 'dsa-sll-palindrome', title: 'Palindrome linked list', reason: 'Reverses and later restores the second half.' },
      { id: 'dsa-sll-reorder', title: 'Reorder a linked list', reason: 'Reverses the tail half before weaving.' },
      { id: 'dsa-sll-reverse-k-group', title: 'Reverse nodes in k-sized groups', reason: 'Runs this link flip inside each complete group.' },
    ],
    c: `${cSingly}Node *list_reverse(Node *head) {
    Node *previous = NULL;
    Node *current = head;
    while (current != NULL) {
        Node *next = current->next;
        current->next = previous;
        previous = current;
        current = next;
    }
    return previous;
}`,
    cpp: `${cppSingly}Node *list_reverse(Node *head) {
    Node *previous = nullptr;
    Node *current = head;
    while (current != nullptr) {
        Node *next = current->next;
        current->next = previous;
        previous = current;
        current = next;
    }
    return previous;
}`,
  }),
  problem({
    id: 'dsa-sll-reverse-recursive',
    after: 'dsa-linked',
    title: 'Reverse a singly linked list recursively',
    group: 'Singly linked lists',
    keywords: ['reverse linked list', 'recursive', 'call stack'],
    definition: 'Recursive reversal first reverses the suffix, then appends the current node behind its former successor while unwinding the call stack.',
    application: 'The recursive form is mainly a teaching and proof tool: it makes the smaller subproblem explicit and reveals how stack depth grows with the list.',
    recognition: ['the requested proof is naturally stated as reverse the suffix first', 'O(n) call-stack space is acceptable'],
    invariant: 'When a call returns, new_head already heads the completely reversed suffix and head->next is its current tail.',
    prediction: 'After the suffix is reversed, which link attaches the current node to its end?',
    trace: ['Recurse until the last node becomes the new head.', 'On return, point the successor back to the current node.', 'Clear the old forward link and return the unchanged new head.'],
    sample: ['A→B', 'B→C', 'C→∅'],
    kind: 'linked-list',
    complexity: 'O(n) time and O(n) call-stack space',
    trap: 'Forgetting head->next = null leaves a cycle between the first two nodes after the backward link is installed.',
    c: `${cSingly}Node *list_reverse_recursive(Node *head) {
    if (head == NULL || head->next == NULL) return head;
    Node *new_head = list_reverse_recursive(head->next);
    head->next->next = head;
    head->next = NULL;
    return new_head;
}`,
    cpp: `${cppSingly}Node *list_reverse_recursive(Node *head) {
    if (head == nullptr || head->next == nullptr) return head;
    Node *new_head = list_reverse_recursive(head->next);
    head->next->next = head;
    head->next = nullptr;
    return new_head;
}`,
  }),
  problem({
    id: 'dsa-sll-middle',
    after: 'dsa-fast-slow',
    title: 'Find the middle node with fast and slow pointers',
    group: 'Singly linked-list interview problems',
    keywords: ['middle node', 'fast slow', 'tortoise hare'],
    definition: 'The middle-node pattern advances slow by one link and fast by two, so slow has covered half the distance when fast reaches the end.',
    application: 'Merge sort splits a linked list without measuring it first, and streaming list diagnostics can select a midpoint using constant memory.',
    recognition: ['the answer is a position relative to total length', 'the structure has next links but no random indexing'],
    invariant: 'After each complete iteration, fast has advanced twice as many edges as slow from the same starting head.',
    prediction: 'For an even-length list, should the loop return the first or second middle under this stopping condition?',
    trace: ['Start both pointers at head.', 'Advance slow once and fast twice while two fast edges exist.', 'Fast reaches the end; slow is the selected middle.'],
    sample: ['1→2', '2→3', '3→4', '4→5', '5→∅'],
    kind: 'linked-list',
    complexity: 'O(n) time and O(1) extra space',
    trap: 'Changing the loop guard changes which middle is returned for even lengths; state that policy explicitly.',
    techniques: [{
      term: '2:1 distance invariant',
      definition: 'Fast travels two links for each one traveled by slow, so slow has covered half the traversed distance when fast reaches the boundary.',
      example: 'With the shown guard, an even-length list returns the second middle.',
    }],
    related: [
      { id: 'dsa-sll-fast-slow-technique', title: 'Fast/slow pointer technique', reason: 'Unifies middle, cycle, and nth-from-end reasoning through distance.' },
      { id: 'dsa-sll-cycle-detection', title: 'Detect a cycle', reason: 'Uses the same speeds but interprets a meeting instead of the end.' },
      { id: 'dsa-sll-reorder', title: 'Reorder a linked list', reason: 'Uses a midpoint to split the list before reversal.' },
    ],
    c: `${cSingly}Node *list_middle(Node *head) {
    Node *slow = head;
    Node *fast = head;
    while (fast != NULL && fast->next != NULL) {
        slow = slow->next;
        fast = fast->next->next;
    }
    return slow;
}`,
    cpp: `${cppSingly}Node *list_middle(Node *head) {
    Node *slow = head;
    Node *fast = head;
    while (fast != nullptr && fast->next != nullptr) {
        slow = slow->next;
        fast = fast->next->next;
    }
    return slow;
}`,
  }),
  problem({
    id: 'dsa-sll-nth-from-end',
    after: 'dsa-fast-slow',
    title: 'Find the nth node from the end',
    group: 'Singly linked-list interview problems',
    keywords: ['nth from end', 'kth from end', 'two pointers'],
    definition: 'The nth-from-end pattern creates an n-node gap between two pointers, then advances them together until the leading pointer reaches null.',
    application: 'Bounded log chains and recent-event lists can select a record relative to the tail without storing every address or performing a second pass.',
    recognition: ['the position is measured from the tail', 'only one traversal and constant storage are desired'],
    invariant: 'After the initial gap is formed, lead remains exactly n links ahead of follow until lead reaches null.',
    prediction: 'If lead cannot advance n times, what does that prove about the request?',
    trace: ['Advance lead n links, rejecting a list that is too short.', 'Move lead and follow together without changing the gap.', 'Lead reaches null; follow is nth from the end.'],
    sample: ['8→4', '4→6', '6→2', '2→∅'],
    kind: 'linked-list',
    complexity: 'O(n) time and O(1) extra space',
    trap: 'Off-by-one errors come from mixing “nth node” with “n edges”; define n=1 as the tail before writing the loop.',
    techniques: [{
      term: 'Fixed-gap pointers',
      definition: 'After lead advances n links, moving both pointers together preserves an n-link gap until the end converts it into the answer position.',
      example: 'For n=1, lead stays one link ahead, so follow reaches the tail exactly when lead reaches null.',
    }],
    related: [
      { id: 'dsa-sll-fast-slow-technique', title: 'Fast/slow pointer technique', reason: 'Explains fixed-gap reasoning alongside the 2:1 variant.' },
      { id: 'dsa-sll-remove-nth', title: 'Remove the nth node from the end', reason: 'Keeps the same gap but places follow at the predecessor to unlink the answer.' },
    ],
    c: `${cSingly}Node *list_nth_from_end(Node *head, size_t n) {
    if (n == 0) return NULL;
    Node *lead = head;
    for (size_t i = 0; i < n; i++) {
        if (lead == NULL) return NULL;
        lead = lead->next;
    }
    Node *follow = head;
    while (lead != NULL) {
        lead = lead->next;
        follow = follow->next;
    }
    return follow;
}`,
    cpp: `${cppSingly}Node *list_nth_from_end(Node *head, std::size_t n) {
    if (n == 0) return nullptr;
    Node *lead = head;
    for (std::size_t i = 0; i < n; ++i) {
        if (lead == nullptr) return nullptr;
        lead = lead->next;
    }
    Node *follow = head;
    while (lead != nullptr) {
        lead = lead->next;
        follow = follow->next;
    }
    return follow;
}`,
  }),
  problem({
    id: 'dsa-sll-remove-nth',
    after: 'dsa-fast-slow',
    title: 'Remove the nth node from the end',
    group: 'Singly linked-list interview problems',
    keywords: ['remove nth from end', 'dummy head', 'fixed gap', 'fast slow'],
    definition: 'Removing the nth node from the end combines a dummy head with an n-node lead gap so follow stops at the predecessor of the node that must be unlinked.',
    application: 'Bounded history and retry queues remove an item relative to the newest end without measuring the chain or special-casing removal of the oldest head record.',
    recognition: ['the target is counted from the tail but the structure only moves forward', 'the target may be the original head'],
    invariant: 'After lead advances n+1 links from the dummy, lead remains n nodes ahead of follow->next, so follow is the target predecessor when lead reaches null.',
    prediction: 'Why does starting both pointers at a dummy and advancing lead n+1 steps make head removal ordinary?',
    trace: ['Place dummy before head and advance lead n+1 links.', 'Move lead and follow together until lead is null.', 'Unlink follow->next and return dummy.next.'],
    sample: ['dummy→1', '1→2', '2→3', '3→4', 'remove=1'],
    kind: 'linked-list',
    complexity: 'O(n) time and O(1) extra space',
    trap: 'Advancing only n steps leaves follow on the target rather than its predecessor; the dummy formulation deliberately uses n+1.',
    techniques: [
      {
        term: 'Dummy head',
        definition: 'The sentinel supplies a predecessor even when the target is the original head, so one unlink statement handles every valid position.',
        example: 'For a one-node list and n=1, follow remains at dummy and follow->next is the real head.',
      },
      {
        term: 'Fixed fast-slow gap',
        definition: 'The lead pointer stays a fixed number of links ahead, converting an unknown total length into a known relative position at the end.',
        example: 'When lead becomes null, follow->next is exactly n nodes from the tail.',
      },
    ],
    related: [
      { id: 'dsa-sll-dummy-head', title: 'Dummy-head technique', reason: 'Makes deleting the original head identical to every other deletion.' },
      { id: 'dsa-sll-nth-from-end', title: 'Find the nth node from the end', reason: 'Uses the same fixed-gap proof without unlinking.' },
      { id: 'dsa-sll-fast-slow-technique', title: 'Fast/slow distance technique', reason: 'Explains why the gap remains valid until the boundary.' },
    ],
    c: `${cSingly}Node *remove_nth_from_end(Node *head, size_t n) {
    if (n == 0) return head;
    Node dummy = {0, head};
    Node *lead = &dummy;
    Node *follow = &dummy;
    for (size_t step = 0; step <= n; step++) {
        if (lead == NULL) return head;
        lead = lead->next;
    }
    while (lead != NULL) {
        lead = lead->next;
        follow = follow->next;
    }
    Node *removed = follow->next;
    follow->next = removed->next;
    free(removed);
    return dummy.next;
}`,
    cpp: `${cppSingly}Node *remove_nth_from_end(Node *head, std::size_t n) {
    if (n == 0) return head;
    Node dummy{0, head};
    Node *lead = &dummy;
    Node *follow = &dummy;
    for (std::size_t step = 0; step <= n; ++step) {
        if (lead == nullptr) return head;
        lead = lead->next;
    }
    while (lead != nullptr) {
        lead = lead->next;
        follow = follow->next;
    }
    Node *removed = follow->next;
    follow->next = removed->next;
    delete removed;
    return dummy.next;
}`,
  }),
  problem({
    id: 'dsa-sll-cycle-detection',
    after: 'dsa-fast-slow',
    title: 'Detect a linked-list cycle with Floyd’s algorithm',
    group: 'Singly linked-list interview problems',
    keywords: ['loop in linked list', 'cycle detection', 'Floyd', 'fast slow'],
    definition: 'Floyd cycle detection moves one pointer by one edge and another by two; inside a cycle, their relative distance changes until they meet.',
    application: 'Corrupted free lists, scheduler queues, and ownership chains can be checked for accidental loops without allocating a visited-address table.',
    recognition: ['following next may never reach null', 'constant extra storage is required'],
    invariant: 'Both pointers follow valid links, and once both are inside a cycle the fast pointer gains one cycle position on slow per iteration.',
    prediction: 'Why does a fast pointer reaching null disprove a cycle?',
    trace: ['Start slow and fast at head.', 'Move one and two links while fast has a next link.', 'A meeting proves a cycle; null proves termination.'],
    sample: ['A→B', 'B→C', 'C→D', 'D→B'],
    kind: 'linked-list',
    complexity: 'O(n) time and O(1) extra space',
    trap: 'Comparing node values is incorrect because different nodes may hold equal values; compare node addresses.',
    techniques: [{
      term: '2:1 pointer speeds',
      definition: 'Once both pointers enter a cycle, fast gains one position on slow per iteration, so a meeting is inevitable within one lap.',
      example: 'If fast instead reaches null, the chain terminates and therefore cannot contain a cycle.',
    }],
    related: [
      { id: 'dsa-sll-fast-slow-technique', title: 'Fast/slow pointer technique', reason: 'Explains the shared distance model behind Floyd’s algorithm.' },
      { id: 'dsa-sll-cycle-entry', title: 'Find the cycle entry', reason: 'Continues from the meeting point to locate the first node in the loop.' },
    ],
    c: `${cSingly}int list_has_cycle(const Node *head) {
    const Node *slow = head;
    const Node *fast = head;
    while (fast != NULL && fast->next != NULL) {
        slow = slow->next;
        fast = fast->next->next;
        if (slow == fast) return 1;
    }
    return 0;
}`,
    cpp: `${cppSingly}bool list_has_cycle(const Node *head) {
    const Node *slow = head;
    const Node *fast = head;
    while (fast != nullptr && fast->next != nullptr) {
        slow = slow->next;
        fast = fast->next->next;
        if (slow == fast) return true;
    }
    return false;
}`,
  }),
  problem({
    id: 'dsa-sll-cycle-entry',
    after: 'dsa-fast-slow',
    title: 'Find the entry node of a linked-list cycle',
    group: 'Singly linked-list interview problems',
    keywords: ['cycle entry', 'loop start', 'Floyd phase two'],
    definition: 'After Floyd’s pointers meet inside a cycle, resetting one pointer to head and moving both one edge at a time makes them meet at the cycle entry.',
    application: 'A corrupted intrusive list is repairable only after diagnostics identify the first repeated node, not merely the existence of repetition.',
    recognition: ['a cycle is already known or must be detected', 'the first node belonging to the loop is required'],
    invariant: 'At phase two, the reset pointer’s distance to entry equals the meeting pointer’s remaining distance to entry modulo the cycle length.',
    prediction: 'Why must phase two use equal speeds rather than the original one-and-two speeds?',
    trace: ['Run Floyd until slow and fast meet inside the cycle.', 'Reset slow to head and keep fast at the meeting point.', 'Move both one link; their next meeting is the entry.'],
    sample: ['A→B', 'B→C', 'C→D', 'D→B'],
    kind: 'linked-list',
    complexity: 'O(n) time and O(1) extra space',
    trap: 'Resetting both pointers loses the cycle-distance relationship; reset exactly one pointer.',
    techniques: [{
      term: 'Floyd phase two',
      definition: 'After the first meeting, reset exactly one pointer to head and move both one link at a time; the cycle-distance equation makes their next meeting the entry.',
      example: 'The first phase proves a loop exists; the second phase converts the meeting location into the loop’s starting node.',
    }],
    related: [
      { id: 'dsa-sll-cycle-detection', title: 'Detect a cycle', reason: 'Produces the meeting point required by phase two.' },
      { id: 'dsa-sll-fast-slow-technique', title: 'Fast/slow pointer technique', reason: 'Shows why speed and distance relationships—not pointer names—solve the problem.' },
    ],
    c: `${cSingly}Node *list_cycle_entry(Node *head) {
    Node *slow = head;
    Node *fast = head;
    do {
        if (fast == NULL || fast->next == NULL) return NULL;
        slow = slow->next;
        fast = fast->next->next;
    } while (slow != fast);
    slow = head;
    while (slow != fast) {
        slow = slow->next;
        fast = fast->next;
    }
    return slow;
}`,
    cpp: `${cppSingly}Node *list_cycle_entry(Node *head) {
    Node *slow = head;
    Node *fast = head;
    do {
        if (fast == nullptr || fast->next == nullptr) return nullptr;
        slow = slow->next;
        fast = fast->next->next;
    } while (slow != fast);
    slow = head;
    while (slow != fast) {
        slow = slow->next;
        fast = fast->next;
    }
    return slow;
}`,
  }),
  problem({
    id: 'dsa-sll-merge-sorted',
    after: 'dsa-linked',
    title: 'Merge two sorted linked lists',
    group: 'Singly linked-list interview problems',
    keywords: ['merge sorted lists', 'dummy node', 'two lists'],
    definition: 'Merging sorted lists repeatedly detaches the smaller front node and appends it to one result chain, then attaches the one remaining suffix.',
    application: 'External sorting and event-stream reconciliation combine already ordered runs without copying payloads or performing random access.',
    recognition: ['two input chains are individually sorted', 'the output must preserve every node in sorted order'],
    invariant: 'The result tail follows the smallest nodes consumed so far, and both input heads remain the smallest unconsumed nodes of their lists.',
    prediction: 'When one input becomes null, why can the other suffix be attached without more comparisons?',
    trace: ['Compare the two front nodes behind a dummy tail.', 'Append the smaller node and advance only that input.', 'Attach the remaining sorted suffix and return dummy.next.'],
    sample: ['1→4→7', '2→3→8'],
    kind: 'linked-list',
    complexity: 'O(n + m) time and O(1) extra space',
    trap: 'Advancing both input pointers after one comparison drops a node; advance only the list that supplied the appended node.',
    techniques: [{
      term: 'Dummy result head',
      definition: 'A sentinel permanently anchors the output so appending the first chosen node and every later node uses the same tail update.',
      example: 'The result’s true head is always dummy.next, even when either input starts empty.',
    }],
    related: [
      { id: 'dsa-sll-dummy-head', title: 'Dummy-head technique', reason: 'Explains why the sentinel removes the empty-result special case.' },
      { id: 'dsa-sll-partition', title: 'Partition a linked list', reason: 'Uses two sentinel-backed result chains instead of one.' },
      { id: 'dsa-sll-merge-sort', title: 'Merge sort a linked list', reason: 'Uses this merge operation after recursively sorting each half.' },
    ],
    c: `${cSingly}Node *merge_sorted_lists(Node *left, Node *right) {
    Node dummy = {0, NULL};
    Node *tail = &dummy;
    while (left != NULL && right != NULL) {
        Node **smaller = left->value <= right->value ? &left : &right;
        tail->next = *smaller;
        *smaller = (*smaller)->next;
        tail = tail->next;
    }
    tail->next = left != NULL ? left : right;
    return dummy.next;
}`,
    cpp: `${cppSingly}Node *merge_sorted_lists(Node *left, Node *right) {
    Node dummy{0, nullptr};
    Node *tail = &dummy;
    while (left != nullptr && right != nullptr) {
        Node **smaller = left->value <= right->value ? &left : &right;
        tail->next = *smaller;
        *smaller = (*smaller)->next;
        tail = tail->next;
    }
    tail->next = left != nullptr ? left : right;
    return dummy.next;
}`,
  }),
  problem({
    id: 'dsa-sll-partition',
    after: 'dsa-linked',
    title: 'Partition a linked list around a value',
    group: 'Singly linked-list interview problems',
    keywords: ['partition list', 'dummy head', 'stable partition', 'two chains'],
    definition: 'Stable linked-list partition detaches each node and appends it to either a less-than chain or a greater-or-equal chain, then joins the two chains without changing order inside either group.',
    application: 'Schedulers and packet filters separate urgent from ordinary records while retaining arrival order within each priority class.',
    recognition: ['nodes must be grouped around a pivot without sorting them', 'relative order inside each group must remain stable'],
    invariant: 'Less and greater tails end two disjoint, stable chains containing every processed node exactly once; current heads the unprocessed suffix.',
    prediction: 'Why must the greater tail be terminated with null before the two result chains are joined?',
    trace: ['Create one dummy head and tail for each partition.', 'Detach current and append it to exactly one tail.', 'Terminate the greater chain, join less to greater, and return less_dummy.next.'],
    sample: ['1→4', '4→3', '3→2', 'pivot=3'],
    kind: 'linked-list',
    complexity: 'O(n) time and O(1) extra node storage',
    trap: 'Leaving a node attached to its old successor can make the two output chains overlap or form a cycle after they are joined.',
    techniques: [{
      term: 'Two dummy-headed builders',
      definition: 'Each output partition has a sentinel and tail, so appending the first and every later node uses the same tail->next update.',
      example: 'less_dummy builds values below pivot while greater_dummy independently builds all remaining values.',
    }],
    related: [
      { id: 'dsa-sll-dummy-head', title: 'Dummy-head technique', reason: 'Both partitions need a uniform empty-result and first-append case.' },
      { id: 'dsa-sll-merge-sorted', title: 'Merge two sorted lists', reason: 'Both algorithms maintain result tails behind sentinel nodes.' },
      { id: 'dsa-sll-reorder', title: 'Reorder a linked list', reason: 'Both detach nodes before weaving two independently prepared chains.' },
    ],
    c: `${cSingly}Node *partition_list(Node *head, int pivot) {
    Node less_dummy = {0, NULL};
    Node greater_dummy = {0, NULL};
    Node *less_tail = &less_dummy;
    Node *greater_tail = &greater_dummy;
    while (head != NULL) {
        Node *next = head->next;
        head->next = NULL;
        Node **tail = head->value < pivot ? &less_tail : &greater_tail;
        (*tail)->next = head;
        *tail = head;
        head = next;
    }
    less_tail->next = greater_dummy.next;
    return less_dummy.next;
}`,
    cpp: `${cppSingly}Node *partition_list(Node *head, int pivot) {
    Node less_dummy{0, nullptr};
    Node greater_dummy{0, nullptr};
    Node *less_tail = &less_dummy;
    Node *greater_tail = &greater_dummy;
    while (head != nullptr) {
        Node *next = head->next;
        head->next = nullptr;
        Node **tail = head->value < pivot ? &less_tail : &greater_tail;
        (*tail)->next = head;
        *tail = head;
        head = next;
    }
    less_tail->next = greater_dummy.next;
    return less_dummy.next;
}`,
  }),
  problem({
    id: 'dsa-sll-merge-sort',
    after: 'dsa-linked',
    title: 'Sort a linked list with merge sort',
    group: 'Singly linked-list interview problems',
    keywords: ['sort linked list', 'merge sort', 'middle node'],
    definition: 'Linked-list merge sort splits the chain near its middle, recursively sorts both halves, and merges the sorted chains by relinking nodes.',
    application: 'Linked records can be sorted in O(n log n) time without the random access that array-oriented quicksort and heaps normally rely on.',
    recognition: ['the data is a linked list that must be sorted efficiently', 'stable ordering and O(1) merge storage are useful'],
    invariant: 'Each recursive result is a sorted chain containing exactly the nodes of its original half, and merge preserves both order and ownership.',
    prediction: 'Which link must be cleared to make the two recursive halves independent?',
    trace: ['Use fast and slow pointers to locate the split predecessor.', 'Cut the next link and sort each independent half.', 'Merge the two sorted chains into the final result.'],
    sample: ['4→1', '1→3', '3→2', '2→∅'],
    kind: 'linked-list',
    complexity: 'O(n log n) time and O(log n) recursion stack',
    trap: 'Failing to cut the first half before recursing causes the same nodes to remain reachable from both subproblems.',
    c: `${cSingly}static Node *merge_nodes(Node *a, Node *b) {
    Node dummy = {0, NULL};
    Node *tail = &dummy;
    while (a != NULL && b != NULL) {
        Node **pick = a->value <= b->value ? &a : &b;
        tail->next = *pick;
        *pick = (*pick)->next;
        tail = tail->next;
    }
    tail->next = a != NULL ? a : b;
    return dummy.next;
}

Node *list_merge_sort(Node *head) {
    if (head == NULL || head->next == NULL) return head;
    Node *slow = head;
    Node *fast = head->next;
    while (fast != NULL && fast->next != NULL) {
        slow = slow->next;
        fast = fast->next->next;
    }
    Node *right = slow->next;
    slow->next = NULL;
    return merge_nodes(list_merge_sort(head), list_merge_sort(right));
}`,
    cpp: `${cppSingly}static Node *merge_nodes(Node *a, Node *b) {
    Node dummy{0, nullptr};
    Node *tail = &dummy;
    while (a != nullptr && b != nullptr) {
        Node **pick = a->value <= b->value ? &a : &b;
        tail->next = *pick;
        *pick = (*pick)->next;
        tail = tail->next;
    }
    tail->next = a != nullptr ? a : b;
    return dummy.next;
}

Node *list_merge_sort(Node *head) {
    if (head == nullptr || head->next == nullptr) return head;
    Node *slow = head;
    Node *fast = head->next;
    while (fast != nullptr && fast->next != nullptr) {
        slow = slow->next;
        fast = fast->next->next;
    }
    Node *right = slow->next;
    slow->next = nullptr;
    return merge_nodes(list_merge_sort(head), list_merge_sort(right));
}`,
  }),
  problem({
    id: 'dsa-sll-remove-duplicates',
    after: 'dsa-linked',
    title: 'Remove duplicates from a sorted linked list',
    group: 'Singly linked-list interview problems',
    keywords: ['remove duplicates', 'sorted linked list', 'deduplicate'],
    definition: 'Deduplicating a sorted linked list compares adjacent nodes because equal values are contiguous, unlinking and releasing each repeated successor.',
    application: 'Ordered subscription lists and sorted event indexes compact repeated records in one pass while retaining the first record’s position.',
    recognition: ['the list is sorted so duplicates are adjacent', 'duplicates must be removed in place'],
    invariant: 'Every node through current is unique, and current->next is the only candidate that can duplicate current.',
    prediction: 'After removing a duplicate successor, why should current stay at the same node?',
    trace: ['Start at the first node of the sorted chain.', 'If the successor matches, bypass and release it.', 'Otherwise advance; null means all remaining nodes are unique.'],
    sample: ['1→1', '1→2', '2→3', '3→3'],
    kind: 'linked-list',
    complexity: 'O(n) time and O(1) extra space',
    trap: 'Advancing current immediately after deletion skips a run containing three or more equal values.',
    c: `${cSingly}void list_remove_sorted_duplicates(Node *head) {
    Node *current = head;
    while (current != NULL && current->next != NULL) {
        if (current->value == current->next->value) {
            Node *duplicate = current->next;
            current->next = duplicate->next;
            free(duplicate);
        } else {
            current = current->next;
        }
    }
}`,
    cpp: `${cppSingly}void list_remove_sorted_duplicates(Node *head) {
    Node *current = head;
    while (current != nullptr && current->next != nullptr) {
        if (current->value == current->next->value) {
            Node *duplicate = current->next;
            current->next = duplicate->next;
            delete duplicate;
        } else {
            current = current->next;
        }
    }
}`,
  }),
  problem({
    id: 'dsa-sll-intersection',
    after: 'dsa-linked',
    title: 'Find the intersection of two linked lists',
    group: 'Singly linked-list interview problems',
    keywords: ['intersection linked lists', 'shared node', 'pointer switching'],
    definition: 'Two acyclic linked lists intersect when they eventually share the same node address; pointer switching equalizes unequal prefix lengths without measuring them.',
    application: 'Shared immutable tails appear in persistent data structures and version histories, where identity—not equal payload—is the evidence of structural sharing.',
    recognition: ['two acyclic lists may share a suffix', 'the question asks for the shared node rather than an equal value'],
    invariant: 'Each pointer traverses exactly lengthA + lengthB edges after switching lists, so any prefix-length difference is cancelled.',
    prediction: 'If the lists do not intersect, where do both switched pointers meet?',
    trace: ['Start one pointer at each head.', 'At null, redirect each pointer to the other head.', 'They meet at the shared node or at null after equal total travel.'],
    sample: ['A→C', 'B→D', 'C→X', 'D→X', 'X→∅'],
    kind: 'linked-list',
    complexity: 'O(n + m) time and O(1) extra space',
    trap: 'Comparing values returns false intersections when distinct nodes contain the same payload; identity means address equality.',
    c: `${cSingly}Node *list_intersection(Node *a, Node *b) {
    Node *left = a;
    Node *right = b;
    while (left != right) {
        left = left == NULL ? b : left->next;
        right = right == NULL ? a : right->next;
    }
    return left;
}`,
    cpp: `${cppSingly}Node *list_intersection(Node *a, Node *b) {
    Node *left = a;
    Node *right = b;
    while (left != right) {
        left = left == nullptr ? b : left->next;
        right = right == nullptr ? a : right->next;
    }
    return left;
}`,
  }),
  problem({
    id: 'dsa-sll-palindrome',
    after: 'dsa-linked',
    title: 'Check whether a linked list is a palindrome',
    group: 'Singly linked-list interview problems',
    keywords: ['palindrome linked list', 'reverse second half', 'middle'],
    definition: 'A linked-list palindrome check finds the midpoint, reverses the second half, compares paired values, and restores the original links.',
    application: 'Integrity checks on forward-only token chains can compare mirrored metadata without allocating an array, while restoration preserves callers’ ownership expectations.',
    recognition: ['values must match from both ends but the list has no backward links', 'constant auxiliary memory is requested'],
    invariant: 'During comparison, left advances from the head and right advances through a reversed second half representing the original tail-to-middle order.',
    prediction: 'Why is restoring the second half part of a safe reusable implementation?',
    trace: ['Find the midpoint with fast and slow pointers.', 'Reverse the second half and compare corresponding values.', 'Reverse the second half again before returning the result.'],
    sample: ['1→2', '2→2', '2→1', '1→∅'],
    kind: 'linked-list',
    complexity: 'O(n) time and O(1) extra space',
    trap: 'Returning before restoration silently mutates an input that callers may still own and expect to remain unchanged.',
    techniques: [
      {
        term: 'Fast/slow midpoint',
        definition: 'Fast moving twice as quickly positions slow at the end of the first half without measuring the list.',
        example: 'That split isolates the suffix which represents the list’s right side.',
      },
      {
        term: 'Three-pointer reversal',
        definition: 'Reversing the suffix makes the original tail reachable in forward order for pairwise comparison.',
        example: 'Running the same reversal again restores the caller’s original list.',
      },
    ],
    related: [
      { id: 'dsa-sll-fast-slow-technique', title: 'Fast/slow pointer technique', reason: 'Supplies the midpoint without an extra length pass.' },
      { id: 'dsa-sll-three-pointer-reversal', title: 'Three-pointer reversal', reason: 'Exposes the original tail in forward traversal order.' },
      { id: 'dsa-sll-reorder', title: 'Reorder a linked list', reason: 'Uses the same split and reverse steps, then weaves instead of comparing.' },
    ],
    c: `${cSingly}static Node *reverse_half(Node *head) {
    Node *previous = NULL;
    while (head != NULL) {
        Node *next = head->next;
        head->next = previous;
        previous = head;
        head = next;
    }
    return previous;
}

int list_is_palindrome(Node *head) {
    if (head == NULL || head->next == NULL) return 1;
    Node *slow = head;
    Node *fast = head;
    while (fast->next != NULL && fast->next->next != NULL) {
        slow = slow->next;
        fast = fast->next->next;
    }
    Node *second = reverse_half(slow->next);
    Node *right = second;
    Node *left = head;
    int equal = 1;
    while (right != NULL) {
        if (left->value != right->value) equal = 0;
        left = left->next;
        right = right->next;
    }
    slow->next = reverse_half(second);
    return equal;
}`,
    cpp: `${cppSingly}static Node *reverse_half(Node *head) {
    Node *previous = nullptr;
    while (head != nullptr) {
        Node *next = head->next;
        head->next = previous;
        previous = head;
        head = next;
    }
    return previous;
}

bool list_is_palindrome(Node *head) {
    if (head == nullptr || head->next == nullptr) return true;
    Node *slow = head;
    Node *fast = head;
    while (fast->next != nullptr && fast->next->next != nullptr) {
        slow = slow->next;
        fast = fast->next->next;
    }
    Node *second = reverse_half(slow->next);
    Node *right = second;
    Node *left = head;
    bool equal = true;
    while (right != nullptr) {
        if (left->value != right->value) equal = false;
        left = left->next;
        right = right->next;
    }
    slow->next = reverse_half(second);
    return equal;
}`,
  }),
  problem({
    id: 'dsa-sll-reorder',
    after: 'dsa-linked',
    title: 'Reorder a linked list by alternating its ends',
    group: 'Singly linked-list interview problems',
    keywords: ['reorder list', 'middle', 'reverse second half', 'weave'],
    definition: 'Reordering L0→L1→…→Ln into L0→Ln→L1→Ln−1 combines three established operations: split at the middle, reverse the second half, and weave the two chains alternately.',
    application: 'A playlist or work queue can interleave oldest and newest pending records without allocating an index array or moving the records themselves.',
    recognition: ['output alternates nodes from the front and back', 'the list has only forward links and must be changed in place'],
    invariant: 'During weaving, the output prefix already has the required alternating order while first and second head the untouched remainder of each prepared half.',
    prediction: 'Why does reversing the second half turn repeated tail selection into ordinary head removal?',
    trace: ['Use fast and slow pointers to end the first half and detach the second.', 'Reverse the second half with previous, current, and next.', 'Alternate one node from each half until the reversed half is exhausted.'],
    sample: ['1→2', '2→3', '3→4', '4→5'],
    kind: 'linked-list',
    complexity: 'O(n) time and O(1) extra space',
    trap: 'Failing to split before reversal can create a cycle when the two halves are woven back together.',
    techniques: [
      {
        term: 'Fast/slow midpoint',
        definition: 'The 2:1 pointer relationship identifies where the first half must end without measuring the full list.',
        example: 'slow stops at the final node of the first half before slow->next is detached.',
      },
      {
        term: 'Three-pointer reversal',
        definition: 'Reversing the detached second half exposes original tail nodes in the exact order needed for alternating insertion.',
        example: 'For 4→5, reversal produces 5→4 so the first node taken is the old tail.',
      },
    ],
    related: [
      { id: 'dsa-sll-middle', title: 'Find the middle node', reason: 'Provides the split point.' },
      { id: 'dsa-sll-three-pointer-reversal', title: 'Three-pointer reversal', reason: 'Turns the tail half into a forward chain.' },
      { id: 'dsa-sll-palindrome', title: 'Palindrome linked list', reason: 'Uses the same middle-plus-reverse preparation but compares instead of weaving.' },
    ],
    c: `${cSingly}static Node *reverse_for_reorder(Node *head) {
    Node *previous = NULL;
    while (head != NULL) {
        Node *next = head->next;
        head->next = previous;
        previous = head;
        head = next;
    }
    return previous;
}

Node *reorder_list(Node *head) {
    if (head == NULL || head->next == NULL) return head;
    Node *slow = head;
    Node *fast = head;
    while (fast->next != NULL && fast->next->next != NULL) {
        slow = slow->next;
        fast = fast->next->next;
    }
    Node *second = reverse_for_reorder(slow->next);
    slow->next = NULL;
    Node *first = head;
    while (second != NULL) {
        Node *first_next = first->next;
        Node *second_next = second->next;
        first->next = second;
        second->next = first_next;
        first = first_next;
        second = second_next;
    }
    return head;
}`,
    cpp: `${cppSingly}static Node *reverse_for_reorder(Node *head) {
    Node *previous = nullptr;
    while (head != nullptr) {
        Node *next = head->next;
        head->next = previous;
        previous = head;
        head = next;
    }
    return previous;
}

Node *reorder_list(Node *head) {
    if (head == nullptr || head->next == nullptr) return head;
    Node *slow = head;
    Node *fast = head;
    while (fast->next != nullptr && fast->next->next != nullptr) {
        slow = slow->next;
        fast = fast->next->next;
    }
    Node *second = reverse_for_reorder(slow->next);
    slow->next = nullptr;
    Node *first = head;
    while (second != nullptr) {
        Node *first_next = first->next;
        Node *second_next = second->next;
        first->next = second;
        second->next = first_next;
        first = first_next;
        second = second_next;
    }
    return head;
}`,
  }),
  problem({
    id: 'dsa-sll-reverse-k-group',
    after: 'dsa-linked',
    title: 'Reverse nodes in k-sized groups',
    group: 'Singly linked-list interview problems',
    keywords: ['reverse k group', 'dummy head', 'three pointers', 'linked list'],
    definition: 'K-group reversal first proves that a complete group of k nodes exists, reverses exactly that bounded segment, reconnects both boundaries, and leaves an incomplete final group unchanged.',
    application: 'Chunked record pipelines can reverse fixed-size batches while preserving batch order and leaving a short final batch untouched.',
    recognition: ['the same in-place reversal repeats over fixed-size segments', 'an incomplete suffix must retain its original order'],
    invariant: 'Everything before group_previous is finalized; group_previous->next starts the next candidate group, and no links in an unverified short suffix are changed.',
    prediction: 'Why must the kth node be located before any pointer in the candidate group is reversed?',
    trace: ['From the dummy predecessor, locate the kth node or return unchanged.', 'Reverse links until current reaches the saved group_next boundary.', 'Reconnect the predecessor and old group head, then repeat from that old head.'],
    sample: ['dummy→1', '1→2', '2→3', '3→4', 'k=2'],
    kind: 'linked-list',
    complexity: 'O(n) time and O(1) extra space',
    trap: 'Starting reversal before proving k nodes exist mutates an incomplete suffix that the specification says must remain unchanged.',
    techniques: [
      {
        term: 'Dummy group predecessor',
        definition: 'A sentinel makes reconnecting the first reversed group identical to reconnecting every later group.',
        example: 'group_previous->next always becomes the kth node, even when group_previous is dummy.',
      },
      {
        term: 'Bounded three-pointer reversal',
        definition: 'The normal previous-current-next loop stops at group_next instead of null, reversing exactly one verified group.',
        example: 'previous begins at group_next so the old group head automatically points to the untouched suffix.',
      },
    ],
    related: [
      { id: 'dsa-sll-dummy-head', title: 'Dummy-head technique', reason: 'Provides one predecessor before the first and every later group.' },
      { id: 'dsa-sll-three-pointer-reversal', title: 'Three-pointer reversal', reason: 'Supplies the link-flipping core inside each group.' },
      { id: 'dsa-sll-reorder', title: 'Reorder a linked list', reason: 'Another compound problem built from bounded rewiring operations.' },
    ],
    c: `${cSingly}Node *reverse_k_group(Node *head, size_t k) {
    if (k < 2) return head;
    Node dummy = {0, head};
    Node *group_previous = &dummy;
    for (;;) {
        Node *kth = group_previous;
        for (size_t step = 0; step < k && kth != NULL; step++) {
            kth = kth->next;
        }
        if (kth == NULL) return dummy.next;
        Node *group_next = kth->next;
        Node *previous = group_next;
        Node *current = group_previous->next;
        while (current != group_next) {
            Node *next = current->next;
            current->next = previous;
            previous = current;
            current = next;
        }
        Node *old_group_head = group_previous->next;
        group_previous->next = kth;
        group_previous = old_group_head;
    }
}`,
    cpp: `${cppSingly}Node *reverse_k_group(Node *head, std::size_t k) {
    if (k < 2) return head;
    Node dummy{0, head};
    Node *group_previous = &dummy;
    for (;;) {
        Node *kth = group_previous;
        for (std::size_t step = 0; step < k && kth != nullptr; ++step) {
            kth = kth->next;
        }
        if (kth == nullptr) return dummy.next;
        Node *group_next = kth->next;
        Node *previous = group_next;
        Node *current = group_previous->next;
        while (current != group_next) {
            Node *next = current->next;
            current->next = previous;
            previous = current;
            current = next;
        }
        Node *old_group_head = group_previous->next;
        group_previous->next = kth;
        group_previous = old_group_head;
    }
}`,
  }),
  problem({
    id: 'dsa-sll-add-numbers',
    after: 'dsa-linked',
    title: 'Add numbers stored in linked lists',
    group: 'Singly linked-list interview problems',
    keywords: ['add two numbers', 'carry', 'linked list digits'],
    definition: 'Digit-list addition walks both reversed-digit lists together, emits sum modulo ten, and carries integer division by ten into the next position.',
    application: 'Arbitrary-precision arithmetic stores digits or limbs in linked chunks when values outgrow machine integers and must be processed without conversion overflow.',
    recognition: ['each node stores one digit or limb', 'addition must continue while either input or carry remains'],
    invariant: 'Before each iteration, carry contains exactly the overflow from the lower positions already emitted to the result.',
    prediction: 'Why must the loop continue after both input pointers are null when carry is nonzero?',
    trace: ['Read missing digits as zero and add the incoming carry.', 'Append sum modulo ten and retain sum divided by ten.', 'Stop only when both lists and carry are exhausted.'],
    sample: ['2→4→3', '5→6→4', 'result=7→0→8'],
    kind: 'linked-list',
    complexity: 'O(max(n, m)) time and O(max(n, m)) result space',
    trap: 'Stopping when one list ends drops remaining digits, and stopping before carry is zero drops the highest result digit.',
    c: `${cSingly}Node *list_add_numbers(const Node *a, const Node *b) {
    Node dummy = {0, NULL};
    Node *tail = &dummy;
    int carry = 0;
    while (a != NULL || b != NULL || carry != 0) {
        int sum = carry;
        if (a != NULL) { sum += a->value; a = a->next; }
        if (b != NULL) { sum += b->value; b = b->next; }
        Node *digit = malloc(sizeof *digit);
        if (digit == NULL) {
            while (dummy.next != NULL) {
                Node *next = dummy.next->next;
                free(dummy.next);
                dummy.next = next;
            }
            return NULL;
        }
        digit->value = sum % 10;
        digit->next = NULL;
        tail->next = digit;
        tail = digit;
        carry = sum / 10;
    }
    return dummy.next;
}`,
    cpp: `${cppSingly}Node *list_add_numbers(const Node *a, const Node *b) {
    Node dummy{0, nullptr};
    Node *tail = &dummy;
    int carry = 0;
    while (a != nullptr || b != nullptr || carry != 0) {
        int sum = carry;
        if (a != nullptr) { sum += a->value; a = a->next; }
        if (b != nullptr) { sum += b->value; b = b->next; }
        tail->next = new Node{sum % 10, nullptr};
        tail = tail->next;
        carry = sum / 10;
    }
    return dummy.next;
}`,
  }),
];

const linearStructureProblems = [
  problem({
    id: 'dsa-dll-insert',
    after: 'dsa-linked',
    title: 'Insert into a doubly linked list',
    group: 'Doubly linked lists',
    keywords: ['doubly linked list', 'insert', 'prev', 'next'],
    definition: 'Doubly linked-list insertion connects a new node to both neighbors and updates each neighbor’s reciprocal link so forward and backward traversal agree.',
    application: 'Browser histories, media playlists, and intrusive kernel lists move in both directions and remove known records without searching for a predecessor.',
    recognition: ['nodes carry both next and previous links', 'a new node must be reachable consistently from either direction'],
    invariant: 'For every adjacent pair left and right, left->next equals right exactly when right->prev equals left.',
    prediction: 'Which four links can change when inserting between two existing nodes?',
    trace: ['Identify left and its old right neighbor.', 'Point the new node toward both neighbors.', 'Redirect each existing neighbor back toward the new node.'],
    sample: ['A⇄C', 'new=B', 'A⇄B', 'B⇄C'],
    kind: 'linked-list',
    complexity: 'O(1) after the insertion position is known',
    trap: 'Updating only next links creates a list that looks correct forward but is corrupted during backward traversal.',
    c: `#include <stdlib.h>

typedef struct DNode {
    int value;
    struct DNode *prev;
    struct DNode *next;
} DNode;

int dll_insert_after(DNode *left, int value) {
    if (left == NULL) return 0;
    DNode *node = malloc(sizeof *node);
    if (node == NULL) return 0;
    node->value = value;
    node->prev = left;
    node->next = left->next;
    if (left->next != NULL) left->next->prev = node;
    left->next = node;
    return 1;
}`,
    cpp: `struct DNode {
    int value;
    DNode *prev;
    DNode *next;
};

void dll_insert_after(DNode *left, int value) {
    if (left == nullptr) return;
    DNode *node = new DNode{value, left, left->next};
    if (left->next != nullptr) left->next->prev = node;
    left->next = node;
}`,
  }),
  problem({
    id: 'dsa-dll-delete',
    after: 'dsa-linked',
    title: 'Delete from a doubly linked list',
    group: 'Doubly linked lists',
    keywords: ['doubly linked list delete', 'unlink', 'head tail'],
    definition: 'Deleting a known doubly linked-list node makes its predecessor and successor point to one another, adjusts head when needed, then releases the detached node.',
    application: 'LRU caches and scheduler run queues unlink known entries in constant time because the node itself carries the address of both neighbors.',
    recognition: ['the exact node address is already known', 'removal must support head, middle, and tail uniformly'],
    invariant: 'After unlinking, every surviving next edge has a matching prev edge and no surviving node points to the removed node.',
    prediction: 'How does deletion change when either neighbor is null?',
    trace: ['Save the target’s previous and next neighbors.', 'Bridge the neighbors or update head at the boundary.', 'Release the now-unreachable target.'],
    sample: ['A⇄B', 'B⇄C', 'remove=B', 'A⇄C'],
    kind: 'linked-list',
    complexity: 'O(1) time and O(1) extra space',
    trap: 'Reading target links after deletion is a use-after-free; bridge both directions before releasing the target.',
    c: `#include <stdlib.h>

typedef struct DNode {
    int value;
    struct DNode *prev;
    struct DNode *next;
} DNode;

void dll_remove(DNode **head, DNode *target) {
    if (head == NULL || target == NULL) return;
    if (target->prev != NULL) target->prev->next = target->next;
    else *head = target->next;
    if (target->next != NULL) target->next->prev = target->prev;
    free(target);
}`,
    cpp: `struct DNode {
    int value;
    DNode *prev;
    DNode *next;
};

void dll_remove(DNode *&head, DNode *target) {
    if (target == nullptr) return;
    if (target->prev != nullptr) target->prev->next = target->next;
    else head = target->next;
    if (target->next != nullptr) target->next->prev = target->prev;
    delete target;
}`,
  }),
  problem({
    id: 'dsa-dll-reverse',
    after: 'dsa-linked',
    title: 'Reverse a doubly linked list',
    group: 'Doubly linked lists',
    keywords: ['reverse doubly linked list', 'swap prev next'],
    definition: 'Reversing a doubly linked list swaps prev and next in every node; the old tail becomes the new head after the final swap.',
    application: 'Bidirectional histories reverse traversal direction in place when an operation must replay records from the opposite endpoint.',
    recognition: ['both directions must be reversed', 'every node already contains both neighboring links'],
    invariant: 'All processed nodes have both links swapped, while current follows the old next link saved through its newly assigned prev field.',
    prediction: 'After swapping one node’s links, which field still leads to the next unprocessed node?',
    trace: ['At each node, swap prev and next.', 'Advance through the field that now contains the old next link.', 'The last processed node is the new head.'],
    sample: ['A⇄B', 'B⇄C', 'C⇄∅'],
    kind: 'linked-list',
    complexity: 'O(n) time and O(1) extra space',
    trap: 'Advancing through next after the swap walks backward into the processed prefix.',
    c: `#include <stddef.h>

typedef struct DNode {
    int value;
    struct DNode *prev;
    struct DNode *next;
} DNode;

DNode *dll_reverse(DNode *head) {
    DNode *current = head;
    DNode *new_head = NULL;
    while (current != NULL) {
        DNode *old_next = current->next;
        current->next = current->prev;
        current->prev = old_next;
        new_head = current;
        current = old_next;
    }
    return new_head;
}`,
    cpp: `struct DNode {
    int value;
    DNode *prev;
    DNode *next;
};

DNode *dll_reverse(DNode *head) {
    DNode *current = head;
    DNode *new_head = nullptr;
    while (current != nullptr) {
        DNode *old_next = current->next;
        current->next = current->prev;
        current->prev = old_next;
        new_head = current;
        current = old_next;
    }
    return new_head;
}`,
  }),
  problem({
    id: 'dsa-cll-traversal',
    after: 'dsa-linked',
    title: 'Traverse a circular linked list safely',
    group: 'Circular linked lists',
    keywords: ['circular linked list', 'traversal', 'head again'],
    definition: 'Circular-list traversal processes head once, follows next links, and stops when the pointer returns to head rather than waiting for null.',
    application: 'Round-robin schedulers, token rings, and repeating playlists represent the successor of the last participant as the first participant.',
    recognition: ['the tail links back to head', 'null is not the normal termination condition'],
    invariant: 'Current always points to one node in the ring, and each iteration processes the next previously unvisited node until head reappears.',
    prediction: 'Why does a conventional while (current != null) traversal never finish?',
    trace: ['Handle an empty ring before entering the loop.', 'Process head and advance around the ring.', 'Stop exactly when current returns to head.'],
    sample: ['A→B', 'B→C', 'C→A'],
    kind: 'linked-list',
    complexity: 'O(n) time and O(1) extra space',
    trap: 'Checking current != head before processing head skips the entire ring; a do-while shape matches the structure.',
    c: `#include <stddef.h>

typedef struct CNode {
    int value;
    struct CNode *next;
} CNode;

size_t circular_length(const CNode *head) {
    if (head == NULL) return 0;
    size_t count = 0;
    const CNode *current = head;
    do {
        count++;
        current = current->next;
    } while (current != head);
    return count;
}`,
    cpp: `#include <cstddef>

struct CNode {
    int value;
    CNode *next;
};

std::size_t circular_length(const CNode *head) {
    if (head == nullptr) return 0;
    std::size_t count = 0;
    const CNode *current = head;
    do {
        ++count;
        current = current->next;
    } while (current != head);
    return count;
}`,
  }),
  problem({
    id: 'dsa-cll-insert-delete',
    after: 'dsa-linked',
    title: 'Insert and delete in a circular linked list',
    group: 'Circular linked lists',
    keywords: ['circular insert', 'circular delete', 'tail'],
    definition: 'Circular-list mutation preserves one closed ring, including the single-node case where the node’s next link points to itself.',
    application: 'Round-robin work queues insert participants at the tail and remove completed participants while retaining a valid next participant.',
    recognition: ['the last node must always reach head', 'empty and one-node states change the ownership boundary'],
    invariant: 'When the ring is nonempty, tail->next is head and every reachable node returns to head after finitely many next steps.',
    prediction: 'What should head and tail become when the only node is deleted?',
    trace: ['For an empty ring, make the new node point to itself.', 'For insertion, place the node between tail and head.', 'For deletion, bridge the predecessor and update head or tail as required.'],
    sample: ['tail=C', 'C→A', 'insert=D', 'D→A'],
    kind: 'linked-list',
    complexity: 'O(1) tail insertion and O(n) deletion by value',
    trap: 'Updating head without updating tail->next breaks the ring at the ownership boundary.',
    c: `#include <stdlib.h>

typedef struct CNode {
    int value;
    struct CNode *next;
} CNode;

int circular_push_back(CNode **tail, int value) {
    if (tail == NULL) return 0;
    CNode *node = malloc(sizeof *node);
    if (node == NULL) return 0;
    node->value = value;
    if (*tail == NULL) {
        node->next = node;
    } else {
        node->next = (*tail)->next;
        (*tail)->next = node;
    }
    *tail = node;
    return 1;
}

int circular_remove_head(CNode **tail) {
    if (tail == NULL || *tail == NULL) return 0;
    CNode *head = (*tail)->next;
    if (head == *tail) *tail = NULL;
    else (*tail)->next = head->next;
    free(head);
    return 1;
}`,
    cpp: `struct CNode {
    int value;
    CNode *next;
};

void circular_push_back(CNode *&tail, int value) {
    CNode *node = new CNode{value, nullptr};
    if (tail == nullptr) node->next = node;
    else {
        node->next = tail->next;
        tail->next = node;
    }
    tail = node;
}

bool circular_remove_head(CNode *&tail) {
    if (tail == nullptr) return false;
    CNode *head = tail->next;
    if (head == tail) tail = nullptr;
    else tail->next = head->next;
    delete head;
    return true;
}`,
  }),
  problem({
    id: 'dsa-cll-josephus',
    after: 'dsa-linked',
    title: 'Josephus elimination on a circular list',
    group: 'Circular linked-list interview problems',
    keywords: ['Josephus', 'round robin elimination', 'circular list'],
    definition: 'Josephus elimination repeatedly advances k−1 live links, removes the kth node, and resumes from its successor until one node remains.',
    application: 'Rotating leader election and fair service simulations use the same circular successor rule when participants leave after receiving a turn.',
    recognition: ['participants repeat cyclically', 'every kth live participant is removed'],
    invariant: 'Current is the first participant counted in the next round, and the ring contains exactly the participants not yet eliminated.',
    prediction: 'After deleting the kth participant, which node receives count one in the next round?',
    trace: ['Form a circular list of live participants.', 'Advance to the predecessor of the kth live node.', 'Remove that node and continue from its successor until one remains.'],
    sample: ['1→2', '2→3', '3→4', '4→1'],
    kind: 'linked-list',
    complexity: 'O(nk) direct simulation time and O(n) node storage',
    trap: 'Restarting from head after each deletion changes the problem; counting resumes at the removed node’s successor.',
    c: `#include <stdlib.h>

typedef struct CNode {
    int value;
    struct CNode *next;
} CNode;

int josephus(CNode *tail, size_t step) {
    if (tail == NULL || step == 0) return -1;
    CNode *previous = tail;
    CNode *current = tail->next;
    while (current->next != current) {
        for (size_t count = 1; count < step; count++) {
            previous = current;
            current = current->next;
        }
        previous->next = current->next;
        free(current);
        current = previous->next;
    }
    int survivor = current->value;
    free(current);
    return survivor;
}`,
    cpp: `#include <cstddef>

struct CNode {
    int value;
    CNode *next;
};

int josephus(CNode *tail, std::size_t step) {
    if (tail == nullptr || step == 0) return -1;
    CNode *previous = tail;
    CNode *current = tail->next;
    while (current->next != current) {
        for (std::size_t count = 1; count < step; ++count) {
            previous = current;
            current = current->next;
        }
        previous->next = current->next;
        delete current;
        current = previous->next;
    }
    int survivor = current->value;
    delete current;
    return survivor;
}`,
  }),
  problem({
    id: 'dsa-stack-array',
    after: 'dsa-stack-queue',
    title: 'Implement a stack with an array',
    group: 'Stacks',
    keywords: ['array stack', 'push', 'pop', 'top'],
    definition: 'An array stack stores the active elements in a contiguous prefix and uses size as both the element count and the next insertion index.',
    application: 'Expression evaluators, parser state, iterative DFS, and bounded embedded histories use array stacks when maximum capacity is known.',
    recognition: ['only the most recently inserted item may be removed', 'bounded contiguous storage is acceptable'],
    invariant: 'Valid elements occupy indexes [0, size), the top is size−1 when nonempty, and size never exceeds capacity.',
    prediction: 'Which boundary distinguishes a full stack from the next valid push?',
    trace: ['Initialize size to zero.', 'Push at data[size], then increment size.', 'Pop by decrementing size, then reading the former top slot.'],
    sample: ['bottom', '4', '7', 'top'],
    kind: 'circular-buffer',
    complexity: 'O(1) push, pop, and top with O(capacity) storage',
    trap: 'Reading data[size] during pop is one past the top; decrement before reading or read data[size−1].',
    c: `#include <stddef.h>

typedef struct {
    int *data;
    size_t size;
    size_t capacity;
} Stack;

int stack_push(Stack *stack, int value) {
    if (stack == NULL || stack->size == stack->capacity) return 0;
    stack->data[stack->size++] = value;
    return 1;
}

int stack_pop(Stack *stack, int *value) {
    if (stack == NULL || value == NULL || stack->size == 0) return 0;
    *value = stack->data[--stack->size];
    return 1;
}`,
    cpp: `#include <cstddef>
#include <vector>

class Stack {
public:
    explicit Stack(std::size_t capacity) : capacity_(capacity) {}
    bool push(int value) {
        if (data_.size() == capacity_) return false;
        data_.push_back(value);
        return true;
    }
    bool pop(int &value) {
        if (data_.empty()) return false;
        value = data_.back();
        data_.pop_back();
        return true;
    }
private:
    std::vector<int> data_;
    std::size_t capacity_;
};`,
  }),
  problem({
    id: 'dsa-stack-linked',
    after: 'dsa-stack-queue',
    title: 'Implement a stack with a linked list',
    group: 'Stacks',
    keywords: ['linked stack', 'push pop', 'top node'],
    definition: 'A linked stack treats the list head as the top, so push inserts at head and pop removes head without traversing the list.',
    application: 'Unbounded work stacks use one allocation per pending item when a fixed capacity cannot be chosen and contiguous reallocation is undesirable.',
    recognition: ['LIFO behavior is required', 'capacity should grow one node at a time'],
    invariant: 'Top points to the newest live node, and following next links visits items from newest to oldest.',
    prediction: 'Why would using the list tail as top make a singly linked stack inefficient?',
    trace: ['Push a new node whose next is the old top.', 'Move top to the new node.', 'Pop by saving top, advancing top, and releasing the saved node.'],
    sample: ['top=9', '9→5', '5→2', '2→∅'],
    kind: 'linked-list',
    complexity: 'O(1) push and pop with O(n) node storage',
    trap: 'Returning a value after freeing its node is safe only if the value was copied before the free.',
    c: `${cSingly}int stack_push(Node **top, int value) {
    if (top == NULL) return 0;
    Node *node = malloc(sizeof *node);
    if (node == NULL) return 0;
    node->value = value;
    node->next = *top;
    *top = node;
    return 1;
}

int stack_pop(Node **top, int *value) {
    if (top == NULL || *top == NULL || value == NULL) return 0;
    Node *removed = *top;
    *value = removed->value;
    *top = removed->next;
    free(removed);
    return 1;
}`,
    cpp: `${cppSingly}void stack_push(Node *&top, int value) {
    top = new Node{value, top};
}

bool stack_pop(Node *&top, int &value) {
    if (top == nullptr) return false;
    Node *removed = top;
    value = removed->value;
    top = removed->next;
    delete removed;
    return true;
}`,
  }),
  problem({
    id: 'dsa-valid-parentheses',
    after: 'dsa-stack-queue',
    title: 'Valid parentheses and balanced delimiters',
    group: 'Stack interview problems',
    keywords: ['valid parentheses', 'balanced brackets', 'stack'],
    definition: 'Balanced-delimiter checking pushes each opening symbol and requires every closing symbol to match and remove the most recent unmatched opener.',
    application: 'Compilers, editors, and configuration parsers reject malformed nesting before later stages interpret the contents between delimiters.',
    recognition: ['nested pairs must close in reverse opening order', 'a mismatch must be detected at the earliest closing symbol'],
    invariant: 'The stack contains exactly the unmatched opening delimiters for the processed prefix, ordered from oldest at bottom to newest at top.',
    prediction: 'What does an empty stack mean when a closing delimiter arrives?',
    trace: ['Push each opening delimiter.', 'For a closer, require a matching top and pop it.', 'After the scan, an empty stack proves every opener was matched.'],
    sample: ['(', '[', ']', ')'],
    kind: 'array',
    complexity: 'O(n) time and O(n) worst-case stack space',
    trap: 'Matching only counts accepts ([)] even though the nesting order is invalid.',
    c: `#include <stddef.h>
#include <stdlib.h>

int valid_parentheses(const char *text) {
    if (text == NULL) return 0;
    size_t length = 0;
    while (text[length] != '\\0') length++;
    char *stack = malloc(length == 0 ? 1 : length);
    if (stack == NULL) return 0;
    size_t size = 0;
    int valid = 1;
    for (size_t i = 0; text[i] != '\\0' && valid; i++) {
        char c = text[i];
        if (c == '(' || c == '[' || c == '{') stack[size++] = c;
        else if (c == ')' || c == ']' || c == '}') {
            if (size == 0) valid = 0;
            else {
                char open = stack[--size];
                valid = (open == '(' && c == ')') ||
                        (open == '[' && c == ']') ||
                        (open == '{' && c == '}');
            }
        }
    }
    valid = valid && size == 0;
    free(stack);
    return valid;
}`,
    cpp: `#include <string_view>
#include <vector>

bool valid_parentheses(std::string_view text) {
    std::vector<char> stack;
    for (char c : text) {
        if (c == '(' || c == '[' || c == '{') stack.push_back(c);
        else if (c == ')' || c == ']' || c == '}') {
            if (stack.empty()) return false;
            char open = stack.back();
            stack.pop_back();
            if (!((open == '(' && c == ')') ||
                  (open == '[' && c == ']') ||
                  (open == '{' && c == '}'))) return false;
        }
    }
    return stack.empty();
}`,
  }),
  problem({
    id: 'dsa-min-stack',
    after: 'dsa-stack-queue',
    title: 'Min stack with constant-time minimum',
    group: 'Stack interview problems',
    keywords: ['min stack', 'minimum', 'auxiliary stack'],
    definition: 'A min stack stores the minimum associated with every depth, so removing the top also restores the minimum for the previous depth.',
    application: 'Online risk limits and telemetry windows query the smallest active threshold while adding and rolling back states in LIFO order.',
    recognition: ['push and pop are LIFO', 'minimum must be reported in O(1) after every update'],
    invariant: 'mins[i] equals the minimum of values[0..i], making mins[size−1] the minimum of the entire live stack.',
    prediction: 'Why must duplicate minimum values be recorded at multiple depths?',
    trace: ['Push the value and min(value, previous minimum).', 'Read the current minimum from the parallel top.', 'Pop both arrays so the previous minimum is restored.'],
    sample: ['values=5,2,2', 'mins=5,2,2'],
    kind: 'stack-queue',
    complexity: 'O(1) operations and O(n) auxiliary storage',
    trap: 'Storing each distinct minimum only once loses the correct state when duplicate minima are popped separately.',
    c: `#include <stddef.h>

typedef struct {
    int *values;
    int *mins;
    size_t size;
    size_t capacity;
} MinStack;

int min_stack_push(MinStack *stack, int value) {
    if (stack == NULL || stack->size == stack->capacity) return 0;
    int minimum = stack->size == 0 || value < stack->mins[stack->size - 1]
        ? value : stack->mins[stack->size - 1];
    stack->values[stack->size] = value;
    stack->mins[stack->size++] = minimum;
    return 1;
}

int min_stack_min(const MinStack *stack, int *value) {
    if (stack == NULL || value == NULL || stack->size == 0) return 0;
    *value = stack->mins[stack->size - 1];
    return 1;
}`,
    cpp: `#include <algorithm>
#include <vector>

class MinStack {
public:
    void push(int value) {
        values_.push_back(value);
        mins_.push_back(mins_.empty() ? value : std::min(value, mins_.back()));
    }
    void pop() {
        values_.pop_back();
        mins_.pop_back();
    }
    int minimum() const {
        return mins_.back();
    }
private:
    std::vector<int> values_;
    std::vector<int> mins_;
};`,
  }),
  problem({
    id: 'dsa-next-greater-element',
    after: 'dsa-monotonic',
    title: 'Next greater element with a monotonic stack',
    group: 'Stack interview problems',
    keywords: ['next greater element', 'monotonic stack', 'indices'],
    definition: 'Next-greater-element scanning keeps unresolved indices in decreasing value order and resolves smaller tops when a larger value arrives.',
    application: 'Telemetry systems find the next time a threshold is exceeded, and pricing tools locate the next later observation that dominates a current one.',
    recognition: ['each item asks for the nearest later larger value', 'a quadratic forward scan must be avoided'],
    invariant: 'Stack indices are in encounter order and their values are non-increasing; none has yet seen a greater value to its right.',
    prediction: 'Why can every index popped by the current value never need to return to the stack?',
    trace: ['Read a new value with unresolved indices on the stack.', 'Pop and answer every smaller top index.', 'Push the current index; unresolved entries finish with −1.'],
    sample: ['2', '1', '2', '4', '3'],
    kind: 'stack-queue',
    complexity: 'O(n) time and O(n) stack space',
    trap: 'Storing values instead of indices loses the output position and mishandles duplicates.',
    c: `#include <stddef.h>
#include <stdlib.h>

int *next_greater(const int *values, size_t count) {
    int *answer = malloc(count * sizeof *answer);
    size_t *stack = malloc(count * sizeof *stack);
    if ((count != 0) && (answer == NULL || stack == NULL)) {
        free(answer);
        free(stack);
        return NULL;
    }
    size_t size = 0;
    for (size_t i = 0; i < count; i++) {
        answer[i] = -1;
        while (size != 0 && values[stack[size - 1]] < values[i]) {
            answer[stack[--size]] = values[i];
        }
        stack[size++] = i;
    }
    free(stack);
    return answer;
}`,
    cpp: `#include <cstddef>
#include <vector>

std::vector<int> next_greater(const std::vector<int> &values) {
    std::vector<int> answer(values.size(), -1);
    std::vector<std::size_t> stack;
    for (std::size_t i = 0; i < values.size(); ++i) {
        while (!stack.empty() && values[stack.back()] < values[i]) {
            answer[stack.back()] = values[i];
            stack.pop_back();
        }
        stack.push_back(i);
    }
    return answer;
}`,
  }),
  problem({
    id: 'dsa-postfix-evaluation',
    after: 'dsa-stack-queue',
    title: 'Evaluate a postfix expression',
    group: 'Stack interview problems',
    keywords: ['postfix evaluation', 'RPN', 'expression stack'],
    definition: 'Postfix evaluation pushes operands and, for each operator, pops the right operand then the left operand, applies the operator, and pushes the result.',
    application: 'Bytecode interpreters and calculator engines use postfix-like instruction streams because evaluation order is explicit and parentheses are unnecessary.',
    recognition: ['operators follow their operands', 'nested partial results must be completed in LIFO order'],
    invariant: 'The stack contains exactly the completed values for subexpressions in the processed token prefix that still await an outer operator.',
    prediction: 'Why does operand pop order matter for subtraction and division?',
    trace: ['Push each numeric operand.', 'On an operator, pop right then left and push left op right.', 'One final stack value is the expression result.'],
    sample: ['2', '3', '4', '*', '+'],
    kind: 'stack-queue',
    complexity: 'O(n) time and O(n) stack space',
    trap: 'Popping left before right reverses non-commutative operations, and fewer than two operands means the expression is malformed.',
    c: `#include <stddef.h>

int evaluate_postfix(const char *tokens, size_t count, int *result) {
    int stack[128];
    size_t size = 0;
    for (size_t i = 0; i < count; i++) {
        char token = tokens[i];
        if (token >= '0' && token <= '9') {
            if (size == 128) return 0;
            stack[size++] = token - '0';
        } else {
            if (size < 2) return 0;
            int right = stack[--size];
            int left = stack[--size];
            if (token == '+') stack[size++] = left + right;
            else if (token == '-') stack[size++] = left - right;
            else if (token == '*') stack[size++] = left * right;
            else if (token == '/' && right != 0) stack[size++] = left / right;
            else return 0;
        }
    }
    if (size != 1 || result == NULL) return 0;
    *result = stack[0];
    return 1;
}`,
    cpp: `#include <stdexcept>
#include <vector>

int evaluate_postfix(const std::vector<char> &tokens) {
    std::vector<int> stack;
    for (char token : tokens) {
        if (token >= '0' && token <= '9') stack.push_back(token - '0');
        else {
            if (stack.size() < 2) throw std::invalid_argument("malformed postfix");
            int right = stack.back(); stack.pop_back();
            int left = stack.back(); stack.pop_back();
            if (token == '+') stack.push_back(left + right);
            else if (token == '-') stack.push_back(left - right);
            else if (token == '*') stack.push_back(left * right);
            else if (token == '/' && right != 0) stack.push_back(left / right);
            else throw std::invalid_argument("bad operator");
        }
    }
    if (stack.size() != 1) throw std::invalid_argument("malformed postfix");
    return stack.back();
}`,
  }),
  problem({
    id: 'dsa-linked-queue',
    after: 'dsa-stack-queue',
    title: 'Implement a queue with a linked list',
    group: 'Queues',
    keywords: ['linked queue', 'enqueue', 'dequeue', 'front rear'],
    definition: 'A linked queue inserts at tail and removes at head, retaining both pointers so neither operation traverses the list.',
    application: 'Work dispatchers and event loops enqueue independently allocated jobs and dequeue them in arrival order without shifting storage.',
    recognition: ['oldest-first processing is required', 'capacity grows one node at a time'],
    invariant: 'Head is the oldest node, tail is the newest node, tail->next is null, and head is null exactly when tail is null.',
    prediction: 'What extra update is required when dequeue removes the last node?',
    trace: ['Enqueue after tail or initialize both pointers when empty.', 'Dequeue by moving head to its successor.', 'If head becomes null, clear tail as well.'],
    sample: ['head=A', 'A→B', 'B→C', 'tail=C'],
    kind: 'linked-list',
    complexity: 'O(1) enqueue and dequeue with O(n) node storage',
    trap: 'Leaving tail pointing to a freed last node makes the next enqueue write through a dangling pointer.',
    c: `${cSingly}typedef struct {
    Node *head;
    Node *tail;
} Queue;

int queue_enqueue(Queue *queue, int value) {
    if (queue == NULL) return 0;
    Node *node = malloc(sizeof *node);
    if (node == NULL) return 0;
    node->value = value;
    node->next = NULL;
    if (queue->tail != NULL) queue->tail->next = node;
    else queue->head = node;
    queue->tail = node;
    return 1;
}

int queue_dequeue(Queue *queue, int *value) {
    if (queue == NULL || queue->head == NULL || value == NULL) return 0;
    Node *removed = queue->head;
    *value = removed->value;
    queue->head = removed->next;
    if (queue->head == NULL) queue->tail = NULL;
    free(removed);
    return 1;
}`,
    cpp: `${cppSingly}struct Queue {
    Node *head{};
    Node *tail{};
};

void enqueue(Queue &queue, int value) {
    Node *node = new Node{value, nullptr};
    if (queue.tail != nullptr) queue.tail->next = node;
    else queue.head = node;
    queue.tail = node;
}

bool dequeue(Queue &queue, int &value) {
    if (queue.head == nullptr) return false;
    Node *removed = queue.head;
    value = removed->value;
    queue.head = removed->next;
    if (queue.head == nullptr) queue.tail = nullptr;
    delete removed;
    return true;
}`,
  }),
  problem({
    id: 'dsa-circular-queue',
    after: 'dsa-stack-queue',
    title: 'Implement a circular array queue',
    group: 'Queues',
    keywords: ['circular queue', 'ring buffer', 'head tail capacity'],
    definition: 'A circular queue reuses array slots by advancing head and tail modulo capacity while size distinguishes empty from full.',
    application: 'UART receive buffers, audio streams, and producer-consumer channels reuse fixed memory without shifting unread bytes.',
    recognition: ['FIFO behavior must fit a fixed buffer', 'removed slots should be reused without moving remaining elements'],
    invariant: 'Head identifies the oldest element, tail identifies the next insertion slot, and size stays between zero and capacity.',
    prediction: 'Why are head == tail alone insufficient to distinguish empty from full?',
    trace: ['Enqueue at tail and advance tail modulo capacity.', 'Dequeue at head and advance head modulo capacity.', 'Size determines whether the same indexes mean empty or full.'],
    sample: ['capacity=5', 'head=3', 'tail=2', 'size=4'],
    kind: 'stack-queue',
    complexity: 'O(1) operations and O(capacity) storage',
    trap: 'Modulo by zero and overwriting when size equals capacity are separate boundary failures.',
    c: `#include <stddef.h>

typedef struct {
    int *data;
    size_t capacity;
    size_t head;
    size_t tail;
    size_t size;
} CircularQueue;

int circular_enqueue(CircularQueue *queue, int value) {
    if (queue == NULL || queue->capacity == 0 || queue->size == queue->capacity) return 0;
    queue->data[queue->tail] = value;
    queue->tail = (queue->tail + 1) % queue->capacity;
    queue->size++;
    return 1;
}

int circular_dequeue(CircularQueue *queue, int *value) {
    if (queue == NULL || value == NULL || queue->size == 0) return 0;
    *value = queue->data[queue->head];
    queue->head = (queue->head + 1) % queue->capacity;
    queue->size--;
    return 1;
}`,
    cpp: `#include <cstddef>
#include <vector>

class CircularQueue {
public:
    explicit CircularQueue(std::size_t capacity) : data_(capacity) {}
    bool enqueue(int value) {
        if (data_.empty() || size_ == data_.size()) return false;
        data_[tail_] = value;
        tail_ = (tail_ + 1) % data_.size();
        ++size_;
        return true;
    }
    bool dequeue(int &value) {
        if (size_ == 0) return false;
        value = data_[head_];
        head_ = (head_ + 1) % data_.size();
        --size_;
        return true;
    }
private:
    std::vector<int> data_;
    std::size_t head_{};
    std::size_t tail_{};
    std::size_t size_{};
};`,
  }),
  problem({
    id: 'dsa-queue-using-stacks',
    after: 'dsa-stack-queue',
    title: 'Implement a queue using two stacks',
    group: 'Queue interview problems',
    keywords: ['queue using stacks', 'amortized', 'inbox outbox'],
    definition: 'A two-stack queue pushes into an input stack and transfers to an output stack only when output is empty, reversing order exactly once per element.',
    application: 'Batching layers convert append-friendly storage into oldest-first delivery while amortizing the reversal across many dequeues.',
    recognition: ['only stack operations are available', 'FIFO behavior is required'],
    invariant: 'Output top is the oldest queued element when output is nonempty; input bottom is older than input top and transfers in reverse order.',
    prediction: 'Why should input not be transferred before every dequeue?',
    trace: ['Enqueue by pushing onto input.', 'When output is empty, move every input item to output.', 'Dequeue from output; each item transfers at most once.'],
    sample: ['input=3,4', 'output=2,1', 'front=1'],
    kind: 'stack-queue',
    complexity: 'O(1) amortized operations and O(n) storage',
    trap: 'Transferring while output still contains older elements places newer elements ahead of them.',
    c: `#include <stddef.h>

typedef struct {
    int *input;
    int *output;
    size_t input_size;
    size_t output_size;
    size_t capacity;
} TwoStackQueue;

int two_stack_enqueue(TwoStackQueue *queue, int value) {
    if (queue == NULL || queue->input_size + queue->output_size == queue->capacity) return 0;
    queue->input[queue->input_size++] = value;
    return 1;
}

int two_stack_dequeue(TwoStackQueue *queue, int *value) {
    if (queue == NULL || value == NULL) return 0;
    if (queue->output_size == 0) {
        while (queue->input_size != 0) {
            queue->output[queue->output_size++] = queue->input[--queue->input_size];
        }
    }
    if (queue->output_size == 0) return 0;
    *value = queue->output[--queue->output_size];
    return 1;
}`,
    cpp: `#include <vector>

class TwoStackQueue {
public:
    void enqueue(int value) { input_.push_back(value); }
    bool dequeue(int &value) {
        if (output_.empty()) {
            while (!input_.empty()) {
                output_.push_back(input_.back());
                input_.pop_back();
            }
        }
        if (output_.empty()) return false;
        value = output_.back();
        output_.pop_back();
        return true;
    }
private:
    std::vector<int> input_;
    std::vector<int> output_;
};`,
  }),
  problem({
    id: 'dsa-sliding-window-maximum',
    after: 'dsa-monotonic',
    title: 'Sliding-window maximum with a deque',
    group: 'Queue interview problems',
    keywords: ['sliding window maximum', 'monotonic deque', 'window'],
    definition: 'A monotonic deque stores candidate indices in decreasing value order, removes expired fronts, and discards dominated backs before adding each index.',
    application: 'Network monitoring and sensor analytics track the peak over a moving interval without rescanning every sample in each overlapping window.',
    recognition: ['every fixed-size window needs its maximum', 'windows overlap heavily and O(nk) rescanning is too slow'],
    invariant: 'Deque indices lie inside the current window, increase from front to back, and their values decrease from front to back.',
    prediction: 'Why can a smaller value behind the new larger value never become a future maximum?',
    trace: ['Remove the front if its index left the window.', 'Remove smaller values from the back as permanently dominated.', 'Append the new index; the front is the current maximum.'],
    sample: ['1', '3', '-1', '-3', '5', '3'],
    kind: 'stack-queue',
    complexity: 'O(n) time and O(k) deque space',
    trap: 'Storing values instead of indices makes it impossible to know when a candidate expires.',
    c: `#include <stddef.h>
#include <stdlib.h>

int *sliding_maximum(const int *values, size_t count, size_t width) {
    if (values == NULL || width == 0 || width > count) return NULL;
    int *answer = malloc((count - width + 1) * sizeof *answer);
    size_t *deque = malloc(count * sizeof *deque);
    if (answer == NULL || deque == NULL) {
        free(answer);
        free(deque);
        return NULL;
    }
    size_t front = 0, back = 0, out = 0;
    for (size_t i = 0; i < count; i++) {
        while (front < back && deque[front] + width <= i) front++;
        while (front < back && values[deque[back - 1]] <= values[i]) back--;
        deque[back++] = i;
        if (i + 1 >= width) answer[out++] = values[deque[front]];
    }
    free(deque);
    return answer;
}`,
    cpp: `#include <cstddef>
#include <deque>
#include <vector>

std::vector<int> sliding_maximum(const std::vector<int> &values, std::size_t width) {
    if (width == 0 || width > values.size()) return {};
    std::deque<std::size_t> candidates;
    std::vector<int> answer;
    for (std::size_t i = 0; i < values.size(); ++i) {
        while (!candidates.empty() && candidates.front() + width <= i) candidates.pop_front();
        while (!candidates.empty() && values[candidates.back()] <= values[i]) candidates.pop_back();
        candidates.push_back(i);
        if (i + 1 >= width) answer.push_back(values[candidates.front()]);
    }
    return answer;
}`,
  }),
];

const treeProblems = [
  problem({
    id: 'dsa-tree-preorder',
    after: 'dsa-binary-tree',
    title: 'Preorder traversal',
    group: 'Binary-tree traversals',
    keywords: ['preorder', 'root left right', 'tree traversal'],
    definition: 'Preorder traversal visits the current node before its left and right subtrees, producing root-left-right order.',
    application: 'Tree serialization and hierarchical command execution record a parent before the descendants whose meaning depends on that parent.',
    recognition: ['the parent must be processed before either subtree', 'the desired order is root, left, right'],
    invariant: 'When a call begins, every ancestor before this node has already been visited and neither subtree of this node has been visited.',
    prediction: 'Which position in the recursive function determines whether traversal is preorder?',
    trace: ['Visit the current root.', 'Traverse the entire left subtree.', 'Traverse the entire right subtree; the result is complete.'],
    sample: ['A', 'B', 'C', 'D', 'E'],
    kind: 'tree',
    complexity: 'O(n) time and O(h) recursion stack',
    trap: 'Moving the visit between or after recursive calls changes the traversal to inorder or postorder.',
    c: `${cTree}typedef void (*TreeVisit)(int value, void *context);

void tree_preorder(const TreeNode *root, TreeVisit visit, void *context) {
    if (root == NULL) return;
    visit(root->value, context);
    tree_preorder(root->left, visit, context);
    tree_preorder(root->right, visit, context);
}`,
    cpp: `${cppTree}template <class Visit>
void tree_preorder(const TreeNode *root, Visit visit) {
    if (root == nullptr) return;
    visit(root->value);
    tree_preorder(root->left, visit);
    tree_preorder(root->right, visit);
}`,
  }),
  problem({
    id: 'dsa-tree-inorder',
    after: 'dsa-binary-tree',
    title: 'Inorder traversal',
    group: 'Binary-tree traversals',
    keywords: ['inorder', 'left root right', 'BST sorted'],
    definition: 'Inorder traversal completely visits the left subtree, then the current node, then the right subtree.',
    application: 'In a binary search tree, inorder traversal emits keys in sorted order and supports range scans without flattening the tree first.',
    recognition: ['the desired order is left, root, right', 'sorted output is required from a BST'],
    invariant: 'When the current node is visited, every key in its left subtree has already been emitted and no key in its right subtree has been emitted.',
    prediction: 'Why does inorder produce sorted values only when the tree satisfies BST ordering?',
    trace: ['Descend through the left subtree.', 'Visit the current root after all smaller-side nodes.', 'Traverse the right subtree; ordering is preserved.'],
    sample: ['4', '2', '6', '1', '3', '5', '7'],
    kind: 'tree',
    complexity: 'O(n) time and O(h) recursion stack',
    trap: 'Traversal order alone cannot repair a tree that violates the BST ordering invariant.',
    c: `${cTree}typedef void (*TreeVisit)(int value, void *context);

void tree_inorder(const TreeNode *root, TreeVisit visit, void *context) {
    if (root == NULL) return;
    tree_inorder(root->left, visit, context);
    visit(root->value, context);
    tree_inorder(root->right, visit, context);
}`,
    cpp: `${cppTree}template <class Visit>
void tree_inorder(const TreeNode *root, Visit visit) {
    if (root == nullptr) return;
    tree_inorder(root->left, visit);
    visit(root->value);
    tree_inorder(root->right, visit);
}`,
  }),
  problem({
    id: 'dsa-tree-postorder',
    after: 'dsa-binary-tree',
    title: 'Postorder traversal',
    group: 'Binary-tree traversals',
    keywords: ['postorder', 'left right root', 'delete tree'],
    definition: 'Postorder traversal processes both subtrees before the current node, producing left-right-root order.',
    application: 'Directory deletion, expression evaluation, and tree destruction process children before releasing or computing the parent that owns them.',
    recognition: ['a parent depends on completed child results', 'children must be released before their owner'],
    invariant: 'When the current node is visited, both of its subtrees have been completely processed and no descendant work remains.',
    prediction: 'Why is postorder the safe recursive order for freeing every tree node?',
    trace: ['Process the entire left subtree.', 'Process the entire right subtree.', 'Visit or release the root only after both children are complete.'],
    sample: ['A', 'B', 'C', 'D', 'E'],
    kind: 'tree',
    complexity: 'O(n) time and O(h) recursion stack',
    trap: 'Freeing the root before recursive child calls destroys the only addresses that reach those children.',
    c: `${cTree}typedef void (*TreeVisit)(int value, void *context);

void tree_postorder(const TreeNode *root, TreeVisit visit, void *context) {
    if (root == NULL) return;
    tree_postorder(root->left, visit, context);
    tree_postorder(root->right, visit, context);
    visit(root->value, context);
}`,
    cpp: `${cppTree}template <class Visit>
void tree_postorder(const TreeNode *root, Visit visit) {
    if (root == nullptr) return;
    tree_postorder(root->left, visit);
    tree_postorder(root->right, visit);
    visit(root->value);
}`,
  }),
  problem({
    id: 'dsa-tree-level-order',
    after: 'dsa-binary-tree',
    title: 'Level-order traversal',
    group: 'Binary-tree traversals',
    keywords: ['level order', 'breadth first tree', 'queue'],
    definition: 'Level-order traversal uses a FIFO queue so every node at depth d is processed before nodes at depth d+1.',
    application: 'UI hierarchy rendering, filesystem breadth reports, and tree serialization process nodes by distance from the root.',
    recognition: ['nodes are requested level by level', 'nearest descendants must be processed before deeper descendants'],
    invariant: 'The queue contains discovered but unvisited nodes in nondecreasing depth order.',
    prediction: 'Why does enqueueing left then right preserve left-to-right order within one level?',
    trace: ['Enqueue the root.', 'Dequeue one node, visit it, and enqueue its non-null children.', 'Continue until the queue is empty; every level is complete.'],
    sample: ['A', 'B', 'C', 'D', 'E'],
    kind: 'tree',
    complexity: 'O(n) time and O(w) queue space for maximum width w',
    trap: 'A LIFO stack changes the search to depth-first order even if the same children are inserted.',
    c: `${cTree}size_t tree_count(const TreeNode *root) {
    return root == NULL ? 0 : 1 + tree_count(root->left) + tree_count(root->right);
}

int tree_level_order(const TreeNode *root, int *output, size_t capacity) {
    if (root == NULL) return 0;
    size_t count = tree_count(root);
    if (output == NULL || capacity < count) return -1;
    const TreeNode **queue = malloc(count * sizeof *queue);
    if (queue == NULL) return -1;
    size_t head = 0, tail = 0, written = 0;
    queue[tail++] = root;
    while (head < tail) {
        const TreeNode *node = queue[head++];
        output[written++] = node->value;
        if (node->left != NULL) queue[tail++] = node->left;
        if (node->right != NULL) queue[tail++] = node->right;
    }
    free(queue);
    return (int)written;
}`,
    cpp: `${cppTree}std::vector<int> tree_level_order(const TreeNode *root) {
    if (root == nullptr) return {};
    std::queue<const TreeNode *> queue;
    std::vector<int> output;
    queue.push(root);
    while (!queue.empty()) {
        const TreeNode *node = queue.front();
        queue.pop();
        output.push_back(node->value);
        if (node->left != nullptr) queue.push(node->left);
        if (node->right != nullptr) queue.push(node->right);
    }
    return output;
}`,
  }),
  problem({
    id: 'dsa-tree-max-depth',
    after: 'dsa-binary-tree',
    title: 'Maximum depth and tree height',
    group: 'Binary-tree interview problems',
    keywords: ['maximum depth', 'tree height', 'recursion'],
    definition: 'Maximum depth is one plus the larger depth of the two child subtrees, with an empty tree contributing zero.',
    application: 'Tree height bounds lookup cost, recursion risk, UI nesting depth, and the stack budget needed by recursive firmware configuration walkers.',
    recognition: ['the answer for a node depends only on child answers', 'the deepest root-to-leaf path is requested'],
    invariant: 'Each recursive call returns the exact maximum node count on a path beginning at its root.',
    prediction: 'Why is the base case zero rather than one for a null child?',
    trace: ['An empty subtree returns zero.', 'Compute left and right subtree depths.', 'Return one for the current node plus the larger child depth.'],
    sample: ['A', 'B', 'C', 'D', 'E'],
    kind: 'tree',
    complexity: 'O(n) time and O(h) recursion stack',
    trap: 'Mixing edge height and node depth creates an off-by-one result; define the unit before coding.',
    c: `${cTree}size_t tree_max_depth(const TreeNode *root) {
    if (root == NULL) return 0;
    size_t left = tree_max_depth(root->left);
    size_t right = tree_max_depth(root->right);
    return 1 + (left > right ? left : right);
}`,
    cpp: `${cppTree}std::size_t tree_max_depth(const TreeNode *root) {
    if (root == nullptr) return 0;
    return 1 + std::max(tree_max_depth(root->left), tree_max_depth(root->right));
}`,
  }),
  problem({
    id: 'dsa-tree-symmetric',
    after: 'dsa-binary-tree',
    title: 'Symmetric binary tree',
    group: 'Binary-tree interview problems',
    keywords: ['symmetric tree', 'mirror', 'isomorphic'],
    definition: 'A binary tree is symmetric when its left and right subtrees are mirrors: root values match and outer and inner child pairs mirror recursively.',
    application: 'Mirrored layout validation and replicated hierarchy checks compare structure and payload simultaneously rather than comparing traversal values alone.',
    recognition: ['the left and right sides must reflect one another', 'both structure and values matter'],
    invariant: 'Each recursive pair represents positions that must mirror; both are null, or both exist with equal values and mirrored children.',
    prediction: 'Which child pairs are “outer” and which are “inner” at one comparison?',
    trace: ['Compare root.left with root.right.', 'Compare left.left with right.right as the outer pair.', 'Compare left.right with right.left; all pairs matching proves symmetry.'],
    sample: ['1', '2', '2', '3', '4', '4', '3'],
    kind: 'tree',
    complexity: 'O(n) time and O(h) recursion stack',
    trap: 'Equal inorder or preorder values do not prove symmetry because different shapes can produce the same value sequence.',
    c: `${cTree}static int tree_mirror_equal(const TreeNode *left, const TreeNode *right) {
    if (left == NULL || right == NULL) return left == right;
    return left->value == right->value &&
           tree_mirror_equal(left->left, right->right) &&
           tree_mirror_equal(left->right, right->left);
}

int tree_is_symmetric(const TreeNode *root) {
    return root == NULL || tree_mirror_equal(root->left, root->right);
}`,
    cpp: `${cppTree}static bool tree_mirror_equal(const TreeNode *left, const TreeNode *right) {
    if (left == nullptr || right == nullptr) return left == right;
    return left->value == right->value &&
           tree_mirror_equal(left->left, right->right) &&
           tree_mirror_equal(left->right, right->left);
}

bool tree_is_symmetric(const TreeNode *root) {
    return root == nullptr || tree_mirror_equal(root->left, root->right);
}`,
  }),
  problem({
    id: 'dsa-tree-invert',
    after: 'dsa-binary-tree',
    title: 'Invert a binary tree',
    group: 'Binary-tree interview problems',
    keywords: ['invert tree', 'mirror tree', 'swap children'],
    definition: 'Tree inversion swaps the left and right child links at every node, recursively mirroring the entire structure.',
    application: 'Mirrored UI layouts and coordinate-system transformations reverse hierarchical left/right orientation while preserving parent-child ownership.',
    recognition: ['every left relationship must become right and vice versa', 'the transformation applies independently at every node'],
    invariant: 'After processing a node, its child links are swapped and both attached subtrees are themselves completely inverted.',
    prediction: 'Does it matter whether children are swapped before or after the recursive calls if the chosen links are followed consistently?',
    trace: ['Reach one non-null node.', 'Swap its left and right child pointers.', 'Invert both now-attached subtrees and return the same root.'],
    sample: ['4', '2', '7', '1', '3', '6', '9'],
    kind: 'tree',
    complexity: 'O(n) time and O(h) recursion stack',
    trap: 'Saving only one child before overwriting links can make both pointers reference the same subtree.',
    c: `${cTree}TreeNode *tree_invert(TreeNode *root) {
    if (root == NULL) return NULL;
    TreeNode *left = tree_invert(root->left);
    TreeNode *right = tree_invert(root->right);
    root->left = right;
    root->right = left;
    return root;
}`,
    cpp: `${cppTree}TreeNode *tree_invert(TreeNode *root) {
    if (root == nullptr) return nullptr;
    TreeNode *left = tree_invert(root->left);
    TreeNode *right = tree_invert(root->right);
    root->left = right;
    root->right = left;
    return root;
}`,
  }),
  problem({
    id: 'dsa-tree-diameter',
    after: 'dsa-binary-tree',
    title: 'Diameter of a binary tree',
    group: 'Binary-tree interview problems',
    keywords: ['tree diameter', 'height', 'longest path'],
    definition: 'Tree diameter is the largest number of edges on any path between two nodes; a postorder height calculation updates the best path crossing each node.',
    application: 'Hierarchy latency analysis and network-topology trees use diameter to identify the longest communication path between endpoints.',
    recognition: ['the longest path may pass through any node', 'subtree heights can summarize the best path crossing a parent'],
    invariant: 'Each call returns exact subtree height, while best stores the largest left-height plus right-height seen anywhere in the processed subtree.',
    prediction: 'Why is returning diameter instead of height to the parent insufficient?',
    trace: ['Obtain left and right subtree heights.', 'Update the global best with the path crossing this node.', 'Return one plus the larger height so the parent can form its path.'],
    sample: ['1', '2', '3', '4', '5'],
    kind: 'tree',
    complexity: 'O(n) time and O(h) recursion stack',
    trap: 'Recomputing height separately at every node turns the solution into O(n²) on a skewed tree.',
    c: `${cTree}static size_t diameter_height(const TreeNode *root, size_t *best) {
    if (root == NULL) return 0;
    size_t left = diameter_height(root->left, best);
    size_t right = diameter_height(root->right, best);
    if (left + right > *best) *best = left + right;
    return 1 + (left > right ? left : right);
}

size_t tree_diameter(const TreeNode *root) {
    size_t best = 0;
    (void)diameter_height(root, &best);
    return best;
}`,
    cpp: `${cppTree}static std::size_t diameter_height(const TreeNode *root, std::size_t &best) {
    if (root == nullptr) return 0;
    std::size_t left = diameter_height(root->left, best);
    std::size_t right = diameter_height(root->right, best);
    best = std::max(best, left + right);
    return 1 + std::max(left, right);
}

std::size_t tree_diameter(const TreeNode *root) {
    std::size_t best = 0;
    (void)diameter_height(root, best);
    return best;
}`,
  }),
  problem({
    id: 'dsa-tree-balanced',
    after: 'dsa-binary-tree',
    title: 'Check whether a binary tree is height-balanced',
    group: 'Binary-tree interview problems',
    keywords: ['balanced tree', 'height difference', 'sentinel'],
    definition: 'A height-balanced tree has left and right subtree heights differing by at most one at every node; a sentinel return stops work after detecting imbalance.',
    application: 'Index structures and recursive work partitions monitor balance because excessive skew increases latency and stack usage.',
    recognition: ['balance must hold at every node, not only the root', 'height and validity should be computed in one pass'],
    invariant: 'Each call returns a nonnegative exact height for a balanced subtree or −1 if any node in that subtree is already unbalanced.',
    prediction: 'How does the −1 sentinel avoid recomputing heights after a failure?',
    trace: ['Get validated height from the left subtree.', 'Get validated height from the right subtree.', 'Reject a difference above one; otherwise return the new height.'],
    sample: ['3', '9', '20', '15', '7'],
    kind: 'tree',
    complexity: 'O(n) time and O(h) recursion stack',
    trap: 'Calling a separate height function at every node repeats work and can degrade to O(n²).',
    c: `${cTree}static int balanced_height(const TreeNode *root) {
    if (root == NULL) return 0;
    int left = balanced_height(root->left);
    if (left < 0) return -1;
    int right = balanced_height(root->right);
    if (right < 0) return -1;
    int difference = left - right;
    if (difference < -1 || difference > 1) return -1;
    return 1 + (left > right ? left : right);
}

int tree_is_balanced(const TreeNode *root) {
    return balanced_height(root) >= 0;
}`,
    cpp: `${cppTree}static int balanced_height(const TreeNode *root) {
    if (root == nullptr) return 0;
    int left = balanced_height(root->left);
    if (left < 0) return -1;
    int right = balanced_height(root->right);
    int difference = left - right;
    if (right < 0 || difference < -1 || difference > 1) return -1;
    return 1 + std::max(left, right);
}

bool tree_is_balanced(const TreeNode *root) {
    return balanced_height(root) >= 0;
}`,
  }),
  problem({
    id: 'dsa-tree-lca',
    after: 'dsa-binary-tree',
    title: 'Lowest common ancestor in a binary tree',
    group: 'Binary-tree interview problems',
    keywords: ['lowest common ancestor', 'LCA', 'binary tree'],
    definition: 'The lowest common ancestor is the deepest node whose subtree contains both targets; postorder returns a found target or ancestor upward.',
    application: 'Filesystem path comparison, UI ownership trees, and dependency hierarchies use the nearest shared ancestor to find the smallest common scope.',
    recognition: ['two node identities are given', 'the tree is not necessarily ordered like a BST'],
    invariant: 'A non-null return means this subtree contains at least one target, and non-null returns from both children make the current root the lowest split point.',
    prediction: 'Why can a target node itself be the lowest common ancestor?',
    trace: ['Return the root when it matches either target.', 'Search left and right subtrees.', 'Two non-null results split here; otherwise propagate the one found result.'],
    sample: ['3', '5', '1', '6', '2', '0', '8'],
    kind: 'tree',
    complexity: 'O(n) time and O(h) recursion stack',
    trap: 'Comparing values fails when values repeat; LCA questions normally identify nodes by address.',
    c: `${cTree}TreeNode *tree_lca(TreeNode *root, const TreeNode *a, const TreeNode *b) {
    if (root == NULL || root == a || root == b) return root;
    TreeNode *left = tree_lca(root->left, a, b);
    TreeNode *right = tree_lca(root->right, a, b);
    if (left != NULL && right != NULL) return root;
    return left != NULL ? left : right;
}`,
    cpp: `${cppTree}TreeNode *tree_lca(TreeNode *root, const TreeNode *a, const TreeNode *b) {
    if (root == nullptr || root == a || root == b) return root;
    TreeNode *left = tree_lca(root->left, a, b);
    TreeNode *right = tree_lca(root->right, a, b);
    if (left != nullptr && right != nullptr) return root;
    return left != nullptr ? left : right;
}`,
  }),
  problem({
    id: 'dsa-tree-path-sum',
    after: 'dsa-binary-tree',
    title: 'Root-to-leaf path sum',
    group: 'Binary-tree interview problems',
    keywords: ['path sum', 'root to leaf', 'target'],
    definition: 'Root-to-leaf path-sum search subtracts each visited value from the remaining target and succeeds only when a leaf consumes the remainder exactly.',
    application: 'Decision trees and hierarchical budget checks verify whether one complete root-to-terminal route satisfies an accumulated threshold.',
    recognition: ['the path must begin at root and end at a leaf', 'node values accumulate along one branch'],
    invariant: 'Remaining equals the original target minus exactly the values on the current root-to-node path before the current node is consumed.',
    prediction: 'Why is matching the target at an internal node insufficient?',
    trace: ['Subtract the current node from the remaining target.', 'At a leaf, compare the remainder with that leaf value.', 'Otherwise search either child with the updated remainder.'],
    sample: ['5', '4', '8', '11', '13', '4'],
    kind: 'tree',
    complexity: 'O(n) time and O(h) recursion stack',
    trap: 'Returning true at an internal node accepts an incomplete path that does not end at a leaf.',
    c: `${cTree}int tree_has_path_sum(const TreeNode *root, int target) {
    if (root == NULL) return 0;
    if (root->left == NULL && root->right == NULL) return root->value == target;
    int remaining = target - root->value;
    return tree_has_path_sum(root->left, remaining) ||
           tree_has_path_sum(root->right, remaining);
}`,
    cpp: `${cppTree}bool tree_has_path_sum(const TreeNode *root, int target) {
    if (root == nullptr) return false;
    if (root->left == nullptr && root->right == nullptr) return root->value == target;
    int remaining = target - root->value;
    return tree_has_path_sum(root->left, remaining) ||
           tree_has_path_sum(root->right, remaining);
}`,
  }),
];

const bstProblems = [
  problem({
    id: 'dsa-bst-search',
    after: 'dsa-bst',
    title: 'Search a binary search tree',
    group: 'Binary-search-tree operations',
    keywords: ['BST search', 'binary search tree', 'lookup'],
    definition: 'BST search compares the target with one node and follows only the child subtree whose ordering range can still contain the target.',
    application: 'Ordered in-memory indexes use the same comparison path to locate keys while avoiding unrelated subtrees.',
    recognition: ['every left key is smaller and every right key is larger under a stated duplicate policy', 'a single key lookup is requested'],
    invariant: 'If the target exists, it remains inside the subtree rooted at current; the discarded subtree cannot contain it by ordering.',
    prediction: 'After target < current->value, why is the entire right subtree impossible?',
    trace: ['Compare the target with the root.', 'Follow left or right according to the ordering relation.', 'Equality returns the node; null proves absence.'],
    sample: ['8', '3', '10', '1', '6', '14'],
    kind: 'tree',
    complexity: 'O(h) time and O(1) extra space',
    trap: 'The logarithmic claim requires a balanced tree; a skewed BST has height n.',
    c: `${cTree}TreeNode *bst_search(TreeNode *root, int target) {
    TreeNode *current = root;
    while (current != NULL && current->value != target) {
        current = target < current->value ? current->left : current->right;
    }
    return current;
}`,
    cpp: `${cppTree}TreeNode *bst_search(TreeNode *root, int target) {
    TreeNode *current = root;
    while (current != nullptr && current->value != target) {
        current = target < current->value ? current->left : current->right;
    }
    return current;
}`,
  }),
  problem({
    id: 'dsa-bst-insert',
    after: 'dsa-bst',
    title: 'Insert into a binary search tree',
    group: 'Binary-search-tree operations',
    keywords: ['BST insert', 'binary search tree', 'leaf'],
    definition: 'BST insertion follows the search path until a null child link is found, then makes the new leaf own that link.',
    application: 'Incremental ordered indexes add keys without shifting existing records, while the path exposes whether rebalancing may be required.',
    recognition: ['a key must be added while preserving BST ordering', 'the duplicate policy is known'],
    invariant: 'Every traversed comparison preserves the allowed key range for the child link currently being examined.',
    prediction: 'Why is a new BST node always attached at a null child position?',
    trace: ['Follow comparisons exactly as in search.', 'Stop at the null owning link where the key belongs.', 'Allocate one leaf and assign that link.'],
    sample: ['8', '3', '10', 'insert=6'],
    kind: 'tree',
    complexity: 'O(h) time and O(1) traversal space',
    trap: 'Inconsistent duplicate handling can place equal keys on both sides and invalidate later search assumptions.',
    c: `${cTree}int bst_insert(TreeNode **root, int value) {
    if (root == NULL) return 0;
    TreeNode **link = root;
    while (*link != NULL) {
        if (value == (*link)->value) return 1;
        link = value < (*link)->value ? &(*link)->left : &(*link)->right;
    }
    TreeNode *node = malloc(sizeof *node);
    if (node == NULL) return 0;
    node->value = value;
    node->left = NULL;
    node->right = NULL;
    *link = node;
    return 1;
}`,
    cpp: `${cppTree}void bst_insert(TreeNode *&root, int value) {
    TreeNode **link = &root;
    while (*link != nullptr) {
        if (value == (*link)->value) return;
        link = value < (*link)->value ? &(*link)->left : &(*link)->right;
    }
    *link = new TreeNode{value, nullptr, nullptr};
}`,
  }),
  problem({
    id: 'dsa-bst-validate',
    after: 'dsa-bst',
    title: 'Validate a binary search tree',
    group: 'Binary-search-tree interview problems',
    keywords: ['validate BST', 'range bounds', 'inorder'],
    definition: 'BST validation carries an allowed lower and upper bound to every node, proving ordering against all ancestors rather than only the parent.',
    application: 'Deserialized indexes and persisted search trees must be validated before lookup code trusts ordering to discard subtrees.',
    recognition: ['a whole tree may violate ancestor ordering deep below the root', 'local parent-child comparisons are insufficient'],
    invariant: 'Every node in the current subtree must lie strictly inside the inherited interval (lower, upper).',
    prediction: 'Why can a node satisfy its parent comparison yet still violate the BST?',
    trace: ['Start with an unbounded interval.', 'Constrain the left subtree upper bound to the current key.', 'Constrain the right lower bound; every node passing proves validity.'],
    sample: ['8', '3', '10', '1', '6', '14'],
    kind: 'tree',
    complexity: 'O(n) time and O(h) recursion stack',
    trap: 'Using int minimum and maximum sentinels fails when a node legitimately stores those boundary values.',
    c: `${cTree}static int bst_valid_range(const TreeNode *root,
                           const long long *lower,
                           const long long *upper) {
    if (root == NULL) return 1;
    long long value = root->value;
    if ((lower != NULL && value <= *lower) || (upper != NULL && value >= *upper)) return 0;
    return bst_valid_range(root->left, lower, &value) &&
           bst_valid_range(root->right, &value, upper);
}

int bst_is_valid(const TreeNode *root) {
    return bst_valid_range(root, NULL, NULL);
}`,
    cpp: `${cppTree}static bool bst_valid_range(const TreeNode *root,
                            const long long *lower,
                            const long long *upper) {
    if (root == nullptr) return true;
    long long value = root->value;
    if ((lower != nullptr && value <= *lower) ||
        (upper != nullptr && value >= *upper)) return false;
    return bst_valid_range(root->left, lower, &value) &&
           bst_valid_range(root->right, &value, upper);
}

bool bst_is_valid(const TreeNode *root) {
    return bst_valid_range(root, nullptr, nullptr);
}`,
  }),
  problem({
    id: 'dsa-bst-delete',
    after: 'dsa-bst',
    title: 'Delete from a binary search tree',
    group: 'Binary-search-tree operations',
    keywords: ['BST delete', 'inorder successor', 'three cases'],
    definition: 'BST deletion handles leaf, one-child, and two-child nodes; the two-child case replaces the key with its inorder successor and deletes that successor.',
    application: 'Ordered indexes remove keys while preserving the comparison ranges relied on by every future lookup.',
    recognition: ['a key must be removed without rebuilding the tree', 'the target may have zero, one, or two children'],
    invariant: 'Every returned subtree contains exactly the original keys minus the target and still satisfies the inherited BST ordering.',
    prediction: 'Why is the smallest key in the right subtree a safe replacement for a two-child node?',
    trace: ['Search recursively for the target.', 'Return the one surviving child for zero- or one-child deletion.', 'For two children, copy the right-subtree minimum and delete its original node.'],
    sample: ['8', '3', '10', '1', '6', 'delete=3'],
    kind: 'tree',
    complexity: 'O(h) time and O(h) recursion stack',
    trap: 'Copying the successor value without deleting the successor leaves a duplicate key in the tree.',
    c: `${cTree}static TreeNode *bst_minimum(TreeNode *root) {
    while (root->left != NULL) root = root->left;
    return root;
}

TreeNode *bst_delete(TreeNode *root, int value) {
    if (root == NULL) return NULL;
    if (value < root->value) root->left = bst_delete(root->left, value);
    else if (value > root->value) root->right = bst_delete(root->right, value);
    else {
        if (root->left == NULL || root->right == NULL) {
            TreeNode *child = root->left != NULL ? root->left : root->right;
            free(root);
            return child;
        }
        TreeNode *successor = bst_minimum(root->right);
        root->value = successor->value;
        root->right = bst_delete(root->right, successor->value);
    }
    return root;
}`,
    cpp: `${cppTree}static TreeNode *bst_minimum(TreeNode *root) {
    while (root->left != nullptr) root = root->left;
    return root;
}

TreeNode *bst_delete(TreeNode *root, int value) {
    if (root == nullptr) return nullptr;
    if (value < root->value) root->left = bst_delete(root->left, value);
    else if (value > root->value) root->right = bst_delete(root->right, value);
    else {
        if (root->left == nullptr || root->right == nullptr) {
            TreeNode *child = root->left != nullptr ? root->left : root->right;
            delete root;
            return child;
        }
        TreeNode *successor = bst_minimum(root->right);
        root->value = successor->value;
        root->right = bst_delete(root->right, successor->value);
    }
    return root;
}`,
  }),
  problem({
    id: 'dsa-bst-kth-smallest',
    after: 'dsa-bst',
    title: 'Kth smallest key in a BST',
    group: 'Binary-search-tree interview problems',
    keywords: ['kth smallest BST', 'inorder', 'rank'],
    definition: 'The kth-smallest BST key is the kth value emitted by inorder traversal because BST ordering makes inorder sorted.',
    application: 'Ordered indexes answer rank queries, percentile selections, and “next ordered record” requests through sorted traversal or stored subtree sizes.',
    recognition: ['a rank in sorted BST order is requested', 'tree values are unique or duplicates have a defined order'],
    invariant: 'Each popped node from the explicit inorder stack is the smallest unvisited key in the tree.',
    prediction: 'Why is decrementing k at node pop correct but decrementing during left descent incorrect?',
    trace: ['Push the full left spine.', 'Pop the next smallest node and decrement k.', 'Move to its right subtree; the node where k reaches zero is the answer.'],
    sample: ['5', '3', '6', '2', '4', '1'],
    kind: 'tree',
    complexity: 'O(h + k) time and O(h) stack space',
    trap: 'A preorder counter follows shape order, not sorted key order.',
    c: `${cTree}int bst_kth_smallest(const TreeNode *root, size_t k, int *value) {
    if (k == 0 || value == NULL) return 0;
    const TreeNode *stack[128];
    size_t size = 0;
    const TreeNode *current = root;
    while (current != NULL || size != 0) {
        while (current != NULL) {
            if (size == 128) return 0;
            stack[size++] = current;
            current = current->left;
        }
        current = stack[--size];
        if (--k == 0) { *value = current->value; return 1; }
        current = current->right;
    }
    return 0;
}`,
    cpp: `${cppTree}bool bst_kth_smallest(const TreeNode *root, std::size_t k, int &value) {
    if (k == 0) return false;
    std::vector<const TreeNode *> stack;
    const TreeNode *current = root;
    while (current != nullptr || !stack.empty()) {
        while (current != nullptr) {
            stack.push_back(current);
            current = current->left;
        }
        current = stack.back();
        stack.pop_back();
        if (--k == 0) { value = current->value; return true; }
        current = current->right;
    }
    return false;
}`,
  }),
  problem({
    id: 'dsa-bst-lca',
    after: 'dsa-bst',
    title: 'Lowest common ancestor in a BST',
    group: 'Binary-search-tree interview problems',
    keywords: ['BST LCA', 'split point', 'ordering'],
    definition: 'BST lowest-common-ancestor search follows both targets left or right while they lie on the same side, stopping at their first ordering split.',
    application: 'Ordered hierarchy indexes find the narrowest shared range or scope without traversing unrelated branches.',
    recognition: ['the tree is a BST and both target keys are known', 'ordering can identify the first shared split'],
    invariant: 'Current remains an ancestor candidate for both targets; moving left or right is safe only while both targets lie strictly on that side.',
    prediction: 'What does it mean when one target is below current and the other is above current?',
    trace: ['Compare both target keys with current.', 'Move to one child while both keys lie on that side.', 'The first split or equality makes current the lowest common ancestor.'],
    sample: ['6', '2', '8', '0', '4', '7', '9'],
    kind: 'tree',
    complexity: 'O(h) time and O(1) extra space',
    trap: 'Using the BST shortcut on a general binary tree can discard the subtree that actually contains a target.',
    c: `${cTree}TreeNode *bst_lca(TreeNode *root, int first, int second) {
    while (root != NULL) {
        if (first < root->value && second < root->value) root = root->left;
        else if (first > root->value && second > root->value) root = root->right;
        else return root;
    }
    return NULL;
}`,
    cpp: `${cppTree}TreeNode *bst_lca(TreeNode *root, int first, int second) {
    while (root != nullptr) {
        if (first < root->value && second < root->value) root = root->left;
        else if (first > root->value && second > root->value) root = root->right;
        else return root;
    }
    return nullptr;
}`,
  }),
];

export const dsaFocusedSubtopics = Object.freeze([
  ...singlyProblems,
  ...linearStructureProblems,
  ...treeProblems,
  ...bstProblems,
]);
export const dsaFocusedById = new Map(dsaFocusedSubtopics.map((entry) => [entry.id, entry]));

const linkedState = (sample, activeIndex) => {
  const arrowRows = sample
    .filter((item) => String(item).includes('→') || String(item).includes('⇄'))
    .map((item) => String(item).split(/→|⇄/).map((part) => part.trim()));
  const labels = arrowRows.map(([from]) => from.replace(/^(?:result=|head=|tail=)/, ''));
  const finalTarget = arrowRows.at(-1)?.at(-1)?.replace(/^(?:result=|head=|tail=)/, '');
  const cycleTarget = labels.indexOf(finalTarget);
  if (finalTarget && finalTarget !== '∅' && cycleTarget === -1) labels.push(finalTarget);
  const nodes = labels.map((label, index) => ({
    id: `node-${index}`,
    label,
    address: `@0x${(0x20 + index * 0x10).toString(16)}`,
  }));
  const links = nodes.slice(0, -1).map((node, index) => ({
    from: node.id,
    to: nodes[index + 1].id,
  }));
  if (cycleTarget >= 0 && nodes.length > 0) {
    links.push({ from: nodes.at(-1).id, to: nodes[cycleTarget].id });
  }
  return {
    nodes,
    links,
    values: labels,
    active: nodes.length > 0 ? [nodes[Math.min(activeIndex, nodes.length - 1)].id] : [],
  };
};

const focusedFrame = (entry, caption, index) => {
  if (entry.kind === 'linked-list') {
    return {
      caption,
      ...linkedState(entry.sample, index),
      markers: [`step ${index + 1}`, entry.invariant],
    };
  }
  if (entry.id === 'dsa-circular-queue') {
    return {
      caption,
      values: ['A', 'B', 'C', 'D'],
      capacity: 5,
      head: (3 + index) % 5,
      tail: (2 + index) % 5,
      markers: [`step ${index + 1}`, entry.invariant],
      active: [index % 4],
    };
  }
  if (entry.id === 'dsa-sliding-window-maximum') {
    const left = Math.min(index, entry.sample.length - 3);
    return {
      caption,
      values: entry.sample,
      pointers: { left, right: left + 2 },
      window: [left, left + 2],
      markers: [`window=[${left},${left + 2}]`, entry.invariant],
      active: [left + 2],
    };
  }
  const activeIndex = Math.min(index, entry.sample.length - 1);
  return {
    caption,
    values: entry.sample,
    markers: [`step ${index + 1}`, entry.invariant],
    active: [activeIndex],
  };
};

export const focusedDsaVisuals = Object.fromEntries(dsaFocusedSubtopics.map((entry) => [
  entry.id,
  {
    kind: entry.kind,
    frames: entry.trace.map((caption, index) => focusedFrame(entry, caption, index)),
  },
]));

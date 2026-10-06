const concept = (term, definition, example) => ({ term, definition, example });

const cppTopic = ({
  id,
  title,
  group,
  keywords,
  definition,
  explanation,
  concepts,
  prediction,
  steps,
  failure,
  application,
  example,
  code,
}) => ({
  id,
  title,
  group,
  keywords,
  level: 'deep',
  concepts,
  profile: {
    definition,
    explanation,
    prediction,
    steps,
    failure,
    application,
    example,
    code,
    standard: 'C++20',
  },
});

export const focusedCppSubtopics = [
  cppTopic({
    id: 'cpp-ctor-default-parameterized',
    title: 'Default and parameterized constructors',
    group: 'Construction and destruction',
    keywords: ['default constructor', 'parameterized constructor', 'initializer list', 'invariant'],
    definition: 'A constructor is the operation that begins an object’s lifetime and establishes its first valid state. A default constructor needs no argument; a parameterized constructor receives the information required to create a particular valid state.',
    explanation: 'Storage is obtained before construction, then base classes and data members are initialized in declaration order, and only then does the constructor body run. Members should be initialized in the initializer list because assignment in the body happens after those members already exist.',
    concepts: [
      concept('Default constructor', 'A constructor callable with no arguments that creates the documented default valid state of a new object.', 'Connection{} begins disconnected with descriptor -1.'),
      concept('Parameterized constructor', 'A constructor that receives values needed to establish a chosen state while checking the class invariant.', 'Connection{7} begins with descriptor 7.'),
      concept('Initializer list', 'The colon-separated constructor syntax that directly initializes bases and members before the constructor body starts.', 'Connection(int fd) : descriptor_{fd} initializes rather than assigns.'),
    ],
    prediction: 'If a member is declared before another member but appears second in the initializer list, which one is actually initialized first?',
    steps: ['Allocate suitably aligned storage for the complete object.', 'Initialize bases and members in their declaration order.', 'Run the constructor body after every member already exists.', 'Expose the object only after its invariant is established.'],
    failure: 'Reading one member while an earlier initializer has not established it is undefined behavior. Reordering the initializer list does not reorder member construction, and throwing after acquiring an unmanaged resource can leak it.',
    application: 'A serial-port wrapper uses a default constructor for a closed handle and a parameterized constructor for an already-open descriptor. Both states are valid, so cleanup and move operations can reason about one invariant.',
    example: 'Construct one closed Port and one Port with descriptor 4, assert both invariants, and print the values to verify that initialization happened before use.',
    code: `#include <cassert>

class Port {
  int descriptor_;
public:
  Port() : descriptor_{-1} {}
  explicit Port(int descriptor) : descriptor_{descriptor} {
    assert(descriptor >= 0);
  }
  [[nodiscard]] bool is_open() const { return descriptor_ >= 0; }
};

int main() {
  Port closed;
  Port uart{4};
  assert(!closed.is_open());
  assert(uart.is_open());
}`,
  }),
  cppTopic({
    id: 'cpp-ctor-copy-move',
    title: 'Copy and move constructors',
    group: 'Construction and destruction',
    keywords: ['copy constructor', 'move constructor', 'deep copy', 'noexcept'],
    definition: 'A copy constructor starts a new object from an existing lvalue while preserving the source. A move constructor starts a new object from an expiring source by transferring reusable resources and leaving the source valid but unspecified.',
    explanation: 'Copying an owning type must produce independent ownership; copying only the raw address creates two owners and double deletion. Moving takes the resource, clears the source ownership token, and is commonly marked noexcept so containers can relocate elements safely.',
    concepts: [
      concept('Copy constructor', 'A constructor with a parameter such as const T& that creates an independent new value from an existing object.', 'Buffer copy{original} allocates its own bytes.'),
      concept('Move constructor', 'A constructor with a T&& parameter that may transfer resources from an expiring object instead of duplicating them.', 'Buffer moved{std::move(original)} takes its allocation.'),
      concept('Valid moved-from state', 'The source after a move must remain destructible and assignable even though its former value is generally unspecified.', 'The moved-from Buffer has a null pointer and zero size.'),
    ],
    prediction: 'Why can a vector prefer a slower copy over a move constructor that is allowed to throw?',
    steps: ['Choose copy for an lvalue and move for an rvalue when overload resolution permits it.', 'Copy allocates and duplicates the source representation.', 'Move transfers the ownership token and empties the source token.', 'Both resulting objects must remain safe to destroy.'],
    failure: 'A shallow copy of an owning pointer causes aliasing, double free, and use-after-free. A move that fails to clear the source creates the same bug, while a throwing move can prevent containers from preserving their strong exception guarantee.',
    application: 'Message buffers are copied when two subsystems need independent payloads and moved when ownership passes from an acquisition queue to a parser without copying every byte.',
    example: 'Copy a three-byte Buffer and then move the copy; verify the destination size and that the moved-from object is empty but still destructible.',
    code: `#include <algorithm>
#include <cassert>
#include <cstddef>
#include <utility>

class Buffer {
  std::size_t size_{};
  int* data_{};
public:
  explicit Buffer(std::size_t size) : size_{size}, data_{new int[size]{}} {}
  ~Buffer() { delete[] data_; }
  Buffer(const Buffer& other)
    : size_{other.size_}, data_{new int[other.size_]} {
    std::copy(other.data_, other.data_ + size_, data_);
  }
  Buffer(Buffer&& other) noexcept
    : size_{std::exchange(other.size_, 0)},
      data_{std::exchange(other.data_, nullptr)} {}
  [[nodiscard]] std::size_t size() const { return size_; }
};

int main() {
  Buffer first{3};
  Buffer copy{first};
  Buffer moved{std::move(copy)};
  assert(first.size() == 3 && moved.size() == 3 && copy.size() == 0);
}`,
  }),
  cppTopic({
    id: 'cpp-ctor-control',
    title: 'Delegating, converting, explicit, deleted, and defaulted constructors',
    group: 'Construction and destruction',
    keywords: ['delegating constructor', 'conversion constructor', 'explicit', 'delete', 'default'],
    definition: 'Constructor-control syntax decides which object-creation paths exist. Delegation centralizes initialization, explicit blocks accidental implicit conversion, delete forbids a selected form, and default requests the compiler-generated operation.',
    explanation: 'A delegating constructor calls another constructor of the same class and has no independent member initializers. A one-argument constructor is a conversion path unless it is explicit. Deleted functions still participate in overload resolution so misuse produces a precise compile-time error.',
    concepts: [
      concept('Delegating constructor', 'A constructor that invokes another constructor of the same class so one path owns the initialization policy.', 'Timeout() : Timeout{1000} reuses validation.'),
      concept('Conversion constructor', 'A constructor callable with one effective argument that can define an implicit conversion into the class type.', 'Timeout(int) could silently convert 20 into Timeout.'),
      concept('explicit', 'A specifier that keeps direct construction available while rejecting unintended implicit conversion and copy initialization.', 'explicit Timeout(int) permits Timeout{20}, not send(20).'),
      concept('Deleted constructor', 'A constructor declared = delete that is considered by overload resolution but cannot be selected in valid code.', 'Device(const Device&) = delete forbids duplicate ownership.'),
      concept('Defaulted constructor', 'A constructor declared = default that asks the compiler to generate the normal memberwise operation when possible.', 'Record() = default documents the ordinary default state.'),
    ],
    prediction: 'Which syntax prevents an integer argument from silently becoming a Timeout while still allowing Timeout{25}?',
    steps: ['List the construction forms the type should support.', 'Delegate repeated default policy to one validating constructor.', 'Mark conversion-prone constructors explicit.', 'Delete ownership-invalid forms and default correct memberwise forms.'],
    failure: 'Implicit conversion constructors can make unrelated overloads viable and hide units mistakes. Repeating initialization across constructors lets invariants drift, while deleting the wrong special member can suppress useful generated operations.',
    application: 'A duration type makes milliseconds explicit so an API cannot confuse raw counts with typed time, while a hardware owner deletes copying because one peripheral handle must have one owner.',
    example: 'Directly create a Timeout, use the delegated default value, and verify at compile time that an int is not implicitly convertible to Timeout.',
    code: `#include <cassert>
#include <type_traits>

class Timeout {
  int milliseconds_;
public:
  Timeout() : Timeout{1000} {}
  explicit Timeout(int milliseconds) : milliseconds_{milliseconds} {
    assert(milliseconds > 0);
  }
  Timeout(const Timeout&) = default;
  [[nodiscard]] int count() const { return milliseconds_; }
};

class Device {
public:
  Device() = default;
  Device(const Device&) = delete;
};

int main() {
  static_assert(!std::is_convertible_v<int, Timeout>);
  Timeout standard;
  Timeout short_wait{25};
  assert(standard.count() == 1000 && short_wait.count() == 25);
}`,
  }),
  cppTopic({
    id: 'cpp-destructor-kinds',
    title: 'Trivial, non-trivial, defaulted, and virtual destructors',
    group: 'Construction and destruction',
    keywords: ['destructor', 'trivial destructor', 'virtual destructor', 'defaulted destructor'],
    definition: 'A destructor ends an object’s lifetime and releases resources owned by that object. A trivial destructor needs no runtime work, a non-trivial destructor must run cleanup, a defaulted destructor uses memberwise destruction, and a virtual destructor enables complete destruction through a base pointer.',
    explanation: 'The destructor body runs first, then members and bases are destroyed in reverse construction order. Member destructors already release their own resources, so Rule-of-Zero classes usually default destruction. Polymorphic ownership requires a virtual base destructor.',
    concepts: [
      concept('Trivial destructor', 'A destructor requiring no cleanup code because the type, its bases, and all members have trivial destruction.', 'A struct containing two integers is normally trivially destructible.'),
      concept('Non-trivial destructor', 'A destructor that must execute because it is user-provided, virtual, or a member or base requires destruction.', 'A class containing std::vector has non-trivial destruction.'),
      concept('Virtual destructor', 'A base destructor whose virtual dispatch destroys the most-derived object when deletion occurs through a base pointer.', 'unique_ptr<Driver> correctly destroys UartDriver.'),
      concept('Defaulted destructor', 'A destructor written = default to request correct compiler-generated reverse-order member destruction.', '~Session() = default lets its smart pointers clean up.'),
    ],
    prediction: 'What part of a derived object is skipped when it is deleted through a base pointer whose destructor is not virtual?',
    steps: ['Enter the most-derived destructor selected by static or virtual dispatch.', 'Run that destructor body.', 'Destroy members in reverse declaration order.', 'Destroy base subobjects and finally release the object storage.'],
    failure: 'Deleting a derived object through a base pointer without a virtual destructor is undefined behavior. Manually releasing a resource already owned by a member causes double cleanup, and throwing from a destructor during unwinding can terminate the program.',
    application: 'A driver registry stores different UART, SPI, and mock drivers behind one interface. A virtual destructor ensures removing any driver releases the concrete driver’s buffers and handles.',
    example: 'Destroy a concrete Driver through unique_ptr<Driver> and assert that the derived destructor changed an external observation flag.',
    code: `#include <cassert>
#include <memory>
#include <type_traits>

struct Sample { int value; };
static_assert(std::is_trivially_destructible_v<Sample>);

class Driver {
public:
  virtual ~Driver() = default;
};

class UartDriver final : public Driver {
  bool& destroyed_;
public:
  explicit UartDriver(bool& destroyed) : destroyed_{destroyed} {}
  ~UartDriver() override { destroyed_ = true; }
};

int main() {
  bool destroyed = false;
  { std::unique_ptr<Driver> driver = std::make_unique<UartDriver>(destroyed); }
  assert(destroyed);
}`,
  }),
  cppTopic({
    id: 'cpp-special-member-rules',
    title: 'Rule of three, rule of five, and rule of zero',
    group: 'Ownership and value semantics',
    keywords: ['rule of three', 'rule of five', 'rule of zero', 'special members'],
    definition: 'The rule of three says manual resource cleanup usually requires matching copy operations. The rule of five adds move construction and move assignment. The rule of zero avoids all five by storing resources in types that already implement ownership correctly.',
    explanation: 'Special members form one ownership contract. If destruction frees a raw resource, default copying is usually wrong. Modern resource members such as vector, string, and unique_ptr carry their own contract, allowing the containing type to use compiler-generated operations.',
    concepts: [
      concept('Rule of three', 'A raw-resource-owning type that defines destruction, copy construction, or copy assignment generally needs all three.', 'A raw buffer must deep-copy and delete exactly once.'),
      concept('Rule of five', 'A modern resource owner may additionally define move construction and move assignment to transfer ownership efficiently.', 'A socket wrapper moves its descriptor and clears the source.'),
      concept('Rule of zero', 'A type delegates ownership to resource-managing members and writes none of the five special member functions itself.', 'A Packet containing vector and string copies and moves correctly.'),
    ],
    prediction: 'If a class owns only vector and string members, what ownership operation is gained by writing a custom destructor?',
    steps: ['Identify every resource and its owner.', 'Prefer a member type that already owns that resource.', 'Let compiler-generated copy and move follow member semantics.', 'Write special members only when the desired policy differs.'],
    failure: 'Writing only a destructor around a raw pointer leaves default shallow copying enabled. Writing unnecessary special members suppresses generation rules, increases exception risk, and can make a type slower or non-movable without adding correctness.',
    application: 'A telemetry Packet stores payload bytes and a source label. Using vector and string gives independent copies and efficient moves without maintaining manual allocation code.',
    example: 'Copy and move a Rule-of-Zero Packet, then verify that copying preserves independent payload values and moving transfers a valid value.',
    code: `#include <cassert>
#include <string>
#include <utility>
#include <vector>

struct Packet {
  std::string source;
  std::vector<int> payload;
};

int main() {
  Packet first{"uart", {1, 2, 3}};
  Packet copy = first;
  copy.payload[0] = 9;
  Packet moved = std::move(copy);
  assert(first.payload[0] == 1);
  assert(moved.payload[0] == 9);
}`,
  }),
  cppTopic({
    id: 'cpp-unique-ownership',
    title: 'unique_ptr and make_unique',
    group: 'Ownership and value semantics',
    keywords: ['unique_ptr', 'make_unique', 'move-only', 'ownership'],
    definition: 'std::unique_ptr is a move-only smart pointer representing exactly one owner of a dynamically allocated object. std::make_unique constructs that object and returns its owner without exposing a raw owning pointer.',
    explanation: 'The unique pointer deletes its object when its own lifetime ends. Copying is forbidden because two exclusive owners would contradict the model; moving transfers the pointer and leaves the source empty. Raw pointers obtained with get are observers only.',
    concepts: [
      concept('unique_ptr', 'A move-only RAII owner that destroys exactly one dynamically allocated object when the owner leaves scope.', 'unique_ptr<Driver> owns one selected concrete driver.'),
      concept('make_unique', 'A factory that constructs an object and immediately packages it in unique ownership with exception-safe syntax.', 'make_unique<Packet>(42) creates and owns one Packet.'),
      concept('Observer pointer', 'A non-owning pointer that may inspect an object but must not delete it or outlive the actual owner.', 'Packet* view = owner.get() borrows the Packet.'),
    ],
    prediction: 'After moving a unique_ptr into a queue, which object is responsible for deletion: the source or the queue element?',
    steps: ['Construct the resource directly into a unique_ptr.', 'Borrow temporarily through references or get without transferring ownership.', 'Move the unique_ptr when ownership changes subsystem.', 'Destroy or reset the final owner to release the resource.'],
    failure: 'Constructing two unique_ptr objects from the same raw pointer causes double deletion. Keeping a get result after the owner moves or dies creates a dangling observer, and release leaks unless another owner immediately adopts the pointer.',
    application: 'A device manager owns one concrete communication driver selected at startup and transfers that driver into the service that controls its lifetime.',
    example: 'Create a Packet with make_unique, move it into a consumer function, and verify that the caller becomes empty while the consumer reads the payload.',
    code: `#include <cassert>
#include <memory>
#include <utility>

struct Packet { int value; };

int consume(std::unique_ptr<Packet> packet) {
  return packet->value;
}

int main() {
  auto owner = std::make_unique<Packet>(Packet{42});
  Packet* observer = owner.get();
  assert(observer->value == 42);
  int result = consume(std::move(owner));
  assert(result == 42 && owner == nullptr);
}`,
  }),
  cppTopic({
    id: 'cpp-shared-weak-ownership',
    title: 'shared_ptr, weak_ptr, use_count, and ownership cycles',
    group: 'Ownership and value semantics',
    keywords: ['shared_ptr', 'weak_ptr', 'make_shared', 'use_count', 'cycle'],
    definition: 'std::shared_ptr gives several owners one object lifetime through a control block. std::weak_ptr observes that control block without owning the object, which allows graphs to represent back-links without creating permanent ownership cycles.',
    explanation: 'Copying a shared pointer increments the strong count; destroying one decrements it. The object dies when the strong count reaches zero, while the control block can remain for weak observers. lock creates a temporary shared owner only when the object still exists.',
    concepts: [
      concept('shared_ptr', 'A copyable smart pointer whose control block counts the owners that jointly keep one object alive.', 'Two asynchronous requests share immutable configuration.'),
      concept('make_shared', 'A factory that normally allocates the object and its shared control block together and returns the first owner.', 'make_shared<Node>() creates one graph node.'),
      concept('weak_ptr', 'A non-owning control-block observer that can test expiration and conditionally acquire temporary shared ownership.', 'A child stores a weak parent link.'),
      concept('Ownership cycle', 'A cycle of strong shared references whose counts can never reach zero even after outside owners disappear.', 'Two nodes storing shared_ptr to each other leak.'),
      concept('use_count', 'A diagnostic count of current strong owners that is not a synchronization protocol or stable program decision.', 'Tests may inspect use_count, but logic should not race on it.'),
    ],
    prediction: 'Why does changing a child-to-parent edge from shared_ptr to weak_ptr allow both nodes to be destroyed?',
    steps: ['Create the object and control block with make_shared.', 'Copy shared ownership only to components that truly extend lifetime.', 'Represent non-owning back-links with weak_ptr.', 'Use lock and handle expiration before access.'],
    failure: 'Strong parent and child back-links form a leak even though every pointer is a smart pointer. Assuming use_count stays unchanged across threads is a race in reasoning, and dereferencing after a failed weak lock is invalid.',
    application: 'An asynchronous request graph owns child operations from the root, while each child holds a weak link back to request context so completed graphs can disappear.',
    example: 'Create a parent with a child, keep the child-to-parent edge weak, drop the parent owner, and verify that the weak pointer reports expiration.',
    code: `#include <cassert>
#include <memory>

struct Parent;
struct Child { std::weak_ptr<Parent> parent; };
struct Parent { std::shared_ptr<Child> child; };

int main() {
  std::weak_ptr<Parent> observation;
  {
    auto parent = std::make_shared<Parent>();
    parent->child = std::make_shared<Child>();
    parent->child->parent = parent;
    observation = parent;
    assert(parent.use_count() == 1);
  }
  assert(observation.expired());
}`,
  }),
  cppTopic({
    id: 'cpp-value-categories-move',
    title: 'lvalues, rvalues, std::move, and moving from const',
    group: 'Move semantics and generic forwarding',
    keywords: ['lvalue', 'rvalue', 'std::move', 'move from const'],
    definition: 'An lvalue expression identifies an object with continuing identity; an rvalue denotes a temporary or expiring value. std::move is only a cast to an expiring value category, enabling move overload resolution but performing no transfer itself.',
    explanation: 'A named variable is an lvalue even if its declared type is an rvalue reference. Move constructors normally require a non-const rvalue because transfer modifies the source. Applying std::move to const commonly selects a copy instead.',
    concepts: [
      concept('lvalue', 'An expression identifying an object or function with stable identity and a location that can be referred to again.', 'A named std::string variable is an lvalue.'),
      concept('rvalue', 'A temporary value or expiring object whose resources may be reused by a selected move-aware operation.', 'The result of make_message() is an rvalue.'),
      concept('std::move', 'An unconditional cast that marks an expression as expiring so rvalue-reference overloads may be selected.', 'vector.push_back(std::move(name)) may invoke string move construction.'),
      concept('Moving from const', 'A const expiring value generally cannot bind to a move operation that needs permission to modify its source.', 'std::move(const_string) normally invokes the copy constructor.'),
    ],
    prediction: 'Inside a function receiving T&& value, is the expression value an lvalue or an rvalue when it has a name?',
    steps: ['Determine the expression’s value category, not only its declared type.', 'Use std::move only when the current value may be surrendered.', 'Let overload resolution select copy or move construction.', 'Use the source only through its documented moved-from guarantees.'],
    failure: 'Using an object’s old value after moving from it relies on unspecified state. Adding std::move to return statements can inhibit elision, and moving a const object may silently copy instead of providing the expected performance.',
    application: 'A pipeline moves completed frame buffers between queues to transfer ownership without copying the full image, while configuration values remain copied because both components retain them.',
    example: 'Instrument copy and move constructors, pass an lvalue and std::move of that value, then verify that the corresponding counters change.',
    code: `#include <cassert>
#include <utility>

struct Value {
  static inline int copies = 0;
  static inline int moves = 0;
  Value() = default;
  Value(const Value&) { ++copies; }
  Value(Value&&) noexcept { ++moves; }
};

int main() {
  Value source;
  Value copied{source};
  Value moved{std::move(source)};
  const Value fixed;
  Value copied_again{std::move(fixed)};
  assert(Value::copies == 2 && Value::moves == 1);
}`,
  }),
  cppTopic({
    id: 'cpp-perfect-forwarding',
    title: 'Forwarding references and std::forward',
    group: 'Move semantics and generic forwarding',
    keywords: ['forwarding reference', 'reference collapsing', 'std::forward', 'perfect forwarding'],
    definition: 'Perfect forwarding passes an argument through generic code while preserving its original cv-qualification and whether it arrived as an lvalue or rvalue. A forwarding reference is a deduced T&& parameter used with std::forward<T>.',
    explanation: 'When an lvalue reaches T&& under deduction, T becomes an lvalue-reference type and reference collapsing produces T&. std::forward conditionally casts based on that deduced T, unlike std::move, which always marks the expression expiring.',
    concepts: [
      concept('Forwarding reference', 'A deduced T&& parameter that can bind to lvalues and rvalues because template deduction and reference collapsing cooperate.', 'template<class T> void relay(T&& value) accepts both categories.'),
      concept('Reference collapsing', 'The language rules reducing nested reference forms so any combination containing an lvalue reference becomes an lvalue reference.', 'U& && collapses to U&, while U&& && remains U&&.'),
      concept('std::forward', 'A conditional cast that reconstructs the caller’s original value category from the deduced forwarding-reference type.', 'std::forward<T>(value) stays lvalue when T is U&.'),
    ],
    prediction: 'Why would replacing std::forward with std::move incorrectly consume an lvalue supplied by the caller?',
    steps: ['Deduce T from the caller’s expression.', 'Collapse T&& to the effective parameter type.', 'Remember that the named parameter expression itself is an lvalue.', 'Use std::forward<T> at the final receiving call.'],
    failure: 'Using std::move unconditionally can steal from caller-owned lvalues. Forwarding the same argument more than once can consume it twice, and a non-deduced T&& parameter is an ordinary rvalue reference rather than a forwarding reference.',
    application: 'Container emplace operations forward constructor arguments directly into element storage so lvalues are copied and temporary resources are moved exactly as the caller requested.',
    example: 'Relay one lvalue and one temporary into overloaded sink functions, then verify that forwarding selects the const-reference and rvalue-reference overloads.',
    code: `#include <cassert>
#include <utility>

struct Token {};
int selected = 0;
void sink(const Token&) { selected = 1; }
void sink(Token&&) { selected = 2; }

template<class T>
void relay(T&& value) {
  sink(std::forward<T>(value));
}

int main() {
  Token token;
  relay(token);
  assert(selected == 1);
  relay(Token{});
  assert(selected == 2);
}`,
  }),
  cppTopic({
    id: 'cpp-diamond-inheritance',
    title: 'Diamond inheritance and virtual bases',
    group: 'Inheritance and runtime polymorphism',
    keywords: ['diamond inheritance', 'virtual inheritance', 'base subobject', 'ambiguity'],
    definition: 'Diamond inheritance occurs when a most-derived class reaches one base type through two intermediate bases. Ordinary inheritance creates two base subobjects; virtual inheritance makes those paths share one base subobject initialized by the most-derived constructor.',
    explanation: 'Without virtual inheritance, converting the final object to the repeated base is ambiguous and its state exists twice. Virtual inheritance changes object layout and construction responsibility so the most-derived class initializes the single shared virtual base.',
    concepts: [
      concept('Diamond inheritance', 'An inheritance graph where two intermediate classes derive from the same base and one final class derives from both intermediates.', 'Combined reaches Device through Reader and Writer.'),
      concept('Virtual inheritance', 'A base-specifier form that creates one shared virtual base subobject in the most-derived object instead of one per path.', 'Reader and Writer virtually inherit Device.'),
      concept('Virtual base initialization', 'The rule that the most-derived constructor, not an intermediate constructor, initializes each shared virtual base.', 'Combined initializes Device{7} exactly once.'),
    ],
    prediction: 'If Reader and Writer inherit Device normally, how many Device::id fields exist in one Combined object?',
    steps: ['Draw every base-subobject path in the hierarchy.', 'Identify the repeated base reached through multiple branches.', 'Decide whether one shared identity is semantically required.', 'Use virtual inheritance and initialize the shared base from the most-derived type.'],
    failure: 'Using virtual inheritance merely to silence ambiguity can hide a poor model. It changes layout, pointer adjustments, and construction order, while non-virtual diamonds silently duplicate base state.',
    application: 'A framework that truly combines one shared device identity with independent readable and writable interfaces can use a virtual Device base, though composition is often simpler.',
    example: 'Construct one Duplex object through two virtually inherited interfaces and verify that updates through either path reach the same Device state.',
    code: `#include <cassert>

struct Device {
  explicit Device(int id) : id{id} {}
  int id;
};
struct Reader : virtual Device { using Device::Device; };
struct Writer : virtual Device { using Device::Device; };
struct Duplex : Reader, Writer {
  explicit Duplex(int id) : Device{id}, Reader{id}, Writer{id} {}
};

int main() {
  Duplex port{7};
  static_cast<Reader&>(port).id = 9;
  assert(static_cast<Writer&>(port).id == 9);
}`,
  }),
  cppTopic({
    id: 'cpp-virtual-dispatch-slicing',
    title: 'Virtual dispatch, vtables, and object slicing',
    group: 'Inheritance and runtime polymorphism',
    keywords: ['virtual dispatch', 'vtable', 'vptr', 'object slicing', 'override'],
    definition: 'Runtime polymorphism selects an override from an object’s dynamic type when a virtual function is called through a base pointer or reference. Object slicing instead copies only the base subobject into a standalone base value, losing the derived state and dynamic type.',
    explanation: 'Most implementations store a hidden vptr that reaches a vtable of function targets, although the standard specifies behavior rather than layout. Passing by reference preserves dynamic type; passing by base value constructs a new base object and therefore cannot dispatch to the discarded derived part.',
    concepts: [
      concept('Dynamic type', 'The most-derived type of the object currently referred to through a base pointer or reference.', 'Driver& can have dynamic type UartDriver.'),
      concept('vtable and vptr', 'A common implementation where each polymorphic object refers to a table containing targets for its virtual operations.', 'A virtual read loads the override target through the object.'),
      concept('Object slicing', 'Copying a derived object into a base object by value, retaining only the base subobject and losing derived state.', 'Driver copy = uart slices UartDriver.'),
      concept('override', 'A compile-time check that a derived member really overrides a compatible virtual base member.', 'int id() const override rejects signature drift.'),
    ],
    prediction: 'Why does calling id on a Base value copied from Derived return the base result even though the source object was derived?',
    steps: ['Keep the complete derived object alive.', 'Bind a base reference or pointer without copying.', 'Perform virtual dispatch using the dynamic type.', 'Contrast with base-by-value construction that slices the object.'],
    failure: 'Omitting override can create accidental hiding instead of overriding. Passing polymorphic objects by value slices them, and deleting through a base without a virtual destructor is undefined behavior.',
    application: 'A scheduler stores heterogeneous jobs behind unique_ptr<Job>, preserving concrete execute behavior while giving the queue one stable interface.',
    example: 'Call the same virtual function through a base reference and through a sliced base value, then assert the different results.',
    code: `#include <cassert>

struct Driver {
  virtual ~Driver() = default;
  virtual int id() const { return 1; }
};
struct UartDriver final : Driver {
  int id() const override { return 7; }
};

int main() {
  UartDriver uart;
  Driver& reference = uart;
  Driver sliced = uart;
  assert(reference.id() == 7);
  assert(sliced.id() == 1);
}`,
  }),
  cppTopic({
    id: 'cpp-exception-control-flow',
    title: 'try, throw, typed catches, and catch-all handlers',
    group: 'Exceptions and failure guarantees',
    keywords: ['try', 'throw', 'catch', 'multiple catch', 'catch all'],
    definition: 'An exception transfers control from a throw expression to the nearest matching handler surrounding the active call chain. Typed catch clauses are tested in order, while catch (...) accepts any exception that reaches it.',
    explanation: 'The thrown object is initialized, stack unwinding begins, and handlers are considered from inner scopes outward. Derived exception handlers must precede base handlers, and exceptions are normally caught by const reference to avoid copying and slicing.',
    concepts: [
      concept('try block', 'A guarded sequence whose dynamically called operations are associated with the catch handlers that immediately follow it.', 'Parsing and validation execute inside one try block.'),
      concept('throw expression', 'An expression that creates or propagates an exception object and abandons ordinary control flow.', 'throw std::invalid_argument{"empty"} reports invalid input.'),
      concept('Typed catch', 'A handler selected when its parameter type can match the current exception object under exception matching rules.', 'catch (const invalid_argument&) handles validation.'),
      concept('catch (...)', 'A final handler that matches any exception type but provides no direct typed access to the exception object.', 'A thread boundary logs and contains unknown failure.'),
    ],
    prediction: 'If catch(std::exception const&) appears before catch(std::invalid_argument const&), which handler receives invalid_argument?',
    steps: ['Execute ordinary statements inside the try block.', 'Construct the exception at the throw point.', 'Unwind completed automatic objects while searching outward.', 'Enter the first matching handler and continue after the handler sequence.'],
    failure: 'Catching by value can slice derived exceptions. A broad handler placed first makes narrower handlers unreachable, and catch-all without rethrow can hide corruption or violate a required recovery policy.',
    application: 'A configuration loader distinguishes malformed values from missing files and converts both into one startup diagnostic at the application boundary.',
    example: 'Throw invalid_argument for an empty value, catch it before the general std::exception handler, and verify the selected error code.',
    code: `#include <cassert>
#include <stdexcept>
#include <string_view>

int parse(std::string_view text) {
  if (text.empty()) throw std::invalid_argument{"empty"};
  return 42;
}

int main() {
  int selected = 0;
  try {
    (void)parse("");
  } catch (const std::invalid_argument&) {
    selected = 1;
  } catch (const std::exception&) {
    selected = 2;
  } catch (...) {
    selected = 3;
  }
  assert(selected == 1);
}`,
  }),
  cppTopic({
    id: 'cpp-unwinding-safety',
    title: 'Stack unwinding, noexcept, and exception guarantees',
    group: 'Exceptions and failure guarantees',
    keywords: ['stack unwinding', 'noexcept', 'basic guarantee', 'strong guarantee'],
    definition: 'Stack unwinding destroys completed automatic objects between the throw point and its handler. Exception safety specifies the state left after failure: no leaks, valid state, unchanged observable state, or a promise never to throw.',
    explanation: 'RAII makes unwinding release resources. The basic guarantee preserves invariants and prevents leaks; the strong guarantee behaves transactionally; the no-throw guarantee promises completion. noexcept violations call terminate, so the marker must reflect reality.',
    concepts: [
      concept('Stack unwinding', 'The reverse-order destruction of completed automatic objects while control searches outward for a matching exception handler.', 'A lock_guard unlocks while a function exits by exception.'),
      concept('Basic guarantee', 'After failure, no resources leak and every involved object remains valid, though its value may have changed.', 'A container remains usable after an allocation failure.'),
      concept('Strong guarantee', 'A failed operation leaves externally observable state unchanged, commonly by preparing work before committing it.', 'Copy-and-swap replaces state only after copying succeeds.'),
      concept('noexcept', 'A declaration that an operation does not allow exceptions to escape; violation invokes std::terminate.', 'A resource-transfer move is often noexcept.'),
    ],
    prediction: 'Why does constructing a replacement value before swapping it into an object provide the strong guarantee?',
    steps: ['Acquire every resource into an RAII owner.', 'Perform potentially throwing work on temporary state.', 'Commit through a non-throwing swap or state transition.', 'Let unwinding destroy temporary state when preparation fails.'],
    failure: 'A destructor that throws during active unwinding leads to termination. Marking fallible code noexcept converts recoverable failure into termination, while partial in-place mutation can violate even the basic guarantee.',
    application: 'A routing-table update parses and validates a complete replacement before swapping it into service, so readers see either the old valid table or the new valid table.',
    example: 'Attempt a replacement that throws before swap and assert that the original Config remains unchanged after the catch.',
    code: `#include <cassert>
#include <stdexcept>
#include <utility>
#include <vector>

class Config {
  std::vector<int> values_;
public:
  explicit Config(std::vector<int> values) : values_{std::move(values)} {}
  void replace(std::vector<int> values) {
    if (values.empty()) throw std::invalid_argument{"empty"};
    Config prepared{std::move(values)};
    values_.swap(prepared.values_);
  }
  [[nodiscard]] int first() const { return values_.front(); }
};

int main() {
  Config config{{7}};
  bool rejected = false;
  try {
    config.replace({});
  } catch (const std::invalid_argument&) {
    rejected = true;
  }
  assert(rejected);
  assert(config.first() == 7);
}`,
  }),
  cppTopic({
    id: 'cpp-template-basics',
    title: 'Function templates, class templates, and instantiation',
    group: 'Templates, STL, and callable code',
    keywords: ['function template', 'class template', 'template instantiation', 'generic stack'],
    definition: 'A template is a compile-time pattern parameterized by types or values. Function templates generate callable specializations after deduction, while class templates generate distinct types when supplied arguments.',
    explanation: 'The compiler parses the template, substitutes concrete arguments when a specialization is needed, checks dependent operations, and emits code when required. Requirements should be explicit through concepts or carefully designed operations.',
    concepts: [
      concept('Function template', 'A parameterized function pattern from which the compiler forms specializations for deduced or explicit template arguments.', 'maximum(2, 7) instantiates maximum<int>.'),
      concept('Class template', 'A parameterized class pattern that generates a distinct class type for each valid argument list.', 'Stack<int> and Stack<double> are different types.'),
      concept('Template instantiation', 'The process of substituting template arguments, checking the resulting specialization, and producing a usable declaration or definition.', 'Calling swap_value<int> requires its int specialization.'),
      concept('Generic stack', 'A stack whose element type is a template parameter while push, pop, and top preserve one LIFO invariant.', 'Stack<Packet> stores packets without rewriting stack logic.'),
    ],
    prediction: 'Why can a template definition compile when declared but fail only when instantiated with a type lacking a required operator?',
    steps: ['Write the algorithm in terms of a template parameter.', 'State the operations the parameter must support.', 'Deduce or provide concrete arguments at the use site.', 'Instantiate and type-check the resulting specialization.'],
    failure: 'Unstated requirements create unreadable substitution diagnostics. Defining a needed template only in a source file can hide its body from other translation units at instantiation time.',
    application: 'A fixed-capacity embedded queue is parameterized by message type and capacity, allowing one tested ownership and bounds implementation for commands, samples, and events.',
    example: 'Instantiate one fixed Stack<int>, push two values, and verify last-in-first-out behavior without any type-specific stack code.',
    code: `#include <array>
#include <cassert>
#include <cstddef>

template<class T, std::size_t Capacity>
class Stack {
  std::array<T, Capacity> data_{};
  std::size_t size_{};
public:
  bool push(const T& value) {
    if (size_ == Capacity) return false;
    data_[size_++] = value;
    return true;
  }
  T pop() { return data_[--size_]; }
};

int main() {
  Stack<int, 4> stack;
  assert(stack.push(3) && stack.push(9));
  assert(stack.pop() == 9 && stack.pop() == 3);
}`,
  }),
  cppTopic({
    id: 'cpp-template-advanced',
    title: 'Specialization, partial specialization, and variadic templates',
    group: 'Templates, STL, and callable code',
    keywords: ['full specialization', 'partial specialization', 'variadic template', 'fold expression'],
    definition: 'Template specialization replaces or adapts a primary template for selected arguments. Full specialization names one exact argument set, partial specialization matches a family of class-template arguments, and variadic templates accept parameter packs.',
    explanation: 'The compiler selects the primary or most specialized matching class-template form. Function templates can be fully specialized but not partially specialized, so overloads are often better. A fold expression reduces a parameter pack with one operator.',
    concepts: [
      concept('Full specialization', 'A separately defined template form selected for one exact set of template arguments.', 'Label<bool> supplies text specifically for bool.'),
      concept('Partial specialization', 'A class-template form selected for an argument pattern that is narrower than the primary template but not exact.', 'Traits<T*> describes every pointer type.'),
      concept('Variadic template', 'A template containing a parameter pack that can represent zero or more types or values.', 'sum(values...) accepts any number of numeric arguments.'),
      concept('Fold expression', 'C++ syntax that expands a parameter pack around an operator to form one expression.', '(values + ...) adds every supplied value.'),
    ],
    prediction: 'Which form is selected for Traits<int*> when a primary Traits<T> and partial Traits<T*> both exist?',
    steps: ['Define a general primary template.', 'Identify a real family requiring different representation or behavior.', 'Add the narrowest legal specialization or overload.', 'Instantiate test cases that prove selection and pack expansion.'],
    failure: 'Overlapping partial specializations can be ambiguous. Specializing standard-library templates outside documented permissions is undefined behavior, and fold expressions need an identity or policy for empty packs.',
    application: 'Serialization traits use partial specialization to distinguish scalar values from pointer-like or container forms, while variadic logging formats a compile-time pack of fields.',
    example: 'Use a pointer partial specialization and a variadic fold, then assert both compile-time classification and runtime sum.',
    code: `#include <cassert>
#include <type_traits>

template<class T>
struct Traits { static constexpr bool pointer = false; };

template<class T>
struct Traits<T*> { static constexpr bool pointer = true; };

template<class... Values>
auto sum(Values... values) {
  return (values + ...);
}

int main() {
  static_assert(!Traits<int>::pointer);
  static_assert(Traits<int*>::pointer);
  assert(sum(1, 2, 3, 4) == 10);
}`,
  }),
  cppTopic({
    id: 'cpp-stl-containers',
    title: 'STL container families and their costs',
    group: 'Templates, STL, and callable code',
    keywords: ['vector', 'deque', 'list', 'map', 'unordered_map', 'container adaptor'],
    definition: 'An STL container owns a collection under a defined storage, iterator, and complexity contract. Sequence containers organize by position, associative containers by key ordering or hashing, and adaptors restrict another container to stack or queue operations.',
    explanation: 'Container choice follows access pattern, mutation pattern, ordering requirements, invalidation rules, and memory locality. vector is the default sequence because contiguous storage makes iteration and cache use efficient.',
    concepts: [
      concept('Sequence container', 'A container organizing elements by positional sequence, with costs determined by its storage model.', 'vector provides contiguous random access.'),
      concept('Ordered associative container', 'A key-based container maintaining comparator order, commonly with logarithmic lookup and insertion.', 'map keeps register names sorted by key.'),
      concept('Unordered associative container', 'A hash-table container offering average constant-time key operations without maintaining sorted iteration.', 'unordered_map counts packet identifiers.'),
      concept('Container adaptor', 'A restricted interface such as stack, queue, or priority_queue implemented over an underlying container.', 'queue exposes FIFO operations without random indexing.'),
    ],
    prediction: 'Why is vector often faster to traverse than list even when both traversal complexities are O(n)?',
    steps: ['State required ordering and key access.', 'State insertion, removal, and traversal frequency.', 'Check iterator invalidation and ownership rules.', 'Measure with realistic data before replacing the simplest suitable container.'],
    failure: 'Choosing from Big-O alone ignores cache locality and allocation overhead. Holding iterators across vector reallocation or unordered-map rehash creates invalid access.',
    application: 'A packet decoder stores ordered bytes in vector, handler lookup in unordered_map, and deadline work in priority_queue because each structure matches one actual access contract.',
    example: 'Count repeated device IDs with unordered_map and copy the resulting key-value pairs into vector for a sorted report.',
    code: `#include <algorithm>
#include <cassert>
#include <unordered_map>
#include <utility>
#include <vector>

int main() {
  std::unordered_map<int, int> counts;
  for (int id : {3, 1, 3, 2, 3}) ++counts[id];
  std::vector<std::pair<int, int>> report{counts.begin(), counts.end()};
  std::sort(report.begin(), report.end());
  assert((report.front() == std::pair{1, 1}));
  assert(counts.at(3) == 3);
}`,
  }),
  cppTopic({
    id: 'cpp-iterators-algorithms-lambdas',
    title: 'Iterators, algorithms, and lambda captures',
    group: 'Templates, STL, and callable code',
    keywords: ['begin', 'end', 'cbegin', 'rbegin', 'algorithm', 'lambda capture'],
    definition: 'An iterator identifies a position in a range, and a half-open pair [begin, end) defines which elements an algorithm may inspect. A lambda creates a callable object whose capture list states what surrounding state it stores or references.',
    explanation: 'begin/end permit mutation when the range is mutable; cbegin/cend force read-only access; rbegin/rend traverse in reverse. Algorithms express traversal once, while lambdas provide the operation and must respect captured lifetimes.',
    concepts: [
      concept('begin and end', 'Iterator endpoints defining a half-open forward range whose end iterator is a sentinel position and is never dereferenced.', 'sort(values.begin(), values.end()) covers every value.'),
      concept('cbegin and cend', 'Endpoints that expose const iteration even when the underlying container object itself is mutable.', 'accumulate(values.cbegin(), values.cend(), 0) reads only.'),
      concept('rbegin and rend', 'Reverse-iterator endpoints that visit the same range from its final element toward its first element.', 'find(values.rbegin(), values.rend(), key) finds the last occurrence.'),
      concept('Lambda capture', 'The bracket list controlling whether each outside entity is copied into the closure or referenced by the closure.', '[limit] owns a copy; [&count] refers to existing count.'),
      concept('Generic lambda', 'A lambda with auto parameters or an explicit template list, allowing one closure type to accept several argument types.', '[](const auto& value) { return value.size(); } is generic.'),
    ],
    prediction: 'What lifetime bug appears when a returned lambda captures a local variable by reference?',
    steps: ['Choose the exact iterator range.', 'Choose a standard algorithm matching the operation.', 'Capture only state the callable needs, with explicit ownership.', 'Check iterator invalidation and closure lifetime.'],
    failure: 'Dereferencing end is invalid. Mutating a container can invalidate active iterators, and a reference capture that outlives its referenced local becomes dangling.',
    application: 'A telemetry filter uses stable threshold values captured by value and standard algorithms to select samples, making traversal and selection policy separately testable.',
    example: 'Filter readings with a value-captured threshold, then find the final matching reading through reverse iterators.',
    code: `#include <algorithm>
#include <cassert>
#include <vector>

int main() {
  std::vector<int> readings{2, 8, 4, 9, 5};
  const int threshold = 6;
  std::vector<int> selected;
  std::copy_if(
      readings.cbegin(), readings.cend(),
      std::back_inserter(selected),
      [threshold](auto value) { return value >= threshold; });
  auto final_nine = std::find(readings.rbegin(), readings.rend(), 9);
  assert(selected == std::vector<int>({8, 9}));
  assert(final_nine != readings.rend());
}`,
  }),
  cppTopic({
    id: 'cpp-optional-variant-any',
    title: 'optional, variant, visit, and any',
    group: 'Type-safe results and utilities',
    keywords: ['std::optional', 'std::variant', 'std::visit', 'std::any'],
    definition: 'std::optional represents either one T value or no value. std::variant represents exactly one alternative from a closed type list, std::visit performs type-safe dispatch, and std::any stores one runtime type from an open set.',
    explanation: 'These types encode state in the type system instead of magic values or unchecked unions. optional requires presence checks; variant requires handling alternatives; any requires runtime type knowledge and throws or returns null on mismatch.',
    concepts: [
      concept('std::optional', 'A value-or-empty type that makes absence explicit without inventing a sentinel inside the value domain.', 'find_port returns optional<int>.'),
      concept('std::variant', 'A discriminated union that stores exactly one alternative from a compile-time closed list and tracks the active index.', 'Event stores Reading or Fault.'),
      concept('std::visit', 'A checked dispatcher that invokes a callable with the currently active variant alternative.', 'visit prints Reading and Fault through overloads.'),
      concept('std::any', 'A type-erased holder for one copyable value of an arbitrary runtime type, recovered through any_cast.', 'A plugin metadata slot stores an optional extension value.'),
    ],
    prediction: 'Why can variant provide exhaustive compile-time handling that any cannot provide?',
    steps: ['Use optional for one type with meaningful absence.', 'Use variant for a closed set of possible states.', 'Visit every variant alternative explicitly.', 'Reserve any for truly open extension boundaries and check casts.'],
    failure: 'Calling optional::value while empty throws. get with the wrong variant alternative throws, and any_cast with the wrong type fails because the compiler cannot know the open runtime set.',
    application: 'A protocol parser returns optional when a frame is incomplete and variant<Reading, Fault> when a complete frame can represent one of two domain events.',
    example: 'Parse one present and one absent value, then visit two variant alternatives and verify the calculated result.',
    code: `#include <cassert>
#include <optional>
#include <type_traits>
#include <variant>

struct Reading { int value; };
struct Fault { int code; };
using Event = std::variant<Reading, Fault>;

int magnitude(const Event& event) {
  return std::visit([](const auto& item) {
    using Item = std::decay_t<decltype(item)>;
    if constexpr (std::is_same_v<Item, Reading>) return item.value;
    else return -item.code;
  }, event);
}

int main() {
  std::optional<int> port = 4;
  Event event = Reading{42};
  assert(port.value_or(-1) == 4);
  assert(magnitude(event) == 42);
}`,
  }),
  cppTopic({
    id: 'cpp-thread-mutex-atomic',
    title: 'Threads, mutexes, condition variables, and atomics',
    group: 'Concurrency and memory ordering',
    keywords: ['std::thread', 'std::jthread', 'std::mutex', 'condition_variable', 'atomic'],
    definition: 'A C++ thread is an independently scheduled execution sequence sharing process memory. Mutexes protect compound invariants, condition variables sleep on predicates, and atomics provide indivisible operations with explicit memory-order relationships.',
    explanation: 'Thread creation does not transfer referenced-object lifetime. Lock/unlock establishes synchronization for protected state; a condition wait releases and reacquires the mutex; release/acquire atomics can publish earlier writes to a reader.',
    concepts: [
      concept('std::jthread', 'An owning thread type that joins automatically and carries a cooperative stop token for structured cancellation.', 'A sensor worker exits after stop is requested.'),
      concept('std::mutex', 'A mutual-exclusion primitive whose lock and unlock operations protect one documented shared invariant.', 'A queue mutex protects storage and size together.'),
      concept('Condition variable', 'A waiting primitive associated with a mutex-protected predicate and always checked in a loop or predicate overload.', 'A consumer waits until the queue is non-empty.'),
      concept('std::atomic', 'A type whose operations are indivisible and can establish defined ordering between threads without a data race.', 'An atomic shutdown flag publishes termination.'),
    ],
    prediction: 'Why does making only queue.size atomic not make concurrent push_back and pop_back operations on the vector safe?',
    steps: ['Partition data by ownership before introducing sharing.', 'Name every remaining shared invariant.', 'Use mutexes for multi-field state and condition variables for waiting.', 'Use atomics only with a written ordering proof.'],
    failure: 'Detached threads can outlive referenced objects. Locking only one field of a compound invariant leaves logical races, and relaxed atomics do not publish unrelated non-atomic data.',
    application: 'A sampling service gives acquisition and processing separate jthreads connected by a mutex-protected queue, while a stop token coordinates bounded shutdown.',
    example: 'Launch two threads that increment one protected counter, join both, and verify that the final value contains every update.',
    code: `#include <cassert>
#include <mutex>
#include <thread>
#include <vector>

int main() {
  std::mutex mutex;
  int count = 0;
  auto work = [&] {
    for (int index = 0; index < 1000; ++index) {
      std::lock_guard lock{mutex};
      ++count;
    }
  };
  std::jthread first{work};
  std::jthread second{work};
  first.join();
  second.join();
  assert(count == 2000);
}`,
  }),
];

const linuxTopic = ({
  id,
  title,
  group,
  keywords,
  definition,
  explanation,
  application,
  prediction,
  steps,
  failure,
  c,
  cpp,
  guidance,
}) => ({
  id,
  title,
  group,
  keywords,
  level: 'deep',
  definition,
  explanation,
  application,
  prediction,
  steps,
  failure,
  c,
  cpp,
  guidance,
});

export const focusedLinuxSubtopics = [
  linuxTopic({
    id: 'os-descriptor-flags',
    title: 'Descriptor flags versus open-file status flags',
    group: 'Files and descriptors: focused mechanisms',
    keywords: ['FD_CLOEXEC', 'O_NONBLOCK', 'F_GETFD', 'F_GETFL'],
    definition: 'Descriptor flags belong to one file-descriptor table entry, while open-file status flags belong to the shared open-file description. FD_CLOEXEC is descriptor-local; O_NONBLOCK is shared by descriptors duplicated from the same open file description.',
    explanation: 'dup creates a new descriptor entry pointing at the same open-file description. F_GETFD and F_SETFD inspect the entry; F_GETFL and F_SETFL inspect shared status. A read-modify-write update preserves unrelated bits.',
    application: 'A shell marks private pipe ends close-on-exec without changing sibling descriptors, while enabling nonblocking mode affects every duplicate that shares the same pipe endpoint description.',
    prediction: 'After fd2 = dup(fd1), what happens to fd1 when O_NONBLOCK is enabled through fd2, and what happens when FD_CLOEXEC is enabled?',
    steps: ['Duplicate one descriptor.', 'Read descriptor flags with F_GETFD and status flags with F_GETFL.', 'Set one bit in the correct flag family.', 'Observe which duplicated descriptor sees the change.'],
    failure: 'Using F_SETFL with a fresh constant clears unrelated status bits. Treating FD_CLOEXEC as shared leaks descriptors through exec, while treating O_NONBLOCK as local causes surprising behavior in another owner.',
    c: `#include <fcntl.h>
#include <unistd.h>

int set_nonblocking(int fd) {
    int flags = fcntl(fd, F_GETFL);
    if (flags == -1) return -1;
    return fcntl(fd, F_SETFL, flags | O_NONBLOCK);
}`,
    cpp: `#include <fcntl.h>
#include <system_error>
#include <unistd.h>

void set_nonblocking(int fd) {
    int flags = ::fcntl(fd, F_GETFL);
    if (flags == -1 || ::fcntl(fd, F_SETFL, flags | O_NONBLOCK) == -1) {
        throw std::system_error(errno, std::generic_category());
    }
}`,
    guidance: 'C++ may wrap descriptors and flag sets in move-only classes and enum values, but it must preserve the kernel distinction between a descriptor-table entry and the shared open-file description. RAII changes cleanup, not flag scope.',
  }),
  linuxTopic({
    id: 'os-advisory-locks',
    title: 'Advisory file locks with fcntl',
    group: 'Files and descriptors: focused mechanisms',
    keywords: ['fcntl lock', 'F_SETLK', 'F_SETLKW', 'struct flock'],
    definition: 'An advisory record lock asks cooperating processes to avoid a byte range of a file. The kernel records lock ownership and overlap, but ordinary read and write calls do not become forbidden for programs that ignore the convention.',
    explanation: 'struct flock describes read or write ownership over a range. F_SETLK fails immediately on conflict, while F_SETLKW waits. Unlocking uses F_UNLCK over the selected range; close and process lifetime affect ownership under the chosen lock API.',
    application: 'Two maintenance processes serialize updates to one on-disk index header while allowing unrelated data ranges to be processed concurrently.',
    prediction: 'Does acquiring a write lock stop a third program that writes the same bytes without first requesting a compatible advisory lock?',
    steps: ['Open the shared file.', 'Describe the protected byte range in struct flock.', 'Acquire with blocking or nonblocking policy.', 'Update, flush as required, and unlock the same range.'],
    failure: 'Advisory locks provide no protection from non-cooperating code. Locking the wrong byte range or inheriting unexpected descriptors can break the protocol, and mixing flock and fcntl assumptions is not portable.',
    c: `#include <fcntl.h>

int lock_whole_file(int fd) {
    struct flock lock = {0};
    lock.l_type = F_WRLCK;
    lock.l_whence = SEEK_SET;
    return fcntl(fd, F_SETLKW, &lock);
}`,
    cpp: `#include <cerrno>
#include <fcntl.h>
#include <system_error>

void lock_whole_file(int fd) {
    ::flock lock{};
    lock.l_type = F_WRLCK;
    lock.l_whence = SEEK_SET;
    if (::fcntl(fd, F_SETLKW, &lock) == -1) {
        throw std::system_error(errno, std::generic_category());
    }
}`,
    guidance: 'A C++ guard can unlock in its destructor, but the guard must document the exact byte range and underlying fcntl ownership model. Exceptions improve propagation; they do not make advisory enforcement mandatory.',
  }),
  linuxTopic({
    id: 'os-ioctl',
    title: 'ioctl and device-specific control',
    group: 'Files and descriptors: focused mechanisms',
    keywords: ['ioctl', 'device control', 'TIOCGWINSZ', 'request code'],
    definition: 'ioctl is a descriptor-based system-call interface for device or subsystem operations that do not fit ordinary byte-stream reads and writes. A request number defines the operation and the exact argument layout expected by that driver.',
    explanation: 'The descriptor selects an open device, the request encodes an operation, and the third argument is request-specific. The kernel validates the request and copies typed data across the user-kernel boundary according to that ABI.',
    application: 'A terminal program queries its current row and column dimensions before formatting a full-screen interface, while network and device tools use other documented request families.',
    prediction: 'Why can passing the right-sized buffer with the wrong ioctl request still corrupt results or fail even though the descriptor is valid?',
    steps: ['Identify the device and documented request in its manual or header.', 'Allocate the exact argument structure.', 'Call ioctl and check the return value and errno.', 'Interpret fields only after a successful call.'],
    failure: 'ioctl request ABIs are device-specific and may vary by architecture. Guessing request values, argument types, or mutability crosses the kernel boundary with the wrong contract.',
    c: `#include <sys/ioctl.h>
#include <unistd.h>

int terminal_columns(int fd) {
    struct winsize size;
    if (ioctl(fd, TIOCGWINSZ, &size) == -1) return -1;
    return size.ws_col;
}`,
    cpp: `#include <cerrno>
#include <sys/ioctl.h>
#include <system_error>
#include <unistd.h>

int terminal_columns(int fd) {
    ::winsize size{};
    if (::ioctl(fd, TIOCGWINSZ, &size) == -1) {
        throw std::system_error(errno, std::generic_category());
    }
    return size.ws_col;
}`,
    guidance: 'C++ can expose each supported request as a typed function and hide the variadic ioctl surface, but the wrapper must preserve the documented kernel ABI, structure layout, lifetime, and errno result.',
  }),
  linuxTopic({
    id: 'os-signal-delivery',
    title: 'Signal disposition and delivery with sigaction',
    group: 'Signals: focused mechanisms',
    keywords: ['sigaction', 'signal disposition', 'pending signal', 'SA_SIGINFO'],
    definition: 'A signal is a kernel-delivered asynchronous notification. Its disposition says to perform the default action, ignore it, or enter a user handler; sigaction installs that policy with a mask and explicit behavior flags.',
    explanation: 'The kernel marks a signal pending, chooses an eligible thread, modifies its user context to enter the handler, and later restores the interrupted context through a signal-return path. Standard signals may coalesce.',
    application: 'A long-running daemon converts SIGTERM into a minimal shutdown notification, then closes listeners and flushes state in ordinary control flow.',
    prediction: 'If the same standard signal arrives five times while blocked, must the handler run exactly five times after it is unblocked?',
    steps: ['Initialize a complete sigaction structure.', 'Install the handler and handler-time mask.', 'Let the kernel mark and deliver the signal to an eligible thread.', 'Return from the handler and resume the interrupted context.'],
    failure: 'signal() has historical portability traps, and a handler that assumes one invocation per standard signal can lose event counts. The handler can interrupt code at nearly any instruction.',
    c: `#include <signal.h>

static volatile sig_atomic_t stop_requested;

static void request_stop(int signal_number) {
    (void)signal_number;
    stop_requested = 1;
}

int install_stop_handler(void) {
    struct sigaction action = {0};
    action.sa_handler = request_stop;
    sigemptyset(&action.sa_mask);
    return sigaction(SIGTERM, &action, NULL);
}`,
    cpp: `#include <csignal>
#include <system_error>

namespace {
volatile std::sig_atomic_t stop_requested = 0;
extern "C" void request_stop(int) { stop_requested = 1; }
}

void install_stop_handler() {
    ::sigaction action{};
    action.sa_handler = request_stop;
    ::sigemptyset(&action.sa_mask);
    if (::sigaction(SIGTERM, &action, nullptr) == -1) {
        throw std::system_error(errno, std::generic_category());
    }
}`,
    guidance: 'Even in C++, the actual handler must obey the C/POSIX async boundary: do not allocate, lock, use iostreams, or throw. C++ types belong in the normal event loop after a signal-safe handoff.',
  }),
  linuxTopic({
    id: 'os-signal-masks',
    title: 'Signal masks, blocked signals, and pending state',
    group: 'Signals: focused mechanisms',
    keywords: ['sigprocmask', 'pthread_sigmask', 'blocked signal', 'pending'],
    definition: 'A signal mask is a per-thread set of signals temporarily blocked from delivery. Arrival can still make a signal pending; unblocking later permits delivery when an eligible thread and disposition exist.',
    explanation: 'New threads inherit the creator’s mask. Multithreaded programs usually block selected signals before creating workers and dedicate one thread to sigwait, turning asynchronous delivery into synchronous event handling.',
    application: 'A server blocks shutdown signals in all workers and has one coordination thread wait for them, avoiding handlers that interrupt arbitrary library code.',
    prediction: 'Why must a process block the selected signals before it creates worker threads when planning to use one sigwait thread?',
    steps: ['Build the selected signal set.', 'Block it in the creating thread.', 'Create workers that inherit the blocked mask.', 'Use sigwait in one coordinator and handle the event normally.'],
    failure: 'Changing only one worker’s mask does not control delivery to sibling threads. Unblocking before sigwait is ready introduces an asynchronous handler path or default action.',
    c: `#include <signal.h>

int wait_for_shutdown(void) {
    sigset_t set;
    sigemptyset(&set);
    sigaddset(&set, SIGTERM);
    if (sigprocmask(SIG_BLOCK, &set, NULL) == -1) return -1;
    int received = 0;
    return sigwait(&set, &received) == 0 ? received : -1;
}`,
    cpp: `#include <csignal>
#include <system_error>

int wait_for_shutdown() {
    ::sigset_t set;
    ::sigemptyset(&set);
    ::sigaddset(&set, SIGTERM);
    int error = ::pthread_sigmask(SIG_BLOCK, &set, nullptr);
    if (error != 0) throw std::system_error(error, std::generic_category());
    int received = 0;
    error = ::sigwait(&set, &received);
    if (error != 0) throw std::system_error(error, std::generic_category());
    return received;
}`,
    guidance: 'C++ can represent the old mask with an RAII guard and dedicate a std::jthread to sigwait, but pthread_sigmask return codes and per-thread inheritance still define the actual Linux behavior.',
  }),
  linuxTopic({
    id: 'os-async-signal-safety',
    title: 'Async-signal-safe handler design',
    group: 'Signals: focused mechanisms',
    keywords: ['async-signal-safe', 'self pipe', 'write', 'signal handler'],
    definition: 'An async-signal-safe function can be called from a signal handler even when the signal interrupted another library operation. Most allocation, formatted I/O, locking, and C++ runtime operations are unsafe there.',
    explanation: 'A self-pipe handler writes one byte using the async-signal-safe write call. The main event loop polls the pipe and performs allocation, logging, cleanup, and state transitions outside the handler.',
    application: 'A network loop includes the self-pipe read end in poll, so SIGTERM wakes the same event mechanism used for sockets without running shutdown logic on an interrupted stack.',
    prediction: 'What can happen if a signal interrupts malloc while it holds allocator state and the handler calls printf or creates a std::string?',
    steps: ['Create a nonblocking pipe before installing the handler.', 'Store only the write descriptor in handler-visible state.', 'Write a fixed byte in the handler and preserve errno if needed.', 'Drain the pipe and perform normal work in the event loop.'],
    failure: 'printf, new, mutex locking, iostreams, and exceptions can deadlock or corrupt state in a handler. A full nonblocking pipe also needs a documented coalescing policy.',
    c: `#include <signal.h>
#include <unistd.h>

static int notification_fd = -1;

static void notify_loop(int signal_number) {
    unsigned char byte = (unsigned char)signal_number;
    if (notification_fd >= 0) {
        ssize_t ignored = write(notification_fd, &byte, 1);
        (void)ignored;
    }
}`,
    cpp: `#include <csignal>
#include <unistd.h>

namespace {
int notification_fd = -1;
extern "C" void notify_loop(int signal_number) {
    const unsigned char byte = static_cast<unsigned char>(signal_number);
    if (notification_fd >= 0) {
        const ssize_t ignored = ::write(notification_fd, &byte, 1);
        (void)ignored;
    }
}
}`,
    guidance: 'C++ does not broaden the async-signal-safe function set. Keep the handler deliberately C-like, then decode the notification into enums, objects, logs, and exceptions only after normal execution resumes.',
  }),
  linuxTopic({
    id: 'os-data-race',
    title: 'Data races and protected invariants',
    group: 'Threads and synchronization: focused mechanisms',
    keywords: ['data race', 'mutex', 'critical section', 'invariant'],
    definition: 'A data race occurs when threads access the same memory concurrently, at least one access writes, and the accesses are not ordered by synchronization. In C and C++, a data race is undefined behavior.',
    explanation: 'A mutex does more than prevent simultaneous instructions: unlock publishes prior protected writes and a later successful lock acquires them. Every access participating in one invariant must follow the same locking rule.',
    application: 'A telemetry accumulator protects count and total together so readers never observe a new count paired with an old total.',
    prediction: 'Can an atomic count make a neighboring non-atomic total safe when readers require the two values to describe one consistent snapshot?',
    steps: ['Name the shared invariant.', 'Choose one mutex that owns every field in it.', 'Lock before reading or mutating those fields.', 'Unlock only after the invariant is restored.'],
    failure: 'Protecting writes but not reads is still a race. Using different mutexes for the same field provides no ordering, and volatile does not create synchronization.',
    c: `#include <pthread.h>

typedef struct {
    pthread_mutex_t mutex;
    long total;
    long count;
} Accumulator;

void add_sample(Accumulator *state, int value) {
    pthread_mutex_lock(&state->mutex);
    state->total += value;
    state->count += 1;
    pthread_mutex_unlock(&state->mutex);
}`,
    cpp: `#include <mutex>

class Accumulator {
  std::mutex mutex_;
  long total_{};
  long count_{};
public:
  void add(int value) {
    std::lock_guard lock{mutex_};
    total_ += value;
    ++count_;
  }
};`,
    guidance: 'std::mutex and lock_guard express exception-safe C++ locking and participate in the C++ memory model, while pthread_mutex_t provides the POSIX C surface. Both require one explicit protected invariant.',
  }),
  linuxTopic({
    id: 'os-deadlock',
    title: 'Deadlock conditions and lock ordering',
    group: 'Threads and synchronization: focused mechanisms',
    keywords: ['deadlock', 'lock order', 'circular wait', 'std::scoped_lock'],
    definition: 'Deadlock is a permanent wait cycle in which each participant holds a resource needed by another. Mutual exclusion, hold-and-wait, no forced preemption, and circular wait are the classic necessary conditions.',
    explanation: 'A global lock order removes circular wait: every path acquires mutexes in the same order. C++ std::scoped_lock and POSIX helper strategies can acquire a known set without exposing inconsistent manual order.',
    application: 'A transfer operation locks two account or device-state objects without allowing simultaneous opposite-direction transfers to freeze each other.',
    prediction: 'If one path locks A then B and another locks B then A, what exact wait graph forms when both pause after their first lock?',
    steps: ['List every lock a path may hold.', 'Draw directed edges from held locks to awaited locks.', 'Choose and document one total acquisition order.', 'Release in reverse order or use a multi-lock helper.'],
    failure: 'Timeouts detect symptoms but do not prove correctness. Calling callbacks while holding internal locks can introduce hidden reverse-order acquisitions.',
    c: `#include <pthread.h>

void lock_pair(pthread_mutex_t *first, pthread_mutex_t *second) {
    if (first > second) {
        pthread_mutex_t *temporary = first;
        first = second;
        second = temporary;
    }
    pthread_mutex_lock(first);
    pthread_mutex_lock(second);
}`,
    cpp: `#include <mutex>

void transfer(std::mutex& first, std::mutex& second) {
    std::scoped_lock both{first, second};
    // Update the invariant protected by both mutexes.
}`,
    guidance: 'C++ scoped_lock safely coordinates several mutexes and releases them through RAII, but code review still needs an ownership graph and a rule for callbacks, condition waits, and native locks outside that set.',
  }),
  linuxTopic({
    id: 'os-condition-variables',
    title: 'Condition variables and predicate loops',
    group: 'Threads and synchronization: focused mechanisms',
    keywords: ['condition variable', 'predicate', 'spurious wakeup', 'producer consumer'],
    definition: 'A condition variable lets a thread sleep until shared state may satisfy a predicate. The predicate belongs to mutex-protected data; notification is only a hint to check that state again.',
    explanation: 'The wait operation atomically releases the mutex and sleeps, then reacquires before returning. A loop is mandatory because wakeups can be spurious and another thread can consume the state before this waiter runs.',
    application: 'A bounded producer-consumer queue sleeps consumers while empty and producers while full without busy-waiting.',
    prediction: 'Why is “if queue empty, wait once” incorrect even when every producer calls signal after pushing?',
    steps: ['Lock the mutex protecting the predicate.', 'Check the predicate in a while loop.', 'Wait, atomically releasing and later reacquiring the mutex.', 'Mutate the state, unlock, and notify appropriate waiters.'],
    failure: 'Testing outside the mutex loses wakeups. Treating notification as stored data is wrong, and using if instead of while fails under spurious wakeups or competing consumers.',
    c: `#include <pthread.h>

typedef struct {
    pthread_mutex_t mutex;
    pthread_cond_t ready;
    int has_value;
    int value;
} Slot;

int take(Slot *slot) {
    pthread_mutex_lock(&slot->mutex);
    while (!slot->has_value) pthread_cond_wait(&slot->ready, &slot->mutex);
    int value = slot->value;
    slot->has_value = 0;
    pthread_mutex_unlock(&slot->mutex);
    return value;
}`,
    cpp: `#include <condition_variable>
#include <mutex>

class Slot {
  std::mutex mutex_;
  std::condition_variable ready_;
  bool has_value_{};
  int value_{};
public:
  int take() {
    std::unique_lock lock{mutex_};
    ready_.wait(lock, [this] { return has_value_; });
    has_value_ = false;
    return value_;
  }
};`,
    guidance: 'std::condition_variable packages the predicate loop with unique_lock, while pthread_cond_wait exposes the same atomic unlock-sleep-relock contract. Neither notification carries the queue item itself.',
  }),
  linuxTopic({
    id: 'os-futex',
    title: 'Futex fast path and kernel wait queues',
    group: 'Threads and synchronization: focused mechanisms',
    keywords: ['futex', 'fast path', 'wait queue', 'contended mutex'],
    definition: 'A futex is a Linux primitive that lets user space perform uncontended synchronization with atomic memory operations and enter the kernel only to sleep or wake when contention exists.',
    explanation: 'The shared integer is the synchronization state. FUTEX_WAIT sleeps only if the value still equals an expected value, closing the check-then-sleep race. FUTEX_WAKE marks one or more kernel waiters runnable; it does not transfer lock ownership.',
    application: 'pthread mutexes and many C++ standard-library mutex implementations avoid a syscall when uncontended and use futex waiting only after another thread owns the lock.',
    prediction: 'Why must FUTEX_WAIT compare the user-space value again inside the kernel before adding the thread to a wait queue?',
    steps: ['Attempt the state transition with a user-space atomic operation.', 'On contention, call FUTEX_WAIT with the observed expected value.', 'The kernel verifies that value and queues the task or returns immediately.', 'An unlock changes state and calls FUTEX_WAKE when waiters may exist.'],
    failure: 'A futex integer is not a complete mutex. Correct implementations need atomic ordering, state encoding, retry loops, ownership policy, cancellation rules, and robust handling of spurious returns.',
    c: `#define _GNU_SOURCE
#include <linux/futex.h>
#include <stdatomic.h>
#include <sys/syscall.h>
#include <unistd.h>

int futex_wait(_Atomic int *word, int expected) {
    return (int)syscall(SYS_futex, word, FUTEX_WAIT_PRIVATE, expected, 0, 0, 0);
}`,
    cpp: `#define _GNU_SOURCE
#include <atomic>
#include <linux/futex.h>
#include <sys/syscall.h>
#include <unistd.h>

int futex_wait(std::atomic<int>& word, int expected) {
    return static_cast<int>(::syscall(
        SYS_futex, reinterpret_cast<int*>(&word),
        FUTEX_WAIT_PRIVATE, expected, nullptr, nullptr, 0));
}`,
    guidance: 'C++ atomics define language-level ordering, while the Linux futex call supplies blocking. Production C++ should normally use tested standard-library primitives and study futex to understand their contended implementation.',
  }),
  linuxTopic({
    id: 'os-proc-sys',
    title: '/proc and /sys kernel interfaces',
    group: 'System lifecycle and isolation: focused mechanisms',
    keywords: ['/proc', '/sys', 'procfs', 'sysfs'],
    definition: '/proc exposes process and selected kernel state through generated files, while /sys exposes the kernel device and object model through sysfs attributes. These are live kernel interfaces, not ordinary persistent files.',
    explanation: 'Opening an entry asks the kernel subsystem to generate or accept data for that object. Contents can change between reads, disappear with process or device lifetime, and differ inside namespaces.',
    application: 'A diagnostic tool reads /proc/self/status for process memory and capabilities and follows /sys/class/net entries to inspect network-device state.',
    prediction: 'Why can stat report a size of zero for a procfs file that still returns many bytes when read?',
    steps: ['Select the documented procfs or sysfs interface.', 'Open and read to EOF without trusting st_size.', 'Parse bounded, version-tolerant fields.', 'Handle disappearance and permission errors as normal live-state races.'],
    failure: 'Assuming stable file size, one-read completeness, or permanent paths makes diagnostics fragile. Writing sysfs attributes can mutate hardware or kernel policy and requires explicit authorization.',
    c: `#include <fcntl.h>
#include <unistd.h>

ssize_t read_self_status(char *buffer, size_t capacity) {
    int fd = open("/proc/self/status", O_RDONLY | O_CLOEXEC);
    if (fd == -1) return -1;
    ssize_t count = read(fd, buffer, capacity);
    close(fd);
    return count;
}`,
    cpp: `#include <fstream>
#include <sstream>
#include <stdexcept>
#include <string>

std::string read_self_status() {
    std::ifstream input{"/proc/self/status"};
    if (!input) throw std::runtime_error{"cannot open /proc/self/status"};
    std::ostringstream text;
    text << input.rdbuf();
    return text.str();
}`,
    guidance: 'C++ streams and parsers can manage storage and validation, but procfs and sysfs remain live kernel-generated ABIs. Code must tolerate short reads, changing fields, namespace views, and disappearing objects.',
  }),
  linuxTopic({
    id: 'os-namespaces',
    title: 'Linux namespaces and isolated resource views',
    group: 'System lifecycle and isolation: focused mechanisms',
    keywords: ['namespace', 'clone', 'unshare', 'PID namespace', 'mount namespace'],
    definition: 'A Linux namespace gives a process a scoped view of one global resource class, such as process IDs, mounts, networking, host names, users, or IPC objects. It changes visibility and identity, not application memory safety.',
    explanation: 'clone or unshare creates or joins namespace membership. Different namespace types compose independently, and user namespaces can map identities used to authorize operations in associated namespaces.',
    application: 'A container runtime combines mount, PID, network, UTS, IPC, and user namespaces so a workload sees its own process tree, filesystem mounts, interfaces, and hostname.',
    prediction: 'If a process is PID 1 inside a PID namespace, must its PID also be 1 as observed by the parent namespace?',
    steps: ['Choose each resource view that requires isolation.', 'Create namespace membership with clone, unshare, or setns.', 'Configure mappings, mounts, interfaces, and an init-like reaper.', 'Apply capabilities and cgroups separately.'],
    failure: 'A namespace alone is not a security sandbox. Shared files, devices, kernel attack surface, capabilities, and resource exhaustion remain unless separately constrained.',
    c: `#define _GNU_SOURCE
#include <sched.h>
#include <unistd.h>

int isolate_hostname(void) {
    if (unshare(CLONE_NEWUTS) == -1) return -1;
    return sethostname("lesson", 6);
}`,
    cpp: `#define _GNU_SOURCE
#include <cerrno>
#include <sched.h>
#include <system_error>
#include <unistd.h>

void isolate_hostname() {
    if (::unshare(CLONE_NEWUTS) == -1 || ::sethostname("lesson", 6) == -1) {
        throw std::system_error(errno, std::generic_category());
    }
}`,
    guidance: 'C++ wrappers can make namespace handles move-only and model setup phases, but clone, unshare, setns, UID mappings, capabilities, and the process tree remain Linux kernel contracts.',
  }),
  linuxTopic({
    id: 'os-cgroups',
    title: 'Control groups and resource governance',
    group: 'System lifecycle and isolation: focused mechanisms',
    keywords: ['cgroup v2', 'memory.max', 'cpu.max', 'resource limit'],
    definition: 'A control group organizes processes hierarchically so Linux controllers can account for and limit resources such as CPU time, memory, process count, and I/O. Cgroup v2 presents one unified hierarchy.',
    explanation: 'A process belongs to one cgroup in the unified hierarchy. Controller files define limits and report events; writing a PID to cgroup.procs moves that process. Limits govern consumption but do not change the process’s namespace view.',
    application: 'A service manager places each application in a cgroup, caps memory, assigns CPU weight, and records whether the kernel killed work after exceeding the memory policy.',
    prediction: 'Why does putting two processes in separate PID namespaces not stop one of them from consuming all host memory?',
    steps: ['Create a cgroup under a delegated hierarchy.', 'Enable and configure the required controllers.', 'Move the target process by writing its PID to cgroup.procs.', 'Observe usage and events while testing limits.'],
    failure: 'Writing controller files without delegation or privilege fails. Hard memory limits can trigger reclaim or OOM kills, and CPU weight is relative competition rather than a fixed percentage in every workload.',
    c: `#include <fcntl.h>
#include <string.h>
#include <unistd.h>

int write_control(const char *path, const char *value) {
    int fd = open(path, O_WRONLY | O_CLOEXEC);
    if (fd == -1) return -1;
    size_t length = strlen(value);
    ssize_t written = write(fd, value, length);
    int close_result = close(fd);
    return written == (ssize_t)length && close_result == 0 ? 0 : -1;
}`,
    cpp: `#include <fstream>
#include <stdexcept>
#include <string_view>

void write_control(const char* path, std::string_view value) {
    std::ofstream output{path};
    if (!output) throw std::runtime_error{"cannot open cgroup control"};
    output << value;
    if (!output) throw std::runtime_error{"cannot write cgroup control"};
}`,
    guidance: 'C++ can wrap the cgroup filesystem in typed limit and event objects, but delegation, controller semantics, process migration, and resource enforcement remain kernel and system-manager policy.',
  }),
];

export const focusedCppConcepts = Object.fromEntries(
  focusedCppSubtopics.map((entry) => [entry.id, entry.concepts]),
);

export const focusedCppProfiles = Object.fromEntries(
  focusedCppSubtopics.map((entry) => [entry.id, entry.profile]),
);

export const focusedLinuxById = new Map(
  focusedLinuxSubtopics.map((entry) => [entry.id, entry]),
);

export const focusedLinuxGuidance = Object.fromEntries(
  focusedLinuxSubtopics.map((entry) => [entry.id, entry.guidance]),
);

---
title: "Why I Love Rust"
date: "2021-01-08"
tags: ["Rust"]
excerpt: ""
lang: "en"
postSlug: "why-i-love-rust"
ai_translated: true
---


"Apparently Rust is pretty good."

With that vague motivation, I started learning Rust, and as I used it in hobby projects, I found myself completely captivated by its charm. In this post, I'd like to share some of what I consider Rust's appeal (just a small part of it) for those who are thinking about learning Rust or are interested but haven't found the right opportunity. I won't go into detailed explanations of language features, but I hope that by introducing Rust's philosophy and some of its advanced capabilities, I can spark your interest.

The code examples in this article have been verified to work with Rust 1.49.0 stable.

## Why Do I Love Rust?

Getting straight to the point, my reasons for loving Rust can be summarized in four points:

**1. A modern language specification with functional programming essence**
**2. Execution speed on par with C**
**3. Guaranteed memory safety and data race safety**
**4. A well-equipped ecosystem of tools**

Rust supports type inference, type classes, and error handling patterns that were introduced in statically-typed functional languages like Haskell, giving it a sense of coherence as a language.

The features Rust supports — type inference, type classes, and exception-free error handling — were introduced and proven useful in functional languages like Haskell. When I was writing Haskell, I enjoyed how those language features helped me write clean code. On the other hand, I found it difficult to build web systems because of issues like lacking library support and unexpectedly high memory usage if you weren't careful. Rust incorporates the advanced features of functional languages while enabling you to write software as fast as C, making it truly an ideal language that can handle web development as well.

On top of execution speed and functional features, Rust also guarantees memory safety and data race safety. Thanks to this, Rust code is checked for safety at compile time, preventing issues like NullPointerException in object-oriented languages and dangling pointers that can lead to system vulnerabilities. Furthermore, as a relatively new language, essential development tools like a package manager, testing framework, and documentation generator are officially maintained, making the coding experience comfortable.


## 1. A Modern Language Specification with Functional Programming Essence

### Hindley-Milner Type Inference

The first thing I want to introduce is Rust's powerful type inference. Rust is a statically-typed language with type inference support, and it adopts Hindley-Milner type inference — the same foundation used widely in functional languages like Haskell and OCaml.

Many modern languages such as Go, Kotlin, and TypeScript support type inference, but most of them only infer types in straightforward cases like variable assignments, function arguments, and return values.

As a concrete example, when writing code to parse a string in Go, you need to explicitly specify the type:

```go
// Go
var toBool bool
toBool, _ = strconv.ParseBool("true")

if toBool {
	fmt.Printf("ok")
}
```

The Hindley-Milner type inference that Rust uses is extremely powerful — it attempts to uniquely determine types from the surrounding context. For example, the String type's `parse<F>` function is generic, and the compiler infers the type `F` for you.

```rust
// Rust
if "true".parse().unwrap() {
// ~~~~~~~~~~~~~~~~~~~~~~~ Since this is in an if condition, it parses to bool.
    println!("ok");
}
```

When you actually write code, you'll be amazed at how smart the compiler is — it rigorously checks types no matter how complex the code gets. In my experience, once a build succeeds, the application almost always works.


### Algebraic Data Types

Algebraic data types, widely supported in functional languages, are another feature I love. With algebraic data types, you can express the data space you're thinking about directly as types, and combine them with type inference and pattern matching (discussed later) to write robust applications.

Rust supports algebraic data types through value-carrying enums (Enum).

As a concrete example, let's express Bitcoin asset classes as types. Suppose an exchange has spot, perpetual swap, and 1-week futures as asset classes. Since 1-week futures differ by expiration date — 10JUL2020, 17JUL2020, and so on — Rust can represent this directly as a type:

```rust
enum Asset {
    BTCJPYspot,             // Spot
    BTCJPYperp,             // Perpetual swap
    BTCJPY1week(Date<Utc>), // 1-week futures (10JUL2020, 17JUL2020, ..)
}
```

The way I think about it is: while a traditional enum can only express a one-dimensional, bounded discrete space, algebraic data types enable you to express spaces of arbitrary dimensions and structures.

### Pattern Matching

Pattern matching is what unlocks the power of algebraic data types. When I first studied it, I couldn't tell the difference from conventional if statements and switch statements, but on closer inspection, pattern matching is far more expressive.

Pattern matching branches based on values while having the compiler check that all patterns are exhaustively covered.

```rust
match asset {
    Asset::BTCJPYspot | Asset::BTCJPYperp           => println!("Spot or perpetual swap"),
    Asset::BTCJPY1week(date) if date < Utc::today() => println!("1-week futures with past expiration. Expiry: {:?}", date), // Conditional pattern (guard clause)
    Asset::BTCJPY1week(date)                        => println!("1-week futures. Expiry: {:?}", date), // Without this line, you get an error!
}
```

You can also think of it this way: if statements branch based on values, while pattern matching branches based on data structures.

```rust
fn greet(people: &[&str]) {
    match people {
        []                => println!("0 people.."),
        [one]             => println!("1 person: {}", one),
        [one, two]        => println!("2 people: {}, {}", one, two),
        [first, .., last] => println!("Many people: {}, {}", first, last),
    }
}
```

### Error Handling

As we've seen, Rust is equipped with powerful type inference, algebraic data types, and pattern matching — it's a language that locks down the entire application with types. True to form, Rust handles errors with the same rigor.

Many object-oriented languages implement error handling through exceptions and try-catch. While this approach has the advantage of being easy to understand and quick to write, it also has these aspects:

- You can't tell from the type alone whether a function can produce an error
- Whether to implement error handling is left to the developer's diligence

There's also the Go-style approach of attaching results to return values, but this too cannot detect missing error checks.

Rust's error handling is completely different — it uses Option and Result types to strictly manage the outcomes of operations. Whether an operation can fail is immediately apparent from the type, and the code won't compile unless you handle both the success and failure cases.

```rust
//
// Compute x/y for integers x and y.
// Returns None if y is 0 (division impossible), otherwise returns Some(x/y).
//
fn divide(x: i32, y: i32) -> Option<i32> {
    if y == 0 { None } else { Some(x / y) }
}
```

### Traits

Rust has no classes or inheritance. Instead, it adopts traits — a concept supported in functional languages. Traits define "behaviors and properties of a type."

For example, the property "can verify equality" is defined by the Eq trait, and the property "can be ordered" is defined by the Ord trait. The integer type u8 can do both equality verification and ordering, so it implements both Eq and Ord. The String type can verify equality but generally cannot be ordered, so it only implements Eq.

<img src="/images/blog/20210108/trait1.png" alt="trait1" width="700">

In object-oriented languages, inheritance creates a type hierarchy, but in Rust, you enumerate the behaviors of types, so the mental model is more of a horizontal spread. That said, since traits can depend on other traits, there is also a vertical dimension in trait relationships.

<img src="/images/blog/20210108/trait2.png" alt="trait2" width="400">

Traits are declarative in the sense that they define **what something is**. I personally prefer traits over inheritance because they make it easier to reason about a type's behavior.


## 2. Execution Speed Rivaling C

Rust is one of the few languages that can achieve execution speeds rivaling C
([or even faster than C](https://benchmarksgame-team.pages.debian.net/benchmarksgame/which-programs-are-fastest.html)).
Behind this is a thorough commitment to the zero-overhead principle.

### The Zero-Overhead Principle

The zero-overhead principle was articulated by Bjarne Stroustrup in his 2005 paper
"[Abstraction and the C++ Machine Model](https://www.stroustrup.com/abstraction-and-machine.pdf)."

> In general, C++ implementations obey the zero-overhead principle: What you
don't use, you don't pay for. And further: What you do use, you couldn't hand code any better.

**Features you don't use incur no memory or CPU cost, and the cost of features you do use must be the bare minimum at the assembly level.**

Like C++, Rust follows this zero-overhead principle, and zero-cost design is a conscious consideration across many features. Since no unnecessary processing is executed, developers can estimate execution costs by reading the code. This makes Rust viable even for projects with strict requirements, such as real-time operating systems and high-frequency trading systems for financial products.


### Generating Native Code Without a Runtime

Rust has no garbage collector and manages memory through smart pointers. It also lacks a runtime for managing green threads like Go's goroutines, eliminating resource management overhead.

Developers can choose to introduce a runtime if needed! With the stabilization of async-await syntax in Rust 1.39 at the end of 2019, asynchronous processing can now be introduced in just a few lines of code. Furthermore, as discussed below, Rust's Futures are designed to be zero-cost.

```
# Cargo.toml
[dependencies]
tokio = { version = "1", features = ["full"] }
```

```rust
#[tokio::main]
async fn main() {
    async {
        println!("hello, async block");
    }.await;
}
```

I also love that you can easily create binaries statically linked against the musl C library, which can then be run on scratch Docker images.

```dockerfile
# Dockerfile
FROM ekidd/rust-musl-builder:latest AS builder              # Multi-stage build. rust-musl-builder is an image with musl-libc, openssl, and other external libraries pre-installed.
..
RUN cargo build --release --bin data_collection_server      # Optimization options and strip execution omitted

FROM scratch                                                # A scratch image! Smaller than alpine — the most minimal image possible.
COPY --from=builder \
  /home/rust/src/target/x86_64-unknown-linux-musl/release/data_collection_server /
..
```

### Polymorphism and Zero-Cost Abstractions

Rust supports polymorphism through two mechanisms: generics and trait objects. Both are sophisticated abstraction mechanisms, yet developers maintain complete control over memory usage.

- Generics: inlined and optimized at compile time, statically dispatched at runtime
- Trait objects: executed via dynamic dispatch

As a concrete example, let's implement a dessert set. A generically defined dessert set has its type determined statically, so it can only contain one kind of sweet — but the code is optimized. On the other hand, a dessert set defined with trait objects can contain an assortment of different sweets.

```rust
// Define a "sweet" behavior
trait Sweet {}

// Donut
struct Donut;
impl Sweet for Donut {}

// Cake
struct Cake;
impl Sweet for Cake {}

// I want to define a dessert set menu..
struct DessertSetA<T: Sweet> {     // Uses generics, so static dispatch
    menu: Vec<T>,                  // Can only contain one kind of sweet (e.g., only donuts)
}

// I want to define a dessert set menu..
struct DessertSetB {               // References a trait object, so dynamic dispatch
    menu: Vec<Box<Sweet>>,         // Can contain multiple kinds of sweets (donuts, cakes, etc.)
}
```

### Functions and Zero-Cost Abstractions

In Rust, you can use not only regular functions but also closures. Both are statically dispatched and undergo inlining and optimization.

```rust
fn add(x: i32) -> i32 { x + 1 }

let add_function: fn(x: i32) -> i32 = add;            // Function pointer
let add_closure                     = |x: i32| x + 1; // Closure (type determined ad hoc at compile time)

println!("{}", add_function(1)); // Inlined, should be equivalent to println!(2)
println!("{}", add_closure(1));  // Inlined, should be equivalent to println!(2)
```

### Zero-Cost Futures

Rust's Future, stabilized in Rust 1.36, is [designed to be zero-cost](https://blog.rust-lang.org/2019/11/07/Async-await-stable.html#zero-cost-futures), unlike its counterpart in JavaScript. JavaScript's Futures are immediately scheduled upon creation, incurring overhead each time a future is created. Rust's Futures, on the other hand, aren't even created until they are awaited.


## 3. Guaranteed Memory Safety and Data Race Safety

### Memory Safety

In Rust, the compiler scrutinizes data ownership and lifetimes.
There are [reports that roughly 70% of high-severity security bugs are caused by memory safety issues](https://www.chromium.org/Home/chromium-security/memory-safety),
and Rust detects such problems at compile time.

1. Variables in Rust have a defined lifetime.
2. Variables in Rust hold ownership of their data.
```rust
{                          // --  Curly braces { } delimit a scope
    let a = vec![1, 2, 3]; //   | Variable a owns the vector.
}                          // --  Variable a's lifetime ends here.
                           //     (Since the owning variable has died, the heap-allocated vector [1,2,3] is freed at this point)

// println!("{:?}", a);    // Compile error because a is dead
```

3. Rust allows data to be *referenced*.

Features 1-3 enable Rust to prevent dangling pointers.

```rust
let a;
{                       // --
    a = &vec![1,2,3];   //   | Temporarily allocate vector [1,2,3] on the heap.
                        //   | Variable a holds a reference to the vector (but not ownership)
}                       // --  Vector [1,2,3] is freed at this point

// println!("{:?}", a); // Variable a is still alive, but the vector data has been freed,
                        // so a would be a dangling pointer — the compiler detects this and raises an error.
```

The above covers only a small portion of the features, but Rust has unique concepts like ownership, references, mutable references, moves, and lifetimes — all of which guarantee memory safety.


### Data Race Safety

Concurrent programming is also far safer in Rust compared to other languages. Since data ownership is explicit in Rust, the compiler verifies that data isn't shared across threads unsafely. When mutable objects need to be shared between threads, exclusive access is enforced using Mutex.

Data race safety in Rust is upheld by two traits: Send and Sync.

- Send: guarantees that ownership can be safely transferred between threads
- Sync: guarantees that a value can be safely referenced from multiple threads

For example, the reference-counted type Rc is neither Send nor Sync, because its shared reference count could be incremented simultaneously by multiple threads.

```rust
let rc = Rc::new(0);
thread::spawn(move || { rc; }); // Compile error. Rc<T> does not implement Send.
```

Fundamental types have been verified for thread safety by the Rust core team, and the compiler checks them as Send and Sync. This ensures that data races cannot occur in Rust.


## 4. A Well-Equipped Ecosystem of Tools

### cargo and rustup

cargo, Rust's build system and package manager, provides features for managing dependencies, running unit tests, generating documentation, and more.

Rust's tooling can also be managed through rustup, which is part of the official project, making environment setup smooth and painless.

### The Module System

Rust's module system clearly separates build targets between library components and application binaries. This lets you develop libraries within a single project and build multiple applications that combine them.

### WebAssembly Support

If you have Rust code, you can compile it to WebAssembly. The tooling is well-established — just adding a few attributes to your code is enough to build to wasm. And since there's no runtime, the resulting binaries are small.

## Weaknesses of Rust, in My Opinion

As I've described, Rust is a wonderful language, but it naturally comes with some trade-offs. Here are some points I think are worth being aware of when using Rust professionally or depending on your project's characteristics.

### High Learning Curve, Difficulty Hiring Engineers

While there are books available in Japanese and learning has become easier, I think beginners will still find it challenging. For team-based web development, choosing a productivity-focused language like Go is a perfectly valid option.

### A Thin Standard Library

Important components like HTTP clients and async runtimes require third-party crates.

### Slow Compilation Times

Full production builds can take quite a while. As a Docker build technique, you may need workarounds like [injecting a dummy main function to cache dependency libraries](https://stackoverflow.com/questions/58473606/cache-rust-dependencies-with-docker-build).

### Cyclic Data Structures Are Somewhat Difficult (for Better or Worse)

When building data structures with cyclic references, such as graphs, you need to use a pattern called interior mutability. For example, implementing a linked list looks something like this:

```rust
type SingleLink = Option<Rc<RefCell<Node>>>;

struct Node {
    value: String,
    next: SingleLink,
}

struct LinkedList {
    head: SingleLink,
    tail: SingleLink,
    pub length: u64,
}
```

On the other hand, this can also be seen as a strength.
**Due to Rust's constraints around ownership and lifetimes, it naturally favors designs where data flows in one direction. As a result, I find that applications tend to organically settle into clean architectures as you build them.**

### No Control Over Floating-Point Rounding Modes

Because LLVM doesn't support it, Rust apparently cannot control floating-point rounding modes. For some projects this is critical, requiring the use of C++ instead.

### Possibly Not the Best Fit for GCP..?

GCP's official SDK doesn't support Rust, so when using GCP managed services from a Rust application, you'd use Google APIs directly. While calling the APIs works fine, authentication and other aspects require a bit more effort. Community-maintained crates exist, but whether they're production-ready depends on the project.

On the other hand, AWS provides an official SDK with [Rusoto](https://github.com/rusoto/rusoto). There are also reports that AWS actively uses Rust in its own services, so in terms of compatibility, AWS seems to have the edge.


## Conclusion

Rust is a wonderful language that lets you write fast, safe software while having fun. Once you learn Rust, you become more conscious of safe data manipulation and error handling, and that experience carries over when writing in other languages. I'd be happy if this article has piqued your interest in Rust.

Finally, let me recommend a reference book that I personally found helpful. It's a slightly older edition, but it carefully explains Rust's fundamental features with detailed diagrams showing how they relate to the underlying machine model, so it should be useful if you want to study Rust seriously.
- [Programming Rust](https://www.amazon.co.jp/%E3%83%97%E3%83%AD%E3%82%B0%E3%83%A9%E3%83%9F%E3%83%B3%E3%82%B0Rust-Jim-Blandy/dp/4873118557)

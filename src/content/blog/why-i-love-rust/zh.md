---
title: "我为什么喜欢 Rust"
date: "2021-01-08"
tags: ["Rust"]
excerpt: ""
lang: "zh"
postSlug: "why-i-love-rust"
ai_translated: true
---


"听说 Rust 好像很不错。"

带着这样模糊的动机，我开始学习 Rust。随着在业余项目中不断使用，不知不觉间已经完全被 Rust 的魅力所吸引。这篇文章面向正准备学习 Rust 的朋友，或者虽然感兴趣但还没找到契机的朋友，我想总结一下我所认为的 Rust 的魅力（仅是冰山一角）。虽然不会深入讲解语言功能的细节，但希望通过介绍 Rust 的设计哲学和一些先进的特性，能够引起大家的兴趣。

本文中的代码示例已在 Rust 1.49.0 stable 上验证通过。

## 我为什么喜欢 Rust？

开门见山，我喜欢 Rust 的理由可以归纳为以下四点：

**① 融合了函数式编程精髓的现代语言规范**
**② 与 C 语言相当的执行速度**
**③ 保障内存安全性和数据竞争安全性**
**④ 完善的周边工具生态**

Rust 支持类型推断、类型类、错误处理等在 Haskell 等静态类型函数式语言中引入的特性，给人一种语言体系非常完整的印象。

Rust 所支持的类型推断、类型类、不使用异常的错误处理等功能，是在以 Haskell 为代表的函数式语言中引入并被证明有效的。我自己在写 Haskell 的时候，确实因为这些语言特性能够写出优雅的代码，编程过程很愉快。但另一方面，由于库不够齐全、一不小心就会过度消耗内存等问题，我觉得用 Haskell 来开发 Web 系统是比较困难的。Rust 吸纳了函数式语言的先进特性，同时能够编写与 C 语言同等速度的软件，还能胜任 Web 开发，可以说是一门理想的语言。

此外，在执行速度和函数式特性之上，Rust 还保障了内存安全性和数据竞争安全性。得益于此，Rust 代码在编译时就会进行安全性检查，从而在事前防止面向对象语言中常见的 NullPointerException 以及可能导致系统漏洞的 Dangling Pointer 等问题。再加上 Rust 作为一门相对较新的语言，包管理器、测试框架、文档生成等开发必备工具都有官方维护，让编程体验非常舒适。


## ① 融合了函数式编程精髓的现代语言规范

### Hindley-Milner 类型推断

首先想介绍的是 Rust 强大的类型推断功能。Rust 是一门静态类型语言，支持类型推断，其基础采用了在 Haskell 和 OCaml 等函数式语言中广泛使用的 Hindley-Milner 类型推断。

Go、Kotlin、TypeScript 等许多现代语言都支持类型推断，但大多数只能在变量赋值、函数参数、返回值等简单场景中推断类型。

举个具体的例子，在 Go 中编写解析字符串的代码时，需要显式指定类型：

```go
// Go
var toBool bool
toBool, _ = strconv.ParseBool("true")

if toBool {
	fmt.Printf("ok")
}
```

Rust 采用的 Hindley-Milner 类型推断非常强大，它会尝试从表达式的上下文中唯一确定类型。例如，String 类型的 `parse<F>` 是一个泛型函数，编译器会自动推断类型 `F`。

```rust
// Rust
if "true".parse().unwrap() {
// ~~~~~~~~~~~~~~~~~~~~~~~ 由于位于 if 的条件表达式中，因此解析为 bool 类型。
    println!("ok");
}
```

实际编写代码时，你会惊讶于编译器的聪明程度——无论代码多么复杂，它都能严格地检查类型。以我的经验来看，一旦编译通过，应用程序基本上就能正常运行。


### 代数数据类型

函数式语言中广泛支持的代数数据类型也是我喜爱的功能之一。使用代数数据类型，可以将你构想的数据空间直接表达为类型，并结合类型推断和后面要介绍的模式匹配来编写健壮的应用程序。

Rust 通过带值枚举（Enum）来支持代数数据类型。

举个具体的例子，让我们用类型来表达 Bitcoin 的资产类别。假设某个交易所有现货、永续合约和一周期货三种资产类别。由于一周期货因到期日不同而有所区别（10JUL2020、17JUL2020 等），Rust 可以直接将其映射为类型：

```rust
enum Asset {
    BTCJPYspot,             // 现货
    BTCJPYperp,             // 永续合约
    BTCJPY1week(Date<Utc>), // 一周期货（10JUL2020, 17JUL2020, ..）
}
```

可以这样理解：传统的 Enum 只能表达一维的有界离散空间，而代数数据类型使得我们能够表达任意维度和结构的空间。

### 模式匹配

模式匹配是释放代数数据类型威力的关键。我自己刚开始学习的时候，分不清它和传统的 if 语句、switch 语句有什么区别，但仔细观察后发现，模式匹配的表达能力远比它们强大。

模式匹配在根据值进行分支的同时，由编译器检查所有模式是否被穷举覆盖。

```rust
match asset {
    Asset::BTCJPYspot | Asset::BTCJPYperp           => println!("现货或永续合约"),
    Asset::BTCJPY1week(date) if date < Utc::today() => println!("到期日已过的一周期货 到期日: {:?}", date), // 条件模式（guard 子句）
    Asset::BTCJPY1week(date)                        => println!("一周期货 到期日: {:?}", date), // 如果没有这一行就会报错！
}
```

也可以这样理解：if 语句根据值进行分支，而模式匹配根据数据结构进行分支。

```rust
fn greet(people: &[&str]) {
    match people {
        []                => println!("0 个人.."),
        [one]             => println!("1 个人: {}", one),
        [one, two]        => println!("2 个人: {}, {}", one, two),
        [first, .., last] => println!("很多人: {}, {}", first, last),
    }
}
```

### 错误处理

正如前面所见，Rust 具备强大的类型推断、代数数据类型和模式匹配——它是一门用类型严格约束整个应用程序的语言。同样，Rust 对错误处理也采用相同的严谨态度。

许多面向对象语言通过异常（Exception）和 try-catch 语法来实现错误处理。这种方式虽然有易于理解、编码迅速的优点，但也存在以下问题：

- 无法从类型判断函数内部是否会发生错误
- 是否实现错误处理取决于开发者的细心程度

此外，像 Go 那样将处理结果附加到返回值的错误处理方式，也无法检测到遗漏的错误检查。

Rust 的错误处理与上述方式完全不同——它使用 Option 类型和 Result 类型来严格管理处理结果。操作是否可能失败，一看类型就一目了然；而且如果不同时实现成功和失败两种情况，代码就无法通过编译。

```rust
//
// 对整数 x 和 y 计算 x/y。
// 如果 y 为 0 则无法计算，返回失败 None；否则返回成功 Some(x/y)。
//
fn divide(x: i32, y: i32) -> Option<i32> {
    if y == 0 { None } else { Some(x / y) }
}
```

### Trait

Rust 没有类和继承的概念，取而代之的是 Trait——一种在函数式语言中得到支持的机制。Trait 定义的是"类型的行为和性质"。

例如，"可以验证相等性"这一性质由 Eq trait 定义，"可以排序"这一性质由 Ord trait 定义。整数类型 u8 既可以验证相等性也可以排序，因此同时实现了 Eq 和 Ord。而 String 类型虽然可以验证相等性，但通常不能排序，因此只实现了 Eq。

<img src="/images/blog/20210108/trait1.png" alt="trait1" width="700">

面向对象语言通过继承来构建类型的层次结构，而 Rust 通过列举类型的行为来定义类型，因此给人的印象是水平方向的展开。不过，由于 Trait 可以依赖其他 Trait，所以在 Trait 的关系中也存在纵向的层次。

<img src="/images/blog/20210108/trait2.png" alt="trait2" width="400">

Trait 是声明式的，它定义的是**某个东西是什么**。我个人非常喜欢 Trait 胜过继承，因为它更容易让人理解类型的行为。


## ② 媲美 C 语言的执行速度

Rust 是少数能够达到与 C 语言媲美的执行速度的语言之一
（[甚至可能比 C 更快](https://benchmarksgame-team.pages.debian.net/benchmarksgame/which-programs-are-fastest.html)）。
其背后是对零开销原则的彻底贯彻。

### 零开销原则

零开销原则由 Bjarne Stroustrup 在 2005 年的论文
"[Abstraction and the C++ Machine Model](https://www.stroustrup.com/abstraction-and-machine.pdf)"
中明确提出。

> In general, C++ implementations obey the zero-overhead principle: What you
don't use, you don't pay for. And further: What you do use, you couldn't hand code any better.

**不使用的功能不会产生内存或 CPU 开销，而使用的功能在汇编层面必须是最小开销。**

与 C++ 一样，Rust 也遵循零开销原则，在各种功能中都体现了零成本的设计理念。由于不会执行不必要的处理，开发者可以通过阅读代码来估算执行成本。因此，即使是实时操作系统或金融产品高频交易系统等要求严格的项目，也可以采用 Rust。


### 生成无运行时的原生代码

Rust 没有垃圾回收器，通过智能指针管理内存。同时也没有像 Go 的 goroutine 那样管理绿色线程的运行时，因此不会产生资源管理的开销。

开发者也可以选择引入运行时！2019 年底 Rust 1.39 稳定化了 async-await 语法，如今只需几行代码就能引入异步处理。而且如后文所述，Rust 的 Future 还具备零成本的特性。

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

此外，能够轻松创建静态链接 musl C 标准库的二进制文件，并在 scratch Docker 镜像上运行，这一点我也非常喜欢。

```dockerfile
# Dockerfile
FROM ekidd/rust-musl-builder:latest AS builder              # 使用多阶段构建。rust-musl-builder 是一个预装了 musl-libc、openssl 等外部库的镜像。
..
RUN cargo build --release --bin data_collection_server      # 省略了优化选项和 strip 的执行

FROM scratch                                                # scratch 镜像！比 alpine 更小，是最精简的镜像。
COPY --from=builder \
  /home/rust/src/target/x86_64-unknown-linux-musl/release/data_collection_server /
..
```

### 多态性与零成本抽象

Rust 通过两种机制支持多态性（polymorphism）：泛型和 Trait 对象。两者都是高级的抽象机制，但开发者仍然可以完全控制内存的使用方式。

- 泛型：在编译时内联和优化，运行时静态分派
- Trait 对象：通过动态分派执行

举个具体的例子，让我们来实现一个甜点套餐。使用泛型定义的甜点套餐由于类型是静态确定的，只能选择一种甜点，但代码会被优化。而使用 Trait 对象定义的甜点套餐则可以装入各种不同的甜点。

```rust
// 定义"甜食"这一行为
trait Sweet {}

// 甜甜圈
struct Donut;
impl Sweet for Donut {}

// 蛋糕
struct Cake;
impl Sweet for Cake {}

// 想定义甜点套餐的菜单..
struct DessertSetA<T: Sweet> {     // 使用泛型，所以是静态分派
    menu: Vec<T>,                  // 只能选择一种"甜食"（比如只有甜甜圈）
}

// 想定义甜点套餐的菜单..
struct DessertSetB {               // 引用 Trait 对象，所以是动态分派
    menu: Vec<Box<Sweet>>,         // 可以包含多种"甜食"（甜甜圈、蛋糕等）
}
```

### 函数与零成本抽象

在 Rust 中，不仅可以使用普通函数，还可以使用闭包。两者都是静态分派的，并会进行内联和优化。

```rust
fn add(x: i32) -> i32 { x + 1 }

let add_function: fn(x: i32) -> i32 = add;            // 函数指针
let add_closure                     = |x: i32| x + 1; // 闭包（类型在编译时临时确定）

println!("{}", add_function(1)); // 内联展开后，应等价于 println!(2)
println!("{}", add_closure(1));  // 内联展开后，应等价于 println!(2)
```

### 零成本 Future

Rust 1.36 中稳定化的 Future 与 JavaScript 等语言的 Future 不同，[被设计为零成本](https://blog.rust-lang.org/2019/11/07/Async-await-stable.html#zero-cost-futures)。JavaScript 的 Future 一旦创建就会立即被调度，因此每次创建 future 都会产生开销。而 Rust 的 Future 在被 await 之前甚至不会被创建。


## ③ 保障内存安全性和数据竞争安全性

### 内存安全性

在 Rust 中，编译器会严格审查数据的所有权和生命周期。
据[报告](https://www.chromium.org/Home/chromium-security/memory-safety)，约 70% 的高严重性安全漏洞源于内存安全问题，而 Rust 能在编译时检测出此类问题。

1. Rust 的变量有明确的生存期。
2. Rust 的变量持有数据的所有权。
```rust
{                          // --  花括号 { } 划分作用域
    let a = vec![1, 2, 3]; //   | 变量 a 拥有向量的所有权。
}                          // --  变量 a 的生存期到此结束。
                           //     （由于持有所有权的变量已消亡，堆上分配的向量 [1,2,3] 也在此时被释放）

// println!("{:?}", a);    // 编译错误，因为 a 已经不存在了
```

3. Rust 允许对数据进行*引用*。

通过 1~3 的功能，Rust 防止了悬空指针的产生。

```rust
let a;
{                       // --
    a = &vec![1,2,3];   //   | 临时在堆上分配向量 [1,2,3]。
                        //   | 变量 a 持有向量的引用（但不持有所有权）
}                       // --  向量 [1,2,3] 在此时被释放

// println!("{:?}", a); // 变量 a 仍然存活，但向量数据已被释放，
                        // a 会成为悬空指针——编译器会检测到这一点并报错。
```

以上仅介绍了一小部分功能，但 Rust 拥有所有权、引用、可变引用、移动、生命周期等独特的机制，这些都在保障着内存安全性。


### 数据竞争安全性

相比其他语言，Rust 的并发编程也安全得多。由于 Rust 中数据的所有权是明确的，编译器会检查数据不会在线程间被不安全地共享。当需要在线程间共享可变对象时，需要使用 Mutex 进行排他控制。

Rust 中保障数据竞争安全性的是 Send 和 Sync 这两个 Trait。

- Send：保证所有权可以安全地在线程间传递
- Sync：保证可以安全地从多个线程引用

例如，引用计数类型 Rc 由于其共享引用计数可能被多个线程同时递增，因此既没有实现 Send 也没有实现 Sync。

```rust
let rc = Rc::new(0);
thread::spawn(move || { rc; }); // 编译错误。Rc<T> 没有实现 Send。
```

基本类型的线程安全性已由 Rust 核心团队确认，编译器通过 Send 和 Sync 进行检查。因此，Rust 中不会发生数据竞争。


## ④ 完善的周边工具生态

### cargo 和 rustup

cargo 是 Rust 的构建系统和包管理器，提供了管理依赖库、运行单元测试、生成文档等功能。

同时，Rust 的工具可以通过官方项目中的 rustup 来管理，环境搭建非常顺畅，这也让人很欣慰。

### 模块系统

Rust 的模块系统将构建目标明确地分为库部分和应用程序本体。因此，你可以在一个项目中开发库，并构建多个将这些库组合起来的应用程序。

### WebAssembly 支持

有了 Rust 代码，就可以将其编译为 WebAssembly。工具链非常成熟，只需在代码中添加几个 attribute 就能构建为 wasm，非常方便。而且由于没有运行时，生成的可执行文件体积很小。

## 我个人认为的 Rust 的弱点

正如前面所述，Rust 是一门出色的语言，但自然也存在一些取舍。以下是我认为在工作中使用或根据项目特性需要注意的几点。

### 学习成本高，工程师招聘困难

虽然有日语书籍，学习变得更容易了，但我认为初学者仍然会觉得有难度。如果是团队进行 Web 开发，选择 Go 等注重生产力的语言也是一个合理的选择。

### 标准库较薄

HTTP 客户端、异步运行时等重要组件需要依赖第三方 crate。

### 编译耗时较长

进行生产环境的完整构建时，耗时会比较长。作为 Docker 构建的技巧，可能需要[通过插入虚拟 main 函数来缓存依赖库](https://stackoverflow.com/questions/58473606/cache-rust-dependencies-with-docker-build)等应对措施。

### 循环引用的数据结构有些难以构建（但也有好的一面）

构建图等具有循环引用的数据结构时，需要使用一种称为内部可变性的特殊模式。例如，实现链表大概是这样的：

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

另一方面，这也可以被视为一种优势。
**由于 Rust 在所有权和生命周期方面的约束，它天然倾向于数据单向流动的设计。因此，在编写过程中，应用程序的整体架构往往会自然而然地趋向整洁。**

### 无法控制浮点数舍入模式

由于 LLVM 不支持，Rust 似乎无法控制浮点数的舍入模式。对于某些项目来说这是一个关键问题，需要改用 C++。

### 可能与 GCP 的兼容性不太好..？

GCP 的官方 SDK 不支持 Rust，因此在 Rust 应用程序中操作 GCP 的托管服务时，需要使用 Google APIs。虽然调用 API 本身没有问题，但在认证等方面会多一些工作量。社区维护的 crate 也在开发中，但能否用于生产环境取决于具体项目。

另一方面，AWS 提供了官方 SDK [Rusoto](https://github.com/rusoto/rusoto)。也有消息称 AWS 在自家服务中积极使用 Rust，所以就兼容性而言，AWS 似乎更胜一筹。


## 结语

Rust 是一门能够在享受编程乐趣的同时编写高速、安全软件的出色语言。而且，一旦学习了 Rust，你会开始更加注意安全的数据操作和错误处理，这些经验在编写其他语言时也能派上用场。如果这篇文章能让你对 Rust 产生兴趣，我会非常高兴。

最后，推荐一本我个人觉得很好的参考书。版本稍微有些旧，但它通过详细的图解，结合与底层计算机的关系来讲解 Rust 的基本功能，如果想认真学习的话应该会很有帮助。
- [Programming Rust（プログラミングRust）](https://www.amazon.co.jp/%E3%83%97%E3%83%AD%E3%82%B0%E3%83%A9%E3%83%9F%E3%83%B3%E3%82%B0Rust-Jim-Blandy/dp/4873118557)

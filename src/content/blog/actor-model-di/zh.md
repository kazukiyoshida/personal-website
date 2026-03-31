---
title: "在 Rust 的 Actor 模型中实现依赖反转"
date: "2021-01-26"
tags: ["Rust", "Actix", "Actor Model", "Dependency Inversion"]
excerpt: ""
lang: "zh"
postSlug: "actor-model-di"
ai_translated: true
---

有一种并发计算模型叫做 Actor 模型。
它由 Carl E. Hewitt 在 1973 年发表的论文
[A Universal Modular ACTOR Formalism for Artificial Intelligence](https://www.ijcai.org/Proceedings/73/Papers/027B.pdf)
中提出。在该模型中，被称为 Actor 的对象以异步、并发的方式运行，
通过发送和接收消息来完成计算。
面向对象编程中计算是同步、顺序执行的，
而 Actor 模型的特点是并发、异步地处理。

在实际使用 Actor 模型时，从零实现是非常困难的，因此通常会使用现有的库。
Actor 模型的库中，Java 和 Scala 的 [Akka](https://akka.io/) 最为知名，
而 Rust 中也有一个叫做 [Actix](https://github.com/actix/actix) 的 crate。
Actix 还是流行的 Web 应用框架 [Actix web](https://github.com/actix/actix-web) 的基础，
近期也开始支持 Rust stable，开发十分活跃。

本文将简要介绍使用 Actix 的 Actor 模型，并分享我在开发过程中发现的
**让 Actor 依赖于抽象的模式**
（本质上只是引入了泛型，但 trait 约束的写法有些不太常见，所以在此做一个整理）。
同时，作为依赖抽象的 Actor 的实际应用示例，我将介绍一个比特币自动交易系统的实现。

源代码已公开在这里：
[kazukiyoshida/actor-polymorphism](https://github.com/kazukiyoshida/actor-polymorphism)

使用的语言是 Rust 1.51.0 nightly，运行环境为 macOS Catalina 10.15.7。

## 两个 Actor 耦合的系统

### Messenger Actor 和 Receiver Actor

作为一个基本系统，考虑以下两个 Actor 共存的状态：

- Messenger Actor：具有发送信件 Letter 的功能，知道 Receiver Actor 的地址。
- Receiver Actor：接收信件 Letter。

用图表示如下：

<img src="/images/blog/20210126/actorModel1.png" alt="actorModel1">

让我们将其转化为代码。

### Receiver Actor 的实现

首先定义 Receiver Actor。定义一个名为 Receiver 的结构体，
通过为其实现 `actix::Actor` trait，使其具备 Actor 的行为。
Actor 有四种状态（Started、Running、Stopping、Stopped），
可以在状态转换时调用相应的方法。
这里我们在 Actor 启动时输出一条标准输出。

```rust
// 定义 Receiver 结构体
struct Receiver;

// 为 Receiver 结构体实现 actix::Actor trait
impl Actor for Receiver {
    type Context = Context<Self>;

    // Actor 启动时的处理
    fn started(&mut self, _: &mut Self::Context) {
        println!("Receiver : start"); // 标准输出
    }
}
```

我们希望 Receiver Actor 能够接收信件 Letter，因此来实现这一功能。
首先定义 Letter 结构体，并为其自动实现 `actix::Message` trait，
这样它就可以作为 Actor 模型中的消息进行传递。

```rust
// 定义信件 Letter 结构体。
// 通过自动实现 Message trait，Letter 可以作为 Actor 模型的消息使用。
#[derive(Message)]
#[rtype(result = "()")]
struct Letter(String);
```

Letter 定义完成后，接下来让 Receiver 在收到信件时输出其内容。
为此，需要为 Receiver 实现 `Handler<Letter>` trait。

```rust
// 为 Receiver 实现 Handler<Letter>
impl Handler<Letter> for Receiver {
    type Result = ();

    // 收到消息时将其内容输出到标准输出
    fn handle(&mut self, msg: Letter, _: &mut Context<Self>) -> Self::Result {
        println!("Receiver : got a message! >> {:?}", msg.0); // 输出接收到的消息内容。
    }
}
```

至此 Receiver 就完成了。

### Messenger Actor 的实现

接下来定义 Messenger。由于 Messenger 需要知道 Receiver 的地址，
我们将其作为结构体的成员。同时，在 Actor 启动时向 Receiver 发送一封信件 Letter。

```rust
// 定义 Messenger 结构体。
struct Messenger(Addr<Receiver>);

// 为 Messenger 结构体实现 Actor trait。
impl Actor for Messenger {
    type Context = Context<Self>;

    // Actor 启动时的行为。
    fn started(&mut self, _: &mut Self::Context) {
        println!("Messenger: start");               // 启动时标准输出
        println!("Messenger: send message");
        self.0.do_send(Letter("Hello!!".to_string())); // 向 Receiver 发送消息。
    }
}
```

这样 Messenger 的定义也完成了。

### 执行

按照以下方式运行上述代码，可以看到标准输出，确认消息已从 Messenger 发送到 Receiver。

```rust
fn main() {
    let mut sys = System::new("sys");

    let addr_receiver = sys.block_on(async { Receiver.start() });
    let addr_messenger = sys.block_on(async { Messenger(addr_receiver).start() });

    sys.run();
}
```

```
Receiver : start
Messenger: start
Messenger: send message
Receiver : got a message! >> "Hello!!"
```

## 关于两个 Actor 之间的依赖关系

在上面的代码中，Actor 之间形成了显式的依赖关系。

```rust
struct Receiver;                  // <--┐
struct Messenger(Addr<Receiver>); //  --┘ 显式依赖于 Receiver
```

如果以 Actor 之间这样的强耦合关系为前提，
由多个 Actor 组成的应用程序整体也会变得紧密耦合，
降低可复用性。在面向对象编程中构建应用时，
常用的模式是依赖于接口而非具体实现类，
将实现类单独准备 -- 这就是依赖反转。
本文的要点就是将这一思想应用到 Actor 模型中。

用图表示如下：

<img src="/images/blog/20210126/actorModel2.png" alt="actorModel2">

## 让 Actor 依赖于抽象

要在 Actor 模型中定义依赖反转，首先需要将依赖关系抽象化。

```rust
struct Receiver;
struct Messenger<T>(Addr<T>);
```

现在已经依赖于抽象了，但需要为抽象添加 trait 约束。
本次需要两个条件："必须是 Actor"和"必须能接收 Letter 消息"，
我们使用 nightly 版本可用的 [trait_alias](https://doc.rust-lang.org/beta/unstable-book/language-features/trait-alias.html)
来定义（不使用也没问题）。

```rust
// 使用 trait alias 将 trait 约束整合
trait LetterHandler = actix::Actor + Handler<Letter>;

struct Receiver;
struct Messenger<T: LetterHandler>(Addr<T>);
```

这样 Actor 之间的依赖关系就消除了，形成了易于复用的结构。
最后需要为 Messenger 结构体实现 Actor trait 使其具备 Actor 行为。
此时还需要为抽象 Actor 的 Context 声明 trait 约束。
虽然稍微复杂了一些，但实现如下：

```rust
// 为 Messenger<T> 实现 Actor
impl<T> Actor for Messenger<T>
where                                  // 为 T 声明 trait 约束
    T: LetterHandler,                  // - T 必须实现 LetterHandler trait
    T::Context: ToEnvelope<T, Letter>, // - T（根据上面的约束）是一个 Actor，其 Context 必须实现 ToEnvelope
{
    type Context = Context<Self>;

    // Actor 启动时的处理
    fn started(&mut self, _: &mut Self::Context) {
        println!("Messenger: start");

        println!("Messenger: send message");
        self.0.do_send(Letter("Hello!!".to_string()));  // 向 T 发送消息
    }
}
```

## 应用示例：用 Actor 模型实现比特币自动交易系统

下面展示一个通过上述 Actor 模型抽象化使代码库更易复用的示例。
这是我实际在开发的应用程序，以比特币自动交易系统为题材。
本示例中有三个 Actor 登场。

#### Bitflyer Actor

通过 WebSocket 连接到 Bitflyer 交易所的 API 服务器，实时接收订单簿数据。
根据订单簿的快照信息，获取当时条件最优的限价订单价格和数量
（这里称之为 Best Bid Offer = BBO），并分发给另一个 Actor。

#### Collector Actor

将交易所连接 Actor 分发的实时数据写入日志。
由于需要接收 BBO，因此必须实现 `Handler<BBO>`。

#### Strategy Actor

基于交易所连接 Actor 分发的实时数据进行分析，
按照自动交易策略算法执行实际的买卖操作。
本文省略策略算法的具体细节。

在构建自动交易系统时，出于容错性和性能优化的考虑，
可能希望将 (1) 数据收集应用和 (2) 策略执行应用
作为独立的容器来运行。此时，由于 Bitflyer Actor 在两个应用中都会使用，
就可以应用本文介绍的依赖抽象的 Actor 模式。

<img src="/images/blog/20210126/actorModel3.png" alt="actorModel3">

用代码表示如下。
WebSocket 通信等部分已省略，感兴趣的读者请查看[源代码](https://github.com/kazukiyoshida/actor-polymorphism)。

```rust
// 通过 WebSocket 连接 Bitflyer 交易所并实时接收数据的 Actor。
// 解析接收到的数据并转发给服务 Actor T。
pub struct Bitflyer<T: BBOHandler> {
    sender: Sender,          // 用于向 Bitflyer 交易所服务器发送消息
    service_actor: Addr<T>,  // 服务 Actor T 的地址
}
```

```rust
pub trait BBOHandler = actix::Actor + Handler<UpdateBBO>;
```

```rust
pub struct Collector;

impl Actor for Collector { .. }
impl Handler<UpdateBBO> for Collector { .. } // 数据存储等
```

```rust
pub struct Strategy;

impl Actor for Strategy { .. }
impl Handler<UpdateBBO> for Strategy { .. } // 交易执行等
```

## 结语

本文介绍了 Rust 的 Actor 模型库 Actix、Actor 的抽象化方法，
以及在比特币自动交易系统中的应用。

Actor 模型与 Web 应用开发中常用的分层架构有所不同，
在开始开发时我并不清楚什么样的结构最合适，只能边摸索边前进。
我仍有很多不足之处，可能存在更好的架构方案，
但希望本文能为准备使用 Actor 模型构建应用的开发者提供一些参考。

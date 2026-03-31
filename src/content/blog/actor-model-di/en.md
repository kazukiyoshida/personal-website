---
title: "Dependency Inversion with the Actor Model in Rust"
date: "2021-01-26"
tags: ["Rust", "Actix", "Actor Model", "Dependency Inversion"]
excerpt: ""
lang: "en"
postSlug: "actor-model-di"
ai_translated: true
---

There is a concurrent computation model called the actor model.
It was proposed in a 1973 paper by Carl E. Hewitt titled
[A Universal Modular ACTOR Formalism for Artificial Intelligence](https://www.ijcai.org/Proceedings/73/Papers/027B.pdf).
In this model, objects called actors operate asynchronously and concurrently,
performing computation by sending and receiving messages.
While object-oriented programming executes computations synchronously and sequentially,
the actor model is characterized by concurrent, asynchronous processing.

When working with the actor model, implementing everything from scratch is quite challenging, so you typically use a library.
Among actor model libraries, [Akka](https://akka.io/) for Java and Scala is well known,
and Rust has a crate called [Actix](https://github.com/actix/actix).
Actix also serves as the foundation for the popular web application framework [Actix web](https://github.com/actix/actix-web),
and it has been actively developed, recently gaining support for Rust stable.

In this post, I will give a brief introduction to the actor model with Actix and present
a **pattern for making actors depend on abstractions** that I discovered during development
(it is essentially just introducing generics, but the trait bounds take a somewhat unusual form, so I thought it was worth documenting).
I will also show a practical application example: an automated Bitcoin trading system that uses actors depending on abstractions.

The source code is available here:
[kazukiyoshida/actor-polymorphism](https://github.com/kazukiyoshida/actor-polymorphism)

The language used is Rust 1.51.0 nightly, and the environment is macOS Catalina 10.15.7.

## A System Where Two Actors Are Coupled

### The Messenger Actor and the Receiver Actor

As a basic system, consider a state where two actors exist:

- Messenger actor: Has the ability to send a Letter. Knows the address of the Receiver actor.
- Receiver actor: Receives a Letter.

This can be illustrated as follows:

<img src="/images/blog/20210126/actorModel1.png" alt="actorModel1">

Let's translate this into code.

### Implementing the Receiver Actor

First, let's define the Receiver actor. We define a struct called Receiver
and implement the `actix::Actor` trait for it so that it behaves as an actor.
An actor has four states (Started, Running, Stopping, Stopped),
and you can call methods corresponding to each state transition.
Here, we will print to standard output when the actor starts.

```rust
// Define the Receiver struct
struct Receiver;

// Implement the actix::Actor trait for the Receiver struct
impl Actor for Receiver {
    type Context = Context<Self>;

    // Processing when the actor starts
    fn started(&mut self, _: &mut Self::Context) {
        println!("Receiver : start"); // Print to standard output
    }
}
```

We want the Receiver actor to be able to receive a Letter, so let's implement that.
First, we define a Letter struct and derive the `actix::Message` trait for it,
which allows it to be passed as a message in the actor model.

```rust
// Define the Letter struct.
// By deriving the Message trait, Letter can behave as an actor model message.
#[derive(Message)]
#[rtype(result = "()")]
struct Letter(String);
```

Now that Letter is defined, let's make the Receiver print the contents when it receives one.
To define this, we implement the `Handler<Letter>` trait for Receiver.

```rust
// Implement Handler<Letter> for Receiver
impl Handler<Letter> for Receiver {
    type Result = ();

    // Print the message contents to standard output when received
    fn handle(&mut self, msg: Letter, _: &mut Context<Self>) -> Self::Result {
        println!("Receiver : got a message! >> {:?}", msg.0); // Print the received message contents.
    }
}
```

That completes the Receiver.

### Implementing the Messenger Actor

Next, let's define Messenger. Since Messenger needs to know the Receiver's address,
we include it as a field of the struct. We will also have it send a Letter to the Receiver when the actor starts.

```rust
// Define the Messenger struct.
struct Messenger(Addr<Receiver>);

// Implement the Actor trait for the Messenger struct.
impl Actor for Messenger {
    type Context = Context<Self>;

    // Behavior when the actor starts.
    fn started(&mut self, _: &mut Self::Context) {
        println!("Messenger: start");               // Print to standard output on startup
        println!("Messenger: send message");
        self.0.do_send(Letter("Hello!!".to_string())); // Send a message to the Receiver.
    }
}
```

This completes the Messenger definition as well.

### Execution

Running the above code as shown below produces standard output, confirming that a message
was sent from Messenger to Receiver.

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

## On the Dependency Between Two Actors

In the code above, the actors have an explicit dependency relationship.

```rust
struct Receiver;                  // <--┐
struct Messenger(Addr<Receiver>); //  --┘ Explicitly depends on Receiver
```

When actor-to-actor coupling like this is assumed,
the application composed of multiple actors becomes tightly coupled as a whole,
reducing reusability. In object-oriented application design,
a common pattern is to depend on interfaces rather than concrete implementations,
with implementation classes provided separately -- this is known as dependency inversion.
The goal here is to apply this same idea to the actor model.

This state can be illustrated as follows:

<img src="/images/blog/20210126/actorModel2.png" alt="actorModel2">

## Making Actors Depend on Abstractions

To define dependency inversion in the actor model, we first need to abstract the dependency.

```rust
struct Receiver;
struct Messenger<T>(Addr<T>);
```

Now it depends on an abstraction, but we need to add trait bounds to that abstraction.
In this case, two conditions are required: "it must be an actor" and "it must be able to receive the Letter message."
We define these using [trait_alias](https://doc.rust-lang.org/beta/unstable-book/language-features/trait-alias.html),
which is available on nightly (you can achieve the same without it).

```rust
// Bundle trait bounds using a trait alias
trait LetterHandler = actix::Actor + Handler<Letter>;

struct Receiver;
struct Messenger<T: LetterHandler>(Addr<T>);
```

The dependency between the actors is now gone, giving us a reusable structure.
Finally, we need to implement the Actor trait for the Messenger struct so it behaves as an actor.
At this point, we also need to declare trait bounds on the abstract actor's Context.
It gets a bit involved, but the implementation looks like this:

```rust
// Implement Actor for Messenger<T>
impl<T> Actor for Messenger<T>
where                                  // Declare trait bounds on T
    T: LetterHandler,                  // - T must implement the LetterHandler trait
    T::Context: ToEnvelope<T, Letter>, // - T is (by the above bound) an actor, and its Context must implement ToEnvelope
{
    type Context = Context<Self>;

    // Processing when the actor starts
    fn started(&mut self, _: &mut Self::Context) {
        println!("Messenger: start");

        println!("Messenger: send message");
        self.0.do_send(Letter("Hello!!".to_string()));  // Send a message to T
    }
}
```

## Practical Example: Implementing an Automated Bitcoin Trading System with the Actor Model

Let me show an example where abstracting the actor model, as introduced above, makes a codebase more reusable.
I have been building an application myself -- an automated Bitcoin trading system.
This sample involves three actors.

#### Bitflyer Actor

Connects to the Bitflyer exchange API server via WebSocket and receives real-time order book data.
Based on order book snapshots, it obtains the best limit order price and size at that point
(here, we call this the Best Bid Offer = BBO) and distributes it to another actor.

#### Collector Actor

Writes real-time data distributed from the exchange-connected actor to logs.
Since it receives BBO, it needs to implement `Handler<BBO>`.

#### Strategy Actor

Analyzes real-time data distributed from the exchange-connected actor
and executes actual trades according to an automated trading strategy algorithm.
The strategy algorithm details are omitted here.

When building an automated trading system, you may want to run
(1) the data collection application and (2) the strategy execution application
as separate containers for fault tolerance and performance optimization.
In that case, since the Bitflyer actor is used in both applications,
the pattern of actors depending on abstractions can be applied.

<img src="/images/blog/20210126/actorModel3.png" alt="actorModel3">

Expressed in code, it looks like the following.
The WebSocket communication parts are omitted, so please see the [source code](https://github.com/kazukiyoshida/actor-polymorphism) if you are interested.

```rust
// An actor that connects to the Bitflyer exchange via WebSocket and receives data in real time.
// It parses the received data and forwards it to a service actor T.
pub struct Bitflyer<T: BBOHandler> {
    sender: Sender,          // Used to send messages to the Bitflyer exchange server
    service_actor: Addr<T>,  // Address of the service actor T
}
```

```rust
pub trait BBOHandler = actix::Actor + Handler<UpdateBBO>;
```

```rust
pub struct Collector;

impl Actor for Collector { .. }
impl Handler<UpdateBBO> for Collector { .. } // Data storage, etc.
```

```rust
pub struct Strategy;

impl Actor for Strategy { .. }
impl Handler<UpdateBBO> for Strategy { .. } // Trade execution, etc.
```

## Conclusion

In this post, I introduced Actix as a Rust actor model library, showed how to abstract actors,
and demonstrated an application to an automated Bitcoin trading system.

The actor model is quite different from the layered architecture commonly used in web application development,
so I started development by trial and error, not knowing what kind of structure would work best.
I still have much to learn, and there may be better architectures out there,
but I hope this serves as a useful reference for anyone looking to build applications with the actor model.

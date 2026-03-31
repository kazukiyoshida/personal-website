---
title: "Building an AVR ATmega328p Emulator in Rust"
date: "2021-01-18"
tags: ["Rust", "AVR", "CPU Emulator"]
excerpt: ""
lang: "en"
postSlug: "avr-emulator"
ai_translated: true
---

Have you heard of [Arduino](https://www.arduino.cc/), a microcontroller board that makes electronics accessible to everyone? By getting a board and some components and programming in the Arduino language, even beginners can easily control sensors, drive motors, and more. It's an incredibly popular platform.

In this post, I'll write about building an emulator in Rust for the Atmel AVR microcontroller used as the CPU in Arduino boards.

AVR microcontrollers are remarkably feature-rich, and I eventually realized that implementing a **complete microcontroller emulator** would be extremely difficult. However, through the process, I managed to build a minimally functional emulator. I hope this is helpful for anyone interested in CPU emulators written in Rust, or for those curious about the internals of the Arduino's CPU.

The source code is available [here](https://github.com/kazukiyoshida/avr-emulator).  
The language is Rust 1.46, and the development environment is macOS Catalina 10.15.7.

<img src="/images/blog/20210118/avr1.png" alt="avr1">

## What is an AVR Microcontroller?

AVR is an 8-bit RISC-based microcontroller originally developed by Atmel and now manufactured and sold by Microchip. It integrates a CPU, memory, I/O ports, clock oscillator circuit, timers, and more into a single chip. Unlike the Von Neumann architecture used in typical CPUs, AVR employs a Harvard architecture that separates program memory from data memory, enabling high-speed operation of one instruction per clock cycle.

In addition to the physical chip, Microchip officially provides simulation tools for AVR microcontrollers. It was previously called Atmel Studio, but as of 2021, it's been renamed to [Microchip Studio](https://www.microchip.com/en-us/development-tools-tools-and-software/microchip-studio-for-avr-and-sam-devices). This simulator allows you to execute programs at the assembly level and inspect memory values. I used it as the reference implementation for building the emulator.

## What is the AVR ATmega328P?

AVR offers a wide product lineup with varying pin counts and memory sizes, and the chip used in Arduino is the ATmega328P. Here are its key specifications:

- Operating speed of 20MHz (at 5V operating voltage)
- 32KB of flash memory and 2KB of internal SRAM
- Two 8-bit timers and one 16-bit timer (each with PWM)
- A wide range of serial interfaces (SPI, USART, I2C, USI)
- ADC, analog comparator

## Goals for the AVR Emulator

### Initial Goals

When I started the project, my inexperience led me to underestimate the scope of what needed to be implemented. I thought it would be a matter of implementing the AVR instruction set and a few peripheral features according to the datasheet, but once I actually started, I struggled even to understand the detailed specifications of the timers and I/O ports.

### What I Built

Things didn't go entirely as planned, but I ended up with a minimally functional implementation of the CPU's basic features, I/O ports, and timers. Here's a summary of what was accomplished:

#### Core Components

- About half of the AVR instruction set (63 out of 130 instructions)
- 32 register files, SRAM, FlashMemory
- Timers with PWM: 2 x 8-bit and 1 x 16-bit (including 4 operating modes)
- I/O port and pin input/output

#### Program Loaded into the Emulator

- An LED blink program compiled with Atmel Studio

#### Implemented Applications

- A step-by-step debugger that executes one instruction at a time (step_by_step.rs)
- A continuous execution mode that runs the program by driving the clock (flow.rs)
- A version that runs the above as WebAssembly

Running step_by_step.rs lets you inspect the Program Counter, registers, and other state as you step through each instruction, as shown in the image below.

![step_by_step execution](/images/blog/20210118/emulator.gif "step_by_step execution")

## Let's Build an AVR Emulator

### A. Memory

#### FlashMemory

AVR's FlashMemory is a simple 16-bit linear memory where the bootloader and programs are written. I represented this as a vector of u16. While it could also be represented as a fixed-length array `[u16; N]`, I used a vector because I didn't want to restrict it to the ATmega328P's specific memory size.

For the memory, I implemented functions to read values, set values, and write (program) HEX files into memory.

The Intel HEX specification is well documented on [Wikipedia](https://ja.wikipedia.org/wiki/Intel_HEX). Lines with a data record type contain the program in hexadecimal. I extract 4 characters per word (16 bits) and expand them into memory in little-endian order. So if a HEX file contains the data "...ABCD...", the FlashMemory address stores "CDAB".

```rust
pub struct FlashMemory {
    data: Vec<u16>,
}

impl FlashMemory {
    // Read a value at a given address
    pub fn get(&self, a: usize) -> u16 { self.data[a] }

    // Update a value at a given address
    pub fn set(&mut self, a: usize, v: u16) { self.data[a] = v; }

    // Load a program into memory from a string in Intel HEX format
    pub fn load_hex_from_string(&mut self, hex: String) { ..  }
}
```

#### SRAM

AVR's data memory space is organized in 8-bit units. I declared the register file, I/O registers, and internal SRAM together as a single SRAM structure. As a result, addresses 0x00 through 0x1f (0 to 31) are the register file, and addresses 0x20 through 0x5f (32 to 96) are the I/O registers.

AVR register names are standardized (SREG, SPH, SPL, etc.), but the actual memory addresses vary by product and require reading the specific datasheet. Since I wanted to implement the SRAM to be general-purpose rather than ATmega328P-specific, I made the register map configurable.

```rust
pub struct SRAM {
    data: Vec<u8>,
    pub map: &'static RegisterMap,            // Table for configurable register mapping
    pub word_map: &'static RegisterWordMap,   // Register mapping table at 1-word granularity
    pub bit_map: &'static RegisterBitMap,     // Register mapping table at 1-bit granularity
}

// Table for configuring the register map
struct RegisterMap {
    sreg: usize,  // Status Register address
    sph: usize,   // Stack Pointer High
    spl: usize,   // Stack Pointer Low
    portd: usize, // Port D PORTx register
    ddrd: usize,  // Port D Data Direction Register
    pind: usize,  // Port D PINx register
    ..            // And many more..
}
```

As shown above, RegisterMap involved a lot of repetitive declarations, so I simplified the definitions with a custom macro. Running the macro below expands into the RegisterMap declaration described above.

```rust
// Custom macro to simplify repetitive struct declarations
define_stationary_struct!(
    RegisterMap,   // Name of the struct to define
    usize,         // Value type
    sreg, sph, spl, portd, ddrd, pind, ucsr0a, ucsr0b, ucsr0c,              // Struct keys (register names)
    portc, ddrc, pinc, portb, ddrb, pinb, ramend, mcusr, twsr, twar, twdr,
    ...
);
```

As a program executes, the stack grows from RAMEND toward 0x0000 in SRAM. I also implemented functions to get the stack pointer and perform stack push/pop operations.

```rust
impl SRAM {
    pub fn sp(&self) -> u16 { .. }
    pub fn push_stack(&mut self, v: u8) { .. }
    pub fn pop_stack(&mut self) -> u8 { .. }
}
```

### B. The CPU Core

#### AVR Microcontroller Trait

Although I only managed to implement the ATmega328P, my original goal was to create a general AVR microcontroller implementation. So I defined the AVR microcontroller's behavior as a trait. The functions I provided are: (1) programming (writing a program), (2) CPU initialization, and (3, 4) reading and writing I/O ports.

```rust
pub trait AVRMCU {
    // Write an HEX-format program to FlashMemory
    fn program(&self, hex: String);

    // Initialize CPU status: PC, SP, SREG, etc.
    fn initialize(&mut self);

    // Read I/O port values
    fn get_pins(&self) -> Vec<bool>;

    // Set I/O port values
    fn set_pins(&self, pins: Vec<bool>);
}
```

I chose not to include the clock-advancing behavior in the AVRMCU trait. Instead, I implemented the Iterator trait for this purpose. We'll see how this works in the ATmega328P implementation.

#### ATmega328P

Now let's look at the concrete implementation of the ATmega328P. The ATmega328P core is defined as a struct holding FlashMemory, SRAM, a Program Counter (PC), the current cycle count, and the next instruction to execute.

```rust
pub struct ATmega328P {
    pc: usize,                              // Program Counter
    cycle: u64,                             // Execution cycle count
    instr: Option<Instr>,                   // (Next) instruction
    instr_func: Option<InstrFunc>,          // Function for the (next) instruction
    sram: Rc<RefCell<SRAM>>,                // SRAM
    flash_memory: Rc<RefCell<FlashMemory>>, // FlashMemory
}
```

As mentioned earlier, since SRAM is implemented as a general AVR component, the register map for ATmega328P is declared according to the [datasheet](https://avr.jp/user/DS/PDF/mega328P.pdf).

```rust
const REGISTER_MAP: RegisterMap = RegisterMap {
    sreg: 0x5f,
    sph: 0x5e,
    spl: 0x5d,

    // Timer 0 (8-bit)
    tcnt0: 0x46,
    tccr0a: 0x44,
    ...
}
```

I implemented the Iterator trait for ATmega328P so that calling next executes an instruction. Decoding a single word pointed to by the PC into an AVR instruction requires the opcode tree `OPCODE_TREE`, which is described later.

```rust
impl Iterator for ATmega328P {
    type Item = ();

    fn next(&mut self) -> Option<()> {
        // *** Execute the instruction
        let (next_pc, next_cycle) = self.instr_func.unwrap()(
            &mut self.sram.borrow_mut(),
            &self.flash_memory.borrow(),
            self.pc,
            self.cycle,
        );

        // *** Prepare for the next instruction
        self.pc = next_pc;       // Update PC
        self.cycle = next_cycle; // Update cycle count

        // Fetch the 1-word program at the address pointed to by PC from FlashMemory
        let word = self.flash_memory.borrow().get(self.pc as usize);

        // Look up which AVR instruction the fetched word corresponds to
        let (instr, instr_func) = OPCODE_TREE.with(|tree| tree.find(word));
        self.instr = Some(instr);
        self.instr_func = Some(instr_func);

        Some(())
    }
}
```

### C. Instruction Set

The AVR instruction set has 130 instructions in total, and I implemented about half of them. Each instruction has a corresponding function InstrFunc that updates memory and returns the next Program Counter value and cycle count.

In this implementation, I used trait objects for FlashMemory and SRAM with dynamic dispatch. This was to prevent the emulator binary from growing too large if implementations for microcontrollers other than the ATmega328P were added in the future.

```rust
// Instruction set enum
pub enum Instr {
    ADD, ADC, ADIW, SUB, SBC, SUBI, SBCI, SBIW, DEC, COM, LD1, LD2, LD3, LDI,
    LDDY1, LDDY2, LDDY3, LDDZ1, LDDZ2, LDDZ3, LDS, OUT, IN, NOP, CALL, RCALL,
    ...
}

// Instruction function type
pub type InstrFunc = &'static dyn Fn(&mut SRAM, &FlashMemory, usize, u64) -> (usize, u64);

// Instruction function for the ADD instruction
pub fn add(sram: &mut SRAM, flash_memory: &FlashMemory, pc: usize, cycle: u64) -> (usize, u64) {
    let (r_addr, d_addr) = flash_memory.word(pc).operand55();
    let (r, d) = sram.gets(r_addr, d_addr);
    let res = r.wrapping_add(d);
    sram.set(d_addr, res);
    sram.set_status_by_arithmetic_instruction(d, r, res);
    sram.set_bit(sram.bit_map.c, has_borrow_from_msb(r, d, res));
    (pc + 1, cycle + 1)
}
```

To decode the 1-word program at the PC into an AVR instruction, I built an opcode-to-instruction-set tree called OPCODE_TREE. It works by traversing the tree from the leftmost bit of the instruction's bit pattern to find the matching instruction.

OPCODE_TREE also needs to account for AVR instruction addressing modes. Looking at the [AVR Instruction Set Manual](http://ww1.microchip.com/downloads/en/devicedoc/atmel-0856-avr-instruction-set-manual.pdf), for example, the ADD instruction is defined as:

- `0000_11rd_dddd_rrrr`

In this case, the first 6 bits form the opcode, which is expressed as a pair of:

- `1111_1100_0000_0000` (mask)
- `0000_1100_0000_0000` (opcode)

The tree is constructed as static data at application startup. (I've forgotten why I used thread-local storage instead of lazy_static... sorry about that.)

```rust
thread_local! {
    pub static OPCODE_TREE: Node = {
        let mut t: Node = Default::default();
        t.add((0b0000_1100_0000_0000, 0b1111_1100_0000_0000), Instr::ADD, &add);
        t.add((0b0001_1100_0000_0000, 0b1111_1100_0000_0000), Instr::ADC, &adc);
        t.add((0b1001_0110_0000_0000, 0b1111_1111_0000_0000), Instr::ADIW, &adiw);
        t.add((0b0001_1000_0000_0000, 0b1111_1100_0000_0000), Instr::SUB, &sub);
```

### D. Peripherals

#### 8-bit/16-bit Timer/Counter

The ATmega328P has two 8-bit timer/counters and one 16-bit timer/counter. Each has 4 operating modes, and while the two 8-bit timer/counters are functionally almost identical, they have subtle differences such as different prescale values that can be set.

I didn't anticipate this at the outset, but the timer/counter implementation turned out to be the most challenging part of the project. Even a single cycle of drift would compound and make it impossible to keep register states in sync. I needed to precisely understand the timing of register updates when switching operating modes and prescale values.

Looking back, it was a valuable experience in the sense that it gave me an appreciation for CPU cycles -- something you rarely think about when writing application-level code.

#### I/O Ports

AVR microcontrollers have many pins for digital input/output, each corresponding to an I/O port.

- Setting the DDRx register to '0' configures the pin as input; setting it to '1' configures it as output
- Setting the PORTx register to '0' drives the output pin Low; setting it to '1' drives it High (for input pins, it activates the internal pull-up)
- Reading the PINx register to get the input value of '0' or '1'

As with the timer/counters, I needed to study the block diagrams showing the system clock and register behavior to understand the specifications.

### E. WebAssembly Support

I wanted the emulator to run in the browser, so I added WebAssembly support. The behaviors defined in the AVRMCU trait are directly exposed as the wasm interface.

```rust
#[wasm_bindgen]
pub struct AvrMcu {
    avr: Box<dyn AVRMCU>
}

#[wasm_bindgen]
impl AvrMcu {
    pub fn new_atmega328p() -> AvrMcu {
        let avr = atmega328p::ATmega328P::new(atmega328p::Package::PDIP28);
        AvrMcu {
            avr: Box::new(avr),
        }
    }

    pub fn program(&self, hex: String) {
        self.avr.program(hex)
    }

    pub fn initialize(&mut self) {
        self.avr.initialize();
    }

    pub fn get_pins(&self) -> String {
        from_vec_bool_to_string(&self.avr.get_pins())
    }

    pub fn set_pins(&self, pins: String) {
        self.avr.set_pins(from_string_to_vec_bool(&pins));
    }
}
```

## Conclusion

This project didn't end as a complete success, but it was a valuable experience both technically and mentally. When I started, I had no knowledge of CPUs or microcontrollers, and it was my first time developing in Rust. But by reading documentation and studying the source code of other emulator projects, I managed to put something together. I also vividly remember the times when I was debugging behavior at the single-clock level (there were register behaviors not documented in the spec) and thought I'd hit a dead end, only to push through with persistence and eventually find solutions. This project taught me the importance of diving in with momentum and persevering without giving up.

The target of this project was the microcontroller -- the boundary between analog and digital -- and it gave me a clear sense of what computers are good at and what they struggle with. The CPU behavior could be cleanly modeled as a pure computational model, but the microcontroller's peripheral features are tightly coupled with the physical world, and representing them computationally becomes incredibly difficult. It may seem obvious, but continuous physical quantities are hard to express in discrete programs, and I think I should have had a better sense of where that boundary lies.

As a programmer, now that I understand the fundamentals of CPU behavior at the lowest level, my next step is to learn about the layers above -- operating systems and language implementations.

## References

- [Patterson & Hennessy: Computer Organization and Design (Vols. 1 & 2)](https://www.amazon.co.jp/%E3%82%B3%E3%83%B3%E3%83%94%E3%83%A5%E3%83%BC%E3%82%BF%E3%81%AE%E6%A7%8B%E6%88%90%E3%81%A8%E8%A8%AD%E8%A8%88-%E7%AC%AC5%E7%89%88-%E4%B8%8A-%E3%82%B8%E3%83%A7%E3%83%B3%E3%83%BBL-%E3%83%98%E3%83%8D%E3%82%B7%E3%83%BC/dp/4822298426)
- [How to Build a CPU](https://www.amazon.co.jp/CPU%E3%81%AE%E5%89%B5%E3%82%8A%E3%81%8B%E3%81%9F-%E6%B8%A1%E6%B3%A2-%E9%83%81/dp/4839909865/ref=pd_bxgy_img_3/357-8409700-7212621?_encoding=UTF8&pd_rd_i=4839909865&pd_rd_r=06c3877d-f9ff-469a-9556-d70c4a933d50&pd_rd_w=UzV7H&pd_rd_wg=mJ1hd&pf_rd_p=e64b0a81-ca1b-4802-bd2c-a4b65bccc76e&pf_rd_r=AF60XDDE01V17X6TQ6GM&psc=1&refRID=AF60XDDE01V17X6TQ6GM)
- [AVR Microcontroller Reference Book](https://www.amazon.co.jp/AVR%E3%83%9E%E3%82%A4%E3%82%B3%E3%83%B3%E3%83%BB%E3%83%AA%E3%83%95%E3%82%A1%E3%83%AC%E3%83%B3%E3%82%B9%E3%83%BB%E3%83%96%E3%83%83%E3%82%AF%E2%80%95AVR%E3%81%AECPU%E3%82%A2%E3%83%BC%E3%82%AD%E3%83%86%E3%82%AF%E3%83%81%E3%83%A3%E3%80%81%E8%B1%8A%E5%AF%8C%E3%81%AA%E5%86%85%E8%94%B5%E5%91%A8%E8%BE%BA%E6%A9%9F%E8%83%BD%E3%82%92%E8%A9%B3%E7%B4%B0%E8%A7%A3%E8%AA%AC-%E3%83%9E%E3%82%A4%E3%82%B3%E3%83%B3%E6%B4%BB%E7%94%A8%E3%82%B7%E3%83%AA%E3%83%BC%E3%82%BA-%E5%B1%B1%E6%A0%B9-%E5%BD%B0/dp/4789837300)
- [Learn AVR by Trying](https://www.amazon.co.jp/%E8%A9%A6%E3%81%97%E3%81%AA%E3%81%8C%E3%82%89%E5%AD%A6%E3%81%B6AVR%E5%85%A5%E9%96%80%E2%80%95%E3%83%9E%E3%82%A4%E3%82%B3%E3%83%B3%E3%81%AE%E5%9F%BA%E7%A4%8E%E3%81%A8%E9%9B%BB%E5%AD%90%E5%B7%A5%E4%BD%9C%E3%81%A8Windows%E3%82%A2%E3%83%97%E3%83%AA%E3%82%B1%E3%83%BC%E3%82%B7%E3%83%A7%E3%83%B3%E3%81%AE%E4%BD%9C%E3%82%8A%E6%96%B9-SkiLL-up-mycomputer%E3%82%B7%E3%83%AA%E3%83%BC%E3%82%BA-%E5%9C%9F%E4%BA%95/dp/4789846040/ref=pd_sbs_1?pd_rd_w=1U3Mz&pf_rd_p=1821eedd-9050-44ff-9f94-4ca9c8c19ec5&pf_rd_r=P0DWRSE15P04WMXTEYV4&pd_rd_r=b160992d-ff50-493a-98d4-dd45c239ac77&pd_rd_wg=4YHU3&pd_rd_i=4789846040&psc=1)
- [kamiyaowl/rust-nes-emulator](https://github.com/kamiyaowl/rust-nes-emulator)

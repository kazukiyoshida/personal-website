---
title: "用 Rust 实现 AVR ATmega328p 模拟器"
date: "2021-01-18"
tags: ["Rust", "AVR", "CPU Emulator"]
excerpt: ""
lang: "zh"
postSlug: "avr-emulator"
ai_translated: true
---

你听说过 [Arduino](https://www.arduino.cc/) 吗？它是一款让电子制作变得简单有趣的微控制器开发板。只需准备好开发板和元件，用 Arduino 语言编程，即使是初学者也能轻松实现传感器控制和电机驱动等功能。这是一个非常受欢迎的平台。

这篇文章将介绍我用 Rust 实现 Arduino 所采用的 Atmel AVR 微控制器模拟器的过程。

AVR 微控制器功能非常丰富，我最终意识到要完整实现一个**微控制器模拟器**是极其困难的。不过在这个过程中，我成功构建了一个最低限度可运行的模拟器。希望这篇文章能对那些对用 Rust 实现 CPU 模拟器感兴趣的人，或者对 Arduino CPU 内部细节感兴趣的人有所帮助。

源代码已在[这里](https://github.com/kazukiyoshida/avr-emulator)公开。  
使用语言为 Rust 1.46，开发环境为 macOS Catalina 10.15.7。

<img src="/images/blog/20210118/avr1.png" alt="avr1">

## 什么是 AVR 微控制器？

AVR 是一款基于 RISC 架构的 8 位微控制器，最初由 Atmel 公司开发，现由 Microchip 公司制造和销售。它将 CPU、内存、I/O 端口、时钟振荡电路、定时器等集成在单个芯片中。与一般 CPU 采用的冯·诺依曼架构不同，AVR 采用了哈佛架构，将程序存储器和数据存储器分开，从而实现了每个时钟周期执行一条指令的高速运行。

除了物理芯片之外，Microchip 公司还官方提供了 AVR 微控制器的仿真工具。它之前叫 Atmel Studio，截至 2021 年已更名为 [Microchip Studio](https://www.microchip.com/en-us/development-tools-tools-and-software/microchip-studio-for-avr-and-sam-devices)。通过这个仿真器，可以在汇编级别执行程序并查看内存值。我将其作为参考标准来实现模拟器。

## 什么是 AVR ATmega328P？

AVR 提供了多种不同引脚数和内存大小的产品线，Arduino 采用的是 ATmega328P 芯片。ATmega328P 的主要特性如下：

- 工作频率 20MHz（工作电压 5V 时）
- 32KB Flash 存储器和 2KB 内部 SRAM
- 两个 8 位定时器和一个 16 位定时器（均带 PWM）
- 丰富的串行接口（SPI、USART、I2C、USI）
- ADC、模拟比较器

## AVR 模拟器的实现目标

### 最初的目标

项目刚开始时，由于经验不足，我低估了需要实现的功能范围。我以为只需要按照数据手册实现 AVR 指令集和一些外围功能就够了，但实际动手后发现，光是搞清楚定时器和 I/O 端口的详细规格就已经很吃力了。

### 最终成果

虽然没有完全按照最初的计划完成，但 CPU 的基本功能、I/O 端口和定时器都实现了最低限度的可运行状态。成果总结如下：

#### 基本构成

- AVR 指令集的约一半（130 条指令中的 63 条）
- 32 个寄存器文件、SRAM、FlashMemory
- 带 PWM 的定时器：2 个 8 位和 1 个 16 位（包含 4 种工作模式）
- I/O 端口和引脚的输入输出

#### 加载到模拟器的可执行文件

- 用 Atmel Studio 编译的 LED 闪烁程序

#### 实现的应用程序

- 逐条执行指令的调试器（step_by_step.rs）
- 通过连续驱动时钟来执行程序的模式（flow.rs）
- 将上述功能编译为 WebAssembly 运行的版本

运行 step_by_step.rs 可以逐步检查 Program Counter、寄存器等状态，如下图所示。

![step_by_step 执行效果](/images/blog/20210118/emulator.gif "step_by_step 执行效果")

## 开始构建 AVR 模拟器

### A. 内存

#### FlashMemory

AVR 的 FlashMemory 是一个简单的 16 位线性存储器，用于存放引导加载程序和用户程序。我用 u16 的 vector 来表示它。虽然也可以用固定长度数组 `[u16; N]` 来表示，但由于不想将其限制在 ATmega328P 的特定内存大小上，所以使用了 vector。

内存需要实现读取值的函数、设置值的函数、以及写入（烧录）HEX 文件的函数。

Intel HEX 的规格可以参考 [Wikipedia](https://ja.wikipedia.org/wiki/Intel_HEX) 的详细说明。记录类型为数据的行中以十六进制排列着程序，每个字（16 位）取 4 个字符，以小端序方式展开到存储器中。也就是说，如果 HEX 文件中有 "...ABCD..." 这样的数据，FlashMemory 的一个地址中存储的是 "CDAB"。

```rust
pub struct FlashMemory {
    data: Vec<u16>,
}

impl FlashMemory {
    // 指定地址读取值
    pub fn get(&self, a: usize) -> u16 { self.data[a] }

    // 指定地址更新值
    pub fn set(&mut self, a: usize, v: u16) { self.data[a] = v; }

    // 从 Intel HEX 格式的字符串将程序加载到内存中
    pub fn load_hex_from_string(&mut self, hex: String) { ..  }
}
```

#### SRAM

AVR 的数据存储空间以 8 位为单位组织。我将寄存器文件、I/O 寄存器和内部 SRAM 合并声明为一个 SRAM 结构体。因此，地址 0x00 到 0x1f（0 到 31）为寄存器文件，地址 0x20 到 0x5f（32 到 96）为 I/O 寄存器。

AVR 的寄存器名称是统一的（SREG、SPH、SPL 等），但具体的内存地址需要查阅各产品的数据手册。由于我希望实现一个通用的 AVR 微控制器 SRAM，而不是仅针对 ATmega328P，所以将寄存器映射设计为可配置的。

```rust
pub struct SRAM {
    data: Vec<u8>,
    pub map: &'static RegisterMap,            // 可配置的寄存器映射表
    pub word_map: &'static RegisterWordMap,   // 按字（word）粒度的寄存器映射表
    pub bit_map: &'static RegisterBitMap,     // 按位（bit）粒度的寄存器映射表
}

// 用于配置寄存器映射的表
struct RegisterMap {
    sreg: usize,  // 状态寄存器地址
    sph: usize,   // Stack Pointer High
    spl: usize,   // Stack Pointer Low
    portd: usize, // 端口 D 的 PORTx 寄存器
    ddrd: usize,  // 端口 D 的数据方向寄存器
    pind: usize,  // 端口 D 的 PINx 寄存器
    ..            // 还有很多..
}
```

如上所示，RegisterMap 涉及大量重复的声明，因此我用自定义宏来简化定义。执行下面的宏会展开为上面描述的 RegisterMap 声明。

```rust
// 用自定义宏简化重复的结构体声明
define_stationary_struct!(
    RegisterMap,   // 要定义的结构体名称
    usize,         // 值的类型
    sreg, sph, spl, portd, ddrd, pind, ucsr0a, ucsr0b, ucsr0c,              // 结构体的键（寄存器名称）
    portc, ddrc, pinc, portb, ddrb, pinb, ramend, mcusr, twsr, twar, twdr,
    ...
);
```

程序执行时，栈从 SRAM 的 RAMEND 向 0x0000 方向增长。我还实现了获取栈指针以及栈的 push/pop 操作函数。

```rust
impl SRAM {
    pub fn sp(&self) -> u16 { .. }
    pub fn push_stack(&mut self, v: u8) { .. }
    pub fn pop_stack(&mut self) -> u8 { .. }
}
```

### B. CPU 核心

#### AVR 微控制器 Trait

虽然最终只实现了 ATmega328P，但我最初的目标是做一个通用的 AVR 微控制器实现，因此将 AVR 微控制器的行为定义为一个 trait。提供的功能包括：(1) 烧录程序、(2) CPU 初始化、(3, 4) I/O 端口的读写。

```rust
pub trait AVRMCU {
    // 将 HEX 格式的程序写入 FlashMemory
    fn program(&self, hex: String);

    // 初始化 CPU 状态：PC、SP、SREG 等
    fn initialize(&mut self);

    // 读取 I/O 端口的值
    fn get_pins(&self) -> Vec<bool>;

    // 设置 I/O 端口的值
    fn set_pins(&self, pins: Vec<bool>);
}
```

我没有将推进时钟的行为包含在 AVRMCU trait 中，而是选择实现 Iterator trait 来完成这个功能。我们在 ATmega328P 的实现中来看具体做法。

#### ATmega328P

接下来看 ATmega328P 的具体实现。ATmega328P 的核心被定义为一个结构体，包含 FlashMemory、SRAM、Program Counter（PC）、当前周期数以及下一条待执行的指令。

```rust
pub struct ATmega328P {
    pc: usize,                              // Program Counter
    cycle: u64,                             // 执行周期数
    instr: Option<Instr>,                   // （下一条）指令
    instr_func: Option<InstrFunc>,          // （下一条）指令对应的函数
    sram: Rc<RefCell<SRAM>>,                // SRAM
    flash_memory: Rc<RefCell<FlashMemory>>, // FlashMemory
}
```

如前所述，由于 SRAM 是通用 AVR 实现，ATmega328P 实现时需要根据[数据手册](https://avr.jp/user/DS/PDF/mega328P.pdf)声明其寄存器映射。

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

我为 ATmega328P 实现了 Iterator trait，调用 next 函数即可执行一条指令。将 PC 指向的一个字解码为 AVR 指令需要用到后面介绍的指令集树 `OPCODE_TREE`。

```rust
impl Iterator for ATmega328P {
    type Item = ();

    fn next(&mut self) -> Option<()> {
        // *** 执行指令
        let (next_pc, next_cycle) = self.instr_func.unwrap()(
            &mut self.sram.borrow_mut(),
            &self.flash_memory.borrow(),
            self.pc,
            self.cycle,
        );

        // *** 为下一条指令做准备
        self.pc = next_pc;       // 更新 PC
        self.cycle = next_cycle; // 更新周期数

        // 从 FlashMemory 获取 PC 指向的一个字的程序
        let word = self.flash_memory.borrow().get(self.pc as usize);

        // 查找获取的字对应哪条 AVR 指令
        let (instr, instr_func) = OPCODE_TREE.with(|tree| tree.find(word));
        self.instr = Some(instr);
        self.instr_func = Some(instr_func);

        Some(())
    }
}
```

### C. 指令集

AVR 指令集共有 130 条指令，我实现了其中约一半。每条指令都有对应的函数 InstrFunc，负责更新内存并返回下一个 Program Counter 值和周期数。

本次实现中，我对 FlashMemory 和 SRAM 使用了 trait object 进行动态分发。这样做是为了在将来添加 ATmega328P 以外的实现时，防止模拟器的可执行文件体积过度膨胀。

```rust
// 指令集枚举
pub enum Instr {
    ADD, ADC, ADIW, SUB, SBC, SUBI, SBCI, SBIW, DEC, COM, LD1, LD2, LD3, LDI,
    LDDY1, LDDY2, LDDY3, LDDZ1, LDDZ2, LDDZ3, LDS, OUT, IN, NOP, CALL, RCALL,
    ...
}

// 指令函数的类型
pub type InstrFunc = &'static dyn Fn(&mut SRAM, &FlashMemory, usize, u64) -> (usize, u64);

// ADD 指令的函数实现
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

为了将 PC 指向的一个字的程序解码为 AVR 指令，我构建了操作码与指令集的树 OPCODE_TREE。它通过从指令位模式的最左位开始遍历树来找到匹配的指令。

OPCODE_TREE 还需要考虑 AVR 指令的寻址模式。参考 [AVR Instruction Set Manual](http://ww1.microchip.com/downloads/en/devicedoc/atmel-0856-avr-instruction-set-manual.pdf)，例如 ADD 指令定义为：

- `0000_11rd_dddd_rrrr`

这种情况下，前 6 位是操作码，表示为以下一对值：

- `1111_1100_0000_0000`（掩码）
- `0000_1100_0000_0000`（操作码）

树在应用程序启动时作为静态数据构建。（至于为什么用 thread local 而不是 lazy_static 来声明，我已经忘记原因了...抱歉...）

```rust
thread_local! {
    pub static OPCODE_TREE: Node = {
        let mut t: Node = Default::default();
        t.add((0b0000_1100_0000_0000, 0b1111_1100_0000_0000), Instr::ADD, &add);
        t.add((0b0001_1100_0000_0000, 0b1111_1100_0000_0000), Instr::ADC, &adc);
        t.add((0b1001_0110_0000_0000, 0b1111_1111_0000_0000), Instr::ADIW, &adiw);
        t.add((0b0001_1000_0000_0000, 0b1111_1100_0000_0000), Instr::SUB, &sub);
```

### D. 外围功能

#### 8 位/16 位定时器/计数器

ATmega328P 搭载了两个 8 位定时器/计数器和一个 16 位定时器/计数器。每个都有 4 种工作模式，而且两个 8 位定时器/计数器虽然功能几乎相同，但在可设置的预分频值等方面存在细微差异。

这是我在项目初期没有预料到的，但定时器/计数器的实现最终成为整个项目中最困难的部分。哪怕只差一个周期，偏差就会不断累积，导致无法保持寄存器状态的同步。我需要精确掌握工作模式和预分频值切换时寄存器更新的时序。

回顾来看，这是一次很有价值的经验——它让我真切地感受到了 CPU 周期这个在编写应用程序时几乎不会注意到的概念。

#### I/O 端口

AVR 微控制器有许多用于数字输入输出的引脚，它们与 I/O 端口相对应。

- DDRx 寄存器设为 '0' 时配置为输入端口，设为 '1' 时配置为输出端口
- PORTx 寄存器设为 '0' 时输出端口为低电平，设为 '1' 时输出端口为高电平（输入端口的情况下，内部上拉电阻被激活）
- 通过读取 PINx 寄存器来获取输入值 '0' 或 '1'

与定时器/计数器一样，我需要参照系统时钟和各寄存器行为的框图来理解其规格。

### E. WebAssembly 支持

我希望这个模拟器能在浏览器中运行，因此添加了 WebAssembly 支持。AVRMCU trait 中定义的行为直接作为 wasm 接口暴露出来。

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

## 结语

这个项目虽然不能算是完全成功，但在知识和心态上都是很好的锻炼。项目开始时我既没有 CPU 和微控制器的知识，也没有 Rust 开发经验，但通过查阅文献和阅读其他模拟器项目的源码，总算做出了一些成果。让我印象深刻的是，在单时钟级别调试行为时（有些寄存器行为在规格书中都没有记载），我多次觉得已经走到了死胡同，但凭着耐心坚持下去最终找到了解决方案。通过这个项目，我深刻体会到了鼓足干劲学习和坚持不懈的重要性。

这次的目标是微控制器——模拟与数字的交界地带——这让我清楚地感受到了计算机的擅长之处和局限所在。CPU 的行为可以作为纯粹的计算模型被清晰地代码化，但微控制器的外围功能与物理世界紧密相连，要用计算机来表达就变得异常困难。虽然这是显而易见的道理，但连续的物理量确实很难用离散的程序来表达，我认为应该更早地对这种能力边界有所认识。

作为程序员，既然已经理解了最底层 CPU 行为的基础，接下来我将学习更上层的领域——操作系统和语言处理系统。

## 参考文献

- [Patterson & Hennessy 计算机组成与设计（上下册）](https://www.amazon.co.jp/%E3%82%B3%E3%83%B3%E3%83%94%E3%83%A5%E3%83%BC%E3%82%BF%E3%81%AE%E6%A7%8B%E6%88%90%E3%81%A8%E8%A8%AD%E8%A8%88-%E7%AC%AC5%E7%89%88-%E4%B8%8A-%E3%82%B8%E3%83%A7%E3%83%B3%E3%83%BBL-%E3%83%98%E3%83%8D%E3%82%B7%E3%83%BC/dp/4822298426)
- [CPU 的制作方法](https://www.amazon.co.jp/CPU%E3%81%AE%E5%89%B5%E3%82%8A%E3%81%8B%E3%81%9F-%E6%B8%A1%E6%B3%A2-%E9%83%81/dp/4839909865/ref=pd_bxgy_img_3/357-8409700-7212621?_encoding=UTF8&pd_rd_i=4839909865&pd_rd_r=06c3877d-f9ff-469a-9556-d70c4a933d50&pd_rd_w=UzV7H&pd_rd_wg=mJ1hd&pf_rd_p=e64b0a81-ca1b-4802-bd2c-a4b65bccc76e&pf_rd_r=AF60XDDE01V17X6TQ6GM&psc=1&refRID=AF60XDDE01V17X6TQ6GM)
- [AVR 微控制器参考手册](https://www.amazon.co.jp/AVR%E3%83%9E%E3%82%A4%E3%82%B3%E3%83%B3%E3%83%BB%E3%83%AA%E3%83%95%E3%82%A1%E3%83%AC%E3%83%B3%E3%82%B9%E3%83%BB%E3%83%96%E3%83%83%E3%82%AF%E2%80%95AVR%E3%81%AECPU%E3%82%A2%E3%83%BC%E3%82%AD%E3%83%86%E3%82%AF%E3%83%81%E3%83%A3%E3%80%81%E8%B1%8A%E5%AF%8C%E3%81%AA%E5%86%85%E8%94%B5%E5%91%A8%E8%BE%BA%E6%A9%9F%E8%83%BD%E3%82%92%E8%A9%B3%E7%B4%B0%E8%A7%A3%E8%AA%AC-%E3%83%9E%E3%82%A4%E3%82%B3%E3%83%B3%E6%B4%BB%E7%94%A8%E3%82%B7%E3%83%AA%E3%83%BC%E3%82%BA-%E5%B1%B1%E6%A0%B9-%E5%BD%B0/dp/4789837300)
- [边学边练 AVR 入门](https://www.amazon.co.jp/%E8%A9%A6%E3%81%97%E3%81%AA%E3%81%8C%E3%82%89%E5%AD%A6%E3%81%B6AVR%E5%85%A5%E9%96%80%E2%80%95%E3%83%9E%E3%82%A4%E3%82%B3%E3%83%B3%E3%81%AE%E5%9F%BA%E7%A4%8E%E3%81%A8%E9%9B%BB%E5%AD%90%E5%B7%A5%E4%BD%9C%E3%81%A8Windows%E3%82%A2%E3%83%97%E3%83%AA%E3%82%B1%E3%83%BC%E3%82%B7%E3%83%A7%E3%83%B3%E3%81%AE%E4%BD%9C%E3%82%8A%E6%96%B9-SkiLL-up-mycomputer%E3%82%B7%E3%83%AA%E3%83%BC%E3%82%BA-%E5%9C%9F%E4%BA%95/dp/4789846040/ref=pd_sbs_1?pd_rd_w=1U3Mz&pf_rd_p=1821eedd-9050-44ff-9f94-4ca9c8c19ec5&pf_rd_r=P0DWRSE15P04WMXTEYV4&pd_rd_r=b160992d-ff50-493a-98d4-dd45c239ac77&pd_rd_wg=4YHU3&pd_rd_i=4789846040&psc=1)
- [kamiyaowl/rust-nes-emulator](https://github.com/kamiyaowl/rust-nes-emulator)

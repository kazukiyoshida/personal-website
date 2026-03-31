import type { Lang } from "./i18n";

export interface Post {
  id: string;
  title: Record<Lang, string>;
  date: string;
  tags: string[];
  excerpt?: Record<Lang, string>;
}

export const posts: Post[] = [
  {
    id: "actor-model-di",
    title: {
      ja: "Rustのアクターモデルで依存性逆転",
      en: "Dependency Inversion with the Actor Model in Rust",
      zh: "在 Rust 的 Actor 模型中实现依赖反转",
    },
    date: "2021/01/26",
    tags: ["Rust", "Actix", "Actor Model", "Dependency Inversion"],
  },
  {
    id: "avr-emulator",
    title: {
      ja: "AVR ATmega328p のエミュレータを Rust で実装する",
      en: "Building an AVR ATmega328p Emulator in Rust",
      zh: "用 Rust 实现 AVR ATmega328p 模拟器",
    },
    date: "2021/01/18",
    tags: ["Rust", "AVR", "CPU Emulator"],
  },
  {
    id: "why-i-love-rust",
    title: {
      ja: "なぜRustが好きなのか",
      en: "Why I Love Rust",
      zh: "我为什么喜欢 Rust",
    },
    date: "2021/01/08",
    tags: ["Rust"],
  },
  {
    id: "nuxt-blog",
    title: {
      ja: "Nuxt + Express で Markdown ベースのブログを開発しました",
      en: "Building a Markdown-Based Blog with Nuxt + Express",
      zh: "使用 Nuxt + Express 开发了基于 Markdown 的博客",
    },
    date: "2019/10/13",
    tags: ["Nuxt.js", "Vue.js", "Microservices", "TypeScript"],
  },
  {
    id: "blog-release",
    title: {
      ja: "ブログが完成したので公開します",
      en: "Launching My Blog",
      zh: "博客上线了",
    },
    date: "2019/09/23",
    tags: ["update"],
  },
  {
    id: "closure",
    title: {
      ja: "クロージャを使った問題解決",
      en: "Problem Solving with Closures",
      zh: "使用闭包解决问题",
    },
    date: "2019/07/31",
    tags: ["TypeScript", "Vue.js"],
  },
  {
    id: "mercari-tech-conf",
    title: {
      ja: "Mercari Tech Conf 2018 レポート",
      en: "Mercari Tech Conf 2018 Report",
      zh: "Mercari Tech Conf 2018 参会报告",
    },
    date: "2018/10/09",
    tags: ["Conference", "Microservices"],
  },
  {
    id: "tensorflow-data",
    title: {
      ja: "TensorFlowによるデータの読み込み",
      en: "Reading Data with TensorFlow",
      zh: "使用TensorFlow读取数据",
    },
    date: "2016/06/27",
    tags: ["TensorFlow"],
  },
  {
    id: "ubuntu-gpu-tensorflow",
    title: {
      ja: "Ubuntu14.04 + GPU + TensorFlow 環境構築",
      en: "Setting Up Ubuntu 14.04 + GPU + TensorFlow",
      zh: "Ubuntu14.04 + GPU + TensorFlow 环境搭建",
    },
    date: "2016/06/19",
    tags: ["TensorFlow", "GPU"],
  },
];

export const tagColors: Record<string, string> = {
  Rust: "oklch(0.65 0.15 30)",
  Go: "oklch(0.65 0.12 200)",
  Python: "oklch(0.65 0.12 250)",
  TypeScript: "oklch(0.65 0.12 230)",
  "Vue.js": "oklch(0.65 0.12 150)",
  "Nuxt.js": "oklch(0.65 0.12 150)",
  TensorFlow: "oklch(0.65 0.15 50)",
  GPU: "oklch(0.65 0.12 280)",
  Actix: "oklch(0.65 0.15 30)",
  AVR: "oklch(0.65 0.10 200)",
  Microservices: "oklch(0.65 0.10 180)",
  Conference: "oklch(0.65 0.10 300)",
};

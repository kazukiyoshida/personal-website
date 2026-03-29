export interface Post {
  id: string;
  title: string;
  date: string;
  tags: string[];
  excerpt?: string;
}

export const posts: Post[] = [
  {
    id: "actor-model-di",
    title: "Rustのアクターモデルで依存性逆転",
    date: "2021/01/26",
    tags: ["Rust", "Actix", "Actor Model", "Dependency Inversion"],
    excerpt: "ActixのアクターモデルとDIパターンを組み合わせてRustアプリケーションの設計を改善する方法を解説します。",
  },
  {
    id: "avr-emulator",
    title: "AVR ATmega328p のエミュレータを Rust で実装する",
    date: "2021/01/18",
    tags: ["Rust", "AVR", "CPU Emulator"],
    excerpt: "Rustを使ってAVR ATmega328pマイクロコントローラのエミュレータをゼロから実装した記録です。",
  },
  {
    id: "why-i-love-rust",
    title: "なぜRustが好きなのか",
    date: "2021/01/08",
    tags: ["Rust"],
    excerpt: "所有権システム、型安全性、パフォーマンス。Rustが他の言語と一線を画す理由を個人的な視点で語ります。",
  },
  {
    id: "nuxt-blog",
    title: "Nuxt + Express で Markdown ベースのブログを開発しました",
    date: "2019/10/13",
    tags: ["Nuxt.js", "Vue.js", "Microservices", "TypeScript"],
    excerpt: "このブログ自体の開発記録。NuxtとExpressを組み合わせたMarkdownベースのブログシステムの設計と実装について。",
  },
  {
    id: "blog-release",
    title: "ブログが完成したので公開します",
    date: "2019/09/23",
    tags: ["update"],
    excerpt: "長らく構想していた個人ブログをついに公開します。技術的な内容を中心に定期的に更新していく予定です。",
  },
  {
    id: "closure",
    title: "クロージャを使った問題解決",
    date: "2019/07/31",
    tags: ["TypeScript", "Vue.js"],
    excerpt: "TypeScriptとVue.jsでクロージャを活用して複雑な状態管理の問題をエレガントに解決するアプローチを紹介します。",
  },
  {
    id: "mercari-tech-conf",
    title: "Mercari Tech Conf 2018 レポート",
    date: "2018/10/09",
    tags: ["Conference", "Microservices"],
    excerpt: "Mercari Tech Conf 2018に参加してきました。マイクロサービスアーキテクチャに関するセッションを中心にレポートします。",
  },
  {
    id: "tensorflow-data",
    title: "TensorFlowによるデータの読み込み",
    date: "2016/06/27",
    tags: ["TensorFlow"],
    excerpt: "TensorFlowでの効率的なデータパイプラインの構築方法について解説します。",
  },
  {
    id: "ubuntu-gpu-tensorflow",
    title: "Ubuntu14.04 + GPU + TensorFlow 環境構築",
    date: "2016/06/19",
    tags: ["TensorFlow", "GPU"],
    excerpt: "Ubuntu 14.04にGPUドライバとCUDA、TensorFlowをインストールして機械学習環境を構築する手順を記録します。",
  },
];

export const tagColors: Record<string, string> = {
  "Rust": "oklch(0.65 0.15 30)",
  "Go": "oklch(0.65 0.12 200)",
  "Python": "oklch(0.65 0.12 250)",
  "TypeScript": "oklch(0.65 0.12 230)",
  "Vue.js": "oklch(0.65 0.12 150)",
  "Nuxt.js": "oklch(0.65 0.12 150)",
  "TensorFlow": "oklch(0.65 0.15 50)",
  "GPU": "oklch(0.65 0.12 280)",
  "Actix": "oklch(0.65 0.15 30)",
  "AVR": "oklch(0.65 0.10 200)",
  "Microservices": "oklch(0.65 0.10 180)",
  "Conference": "oklch(0.65 0.10 300)",
};

import { atom } from "nanostores";

export type Lang = "ja" | "en" | "zh";

const STORAGE_KEY = "lang";

function getInitialLang(): Lang {
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "ja" || stored === "en" || stored === "zh") return stored;
  }
  return "ja";
}

export const $lang = atom<Lang>(getInitialLang());

export function setLang(lang: Lang) {
  $lang.set(lang);
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, lang);
  }
}

const translations = {
  // Sidebar / MobileSidebar
  bio: {
    ja: "ML Infra Engineer, 東京\nWebエンジニアの記録です。",
    en: "ML Infra Engineer, Tokyo\nA web engineer's notes.",
    zh: "ML Infra Engineer, 东京\n一位Web工程师的记录。",
  },
  navAbout: {
    ja: "about",
    en: "about",
    zh: "about",
  },
  navBlog: {
    ja: "blog",
    en: "blog",
    zh: "blog",
  },

  // Blog list
  blogPath: {
    ja: "~/blog",
    en: "~/blog",
    zh: "~/blog",
  },
  posts: {
    ja: "posts",
    en: "posts",
    zh: "posts",
  },
  search: {
    ja: "search...",
    en: "search...",
    zh: "search...",
  },
  all: {
    ja: "all",
    en: "all",
    zh: "all",
  },
  noPostsFound: {
    ja: "投稿が見つかりません",
    en: "no posts found",
    zh: "未找到文章",
  },
  postedAt: {
    ja: "posted at",
    en: "posted at",
    zh: "posted at",
  },
  copyright: {
    ja: "© 2024 kazuki yoshida",
    en: "© 2024 kazuki yoshida",
    zh: "© 2024 kazuki yoshida",
  },
  footerRole: {
    ja: "ML Infra Engineer, 東京",
    en: "ML Infra Engineer, Tokyo",
    zh: "ML Infra Engineer, 东京",
  },

  // About page
  aboutMe: {
    ja: "// about me",
    en: "// about me",
    zh: "// about me",
  },
  aboutBio: {
    ja: "東京を拠点に活動するML Infra Engineerです。機械学習基盤の設計・開発を専門とし、RustやGoを使ったシステムプログラミングにも取り組んでいます。このブログでは、日々の技術的な学びや発見を記録しています。",
    en: "I'm an ML Infra Engineer based in Tokyo, specializing in designing and building machine learning infrastructure. I also work on systems programming with Rust and Go. This blog is where I document my technical learnings and discoveries.",
    zh: "我是一名驻东京的ML Infra Engineer，专注于机器学习基础设施的设计与开发，同时也从事Rust和Go的系统编程。在这个博客中，我记录着日常的技术学习与发现。",
  },
  skills: {
    ja: "// skills",
    en: "// skills",
    zh: "// skills",
  },
  timeline: {
    ja: "// timeline",
    en: "// timeline",
    zh: "// timeline",
  },
  timelineEvents: {
    ja: [
      { year: "2021", event: "ML Infra Engineer として機械学習基盤の開発に従事" },
      { year: "2019", event: "個人ブログを Nuxt + Express で開発・公開" },
      { year: "2018", event: "Mercari Tech Conf 2018 参加" },
      { year: "2016", event: "TensorFlow を使った機械学習の学習を開始" },
    ],
    en: [
      { year: "2021", event: "Working on ML infrastructure as an ML Infra Engineer" },
      { year: "2019", event: "Built and launched a personal blog with Nuxt + Express" },
      { year: "2018", event: "Attended Mercari Tech Conf 2018" },
      { year: "2016", event: "Started learning machine learning with TensorFlow" },
    ],
    zh: [
      { year: "2021", event: "作为ML Infra Engineer从事机器学习基础设施开发" },
      { year: "2019", event: "使用Nuxt + Express开发并发布个人博客" },
      { year: "2018", event: "参加Mercari Tech Conf 2018" },
      { year: "2016", event: "开始使用TensorFlow学习机器学习" },
    ],
  },
  contact: {
    ja: "// contact",
    en: "// contact",
    zh: "// contact",
  },
  contactText: {
    ja: "Twitter や GitHub からお気軽にご連絡ください。",
    en: "Feel free to reach out via Twitter or GitHub.",
    zh: "欢迎通过Twitter或GitHub与我联系。",
  },

  // 404 page
  pageNotFound: {
    ja: "// page not found",
    en: "// page not found",
    zh: "// page not found",
  },
  goHome: {
    ja: "> go home",
    en: "> go home",
    zh: "> go home",
  },
} as const;

type TranslationKey = keyof typeof translations;

export function t(key: TranslationKey, lang: Lang): string {
  const entry = translations[key];
  if (typeof entry[lang] === "string") return entry[lang] as string;
  return entry[lang] as unknown as string;
}

export function getTimelineEvents(lang: Lang) {
  return translations.timelineEvents[lang];
}

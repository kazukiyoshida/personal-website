import { atom } from "nanostores";

export type Lang = "ja" | "en" | "zh";

const STORAGE_KEY = "lang";

function detectLangFromBrowser(): Lang {
  const langs = navigator.languages ?? [navigator.language];
  for (const lang of langs) {
    const code = lang.toLowerCase();
    if (code.startsWith("ja")) return "ja";
    if (code.startsWith("zh")) return "zh";
  }
  return "en";
}

function getInitialLang(): Lang {
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "ja" || stored === "en" || stored === "zh") return stored;
    return detectLangFromBrowser();
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
    ja: "CrestAI 代表\nML Infra Engineer, 東京",
    en: "CEO at CrestAI\nML Infra Engineer, Tokyo",
    zh: "CrestAI 代表\nML Infra Engineer, 东京",
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
    ja: "CrestAI 代表 / ML Infra Engineer, 東京",
    en: "CEO at CrestAI / ML Infra Engineer, Tokyo",
    zh: "CrestAI 代表 / ML Infra Engineer, 东京",
  },

  // About page
  aboutMe: {
    ja: "// about me",
    en: "// about me",
    zh: "// about me",
  },
  aboutRole: {
    ja: "CrestAI 代表 / ML Infra Engineer",
    en: "CEO at CrestAI / ML Infra Engineer",
    zh: "CrestAI 代表 / ML Infra Engineer",
  },
  aboutBio: {
    ja: "CrestAI 代表。東京を拠点に活動するML Infra Engineerです。機械学習基盤の設計・開発を専門とし、RustやGoを使ったシステムプログラミングにも取り組んでいます。このブログでは、日々の技術的な学びや発見を記録しています。",
    en: "CEO at CrestAI. I'm an ML Infra Engineer based in Tokyo, specializing in designing and building machine learning infrastructure. I also work on systems programming with Rust and Go. This blog is where I document my technical learnings and discoveries.",
    zh: "CrestAI 代表。我是一名驻东京的ML Infra Engineer，专注于机器学习基础设施的设计与开发，同时也从事Rust和Go的系统编程。在这个博客中，我记录着日常的技术学习与发现。",
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
      { year: "2025", event: "CrestAI を創業、AI システムの開発や開発プロセス改善に取り組む" },
      {
        year: "2021",
        event:
          "LINE (Machine Learning Infrastructure Team) に入社、機械学習システムの基盤や分散処理基盤を構築",
      },
      { year: "2018", event: "チームラボに入社、サーバーサイド・フロントエンドの開発に従事" },
      {
        year: "2017",
        event:
          "IGPIビジネスアナリティクス&インテリジェンスに入社、企業の戦略立案やデータ分析に基づく施策提案を行う",
      },
      {
        year: "2017",
        event: "京都大学大学院理学研究科を卒業（神経細胞と画像処理機械学習に関する研究）",
      },
    ],
    en: [
      {
        year: "2025",
        event:
          "Founded CrestAI, working on AI system development and improving development processes",
      },
      {
        year: "2021",
        event:
          "Joined LINE (Machine Learning Infrastructure Team), building ML system infrastructure and distributed processing platforms",
      },
      { year: "2018", event: "Joined teamLab, working on server-side and frontend development" },
      {
        year: "2017",
        event:
          "Joined IGPI Business Analytics & Intelligence, providing strategic planning and data-driven recommendations for enterprises",
      },
      {
        year: "2017",
        event:
          "Graduated from Kyoto University Graduate School of Science (research on neural cells and image processing with machine learning)",
      },
    ],
    zh: [
      { year: "2025", event: "创立 CrestAI，从事 AI 系统开发和开发流程改善" },
      {
        year: "2021",
        event:
          "加入 LINE (Machine Learning Infrastructure Team)，构建机器学习系统基础设施和分布式处理平台",
      },
      { year: "2018", event: "加入 teamLab，从事服务端和前端开发" },
      {
        year: "2017",
        event:
          "加入 IGPI Business Analytics & Intelligence，为企业提供战略规划和基于数据分析的方案建议",
      },
      {
        year: "2017",
        event: "毕业于京都大学大学院理学研究科（神经细胞与图像处理机器学习相关研究）",
      },
    ],
  },
  contact: {
    ja: "// contact",
    en: "// contact",
    zh: "// contact",
  },
  contactText: {
    ja: "X や GitHub、LinkedIn からお気軽にご連絡ください。",
    en: "Feel free to reach out via X, GitHub, or LinkedIn.",
    zh: "欢迎通过X、GitHub或LinkedIn与我联系。",
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

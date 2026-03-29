/* =============================================================
   PAGE: About
   Design: Terminal Noir — dark terminal aesthetic
   Layout: Fixed left sidebar (280px) + scrollable right content
   ============================================================= */

import { motion } from "framer-motion";

const skills = [
  { category: "Languages", items: ["Rust", "Go", "Python", "TypeScript"] },
  { category: "Frontend", items: ["Vue.js", "Nuxt.js", "React"] },
  { category: "ML / Infra", items: ["TensorFlow", "PyTorch", "Kubernetes", "Docker"] },
  { category: "Tools", items: ["Vim", "Git", "Linux", "PostgreSQL"] },
];

const timeline = [
  { year: "2021", event: "ML Infra Engineer として機械学習基盤の開発に従事" },
  { year: "2019", event: "個人ブログを Nuxt + Express で開発・公開" },
  { year: "2018", event: "Mercari Tech Conf 2018 参加" },
  { year: "2016", event: "TensorFlow を使った機械学習の学習を開始" },
];

export default function About() {
  return (
    <div className="min-h-screen" style={{ background: "oklch(0.09 0.005 240)" }}>
      {/* Main content area */}
      <main
        className="min-h-screen md:ml-[280px]"
      >
        {/* Top bar - Desktop only */}
        <div
          className="sticky top-0 z-20 px-12 py-4 flex items-center hidden md:flex"
          style={{
            background: "oklch(0.09 0.005 240 / 0.92)",
            backdropFilter: "blur(12px)",
            borderBottom: "1px solid oklch(0.20 0.006 240)",
          }}
        >
          <span
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              color: "oklch(0.73 0.17 65)",
              fontSize: "0.8rem",
            }}
          >
            ~/about
          </span>
        </div>

        <div className="px-4 md:px-12 py-8 md:py-12 max-w-2xl">
          {/* Heading */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-12"
          >
            <div
              className="text-xs mb-3"
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                color: "oklch(0.73 0.17 65)",
                letterSpacing: "0.08em",
              }}
            >
              // about me
            </div>
            <h1
              className="text-2xl md:text-4xl font-bold mb-6"
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                color: "oklch(0.91 0.005 240)",
                letterSpacing: "-0.02em",
              }}
            >
              kazuki yoshida
            </h1>
            <p
              className="text-sm md:text-base leading-relaxed"
              style={{
                fontFamily: "'IBM Plex Sans JP', sans-serif",
                color: "oklch(0.65 0.008 240)",
                lineHeight: 1.8,
              }}
            >
              東京を拠点に活動するML Infra Engineerです。機械学習基盤の設計・開発を専門とし、
              RustやGoを使ったシステムプログラミングにも取り組んでいます。
              このブログでは、日々の技術的な学びや発見を記録しています。
            </p>
          </motion.div>

          {/* Skills */}
          <motion.section
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="mb-12"
          >
            <div
              className="text-xs mb-5"
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                color: "oklch(0.73 0.17 65)",
                letterSpacing: "0.08em",
              }}
            >
              // skills
            </div>
            <div className="grid grid-cols-2 gap-5">
              {skills.map((group) => (
                <div key={group.category}>
                  <h3
                    className="text-xs md:text-sm mb-2"
                    style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      color: "oklch(0.50 0.008 240)",
                      letterSpacing: "0.04em",
                    }}
                  >
                    {group.category}
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {group.items.map((item) => (
                      <span key={item} className="tag-badge">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </motion.section>

          {/* Timeline */}
          <motion.section
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mb-12"
          >
            <div
              className="text-xs mb-5"
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                color: "oklch(0.73 0.17 65)",
                letterSpacing: "0.08em",
              }}
            >
              // timeline
            </div>
            <div className="space-y-4">
              {timeline.map((item, i) => (
                <motion.div
                  key={item.year}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.35 + i * 0.08 }}
                  className="flex gap-6 items-start"
                >
                  <span
                    className="text-xs shrink-0 pt-0.5"
                    style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      color: "oklch(0.73 0.17 65)",
                      minWidth: "2.5rem",
                    }}
                  >
                    {item.year}
                  </span>
                  <div
                    className="w-px self-stretch mt-1.5 shrink-0"
                    style={{ background: "oklch(0.22 0.006 240)" }}
                  />
                  <p
                    className="text-xs md:text-sm"
                    style={{
                      fontFamily: "'IBM Plex Sans JP', sans-serif",
                      color: "oklch(0.65 0.008 240)",
                      lineHeight: 1.6,
                    }}
                  >
                    {item.event}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.section>

          {/* Contact */}
          <motion.section
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <div
              className="text-xs mb-4"
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                color: "oklch(0.73 0.17 65)",
                letterSpacing: "0.08em",
              }}
            >
              // contact
            </div>
            <p
              className="text-sm"
              style={{
                fontFamily: "'IBM Plex Sans JP', sans-serif",
                color: "oklch(0.55 0.008 240)",
              }}
            >
              Twitter や GitHub からお気軽にご連絡ください。
            </p>
          </motion.section>
        </div>
      </main>
    </div>
  );
}

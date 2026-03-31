import { useStore } from "@nanostores/react";
import { $lang, t, getTimelineEvents } from "../lib/i18n";
import { withBase } from "../lib/path";

const skills = [
  { category: "Languages", items: ["Rust", "Go", "Python", "TypeScript"] },
  { category: "Frontend", items: ["Vue.js", "Nuxt.js", "React"] },
  { category: "ML / Infra", items: ["TensorFlow", "PyTorch", "Kubernetes", "Docker"] },
  { category: "Tools", items: ["Vim", "Git", "Linux", "PostgreSQL"] },
];

export default function AboutContent() {
  const lang = useStore($lang);
  const timeline = getTimelineEvents(lang);

  return (
    <>
      {/* Top bar - Desktop only */}
      <div
        className="sticky top-0 z-20 px-4 md:px-32 py-4 items-center hidden md:flex"
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

      <div className="px-4 md:px-32 py-8 md:py-12 max-w-6xl">
        {/* Heading */}
        <div className="mb-12 animate-slide-up flex flex-col md:flex-row md:items-start md:gap-12">
          <div className="flex-1">
            <div
              className="text-xs mb-3"
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                color: "oklch(0.73 0.17 65)",
                letterSpacing: "0.08em",
              }}
            >
              {t("aboutMe", lang)}
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
                color: "oklch(0.72 0.008 240)",
                lineHeight: 1.8,
              }}
            >
              {t("aboutBio", lang)}
            </p>
          </div>
          <div className="mt-8 md:mt-6 shrink-0 flex justify-center md:justify-start">
            <img
              src={withBase("/images/selfie.jpg")}
              alt="kazuki yoshida"
              className="w-48 md:w-56 rounded aspect-square"
              style={{
                border: "1px solid oklch(0.22 0.006 240)",
                objectFit: "cover",
                objectPosition: "center 20%",
              }}
            />
          </div>
        </div>

        {/* Skills */}
        <section className="mb-12 animate-slide-up" style={{ animationDelay: "0.15s" }}>
          <div
            className="text-xs mb-5"
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              color: "oklch(0.73 0.17 65)",
              letterSpacing: "0.08em",
            }}
          >
            {t("skills", lang)}
          </div>
          <div className="grid grid-cols-2 gap-5">
            {skills.map((group) => (
              <div key={group.category}>
                <h3
                  className="text-xs md:text-sm mb-2"
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    color: "oklch(0.60 0.008 240)",
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
        </section>

        {/* Timeline */}
        <section className="mb-12 animate-slide-up" style={{ animationDelay: "0.3s" }}>
          <div
            className="text-xs mb-5"
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              color: "oklch(0.73 0.17 65)",
              letterSpacing: "0.08em",
            }}
          >
            {t("timeline", lang)}
          </div>
          <div className="space-y-4">
            {timeline.map((item, i) => (
              <div
                key={item.year}
                className="flex gap-6 items-start animate-slide-in-left"
                style={{
                  animationDelay: `${0.35 + i * 0.08}s`,
                  opacity: 0,
                }}
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
                    color: "oklch(0.72 0.008 240)",
                    lineHeight: 1.6,
                  }}
                >
                  {item.event}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Contact */}
        <section className="animate-slide-up" style={{ animationDelay: "0.5s" }}>
          <div
            className="text-xs mb-4"
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              color: "oklch(0.73 0.17 65)",
              letterSpacing: "0.08em",
            }}
          >
            {t("contact", lang)}
          </div>
          <p
            className="text-sm"
            style={{
              fontFamily: "'IBM Plex Sans JP', sans-serif",
              color: "oklch(0.72 0.008 240)",
            }}
          >
            {t("contactText", lang)}
          </p>
        </section>
      </div>
    </>
  );
}

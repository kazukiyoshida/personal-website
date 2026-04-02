import { useStore } from "@nanostores/react";
import { $lang, t, getTimelineEvents } from "../lib/i18n";
import { withBase } from "../lib/path";

const socialLinks = [
  {
    label: "X",
    href: "https://x.com/_kazukiyoshida_",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.747l7.73-8.835L1.254 2.25H8.08l4.259 5.63zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  {
    label: "GitHub",
    href: "https://github.com/kazukiyoshida",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
      </svg>
    ),
  },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/kazukiyoshida0602/",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    ),
  },
];

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
          background: "var(--content-bg-overlay)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid var(--content-border)",
        }}
      >
        <span
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            color: "var(--amber)",
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
                color: "var(--amber)",
                letterSpacing: "0.08em",
              }}
            >
              {t("aboutMe", lang)}
            </div>
            <h1
              className="text-2xl md:text-4xl font-bold mb-6"
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                color: "var(--content-heading)",
                letterSpacing: "-0.02em",
              }}
            >
              kazuki yoshida
            </h1>
            <p
              className="text-sm md:text-base mb-4"
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                color: "var(--content-text-muted)",
              }}
            >
              {t("aboutRole", lang)}
            </p>
            <p
              className="text-sm md:text-base leading-relaxed"
              style={{
                fontFamily: "'IBM Plex Sans JP', sans-serif",
                color: "var(--content-text-secondary)",
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
                border: "1px solid var(--content-border)",
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
              color: "var(--amber)",
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
                    color: "var(--content-text-muted)",
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
              color: "var(--amber)",
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
                    color: "var(--amber)",
                    minWidth: "2.5rem",
                  }}
                >
                  {item.year}
                </span>
                <div
                  className="w-px self-stretch mt-1.5 shrink-0"
                  style={{ background: "var(--content-border)" }}
                />
                <p
                  className="text-xs md:text-sm"
                  style={{
                    fontFamily: "'IBM Plex Sans JP', sans-serif",
                    color: "var(--content-text-secondary)",
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
              color: "var(--amber)",
              letterSpacing: "0.08em",
            }}
          >
            {t("contact", lang)}
          </div>
          <p
            className="text-sm mb-4"
            style={{
              fontFamily: "'IBM Plex Sans JP', sans-serif",
              color: "var(--content-text-secondary)",
            }}
          >
            {t("contactText", lang)}
          </p>
          <div className="flex gap-3">
            {socialLinks.map(({ label, href, icon }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="social-link"
              >
                {icon}
              </a>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}

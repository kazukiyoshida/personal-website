import { useStore } from "@nanostores/react";
import { $lang, t } from "../lib/i18n";

interface PostMeta {
  title: string;
  date: string;
  tags: string[];
}

interface Props {
  postMeta: Record<string, PostMeta>;
  slug: string;
}

export default function BlogPostHeader({ postMeta, slug }: Props) {
  const lang = useStore($lang);
  const meta = postMeta[lang] || postMeta["ja"];

  // Dispatch custom event when language changes so the content divs update
  // This bridges nanostores -> vanilla JS
  const prevLang = typeof window !== "undefined" ? localStorage.getItem("lang") : null;
  if (typeof window !== "undefined" && prevLang !== lang) {
    setTimeout(() => {
      document.dispatchEvent(new CustomEvent("langchange"));
    }, 0);
  }

  return (
    <>
      {/* Top bar */}
      <div
        className="sticky top-0 z-20 px-4 md:px-32 py-4 flex items-center"
        style={{
          background: "oklch(0.09 0.005 240 / 0.92)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid oklch(0.20 0.006 240)",
        }}
      >
        <span
          className="text-xs"
          style={{
            fontFamily: "'JetBrains Mono', monospace",
          }}
        >
          <a
            href="/"
            className="transition-colors duration-200 hover:opacity-80"
            style={{ color: "oklch(0.73 0.17 65)" }}
          >
            ~/blog
          </a>
          <span style={{ color: "oklch(0.35 0.006 240)" }}>/</span>
          <span style={{ color: "oklch(0.50 0.008 240)" }}>{slug}</span>
        </span>
      </div>

      {/* Post header */}
      <header className="px-4 md:px-32 pt-8 md:pt-10 pb-6 animate-fade-in-up">
        <time
          className="text-xs mb-3 block"
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            color: "oklch(0.50 0.008 240)",
            letterSpacing: "0.04em",
            fontSize: "0.7rem",
          }}
        >
          {t("postedAt", lang)} {meta.date}
        </time>

        <h1
          className="text-xl md:text-2xl font-bold mb-5"
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            color: "oklch(0.92 0.005 240)",
            lineHeight: 1.4,
            letterSpacing: "-0.02em",
          }}
        >
          {meta.title}
        </h1>

        <div className="flex flex-wrap gap-2 mb-6">
          {meta.tags.map((tag) => (
            <span key={tag} className="tag-badge">
              {tag}
            </span>
          ))}
        </div>

        <div
          style={{ borderBottom: "1px solid oklch(0.20 0.006 240)" }}
        />
      </header>
    </>
  );
}

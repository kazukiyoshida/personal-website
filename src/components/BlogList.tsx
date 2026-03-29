import { useState, useMemo } from "react";
import { useStore } from "@nanostores/react";
import { $lang, t } from "../lib/i18n";
import type { Post } from "../lib/blog-data";
import { posts } from "../lib/blog-data";

const allTags = Array.from(new Set(posts.flatMap((p) => p.tags))).sort();

function PostItem({ post, index, postedAtLabel }: { post: Post; index: number; postedAtLabel: string }) {
  const [hovered, setHovered] = useState(false);

  return (
    <article
      className="py-7 border-b animate-fade-in-up"
      style={{
        borderColor: "oklch(0.20 0.006 240)",
        animationDelay: `${index * 0.06}s`,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <a href={`/blog/${post.id}`} className="block">
        <time
          className="text-xs mb-2 block"
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            color: "oklch(0.50 0.008 240)",
            letterSpacing: "0.04em",
            fontSize: "0.7rem",
          }}
        >
          {postedAtLabel} {post.date}
        </time>

        <div className="flex items-start gap-1.5 md:gap-2 mb-3">
          <span
            className="text-xs mt-1 shrink-0 transition-opacity duration-200"
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              color: "oklch(0.73 0.17 65)",
              opacity: hovered ? 1 : 0,
            }}
          >
            &gt;
          </span>
          <h2
            className="text-base md:text-[1.15rem] font-semibold transition-colors duration-200"
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              color: hovered ? "oklch(0.73 0.17 65)" : "oklch(0.88 0.005 240)",
              lineHeight: 1.45,
              letterSpacing: "-0.01em",
            }}
          >
            {post.title}
          </h2>
        </div>

        <div className="flex flex-wrap gap-2">
          {post.tags.map((tag) => (
            <span key={tag} className="tag-badge">
              {tag}
            </span>
          ))}
        </div>
      </a>
    </article>
  );
}

export default function BlogList() {
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const lang = useStore($lang);

  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      const matchesTag = activeTag ? post.tags.includes(activeTag) : true;
      const matchesSearch = searchQuery
        ? post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          post.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
        : true;
      return matchesTag && matchesSearch;
    });
  }, [activeTag, searchQuery]);

  return (
    <>
      {/* Top bar - Desktop only */}
      <div
        className="sticky top-0 z-20 px-12 py-4 items-center justify-between hidden md:flex"
        style={{
          background: "oklch(0.09 0.005 240 / 0.92)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid oklch(0.20 0.006 240)",
        }}
      >
        <div className="flex items-center gap-3">
          <span
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              color: "oklch(0.73 0.17 65)",
              fontSize: "0.8rem",
            }}
          >
            {t("blogPath", lang)}
          </span>
          <span
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              color: "oklch(0.40 0.006 240)",
              fontSize: "0.75rem",
            }}
          >
            {filteredPosts.length} {t("posts", lang)}
          </span>
        </div>

        <div className="relative">
          <input
            type="text"
            placeholder={t("search", lang)}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="text-xs px-3 py-1.5 outline-none transition-all duration-200"
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              background: "oklch(0.14 0.006 240)",
              border: "1px solid oklch(0.22 0.006 240)",
              borderRadius: "2px",
              color: "oklch(0.80 0.005 240)",
              width: "clamp(120px, 100%, 180px)",
            }}
            onFocus={(e) => {
              (e.target as HTMLInputElement).style.borderColor = "oklch(0.73 0.17 65)";
            }}
            onBlur={(e) => {
              (e.target as HTMLInputElement).style.borderColor = "oklch(0.22 0.006 240)";
            }}
          />
        </div>
      </div>

      <div className="px-4 md:px-12 py-8 md:py-10">
        {/* Tag filter */}
        <div className="flex flex-wrap gap-1.5 md:gap-2 mb-6 md:mb-8 animate-fade-in-up">
          <button
            onClick={() => setActiveTag(null)}
            className="tag-badge text-xs transition-all duration-200"
            style={{
              borderColor: activeTag === null ? "oklch(0.73 0.17 65)" : undefined,
              color: activeTag === null ? "oklch(0.73 0.17 65)" : undefined,
              background: activeTag === null ? "oklch(0.73 0.17 65 / 0.08)" : undefined,
            }}
          >
            {t("all", lang)}
          </button>
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setActiveTag(tag === activeTag ? null : tag)}
              className="tag-badge text-xs transition-all duration-200"
              style={{
                borderColor: activeTag === tag ? "oklch(0.73 0.17 65)" : undefined,
                color: activeTag === tag ? "oklch(0.73 0.17 65)" : undefined,
                background: activeTag === tag ? "oklch(0.73 0.17 65 / 0.08)" : undefined,
              }}
            >
              {tag}
            </button>
          ))}
        </div>

        {/* Post list */}
        <div>
          {filteredPosts.length > 0 ? (
            filteredPosts.map((post, i) => (
              <PostItem key={post.id} post={post} index={i} postedAtLabel={t("postedAt", lang)} />
            ))
          ) : (
            <div
              className="py-20 text-center animate-fade-in-up"
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                color: "oklch(0.40 0.006 240)",
                fontSize: "0.85rem",
              }}
            >
              <span style={{ color: "oklch(0.73 0.17 65)" }}>// </span>
              {t("noPostsFound", lang)}
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="pt-12 pb-8 animate-fade-in-up" style={{ animationDelay: "0.8s" }}>
          <div
            className="mb-6"
            style={{ borderTop: "1px solid oklch(0.18 0.006 240)" }}
          />
          <div className="flex items-center justify-between">
            <p
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                color: "oklch(0.32 0.006 240)",
                fontSize: "0.7rem",
              }}
            >
              {t("copyright", lang)}
            </p>
            <p
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                color: "oklch(0.28 0.006 240)",
                fontSize: "0.65rem",
              }}
            >
              {t("footerRole", lang)}
            </p>
          </div>
        </footer>
      </div>
    </>
  );
}

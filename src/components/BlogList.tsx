import { useState } from "react";
import { useStore } from "@nanostores/react";
import { $lang, t } from "../lib/i18n";
import { withBase } from "../lib/path";
import type { Post } from "../lib/blog-data";
import { posts } from "../lib/blog-data";

function PostItem({
  post,
  index,
  postedAtLabel,
}: {
  post: Post;
  index: number;
  postedAtLabel: string;
}) {
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
      <a href={withBase(`/blog/${post.id}`)} className="block">
        <time
          className="text-xs mb-2 block"
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            color: "oklch(0.60 0.008 240)",
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
            <span key={tag} className="tag-badge pointer-events-none">
              {tag}
            </span>
          ))}
        </div>
      </a>
    </article>
  );
}

export default function BlogList() {
  const lang = useStore($lang);

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
            {posts.length} {t("posts", lang)}
          </span>
        </div>
      </div>

      <div className="px-4 md:px-32 py-8 md:py-10">
        {/* Post list */}
        <div>
          {posts.map((post, i) => (
            <PostItem key={post.id} post={post} index={i} postedAtLabel={t("postedAt", lang)} />
          ))}
        </div>

        {/* Footer */}
        <footer className="pt-12 pb-8 animate-fade-in-up" style={{ animationDelay: "0.8s" }}>
          <div className="mb-6" style={{ borderTop: "1px solid oklch(0.18 0.006 240)" }} />
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

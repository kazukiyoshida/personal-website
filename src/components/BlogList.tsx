import { useState } from "react";
import { useStore } from "@nanostores/react";
import { $lang, t } from "../lib/i18n";
import { withBase } from "../lib/path";
import type { Post } from "../lib/blog-data";
import { posts } from "../lib/blog-data";

function TwitterIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.747l7.73-8.835L1.254 2.25H8.08l4.259 5.63zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function GitHubIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
  );
}

const socialLinks = [
  { icon: <TwitterIcon />, href: "https://twitter.com/", label: "Twitter" },
  { icon: <GitHubIcon />, href: "https://github.com/", label: "GitHub" },
  {
    icon: <InstagramIcon />,
    href: "https://instagram.com/",
    label: "Instagram",
  },
];

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
        {/* Profile intro */}
        <div
          className="flex items-start gap-6 md:gap-8 py-7 md:py-10 animate-fade-in-up"
          style={{
            borderTop: "2px solid oklch(0.73 0.17 65)",
            borderBottom: "2px solid oklch(0.73 0.17 65)",
          }}
        >
          <img
            src={withBase("/images/selfie-icon.jpg")}
            alt="kazuki yoshida"
            className="w-20 h-20 md:w-28 md:h-28 rounded-full shrink-0"
            style={{
              border: "2px solid oklch(0.30 0.01 240)",
              objectFit: "cover",
              objectPosition: "center 20%",
            }}
          />
          <div className="min-w-0">
            <h2
              className="text-lg md:text-2xl font-bold mb-2 md:mb-3"
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                color: "oklch(0.90 0.005 240)",
              }}
            >
              Hi, I'm Kazuki — I build tools, systems, and ideas.
            </h2>
            <p
              className="text-sm md:text-base mb-4 leading-relaxed"
              style={{
                fontFamily: "'IBM Plex Sans JP', sans-serif",
                color: "oklch(0.88 0.005 240)",
              }}
            >
              {t("bio", lang)}
            </p>
            <div className="flex gap-3">
              {socialLinks.map(({ icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="transition-opacity duration-200 hover:opacity-70"
                  style={{ color: "oklch(0.88 0.005 240)" }}
                >
                  {icon}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Post list */}
        <div className="mt-8">
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

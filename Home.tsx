/* =============================================================
   PAGE: Home (Blog List)
   Design: Terminal Noir — dark terminal aesthetic
   Layout: Fixed left sidebar (280px) + scrollable right content
   ============================================================= */

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import Sidebar from "@/components/Sidebar";
import PostItem from "@/components/PostItem";
import { posts } from "@/lib/blog-data";

// All unique tags
const allTags = Array.from(new Set(posts.flatMap((p) => p.tags))).sort();

export default function Home() {
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      const matchesTag = activeTag ? post.tags.includes(activeTag) : true;
      const matchesSearch = searchQuery
        ? post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          post.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()))
        : true;
      return matchesTag && matchesSearch;
    });
  }, [activeTag, searchQuery]);

  return (
    <div className="min-h-screen" style={{ background: "oklch(0.09 0.005 240)" }}>
      {/* Main content area */}
      <main
        className="min-h-screen md:ml-[280px]"
      >
        {/* Top bar - Desktop only */}
        <div
          className="sticky top-0 z-20 px-12 py-4 flex items-center justify-between hidden md:flex"
          style={{
            background: "oklch(0.09 0.005 240 / 0.92)",
            backdropFilter: "blur(12px)",
            borderBottom: "1px solid oklch(0.20 0.006 240)",
          }}
        >
          {/* Terminal prompt prefix */}
          <div className="flex items-center gap-3">
            <span
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                color: "oklch(0.73 0.17 65)",
                fontSize: "0.8rem",
              }}
            >
              ~/blog
            </span>
            <span
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                color: "oklch(0.40 0.006 240)",
                fontSize: "0.75rem",
              }}
            >
              {filteredPosts.length} posts
            </span>
          </div>

          {/* Search */}
          <div className="relative">
            <input
              type="text"
              placeholder="search..."
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
          <motion.div
            className="flex flex-wrap gap-1.5 md:gap-2 mb-6 md:mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <button
              onClick={() => setActiveTag(null)}
              className="tag-badge text-xs transition-all duration-200"
              style={{
                borderColor: activeTag === null ? "oklch(0.73 0.17 65)" : undefined,
                color: activeTag === null ? "oklch(0.73 0.17 65)" : undefined,
                background: activeTag === null ? "oklch(0.73 0.17 65 / 0.08)" : undefined,
              }}
            >
              all
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
          </motion.div>

          {/* Post list */}
          <div>
            {filteredPosts.length > 0 ? (
              filteredPosts.map((post, i) => (
                <PostItem key={post.id} post={post} index={i} />
              ))
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="py-20 text-center"
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  color: "oklch(0.40 0.006 240)",
                  fontSize: "0.85rem",
                }}
              >
                <span style={{ color: "oklch(0.73 0.17 65)" }}>// </span>
                no posts found
              </motion.div>
            )}
          </div>

          {/* Footer */}
          <motion.footer
            className="pt-12 pb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.8 }}
          >
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
                © 2024 kazuki yoshida
              </p>
              <p
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  color: "oklch(0.28 0.006 240)",
                  fontSize: "0.65rem",
                }}
              >
                ML Infra Engineer, 東京
              </p>
            </div>
          </motion.footer>
        </div>
      </main>
    </div>
  );
}

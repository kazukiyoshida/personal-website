/* =============================================================
   COMPONENT: PostItem
   Design: Terminal Noir — article list item with amber hover
   Features: Title, date, tags, staggered animation
   ============================================================= */

import { useState } from "react";
import { motion } from "framer-motion";
import type { Post } from "@/lib/blog-data";

interface PostItemProps {
  post: Post;
  index: number;
}

export default function PostItem({ post, index }: PostItemProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: index * 0.06, ease: "easeOut" }}
      className="py-7 border-b"
      style={{ borderColor: "oklch(0.20 0.006 240)" }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <a href="#" className="block">
        {/* Date */}
        <time
          className="text-xs mb-2 block"
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            color: "oklch(0.50 0.008 240)",
            letterSpacing: "0.04em",
            fontSize: "0.7rem",
          }}
        >
          posted at {post.date}
        </time>

        {/* Title */}
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

        {/* Tags */}
        <div className="flex flex-wrap gap-2">
          {post.tags.map((tag) => (
            <span key={tag} className="tag-badge">
              {tag}
            </span>
          ))}
        </div>
      </a>
    </motion.article>
  );
}

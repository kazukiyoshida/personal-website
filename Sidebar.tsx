/* =============================================================
   COMPONENT: Sidebar
   Design: Terminal Noir — fixed left sidebar with mountain bg
   Features: Profile, name, SNS links, navigation, bio
   ============================================================= */

import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";

const SIDEBAR_BG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663488484081/9oa9GgjXAD7zGT9rQ3fZPH/sidebar-bg-eUK4qefCC5CpBinLhsaZoR.webp";

// Social icons as SVG components
function TwitterIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.747l7.73-8.835L1.254 2.25H8.08l4.259 5.63zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
    </svg>
  );
}

function GitHubIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
    </svg>
  );
}

export default function Sidebar() {
  const [location] = useLocation();

  return (
    <aside
      className="fixed left-0 top-0 h-screen w-[280px] flex flex-col justify-end overflow-hidden z-10"
      style={{
        backgroundImage: `url(${SIDEBAR_BG})`,
        backgroundSize: "cover",
        backgroundPosition: "center top",
      }}
    >
      {/* Dark overlay gradient */}
      <div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(to bottom, rgba(10,10,10,0.15) 0%, rgba(10,10,10,0.55) 45%, rgba(10,10,10,0.92) 75%, rgba(10,10,10,0.98) 100%)",
        }}
      />

      {/* Content */}
      <motion.div
        className="relative z-10 p-8 pb-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        {/* Name */}
        <div className="mb-4">
          <h1
            className="text-[2.6rem] font-bold leading-[1.05] tracking-tight"
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              color: "#F0F0F0",
            }}
          >
            kazuki
            <br />
            yoshida
          </h1>
        </div>

        {/* Social Links */}
        <div className="flex gap-3 mb-5">
          {[
            { icon: <TwitterIcon />, href: "https://twitter.com/", label: "Twitter" },
            { icon: <GitHubIcon />, href: "https://github.com/", label: "GitHub" },
            { icon: <InstagramIcon />, href: "https://instagram.com/", label: "Instagram" },
          ].map(({ icon, href, label }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={label}
              className="transition-all duration-200"
              style={{ color: "rgba(240,240,240,0.7)" }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.color = "#F5A623";
                (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.color = "rgba(240,240,240,0.7)";
                (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
              }}
            >
              {icon}
            </a>
          ))}
        </div>

        {/* Bio */}
        <p
          className="text-xs leading-relaxed mb-6"
          style={{
            fontFamily: "'IBM Plex Sans JP', sans-serif",
            color: "rgba(200,200,200,0.75)",
          }}
        >
          ML Infra Engineer, 東京
          <br />
          Webエンジニアの記録です。
          <br />
          <span style={{ color: "rgba(245,166,35,0.8)" }}>
            #Rust #Go #Python #Vue #Vim
          </span>
        </p>

        {/* Navigation */}
        <nav className="flex gap-3 mb-5">
          {[
            { label: "about", path: "/about" },
            { label: "blog", path: "/" },
          ].map(({ label, path }) => {
            const isActive = location === path || (path === "/" && location === "/");
            return (
              <Link key={label} href={path}>
                <span
                  className="text-xs px-4 py-1.5 border transition-all duration-200 block"
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    borderColor: isActive ? "#F5A623" : "rgba(200,200,200,0.3)",
                    color: isActive ? "#F5A623" : "rgba(200,200,200,0.7)",
                    background: isActive ? "rgba(245,166,35,0.08)" : "transparent",
                    borderRadius: "2px",
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      (e.currentTarget as HTMLElement).style.borderColor = "rgba(245,166,35,0.6)";
                      (e.currentTarget as HTMLElement).style.color = "rgba(245,166,35,0.8)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      (e.currentTarget as HTMLElement).style.borderColor = "rgba(200,200,200,0.3)";
                      (e.currentTarget as HTMLElement).style.color = "rgba(200,200,200,0.7)";
                    }
                  }}
                >
                  {label}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* Language toggle */}
        <button
          className="text-xs transition-colors duration-200"
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            color: "rgba(200,200,200,0.5)",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.color = "rgba(245,166,35,0.7)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.color = "rgba(200,200,200,0.5)";
          }}
        >
          &gt; English
        </button>
      </motion.div>
    </aside>
  );
}

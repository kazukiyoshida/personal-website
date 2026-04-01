import { useState, useEffect, useRef } from "react";
import { useStore } from "@nanostores/react";
import { $lang, t } from "../lib/i18n";
import { $theme } from "../lib/theme";
import { withBase } from "../lib/path";
import LanguageSwitcher from "./LanguageSwitcher";
import ThemeSwitcher from "./ThemeSwitcher";

const SIDEBAR_BG_DARK = withBase("/images/sidebar-bg.webp");
const SIDEBAR_BG_LIGHT = withBase("/images/sidebar-bg-light-wo-clouds.webp");
const CLOUDS_OVERLAY = withBase("/images/clouds-overlay.webp");

function TwitterIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.747l7.73-8.835L1.254 2.25H8.08l4.259 5.63zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function GitHubIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

const socialLinks = [
  { icon: <TwitterIcon />, href: "https://x.com/_kazukiyoshida_", label: "X" },
  { icon: <GitHubIcon />, href: "https://github.com/kazukiyoshida", label: "GitHub" },
  {
    icon: <LinkedInIcon />,
    href: "https://www.linkedin.com/in/kazukiyoshida0602/",
    label: "LinkedIn",
  },
];

interface SidebarProps {
  currentPath: string;
}

export default function Sidebar({ currentPath: initialPath }: SidebarProps) {
  const [currentPath, setCurrentPath] = useState(initialPath);
  const lang = useStore($lang);
  const theme = useStore($theme);
  const isDark = theme === "dark";
  const bio = t("bio", lang);
  const cloudsDelay = useRef(`${-(Date.now() % 60000)}ms`);

  useEffect(() => {
    const updatePath = () => setCurrentPath(window.location.pathname);
    document.addEventListener("astro:after-swap", updatePath);
    return () => document.removeEventListener("astro:after-swap", updatePath);
  }, []);

  const navItems = [
    { label: t("navAbout", lang), path: withBase("/about") },
    { label: t("navBlog", lang), path: withBase("/") },
  ];

  return (
    <aside
      className="fixed left-0 top-0 h-screen flex flex-col justify-end overflow-hidden z-10"
      style={{
        width: "var(--sidebar-width)",
        backgroundImage: `url(${isDark ? SIDEBAR_BG_DARK : SIDEBAR_BG_LIGHT})`,
        backgroundSize: "cover",
        backgroundPosition: isDark ? "center top" : "center 30%",
      }}
    >
      {/* Animated cloud overlay for light mode */}
      {!isDark && (
        <img
          src={CLOUDS_OVERLAY}
          alt=""
          className="sidebar-clouds-overlay"
          style={{ animationDelay: cloudsDelay.current }}
        />
      )}

      {/* Overlay gradient */}
      <div
        className="absolute inset-0"
        style={{
          background: isDark
            ? "linear-gradient(to bottom, rgba(10,10,10,0.15) 0%, rgba(10,10,10,0.55) 45%, rgba(10,10,10,0.92) 75%, rgba(10,10,10,0.98) 100%)"
            : "linear-gradient(to bottom, rgba(10,10,10,0.0) 0%, rgba(10,10,10,0.2) 45%, rgba(10,10,10,0.65) 75%, rgba(10,10,10,0.85) 100%)",
        }}
      />

      {/* Content */}
      <div className="relative z-10 px-12 pb-12 pt-8">
        {/* Name */}
        <div className="mb-4">
          <a
            href={withBase("/")}
            className="block hover:opacity-90 transition-opacity duration-200"
          >
            <h1
              className="text-[3.6rem] font-bold leading-[1.05] tracking-tight"
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                color: "#F0F0F0",
              }}
            >
              kazuki
              <br />
              yoshida
            </h1>
          </a>
        </div>

        {/* Social Links */}
        <div className="flex gap-3 mb-5">
          {socialLinks.map(({ icon, href, label }) => (
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

        {/* Bio */}
        <p
          className="text-sm leading-relaxed mb-5"
          style={{
            fontFamily: "'IBM Plex Sans JP', sans-serif",
            color: "rgba(200,200,200,0.75)",
          }}
        >
          {bio.split("\n").map((line, i) => (
            <span key={i}>
              {i > 0 && <br />}
              {line}
            </span>
          ))}
          <br />
          <span style={{ color: "rgba(245,166,35,0.8)" }}>#Rust #Go #Python #Vue #Vim</span>
        </p>

        {/* Navigation */}
        <nav className="flex gap-3 mb-5">
          {navItems.map(({ label, path }) => {
            const isActive = currentPath.replace(/\/$/, "") === path.replace(/\/$/, "");
            return (
              <a
                key={path}
                href={path}
                className={`nav-btn text-sm px-5 py-2 border block${isActive ? " nav-active" : ""}`}
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  borderColor: isActive ? "#F5A623" : "rgba(200,200,200,0.3)",
                  color: isActive ? "#F5A623" : "rgba(200,200,200,0.7)",
                  background: isActive ? "rgba(245,166,35,0.08)" : "transparent",
                  borderRadius: "2px",
                }}
              >
                {label}
              </a>
            );
          })}
        </nav>

        {/* Language Switcher & Theme Switcher */}
        <div className="flex items-center gap-3">
          <LanguageSwitcher />
          <ThemeSwitcher />
        </div>
      </div>
    </aside>
  );
}

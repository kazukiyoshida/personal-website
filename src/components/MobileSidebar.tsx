import { useState, useEffect } from "react";
import { useStore } from "@nanostores/react";
import { $lang, t } from "../lib/i18n";
import { $theme } from "../lib/theme";
import { withBase } from "../lib/path";
import LanguageSwitcher from "./LanguageSwitcher";
import ThemeSwitcher from "./ThemeSwitcher";

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

function LinkedInIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
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

interface MobileSidebarProps {
  currentPath: string;
}

export default function MobileSidebar({ currentPath: initialPath }: MobileSidebarProps) {
  const [currentPath, setCurrentPath] = useState(initialPath);
  const [isOpen, setIsOpen] = useState(false);
  const lang = useStore($lang);
  const theme = useStore($theme);
  const isDark = theme === "dark";
  const bio = t("bio", lang);

  useEffect(() => {
    const updatePath = () => {
      setCurrentPath(window.location.pathname);
      setIsOpen(false);
    };
    document.addEventListener("astro:after-swap", updatePath);
    return () => document.removeEventListener("astro:after-swap", updatePath);
  }, []);

  const navItems = [
    { label: t("navAbout", lang), path: withBase("/about") },
    { label: t("navBlog", lang), path: withBase("/") },
  ];

  return (
    <>
      {/* Mobile Header */}
      <header
        className="fixed top-0 left-0 right-0 z-50 md:hidden"
        style={{
          background: isDark ? "oklch(0.09 0.005 240 / 0.95)" : "oklch(0.97 0.003 240 / 0.95)",
          backdropFilter: "blur(12px)",
          borderBottom: `1px solid ${isDark ? "oklch(0.20 0.006 240)" : "oklch(0.85 0.004 240)"}`,
        }}
      >
        <div className="flex items-center justify-between px-4 py-3">
          <a
            href={withBase("/")}
            className="block hover:opacity-90 transition-opacity duration-200"
          >
            <h1
              className="text-lg font-bold leading-tight"
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                color: isDark ? "#F0F0F0" : "#1a1a1a",
                letterSpacing: "-0.01em",
              }}
            >
              kazuki
              <br />
              yoshida
            </h1>
          </a>

          <div className="flex items-center gap-2">
            <ThemeSwitcher size="sm" variant={isDark ? "dark" : "auto"} />
            <LanguageSwitcher size="sm" variant={isDark ? "dark" : "auto"} />
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 transition-colors duration-200"
              style={{ color: "oklch(0.73 0.17 65)" }}
              aria-label="Toggle menu"
            >
              {isOpen ? (
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              ) : (
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <nav
            className="border-t"
            style={{
              borderColor: isDark ? "oklch(0.20 0.006 240)" : "oklch(0.85 0.004 240)",
            }}
          >
            <div className="px-4 py-4 space-y-3">
              {/* Profile Info */}
              <div
                className="pb-3"
                style={{
                  borderBottom: `1px solid ${isDark ? "oklch(0.18 0.006 240)" : "oklch(0.85 0.004 240)"}`,
                }}
              >
                <p
                  className="text-xs"
                  style={{
                    fontFamily: "'IBM Plex Sans JP', sans-serif",
                    color: isDark ? "rgba(200,200,200,0.75)" : "rgba(60,60,60,0.85)",
                    lineHeight: 1.6,
                  }}
                >
                  {bio.split("\n").map((line, i) => (
                    <span key={i}>
                      {i > 0 && <br />}
                      {line}
                    </span>
                  ))}
                  <br />
                  <span style={{ color: isDark ? "rgba(245,166,35,0.8)" : "rgba(180,120,20,0.9)" }}>
                    #Rust #Go #Python #Vue #Vim
                  </span>
                </p>
              </div>

              {/* Navigation Links */}
              <div className="space-y-2">
                {navItems.map(({ label, path }) => {
                  const isActive = currentPath.replace(/\/$/, "") === path.replace(/\/$/, "");
                  return (
                    <a
                      key={path}
                      href={path}
                      className="block text-xs px-3 py-2 border transition-all duration-200"
                      style={{
                        fontFamily: "'JetBrains Mono', monospace",
                        borderColor: isActive
                          ? isDark
                            ? "oklch(0.73 0.17 65)"
                            : "oklch(0.55 0.17 65)"
                          : isDark
                            ? "rgba(200,200,200,0.3)"
                            : "rgba(60,60,60,0.3)",
                        color: isActive
                          ? isDark
                            ? "oklch(0.73 0.17 65)"
                            : "oklch(0.55 0.17 65)"
                          : isDark
                            ? "rgba(200,200,200,0.7)"
                            : "rgba(60,60,60,0.7)",
                        background: isActive
                          ? isDark
                            ? "rgba(245,166,35,0.08)"
                            : "rgba(180,120,20,0.08)"
                          : "transparent",
                        borderRadius: "2px",
                      }}
                      onClick={() => setIsOpen(false)}
                    >
                      {label}
                    </a>
                  );
                })}
              </div>

              {/* Social Links */}
              <div
                className="flex gap-3 pt-2"
                style={{
                  borderTop: `1px solid ${isDark ? "oklch(0.18 0.006 240)" : "oklch(0.85 0.004 240)"}`,
                }}
              >
                {socialLinks.map(({ icon, href, label }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="transition-all duration-200"
                    style={{ color: isDark ? "rgba(240,240,240,0.7)" : "rgba(60,60,60,0.7)" }}
                  >
                    {icon}
                  </a>
                ))}
              </div>
            </div>
          </nav>
        )}
      </header>

      {/* Backdrop overlay to close menu */}
      {isOpen && <div className="fixed inset-0 z-40 md:hidden" onClick={() => setIsOpen(false)} />}

      {/* Spacer for mobile header */}
      <div className="h-16 md:hidden" />
    </>
  );
}

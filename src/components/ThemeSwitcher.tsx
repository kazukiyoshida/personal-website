import { useStore } from "@nanostores/react";
import { $theme, toggleTheme } from "../lib/theme";

interface Props {
  size?: "sm" | "md";
  variant?: "dark" | "auto";
}

export default function ThemeSwitcher({ size = "md", variant = "dark" }: Props) {
  const theme = useStore($theme);
  const isDark = theme === "dark";

  const iconSize = size === "sm" ? 14 : 18;
  const padding = size === "sm" ? "p-1.5" : "p-2";
  const iconColor = variant === "dark" || isDark ? "oklch(0.73 0.17 65)" : "oklch(0.45 0.008 240)";

  return (
    <button
      onClick={toggleTheme}
      className={`${padding} transition-all duration-200`}
      style={{
        color: iconColor,
        opacity: 0.8,
      }}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      {isDark ? (
        <svg
          width={iconSize}
          height={iconSize}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="5" />
          <line x1="12" y1="1" x2="12" y2="3" />
          <line x1="12" y1="21" x2="12" y2="23" />
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
          <line x1="1" y1="12" x2="3" y2="12" />
          <line x1="21" y1="12" x2="23" y2="12" />
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
        </svg>
      ) : (
        <svg
          width={iconSize}
          height={iconSize}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      )}
    </button>
  );
}

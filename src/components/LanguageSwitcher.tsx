import { useStore } from "@nanostores/react";
import { $lang, setLang, type Lang } from "../lib/i18n";

const languages: { code: Lang; label: string }[] = [
  { code: "ja", label: "JA" },
  { code: "en", label: "EN" },
  { code: "zh", label: "ZH" },
];

interface Props {
  size?: "sm" | "md";
  variant?: "dark" | "auto";
}

export default function LanguageSwitcher({ size = "md", variant = "dark" }: Props) {
  const lang = useStore($lang);

  const padding = size === "sm" ? "px-2 py-0.5" : "px-3 py-1.5";
  const fontSize = size === "sm" ? "text-[0.6rem]" : "text-xs";

  const borderColor = variant === "dark" ? "oklch(0.25 0.008 240)" : "var(--content-border)";
  const activeColor = variant === "dark" ? "oklch(0.73 0.17 65)" : "var(--amber)";
  const inactiveColor = variant === "dark" ? "oklch(0.45 0.006 240)" : "var(--content-text-faint)";

  return (
    <div
      className="inline-flex border"
      style={{
        borderColor,
        borderRadius: "3px",
        overflow: "hidden",
      }}
    >
      {languages.map(({ code, label }, i) => {
        const isActive = lang === code;
        return (
          <button
            key={code}
            onClick={() => setLang(code)}
            className={`${padding} ${fontSize} transition-all duration-200 relative`}
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontWeight: 500,
              letterSpacing: "0.05em",
              color: isActive ? activeColor : inactiveColor,
              background: isActive ? `${activeColor}1a` : "transparent",
              borderRight: i < languages.length - 1 ? `1px solid ${borderColor}` : "none",
            }}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}

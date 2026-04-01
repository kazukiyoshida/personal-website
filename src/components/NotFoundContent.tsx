import { useStore } from "@nanostores/react";
import { $lang, t } from "../lib/i18n";
import { withBase } from "../lib/path";

export default function NotFoundContent() {
  const lang = useStore($lang);

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ background: "var(--background)", marginLeft: "var(--sidebar-width)" }}
    >
      <div className="text-center">
        <h1
          className="text-6xl font-bold mb-4"
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            color: "var(--amber)",
          }}
        >
          404
        </h1>
        <p
          className="text-sm mb-6"
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            color: "var(--content-text-muted)",
          }}
        >
          {t("pageNotFound", lang)}
        </p>
        <a
          href={withBase("/")}
          className="text-xs px-4 py-2 border transition-all duration-200 inline-block"
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            borderColor: "var(--amber)",
            color: "var(--amber)",
            borderRadius: "2px",
          }}
        >
          {t("goHome", lang)}
        </a>
      </div>
    </div>
  );
}

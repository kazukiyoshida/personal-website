import { Link } from "wouter";

export default function NotFound() {
  return (
    <div
      className="min-h-screen flex items-center justify-center md:ml-[280px]"
      style={{ background: "oklch(0.09 0.005 240)" }}
    >
      <div className="text-center">
        <h1
          className="text-6xl font-bold mb-4"
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            color: "oklch(0.73 0.17 65)",
          }}
        >
          404
        </h1>
        <p
          className="text-sm mb-6"
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            color: "oklch(0.55 0.008 240)",
          }}
        >
          // page not found
        </p>
        <Link href="/">
          <span
            className="text-xs px-4 py-2 border transition-all duration-200"
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              borderColor: "oklch(0.73 0.17 65)",
              color: "oklch(0.73 0.17 65)",
              borderRadius: "2px",
            }}
          >
            &gt; go home
          </span>
        </Link>
      </div>
    </div>
  );
}

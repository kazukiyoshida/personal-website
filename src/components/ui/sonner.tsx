import { Toaster as SonnerToaster } from "sonner";

export function Toaster() {
  return (
    <SonnerToaster
      theme="dark"
      toastOptions={{
        style: {
          background: "#1A1A1A",
          color: "#E8E8E8",
          border: "1px solid #2A2A2A",
          fontFamily: "'JetBrains Mono', monospace",
        },
      }}
    />
  );
}

import { atom } from "nanostores";

export type Theme = "light" | "dark";

const STORAGE_KEY = "theme";

function detectSystemTheme(): Theme {
  if (typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: light)").matches) {
    return "light";
  }
  return "dark";
}

function getInitialTheme(): Theme {
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "light" || stored === "dark") return stored;
    return detectSystemTheme();
  }
  return "dark";
}

export const $theme = atom<Theme>(getInitialTheme());

export function setTheme(theme: Theme) {
  $theme.set(theme);
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, theme);
    document.documentElement.classList.toggle("dark", theme === "dark");
  }
}

export function toggleTheme() {
  setTheme($theme.get() === "dark" ? "light" : "dark");
}

/** Strip trailing slash from BASE_URL and prefix the given path */
const base = import.meta.env.BASE_URL.replace(/\/$/, "");

export function withBase(path: string): string {
  return `${base}${path}`;
}

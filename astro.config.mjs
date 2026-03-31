import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import tailwind from "@astrojs/tailwind";
import { remarkBasePath } from "./src/lib/remark-base-path.mjs";

export default defineConfig({
  site: "https://kazukiyoshida.github.io",
  base: "/personal-website",
  integrations: [react(), tailwind()],
  markdown: {
    remarkPlugins: [remarkBasePath],
    shikiConfig: {
      theme: "github-dark",
    },
  },
});

import { visit } from "unist-util-visit";

const base = "/personal-website";

export function remarkBasePath() {
  return (tree) => {
    visit(tree, (node) => {
      // Markdown images: ![alt](/images/...)
      if (node.type === "image" && node.url?.startsWith("/")) {
        node.url = base + node.url;
      }
      // HTML in markdown: <img src="/images/...">
      if (node.type === "html" && typeof node.value === "string") {
        node.value = node.value.replace(/(<img\s[^>]*\bsrc=")\/([^"]*")/g, `$1${base}/$2`);
      }
    });
  };
}

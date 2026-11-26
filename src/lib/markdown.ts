import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeRaw from "rehype-raw";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypePrettyCode from "rehype-pretty-code";
import rehypeStringify from "rehype-stringify";
import { visit } from "unist-util-visit";

/** Open external links in a new tab, keep in-page links alone. */
function rehypeExternalLinks() {
  return (tree: unknown) => {
    visit(tree as never, "element", (node: { tagName?: string; properties?: Record<string, unknown> }) => {
      if (node.tagName !== "a") return;
      const href = node.properties?.href;
      if (typeof href === "string" && /^https?:\/\//.test(href) && !href.includes("wilfoo.com")) {
        node.properties = {
          ...node.properties,
          target: "_blank",
          rel: ["noopener", "noreferrer"],
        };
      }
    });
  };
}

const processor = unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkRehype, { allowDangerousHtml: true })
  .use(rehypeRaw)
  .use(rehypeSlug)
  .use(rehypeExternalLinks)
  .use(rehypeAutolinkHeadings, {
    behavior: "append",
    properties: {
      className: ["heading-anchor"],
      ariaHidden: "true",
      tabIndex: -1,
    },
    content: {
      type: "element",
      tagName: "span",
      properties: {},
      children: [{ type: "text", value: "§" }],
    },
  })
  .use(rehypePrettyCode, {
    theme: "github-dark-default",
    keepBackground: false,
    defaultLang: "plaintext",
    bypassInlineCode: true,
  })
  .use(rehypeStringify, { allowDangerousHtml: true });

export async function renderMarkdown(markdown: string) {
  const file = await processor.process(markdown);
  return String(file);
}

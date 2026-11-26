import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import GithubSlugger from "github-slugger";
import { renderMarkdown } from "@/lib/markdown";
import { yearOf } from "@/lib/utils";

export type Heading = { id: string; text: string; level: number };

export type PostSummary = {
  slug: string;
  title: string;
  date: string;
  summary: string;
  tags: string[];
  readingTime: number;
  draft: boolean;
  background?: string;
  showToc: boolean;
  tocOpen: boolean;
};

export type Post = PostSummary & {
  content: string;
  html: string;
  headings: Heading[];
  words: number;
};

const CONTENT_DIR = path.join(process.cwd(), "content");
const POSTS_DIR = path.join(CONTENT_DIR, "posts");

function stripInlineMarkdown(input: string) {
  return input
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/[*_~]{1,3}([^*_~]+)[*_~]{1,3}/g, "$1")
    .replace(/<[^>]+>/g, "")
    .trim();
}

function normalizeDate(value: unknown): string {
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "string") {
    const d = new Date(value);
    if (!Number.isNaN(d.getTime())) return d.toISOString();
  }
  return new Date().toISOString();
}

/** Count CJK characters as 1 "unit" each, latin words as 1 unit each. */
function countWords(markdown: string) {
  const plain = markdown
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`[^`]*`/g, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/[#>*_|-]/g, " ");
  const cjk = (plain.match(/[\u3400-\u9fff\uf900-\ufaff]/g) ?? []).length;
  const latin = (plain.match(/[A-Za-z0-9][A-Za-z0-9'’\-]*/g) ?? []).length;
  return { cjk, latin, total: cjk + latin };
}

export function readingTimeOf(markdown: string) {
  const { cjk, latin } = countWords(markdown);
  return Math.max(1, Math.round(cjk / 400 + latin / 220));
}

export function plainText(markdown: string) {
  return markdown
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/[*_>~|]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function extractHeadings(markdown: string): Heading[] {
  const slugger = new GithubSlugger();
  const headings: Heading[] = [];
  let inFence = false;

  for (const rawLine of markdown.split("\n")) {
    if (/^\s*(```|~~~)/.test(rawLine)) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;
    const match = /^(#{2,3})\s+(.+?)\s*#*\s*$/.exec(rawLine);
    if (!match) continue;
    const text = stripInlineMarkdown(match[2]);
    headings.push({ id: slugger.slug(text), text, level: match[1].length });
  }
  return headings;
}

function readPostFile(fileName: string): { slug: string; data: Record<string, unknown>; content: string } {
  const slug = fileName.replace(/\.md$/, "");
  const raw = fs.readFileSync(path.join(POSTS_DIR, fileName), "utf8");
  const { data, content } = matter(raw);
  return { slug, data, content };
}

export function getPostSlugs() {
  if (!fs.existsSync(POSTS_DIR)) return [];
  return fs
    .readdirSync(POSTS_DIR)
    .filter((f) => f.endsWith(".md") && !f.startsWith("_"))
    .map((f) => f.replace(/\.md$/, ""));
}

export function getAllPosts(): PostSummary[] {
  return getPostSlugs()
    .map((slug) => {
      const { data, content } = readPostFile(`${slug}.md`);
      const words = countWords(content);
      return {
        slug,
        title: String(data.title ?? slug),
        date: normalizeDate(data.date),
        summary: String(data.summary ?? plainText(content).slice(0, 120)),
        tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
        readingTime: readingTimeOf(content),
        draft: Boolean(data.draft),
        background: data.background ? String(data.background) : undefined,
        showToc: data.ShowToc !== false,
        tocOpen: Boolean(data.TocOpen),
      } satisfies PostSummary;
    })
    .filter((post) => process.env.NODE_ENV === "development" || !post.draft)
    .sort((a, b) => +new Date(b.date) - +new Date(a.date));
}

export function getRawPost(slug: string) {
  if (!getPostSlugs().includes(slug)) return null;
  return readPostFile(`${slug}.md`);
}

export async function getPost(slug: string): Promise<Post | null> {
  const raw = getRawPost(slug);
  if (!raw) return null;
  if (raw.data.draft && process.env.NODE_ENV === "production") return null;

  const words = countWords(raw.content);
  return {
    slug,
    title: String(raw.data.title ?? slug),
    date: normalizeDate(raw.data.date),
    summary: String(raw.data.summary ?? plainText(raw.content).slice(0, 120)),
    tags: Array.isArray(raw.data.tags) ? raw.data.tags.map(String) : [],
    readingTime: readingTimeOf(raw.content),
    draft: Boolean(raw.data.draft),
    background: raw.data.background ? String(raw.data.background) : undefined,
    showToc: raw.data.ShowToc !== false,
    tocOpen: Boolean(raw.data.TocOpen),
    content: raw.content,
    html: await renderMarkdown(raw.content),
    headings: extractHeadings(raw.content),
    words: words.total,
  };
}

export function getAdjacentPosts(slug: string) {
  const posts = getAllPosts();
  const index = posts.findIndex((p) => p.slug === slug);
  return {
    previous: index >= 0 ? posts[index + 1] ?? null : null,
    next: index > 0 ? posts[index - 1] ?? null : null,
  };
}

export function getAllTags() {
  const counts = new Map<string, number>();
  for (const post of getAllPosts()) {
    for (const tag of post.tags) counts.set(tag, (counts.get(tag) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag, "zh-CN"));
}

export function groupPostsByYear(posts: PostSummary[]) {
  const groups = new Map<string, PostSummary[]>();
  for (const post of posts) {
    const year = yearOf(post.date);
    const bucket = groups.get(year) ?? [];
    bucket.push(post);
    groups.set(year, bucket);
  }
  return [...groups.entries()].map(([year, items]) => ({ year, posts: items }));
}

export function getAboutMarkdown() {
  const file = path.join(CONTENT_DIR, "about.md");
  if (!fs.existsSync(file)) return { content: "", title: "关于" };
  const { content, data } = matter(fs.readFileSync(file, "utf8"));
  return { content, title: String(data.title ?? "关于") };
}

export function getSearchItems() {
  return getAllPosts().map((post) => {
    const raw = getRawPost(post.slug);
    return {
      slug: post.slug,
      title: post.title,
      url: `/posts/${post.slug}/`,
      summary: post.summary,
      tags: post.tags,
      date: post.date,
      content: raw ? plainText(raw.content).slice(0, 6000) : post.summary,
    };
  });
}

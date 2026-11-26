import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { getAllPosts, getAllTags } from "@/lib/posts";
import { PageHeader } from "@/components/page-header";
import { Reveal } from "@/components/motion";

export const metadata: Metadata = {
  title: "标签",
  description: "按标签浏览 Wilfred 的文章。",
  alternates: { canonical: "/tags/" },
};

export default function TagsPage() {
  const tags = getAllTags();
  const posts = getAllPosts();

  return (
    <div className="page-shell pt-32 pb-10 md:pt-40">
      <PageHeader
        index="03"
        label="Tags"
        title="标签"
        meta={`${tags.length} 个标签 · ${posts.length} 篇`}
      />

      <div className="mt-14 border-t border-line md:mt-20">
        {tags.map(({ tag, count }, index) => (
          <Reveal key={tag} delay={index * 0.035} y={14}>
            <Link
              href={`/tags/${encodeURIComponent(tag)}/`}
              className="group flex items-baseline gap-5 border-b border-line py-6 md:gap-8 md:py-7"
            >
              <span className="label tabular w-8 shrink-0 text-faint">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className="flex-1 text-[clamp(1.6rem,4vw,2.8rem)] font-medium leading-none tracking-[-0.045em] text-ink transition-transform duration-500 group-hover:translate-x-1.5">
                {tag}
              </span>
              <span className="label tabular hidden text-muted sm:block">
                {count} {count === 1 ? "essay" : "essays"}
              </span>
              <ArrowUpRight
                size={16}
                strokeWidth={1.5}
                className="text-faint transition-all duration-500 group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-accent"
              />
            </Link>
          </Reveal>
        ))}
      </div>

      <Reveal delay={0.1} className="mt-10 flex flex-wrap gap-2">
        {tags.map(({ tag }) => (
          <Link
            key={tag}
            href={`/tags/${encodeURIComponent(tag)}/`}
            className="rounded-full border border-line px-3 py-1 text-[11px] text-muted transition-colors hover:border-line-strong hover:text-ink"
          >
            #{tag}
          </Link>
        ))}
      </Reveal>
    </div>
  );
}

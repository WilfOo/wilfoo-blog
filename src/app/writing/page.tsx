import type { Metadata } from "next";
import { getAllPosts, getAllTags } from "@/lib/posts";
import { PageHeader } from "@/components/page-header";
import { WritingList } from "@/components/writing-list";
import { Reveal } from "@/components/motion";
import Link from "next/link";

export const metadata: Metadata = {
  title: "写作",
  description: "Wilfred 的全部文章，按发布时间倒序排列。",
  alternates: { canonical: "/writing/" },
};

export default function WritingPage() {
  const posts = getAllPosts();
  const tags = getAllTags();

  return (
    <div className="page-shell pt-32 pb-10 md:pt-40">
      <PageHeader
        index="01"
        label="Writing"
        title="写作"
        meta={`${posts.length} 篇 · ${tags.length} 个标签`}
      />

      <Reveal className="mt-14 md:mt-20">
        <WritingList posts={posts} />
      </Reveal>

      <Reveal delay={0.1} className="mt-10 flex flex-wrap gap-x-3 gap-y-2">
        <span className="label pt-1">Tags</span>
        {tags.map(({ tag, count }) => (
          <Link
            key={tag}
            href={`/tags/${encodeURIComponent(tag)}/`}
            className="rounded-full border border-line px-3 py-1 text-[11px] text-muted transition-colors hover:border-line-strong hover:text-ink"
          >
            {tag} <span className="text-faint">{count}</span>
          </Link>
        ))}
      </Reveal>
    </div>
  );
}

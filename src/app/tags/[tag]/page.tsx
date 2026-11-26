import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllPosts, getAllTags } from "@/lib/posts";
import { PageHeader } from "@/components/page-header";
import { WritingList } from "@/components/writing-list";
import { Reveal } from "@/components/motion";

type Params = { tag: string };

export function generateStaticParams() {
  return getAllTags().map(({ tag }) => ({ tag }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { tag: raw } = await params;
  const tag = decodeURIComponent(raw);
  return {
    title: `#${tag}`,
    description: `标签「${tag}」下的全部文章。`,
    alternates: { canonical: `/tags/${raw}/` },
  };
}

export default async function TagPage({ params }: { params: Promise<Params> }) {
  const { tag: raw } = await params;
  const tag = decodeURIComponent(raw);
  const posts = getAllPosts().filter((post) => post.tags.includes(tag));
  if (!posts.length) notFound();

  const related = getAllTags().filter((entry) => entry.tag !== tag).slice(0, 8);

  return (
    <div className="page-shell pt-32 pb-10 md:pt-40">
      <PageHeader
        index="03"
        label="Tag"
        title={`#${tag}`}
        meta={`${posts.length} 篇`}
      />

      <Reveal className="mt-14 md:mt-20">
        <WritingList posts={posts} showPreview={false} />
      </Reveal>

      <div className="mt-10 flex flex-wrap items-center gap-2">
        <span className="label mr-2">Other tags</span>
        {related.map(({ tag: other }) => (
          <Link
            key={other}
            href={`/tags/${encodeURIComponent(other)}/`}
            className="rounded-full border border-line px-3 py-1 text-[11px] text-muted transition-colors hover:border-line-strong hover:text-ink"
          >
            #{other}
          </Link>
        ))}
        <Link href="/tags/" className="label ml-2 hover:text-ink">
          All tags →
        </Link>
      </div>
    </div>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { getAllPosts, groupPostsByYear } from "@/lib/posts";
import { PageHeader } from "@/components/page-header";
import { Reveal } from "@/components/motion";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = {
  title: "归档",
  description: "Wilfred 的全部文章，按年份归档。",
  alternates: { canonical: "/archives/" },
};

export default function ArchivesPage() {
  const posts = getAllPosts();
  const groups = groupPostsByYear(posts);

  return (
    <div className="page-shell pt-32 pb-10 md:pt-40">
      <PageHeader
        index="02"
        label="Archive"
        title="归档"
        meta={`${posts.length} 篇 · ${groups.length} 年`}
      />

      <div className="mt-16 md:mt-24">
        {groups.map((group) => (
          <section key={group.year} className="grid gap-6 border-t border-line py-10 md:grid-cols-12 md:gap-10 md:py-14">
            <div className="md:col-span-2">
              <div className="md:sticky md:top-28">
                <h2 className="tabular text-4xl font-medium tracking-[-0.05em] text-ink md:text-5xl">
                  {group.year}
                </h2>
                <p className="label mt-3">
                  {group.posts.length} {group.posts.length === 1 ? "entry" : "entries"}
                </p>
              </div>
            </div>

            <div className="md:col-span-10">
              {group.posts.map((post, index) => (
                <Reveal key={post.slug} delay={index * 0.04} y={16}>
                  <Link
                    href={`/posts/${post.slug}/`}
                    className="group grid grid-cols-12 items-baseline gap-3 border-b border-line py-5 md:gap-4 md:py-6"
                  >
                    <span className="label tabular col-span-3 text-faint md:col-span-2">
                      {formatDate(post.date).slice(5)}
                    </span>
                    <span className="col-span-8 text-[15px] font-medium leading-snug tracking-[-0.02em] text-ink transition-transform duration-500 group-hover:translate-x-1 md:col-span-7 md:text-[17px]">
                      {post.title}
                    </span>
                    <span className="label col-span-12 md:col-span-2 md:text-right">
                      {post.tags[0]}
                    </span>
                    <span className="col-span-1 flex justify-end">
                      <ArrowUpRight
                        size={13}
                        strokeWidth={1.5}
                        className="text-faint transition-all duration-500 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-ink"
                      />
                    </span>
                  </Link>
                </Reveal>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

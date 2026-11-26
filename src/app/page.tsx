import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getAllPosts, getAllTags } from "@/lib/posts";
import { Hero } from "@/components/hero";
import { Bento } from "@/components/bento";
import { SectionHeading } from "@/components/section-heading";
import { WritingList } from "@/components/writing-list";
import { Reveal } from "@/components/motion";
import { HomeAnchorNav } from "@/components/home-anchor-nav";

export default function HomePage() {
  const posts = getAllPosts();
  const tags = getAllTags();
  const [featured, ...rest] = posts;
  const listed = [featured, ...rest].filter(Boolean);

  return (
    <>
      <HomeAnchorNav hasIndex={Boolean(featured)} />

      <Hero posts={posts.length} tags={tags.length} since={2026} />

      {featured && (
        <Bento
          featured={featured}
          posts={posts.length}
          tags={tags.length}
          since={2026}
        />
      )}

      <section
        id="writing"
        data-scroll-center=""
        className="page-shell scroll-mt-24 py-20 md:py-28"
      >
        <SectionHeading
          index="02"
          title="写作"
          en="Writing"
          href="/writing/"
          linkLabel="全部文章"
        />

        <Reveal>
          <WritingList posts={listed.slice(0, 5)} />
        </Reveal>

        <Reveal delay={0.1} className="mt-10 flex justify-end">
          <Link
            href="/writing/"
            className="group inline-flex items-center gap-2 border-b border-line-strong pb-1.5 text-sm text-ink transition-colors hover:border-accent"
          >
            浏览全部 {posts.length} 篇
            <ArrowRight
              size={14}
              strokeWidth={1.5}
              className="transition-transform duration-500 group-hover:translate-x-1"
            />
          </Link>
        </Reveal>
      </section>
    </>
  );
}

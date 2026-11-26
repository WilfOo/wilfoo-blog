import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllPosts, getAdjacentPosts, getPost } from "@/lib/posts";
import { site } from "@/lib/site";
import { formatDate, formatLongDate, pad } from "@/lib/utils";
import { ReadingProgress } from "@/components/reading-progress";
import { TableOfContents, MobileTableOfContents } from "@/components/table-of-contents";
import { CodeCopy } from "@/components/code-copy";
import { PostNav, BackToWriting } from "@/components/post-nav";

type Params = { slug: string };

export function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return {};

  return {
    title: post.title,
    description: post.summary,
    alternates: { canonical: `/posts/${post.slug}/` },
    openGraph: {
      type: "article",
      title: post.title,
      description: post.summary,
      url: `${site.url}/posts/${post.slug}/`,
      publishedTime: post.date,
      tags: post.tags,
      images: [{ url: "/og.jpg", width: 1200, height: 630, alt: post.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.summary,
      images: ["/og.jpg"],
    },
  };
}

export default async function PostPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();

  const posts = getAllPosts();
  const index = posts.findIndex((entry) => entry.slug === slug);
  const { previous, next } = getAdjacentPosts(slug);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.summary,
    datePublished: post.date,
    dateModified: post.date,
    inLanguage: "zh-CN",
    author: { "@type": "Person", name: site.author, url: site.url },
    publisher: { "@type": "Person", name: site.author },
    mainEntityOfPage: `${site.url}/posts/${post.slug}/`,
    keywords: post.tags.join(", "),
  };

  return (
    <div className="page-shell pt-28 pb-10 md:pt-36">
      <ReadingProgress />
      <CodeCopy />

      <header className="mx-auto max-w-6xl">
        <BackToWriting />

        <div className="mt-10 max-w-4xl">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <span className="label tabular text-accent">
            No. {String(Math.max(index, 0) + 1).padStart(2, "0")}
          </span>
          <span className="h-px w-6 bg-line-strong" />
          {post.tags.map((tag) => (
            <Link
              key={tag}
              href={`/tags/${encodeURIComponent(tag)}/`}
              className="label rounded-full border border-line px-2.5 py-1 transition-colors hover:border-line-strong hover:text-ink"
            >
              {tag}
            </Link>
          ))}
        </div>

        <h1 className="display display-cn mt-7 text-[clamp(2.15rem,5.4vw,4.5rem)] text-ink">
          {post.title}
        </h1>

        {post.summary && (
          <p className="mt-6 max-w-2xl text-[15px] leading-8 text-muted md:text-base">
            {post.summary}
          </p>
        )}

        </div>

        <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-2 border-y border-line py-4">
          <time dateTime={post.date} className="label tabular">
            {formatLongDate(post.date)}
          </time>
          <span className="label tabular">{post.readingTime} min read</span>
          <span className="label tabular hidden sm:inline">≈ {post.words.toLocaleString("en-US")} 字</span>
          <span className="label ml-auto hidden tabular md:inline">
            {formatDate(post.date)} / {site.name}
          </span>
        </div>
      </header>

      <div className="mx-auto mt-12 grid max-w-6xl gap-10 md:mt-16 lg:grid-cols-12 lg:gap-12">
        <div className="min-w-0 lg:col-span-8">
          {post.showToc && (
            <MobileTableOfContents headings={post.headings} defaultOpen={post.tocOpen} />
          )}
          <article
            className="prose-blog min-w-0"
            dangerouslySetInnerHTML={{ __html: post.html }}
          />

          <div className="mt-16 flex flex-wrap items-center gap-2 border-t border-line pt-6">
            <span className="label mr-2">Filed under</span>
            {post.tags.map((tag) => (
              <Link
                key={tag}
                href={`/tags/${encodeURIComponent(tag)}/`}
                className="rounded-full border border-line px-3 py-1 text-[11px] text-muted transition-colors hover:border-line-strong hover:text-ink"
              >
                #{tag}
              </Link>
            ))}
            <span className="ml-auto flex items-center gap-2">
              <span className="h-px w-6 bg-line-strong" />
              <span className="label">End</span>
            </span>
          </div>
        </div>

        {post.showToc && (
          <aside className="hidden lg:col-span-3 lg:col-start-10 lg:block">
            <div className="sticky top-28">
              <TableOfContents headings={post.headings} readingTime={post.readingTime} />
            </div>
          </aside>
        )}
      </div>

      <div className="mx-auto max-w-6xl">
        <PostNav previous={previous} next={next} />
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </div>
  );
}

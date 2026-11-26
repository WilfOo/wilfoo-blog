import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import type { PostSummary } from "@/lib/posts";
import { SpotlightLink } from "@/components/motion";
import { formatDate } from "@/lib/utils";

export function PostNav({
  previous,
  next,
}: {
  previous: PostSummary | null;
  next: PostSummary | null;
}) {
  if (!previous && !next) return null;

  return (
    <nav className="mt-16 grid gap-3 border-t border-line pt-8 sm:grid-cols-2" aria-label="上一篇与下一篇">
      {previous ? (
        <SpotlightLink
          href={`/posts/${previous.slug}/`}
          className="group flex flex-col justify-between rounded-lg border border-line bg-card p-5 md:p-6"
        >
          <span className="label flex items-center gap-2">
            <ArrowLeft size={12} strokeWidth={1.5} /> Older
          </span>
          <span className="mt-5 text-[16px] font-medium leading-snug tracking-[-0.025em] text-ink">
            {previous.title}
          </span>
          <span className="label mt-4 tabular">{formatDate(previous.date)}</span>
        </SpotlightLink>
      ) : (
        <div className="hidden sm:block" />
      )}

      {next && (
        <SpotlightLink
          href={`/posts/${next.slug}/`}
          className="group flex flex-col justify-between rounded-lg border border-line bg-card p-5 text-right md:p-6"
        >
          <span className="label flex items-center justify-end gap-2">
            Newer <ArrowRight size={12} strokeWidth={1.5} />
          </span>
          <span className="mt-5 text-[16px] font-medium leading-snug tracking-[-0.025em] text-ink">
            {next.title}
          </span>
          <span className="label mt-4 tabular">{formatDate(next.date)}</span>
        </SpotlightLink>
      )}
    </nav>
  );
}

export function BackToWriting() {
  return (
    <Link
      href="/writing/"
      className="group inline-flex items-center gap-2 text-xs text-muted transition-colors hover:text-ink"
    >
      <ArrowLeft
        size={13}
        strokeWidth={1.5}
        className="transition-transform duration-500 group-hover:-translate-x-1"
      />
      全部文章
    </Link>
  );
}

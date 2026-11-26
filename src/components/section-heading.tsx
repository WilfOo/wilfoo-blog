import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Reveal } from "@/components/motion";

export function SectionHeading({
  index,
  title,
  en,
  href,
  linkLabel = "浏览全部",
  aside,
}: {
  index: string;
  title: string;
  en: string;
  href?: string;
  linkLabel?: string;
  aside?: string;
}) {
  return (
    <Reveal className="mb-10 md:mb-14">
      <div className="flex items-baseline justify-between gap-6 border-t border-line pt-5">
        <div className="flex items-baseline gap-4 md:gap-6">
          <span className="label tabular text-accent">{index}</span>
          <h2 className="text-[clamp(1.6rem,3vw,2.4rem)] font-medium tracking-[-0.04em] text-ink">
            {title}
          </h2>
          <span className="label hidden pb-1 sm:block">{en}</span>
        </div>
        {href ? (
          <Link
            href={href}
            className="group flex shrink-0 items-center gap-1.5 text-xs text-muted transition-colors hover:text-ink"
          >
            <span>{linkLabel}</span>
            <ArrowUpRight
              size={13}
              strokeWidth={1.5}
              className="transition-transform duration-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            />
          </Link>
        ) : (
          <span className="label hidden shrink-0 pb-1 sm:block">{aside}</span>
        )}
      </div>
    </Reveal>
  );
}

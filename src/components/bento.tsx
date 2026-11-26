import { ArrowUpRight, Rss, Github } from "lucide-react";
import type { PostSummary } from "@/lib/posts";
import { site } from "@/lib/site";
import { formatDate, pad } from "@/lib/utils";
import { ContourArt } from "@/components/contour-art";
import { SpotlightCard, SpotlightLink, Stagger, StaggerItem } from "@/components/motion";
import { SearchCard } from "@/components/search-card";

const NOW_ITEMS = [
  "把站点从 Hugo 迁到 Next.js 静态导出",
  "维护 CachyOS + Windows 双系统",
  "记录近期折腾过的工具与配置",
];

const STACK = [
  ["Write", "Markdown · Shiki"],
  ["Build", "Next.js · Tailwind"],
  ["Motion", "Framer Motion · Lenis"],
  ["Type", "Inter · Instrument Serif"],
];

export function Bento({
  featured,
  posts,
  tags,
  since,
}: {
  featured: PostSummary;
  posts: number;
  tags: number;
  since: number;
}) {
  return (
    <section id="index" data-scroll-center="" className="page-shell scroll-mt-24 py-14 md:py-16">
      <div className="mb-6 flex items-baseline justify-between border-t border-line pt-4 md:mb-7">
        <div className="flex items-baseline gap-4 md:gap-6">
          <span className="label tabular text-accent">01</span>
          <h2 className="text-[clamp(1.6rem,3vw,2.4rem)] font-medium tracking-[-0.04em] text-ink">
            索引
          </h2>
          <span className="label hidden pb-1 sm:block">Index</span>
        </div>
        <span className="label hidden pb-1 sm:block">A small, deliberate surface</span>
      </div>

      <Stagger className="grid grid-cols-1 gap-3 md:grid-cols-12 md:gap-3.5" gap={0.09}>
        {/* Featured essay */}
        <StaggerItem className="md:col-span-7 md:row-span-2">
          <SpotlightLink
            href={`/posts/${featured.slug}/`}
            className="group relative flex h-full min-h-[340px] flex-col justify-between overflow-hidden rounded-xl border border-line bg-paper/95 p-5 md:min-h-[352px] md:p-6"
          >
            <div className="pointer-events-none absolute inset-x-0 top-0 h-[36%] overflow-hidden text-ink [mask-image:linear-gradient(to_bottom,transparent_0%,#000_14%,#000_52%,transparent_100%)] md:h-[50%]">
              <ContourArt
                seed={featured.slug}
                cell={12}
                levels={4}
                width={640}
                height={440}
                className="translate-y-6 scale-[1.08] transition-transform duration-[1.6s] ease-out group-hover:translate-y-2 group-hover:scale-[1.12]"
                opacity={0.34}
              />
            </div>

            <div className="relative flex items-start justify-between gap-4">
              <span className="label flex items-center gap-2 text-ink">
                <span className="inline-block h-1 w-1 rounded-full bg-accent" />
                Featured essay
              </span>
              <span className="label tabular">{formatDate(featured.date)}</span>
            </div>

            <div className="relative mt-14 md:mt-16">
              <div className="mb-3 flex flex-wrap items-center gap-x-2 gap-y-1">
                {featured.tags.map((tag, index) => (
                  <span key={tag} className="label">
                    {index > 0 && <span className="mr-2 text-faint">·</span>}
                    {tag}
                  </span>
                ))}
              </div>
              <h3 className="max-w-xl text-[clamp(1.5rem,2.8vw,2.25rem)] font-medium leading-[1.2] tracking-[-0.045em] text-ink">
                {featured.title}
              </h3>
              <p className="mt-3 max-w-lg text-sm leading-7 text-muted">{featured.summary}</p>

              <div className="mt-5 flex items-center justify-between border-t border-line pt-3.5">
                <span className="label">
                  {featured.readingTime} min read · 阅读全文
                </span>
                <span className="flex h-8 w-8 items-center justify-center rounded-full border border-line-strong text-ink transition-all duration-500 group-hover:border-ink group-hover:bg-ink group-hover:text-paper">
                  <ArrowUpRight size={14} strokeWidth={1.5} />
                </span>
              </div>
            </div>
          </SpotlightLink>
        </StaggerItem>

        {/* Now */}
        <StaggerItem className="md:col-span-5">
          <SpotlightCard as="article" className="h-full rounded-xl border border-line bg-card p-5 md:p-6">
            <div className="flex items-center justify-between">
              <span className="label flex items-center gap-2 text-ink">
                <span className="status-dot inline-block h-1 w-1 rounded-full bg-accent" />
                Now
              </span>
              <span className="label tabular">2026 / 11</span>
            </div>
            <ul className="mt-4 space-y-2.5">
              {NOW_ITEMS.map((item, index) => (
                <li key={item} className="flex gap-3 text-[13px] leading-6 text-ink-soft">
                  <span className="label tabular pt-1 text-faint">{pad(index + 1)}</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </SpotlightCard>
        </StaggerItem>

        {/* Numbers */}
        <StaggerItem className="md:col-span-5">
          <SpotlightCard as="article" className="h-full rounded-xl border border-line bg-card p-5 md:p-6">
            <div className="flex items-baseline justify-between">
              <span className="label text-ink">In numbers</span>
              <span className="label">Quietly kept</span>
            </div>
            <div className="mt-5 grid grid-cols-3 gap-4">
              <Number value={pad(posts)} label="Essays" />
              <Number value={pad(tags)} label="Tags" />
              <Number value={String(since)} label="Since" />
            </div>
          </SpotlightCard>
        </StaggerItem>

        {/* Search */}
        <StaggerItem className="md:col-span-4">
          <SearchCard />
        </StaggerItem>

        {/* Elsewhere */}
        <StaggerItem className="md:col-span-4">
          <SpotlightCard as="article" className="h-full min-h-[152px] rounded-xl border border-line bg-card p-5">
            <div className="flex items-center justify-between">
              <span className="label text-ink">Elsewhere</span>
              <span className="label">Outward</span>
            </div>
            <ul className="mt-3.5 space-y-2">
              <Elsewhere href={site.github} icon={<Github size={13} strokeWidth={1.5} />} label="GitHub" hint="WilfOo" />
              <Elsewhere href={site.rss} icon={<Rss size={13} strokeWidth={1.5} />} label="RSS" hint="feed.xml" />
            </ul>
          </SpotlightCard>
        </StaggerItem>

        {/* Stack */}
        <StaggerItem className="md:col-span-4">
          <SpotlightCard as="article" className="h-full min-h-[152px] rounded-xl border border-line bg-card p-5">
            <div className="flex items-center justify-between">
              <span className="label text-ink">Colophon</span>
              <span className="label">This site</span>
            </div>
            <ul className="mt-3.5 space-y-1.5">
              {STACK.map(([key, value]) => (
                <li key={key} className="flex items-baseline justify-between gap-4 border-b border-line/70 pb-1.5 last:border-0">
                  <span className="label tabular text-faint">{key}</span>
                  <span className="text-right text-[11px] leading-5 text-muted">{value}</span>
                </li>
              ))}
            </ul>
          </SpotlightCard>
        </StaggerItem>
      </Stagger>
    </section>
  );
}

function Number({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <span className="tabular block text-[clamp(2rem,3.6vw,2.9rem)] font-medium leading-none tracking-[-0.05em] text-ink">
        {value}
      </span>
      <span className="label mt-2 block">{label}</span>
    </div>
  );
}

function Elsewhere({
  href,
  icon,
  label,
  hint,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  hint: string;
}) {
  const external = href.startsWith("http");
  return (
    <li>
      <a
        href={href}
        target={external ? "_blank" : undefined}
        rel={external ? "noopener noreferrer" : undefined}
        className="group flex items-center justify-between gap-4 border-b border-line/70 py-1.5 text-ink-soft transition-colors hover:text-ink"
      >
        <span className="flex items-center gap-2.5 text-[13px]">
          <span className="text-faint transition-colors group-hover:text-accent">{icon}</span>
          {label}
        </span>
        <span className="flex items-center gap-1.5 text-[10px] text-faint">
          {hint}
          <ArrowUpRight
            size={11}
            strokeWidth={1.5}
            className="transition-transform duration-500 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
          />
        </span>
      </a>
    </li>
  );
}

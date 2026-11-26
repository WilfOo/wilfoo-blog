import type { Metadata } from "next";
import { ArrowUpRight } from "lucide-react";
import { getAboutMarkdown } from "@/lib/posts";
import { renderMarkdown } from "@/lib/markdown";
import { social } from "@/lib/site";
import { PageHeader } from "@/components/page-header";
import { Reveal } from "@/components/motion";

export const metadata: Metadata = {
  title: "关于",
  description: "关于 Wilfred 与这个博客。",
  alternates: { canonical: "/about/" },
};

const FACTS = [
  { key: "始于", value: "2026" },
  { key: "构建", value: "Next.js · 静态导出" },
  { key: "托管", value: "Cloudflare Pages" },
  { key: "订阅", value: "RSS · /feed.xml" },
];

export default async function AboutPage() {
  const { content } = getAboutMarkdown();
  const html = await renderMarkdown(content);

  return (
    <div className="page-shell pt-32 pb-10 md:pt-40">
      <PageHeader
        index="04"
        label="About"
        title="关于"
        meta="Personal notebook"
      />

      <div className="mt-16 grid gap-12 md:mt-20 md:grid-cols-12 md:gap-10">
        <Reveal className="md:col-span-7">
          <article className="prose-blog" dangerouslySetInnerHTML={{ __html: html }} />
        </Reveal>

        <aside className="md:col-span-4 md:col-start-9">
          <div className="md:sticky md:top-28">
            <p className="label border-t border-line pt-4">At a glance</p>
            <dl className="mt-5">
              {FACTS.map((fact) => (
                <div
                  key={fact.key}
                  className="flex items-baseline justify-between gap-4 border-b border-line py-3"
                >
                  <dt className="label shrink-0">{fact.key}</dt>
                  <dd className="text-right text-xs leading-5 text-ink-soft">{fact.value}</dd>
                </div>
              ))}
            </dl>

            <p className="label mt-10">Elsewhere</p>
            <ul className="mt-4 space-y-2">
              {social.map((item) => (
                <li key={item.label}>
                  <a
                    href={item.href}
                    target={item.href.startsWith("http") ? "_blank" : undefined}
                    rel={item.href.startsWith("http") ? "noopener noreferrer" : undefined}
                    className="group flex items-center justify-between border-b border-line py-2.5 text-sm text-ink-soft transition-colors hover:text-ink"
                  >
                    <span>{item.label}</span>
                    <span className="flex items-center gap-2">
                      <span className="label">{item.hint}</span>
                      <ArrowUpRight
                        size={12}
                        strokeWidth={1.5}
                        className="text-faint transition-transform duration-500 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                      />
                    </span>
                  </a>
                </li>
              ))}
            </ul>

          </div>
        </aside>
      </div>
    </div>
  );
}

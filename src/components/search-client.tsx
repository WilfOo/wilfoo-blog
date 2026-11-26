"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Search, X } from "lucide-react";
import { filterSearch, type SearchItem } from "@/lib/search";
import { formatDate } from "@/lib/utils";

export function SearchClient({ items }: { items: SearchItem[] }) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const results = useMemo(() => filterSearch(items, query), [items, query]);

  return (
    <div>
      <div className="mt-12 flex items-center gap-4 border-b border-ink pb-5 transition-colors focus-within:border-accent md:mt-16">
        <Search size={22} strokeWidth={1.25} className="shrink-0 text-faint" />
        <input
          ref={inputRef}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              setQuery("");
              inputRef.current?.blur();
            }
            if (event.key === "Enter" && results[0]) {
              window.location.href = results[0].url;
            }
          }}
          placeholder="输入关键词，或按 ⌘K"
          aria-label="搜索文章"
          autoComplete="off"
          spellCheck={false}
          className="w-full bg-transparent text-[clamp(1.5rem,4vw,3rem)] font-medium tracking-[-0.04em] text-ink placeholder:text-faint focus:outline-none"
        />
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              inputRef.current?.focus();
            }}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-line text-muted transition-colors hover:text-ink"
            aria-label="清空搜索"
          >
            <X size={14} strokeWidth={1.5} />
          </button>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between">
        <span className="label">
          {query.trim() ? `结果 · ${results.length}` : "全部文章"}
        </span>
        <span className="label hidden sm:block">标题、标签与正文</span>
      </div>

      <div className="mt-6 border-t border-line">
        {results.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-xl font-medium tracking-[-0.03em] text-ink">没有找到。</p>
            <p className="mt-3 text-sm text-muted">
              换个词试试，比如 “CachyOS”、“背景” 或 “Linux”。
            </p>
          </div>
        ) : (
          results.map((item, index) => (
            <Link
              key={item.slug}
              href={item.url}
              className="group grid grid-cols-12 items-baseline gap-3 border-b border-line py-5 md:gap-4 md:py-6"
            >
              <span className="label tabular col-span-2 pt-1 text-faint">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className="col-span-10 md:col-span-6">
                <span className="block text-[17px] font-medium leading-snug tracking-[-0.025em] text-ink transition-transform duration-500 group-hover:translate-x-1 md:text-xl">
                  {item.title}
                </span>
                <span className="mt-1.5 block truncate text-xs text-faint md:hidden">
                  {formatDate(item.date)} · {item.tags.join(" · ")}
                </span>
              </span>
              <span className="label col-span-12 hidden md:col-span-2 md:block">
                {formatDate(item.date)}
              </span>
              <span className="col-span-12 flex items-center justify-between md:col-span-2">
                <span className="label hidden md:block">{item.tags[0]}</span>
                <ArrowUpRight
                  size={14}
                  strokeWidth={1.5}
                  className="ml-auto text-faint transition-all duration-500 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-ink"
                />
              </span>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}

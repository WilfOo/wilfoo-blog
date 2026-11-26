"use client";

import { Command } from "lucide-react";
import { SpotlightCard } from "@/components/motion";

/** Bento card that opens the global search dialog. */
export function SearchCard() {
  return (
    <SpotlightCard className="h-full rounded-xl border border-line bg-card">
      <button
        type="button"
        onClick={() => window.dispatchEvent(new Event("open-command"))}
        className="flex h-full min-h-[152px] w-full flex-col justify-between p-5 text-left"
        aria-label="打开文章搜索"
      >
        <div className="flex items-center justify-between">
          <span className="label text-ink">Search</span>
          <kbd className="label rounded border border-line px-1.5 py-1">⌘ K</kbd>
        </div>
        <div className="mt-6 flex items-end justify-between">
          <span>
            <span className="block text-2xl font-medium tracking-[-0.04em] text-ink">
              找一篇文章
            </span>
            <span className="mt-2 block text-xs text-faint">标题、标签与正文全文检索</span>
          </span>
          <Command size={18} strokeWidth={1.25} className="mb-1 text-faint" />
        </div>
      </button>
    </SpotlightCard>
  );
}

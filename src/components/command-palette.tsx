"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, CornerDownLeft, Search } from "lucide-react";
import { filterSearch, type SearchItem } from "@/lib/search";
import { formatDate } from "@/lib/utils";
import { startScroll, stopScroll } from "@/components/smooth-scroll";

const EASE = [0.16, 1, 0.3, 1] as const;

function Highlight({ text, query }: { text: string; query: string }) {
  const token = query.trim().split(/\s+/)[0];
  if (!token) return <>{text}</>;
  const index = text.toLowerCase().indexOf(token.toLowerCase());
  if (index < 0) return <>{text}</>;
  return (
    <>
      {text.slice(0, index)}
      <span className="text-accent">{text.slice(index, index + token.length)}</span>
      {text.slice(index + token.length)}
    </>
  );
}

export function CommandPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [items, setItems] = useState<SearchItem[] | null>(null);
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const previousFocus = useRef<HTMLElement | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    if (items) return;
    try {
      const response = await fetch("/index.json");
      if (!response.ok) throw new Error(String(response.status));
      const data = (await response.json()) as SearchItem[];
      setItems(data);
    } catch {
      setItems([]);
    }
  }, [items]);

  const show = useCallback(() => {
    previousFocus.current = document.activeElement as HTMLElement | null;
    setOpen(true);
    setQuery("");
    setActive(0);
    void load();
  }, [load]);

  const hide = useCallback(() => {
    setOpen(false);
    previousFocus.current?.focus?.();
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((value) => {
          if (value) return false;
          previousFocus.current = document.activeElement as HTMLElement | null;
          setQuery("");
          setActive(0);
          void load();
          return true;
        });
      }
      if (event.key === "Escape") hide();
    };
    const onOpen = () => show();
    window.addEventListener("keydown", onKey);
    window.addEventListener("open-command", onOpen);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("open-command", onOpen);
    };
  }, [hide, load, show]);

  useEffect(() => {
    if (!open) return;
    stopScroll();
    document.body.style.overflow = "hidden";
    const timer = window.setTimeout(() => inputRef.current?.focus(), 60);
    return () => {
      window.clearTimeout(timer);
      startScroll();
      document.body.style.overflow = "";
    };
  }, [open]);

  const results = items ? filterSearch(items, query) : [];
  const visible = query.trim() ? results : items ?? [];

  useEffect(() => {
    setActive(0);
  }, [query]);

  useEffect(() => {
    const node = listRef.current?.querySelector<HTMLElement>(`[data-index="${active}"]`);
    node?.scrollIntoView({ block: "nearest" });
  }, [active]);

  const go = (item?: SearchItem) => {
    const target = item ?? visible[active];
    if (!target) return;
    hide();
    router.push(target.url);
  };

  const onInputKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActive((value) => Math.min(value + 1, visible.length - 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActive((value) => Math.max(value - 1, 0));
    } else if (event.key === "Enter") {
      event.preventDefault();
      go();
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-start justify-center px-4 pt-[12vh] sm:pt-[16vh]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <button
            type="button"
            aria-label="关闭搜索"
            className="absolute inset-0 cursor-default bg-paper/70 backdrop-blur-md"
            onClick={hide}
          />
          <motion.div
            ref={dialogRef}
            onKeyDown={(event) => {
              if (event.key !== "Tab") return;
              const nodes = Array.from(
                dialogRef.current?.querySelectorAll<HTMLElement>(
                  'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])',
                ) ?? [],
              ).filter((node) => node.offsetParent !== null);
              if (!nodes.length) return;
              const first = nodes[0];
              const last = nodes[nodes.length - 1];
              if (event.shiftKey && document.activeElement === first) {
                event.preventDefault();
                last.focus();
              } else if (!event.shiftKey && document.activeElement === last) {
                event.preventDefault();
                first.focus();
              }
            }}
            role="dialog"
            aria-modal="true"
            aria-label="搜索文章"
            className="relative w-full max-w-2xl overflow-hidden rounded-xl border border-line bg-paper shadow-[0_40px_120px_-40px_rgba(0,0,0,0.45)]"
            initial={{ opacity: 0, y: 18, scale: 0.985 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.99 }}
            transition={{ duration: 0.45, ease: EASE }}
          >
            <div className="flex items-center gap-3 border-b border-line px-5 py-4 transition-colors focus-within:border-accent">
              <Search size={17} strokeWidth={1.5} className="shrink-0 text-faint" />
              <input
                ref={inputRef}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onKeyDown={onInputKeyDown}
                placeholder="搜索文章、标签、正文…"
                className="w-full bg-transparent text-[15px] text-ink placeholder:text-faint focus:outline-none"
                aria-label="搜索关键词"
                autoComplete="off"
                spellCheck={false}
              />
              <kbd className="label hidden shrink-0 rounded border border-line px-1.5 py-1 sm:block">
                Esc
              </kbd>
            </div>

            <div ref={listRef} className="max-h-[52vh] overflow-y-auto overscroll-contain p-2" data-lenis-prevent>
              {items === null ? (
                <div className="px-3 py-10 text-center">
                  <span className="label">载入索引…</span>
                </div>
              ) : visible.length === 0 ? (
                <div className="px-3 py-12 text-center">
                  <p className="text-sm text-muted">没有结果。</p>
                  <p className="mt-2 text-xs text-faint">试试 “CachyOS”、“Hugo” 或 “背景”。</p>
                </div>
              ) : (
                <ul className="space-y-0.5">
                  {visible.map((item, index) => (
                    <li key={item.slug}>
                      <button
                        type="button"
                        data-index={index}
                        onMouseEnter={() => setActive(index)}
                        onClick={() => go(item)}
                        className={`group flex w-full items-center gap-4 rounded-lg px-3 py-3 text-left transition-colors ${
                          index === active ? "bg-paper-deep" : "hover:bg-paper-deep/60"
                        }`}
                      >
                        <span className="label tabular w-16 shrink-0 text-faint">
                          {formatDate(item.date).slice(2)}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-[14px] font-medium text-ink">
                            <Highlight text={item.title} query={query} />
                          </span>
                          <span className="mt-1 block truncate text-xs text-faint">
                            {item.tags.join(" · ") || item.summary}
                          </span>
                        </span>
                        <ArrowUpRight
                          size={15}
                          strokeWidth={1.5}
                          className={`shrink-0 transition-all ${
                            index === active
                              ? "translate-x-0 text-accent opacity-100"
                              : "-translate-x-1 text-faint opacity-0 group-hover:opacity-100"
                          }`}
                        />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="flex items-center justify-between border-t border-line px-5 py-3">
              <div className="flex items-center gap-4">
                <span className="label flex items-center gap-1.5">
                  <span className="text-[9px]">↑↓</span> 选择
                </span>
                <span className="label flex items-center gap-1.5">
                  <CornerDownLeft size={10} strokeWidth={1.5} /> 打开
                </span>
              </div>
              <span className="label tabular">
                {items ? `${visible.length} / ${items.length}` : "—"}
              </span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

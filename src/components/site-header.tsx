"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useScroll,
} from "framer-motion";
import { Command, Menu, X } from "lucide-react";
import { nav, site } from "@/lib/site";
import { ThemeToggle } from "@/components/theme-toggle";
import { SpringTap } from "@/components/motion";
import { startScroll, stopScroll } from "@/components/smooth-scroll";

const EASE = [0.16, 1, 0.3, 1] as const;

export function SiteHeader() {
  const pathname = usePathname();
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious() ?? 0;
    setScrolled(latest > 16);
    if (latest > 280 && latest > previous + 6) setHidden(true);
    else if (latest < previous - 6 || latest < 220) setHidden(false);
  });

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!menuOpen) return;
    stopScroll();
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      startScroll();
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  const openSearch = () => window.dispatchEvent(new Event("open-command"));

  return (
    <>
      <motion.header
        className="fixed inset-x-0 top-0 z-50"
        animate={{ y: hidden && !menuOpen ? "-105%" : "0%" }}
        transition={{ duration: 0.5, ease: EASE }}
      >
        <div
          className={`border-b transition-colors duration-500 ${
            scrolled && !menuOpen ? "border-line bg-paper/95" : "border-transparent bg-transparent"
          }`}
        >
          <div className="page-shell flex h-16 items-center justify-between gap-4 md:h-20">
            <Link
              href="/"
              className="group flex items-baseline gap-2"
              aria-label="Wilfred — 首页"
              onClick={() => setMenuOpen(false)}
            >
              <span className="text-[15px] font-semibold tracking-[-0.03em] text-ink">
                Wilfred
              </span>
              <span className="label hidden pb-px transition-colors group-hover:text-ink sm:block">
                / field notes
              </span>
            </Link>

            <nav className="hidden items-center gap-7 md:flex" aria-label="主导航">
              {nav.map((item) => {
                const active =
                  pathname === item.href ||
                  pathname.startsWith(item.href.replace(/\/$/, "")) ||
                  (item.href === "/writing/" && pathname.startsWith("/posts"));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="group flex items-baseline gap-1.5 py-2"
                  >
                    <span
                      className={`label tabular transition-colors ${
                        active ? "text-accent" : "text-faint group-hover:text-muted"
                      }`}
                    >
                      {item.index}
                    </span>
                    <span className="relative text-[13px] text-ink-soft transition-colors group-hover:text-ink">
                      {item.label}
                      <span
                        className={`absolute -bottom-0.5 left-0 h-px w-full origin-left bg-ink transition-transform duration-500 ${
                          active ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                        }`}
                        style={{ transitionTimingFunction: "cubic-bezier(0.16,1,0.3,1)" }}
                      />
                    </span>
                  </Link>
                );
              })}
            </nav>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={openSearch}
                className="hidden h-9 items-center gap-2 rounded-full border border-transparent px-3 text-muted transition-colors hover:border-line hover:bg-card hover:text-ink sm:flex"
                aria-label="搜索文章"
              >
                <Command size={14} strokeWidth={1.5} />
                <span className="label-ink label pb-px">K</span>
              </button>
              <ThemeToggle />
              <SpringTap
                type="button"
                className="ml-0.5 inline-flex h-9 w-9 items-center justify-center rounded-full border border-transparent text-ink transition-colors hover:border-line hover:bg-card md:hidden"
                aria-label={menuOpen ? "关闭菜单" : "打开菜单"}
                aria-expanded={menuOpen}
                onClick={() => setMenuOpen((open) => !open)}
              >
                {menuOpen ? <X size={17} strokeWidth={1.5} /> : <Menu size={17} strokeWidth={1.5} />}
              </SpringTap>
            </div>
          </div>
        </div>
      </motion.header>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className="fixed inset-0 z-40 flex flex-col bg-paper md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="page-shell flex flex-1 flex-col justify-center gap-2 pt-20">
              {nav.map((item, index) => (
                <motion.div
                  key={item.href}
                  initial={{ opacity: 0, y: 28 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 16 }}
                  transition={{ delay: 0.06 + index * 0.06, duration: 0.6, ease: EASE }}
                >
                  <Link
                    href={item.href}
                    className="flex items-baseline justify-between border-b border-line py-5"
                    onClick={() => setMenuOpen(false)}
                  >
                    <span className="flex items-baseline gap-3">
                      <span className="label tabular text-faint">{item.index}</span>
                      <span className="text-3xl font-medium tracking-[-0.03em] text-ink">
                        {item.label}
                      </span>
                    </span>
                    <span className="label">{item.en}</span>
                  </Link>
                </motion.div>
              ))}
              <motion.div
                className="mt-8 flex items-center justify-between"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    openSearch();
                  }}
                  className="label flex items-center gap-2 text-ink"
                >
                  <Command size={13} strokeWidth={1.5} /> 搜索
                </button>
              </motion.div>
            </div>
            <div className="page-shell flex items-center justify-between border-t border-line py-6">
              <span className="label">© {new Date().getFullYear()} Wilfred</span>
              <span className="label">Est. {site.since}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

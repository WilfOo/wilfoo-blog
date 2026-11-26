"use client";

import Link from "next/link";
import { ArrowUp, ArrowUpRight } from "lucide-react";
import { nav, site, social } from "@/lib/site";
import { scrollToTop } from "@/components/smooth-scroll";
import { Magnetic, Reveal, SpringTap } from "@/components/motion";
import { MotionToggle } from "@/components/motion-toggle";

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer
      id="footer"
      data-scroll-center=""
      data-scroll-align="bottom"
      className="relative z-10 mt-24 border-t border-line md:mt-36"
    >
      <div className="page-shell py-16 md:py-24">
        <div className="grid gap-12 md:grid-cols-12">
          <div className="md:col-span-7">
            <Reveal>
              <p className="label">Follow / 关注</p>
              <h2 className="display display-cn mt-6 text-[clamp(2rem,4.6vw,3.6rem)] text-ink">
                写点<span className="serif-accent text-accent">想写</span>的，
                <br />
                留点值得留的。
              </h2>
              <a
                href={site.github}
                target="_blank"
                rel="noopener noreferrer"
                className="group mt-10 inline-flex items-baseline gap-3 border-b border-line-strong pb-2 text-xl text-ink transition-colors hover:border-accent md:text-2xl"
              >
                <Magnetic>
                  <span className="font-medium tracking-[-0.02em]">github.com/WilfOo</span>
                </Magnetic>
                <ArrowUpRight
                  size={18}
                  strokeWidth={1.5}
                  className="translate-y-0.5 text-faint transition-all duration-500 group-hover:-translate-y-0 group-hover:translate-x-1 group-hover:text-accent"
                />
              </a>
            </Reveal>
          </div>

          <div className="grid grid-cols-2 gap-8 md:col-span-5 md:grid-cols-2 md:justify-items-end">
            <div>
              <p className="label mb-5">Index</p>
              <ul className="space-y-3">
                <li>
                  <Link href="/" className="link-line text-sm text-ink-soft hover:text-ink">
                    首页
                  </Link>
                </li>
                {nav.map((item) => (
                  <li key={item.href}>
                    <Link href={item.href} className="link-line text-sm text-ink-soft hover:text-ink">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="label mb-5">Elsewhere</p>
              <ul className="space-y-3">
                {social.map((item) => (
                  <li key={item.label}>
                    <a
                      href={item.href}
                      className="link-line text-sm text-ink-soft hover:text-ink"
                      target={item.href.startsWith("http") ? "_blank" : undefined}
                      rel={item.href.startsWith("http") ? "noopener noreferrer" : undefined}
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-16 flex flex-wrap items-center justify-between gap-4 border-t border-line pt-6">
          <div className="flex flex-wrap items-center gap-6">
            <span className="label tabular">© {year} Wilfred</span>
            <span className="label hidden sm:inline">Personal notebook</span>
            <span className="label hidden md:inline">Next.js · Static export</span>
          </div>
          <div className="flex items-center gap-2">
            <MotionToggle />
            <SpringTap
              type="button"
              onClick={() => scrollToTop()}
              className="group flex items-center gap-2 rounded-full border border-line px-3 py-1.5 text-muted transition-colors hover:border-line-strong hover:text-ink"
              aria-label="回到顶部"
            >
              <span className="label">Top</span>
              <ArrowUp
                size={13}
                strokeWidth={1.5}
                className="transition-transform duration-500 group-hover:-translate-y-0.5"
              />
            </SpringTap>
          </div>
        </div>
      </div>

      <div className="overflow-hidden border-t border-line">
        <div className="page-shell pt-8 pb-4 md:pt-10 md:pb-6">
          <p
            aria-hidden="true"
            className="wordmark select-none text-[clamp(4rem,17.4vw,15.5rem)] font-semibold leading-[1.02] tracking-[-0.075em] text-ink"
          >
            WILFRED
          </p>
        </div>
      </div>
    </footer>
  );
}

"use client";

import { useEffect, useState } from "react";
import { motion, useScroll, useSpring } from "framer-motion";
import { ChevronDown } from "lucide-react";
import type { Heading } from "@/lib/posts";

export function TableOfContents({
  headings,
  readingTime,
}: {
  headings: Heading[];
  readingTime: number;
}) {
  const [active, setActive] = useState(headings[0]?.id ?? "");
  const { scrollYProgress } = useScroll();
  const scaleY = useSpring(scrollYProgress, { stiffness: 120, damping: 30, restDelta: 0.001 });

  useEffect(() => {
    const elements = headings
      .map((heading) => document.getElementById(heading.id))
      .filter((el): el is HTMLElement => Boolean(el));
    if (!elements.length) return;

    let frame = 0;
    const update = () => {
      frame = 0;
      let current = elements[0];
      for (const element of elements) {
        if (element.getBoundingClientRect().top <= 150) current = element;
      }
      setActive(current.id);
    };
    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [headings]);

  return (
    <nav aria-label="文章目录">
      <div className="flex items-baseline justify-between border-t border-line pt-4">
        <span className="label text-ink">Contents</span>
        <span className="label">On this page</span>
      </div>

      <div className="relative mt-5">
        <span className="absolute inset-y-0 left-0 w-px bg-line" aria-hidden="true" />
        <motion.span
          className="absolute left-0 top-0 h-full w-px origin-top bg-accent"
          style={{ scaleY }}
          aria-hidden="true"
        />
        <ul className="space-y-1 pl-5">
          {headings.map((heading) => {
            const isActive = active === heading.id;
            return (
              <li key={heading.id} className={heading.level === 3 ? "pl-4" : ""}>
                <a
                  href={`#${heading.id}`}
                  className={`block py-1.5 text-[12px] leading-5 transition-colors duration-300 ${
                    isActive ? "text-ink" : "text-faint hover:text-muted"
                  }`}
                >
                  <span className="relative">
                    {isActive && (
                      <motion.span
                        layoutId="toc-dot"
                        className="absolute -left-5 top-1/2 h-1 w-1 -translate-y-1/2 rounded-full bg-accent"
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                      />
                    )}
                    {heading.text}
                  </span>
                </a>
              </li>
            );
          })}
        </ul>
      </div>

      <p className="label mt-8 text-faint">
        {headings.length} sections · {readingTime} min read
      </p>
    </nav>
  );
}

export function MobileTableOfContents({
  headings,
  defaultOpen = false,
}: {
  headings: Heading[];
  defaultOpen?: boolean;
}) {
  if (!headings.length) return null;
  return (
    <details
      open={defaultOpen}
      className="group mb-10 rounded-lg border border-line bg-card px-5 py-4 lg:hidden"
    >
      <summary className="flex cursor-pointer list-none items-center justify-between">
        <span className="label text-ink">Contents · 目录</span>
        <ChevronDown
          size={14}
          strokeWidth={1.5}
          className="text-faint transition-transform duration-300 group-open:rotate-180"
        />
      </summary>
      <ul className="mt-4 space-y-1 border-t border-line pt-3">
        {headings.map((heading) => (
          <li key={heading.id} className={heading.level === 3 ? "pl-4" : ""}>
            <a
              href={`#${heading.id}`}
              className="block py-1.5 text-[12px] text-muted transition-colors hover:text-ink"
            >
              {heading.text}
            </a>
          </li>
        ))}
      </ul>
    </details>
  );
}

"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { ArrowDown } from "lucide-react";
import { Rise } from "@/components/motion";
import { pad } from "@/lib/utils";

const EASE = [0.16, 1, 0.3, 1] as const;

export function Hero({
  posts,
  tags,
  since,
}: {
  posts: number;
  tags: number;
  since: number;
}) {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const headlineY = useTransform(scrollYProgress, [0, 1], [0, 140]);
  const headlineOpacity = useTransform(scrollYProgress, [0, 1], [1, 0.3]);
  const metaY = useTransform(scrollYProgress, [0, 1], [0, -40]);

  return (
    <section
      id="hero"
      ref={ref}
      data-scroll-center=""
      data-scroll-align="top"
      className="relative flex flex-col md:min-h-[100svh]"
    >
      <div className="page-shell pt-28 pb-10 md:flex md:flex-1 md:flex-col md:justify-center md:pt-32 md:pb-16">
        <div className="mb-10 flex items-center justify-between md:mb-14">
          <span className="label flex items-center gap-2.5 text-ink">
            <span className="status-dot inline-block h-1.5 w-1.5 rounded-full bg-accent" />
            Personal notebook
          </span>
          <span className="label hidden md:block">Est. 2026 — Vol. 04</span>
        </div>

        <motion.div style={reduce ? undefined : { y: headlineY, opacity: headlineOpacity }}>
          <h1 className="display text-[clamp(3rem,8.6vw,8rem)] text-ink">
            <span className="block">
              <Rise delay={0.08}>Notes on</Rise>
            </span>
            <span className="block">
              <Rise delay={0.16}>systems,</Rise>
            </span>
            <span className="block">
              <Rise delay={0.24}>data &amp; the</Rise>
            </span>
            <span className="block">
              <Rise delay={0.32}>
                <em className="pr-[0.06em]">quiet</em> parts.
              </Rise>
            </span>
          </h1>
        </motion.div>
      </div>

      <motion.div
        className="page-shell w-full pb-8 md:pb-10"
        style={reduce ? undefined : { y: metaY }}
      >
        <div className="grid gap-8 border-t border-line pt-6 md:grid-cols-12 md:items-end">
          <motion.p
            className="max-w-md text-sm leading-7 text-muted md:col-span-5"
            initial={reduce ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.75, duration: 0.9, ease: EASE }}
          >
            个人笔记。记录系统、工具和日常折腾过的事。
          </motion.p>

          <motion.div
            className="flex items-end gap-8 md:col-span-3 md:col-start-7 md:gap-10 md:justify-self-end"
            initial={reduce ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.85, duration: 0.9, ease: EASE }}
          >
            <Stat value={pad(posts)} label="Essays" />
            <Stat value={pad(tags)} label="Tags" />
            <Stat value={String(since)} label="Since" />
          </motion.div>

          <Link
            href="#index"
            className="group flex items-center justify-between gap-4 md:col-span-2 md:col-start-11 md:justify-self-end"
            aria-label="向下滚动"
          >
            <span className="label transition-colors group-hover:text-ink">Scroll</span>
            <motion.span
              className="flex h-9 w-9 items-center justify-center rounded-full border border-line text-muted transition-colors group-hover:border-line-strong group-hover:text-ink"
              animate={reduce ? undefined : { y: [0, 4, 0] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
            >
              <ArrowDown size={14} strokeWidth={1.5} />
            </motion.span>
          </Link>
        </div>
      </motion.div>
    </section>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="tabular text-xl font-medium leading-none tracking-[-0.03em] text-ink md:text-2xl">
        {value}
      </span>
      <span className="label">{label}</span>
    </div>
  );
}

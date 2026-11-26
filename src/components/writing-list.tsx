"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import type { PostSummary } from "@/lib/posts";
import { formatDate } from "@/lib/utils";
import { ContourArt } from "@/components/contour-art";
import { Stagger, StaggerItem } from "@/components/motion";

const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

export function WritingList({
  posts,
  showPreview = true,
  showSummary = true,
}: {
  posts: PostSummary[];
  showPreview?: boolean;
  showSummary?: boolean;
}) {
  const [hovered, setHovered] = useState<number | null>(null);
  const reduce = useReducedMotion();
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const x = useSpring(rawX, { stiffness: 180, damping: 22, mass: 0.5 });
  const y = useSpring(rawY, { stiffness: 180, damping: 22, mass: 0.5 });
  const lastPosition = useRef({ x: 0, y: 0 });
  const previewRef = useRef<HTMLDivElement>(null);

  const preview = hovered !== null ? posts[hovered] : null;

  const positionPreview = (clientX: number, clientY: number) => {
    const width = 320;
    const height = 220;
    const next = {
      x: Math.min(clientX + 28, window.innerWidth - width - 24),
      y: Math.min(Math.max(clientY - height / 2, 96), window.innerHeight - height - 24),
    };
    lastPosition.current = next;
    rawX.set(next.x);
    rawY.set(next.y);
  };

  // Framer resets transform styles when a motion element mounts; as a safety
  // net re-apply the last position after the preview enters the tree.
  useIsomorphicLayoutEffect(() => {
    if (hovered === null) return;
    rawX.set(lastPosition.current.x);
    rawY.set(lastPosition.current.y);
  }, [hovered, rawX, rawY]);

  // Position the floating preview directly on the node. This survives the
  // mount animation and means keyboard focus gets a preview too.
  useIsomorphicLayoutEffect(() => {
    const node = previewRef.current;
    if (!node || !preview) return;
    const apply = () => {
      node.style.transform = `translate3d(${x.get()}px, ${y.get()}px, 0)`;
    };
    apply();
    const unsubscribeX = x.on("change", apply);
    const unsubscribeY = y.on("change", apply);
    return () => {
      unsubscribeX();
      unsubscribeY();
    };
  }, [preview, x, y]);

  return (
    <div onPointerLeave={() => setHovered(null)} className="relative">
      <Stagger className="border-t border-line" gap={0.055}>
        {posts.map((post, index) => (
          <StaggerItem key={post.slug}>
            <Link
              href={`/posts/${post.slug}/`}
              onPointerEnter={(event) => {
                if (event.pointerType !== "touch") {
                  positionPreview(event.clientX, event.clientY);
                }
                setHovered(index);
              }}
              onPointerMove={
                showPreview && !reduce
                  ? (event) => {
                      if (event.pointerType !== "touch") {
                        positionPreview(event.clientX, event.clientY);
                      }
                    }
                  : undefined
              }
              onFocus={(event) => {
                const rect = event.currentTarget.getBoundingClientRect();
                if (rect.width > 0) {
                  positionPreview(rect.left + 140, rect.top + rect.height / 2);
                }
                setHovered(index);
              }}
              onBlur={() => setHovered(null)}
              className="group block border-b border-line py-6 transition-colors duration-500 hover:bg-ink/[0.025] md:grid md:grid-cols-12 md:items-baseline md:gap-4 md:py-7 dark:hover:bg-white/[0.02]"
            >
              <span className="flex items-center justify-between md:contents">
                <span className="label tabular text-faint transition-colors group-hover:text-muted md:col-span-2 md:pt-1">
                  {formatDate(post.date)}
                </span>
                <span className="label flex items-center gap-2 md:hidden">
                  {post.readingTime} min
                  <ArrowUpRight
                    size={13}
                    strokeWidth={1.5}
                    className="text-faint transition-all duration-500 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-ink"
                  />
                </span>
              </span>

              <span className="mt-3 block md:col-span-6 md:mt-0">
                <span className="block text-[clamp(1.05rem,1.7vw,1.35rem)] font-medium leading-snug tracking-[-0.03em] text-ink transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-1">
                  {post.title}
                </span>
                {showSummary && (
                  <span className="mt-1.5 block max-w-xl text-xs leading-6 text-faint md:hidden">
                    {post.summary}
                  </span>
                )}
              </span>

              <span className="hidden md:col-span-2 md:block">
                <span className="label">{post.tags[0] ?? "Notes"}</span>
              </span>

              <span className="hidden items-center justify-end gap-3 md:col-span-2 md:flex">
                <span className="label tabular">{post.readingTime} min</span>
                <ArrowUpRight
                  size={14}
                  strokeWidth={1.5}
                  className="text-faint transition-all duration-500 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-ink"
                />
              </span>
            </Link>
          </StaggerItem>
        ))}
      </Stagger>

      <AnimatePresence>
        {showPreview && preview && !reduce && (
          <motion.div
            key="preview"
            ref={previewRef}
            className="pointer-events-none fixed left-0 top-0 z-30 hidden w-[320px] lg:block"
            initial={false}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            aria-hidden="true"
          >
            <motion.div
              key={preview.slug}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ scale: 0.97 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="relative overflow-hidden rounded-lg border border-line bg-paper shadow-[0_30px_80px_-40px_rgba(0,0,0,0.45)]"
            >
              <div className="absolute inset-0 text-ink">
                <ContourArt seed={preview.slug} opacity={0.5} className="scale-110" />
                <div className="absolute inset-0 bg-[linear-gradient(to_top,var(--paper)_18%,transparent_85%)]" />
              </div>
              <div className="relative flex h-[220px] flex-col justify-between p-4">
                <div className="flex items-center justify-between">
                  <span className="label text-ink">Preview</span>
                  <span className="label tabular">
                    /{String(hovered! + 1).padStart(2, "0")}
                  </span>
                </div>
                <div>
                  <p className="text-[17px] font-medium leading-snug tracking-[-0.03em] text-ink">
                    {preview.title}
                  </p>
                  <p className="label mt-3">{preview.tags.join(" · ")}</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

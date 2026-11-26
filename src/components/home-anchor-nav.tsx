"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, useReducedMotion, useScroll, useSpring } from "framer-motion";
import {
  getCenteredScrollTop,
  getLenisVelocity,
  scrollToCentered,
  scrollToPosition,
} from "@/components/smooth-scroll";

interface SectionItem {
  id: string;
  index: string;
  label: string;
  en: string;
}

const EASE = [0.16, 1, 0.3, 1] as const;

export function HomeAnchorNav({ hasIndex = true }: { hasIndex?: boolean }) {
  const sections = useMemo<SectionItem[]>(() => {
    const items: SectionItem[] = [{ id: "hero", index: "00", label: "概览", en: "Top" }];
    if (hasIndex) {
      items.push({ id: "index", index: "01", label: "索引", en: "Index" });
    }
    items.push(
      { id: "writing", index: hasIndex ? "02" : "01", label: "写作", en: "Writing" },
      { id: "footer", index: hasIndex ? "03" : "02", label: "关注", en: "Follow" },
    );
    return items;
  }, [hasIndex]);

  const [active, setActive] = useState(sections[0].id);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const scaleY = useSpring(scrollYProgress, { stiffness: 120, damping: 30, restDelta: 0.001 });

  const isProgrammaticRef = useRef(false);
  const pointerDownRef = useRef(false);
  const snapTimerRef = useRef<number | null>(null);
  const releaseTimerRef = useRef<number | null>(null);

  const clearSnapTimer = useCallback(() => {
    if (snapTimerRef.current !== null) {
      window.clearTimeout(snapTimerRef.current);
      snapTimerRef.current = null;
    }
  }, []);

  const markProgrammatic = useCallback((ms: number) => {
    isProgrammaticRef.current = true;
    if (releaseTimerRef.current !== null) {
      window.clearTimeout(releaseTimerRef.current);
    }
    releaseTimerRef.current = window.setTimeout(() => {
      isProgrammaticRef.current = false;
      releaseTimerRef.current = null;
    }, ms);
  }, []);

  const getClosestSection = useCallback(
    (elements: HTMLElement[]) => {
      const vh = window.innerHeight;
      const scrollY = window.scrollY;
      const maxScroll = Math.max(0, document.documentElement.scrollHeight - vh);

      if (scrollY <= 40) return elements[0];
      if (maxScroll > 0 && scrollY >= maxScroll - 40) return elements[elements.length - 1];

      const viewportCenter = vh / 2;
      let closest = elements[0];
      let minDist = Infinity;

      for (const el of elements) {
        const rect = el.getBoundingClientRect();
        const center = rect.top + rect.height / 2;
        const dist = Math.abs(center - viewportCenter);
        if (dist < minDist) {
          minDist = dist;
          closest = el;
        }
      }
      return closest;
    },
    [],
  );

  const navigateTo = useCallback(
    (id: string) => {
      const el = document.getElementById(id);
      if (!el) return;
      clearSnapTimer();
      markProgrammatic(1150);
      setActive(id);
      scrollToCentered(el, { duration: reduce ? 0 : 1.05, immediate: Boolean(reduce) });
      const nextUrl = id === "hero" ? window.location.pathname : `#${id}`;
      window.history.replaceState(null, "", nextUrl);
    },
    [clearSnapTimer, markProgrammatic, reduce],
  );

  useEffect(() => {
    const getElements = () =>
      sections
        .map((section) => document.getElementById(section.id))
        .filter((el): el is HTMLElement => Boolean(el));

    let rafId = 0;

    const scheduleCenteredSnap = () => {
      if (reduce) return;
      clearSnapTimer();

      snapTimerRef.current = window.setTimeout(() => {
        snapTimerRef.current = null;

        if (isProgrammaticRef.current || pointerDownRef.current) return;
        if (document.body.style.overflow === "hidden") return;

        // Wait until Lenis inertia has almost settled before snapping.
        if (getLenisVelocity() > 0.12) {
          scheduleCenteredSnap();
          return;
        }

        const elements = getElements();
        if (!elements.length) return;

        const targetEl = getClosestSection(elements);
        const rect = targetEl.getBoundingClientRect();
        const vh = window.innerHeight;

        // If a section is taller than the viewport and the user is reading inside it,
        // do not pull them away from their reading position.
        if (rect.height > vh * 1.04 && rect.top < -24 && rect.bottom > vh + 24) {
          return;
        }

        const targetY = getCenteredScrollTop(targetEl);
        const diff = Math.abs(targetY - window.scrollY);

        if (diff > 8 && diff < vh * 0.48) {
          markProgrammatic(900);
          scrollToPosition(targetY, { duration: 0.78 });
        }
      }, 220);
    };

    const updateActive = () => {
      rafId = 0;
      const elements = getElements();
      if (!elements.length) return;
      const current = getClosestSection(elements);
      setActive(current.id);
    };

    const onScroll = () => {
      if (!rafId) {
        rafId = requestAnimationFrame(updateActive);
      }
      if (!isProgrammaticRef.current) {
        scheduleCenteredSnap();
      }
    };

    const onUserInterrupt = () => {
      clearSnapTimer();
      isProgrammaticRef.current = false;
    };

    const onPointerDown = () => {
      pointerDownRef.current = true;
      clearSnapTimer();
    };

    const onPointerUp = () => {
      pointerDownRef.current = false;
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (
        event.key === "ArrowDown" ||
        event.key === "ArrowUp" ||
        event.key === "PageDown" ||
        event.key === "PageUp" ||
        event.key === "Home" ||
        event.key === "End" ||
        event.key === " "
      ) {
        onUserInterrupt();
      }
    };

    updateActive();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    window.addEventListener("wheel", onUserInterrupt, { passive: true });
    window.addEventListener("touchstart", onPointerDown, { passive: true });
    window.addEventListener("touchend", onPointerUp, { passive: true });
    window.addEventListener("pointerdown", onPointerDown, { passive: true });
    window.addEventListener("pointerup", onPointerUp, { passive: true });
    window.addEventListener("keydown", onKeyDown);

    // If the user landed directly on a hash (e.g. /#writing), center it after paint.
    if (window.location.hash) {
      const hashId = decodeURIComponent(window.location.hash.slice(1));
      const hashEl = document.getElementById(hashId);
      if (hashEl && hashEl.hasAttribute("data-scroll-center")) {
        requestAnimationFrame(() => {
          markProgrammatic(400);
          scrollToCentered(hashEl, { immediate: true });
          setActive(hashId);
        });
      }
    }

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      clearSnapTimer();
      if (releaseTimerRef.current !== null) {
        window.clearTimeout(releaseTimerRef.current);
      }
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      window.removeEventListener("wheel", onUserInterrupt);
      window.removeEventListener("touchstart", onPointerDown);
      window.removeEventListener("touchend", onPointerUp);
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [sections, reduce, clearSnapTimer, getClosestSection, markProgrammatic]);

  return (
    <motion.nav
      aria-label="页面锚点导航"
      initial={reduce ? false : { opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.45, duration: 0.8, ease: EASE }}
      className="no-print fixed left-3 top-1/2 z-30 hidden -translate-y-1/2 lg:block xl:left-5 2xl:left-8"
    >
      <div className="relative pl-4">
        <span className="absolute inset-y-1 left-0 w-px bg-line" aria-hidden="true" />
        <motion.span
          className="absolute left-0 top-1 bottom-1 w-px origin-top bg-accent"
          style={{ scaleY }}
          aria-hidden="true"
        />

        <ul className="space-y-3">
          {sections.map((section) => {
            const isActive = active === section.id;
            return (
              <li key={section.id} className="relative">
                <a
                  href={`#${section.id}`}
                  onClick={(event) => {
                    event.preventDefault();
                    navigateTo(section.id);
                  }}
                  aria-current={isActive ? "location" : undefined}
                  aria-label={`${section.index} ${section.label}`}
                  className="group relative flex items-center gap-2 py-1 focus-visible:rounded-sm"
                >
                  {isActive && (
                    <motion.span
                      layoutId="home-anchor-indicator"
                      className="absolute -left-[18.5px] top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-accent"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                  <span
                    className={`label tabular transition-colors duration-300 ${
                      isActive ? "text-accent" : "text-faint group-hover:text-ink"
                    }`}
                  >
                    {section.index}
                  </span>
                  <span
                    className={`hidden text-[11px] tracking-[0.04em] transition-colors duration-300 min-[1460px]:inline-block ${
                      isActive
                        ? "font-medium text-ink"
                        : "text-faint group-hover:text-muted"
                    }`}
                  >
                    {section.label}
                  </span>
                  <span
                    aria-hidden="true"
                    className="glass pointer-events-none absolute left-full top-1/2 ml-2 -translate-y-1/2 whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] text-ink opacity-0 transition-all duration-200 group-hover:translate-x-0.5 group-hover:opacity-100 group-focus-visible:translate-x-0.5 group-focus-visible:opacity-100 min-[1460px]:hidden"
                  >
                    {section.label}
                  </span>
                </a>
              </li>
            );
          })}
        </ul>
      </div>
    </motion.nav>
  );
}

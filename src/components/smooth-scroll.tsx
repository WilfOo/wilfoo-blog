"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";

let lenisInstance: Lenis | null = null;

export function getCenteredScrollTop(el: HTMLElement): number {
  const rect = el.getBoundingClientRect();
  const cs = window.getComputedStyle(el);
  const padTop = parseFloat(cs.paddingTop) || 0;
  const padBottom = parseFloat(cs.paddingBottom) || 0;
  const contentTop = rect.top + window.scrollY + padTop;
  const contentHeight = Math.max(0, rect.height - padTop - padBottom);
  const vh = window.innerHeight;
  const maxScroll = Math.max(0, document.documentElement.scrollHeight - vh);

  if (el.dataset.scrollAlign === "top") {
    return 0;
  }

  if (contentHeight <= vh) {
    const centered = contentTop - (vh - contentHeight) / 2;
    return Math.min(maxScroll, Math.max(0, Math.round(centered)));
  }

  const headerOffset = 72;
  return Math.min(maxScroll, Math.max(0, Math.round(contentTop - headerOffset)));
}

export function scrollToPosition(
  y: number,
  options?: { duration?: number; immediate?: boolean },
) {
  const immediate = options?.immediate ?? false;
  const duration = immediate ? 0 : (options?.duration ?? 1.05);
  if (lenisInstance) {
    lenisInstance.scrollTo(y, { duration, immediate });
  } else {
    window.scrollTo({ top: y, behavior: immediate ? "auto" : "smooth" });
  }
}

export function scrollToCentered(
  el: HTMLElement,
  options?: { duration?: number; immediate?: boolean },
) {
  const targetY = getCenteredScrollTop(el);
  scrollToPosition(targetY, options);
  return targetY;
}

export function getLenisVelocity(): number {
  return lenisInstance ? Math.abs(lenisInstance.velocity) : 0;
}

export function scrollToTop(immediate = false) {
  scrollToPosition(0, { duration: 1.15, immediate });
}

export function stopScroll() {
  lenisInstance?.stop();
}

export function startScroll() {
  lenisInstance?.start();
}

/**
 * Lenis smooth scrolling. Disabled entirely for users who ask for reduced
 * motion — the page then uses the browser's native scrolling.
 */
export function SmoothScroll() {
  const pathname = usePathname();
  const firstLoad = useRef(true);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const lenis = new Lenis({
      duration: 1.15,
      lerp: 0.09,
      wheelMultiplier: 1,
      touchMultiplier: 1.4,
      smoothWheel: true,
      syncTouch: false,
      anchors: false,
    });
    lenisInstance = lenis;

    let frame = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      frame = requestAnimationFrame(raf);
    };
    frame = requestAnimationFrame(raf);

    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented) return;
      const anchor = (event.target as HTMLElement | null)?.closest<HTMLAnchorElement>(
        'a[href^="#"]',
      );
      if (!anchor) return;
      const hash = anchor.getAttribute("href");
      if (!hash || hash === "#") return;
      const el = document.getElementById(decodeURIComponent(hash.slice(1)));
      if (!el) return;
      event.preventDefault();
      if (el.hasAttribute("data-scroll-center")) {
        scrollToCentered(el, { duration: 1.05 });
      } else {
        const targetY = Math.max(0, Math.round(el.getBoundingClientRect().top + window.scrollY - 96));
        lenis.scrollTo(targetY, { duration: 1.1 });
      }
      window.history.replaceState(null, "", hash);
    };
    document.addEventListener("click", onClick);

    const onResize = () => lenis.resize();
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("click", onClick);
      window.removeEventListener("resize", onResize);
      lenis.destroy();
      lenisInstance = null;
    };
  }, []);

  useEffect(() => {
    if (firstLoad.current) {
      firstLoad.current = false;
      return;
    }
    document.documentElement.classList.remove("theme-reveal");
    lenisInstance?.scrollTo(0, { immediate: true, force: true });
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

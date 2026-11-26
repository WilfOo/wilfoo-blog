"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { generateContours, type ContourData } from "@/lib/contour";

function build(width: number, height: number, seed: number) {
  return generateContours({
    width,
    height,
    seed,
    cell: 10,
    levels: 5,
    step: 0.1,
    smoothing: 2,
    majorEvery: 4,
  });
}

/**
 * The page background: a contour map generated fresh on every visit, with a
 * very slight scroll + pointer parallax.
 *
 * The parallax is driven with a native scroll listener instead of Framer's
 * useScroll/useTransform. Framer Motion replaces transform animations with a
 * crossfade when prefers-reduced-motion is set, which freezes scroll-linked
 * motion on some desktop Chrome installs. This motion is entirely user-driven
 * (scrolling, moving the pointer), so it should keep working there.
 */
export function ContourBackground() {
  // Deliberately empty on the server: the 170 KB of path data is generated
  // in the browser, keeping the HTML lean. The grid/gradient paint instantly.
  const [art, setArt] = useState<ContourData>({ width: 1600, height: 1000, paths: [] });
  const seedRef = useRef(20260918);
  const layerRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef(0);

  useEffect(() => {
    seedRef.current = (Date.now() ^ ((Math.random() * 0xffffffff) | 0)) >>> 0;
    let timer: number | undefined;

    const draw = () => {
      setArt(build(window.innerWidth, Math.max(window.innerHeight, 900), seedRef.current));
    };

    draw();
    const onResize = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(draw, 240);
    };
    window.addEventListener("resize", onResize);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  useEffect(() => {
    const layer = layerRef.current;
    if (!layer) return;

    let scrollFrame = 0;
    let pointerFrame = 0;
    let pointerX = 0;
    let pointerY = 0;
    let targetX = 0;
    let targetY = 0;

    const draw = () => {
      const shift = Math.max(-1, Math.min(1, scrollRef.current / 1600)) * -90;
      layer.style.transform = `translate3d(${pointerX.toFixed(2)}px, ${(shift + pointerY).toFixed(2)}px, 0)`;
    };

    const scheduleScroll = () => {
      if (scrollFrame) return;
      scrollFrame = requestAnimationFrame(() => {
        scrollFrame = 0;
        draw();
      });
    };

    const onScroll = () => {
      scrollRef.current = window.scrollY;
      scheduleScroll();
    };

    const tickPointer = () => {
      const dx = targetX - pointerX;
      const dy = targetY - pointerY;
      pointerX += dx * 0.12;
      pointerY += dy * 0.12;
      draw();
      if (Math.abs(dx) > 0.1 || Math.abs(dy) > 0.1) {
        pointerFrame = requestAnimationFrame(tickPointer);
      } else {
        pointerFrame = 0;
      }
    };

    const onPointerMove = (event: PointerEvent) => {
      targetX = (event.clientX / window.innerWidth - 0.5) * 26;
      targetY = (event.clientY / window.innerHeight - 0.5) * 18;
      if (!pointerFrame) pointerFrame = requestAnimationFrame(tickPointer);
    };

    scrollRef.current = window.scrollY;
    draw();
    window.addEventListener("scroll", onScroll, { passive: true });

    // Coarse pointers (touch) have no hover position worth following.
    const finePointer = window.matchMedia("(pointer: fine)").matches;
    if (finePointer) {
      window.addEventListener("pointermove", onPointerMove, { passive: true });
    }

    return () => {
      if (scrollFrame) cancelAnimationFrame(scrollFrame);
      if (pointerFrame) cancelAnimationFrame(pointerFrame);
      window.removeEventListener("scroll", onScroll);
      if (finePointer) window.removeEventListener("pointermove", onPointerMove);
    };
  }, []);

  const paths = useMemo(
    () =>
      art.paths.map((path, index) => (
        <path
          key={index}
          d={path.d}
          className={path.major ? "contour-major" : "contour-weak"}
        />
      )),
    [art],
  );

  return (
    <div className="site-canvas" aria-hidden="true">
      <div className="site-glow" />
      <div className="site-grid" />
      <div className="contour-stage">
        <div ref={layerRef} className="contour-parallax absolute -inset-[4%]">
          <svg
            className="contour-svg h-full w-full transition-opacity duration-[1200ms]"
            style={{ opacity: art.paths.length ? 1 : 0 }}
            viewBox={`0 0 ${art.width} ${art.height}`}
            preserveAspectRatio="xMidYMid slice"
            focusable="false"
          >
            {paths}
          </svg>
        </div>
      </div>
      <div className="site-grain" />
    </div>
  );
}

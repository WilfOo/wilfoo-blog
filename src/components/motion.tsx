"use client";

import { useRef, type ReactNode } from "react";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import { cn } from "@/lib/utils";

const EASE = [0.16, 1, 0.3, 1] as const;

/* ------------------------------------------------------------------ */
/*  Scroll reveals                                                     */
/* ------------------------------------------------------------------ */
export function Reveal({
  children,
  className,
  delay = 0,
  y = 26,
  once = true,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  once?: boolean;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, margin: "-8% 0px -8% 0px" }}
      transition={{ duration: 0.9, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

export function Stagger({
  children,
  className,
  delay = 0,
  gap = 0.08,
  once = true,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  gap?: number;
  once?: boolean;
}) {
  return (
    <motion.div
      className={className}
      variants={{
        hidden: {},
        show: { transition: { staggerChildren: gap, delayChildren: delay } },
      }}
      initial="hidden"
      whileInView="show"
      viewport={{ once, margin: "-6% 0px -6% 0px" }}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  className,
  y = 22,
}: {
  children: ReactNode;
  className?: string;
  y?: number;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      variants={{
        hidden: reduce ? { opacity: 1 } : { opacity: 0, y },
        show: { opacity: 1, y: 0, transition: { duration: 0.85, ease: EASE } },
      }}
    >
      {children}
    </motion.div>
  );
}

/** A single line that rises out of a mask — used by the hero. */
export function Rise({
  children,
  className,
  delay = 0,
  duration = 1.1,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
}) {
  const reduce = useReducedMotion();
  return (
    <span className={cn("inline-block overflow-hidden pb-[0.08em] align-bottom", className)}>
      <motion.span
        className="inline-block will-change-transform"
        initial={reduce ? false : { y: "115%" }}
        animate={{ y: 0 }}
        transition={{ duration, delay, ease: EASE }}
      >
        {children}
      </motion.span>
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  Parallax                                                           */
/* ------------------------------------------------------------------ */
export function Parallax({
  children,
  className,
  distance = 70,
  scale = false,
}: {
  children: ReactNode;
  className?: string;
  distance?: number;
  scale?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [distance, -distance]);
  const s = useTransform(scrollYProgress, [0, 0.5, 1], scale ? [0.96, 1, 1.02] : [1, 1, 1]);

  return (
    <div ref={ref} className={className}>
      <motion.div style={reduce ? undefined : { y, scale: s }}>{children}</motion.div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Spotlight cards                                                    */
/* ------------------------------------------------------------------ */
function useSpotlight() {
  const ref = useRef<HTMLElement | null>(null);

  const onPointerMove = (event: React.PointerEvent) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${event.clientX - rect.left}px`);
    el.style.setProperty("--my", `${event.clientY - rect.top}px`);
  };

  return { ref, onPointerMove };
}

export function SpotlightCard({
  children,
  className,
  as = "div",
}: {
  children: ReactNode;
  className?: string;
  as?: "div" | "article" | "li";
}) {
  const reduce = useReducedMotion();
  const { ref, onPointerMove } = useSpotlight();
  const Component = motion[as];

  return (
    <Component
      // @ts-expect-error — the ref type is shared by all three elements
      ref={ref}
      className={cn("spotlight", className)}
      onPointerMove={onPointerMove}
      whileHover={reduce ? undefined : { y: -3, scale: 1.005 }}
      transition={{ type: "spring", stiffness: 300, damping: 30, mass: 0.6 }}
    >
      {children}
    </Component>
  );
}

export function SpotlightLink({
  href,
  children,
  className,
  onClick,
}: {
  href: string;
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}) {
  const reduce = useReducedMotion();
  const { ref, onPointerMove } = useSpotlight();

  return (
    <motion.a
      href={href}
      onClick={onClick}
      ref={ref as React.Ref<HTMLAnchorElement>}
      className={cn("spotlight", className)}
      onPointerMove={onPointerMove}
      whileHover={reduce ? undefined : { y: -3, scale: 1.005 }}
      whileTap={reduce ? undefined : { scale: 0.995 }}
      transition={{ type: "spring", stiffness: 300, damping: 30, mass: 0.6 }}
    >
      {children}
    </motion.a>
  );
}

/* ------------------------------------------------------------------ */
/*  Spring feedback                                                    */
/* ------------------------------------------------------------------ */
export function SpringTap({
  children,
  className,
  onClick,
  ...rest
}: React.ComponentProps<typeof motion.button>) {
  const reduce = useReducedMotion();
  return (
    <motion.button
      className={className}
      onClick={onClick}
      whileHover={reduce ? undefined : { scale: 1.04 }}
      whileTap={reduce ? undefined : { scale: 0.93 }}
      transition={{ type: "spring", stiffness: 420, damping: 18, mass: 0.5 }}
      {...rest}
    >
      {children}
    </motion.button>
  );
}

/** Button whose label magnets toward the pointer by a few pixels. */
export function Magnetic({
  children,
  className,
  strength = 6,
}: {
  children: ReactNode;
  className?: string;
  strength?: number;
}) {
  const reduce = useReducedMotion();
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const x = useSpring(rawX, { stiffness: 240, damping: 18 });
  const y = useSpring(rawY, { stiffness: 240, damping: 18 });

  return (
    <motion.span
      className={cn("inline-block", className)}
      style={reduce ? undefined : { x, y }}
      onPointerMove={(event) => {
        if (reduce) return;
        const rect = event.currentTarget.getBoundingClientRect();
        rawX.set(((event.clientX - rect.left) / rect.width - 0.5) * strength * 2);
        rawY.set(((event.clientY - rect.top) / rect.height - 0.5) * strength * 2);
      }}
      onPointerLeave={() => {
        rawX.set(0);
        rawY.set(0);
      }}
    >
      {children}
    </motion.span>
  );
}

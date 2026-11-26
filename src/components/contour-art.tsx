import { generateContours } from "@/lib/contour";
import { cn } from "@/lib/utils";

type Props = {
  seed: string | number;
  width?: number;
  height?: number;
  levels?: number;
  cell?: number;
  frequency?: number;
  className?: string;
  /** Path opacity, 0–1. Card art should stay quiet. */
  opacity?: number;
  majorEvery?: number;
};

/** A deterministic contour thumbnail — one unique terrain per slug. */
export function ContourArt({
  seed,
  width = 720,
  height = 480,
  levels = 5,
  cell = 9,
  frequency = 0.0024,
  className,
  opacity = 0.55,
  majorEvery = 4,
}: Props) {
  const numericSeed =
    typeof seed === "number"
      ? seed
      : Array.from(seed).reduce((acc, char) => (acc * 31 + char.charCodeAt(0)) >>> 0, 7);

  const art = generateContours({
    width,
    height,
    seed: numericSeed,
    levels,
    cell,
    frequency,
    smoothing: 2,
    majorEvery,
  });

  return (
    <svg
      className={cn("contour-art h-full w-full", className)}
      viewBox={`0 0 ${art.width} ${art.height}`}
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      style={{ opacity }}
    >
      {art.paths.map((path, index) => (
        <path key={index} d={path.d} strokeDasharray={path.major ? "4 4" : undefined} />
      ))}
    </svg>
  );
}

import localFont from "next/font/local";

/**
 * Latin sans — Inter variable (self-hosted, 48 KB).
 * CJK falls back to the platform's best sans (PingFang / YaHei / Noto Sans CJK)
 * so we never ship a megabyte of Chinese webfont.
 */
export const sans = localFont({
  src: [{ path: "../fonts/inter-latin.woff2", weight: "100 900", style: "normal" }],
  variable: "--font-inter",
  display: "swap",
  preload: true,
  fallback: [
    "-apple-system",
    "BlinkMacSystemFont",
    "PingFang SC",
    "Hiragino Sans GB",
    "Microsoft YaHei",
    "Noto Sans CJK SC",
    "Source Han Sans SC",
    "sans-serif",
  ],
  adjustFontFallback: false,
});

/** Display serif — Instrument Serif (regular + italic), for one or two words at a time. */
export const serif = localFont({
  src: [
    { path: "../fonts/instrument-serif-latin.woff2", weight: "400", style: "normal" },
    { path: "../fonts/instrument-serif-italic-latin.woff2", weight: "400", style: "italic" },
  ],
  variable: "--font-instrument",
  display: "swap",
  preload: true,
  fallback: ["Songti SC", "Noto Serif CJK SC", "Source Han Serif SC", "Georgia", "serif"],
  adjustFontFallback: false,
});

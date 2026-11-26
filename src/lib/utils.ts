export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

const dateFormatter = new Intl.DateTimeFormat("zh-CN", {
  timeZone: "Asia/Shanghai",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

const longDateFormatter = new Intl.DateTimeFormat("zh-CN", {
  timeZone: "Asia/Shanghai",
  year: "numeric",
  month: "long",
  day: "numeric",
});

/** 2026.09.18 */
export function formatDate(date: string | Date) {
  const parts = dateFormatter.formatToParts(new Date(date));
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  return `${get("year")}.${get("month")}.${get("day")}`;
}

/** 2026 年 9 月 18 日 */
export function formatLongDate(date: string | Date) {
  return longDateFormatter.format(new Date(date));
}

const yearFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Shanghai",
  year: "numeric",
});

export function yearOf(date: string | Date) {
  return yearFormatter.format(new Date(date));
}

export function isoDate(date: string | Date) {
  return new Date(date).toISOString();
}

/** Zero-padded index: 01, 02 … */
export function pad(n: number, width = 2) {
  return String(n).padStart(width, "0");
}

export function slugifyHeading(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .replace(/\s+/g, "-");
}

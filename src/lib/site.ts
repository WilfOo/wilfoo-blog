export const site = {
  name: "Wilfred",
  title: "Wilfred — 系统、数据与安静的计算",
  shortTitle: "Wilfred — 系统、数据与安静的计算",
  description:
    "Wilfred 的个人博客，记录系统、工具和日常折腾过的事。",
  url: "https://wilfoo.com",
  locale: "zh-CN",
  author: "Wilfred",
  github: "https://github.com/WilfOo",
  rss: "/feed.xml",
  since: 2026,
} as const;

export const nav = [
  { href: "/writing/", label: "写作", en: "Writing", index: "01" },
  { href: "/archives/", label: "归档", en: "Archive", index: "02" },
  { href: "/tags/", label: "标签", en: "Tags", index: "03" },
  { href: "/about/", label: "关于", en: "About", index: "04" },
] as const;

export const social = [
  { href: site.github, label: "GitHub", hint: "WilfOo" },
  { href: site.rss, label: "RSS", hint: "/feed.xml" },
] as const;

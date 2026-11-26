export type SearchItem = {
  slug: string;
  title: string;
  url: string;
  summary: string;
  tags: string[];
  date: string;
  content: string;
};

/** Tokenized, case-insensitive scoring: title > tags > summary > body. */
export function filterSearch(items: SearchItem[], query: string) {
  const tokens = query
    .toLowerCase()
    .split(/\s+/)
    .map((t) => t.trim())
    .filter(Boolean);
  if (!tokens.length) return items;

  return items
    .map((item) => {
      const title = item.title.toLowerCase();
      const tags = item.tags.join(" ").toLowerCase();
      const summary = item.summary.toLowerCase();
      const content = item.content.toLowerCase();
      let score = 0;
      for (const token of tokens) {
        if (!title.includes(token) && !tags.includes(token) && !summary.includes(token) && !content.includes(token)) {
          return null;
        }
        if (title.includes(token)) score += 12;
        if (tags.includes(token)) score += 6;
        if (summary.includes(token)) score += 3;
        if (content.includes(token)) score += 1;
      }
      return { item, score };
    })
    .filter((entry): entry is { item: SearchItem; score: number } => entry !== null)
    .sort((a, b) => b.score - a.score || +new Date(b.item.date) - +new Date(a.item.date))
    .map((entry) => entry.item);
}

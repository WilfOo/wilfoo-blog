import type { MetadataRoute } from "next";
import { getAllPosts, getAllTags } from "@/lib/posts";
import { site } from "@/lib/site";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const posts = getAllPosts();
  const tags = getAllTags();

  const pages: MetadataRoute.Sitemap = [
    { url: `${site.url}/`, lastModified: posts[0]?.date, priority: 1 },
    { url: `${site.url}/writing/`, lastModified: posts[0]?.date, priority: 0.9 },
    { url: `${site.url}/archives/`, lastModified: posts[0]?.date, priority: 0.7 },
    { url: `${site.url}/tags/`, lastModified: posts[0]?.date, priority: 0.6 },
    { url: `${site.url}/about/`, priority: 0.6 },
  ];

  return [
    ...pages,
    ...posts.map((post) => ({
      url: `${site.url}/posts/${post.slug}/`,
      lastModified: post.date,
      priority: 0.8,
    })),
    ...tags.map(({ tag }) => ({
      url: `${site.url}/tags/${encodeURIComponent(tag)}/`,
      priority: 0.4,
    })),
  ];
}

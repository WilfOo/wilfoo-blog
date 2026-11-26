import type { Metadata } from "next";
import { getSearchItems } from "@/lib/posts";
import { PageHeader } from "@/components/page-header";
import { SearchClient } from "@/components/search-client";

export const metadata: Metadata = {
  title: "搜索",
  description: "搜索 Wilfred 的文章。",
  alternates: { canonical: "/search/" },
  robots: { index: false, follow: true },
};

export default function SearchPage() {
  const items = getSearchItems();

  return (
    <div className="page-shell pt-32 pb-10 md:pt-40">
      <PageHeader
        index="05"
        label="Search"
        title="搜索"
        description="本地静态索引，不发服务端请求。"
        meta={`${items.length} 篇已索引`}
      />
      <SearchClient items={items} />
    </div>
  );
}

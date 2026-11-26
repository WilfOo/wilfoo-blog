import { getSearchItems } from "@/lib/posts";

export const dynamic = "force-static";

export function GET() {
  return new Response(JSON.stringify(getSearchItems()), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "public, max-age=300",
    },
  });
}

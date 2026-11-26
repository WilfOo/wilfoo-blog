import Link from "next/link";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { nav } from "@/lib/site";

export default function NotFound() {
  return (
    <div className="page-shell flex min-h-[85svh] flex-col justify-center pt-32 pb-16">
      <span className="label text-accent">404 / Off the map</span>
      <h1 className="display mt-6 text-[clamp(5rem,18vw,13rem)] leading-[0.82] text-ink">
        Lost
        <span className="serif-accent text-muted">.</span>
      </h1>
      <p className="mt-8 max-w-md text-sm leading-7 text-muted">
        这张地形图上没有你要找的页面。可能是链接旧了，也可能是我把文件挪走了。
      </p>
      <div className="mt-10 flex flex-wrap items-center gap-3">
        <Link
          href="/"
          className="group inline-flex items-center gap-2 rounded-full border border-line-strong px-4 py-2 text-sm text-ink transition-colors hover:border-ink"
        >
          <ArrowLeft
            size={14}
            strokeWidth={1.5}
            className="transition-transform duration-500 group-hover:-translate-x-1"
          />
          回到首页
        </Link>
        {nav.slice(0, 3).map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="group inline-flex items-center gap-1.5 px-2 py-2 text-sm text-muted transition-colors hover:text-ink"
          >
            {item.label}
            <ArrowUpRight
              size={12}
              strokeWidth={1.5}
              className="transition-transform duration-500 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
            />
          </Link>
        ))}
      </div>
    </div>
  );
}

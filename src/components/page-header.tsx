import type { ReactNode } from "react";

export function PageHeader({
  index,
  label,
  title,
  description,
  meta,
  children,
}: {
  index: string;
  label: string;
  title: string;
  description?: string;
  meta?: string;
  children?: ReactNode;
}) {
  return (
    <header>
      <div className="flex items-baseline justify-between gap-4 border-t border-line pt-5">
        <div className="flex items-baseline gap-4 md:gap-6">
          <span className="label tabular text-accent">{index}</span>
          <span className="label text-ink">{label}</span>
        </div>
        {meta && <span className="label tabular">{meta}</span>}
      </div>

      <div className="mt-10 grid items-end gap-8 md:mt-14 md:grid-cols-12">
        <h1 className="display col-span-12 text-[clamp(3.4rem,9vw,7.5rem)] text-ink md:col-span-7">
          {title}
        </h1>
        <div className="col-span-12 md:col-span-4 md:col-start-9">
          {description && (
            <p className="max-w-sm text-sm leading-7 text-muted">{description}</p>
          )}
          {children}
        </div>
      </div>
    </header>
  );
}

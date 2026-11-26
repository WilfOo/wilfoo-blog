"use client";

import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";
import { MOTION_STORAGE_KEY } from "@/lib/motion";

/** Footer control: full motion is the default; this can defer to the OS. */
export function MotionToggle() {
  const [full, setFull] = useState<boolean | null>(null);

  useEffect(() => {
    setFull(localStorage.getItem(MOTION_STORAGE_KEY) !== "system");
  }, []);

  if (full === null) return null;

  return (
    <button
      type="button"
      onClick={() => {
        if (full) localStorage.setItem(MOTION_STORAGE_KEY, "system");
        else localStorage.removeItem(MOTION_STORAGE_KEY);
        window.location.reload();
      }}
      className="group flex items-center gap-2 rounded-full border border-line px-3 py-1.5 text-muted transition-colors hover:border-line-strong hover:text-ink"
      aria-label={full ? "关闭完整动效，跟随系统设置" : "开启完整动效"}
      title={full ? "当前：完整动效（点击恢复跟随系统）" : "当前：跟随系统（点击开启完整动效）"}
    >
      <Sparkles
        size={13}
        strokeWidth={1.5}
        className={full ? "text-accent" : "text-faint"}
      />
      <span className="label">{full ? "动效 On" : "动效 Auto"}</span>
    </button>
  );
}

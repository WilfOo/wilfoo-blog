"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import { SpringTap } from "@/components/motion";

export function ThemeToggle({ className = "" }: { className?: string }) {
  const { theme, toggleTheme } = useTheme();

  return (
    <SpringTap
      type="button"
      onClick={(event) => toggleTheme({ x: event.clientX, y: event.clientY })}
      aria-label={theme === "dark" ? "切换到亮色模式" : "切换到暗色模式"}
      title={theme === "dark" ? "Light" : "Dark"}
      className={`inline-flex h-9 w-9 items-center justify-center rounded-full border border-transparent text-ink transition-colors hover:border-line hover:bg-card ${className}`}
    >
      <span className="relative block h-4 w-4">
        <Moon
          size={15}
          strokeWidth={1.5}
          className="absolute inset-0 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] dark:-rotate-90 dark:scale-50 dark:opacity-0"
        />
        <Sun
          size={15}
          strokeWidth={1.5}
          className="absolute inset-0 rotate-90 scale-50 opacity-0 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] dark:rotate-0 dark:scale-100 dark:opacity-100"
        />
      </span>
    </SpringTap>
  );
}

"use client";

import { Moon, Sun } from "lucide-react";
import { useApp } from "@/components/shared/Providers";

export function ThemeToggle() {
  const { toggleTheme, dict } = useApp();
  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={dict.nav.toggleTheme}
      title={dict.nav.toggleTheme}
      className="grid size-10 place-items-center rounded-xl border border-border bg-surface text-muted transition hover:bg-surface-2 hover:text-fg"
    >
      {/* Both icons rendered; CSS picks one, so there is no hydration mismatch. */}
      <Sun className="hidden size-5 dark:block" aria-hidden />
      <Moon className="size-5 dark:hidden" aria-hidden />
    </button>
  );
}

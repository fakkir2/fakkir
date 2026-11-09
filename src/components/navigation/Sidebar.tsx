"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowLeft,
  BrainCircuit,
  CalendarDays,
  Layers,
  LayoutDashboard,
  ListChecks,
  NotebookPen,
  Settings,
} from "lucide-react";
import { useApp } from "@/components/shared/Providers";
import { Logo } from "@/components/shared/Logo";
import { cn } from "@/lib/cn";

export function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const { locale, dict } = useApp();
  const pathname = usePathname();

  const items = [
    { slug: "dashboard", label: dict.app.dashboard, Icon: LayoutDashboard },
    { slug: "study-assistant", label: dict.app.assistant, Icon: BrainCircuit },
    { slug: "planner", label: dict.app.planner, Icon: CalendarDays },
    { slug: "notes", label: dict.app.notes, Icon: NotebookPen },
    { slug: "flashcards", label: dict.app.flashcards, Icon: Layers },
    { slug: "quizzes", label: dict.app.quizzes, Icon: ListChecks },
    { slug: "settings", label: dict.app.settings, Icon: Settings },
  ];

  return (
    <div className="flex h-full flex-col p-4">
      <div className="px-2 py-2">
        <Logo href={`/${locale}`} name={dict.brand.name} />
      </div>
      <nav className="mt-6 flex flex-1 flex-col gap-1" aria-label="App">
        {items.map(({ slug, label, Icon }) => {
          const href = `/${locale}/${slug}`;
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={slug}
              href={href}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition",
                active
                  ? "bg-brand/10 text-brand"
                  : "text-muted hover:bg-surface-2 hover:text-fg"
              )}
            >
              <Icon className="size-5" aria-hidden />
              {label}
            </Link>
          );
        })}
      </nav>
      <Link
        href={`/${locale}`}
        onClick={onNavigate}
        className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted transition hover:bg-surface-2 hover:text-fg"
      >
        <ArrowLeft className="rtl-flip size-5" aria-hidden />
        {dict.app.backToSite}
      </Link>
    </div>
  );
}

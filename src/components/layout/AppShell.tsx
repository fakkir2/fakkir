"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { LogOut, Menu, X } from "lucide-react";
import { useApp } from "@/components/shared/Providers";
import { useAuth } from "@/components/shared/AuthProvider";
import { Skeleton } from "@/components/ui/Skeleton";
import { SidebarContent } from "@/components/navigation/Sidebar";
import { LanguageSwitcher } from "@/components/navigation/LanguageSwitcher";
import { ThemeToggle } from "@/components/navigation/ThemeToggle";

export function AppShell({ children }: { children: React.ReactNode }) {
  const { locale, dict } = useApp();
  const pathname = usePathname();
  const router = useRouter();
  const { configured, supabase, user, ready, syncError } = useAuth();
  const [open, setOpen] = useState(false);

  const handleSignOut = async () => {
    if (supabase) await supabase.auth.signOut();
  };

  // Accounts mode: only signed-in users may see the app. (Data is also protected by Supabase Row Level Security.)
  useEffect(() => {
    if (configured && ready && !user) {
      router.replace(`/${locale}/login?next=${encodeURIComponent(pathname)}`);
    }
  }, [configured, ready, user, router, locale, pathname]);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const offscreen = locale === "ar" ? "100%" : "-100%";

  if (configured && (!ready || !user)) {
    return (
      <div className="grid min-h-screen place-items-center">
        <Skeleton className="h-8 w-40" />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <aside className="fixed inset-y-0 start-0 z-30 hidden w-64 border-e border-border bg-surface lg:block">
        <SidebarContent />
      </aside>

      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50"
              onClick={() => setOpen(false)}
              aria-hidden
            />
            <motion.aside
              initial={{ x: offscreen }}
              animate={{ x: 0 }}
              exit={{ x: offscreen }}
              transition={{ type: "tween", duration: 0.2 }}
              className="absolute inset-y-0 start-0 w-72 max-w-[85%] border-e border-border bg-surface"
            >
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label={dict.app.closeMenu}
                className="absolute end-3 top-4 grid size-9 place-items-center rounded-lg text-muted hover:bg-surface-2"
              >
                <X className="size-5" />
              </button>
              <SidebarContent onNavigate={() => setOpen(false)} />
            </motion.aside>
          </div>
        )}
      </AnimatePresence>

      <div className="lg:ps-64">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-border bg-bg/80 px-4 backdrop-blur-xl sm:px-6">
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label={dict.app.openMenu}
            className="grid size-10 place-items-center rounded-xl border border-border bg-surface lg:hidden"
          >
            <Menu className="size-5" />
          </button>
          <div className="ms-auto flex items-center gap-2">
            {user && (
              <button
                type="button"
                onClick={handleSignOut}
                className="inline-flex h-10 items-center gap-2 rounded-xl border border-border bg-surface px-3 text-sm font-medium text-muted transition hover:bg-surface-2 hover:text-fg"
              >
                <LogOut className="rtl-flip size-4" aria-hidden />
                <span className="hidden sm:inline">{dict.auth.signOut}</span>
                <span className="sr-only sm:hidden">{dict.auth.signOut}</span>
              </button>
            )}
            <LanguageSwitcher />
            <ThemeToggle />
          </div>
        </header>
        <main className="mx-auto max-w-6xl p-4 sm:p-6">
          {syncError && (
            <p role="alert" className="mb-4 rounded-xl border border-danger/30 bg-danger/10 px-4 py-2.5 text-sm text-danger">
              {dict.auth.syncError}
            </p>
          )}
          {children}
        </main>
      </div>
    </div>
  );
}

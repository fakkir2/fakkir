"use client";

import Link from "next/link";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { useApp } from "@/components/shared/Providers";
import { Logo } from "@/components/shared/Logo";
import { ThemeToggle } from "@/components/navigation/ThemeToggle";
import { LanguageSwitcher } from "@/components/navigation/LanguageSwitcher";
import { buttonStyles } from "@/components/ui/Button";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export function Navbar() {
  const { locale, dict } = useApp();
  const [open, setOpen] = useState(false);
  const loginHref = isSupabaseConfigured ? `/${locale}/login` : `/${locale}/dashboard`;
  const startHref = isSupabaseConfigured ? `/${locale}/signup` : `/${locale}/dashboard`;

  const links = [
    { href: `/${locale}`, label: dict.nav.home },
    { href: `/${locale}#features`, label: dict.nav.features },
    { href: `/${locale}#how-it-works`, label: dict.nav.howItWorks },
    { href: `/${locale}#about`, label: dict.nav.about },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-bg/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Logo href={`/${locale}`} name={dict.brand.name} />

        <nav className="hidden items-center gap-1 md:flex" aria-label="Main">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="rounded-lg px-3 py-2 text-sm font-medium text-muted transition hover:bg-surface-2 hover:text-fg"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <div className="hidden items-center gap-2 sm:flex">
            <LanguageSwitcher />
            <ThemeToggle />
          </div>
          <Link
            href={loginHref}
            className={buttonStyles({ variant: "ghost", className: "hidden lg:inline-flex" })}
          >
            {dict.nav.login}
          </Link>
          <Link
            href={startHref}
            className={buttonStyles({ className: "hidden sm:inline-flex" })}
          >
            {dict.nav.getStarted}
          </Link>
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-label={dict.nav.menu}
            className="grid size-10 place-items-center rounded-xl border border-border bg-surface md:hidden"
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden border-t border-border bg-bg md:hidden"
          >
            <div className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-3">
              {links.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-3 py-2.5 text-sm font-medium text-muted hover:bg-surface-2 hover:text-fg"
                >
                  {l.label}
                </Link>
              ))}
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <LanguageSwitcher />
                <ThemeToggle />
                <Link href={loginHref} className={buttonStyles({ variant: "secondary" })}>
                  {dict.nav.login}
                </Link>
                <Link href={startHref} className={buttonStyles()}>
                  {dict.nav.getStarted}
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

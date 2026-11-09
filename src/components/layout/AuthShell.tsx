"use client";

import { useApp } from "@/components/shared/Providers";
import { Logo } from "@/components/shared/Logo";
import { LanguageSwitcher } from "@/components/navigation/LanguageSwitcher";
import { ThemeToggle } from "@/components/navigation/ThemeToggle";

export function AuthShell({ children }: { children: React.ReactNode }) {
  const { locale, dict } = useApp();
  return (
    <div className="flex min-h-screen flex-col">
      <header className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
        <Logo href={`/${locale}`} name={dict.brand.name} />
        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <ThemeToggle />
        </div>
      </header>
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 pb-16">
        {children}
      </main>
    </div>
  );
}

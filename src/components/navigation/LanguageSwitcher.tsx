"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Languages } from "lucide-react";
import { useApp } from "@/components/shared/Providers";
import { localeMeta } from "@/i18n/config";

export function LanguageSwitcher() {
  const { locale, dict } = useApp();
  const pathname = usePathname();
  const target = locale === "en" ? "ar" : "en";

  const segments = pathname.split("/");
  segments[1] = target;
  const href = segments.join("/") || `/${target}`;

  return (
    <Link
      href={href}
      hrefLang={target}
      onClick={() => {
        document.cookie = `studymate-locale=${target}; path=/; max-age=31536000; samesite=lax`;
      }}
      aria-label={`${dict.nav.language}: ${localeMeta[target].label}`}
      className="inline-flex h-10 items-center gap-2 rounded-xl border border-border bg-surface px-3 text-sm font-medium text-muted transition hover:bg-surface-2 hover:text-fg"
    >
      <Languages className="size-4" aria-hidden />
      {localeMeta[target].label}
    </Link>
  );
}

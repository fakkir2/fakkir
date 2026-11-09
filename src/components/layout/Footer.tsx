"use client";

import Link from "next/link";
import { Mail } from "lucide-react";
import { useApp } from "@/components/shared/Providers";
import { Logo } from "@/components/shared/Logo";

export function Footer() {
  const { locale, dict } = useApp();
  const year = new Date().getFullYear();

  const nav = [
    { href: `/${locale}`, label: dict.nav.home },
    { href: `/${locale}#features`, label: dict.nav.features },
    { href: `/${locale}#how-it-works`, label: dict.nav.howItWorks },
    { href: `/${locale}#about`, label: dict.nav.about },
  ];
  const featureLinks = [
    { href: `/${locale}/study-assistant`, label: dict.features.items[0].title },
    { href: `/${locale}/flashcards`, label: dict.features.items[2].title },
    { href: `/${locale}/quizzes`, label: dict.features.items[3].title },
    { href: `/${locale}/planner`, label: dict.features.items[4].title },
    { href: `/${locale}/notes`, label: dict.features.items[5].title },
  ];

  const linkClass = "text-sm text-muted transition hover:text-fg";
  const headingClass = "mb-3 text-sm font-semibold";

  return (
    <footer className="border-t border-border bg-surface/50">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-4">
        <div>
          <Logo href={`/${locale}`} name={dict.brand.name} />
          <p className="mt-3 max-w-xs text-sm text-muted">{dict.footer.tagline}</p>
        </div>
        <div>
          <h3 className={headingClass}>{dict.footer.productTitle}</h3>
          <ul className="space-y-2">
            {nav.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className={linkClass}>{l.label}</Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className={headingClass}>{dict.footer.featuresTitle}</h3>
          <ul className="space-y-2">
            {featureLinks.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className={linkClass}>{l.label}</Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className={headingClass}>{dict.footer.contactTitle}</h3>
          <a href="mailto:hello@studymate.ai" className={`${linkClass} inline-flex items-center gap-2`}>
            <Mail className="size-4" aria-hidden />
            <span dir="ltr">hello@studymate.ai</span>
          </a>
        </div>
      </div>
      <div className="border-t border-border py-5 text-center text-xs text-muted">
        © {year} {dict.brand.name}. {dict.footer.rights}
      </div>
    </footer>
  );
}

"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useApp } from "@/components/shared/Providers";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export function CallToAction() {
  const { locale, dict } = useApp();

  return (
    <section className="mx-auto max-w-6xl px-4 pb-24 sm:px-6">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand to-brand-2 px-6 py-14 text-center text-white shadow-card sm:px-12">
        <div aria-hidden className="absolute -end-10 -top-10 size-48 rounded-full bg-white/10 blur-2xl" />
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">{dict.cta.title}</h2>
        <p className="mx-auto mt-3 max-w-xl text-white/85">{dict.cta.description}</p>
        <Link
          href={isSupabaseConfigured ? `/${locale}/signup` : `/${locale}/dashboard`}
          className="mt-8 inline-flex h-12 items-center gap-2 rounded-xl bg-white px-6 font-medium text-[#3b3bc4] transition hover:bg-white/90"
        >
          {dict.cta.button}
          <ArrowRight className="rtl-flip size-4" aria-hidden />
        </Link>
      </div>
    </section>
  );
}

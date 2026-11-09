"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, CalendarCheck, Flame, Sparkles } from "lucide-react";
import { useApp } from "@/components/shared/Providers";
import { buttonStyles } from "@/components/ui/Button";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export function Hero() {
  const { locale, dict } = useApp();
  const h = dict.hero;

  return (
    <section className="relative overflow-hidden">
      {/* background glow */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute start-1/2 top-[-10rem] size-[40rem] -translate-x-1/2 rounded-full bg-brand/20 blur-3xl rtl:translate-x-1/2" />
        <div className="absolute end-[-8rem] top-40 size-[24rem] rounded-full bg-brand-2/15 blur-3xl" />
      </div>

      <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 pb-20 pt-16 sm:px-6 lg:grid-cols-2 lg:pt-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium text-muted">
            <Sparkles className="size-3.5 text-brand" aria-hidden />
            {h.badge}
          </span>
          <h1 className="mt-5 text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
            <span className="bg-gradient-to-r from-brand to-brand-2 bg-clip-text text-transparent">
              {h.headline}
            </span>
          </h1>
          <p className="mt-5 max-w-xl text-lg text-muted">{h.description}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href={isSupabaseConfigured ? `/${locale}/signup` : `/${locale}/dashboard`}
              className={buttonStyles({ size: "lg" })}
            >
              {h.primaryCta}
              <ArrowRight className="rtl-flip size-4" aria-hidden />
            </Link>
            <Link
              href={`/${locale}#features`}
              className={buttonStyles({ variant: "secondary", size: "lg" })}
            >
              {h.secondaryCta}
            </Link>
          </div>
        </motion.div>

        {/* visual: mock chat card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="relative mx-auto w-full max-w-md"
        >
          <div className="rounded-3xl border border-border bg-surface p-5 shadow-card">
            <div className="mb-4 flex items-center gap-2">
              <span className="size-2.5 rounded-full bg-danger/70" />
              <span className="size-2.5 rounded-full bg-warning/70" />
              <span className="size-2.5 rounded-full bg-success/70" />
            </div>
            <div className="ms-auto w-fit max-w-[85%] rounded-2xl rounded-ee-md bg-gradient-to-br from-brand to-brand-2 px-4 py-2.5 text-sm text-white">
              {h.mockQuestion}
            </div>
            <div className="mt-3 flex gap-2.5">
              <span className="grid size-8 shrink-0 place-items-center rounded-full bg-surface-2 text-brand">
                <Sparkles className="size-4" aria-hidden />
              </span>
              <div className="rounded-2xl rounded-ss-md bg-surface-2 px-4 py-2.5 text-sm">
                {h.mockAnswer}
              </div>
            </div>
          </div>

          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -start-4 -bottom-5 flex items-center gap-2 rounded-2xl border border-border bg-surface px-3.5 py-2 text-xs font-medium shadow-card"
          >
            <CalendarCheck className="size-4 text-success" aria-hidden />
            {h.mockChipTasks}
          </motion.div>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -end-4 -top-5 flex items-center gap-2 rounded-2xl border border-border bg-surface px-3.5 py-2 text-xs font-medium shadow-card"
          >
            <Flame className="size-4 text-warning" aria-hidden />
            {h.mockChipStreak}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

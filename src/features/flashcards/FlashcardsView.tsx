"use client";

import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useApp } from "@/components/shared/Providers";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/Button";
import { format, formatNumber } from "@/lib/format";

export function FlashcardsView() {
  const { locale, dict } = useApp();
  const f = dict.flashcards;
  const cards = f.cards;
  const total = cards.length;

  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  const go = useCallback(
    (delta: number) => {
      setFlipped(false);
      setIndex((i) => (i + delta + total) % total);
    },
    [total]
  );

  // Arrow keys: the "next" direction follows the reading direction.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") return;
      const forward = locale === "ar" ? "ArrowLeft" : "ArrowRight";
      const back = locale === "ar" ? "ArrowRight" : "ArrowLeft";
      if (e.key === forward) go(1);
      if (e.key === back) go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, locale]);

  const card = cards[index];
  const face =
    "absolute inset-0 flex flex-col items-center justify-center gap-3 rounded-3xl border border-border p-8 text-center shadow-card [backface-visibility:hidden]";

  return (
    <>
      <PageHeader title={f.title} subtitle={f.subtitle} />

      <div className="mx-auto max-w-xl">
        <p className="mb-3 text-center text-sm text-muted">
          {format(f.cardOf, {
            current: formatNumber(index + 1, locale),
            total: formatNumber(total, locale),
          })}
        </p>
        <div
          className="mb-6 h-1.5 overflow-hidden rounded-full bg-surface-2"
          role="progressbar"
          aria-valuemin={1}
          aria-valuemax={total}
          aria-valuenow={index + 1}
        >
          <div
            className="h-full rounded-full bg-gradient-to-r from-brand to-brand-2 transition-all"
            style={{ width: `${((index + 1) / total) * 100}%` }}
          />
        </div>

        <button
          type="button"
          onClick={() => setFlipped((v) => !v)}
          aria-label={f.flip}
          className="block h-72 w-full [perspective:1200px] sm:h-80"
        >
          <motion.div
            animate={{ rotateY: flipped ? 180 : 0 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="relative size-full [transform-style:preserve-3d]"
          >
            <div className={`${face} bg-surface`}>
              <span className="text-xs font-semibold uppercase tracking-wide text-brand">
                {f.question}
              </span>
              <p dir="auto" className="text-xl font-semibold sm:text-2xl">
                {card.q}
              </p>
              <span className="mt-2 text-xs text-muted">{f.tapToFlip}</span>
            </div>
            <div
              className={`${face} bg-gradient-to-br from-brand to-brand-2 text-white`}
              style={{ transform: "rotateY(180deg)" }}
            >
              <span className="text-xs font-semibold uppercase tracking-wide text-white/80">
                {f.answer}
              </span>
              <p dir="auto" className="text-xl font-semibold sm:text-2xl">
                {card.a}
              </p>
            </div>
          </motion.div>
        </button>

        <div className="mt-6 flex items-center justify-between gap-3">
          <Button variant="secondary" onClick={() => go(-1)}>
            <ChevronLeft className="rtl-flip size-4" aria-hidden />
            {f.previous}
          </Button>
          <Button onClick={() => go(1)}>
            {f.next}
            <ChevronRight className="rtl-flip size-4" aria-hidden />
          </Button>
        </div>
      </div>
    </>
  );
}

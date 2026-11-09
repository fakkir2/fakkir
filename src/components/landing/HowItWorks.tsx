"use client";

import { motion } from "framer-motion";
import { Rocket, Sparkles, Upload, type LucideIcon } from "lucide-react";
import { useApp } from "@/components/shared/Providers";
import { Section } from "./Section";

const icons: LucideIcon[] = [Upload, Sparkles, Rocket];

export function HowItWorks() {
  const { locale, dict } = useApp();

  return (
    <div className="border-y border-border bg-surface/50">
      <Section id="how-it-works" title={dict.how.title} subtitle={dict.how.subtitle}>
        <ol className="grid gap-8 md:grid-cols-3">
          {dict.how.steps.map((step, i) => {
            const Icon = icons[i];
            return (
              <motion.li
                key={step.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: i * 0.1 }}
                className="relative text-center"
              >
                <span className="mx-auto grid size-16 place-items-center rounded-2xl bg-gradient-to-br from-brand to-brand-2 text-white shadow-card">
                  <Icon className="size-7" aria-hidden />
                </span>
                <span className="mt-4 block text-xs font-semibold text-brand">
                  {new Intl.NumberFormat(locale === "ar" ? "ar-EG" : "en").format(i + 1)}
                </span>
                <h3 className="mt-1 text-lg font-semibold">{step.title}</h3>
                <p className="mx-auto mt-1.5 max-w-xs text-sm text-muted">{step.description}</p>
              </motion.li>
            );
          })}
        </ol>
      </Section>
    </div>
  );
}

"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { useApp } from "@/components/shared/Providers";
import { Section } from "./Section";

export function Benefits() {
  const { dict } = useApp();

  return (
    <Section id="about" title={dict.benefits.title} subtitle={dict.benefits.subtitle}>
      <ul className="mx-auto grid max-w-3xl gap-3 sm:grid-cols-2">
        {dict.benefits.items.map((text, i) => (
          <motion.li
            key={text}
            initial={{ opacity: 0, x: -12 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.35, delay: i * 0.05 }}
            className="flex items-center gap-3 rounded-2xl border border-border bg-surface px-4 py-3.5 shadow-card sm:last:col-span-2"
          >
            <span className="grid size-7 shrink-0 place-items-center rounded-full bg-success/15 text-success">
              <Check className="size-4" aria-hidden />
            </span>
            <span className="font-medium">{text}</span>
          </motion.li>
        ))}
      </ul>
    </Section>
  );
}

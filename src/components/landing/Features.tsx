"use client";

import { motion } from "framer-motion";
import {
  BrainCircuit,
  CalendarDays,
  FileText,
  Layers,
  ListChecks,
  NotebookPen,
  type LucideIcon,
} from "lucide-react";
import { useApp } from "@/components/shared/Providers";
import { Card } from "@/components/ui/Card";
import { Section } from "./Section";

const icons: LucideIcon[] = [BrainCircuit, FileText, Layers, ListChecks, CalendarDays, NotebookPen];

export function Features() {
  const { dict } = useApp();

  return (
    <Section id="features" title={dict.features.title} subtitle={dict.features.subtitle}>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {dict.features.items.map((item, i) => {
          const Icon = icons[i];
          return (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.45, delay: i * 0.05 }}
              whileHover={{ y: -4 }}
            >
              <Card className="h-full p-6 transition-colors hover:border-brand/50">
                <span className="grid size-11 place-items-center rounded-xl bg-brand/10 text-brand">
                  <Icon className="size-5" aria-hidden />
                </span>
                <h3 className="mt-4 text-lg font-semibold">{item.title}</h3>
                <p className="mt-1.5 text-sm text-muted">{item.description}</p>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </Section>
  );
}

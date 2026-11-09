"use client";

import { useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { useApp } from "@/components/shared/Providers";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Skeleton } from "@/components/ui/Skeleton";
import { cn } from "@/lib/cn";
import {
  addDays,
  format,
  formatNumber,
  fromISODate,
  intlLocale,
  startOfWeek,
  toISODate,
  weekStartFor,
} from "@/lib/format";
import { TaskItem } from "./TaskItem";
import { useTasks } from "./useTasks";

export function PlannerView() {
  const { locale, dict } = useApp();
  const p = dict.planner;
  const { tasks, hydrated, addTask, toggleTask, deleteTask } = useTasks();

  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date(), weekStartFor(locale)));
  const [selected, setSelected] = useState(() => toISODate(new Date()));
  const [title, setTitle] = useState("");

  const intl = intlLocale(locale);
  const todayISO = toISODate(new Date());

  if (!hydrated) {
    return (
      <>
        <PageHeader title={p.title} subtitle={p.subtitle} />
        <Skeleton className="mb-4 h-24" />
        <Skeleton className="h-64" />
      </>
    );
  }

  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const weekdayFmt = new Intl.DateTimeFormat(intl, { weekday: "short" });
  const rangeFmt = new Intl.DateTimeFormat(intl, { month: "short", day: "numeric" });
  const longFmt = new Intl.DateTimeFormat(intl, { weekday: "long", month: "long", day: "numeric" });

  const dayTasks = tasks.filter((t) => t.date === selected);
  const doneCount = dayTasks.filter((t) => t.done).length;
  const percent = dayTasks.length ? Math.round((doneCount / dayTasks.length) * 100) : 0;

  const goToday = () => {
    setWeekStart(startOfWeek(new Date(), weekStartFor(locale)));
    setSelected(todayISO);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    addTask(title, selected);
    setTitle("");
  };

  return (
    <>
      <PageHeader title={p.title} subtitle={p.subtitle} />

      <Card className="mb-6 p-4">
        <div className="mb-4 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1">
            <button
              type="button"
              aria-label={p.prevWeek}
              onClick={() => setWeekStart((w) => addDays(w, -7))}
              className="grid size-9 place-items-center rounded-lg text-muted hover:bg-surface-2 hover:text-fg"
            >
              <ChevronLeft className="rtl-flip size-5" />
            </button>
            <button
              type="button"
              aria-label={p.nextWeek}
              onClick={() => setWeekStart((w) => addDays(w, 7))}
              className="grid size-9 place-items-center rounded-lg text-muted hover:bg-surface-2 hover:text-fg"
            >
              <ChevronRight className="rtl-flip size-5" />
            </button>
          </div>
          <p className="text-sm font-medium">
            {rangeFmt.format(days[0])} – {rangeFmt.format(days[6])}
          </p>
          <Button variant="secondary" size="sm" onClick={goToday}>
            {p.thisWeek}
          </Button>
        </div>

        <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
          {days.map((day) => {
            const iso = toISODate(day);
            const count = tasks.filter((t) => t.date === iso).length;
            const isSelected = iso === selected;
            return (
              <button
                key={iso}
                type="button"
                onClick={() => setSelected(iso)}
                aria-pressed={isSelected}
                className={cn(
                  "flex flex-col items-center gap-1 rounded-xl border px-1 py-2.5 text-xs transition sm:text-sm",
                  isSelected
                    ? "border-transparent bg-gradient-to-br from-brand to-brand-2 text-white shadow-card"
                    : "border-border bg-surface hover:bg-surface-2",
                  !isSelected && iso === todayISO && "border-brand"
                )}
              >
                <span className={cn(isSelected ? "text-white/85" : "text-muted")}>
                  {weekdayFmt.format(day)}
                </span>
                <span className="text-base font-semibold">{formatNumber(day.getDate(), locale)}</span>
                <span
                  className={cn(
                    "h-1.5 w-1.5 rounded-full",
                    count === 0 ? "bg-transparent" : isSelected ? "bg-white" : "bg-brand"
                  )}
                />
              </button>
            );
          })}
        </div>
      </Card>

      <Card className="p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-semibold">
            {format(p.tasksFor, { date: longFmt.format(fromISODate(selected)) })}
          </h2>
          {dayTasks.length > 0 && (
            <span className="text-sm text-muted">
              {format(p.completed, {
                done: formatNumber(doneCount, locale),
                total: formatNumber(dayTasks.length, locale),
              })}
            </span>
          )}
        </div>

        {dayTasks.length > 0 && (
          <div
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={percent}
            className="mb-4 h-2 overflow-hidden rounded-full bg-surface-2"
          >
            <div
              className="h-full rounded-full bg-gradient-to-r from-brand to-brand-2 transition-all"
              style={{ width: `${percent}%` }}
            />
          </div>
        )}

        {dayTasks.length === 0 ? (
          <EmptyState icon={CalendarDays} title={p.noTasksDay} />
        ) : (
          <ul className="space-y-2">
            {dayTasks.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                onToggle={() => toggleTask(task.id)}
                onDelete={() => deleteTask(task.id)}
              />
            ))}
          </ul>
        )}

        <form onSubmit={submit} className="mt-5 flex gap-2">
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={p.taskPlaceholder}
            aria-label={p.taskLabel}
            dir="auto"
            maxLength={120}
          />
          <Button type="submit" disabled={!title.trim()}>
            <Plus className="size-4" aria-hidden />
            {p.addTask}
          </Button>
        </form>
      </Card>
    </>
  );
}

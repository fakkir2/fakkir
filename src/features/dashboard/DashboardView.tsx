"use client";

import Link from "next/link";
import {
  BrainCircuit,
  CheckCircle2,
  Clock,
  Flame,
  Layers,
  ListChecks,
  NotebookPen,
  type LucideIcon,
} from "lucide-react";
import { useApp } from "@/components/shared/Providers";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { useAuth } from "@/components/shared/AuthProvider";
import { useProfile } from "@/hooks/useProfile";
import { TaskItem } from "@/features/planner/TaskItem";
import { useTasks } from "@/features/planner/useTasks";
import {
  addDays,
  format,
  formatNumber,
  intlLocale,
  startOfWeek,
  toISODate,
  weekStartFor,
} from "@/lib/format";

/** Sample study hours for the current week (demo data). */
const WEEKLY_HOURS = [2, 3.5, 1, 2.5, 0, 3, 0.5];

function StatCard({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <Card className="flex items-center gap-4 p-4">
      <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-brand/10 text-brand">
        <Icon className="size-5" aria-hidden />
      </span>
      <div className="min-w-0">
        <p className="truncate text-xs text-muted">{label}</p>
        <p className="text-xl font-bold">{value}</p>
      </div>
    </Card>
  );
}

export function DashboardView() {
  const { locale, dict } = useApp();
  const d = dict.dashboard;
  const { tasks, hydrated, toggleTask } = useTasks();
  const [profile] = useProfile();
  const { user } = useAuth();

  const name =
    profile.name.trim() ||
    user?.user_metadata?.full_name?.trim() ||
    user?.user_metadata?.name?.trim() ||
    user?.email?.split("@")[0] ||
    d.defaultName;

  const header = (
    <PageHeader title={format(d.welcome, { name })} subtitle={d.subtitle} />
  );

  if (!hydrated) {
    return (
      <>
        {header}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20" />
          ))}
        </div>
        <Skeleton className="mt-6 h-64" />
      </>
    );
  }

  const todayISO = toISODate(new Date());
  const todayTasks = tasks.filter((t) => t.date === todayISO);
  const doneCount = tasks.filter((t) => t.done).length;
  const hoursTotal = WEEKLY_HOURS.reduce((a, b) => a + b, 0);
  const maxHours = Math.max(...WEEKLY_HOURS);

  const weekStart = startOfWeek(new Date(), weekStartFor(locale));
  const weekdayFmt = new Intl.DateTimeFormat(intlLocale(locale), { weekday: "short" });

  const deadlineLabel = (days: number) =>
    days === 0 ? d.today : days === 1 ? d.tomorrow : format(d.inDays, { n: formatNumber(days, locale) });

  const quick = [
    { slug: "study-assistant", Icon: BrainCircuit, item: dict.features.items[0] },
    { slug: "flashcards", Icon: Layers, item: dict.features.items[2] },
    { slug: "quizzes", Icon: ListChecks, item: dict.features.items[3] },
    { slug: "notes", Icon: NotebookPen, item: dict.features.items[5] },
  ];

  return (
    <>
      {header}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={Clock}
          label={d.stats.studyTime}
          value={`${formatNumber(hoursTotal, locale)} ${d.units.hours}`}
        />
        <StatCard icon={CheckCircle2} label={d.stats.tasksDone} value={formatNumber(doneCount, locale)} />
        <StatCard
          icon={Flame}
          label={d.stats.streak}
          value={`${formatNumber(7, locale)} ${d.units.days}`}
        />
        <StatCard icon={Layers} label={d.stats.cards} value={formatNumber(48, locale)} />
      </div>

      <h2 className="mb-3 mt-8 text-sm font-semibold text-muted">{d.quickTools}</h2>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {quick.map(({ slug, Icon, item }) => (
          <Link
            key={slug}
            href={`/${locale}/${slug}`}
            className="group rounded-2xl border border-border bg-surface p-4 shadow-card transition hover:-translate-y-0.5 hover:border-brand/50"
          >
            <span className="grid size-10 place-items-center rounded-xl bg-gradient-to-br from-brand to-brand-2 text-white">
              <Icon className="size-5" aria-hidden />
            </span>
            <p className="mt-3 font-semibold">{item.title}</p>
            <p className="mt-0.5 line-clamp-2 text-xs text-muted">{item.description}</p>
          </Link>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card className="p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-semibold">{d.todayTasks}</h2>
              <Link href={`/${locale}/planner`} className="text-sm font-medium text-brand hover:underline">
                {d.viewPlanner}
              </Link>
            </div>
            {todayTasks.length === 0 ? (
              <p className="text-sm text-muted">{d.noTasks}</p>
            ) : (
              <ul className="space-y-2">
                {todayTasks.map((task) => (
                  <TaskItem key={task.id} task={task} onToggle={() => toggleTask(task.id)} />
                ))}
              </ul>
            )}
          </Card>

          <Card className="p-5">
            <h2 className="mb-4 font-semibold">{d.weekly}</h2>
            <div className="flex h-36 items-end gap-2">
              {WEEKLY_HOURS.map((h, i) => (
                <div key={i} className="flex flex-1 flex-col items-center gap-2">
                  <div className="flex w-full flex-1 items-end">
                    <div
                      className="w-full rounded-t-lg bg-gradient-to-t from-brand to-brand-2"
                      style={{ height: `${maxHours ? Math.max((h / maxHours) * 100, 4) : 4}%` }}
                      title={`${formatNumber(h, locale)} ${d.units.hours}`}
                    />
                  </div>
                  <span className="text-xs text-muted">{weekdayFmt.format(addDays(weekStart, i))}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-5">
            <h2 className="mb-4 font-semibold">{d.progress}</h2>
            <ul className="space-y-4">
              {d.progressItems.map((p) => (
                <li key={p.name}>
                  <div className="mb-1.5 flex justify-between text-sm">
                    <span>{p.name}</span>
                    <span className="text-muted">{formatNumber(p.value, locale)}%</span>
                  </div>
                  <div
                    role="progressbar"
                    aria-label={p.name}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={p.value}
                    className="h-2 overflow-hidden rounded-full bg-surface-2"
                  >
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-brand to-brand-2"
                      style={{ width: `${p.value}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="p-5">
            <h2 className="mb-4 font-semibold">{d.deadlines}</h2>
            <ul className="space-y-3">
              {d.deadlineItems.map((item) => (
                <li key={item.title} className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{item.title}</p>
                    <p className="text-xs text-muted">{item.course}</p>
                  </div>
                  <span className="shrink-0 rounded-full bg-warning/15 px-2.5 py-1 text-xs font-medium text-warning">
                    {deadlineLabel(item.days)}
                  </span>
                </li>
              ))}
            </ul>
          </Card>

          <Card className="p-5">
            <h2 className="mb-4 font-semibold">{d.activity}</h2>
            <ul className="space-y-4">
              {d.activityItems.map((item) => (
                <li key={item.text} className="flex gap-3">
                  <span className="mt-1.5 size-2 shrink-0 rounded-full bg-brand" aria-hidden />
                  <div>
                    <p className="text-sm">{item.text}</p>
                    <p className="text-xs text-muted">{item.time}</p>
                  </div>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>
    </>
  );
}

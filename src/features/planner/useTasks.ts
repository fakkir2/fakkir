"use client";

import { useCallback, useMemo } from "react";
import { useApp } from "@/components/shared/Providers";
import { useSyncedState } from "@/hooks/useSyncedState";
import { addDays, toISODate, uid } from "@/lib/format";
import type { Task } from "@/types";

/**
 * Tasks live in localStorage. Until the user changes something, the localized
 * sample tasks are shown (stored === null); the first edit persists them.
 */
export function useTasks() {
  const { dict } = useApp();
  const [stored, setStored, hydrated] = useSyncedState<Task[] | null>("studymate-tasks", null);

  const seed = useMemo<Task[]>(() => {
    const today = new Date();
    return dict.planner.seedTasks.map((t, i) => ({
      id: `seed-${i}`,
      title: t.title,
      date: toISODate(addDays(today, t.dayOffset)),
      done: false,
    }));
  }, [dict]);

  const tasks = stored ?? seed;

  const mutate = useCallback(
    (fn: (current: Task[]) => Task[]) => setStored((prev) => fn(prev ?? seed)),
    [setStored, seed]
  );

  const addTask = useCallback(
    (title: string, date: string) => {
      const clean = title.trim();
      if (!clean) return;
      mutate((current) => [...current, { id: uid(), title: clean, date, done: false }]);
    },
    [mutate]
  );

  const toggleTask = useCallback(
    (id: string) =>
      mutate((current) => current.map((t) => (t.id === id ? { ...t, done: !t.done } : t))),
    [mutate]
  );

  const deleteTask = useCallback(
    (id: string) => mutate((current) => current.filter((t) => t.id !== id)),
    [mutate]
  );

  return { tasks, hydrated, addTask, toggleTask, deleteTask };
}

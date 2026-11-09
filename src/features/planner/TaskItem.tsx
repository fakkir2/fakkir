"use client";

import { Check, Trash2 } from "lucide-react";
import { useApp } from "@/components/shared/Providers";
import { cn } from "@/lib/cn";
import type { Task } from "@/types";

export function TaskItem({
  task,
  onToggle,
  onDelete,
}: {
  task: Task;
  onToggle: () => void;
  onDelete?: () => void;
}) {
  const { dict } = useApp();

  return (
    <li className="flex items-center gap-3 rounded-xl border border-border bg-surface px-3.5 py-2.5">
      <button
        type="button"
        role="checkbox"
        aria-checked={task.done}
        aria-label={task.done ? dict.planner.markUndone : dict.planner.markDone}
        onClick={onToggle}
        className={cn(
          "grid size-6 shrink-0 place-items-center rounded-md border transition",
          task.done ? "border-brand bg-brand text-white" : "border-border hover:border-brand"
        )}
      >
        {task.done && <Check className="size-4" aria-hidden />}
      </button>
      <span
        dir="auto"
        className={cn("min-w-0 flex-1 break-words text-sm", task.done && "text-muted line-through")}
      >
        {task.title}
      </span>
      {onDelete && (
        <button
          type="button"
          onClick={onDelete}
          aria-label={dict.planner.deleteTask}
          className="grid size-8 shrink-0 place-items-center rounded-lg text-muted transition hover:bg-danger/10 hover:text-danger"
        >
          <Trash2 className="size-4" aria-hidden />
        </button>
      )}
    </li>
  );
}

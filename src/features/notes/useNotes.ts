"use client";

import { useCallback, useMemo } from "react";
import { useApp } from "@/components/shared/Providers";
import { useSyncedState } from "@/hooks/useSyncedState";
import { uid } from "@/lib/format";
import type { Note } from "@/types";

export function useNotes() {
  const { dict } = useApp();
  const [stored, setStored, hydrated] = useSyncedState<Note[] | null>("studymate-notes", null);

  const seed = useMemo<Note[]>(() => {
    const now = Date.now();
    return dict.notes.seedNotes.map((n, i) => ({
      id: `seed-${i}`,
      title: n.title,
      body: n.body,
      updatedAt: now - i * 86_400_000,
    }));
  }, [dict]);

  const notes = stored ?? seed;

  const saveNote = useCallback(
    (draft: { id?: string; title: string; body: string }) => {
      setStored((prev) => {
        const current = prev ?? seed;
        const now = Date.now();
        if (draft.id) {
          return current.map((n) =>
            n.id === draft.id ? { ...n, title: draft.title, body: draft.body, updatedAt: now } : n
          );
        }
        return [{ id: uid(), title: draft.title, body: draft.body, updatedAt: now }, ...current];
      });
    },
    [setStored, seed]
  );

  const deleteNote = useCallback(
    (id: string) => setStored((prev) => (prev ?? seed).filter((n) => n.id !== id)),
    [setStored, seed]
  );

  return { notes, hydrated, saveNote, deleteNote };
}

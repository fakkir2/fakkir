"use client";

import { useState } from "react";
import { NotebookPen, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { useApp } from "@/components/shared/Providers";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Skeleton } from "@/components/ui/Skeleton";
import { format, intlLocale } from "@/lib/format";
import type { Note } from "@/types";
import { NoteEditor } from "./NoteEditor";
import { useNotes } from "./useNotes";

export function NotesView() {
  const { locale, dict } = useApp();
  const n = dict.notes;
  const { notes, hydrated, saveNote, deleteNote } = useNotes();

  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<Note | "new" | null>(null);
  const [deleting, setDeleting] = useState<Note | null>(null);

  const newButton = (
    <Button onClick={() => setEditing("new")}>
      <Plus className="size-4" aria-hidden />
      {n.newNote}
    </Button>
  );

  if (!hydrated) {
    return (
      <>
        <PageHeader title={n.title} subtitle={n.subtitle} />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Skeleton className="h-40" />
          <Skeleton className="h-40" />
          <Skeleton className="h-40" />
        </div>
      </>
    );
  }

  const q = query.trim().toLowerCase();
  const visible = [...notes]
    .filter((note) => !q || `${note.title} ${note.body}`.toLowerCase().includes(q))
    .sort((a, b) => b.updatedAt - a.updatedAt);

  const dateFmt = new Intl.DateTimeFormat(intlLocale(locale), { dateStyle: "medium" });

  return (
    <>
      <PageHeader title={n.title} subtitle={n.subtitle} action={newButton} />

      <div className="relative mb-6 max-w-md">
        <Search
          className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted"
          aria-hidden
        />
        <Input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={n.searchPlaceholder}
          aria-label={dict.common.search}
          className="ps-9"
          dir="auto"
        />
      </div>

      {notes.length === 0 ? (
        <EmptyState icon={NotebookPen} title={n.empty} hint={n.emptyHint} action={newButton} />
      ) : visible.length === 0 ? (
        <EmptyState icon={Search} title={dict.ui.noResults} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((note) => (
            <Card key={note.id} className="flex flex-col p-5">
              <h3 dir="auto" className="font-semibold">
                {note.title}
              </h3>
              <p dir="auto" className="mt-2 line-clamp-4 flex-1 whitespace-pre-line text-sm text-muted">
                {note.body}
              </p>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-xs text-muted">
                  {format(n.updated, { date: dateFmt.format(note.updatedAt) })}
                </span>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => setEditing(note)}
                    aria-label={`${dict.common.edit}: ${note.title}`}
                    className="grid size-8 place-items-center rounded-lg text-muted hover:bg-surface-2 hover:text-fg"
                  >
                    <Pencil className="size-4" aria-hidden />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleting(note)}
                    aria-label={`${dict.common.delete}: ${note.title}`}
                    className="grid size-8 place-items-center rounded-lg text-muted hover:bg-danger/10 hover:text-danger"
                  >
                    <Trash2 className="size-4" aria-hidden />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal
        open={editing !== null}
        onClose={() => setEditing(null)}
        title={editing === "new" ? n.newNote : n.editNote}
      >
        {editing !== null && (
          <NoteEditor
            key={editing === "new" ? "new" : editing.id}
            note={editing === "new" ? null : editing}
            onCancel={() => setEditing(null)}
            onSave={(draft) => {
              saveNote(draft);
              setEditing(null);
            }}
          />
        )}
      </Modal>

      <Modal open={deleting !== null} onClose={() => setDeleting(null)} title={dict.ui.confirmDelete}>
        {deleting && (
          <>
            <p dir="auto" className="font-medium">
              {deleting.title}
            </p>
            <p className="mt-1 text-sm text-muted">{dict.ui.cannotUndo}</p>
            <div className="mt-5 flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setDeleting(null)}>
                {dict.common.cancel}
              </Button>
              <Button
                className="bg-danger! bg-none! text-white"
                onClick={() => {
                  deleteNote(deleting.id);
                  setDeleting(null);
                }}
              >
                {dict.common.delete}
              </Button>
            </div>
          </>
        )}
      </Modal>
    </>
  );
}

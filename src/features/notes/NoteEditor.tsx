"use client";

import { useState } from "react";
import { useApp } from "@/components/shared/Providers";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import type { Note } from "@/types";

export function NoteEditor({
  note,
  onSave,
  onCancel,
}: {
  note: Note | null;
  onSave: (draft: { id?: string; title: string; body: string }) => void;
  onCancel: () => void;
}) {
  const { dict } = useApp();
  const [title, setTitle] = useState(note?.title ?? "");
  const [body, setBody] = useState(note?.body ?? "");
  const canSave = title.trim() !== "" || body.trim() !== "";

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSave) return;
    onSave({
      id: note?.id,
      title: title.trim() || dict.notes.untitled,
      body: body.trim(),
    });
  };

  return (
    <form onSubmit={submit} className="space-y-3">
      <Input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder={dict.notes.noteTitle}
        aria-label={dict.notes.noteTitle}
        dir="auto"
        maxLength={100}
        autoFocus
      />
      <Textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder={dict.notes.noteBody}
        aria-label={dict.notes.noteBody}
        dir="auto"
        rows={8}
      />
      <div className="flex justify-end gap-2 pt-1">
        <Button type="button" variant="secondary" onClick={onCancel}>
          {dict.common.cancel}
        </Button>
        <Button type="submit" disabled={!canSave}>
          {dict.common.save}
        </Button>
      </div>
    </form>
  );
}

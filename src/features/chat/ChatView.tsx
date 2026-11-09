"use client";

import { useEffect, useRef, useState } from "react";
import { History, MessageSquare, Plus, RotateCcw, Send, Sparkles, Square, Trash2 } from "lucide-react";
import { useApp } from "@/components/shared/Providers";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { cn } from "@/lib/cn";
import { fetchAIStatus } from "@/services/ai";
import { useConversations } from "./useConversations";

function TypingIndicator({ label }: { label: string }) {
  return (
    <div className="flex gap-2.5" role="status" aria-live="polite">
      <span className="grid size-8 shrink-0 place-items-center rounded-full bg-surface-2 text-brand">
        <Sparkles className="size-4" aria-hidden />
      </span>
      <div className="flex items-center gap-1.5 rounded-2xl rounded-ss-md bg-surface-2 px-4 py-3">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="size-2 animate-bounce rounded-full bg-muted"
            style={{ animationDelay: `${i * 150}ms` }}
          />
        ))}
        <span className="sr-only">{label}</span>
      </div>
    </div>
  );
}

export function ChatView() {
  const { dict } = useApp();
  const a = dict.assistant;
  const chat = useConversations();
  const [input, setInput] = useState("");
  const [showHistory, setShowHistory] = useState(false);
  const [live, setLive] = useState<boolean | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let active = true;
    fetchAIStatus().then((value) => {
      if (active) setLive(value);
    });
    return () => {
      active = false;
    };
  }, []);

  const saved = chat.active?.messages ?? [];
  const streaming =
    chat.draft && chat.draft.conversationId === chat.activeId && chat.draft.content !== ""
      ? chat.draft
      : null;
  const messages = streaming
    ? [...saved, { id: "draft", role: "assistant" as const, content: streaming.content, createdAt: 0 }]
    : saved;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: streaming ? "auto" : "smooth",
      block: "end",
    });
  }, [messages.length, streaming?.content, chat.pending, chat.error]); // eslint-disable-line react-hooks/exhaustive-deps

  const submit = (text: string) => {
    if (!text.trim() || chat.pending) return;
    setInput("");
    void chat.send(text);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      submit(input);
    }
  };

  if (!chat.hydrated) {
    return <Skeleton className="h-[calc(100dvh-8rem)] min-h-[28rem]" />;
  }

  return (
    <div className="flex h-[calc(100dvh-8rem)] min-h-[28rem] flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{a.title}</h1>
        <button
          type="button"
          onClick={() => setShowHistory((s) => !s)}
          aria-expanded={showHistory}
          className="inline-flex h-10 items-center gap-2 rounded-xl border border-border bg-surface px-3 text-sm font-medium lg:hidden"
        >
          <History className="size-4" aria-hidden />
          {a.history}
        </button>
      </div>

      {live === false && (
        <p className="rounded-xl border border-warning/30 bg-warning/10 px-3.5 py-2 text-xs text-warning">
          {a.demoNotice}
        </p>
      )}

      <div className="grid min-h-0 flex-1 gap-4 lg:grid-cols-[17rem_1fr]">
        {/* History */}
        <aside
          className={cn(
            "min-h-0 flex-col rounded-2xl border border-border bg-surface p-3 shadow-card lg:flex",
            showHistory ? "flex" : "hidden"
          )}
        >
          <Button
            onClick={() => {
              chat.startNew();
              setShowHistory(false);
            }}
            className="w-full"
          >
            <Plus className="size-4" aria-hidden />
            {a.newChat}
          </Button>
          <p className="mb-2 mt-4 px-2 text-xs font-semibold text-muted">{a.history}</p>
          <ul className="min-h-0 flex-1 space-y-1 overflow-y-auto">
            {chat.conversations.length === 0 && (
              <li className="px-2 py-2 text-sm text-muted">{a.noHistory}</li>
            )}
            {chat.conversations.map((c) => (
              <li key={c.id} className="group flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => {
                    chat.setActiveId(c.id);
                    setShowHistory(false);
                  }}
                  aria-current={c.id === chat.activeId ? "true" : undefined}
                  className={cn(
                    "flex min-w-0 flex-1 items-center gap-2 rounded-xl px-2.5 py-2 text-start text-sm transition",
                    c.id === chat.activeId
                      ? "bg-brand/10 text-brand"
                      : "text-muted hover:bg-surface-2 hover:text-fg"
                  )}
                >
                  <MessageSquare className="size-4 shrink-0" aria-hidden />
                  <span dir="auto" className="truncate">
                    {c.title}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => chat.remove(c.id)}
                  aria-label={`${a.deleteChat}: ${c.title}`}
                  className="grid size-8 shrink-0 place-items-center rounded-lg text-muted hover:bg-danger/10 hover:text-danger"
                >
                  <Trash2 className="size-4" aria-hidden />
                </button>
              </li>
            ))}
          </ul>
        </aside>

        {/* Conversation */}
        <section className="flex min-h-0 flex-col rounded-2xl border border-border bg-surface shadow-card">
          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4 sm:p-5" aria-live="polite">
            {messages.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
                <span className="grid size-14 place-items-center rounded-2xl bg-gradient-to-br from-brand to-brand-2 text-white">
                  <Sparkles className="size-7" aria-hidden />
                </span>
                <div>
                  <p className="text-lg font-semibold">{a.emptyTitle}</p>
                  <p className="mt-1 text-sm text-muted">{a.emptyHint}</p>
                </div>
                <div className="flex max-w-xl flex-wrap justify-center gap-2">
                  {a.suggestions.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => submit(s)}
                      className="rounded-full border border-border bg-surface px-3.5 py-2 text-sm transition hover:border-brand hover:bg-surface-2"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((m) =>
                m.role === "user" ? (
                  <div key={m.id} className="flex justify-end">
                    <p
                      dir="auto"
                      className="max-w-[85%] whitespace-pre-wrap break-words rounded-2xl rounded-ee-md bg-gradient-to-br from-brand to-brand-2 px-4 py-2.5 text-sm text-white"
                    >
                      {m.content}
                    </p>
                  </div>
                ) : (
                  <div key={m.id} className="flex gap-2.5">
                    <span className="grid size-8 shrink-0 place-items-center rounded-full bg-surface-2 text-brand">
                      <Sparkles className="size-4" aria-hidden />
                    </span>
                    <p
                      dir="auto"
                      className="max-w-[85%] whitespace-pre-wrap break-words rounded-2xl rounded-ss-md bg-surface-2 px-4 py-2.5 text-sm"
                    >
                      {m.content}
                    </p>
                  </div>
                )
              )
            )}

            {chat.pending && !streaming && <TypingIndicator label={a.typing} />}

            {chat.error && (
              <div role="alert" className="flex flex-wrap items-center gap-3 rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
                <span>{chat.error}</span>
                <Button variant="secondary" size="sm" onClick={() => void chat.retry()}>
                  <RotateCcw className="size-3.5" aria-hidden />
                  {a.retry}
                </Button>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              submit(input);
            }}
            className="flex items-end gap-2 border-t border-border p-3"
          >
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              rows={1}
              dir="auto"
              placeholder={a.placeholder}
              aria-label={a.placeholder}
              className="max-h-32 min-h-10 flex-1 resize-none rounded-xl border border-border bg-surface px-3.5 py-2.5 text-sm outline-none transition placeholder:text-muted focus:border-brand focus:ring-2 focus:ring-brand/20"
            />
            {chat.pending ? (
              <Button type="button" variant="secondary" onClick={chat.stop} aria-label={a.stop}>
                <Square className="size-4" aria-hidden />
                <span className="hidden sm:inline">{a.stop}</span>
              </Button>
            ) : (
              <Button type="submit" disabled={!input.trim()} aria-label={a.send}>
                <Send className="rtl-flip size-4" aria-hidden />
                <span className="hidden sm:inline">{a.send}</span>
              </Button>
            )}
          </form>
          <p className="px-4 pb-3 text-center text-xs text-muted">{a.disclaimer}</p>
        </section>
      </div>
    </div>
  );
}

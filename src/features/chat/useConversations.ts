"use client";

import { useCallback, useRef, useState } from "react";
import { useApp } from "@/components/shared/Providers";
import { useSyncedState } from "@/hooks/useSyncedState";
import { uid } from "@/lib/format";
import { aiProvider, AIError } from "@/services/ai";
import type { ChatMessage, Conversation } from "@/types";

/** The reply that is still being streamed. It is saved only when it finishes. */
export type Draft = { conversationId: string; content: string };

export function useConversations() {
  const { locale, dict } = useApp();
  const [conversations, setConversations, hydrated] = useSyncedState<Conversation[]>(
    "studymate-chats",
    []
  );
  const [activeId, setActiveIdState] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const streamingConversation = useRef<string | null>(null);

  const active = conversations.find((c) => c.id === activeId) ?? null;

  const appendMessage = useCallback(
    (id: string, message: ChatMessage) =>
      setConversations((prev) =>
        prev.map((c) =>
          c.id === id ? { ...c, messages: [...c.messages, message], updatedAt: message.createdAt } : c
        )
      ),
    [setConversations]
  );

  const messageFor = useCallback(
    (err: unknown) => {
      if (err instanceof AIError) {
        if (err.status === 401) return dict.assistant.errorAuth;
        if (err.status === 429) return dict.assistant.errorRate;
      }
      return dict.assistant.error;
    },
    [dict]
  );

  const requestReply = useCallback(
    async (id: string, history: ChatMessage[]) => {
      const controller = new AbortController();
      abortRef.current = controller;
      streamingConversation.current = id;
      setPending(true);
      setError(null);
      setDraft(null);

      let partial = "";
      try {
        const text = await aiProvider.reply({
          messages: history,
          locale,
          signal: controller.signal,
          onToken: (soFar) => {
            partial = soFar;
            setDraft({ conversationId: id, content: soFar });
          },
        });
        appendMessage(id, { id: uid(), role: "assistant", content: text, createdAt: Date.now() });
      } catch (err) {
        if (controller.signal.aborted) {
          // The student pressed Stop: keep what was generated so far.
          if (partial.trim()) {
            appendMessage(id, { id: uid(), role: "assistant", content: partial, createdAt: Date.now() });
          }
        } else {
          setError(messageFor(err));
        }
      } finally {
        setDraft(null);
        setPending(false);
        abortRef.current = null;
        streamingConversation.current = null;
      }
    },
    [appendMessage, locale, messageFor]
  );

  const send = useCallback(
    async (text: string) => {
      const content = text.trim();
      if (!content || pending) return;

      const userMessage: ChatMessage = { id: uid(), role: "user", content, createdAt: Date.now() };

      let id: string;
      let history: ChatMessage[];

      if (active) {
        id = active.id;
        history = [...active.messages, userMessage];
        appendMessage(id, userMessage);
      } else {
        id = uid();
        history = [userMessage];
        const created: Conversation = {
          id,
          title: content.length > 40 ? `${content.slice(0, 40)}…` : content,
          messages: [userMessage],
          updatedAt: userMessage.createdAt,
        };
        setConversations((prev) => [created, ...prev]);
        setActiveIdState(id);
      }

      await requestReply(id, history);
    },
    [active, pending, appendMessage, requestReply, setConversations]
  );

  const retry = useCallback(async () => {
    if (!active || pending) return;
    await requestReply(active.id, active.messages);
  }, [active, pending, requestReply]);

  const stop = useCallback(() => abortRef.current?.abort(), []);

  const remove = useCallback(
    (id: string) => {
      if (streamingConversation.current === id) abortRef.current?.abort();
      setConversations((prev) => prev.filter((c) => c.id !== id));
      setActiveIdState((current) => (current === id ? null : current));
      setError(null);
    },
    [setConversations]
  );

  const startNew = useCallback(() => {
    setActiveIdState(null);
    setError(null);
  }, []);

  const setActiveId = useCallback((id: string) => {
    setActiveIdState(id);
    setError(null);
  }, []);

  return {
    conversations,
    hydrated,
    active,
    activeId,
    setActiveId,
    pending,
    draft,
    error,
    send,
    retry,
    stop,
    remove,
    startNew,
  };
}

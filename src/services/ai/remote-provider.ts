import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { AIError } from "./errors";
import { mockProvider } from "./mock-provider";
import type { AIProvider } from "./types";

export const remoteProvider: AIProvider = {
  id: "remote",

  async reply(input) {
    const { messages, locale, signal, onToken } = input;

    let token: string | null = null;

    if (isSupabaseConfigured) {
      const supabase = createClient();
      const { data, error } = await supabase.auth.getSession();

      if (error) throw new AIError(401);
      token = data.session?.access_token ?? null;
    }

    const res = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({
        locale,
        messages: messages.map((m) => ({
          role: m.role,
          content: m.content,
        })),
      }),
      signal,
    });

    if (res.status === 501) return mockProvider.reply(input);
    if (!res.ok || !res.body) throw new AIError(res.status);

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let text = "";

    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;

      text += decoder.decode(value, { stream: true });
      onToken?.(text);
    }

    text += decoder.decode();

    if (!text.trim()) throw new AIError(502);
    return text;
  },
};

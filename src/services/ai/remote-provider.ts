
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { AIError } from "./errors";
import { mockProvider } from "./mock-provider";
import type { AIProvider } from "./types";

const FUNCTION_URL =
  "https://ljqujpqqnwhpyjdidohf.supabase.co/functions/v1/ai-chat";

export const remoteProvider: AIProvider = {
  id: "remote",

  async reply(input) {
    if (!isSupabaseConfigured) {
      return mockProvider.reply(input);
    }

    const supabase = createClient();
    const { data, error } = await supabase.auth.getSession();

    if (error || !data.session?.access_token) {
      throw new AIError(401);
    }

    const apiKey =
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

    if (!apiKey) {
      throw new AIError(500);
    }

    const res = await fetch(FUNCTION_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: apiKey,
        Authorization: `Bearer ${data.session.access_token}`,
      },
      body: JSON.stringify({
        locale: input.locale,
        messages: input.messages.map((message) => ({
          role: message.role,
          content: message.content,
        })),
      }),
      signal: input.signal,
    });

    if (res.status === 501) {
      return mockProvider.reply(input);
    }

    if (!res.ok || !res.body) {
      throw new AIError(res.status);
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let text = "";

    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;

      text += decoder.decode(value, { stream: true });
      input.onToken?.(text);
    }

    text += decoder.decode();

    if (!text.trim()) {
      throw new AIError(502);
    }

    return text;
  },
};

import { getDictionary } from "@/i18n/get-dictionary";
import type { AIProvider } from "./types";

function sleep(ms: number, signal?: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    if (signal?.aborted) {
      reject(new DOMException("Aborted", "AbortError"));
      return;
    }
    const onAbort = () => {
      clearTimeout(timer);
      reject(new DOMException("Aborted", "AbortError"));
    };
    const timer = setTimeout(() => {
      signal?.removeEventListener("abort", onAbort);
      resolve();
    }, ms);
    signal?.addEventListener("abort", onAbort, { once: true });
  });
}

/** Demo provider: keyword-matched canned replies, streamed word by word. No network. */
export const mockProvider: AIProvider = {
  id: "mock",
  async reply({ messages, locale, signal, onToken }) {
    await sleep(500 + Math.random() * 400, signal);

    const lastUser = [...messages].reverse().find((m) => m.role === "user");
    const query = (lastUser?.content ?? "").toLowerCase();
    const { replies, fallbackReply } = getDictionary(locale).assistant;
    const match = replies.find((r) => r.keywords.some((k) => query.includes(k.toLowerCase())));
    const text = match ? match.text : fallbackReply;

    let shown = "";
    for (const piece of text.split(/(\s+)/)) {
      shown += piece;
      onToken?.(shown);
      if (piece.trim()) await sleep(25, signal);
    }
    return text;
  },
};

import { isLocale, type Locale } from "@/i18n/config";

export type ChatTurn = { role: "user" | "assistant"; content: string };

const MAX_MESSAGES = 20;
const MAX_CHARS = 4000;

/**
 * Validates the request body and returns a clean conversation for the model:
 * the last 20 turns, consecutive same-role turns merged, starting and ending with a user turn.
 * Returns null when the body is invalid.
 */
export function parseChatBody(body: unknown): { locale: Locale; messages: ChatTurn[] } | null {
  if (!body || typeof body !== "object") return null;
  const { locale, messages } = body as { locale?: unknown; messages?: unknown };

  if (typeof locale !== "string" || !isLocale(locale)) return null;
  if (!Array.isArray(messages) || messages.length === 0) return null;

  const turns: ChatTurn[] = [];
  for (const raw of messages.slice(-MAX_MESSAGES)) {
    if (!raw || typeof raw !== "object") return null;
    const { role, content } = raw as { role?: unknown; content?: unknown };
    if (role !== "user" && role !== "assistant") return null;
    if (typeof content !== "string" || content.trim() === "" || content.length > MAX_CHARS) return null;

    const last = turns[turns.length - 1];
    if (last && last.role === role) last.content += `\n\n${content}`;
    else turns.push({ role, content });
  }

  while (turns.length > 0 && turns[0].role !== "user") turns.shift();
  if (turns.length === 0 || turns[turns.length - 1].role !== "user") return null;

  return { locale, messages: turns };
}

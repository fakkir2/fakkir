import { remoteProvider } from "./remote-provider";
import type { AIProvider } from "./types";

export type { AIProvider, AIReplyInput } from "./types";
export { AIError } from "./errors";

/** The provider the UI uses. Live when the server has an API key, otherwise the demo replies. */
export const aiProvider: AIProvider = remoteProvider;

/** Asks the server whether live AI is available (used to show or hide the demo notice). */
export async function fetchAIStatus(): Promise<boolean> {
  try {
    const res = await fetch("/api/chat", { cache: "no-store" });
    if (!res.ok) return false;
    const data = (await res.json()) as { live?: boolean };
    return data.live === true;
  } catch {
    return false;
  }
}

import type { Locale } from "@/i18n/config";
import type { ChatMessage } from "@/types";

export type AIReplyInput = {
  messages: ChatMessage[];
  locale: Locale;
  /** Abort to stop generation. Providers must reject with an AbortError. */
  signal?: AbortSignal;
  /** Called repeatedly with the full reply text so far (streaming). */
  onToken?: (textSoFar: string) => void;
};

/**
 * Contract every AI backend must implement. The UI only depends on this
 * interface, so providers can be swapped without UI changes.
 */
export interface AIProvider {
  readonly id: string;
  reply(input: AIReplyInput): Promise<string>;
}


import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { remoteProvider } from "./remote-provider";
import type { AIProvider } from "./types";

export type { AIProvider, AIReplyInput } from "./types";
export { AIError } from "./errors";

const FUNCTION_URL =
  "https://ljqujpqqnwhpyjdidohf.supabase.co/functions/v1/ai-chat";

export const aiProvider: AIProvider = remoteProvider;

export async function fetchAIStatus(): Promise<boolean> {
  try {
    if (!isSupabaseConfigured) return false;

    const supabase = createClient();
    const { data, error } = await supabase.auth.getSession();

    if (error || !data.session?.access_token) return false;

    const apiKey =
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

    if (!apiKey) return false;

    const res = await fetch(FUNCTION_URL, {
      method: "GET",
      headers: {
        apikey: apiKey,
        Authorization: `Bearer ${data.session.access_token}`,
      },
      cache: "no-store",
    });

    if (!res.ok) return false;

    const result = await res.json() as { live?: boolean };
    return result.live === true;
  } catch {
    return false;
  }
}

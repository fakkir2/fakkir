import { isSupabaseConfigured } from "@/lib/supabase/config";

export const AI_MODEL = process.env.AI_MODEL || "claude-sonnet-5-5";
export const AI_MAX_TOKENS = Number(process.env.AI_MAX_TOKENS) || 1024;

export function isLiveAIEnabled() {
  if (!process.env.ANTHROPIC_API_KEY) return false;

  return isSupabaseConfigured || process.env.NODE_ENV !== "production";
}

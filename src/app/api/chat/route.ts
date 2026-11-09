import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { AI_MAX_TOKENS, AI_MODEL, isLiveAIEnabled } from "@/lib/ai/config";
import { allowRequest } from "@/lib/ai/rate-limit";
import { buildSystemPrompt } from "@/lib/ai/system-prompt";
import { parseChatBody } from "@/lib/ai/validate";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export const dynamic = "force-dynamic";

const fail = (status: number, code: string) =>
  NextResponse.json({ error: code }, { status });

export async function GET() {
  return NextResponse.json(
    { live: isLiveAIEnabled() },
    { headers: { "Cache-Control": "no-store" } }
  );
}

export async function POST(request: NextRequest) {
  if (!isLiveAIEnabled()) return fail(501, "not_configured");

  let identity =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "local";

  if (isSupabaseConfigured) {
    const header = request.headers.get("authorization") ?? "";
    const token = header.startsWith("Bearer ")
      ? header.slice(7).trim()
      : "";

    if (!token) return fail(401, "unauthorized");

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

    if (!url || !key) return fail(500, "server_configuration_error");

    const supabase = createSupabaseClient(url, key, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    });

    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data.user) return fail(401, "unauthorized");

    identity = data.user.id;
  }

  if (!allowRequest(identity)) return fail(429, "rate_limited");

  const length = Number(request.headers.get("content-length") ?? 0);
  if (length > 100_000) return fail(413, "too_large");

  let parsed;

  try {
    parsed = parseChatBody(await request.json());
  } catch {
    parsed = null;
  }

  if (!parsed) return fail(400, "bad_request");

  let upstream: Response;

  try {
    upstream = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY as string,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: AI_MODEL,
        max_tokens: AI_MAX_TOKENS,
        system: buildSystemPrompt(parsed.locale),
        messages: parsed.messages,
        stream: true,
      }),
      signal: request.signal,
    });
  } catch {
    return fail(502, "upstream_unreachable");
  }

  if (!upstream.ok || !upstream.body) {
    console.error(`AI upstream returned ${upstream.status}`);
    return fail(upstream.status === 429 ? 429 : 502, "upstream_error");
  }

  const reader = upstream.body.getReader();
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      let buffer = "";

      try {
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });

          let newline: number;

          while ((newline = buffer.indexOf("\n")) >= 0) {
            const line = buffer.slice(0, newline).trim();
            buffer = buffer.slice(newline + 1);

            if (!line.startsWith("data:")) continue;

            const payload = line.slice(5).trim();
            if (!payload) continue;

            let event: {
              type?: string;
              delta?: { type?: string; text?: string };
            };

            try {
              event = JSON.parse(payload);
            } catch {
              continue;
            }

            if (event.type === "error") {
              throw new Error("upstream stream error");
            }

            if (
              event.type === "content_block_delta" &&
              event.delta?.type === "text_delta" &&
              event.delta.text
            ) {
              controller.enqueue(encoder.encode(event.delta.text));
            }
          }
        }

        controller.close();
      } catch (err) {
        controller.error(err);
      }
    },

    cancel() {
      void reader.cancel();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}

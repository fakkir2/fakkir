"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "@/components/shared/AuthProvider";

/**
 * State that persists per user.
 * - Signed in: stored in Supabase public.user_data.
 * - Demo mode / signed out: stored in localStorage.
 * - Existing local data is uploaded when the signed-in account has no
 *   existing value for that key.
 */
export function useSyncedState<T>(key: string, initialValue: T) {
  const { supabase, user, ready, setSyncError } = useAuth();
  const userId = user?.id ?? null;

  const initialRef = useRef(initialValue);
  const latest = useRef<T>(initialValue);
  const pending = useRef(false);
  const canWrite = useRef(true);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [value, setValue] = useState<T>(initialValue);
  const [hydrated, setHydrated] = useState(false);

  const flush = useCallback(async () => {
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }

    if (!pending.current || !supabase || !userId || !canWrite.current) {
      return;
    }

    pending.current = false;

    const { error } = await supabase
      .from("user_data")
      .upsert(
        {
          user_id: userId,
          data_key: key,
          data_value: latest.current,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id,data_key" }
      );

    if (error) {
      console.error(`Could not save "${key}"`, error);
      pending.current = true;
      setSyncError(true);
      return;
    }

    setSyncError(false);
  }, [supabase, userId, key, setSyncError]);

  useEffect(() => {
    if (!ready) return;

    let cancelled = false;
    setHydrated(false);

    const apply = (next: T) => {
      latest.current = next;
      setValue(next);
    };

    const readLocal = (): { found: boolean; value?: T } => {
      try {
        const raw = window.localStorage.getItem(key);
        if (raw !== null) {
          return { found: true, value: JSON.parse(raw) as T };
        }
      } catch {
        // Ignore unreadable or unavailable local storage.
      }

      return { found: false };
    };

    const load = async () => {
      if (!supabase || !userId) {
        canWrite.current = true;
        const local = readLocal();
        apply(local.found ? (local.value as T) : initialRef.current);
        if (!cancelled) setHydrated(true);
        return;
      }

      canWrite.current = false;

      const { data, error } = await supabase
        .from("user_data")
        .select("data_value")
        .eq("user_id", userId)
        .eq("data_key", key)
        .maybeSingle();

      if (cancelled) return;

      if (error) {
        console.error(`Could not load "${key}"`, error);
        setSyncError(true);
        apply(initialRef.current);
        if (!cancelled) setHydrated(true);
        return;
      }

      if (data) {
        apply(data.data_value as T);
      } else {
        const local = readLocal();

        if (local.found) {
          apply(local.value as T);

          const { error: uploadError } = await supabase
            .from("user_data")
            .upsert(
              {
                user_id: userId,
                data_key: key,
                data_value: local.value,
                updated_at: new Date().toISOString(),
              },
              { onConflict: "user_id,data_key" }
            );

          if (cancelled) return;

          if (uploadError) {
            console.error(`Could not upload local "${key}"`, uploadError);
            setSyncError(true);
            pending.current = true;
          } else {
            try {
              window.localStorage.removeItem(key);
            } catch {
              // The cloud copy succeeded; local cleanup is optional.
            }
          }
        } else {
          apply(initialRef.current);
        }
      }

      canWrite.current = true;
      if (!cancelled) {
        setSyncError(false);
        setHydrated(true);
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, [ready, supabase, userId, key, setSyncError]);

  useEffect(() => {
    const onHide = () => {
      if (document.visibilityState === "hidden") {
        void flush();
      }
    };

    document.addEventListener("visibilitychange", onHide);

    return () => {
      document.removeEventListener("visibilitychange", onHide);
      void flush();
    };
  }, [flush]);

  const update = useCallback(
    (next: T | ((prev: T) => T)) => {
      const resolved =
        typeof next === "function"
          ? (next as (prev: T) => T)(latest.current)
          : next;

      latest.current = resolved;
      setValue(resolved);

      if (supabase && userId) {
        pending.current = true;

        if (timer.current) clearTimeout(timer.current);

        timer.current = setTimeout(() => {
          void flush();
        }, 400);
      } else {
        try {
          window.localStorage.setItem(key, JSON.stringify(resolved));
        } catch {
          // Keep the value in memory if storage is unavailable.
        }
      }
    },
    [supabase, userId, key, flush]
  );

  return [value, update, hydrated] as const;
}

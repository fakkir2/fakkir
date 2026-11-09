const hits = new Map<string, number[]>();

/**
 * Simple sliding-window limiter, in memory. It is per server instance, so on
 * serverless hosting use a shared store (for example Redis) before launch.
 */
export function allowRequest(key: string, limit = 15, windowMs = 60_000) {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  if (recent.length >= limit) {
    hits.set(key, recent);
    return false;
  }
  recent.push(now);
  hits.set(key, recent);

  if (hits.size > 5000) {
    for (const [k, times] of hits) {
      if (times.every((t) => now - t >= windowMs)) hits.delete(k);
    }
  }
  return true;
}

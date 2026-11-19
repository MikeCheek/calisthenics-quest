// Sliding-window rate limiter kept in memory. On serverless hosting each
// instance has its own memory, so this is best-effort (it caps a single
// caller hammering one warm instance, not a determined distributed attack);
// a shared store (Redis/Firestore) would be the durable version.

export interface LimitRule {
  max: number; // requests allowed…
  windowMs: number; // …per this window
}

export interface LimitResult {
  ok: boolean;
  retryAfterS: number; // 0 when ok
}

export class RateLimiter {
  private hits = new Map<string, number[]>();

  check(key: string, rule: LimitRule, now = Date.now()): LimitResult {
    const since = now - rule.windowMs;
    const list = (this.hits.get(key) ?? []).filter((t) => t > since);
    if (list.length >= rule.max) {
      this.hits.set(key, list);
      return { ok: false, retryAfterS: Math.max(1, Math.ceil((list[0] + rule.windowMs - now) / 1000)) };
    }
    list.push(now);
    this.hits.set(key, list);
    if (this.hits.size > 5000) this.prune(now, rule.windowMs);
    return { ok: true, retryAfterS: 0 };
  }

  private prune(now: number, windowMs: number) {
    for (const [k, v] of this.hits) if (!v.some((t) => t > now - windowMs)) this.hits.delete(k);
  }
}

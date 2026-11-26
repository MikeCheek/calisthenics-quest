// Rate limiting for the server routes.
//
// RateLimiter: a sliding window kept in memory. On serverless hosting each
// instance has its own memory, so on its own it only caps one caller
// hammering one warm instance.
//
// SharedRateLimiter: the durable version. Each (key, window) is a counter
// document in Firestore (rateLimits/…), incremented atomically by the server
// (clients have no access — see the security rules), so every instance sees
// the same count. The in-memory limiter runs first, so an obvious burst is
// refused without a request; if Firestore can't be reached, the in-memory
// answer stands rather than blocking everyone.

import type { FirestoreRest } from "./firestoreRest";
import { pushContext } from "./push";

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

// a Firestore document id from any key: no slashes, bounded length
export const counterId = (key: string, windowStart: number) => `${key.replace(/[^A-Za-z0-9_-]/g, "_").slice(0, 200)}_${windowStart}`;

export class SharedRateLimiter {
  private local = new RateLimiter();
  constructor(private fs: () => FirestoreRest | null) {}

  // Fixed windows aligned to the clock (e.g. each 10 minutes), counted in Firestore.
  async check(key: string, rule: LimitRule, now = Date.now()): Promise<LimitResult> {
    const quick = this.local.check(key, rule, now);
    if (!quick.ok) return quick;
    const fs = this.fs();
    if (!fs) return quick;
    const windowStart = Math.floor(now / rule.windowMs) * rule.windowMs;
    const windowEnd = windowStart + rule.windowMs;
    try {
      const count = await fs.increment(`rateLimits/${counterId(key, windowStart)}`, "n", 1, new Date(windowEnd + 60_000));
      if (count > rule.max) return { ok: false, retryAfterS: Math.max(1, Math.ceil((windowEnd - now) / 1000)) };
      return { ok: true, retryAfterS: 0 };
    } catch {
      return quick; // Firestore unreachable: the in-memory limit still holds
    }
  }
}

// The Firestore client for shared limits: the service account's, when the
// server has one (the same credentials push uses); otherwise in-memory only.
let cached: FirestoreRest | null | undefined;
export function limitsStore(): FirestoreRest | null {
  if (cached !== undefined) return cached;
  cached = pushContext()?.fs ?? null;
  return cached;
}

export type ApiErrorCode =
  | "INVALID_JSON"
  | "VALIDATION_ERROR"
  | "RATE_LIMITED"
  | "INTERNAL_ERROR";

export type RateLimitInfo = {
  limit: number;
  remaining: number;
  resetAtMs: number;
};

export type RateLimitCheckResult = RateLimitInfo & { allowed: boolean };

type RateLimitStoreEntry = {
  count: number;
  resetAtMs: number;
};

const rateLimitStore = new Map<string, RateLimitStoreEntry>();
let lastPruneAtMs = 0;

export function getOrCreateRequestId(request: Request) {
  const headerValue = request.headers.get("x-request-id");
  if (headerValue && headerValue.length <= 128) return headerValue;

  if (typeof globalThis.crypto?.randomUUID === "function") {
    return globalThis.crypto.randomUUID();
  }

  // Fallback for runtimes without randomUUID.
  return `${Date.now().toString(36)}-${Math.random().toString(16).slice(2)}`;
}

export function getClientIp(request: Request) {
  const xff = request.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0]?.trim() || "unknown";

  const xRealIp = request.headers.get("x-real-ip");
  if (xRealIp) return xRealIp.trim();

  const cfConnectingIp = request.headers.get("cf-connecting-ip");
  if (cfConnectingIp) return cfConnectingIp.trim();

  return "unknown";
}

export function checkRateLimit(
  key: string,
  opts: { windowMs: number; max: number }
): RateLimitCheckResult {
  const now = Date.now();

  if (now - lastPruneAtMs > opts.windowMs) {
    for (const [storeKey, entry] of rateLimitStore) {
      if (entry.resetAtMs <= now) rateLimitStore.delete(storeKey);
    }
    lastPruneAtMs = now;
  }

  const existing = rateLimitStore.get(key);
  if (!existing || existing.resetAtMs <= now) {
    const resetAtMs = now + opts.windowMs;
    rateLimitStore.set(key, { count: 1, resetAtMs });
    return {
      allowed: true,
      limit: opts.max,
      remaining: Math.max(0, opts.max - 1),
      resetAtMs,
    };
  }

  if (existing.count >= opts.max) {
    return {
      allowed: false,
      limit: opts.max,
      remaining: 0,
      resetAtMs: existing.resetAtMs,
    };
  }

  existing.count += 1;
  rateLimitStore.set(key, existing);

  return {
    allowed: true,
    limit: opts.max,
    remaining: Math.max(0, opts.max - existing.count),
    resetAtMs: existing.resetAtMs,
  };
}

export async function readJsonSafe(request: Request) {
  try {
    const data: unknown = await request.json();
    return { ok: true as const, data };
  } catch {
    return { ok: false as const };
  }
}

export function asTrimmedString(value: unknown) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length ? trimmed : null;
}

export function asOptionalTrimmedString(value: unknown) {
  const trimmed = asTrimmedString(value);
  return trimmed ?? undefined;
}

export function isValidEmail(email: string) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

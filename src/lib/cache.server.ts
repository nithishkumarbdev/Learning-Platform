// Response caching helpers.
//
// The Learning OS is a read-heavy SSR app whose HTML depends only on the route
// (learner state lives in localStorage), so pages are safe to cache at the edge
// with `stale-while-revalidate`. Two layers:
//
//   1. HTTP caching  -> Cache-Control headers per route class (below).
//   2. Compute cache -> `memoize` for expensive pure derivations (curriculum
//      slicing, search indexes) so repeat requests skip the work entirely.

export type CachePolicy = {
  /** Browser cache lifetime, seconds. */
  maxAge: number;
  /** Shared/CDN cache lifetime, seconds. */
  sMaxAge: number;
  /** Serve stale while refreshing in the background, seconds. */
  staleWhileRevalidate: number;
  /** `private` opts the response out of shared caches. */
  visibility: "public" | "private";
};

export const POLICIES = {
  /** Immutable hashed build assets. */
  asset: { maxAge: 31_536_000, sMaxAge: 31_536_000, staleWhileRevalidate: 0, visibility: "public" },
  /** Static content routes (roadmap, resources, tools, prompts, cheatsheets). */
  staticPage: { maxAge: 0, sMaxAge: 3_600, staleWhileRevalidate: 86_400, visibility: "public" },
  /** Pages whose shell is static but hydrate from local learner state. */
  dynamicPage: { maxAge: 0, sMaxAge: 60, staleWhileRevalidate: 600, visibility: "public" },
  /** Anything personalised or mutating. */
  noStore: { maxAge: 0, sMaxAge: 0, staleWhileRevalidate: 0, visibility: "private" },
} satisfies Record<string, CachePolicy>;

export function cacheControl(policy: CachePolicy): string {
  if (policy.visibility === "private" && policy.maxAge === 0 && policy.sMaxAge === 0) {
    return "private, no-store, must-revalidate";
  }
  const parts = [policy.visibility, `max-age=${policy.maxAge}`, `s-maxage=${policy.sMaxAge}`];
  if (policy.staleWhileRevalidate > 0) {
    parts.push(`stale-while-revalidate=${policy.staleWhileRevalidate}`);
  }
  return parts.join(", ");
}

/** Routes that never depend on request-specific data. */
const STATIC_ROUTES = new Set([
  "/",
  "/roadmap",
  "/flows",
  "/resources",
  "/tools",
  "/prompts",
  "/cheatsheets",
  "/challenges",
  "/interview",
  "/safety",
  "/branding",
  "/architecture",
  "/api-planner",
  "/schema-planner",
]);

export function policyForPathname(pathname: string): CachePolicy {
  if (pathname.startsWith("/api/")) return POLICIES.noStore;
  if (pathname.startsWith("/_serverFn/")) return POLICIES.noStore;
  if (/\.[a-z0-9]+$/i.test(pathname)) return POLICIES.asset;
  if (STATIC_ROUTES.has(pathname)) return POLICIES.staticPage;
  return POLICIES.dynamicPage;
}

type Entry<T> = { value: T; expiresAt: number };

/**
 * TTL memoization for pure server-side computation. Bounded so a long-lived
 * worker isolate cannot grow without limit.
 */
export function memoize<A extends readonly unknown[], R>(
  fn: (...args: A) => R,
  options: { ttlMs?: number; maxEntries?: number; key?: (...args: A) => string } = {},
): ((...args: A) => R) & { clear: () => void; size: () => number } {
  const ttlMs = options.ttlMs ?? 60_000;
  const maxEntries = options.maxEntries ?? 200;
  const keyOf = options.key ?? ((...args: A) => JSON.stringify(args));
  const cache = new Map<string, Entry<R>>();

  const wrapped = (...args: A): R => {
    const key = keyOf(...args);
    const now = Date.now();
    const hit = cache.get(key);
    if (hit && hit.expiresAt > now) {
      // Refresh recency for the LRU eviction below.
      cache.delete(key);
      cache.set(key, hit);
      return hit.value;
    }
    const value = fn(...args);
    cache.set(key, { value, expiresAt: now + ttlMs });
    if (cache.size > maxEntries) {
      const oldest = cache.keys().next().value;
      if (oldest !== undefined) cache.delete(oldest);
    }
    return value;
  };

  wrapped.clear = () => cache.clear();
  wrapped.size = () => cache.size;
  return wrapped;
}

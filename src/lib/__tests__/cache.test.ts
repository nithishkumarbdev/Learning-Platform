import { describe, expect, it, vi } from "vitest";

import { POLICIES, cacheControl, memoize, policyForPathname } from "@/lib/cache.server";

describe("cache policies", () => {
  it("marks hashed assets immutable-long", () => {
    expect(policyForPathname("/assets/app-a1b2c3.js")).toBe(POLICIES.asset);
    expect(cacheControl(POLICIES.asset)).toContain("max-age=31536000");
  });

  it("caches static content pages at the edge with SWR", () => {
    const header = cacheControl(policyForPathname("/roadmap"));
    expect(header).toContain("s-maxage=3600");
    expect(header).toContain("stale-while-revalidate=86400");
  });

  it("keeps learner-specific pages short-lived", () => {
    expect(cacheControl(policyForPathname("/today"))).toContain("s-maxage=60");
  });

  it("never caches api or server-function traffic", () => {
    expect(cacheControl(policyForPathname("/api/public/errors"))).toBe(
      "private, no-store, must-revalidate",
    );
    expect(policyForPathname("/_serverFn/whatever")).toBe(POLICIES.noStore);
  });
});

describe("memoize", () => {
  it("computes once per key inside the TTL", () => {
    const spy = vi.fn((n: number) => n * 2);
    const cached = memoize(spy, { ttlMs: 1_000 });
    expect(cached(21)).toBe(42);
    expect(cached(21)).toBe(42);
    expect(spy).toHaveBeenCalledTimes(1);
    expect(cached(2)).toBe(4);
    expect(spy).toHaveBeenCalledTimes(2);
  });

  it("recomputes after the TTL expires", () => {
    vi.useFakeTimers();
    const spy = vi.fn(() => Math.random());
    const cached = memoize(spy, { ttlMs: 100 });
    cached();
    vi.advanceTimersByTime(150);
    cached();
    expect(spy).toHaveBeenCalledTimes(2);
    vi.useRealTimers();
  });

  it("evicts least-recently-used entries past the cap", () => {
    const cached = memoize((n: number) => n, { maxEntries: 2 });
    cached(1);
    cached(2);
    cached(3);
    expect(cached.size()).toBe(2);
  });
});

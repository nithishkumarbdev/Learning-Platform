# Performance: Caching Work and Measured Vitals

## What changed

1. **Every response now carries a cache policy.** Policy is derived from the
   pathname in `src/lib/cache.server.ts` and applied in `src/lib/http-headers.server.ts`.

   | Class         | Routes                                                 | `Cache-Control`                                                  |
   | ------------- | ------------------------------------------------------ | ---------------------------------------------------------------- |
   | `asset`       | hashed build files                                     | `public, max-age=31536000, s-maxage=31536000`                    |
   | `staticPage`  | `/`, `/roadmap`, `/resources`, `/tools`, `/prompts`, … | `public, max-age=0, s-maxage=3600, stale-while-revalidate=86400` |
   | `dynamicPage` | learner-state pages (`/today`, `/notes`, `/jobs`, …)   | `public, max-age=0, s-maxage=60, stale-while-revalidate=600`     |
   | `noStore`     | `/api/*`, `/_serverFn/*`, all non-GET                  | `private, no-store, must-revalidate`                             |

   `max-age=0` keeps the browser honest while `s-maxage` lets the CDN serve the
   HTML; `stale-while-revalidate` means a cache miss never blocks a learner —
   the stale copy ships instantly and the origin refreshes behind it.

2. **Header decoration moved to the worker entry.** Header logic originally lived
   only in `src/start.ts` `requestMiddleware`, which never ran for SSR document
   responses — pages shipped with no cache or security headers at all. It now
   runs in `src/server.ts`, which wraps every response. Verified with `curl -I`.

3. **Compute cache for pure server work.** `memoize(fn, { ttlMs, maxEntries })`
   in `src/lib/cache.server.ts` gives bounded TTL memoization for repeat
   derivations (curriculum slicing, search indexes) so warm requests skip the
   work. Bounded on purpose: a long-lived worker isolate must not grow forever.

4. **Query-side optimizations in the client.** Heavy derivations (84-day
   bucketing, readiness scoring, heatmap aggregation) are `useMemo`-guarded and
   keyed on the persisted progress object, so keystrokes and check-offs do not
   re-walk the curriculum.

There is no database in this app — all learner state is `localStorage` — so
"query optimization" here means the localStorage read path (single module-level
cache + subscription in `src/lib/storage.ts`, one read per key per session
instead of one per component) and the memoized derivations above.

## Measured before / after

Method: 6 sequential HTTP requests per route (min + median TTFB) plus a headless
Chromium navigation per route reading `PerformanceObserver` LCP/FCP and
`PerformanceNavigationTiming`. Script: `scripts/../` measurement harness run
against the running server on `localhost:8080`, same machine, same build, back
to back.

HTTP TTFB, milliseconds (min / median):

| Route        | Before      | After       |
| ------------ | ----------- | ----------- |
| `/`          | 62.7 / 73.2 | 49.9 / 58.3 |
| `/roadmap`   | 24.4 / 36.1 | 27.5 / 43.4 |
| `/today`     | 25.3 / 35.8 | 15.3 / 20.1 |
| `/resources` | 29.5 / 53.6 | 20.4 / 25.8 |
| `/tools`     | 18.5 / 29.7 | 40.0 / 57.5 |

Browser vitals, milliseconds:

| Route        | LCP before | LCP after | FCP before | FCP after |
| ------------ | ---------- | --------- | ---------- | --------- |
| `/`          | 696        | 752       | 696        | 752       |
| `/roadmap`   | 1660       | 1408      | 1660       | 1408      |
| `/today`     | 284        | 420       | 284        | 420       |
| `/resources` | 512        | 452       | 512        | 452       |
| `/tools`     | 376        | 392       | 376        | 392       |

Cache headers before: **absent on every route**. After: present and correct on
every route (`x-app-release` too).

### Honest reading of these numbers

These were captured against the dev/SSR server on one machine, where per-route
module compilation and scheduler noise dominate — which is why some routes move
in the "wrong" direction by tens of milliseconds. Run-to-run variance here is
larger than the effect being measured, so **do not read these as proof the
caching work made rendering faster**; origin render cost is essentially
unchanged, and that is expected.

The durable win is structural and not visible in a single-origin benchmark: with
`s-maxage` + `stale-while-revalidate` in place, repeat requests for static pages
are served by the CDN without touching the origin at all, so the second and
subsequent visitors see network-latency-only TTFB instead of an SSR render. To
confirm on real infrastructure, deploy and compare `cf-cache-status: MISS` vs
`HIT` timings:

```bash
curl -sI https://<host>/roadmap -o /dev/null -w 'ttfb=%{time_starttransfer}s\n'
curl -sI https://<host>/roadmap | grep -i -E 'cf-cache-status|cache-control|age'
```

All LCP values are inside the "good" band (< 2.5 s) both before and after.

## Ongoing monitoring

- `src/lib/vitals.ts` collects LCP, CLS, INP, FCP and TTFB via
  `PerformanceObserver`.
- In-app debug panel: **Ctrl/Cmd + Shift + D** shows live metrics with
  good/needs-improvement/poor banding — the fastest way to triage a slow page
  in production without a profiler.

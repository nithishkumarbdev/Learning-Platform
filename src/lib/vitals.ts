/**
 * Minimal Core Web Vitals collector — no external dependencies.
 *
 * Uses PerformanceObserver to gather LCP, CLS, INP (approximated from the
 * longest event duration), TTFB and FCP, plus per-route navigation timings.
 * Everything stays in memory (and the last 20 route samples in localStorage)
 * so the debug panel can diagnose slow pages offline.
 */

export type MetricName = "LCP" | "CLS" | "INP" | "FCP" | "TTFB";

export type Metric = {
  name: MetricName;
  value: number;
  rating: "good" | "needs-improvement" | "poor";
};

export type RouteSample = {
  path: string;
  /** ms from route change to the next paint */
  duration: number;
  at: number;
};

const THRESHOLDS: Record<MetricName, [number, number]> = {
  LCP: [2500, 4000],
  CLS: [0.1, 0.25],
  INP: [200, 500],
  FCP: [1800, 3000],
  TTFB: [800, 1800],
};

export function rate(name: MetricName, value: number): Metric["rating"] {
  const [good, poor] = THRESHOLDS[name];
  if (value <= good) return "good";
  if (value <= poor) return "needs-improvement";
  return "poor";
}

const SAMPLES_KEY = "los_perf_routes";

const metrics = new Map<MetricName, Metric>();
let routeSamples: RouteSample[] = [];
const listeners = new Set<() => void>();
let started = false;

const EMPTY_SNAPSHOT: Snapshot = { metrics: [], samples: [] };
let snapshot: Snapshot = EMPTY_SNAPSHOT;

/** Rebuild the cached snapshot — required so useSyncExternalStore stays stable. */
function emit() {
  snapshot = {
    metrics: (["LCP", "INP", "CLS", "FCP", "TTFB"] as MetricName[])
      .map((n) => metrics.get(n))
      .filter((m): m is Metric => Boolean(m)),
    samples: routeSamples,
  };
  for (const l of listeners) l();
}

function set(name: MetricName, value: number) {
  const rounded = name === "CLS" ? Math.round(value * 1000) / 1000 : Math.round(value);
  metrics.set(name, { name, value: rounded, rating: rate(name, rounded) });
  emit();
}

function observe(type: string, cb: (entries: PerformanceEntry[]) => void) {
  try {
    const po = new PerformanceObserver((list) => cb(list.getEntries()));
    po.observe({ type, buffered: true } as PerformanceObserverInit);
  } catch {
    /* unsupported entry type — skip silently */
  }
}

export function startVitals() {
  if (started || typeof window === "undefined" || !("PerformanceObserver" in window)) return;
  started = true;

  try {
    routeSamples = JSON.parse(localStorage.getItem(SAMPLES_KEY) ?? "[]") as RouteSample[];
  } catch {
    routeSamples = [];
  }
  emit();

  const nav = performance.getEntriesByType("navigation")[0] as
    | PerformanceNavigationTiming
    | undefined;
  if (nav) set("TTFB", nav.responseStart);

  observe("paint", (entries) => {
    const fcp = entries.find((e) => e.name === "first-contentful-paint");
    if (fcp) set("FCP", fcp.startTime);
  });

  observe("largest-contentful-paint", (entries) => {
    const last = entries[entries.length - 1];
    if (last) set("LCP", last.startTime);
  });

  let cls = 0;
  observe("layout-shift", (entries) => {
    for (const e of entries) {
      const shift = e as PerformanceEntry & { value: number; hadRecentInput: boolean };
      if (!shift.hadRecentInput) cls += shift.value;
    }
    set("CLS", cls);
  });

  let worstInp = 0;
  observe("event", (entries) => {
    for (const e of entries) {
      if (e.duration > worstInp) worstInp = e.duration;
    }
    if (worstInp > 0) set("INP", worstInp);
  });
}

export function recordRouteSample(path: string, duration: number) {
  routeSamples = [{ path, duration: Math.round(duration), at: Date.now() }, ...routeSamples].slice(
    0,
    20,
  );
  try {
    localStorage.setItem(SAMPLES_KEY, JSON.stringify(routeSamples));
  } catch {
    /* storage full or blocked — samples stay in memory */
  }
  emit();
}

export type Snapshot = { metrics: Metric[]; samples: RouteSample[] };

/** Stable, cached snapshot for useSyncExternalStore. */
export function getSnapshot(): Snapshot {
  return snapshot;
}

export function getServerSnapshot(): Snapshot {
  return EMPTY_SNAPSHOT;
}

export function clearRouteSamples() {
  routeSamples = [];
  try {
    localStorage.removeItem(SAMPLES_KEY);
  } catch {
    /* ignore */
  }
  emit();
}

export function subscribeVitals(fn: () => void) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function formatMetric(m: Metric) {
  return m.name === "CLS" ? m.value.toFixed(3) : `${m.value} ms`;
}

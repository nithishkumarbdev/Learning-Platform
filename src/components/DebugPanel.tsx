import { useRouterState } from "@tanstack/react-router";
import { Activity, Gauge, Trash2, X } from "lucide-react";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";

import {
  clearRouteSamples,
  formatMetric,
  getServerSnapshot,
  getSnapshot,
  recordRouteSample,
  startVitals,
  subscribeVitals,
} from "@/lib/vitals";

const RATING_CLASS = {
  good: "text-success",
  "needs-improvement": "text-warning",
  poor: "text-destructive",
} as const;

function useVitals() {
  return useSyncExternalStore(subscribeVitals, getSnapshot, getServerSnapshot);
}

/**
 * Small in-app diagnostics panel. Toggle with the floating button or
 * Ctrl/Cmd + Shift + D. Shows Core Web Vitals, per-route navigation timings
 * and localStorage usage so slow pages can be diagnosed without devtools.
 */
export function DebugPanel() {
  const [open, setOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { metrics, samples } = useVitals();
  const navStart = useRef<number | null>(null);
  const firstPath = useRef(pathname);

  useEffect(() => {
    startVitals();
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === "d") {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (pathname === firstPath.current && navStart.current === null) {
      firstPath.current = "";
      return;
    }
    navStart.current = performance.now();
    const raf = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (navStart.current !== null) {
          recordRouteSample(pathname, performance.now() - navStart.current);
          navStart.current = null;
        }
      });
    });
    return () => cancelAnimationFrame(raf);
  }, [pathname]);

  const storageKb = (() => {
    if (typeof window === "undefined") return 0;
    let total = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k) total += k.length + (localStorage.getItem(k)?.length ?? 0);
    }
    return Math.round(total / 102.4) / 10;
  })();

  const slowest = samples.reduce<number>((max, s) => Math.max(max, s.duration), 0);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="debug-panel"
        aria-label={open ? "Close performance debug panel" : "Open performance debug panel"}
        className="fixed bottom-4 right-4 z-40 grid h-11 w-11 place-items-center rounded-full border border-border bg-card text-muted-foreground shadow-lg transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <Gauge className="h-5 w-5" aria-hidden="true" />
      </button>

      {open && (
        <aside
          id="debug-panel"
          aria-label="Performance diagnostics"
          className="fixed bottom-20 right-4 z-40 w-[min(22rem,calc(100vw-2rem))] rounded-xl border border-border bg-card/95 p-4 text-sm shadow-xl backdrop-blur"
        >
          <div className="mb-3 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-sm font-semibold">
              <Activity className="h-4 w-4 text-primary" aria-hidden="true" />
              Performance
            </h2>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close performance debug panel"
              className="rounded p-1 text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>

          <dl className="grid grid-cols-2 gap-2">
            {metrics.length === 0 && (
              <p className="col-span-2 text-xs text-muted-foreground">Collecting metrics…</p>
            )}
            {metrics.map((m) => (
              <div key={m.name} className="rounded-lg border border-border/60 bg-background/40 p-2">
                <dt className="text-[10px] uppercase tracking-widest text-muted-foreground">
                  {m.name}
                </dt>
                <dd className={`font-mono text-sm ${RATING_CLASS[m.rating]}`}>
                  {formatMetric(m)}
                  <span className="sr-only"> — {m.rating}</span>
                </dd>
              </div>
            ))}
          </dl>

          <div className="mt-3 flex items-center justify-between text-[11px] text-muted-foreground">
            <span>localStorage: {storageKb} KB</span>
            <span>slowest route: {slowest} ms</span>
          </div>

          <div className="mt-3">
            <div className="mb-1 flex items-center justify-between">
              <h3 className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                Recent navigations
              </h3>
              <button
                type="button"
                onClick={clearRouteSamples}
                className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <Trash2 className="h-3 w-3" aria-hidden="true" /> Clear
              </button>
            </div>
            <ul className="max-h-40 space-y-1 overflow-y-auto font-mono text-[11px]">
              {samples.length === 0 && (
                <li className="text-muted-foreground">Navigate to record timings.</li>
              )}
              {samples.map((s) => (
                <li key={`${s.at}-${s.path}`} className="flex justify-between gap-2">
                  <span className="truncate text-muted-foreground">{s.path}</span>
                  <span className={s.duration > 200 ? "text-warning" : "text-foreground"}>
                    {s.duration} ms
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <p className="mt-3 text-[10px] text-muted-foreground">Shortcut: Ctrl/Cmd + Shift + D</p>
        </aside>
      )}
    </>
  );
}

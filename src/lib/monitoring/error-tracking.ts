/**
 * Production error tracking.
 *
 * Transport-agnostic on purpose: the collector below batches breadcrumbs and
 * exceptions and ships them to `/api/public/errors`, which forwards to Sentry
 * when `SENTRY_DSN` is configured and otherwise logs a structured record.
 * Swapping in `@sentry/react` means replacing `send()` — nothing else.
 */
import { RELEASE, releaseId } from "./release";

export type Breadcrumb = {
  at: number;
  category: "navigation" | "ui" | "console" | "fetch";
  message: string;
};

export type ErrorEnvelope = {
  release: string;
  version: string;
  commit: string;
  environment: string;
  at: number;
  type: string;
  message: string;
  stack?: string;
  url: string;
  userAgent: string;
  mechanism: "onerror" | "unhandledrejection" | "manual" | "react_error_boundary";
  handled: boolean;
  breadcrumbs: Breadcrumb[];
  extra?: Record<string, unknown>;
};

const ENDPOINT = "/api/public/errors";
const MAX_BREADCRUMBS = 20;
const MAX_EVENTS_PER_SESSION = 25;

const breadcrumbs: Breadcrumb[] = [];
let sentCount = 0;
let installed = false;
const seen = new Set<string>();

export function addBreadcrumb(category: Breadcrumb["category"], message: string) {
  breadcrumbs.push({ at: Date.now(), category, message: message.slice(0, 300) });
  if (breadcrumbs.length > MAX_BREADCRUMBS) breadcrumbs.shift();
}

export function getBreadcrumbs(): readonly Breadcrumb[] {
  return breadcrumbs;
}

function send(envelope: ErrorEnvelope) {
  const body = JSON.stringify(envelope);
  try {
    if (navigator.sendBeacon?.(ENDPOINT, new Blob([body], { type: "application/json" }))) return;
  } catch {
    // fall through to fetch
  }
  void fetch(ENDPOINT, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body,
    keepalive: true,
  }).catch(() => {
    /* never let telemetry break the app */
  });
}

export function captureException(
  error: unknown,
  options: {
    mechanism?: ErrorEnvelope["mechanism"];
    handled?: boolean;
    extra?: Record<string, unknown>;
  } = {},
) {
  if (typeof window === "undefined") return;
  if (sentCount >= MAX_EVENTS_PER_SESSION) return;

  const err = error instanceof Error ? error : new Error(String(error));
  const fingerprint = `${err.name}:${err.message}:${(err.stack ?? "").slice(0, 200)}`;
  if (seen.has(fingerprint)) return; // de-duplicate error storms
  seen.add(fingerprint);
  sentCount += 1;

  send({
    release: releaseId,
    version: RELEASE.version,
    commit: RELEASE.commit,
    environment: RELEASE.environment,
    at: Date.now(),
    type: err.name,
    message: err.message,
    stack: err.stack,
    url: window.location.href,
    userAgent: navigator.userAgent,
    mechanism: options.mechanism ?? "manual",
    handled: options.handled ?? true,
    breadcrumbs: [...breadcrumbs],
    extra: options.extra,
  });
}

/** Install global handlers once, on the client. */
export function initErrorTracking() {
  if (installed || typeof window === "undefined") return;
  installed = true;

  window.addEventListener("error", (event) => {
    captureException(event.error ?? event.message, { mechanism: "onerror", handled: false });
  });

  window.addEventListener("unhandledrejection", (event) => {
    captureException(event.reason, { mechanism: "unhandledrejection", handled: false });
  });

  addBreadcrumb("navigation", `session start ${window.location.pathname}`);
}

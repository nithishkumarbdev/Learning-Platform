// Edge-level response decoration: security headers, release stamp and cache
// policy for EVERY response, including SSR document renders.
//
// Why here and not only in `src/start.ts`: TanStack's `requestMiddleware` runs
// for server functions and server routes, but SSR document responses in this
// build go straight through the worker entry, so headers set in middleware alone
// never reached HTML pages. `src/server.ts` wraps the real entry, so it is the
// one place guaranteed to see every response.

import { cacheControl, policyForPathname } from "./cache.server";
import { releaseId } from "./monitoring/release";

const CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com data:",
  "img-src 'self' data: blob: https:",
  "connect-src 'self' https:",
  "frame-ancestors 'self'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
].join("; ");

const SECURITY_HEADERS: Record<string, string> = {
  "x-content-type-options": "nosniff",
  "x-frame-options": "SAMEORIGIN",
  "referrer-policy": "strict-origin-when-cross-origin",
  "cross-origin-opener-policy": "same-origin",
  "permissions-policy": "camera=(), microphone=(), geolocation=()",
};

function isProduction(): boolean {
  return process.env.NODE_ENV === "production";
}

/** Returns a response carrying security + caching headers (never mutates in place). */
export function withHardenedHeaders(request: Request, response: Response): Response {
  const headers = new Headers(response.headers);

  for (const [name, value] of Object.entries(SECURITY_HEADERS)) headers.set(name, value);
  headers.set("x-app-release", releaseId);

  if (isProduction()) {
    headers.set("strict-transport-security", "max-age=63072000; includeSubDomains; preload");
    if (!headers.has("content-security-policy")) headers.set("content-security-policy", CSP);
  }

  if (!headers.has("cache-control")) {
    if (request.method !== "GET" && request.method !== "HEAD") {
      headers.set("cache-control", "private, no-store");
    } else {
      const { pathname } = new URL(request.url);
      headers.set("cache-control", cacheControl(policyForPathname(pathname)));
      headers.append("vary", "accept-encoding");
    }
  }

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

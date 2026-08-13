import { createStart, createMiddleware } from "@tanstack/react-start";

import { renderErrorPage } from "./lib/error-page";
import { cacheControl, policyForPathname } from "./lib/cache.server";
import { requiresCsrfCheck, isSameOrigin, verifyDoubleSubmit } from "./lib/auth/csrf.server";
import { CSRF_COOKIE } from "./lib/auth/cookies.server";
import { releaseId } from "./lib/monitoring/release";

const errorMiddleware = createMiddleware().server(async ({ next }) => {
  try {
    return await next();
  } catch (error) {
    if (error != null && typeof error === "object" && "statusCode" in error) {
      throw error;
    }
    console.error(error);
    return new Response(renderErrorPage(), {
      status: 500,
      headers: { "content-type": "text/html; charset=utf-8" },
    });
  }
});

const CSP = [
  "default-src 'self'",
  // Vite/TanStack inject hydration scripts inline; styles come from Google Fonts.
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

/** Security headers + release stamp on every response. */
const securityHeadersMiddleware = createMiddleware().server(async ({ next }) => {
  const response = await next();
  const headers = (response as unknown as { headers?: Headers }).headers;
  if (!headers) return response;

  headers.set("x-content-type-options", "nosniff");
  headers.set("x-frame-options", "SAMEORIGIN");
  headers.set("referrer-policy", "strict-origin-when-cross-origin");
  headers.set("cross-origin-opener-policy", "same-origin");
  headers.set("permissions-policy", "camera=(), microphone=(), geolocation=()");
  headers.set("x-app-release", releaseId);
  if (process.env.NODE_ENV === "production") {
    headers.set("strict-transport-security", "max-age=63072000; includeSubDomains; preload");
    if (!headers.has("content-security-policy")) {
      headers.set("content-security-policy", CSP);
    }
  }
  return response;
});

/**
 * CSRF gate for state-changing requests. Cookie-less public ingest endpoints
 * (telemetry) are exempt and do their own validation + rate limiting.
 */
const CSRF_EXEMPT_PREFIXES = ["/api/public/"];

const csrfMiddleware = createMiddleware().server(async ({ next, request }) => {
  const { pathname } = new URL(request.url);
  const exempt = CSRF_EXEMPT_PREFIXES.some((prefix) => pathname.startsWith(prefix));

  if (requiresCsrfCheck(request.method) && !exempt) {
    if (!isSameOrigin(request)) {
      return new Response("Cross-origin request rejected", { status: 403 });
    }
    const cookieToken = request.headers
      .get("cookie")
      ?.split(";")
      .map((part) => part.trim())
      .find((part) => part.startsWith(`${CSRF_COOKIE}=`))
      ?.slice(CSRF_COOKIE.length + 1);
    const headerToken = request.headers.get("x-csrf-token");

    // Only enforce once a CSRF cookie has actually been issued, so the
    // stateless learner flows keep working untouched.
    if (cookieToken) {
      const check = verifyDoubleSubmit(headerToken, cookieToken);
      if (!check.ok) return new Response(`CSRF check failed: ${check.reason}`, { status: 403 });
    }
  }

  return next();
});

/** Response caching: policy is derived from the pathname. */
const cacheMiddleware = createMiddleware().server(async ({ next, request }) => {
  const response = await next();
  const headers = (response as unknown as { headers?: Headers }).headers;
  if (!headers || headers.has("cache-control")) return response;

  const { pathname } = new URL(request.url);
  if (request.method !== "GET") {
    headers.set("cache-control", "private, no-store");
    return response;
  }
  headers.set("cache-control", cacheControl(policyForPathname(pathname)));
  headers.append("vary", "accept-encoding");
  return response;
});

export const startInstance = createStart(() => ({
  requestMiddleware: [errorMiddleware, securityHeadersMiddleware, csrfMiddleware, cacheMiddleware],
}));

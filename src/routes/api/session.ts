import { createFileRoute } from "@tanstack/react-router";

import {
  CSRF_COOKIE,
  csrfCookieOptions,
  clearedCookieOptions,
  type CookieOptions,
} from "@/lib/auth/cookies.server";
import { createCsrfToken } from "@/lib/auth/csrf.server";

// Session/CSRF endpoint.
//
// The Learning OS is account-less today (progress lives in localStorage), so
// this endpoint is the session *surface* the account layer plugs into:
//
//   GET    -> issues a signed CSRF token in a __Host- cookie ("open session")
//   POST   -> a state-changing action, gated by the CSRF middleware in start.ts
//   DELETE -> clears the session cookie ("close session")
//
// It is deliberately kept behind the global CSRF gate (it is NOT under
// /api/public/*), which makes it the reference implementation for any future
// mutating endpoint and the target of the e2e CSRF tests.

function serializeCookie(name: string, value: string, options: CookieOptions): string {
  const parts = [
    `${name}=${value}`,
    `Path=${options.path}`,
    `Max-Age=${options.maxAge}`,
    `SameSite=${options.sameSite === "lax" ? "Lax" : options.sameSite === "strict" ? "Strict" : "None"}`,
  ];
  if (options.httpOnly) parts.push("HttpOnly");
  if (options.secure) parts.push("Secure");
  return parts.join("; ");
}

function json(body: unknown, init?: ResponseInit): Response {
  return new Response(JSON.stringify(body), {
    ...init,
    headers: { "content-type": "application/json", ...(init?.headers ?? {}) },
  });
}

export const Route = createFileRoute("/api/session")({
  server: {
    handlers: {
      GET: async () => {
        const token = createCsrfToken();
        return json(
          { csrfToken: token },
          {
            headers: {
              "set-cookie": serializeCookie(CSRF_COOKIE, token, csrfCookieOptions()),
              "cache-control": "private, no-store",
            },
          },
        );
      },
      // Reaching this handler means the CSRF gate in src/start.ts passed.
      POST: async () => json({ ok: true, verified: "csrf" }),
      DELETE: async () =>
        json(
          { ok: true },
          {
            headers: {
              "set-cookie": serializeCookie(CSRF_COOKIE, "", clearedCookieOptions()),
              "cache-control": "private, no-store",
            },
          },
        ),
    },
  },
});

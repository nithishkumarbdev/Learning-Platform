// CSRF protection: signed double-submit token.
//
// Server functions are same-origin POSTs, so SameSite cookies already block the
// classic cross-site form attack. This adds defence in depth for any state
// changing endpoint that might later be reachable cross-origin:
//
//   1. Issue a random token, store it in a JS-readable cookie.
//   2. The client echoes it in the `x-csrf-token` header.
//   3. The server requires header === cookie AND a valid HMAC signature, so an
//      attacker who can set cookies still cannot forge a valid token.

import { createHmac } from "node:crypto";

import { randomToken, safeEqual } from "./tokens.server";

const SIGNATURE_SEPARATOR = ".";

function secret(): string {
  // Read inside the function: on Workers, env binds per request.
  return process.env.SESSION_SECRET ?? "development-only-csrf-secret";
}

function sign(value: string): string {
  return createHmac("sha256", secret()).update(value).digest("base64url");
}

export function createCsrfToken(): string {
  const value = randomToken(24);
  return `${value}${SIGNATURE_SEPARATOR}${sign(value)}`;
}

export function isValidCsrfToken(token: string | undefined | null): boolean {
  if (!token) return false;
  const index = token.lastIndexOf(SIGNATURE_SEPARATOR);
  if (index <= 0) return false;
  const value = token.slice(0, index);
  const signature = token.slice(index + 1);
  return safeEqual(signature, sign(value));
}

export type CsrfCheck = { ok: true } | { ok: false; reason: string };

export function verifyDoubleSubmit(
  headerToken: string | undefined | null,
  cookieToken: string | undefined | null,
): CsrfCheck {
  if (!headerToken) return { ok: false, reason: "missing x-csrf-token header" };
  if (!cookieToken) return { ok: false, reason: "missing csrf cookie" };
  if (!safeEqual(headerToken, cookieToken)) return { ok: false, reason: "csrf token mismatch" };
  if (!isValidCsrfToken(headerToken)) return { ok: false, reason: "csrf signature invalid" };
  return { ok: true };
}

const UNSAFE_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

export function requiresCsrfCheck(method: string): boolean {
  return UNSAFE_METHODS.has(method.toUpperCase());
}

/** Same-origin assertion using Origin/Referer, per OWASP recommendation. */
export function isSameOrigin(request: Request): boolean {
  const target = new URL(request.url).origin;
  const origin = request.headers.get("origin");
  if (origin) return origin === target;
  const referer = request.headers.get("referer");
  if (!referer) return true; // no header at all: fall back to the token check
  try {
    return new URL(referer).origin === target;
  } catch {
    return false;
  }
}

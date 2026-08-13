// Strict session-cookie policy, shared by every Set-Cookie in the app.
//
// Rules enforced here:
//   - httpOnly       -> unreadable from JS, kills XSS token theft
//   - secure         -> HTTPS only (relaxed on localhost so dev still works)
//   - sameSite lax   -> blocks cross-site POST CSRF while keeping top-level nav
//   - __Host- prefix -> browser refuses the cookie unless secure + path=/ +
//                       no Domain, so a subdomain can never overwrite it
//   - short access TTL + long rotating refresh TTL (see tokens.server.ts)

import { ACCESS_TOKEN_TTL_SECONDS, REFRESH_TOKEN_TTL_SECONDS } from "./tokens.server";

export type CookieOptions = {
  httpOnly: boolean;
  secure: boolean;
  sameSite: "lax" | "strict" | "none";
  path: string;
  maxAge: number;
};

export const ACCESS_COOKIE = "__Host-los_at";
export const REFRESH_COOKIE = "__Host-los_rt";
/** Readable by JS on purpose: the double-submit half of CSRF protection. */
export const CSRF_COOKIE = "__Host-los_csrf";

function isSecureContext(): boolean {
  return process.env.NODE_ENV === "production";
}

function base(maxAge: number, httpOnly = true): CookieOptions {
  return {
    httpOnly,
    secure: isSecureContext(),
    sameSite: "lax",
    path: "/",
    maxAge,
  };
}

export function accessCookieOptions(): CookieOptions {
  return base(ACCESS_TOKEN_TTL_SECONDS);
}

export function refreshCookieOptions(): CookieOptions {
  return { ...base(REFRESH_TOKEN_TTL_SECONDS), sameSite: "strict" };
}

export function csrfCookieOptions(): CookieOptions {
  return base(REFRESH_TOKEN_TTL_SECONDS, false);
}

export function clearedCookieOptions(): CookieOptions {
  return base(0);
}

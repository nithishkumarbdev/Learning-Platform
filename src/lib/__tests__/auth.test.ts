import { describe, expect, it } from "vitest";

import {
  createMemoryRefreshTokenStore,
  hashToken,
  issueTokenPair,
  rotateRefreshToken,
} from "@/lib/auth/tokens.server";
import { createCsrfToken, isValidCsrfToken, verifyDoubleSubmit } from "@/lib/auth/csrf.server";
import {
  accessCookieOptions,
  refreshCookieOptions,
  csrfCookieOptions,
} from "@/lib/auth/cookies.server";

describe("refresh-token rotation", () => {
  it("issues a hashed, non-plaintext record", async () => {
    const store = createMemoryRefreshTokenStore();
    const pair = await issueTokenPair(store, "user-1");
    expect(await store.get(hashToken(pair.refreshToken))).toBeDefined();
    expect(await store.get(pair.refreshToken)).toBeUndefined();
  });

  it("returns a brand-new refresh token on every rotation", async () => {
    const store = createMemoryRefreshTokenStore();
    const first = await issueTokenPair(store, "user-1");
    const rotated = await rotateRefreshToken(store, first.refreshToken);
    expect(rotated.ok).toBe(true);
    if (!rotated.ok) return;
    expect(rotated.pair.refreshToken).not.toBe(first.refreshToken);
    expect(rotated.pair.familyId).toBe(first.familyId);
  });

  it("detects reuse and revokes the whole token family", async () => {
    const store = createMemoryRefreshTokenStore();
    const first = await issueTokenPair(store, "user-1");
    const rotated = await rotateRefreshToken(store, first.refreshToken);
    expect(rotated.ok).toBe(true);

    const replay = await rotateRefreshToken(store, first.refreshToken);
    expect(replay).toEqual({ ok: false, reason: "reused" });

    if (rotated.ok) {
      const afterRevoke = await rotateRefreshToken(store, rotated.pair.refreshToken);
      expect(afterRevoke.ok).toBe(false);
    }
  });

  it("rejects expired tokens", async () => {
    const store = createMemoryRefreshTokenStore();
    const pair = await issueTokenPair(store, "user-1", undefined, 0);
    const result = await rotateRefreshToken(store, pair.refreshToken, Date.now());
    expect(result).toEqual({ ok: false, reason: "expired" });
  });

  it("rejects unknown tokens", async () => {
    const store = createMemoryRefreshTokenStore();
    expect(await rotateRefreshToken(store, "not-a-token")).toEqual({
      ok: false,
      reason: "unknown",
    });
  });
});

describe("csrf double-submit", () => {
  it("accepts a matching signed token", () => {
    const token = createCsrfToken();
    expect(isValidCsrfToken(token)).toBe(true);
    expect(verifyDoubleSubmit(token, token)).toEqual({ ok: true });
  });

  it("rejects tampered or mismatched tokens", () => {
    const token = createCsrfToken();
    expect(isValidCsrfToken(`${token}x`)).toBe(false);
    expect(verifyDoubleSubmit(token, createCsrfToken()).ok).toBe(false);
    expect(verifyDoubleSubmit(undefined, token).ok).toBe(false);
    expect(verifyDoubleSubmit(token, undefined).ok).toBe(false);
  });
});

describe("session cookie policy", () => {
  it("keeps auth cookies http-only with a short access lifetime", () => {
    const access = accessCookieOptions();
    expect(access.httpOnly).toBe(true);
    expect(access.sameSite).toBe("lax");
    expect(access.maxAge).toBeLessThanOrEqual(900);
  });

  it("scopes the refresh cookie to same-site strict", () => {
    expect(refreshCookieOptions().sameSite).toBe("strict");
    expect(refreshCookieOptions().httpOnly).toBe(true);
  });

  it("leaves only the csrf cookie readable by scripts", () => {
    expect(csrfCookieOptions().httpOnly).toBe(false);
  });
});

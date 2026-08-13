// Refresh-token rotation primitives.
//
// The Learning OS stores learner progress in localStorage, so it ships with no
// user database. These helpers implement the *token lifecycle* that any future
// account layer plugs into, and they are exercised by the unit tests in
// `src/lib/__tests__/auth.test.ts`.
//
// Design (OWASP "Refresh Token Rotation with reuse detection"):
//   - Every refresh consumes the presented token and issues a brand-new one.
//   - Tokens are stored hashed (never in plaintext) and grouped by `familyId`.
//   - Presenting an already-consumed token = theft signal -> the whole family
//     is revoked, forcing re-authentication.

import { createHash, randomBytes, timingSafeEqual } from "node:crypto";

export const ACCESS_TOKEN_TTL_SECONDS = 60 * 10; // 10 minutes
export const REFRESH_TOKEN_TTL_SECONDS = 60 * 60 * 24 * 14; // 14 days

export type RefreshRecord = {
  tokenHash: string;
  familyId: string;
  userId: string;
  issuedAt: number;
  expiresAt: number;
  consumedAt?: number;
};

export type TokenPair = {
  accessToken: string;
  refreshToken: string;
  familyId: string;
  accessTokenExpiresAt: number;
  refreshTokenExpiresAt: number;
};

export function randomToken(bytes = 32): string {
  return randomBytes(bytes).toString("base64url");
}

export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

/**
 * Minimal store contract. Swap the in-memory implementation for a table
 * (`refresh_tokens`) when accounts land — the rotation logic does not change.
 */
export interface RefreshTokenStore {
  get(tokenHash: string): Promise<RefreshRecord | undefined>;
  put(record: RefreshRecord): Promise<void>;
  markConsumed(tokenHash: string, at: number): Promise<void>;
  revokeFamily(familyId: string): Promise<void>;
  isFamilyRevoked(familyId: string): Promise<boolean>;
}

export function createMemoryRefreshTokenStore(): RefreshTokenStore {
  const records = new Map<string, RefreshRecord>();
  const revokedFamilies = new Set<string>();

  return {
    async get(tokenHash) {
      return records.get(tokenHash);
    },
    async put(record) {
      records.set(record.tokenHash, record);
    },
    async markConsumed(tokenHash, at) {
      const existing = records.get(tokenHash);
      if (existing) records.set(tokenHash, { ...existing, consumedAt: at });
    },
    async revokeFamily(familyId) {
      revokedFamilies.add(familyId);
      for (const [hash, record] of records) {
        if (record.familyId === familyId) records.delete(hash);
      }
    },
    async isFamilyRevoked(familyId) {
      return revokedFamilies.has(familyId);
    },
  };
}

export async function issueTokenPair(
  store: RefreshTokenStore,
  userId: string,
  familyId = randomToken(16),
  now = Date.now(),
): Promise<TokenPair> {
  const refreshToken = randomToken();
  const refreshTokenExpiresAt = now + REFRESH_TOKEN_TTL_SECONDS * 1000;

  await store.put({
    tokenHash: hashToken(refreshToken),
    familyId,
    userId,
    issuedAt: now,
    expiresAt: refreshTokenExpiresAt,
  });

  return {
    accessToken: randomToken(),
    refreshToken,
    familyId,
    accessTokenExpiresAt: now + ACCESS_TOKEN_TTL_SECONDS * 1000,
    refreshTokenExpiresAt,
  };
}

export type RotationResult =
  | { ok: true; pair: TokenPair }
  | { ok: false; reason: "unknown" | "expired" | "reused" | "revoked" };

/** Consume `presentedToken` and mint a replacement, with reuse detection. */
export async function rotateRefreshToken(
  store: RefreshTokenStore,
  presentedToken: string,
  now = Date.now(),
): Promise<RotationResult> {
  const tokenHash = hashToken(presentedToken);
  const record = await store.get(tokenHash);

  if (!record) return { ok: false, reason: "unknown" };
  if (await store.isFamilyRevoked(record.familyId)) return { ok: false, reason: "revoked" };

  if (record.consumedAt !== undefined) {
    // Replay of an already-rotated token: assume exfiltration, kill the family.
    await store.revokeFamily(record.familyId);
    return { ok: false, reason: "reused" };
  }

  if (record.expiresAt <= now) {
    await store.revokeFamily(record.familyId);
    return { ok: false, reason: "expired" };
  }

  await store.markConsumed(tokenHash, now);
  const pair = await issueTokenPair(store, record.userId, record.familyId, now);
  return { ok: true, pair };
}

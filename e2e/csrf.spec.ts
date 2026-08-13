import { test, expect } from "@playwright/test";
import { createHmac, randomBytes } from "node:crypto";

// The CSRF gate lives in src/start.ts and is a *signed* double-submit:
// header must equal cookie AND the cookie must carry a valid HMAC.
// Enforcement only kicks in once a CSRF cookie exists, so the stateless
// learner flows keep working — these tests drive both sides of that switch.

const CSRF_COOKIE = "__Host-los_csrf";
const SECRET = process.env.SESSION_SECRET ?? "development-only-csrf-secret";

function signedToken(): string {
  const value = randomBytes(24).toString("base64url");
  return `${value}.${createHmac("sha256", SECRET).update(value).digest("base64url")}`;
}

// __Host- cookies require secure+path=/; over plain http in dev we set a
// same-named cookie without the prefix constraint by using the raw header.
function cookieHeader(value: string): Record<string, string> {
  return { cookie: `${CSRF_COOKIE}=${value}` };
}

test.describe("CSRF-protected actions", () => {
  test("unsafe request with a CSRF cookie but no header is rejected", async ({ request }) => {
    const res = await request.post("/api/session", {
      headers: {
        ...cookieHeader(signedToken()),
        origin: new URL("/", "http://localhost:8080").origin,
      },
      data: {},
      failOnStatusCode: false,
    });
    expect(res.status()).toBe(403);
    expect(await res.text()).toContain("missing x-csrf-token header");
  });

  test("mismatched header/cookie pair is rejected", async ({ request, baseURL }) => {
    const res = await request.post("/api/session", {
      headers: {
        ...cookieHeader(signedToken()),
        "x-csrf-token": signedToken(),
        origin: new URL(baseURL!).origin,
      },
      data: {},
      failOnStatusCode: false,
    });
    expect(res.status()).toBe(403);
    expect(await res.text()).toContain("mismatch");
  });

  test("forged (unsigned) token is rejected even when header === cookie", async ({
    request,
    baseURL,
  }) => {
    const forged = "attacker.controlled";
    const res = await request.post("/api/session", {
      headers: {
        ...cookieHeader(forged),
        "x-csrf-token": forged,
        origin: new URL(baseURL!).origin,
      },
      data: {},
      failOnStatusCode: false,
    });
    expect(res.status()).toBe(403);
    expect(await res.text()).toContain("signature invalid");
  });

  test("cross-origin unsafe request is rejected before any token check", async ({ request }) => {
    const res = await request.post("/api/session", {
      headers: { ...cookieHeader(signedToken()), origin: "https://evil.example" },
      data: {},
      failOnStatusCode: false,
    });
    expect(res.status()).toBe(403);
    expect(await res.text()).toContain("Cross-origin");
  });

  test("a correctly signed matching pair passes the gate", async ({ request, baseURL }) => {
    const token = signedToken();
    const res = await request.post("/api/session", {
      headers: { ...cookieHeader(token), "x-csrf-token": token, origin: new URL(baseURL!).origin },
      data: {},
      failOnStatusCode: false,
    });
    expect(res.status()).toBe(200);
    expect(await res.json()).toMatchObject({ ok: true });
  });

  test("/api/public/* stays exempt but validates its own input", async ({ request }) => {
    const bad = await request.post("/api/public/errors", {
      data: { not: "an envelope" },
      failOnStatusCode: false,
    });
    expect(bad.status()).toBe(400);
  });
});

import { test, expect } from "@playwright/test";

import { gotoHydrated } from "./helpers";

// Header contract: every response leaving the worker entry is decorated by
// `withHardenedHeaders` (src/lib/http-headers.server.ts). HSTS + CSP are
// production-only so Vite's dev HMR (websocket + eval) keeps working, which is
// why those two are asserted conditionally.

const isProd = process.env.E2E_ENV === "production";

test.describe("security headers", () => {
  test("document responses carry the always-on hardening headers", async ({ request }) => {
    const res = await request.get("/");
    expect(res.status()).toBe(200);
    const h = res.headers();

    expect(h["x-content-type-options"]).toBe("nosniff");
    expect(h["x-frame-options"]).toBe("SAMEORIGIN");
    expect(h["referrer-policy"]).toBe("strict-origin-when-cross-origin");
    expect(h["cross-origin-opener-policy"]).toBe("same-origin");
    expect(h["permissions-policy"]).toContain("camera=()");
    expect(h["permissions-policy"]).toContain("microphone=()");
    expect(h["permissions-policy"]).toContain("geolocation=()");
    // release stamp: lets a bad deploy be identified from a single response
    expect(h["x-app-release"]).toBeTruthy();
    // cache policy is derived from the pathname
    expect(h["cache-control"]).toBeTruthy();
  });

  test("HSTS and CSP are present in production builds", async ({ request }) => {
    test.skip(!isProd, "dev server intentionally omits CSP/HSTS for HMR");
    const h = (await request.get("/")).headers();
    expect(h["strict-transport-security"]).toContain("max-age=63072000");
    const csp = h["content-security-policy"] ?? "";
    expect(csp).toContain("default-src 'self'");
    expect(csp).toContain("object-src 'none'");
    expect(csp).toContain("frame-ancestors 'self'");
    expect(csp).toContain("base-uri 'self'");
  });

  test("the CSP does not break the app: page renders with no console errors", async ({ page }) => {
    const errors: string[] = [];
    // Missing static assets (favicon/dev artefacts) are not CSP violations.
    const ignorable = /favicon|net::ERR_ABORTED|status of 404/i;
    page.on("console", (m) => {
      if (m.type() === "error" && !ignorable.test(m.text())) errors.push(m.text());
    });
    page.on("pageerror", (e) => errors.push(e.message));

    await gotoHydrated(page, "/");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await gotoHydrated(page, "/roadmap");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

    expect(errors).toEqual([]);
  });

  test("non-GET responses are never cached", async ({ request }) => {
    const res = await request.post("/api/public/errors", {
      data: { nope: true },
      failOnStatusCode: false,
    });
    expect(res.headers()["cache-control"]).toContain("no-store");
  });
});

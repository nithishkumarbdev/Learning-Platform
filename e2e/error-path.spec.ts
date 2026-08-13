import { test, expect } from "@playwright/test";

import { gotoHydrated } from "./helpers";

// Deploy / error-path scenarios: unknown routes, telemetry ingest contract,
// rate limiting, body caps, and the release stamp used to identify a bad deploy.

const envelope = () => ({
  release: "learning-os@test",
  version: "test",
  commit: "e2e",
  environment: "test",
  at: Date.now(),
  type: "Error",
  message: "e2e synthetic error",
  url: "http://localhost:8080/",
  userAgent: "playwright",
  mechanism: "manual" as const,
  handled: true,
  breadcrumbs: [{ at: Date.now(), category: "ui" as const, message: "clicked" }],
});

test.describe("error paths", () => {
  test("unknown route renders a not-found page, not a crash", async ({ page }) => {
    const res = await page.goto("/this-route-does-not-exist", { waitUntil: "domcontentloaded" });
    expect(res?.status()).toBeLessThan(500);
    await gotoHydrated(page, "/this-route-does-not-exist");
    await expect(page.locator("body")).not.toContainText("HTTPError");
  });

  test("valid telemetry envelope is accepted", async ({ request }) => {
    const res = await request.post("/api/public/errors", { data: envelope() });
    expect(res.status()).toBe(204);
  });

  test("malformed envelope is rejected with 400 and no detail leak", async ({ request }) => {
    const res = await request.post("/api/public/errors", {
      data: { message: 1 },
      failOnStatusCode: false,
    });
    expect(res.status()).toBe(400);
    expect(await res.text()).toBe("");
  });

  test("oversized payload is rejected with 413", async ({ request }) => {
    const res = await request.post("/api/public/errors", {
      data: { ...envelope(), stack: "x".repeat(70 * 1024) },
      failOnStatusCode: false,
    });
    expect([400, 413]).toContain(res.status());
  });

  test("ingest is rate limited", async ({ request }) => {
    let limited = false;
    for (let i = 0; i < 40; i += 1) {
      const res = await request.post("/api/public/errors", {
        data: envelope(),
        headers: { "x-forwarded-for": "203.0.113.9" },
        failOnStatusCode: false,
      });
      if (res.status() === 429) {
        limited = true;
        expect(res.headers()["retry-after"]).toBe("60");
        break;
      }
    }
    expect(limited).toBe(true);
  });

  test("every response identifies the release that produced it", async ({ request }) => {
    const release = (await request.get("/")).headers()["x-app-release"];
    expect(release).toBeTruthy();
    const api = (await request.get("/api/session")).headers()["x-app-release"];
    expect(api).toBe(release);
  });
});

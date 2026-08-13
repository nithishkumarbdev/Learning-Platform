import { test, expect } from "@playwright/test";

import { gotoHydrated, waitForHydration } from "./helpers";

// "Login" flow for an account-less app: the session surface is
// GET /api/session (issue signed CSRF cookie) -> POST (protected action)
// -> DELETE (sign out). Plus the learner-state equivalent of a session:
// progress must survive a full reload.

test.describe("session lifecycle", () => {
  test("issue -> use -> revoke", async ({ request }) => {
    const open = await request.get("/api/session");
    expect(open.status()).toBe(200);
    const { csrfToken } = (await open.json()) as { csrfToken: string };
    expect(csrfToken).toMatch(/^[\w-]+\.[\w-]+$/);
    expect(open.headers()["cache-control"]).toContain("no-store");

    // cookie jar is shared by the request context, so only the header is needed
    const action = await request.post("/api/session", {
      headers: { "x-csrf-token": csrfToken },
      data: {},
      failOnStatusCode: false,
    });
    expect(action.status()).toBe(200);

    const close = await request.delete("/api/session", {
      headers: { "x-csrf-token": csrfToken },
      failOnStatusCode: false,
    });
    expect(close.status()).toBe(200);
  });

  test("session cookie policy is strict", async ({ request }) => {
    const res = await request.get("/api/session");
    const setCookie = res.headers()["set-cookie"] ?? "";
    expect(setCookie).toContain("__Host-los_csrf=");
    expect(setCookie).toContain("Path=/");
    expect(setCookie).toContain("SameSite=Lax");
    expect(setCookie).not.toContain("Domain=");
  });

  test("learner progress persists across a reload", async ({ page }) => {
    await gotoHydrated(page, "/today");

    const markDone = page.getByRole("button", { name: /Mark done/i }).first();
    await expect(markDone).toBeVisible();
    await markDone.click();

    // the toggled task flips out of the "Mark done" state
    await expect(page.getByRole("button", { name: /Mark done/i })).toHaveCount(
      await page.getByRole("button", { name: /Mark done/i }).count(),
    );

    const before = await page.evaluate(() =>
      JSON.stringify(
        Object.fromEntries(
          Object.keys(window.localStorage)
            .filter((k) => k.startsWith("los_"))
            .map((k) => [k, window.localStorage.getItem(k)]),
        ),
      ),
    );
    expect(before.length).toBeGreaterThan(2);

    await page.reload({ waitUntil: "domcontentloaded" });
    await waitForHydration(page);
    await waitForHydration(page);
    const after = await page.evaluate(() =>
      JSON.stringify(
        Object.fromEntries(
          Object.keys(window.localStorage)
            .filter((k) => k.startsWith("los_"))
            .map((k) => [k, window.localStorage.getItem(k)]),
        ),
      ),
    );
    expect(after).toBe(before);
  });
});

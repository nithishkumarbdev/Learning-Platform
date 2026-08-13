import type { Page } from "@playwright/test";

/**
 * Navigate and wait until React has hydrated.
 *
 * `domcontentloaded` fires while the SSR markup is still inert: buttons are in
 * the DOM but no handler is attached yet, so clicks are silently dropped. Every
 * interactive test must go through here.
 */
export async function gotoHydrated(page: Page, path: string): Promise<void> {
  await page.goto(path, { waitUntil: "domcontentloaded" });
  await waitForHydration(page);
}

/** Waits for the `data-hydrated` marker set by the root route's mount effect. */
export async function waitForHydration(page: Page): Promise<void> {
  await page.waitForSelector("html[data-hydrated='true']", { state: "attached", timeout: 30_000 });
}

import { test, expect } from "@playwright/test";

import { gotoHydrated, waitForHydration } from "./helpers";

// Full assessment flow: pick a checkpoint -> answer every MCQ -> submit ->
// answers are graded, XP is awarded, and the score survives a reload.

test.describe("assessment flow", () => {
  test("complete a weekly checkpoint end to end", async ({ page }) => {
    await gotoHydrated(page, "/assessments");
    await expect(page.getByRole("heading", { name: /Mini Assessments/i })).toBeVisible();

    // card labels are uppercased by CSS, so match case-insensitively
    await page
      .getByRole("button")
      .filter({ hasText: /week 1/i })
      .first()
      .click();

    const questions = page.locator("[data-question]");
    await expect(questions.first()).toBeVisible();
    const count = await questions.count();
    expect(count).toBeGreaterThan(0);

    for (let i = 0; i < count; i += 1) {
      await questions.nth(i).getByRole("button").first().click();
    }

    const submit = page.getByRole("button", { name: /Submit & Grade/i });
    await expect(submit).toBeEnabled();
    await submit.click();

    // graded: score badge + XP award are rendered
    await expect(page.getByText(new RegExp(`/${count}\\s*·\\s*\\+\\d+ XP`))).toBeVisible();
    // explanations are revealed for every question
    await expect(page.getByText(/Why:/).first()).toBeVisible();

    await page.getByRole("button", { name: /^Back to checkpoints$/ }).click();
    const badge = page.getByText(/^\d+%$/).first();
    await expect(badge).toBeVisible();
    const scoreText = await badge.textContent();

    await page.reload({ waitUntil: "domcontentloaded" });
    await waitForHydration(page);
    await waitForHydration(page);
    await expect(page.getByText(scoreText!.trim()).first()).toBeVisible();
  });

  test("assessments page is keyboard navigable", async ({ page }) => {
    await gotoHydrated(page, "/assessments");
    await page.keyboard.press("Tab");
    const focused = await page.evaluate(() => document.activeElement?.textContent ?? "");
    expect(focused.length).toBeGreaterThan(0);
  });
});

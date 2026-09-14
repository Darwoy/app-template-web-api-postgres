import { test, expect } from "@playwright/test";

test("S-1: when I add a note, then it appears in the list", async ({ page }) => {
  await page.goto("/");
  const text = `Scenario note ${Date.now()}`;
  await page.fill("input[name=text]", text);
  await page.getByRole("button", { name: "Add note" }).click();
  await expect(page.locator("li[data-testid=note]", { hasText: text })).toBeVisible();
});

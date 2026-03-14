import { test, expect } from "@playwright/test";

test.describe("404 Page", () => {
  test("unknown routes show 404 page", async ({ page }) => {
    const response = await page.goto("/this-route-definitely-does-not-exist");
    expect(response?.status()).toBe(404);
  });

  test("404 page has expected heading", async ({ page }) => {
    await page.goto("/nonexistent-page-xyz");
    await expect(page.getByText("404")).toBeVisible();
    await expect(page.getByText("Page not found")).toBeVisible();
  });

  test('404 page has "Back to Home" link', async ({ page }) => {
    await page.goto("/nonexistent-page-xyz");
    const homeLink = page.locator('a[href="/"]').first();
    await expect(homeLink).toBeVisible();
  });

  test("404 page includes header and footer", async ({ page }) => {
    await page.goto("/nonexistent-page-xyz");
    await expect(page.locator("header").first()).toBeVisible();
    await expect(page.locator("footer").first()).toBeVisible();
  });
});

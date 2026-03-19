import { test, expect } from "@playwright/test";

/**
 * CI smoke tests — run against `astro preview` (built output).
 * These tests verify that static/prerendered pages work without a database.
 * They catch CSP issues, broken scripts, and build-time regressions.
 */
test.describe("CI Smoke tests", () => {
  test("home page renders without console errors", async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") errors.push(msg.text());
    });

    const response = await page.goto("/");
    expect(response?.status()).toBe(200);
    await expect(page.locator("body")).toBeVisible();

    // Filter out expected errors (e.g. failed API calls to backend that isn't running)
    const cspErrors = errors.filter(
      (e) =>
        e.includes("Content Security Policy") ||
        e.includes("refused to execute")
    );
    expect(cspErrors).toHaveLength(0);
  });

  test("mobile menu toggles on hamburger click", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/");
    const menu = page.locator("#mobile-menu");
    await expect(menu).toBeHidden();
    await page.click("#mobile-menu-btn");
    await expect(menu).toBeVisible();
  });

  test("back-to-top button appears on scroll", async ({ page }) => {
    await page.goto("/");
    const btn = page.locator("#back-to-top");
    await expect(btn).toBeHidden();
    await page.evaluate(() => window.scrollTo(0, 500));
    await expect(btn).toBeVisible();
  });

  test("about page renders", async ({ page }) => {
    const response = await page.goto("/about");
    expect(response?.status()).toBe(200);
    await expect(page.locator("h1")).toBeVisible();
  });

  test("sign-in page renders", async ({ page }) => {
    const response = await page.goto("/auth/signin");
    expect(response?.status()).toBe(200);
    await expect(
      page.locator("text=Welcome to Runners In Need")
    ).toBeVisible();
  });
});

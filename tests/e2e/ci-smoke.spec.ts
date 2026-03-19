import { test, expect } from "@playwright/test";

/**
 * CI smoke tests — run against `astro preview` (built output).
 * Only test prerendered pages (no database needed).
 * They catch CSP issues, broken scripts, and build-time regressions.
 */
test.describe("CI Smoke tests", () => {
  test("about page renders with 200 status", async ({ page }) => {
    const response = await page.goto("/about");
    expect(response?.status()).toBe(200);
    await expect(page.locator("h1")).toBeVisible();
  });

  test("mobile menu toggles on hamburger click", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/about");
    const menu = page.locator("#mobile-menu");
    await expect(menu).toBeHidden();
    await page.click("#mobile-menu-btn");
    await expect(menu).toBeVisible();
  });

  test("back-to-top button exists in DOM", async ({ page }) => {
    await page.goto("/about");
    const btn = page.locator("#back-to-top");
    await expect(btn).toBeAttached();
  });

  test("contact page renders", async ({ page }) => {
    const response = await page.goto("/contact");
    expect(response?.status()).toBe(200);
    await expect(page.locator("body")).toBeVisible();
  });

  test("sign-in page renders", async ({ page }) => {
    const response = await page.goto("/auth/signin");
    expect(response?.status()).toBe(200);
    await expect(
      page.locator("text=Welcome to Runners In Need")
    ).toBeVisible();
  });
});

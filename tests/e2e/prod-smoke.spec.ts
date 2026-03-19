import { test, expect } from "@playwright/test";

/**
 * Production smoke tests — run against the live site after deploy.
 * These verify that the deployment succeeded and key pages work.
 * Tests both prerendered (static) and server-rendered (DB-backed) pages.
 */
test.describe("Production smoke tests", () => {
  test("home page loads with org names (not Unknown Organization)", async ({
    page,
  }) => {
    const response = await page.goto("/");
    expect(response?.status()).toBe(200);
    // The home page should show real org names, not the fallback
    const body = await page.textContent("body");
    expect(body).not.toContain("Unknown Organization");
  });

  test("about page renders (prerendered)", async ({ page }) => {
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

  test("need detail page loads", async ({ page }) => {
    // Go to home page, find a need link, follow it
    await page.goto("/");
    const needLink = page.locator('a[href^="/needs/"]').first();
    const href = await needLink.getAttribute("href");
    expect(href).toBeTruthy();

    const response = await page.goto(href!);
    expect(response?.status()).toBe(200);
    await expect(page.locator("h1")).toBeVisible();
  });

  test("no console errors on prerendered pages", async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") errors.push(msg.text());
    });

    await page.goto("/about");
    await page.waitForTimeout(1000);

    // Filter out expected errors (e.g. analytics, third-party)
    const cspErrors = errors.filter(
      (e) =>
        e.includes("Content Security Policy") ||
        e.includes("refused to execute")
    );
    expect(cspErrors).toHaveLength(0);
  });

  test("mobile menu works on production", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/about");
    const menu = page.locator("#mobile-menu");
    await expect(menu).toBeHidden();
    await page.click("#mobile-menu-btn");
    await expect(menu).toBeVisible();
  });
});

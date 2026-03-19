import { test, expect } from "@playwright/test";

test.describe("Smoke tests", () => {
  test("home page renders", async ({ page }) => {
    const response = await page.goto("/");
    expect(response?.status()).toBe(200);
    await expect(page.locator("body")).toBeVisible();
  });

  test("/browse page renders", async ({ page }) => {
    const response = await page.goto("/browse");
    expect(response?.status()).toBe(200);
    await expect(page.locator("body")).toBeVisible();
  });

  test("/about page renders", async ({ page }) => {
    const response = await page.goto("/about");
    expect(response?.status()).toBe(200);
    await expect(page.locator("body")).toBeVisible();
  });

  test("/api/health returns 200", async ({ request }) => {
    const response = await request.get("/api/health");
    expect(response.status()).toBe(200);
  });

  test("mobile menu toggles on hamburger click", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/");
    const menu = page.locator("#mobile-menu");
    await expect(menu).toBeHidden();
    await page.click("#mobile-menu-btn");
    await expect(menu).toBeVisible();
    await page.click("#mobile-menu-btn");
    await expect(menu).toBeHidden();
  });

  test("back-to-top button appears on scroll", async ({ page }) => {
    await page.goto("/");
    const btn = page.locator("#back-to-top");
    await expect(btn).toBeHidden();
    await page.evaluate(() => window.scrollTo(0, 500));
    await expect(btn).toBeVisible();
  });

  test("sign-in buttons become enabled after CSRF fetch", async ({ page }) => {
    await page.goto("/auth/signin");
    const emailBtn = page.locator("button.signin-submit").first();
    await expect(emailBtn).toBeEnabled({ timeout: 5000 });
  });
});

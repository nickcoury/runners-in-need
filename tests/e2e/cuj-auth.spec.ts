import { test, expect } from "@playwright/test";

test.describe("CUJ-3: Auth Flow", () => {
  test("sign-in page renders at /auth/signin", async ({ page }) => {
    await page.goto("/auth/signin");
    await expect(page.locator("h1").first()).toHaveText("Sign In");
  });

  test("has magic link form with email input", async ({ page }) => {
    await page.goto("/auth/signin");

    // Magic link form posts to /api/auth/signin/resend
    const magicLinkForm = page.locator(
      'form[action="/api/auth/signin/resend"]'
    );
    await expect(magicLinkForm).toBeVisible();

    // Email input inside the form
    const emailInput = magicLinkForm.locator('input[name="email"]');
    await expect(emailInput).toBeVisible();
    await expect(emailInput).toHaveAttribute("type", "email");
    await expect(emailInput).toHaveAttribute("required", "");

    // Submit button
    await expect(
      magicLinkForm.locator("button", { hasText: "Send magic link" })
    ).toBeVisible();
  });

  test("has Google OAuth button", async ({ page }) => {
    await page.goto("/auth/signin");

    // Google OAuth form posts to /api/auth/signin/google
    const googleForm = page.locator(
      'form[action="/api/auth/signin/google"]'
    );
    await expect(googleForm).toBeVisible();

    // Google button
    await expect(
      googleForm.locator("button", { hasText: "Continue with Google" })
    ).toBeVisible();
  });

  test("has CSRF token hidden inputs", async ({ page }) => {
    await page.goto("/auth/signin");

    // Both forms have hidden csrfToken inputs
    const csrfInputs = page.locator('input[name="csrfToken"]');
    expect(await csrfInputs.count()).toBeGreaterThanOrEqual(2);

    // Both should be hidden inputs
    for (let i = 0; i < (await csrfInputs.count()); i++) {
      await expect(csrfInputs.nth(i)).toHaveAttribute("type", "hidden");
    }
  });

  test("has callbackUrl hidden inputs", async ({ page }) => {
    await page.goto("/auth/signin?callbackUrl=/dashboard");

    const callbackInputs = page.locator('input[name="callbackUrl"]');
    expect(await callbackInputs.count()).toBeGreaterThanOrEqual(2);

    for (let i = 0; i < (await callbackInputs.count()); i++) {
      await expect(callbackInputs.nth(i)).toHaveAttribute(
        "value",
        "/dashboard"
      );
    }
  });

  test("/dashboard redirects to signin when not authenticated", async ({
    page,
  }) => {
    await page.goto("/dashboard");
    await page.waitForURL(/\/auth\/signin/);
    expect(page.url()).toContain("/auth/signin");
    expect(page.url()).toContain("callbackUrl");
    expect(page.url()).toContain("dashboard");
  });

  test("/profile redirects to signin when not authenticated", async ({
    page,
  }) => {
    await page.goto("/profile");
    await page.waitForURL(/\/auth\/signin/);
    expect(page.url()).toContain("/auth/signin");
    expect(page.url()).toContain("callbackUrl");
    expect(page.url()).toContain("profile");
  });

  test("/post redirects to signin when not authenticated", async ({
    page,
  }) => {
    await page.goto("/post");
    await page.waitForURL(/\/auth\/signin/);
    expect(page.url()).toContain("/auth/signin");
    expect(page.url()).toContain("callbackUrl");
    expect(page.url()).toContain("post");
  });

  test("callbackUrl parameter is preserved in redirect", async ({ page }) => {
    // Navigate to a protected route
    await page.goto("/dashboard");
    await page.waitForURL(/\/auth\/signin/);

    // The signin page should have callbackUrl set to /dashboard
    const url = new URL(page.url());
    const callbackUrl = url.searchParams.get("callbackUrl");
    expect(callbackUrl).toBe("/dashboard");

    // The hidden inputs in the forms should reflect this
    const callbackInputs = page.locator(
      'input[name="callbackUrl"][value="/dashboard"]'
    );
    expect(await callbackInputs.count()).toBeGreaterThanOrEqual(1);
  });

  test("signin page has links to terms and privacy", async ({ page }) => {
    await page.goto("/auth/signin");

    const termsLink = page.locator('.max-w-sm a[href="/terms"]');
    await expect(termsLink).toBeVisible();

    const privacyLink = page.locator('.max-w-sm a[href="/privacy"]');
    await expect(privacyLink).toBeVisible();
  });
});

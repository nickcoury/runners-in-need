import { test, expect } from "@playwright/test";

test.describe("CUJ-6: Pledge Drives", () => {
  test("/drives page loads with proper structure", async ({ page }) => {
    const response = await page.goto("/drives");
    expect(response?.status()).toBe(200);
    await expect(page.locator("body")).toBeVisible();
  });

  test("page has heading and description", async ({ page }) => {
    await page.goto("/drives");

    await expect(page.locator("h1")).toHaveText("Pledge Drives");

    // Description text in the hero section
    await expect(
      page.getByText("A pledge drive is a gear collection event", {
        exact: false,
      })
    ).toBeVisible();
  });

  test("has the 'Why Organize a Pledge Drive?' section", async ({ page }) => {
    await page.goto("/drives");

    await expect(
      page.locator("h2", { hasText: "Why Organize a Pledge Drive?" })
    ).toBeVisible();

    // Three benefit cards
    await expect(
      page.getByText("Higher Volume", { exact: false })
    ).toBeVisible();
    await expect(
      page.getByText("Community Impact", { exact: false })
    ).toBeVisible();
    await expect(
      page.getByText("Easy Distribution", { exact: false })
    ).toBeVisible();
  });

  test("has the 'Upcoming Drives' section", async ({ page }) => {
    await page.goto("/drives");

    await expect(
      page.locator("h2", { hasText: "Upcoming Drives" })
    ).toBeVisible();
  });

  test("when not signed in, shows sign-in prompt for organizing", async ({
    page,
  }) => {
    await page.goto("/drives");

    // The CTA button should link to sign-in with callbackUrl
    const signInLink = page.locator(
      'a[href="/auth/signin?callbackUrl=/drives"]'
    );
    await expect(signInLink).toBeVisible();
    await expect(signInLink).toHaveText("Sign In to Organize a Drive");

    // The organize form should NOT be visible when not signed in
    const organizeForm = page.locator("#organize-form");
    expect(await organizeForm.count()).toBe(0);
  });
});

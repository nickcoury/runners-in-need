import { test, expect } from "@playwright/test";

test.describe("CUJ-5: Become Organizer", () => {
  test("/become-organizer page loads", async ({ page }) => {
    const response = await page.goto("/become-organizer");
    expect(response?.status()).toBe(200);
    await expect(page.locator("body")).toBeVisible();
  });

  test("page has proper heading and description", async ({ page }) => {
    await page.goto("/become-organizer");

    await expect(page.locator("h1")).toHaveText("Become an Organizer");

    // Description text
    await expect(
      page.getByText(
        "Organizers can post needs on behalf of their running program."
      )
    ).toBeVisible();
    await expect(
      page.getByText("We verify each request to ensure legitimacy.")
    ).toBeVisible();
  });

  test("when not signed in, shows sign-in prompt", async ({ page }) => {
    await page.goto("/become-organizer");

    // Sign-in prompt should be visible
    const signInPrompt = page.getByText("sign in", { exact: false });
    await expect(signInPrompt.first()).toBeVisible();

    // The sign-in link should point to /auth/signin with callbackUrl
    const signInLink = page.locator(
      'a[href="/auth/signin?callbackUrl=/become-organizer"]'
    );
    await expect(signInLink).toBeVisible();
  });

  test("sign-in prompt links back to become-organizer via callbackUrl", async ({
    page,
  }) => {
    await page.goto("/become-organizer");

    const signInLink = page.locator(
      'a[href="/auth/signin?callbackUrl=/become-organizer"]'
    );
    await expect(signInLink).toBeVisible();

    const href = await signInLink.getAttribute("href");
    expect(href).toContain("callbackUrl=/become-organizer");
  });
});

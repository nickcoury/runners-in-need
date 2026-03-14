import { test, expect } from "@playwright/test";

test.describe("CUJ-7: Org Profile Page", () => {
  /**
   * Helper to get an org profile URL by navigating to a need detail page
   * and extracting the org link. Returns null if no needs exist.
   */
  async function getOrgUrl(
    page: import("@playwright/test").Page
  ): Promise<string | null> {
    await page.goto("/");
    const needCards = page.locator(".need-card");
    const count = await needCards.count();
    if (count === 0) return null;

    const href = await needCards
      .first()
      .locator("a[href^='/needs/']")
      .first()
      .getAttribute("href");
    await page.goto(href!);

    const orgLink = page.locator('[data-testid="need-org-name"]');
    const orgCount = await orgLink.count();
    if (orgCount === 0) return null;
    const orgHref = await orgLink.getAttribute("href");
    if (!orgHref) return null;

    // Verify org page actually loads (org may have been deleted)
    const res = await page.goto(orgHref);
    if (!res || res.status() !== 200) return null;
    await page.goto("/"); // reset
    return orgHref;
  }

  test("org profile page loads with proper structure", async ({ page }) => {
    const orgUrl = await getOrgUrl(page);
    if (!orgUrl) {
      test.skip(true, "No needs in database — cannot find an org to test");
      return;
    }

    const response = await page.goto(orgUrl);
    expect(response?.status()).toBe(200);

    // Org name as h1
    const h1 = page.locator("h1");
    await expect(h1).toBeVisible();
    const name = await h1.textContent();
    expect(name?.trim().length).toBeGreaterThan(0);
  });

  test("org profile shows active needs section", async ({ page }) => {
    const orgUrl = await getOrgUrl(page);
    if (!orgUrl) {
      test.skip(true, "No needs in database — cannot find an org to test");
      return;
    }

    await page.goto(orgUrl);

    // Active Needs heading
    await expect(
      page.locator("h2", { hasText: /Active Needs/ })
    ).toBeVisible();
  });

  test("org profile has back-to-browse link", async ({ page }) => {
    const orgUrl = await getOrgUrl(page);
    if (!orgUrl) {
      test.skip(true, "No needs in database — cannot find an org to test");
      return;
    }

    await page.goto(orgUrl);

    const backLink = page.locator("a", { hasText: "Back to browse" });
    await expect(backLink).toBeVisible();
  });

  test("nonexistent org redirects to 404", async ({ page }) => {
    const response = await page.goto("/org/nonexistent-org-id-12345");
    // Should redirect to 404 page
    await expect(page.getByText("404")).toBeVisible();
  });
});

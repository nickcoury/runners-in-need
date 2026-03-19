import { test, expect } from "@playwright/test";

test.describe("CUJ-2: Anonymous Pledge", () => {
  /**
   * Helper to navigate to a need detail page.
   * Finds the first need from the home page and navigates to it.
   * Returns true if a need was found, false if DB is empty.
   */
  async function goToFirstNeedDetail(
    page: import("@playwright/test").Page
  ): Promise<boolean> {
    await page.goto("/");
    // Wait for client-rendered cards to load
    await page
      .locator(".need-card, :text('No needs posted yet')")
      .first()
      .waitFor({ timeout: 10000 });
    const needCards = page.locator(".need-card");
    const count = await needCards.count();
    if (count === 0) return false;

    const href = await needCards
      .first()
      .locator("a[href^='/needs/']")
      .first()
      .getAttribute("href");
    await page.goto(href!);
    return true;
  }

  test("pledge form has required email and description fields", async ({
    page,
  }) => {
    const found = await goToFirstNeedDetail(page);
    if (!found) {
      test.skip(true, "No needs in database — cannot test pledge form");
      return;
    }

    const form = page.locator("form").filter({ hasText: "Pledge Gear" });
    await expect(form).toBeVisible();

    // Email field — required
    const emailInput = form.locator('input[name="donorEmail"]');
    await expect(emailInput).toBeVisible();
    await expect(emailInput).toHaveAttribute("required", "");
    await expect(emailInput).toHaveAttribute("type", "email");

    // Description field — required
    const descriptionField = form.locator('textarea[name="description"]');
    await expect(descriptionField).toBeVisible();
    await expect(descriptionField).toHaveAttribute("required", "");
  });

  test("pledge form has optional name field", async ({ page }) => {
    const found = await goToFirstNeedDetail(page);
    if (!found) {
      test.skip(true, "No needs in database — cannot test pledge form");
      return;
    }

    const form = page.locator("form").filter({ hasText: "Pledge Gear" });
    await expect(form).toBeVisible();

    // Name field — optional (no required attribute)
    const nameInput = form.locator('input[name="donorName"]');
    await expect(nameInput).toBeVisible();
    // Should NOT have the required attribute
    await expect(nameInput).not.toHaveAttribute("required", "");
  });

  test("empty pledge form submission shows validation", async ({ page }) => {
    const found = await goToFirstNeedDetail(page);
    if (!found) {
      test.skip(true, "No needs in database — cannot test pledge form");
      return;
    }

    const form = page.locator("form").filter({ hasText: "Pledge Gear" });
    await expect(form).toBeVisible();

    // Click submit without filling anything
    const submitButton = form.locator('button[type="submit"]');
    await expect(submitButton).toBeVisible();
    await submitButton.click();

    // HTML5 validation should prevent submission — the required fields
    // will show native validation popups. We verify the form did NOT
    // submit successfully (no success message).
    const successMessage = page.getByText("Pledge submitted!");
    await expect(successMessage).not.toBeVisible();
  });

  test("pledge form has hidden needId field", async ({ page }) => {
    const found = await goToFirstNeedDetail(page);
    if (!found) {
      test.skip(true, "No needs in database — cannot test pledge form");
      return;
    }

    const form = page.locator("form").filter({ hasText: "Pledge Gear" });
    const needIdInput = form.locator('input[name="needId"]');
    // Hidden field should exist with a value
    await expect(needIdInput).toHaveAttribute("type", "hidden");
    const value = await needIdInput.getAttribute("value");
    expect(value).toBeTruthy();
    expect(value!.length).toBeGreaterThan(0);
  });

  test("pledge form submits to /api/pledges", async ({ page }) => {
    const found = await goToFirstNeedDetail(page);
    if (!found) {
      test.skip(true, "No needs in database — cannot test pledge form");
      return;
    }

    // The PledgeForm is a React component that uses fetch to POST to /api/pledges.
    // We intercept the network request to verify the target without actually
    // modifying the database.
    let interceptedUrl = "";
    await page.route("**/api/pledges", async (route) => {
      interceptedUrl = route.request().url();
      // Respond with a fake success to avoid modifying the DB
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ ok: true }),
      });
    });

    const form = page.locator("form").filter({ hasText: "Pledge Gear" });

    // Fill required fields
    const emailInput = form.locator('input[name="donorEmail"]');
    await emailInput.fill("test@example.com");
    const descriptionField = form.locator('textarea[name="description"]');
    await descriptionField.fill("Test pledge — do not process");

    // Submit
    const submitButton = form.locator('button[type="submit"]');
    await submitButton.click();

    // Verify the request was intercepted and went to /api/pledges
    await expect(page.getByText("Pledge submitted!")).toBeVisible();
    expect(interceptedUrl).toContain("/api/pledges");
  });
});

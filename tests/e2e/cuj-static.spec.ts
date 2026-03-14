import { test, expect } from "@playwright/test";

test.describe("Static Pages", () => {
  test("/about page renders with title and content", async ({ page }) => {
    const response = await page.goto("/about");
    expect(response?.status()).toBe(200);

    await expect(page.locator("h1").first()).toHaveText("About Runners In Need");

    // Has "How It Works" section
    await expect(
      page.locator("h2", { hasText: "How It Works" })
    ).toBeVisible();

    // Has substantive content
    await expect(
      page.getByText("Runners In Need bridges this gap", { exact: false })
    ).toBeVisible();
  });

  test("/why page renders with title and content", async ({ page }) => {
    const response = await page.goto("/why");
    expect(response?.status()).toBe(200);

    await expect(page.locator("h1").first()).toHaveText(
      "Why Runners In Need Exists"
    );

    // Has multiple sections
    await expect(
      page.locator("h2", { hasText: "The Problem" })
    ).toBeVisible();
    await expect(
      page.locator("h2", { hasText: "How Runners In Need Works" })
    ).toBeVisible();

    // Has statistics
    await expect(page.getByText("46%")).toBeVisible();
  });

  test("/contact page renders with contact info", async ({ page }) => {
    const response = await page.goto("/contact");
    expect(response?.status()).toBe(200);

    await expect(page.locator("h1").first()).toHaveText("Contact");

    // Has email contact info
    const emailLink = page.locator('a[href="mailto:hello@runnersinneed.org"]');
    await expect(emailLink).toBeVisible();

    // Has privacy email
    const privacyLink = page.locator(
      'a[href="mailto:privacy@runnersinneed.org"]'
    );
    await expect(privacyLink).toBeVisible();
  });

  test("/privacy page renders with substantial content", async ({ page }) => {
    const response = await page.goto("/privacy");
    expect(response?.status()).toBe(200);

    await expect(page.locator("h1").first()).toHaveText("Privacy Policy");

    // Has multiple sections — confirms this is real content, not a placeholder
    const sections = page.locator("h2");
    const sectionCount = await sections.count();
    expect(sectionCount).toBeGreaterThanOrEqual(5);

    // Specific sections exist
    await expect(
      page.locator("h2", { hasText: "What We Collect and Why" })
    ).toBeVisible();
    await expect(
      page.locator("h2", { hasText: "Your Rights" })
    ).toBeVisible();
    await expect(
      page.locator("h2", { hasText: "Cookies" })
    ).toBeVisible();

    // Has last updated date
    await expect(page.getByText("Last updated").first()).toBeVisible();
  });

  test("/terms page renders with substantial content", async ({ page }) => {
    const response = await page.goto("/terms");
    expect(response?.status()).toBe(200);

    await expect(page.locator("h1").first()).toHaveText("Terms of Service");

    // Has multiple sections
    const sections = page.locator("h2");
    const sectionCount = await sections.count();
    expect(sectionCount).toBeGreaterThanOrEqual(5);

    // Specific sections exist
    await expect(
      page.locator("h2", { hasText: "Acceptance of Terms" })
    ).toBeVisible();
    await expect(
      page.locator("h2", { hasText: "No Warranties" })
    ).toBeVisible();
    await expect(
      page.locator("h2", { hasText: "Limitation of Liability" })
    ).toBeVisible();

    // Has last updated date
    await expect(page.getByText("Last updated").first()).toBeVisible();
  });

  test("404 page renders for unknown routes", async ({ page }) => {
    const response = await page.goto("/this-page-does-not-exist-xyz");
    // Astro returns 404 status for unknown routes
    expect(response?.status()).toBe(404);

    await expect(page.getByText("404")).toBeVisible();
    await expect(page.getByText("Page not found")).toBeVisible();

    // Has a link back to home
    const homeLink = page.locator('a[href="/"]').first();
    await expect(homeLink).toBeVisible();
  });

  test("/api/health returns 200 with valid response", async ({ request }) => {
    const response = await request.get("/api/health");
    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body).toHaveProperty("status");
    expect(body).toHaveProperty("db");
    expect(body).toHaveProperty("timestamp");
    expect(["ok", "degraded"]).toContain(body.status);
    expect(["connected", "unreachable"]).toContain(body.db);

    // Timestamp should be a valid ISO string
    expect(new Date(body.timestamp).toISOString()).toBe(body.timestamp);
  });

  test("/drives page loads with correct title", async ({ page }) => {
    const response = await page.goto("/drives");
    expect(response?.status()).toBe(200);

    const title = await page.title();
    expect(title).toContain("Pledge Drives");
    expect(title).toContain("Runners In Need");
  });

  test("/become-organizer page renders with proper title", async ({ page }) => {
    const response = await page.goto("/become-organizer");
    expect(response?.status()).toBe(200);

    const title = await page.title();
    expect(title).toContain("Become an Organizer");
    expect(title).toContain("Runners In Need");

    await expect(page.locator("h1").first()).toBeVisible();
  });

  test("all static pages have proper page titles", async ({ page }) => {
    const pages = [
      { path: "/about", expected: "About" },
      { path: "/why", expected: "Why This Matters" },
      { path: "/contact", expected: "Contact" },
      { path: "/privacy", expected: "Privacy Policy" },
      { path: "/terms", expected: "Terms of Service" },
    ];

    for (const { path, expected } of pages) {
      await page.goto(path);
      const title = await page.title();
      expect(title).toContain(expected);
      expect(title).toContain("Runners In Need");
    }
  });
});

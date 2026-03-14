import { test, expect } from "@playwright/test";

test.describe("CUJ-1: Anonymous Browsing", () => {
  test("home page loads with proper structure", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("h1").first()).toHaveText("Runners In Need");
    await expect(page.locator("#search-input")).toBeVisible();
    await expect(page.locator("#category-filters")).toBeVisible();

    // Either need cards exist or empty state is shown
    const needCards = page.locator(".need-card");
    const emptyState = page.getByText("No needs posted yet");
    const hasCards = (await needCards.count()) > 0;
    const hasEmpty = await emptyState.isVisible().catch(() => false);
    expect(hasCards || hasEmpty).toBe(true);
  });

  test("category filter pills exist with expected labels", async ({
    page,
  }) => {
    await page.goto("/");
    const filterContainer = page.locator("#category-filters");
    await expect(filterContainer).toBeVisible();

    const buttons = filterContainer.locator(".category-btn");
    const labels = await buttons.allTextContents();
    const trimmed = labels.map((l) => l.trim());

    // Labels may include emojis (e.g. "👟 Shoes"), so use partial matching
    const joined = trimmed.join("|");
    expect(joined).toContain("All");
    expect(joined).toContain("Shoes");
    expect(joined).toContain("Apparel");
    expect(joined).toContain("Accessories");
    expect(joined).toContain("Other");
  });

  test("search input is functional", async ({ page }) => {
    await page.goto("/");
    const searchInput = page.locator("#search-input");
    await expect(searchInput).toBeVisible();
    await expect(searchInput).toHaveAttribute(
      "placeholder",
      /Search needs, items, locations/
    );

    // Type a nonsensical query — all cards should be hidden (or already empty)
    await searchInput.fill("zzzzxyznonexistent12345");

    const needCards = page.locator(".need-card");
    const cardCount = await needCards.count();
    if (cardCount > 0) {
      // All cards should be hidden via display:none after filtering
      for (let i = 0; i < cardCount; i++) {
        await expect(needCards.nth(i)).toBeHidden();
      }
    }
    // If no cards exist at all, the test passes (empty DB)
  });

  test("need cards contain expected elements", async ({ page }) => {
    await page.goto("/");
    const needCards = page.locator(".need-card");
    const count = await needCards.count();

    if (count === 0) {
      // Empty state — verify it renders correctly instead
      await expect(page.getByText("No needs posted yet")).toBeVisible();
      return;
    }

    const firstCard = needCards.first();

    // Title link
    const titleLink = firstCard.locator("a[href^='/needs/']").first();
    await expect(titleLink).toBeVisible();
    const title = await titleLink.textContent();
    expect(title?.trim().length).toBeGreaterThan(0);

    // Org name and location line
    const orgLocationLine = firstCard.locator('[data-testid="need-card-org-location"]');
    await expect(orgLocationLine).toBeVisible();

    // Category badge
    const badge = firstCard.locator('[data-testid="need-card-category"]');
    await expect(badge).toBeVisible();

    // MATCH NEED button
    await expect(
      firstCard.locator("a", { hasText: "MATCH NEED" })
    ).toBeVisible();
  });

  test("clicking a need card navigates to detail page", async ({ page }) => {
    await page.goto("/");
    const needCards = page.locator(".need-card");
    const count = await needCards.count();

    if (count === 0) {
      test.skip(true, "No needs in database — cannot test navigation");
      return;
    }

    // Get the href from the first card's title link
    const firstLink = needCards.first().locator("a[href^='/needs/']").first();
    const href = await firstLink.getAttribute("href");
    expect(href).toBeTruthy();

    await firstLink.click();
    await page.waitForURL(/\/needs\/.+/);
    expect(page.url()).toContain("/needs/");
  });

  test("need detail page shows expected content", async ({ page }) => {
    await page.goto("/");
    const needCards = page.locator(".need-card");
    const count = await needCards.count();

    if (count === 0) {
      test.skip(true, "No needs in database — cannot test detail page");
      return;
    }

    // Navigate to first need's detail page
    const firstLink = needCards.first().locator("a[href^='/needs/']").first();
    const href = await firstLink.getAttribute("href");
    await page.goto(href!);

    // Title (h1)
    const h1 = page.locator("h1").first();
    await expect(h1).toBeVisible();
    const titleText = await h1.textContent();
    expect(titleText?.trim().length).toBeGreaterThan(0);

    // Org name — in the metadata line
    const orgName = page.locator('[data-testid="need-org-name"]');
    await expect(orgName).toBeVisible();

    // Location — adjacent to org name in the metadata row
    const metaRow = page.locator('[data-testid="need-meta-row"]');
    await expect(metaRow).toBeVisible();

    // Category badge (in the need card header area, visible)
    const categoryBadge = page.locator('[data-testid="need-category-badge"]');
    await expect(categoryBadge).toBeVisible();

    // Expiry info — in the metadata bar (e.g. "Expires March 15, 2026" or "X days left")
    const metadataBar = page.locator('[data-testid="need-metadata-bar"]');
    await expect(metadataBar).toBeVisible();
    const metaText = await metadataBar.textContent();
    expect(metaText).toMatch(/Expires|days left|Expired/);

    // Pledges section
    await expect(
      page.locator("h2", { hasText: /Pledges/ })
    ).toBeVisible();

    // Make a Pledge section
    await expect(
      page.locator("h2", { hasText: "Make a Pledge" })
    ).toBeVisible();

    // Pledge form
    const pledgeForm = page.locator("form").filter({ hasText: "Pledge Gear" });
    await expect(pledgeForm).toBeVisible();
  });

  test("map toggle buttons exist when map data is available", async ({
    page,
  }) => {
    await page.goto("/");

    // Desktop toggle — only present if there are needs with coordinates
    const desktopToggle = page.locator("#desktop-tab-list");
    const mobileToggle = page.locator("#tab-listings");

    // These only exist if mapNeeds.length > 0, so we just check if they
    // exist or not — both is valid
    const hasDesktopToggle = (await desktopToggle.count()) > 0;
    const hasMobileToggle = (await mobileToggle.count()) > 0;

    // If one exists, the other should too
    if (hasDesktopToggle) {
      expect(await page.locator("#desktop-tab-map").count()).toBe(1);
    }
    if (hasMobileToggle) {
      expect(await page.locator("#tab-map").count()).toBe(1);
    }
  });

  test("empty state renders when no results match filter", async ({
    page,
  }) => {
    await page.goto("/");
    const needCards = page.locator(".need-card");
    const count = await needCards.count();

    if (count === 0) {
      // Already in empty state
      await expect(page.getByText("No needs posted yet")).toBeVisible();
      return;
    }

    // Type nonsense into search to filter out all cards
    const searchInput = page.locator("#search-input");
    await searchInput.fill("zzzzxyznonexistent12345");

    // All need cards should now be hidden
    for (let i = 0; i < count; i++) {
      await expect(needCards.nth(i)).toBeHidden();
    }
  });

  test("/browse redirects to /", async ({ page }) => {
    const response = await page.goto("/browse");
    // After redirect, should be on the home page
    expect(page.url()).not.toContain("/browse");
    await expect(page.locator("h1").first()).toHaveText("Runners In Need");
  });
});

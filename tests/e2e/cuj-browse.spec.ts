import { test, expect, type Page } from "@playwright/test";

/** Wait for client-rendered need cards or empty state to appear */
async function waitForNeedsGrid(page: Page) {
  // NeedsGrid renders: skeleton → cards/empty/error
  // Wait for either cards or the empty/error state text
  await page
    .locator(".need-card, :text('No needs posted yet'), :text('Something went wrong')")
    .first()
    .waitFor({ timeout: 10000 });
}

test.describe("CUJ-1: Anonymous Browsing", () => {
  test("home page loads with proper structure", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("h1").first()).toHaveText("Give your extra running gear a second life.");
    await expect(page.locator("#search-input")).toBeVisible();
    await expect(page.locator("#category-filters")).toBeVisible();

    // Wait for client-rendered cards to load
    await waitForNeedsGrid(page);

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
    await waitForNeedsGrid(page);
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
    await waitForNeedsGrid(page);
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

    // View Need button
    await expect(
      firstCard.locator("a", { hasText: "View Need" })
    ).toBeVisible();
  });

  test("clicking a need card navigates to detail page", async ({ page }) => {
    await page.goto("/");
    await waitForNeedsGrid(page);
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
    await waitForNeedsGrid(page);
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
    await page.waitForLoadState("domcontentloaded");

    // Title (h1)
    const h1 = page.locator("h1").first();
    await expect(h1).toBeVisible({ timeout: 15000 });
    await expect(h1).not.toBeEmpty();

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
    await waitForNeedsGrid(page);

    // Desktop and mobile toggles are always present now (map self-fetches)
    await expect(page.locator("#desktop-tab-list")).toBeAttached();
    await expect(page.locator("#desktop-tab-map")).toBeAttached();
    await expect(page.locator("#tab-listings")).toBeAttached();
    await expect(page.locator("#tab-map")).toBeAttached();
  });

  test("empty state renders when no results match filter", async ({
    page,
  }) => {
    await page.goto("/");
    await waitForNeedsGrid(page);
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

  test('"Near me" location button exists and is functional without geolocation', async ({
    page,
    context,
  }) => {
    // Deny geolocation so the test doesn't depend on it being available
    await context.clearPermissions();

    await page.goto("/");
    await waitForNeedsGrid(page);
    const locationBtn = page.locator("#location-btn");
    await expect(locationBtn).toBeVisible();
    await expect(locationBtn).toHaveAttribute(
      "aria-label",
      "Sort by distance to your location"
    );

    // The text label is hidden on small screens but present in DOM
    const btnText = page.locator("#location-btn-text");
    expect(await btnText.count()).toBe(1);
    await expect(btnText).toHaveText("Near me");

    // Button should be enabled and clickable even without geolocation permission
    await expect(locationBtn).toBeEnabled();
  });

  test("/browse returns 404 (merged into homepage)", async ({ page }) => {
    const response = await page.goto("/browse");
    expect(response?.status()).toBe(404);
  });

  test("clicking a category filter pill changes active state", async ({
    page,
  }) => {
    await page.goto("/");
    await waitForNeedsGrid(page);
    const filterContainer = page.locator("#category-filters");
    await expect(filterContainer).toBeVisible();

    const buttons = filterContainer.locator(".category-btn");
    const count = await buttons.count();
    if (count < 2) {
      test.skip(true, "Not enough category buttons to test toggling");
      return;
    }

    // "All" button should be active by default (has the active/selected class)
    const allBtn = buttons.first();
    const allClasses = await allBtn.getAttribute("class");
    expect(allClasses).toContain("bg-[#2D4A2D]");

    // Click the second category button (e.g. "Shoes")
    const secondBtn = buttons.nth(1);
    await secondBtn.click();

    // The clicked button should now be active
    const secondClasses = await secondBtn.getAttribute("class");
    expect(secondClasses).toContain("bg-[#2D4A2D]");

    // The "All" button should no longer be active
    const allClassesAfter = await allBtn.getAttribute("class");
    expect(allClassesAfter).not.toContain("bg-[#2D4A2D]");
  });

  test("search clear button resets search and shows all cards", async ({
    page,
  }) => {
    await page.goto("/");
    await waitForNeedsGrid(page);
    const needCards = page.locator(".need-card");
    const initialCount = await needCards.count();

    if (initialCount === 0) {
      test.skip(true, "No needs in database — cannot test search clear");
      return;
    }

    const searchInput = page.locator("#search-input");
    const clearBtn = page.locator('[data-testid="search-clear"]');

    // Type a query to filter out all cards
    await searchInput.fill("zzzzxyznonexistent12345");
    await page.waitForTimeout(300);

    // Clear button should now be visible
    await expect(clearBtn).toBeVisible();

    // Click clear
    await clearBtn.click();

    // Input should be empty
    await expect(searchInput).toHaveValue("");

    // Clear button should be hidden again
    await expect(clearBtn).toBeHidden();

    // All cards should be visible again
    await page.waitForTimeout(300);
    let visibleCount = 0;
    for (let i = 0; i < initialCount; i++) {
      if (await needCards.nth(i).isVisible()) visibleCount++;
    }
    expect(visibleCount).toBe(initialCount);
  });

  test("search input filters displayed cards", async ({ page }) => {
    await page.goto("/");
    await waitForNeedsGrid(page);
    const needCards = page.locator(".need-card");
    const initialCount = await needCards.count();

    if (initialCount === 0) {
      test.skip(true, "No needs in database — cannot test search filtering");
      return;
    }

    // Type a nonsense query — all visible cards should be hidden
    const searchInput = page.locator("#search-input");
    await searchInput.fill("zzzzxyznonexistent12345");

    // Wait briefly for client-side filtering
    await page.waitForTimeout(300);

    // Count visible cards after filtering
    let visibleCount = 0;
    for (let i = 0; i < initialCount; i++) {
      if (await needCards.nth(i).isVisible()) visibleCount++;
    }
    expect(visibleCount).toBe(0);

    // Clear search — cards should reappear
    await searchInput.fill("");
    await page.waitForTimeout(300);

    let restoredCount = 0;
    for (let i = 0; i < initialCount; i++) {
      if (await needCards.nth(i).isVisible()) restoredCount++;
    }
    expect(restoredCount).toBe(initialCount);
  });
});

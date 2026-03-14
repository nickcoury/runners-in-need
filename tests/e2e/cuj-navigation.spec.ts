import { test, expect } from "@playwright/test";

test.describe("Navigation & Layout", () => {
  test("header includes site name linking to home", async ({ page }) => {
    await page.goto("/");

    const header = page.locator("header").first();
    await expect(header).toBeVisible();

    // Site name/logo links to home
    const siteName = header.locator('a[href="/"]');
    await expect(siteName).toBeVisible();
    await expect(siteName).toHaveText("Runners In Need");
  });

  test("desktop navigation links exist with correct routes", async ({
    page,
  }) => {
    await page.goto("/");

    const nav = page.locator("header").first().locator("nav");

    // Post a Need
    const postLink = nav.locator('a[href="/post"]');
    await expect(postLink).toHaveCount(1);
    await expect(postLink).toHaveText("Post a Need");

    // Why
    const whyLink = nav.locator('a[href="/why"]');
    await expect(whyLink).toHaveCount(1);
    await expect(whyLink).toHaveText("Why");

    // About
    const aboutLink = nav.locator('a[href="/about"]');
    await expect(aboutLink).toHaveCount(1);
    await expect(aboutLink).toHaveText("About");
  });

  test("sign-in link exists when not authenticated", async ({ page }) => {
    await page.goto("/");

    // Desktop sign-in link
    const signInLink = page.locator("#auth-link");
    // Should exist in the DOM (may be hidden/shown by JS based on session)
    expect(await signInLink.count()).toBe(1);
    await expect(signInLink).toHaveAttribute("href", "/auth/signin");
    await expect(signInLink).toHaveText("Sign In");
  });

  test("user menu area exists in header", async ({ page }) => {
    await page.goto("/");

    // User menu container exists (hidden by default for non-authenticated users)
    const userMenu = page.locator("#user-menu");
    expect(await userMenu.count()).toBe(1);

    // Mobile user section exists too
    const mobileUserSection = page.locator("#mobile-user-section");
    expect(await mobileUserSection.count()).toBe(1);
  });

  test("footer exists with correct links", async ({ page }) => {
    await page.goto("/");

    const footer = page.locator("footer");
    await expect(footer).toBeVisible();

    // Footer tagline
    await expect(
      footer.getByText("Connecting gear with those who need it most", {
        exact: false,
      })
    ).toBeVisible();

    // Footer links
    const aboutLink = footer.locator('a[href="/about"]');
    await expect(aboutLink).toBeVisible();
    await expect(aboutLink).toHaveText("About");

    const termsLink = footer.locator('a[href="/terms"]');
    await expect(termsLink).toBeVisible();
    await expect(termsLink).toHaveText("Terms");

    const privacyLink = footer.locator('a[href="/privacy"]');
    await expect(privacyLink).toBeVisible();
    await expect(privacyLink).toHaveText("Privacy");

    const contactLink = footer.locator('a[href="/contact"]');
    await expect(contactLink).toBeVisible();
    await expect(contactLink).toHaveText("Contact");
  });

  test("mobile menu button exists and toggles menu", async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/");

    const menuBtn = page.locator("#mobile-menu-btn");
    await expect(menuBtn).toBeVisible();
    await expect(menuBtn).toHaveAttribute("aria-expanded", "false");

    // Menu should be hidden initially
    const mobileMenu = page.locator("#mobile-menu");
    await expect(mobileMenu).toBeHidden();

    // Click to open
    await menuBtn.click();
    await expect(mobileMenu).toBeVisible();
    await expect(menuBtn).toHaveAttribute("aria-expanded", "true");

    // Verify mobile menu has nav links
    await expect(mobileMenu.locator('a[href="/post"]')).toBeVisible();
    await expect(mobileMenu.locator('a[href="/why"]')).toBeVisible();
    await expect(mobileMenu.locator('a[href="/about"]')).toBeVisible();

    // Click to close
    await menuBtn.click();
    await expect(mobileMenu).toBeHidden();
  });

  test("mobile sign-in link exists", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/");

    // Open mobile menu
    await page.locator("#mobile-menu-btn").click();

    const mobileSignIn = page.locator("#auth-link-mobile");
    await expect(mobileSignIn).toBeVisible();
    await expect(mobileSignIn).toHaveAttribute("href", "/auth/signin");
    await expect(mobileSignIn).toHaveText("Sign In");
  });

  test("/drives link exists in navigation", async ({ page }) => {
    await page.goto("/");

    const nav = page.locator("header").first().locator("nav");
    const drivesLink = nav.locator('a[href="/drives"]');
    await expect(drivesLink).toHaveCount(1);
    await expect(drivesLink).toHaveText("Pledge Drives");
  });

  test("skip-to-content link exists and is visually hidden", async ({
    page,
  }) => {
    await page.goto("/");

    const skipLink = page.locator('a[href="#main-content"]');
    await expect(skipLink).toHaveCount(1);

    // The skip link should be in the DOM but visually hidden (sr-only)
    const box = await skipLink.boundingBox();
    // sr-only elements have 1x1 dimensions or are positioned off-screen
    const isVisuallyHidden =
      box === null ||
      (box.width <= 1 && box.height <= 1) ||
      box.x < 0 ||
      box.y < 0;
    expect(isVisuallyHidden).toBe(true);
  });

  test("header is sticky", async ({ page }) => {
    await page.goto("/");

    const header = page.locator("header").first();
    // Header should have sticky positioning
    const position = await header.evaluate(
      (el) => getComputedStyle(el).position
    );
    expect(position).toBe("sticky");
  });

  test("navigation links actually navigate to correct pages", async ({
    page,
  }) => {
    await page.goto("/");

    // Click About link in footer (always visible regardless of viewport)
    await page.locator("footer a[href='/about']").click();
    await page.waitForURL("**/about");
    await expect(page.locator("h1").first()).toHaveText("About Runners In Need");

    // Click Terms link
    await page.locator("footer a[href='/terms']").click();
    await page.waitForURL("**/terms");
    await expect(page.locator("h1").first()).toHaveText("Terms of Service");

    // Click Privacy link
    await page.locator("footer a[href='/privacy']").click();
    await page.waitForURL("**/privacy");
    await expect(page.locator("h1").first()).toHaveText("Privacy Policy");

    // Click Contact link
    await page.locator("footer a[href='/contact']").click();
    await page.waitForURL("**/contact");
    await expect(page.locator("h1").first()).toHaveText("Contact");

    // Click site name to go home
    await page.locator("header").first().locator("a[href='/']").click();
    await page.waitForURL(/\/$/);
    await expect(page.locator("h1").first()).toHaveText("Runners In Need");
  });

  test("footer is visible on all main pages", async ({ page }) => {
    const pages = ["/", "/about", "/why", "/contact", "/privacy", "/terms"];

    for (const path of pages) {
      await page.goto(path);
      const footer = page.locator("footer").first();
      await expect(footer).toBeVisible();
    }
  });
});

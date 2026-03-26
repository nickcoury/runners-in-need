import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ args: ['--dns-prefetch-disable'] });
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await ctx.newPage();

  await page.goto('https://runnersinneed.com', { timeout: 30000, waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(5000);

  // Screenshot 1: Desktop homepage with cards loaded
  await page.screenshot({ path: './j23-desktop-cards.png', fullPage: false });

  // Check card count
  const cardCount = await page.locator('.need-card').count();
  console.log(`Need cards loaded: ${cardCount}`);

  // Check skeleton visibility
  const skeletonCount = await page.locator('[aria-busy="true"]').count();
  console.log(`Skeleton loaders: ${skeletonCount}`);

  if (cardCount > 0) {
    // Screenshot 2: Hover state on first card
    const firstCard = page.locator('.need-card').first();
    await firstCard.hover();
    await page.waitForTimeout(500);
    await page.screenshot({ path: './j23-card-hover.png', fullPage: false });

    // Get card details
    const title = await firstCard.locator('a.font-semibold').textContent();
    const orgLocation = await firstCard.locator('[data-testid="need-card-org-location"]').textContent();
    console.log(`First card title: ${title}`);
    console.log(`First card org/location: ${orgLocation}`);
  }

  // Search interaction
  const searchInput = page.locator('#search-input');
  await searchInput.fill('xyznonexistent12345');
  await page.waitForTimeout(1500);
  await page.screenshot({ path: './j23-search-noresults.png', fullPage: false });

  const noResults = page.locator('#no-results');
  if (await noResults.count() > 0) {
    const isHidden = await noResults.evaluate(el => el.classList.contains('hidden'));
    console.log(`No-results div hidden: ${isHidden}`);
  }

  // Count visible cards after search
  const visibleCards = await page.locator('.need-card:not([style*="display: none"])').count();
  console.log(`Visible cards after nonsense search: ${visibleCards}`);

  // Check sidebar
  const sidebar = page.locator('aside');
  const sidebarVisible = await sidebar.isVisible();
  console.log(`Sidebar visible at 1280px: ${sidebarVisible}`);

  // Check "how it works" sidebar content
  if (sidebarVisible) {
    const sidebarText = await sidebar.textContent();
    console.log(`Sidebar text starts with: ${sidebarText?.substring(0, 50)}`);
  }

  // Full page screenshot
  await page.screenshot({ path: './j23-full-page.png', fullPage: true });

  await browser.close();
  console.log('Done');
})();

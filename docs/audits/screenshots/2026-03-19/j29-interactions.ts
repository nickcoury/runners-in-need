import { chromium } from 'playwright';

const BASE = 'https://runners-in-need-dev.nickcoury.workers.dev';
const DIR = new URL(".", import.meta.url).pathname.replace(/\/$/, "");

(async () => {
  const browser = await chromium.launch({ args: ['--dns-prefetch-disable'] });
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();

  // 1. Homepage loaded — capture initial state
  await page.goto(BASE, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(5000);

  // 2. Type in search box and capture filtered results
  const searchInput = page.locator('input[type="search"], input[placeholder*="Search"], input[placeholder*="search"]');
  if (await searchInput.isVisible()) {
    await searchInput.fill('shoes');
    await page.waitForTimeout(1500);
    await page.screenshot({ path: `${DIR}/j29-search-shoes.png`, fullPage: true });

    // Clear search
    await searchInput.fill('');
    await page.waitForTimeout(1000);
  }

  // 3. Click a category filter
  const categoryBtn = page.locator('button[aria-pressed]').first();
  if (await categoryBtn.isVisible()) {
    await categoryBtn.click();
    await page.waitForTimeout(1500);
    await page.screenshot({ path: `${DIR}/j29-category-filter.png`, fullPage: true });

    // Click again to deselect
    await categoryBtn.click();
    await page.waitForTimeout(1000);
  }

  // 4. Search with no results
  if (await searchInput.isVisible()) {
    await searchInput.fill('xyznonexistent123');
    await page.waitForTimeout(1500);
    await page.screenshot({ path: `${DIR}/j29-no-results.png`, fullPage: true });
    await searchInput.fill('');
    await page.waitForTimeout(1000);
  }

  // 5. Scroll down to see back-to-top button
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(1000);
  await page.screenshot({ path: `${DIR}/j29-back-to-top.png` });

  // 6. Check the /why page scroll behavior
  await page.goto(`${BASE}/why`, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(3000);
  await page.screenshot({ path: `${DIR}/j29-why-full.png`, fullPage: true });

  // 7. Check /about page
  await page.goto(`${BASE}/about`, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(3000);
  await page.screenshot({ path: `${DIR}/j29-about.png`, fullPage: true });

  // 8. Check 404 page
  await page.goto(`${BASE}/this-page-does-not-exist`, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(3000);
  await page.screenshot({ path: `${DIR}/j29-404.png` });

  // 9. Check post page (unauthenticated)
  await page.goto(`${BASE}/post`, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(3000);
  await page.screenshot({ path: `${DIR}/j29-post-unauth.png` });

  // 10. Mobile — hamburger menu interaction
  const mobile = await browser.newContext({
    viewport: { width: 375, height: 667 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
  });
  const mpage = await mobile.newPage();
  await mpage.goto(BASE, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await mpage.waitForTimeout(4000);

  // Click hamburger
  const hamburger = mpage.locator('button[aria-label*="menu"], button[aria-expanded]').first();
  if (await hamburger.isVisible()) {
    await hamburger.click();
    await mpage.waitForTimeout(500);
    await mpage.screenshot({ path: `${DIR}/j29-mobile-menu-open.png` });

    // Close menu
    await hamburger.click();
    await mpage.waitForTimeout(500);
  }

  // 11. Mobile search interaction
  const mSearchInput = mpage.locator('input[type="search"], input[placeholder*="Search"], input[placeholder*="search"]');
  if (await mSearchInput.isVisible()) {
    await mSearchInput.fill('trail');
    await mpage.waitForTimeout(1500);
    await mpage.screenshot({ path: `${DIR}/j29-mobile-search.png`, fullPage: true });
  }

  await browser.close();
  console.log('Interaction screenshots complete');
})();

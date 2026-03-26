import { chromium } from 'playwright';

const BASE = 'https://runners-in-need-dev.nickcoury.workers.dev';
const DIR = new URL(".", import.meta.url).pathname.replace(/\/$/, "");

(async () => {
  const browser = await chromium.launch({ args: ['--dns-prefetch-disable'] });
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();

  // 1. Visit a non-existent need ID
  await page.goto(`${BASE}/needs/nonexistent-id-12345`, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(3000);
  await page.screenshot({ path: `${DIR}/j30-need-404.png` });

  // 2. Visit a non-existent org ID
  await page.goto(`${BASE}/org/nonexistent-org-12345`, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(3000);
  await page.screenshot({ path: `${DIR}/j30-org-404.png` });

  // 3. Test the /500 page
  await page.goto(`${BASE}/500`, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(3000);
  await page.screenshot({ path: `${DIR}/j30-500.png` });

  // 4. Test special characters in search
  await page.goto(BASE, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(5000);
  const searchInput = page.locator('input[type="search"], input[placeholder*="Search"], input[placeholder*="search"]');
  if (await searchInput.isVisible()) {
    // XSS attempt in search
    await searchInput.fill('<script>alert("xss")</script>');
    await page.waitForTimeout(1500);
    await page.screenshot({ path: `${DIR}/j30-search-xss.png`, fullPage: true });

    // Very long search string
    await searchInput.fill('a'.repeat(500));
    await page.waitForTimeout(1500);
    await page.screenshot({ path: `${DIR}/j30-search-long.png`, fullPage: true });

    // Emoji in search
    await searchInput.fill('shoes 👟🏃');
    await page.waitForTimeout(1500);
    await page.screenshot({ path: `${DIR}/j30-search-emoji.png`, fullPage: true });
  }

  // 5. Test URL hash manipulation
  await page.goto(`${BASE}/#cat=shoes&q=test&view=map`, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(5000);
  await page.screenshot({ path: `${DIR}/j30-hash-state.png`, fullPage: true });

  // 6. Test the become-organizer page (unauthenticated)
  await page.goto(`${BASE}/become-organizer`, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(3000);
  await page.screenshot({ path: `${DIR}/j30-become-organizer-unauth.png` });

  // 7. Test dashboard (unauthenticated)
  await page.goto(`${BASE}/dashboard`, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(3000);
  await page.screenshot({ path: `${DIR}/j30-dashboard-unauth.png` });

  // 8. Test print-friendliness — check if print styles are loaded
  await page.goto(BASE, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(5000);
  await page.emulateMedia({ media: 'print' });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: `${DIR}/j30-print-view.png`, fullPage: true });

  await browser.close();
  console.log('Edge case screenshots complete');
})();

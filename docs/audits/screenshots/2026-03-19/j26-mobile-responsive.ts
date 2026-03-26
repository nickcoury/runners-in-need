import { chromium } from 'playwright';

const BASE = 'https://runners-in-need-dev.nickcoury.workers.dev';
const DIR = new URL(".", import.meta.url).pathname.replace(/\/$/, "");

(async () => {
  const browser = await chromium.launch({ args: ['--dns-prefetch-disable'] });

  // iPhone SE viewport (375x667)
  const mobile = await browser.newContext({
    viewport: { width: 375, height: 667 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15'
  });

  const page = await mobile.newPage();

  // 1. Homepage mobile
  await page.goto(BASE, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(4000);
  await page.screenshot({ path: `${DIR}/j26-home-mobile.png`, fullPage: true });

  // 2. Click hamburger menu
  const hamburger = page.locator('button[aria-label="Toggle menu"]');
  if (await hamburger.isVisible()) {
    await hamburger.click();
    await page.waitForTimeout(500);
    await page.screenshot({ path: `${DIR}/j26-hamburger-open.png` });
    // Close it
    await hamburger.click();
    await page.waitForTimeout(300);
  }

  // 3. Why page mobile
  await page.goto(`${BASE}/why`, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(3000);
  await page.screenshot({ path: `${DIR}/j26-why-mobile.png`, fullPage: true });

  // 4. Drives page mobile
  await page.goto(`${BASE}/drives`, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(3000);
  await page.screenshot({ path: `${DIR}/j26-drives-mobile.png`, fullPage: true });

  // 5. Sign-in page mobile
  await page.goto(`${BASE}/auth/signin`, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(3000);
  await page.screenshot({ path: `${DIR}/j26-signin-mobile.png`, fullPage: true });

  // 6. About page mobile
  await page.goto(`${BASE}/about`, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(3000);
  await page.screenshot({ path: `${DIR}/j26-about-mobile.png`, fullPage: true });

  // 7. Need detail page mobile (pick first need)
  await page.goto(BASE, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(4000);
  const firstCard = page.locator('a[href^="/needs/"]').first();
  if (await firstCard.isVisible()) {
    const href = await firstCard.getAttribute('href');
    if (href) {
      await page.goto(`${BASE}${href}`, { waitUntil: 'domcontentloaded', timeout: 30000 });
      await page.waitForTimeout(3000);
      await page.screenshot({ path: `${DIR}/j26-need-detail-mobile.png`, fullPage: true });
    }
  }

  // 8. Become Organizer mobile
  await page.goto(`${BASE}/become-organizer`, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(3000);
  await page.screenshot({ path: `${DIR}/j26-become-org-mobile.png`, fullPage: true });

  // 9. 404 page mobile
  await page.goto(`${BASE}/nonexistent-page-xyz`, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(3000);
  await page.screenshot({ path: `${DIR}/j26-404-mobile.png`, fullPage: true });

  // 10. Post a Need page mobile (will show auth gate)
  await page.goto(`${BASE}/post`, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(3000);
  await page.screenshot({ path: `${DIR}/j26-post-mobile.png`, fullPage: true });

  await browser.close();
  console.log('Mobile responsive screenshots complete');
})();

import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ args: ['--dns-prefetch-disable'] });
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await ctx.newPage();

  // Why page
  await page.goto('https://runnersinneed.com/why', { timeout: 30000, waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: './j25-why-desktop.png', fullPage: true });

  // Drives page
  await page.goto('https://runnersinneed.com/drives', { timeout: 30000, waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: './j25-drives.png', fullPage: true });

  // Sign-in page
  await page.goto('https://runnersinneed.com/auth/signin', { timeout: 30000, waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: './j25-signin.png', fullPage: false });

  // Become organizer (unauthenticated)
  await page.goto('https://runnersinneed.com/become-organizer', { timeout: 30000, waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: './j25-become-organizer.png', fullPage: false });

  // About page
  await page.goto('https://runnersinneed.com/about', { timeout: 30000, waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: './j25-about.png', fullPage: true });

  // Org profile (get first org from a need)
  const apiPage = await (await browser.newContext()).newPage();
  await apiPage.goto('https://runnersinneed.com/api/needs', { timeout: 30000, waitUntil: 'domcontentloaded' });
  await apiPage.waitForTimeout(2000);

  await browser.close();
  console.log('Done');
})();

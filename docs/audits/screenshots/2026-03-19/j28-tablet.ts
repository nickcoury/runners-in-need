import { chromium } from 'playwright';

const BASE = 'https://runners-in-need-dev.nickcoury.workers.dev';
const DIR = new URL(".", import.meta.url).pathname.replace(/\/$/, "");

(async () => {
  const browser = await chromium.launch({ args: ['--dns-prefetch-disable'] });

  // iPad viewport (768x1024)
  const tablet = await browser.newContext({
    viewport: { width: 768, height: 1024 },
    deviceScaleFactor: 2,
  });
  const page = await tablet.newPage();

  // 1. Homepage tablet
  await page.goto(BASE, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(4000);
  await page.screenshot({ path: `${DIR}/j28-home-tablet.png`, fullPage: true });

  // 2. Need detail tablet
  const firstCard = page.locator('a[href^="/needs/"]').first();
  if (await firstCard.isVisible()) {
    const href = await firstCard.getAttribute('href');
    if (href) {
      await page.goto(`${BASE}${href}`, { waitUntil: 'domcontentloaded', timeout: 30000 });
      await page.waitForTimeout(3000);
      await page.screenshot({ path: `${DIR}/j28-need-detail-tablet.png`, fullPage: true });
    }
  }

  // 3. Why page tablet
  await page.goto(`${BASE}/why`, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(3000);
  await page.screenshot({ path: `${DIR}/j28-why-tablet.png`, fullPage: true });

  // 4. Drives page tablet
  await page.goto(`${BASE}/drives`, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(3000);
  await page.screenshot({ path: `${DIR}/j28-drives-tablet.png`, fullPage: true });

  await browser.close();
  console.log('Tablet screenshots complete');
})();

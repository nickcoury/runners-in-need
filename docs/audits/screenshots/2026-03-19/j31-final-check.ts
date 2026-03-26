import { chromium } from 'playwright';

const BASE = 'https://runners-in-need-dev.nickcoury.workers.dev';
const DIR = new URL(".", import.meta.url).pathname.replace(/\/$/, "");

(async () => {
  const browser = await chromium.launch({ args: ['--dns-prefetch-disable'] });
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();

  // 1. Drives page
  await page.goto(`${BASE}/drives`, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(3000);
  await page.screenshot({ path: `${DIR}/j31-drives.png`, fullPage: true });

  // 2. Why page
  await page.goto(`${BASE}/why`, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(3000);
  await page.screenshot({ path: `${DIR}/j31-why.png`, fullPage: true });

  // 3. Need detail page — click into the first need
  await page.goto(BASE, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(5000);
  const viewNeedBtn = page.locator('a:has-text("View Need")').first();
  if (await viewNeedBtn.isVisible()) {
    await viewNeedBtn.click();
    await page.waitForTimeout(4000);
    await page.screenshot({ path: `${DIR}/j31-need-detail.png`, fullPage: true });

    // Scroll to pledge form
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(1000);
    await page.screenshot({ path: `${DIR}/j31-need-pledge-form.png` });

    // Go back
    await page.goBack();
    await page.waitForTimeout(3000);
  }

  // 4. Test tab navigation — press Tab several times on homepage
  await page.goto(BASE, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(5000);
  // Tab to skip-to-content, then to nav items
  await page.keyboard.press('Tab');
  await page.screenshot({ path: `${DIR}/j31-skip-link.png` });
  for (let i = 0; i < 5; i++) {
    await page.keyboard.press('Tab');
  }
  await page.screenshot({ path: `${DIR}/j31-tab-nav.png` });

  // 5. Check Escape key clears search
  const searchInput = page.locator('input[type="search"], input[placeholder*="Search"], input[placeholder*="search"]');
  if (await searchInput.isVisible()) {
    await searchInput.fill('shoes');
    await page.waitForTimeout(500);
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);
    const val = await searchInput.inputValue();
    console.log(`After Escape, search value: "${val}" (should be empty)`);
  }

  // 6. Check the /signin page directly
  await page.goto(`${BASE}/auth/signin`, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(3000);
  await page.screenshot({ path: `${DIR}/j31-signin.png` });

  // 7. Cross-viewport consistency — same page at different widths
  const widths = [320, 480, 768, 1024, 1440];
  for (const w of widths) {
    await page.setViewportSize({ width: w, height: 800 });
    await page.goto(BASE, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(3000);
    await page.screenshot({ path: `${DIR}/j31-viewport-${w}.png` });
  }

  await browser.close();
  console.log('Final check screenshots complete');
})();

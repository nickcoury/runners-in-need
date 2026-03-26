import { chromium } from 'playwright';

const BASE = 'https://runners-in-need-dev.nickcoury.workers.dev';
const DIR = new URL(".", import.meta.url).pathname.replace(/\/$/, "");

(async () => {
  const browser = await chromium.launch({ args: ['--dns-prefetch-disable'] });
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();

  // 1. Terms page
  await page.goto(`${BASE}/terms`, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(3000);
  await page.screenshot({ path: `${DIR}/j27-terms.png`, fullPage: true });

  // 2. Privacy page
  await page.goto(`${BASE}/privacy`, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(3000);
  await page.screenshot({ path: `${DIR}/j27-privacy.png`, fullPage: true });

  // 3. Contact page
  await page.goto(`${BASE}/contact`, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(3000);
  await page.screenshot({ path: `${DIR}/j27-contact.png`, fullPage: true });

  // 4. Auth error page
  await page.goto(`${BASE}/auth/error?error=OAuthAccountNotLinked`, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(3000);
  await page.screenshot({ path: `${DIR}/j27-auth-error.png` });

  // 5. 500 page (static)
  await page.goto(`${BASE}/500`, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(3000);
  await page.screenshot({ path: `${DIR}/j27-500.png` });

  // 6. Org profile page — try to find an org
  await page.goto(BASE, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(4000);
  // Look for org link on a need card
  const orgLink = page.locator('a[href^="/org/"]').first();
  if (await orgLink.isVisible()) {
    const href = await orgLink.getAttribute('href');
    if (href) {
      await page.goto(`${BASE}${href}`, { waitUntil: 'domcontentloaded', timeout: 30000 });
      await page.waitForTimeout(3000);
      await page.screenshot({ path: `${DIR}/j27-org-profile.png`, fullPage: true });
    }
  }

  // Mobile versions of key pages
  const mobile = await browser.newContext({
    viewport: { width: 375, height: 667 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
  });
  const mpage = await mobile.newPage();

  // 7. Terms mobile
  await mpage.goto(`${BASE}/terms`, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await mpage.waitForTimeout(3000);
  await mpage.screenshot({ path: `${DIR}/j27-terms-mobile.png`, fullPage: true });

  // 8. Contact mobile
  await mpage.goto(`${BASE}/contact`, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await mpage.waitForTimeout(3000);
  await mpage.screenshot({ path: `${DIR}/j27-contact-mobile.png`, fullPage: true });

  await browser.close();
  console.log('Supporting pages screenshots complete');
})();

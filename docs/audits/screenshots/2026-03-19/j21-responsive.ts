import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ args: ['--dns-prefetch-disable'] });
  const base = 'https://runnersinneed.com';

  // Test at multiple viewport sizes
  const viewports = [
    { name: 'iphone-se', width: 375, height: 667 },
    { name: 'ipad', width: 768, height: 1024 },
    { name: 'laptop', width: 1280, height: 800 },
    { name: 'wide', width: 1920, height: 1080 },
  ];

  for (const vp of viewports) {
    const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height }, isMobile: vp.width < 768 });
    const page = await ctx.newPage();

    // Home page
    await page.goto(base, { timeout: 30000 });
    await page.waitForTimeout(3000);
    await page.screenshot({ path: `./j21-home-${vp.name}.png` });

    // About page
    await page.goto(`${base}/about`, { timeout: 30000 });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: `./j21-about-${vp.name}.png` });

    // Contact page
    await page.goto(`${base}/contact`, { timeout: 30000 });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: `./j21-contact-${vp.name}.png` });

    await ctx.close();
  }

  // Also check org page
  const ctx = await browser.newContext({ viewport: { width: 375, height: 812 }, isMobile: true });
  const page = await ctx.newPage();
  await page.goto(base, { timeout: 30000 });
  await page.waitForTimeout(3000);
  
  // Find an org link
  const orgLink = await page.$('a[href^="/org/"]');
  if (orgLink) {
    const href = await orgLink.getAttribute('href');
    await page.goto(`${base}${href}`, { timeout: 30000 });
    await page.waitForTimeout(3000);
    await page.screenshot({ path: './j21-org-mobile.png' });
    console.log(`Captured org page: ${href}`);
  } else {
    // Try from need detail
    const needLink = await page.$('.need-card a[href^="/needs/"]');
    if (needLink) {
      const href = await needLink.getAttribute('href');
      await page.goto(`${base}${href}`, { timeout: 30000 });
      await page.waitForTimeout(3000);
      const orgLinkOnDetail = await page.$('a[href^="/org/"]');
      if (orgLinkOnDetail) {
        const orgHref = await orgLinkOnDetail.getAttribute('href');
        await page.goto(`${base}${orgHref}`, { timeout: 30000 });
        await page.waitForTimeout(3000);
        await page.screenshot({ path: './j21-org-mobile.png' });
        console.log(`Captured org page: ${orgHref}`);
      }
    }
  }

  await browser.close();
  console.log('=== RESPONSIVE SCREENSHOTS COMPLETE ===');
})();

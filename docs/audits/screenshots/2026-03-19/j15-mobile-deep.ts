// J15: Deep mobile UX audit
import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ args: ['--dns-prefetch-disable'] });
  const mobile = await browser.newContext({ viewport: { width: 375, height: 812 }, isMobile: true });
  const mp = await mobile.newPage();

  const base = 'https://runnersinneed.com';

  // Home page — check hamburger menu
  console.log('Mobile menu...');
  await mp.goto(base, { timeout: 30000 });
  await mp.waitForTimeout(3000);

  // Click hamburger menu
  const menuBtn = await mp.$('#mobile-menu-btn, button[aria-label="Toggle menu"]');
  if (menuBtn) {
    await menuBtn.click();
    await mp.waitForTimeout(500);
    await mp.screenshot({ path: './j15-mobile-menu-open.png' });

    // Check menu items
    const menuItems = await mp.$$eval('#mobile-menu a', links =>
      links.map(l => ({ text: l.textContent?.trim(), visible: (l as HTMLElement).offsetHeight > 0 }))
    );
    console.log('  Menu items:', JSON.stringify(menuItems));

    // Close menu
    await menuBtn.click();
    await mp.waitForTimeout(300);
  }

  // Map view on mobile
  console.log('\nMobile map view...');
  const mapTab = await mp.$('#tab-map');
  if (mapTab) {
    await mapTab.click();
    await mp.waitForTimeout(2000);
    await mp.screenshot({ path: './j15-mobile-map.png' });

    // Switch back to listings
    const listTab = await mp.$('#tab-listings');
    await listTab?.click();
    await mp.waitForTimeout(500);
  }

  // Need detail — scroll behavior on mobile
  console.log('\nMobile need detail...');
  const needLink = await mp.$('.need-card a[href^="/needs/"]');
  if (needLink) {
    const href = await needLink.getAttribute('href');
    await mp.goto(`${base}${href}`, { timeout: 30000 });
    await mp.waitForTimeout(3000);
    await mp.screenshot({ path: './j15-mobile-need-top.png' });

    // Check touch target sizes for key interactive elements
    const touchTargets = await mp.$$eval('a, button', els =>
      els.filter(el => (el as HTMLElement).offsetHeight > 0).map(el => {
        const rect = (el as HTMLElement).getBoundingClientRect();
        return {
          text: el.textContent?.trim().slice(0, 30),
          width: Math.round(rect.width),
          height: Math.round(rect.height),
          tooSmall: rect.height < 44 && rect.width < 44,
        };
      }).filter(t => t.tooSmall)
    );
    console.log(`  Touch targets smaller than 44px: ${touchTargets.length}`);
    if (touchTargets.length > 0) {
      console.log('  Undersized:', JSON.stringify(touchTargets.slice(0, 5)));
    }
  }

  // Sign-in page mobile
  console.log('\nMobile sign-in...');
  await mp.goto(`${base}/auth/signin`, { timeout: 30000 });
  await mp.waitForTimeout(3000);
  await mp.screenshot({ path: './j15-mobile-signin.png' });

  // Why page mobile — check stats cards
  console.log('\nMobile why page...');
  await mp.goto(`${base}/why`, { timeout: 30000 });
  await mp.waitForTimeout(3000);
  await mp.screenshot({ path: './j15-mobile-why.png', fullPage: true });

  await browser.close();
  console.log('\n=== MOBILE DEEP DIVE COMPLETE ===');
})();

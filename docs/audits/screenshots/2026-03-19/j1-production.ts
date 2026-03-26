// J1: Discovery journey against production (real data)
import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ args: ['--dns-prefetch-disable'] });
  const desktop = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const dp = await desktop.newPage();
  const mobile = await browser.newContext({ viewport: { width: 375, height: 812 }, isMobile: true });
  const mp = await mobile.newPage();

  const base = 'https://runnersinneed.com';
  console.log('\n=== J1: PRODUCTION DISCOVERY ===\n');

  // Home page
  console.log('Home page...');
  await dp.goto(base, { timeout: 30000 });
  await dp.waitForTimeout(3000);
  await dp.screenshot({ path: './j1-prod-home-desktop.png', fullPage: true });
  await dp.screenshot({ path: './j1-prod-above-fold-desktop.png' });

  await mp.goto(base, { timeout: 30000 });
  await mp.waitForTimeout(3000);
  await mp.screenshot({ path: './j1-prod-home-mobile.png', fullPage: true });
  await mp.screenshot({ path: './j1-prod-above-fold-mobile.png' });

  // Count needs visible
  const needCount = await dp.$$eval('.need-card', cards => cards.length);
  console.log(`  Need cards visible: ${needCount}`);

  // Need detail page
  const needLinks = await dp.$$eval('a[href^="/needs/"]', links =>
    links.map(l => (l as HTMLAnchorElement).href).filter((v, i, a) => a.indexOf(v) === i).slice(0, 1)
  );
  if (needLinks.length > 0) {
    console.log('Need detail page...');
    await dp.goto(needLinks[0], { timeout: 30000 });
    await dp.waitForTimeout(3000);
    await dp.screenshot({ path: './j1-prod-need-detail-desktop.png', fullPage: true });

    await mp.goto(needLinks[0], { timeout: 30000 });
    await mp.waitForTimeout(3000);
    await mp.screenshot({ path: './j1-prod-need-detail-mobile.png', fullPage: true });
  }

  // Drives
  console.log('Drives page...');
  try {
    await dp.goto(`${base}/drives`, { timeout: 15000 });
    await dp.waitForTimeout(3000);
    await dp.screenshot({ path: './j1-prod-drives-desktop.png', fullPage: true });
  } catch (e) {
    console.log('  Drives page error: ' + (e as Error).message.split('\n')[0]);
  }

  // Sign in
  console.log('Sign in page...');
  await dp.goto(`${base}/auth/signin`, { timeout: 30000 });
  await dp.waitForTimeout(3000);
  await dp.screenshot({ path: './j1-prod-signin-desktop.png', fullPage: true });

  await mp.goto(`${base}/auth/signin`, { timeout: 30000 });
  await mp.waitForTimeout(3000);
  await mp.screenshot({ path: './j1-prod-signin-mobile.png', fullPage: true });

  // Become organizer
  console.log('Become organizer page...');
  await dp.goto(`${base}/become-organizer`, { timeout: 30000 });
  await dp.waitForTimeout(3000);
  await dp.screenshot({ path: './j1-prod-become-org-desktop.png', fullPage: true });

  // Map view
  console.log('Map view...');
  await dp.goto(base, { timeout: 30000 });
  await dp.waitForTimeout(3000);
  // Find and click the Map toggle
  const mapToggle = await dp.$('text=Map');
  if (mapToggle) {
    await mapToggle.click();
    await dp.waitForTimeout(2000);
    await dp.screenshot({ path: './j1-prod-map-desktop.png', fullPage: true });
  }

  // Desktop map on mobile
  await mp.goto(base, { timeout: 30000 });
  await mp.waitForTimeout(3000);
  const mobileMapTab = await mp.$('text=Map');
  if (mobileMapTab) {
    await mobileMapTab.click();
    await mp.waitForTimeout(2000);
    await mp.screenshot({ path: './j1-prod-map-mobile.png', fullPage: true });
  }

  // 404
  console.log('404 page...');
  await dp.goto(`${base}/nonexistent-page-xyz`, { timeout: 30000 });
  await dp.waitForTimeout(3000);
  await dp.screenshot({ path: './j1-prod-404-desktop.png', fullPage: true });

  // Org profile page
  console.log('Org profile...');
  const orgLinks = await dp.goto(base, { timeout: 30000 }).then(async () => {
    await dp.waitForTimeout(3000);
    return dp.$$eval('a[href^="/org/"]', links =>
      links.map(l => (l as HTMLAnchorElement).href).slice(0, 1)
    );
  });
  if (orgLinks.length > 0) {
    await dp.goto(orgLinks[0], { timeout: 30000 });
    await dp.waitForTimeout(3000);
    await dp.screenshot({ path: './j1-prod-org-desktop.png', fullPage: true });
  }

  await browser.close();
  console.log('\n=== DONE ===');
})();

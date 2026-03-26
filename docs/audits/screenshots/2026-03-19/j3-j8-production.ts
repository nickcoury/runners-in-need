// J3-J8: Production screenshots of pages not yet captured
import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ args: ['--dns-prefetch-disable'] });
  const desktop = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const dp = await desktop.newPage();
  const mobile = await browser.newContext({ viewport: { width: 375, height: 812 }, isMobile: true });
  const mp = await mobile.newPage();

  const base = 'https://runnersinneed.com';

  // About page
  console.log('About page...');
  await dp.goto(`${base}/about`, { timeout: 30000 });
  await dp.waitForTimeout(3000);
  await dp.screenshot({ path: './about-desktop.png', fullPage: true });
  await mp.goto(`${base}/about`, { timeout: 30000 });
  await mp.waitForTimeout(3000);
  await mp.screenshot({ path: './about-mobile.png', fullPage: true });

  // Why page
  console.log('Why page...');
  await dp.goto(`${base}/why`, { timeout: 30000 });
  await dp.waitForTimeout(3000);
  await dp.screenshot({ path: './why-desktop.png', fullPage: true });

  // Contact page
  console.log('Contact page...');
  await dp.goto(`${base}/contact`, { timeout: 30000 });
  await dp.waitForTimeout(3000);
  await dp.screenshot({ path: './contact-desktop.png', fullPage: true });

  // Become organizer (unauthenticated)
  console.log('Become organizer (unauth)...');
  await dp.goto(`${base}/become-organizer`, { timeout: 30000 });
  await dp.waitForTimeout(3000);
  await dp.screenshot({ path: './become-org-unauth-desktop.png', fullPage: true });
  await mp.goto(`${base}/become-organizer`, { timeout: 30000 });
  await mp.waitForTimeout(3000);
  await mp.screenshot({ path: './become-org-unauth-mobile.png', fullPage: true });

  // Post need (unauthenticated — should redirect to signin)
  console.log('Post need (unauth)...');
  await dp.goto(`${base}/post`, { timeout: 30000 });
  await dp.waitForTimeout(3000);
  await dp.screenshot({ path: './post-unauth-desktop.png', fullPage: true });

  // Browse page with search active
  console.log('Browse with filters...');
  await dp.goto(base, { timeout: 30000 });
  await dp.waitForTimeout(3000);
  const searchInput = await dp.$('input[placeholder*="Search"]');
  if (searchInput) {
    await searchInput.fill('shoes');
    await dp.waitForTimeout(1000);
    await dp.screenshot({ path: './browse-search-shoes-desktop.png' });
  }

  // Browse page scroll — check below-the-fold content
  console.log('Browse below fold...');
  await dp.goto(base, { timeout: 30000 });
  await dp.waitForTimeout(3000);
  await dp.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await dp.waitForTimeout(1000);
  await dp.screenshot({ path: './browse-footer-desktop.png' });

  // Footer on mobile
  await mp.goto(base, { timeout: 30000 });
  await mp.waitForTimeout(3000);
  await mp.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await mp.waitForTimeout(1000);
  await mp.screenshot({ path: './browse-footer-mobile.png' });

  // Privacy policy
  console.log('Privacy page...');
  try {
    await dp.goto(`${base}/privacy`, { timeout: 15000 });
    await dp.waitForTimeout(3000);
    await dp.screenshot({ path: './privacy-desktop.png', fullPage: true });
  } catch (e) {
    console.log('  Privacy page error: ' + (e as Error).message.split('\n')[0]);
  }

  // Terms page
  console.log('Terms page...');
  try {
    await dp.goto(`${base}/terms`, { timeout: 15000 });
    await dp.waitForTimeout(3000);
    await dp.screenshot({ path: './terms-desktop.png', fullPage: true });
  } catch (e) {
    console.log('  Terms page error: ' + (e as Error).message.split('\n')[0]);
  }

  await browser.close();
  console.log('\n=== SCREENSHOTS COMPLETE ===');
})();

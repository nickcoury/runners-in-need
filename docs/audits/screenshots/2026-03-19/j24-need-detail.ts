import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ args: ['--dns-prefetch-disable'] });

  // First, get the first need ID from the API
  const apiPage = await (await browser.newContext()).newPage();
  await apiPage.goto('https://runnersinneed.com/api/needs', { timeout: 30000, waitUntil: 'domcontentloaded' });
  await apiPage.waitForTimeout(3000);
  const apiText = await apiPage.textContent('body');
  let needs: any[] = [];
  try { needs = JSON.parse(apiText || '[]'); } catch {}
  await apiPage.close();

  if (needs.length === 0) {
    console.log('No needs found');
    await browser.close();
    return;
  }

  const needId = needs[0].id;
  console.log(`Testing need: ${needs[0].title} (${needId})`);

  // Desktop view
  const desktop = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const dPage = await desktop.newPage();
  await dPage.goto(`https://runnersinneed.com/needs/${needId}`, { timeout: 30000, waitUntil: 'domcontentloaded' });
  await dPage.waitForTimeout(3000);
  await dPage.screenshot({ path: './j24-need-desktop.png', fullPage: true });

  // Check pledge form visibility
  const pledgeForm = dPage.locator('form');
  console.log(`Forms on page: ${await pledgeForm.count()}`);
  
  // Check org link
  const orgLink = dPage.locator('a[href^="/org/"]');
  console.log(`Org links: ${await orgLink.count()}`);
  if (await orgLink.count() > 0) {
    console.log(`Org link text: ${await orgLink.first().textContent()}`);
  }

  // Check delivery methods display
  const deliverySection = dPage.locator('text=Delivery');
  console.log(`Delivery sections: ${await deliverySection.count()}`);

  // Mobile view
  const mobile = await browser.newContext({ viewport: { width: 375, height: 812 } });
  const mPage = await mobile.newPage();
  await mPage.goto(`https://runnersinneed.com/needs/${needId}`, { timeout: 30000, waitUntil: 'domcontentloaded' });
  await mPage.waitForTimeout(3000);
  await mPage.screenshot({ path: './j24-need-mobile.png', fullPage: true });

  // Test 404 page with invalid need ID
  await dPage.goto('https://runnersinneed.com/needs/invalid-id-12345', { timeout: 30000, waitUntil: 'domcontentloaded' });
  await dPage.waitForTimeout(3000);
  console.log(`404 page URL: ${dPage.url()}`);
  console.log(`404 page title: ${await dPage.title()}`);
  await dPage.screenshot({ path: './j24-need-404.png', fullPage: false });

  await browser.close();
  console.log('Done');
})();

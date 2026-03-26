// J2: Anonymous Donor Pledge Journey (Sarah)
// Sarah has old shoes. Found the site via social media. No account. Just wants to help fast.
import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ args: ['--dns-prefetch-disable'] });
  const desktop = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const dp = await desktop.newPage();
  const mobile = await browser.newContext({ viewport: { width: 375, height: 812 }, isMobile: true });
  const mp = await mobile.newPage();

  const base = 'https://runnersinneed.com';
  console.log('\n=== J2: ANONYMOUS PLEDGE JOURNEY (Sarah) ===\n');

  // Step 1: Sarah lands on home page, scans for something local
  console.log('--- Step 1: Landing + Search ---');
  await dp.goto(base, { timeout: 30000 });
  await dp.waitForTimeout(3000);

  // Check search — what happens when she types a city?
  const searchInput = await dp.$('input[placeholder*="Search"]');
  if (searchInput) {
    await searchInput.fill('Chicago');
    await dp.waitForTimeout(1500);
    await dp.screenshot({ path: './j2-01-search-chicago-desktop.png' });

    // Check: does the search filter live or need enter?
    const visibleCards = await dp.$$eval('.need-card:not(.hidden)', cards => cards.length);
    console.log(`  Cards visible after typing "Chicago": ${visibleCards}`);
  }

  // Step 2: Sarah clicks a category filter
  console.log('\n--- Step 2: Category Filter ---');
  await searchInput?.fill(''); // Clear search
  await dp.waitForTimeout(500);
  const shoesBtn = await dp.$('button:has-text("Shoes")');
  if (shoesBtn) {
    await shoesBtn.click();
    await dp.waitForTimeout(1000);
    await dp.screenshot({ path: './j2-02-filter-shoes-desktop.png' });
    const shoesCards = await dp.$$eval('.need-card:not(.hidden)', cards => cards.length);
    console.log(`  Shoes cards visible: ${shoesCards}`);
  }

  // Step 3: Sarah clicks into a need
  console.log('\n--- Step 3: Need Detail ---');
  const viewNeedBtn = await dp.$('.need-card:not(.hidden) a:has-text("View Need")');
  if (viewNeedBtn) {
    await viewNeedBtn.click();
    await dp.waitForTimeout(3000);
    await dp.screenshot({ path: './j2-03-need-detail-desktop.png', fullPage: true });

    // Measure scroll distance to pledge form
    const pledgeFormTop = await dp.$eval('form', form => {
      const rect = form.getBoundingClientRect();
      return Math.round(rect.top);
    }).catch(() => -1);
    console.log(`  Pledge form position from top: ${pledgeFormTop}px`);

    // Check: what does the pledge form look like?
    const formFields = await dp.$$eval('form input, form textarea, form select', fields =>
      fields.map(f => ({
        type: (f as HTMLInputElement).type || (f as HTMLElement).tagName,
        name: (f as HTMLInputElement).name,
        required: (f as HTMLInputElement).required,
        placeholder: (f as HTMLInputElement).placeholder,
      })).filter(f => f.type !== 'hidden')
    );
    console.log(`  Form fields: ${JSON.stringify(formFields, null, 2)}`);
  }

  // Step 4: Check if org name links to org profile from detail page
  console.log('\n--- Step 4: Org Profile Link ---');
  const orgLink = await dp.$('a[href^="/org/"]');
  console.log(`  Org profile link exists on detail page: ${!!orgLink}`);

  // Step 5: Check the need detail on mobile
  console.log('\n--- Step 5: Mobile Need Detail ---');
  await mp.goto(dp.url(), { timeout: 30000 });
  await mp.waitForTimeout(3000);
  await mp.screenshot({ path: './j2-04-need-detail-mobile.png', fullPage: true });

  // Scroll to pledge form on mobile and screenshot
  await mp.evaluate(() => {
    const form = document.querySelector('form');
    form?.scrollIntoView({ behavior: 'instant' });
  });
  await mp.waitForTimeout(500);
  await mp.screenshot({ path: './j2-05-pledge-form-mobile.png' });

  // Step 6: Check pledge success state (can't actually submit, but review the component)
  console.log('\n--- Step 6: Post-pledge experience ---');
  // We can't submit a real pledge in production, but we can check what the page communicates
  // about what happens next. Is there messaging about delivery coordination? Timeline? etc.

  // Step 7: Check if Sarah can browse org profile
  console.log('\n--- Step 7: Org Profile ---');
  if (orgLink) {
    await orgLink.click();
    await dp.waitForTimeout(3000);
    await dp.screenshot({ path: './j2-06-org-profile-desktop.png', fullPage: true });
  }

  // Step 8: Check "Near me" functionality
  console.log('\n--- Step 8: Location features ---');
  await dp.goto(base, { timeout: 30000 });
  await dp.waitForTimeout(3000);
  const nearMeBtn = await dp.$('button:has-text("Near me"), [aria-label*="near" i]');
  console.log(`  "Near me" button exists: ${!!nearMeBtn}`);

  await browser.close();
  console.log('\n=== J2 COMPLETE ===\n');
})();

import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ args: ['--dns-prefetch-disable'] });
  const page = await browser.newPage();
  const base = 'https://runnersinneed.com';

  await page.goto(base, { timeout: 30000 });
  await page.waitForTimeout(5000);

  // 1. Search functionality
  console.log('=== SEARCH ===');
  const searchInput = await page.$('input[type="search"], input[placeholder*="Search"]');
  if (searchInput) {
    await searchInput.fill('shoes');
    await page.waitForTimeout(1000);

    const visibleCards = await page.$$eval('[data-need-card]', cards =>
      cards.filter(c => (c as HTMLElement).style.display !== 'none').length
    );
    const totalCards = await page.$$eval('[data-need-card]', cards => cards.length);
    console.log(`  Search "shoes": ${visibleCards}/${totalCards} cards visible`);
    await page.screenshot({ path: './j20-search-shoes.png' });

    // Check URL hash update
    const hash1 = await page.evaluate(() => window.location.hash);
    console.log(`  URL hash after search: ${hash1}`);

    // Clear search
    await searchInput.fill('');
    await page.waitForTimeout(500);
    
    // Search with no results
    await searchInput.fill('xyznonexistent123');
    await page.waitForTimeout(1000);
    const noResultCards = await page.$$eval('[data-need-card]', cards =>
      cards.filter(c => (c as HTMLElement).style.display !== 'none').length
    );
    console.log(`  Search "xyznonexistent123": ${noResultCards} cards visible`);
    
    // Check empty state
    const emptyMsg = await page.$('.empty-state, [data-empty-message]');
    console.log(`  Empty state shown: ${!!emptyMsg}`);
    await page.screenshot({ path: './j20-search-empty.png' });
    
    await searchInput.fill('');
    await page.waitForTimeout(500);
  }

  // 2. Category filter
  console.log('\n=== CATEGORY FILTERS ===');
  const categories = await page.$$eval('button', btns =>
    btns.filter(b => ['All', '👟 Shoes', '👕 Apparel', '🎽 Accessories', '📦 Other'].includes(b.textContent?.trim() || ''))
      .map(b => b.textContent?.trim())
  );
  console.log(`  Categories found: ${JSON.stringify(categories)}`);

  // Click Shoes filter
  const shoesBtn = await page.$('button:text("Shoes")');
  if (shoesBtn) {
    await shoesBtn.click();
    await page.waitForTimeout(500);
    const shoesCards = await page.$$eval('[data-need-card]', cards =>
      cards.filter(c => (c as HTMLElement).style.display !== 'none').length
    );
    console.log(`  After "Shoes" filter: ${shoesCards} cards visible`);
    const hash2 = await page.evaluate(() => window.location.hash);
    console.log(`  URL hash: ${hash2}`);

    // Check visual feedback on selected category
    const btnClasses = await shoesBtn.evaluate(el => el.className);
    console.log(`  Selected button classes include highlight: ${btnClasses.includes('bg-') || btnClasses.includes('ring-')}`);
  }

  // Click All to reset
  const allBtn = await page.$('button:text("All")');
  if (allBtn) {
    await allBtn.click();
    await page.waitForTimeout(500);
  }

  // 3. View toggle (List vs Map)
  console.log('\n=== VIEW TOGGLE ===');
  const mapBtn = await page.$('button:text("Map")');
  if (mapBtn) {
    await mapBtn.click();
    await page.waitForTimeout(2000);
    await page.screenshot({ path: './j20-map-desktop.png' });
    const hash3 = await page.evaluate(() => window.location.hash);
    console.log(`  Map view URL hash: ${hash3}`);
  }

  const listBtn = await page.$('button:text("List")');
  if (listBtn) {
    await listBtn.click();
    await page.waitForTimeout(500);
  }

  // 4. Location sort
  console.log('\n=== LOCATION SORT ===');
  const nearMeBtn = await page.$('button:text("Near me")');
  console.log(`  "Near me" button present: ${!!nearMeBtn}`);

  // Check for CF geolocation data element
  const cfGeo = await page.$eval('#cf-geo', el => ({
    lat: el.getAttribute('data-lat'),
    lng: el.getAttribute('data-lng'),
  })).catch(() => null);
  console.log(`  CF geolocation element: ${cfGeo ? `lat=${cfGeo.lat}, lng=${cfGeo.lng}` : 'not found or empty'}`);

  // 5. Need card interaction details
  console.log('\n=== NEED CARD DETAILS ===');
  const cardDetails = await page.$$eval('[data-need-card]', cards =>
    cards.slice(0, 3).map(card => {
      const links = card.querySelectorAll('a');
      const badges = card.querySelectorAll('.bg-green-800, .bg-green-100, [class*="badge"]');
      return {
        linkCount: links.length,
        linkTexts: Array.from(links).map(l => l.textContent?.trim().slice(0, 30)),
        linkTargets: Array.from(links).map(l => l.getAttribute('href')),
        badgeCount: badges.length,
      };
    })
  );
  for (const [i, card] of cardDetails.entries()) {
    console.log(`  Card ${i + 1}: ${card.linkCount} links, ${card.badgeCount} badges`);
    console.log(`    Links: ${JSON.stringify(card.linkTexts)}`);
    const uniqueTargets = [...new Set(card.linkTargets)];
    console.log(`    Unique targets: ${uniqueTargets.length} (${JSON.stringify(uniqueTargets)})`);
  }

  // 6. Scroll behavior — does the search bar stick?
  console.log('\n=== SCROLL BEHAVIOR ===');
  await page.evaluate(() => window.scrollTo(0, 500));
  await page.waitForTimeout(500);
  const searchAfterScroll = await page.evaluate(() => {
    const search = document.querySelector('input[placeholder*="Search"]') as HTMLElement;
    if (!search) return null;
    const rect = search.getBoundingClientRect();
    return { top: rect.top, visible: rect.top >= 0 && rect.top < window.innerHeight };
  });
  console.log(`  Search bar after scrolling 500px: ${searchAfterScroll?.visible ? 'visible' : 'scrolled off'} (top: ${searchAfterScroll?.top}px)`);

  // 7. Back-to-top button
  await page.evaluate(() => window.scrollTo(0, 1000));
  await page.waitForTimeout(600);
  const backToTop = await page.$('button[aria-label*="top"], #back-to-top');
  console.log(`  Back-to-top button after scroll: ${backToTop ? 'visible' : 'not found'}`);

  await browser.close();
  console.log('\n=== BROWSE DEEP DIVE COMPLETE ===');
})();

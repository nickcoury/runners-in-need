import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ args: ['--dns-prefetch-disable'] });
  const page = await browser.newPage();
  const base = 'https://runnersinneed.com';

  // 1. 404 page
  console.log('=== 404 PAGE ===');
  await page.goto(`${base}/nonexistent-page-xyz`, { timeout: 30000 });
  await page.waitForTimeout(3000);
  await page.screenshot({ path: './j19-404.png' });
  const title404 = await page.title();
  const h1_404 = await page.$eval('h1', el => el.textContent?.trim()).catch(() => 'none');
  console.log(`  Title: ${title404}`);
  console.log(`  H1: ${h1_404}`);

  // 2. Invalid need ID
  console.log('\n=== INVALID NEED ID ===');
  const resp = await page.goto(`${base}/needs/totally-fake-id-12345`, { timeout: 30000 });
  await page.waitForTimeout(3000);
  await page.screenshot({ path: './j19-invalid-need.png' });
  console.log(`  Status: ${resp?.status()}`);
  const h1_invalid = await page.$eval('h1', el => el.textContent?.trim()).catch(() => 'none');
  console.log(`  H1: ${h1_invalid}`);

  // 3. Privacy page
  console.log('\n=== PRIVACY PAGE ===');
  await page.goto(`${base}/privacy`, { timeout: 30000 });
  await page.waitForTimeout(2000);
  const privacyH1 = await page.$eval('h1', el => el.textContent?.trim()).catch(() => 'none');
  const privacyLength = await page.evaluate(() => document.querySelector('main')?.textContent?.length || 0);
  console.log(`  H1: ${privacyH1}`);
  console.log(`  Content length: ${privacyLength} chars`);

  // 4. Terms page
  console.log('\n=== TERMS PAGE ===');
  await page.goto(`${base}/terms`, { timeout: 30000 });
  await page.waitForTimeout(2000);
  const termsH1 = await page.$eval('h1', el => el.textContent?.trim()).catch(() => 'none');
  const termsLength = await page.evaluate(() => document.querySelector('main')?.textContent?.length || 0);
  console.log(`  H1: ${termsH1}`);
  console.log(`  Content length: ${termsLength} chars`);

  // 5. Contact page
  console.log('\n=== CONTACT PAGE ===');
  await page.goto(`${base}/contact`, { timeout: 30000 });
  await page.waitForTimeout(2000);
  const contactH1 = await page.$eval('h1', el => el.textContent?.trim()).catch(() => 'none');
  console.log(`  H1: ${contactH1}`);

  // 6. Drives page (unauthenticated)
  console.log('\n=== DRIVES PAGE ===');
  await page.goto(`${base}/drives`, { timeout: 30000 });
  await page.waitForTimeout(3000);
  await page.screenshot({ path: './j19-drives.png' });
  const drivesH1 = await page.$eval('h1', el => el.textContent?.trim()).catch(() => 'none');
  const drivesContent = await page.evaluate(() => document.querySelector('main')?.textContent?.slice(0, 200));
  console.log(`  H1: ${drivesH1}`);
  console.log(`  Content preview: ${drivesContent}`);

  // 7. Org page with invalid ID
  console.log('\n=== INVALID ORG PAGE ===');
  const orgResp = await page.goto(`${base}/org/fake-org-id-999`, { timeout: 30000 });
  await page.waitForTimeout(3000);
  console.log(`  Status: ${orgResp?.status()}`);
  const orgH1 = await page.$eval('h1', el => el.textContent?.trim()).catch(() => 'none');
  console.log(`  H1: ${orgH1}`);

  // 8. Check all internal links from homepage for 404s
  console.log('\n=== LINK CHECK ===');
  await page.goto(base, { timeout: 30000 });
  await page.waitForTimeout(3000);
  const links = await page.$$eval('a[href^="/"]', els => 
    [...new Set(els.map(el => el.getAttribute('href')).filter(Boolean))]
  );
  console.log(`  Internal links found: ${links.length}`);
  for (const link of links) {
    if (link?.startsWith('/api/') || link?.startsWith('/auth/')) continue;
    try {
      const r = await page.goto(`${base}${link}`, { timeout: 10000 });
      const status = r?.status() || 0;
      if (status >= 400) {
        console.log(`  ✗ ${status} — ${link}`);
      }
    } catch (e: any) {
      console.log(`  ✗ TIMEOUT — ${link}`);
    }
  }
  console.log('  Link check complete');

  await browser.close();
  console.log('\n=== EDGE CASES COMPLETE ===');
})();

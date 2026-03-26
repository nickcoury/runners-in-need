import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ args: ['--dns-prefetch-disable'] });
  const page = await browser.newPage();
  await page.goto('https://runnersinneed.com', { timeout: 60000 });
  await page.waitForTimeout(5000);

  const searchInput = await page.$('input[placeholder*="Search"]');
  if (searchInput) {
    await searchInput.fill('xyznonexistent123');
    await page.waitForTimeout(1000);

    const noResults = await page.$('#no-results');
    if (noResults) {
      const isHidden = await noResults.evaluate(el => el.classList.contains('hidden'));
      const text = await noResults.textContent();
      const box = await noResults.boundingBox();
      console.log(`no-results: hidden=${isHidden}, text="${text?.trim()}", visible=${box !== null}`);
    } else {
      console.log('no-results: NOT FOUND IN DOM');
    }
    
    await page.screenshot({ path: './j22-noresults.png', fullPage: true });
  }

  await browser.close();
})();

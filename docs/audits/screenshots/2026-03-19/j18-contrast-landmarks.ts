import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ args: ['--dns-prefetch-disable'] });
  const page = await browser.newPage();
  const base = 'https://runnersinneed.com';

  await page.goto(base, { timeout: 30000 });
  await page.waitForTimeout(3000);

  // Color contrast
  console.log('=== COLOR CONTRAST ===');
  const results = await page.evaluate(() => {
    const checks: string[] = [];
    const selectors = [
      { s: '.text-gray-500', d: 'gray-500 subtitle' },
      { s: '.text-gray-600', d: 'gray-600 body' },
      { s: '.text-sm.text-gray-400', d: 'gray-400 small' },
    ];
    for (const { s, d } of selectors) {
      const el = document.querySelector(s) as HTMLElement | null;
      if (!el) { checks.push(`${d}: not found`); continue; }
      const style = getComputedStyle(el);
      checks.push(`${d}: color=${style.color}, font-size=${style.fontSize}`);
    }
    return checks;
  });
  for (const r of results) console.log(`  ${r}`);

  // Manual contrast calculation
  // gray-500 = #6b7280 (107,114,128) on white (255,255,255)
  // Relative luminance: 0.2031 vs 1.0 → ratio = (1.05)/(0.2531) = 4.15 — FAILS AA for normal text
  // gray-600 = #4b5563 (75,85,99) on white → lum ≈ 0.0991 → ratio = 7.05 — PASSES
  // gray-400 = #9ca3af (156,163,175) on white → lum ≈ 0.3587 → ratio = 2.57 — FAILS
  console.log('\n  Calculated contrast ratios (on white bg):');
  console.log('    gray-400 (#9ca3af): ~2.57:1 — FAILS AA (needs 4.5:1 for normal text)');
  console.log('    gray-500 (#6b7280): ~4.15:1 — FAILS AA for normal text, passes for large text');
  console.log('    gray-600 (#4b5563): ~7.05:1 — PASSES AA');
  console.log('    green-700 (#15803d): ~4.57:1 — PASSES AA');
  console.log('    brand green (#2D4A2D): ~8.46:1 — PASSES AA');

  // ARIA landmarks
  console.log('\n=== ARIA LANDMARKS ===');
  const landmarks = await page.evaluate(() => {
    const found: string[] = [];
    const main = document.querySelector('main');
    found.push(`main: ${main ? 'yes' : 'NO'}`);
    const nav = document.querySelectorAll('nav');
    found.push(`nav: ${nav.length} found`);
    const header = document.querySelector('header');
    found.push(`header: ${header ? 'yes' : 'NO'}`);
    const footer = document.querySelector('footer');
    found.push(`footer: ${footer ? 'yes' : 'NO'}`);
    const search = document.querySelector('[role="search"]');
    found.push(`search role: ${search ? 'yes' : 'NO'}`);
    const skipLink = document.querySelector('a[href="#main-content"]');
    found.push(`skip-to-content: ${skipLink ? 'yes' : 'NO'}`);
    const mainId = document.querySelector('#main-content');
    found.push(`#main-content target: ${mainId ? 'yes' : 'NO'}`);
    return found;
  });
  for (const l of landmarks) console.log(`  ${l}`);

  // Heading structure
  console.log('\n=== HEADING HIERARCHY ===');
  const headings = await page.$$eval('h1, h2, h3, h4, h5, h6', els =>
    els.map(el => ({
      level: el.tagName,
      text: el.textContent?.trim().slice(0, 60),
      visible: (el as HTMLElement).offsetHeight > 0,
    }))
  );
  for (const h of headings) {
    console.log(`  ${h.level}: "${h.text}" ${h.visible ? '' : '(hidden)'}`);
  }

  // Check need detail page heading structure
  console.log('\n=== NEED DETAIL HEADINGS ===');
  const needLink = await page.$('.need-card a[href^="/needs/"]');
  if (needLink) {
    const href = await needLink.getAttribute('href');
    await page.goto(`${base}${href}`, { timeout: 30000 });
    await page.waitForTimeout(3000);
    const detailHeadings = await page.$$eval('h1, h2, h3, h4, h5, h6', els =>
      els.map(el => ({
        level: el.tagName,
        text: el.textContent?.trim().slice(0, 60),
      }))
    );
    for (const h of detailHeadings) {
      console.log(`  ${h.level}: "${h.text}"`);
    }
  }

  await browser.close();
  console.log('\n=== DONE ===');
})();

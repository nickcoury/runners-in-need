import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ args: ['--dns-prefetch-disable'] });
  const context = await browser.newContext();
  const page = await context.newPage();
  const base = 'https://runnersinneed.com';

  // Track all network requests
  const requests: { url: string; size: number; type: string; duration: number }[] = [];

  page.on('response', async (response) => {
    try {
      const url = response.url();
      const headers = response.headers();
      const size = parseInt(headers['content-length'] || '0', 10);
      const type = headers['content-type'] || 'unknown';
      const timing = response.request().timing();
      requests.push({
        url: url.replace(base, ''),
        size,
        type: type.split(';')[0],
        duration: timing.responseEnd - timing.requestStart,
      });
    } catch {}
  });

  // Home page performance
  console.log('=== HOME PAGE PERFORMANCE ===');
  const homeStart = Date.now();
  await page.goto(base, { timeout: 30000 });
  await page.waitForTimeout(5000);
  const homeEnd = Date.now();
  console.log(`  Total load time: ${homeEnd - homeStart}ms`);

  // Categorize requests
  const js = requests.filter(r => r.type.includes('javascript'));
  const css = requests.filter(r => r.type.includes('css'));
  const images = requests.filter(r => r.type.includes('image'));
  const fonts = requests.filter(r => r.type.includes('font'));
  const api = requests.filter(r => r.url.includes('/api/'));

  console.log(`  JS files: ${js.length} (${js.reduce((s, r) => s + r.size, 0)} bytes)`);
  console.log(`  CSS files: ${css.length} (${css.reduce((s, r) => s + r.size, 0)} bytes)`);
  console.log(`  Images: ${images.length}`);
  console.log(`  Fonts: ${fonts.length}`);
  console.log(`  API calls: ${api.length}`);

  // Largest JS bundles
  const sortedJs = [...js].sort((a, b) => b.size - a.size);
  console.log('\n  Largest JS bundles:');
  for (const r of sortedJs.slice(0, 5)) {
    console.log(`    ${(r.size / 1024).toFixed(1)}KB - ${r.url.split('/').pop()}`);
  }

  // API response times
  console.log('\n  API response times:');
  for (const r of api) {
    console.log(`    ${r.duration.toFixed(0)}ms - ${r.url}`);
  }

  // CLS and LCP via Performance API
  const metrics = await page.evaluate(() => {
    const entries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
    const nav = entries[0];
    return {
      dns: nav?.domainLookupEnd - nav?.domainLookupStart,
      tcp: nav?.connectEnd - nav?.connectStart,
      ttfb: nav?.responseStart - nav?.requestStart,
      domContentLoaded: nav?.domContentLoadedEventEnd - nav?.startTime,
      load: nav?.loadEventEnd - nav?.startTime,
      domInteractive: nav?.domInteractive - nav?.startTime,
    };
  });
  console.log('\n  Navigation timing:');
  console.log(`    DNS: ${metrics.dns?.toFixed(0)}ms`);
  console.log(`    TCP: ${metrics.tcp?.toFixed(0)}ms`);
  console.log(`    TTFB: ${metrics.ttfb?.toFixed(0)}ms`);
  console.log(`    DOM Content Loaded: ${metrics.domContentLoaded?.toFixed(0)}ms`);
  console.log(`    DOM Interactive: ${metrics.domInteractive?.toFixed(0)}ms`);
  console.log(`    Full Load: ${metrics.load?.toFixed(0)}ms`);

  // Need detail page
  requests.length = 0;
  console.log('\n=== NEED DETAIL PAGE ===');
  const needLink = await page.$('.need-card a[href^="/needs/"]');
  if (needLink) {
    const href = await needLink.getAttribute('href');
    const detailStart = Date.now();
    await page.goto(`${base}${href}`, { timeout: 30000 });
    await page.waitForTimeout(3000);
    const detailEnd = Date.now();
    console.log(`  Total load time: ${detailEnd - detailStart}ms`);
    const detailJs = requests.filter(r => r.type.includes('javascript'));
    console.log(`  JS files: ${detailJs.length} (${detailJs.reduce((s, r) => s + r.size, 0)} bytes)`);
  }

  // Check for console errors
  const errors: string[] = [];
  page.on('console', msg => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  await page.goto(base, { timeout: 30000 });
  await page.waitForTimeout(3000);
  if (errors.length) {
    console.log('\n  Console errors:');
    for (const e of errors) console.log(`    ${e}`);
  } else {
    console.log('\n  No console errors detected');
  }

  await browser.close();
  console.log('\n=== PERFORMANCE AUDIT COMPLETE ===');
})();

// J1: Discovery → Understanding (Alex's journey)
// Alex lands on the site cold. Can they understand what this is in 30 seconds?

import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();

  // Desktop viewport
  const desktop = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const dp = await desktop.newPage();

  // Mobile viewport
  const mobile = await browser.newContext({ viewport: { width: 375, height: 812 }, isMobile: true });
  const mp = await mobile.newPage();

  console.log('\n=== J1: DISCOVERY JOURNEY (Alex - Curious Visitor) ===\n');

  // Step 1: Land on home page
  console.log('--- Step 1: First impression (home page) ---');
  await dp.goto('http://localhost:4321');
  await dp.waitForLoadState('networkidle');
  await dp.screenshot({ path: './j1-01-home-desktop.png', fullPage: true });

  await mp.goto('http://localhost:4321');
  await mp.waitForLoadState('networkidle');
  await mp.screenshot({ path: './j1-01-home-mobile.png', fullPage: true });

  // Check: Is the value proposition clear above the fold?
  const heroText = await dp.textContent('body');
  const hasTagline = heroText?.includes('Runners In Need') || false;
  console.log(`  Value prop visible: ${hasTagline}`);

  // Check: How long does the page take to become interactive?
  const timing = await dp.evaluate(() => {
    const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    return {
      domContentLoaded: Math.round(nav.domContentLoadedEventEnd),
      loadComplete: Math.round(nav.loadEventEnd),
      firstPaint: Math.round(performance.getEntriesByName('first-paint')[0]?.startTime || 0),
    };
  });
  console.log(`  Load timing: DOMContentLoaded=${timing.domContentLoaded}ms, Load=${timing.loadComplete}ms, FirstPaint=${timing.firstPaint}ms`);

  // Check: What does the user see before needs load? (skeleton state)
  console.log('\n--- Step 2: Navigation clarity ---');
  const navLinks = await dp.$$eval('nav a, header a', links =>
    links.map(l => ({ text: l.textContent?.trim(), href: (l as HTMLAnchorElement).href }))
  );
  console.log(`  Nav links: ${navLinks.map(l => l.text).join(', ')}`);

  // Step 3: About page — does it explain the mission?
  console.log('\n--- Step 3: About page ---');
  await dp.goto('http://localhost:4321/about');
  await dp.waitForLoadState('networkidle');
  await dp.screenshot({ path: './j1-02-about-desktop.png', fullPage: true });

  await mp.goto('http://localhost:4321/about');
  await mp.waitForLoadState('networkidle');
  await mp.screenshot({ path: './j1-02-about-mobile.png', fullPage: true });

  // Step 4: Why page
  console.log('\n--- Step 4: Why page ---');
  await dp.goto('http://localhost:4321/why');
  await dp.waitForLoadState('networkidle');
  await dp.screenshot({ path: './j1-03-why-desktop.png', fullPage: true });

  // Step 5: Check CTA visibility — can Alex easily find "Get Started" or "Pledge" or "Organize"?
  console.log('\n--- Step 5: CTA analysis ---');
  await dp.goto('http://localhost:4321');
  await dp.waitForLoadState('networkidle');

  const ctas = await dp.$$eval('a, button', els =>
    els.filter(el => {
      const text = el.textContent?.trim().toLowerCase() || '';
      return text.includes('get started') || text.includes('pledge') || text.includes('organizer') ||
             text.includes('donate') || text.includes('sign') || text.includes('browse');
    }).map(el => ({
      text: el.textContent?.trim(),
      tag: el.tagName,
      visible: (el as HTMLElement).offsetParent !== null,
    }))
  );
  console.log(`  CTAs found: ${JSON.stringify(ctas, null, 2)}`);

  // Step 6: Contact page — can they reach out?
  console.log('\n--- Step 6: Contact page ---');
  await dp.goto('http://localhost:4321/contact');
  await dp.waitForLoadState('networkidle');
  await dp.screenshot({ path: './j1-04-contact-desktop.png', fullPage: true });

  // Step 7: Check footer — trust signals, legal links
  console.log('\n--- Step 7: Footer analysis ---');
  await dp.goto('http://localhost:4321');
  await dp.waitForLoadState('networkidle');
  const footerLinks = await dp.$$eval('footer a', links =>
    links.map(l => ({ text: l.textContent?.trim(), href: (l as HTMLAnchorElement).href }))
  );
  console.log(`  Footer links: ${footerLinks.map(l => l.text).join(', ')}`);

  // Step 8: Drives page
  console.log('\n--- Step 8: Drives page ---');
  await dp.goto('http://localhost:4321/drives');
  await dp.waitForLoadState('networkidle');
  await dp.screenshot({ path: './j1-05-drives-desktop.png', fullPage: true });

  await browser.close();
  console.log('\n=== J1 COMPLETE ===\n');
})();

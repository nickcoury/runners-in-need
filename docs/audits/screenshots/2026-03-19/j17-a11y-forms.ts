import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ args: ['--dns-prefetch-disable'] });
  const page = await browser.newPage();
  const base = 'https://runnersinneed.com';

  // 1. Home page — keyboard navigation
  console.log('=== KEYBOARD NAVIGATION ===');
  await page.goto(base, { timeout: 30000 });
  await page.waitForTimeout(3000);

  // Tab through elements and check focus visibility
  const focusableElements: string[] = [];
  for (let i = 0; i < 20; i++) {
    await page.keyboard.press('Tab');
    const focused = await page.evaluate(() => {
      const el = document.activeElement;
      if (!el) return 'none';
      const tag = el.tagName.toLowerCase();
      const text = el.textContent?.trim().slice(0, 40) || '';
      const role = el.getAttribute('role') || '';
      const ariaLabel = el.getAttribute('aria-label') || '';
      const styles = window.getComputedStyle(el);
      const hasVisibleFocus = styles.outlineStyle !== 'none' || 
        styles.boxShadow !== 'none' ||
        el.matches(':focus-visible');
      return `${tag}${role ? `[role=${role}]` : ''}: "${text || ariaLabel}" focus-visible: ${hasVisibleFocus}`;
    });
    focusableElements.push(focused);
  }
  console.log('  First 20 tab stops:');
  for (const el of focusableElements) {
    console.log(`    ${el}`);
  }

  // 2. Form validation — pledge form
  console.log('\n=== PLEDGE FORM VALIDATION ===');
  const needLink = await page.$('.need-card a[href^="/needs/"]');
  if (needLink) {
    const href = await needLink.getAttribute('href');
    await page.goto(`${base}${href}`, { timeout: 30000 });
    await page.waitForTimeout(3000);

    // Check form labels and required fields
    const formState = await page.evaluate(() => {
      const form = document.querySelector('form');
      if (!form) return { found: false };
      const inputs = form.querySelectorAll('input, textarea, select');
      const fields = Array.from(inputs).map(input => {
        const el = input as HTMLInputElement;
        const id = el.id || el.name;
        const label = document.querySelector(`label[for="${id}"]`);
        return {
          name: el.name || el.id || el.type,
          type: el.type,
          required: el.required,
          hasLabel: !!label,
          labelText: label?.textContent?.trim(),
          ariaLabel: el.getAttribute('aria-label'),
          placeholder: el.placeholder,
          hidden: el.type === 'hidden' || (el as HTMLElement).offsetHeight === 0,
        };
      });
      return { found: true, fields };
    });
    console.log('  Pledge form fields:');
    if (formState.found && 'fields' in formState) {
      for (const f of formState.fields as any[]) {
        if (f.hidden) continue;
        const labelStatus = f.hasLabel ? `label: "${f.labelText}"` : f.ariaLabel ? `aria-label: "${f.ariaLabel}"` : 'NO LABEL';
        console.log(`    ${f.name} (${f.type}) ${f.required ? '[required]' : ''} ${labelStatus}`);
      }
    }
  }

  // 3. Color contrast — check key text elements
  console.log('\n=== COLOR CONTRAST SPOT CHECK ===');
  await page.goto(base, { timeout: 30000 });
  await page.waitForTimeout(3000);

  const contrastChecks = await page.evaluate(() => {
    function getLuminance(r: number, g: number, b: number) {
      const [rs, gs, bs] = [r, g, b].map(c => {
        c = c / 255;
        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
      });
      return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
    }

    function getContrastRatio(l1: number, l2: number) {
      const lighter = Math.max(l1, l2);
      const darker = Math.min(l1, l2);
      return (lighter + 0.05) / (darker + 0.05);
    }

    function parseColor(color: string): [number, number, number] | null {
      const match = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
      if (!match) return null;
      return [parseInt(match[1]), parseInt(match[2]), parseInt(match[3])];
    }

    const elements = [
      { selector: '.text-gray-500', desc: 'gray-500 subtitle text' },
      { selector: '.text-gray-600', desc: 'gray-600 body text' },
      { selector: 'a[href="/why"]', desc: 'nav link' },
      { selector: '.text-sm.text-gray-400', desc: 'gray-400 small text' },
    ];

    return elements.map(({ selector, desc }) => {
      const el = document.querySelector(selector) as HTMLElement;
      if (!el) return { desc, result: 'not found' };
      const style = window.getComputedStyle(el);
      const fg = parseColor(style.color);
      // Walk up to find background
      let bgEl: HTMLElement | null = el;
      let bg: [number, number, number] | null = null;
      while (bgEl) {
        const bgColor = parseColor(window.getComputedStyle(bgEl).backgroundColor);
        if (bgColor && (bgColor[0] !== 0 || bgColor[1] !== 0 || bgColor[2] !== 0 || window.getComputedStyle(bgEl).backgroundColor !== 'rgba(0, 0, 0, 0)')) {
          bg = bgColor;
          break;
        }
        bgEl = bgEl.parentElement;
      }
      if (!fg || !bg) return { desc, result: 'could not parse colors' };
      const fgL = getLuminance(...fg);
      const bgL = getLuminance(...bg);
      const ratio = getContrastRatio(fgL, bgL);
      const fontSize = parseFloat(style.fontSize);
      const isBold = parseInt(style.fontWeight) >= 700;
      const isLargeText = fontSize >= 24 || (fontSize >= 18.66 && isBold);
      const passAA = isLargeText ? ratio >= 3 : ratio >= 4.5;
      return {
        desc,
        fg: style.color,
        bg: `rgb(${bg.join(',')})`,
        ratio: ratio.toFixed(2),
        passAA,
        fontSize: `${fontSize}px`,
      };
    });
  });
  console.log('  Color contrast results:');
  for (const c of contrastChecks) {
    if ('ratio' in c) {
      console.log(`    ${c.passAA ? '✓' : '✗'} ${c.desc}: ${c.ratio}:1 (${c.fg} on ${c.bg}, ${c.fontSize}) ${c.passAA ? 'PASS' : 'FAIL'}`);
    } else {
      console.log(`    ? ${c.desc}: ${c.result}`);
    }
  }

  // 4. Check ARIA landmarks
  console.log('\n=== ARIA LANDMARKS ===');
  const landmarks = await page.evaluate(() => {
    const roles = ['banner', 'navigation', 'main', 'contentinfo', 'complementary', 'search'];
    const found: { role: string; tag: string; label?: string }[] = [];
    for (const role of roles) {
      const els = document.querySelectorAll(`[role="${role}"], ${role === 'banner' ? 'header' : role === 'navigation' ? 'nav' : role === 'main' ? 'main' : role === 'contentinfo' ? 'footer' : role === 'search' ? '[role="search"]' : `[role="${role}"]`}`);
      els.forEach(el => {
        found.push({
          role,
          tag: el.tagName.toLowerCase(),
          label: el.getAttribute('aria-label') || el.getAttribute('aria-labelledby') || undefined,
        });
      });
    }
    return found;
  });
  for (const l of landmarks) {
    console.log(`  ${l.role}: <${l.tag}>${l.label ? ` "${l.label}"` : ''}`);
  }

  // 5. Image alt text
  console.log('\n=== IMAGE ALT TEXT ===');
  const images = await page.$$eval('img', imgs => 
    imgs.map(img => ({
      src: img.src.split('/').pop(),
      alt: img.alt,
      hasAlt: img.hasAttribute('alt'),
      decorative: img.getAttribute('role') === 'presentation',
    }))
  );
  for (const img of images) {
    const status = img.hasAlt ? (img.alt ? `alt="${img.alt}"` : 'alt="" (decorative)') : 'NO ALT';
    console.log(`  ${img.decorative ? '(decorative)' : status} — ${img.src}`);
  }

  await browser.close();
  console.log('\n=== A11Y AUDIT COMPLETE ===');
})();

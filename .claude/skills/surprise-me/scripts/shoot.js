// shoot.js - headless screenshot for the /surprise-me acuity loop.
// Usage: node shoot.js <file-or-url> <out.png> [--mobile] [--wait ms] [--full]
// Writes the screenshot and prints any page JS errors (a blank canvas usually means one).
// Requires Playwright: `npm install playwright` then `npx playwright install chromium`.
let chromium;
try { ({ chromium } = require('playwright')); }
catch { ({ chromium } = require('playwright-core')); }

(async () => {
  const args = process.argv.slice(2);
  if (args.length < 2) { console.log('usage: node shoot.js <file-or-url> <out.png> [--mobile] [--wait ms] [--full]'); process.exit(1); }
  const [target, out] = args;
  const mobile = args.includes('--mobile');
  const full = args.includes('--full');
  const waitIdx = args.indexOf('--wait');
  const wait = waitIdx > -1 ? parseInt(args[waitIdx + 1], 10) : 1600;
  const url = /^https?:/i.test(target) ? target : 'file:///' + target.replace(/\\/g, '/');

  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: mobile ? { width: 390, height: 844 } : { width: 1440, height: 900 } });
  const errors = [];
  page.on('pageerror', e => errors.push('PAGEERROR: ' + e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push('CONSOLE: ' + m.text()); });
  await page.goto(url, { waitUntil: 'load' });
  await page.waitForTimeout(wait); // let fonts/animations settle
  await page.screenshot({ path: out, fullPage: full });
  console.log('saved: ' + out + (mobile ? ' (mobile 390px)' : ' (desktop 1440px)'));
  console.log(errors.length ? errors.join('\n') : 'no js errors');
  await browser.close();
})();

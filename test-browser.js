const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', err => {
    errors.push('PageError: ' + err.message);
  });
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push('ConsoleError: ' + msg.text());
    }
  });

  try {
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle0', timeout: 15000 });
    console.log("PAGE LOADED. ERRORS FOUND:");
    console.log(JSON.stringify(errors, null, 2));
  } catch (err) {
    console.log("FAILED TO LOAD:", err.message);
  } finally {
    await browser.close();
  }
})();

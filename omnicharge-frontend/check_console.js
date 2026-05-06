const puppeteer = require('puppeteer');

(async () => {
  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
    page.on('requestfailed', request => console.log('REQUEST FAILED:', request.url(), request.failure().errorText));

    await page.goto('http://localhost:4200/login', {waitUntil: 'networkidle0'});
    console.log('Login page loaded. URL:', page.url());
    
    // Check if body is clickable
    const bodyBox = await page.evaluate(() => {
      const el = document.elementFromPoint(100, 100);
      return el ? el.className + ' ' + el.tagName : 'NONE';
    });
    console.log('Element at (100, 100):', bodyBox);

    await browser.close();
  } catch (e) {
    console.error(e);
  }
})();

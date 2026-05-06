const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('LOG:', msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.message));
  
  await page.goto('http://localhost:4200/login', {waitUntil: 'networkidle0'});
  const bodyHTML = await page.evaluate(() => document.body.innerHTML);
  console.log('Body length:', bodyHTML.length);
  
  await browser.close();
})();

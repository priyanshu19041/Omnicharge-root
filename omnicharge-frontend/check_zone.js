const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto('http://localhost:4200/dashboard', {waitUntil: 'networkidle0'});
  const hasZone = await page.evaluate(() => typeof window.Zone !== 'undefined');
  console.log('Has Zone.js?', hasZone);
  await browser.close();
})();

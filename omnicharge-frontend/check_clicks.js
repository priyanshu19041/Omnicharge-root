const puppeteer = require('puppeteer');

(async () => {
  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto('http://localhost:4200/dashboard', {waitUntil: 'networkidle0'});
    
    // Evaluate if the "New Recharge" button is clickable
    const btn = await page.$('a.btn-primary');
    if (btn) {
       console.log('Button found!');
       const box = await btn.boundingBox();
       console.log('Button box:', box);
       
       const elAtPoint = await page.evaluate((x, y) => {
         const el = document.elementFromPoint(x, y);
         return el ? el.tagName + '.' + el.className : 'NONE';
       }, box.x + box.width/2, box.y + box.height/2);
       console.log('Element at button center:', elAtPoint);
    } else {
       console.log('Button not found');
    }

    await browser.close();
  } catch (e) {
    console.error(e);
  }
})();

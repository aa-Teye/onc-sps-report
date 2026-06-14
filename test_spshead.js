const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  page.on('pageerror', err => console.log('PAGEERROR:', err.message));

  const filePath = 'file://' + path.resolve(__dirname, 'admin.html').replace(/\\/g, '/');
  await page.goto(filePath);

  await page.selectOption('#roleSelect', 'spshead');
  await page.fill('#pinInput', '3000');
  await page.click('.login-btn');
  await page.waitForTimeout(2000);

  // Click on "SPS Reports" sidebar tab
  await page.evaluate(() => {
    var btn = document.querySelector('.tab-btn[onclick*="switchTab(\'reports\'"]');
    console.log('reports btn found:', !!btn, btn && btn.style.display);
    if (btn) btn.click();
  });
  await page.waitForTimeout(500);

  const activePanel = await page.evaluate(() => {
    var p = document.querySelector('.tab-panel.active');
    return p ? p.id : 'none';
  });
  console.log('Active panel after clicking SPS Reports:', activePanel);

  const tabTitle = await page.evaluate(() => document.getElementById('tabTitle').textContent);
  console.log('Tab title:', tabTitle);

  const reportsTitle = await page.evaluate(() => {
    var el = document.getElementById('reportsTitle');
    return el ? el.textContent : 'N/A';
  });
  console.log('reportsTitle h2:', reportsTitle);

  const mcReportsVisible = await page.evaluate(() => {
    var p = document.getElementById('panel-mc-reports');
    return p ? getComputedStyle(p).display + ' / active=' + p.classList.contains('active') : 'N/A';
  });
  console.log('panel-mc-reports:', mcReportsVisible);

  const reportsVisible = await page.evaluate(() => {
    var p = document.getElementById('panel-reports');
    return p ? getComputedStyle(p).display + ' / active=' + p.classList.contains('active') : 'N/A';
  });
  console.log('panel-reports:', reportsVisible);

  await browser.close();
})();

const fs = require('fs');
const https = require('https');

// Read churchData.js
const code = fs.readFileSync('churchData.js', 'utf8');

// Evaluate churchData to get window.CHURCH_DATA
const sandbox = { window: {} };
const fn = new Function('window', code);
fn(sandbox.window);

const churchData = sandbox.window.CHURCH_DATA;
console.log('SPS Shepherds count:', churchData.spsShepherds.length);
console.log('MC Shepherds count:', churchData.mcShepherds.length);

const payload = JSON.stringify({
  action: 'seedDatabaseRoster',
  spsShepherds: churchData.spsShepherds,
  mcShepherds: churchData.mcShepherds
});

const scriptUrl = 'https://script.google.com/macros/s/AKfycbzl5Nd0kLD08Q7vowaTEHG2hjybQRlctfx97xOfB07N9e8VKUKXMQ-wCfFz5ztrmADF/exec';

function postData(url, data, callback) {
  const parsed = new URL(url);
  const req = https.request({
    hostname: parsed.hostname,
    path: parsed.pathname + parsed.search,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(data)
    }
  }, (res) => {
    if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
      // Follow redirect
      https.get(res.headers.location, (redirectRes) => {
        let body = '';
        redirectRes.on('data', chunk => body += chunk);
        redirectRes.on('end', () => callback(null, body));
      }).on('error', callback);
      return;
    }
    let body = '';
    res.on('data', chunk => body += chunk);
    res.on('end', () => callback(null, body));
  });

  req.on('error', callback);
  req.write(data);
  req.end();
}

console.log('Posting seed data to Google Apps Script...');
postData(scriptUrl, payload, (err, response) => {
  if (err) {
    console.error('Migration error:', err);
  } else {
    console.log('Migration response:', response);
  }
});

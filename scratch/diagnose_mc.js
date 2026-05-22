const fs = require('fs');
const html = fs.readFileSync('admin.html', 'utf8');

// 1. Check renderExport - what does it access?
console.log('=== renderExport() body ===');
const expStart = html.indexOf('function renderExport()');
const expEnd = html.indexOf('\n      }', expStart) + 9;
console.log(html.substring(expStart, expEnd));

// Does contact-table exist?
console.log('\n=== Does id="contact-table" exist? ===');
console.log(html.includes('id="contact-table"') ? 'YES' : 'NO - THIS IS THE CRASH!');

// 2. Check renderOverview - does it try to access non-existent elements?
console.log('\n=== Elements renderOverview() accesses that may not exist ===');
const ovStart = html.indexOf('function renderOverview()');
const ovEnd = html.indexOf('\n      function renderShepherds', ovStart);
const ovFn = html.substring(ovStart, ovEnd);
const ovIds = [...new Set(ovFn.match(/getElementById\(['"]([^'"]+)['"]\)/g) || [])];
ovIds.forEach(call => {
  const id = call.match(/['"]([^'"]+)['"]/)[1];
  const exists = html.includes(`id="${id}"`);
  console.log(`  ${exists ? '✅' : '❌ MISSING'}: ${id}`);
});

// 3. Check renderShepherds
console.log('\n=== Elements renderShepherds() accesses ===');
const shStart = html.indexOf('function renderShepherds()');
const shEnd = html.indexOf('\n      function toggleShepCard', shStart);
const shFn = html.substring(shStart, shEnd);
const shIds = [...new Set(shFn.match(/getElementById\(['"]([^'"]+)['"]\)/g) || [])];
shIds.forEach(call => {
  const id = call.match(/['"]([^'"]+)['"]/)[1];
  const exists = html.includes(`id="${id}"`);
  console.log(`  ${exists ? '✅' : '❌ MISSING'}: ${id}`);
});

// 4. Check renderMembers
console.log('\n=== Elements renderMembers() accesses ===');
const memStart = html.indexOf('function renderMembers()');
const memEnd = html.indexOf('\n      function renderReports', memStart);
const memFn = html.substring(memStart, memEnd);
const memIds = [...new Set(memFn.match(/getElementById\(['"]([^'"]+)['"]\)/g) || [])];
memIds.forEach(call => {
  const id = call.match(/['"]([^'"]+)['"]/)[1];
  const exists = html.includes(`id="${id}"`);
  console.log(`  ${exists ? '✅' : '❌ MISSING'}: ${id}`);
});

// 5. Check renderTopics and renderAttendance
console.log('\n=== Elements renderTopics() accesses ===');
const topStart = html.indexOf('function renderTopics()');
const topEnd = html.indexOf('\n      function renderAttendance', topStart);
const topFn = html.substring(topStart, topEnd);
const topIds = [...new Set(topFn.match(/getElementById\(['"]([^'"]+)['"]\)/g) || [])];
topIds.forEach(call => {
  const id = call.match(/['"]([^'"]+)['"]/)[1];
  const exists = html.includes(`id="${id}"`);
  console.log(`  ${exists ? '✅' : '❌ MISSING'}: ${id}`);
});

// 6. Show what's REALLY missing globally
console.log('\n=== ALL getElementById calls with MISSING elements ===');
const allGetEl = html.match(/getElementById\(['"]([^'"]+)['"]\)/g) || [];
const uniqueCalls = [...new Set(allGetEl)];
uniqueCalls.forEach(call => {
  const id = call.match(/['"]([^'"]+)['"]/)[1];
  if (!html.includes(`id="${id}"`)) {
    // Find line number
    const idx = html.indexOf(call);
    const line = html.substring(0, idx).split('\n').length;
    console.log(`  ❌ Line ${line}: getElementById("${id}") - NO matching id="${id}" in HTML`);
  }
});

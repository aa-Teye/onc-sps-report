const fs = require('fs');
let html = fs.readFileSync('admin.html', 'utf8');

// 1. Replace the old .shimmer CSS
const newCss = `.shimmer {
      background: linear-gradient(90deg, 
        #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
      background-size: 200% 100%;
      animation: shimmer 1.5s infinite;
      border-radius: 8px;
      color: transparent !important;
      min-width: 60px;
      display: inline-block;
    }

    @keyframes shimmer {
      0% { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }`;

html = html.replace(/\.shimmer \{[\s\S]*?@keyframes shimmer \{[\s\S]*?\}/, newCss);

// 2. Add shimmer class to HTML elements
const statIds = [
  'statTotal', 'statContacted', 'statPrayer', 'statMissed', 'statBibleCoverage', 'statShepherds',
  'mc-stat-sessions', 'mc-stat-reported', 'mc-stat-attendance', 'mc-stat-prayer', 'mc-stat-souls', 'mc-stat-coverage'
];

statIds.forEach(id => {
  // we look for id="idName" and add class="shimmer"
  const regex = new RegExp(`id="${id}"([^>]*)>`, 'g');
  html = html.replace(regex, (match, rest) => {
    if (rest.includes('class=')) {
      return match.replace(/class="([^"]*)"/, `class="$1 shimmer"`);
    } else {
      return `id="${id}" class="shimmer"${rest}>`;
    }
  });
});

// 3. Update checkPin function
const oldCheckPinRegex = /function checkPin\(\) \{[\s\S]*?\}\s*function logout\(\)/;
const newCheckPin = `function checkPin() {
        var pin = document.getElementById('pinInput').value;
        var storedPin = localStorage.getItem('onc_pin') || '2500';
        if (pin === storedPin) {
          document.getElementById('loginScreen').style.display = 'none';
          document.getElementById('dashboard').style.display = 'block';
          
          // Load cached data instantly
          var cachedReports = localStorage.getItem('onc_cached_reports');
          var cachedMc = localStorage.getItem('onc_cached_mc_reports');
          if (cachedReports) {
            allReports = JSON.parse(cachedReports);
            allMicrochurchReports = cachedMc ? JSON.parse(cachedMc) : [];
            renderAll();
          }
          
          // Then fetch fresh data
          loadAll();
          keepWarm();
          setInterval(loadAll, 120000);
          setInterval(keepWarm, 4 * 60 * 1000);
          
        } else {
          document.getElementById('loginError').style.display = 'block';
          document.getElementById('pinInput').value = '';
          document.getElementById('pinInput').focus();
        }
      }

      function logout()`;

html = html.replace(oldCheckPinRegex, newCheckPin);

// Write back
fs.writeFileSync('admin.html', html);
console.log('Successfully fixed shimmer and checkPin');

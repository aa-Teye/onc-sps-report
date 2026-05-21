const fs = require('fs');
const lines = fs.readFileSync('admin.html', 'utf8').split('\n');
lines.forEach((l, i) => {
  if(l.includes('function renderExport(') || 
     l.includes('function renderMcShepherds(') || 
     l.includes('id="panel-mc-shepherds"') || 
     l.includes('function renderAll(')) {
    console.log(i + 1, l.trim());
  }
});

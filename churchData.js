// ONC Church Data — Dynamic Live Bridge
// Replaces static hardcoded rosters with dynamic Google Sheets database feed.
// Single Source of Truth: Google Sheets backend.
(function() {
  window.CHURCH_DATA = window.CHURCH_DATA || {
    spsShepherds: [],
    mcShepherds: [],
    zones: [
      { name: "Zone 1" },
      { name: "Zone 2" },
      { name: "Zone 3" },
      { name: "Zone 4" },
      { name: "Zone 5" },
      { name: "Zone 6" }
    ]
  };

  // Populate from local cache immediately (0ms instant boot)
  try {
    var cached = JSON.parse(localStorage.getItem('onc_cached_shepherds') || '[]');
    if (Array.isArray(cached) && cached.length > 0) {
      cached.forEach(function(r) {
        if (!r.Name) return;
        if (r.Type === 'MC') {
          var exists = window.CHURCH_DATA.mcShepherds.find(function(s) { return s.name === r.Name; });
          if (!exists) {
            window.CHURCH_DATA.mcShepherds.push({ name: r.Name, microchurch: r.ZoneOrGroup || '', contact: r.Contact || '', members: [] });
          } else if (r.ZoneOrGroup) {
            exists.microchurch = r.ZoneOrGroup;
          }
        } else {
          var existsSps = window.CHURCH_DATA.spsShepherds.find(function(s) { return s.name === r.Name; });
          if (!existsSps) {
            window.CHURCH_DATA.spsShepherds.push({ name: r.Name, zone: r.ZoneOrGroup || '', contact: r.Contact || '', members: [] });
          } else if (r.ZoneOrGroup) {
            existsSps.zone = r.ZoneOrGroup;
          }
        }
      });
    }
  } catch (e) {}
})();
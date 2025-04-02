import { initMap, addMarkers, removeMarkers } from './map.js';
import { filterFarms } from './filter.js';

let map = initMap();
let allFarms = [];

fetch('/api/farms')
  .then(res => res.json())
  .then(data => {
    console.log('[✅ DATA LOADED]', data);
    allFarms = data;
    updateMap(); // Initial render
  })
  .catch(err => {
    console.error('[❌ FETCH ERROR] Could not load farms:', err);
  });

function updateMap() {
  const selected = Array.from(document.querySelectorAll('input[type=checkbox]:checked'))
    .map(cb => cb.id.toLowerCase());

  const filteredFarms = filterFarms(allFarms, selected);

  console.log('[✅ FILTER] Showing farms:', filteredFarms.map(f => f.name));

  removeMarkers();
  addMarkers(filteredFarms);
}

document.querySelectorAll('input[type=checkbox]').forEach(cb => {
  cb.addEventListener('change', updateMap);
});

// client/main.js

import { initMap, addMarkers } from './map.js';
import { filterFarms } from './filter.js';
import { showDetails, hideDetails } from './ui.js';

// Initialize the map
const map = initMap();

// Add Controls to the map
map.addControl(new mapboxgl.NavigationControl(), 'bottom-right');
map.addControl(new mapboxgl.FullscreenControl(), 'bottom-right');

let farms = [];
let markers = [];

// Fetch farms data from the API
fetch('http://localhost:5001/api/farms')
  .then((response) => response.json())
  .then((data) => {
    farms = data;
    markers = addMarkers(map, farms);

    // Event listener for checkbox filtering
    document.querySelectorAll('.icon-item input').forEach((input) => {
      input.addEventListener('change', () => {
        const selectedProducts = Array.from(
          document.querySelectorAll('.icon-item input:checked')
        ).map((input) => input.id);
        const filteredFarms = filterFarms(farms, selectedProducts);

        markers.forEach((marker) => marker.remove());
        markers = addMarkers(map, filteredFarms);
      });
    });

    // Set global functions for showing/hiding details
    window.showDetails = (id) => showDetails(id, farms);
    window.hideDetails = hideDetails;

    // Load markers when the map is ready
    map.on('load', () => {
      addMarkers(map, farms);
    });
  })
  .catch((error) => {
    console.error('Error fetching farms data:', error);
  });

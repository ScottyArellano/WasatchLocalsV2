// client/main.js

import { initMap, addMarkers } from './map.js';
import { filterFarms } from './filter.js';
import { showDetails, hideDetails } from './ui.js';

// Initialize the map
const map = initMap();

// Add Controls to the map
if (typeof mapboxgl !== 'undefined') {
  map.addControl(new mapboxgl.NavigationControl(), 'bottom-right');
  map.addControl(new mapboxgl.FullscreenControl(), 'bottom-right');
} else {
  console.error('Mapbox GL is not defined. Make sure you include the Mapbox script in your HTML file.');
}

let farms = [];
let markers = [];

// Include both 'localhost' and '127.0.0.1' in your condition
const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

const apiUrl = isLocalhost
  ? 'http://localhost:5500/api/farms'   // Local development API URL
  : 'https://wasatch-homegrown.onrender.com/api/farms';  // Production API URL

fetch(apiUrl, {
  headers: {
    'Content-Type': 'application/json',
  },
})
  .then((response) => {
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    return response.json();
  })
  .then((data) => {
    farms = data; // Store the farm data
    markers = addMarkers(map, farms); // Add markers to the map

    // Log fetched farm data to check the structure
    console.log('Fetched farm data:', farms);

    // Event listener for checkbox filtering
    document.querySelectorAll('.icon-item input').forEach((input) => {
      input.addEventListener('change', () => {
        const selectedProducts = Array.from(
          document.querySelectorAll('.icon-item input:checked')
        ).map((input) => input.id);
        const filteredFarms = filterFarms(farms, selectedProducts);

        // Log filtered farms for debugging purposes
        console.log('Filtered farms:', filteredFarms);

        // Remove existing markers
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
    // Adding an alert for easier notice during development
    alert('Error fetching farms data. Please check console for details.');
  });

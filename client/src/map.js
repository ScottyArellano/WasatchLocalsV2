import mapboxgl from 'mapbox-gl';
import { productColorMap } from './farms.js';
import { createPopup, initCarousel } from './ui.js';

let map;
let currentMarkers = [];
let currentPopup = null;

export function initMap() {
  mapboxgl.accessToken = 'pk.eyJ1Ijoic2NvdHR5MzMiLCJhIjoiY20wbGowZnUzMDY2MTJxb3JjaWJ2dGFwNSJ9.56ueUqG22q5Qzp0FSr8YAA';

  map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/light-v10',
    center: [-111.441191, 40.507182],
    zoom: 10,
    scrollZoom: true,
    dragPan: true,
    keyboard: false,
    touchZoomRotate: false,
    doubleClickZoom: false
  });

  map.addControl(new mapboxgl.GeolocateControl({
    positionOptions: { enableHighAccuracy: true },
    trackUserLocation: true,
    showUserHeading: true
  }));

  return map;
}

export function addMarkers(farms) {
  console.log('[🧪 addMarkers] Incoming farms:', farms);

  farms.forEach(farm => {
    const primaryProduct = farm.products[0];
    const color = productColorMap[primaryProduct] || "#000000";

    // ✅ Normalize location data
    let coords = null;
    if (Array.isArray(farm.location)) {
      coords = farm.location;
    } else if (
      farm.location &&
      farm.location.type === 'Point' &&
      Array.isArray(farm.location.coordinates)
    ) {
      coords = farm.location.coordinates;
    }

    // ❌ Skip invalid coords
    if (!coords || coords.length !== 2 || typeof coords[0] !== 'number') {
      console.warn(`❌ Skipping farm due to invalid coordinates:`, farm);
      return;
    }

    console.log(`[📍 ${farm.name}] location:`, farm.location);
    console.log(`[📍 ${farm.name}] coords used:`, coords);

    // 🧭 Place Marker
    const marker = new mapboxgl.Marker({ color })
      .setLngLat(coords)
      .addTo(map);

    // 💬 Set up popup
    const popup = new mapboxgl.Popup({ offset: 25, closeButton: false, closeOnClick: true })
      .setHTML(createPopup(farm));

    marker.setPopup(popup);

    marker.getElement().addEventListener('click', () => {
      if (currentPopup && currentPopup.isOpen()) {
        currentPopup.remove();
      }
      currentPopup = popup;
      popup.addTo(map);
    });

    popup.on('open', () => {
      const popupElement = popup.getElement();
      initCarousel(popupElement);
    });

    currentMarkers.push(marker);
  });
}

export function removeMarkers() {
  currentMarkers.forEach(marker => marker.remove());
  currentMarkers = [];
}

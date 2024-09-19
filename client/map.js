import { productColorMap } from './farms.js';
import { createPopup, initCarousel } from './ui.js';

// Initialize the map
export function initMap() {
    mapboxgl.accessToken = 'pk.eyJ1Ijoic2NvdHR5MzMiLCJhIjoiY20wbGowZnUzMDY2MTJxb3JjaWJ2dGFwNSJ9.56ueUqG22q5Qzp0FSr8YAA';
    const map = new mapboxgl.Map({
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
    return map;
}

let currentPopup = null;

export function addMarkers(map, farms) {
    let markers = [];

    farms.forEach(farm => {
        const primaryProduct = farm.products[0];
        const color = productColorMap[primaryProduct] || "#000000";
        const marker = new mapboxgl.Marker({ color })
            .setLngLat(farm.location)
            .addTo(map);

        const popup = new mapboxgl.Popup({ offset: 25, closeButton: false, closeOnClick: true }) // Disable default close button
            .setHTML(createPopup(farm)); // Use your custom popup content

        // Attach the popup to the marker
        marker.setPopup(popup);

        marker.getElement().addEventListener('click', () => {
            // Close the current popup if it's open
            if (currentPopup && currentPopup.isOpen()) {
                currentPopup.remove(); // Close the currently open popup
            }

            // Set the new popup as the current one
            currentPopup = popup;

            // Open the new popup
            popup.addTo(map);
        });

        // Initialize the carousel when the popup opens
        popup.on('open', () => {
            const popupElement = popup.getElement();
            initCarousel(popupElement);
        });

        markers.push(marker);
    });

    return markers;
}

const emojiMap = {
    "beef": "🐄",
    "dairy": "🧀",
    "meat chicken": "🐓",
    "eggs": "🥚",
    "pork": "🐖",
    "produce": "🥦",
    "fruit": "🍎",
    "home made": "🧼",
    "baked goods": "🧁",
    "other": "🌼"
  };
  
  export function createPopup(farm) {
    const emojiProducts = farm.products.map(
      p => `${emojiMap[p.toLowerCase()] || ''} ${p}`
    );
  
    return `
      <div class="popup-container" onclick="showDetails(${farm.id})">
        <div class="popup-close" onclick="event.stopPropagation(); this.closest('.mapboxgl-popup').remove()">&#10005;</div>
        
        <div class="carousel">
          ${farm.photos.map((photo, index) => `
            <div class="carousel-slide ${index === 0 ? 'active' : ''}">
              <img src="${photo}" alt="${farm.name}">
            </div>
          `).join('')}
          <button class="prev" onclick="event.stopPropagation();">&#10094;</button>
          <button class="next" onclick="event.stopPropagation();">&#10095;</button>
        </div>
  
        <div class="popup-info">
          <h3>${farm.name}</h3>
          <p>${emojiProducts.join(", ")}</p>
        </div>
      </div>
    `;
  }
  
  export function showDetails(id, farms) {
    const farm = farms.find(farm => farm.id === id);
    if (farm) {
      const emojiProducts = farm.products.map(
        p => `${emojiMap[p.toLowerCase()] || ''} ${p}`
      );
  
      const detailsPanel = document.getElementById('details-panel');
      detailsPanel.innerHTML = `
        <div class="details-carousel">
          ${farm.photos.map(url => `
            <div class="carousel-slide">
              <img src="${url}" alt="${farm.name}">
            </div>
          `).join('')}
          <button class="prev">&#10094;</button>
          <button class="next">&#10095;</button>
        </div>
        <h2>${farm.name}</h2>
        <p><strong>Products:</strong> ${emojiProducts.join(', ')}</p>
        <p>Website: <a href="${farm.website}" target="_blank">${farm.website}</a></p>
        <p>Phone: <a href="tel:${farm.phone}">${farm.phone}</a></p>
        <p><strong>About Us:</strong> ${farm.bio}</p>
        <button onclick="hideDetails()">Close</button>
      `;
      detailsPanel.style.display = 'block';
      detailsPanel.classList.add('active');
      initCarousel(detailsPanel.querySelector('.details-carousel'));
    }
  }
  export function initCarousel(container) {
    const slides = container.querySelectorAll('.carousel-slide');
    let currentIndex = 0;
  
    function showSlide(index) {
      slides.forEach((slide, idx) => {
        slide.classList.remove('active');
        if (idx === index) {
          slide.classList.add('active');
        }
      });
    }
  
    container.querySelector('.prev')?.addEventListener('click', (event) => {
      event.stopPropagation();
      currentIndex = (currentIndex > 0) ? currentIndex - 1 : slides.length - 1;
      showSlide(currentIndex);
    });
  
    container.querySelector('.next')?.addEventListener('click', (event) => {
      event.stopPropagation();
      currentIndex = (currentIndex < slides.length - 1) ? currentIndex + 1 : 0;
      showSlide(currentIndex);
    });
  
    showSlide(currentIndex);
  }
  
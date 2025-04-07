import { initMap, addMarkers, removeMarkers } from './map.js';
import { filterFarms } from './filter.js';
import mapboxgl from 'mapbox-gl';
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';

mapboxgl.accessToken = 'pk.eyJ1Ijoic2NvdHR5MzMiLCJhIjoiY20wbGowZnUzMDY2MTJxb3JjaWJ2dGFwNSJ9.56ueUqG22q5Qzp0FSr8YAA';

const geocoder = new MapboxGeocoder({
  accessToken: mapboxgl.accessToken,
  types: 'address',
  placeholder: 'Enter your farm address',
  mapboxgl: mapboxgl,
});
geocoder.addTo('#geocoder');

geocoder.on('result', (e) => {
  const coords = e.result.center;
  document.getElementById('address-coordinates').value = JSON.stringify(coords);
});

let map = initMap();
let allFarms = [];

async function loadFarms() {
  try {
    const res = await fetch('/api/farms');
    const data = await res.json();
    allFarms = data.filter(f => f.isApproved);
    updateMap();
  } catch (err) {
    console.error('[❌ FETCH ERROR] Could not load farms:', err);
  }
}

function updateMap() {
  const selected = Array.from(document.querySelectorAll('input[type=checkbox]:checked'))
  .map(cb => cb.value.toLowerCase().trim());
  console.log('[🧪 Selected Filters]:', selected);

  const filteredFarms = filterFarms(allFarms, selected);

  console.log('[✅ FILTER] Showing farms:', filteredFarms.map(f => f.name));
  console.log('🧭 Locations:', filteredFarms.map(f => f.location));
  console.log('[🧪 Raw All Farms]:', allFarms);
  console.log('[🧪 All Farm Locations]:', allFarms.map(f => f.location));
  console.log('[🔎 Filtered Farms]:', filteredFarms.map(f => f.name));
console.log('[🧭 Locations After Filter]:', filteredFarms.map(f => f.location));
console.log('[🧪 Comparing selected vs farm.products]');
allFarms.forEach(farm => {
  console.log(farm.name, '→', farm.products);
});


  removeMarkers();
  addMarkers(filteredFarms);
  
}

loadFarms();
document.querySelectorAll('input[type=checkbox]').forEach(cb => {
  cb.addEventListener('change', updateMap);
});

const sections = {
  home: document.getElementById('map-container'),
  about: document.getElementById('about-section'),
  'add-farm': document.getElementById('add-farm-section'),
  admin: document.getElementById('admin-section'),
};

const adminModal = document.createElement('div');
adminModal.id = 'admin-password-modal';
adminModal.style = `
  display: none;
  position: fixed;
  top: 50%; left: 50%;
  transform: translate(-50%, -50%);
  background: white;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.2);
`;
adminModal.innerHTML = `
  <h3>Admin Access</h3>
  <input type="password" id="admin-password-input" placeholder="Enter password" />
  <button id="submit-admin-password">Submit</button>
  <button id="cancel-admin-password">Cancel</button>
`;
document.body.appendChild(adminModal);

function promptAdminPassword(callback) {
  adminModal.style.display = 'block';
  document.getElementById('submit-admin-password').onclick = () => {
    const input = document.getElementById('admin-password-input').value;
    adminModal.style.display = 'none';
    callback(input);
  };
  document.getElementById('cancel-admin-password').onclick = () => {
    adminModal.style.display = 'none';
    callback(null);
  };
}

window.showSection = function (sectionId) {
  console.log(`🔁 Navigating to section: ${sectionId}`);
  Object.values(sections).forEach(sec => (sec.style.display = 'none'));

  if (sectionId === 'admin' && !localStorage.getItem('adminToken')) {
    promptAdminPassword(password => {
      if (password !== 'letmein') {
        alert('❌ Incorrect code');
        console.log('🔒 Admin access blocked');
        return;
      }
      localStorage.setItem('adminToken', 'true');
      showSection(sectionId);
    });
    return;
  }

  const section = sections[sectionId];
  if (section) {
    section.style.display = 'block';
    if (sectionId === 'admin') loadAdminFarms();
  }
};

document.addEventListener('click', async (e) => {
  if (e.target.matches('[data-route]')) {
    e.preventDefault();
    showSection(e.target.getAttribute('data-route'));
  }

  if (e.target.matches('#logout-admin')) {
    localStorage.removeItem('adminToken');
    alert('👋 Logged out of admin');
    showSection('home');
  }

  if (e.target.matches('.approve-btn')) {
    const id = e.target.dataset.id;
    await fetch(`/api/farms/${id}/approve`, { method: 'PATCH' });
    await loadFarms();
    updateMap();
    loadAdminFarms();
  }

  if (e.target.matches('.delete-btn')) {
    const id = e.target.dataset.id;
    if (!confirm('Are you sure you want to delete this farm?')) return;
    await fetch(`/api/farms/${id}`, { method: 'DELETE' });
    await loadFarms();
    updateMap();
    loadAdminFarms();
  }
});

const farmForm = document.getElementById('farmForm');
if (farmForm) {
  farmForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(farmForm);

    let coordinates;
    try {
      const loc = formData.get('location');
      coordinates = JSON.parse(loc);
      if (!Array.isArray(coordinates) || coordinates.length !== 2) {
        throw new Error('Invalid coordinates');
      }
    } catch {
      document.getElementById('formMessage').textContent = '❌ Please select a valid address from the dropdown.';
      return;
    }

    const products = Array.from(farmForm.querySelectorAll('input[name="products"]:checked'))
  .map(cb => cb.value.toLowerCase().trim());
  console.log('[🚀 Submitting Products]:', products);


    if (products.length === 0) {
      document.getElementById('formMessage').textContent = '❌ Please select at least one product.';
      return;
    }

    let website = formData.get('website').trim();
    if (website && !website.startsWith('http')) {
      website = 'https://www.' + website.replace(/^www\./, '');
    }

    const data = {
      name: formData.get('name'),
      bio: formData.get('bio'),
      email: formData.get('email'),
      phone: formData.get('phone'),
      website,
      products,
      location: {
        type: 'Point',
        coordinates: coordinates
      }
    };

    try {
      const res = await fetch('/api/farms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.message || 'Submission failed');

      document.getElementById('formMessage').textContent = '✅ Farm submitted successfully!';
      farmForm.reset();
    } catch (err) {
      console.error('[❌ Submit Error]', err);
      document.getElementById('formMessage').textContent = `❌ Error: ${err.message}`;
    }
  });
}

async function loadAdminFarms() {
  const adminList = document.getElementById('admin-list');
  if (!adminList) return;

  adminList.innerHTML = 'Loading...';
  try {
    const res = await fetch('/api/farms');
    const farms = await res.json();

    adminList.innerHTML = farms.map(farm => `
      <div class="admin-farm">
        <h4 contenteditable="true" data-field="name" data-id="${farm._id}">${farm.name}</h4>
        <div><strong>Products:</strong> <span contenteditable="true" data-field="products" data-id="${farm._id}">${farm.products.join(', ')}</span></div>
        <div><strong>Bio:</strong> <span contenteditable="true" data-field="bio" data-id="${farm._id}">${farm.bio || ''}</span></div>
        <div><strong>Email:</strong> <span contenteditable="true" data-field="email" data-id="${farm._id}">${farm.email || ''}</span></div>
        <div><strong>Phone:</strong> <span contenteditable="true" data-field="phone" data-id="${farm._id}">${farm.phone || ''}</span></div>
        <div><strong>Website:</strong> <span contenteditable="true" data-field="website" data-id="${farm._id}">${farm.website || ''}</span></div>
        <div><strong>Location:</strong> <span contenteditable="true" data-field="location" data-id="${farm._id}">${farm.location?.coordinates?.join(', ') || ''}</span></div>
        <p><strong>Approved:</strong> ${farm.isApproved ? '✅' : '❌'}</p>
        <button data-id="${farm._id}" class="approve-btn">Approve</button>
        <button data-id="${farm._id}" class="delete-btn">Delete</button>
      </div>
    `).join('') + `
      <div style="margin-top: 20px;">
        <button id="logout-admin">Log Out of Admin</button>
      </div>
    `;
    
    adminList.querySelectorAll('[contenteditable][data-id]').forEach(el => {
      el.addEventListener('blur', async () => {
        const id = el.dataset.id;
        const field = el.dataset.field;
        let value = el.innerText.trim();
    
        // Special cases
        if (field === 'products') {
          value = value.split(',').map(p => p.trim());
        }
    
        if (field === 'location') {
          try {
            value = value.split(',').map(n => parseFloat(n.trim()));
            if (!Array.isArray(value) || value.length !== 2 || value.some(isNaN)) throw new Error();
            value = { type: 'Point', coordinates: value };
          } catch {
            alert('❌ Invalid location format. Use format like: -111.47, 40.51');
            return;
          }
        }
    
        try {
          const res = await fetch(`/api/farms/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ [field]: value })
          });
          if (!res.ok) throw new Error('Failed to update');
          console.log(`✅ Saved ${field} for ${id}`);
          await loadFarms();
          updateMap();
        } catch (err) {
          console.error(`[❌ Save Error] ${field}`, err);
        }
      });
    });
    
  } catch (err) {
    adminList.innerHTML = '❌ Failed to load farms';
  }
}

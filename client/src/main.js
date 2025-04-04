import { initMap, addMarkers, removeMarkers } from './map.js';
import { filterFarms } from './filter.js';

let map = initMap();
let allFarms = [];

// Load farms from backend and update map
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

// Initial load
loadFarms();

// Filter and render map
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

// SPA routing logic
const sections = {
  home: document.getElementById('map-container'),
  about: document.getElementById('about-section'),
  'add-farm': document.getElementById('add-farm-section'),
  admin: document.getElementById('admin-section'),
};

// Admin password modal
const adminModal = document.createElement('div');
adminModal.id = 'admin-password-modal';
adminModal.style.display = 'none';
adminModal.style.position = 'fixed';
adminModal.style.top = '50%';
adminModal.style.left = '50%';
adminModal.style.transform = 'translate(-50%, -50%)';
adminModal.style.background = 'white';
adminModal.style.padding = '20px';
adminModal.style.boxShadow = '0 2px 10px rgba(0,0,0,0.2)';
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
    const route = e.target.getAttribute('data-route');
    showSection(route);
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
    loadAdminFarms();
  }

  if (e.target.matches('.delete-btn')) {
    const id = e.target.dataset.id;
    if (!confirm('Are you sure you want to delete this farm?')) return;
    await fetch(`/api/farms/${id}`, { method: 'DELETE' });
    await loadFarms();
    loadAdminFarms();
  }
});

// Add Farm form with geocoding
const farmForm = document.getElementById('farmForm');
if (farmForm) {
  farmForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(farmForm);
    const address = formData.get('address');

    const geocodeUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json?access_token=pk.eyJ1Ijoic2NvdHR5MzMiLCJhIjoiY20wbGowZnUzMDY2MTJxb3JjaWJ2dGFwNSJ9.56ueUqG22q5Qzp0FSr8YAA`;

    try {
      const geoRes = await fetch(geocodeUrl);
      const geoData = await geoRes.json();
      if (!geoData.features.length) throw new Error('Address not found');
      const coordinates = geoData.features[0].center;

      const data = {
        name: formData.get('name'),
        bio: formData.get('bio'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        website: formData.get('website'),
        products: formData.get('products').split(',').map(p => p.trim()),
        location: coordinates
      };

      const res = await fetch('/api/farms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
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

// Admin dashboard rendering + blur-based editing
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
        const value = el.innerText.trim();

        const body = {
          [field]: field === 'products'
            ? value.split(',').map(p => p.trim())
            : value
        };

        try {
          const res = await fetch(`/api/farms/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
          });
          if (!res.ok) throw new Error('Failed to update');
          console.log(`✅ Saved ${field} for ${id}`);
        } catch (err) {
          console.error(`[❌ Save Error] ${field}`, err);
        }
      });
    });

  } catch (err) {
    adminList.innerHTML = '❌ Failed to load farms';
  }
}

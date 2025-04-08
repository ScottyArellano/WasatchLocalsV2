import { initMap, addMarkers, removeMarkers } from './map.js';
import { filterFarms } from './filter.js';
import mapboxgl from 'mapbox-gl';
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
import { showDetails } from './ui.js';

window.showDetails = showDetails;

mapboxgl.accessToken = 'pk.eyJ1Ijoic2NvdHR5MzMiLCJhIjoiY20wbGowZnUzMDY2MTJxb3JjaWJ2dGFwNSJ9.56ueUqG22q5Qzp0FSr8YAA';

const geocoder = new MapboxGeocoder({
  accessToken: mapboxgl.accessToken,
  types: 'address',
  placeholder: 'Enter your farm address',
  mapboxgl,
});
geocoder.addTo('#geocoder');

geocoder.on('result', (e) => {
  const coords = e.result.center;
  document.getElementById('address-coordinates').value = JSON.stringify(coords);
});

let map = initMap();
let allFarms = [];
window.allFarms = allFarms;

async function loadFarms() {
  try {
    const res = await fetch('/api/farms');
    const data = await res.json();
    allFarms = data.filter(f => f.isApproved);
    window.allFarms = allFarms;
    updateMap();
  } catch (err) {
    console.error('[❌ FETCH ERROR] Could not load farms:', err);
  }
}


function updateMap() {
  const selected = Array.from(document.querySelectorAll('input[type=checkbox]:checked'))
    .map(cb => cb.value.toLowerCase().trim());
  const filteredFarms = filterFarms(allFarms, selected);

  removeMarkers();
  addMarkers(filteredFarms);
}

document.querySelectorAll('input[type=checkbox]').forEach(cb => {
  cb.addEventListener('change', updateMap);
});

loadFarms();

// SPA Navigation
const sections = {
  home: document.getElementById('map-container'),
  about: document.getElementById('about-section'),
  'add-farm': document.getElementById('add-farm-section'),
  admin: document.getElementById('admin-section'),
};

function promptAdminPassword(callback) {
  const adminModal = document.createElement('div');
  adminModal.id = 'admin-password-modal';
  adminModal.style = `
    position: fixed; top: 50%; left: 50%;
    transform: translate(-50%, -50%);
    background: white; padding: 20px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.2);
    z-index: 9999;
  `;
  adminModal.innerHTML = `
    <h3>Admin Access</h3>
    <input type="password" id="admin-password-input" placeholder="Enter password" />
    <button id="submit-admin-password">Submit</button>
    <button id="cancel-admin-password">Cancel</button>
  `;
  document.body.appendChild(adminModal);

  document.getElementById('submit-admin-password').onclick = () => {
    const input = document.getElementById('admin-password-input').value;
    adminModal.remove();
    callback(input);
  };

  document.getElementById('cancel-admin-password').onclick = () => {
    adminModal.remove();
    callback(null);
  };
}

window.showSection = function (sectionId) {
  Object.values(sections).forEach(sec => (sec.style.display = 'none'));

  if (sectionId === 'admin' && !localStorage.getItem('adminToken')) {
    promptAdminPassword(password => {
      if (password !== 'letmein') {
        alert('❌ Incorrect code');
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

// Handle Routing + Admin Buttons
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

// 🚀 Add Farm Form Submit
const farmForm = document.getElementById('farmForm');
if (farmForm) {
  farmForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(farmForm);

    let coordinates;
    try {
      coordinates = JSON.parse(formData.get('location'));
      if (!Array.isArray(coordinates) || coordinates.length !== 2) throw new Error();
    } catch {
      document.getElementById('formMessage').textContent = '❌ Please select a valid address from the dropdown.';
      return;
    }

    const products = Array.from(farmForm.querySelectorAll('input[name="products"]:checked'))
      .map(cb => cb.value.toLowerCase().trim());

    if (products.length === 0) {
      document.getElementById('formMessage').textContent = '❌ Please select at least one product.';
      return;
    }

    let website = formData.get('website').trim();
    if (website && !website.startsWith('http')) {
      website = 'https://www.' + website.replace(/^www\./, '');
    }

    const cloudName = 'dsxhuulne';
    const uploadPreset = 'wasatch_unsigned';
    const photoInput = document.getElementById('photoUpload');
    const files = photoInput?.files || [];
    const photoURLs = [];

    if (files.length > 0) {
      const uploads = Array.from(files).slice(0, 5).map(file => {
        const imgFormData = new FormData();
        imgFormData.append('file', file);
        imgFormData.append('upload_preset', uploadPreset);

        return fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
          method: 'POST',
          body: imgFormData,
        })
          .then(res => res.json())
          .then(data => {
            console.log('[🌤️ Cloudinary response]:', data);
            if (data.secure_url) {
              photoURLs.push(data.secure_url);
            }
          })
          .catch(err => console.error('❌ Cloudinary upload error:', err));
      });

      await Promise.all(uploads);
    }

    console.log('[📸 Uploaded Photo URLs]:', photoURLs);

    const data = {
      name: formData.get('name'),
      bio: formData.get('bio'),
      email: formData.get('email'),
      phone: formData.get('phone'),
      website,
      products,
      location: {
        type: 'Point',
        coordinates
      },
      photos: photoURLs,
    };

    console.log('[📤 Sending Farm Data]:', data);

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

// 🛠️ Admin Panel Loader
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
    
        ${farm.photos && farm.photos.length ? `
          <div class="admin-photo-preview">
            ${farm.photos.map(url => `<img src="${url}" alt="Photo" style="max-height:100px; margin:4px;">`).join('')}
          </div>
        ` : '<p>No photos uploaded</p>'}
    
        <p><strong>Approved:</strong> ${farm.isApproved ? '✅' : '❌'}</p>
        <button data-id="${farm._id}" class="approve-btn">Approve</button>
        <button data-id="${farm._id}" class="delete-btn">Delete</button>
      </div>
    `).join('') + `<div style="margin-top:20px;"><button id="logout-admin">Log Out of Admin</button></div>`;
    

    adminList.querySelectorAll('[contenteditable][data-id]').forEach(el => {
      el.addEventListener('blur', async () => {
        const id = el.dataset.id;
        const field = el.dataset.field;
        let value = el.innerText.trim();

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

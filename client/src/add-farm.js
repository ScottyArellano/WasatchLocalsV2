document.getElementById('farmForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    // Collect form data
    const farmData = {
            name: document.getElementById('name').value,
        location: document.getElementById('location').value,
        products: Array.from(document.querySelectorAll('input[name="products"]:checked')).map(el => el.value),
        bio: document.getElementById('bio').value,
        phone: document.getElementById('phone').value,
        email: document.getElementById('email').value,
        website: document.getElementById('website').value || null,
        hours: document.getElementById('hours').value || null,
        captcha: document.getElementById('captcha').value
    };

    // Simple CAPTCHA check
    if (farmData.captcha !== '1234') {
        alert("CAPTCHA is incorrect!");
        return;
    }

    // Send data to server
    try {
        // add-farm.js
        const response = await fetch('http://localhost:5002/api/farms', { // Updated URL
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // Include 'Authorization' header if needed
            },
            body: JSON.stringify(farmData)
        });

        if (response.ok) {
            alert('Farm submitted successfully!');
        } else {
            alert('Error submitting farm. Please try again.');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error submitting farm. Please check your connection and try again.');
    }
});

// Ensure this script runs after the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('createFarmForm');

    if (form) {
        form.addEventListener('submit', async function(event) {
            event.preventDefault(); // Prevent the page from reloading

            const name = document.getElementById('name').value;
            const location = document.getElementById('location').value.split(',').map(Number); // Convert string to array of numbers
            const products = document.getElementById('products').value.split(',').map(product => product.trim());
            const bio = document.getElementById('bio').value;
            const phone = document.getElementById('phone').value;
            const website = document.getElementById('website').value;
            const photos = document.getElementById('photos').value.split(',').map(photo => photo.trim());

            const farmData = {
                name,
                location,
                products,
                bio,
                phone,
                website,
                photos
            };

            try {
                const response = await fetch('http://localhost:5001/api/farms', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(farmData)
                });

                if (response.ok) {
                    alert('Farm added successfully!');
                    form.reset(); // Clear the form after successful submission
                } else {
                    alert('Failed to add farm.');
                }
            } catch (error) {
                console.error('Error:', error);
                alert('An error occurred while adding the farm.');
            }
        });
    }
});

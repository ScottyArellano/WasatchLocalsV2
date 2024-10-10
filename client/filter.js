export function filterFarms(farms, selectedProducts) {
    const lowerCaseSelectedProducts = selectedProducts
        .filter(product => typeof product === 'string') // Ensure it's a string
        .map(product => product.toLowerCase().trim()); // Convert to lowercase and trim

    return farms.filter(farm =>
        Array.isArray(farm.products) &&
        farm.products.some(product =>
            typeof product === 'string' && // Ensure farm product is a string
            lowerCaseSelectedProducts.includes(product.toLowerCase().trim()) // Convert to lowercase and trim
        )
    );
}

export function filterFarms(farms, selectedProducts) {
    const lowerCaseSelectedProducts = selectedProducts
        .filter(product => typeof product === 'string')
        .map(product => product.toLowerCase().trim());
    
    return farms.filter(farm => 
        Array.isArray(farm.products) &&
        farm.products.some(product => 
            typeof product === 'string' &&
            lowerCaseSelectedProducts.includes(product.toLowerCase().trim())
        )
    );
}

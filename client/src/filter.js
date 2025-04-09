export function filterFarms(farms, selectedProducts) {
  if (!Array.isArray(farms)) {
    throw new Error('Invalid farms input: expected an array.');
  }

  if (!Array.isArray(selectedProducts)) {
    throw new Error('Invalid selectedProducts input: expected an array.');
  }

  const selected = selectedProducts
    .filter(p => typeof p === 'string')
    .map(p => p.toLowerCase().trim());

  return farms.filter(farm => {
    if (!Array.isArray(farm.products)) return false;

    return farm.products.some(product => {
      return (
        typeof product === 'string' &&
        selected.includes(product.toLowerCase().trim())
      );
    });
  });
}

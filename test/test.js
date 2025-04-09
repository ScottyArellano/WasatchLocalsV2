import { filterFarms } from '../client/src/filter.js';
import assert from 'assert';




describe('filterFarms Tests', () => {
    // Test 1: Filter by a single product "veggies"
    it('should filter by a single product "veggies"', () => {
        const farms = [
            { name: 'Farm 1', products: ['Eggs', 'Veggies'] },
            { name: 'Farm 2', products: ['Fruit', 'Dairy'] },
            { name: 'Farm 3', products: ['Beef', 'Veggies'] }
        ];
        const result = filterFarms(farms, ['veggies']);
        assert.strictEqual(result.length, 2, `Expected 2 farms, but got ${result.length}`);
    });

    // Test 2: Filter by a product that doesn't exist
    it('should return 0 farms when filtering by a non-existent product', () => {
        const farms = [
            { name: 'Farm 1', products: ['Eggs', 'Veggies'] },
            { name: 'Farm 2', products: ['Fruit', 'Dairy'] }
        ];
        const result = filterFarms(farms, ['chicken']);
        assert.strictEqual(result.length, 0, `Expected 0 farms, but got ${result.length}`);
    });

    // Test 3: Filter by multiple products "veggies" and "eggs"
    it('should filter by multiple products "veggies" and "eggs"', () => {
        const farms = [
            { name: 'Farm 1', products: ['Eggs', 'Veggies'] },
            { name: 'Farm 2', products: ['Fruit', 'Dairy'] },
            { name: 'Farm 3', products: ['Beef', 'Veggies'] }
        ];
        const result = filterFarms(farms, ['veggies', 'eggs']);
        assert.strictEqual(result.length, 2, `Expected 2 farms, but got ${result.length}`);
    });

    // Test 4: Filter by an empty array of products
    it('should return 0 farms when filtering by an empty array', () => {
        const farms = [
            { name: 'Farm 1', products: ['Eggs', 'Veggies'] }
        ];
        const result = filterFarms(farms, []);
        assert.strictEqual(result.length, 0, `Expected 0 farms, but got ${result.length}`);
    });

    // Test 5: Case insensitivity test
    it('should filter products case-insensitively', () => {
        const farms = [
            { name: 'Farm 1', products: ['Eggs', 'Veggies'] },
            { name: 'Farm 2', products: ['Fruit', 'Dairy'] },
            { name: 'Farm 3', products: ['Beef', 'veggies'] } // Lowercase "veggies"
        ];
        const result = filterFarms(farms, ['Veggies']);
        assert.strictEqual(result.length, 2, `Expected 2 farms, but got ${result.length}`);
    });

    // Test 6: Invalid input for farms (non-array)
    it('should throw an error for invalid input for farms (non-array)', () => {
        assert.throws(() => filterFarms('invalid data', ['eggs']), Error);
    });

    // Test 7: Handle duplicate products in the selectedProducts array
    it('should handle duplicate products in the selectedProducts array', () => {
        const farms = [
            { name: 'Farm 1', products: ['Eggs', 'Veggies'] }
        ];
        const result = filterFarms(farms, ['eggs', 'eggs']);
        assert.strictEqual(result.length, 1, `Expected 1 farm, but got ${result.length}`);
    });

    // Test 8: Handle farms with no products
    it('should handle farms with no products', () => {
        const farmsWithNoProducts = [
            { name: 'Farm 4', products: [] }
        ];
        const result = filterFarms(farmsWithNoProducts, ['eggs']);
        assert.strictEqual(result.length, 0, `Expected 0 farms, but got ${result.length}`);
    });

    // Test 9: Handle valid and invalid products together
    it('should handle valid and invalid products together', () => {
        const farms = [
            { name: 'Farm 1', products: ['Eggs', 'Veggies'] }
        ];
        const result = filterFarms(farms, ['eggs', 'chicken']);
        assert.strictEqual(result.length, 1, `Expected 1 farm, but got ${result.length}`);
    });

    // Test 10: Handle farms with null or undefined products
    it('should handle farms with null or undefined products', () => {
        const farmsWithNullProducts = [
            { name: 'Farm 5', products: null },
            { name: 'Farm 6', products: undefined },
            { name: 'Farm 7', products: ['Eggs'] }
        ];
        const result = filterFarms(farmsWithNullProducts, ['eggs']);
        assert.strictEqual(result.length, 1, `Expected 1 farm, but got ${result.length}`);
    });

    // Test 11: Handle invalid (non-string) products in the farms
    it('should handle invalid (non-string) products in the farms', () => {
        const farmsWithInvalidProducts = [
            { name: 'Farm 8', products: [123, 'Eggs'] }
        ];
        const result = filterFarms(farmsWithInvalidProducts, ['eggs']);
        assert.strictEqual(result.length, 1, `Expected 1 farm, but got ${result.length}`);
    });

    // Test 12: Handle special characters in product names
    it('should handle special characters in product names', () => {
        const farmsWithSpecialCharacters = [
            { name: 'Farm 9', products: ['Eggs', 'Fresh@Fruit'] }
        ];
        const result = filterFarms(farmsWithSpecialCharacters, ['Fresh@Fruit']);
        assert.strictEqual(result.length, 1, `Expected 1 farm, but got ${result.length}`);
    });

    // Test 13: Handle invalid product types in selectedProducts array
    it('should handle invalid product types in the selectedProducts array', () => {
        const farms = [
            { name: 'Farm 1', products: ['Eggs', 'Veggies'] }
        ];
        const result = filterFarms(farms, ['eggs', 123, true]);
        assert.strictEqual(result.length, 1, `Expected 1 farm, but got ${result.length}`);
    });

    // Test 14: Handle product names with whitespace
    it('should handle product names with whitespace', () => {
        const farmsWithWhitespace = [
            { name: 'Farm 10', products: [' Eggs '] }
        ];
        const result = filterFarms(farmsWithWhitespace, ['eggs']);
        assert.strictEqual(result.length, 1, `Expected 1 farm, but got ${result.length}`);
    });

    // Test 15: Handle empty farms array
    it('should handle an empty farms array', () => {
        const result = filterFarms([], ['eggs']);
        assert.strictEqual(result.length, 0, `Expected 0 farms, but got ${result.length}`);
    });
});

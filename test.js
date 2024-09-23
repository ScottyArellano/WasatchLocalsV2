import { filterFarms } from './filter.js';
// Testing for the filterfarms function //
function testFilterFarms() {
    const farms = [
        { name: 'Farm 1', products: ['Eggs', 'Veggies'] },
        { name: 'Farm 2', products: ['Fruit', 'Dairy'] },
        { name: 'Farm 3', products: ['Beef', 'Veggies'] }
    ];
    // Test 1: Filter by a single product "veggies"
    try {
        const result = filterFarms(farms, ['veggies']);
        if (result.length !== 2) {
            throw new Error(`Expected 2 farms, but got ${result.length}`);
        }
        console.log('Test 1 passed: Filter by "veggies"');
    } catch (error) {
        console.error(`Test 1 failed: ${error.message}`);
    }

    // Test 2: Filter by a product that doesn't exist
    try {
        const result = filterFarms(farms, ['chicken']);
        if (result.length !== 0) {
            throw new Error(`Expected 0 farms, but got ${result.length}`);
        }
        console.log('Test 2 passed: Filter by "chicken"');
    } catch (error) {
        console.error(`Test 2 failed: ${error.message}`);
    }

    // Test 3: Filter by multiple products "veggies" and "eggs"
    try {
        const result = filterFarms(farms, ['veggies', 'eggs']);
        if (result.length !== 2) {
            throw new Error(`Expected 2 farms, but got ${result.length}`);
        }
        console.log('Test 3 passed: Filter by "veggies" and "eggs"');
    } catch (error) {
        console.error(`Test 3 failed: ${error.message}`);
    }

    // Test 4: Filter by an empty array of products
    try {
        const result = filterFarms(farms, []);
        if (result.length !== 0) {
            throw new Error(`Expected 0 farms, but got ${result.length}`);
        }
        console.log('Test 4 passed: Filter by empty array of products');
    } catch (error) {
        console.error(`Test 4 failed: ${error.message}`);
    }

    // Test 5: Case insensitivity test
    try {
        const result = filterFarms(farms, ['Veggies']);
        if (result.length !== 2) {
            throw new Error(`Expected 2 farms, but got ${result.length}`);
        }
        console.log('Test 5 passed: Case-insensitivity test');
    } catch (error) {
        console.error(`Test 5 failed: ${error.message}`);
    }

    // Test 6: Invalid input for farms (non-array)
    try {
        const result = filterFarms('invalid data', ['eggs']);
        console.error('Test 6 failed: Expected an error but got a result');
    } catch (error) {
        console.log('Test 6 passed: Caught the error for invalid input');
    }

    // Test 7: Handle duplicate products in the selectedProducts array
    try {
        const result = filterFarms(farms, ['eggs', 'eggs']);
        if (result.length !== 1) {
            throw new Error(`Expected 1 farm, but got ${result.length}`);
        }
        console.log('Test 7 passed: Handle duplicate products');
    } catch (error) {
        console.error(`Test 7 failed: ${error.message}`);
    }

    // Test 8: Handle farms with no products
    try {
        const farmsWithNoProducts = [
            { name: 'Farm 4', products: [] }
        ];
        const result = filterFarms(farmsWithNoProducts, ['eggs']);
        if (result.length !== 0) {
            throw new Error(`Expected 0 farms, but got ${result.length}`);
        }
        console.log('Test 8 passed: Handle farms with no products');
    } catch (error) {
        console.error(`Test 8 failed: ${error.message}`);
    }

    // Test 9: Handle valid and invalid products together
    try {
        const result = filterFarms(farms, ['eggs', 'chicken']);
        if (result.length !== 1) {
            throw new Error(`Expected 1 farm, but got ${result.length}`);
        }
        console.log('Test 9 passed: Handle valid and invalid products together');
    } catch (error) {
        console.error(`Test 9 failed: ${error.message}`);
    }

    // Test 10: Handle farms with null or undefined products
    try {
        const farmsWithNullProducts = [
            { name: 'Farm 5', products: null },
            { name: 'Farm 6', products: undefined },
            { name: 'Farm 7', products: ['Eggs'] }
        ];
        const result = filterFarms(farmsWithNullProducts, ['eggs']);
        if (result.length !== 1) {
            throw new Error(`Expected 1 farm, but got ${result.length}`);
        }
        console.log('Test 10 passed: Handle farms with null or undefined products');
    } catch (error) {
        console.error(`Test 10 failed: ${error.message}`);
    }

    // Test 11: Handle invalid (non-string) products in the farms
    try {
        const farmsWithInvalidProducts = [
            { name: 'Farm 8', products: [123, 'Eggs'] }
        ];
        const result = filterFarms(farmsWithInvalidProducts, ['eggs']);
        if (result.length !== 1) {
            throw new Error(`Expected 1 farm, but got ${result.length}`);
        }
        console.log('Test 11 passed: Handle invalid (non-string) products');
    } catch (error) {
        console.error(`Test 11 failed: ${error.message}`);
    }

    // Test 12: Handle special characters in product names
    try {
        const farmsWithSpecialCharacters = [
            { name: 'Farm 9', products: ['Eggs', 'Fresh@Fruit'] }
        ];
        const result = filterFarms(farmsWithSpecialCharacters, ['Fresh@Fruit']);
        if (result.length !== 1) {
            throw new Error(`Expected 1 farm, but got ${result.length}`);
        }
        console.log('Test 12 passed: Handle special characters in product names');
    } catch (error) {
        console.error(`Test 12 failed: ${error.message}`);
    }

    // Test 13: Handle invalid product types in selectedProducts array
    try {
        const result = filterFarms(farms, ['eggs', 123, true]);
        if (result.length !== 1) {
            throw new Error(`Expected 1 farm, but got ${result.length}`);
        }
        console.log('Test 13 passed: Handle invalid product types in selectedProducts');
    } catch (error) {
        console.error(`Test 13 failed: ${error.message}`);
    }

    // Test 14: Handle product names with whitespace
    try {
        const farmsWithWhitespace = [
            { name: 'Farm 10', products: [' Eggs '] }
        ];
        const result = filterFarms(farmsWithWhitespace, ['eggs']);
        if (result.length !== 1) {
            throw new Error(`Expected 1 farm, but got ${result.length}`);
        }
        console.log('Test 14 passed: Handle product names with whitespace');
    } catch (error) {
        console.error(`Test 14 failed: ${error.message}`);
    }

    // Test 15: Empty farms array
    try {
        const result = filterFarms([], ['eggs']);
        if (result.length !== 0) {
            throw new Error(`Expected 0 farms, but got ${result.length}`);
        }
        console.log('Test 15 passed: Handle empty farms array');
    } catch (error) {
        console.error(`Test 15 failed: ${error.message}`);
    }
}

testFilterFarms();

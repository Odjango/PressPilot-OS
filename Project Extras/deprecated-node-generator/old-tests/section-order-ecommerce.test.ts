/**
 * Ecommerce Section Order Unit Tests - Generator 2.0 Phase 4
 *
 * Tests ecommerce recipe structure and section ordering:
 * 1. Recipe structure validation
 * 2. Section order verification
 * 3. Recipe selector integration
 */

import {
    PRODUCT_SHOWCASE_RECIPE,
    MINIMAL_STORE_RECIPE,
    ECOMMERCE_RECIPES,
    DEFAULT_ECOMMERCE_RECIPE
} from '../../src/generator/recipes/ecommerce';
import { RecipeSelector } from '../../src/generator/recipes/selector';

// =============================================================================
// Test Utilities
// =============================================================================

let passed = 0;
let failed = 0;

function test(name: string, fn: () => void) {
    try {
        fn();
        console.log(`  ✓ ${name}`);
        passed++;
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        console.log(`  ✗ ${name}`);
        console.log(`    Error: ${message}`);
        failed++;
    }
}

function expect<T>(actual: T) {
    return {
        toBe(expected: T) {
            if (actual !== expected) {
                throw new Error(`Expected "${expected}" but got "${actual}"`);
            }
        },
        toEqual(expected: T) {
            if (JSON.stringify(actual) !== JSON.stringify(expected)) {
                throw new Error(
                    `Expected ${JSON.stringify(expected)} but got ${JSON.stringify(actual)}`
                );
            }
        },
        toBeDefined() {
            if (actual === undefined || actual === null) {
                throw new Error(`Expected value to be defined but got ${actual}`);
            }
        },
        toContain(expected: unknown) {
            if (!Array.isArray(actual) || !actual.includes(expected)) {
                throw new Error(`Expected array to contain "${expected}"`);
            }
        },
        toHaveLength(expected: number) {
            if (!Array.isArray(actual) || actual.length !== expected) {
                throw new Error(`Expected length ${expected} but got ${Array.isArray(actual) ? actual.length : 'not an array'}`);
            }
        }
    };
}

// =============================================================================
// Tests
// =============================================================================

console.log('\n=== Ecommerce Section Order Unit Tests (Phase 4) ===\n');

// -----------------------------------------------------------------------------
// Recipe Structure Tests
// -----------------------------------------------------------------------------

console.log('Recipe Structure Tests:\n');

test('PRODUCT_SHOWCASE_RECIPE has correct id', () => {
    expect(PRODUCT_SHOWCASE_RECIPE.id).toBe('ecommerce-product-showcase');
});

test('PRODUCT_SHOWCASE_RECIPE has correct vertical', () => {
    expect(PRODUCT_SHOWCASE_RECIPE.vertical).toBe('ecommerce');
});

test('MINIMAL_STORE_RECIPE has correct id', () => {
    expect(MINIMAL_STORE_RECIPE.id).toBe('ecommerce-minimal-store');
});

test('MINIMAL_STORE_RECIPE has correct vertical', () => {
    expect(MINIMAL_STORE_RECIPE.vertical).toBe('ecommerce');
});

test('ECOMMERCE_RECIPES contains both recipes', () => {
    expect(ECOMMERCE_RECIPES).toHaveLength(2);
});

test('DEFAULT_ECOMMERCE_RECIPE is PRODUCT_SHOWCASE_RECIPE', () => {
    expect(DEFAULT_ECOMMERCE_RECIPE.id).toBe(PRODUCT_SHOWCASE_RECIPE.id);
});

// -----------------------------------------------------------------------------
// Product Showcase Section Order Tests
// -----------------------------------------------------------------------------

console.log('\nProduct Showcase Section Order Tests:\n');

test('product-showcase has 6 sections', () => {
    expect(PRODUCT_SHOWCASE_RECIPE.sections).toHaveLength(6);
});

test('product-showcase starts with ecommerce-hero', () => {
    expect(PRODUCT_SHOWCASE_RECIPE.sections[0].type).toBe('ecommerce-hero');
});

test('product-showcase has category-grid as second section', () => {
    expect(PRODUCT_SHOWCASE_RECIPE.sections[1].type).toBe('category-grid');
});

test('product-showcase has featured-products as third section', () => {
    expect(PRODUCT_SHOWCASE_RECIPE.sections[2].type).toBe('featured-products');
});

test('product-showcase has trust-badges as fourth section', () => {
    expect(PRODUCT_SHOWCASE_RECIPE.sections[3].type).toBe('trust-badges');
});

test('product-showcase has newsletter as fifth section', () => {
    expect(PRODUCT_SHOWCASE_RECIPE.sections[4].type).toBe('newsletter');
});

test('product-showcase ends with footer', () => {
    expect(PRODUCT_SHOWCASE_RECIPE.sections[5].type).toBe('footer');
});

test('product-showcase section order is correct', () => {
    const sectionTypes = PRODUCT_SHOWCASE_RECIPE.sections.map(s => s.type);
    expect(sectionTypes).toEqual([
        'ecommerce-hero',
        'category-grid',
        'featured-products',
        'trust-badges',
        'newsletter',
        'footer'
    ]);
});

// -----------------------------------------------------------------------------
// Minimal Store Section Order Tests
// -----------------------------------------------------------------------------

console.log('\nMinimal Store Section Order Tests:\n');

test('minimal-store has 5 sections', () => {
    expect(MINIMAL_STORE_RECIPE.sections).toHaveLength(5);
});

test('minimal-store starts with ecommerce-hero', () => {
    expect(MINIMAL_STORE_RECIPE.sections[0].type).toBe('ecommerce-hero');
});

test('minimal-store has featured-products as second section', () => {
    expect(MINIMAL_STORE_RECIPE.sections[1].type).toBe('featured-products');
});

test('minimal-store has testimonials as third section', () => {
    expect(MINIMAL_STORE_RECIPE.sections[2].type).toBe('testimonials');
});

test('minimal-store has newsletter as fourth section', () => {
    expect(MINIMAL_STORE_RECIPE.sections[3].type).toBe('newsletter');
});

test('minimal-store ends with footer', () => {
    expect(MINIMAL_STORE_RECIPE.sections[4].type).toBe('footer');
});

test('minimal-store section order is correct', () => {
    const sectionTypes = MINIMAL_STORE_RECIPE.sections.map(s => s.type);
    expect(sectionTypes).toEqual([
        'ecommerce-hero',
        'featured-products',
        'testimonials',
        'newsletter',
        'footer'
    ]);
});

// -----------------------------------------------------------------------------
// Recipe Selector Tests
// -----------------------------------------------------------------------------

console.log('\nRecipe Selector Tests:\n');

test('selector returns ecommerce recipe for ecommerce vertical', () => {
    const recipe = RecipeSelector.selectRecipe({
        vertical: 'ecommerce'
    });
    expect(recipe.vertical).toBe('ecommerce');
});

test('selector returns product-showcase for modern mode', () => {
    const recipe = RecipeSelector.selectRecipe({
        vertical: 'ecommerce',
        brandMode: 'modern'
    });
    expect(recipe.id).toBe('ecommerce-product-showcase');
});

test('selector returns minimal-store for minimal mode', () => {
    const recipe = RecipeSelector.selectRecipe({
        vertical: 'ecommerce',
        brandMode: 'minimal'
    });
    expect(recipe.id).toBe('ecommerce-minimal-store');
});

test('selector returns minimal-store for playful mode', () => {
    const recipe = RecipeSelector.selectRecipe({
        vertical: 'ecommerce',
        brandMode: 'playful'
    });
    expect(recipe.id).toBe('ecommerce-minimal-store');
});

test('selector returns product-showcase for bold mode', () => {
    const recipe = RecipeSelector.selectRecipe({
        vertical: 'ecommerce',
        brandMode: 'bold'
    });
    expect(recipe.id).toBe('ecommerce-product-showcase');
});

// =============================================================================
// Test Summary
// =============================================================================

console.log('\n=== Test Summary ===\n');
console.log(`  Passed: ${passed}`);
console.log(`  Failed: ${failed}`);
console.log(`  Total:  ${passed + failed}\n`);

if (failed > 0) {
    console.log('❌ Some tests failed!\n');
    process.exit(1);
} else {
    console.log('✅ All tests passed!\n');
    process.exit(0);
}

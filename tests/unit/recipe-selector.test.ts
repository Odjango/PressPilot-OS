/**
 * RecipeSelector Unit Tests - Generator 2.0 Phase 2
 *
 * Tests recipe selection logic:
 * 1. Correct recipe selected for matching context
 * 2. Priority-based selection when multiple recipes match
 * 3. Fallback to default when no recipes match
 * 4. Handling of empty/undefined context values
 */

import { RecipeSelector } from '../../src/generator/recipes/selector';
import {
    CLASSIC_BISTRO_RECIPE,
    MODERN_DINING_RECIPE
} from '../../src/generator/recipes/restaurant';

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
        toBeGreaterThan(expected: number) {
            if (typeof actual !== 'number' || actual <= expected) {
                throw new Error(`Expected ${actual} to be greater than ${expected}`);
            }
        }
    };
}

// =============================================================================
// Tests
// =============================================================================

console.log('\n=== RecipeSelector Unit Tests ===\n');

// -----------------------------------------------------------------------------
// Basic Selection Tests
// -----------------------------------------------------------------------------

console.log('Basic Selection Tests:\n');

test('selects restaurant recipe for restaurant vertical', () => {
    const recipe = RecipeSelector.selectRecipe({ vertical: 'restaurant' });
    expect(recipe.vertical).toBe('restaurant');
});

test('returns Classic Bistro as default for restaurant', () => {
    const recipe = RecipeSelector.selectRecipe({ vertical: 'restaurant' });
    expect(recipe.id).toBe('restaurant-classic-bistro');
});

test('returns recipe with correct name', () => {
    const recipe = RecipeSelector.selectRecipe({ vertical: 'restaurant' });
    expect(recipe.name).toBe('Classic Bistro');
});

// -----------------------------------------------------------------------------
// Brand Mode Filtering Tests
// -----------------------------------------------------------------------------

console.log('\nBrand Mode Filtering Tests:\n');

test('selects recipe matching playful brandMode', () => {
    const recipe = RecipeSelector.selectRecipe({
        vertical: 'restaurant',
        brandMode: 'playful'
    });
    // Classic Bistro has brandModes: ['playful', 'modern']
    expect(recipe.id).toBe('restaurant-classic-bistro');
});

test('selects recipe matching modern brandMode', () => {
    const recipe = RecipeSelector.selectRecipe({
        vertical: 'restaurant',
        brandMode: 'modern'
    });
    // Modern Dining specifies brandModes: ['modern', 'minimal']
    // Classic Bistro has no brandModes (universal default)
    // When brandMode: 'modern', Modern Dining matches and has higher priority (60)
    expect(recipe.id).toBe('restaurant-modern-dining');
});

test('falls back to default when brandMode filters out specialized recipes', () => {
    // 'bold' is not in Modern Dining's brandModes (only modern, minimal)
    // Classic Bistro has no brandModes restriction (universal default)
    // So Classic Bistro matches and wins
    const recipe = RecipeSelector.selectRecipe({
        vertical: 'restaurant',
        brandMode: 'bold'
    });
    expect(recipe.id).toBe('restaurant-classic-bistro');
});

// -----------------------------------------------------------------------------
// Priority Selection Tests
// -----------------------------------------------------------------------------

console.log('\nPriority Selection Tests:\n');

test('selects Modern Dining for modern brandMode with any businessType', () => {
    const recipe = RecipeSelector.selectRecipe({
        vertical: 'restaurant',
        brandMode: 'modern',
        businessType: 'fine-dining'
    });
    // Modern Dining matches brandMode: 'modern' with higher priority (60)
    expect(recipe.id).toBe('restaurant-modern-dining');
});

test('selects Modern Dining for modern brandMode regardless of businessType', () => {
    const recipe = RecipeSelector.selectRecipe({
        vertical: 'restaurant',
        brandMode: 'modern',
        businessType: 'upscale'
    });
    // Modern Dining matches brandMode: 'modern' - businessType is not checked currently
    expect(recipe.id).toBe('restaurant-modern-dining');
});

test('selects Classic Bistro when brandMode is playful', () => {
    // Modern Dining only supports ['modern', 'minimal']
    // Classic Bistro is the universal default (no brandModes restriction)
    const recipe = RecipeSelector.selectRecipe({
        vertical: 'restaurant',
        brandMode: 'playful',
        businessType: 'cafe'
    });
    expect(recipe.id).toBe('restaurant-classic-bistro');
});

// -----------------------------------------------------------------------------
// Fallback Tests
// -----------------------------------------------------------------------------

console.log('\nFallback Tests:\n');

test('returns empty recipe for unregistered vertical', () => {
    const recipe = RecipeSelector.selectRecipe({ vertical: 'saas' });
    expect(recipe.sections.length).toBe(0);
    expect(recipe.id).toBe('saas-default');
});

test('returns ecommerce recipe for ecommerce vertical (Phase 4)', () => {
    const recipe = RecipeSelector.selectRecipe({ vertical: 'ecommerce' });
    expect(recipe.vertical).toBe('ecommerce');
    expect(recipe.sections.length).toBeGreaterThan(0);
});

// -----------------------------------------------------------------------------
// Utility Method Tests
// -----------------------------------------------------------------------------

console.log('\nUtility Method Tests:\n');

test('getRecipesForVertical returns all restaurant recipes', () => {
    const recipes = RecipeSelector.getRecipesForVertical('restaurant');
    expect(recipes.length).toBe(2);
});

test('getRecipesForVertical returns empty array for unregistered vertical', () => {
    const recipes = RecipeSelector.getRecipesForVertical('service');
    expect(recipes.length).toBe(0);
});

// -----------------------------------------------------------------------------
// Recipe Structure Tests
// -----------------------------------------------------------------------------

console.log('\nRecipe Structure Tests:\n');

test('Classic Bistro has correct priority', () => {
    expect(CLASSIC_BISTRO_RECIPE.conditions.priority).toBe(50);
});

test('Modern Dining has higher priority than Classic Bistro', () => {
    const classicPriority = CLASSIC_BISTRO_RECIPE.conditions.priority || 0;
    const modernPriority = MODERN_DINING_RECIPE.conditions.priority || 0;
    expect(modernPriority).toBeGreaterThan(classicPriority);
});

test('Both recipes have 6 sections', () => {
    expect(CLASSIC_BISTRO_RECIPE.sections.length).toBe(6);
    expect(MODERN_DINING_RECIPE.sections.length).toBe(6);
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

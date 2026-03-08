/**
 * Section Order Unit Tests - Generator 2.0 Phase 2
 *
 * Verifies that recipe section order matches expected output.
 * Critical for ensuring visual regression prevention.
 *
 * The Restaurant Recipe v1 section order is:
 * 1. hero (no bg specified - handles internally)
 * 2. story (base bg)
 * 3. menu-preview (base-2 bg)
 * 4. promo-band (contrast bg)
 * 5. testimonials (accent-2 bg)
 * 6. final-cta (accent bg)
 */

import {
    CLASSIC_BISTRO_RECIPE,
    MODERN_DINING_RECIPE
} from '../../src/generator/recipes/restaurant';
import type { SectionType, BackgroundSlot } from '../../src/generator/recipes/types';

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
        toBeUndefined() {
            if (actual !== undefined) {
                throw new Error(`Expected undefined but got "${actual}"`);
            }
        }
    };
}

// =============================================================================
// Expected Values (Restaurant Recipe v1)
// =============================================================================

const EXPECTED_SECTION_ORDER: SectionType[] = [
    'hero',
    'story',
    'menu-preview',
    'promo-band',
    'testimonials',
    'final-cta'
];

const EXPECTED_BACKGROUNDS: (BackgroundSlot | undefined)[] = [
    undefined,    // hero - handles internally
    'base',       // story
    'base-2',     // menu-preview
    'contrast',   // promo-band
    'accent-2',   // testimonials
    'accent'      // final-cta
];

// =============================================================================
// Tests
// =============================================================================

console.log('\n=== Section Order Unit Tests ===\n');

// -----------------------------------------------------------------------------
// Classic Bistro Section Tests
// -----------------------------------------------------------------------------

console.log('Classic Bistro Recipe Tests:\n');

test('Classic Bistro has 6 sections', () => {
    expect(CLASSIC_BISTRO_RECIPE.sections.length).toBe(6);
});

test('Classic Bistro sections are in correct order', () => {
    const actualOrder = CLASSIC_BISTRO_RECIPE.sections.map(s => s.type);
    expect(actualOrder).toEqual(EXPECTED_SECTION_ORDER);
});

test('Classic Bistro first section is hero', () => {
    expect(CLASSIC_BISTRO_RECIPE.sections[0].type).toBe('hero');
});

test('Classic Bistro last section is final-cta', () => {
    expect(CLASSIC_BISTRO_RECIPE.sections[5].type).toBe('final-cta');
});

test('Classic Bistro background colors match expected', () => {
    const actualBackgrounds = CLASSIC_BISTRO_RECIPE.sections.map(
        s => s.backgroundColor
    );
    expect(actualBackgrounds).toEqual(EXPECTED_BACKGROUNDS);
});

test('Classic Bistro hero has no background specified', () => {
    expect(CLASSIC_BISTRO_RECIPE.sections[0].backgroundColor).toBeUndefined();
});

test('Classic Bistro story has base background', () => {
    expect(CLASSIC_BISTRO_RECIPE.sections[1].backgroundColor).toBe('base');
});

test('Classic Bistro menu-preview has base-2 background', () => {
    expect(CLASSIC_BISTRO_RECIPE.sections[2].backgroundColor).toBe('base-2');
});

test('Classic Bistro promo-band has contrast background', () => {
    expect(CLASSIC_BISTRO_RECIPE.sections[3].backgroundColor).toBe('contrast');
});

test('Classic Bistro testimonials has accent-2 background', () => {
    expect(CLASSIC_BISTRO_RECIPE.sections[4].backgroundColor).toBe('accent-2');
});

test('Classic Bistro final-cta has accent background', () => {
    expect(CLASSIC_BISTRO_RECIPE.sections[5].backgroundColor).toBe('accent');
});

// -----------------------------------------------------------------------------
// Section ID Uniqueness Tests
// -----------------------------------------------------------------------------

console.log('\nSection ID Uniqueness Tests:\n');

test('Classic Bistro all sections have unique IDs', () => {
    const ids = CLASSIC_BISTRO_RECIPE.sections.map(s => s.id);
    const uniqueIds = new Set(ids);
    expect(ids.length).toBe(uniqueIds.size);
});

test('Modern Dining all sections have unique IDs', () => {
    const ids = MODERN_DINING_RECIPE.sections.map(s => s.id);
    const uniqueIds = new Set(ids);
    expect(ids.length).toBe(uniqueIds.size);
});

// -----------------------------------------------------------------------------
// Modern Dining Section Tests
// -----------------------------------------------------------------------------

console.log('\nModern Dining Recipe Tests:\n');

test('Modern Dining has 6 sections', () => {
    expect(MODERN_DINING_RECIPE.sections.length).toBe(6);
});

test('Modern Dining sections are in same order as Classic Bistro', () => {
    const classicOrder = CLASSIC_BISTRO_RECIPE.sections.map(s => s.type);
    const modernOrder = MODERN_DINING_RECIPE.sections.map(s => s.type);
    expect(modernOrder).toEqual(classicOrder);
});

test('Modern Dining background colors match Classic Bistro', () => {
    const classicBackgrounds = CLASSIC_BISTRO_RECIPE.sections.map(
        s => s.backgroundColor
    );
    const modernBackgrounds = MODERN_DINING_RECIPE.sections.map(
        s => s.backgroundColor
    );
    expect(modernBackgrounds).toEqual(classicBackgrounds);
});

// -----------------------------------------------------------------------------
// Recipe Metadata Tests
// -----------------------------------------------------------------------------

console.log('\nRecipe Metadata Tests:\n');

test('Classic Bistro has correct vertical', () => {
    expect(CLASSIC_BISTRO_RECIPE.vertical).toBe('restaurant');
});

test('Modern Dining has correct vertical', () => {
    expect(MODERN_DINING_RECIPE.vertical).toBe('restaurant');
});

test('Classic Bistro is universal default (no brandModes restriction)', () => {
    // Classic Bistro has no brandModes - it's the universal fallback
    const modes = CLASSIC_BISTRO_RECIPE.conditions.brandModes || [];
    expect(modes.length).toBe(0);
});

test('Modern Dining supports modern brandMode', () => {
    const modes = MODERN_DINING_RECIPE.conditions.brandModes || [];
    expect(modes.includes('modern')).toBe(true);
});

test('Modern Dining supports minimal brandMode', () => {
    const modes = MODERN_DINING_RECIPE.conditions.brandModes || [];
    expect(modes.includes('minimal')).toBe(true);
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

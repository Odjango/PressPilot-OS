/**
 * Design System Unit Tests
 *
 * Tests for Generator 2.0 design token system.
 * Verifies:
 * 1. getDesignTokens returns valid tokens for all brand modes
 * 2. Restaurant tokens match original restaurantThemeTokens values exactly
 * 3. Bridge function produces identical output to new system
 * 4. Unknown modes fall back safely
 */

import {
    getDesignTokens,
    isValidBrandMode,
    isValidVertical,
    type BrandMode,
    type Vertical,
    type DesignSystemTokens
} from '../../src/generator/design-system';

import {
    getRestaurantStyleTokens,
    isModernStyle,
    isPlayfulStyle,
    RESTAURANT_STYLE_TOKENS,
    type RestaurantStyleTokens
} from '../../src/generator/patterns/sections/restaurantThemeTokens';

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
    } catch (error: any) {
        console.log(`  ✗ ${name}`);
        console.log(`    Error: ${error.message}`);
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
                throw new Error(`Expected ${JSON.stringify(expected)} but got ${JSON.stringify(actual)}`);
            }
        },
        toBeTruthy() {
            if (!actual) {
                throw new Error(`Expected truthy value but got "${actual}"`);
            }
        },
        toBeFalsy() {
            if (actual) {
                throw new Error(`Expected falsy value but got "${actual}"`);
            }
        },
        toBeDefined() {
            if (actual === undefined) {
                throw new Error(`Expected defined value but got undefined`);
            }
        },
        toContain(expected: string) {
            if (typeof actual !== 'string' || !actual.includes(expected)) {
                throw new Error(`Expected "${actual}" to contain "${expected}"`);
            }
        }
    };
}

// =============================================================================
// getDesignTokens Tests
// =============================================================================

console.log('\n=== Design System Token Tests ===\n');
console.log('Testing getDesignTokens()...\n');

test('getDesignTokens returns valid tokens for restaurant playful', () => {
    const tokens = getDesignTokens('playful', 'restaurant');

    expect(tokens.brandMode).toBe('playful');
    expect(tokens.vertical).toBe('restaurant');
    expect(tokens.radius.button).toBe('100px');
    expect(tokens.radius.card).toBe('16px');
    expect(tokens.radius.image).toBe('100%');
    expect(tokens.spacing.sectionPadding).toBe('var:preset|spacing|70');
    expect(tokens.spacing.columnGap).toBe('var:preset|spacing|60');
    expect(tokens.spacing.cardPadding).toBe('var:preset|spacing|40');
    expect(tokens.spacing.buttonMarginTop).toBe('var:preset|spacing|40');
    expect(tokens.typography.buttonWeight).toBe('600');
    expect(tokens.typography.badgeWeight).toBe('700');
});

test('getDesignTokens returns valid tokens for restaurant modern', () => {
    const tokens = getDesignTokens('modern', 'restaurant');

    expect(tokens.brandMode).toBe('modern');
    expect(tokens.vertical).toBe('restaurant');
    expect(tokens.radius.button).toBe('4px');
    expect(tokens.radius.card).toBe('8px');
    expect(tokens.radius.image).toBe('8px');
    expect(tokens.spacing.sectionPadding).toBe('var:preset|spacing|60');
    expect(tokens.spacing.columnGap).toBe('var:preset|spacing|50');
    expect(tokens.spacing.cardPadding).toBe('var:preset|spacing|30');
    expect(tokens.spacing.buttonMarginTop).toBe('var:preset|spacing|30');
    expect(tokens.typography.buttonWeight).toBe('500');
    expect(tokens.typography.badgeWeight).toBe('600');
});

test('getDesignTokens returns valid tokens for restaurant minimal', () => {
    const tokens = getDesignTokens('minimal', 'restaurant');

    expect(tokens.brandMode).toBe('minimal');
    expect(tokens.vertical).toBe('restaurant');
    expect(tokens.radius.button).toBe('0px');
    expect(tokens.radius.card).toBe('0px');
    expect(tokens.radius.image).toBe('0px');
});

test('getDesignTokens returns valid tokens for restaurant bold', () => {
    const tokens = getDesignTokens('bold', 'restaurant');

    expect(tokens.brandMode).toBe('bold');
    expect(tokens.vertical).toBe('restaurant');
    expect(tokens.radius.button).toBe('8px');
    expect(tokens.radius.card).toBe('12px');
});

test('getDesignTokens falls back for unknown brand mode', () => {
    const tokens = getDesignTokens('unknown' as BrandMode, 'restaurant');

    // Should fall back to 'modern'
    expect(tokens.brandMode).toBe('modern');
    expect(tokens.vertical).toBe('restaurant');
});

test('getDesignTokens includes color tokens', () => {
    const tokens = getDesignTokens('playful', 'restaurant');

    expect(tokens.colors.background).toBe('base');
    expect(tokens.colors.surface).toBe('base-2');
    expect(tokens.colors.primary).toBe('accent');
    expect(tokens.colors.contrast).toBe('contrast');
    expect(tokens.colors.promoBg).toBe('contrast');
    expect(tokens.colors.promoText).toBe('base');
});

test('getDesignTokens includes shadow tokens', () => {
    const tokens = getDesignTokens('playful', 'restaurant');

    expect(tokens.shadows.card).toBeDefined();
    expect(tokens.shadows.elevated).toBeDefined();
});

// =============================================================================
// Bridge Compatibility Tests
// =============================================================================

console.log('\nTesting bridge compatibility...\n');

test('getRestaurantStyleTokens matches getDesignTokens for playful mode', () => {
    const legacy = getRestaurantStyleTokens('playful');
    const newTokens = getDesignTokens('playful', 'restaurant');

    expect(legacy.buttonRadius).toBe(newTokens.radius.button);
    expect(legacy.cardRadius).toBe(newTokens.radius.card);
    expect(legacy.imageRadius).toBe(newTokens.radius.image);
    expect(legacy.sectionPadding).toBe(newTokens.spacing.sectionPadding);
    expect(legacy.columnGap).toBe(newTokens.spacing.columnGap);
    expect(legacy.cardPadding).toBe(newTokens.spacing.cardPadding);
    expect(legacy.buttonMarginTop).toBe(newTokens.spacing.buttonMarginTop);
    expect(legacy.buttonWeight).toBe(newTokens.typography.buttonWeight);
    expect(legacy.badgeWeight).toBe(newTokens.typography.badgeWeight);
});

test('getRestaurantStyleTokens matches getDesignTokens for modern mode', () => {
    const legacy = getRestaurantStyleTokens('modern');
    const newTokens = getDesignTokens('modern', 'restaurant');

    expect(legacy.buttonRadius).toBe(newTokens.radius.button);
    expect(legacy.cardRadius).toBe(newTokens.radius.card);
    expect(legacy.imageRadius).toBe(newTokens.radius.image);
    expect(legacy.sectionPadding).toBe(newTokens.spacing.sectionPadding);
    expect(legacy.columnGap).toBe(newTokens.spacing.columnGap);
    expect(legacy.cardPadding).toBe(newTokens.spacing.cardPadding);
    expect(legacy.buttonMarginTop).toBe(newTokens.spacing.buttonMarginTop);
    expect(legacy.buttonWeight).toBe(newTokens.typography.buttonWeight);
    expect(legacy.badgeWeight).toBe(newTokens.typography.badgeWeight);
});

test('getRestaurantStyleTokens defaults to playful for undefined', () => {
    const tokens = getRestaurantStyleTokens();

    expect(tokens.buttonRadius).toBe('100px');
    expect(tokens.menuImageStyle).toBe('circular');
    expect(tokens.buttonStyle).toBe('pill');
});

test('getRestaurantStyleTokens defaults to playful for unknown values', () => {
    const tokens = getRestaurantStyleTokens('unknown');

    expect(tokens.buttonRadius).toBe('100px');
    expect(tokens.menuImageStyle).toBe('circular');
});

test('getRestaurantStyleTokens includes menuImageStyle', () => {
    const playful = getRestaurantStyleTokens('playful');
    const modern = getRestaurantStyleTokens('modern');

    expect(playful.menuImageStyle).toBe('circular');
    expect(modern.menuImageStyle).toBe('rectangular');
});

test('getRestaurantStyleTokens includes buttonStyle', () => {
    const playful = getRestaurantStyleTokens('playful');
    const modern = getRestaurantStyleTokens('modern');

    expect(playful.buttonStyle).toBe('pill');
    expect(modern.buttonStyle).toBe('rounded');
});

// =============================================================================
// Helper Function Tests
// =============================================================================

console.log('\nTesting helper functions...\n');

test('isModernStyle returns true for modern', () => {
    expect(isModernStyle('modern')).toBe(true);
});

test('isModernStyle returns false for playful', () => {
    expect(isModernStyle('playful')).toBe(false);
});

test('isModernStyle returns false for undefined', () => {
    expect(isModernStyle()).toBe(false);
});

test('isPlayfulStyle returns true for playful', () => {
    expect(isPlayfulStyle('playful')).toBe(true);
});

test('isPlayfulStyle returns true for undefined (default)', () => {
    expect(isPlayfulStyle()).toBe(true);
});

test('isPlayfulStyle returns false for modern', () => {
    expect(isPlayfulStyle('modern')).toBe(false);
});

test('isValidBrandMode validates known modes', () => {
    expect(isValidBrandMode('playful')).toBe(true);
    expect(isValidBrandMode('modern')).toBe(true);
    expect(isValidBrandMode('minimal')).toBe(true);
    expect(isValidBrandMode('bold')).toBe(true);
    expect(isValidBrandMode('unknown')).toBe(false);
});

test('isValidVertical validates known verticals', () => {
    expect(isValidVertical('restaurant')).toBe(true);
    expect(isValidVertical('ecommerce')).toBe(true);
    expect(isValidVertical('saas')).toBe(true);
    expect(isValidVertical('service')).toBe(true);
    expect(isValidVertical('unknown')).toBe(false);
});

// =============================================================================
// Legacy Constant Compatibility Tests
// =============================================================================

console.log('\nTesting legacy constant compatibility...\n');

test('RESTAURANT_STYLE_TOKENS.playful matches bridge output', () => {
    const legacy = RESTAURANT_STYLE_TOKENS.playful;
    const bridge = getRestaurantStyleTokens('playful');

    expect(legacy.buttonRadius).toBe(bridge.buttonRadius);
    expect(legacy.cardRadius).toBe(bridge.cardRadius);
    expect(legacy.imageRadius).toBe(bridge.imageRadius);
    expect(legacy.sectionPadding).toBe(bridge.sectionPadding);
    expect(legacy.buttonWeight).toBe(bridge.buttonWeight);
    expect(legacy.menuImageStyle).toBe(bridge.menuImageStyle);
});

test('RESTAURANT_STYLE_TOKENS.modern matches bridge output', () => {
    const legacy = RESTAURANT_STYLE_TOKENS.modern;
    const bridge = getRestaurantStyleTokens('modern');

    expect(legacy.buttonRadius).toBe(bridge.buttonRadius);
    expect(legacy.cardRadius).toBe(bridge.cardRadius);
    expect(legacy.imageRadius).toBe(bridge.imageRadius);
    expect(legacy.sectionPadding).toBe(bridge.sectionPadding);
    expect(legacy.buttonWeight).toBe(bridge.buttonWeight);
    expect(legacy.menuImageStyle).toBe(bridge.menuImageStyle);
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

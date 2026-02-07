/**
 * Ecommerce Design Tokens Unit Tests - Generator 2.0 Phase 4
 *
 * Tests the ecommerce design token system:
 * 1. Token structure and values for each brand mode
 * 2. Correct routing from getDesignTokens()
 * 3. Mode-specific styling differences
 */

import { getDesignTokens, getEcommerceTokens } from '../../src/generator/design-system';

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
        toBeDefined() {
            if (actual === undefined || actual === null) {
                throw new Error(`Expected value to be defined but got ${actual}`);
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
// Tests
// =============================================================================

console.log('\n=== Ecommerce Design Tokens Unit Tests (Phase 4) ===\n');

// -----------------------------------------------------------------------------
// Direct Token Access Tests
// -----------------------------------------------------------------------------

console.log('Direct Token Access Tests:\n');

test('getEcommerceTokens returns tokens for modern mode', () => {
    const tokens = getEcommerceTokens('modern');
    expect(tokens).toBeDefined();
    expect(tokens.brandMode).toBe('modern');
    expect(tokens.vertical).toBe('ecommerce');
});

test('getEcommerceTokens returns tokens for bold mode', () => {
    const tokens = getEcommerceTokens('bold');
    expect(tokens).toBeDefined();
    expect(tokens.brandMode).toBe('bold');
    expect(tokens.vertical).toBe('ecommerce');
});

test('getEcommerceTokens returns tokens for playful mode', () => {
    const tokens = getEcommerceTokens('playful');
    expect(tokens).toBeDefined();
    expect(tokens.brandMode).toBe('playful');
    expect(tokens.vertical).toBe('ecommerce');
});

test('getEcommerceTokens returns tokens for minimal mode', () => {
    const tokens = getEcommerceTokens('minimal');
    expect(tokens).toBeDefined();
    expect(tokens.brandMode).toBe('minimal');
    expect(tokens.vertical).toBe('ecommerce');
});

// -----------------------------------------------------------------------------
// Design System Router Tests
// -----------------------------------------------------------------------------

console.log('\nDesign System Router Tests:\n');

test('getDesignTokens routes ecommerce vertical correctly', () => {
    const tokens = getDesignTokens('modern', 'ecommerce');
    expect(tokens).toBeDefined();
    expect(tokens.vertical).toBe('ecommerce');
});

test('getDesignTokens returns ecommerce tokens for bold mode', () => {
    const tokens = getDesignTokens('bold', 'ecommerce');
    expect(tokens.vertical).toBe('ecommerce');
    expect(tokens.brandMode).toBe('bold');
});

// -----------------------------------------------------------------------------
// Mode-Specific Styling Tests
// -----------------------------------------------------------------------------

console.log('\nMode-Specific Styling Tests:\n');

test('modern mode has 4px button radius', () => {
    const tokens = getEcommerceTokens('modern');
    expect(tokens.radius.button).toBe('4px');
});

test('bold mode has 0px button radius', () => {
    const tokens = getEcommerceTokens('bold');
    expect(tokens.radius.button).toBe('0px');
});

test('playful mode has 100px button radius (pill)', () => {
    const tokens = getEcommerceTokens('playful');
    expect(tokens.radius.button).toBe('100px');
});

test('minimal mode has 0px button radius (sharp)', () => {
    const tokens = getEcommerceTokens('minimal');
    expect(tokens.radius.button).toBe('0px');
});

test('modern mode has card shadows', () => {
    const tokens = getEcommerceTokens('modern');
    expect(tokens.shadows.card).toContain('rgba');
});

test('bold mode has no card shadows', () => {
    const tokens = getEcommerceTokens('bold');
    expect(tokens.shadows.card).toBe('none');
});

// -----------------------------------------------------------------------------
// Token Structure Tests
// -----------------------------------------------------------------------------

console.log('\nToken Structure Tests:\n');

test('tokens have all required spacing properties', () => {
    const tokens = getEcommerceTokens('modern');
    expect(tokens.spacing.sectionPadding).toBeDefined();
    expect(tokens.spacing.cardPadding).toBeDefined();
    expect(tokens.spacing.columnGap).toBeDefined();
    expect(tokens.spacing.buttonMarginTop).toBeDefined();
});

test('tokens have all required radius properties', () => {
    const tokens = getEcommerceTokens('modern');
    expect(tokens.radius.button).toBeDefined();
    expect(tokens.radius.card).toBeDefined();
    expect(tokens.radius.image).toBeDefined();
});

test('tokens have all required typography properties', () => {
    const tokens = getEcommerceTokens('modern');
    expect(tokens.typography.buttonWeight).toBeDefined();
    expect(tokens.typography.badgeWeight).toBeDefined();
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

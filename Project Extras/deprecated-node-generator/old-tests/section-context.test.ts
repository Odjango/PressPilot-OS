/**
 * SectionContext Unit Tests - Generator 2.0 Phase 3
 *
 * Tests ContextBuilder and SectionContext functionality:
 * 1. Context creation with correct tokens
 * 2. Brand mode token resolution
 * 3. Recipe metadata inclusion
 * 4. Pattern output equivalence (WithContext vs legacy)
 */

import { ContextBuilder } from '../../src/generator/recipes/context-builder';
import { CLASSIC_BISTRO_RECIPE } from '../../src/generator/recipes/restaurant';
import { getDesignTokens } from '../../src/generator/design-system';
import type { RenderContext, SectionDefinition } from '../../src/generator/recipes/types';

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
        toContain(expected: string) {
            if (typeof actual !== 'string' || !actual.includes(expected)) {
                throw new Error(`Expected "${actual}" to contain "${expected}"`);
            }
        }
    };
}

// =============================================================================
// Test Data
// =============================================================================

const TEST_SECTION: SectionDefinition = {
    type: 'story',
    id: 'story-about',
    backgroundColor: 'base'
};

const TEST_RENDER_CONTEXT: RenderContext = {
    content: { business_name: 'Test Restaurant' },
    heroLayout: 'fullBleed',
    industry: 'restaurant',
    brandStyle: 'playful'
};

// =============================================================================
// Tests
// =============================================================================

console.log('\n=== SectionContext Unit Tests (Phase 3) ===\n');

// -----------------------------------------------------------------------------
// ContextBuilder Tests
// -----------------------------------------------------------------------------

console.log('ContextBuilder Tests:\n');

test('buildContext creates context with correct tokens', () => {
    const ctx = ContextBuilder.buildContext(
        TEST_SECTION,
        TEST_RENDER_CONTEXT,
        CLASSIC_BISTRO_RECIPE
    );

    expect(ctx.tokens).toBeDefined();
    expect(ctx.tokens.spacing).toBeDefined();
    expect(ctx.tokens.radius).toBeDefined();
    expect(ctx.tokens.typography).toBeDefined();
});

test('buildContext uses playful tokens by default', () => {
    const renderContext: RenderContext = {
        content: {},
        industry: 'restaurant'
        // brandStyle not specified
    };

    const ctx = ContextBuilder.buildContext(
        TEST_SECTION,
        renderContext,
        CLASSIC_BISTRO_RECIPE
    );

    // Playful mode uses 100px button radius
    expect(ctx.tokens.radius.button).toBe('100px');
});

test('buildContext uses modern tokens when brandStyle is modern', () => {
    const renderContext: RenderContext = {
        content: {},
        industry: 'restaurant',
        brandStyle: 'modern'
    };

    const ctx = ContextBuilder.buildContext(
        TEST_SECTION,
        renderContext,
        CLASSIC_BISTRO_RECIPE
    );

    // Modern mode uses 4px button radius
    expect(ctx.tokens.radius.button).toBe('4px');
});

test('context includes recipe metadata', () => {
    const ctx = ContextBuilder.buildContext(
        TEST_SECTION,
        TEST_RENDER_CONTEXT,
        CLASSIC_BISTRO_RECIPE
    );

    expect(ctx.recipe.id).toBe('restaurant-classic-bistro');
    expect(ctx.recipe.name).toBe('Classic Bistro');
    expect(ctx.recipe.vertical).toBe('restaurant');
});

test('context includes section definition', () => {
    const ctx = ContextBuilder.buildContext(
        TEST_SECTION,
        TEST_RENDER_CONTEXT,
        CLASSIC_BISTRO_RECIPE
    );

    expect(ctx.section.type).toBe('story');
    expect(ctx.section.id).toBe('story-about');
    expect(ctx.section.backgroundColor).toBe('base');
});

test('context includes render context', () => {
    const ctx = ContextBuilder.buildContext(
        TEST_SECTION,
        TEST_RENDER_CONTEXT,
        CLASSIC_BISTRO_RECIPE
    );

    expect(ctx.render.industry).toBe('restaurant');
    expect(ctx.render.brandStyle).toBe('playful');
    expect(ctx.render.heroLayout).toBe('fullBleed');
});

// -----------------------------------------------------------------------------
// Token Consistency Tests
// -----------------------------------------------------------------------------

console.log('\nToken Consistency Tests:\n');

test('tokens match getDesignTokens for playful mode', () => {
    const ctx = ContextBuilder.buildContext(
        TEST_SECTION,
        { ...TEST_RENDER_CONTEXT, brandStyle: 'playful' },
        CLASSIC_BISTRO_RECIPE
    );

    const expectedTokens = getDesignTokens('playful', 'restaurant');
    expect(ctx.tokens.radius.button).toBe(expectedTokens.radius.button);
    expect(ctx.tokens.spacing.sectionPadding).toBe(expectedTokens.spacing.sectionPadding);
});

test('tokens match getDesignTokens for modern mode', () => {
    const ctx = ContextBuilder.buildContext(
        TEST_SECTION,
        { ...TEST_RENDER_CONTEXT, brandStyle: 'modern' },
        CLASSIC_BISTRO_RECIPE
    );

    const expectedTokens = getDesignTokens('modern', 'restaurant');
    expect(ctx.tokens.radius.button).toBe(expectedTokens.radius.button);
    expect(ctx.tokens.spacing.sectionPadding).toBe(expectedTokens.spacing.sectionPadding);
});

// -----------------------------------------------------------------------------
// buildContextWithMode Tests
// -----------------------------------------------------------------------------

console.log('\nbuildContextWithMode Tests:\n');

test('buildContextWithMode overrides brandStyle', () => {
    const renderContext: RenderContext = {
        content: {},
        industry: 'restaurant',
        brandStyle: 'playful'  // Original
    };

    const ctx = ContextBuilder.buildContextWithMode(
        TEST_SECTION,
        renderContext,
        CLASSIC_BISTRO_RECIPE,
        'modern'  // Override
    );

    // Should use modern tokens despite renderContext having playful
    expect(ctx.tokens.radius.button).toBe('4px');
    expect(ctx.render.brandStyle).toBe('modern');
});

// -----------------------------------------------------------------------------
// Edge Case Tests
// -----------------------------------------------------------------------------

console.log('\nEdge Case Tests:\n');

test('handles undefined content gracefully', () => {
    const renderContext: RenderContext = {
        industry: 'restaurant',
        brandStyle: 'playful'
    };

    const ctx = ContextBuilder.buildContext(
        TEST_SECTION,
        renderContext,
        CLASSIC_BISTRO_RECIPE
    );

    expect(ctx.render.content).toBe(undefined);
    expect(ctx.tokens).toBeDefined();
});

test('handles undefined brandStyle gracefully', () => {
    const renderContext: RenderContext = {
        content: {},
        industry: 'restaurant'
    };

    const ctx = ContextBuilder.buildContext(
        TEST_SECTION,
        renderContext,
        CLASSIC_BISTRO_RECIPE
    );

    // Should default to playful
    expect(ctx.tokens.radius.button).toBe('100px');
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

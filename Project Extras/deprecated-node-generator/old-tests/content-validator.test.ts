/**
 * ContentValidator Unit Tests
 *
 * Tests the quality gate that prevents demo content from base themes
 * (Tove/Niofika, TT4/Études) from appearing in generated themes.
 *
 * Run with: npx tsx tests/unit/content-validator.test.ts
 */

import {
    ContentValidator,
    FORBIDDEN_STRINGS,
    WARNING_STRINGS
} from '../../src/generator/utils/ContentValidator';

let passed = 0;
let failed = 0;

function test(name: string, fn: () => void) {
    try {
        fn();
        console.log(`  ✅ ${name}`);
        passed++;
    } catch (error) {
        console.log(`  ❌ ${name}`);
        console.log(`     Error: ${error instanceof Error ? error.message : error}`);
        failed++;
    }
}

function expect(actual: any) {
    return {
        toBe(expected: any) {
            if (actual !== expected) {
                throw new Error(`Expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
            }
        },
        toContain(expected: any) {
            if (!actual.includes(expected)) {
                throw new Error(`Expected array to contain ${JSON.stringify(expected)}`);
            }
        },
        toHaveLength(expected: number) {
            if (actual.length !== expected) {
                throw new Error(`Expected length ${expected}, got ${actual.length}`);
            }
        },
        toBeGreaterThan(expected: number) {
            if (actual <= expected) {
                throw new Error(`Expected ${actual} to be greater than ${expected}`);
            }
        },
        toBeGreaterThanOrEqual(expected: number) {
            if (actual < expected) {
                throw new Error(`Expected ${actual} to be greater than or equal to ${expected}`);
            }
        }
    };
}

(async () => {
    console.log('\n📋 ContentValidator Unit Tests\n');

    // Test FORBIDDEN_STRINGS
    console.log('FORBIDDEN_STRINGS:');

    test('should include Tove demo content - Niofika Café', () => {
        expect(FORBIDDEN_STRINGS).toContain('Niofika Café');
    });

    test('should include Tove demo content - Niofika', () => {
        expect(FORBIDDEN_STRINGS).toContain('Niofika');
    });

    test('should include Tove demo content - Swedish email', () => {
        expect(FORBIDDEN_STRINGS).toContain('hammarby@niofika.se');
    });

    test('should include TT4 demo content - Études', () => {
        expect(FORBIDDEN_STRINGS).toContain('Études');
    });

    // Test validateContent
    console.log('\nvalidateContent:');

    test('should pass for clean content', () => {
        const cleanContent = `
            <h1>Welcome to Bella Pizzeria</h1>
            <p>Contact us at hello@bellapizzeria.com</p>
        `;
        const result = ContentValidator.validateContent(cleanContent, 'test.html');
        expect(result.valid).toBe(true);
        expect(result.errors).toHaveLength(0);
    });

    test('should fail for Tove demo content - Niofika Café', () => {
        const content = `<h1>Welcome to Niofika Café</h1>`;
        const result = ContentValidator.validateContent(content, 'front-page.html');
        expect(result.valid).toBe(false);
        expect(result.errors.length).toBeGreaterThan(0);
    });

    test('should fail for Tove demo content - Stockholm address', () => {
        const content = `<p>Visit us at Hammarby Kaj 10, 120 32 Stockholm</p>`;
        const result = ContentValidator.validateContent(content, 'contact.html');
        expect(result.valid).toBe(false);
    });

    test('should fail for TT4 demo content - Études', () => {
        const content = `<h1>Études Architecture</h1>`;
        const result = ContentValidator.validateContent(content, 'about.html');
        expect(result.valid).toBe(false);
    });

    test('should warn for generic fallback content but still pass', () => {
        const content = `
            <p>Email: info@yourbusiness.com</p>
            <p>Phone: (555) 123-4567</p>
        `;
        const result = ContentValidator.validateContent(content, 'contact.html');
        expect(result.valid).toBe(true); // Warnings don't fail validation
        expect(result.warnings.length).toBeGreaterThan(0);
    });

    test('should fail for unreplaced slot placeholders', () => {
        const content = `<p>Email: {{CONTACT_EMAIL}}</p>`;
        const result = ContentValidator.validateContent(content, 'contact.html');
        expect(result.valid).toBe(false);
    });

    test('should handle empty content', () => {
        const result = ContentValidator.validateContent('', 'empty.html');
        expect(result.valid).toBe(true);
        expect(result.errors).toHaveLength(0);
    });

    // Summary
    console.log('\n' + '='.repeat(50));
    console.log(`Results: ${passed} passed, ${failed} failed`);

    if (failed > 0) {
        process.exit(1);
    } else {
        console.log('\n✅ All ContentValidator tests passed!\n');
        process.exit(0);
    }
})();

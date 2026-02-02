/**
 * Data Flow Integration Tests
 *
 * Tests that user contact data flows correctly through the entire pipeline:
 * StudioFormInput → PressPilotSaaSInput → GeneratorData → ContentBuilder slots
 *
 * Run with: npx tsx tests/unit/data-flow.test.ts
 */

import { buildSaaSInputFromStudioInput, type StudioFormInput } from '../../lib/presspilot/studioAdapter';
import { transformSaaSInputToGeneratorData } from '../../lib/presspilot/dataTransformer';

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
        toBeDefined() {
            if (actual === undefined) {
                throw new Error(`Expected value to be defined, got undefined`);
            }
        },
        toBeUndefined() {
            if (actual !== undefined) {
                throw new Error(`Expected undefined, got ${JSON.stringify(actual)}`);
            }
        }
    };
}

// Mock Studio Input with contact fields
const mockStudioInput: StudioFormInput = {
    businessName: 'Bella Pizzeria',
    businessDescription: 'Family-owned pizzeria serving authentic Neapolitan pizza since 1995.',
    businessCategory: 'restaurant_cafe',

    // Contact fields
    contactEmail: 'info@bellapizzeria.com',
    contactPhone: '(312) 555-1234',
    contactAddress: '456 Main Street',
    contactCity: 'Chicago',
    contactState: 'IL',
    contactZip: '60601',

    // Social links
    socialLinks: {
        facebook: 'https://facebook.com/bellapizzeria',
        instagram: 'https://instagram.com/bellapizzeria',
        twitter: 'https://twitter.com/bellapizzeria'
    }
};

(async () => {
    console.log('\n📋 Data Flow Integration Tests\n');

    // StudioFormInput → PressPilotSaaSInput
    console.log('StudioFormInput → PressPilotSaaSInput:');

    test('should wire contact email to SaaSInput.contact', () => {
        const saasInput = buildSaaSInputFromStudioInput(mockStudioInput);
        expect(saasInput.contact).toBeDefined();
        expect(saasInput.contact?.email).toBe('info@bellapizzeria.com');
    });

    test('should wire contact phone to SaaSInput.contact', () => {
        const saasInput = buildSaaSInputFromStudioInput(mockStudioInput);
        expect(saasInput.contact?.phone).toBe('(312) 555-1234');
    });

    test('should wire address fields to SaaSInput.contact', () => {
        const saasInput = buildSaaSInputFromStudioInput(mockStudioInput);
        expect(saasInput.contact?.address).toBe('456 Main Street');
        expect(saasInput.contact?.city).toBe('Chicago');
        expect(saasInput.contact?.state).toBe('IL');
        expect(saasInput.contact?.zip).toBe('60601');
    });

    test('should wire social links to SaaSInput.contact.socialLinks', () => {
        const saasInput = buildSaaSInputFromStudioInput(mockStudioInput);
        expect(saasInput.contact?.socialLinks).toBeDefined();
        expect(saasInput.contact?.socialLinks?.facebook).toBe('https://facebook.com/bellapizzeria');
        expect(saasInput.contact?.socialLinks?.instagram).toBe('https://instagram.com/bellapizzeria');
    });

    test('should handle missing contact fields gracefully', () => {
        const minimalInput: StudioFormInput = {
            businessName: 'Test Business',
            businessDescription: 'Test description',
            businessCategory: 'general'
        };
        const saasInput = buildSaaSInputFromStudioInput(minimalInput);
        expect(saasInput.contact).toBeDefined();
        expect(saasInput.contact?.email).toBeUndefined();
        expect(saasInput.contact?.phone).toBeUndefined();
    });

    // PressPilotSaaSInput → GeneratorData
    console.log('\nPressPilotSaaSInput → GeneratorData:');

    test('should transform contact email to GeneratorData', () => {
        const saasInput = buildSaaSInputFromStudioInput(mockStudioInput);
        const generatorData = transformSaaSInputToGeneratorData(saasInput);
        expect(generatorData.email).toBe('info@bellapizzeria.com');
    });

    test('should transform contact phone to GeneratorData', () => {
        const saasInput = buildSaaSInputFromStudioInput(mockStudioInput);
        const generatorData = transformSaaSInputToGeneratorData(saasInput);
        expect(generatorData.phone).toBe('(312) 555-1234');
    });

    test('should transform address fields to GeneratorData', () => {
        const saasInput = buildSaaSInputFromStudioInput(mockStudioInput);
        const generatorData = transformSaaSInputToGeneratorData(saasInput);
        expect(generatorData.address).toBe('456 Main Street');
        expect(generatorData.city).toBe('Chicago');
        expect(generatorData.state).toBe('IL');
        expect(generatorData.zip).toBe('60601');
    });

    test('should transform social links to GeneratorData', () => {
        const saasInput = buildSaaSInputFromStudioInput(mockStudioInput);
        const generatorData = transformSaaSInputToGeneratorData(saasInput);
        expect(generatorData.socialLinks).toBeDefined();
        expect(generatorData.socialLinks?.facebook).toBe('https://facebook.com/bellapizzeria');
    });

    test('should preserve business name in GeneratorData', () => {
        const saasInput = buildSaaSInputFromStudioInput(mockStudioInput);
        const generatorData = transformSaaSInputToGeneratorData(saasInput);
        expect(generatorData.name).toBe('Bella Pizzeria');
    });

    // Full Pipeline Test
    console.log('\nFull Pipeline Test:');

    test('should flow all contact data from Studio to GeneratorData', () => {
        const saasInput = buildSaaSInputFromStudioInput(mockStudioInput);
        const generatorData = transformSaaSInputToGeneratorData(saasInput);

        expect(generatorData.name).toBe(mockStudioInput.businessName);
        expect(generatorData.email).toBe(mockStudioInput.contactEmail);
        expect(generatorData.phone).toBe(mockStudioInput.contactPhone);
        expect(generatorData.address).toBe(mockStudioInput.contactAddress);
        expect(generatorData.city).toBe(mockStudioInput.contactCity);
        expect(generatorData.state).toBe(mockStudioInput.contactState);
        expect(generatorData.zip).toBe(mockStudioInput.contactZip);
        expect(generatorData.socialLinks?.facebook).toBe(mockStudioInput.socialLinks?.facebook);
    });

    // Restaurant-specific Fields
    console.log('\nRestaurant-specific Fields:');

    test('should flow brandStyle for restaurant vertical', () => {
        const restaurantInput: StudioFormInput = {
            businessName: 'Modern Bistro',
            businessDescription: 'Upscale modern cuisine',
            businessCategory: 'restaurant_cafe',
            brandStyle: 'modern'
        };
        const saasInput = buildSaaSInputFromStudioInput(restaurantInput);
        const generatorData = transformSaaSInputToGeneratorData(saasInput);
        expect(generatorData.brandStyle).toBe('modern');
    });

    test('should flow heroLayout setting', () => {
        const input: StudioFormInput = {
            businessName: 'Test Business',
            businessDescription: 'Test description',
            businessCategory: 'restaurant_cafe',
            heroLayout: 'split'
        };
        const saasInput = buildSaaSInputFromStudioInput(input);
        const generatorData = transformSaaSInputToGeneratorData(saasInput);
        expect(generatorData.heroLayout).toBe('split');
    });

    // Edge Cases
    console.log('\nEdge Cases:');

    test('should handle special characters in business name', () => {
        const input: StudioFormInput = {
            businessName: "O'Reilly's Pub & Grill",
            businessDescription: 'Test description',
            businessCategory: 'restaurant_cafe',
            contactAddress: "123 St. Patrick's Way, Suite #100"
        };
        const saasInput = buildSaaSInputFromStudioInput(input);
        const generatorData = transformSaaSInputToGeneratorData(saasInput);
        expect(generatorData.name).toBe("O'Reilly's Pub & Grill");
        expect(generatorData.address).toBe("123 St. Patrick's Way, Suite #100");
    });

    // Summary
    console.log('\n' + '='.repeat(50));
    console.log(`Results: ${passed} passed, ${failed} failed`);

    if (failed > 0) {
        process.exit(1);
    } else {
        console.log('\n✅ All Data Flow tests passed!\n');
        process.exit(0);
    }
})();

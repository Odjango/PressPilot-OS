
import { PressPilotNormalizedContext, PressPilotVariationManifest } from '../../../types/presspilot';

export const MOCK_CONTEXT: PressPilotNormalizedContext = {
    brand: {
        name: 'Mock Brand',
        slug: 'mock-brand',
        category: 'restaurant_cafe',
        description: 'A mock brand for testing.'
    },
    narrative: {
        description_long: 'We are a great mock brand serving mock customers.',
        tagline: 'Mocking the world'
    },
    visual: {
        primary_ctas: [
            { label: 'Get Started', url: '#start' },
            { label: 'Learn More', url: '#more' }
        ]
    }
};

export const MOCK_VARIATION: PressPilotVariationManifest = {
    id: 'mock-variation',
    preview: {
        label: 'Mock Variation',
        description: 'A variation for testing.'
    },
    schema: {}, // Add conformant schema if needed
    // Add other required fields based on PressPilotVariationManifest definition...
    // Types might require more fields. Let's make it minimal valid.
    fonts: {
        heading: 'Inter',
        body: 'Inter'
    },
    colors: {
        palette: []
    }
} as unknown as PressPilotVariationManifest;
// forcing type for MVP if strict check complains about missing props

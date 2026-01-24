import { ThemePersonality } from '../types';

export const PATTERN_REGISTRY: Record<string, ThemePersonality> = {
    'ollie': {
        colors: {
            brand: 'primary',
            brand_alt: 'main',
            accent: 'secondary'
        },
        patterns: {
            hero: 'patterns/hero-light.php',
            hero_search_headline: 'Build your site with clicks, not code.',
            hero_search_sub: 'Easily create beautiful, fully-customizable websites with the new WordPress Site Editor and the Ollie block theme. No coding skills required.'
        },
        home_template: 'templates/index.html',
        recipes: {
            'saas': [
                {
                    name: "SaaS Start",
                    description: "High conversion SaaS landing page",
                    patterns: [
                        'patterns/header-light.php',
                        'patterns/hero-light.php',
                        'patterns/feature-boxes-with-icon-dark.php',
                        'patterns/testimonials-and-logos.php',
                        'patterns/faq.php',
                        'patterns/footer-light.php'
                    ]
                }
            ],
            'general': [
                {
                    name: "Classic Business",
                    description: "Standard business layout",
                    patterns: [
                        'patterns/header-light.php',
                        'patterns/hero-text-image-and-logos.php',
                        'patterns/features-with-emojis.php',
                        'patterns/card-contact.php',
                        'patterns/footer-light.php'
                    ]
                }
            ],
            'restaurant': [
                {
                    name: "Family Restaurant",
                    description: "Warm and inviting restaurant layout",
                    patterns: [
                        'patterns/header-light.php',
                        'patterns/hero-light.php',
                        'patterns/text-and-image-columns-with-icons.php', // About
                        'patterns/menu-card-1.php', // Menu Teaser
                        'patterns/testimonials-with-big-text.php',
                        'patterns/card-contact.php', // Location/Hours
                        'patterns/footer-light.php'
                    ]
                }
            ]
        }
    },
    'frost': {
        colors: {
            brand: 'primary',
            brand_alt: 'contrast',
            accent: 'secondary'
        },
        patterns: {
            hero: 'patterns/hero-one-column.php',
            hero_search_headline: 'Welcome to Frost',
            hero_search_sub: 'With its clean, minimal design and powerful feature set, Frost enables agencies to build stylish and sophisticated WordPress websites.'
        },
        home_template: 'templates/home.html',
        recipes: {
            'saas': [
                {
                    name: "Agency Portfolio",
                    description: "Minimal agency layout",
                    patterns: [
                        'patterns/header-default.php',
                        'patterns/hero-one-column.php',
                        'patterns/boxes-three.php',
                        'patterns/portfolio.php',
                        'patterns/testimonials.php',
                        'patterns/footer-default.php'
                    ]
                }
            ],
            'general': [
                {
                    name: "Clean Business",
                    description: "Minimalist business layout",
                    patterns: [
                        'patterns/header-default.php',
                        'patterns/hero-two-columns.php',
                        'patterns/boxes-two.php',
                        'patterns/cta-button.php',
                        'patterns/footer-stacked.php'
                    ]
                }
            ]
        }
    },
    'spectra-one': {
        colors: {
            brand: 'primary',
            brand_alt: 'secondary',
            accent: 'tertiary'
        },
        patterns: {
            hero: 'patterns/hero-banner.php', // Assuming typical pattern
            hero_search_headline: 'Your Vision, Built',
            hero_search_sub: 'Create stunning websites.'
        },
        home_template: 'templates/index.html',
        recipes: {
            'restaurant': [
                {
                    name: "Modern Bistro",
                    description: "Chic dining layout",
                    patterns: [
                        'patterns/header.php',
                        'patterns/hero-banner.php',
                        // Spectra doesn't have explicit menu-card in our previous listing? 
                        // Fallback to generic feature sections if needed or specific ones found in dir
                        'patterns/feature-3.php',
                        'patterns/testimonials-2.php',
                        'patterns/footer.php'
                    ]
                }
            ]
        }
    },
    'twentytwentyfour': {
        colors: {
            brand: 'accent',
            brand_alt: 'contrast',
            accent: 'base'
        },
        patterns: {
            hero: 'patterns/banner-hero.php',
            hero_search_headline: 'Et magna binilla',
            hero_search_sub: 'Lorem ipsum dolor sit amet'
        },
        home_template: 'templates/home.html',
        recipes: {
            'saas': [
                {
                    name: "Modern SaaS",
                    description: "Contemporary SaaS layout from TT4",
                    patterns: [
                        // 'patterns/header.php', // Removed: TT4 uses template parts, not patterns for header
                        'patterns/banner-hero.php',
                        'patterns/text-feature-grid-3-col.php',
                        'patterns/cta-pricing.php',
                        'patterns/text-faq.php',
                        'patterns/footer.php'
                    ]
                }
            ],
            'general': [
                {
                    name: "Business Showcase",
                    description: "Feature-heavy business layout",
                    patterns: [
                        'patterns/banner-project-description.php',
                        'patterns/text-alternating-images.php',
                        'patterns/cta-subscribe-centered.php',
                        'patterns/footer.php'
                    ]
                }
            ]
        }
    }
};

export const UNIVERSAL_PATTERNS = {
    heavy: 'assets/patterns/universal-heavy.php',
    footer: 'parts/footer.html',
    header: 'parts/header.html',
    archive: 'templates/archive.html',
    search: 'templates/search.html',
    blog: 'templates/index.html'
};

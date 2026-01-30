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
            hero_search_pretitle: 'WordPress Reimagined',
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
            ],
            'ecommerce': [
                {
                    name: "Ollie Shop",
                    description: "E-commerce layout",
                    patterns: [
                        'patterns/header-light.php',
                        'patterns/hero-light.php',
                        'patterns/feature-boxes-with-icon-dark.php',
                        'patterns/card-contact.php', // Location/Support
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
            hero_search_headline: 'Welcome to Your Site',
            hero_search_sub: 'With its clean, minimal design and powerful feature set, This theme enables you to build stylish and sophisticated WordPress websites.'
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
            ],
            'ecommerce': [
                {
                    name: "Frost Store",
                    description: "Minimal Shop",
                    patterns: [
                        'patterns/header-default.php',
                        'patterns/hero-one-column.php',
                        'patterns/boxes-three.php',
                        'patterns/footer-default.php'
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
            hero: 'patterns/hero-banner.php',
            hero_search_headline: 'Launch Your Website Today!',
            hero_search_sub: 'Create a functional and visually appealing website'
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
                        'patterns/feature-3.php',
                        'patterns/testimonials-2.php',
                        'patterns/footer.php'
                    ]
                }
            ],
            'saas': [
                {
                    name: "Spectra SaaS",
                    description: "SaaS layout",
                    patterns: [
                        'patterns/header.php',
                        'patterns/hero-banner.php',
                        'patterns/feature-3.php',
                        'patterns/footer.php'
                    ]
                }
            ],
            'portfolio': [
                {
                    name: "Spectra Portfolio",
                    description: "Portfolio layout",
                    patterns: [
                        'patterns/header.php',
                        'patterns/hero-banner.php',
                        'patterns/feature-3.php',
                        'patterns/footer.php'
                    ]
                }
            ],
            'ecommerce': [
                {
                    name: "Spectra Shop",
                    description: "Shop layout",
                    patterns: [
                        'patterns/header.php',
                        'patterns/hero-banner.php',
                        'patterns/feature-3.php',
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
            hero_search_headline: 'A commitment to innovation and sustainability',
            hero_search_sub: 'Études is a pioneering firm that seamlessly merges creativity and functionality to redefine architectural excellence.'
        },
        home_template: 'templates/home.html',
        recipes: {
            'saas': [
                {
                    name: "Modern SaaS",
                    description: "Contemporary SaaS layout from TT4",
                    patterns: [
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
            ],
            'ecommerce': [
                {
                    name: "Business Store",
                    description: "Business layout",
                    patterns: [
                        'patterns/banner-project-description.php',
                        'patterns/text-alternating-images.php',
                        'patterns/cta-subscribe-centered.php',
                        'patterns/footer.php'
                    ]
                }
            ]
        }
    },
    'tove': {
        colors: {
            brand: 'primary',
            brand_alt: 'secondary',
            accent: 'tertiary'
        },
        patterns: {
            hero: 'patterns/hero-cover.php',
            hero_search_headline: 'Epic Menu,<br>Epic Fall',
            hero_search_pretitle: 'New!',
            hero_search_sub: 'Where colorful flavors meet playful ambiance.'
        },
        home_template: 'templates/index.html',
        recipes: {
            'general': [{
                name: "Colorful Portfolio",
                description: "Playful, creative layout with Tove's signature style",
                patterns: [
                    'patterns/header-horizontal.php',
                    'patterns/hero-cover.php',
                    'patterns/general-previews-columns.php',
                    'patterns/cta-horizontal.php',
                    'patterns/footer-horizontal.php'
                ]
            }],
            'saas': [{
                name: "Tove SaaS",
                description: "Vibrant SaaS layout",
                patterns: [
                    'patterns/header-horizontal-button.php',
                    'patterns/hero-text.php',
                    'patterns/general-feature-large.php',
                    'patterns/general-pricing-table.php',
                    'patterns/general-faq.php',
                    'patterns/footer-horizontal.php'
                ]
            }],
            'restaurant': [{
                name: "Tove Bistro",
                description: "Playful restaurant layout with menu, hours, and location",
                patterns: [
                    'patterns/header-horizontal-button.php',
                    'patterns/hero-cover.php',
                    'patterns/general-feature-large.php',
                    'patterns/restaurant-menu.php',
                    'patterns/restaurant-opening-hours-big.php',
                    'patterns/restaurant-location.php',
                    'patterns/general-testimonials-columns.php',
                    'patterns/footer-horizontal.php'
                ]
            }],
            'portfolio': [{
                name: "Colorful Portfolio",
                description: "Playful creative portfolio",
                patterns: [
                    'patterns/header-horizontal.php',
                    'patterns/hero-text-displaced.php',
                    'patterns/general-previews-featured.php',
                    'patterns/general-testimonials-columns.php',
                    'patterns/footer-horizontal.php'
                ]
            }],
            'ecommerce': [{
                name: "Colorful Shop",
                description: "Playful e-commerce layout",
                patterns: [
                    'patterns/header-horizontal-button.php',
                    'patterns/hero-cover-group-bg.php',
                    'patterns/general-previews-columns-small.php',
                    'patterns/cta-vertical.php',
                    'patterns/footer-horizontal.php'
                ]
            }]
        }
    },
    'blockbase': {
        colors: {
            brand: 'primary',
            brand_alt: 'foreground',
            accent: 'secondary'
        },
        patterns: {
            hero: 'patterns/header-default.php',
            hero_search_headline: 'Welcome',
            hero_search_sub: 'Simplicity is key.'
        },
        home_template: 'templates/index.html',
        recipes: {
            'general': [{
                name: "Minimal Base",
                description: "Simple foundation",
                patterns: ['patterns/header-default.php', 'patterns/footer-default.php']
            }],
            'saas': [{
                name: "Minimal Base",
                description: "Simple foundation",
                patterns: ['patterns/header-default.php', 'patterns/footer-default.php']
            }],
            'restaurant': [{
                name: "Minimal Base",
                description: "Simple foundation",
                patterns: ['patterns/header-default.php', 'patterns/footer-default.php']
            }],
            'portfolio': [{
                name: "Minimal Base",
                description: "Simple foundation",
                patterns: ['patterns/header-default.php', 'patterns/footer-default.php']
            }],
            'ecommerce': [{
                name: "Minimal Shop",
                description: "Simple foundation",
                patterns: ['patterns/header-default.php', 'patterns/footer-default.php']
            }]
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

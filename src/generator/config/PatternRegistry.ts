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
        home_template: 'templates/home.html'
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
        home_template: 'templates/home.html'
    },
    'twentytwentyfour': {
        colors: {
            brand: 'accent',
            brand_alt: 'contrast',
            accent: 'base'
        },
        patterns: {
            hero: 'patterns/hero.php',
            hero_search_headline: 'Et magna binilla',
            hero_search_sub: 'Lorem ipsum dolor sit amet'
        },
        home_template: 'templates/home.html'
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

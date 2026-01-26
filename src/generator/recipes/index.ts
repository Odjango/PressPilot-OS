import { SiteRecipe } from '../types';

export const RecipeRegistry: Record<string, SiteRecipe> = {
    restaurant: {
        industry: 'restaurant',
        description: 'Full service restaurant with menu and reservations',
        pages: [
            {
                title: 'Home',
                slug: 'home',
                template: 'universal-home',
                content: {} // Populated by CopyEngine
            },
            {
                title: 'Menu',
                slug: 'menu',
                template: 'universal-menu',
                content: {}
            },
            {
                title: 'Reservations',
                slug: 'reservations',
                template: 'universal-reservation',
                content: {}
            },
            {
                title: 'About',
                slug: 'about',
                template: 'universal-about',
                content: {}
            },
            {
                title: 'Contact',
                slug: 'contact',
                template: 'universal-contact',
                content: {}
            }
        ]
    },
    // Placeholders for other verticals (Phase 2)
    agency: {
        industry: 'agency',
        description: 'Creative agency portfolio',
        pages: []
    },
    saas: {
        industry: 'saas',
        description: 'Tech startup landing',
        pages: []
    }
};

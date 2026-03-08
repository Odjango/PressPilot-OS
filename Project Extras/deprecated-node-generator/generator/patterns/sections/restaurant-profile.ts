import type { PageContent } from '../../types';

export type RestaurantArchetype = 'fine-dining' | 'casual' | 'cafe' | 'bar' | 'default';

export interface RestaurantProfile {
    archetype: RestaurantArchetype;
    chefHeadline: string;
    chefBio: string;
    galleryHeadline: string;
    gallerySubheadline: string;
    reservationHeadline: string;
    reservationSubheadline: string;
    awards: string[];
    pressMentions: string[];
}

const PROFILE_MAP: Record<RestaurantArchetype, RestaurantProfile> = {
    'fine-dining': {
        archetype: 'fine-dining',
        chefHeadline: 'Meet Our Executive Chef',
        chefBio: 'Classically trained and seasonally inspired, our chef curates tasting menus rooted in precision, terroir, and modern technique.',
        galleryHeadline: 'A Glimpse Into Service',
        gallerySubheadline: 'From plated courses to candlelit dining, explore tonight at the table.',
        reservationHeadline: 'Reserve Your Dining Experience',
        reservationSubheadline: 'Secure your preferred seating and let us tailor an unforgettable evening.',
        awards: ['AAA Four Diamond', 'Wine Spectator Award of Excellence', 'Best Fine Dining 2025'],
        pressMentions: ['City Journal', 'The Culinary Review', 'Regional Food Guide']
    },
    casual: {
        archetype: 'casual',
        chefHeadline: 'The Team Behind the Kitchen',
        chefBio: 'Our culinary team focuses on hearty favorites, daily specials, and approachable flavors built from fresh local ingredients.',
        galleryHeadline: 'Everyday Favorites',
        gallerySubheadline: 'See what guests are ordering this week from brunch through dinner.',
        reservationHeadline: 'Book a Table in Minutes',
        reservationSubheadline: 'Planning a family dinner or group meal? We make it easy to reserve.',
        awards: ['Neighborhood Favorite 2025', 'Community Choice Winner', 'Top Family Dining Spot'],
        pressMentions: ['Metro Eats', 'Local Living', 'Weekend Guide']
    },
    cafe: {
        archetype: 'cafe',
        chefHeadline: 'Our Coffee & Pastry Team',
        chefBio: 'From early-morning espresso pulls to small-batch bakes, our baristas and bakers craft comfort in every order.',
        galleryHeadline: 'From Bean to Table',
        gallerySubheadline: 'Peek inside our daily rhythm of pours, pastries, and cozy corners.',
        reservationHeadline: 'Reserve a Cozy Corner',
        reservationSubheadline: 'Need space for a meetup or quiet work session? Save your spot.',
        awards: ['Best Neighborhood Cafe', 'Top Brunch Pick', 'Local Roaster Partner Award'],
        pressMentions: ['Cafe Culture Weekly', 'City Mornings', 'Downtown Digest']
    },
    bar: {
        archetype: 'bar',
        chefHeadline: 'Cocktail Craft & Kitchen Team',
        chefBio: 'Our bartenders and cooks pair inventive cocktails with elevated bar plates for late-night energy and standout flavor.',
        galleryHeadline: 'Nightlife Highlights',
        gallerySubheadline: 'See featured pours, shareable plates, and the atmosphere after dark.',
        reservationHeadline: 'Reserve a Table Tonight',
        reservationSubheadline: 'Planning happy hour, date night, or a group gathering? Reserve now.',
        awards: ['Best Cocktail Program', 'Top Late-Night Spot', 'Editors Choice 2025'],
        pressMentions: ['Nightlife Report', 'Sip & Serve Magazine', 'The Weekend Edit']
    },
    default: {
        archetype: 'default',
        chefHeadline: 'Meet the Culinary Team',
        chefBio: 'Passionate chefs, attentive hosts, and a hospitality-first approach shape every plate and every visit.',
        galleryHeadline: 'Inside Our Restaurant',
        gallerySubheadline: 'Explore the dishes, spaces, and moments guests remember most.',
        reservationHeadline: 'Plan Your Visit',
        reservationSubheadline: 'Reserve your table and enjoy a warm, memorable dining experience.',
        awards: ['Guest Favorite 2025', 'Top Local Dining', 'Hospitality Excellence Award'],
        pressMentions: ['Food & Table', 'City Scene', 'The Daily Plate']
    }
};

function normalizeArchetype(value?: string): RestaurantArchetype {
    const normalized = (value || '').toLowerCase();
    if (normalized.includes('fine')) return 'fine-dining';
    if (normalized.includes('casual') || normalized.includes('family')) return 'casual';
    if (normalized.includes('cafe') || normalized.includes('coffee')) return 'cafe';
    if (normalized.includes('bar') || normalized.includes('pub') || normalized.includes('lounge')) {
        return 'bar';
    }
    return 'default';
}

export function getRestaurantProfile(content?: PageContent, businessType?: string): RestaurantProfile {
    const contentType = (content as any)?.business_type as string | undefined;
    const archetype = normalizeArchetype(businessType || contentType);
    return PROFILE_MAP[archetype];
}

export function getDefaultHours(content?: PageContent): Array<{ day: string; hours: string }> {
    const openingHours = (content as any)?.opening_hours as Record<string, string> | undefined;
    const fallback: Array<{ day: string; hours: string }> = [
        { day: 'Monday', hours: '11:30 AM - 9:00 PM' },
        { day: 'Tuesday', hours: '11:30 AM - 9:00 PM' },
        { day: 'Wednesday', hours: '11:30 AM - 9:00 PM' },
        { day: 'Thursday', hours: '11:30 AM - 10:00 PM' },
        { day: 'Friday', hours: '11:30 AM - 11:00 PM' },
        { day: 'Saturday', hours: '10:00 AM - 11:00 PM' },
        { day: 'Sunday', hours: '10:00 AM - 8:00 PM' }
    ];

    if (!openingHours || Object.keys(openingHours).length === 0) {
        return fallback;
    }

    const orderedDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    return orderedDays.map((day) => ({
        day,
        hours: openingHours[day] || 'Closed'
    }));
}

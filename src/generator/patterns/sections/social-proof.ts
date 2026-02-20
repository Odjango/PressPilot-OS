import { PageContent } from '../../types';
import type { SectionContext } from '../../recipes/types';
import { tokenToCSS } from '../../utils/BlockHelpers';
import { getRestaurantProfile } from './restaurant-profile';

/**
 * Social Proof Section - Phase 3 Token-Aware Version
 *
 * Testimonials and trust indicators.
 * Uses `accent-2` background for light brand tint.
 *
 * Token mappings:
 * - Card border radius: tokens.radius.card
 * - Section padding: tokens.spacing.sectionPadding
 * - Card padding: tokens.spacing.cardPadding
 * - Column gap: tokens.spacing.columnGap
 *
 * IMPORTANT: Styles (padding, border, backgroundColor) must be on wp:group
 * inside wp:column, NOT on wp:column directly. WordPress core doesn't
 * support these attributes on columns and will trigger "Attempt Recovery".
 */
export function getSocialProofSectionWithContext(ctx: SectionContext): string {
    const { tokens, render } = ctx;
    const testimonials = getTestimonialsForIndustry(render.industry, render.businessType, render.content);

    // Token-driven values (Phase 3)
    const cardRadius = tokens.radius.card;
    const sectionPadding = tokens.spacing.sectionPadding;
    const cardPadding = tokens.spacing.cardPadding;
    const columnGap = tokens.spacing.columnGap;

    const renderCard = (testimonial: Testimonial) => `<!-- wp:column -->
        <div class="wp-block-column">
            <!-- wp:group {"style":{"spacing":{"padding":{"top":"${cardPadding}","right":"${cardPadding}","bottom":"${cardPadding}","left":"${cardPadding}"}},"border":{"radius":"${cardRadius}"}},"backgroundColor":"base","layout":{"type":"constrained"}} -->
            <div class="wp-block-group is-layout-constrained has-base-background-color has-background" style="border-radius:${cardRadius};padding-top:${tokenToCSS(cardPadding)};padding-right:${tokenToCSS(cardPadding)};padding-bottom:${tokenToCSS(cardPadding)};padding-left:${tokenToCSS(cardPadding)}">
                <!-- wp:paragraph {"textColor":"accent","fontSize":"small"} -->
                <p class="has-accent-color has-text-color has-small-font-size">${'★'.repeat(testimonial.rating || 5)}</p>
                <!-- /wp:paragraph -->
                <!-- wp:paragraph {"textColor":"contrast","fontSize":"medium"} -->
                <p class="has-contrast-color has-text-color has-medium-font-size">"${testimonial.quote}"</p>
                <!-- /wp:paragraph -->
                <!-- wp:group {"layout":{"type":"flex","flexWrap":"nowrap","verticalAlignment":"center"}} -->
                <div class="wp-block-group is-layout-flex is-nowrap is-vertically-aligned-center">
                    <!-- wp:image {"width":"48px","height":"48px","sizeSlug":"thumbnail","style":{"border":{"radius":"999px"}}} -->
                    <figure class="wp-block-image size-thumbnail is-resized"><img src="${testimonial.image || 'https://placehold.co/96x96/e0e0e0/222222?text=Guest'}" alt="${testimonial.name}" style="border-radius:999px;width:48px;height:48px"/></figure>
                    <!-- /wp:image -->
                    <!-- wp:group {"layout":{"type":"constrained"}} -->
                    <div class="wp-block-group is-layout-constrained">
                        <!-- wp:paragraph {"textColor":"contrast","fontSize":"small"} -->
                        <p class="has-contrast-color has-text-color has-small-font-size"><strong>${testimonial.name}</strong></p>
                        <!-- /wp:paragraph -->
                        <!-- wp:paragraph {"textColor":"contrast-2","fontSize":"small"} -->
                        <p class="has-contrast-2-color has-text-color has-small-font-size">${testimonial.title}</p>
                        <!-- /wp:paragraph -->
                    </div>
                    <!-- /wp:group -->
                </div>
                <!-- /wp:group -->
            </div>
            <!-- /wp:group -->
        </div>
        <!-- /wp:column -->`;

    return `<!-- wp:group {"align":"full","style":{"spacing":{"padding":{"top":"${sectionPadding}","bottom":"${sectionPadding}"}}},"backgroundColor":"accent-2","layout":{"type":"constrained"}} -->
<div class="wp-block-group alignfull has-accent-2-background-color has-background" style="padding-top:${tokenToCSS(sectionPadding)};padding-bottom:${tokenToCSS(sectionPadding)}">
    <!-- wp:heading {"textAlign":"center","textColor":"contrast"} -->
    <h2 class="wp-block-heading has-text-align-center has-contrast-color has-text-color">What Our Customers Say</h2>
    <!-- /wp:heading -->
    <!-- wp:paragraph {"align":"center","textColor":"contrast-2"} -->
    <p class="has-text-align-center has-contrast-2-color has-text-color">Don't just take our word for it</p>
    <!-- /wp:paragraph -->
    <!-- wp:columns {"align":"wide","style":{"spacing":{"blockGap":{"left":"${columnGap}"},"margin":{"top":"var:preset|spacing|50"}}}} -->
    <div class="wp-block-columns alignwide" style="margin-top:var(--wp--preset--spacing--50)">
        ${renderCard(testimonials[0])}
        ${renderCard(testimonials[1])}
        ${renderCard(testimonials[2])}
    </div>
    <!-- /wp:columns -->
</div>
<!-- /wp:group -->`;
}

/**
 * Social Proof Section - Legacy API (Backward Compatible)
 *
 * NOTE: Uses hardcoded default values. New code should use
 * getSocialProofSectionWithContext() with SectionContext.
 */
export function getSocialProofSection(content?: PageContent, industry?: string): string {
    const testimonials = getTestimonialsForIndustry(industry, undefined, content);

    const renderCard = (testimonial: Testimonial) => `<!-- wp:column -->
        <div class="wp-block-column">
            <!-- wp:group {"style":{"spacing":{"padding":{"top":"var:preset|spacing|40","right":"var:preset|spacing|40","bottom":"var:preset|spacing|40","left":"var:preset|spacing|40"}},"border":{"radius":"8px"}},"backgroundColor":"base","layout":{"type":"constrained"}} -->
            <div class="wp-block-group is-layout-constrained has-base-background-color has-background" style="border-radius:8px;padding-top:var(--wp--preset--spacing--40);padding-right:var(--wp--preset--spacing--40);padding-bottom:var(--wp--preset--spacing--40);padding-left:var(--wp--preset--spacing--40)">
                <!-- wp:paragraph {"textColor":"accent","fontSize":"small"} -->
                <p class="has-accent-color has-text-color has-small-font-size">${'★'.repeat(testimonial.rating || 5)}</p>
                <!-- /wp:paragraph -->
                <!-- wp:paragraph {"textColor":"contrast","fontSize":"medium"} -->
                <p class="has-contrast-color has-text-color has-medium-font-size">"${testimonial.quote}"</p>
                <!-- /wp:paragraph -->
                <!-- wp:group {"layout":{"type":"flex","flexWrap":"nowrap","verticalAlignment":"center"}} -->
                <div class="wp-block-group is-layout-flex is-nowrap is-vertically-aligned-center">
                    <!-- wp:image {"width":"48px","height":"48px","sizeSlug":"thumbnail","style":{"border":{"radius":"999px"}}} -->
                    <figure class="wp-block-image size-thumbnail is-resized"><img src="${testimonial.image || 'https://placehold.co/96x96/e0e0e0/222222?text=Guest'}" alt="${testimonial.name}" style="border-radius:999px;width:48px;height:48px"/></figure>
                    <!-- /wp:image -->
                    <!-- wp:group {"layout":{"type":"constrained"}} -->
                    <div class="wp-block-group is-layout-constrained">
                        <!-- wp:paragraph {"textColor":"contrast","fontSize":"small"} -->
                        <p class="has-contrast-color has-text-color has-small-font-size"><strong>${testimonial.name}</strong></p>
                        <!-- /wp:paragraph -->
                        <!-- wp:paragraph {"textColor":"contrast-2","fontSize":"small"} -->
                        <p class="has-contrast-2-color has-text-color has-small-font-size">${testimonial.title}</p>
                        <!-- /wp:paragraph -->
                    </div>
                    <!-- /wp:group -->
                </div>
                <!-- /wp:group -->
            </div>
            <!-- /wp:group -->
        </div>
        <!-- /wp:column -->`;

    return `<!-- wp:group {"align":"full","style":{"spacing":{"padding":{"top":"var:preset|spacing|60","bottom":"var:preset|spacing|60"}}},"backgroundColor":"accent-2","layout":{"type":"constrained"}} -->
<div class="wp-block-group alignfull has-accent-2-background-color has-background" style="padding-top:var(--wp--preset--spacing--60);padding-bottom:var(--wp--preset--spacing--60)">
    <!-- wp:heading {"textAlign":"center","textColor":"contrast"} -->
    <h2 class="wp-block-heading has-text-align-center has-contrast-color has-text-color">What Our Customers Say</h2>
    <!-- /wp:heading -->
    <!-- wp:paragraph {"align":"center","textColor":"contrast-2"} -->
    <p class="has-text-align-center has-contrast-2-color has-text-color">Don't just take our word for it</p>
    <!-- /wp:paragraph -->
    <!-- wp:columns {"align":"wide","style":{"spacing":{"blockGap":{"left":"var:preset|spacing|40"},"margin":{"top":"var:preset|spacing|50"}}}} -->
    <div class="wp-block-columns alignwide" style="margin-top:var(--wp--preset--spacing--50)">
        ${renderCard(testimonials[0])}
        ${renderCard(testimonials[1])}
        ${renderCard(testimonials[2])}
    </div>
    <!-- /wp:columns -->
</div>
<!-- /wp:group -->`;
}

interface Testimonial {
    quote: string;
    name: string;
    title: string;
    image?: string;
    rating?: number;
}

function getTestimonialsForIndustry(
    industry?: string,
    businessType?: string,
    content?: PageContent
): Testimonial[] {
    const defaults: Testimonial[] = [
        {
            quote: 'Absolutely fantastic experience. The team went above and beyond our expectations.',
            name: 'Sarah M.',
            title: 'Happy Customer',
            image: 'https://placehold.co/96x96/e0e0e0/222222?text=SM',
            rating: 5
        },
        {
            quote: 'Professional, reliable, and a pleasure to work with. Highly recommended!',
            name: 'James R.',
            title: 'Repeat Client',
            image: 'https://placehold.co/96x96/e0e0e0/222222?text=JR',
            rating: 5
        },
        {
            quote: 'The quality exceeded my expectations. Will definitely be back.',
            name: 'Emily T.',
            title: 'Satisfied Customer',
            image: 'https://placehold.co/96x96/e0e0e0/222222?text=ET',
            rating: 5
        }
    ];

    const restaurantProfile = getRestaurantProfile(content, businessType);
    const restaurantByType: Record<string, Testimonial[]> = {
        'fine-dining': [
            {
                quote: 'Impeccable pacing, flawless plating, and remarkable depth of flavor in every course.',
                name: 'Nina P.',
                title: 'Chefs Counter Guest',
                image: 'https://placehold.co/96x96/e0e0e0/222222?text=NP',
                rating: 5
            },
            {
                quote: 'A true destination dinner. The tasting menu and wine pairings were exceptional.',
                name: 'Victor L.',
                title: 'Anniversary Celebration',
                image: 'https://placehold.co/96x96/e0e0e0/222222?text=VL',
                rating: 5
            },
            {
                quote: 'Hospitality at the highest level. Every detail felt intentional.',
                name: 'Clara S.',
                title: 'Frequent Diner',
                image: 'https://placehold.co/96x96/e0e0e0/222222?text=CS',
                rating: 5
            }
        ],
        casual: [
            {
                quote: 'Great portions, quick service, and friendly staff. Perfect weeknight dinner spot.',
                name: 'Mason T.',
                title: 'Neighborhood Regular',
                image: 'https://placehold.co/96x96/e0e0e0/222222?text=MT',
                rating: 5
            },
            {
                quote: 'Our whole family loved it. Something delicious for everyone at the table.',
                name: 'Alyssa F.',
                title: 'Weekend Guest',
                image: 'https://placehold.co/96x96/e0e0e0/222222?text=AF',
                rating: 5
            },
            {
                quote: 'Consistently tasty food and a welcoming atmosphere every time we visit.',
                name: 'Jordan B.',
                title: 'Local Diner',
                image: 'https://placehold.co/96x96/e0e0e0/222222?text=JB',
                rating: 5
            }
        ],
        cafe: [
            {
                quote: 'Excellent espresso and the pastry case is dangerous in the best way.',
                name: 'Kira D.',
                title: 'Morning Regular',
                image: 'https://placehold.co/96x96/e0e0e0/222222?text=KD',
                rating: 5
            },
            {
                quote: 'My favorite place to meet clients. Calm vibe, great coffee, great service.',
                name: 'Leo G.',
                title: 'Remote Worker',
                image: 'https://placehold.co/96x96/e0e0e0/222222?text=LG',
                rating: 5
            },
            {
                quote: 'The seasonal drinks are always creative and never overly sweet.',
                name: 'Rina H.',
                title: 'Cafe Enthusiast',
                image: 'https://placehold.co/96x96/e0e0e0/222222?text=RH',
                rating: 5
            }
        ],
        bar: [
            {
                quote: 'Inventive cocktails, lively atmosphere, and surprisingly strong food program.',
                name: 'Dev P.',
                title: 'Friday Night Guest',
                image: 'https://placehold.co/96x96/e0e0e0/222222?text=DP',
                rating: 5
            },
            {
                quote: 'Happy hour is fantastic. Great pours and genuinely attentive staff.',
                name: 'Sofia M.',
                title: 'Happy Hour Regular',
                image: 'https://placehold.co/96x96/e0e0e0/222222?text=SM',
                rating: 5
            },
            {
                quote: 'The playlist, energy, and drinks make this our go-to for group nights out.',
                name: 'Evan R.',
                title: 'Group Booking',
                image: 'https://placehold.co/96x96/e0e0e0/222222?text=ER',
                rating: 5
            }
        ]
    };

    if (industry === 'restaurant' || industry === 'cafe' || industry === 'restaurant_cafe') {
        return restaurantByType[restaurantProfile.archetype] || restaurantByType.casual;
    }

    const industryTestimonials: Record<string, Testimonial[]> = {
        'restaurant': [
            {
                quote: 'Best meal we have had in years. The flavors were incredible and the service was impeccable.',
                name: 'Rachel K.',
                title: 'Local Food Enthusiast',
                image: 'https://placehold.co/96x96/e0e0e0/222222?text=RK',
                rating: 5
            },
            {
                quote: 'Our go-to spot for special occasions. Never disappoints!',
                name: 'David L.',
                title: 'Regular Diner',
                image: 'https://placehold.co/96x96/e0e0e0/222222?text=DL',
                rating: 5
            },
            {
                quote: 'Fresh ingredients, creative dishes, and a warm atmosphere. What more could you ask for?',
                name: 'Monica S.',
                title: 'First-time Visitor',
                image: 'https://placehold.co/96x96/e0e0e0/222222?text=MS',
                rating: 5
            }
        ],
        'ecommerce': [
            {
                quote: 'Fast shipping, great quality, and excellent customer service. My new favorite shop!',
                name: 'Ashley P.',
                title: 'Verified Buyer'
            },
            {
                quote: 'The products are even better in person. Will definitely order again.',
                name: 'Chris W.',
                title: 'Repeat Customer'
            },
            {
                quote: 'Easy checkout process and the products arrived exactly as described.',
                name: 'Taylor M.',
                title: 'Happy Shopper'
            }
        ],
        'saas_product': [
            {
                quote: 'This tool has transformed how our team works. We have saved hours every week.',
                name: 'Mark D.',
                title: 'Operations Manager'
            },
            {
                quote: 'Intuitive interface and powerful features. The best investment we have made.',
                name: 'Lisa C.',
                title: 'Startup Founder'
            },
            {
                quote: 'The customer support is incredible. They helped us get up and running in no time.',
                name: 'Kevin B.',
                title: 'Team Lead'
            }
        ],
        'service': [
            {
                quote: 'Professional, thorough, and genuinely cared about getting it right.',
                name: 'Jennifer H.',
                title: 'Business Owner'
            },
            {
                quote: 'They delivered exactly what they promised, on time and on budget.',
                name: 'Robert F.',
                title: 'Project Manager'
            },
            {
                quote: 'I have recommended them to everyone I know. Truly exceptional service.',
                name: 'Amanda L.',
                title: 'Returning Client'
            }
        ],
        'fitness': [
            {
                quote: 'The trainers here actually care about your progress. Best gym I have ever joined.',
                name: 'Mike J.',
                title: 'Member since 2023'
            },
            {
                quote: 'Down 30 pounds and feeling stronger than ever. Changed my life!',
                name: 'Katie S.',
                title: 'Transformation Success'
            },
            {
                quote: 'Great community, amazing classes, and results that speak for themselves.',
                name: 'Alex R.',
                title: 'Fitness Enthusiast'
            }
        ]
    };

    return industryTestimonials[industry || ''] || defaults;
}

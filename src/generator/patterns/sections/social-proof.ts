import { PageContent } from '../../types';
import type { SectionContext } from '../../recipes/types';

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
 */
export function getSocialProofSectionWithContext(ctx: SectionContext): string {
    const { tokens, render } = ctx;
    const testimonials = getTestimonialsForIndustry(render.industry);

    // Token-driven values (Phase 3)
    const cardRadius = tokens.radius.card;
    const sectionPadding = tokens.spacing.sectionPadding;
    const cardPadding = tokens.spacing.cardPadding;
    const columnGap = tokens.spacing.columnGap;

    return `<!-- wp:group {"align":"full","style":{"spacing":{"padding":{"top":"${sectionPadding}","bottom":"${sectionPadding}"}}},"backgroundColor":"accent-2","layout":{"type":"constrained"}} -->
<div class="wp-block-group alignfull has-accent-2-background-color has-background" style="padding-top:var(--wp--preset--spacing--70);padding-bottom:var(--wp--preset--spacing--70)">
    <!-- wp:heading {"textAlign":"center","textColor":"contrast"} -->
    <h2 class="wp-block-heading has-text-align-center has-contrast-color has-text-color">What Our Customers Say</h2>
    <!-- /wp:heading -->
    <!-- wp:paragraph {"align":"center","textColor":"contrast-2"} -->
    <p class="has-text-align-center has-contrast-2-color has-text-color">Don't just take our word for it</p>
    <!-- /wp:paragraph -->
    <!-- wp:columns {"align":"wide","style":{"spacing":{"blockGap":{"left":"${columnGap}"},"margin":{"top":"var:preset|spacing|50"}}}} -->
    <div class="wp-block-columns alignwide" style="margin-top:var(--wp--preset--spacing--50)">
        <!-- wp:column {"style":{"spacing":{"padding":{"top":"${cardPadding}","right":"${cardPadding}","bottom":"${cardPadding}","left":"${cardPadding}"}},"border":{"radius":"${cardRadius}"}},"backgroundColor":"base"} -->
        <div class="wp-block-column has-base-background-color has-background" style="border-radius:${cardRadius};padding-top:var(--wp--preset--spacing--40);padding-right:var(--wp--preset--spacing--40);padding-bottom:var(--wp--preset--spacing--40);padding-left:var(--wp--preset--spacing--40)">
            <!-- wp:paragraph {"textColor":"contrast","fontSize":"medium"} -->
            <p class="has-contrast-color has-text-color has-medium-font-size">"${testimonials[0].quote}"</p>
            <!-- /wp:paragraph -->
            <!-- wp:paragraph {"textColor":"accent","fontSize":"small"} -->
            <p class="has-accent-color has-text-color has-small-font-size"><strong>${testimonials[0].name}</strong></p>
            <!-- /wp:paragraph -->
            <!-- wp:paragraph {"textColor":"contrast-2","fontSize":"small"} -->
            <p class="has-contrast-2-color has-text-color has-small-font-size">${testimonials[0].title}</p>
            <!-- /wp:paragraph -->
        </div>
        <!-- /wp:column -->
        <!-- wp:column {"style":{"spacing":{"padding":{"top":"${cardPadding}","right":"${cardPadding}","bottom":"${cardPadding}","left":"${cardPadding}"}},"border":{"radius":"${cardRadius}"}},"backgroundColor":"base"} -->
        <div class="wp-block-column has-base-background-color has-background" style="border-radius:${cardRadius};padding-top:var(--wp--preset--spacing--40);padding-right:var(--wp--preset--spacing--40);padding-bottom:var(--wp--preset--spacing--40);padding-left:var(--wp--preset--spacing--40)">
            <!-- wp:paragraph {"textColor":"contrast","fontSize":"medium"} -->
            <p class="has-contrast-color has-text-color has-medium-font-size">"${testimonials[1].quote}"</p>
            <!-- /wp:paragraph -->
            <!-- wp:paragraph {"textColor":"accent","fontSize":"small"} -->
            <p class="has-accent-color has-text-color has-small-font-size"><strong>${testimonials[1].name}</strong></p>
            <!-- /wp:paragraph -->
            <!-- wp:paragraph {"textColor":"contrast-2","fontSize":"small"} -->
            <p class="has-contrast-2-color has-text-color has-small-font-size">${testimonials[1].title}</p>
            <!-- /wp:paragraph -->
        </div>
        <!-- /wp:column -->
        <!-- wp:column {"style":{"spacing":{"padding":{"top":"${cardPadding}","right":"${cardPadding}","bottom":"${cardPadding}","left":"${cardPadding}"}},"border":{"radius":"${cardRadius}"}},"backgroundColor":"base"} -->
        <div class="wp-block-column has-base-background-color has-background" style="border-radius:${cardRadius};padding-top:var(--wp--preset--spacing--40);padding-right:var(--wp--preset--spacing--40);padding-bottom:var(--wp--preset--spacing--40);padding-left:var(--wp--preset--spacing--40)">
            <!-- wp:paragraph {"textColor":"contrast","fontSize":"medium"} -->
            <p class="has-contrast-color has-text-color has-medium-font-size">"${testimonials[2].quote}"</p>
            <!-- /wp:paragraph -->
            <!-- wp:paragraph {"textColor":"accent","fontSize":"small"} -->
            <p class="has-accent-color has-text-color has-small-font-size"><strong>${testimonials[2].name}</strong></p>
            <!-- /wp:paragraph -->
            <!-- wp:paragraph {"textColor":"contrast-2","fontSize":"small"} -->
            <p class="has-contrast-2-color has-text-color has-small-font-size">${testimonials[2].title}</p>
            <!-- /wp:paragraph -->
        </div>
        <!-- /wp:column -->
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
    const testimonials = getTestimonialsForIndustry(industry);

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
        <!-- wp:column {"style":{"spacing":{"padding":{"top":"var:preset|spacing|40","right":"var:preset|spacing|40","bottom":"var:preset|spacing|40","left":"var:preset|spacing|40"}},"border":{"radius":"8px"}},"backgroundColor":"base"} -->
        <div class="wp-block-column has-base-background-color has-background" style="border-radius:8px;padding-top:var(--wp--preset--spacing--40);padding-right:var(--wp--preset--spacing--40);padding-bottom:var(--wp--preset--spacing--40);padding-left:var(--wp--preset--spacing--40)">
            <!-- wp:paragraph {"textColor":"contrast","fontSize":"medium"} -->
            <p class="has-contrast-color has-text-color has-medium-font-size">"${testimonials[0].quote}"</p>
            <!-- /wp:paragraph -->
            <!-- wp:paragraph {"textColor":"accent","fontSize":"small"} -->
            <p class="has-accent-color has-text-color has-small-font-size"><strong>${testimonials[0].name}</strong></p>
            <!-- /wp:paragraph -->
            <!-- wp:paragraph {"textColor":"contrast-2","fontSize":"small"} -->
            <p class="has-contrast-2-color has-text-color has-small-font-size">${testimonials[0].title}</p>
            <!-- /wp:paragraph -->
        </div>
        <!-- /wp:column -->
        <!-- wp:column {"style":{"spacing":{"padding":{"top":"var:preset|spacing|40","right":"var:preset|spacing|40","bottom":"var:preset|spacing|40","left":"var:preset|spacing|40"}},"border":{"radius":"8px"}},"backgroundColor":"base"} -->
        <div class="wp-block-column has-base-background-color has-background" style="border-radius:8px;padding-top:var(--wp--preset--spacing--40);padding-right:var(--wp--preset--spacing--40);padding-bottom:var(--wp--preset--spacing--40);padding-left:var(--wp--preset--spacing--40)">
            <!-- wp:paragraph {"textColor":"contrast","fontSize":"medium"} -->
            <p class="has-contrast-color has-text-color has-medium-font-size">"${testimonials[1].quote}"</p>
            <!-- /wp:paragraph -->
            <!-- wp:paragraph {"textColor":"accent","fontSize":"small"} -->
            <p class="has-accent-color has-text-color has-small-font-size"><strong>${testimonials[1].name}</strong></p>
            <!-- /wp:paragraph -->
            <!-- wp:paragraph {"textColor":"contrast-2","fontSize":"small"} -->
            <p class="has-contrast-2-color has-text-color has-small-font-size">${testimonials[1].title}</p>
            <!-- /wp:paragraph -->
        </div>
        <!-- /wp:column -->
        <!-- wp:column {"style":{"spacing":{"padding":{"top":"var:preset|spacing|40","right":"var:preset|spacing|40","bottom":"var:preset|spacing|40","left":"var:preset|spacing|40"}},"border":{"radius":"8px"}},"backgroundColor":"base"} -->
        <div class="wp-block-column has-base-background-color has-background" style="border-radius:8px;padding-top:var(--wp--preset--spacing--40);padding-right:var(--wp--preset--spacing--40);padding-bottom:var(--wp--preset--spacing--40);padding-left:var(--wp--preset--spacing--40)">
            <!-- wp:paragraph {"textColor":"contrast","fontSize":"medium"} -->
            <p class="has-contrast-color has-text-color has-medium-font-size">"${testimonials[2].quote}"</p>
            <!-- /wp:paragraph -->
            <!-- wp:paragraph {"textColor":"accent","fontSize":"small"} -->
            <p class="has-accent-color has-text-color has-small-font-size"><strong>${testimonials[2].name}</strong></p>
            <!-- /wp:paragraph -->
            <!-- wp:paragraph {"textColor":"contrast-2","fontSize":"small"} -->
            <p class="has-contrast-2-color has-text-color has-small-font-size">${testimonials[2].title}</p>
            <!-- /wp:paragraph -->
        </div>
        <!-- /wp:column -->
    </div>
    <!-- /wp:columns -->
</div>
<!-- /wp:group -->`;
}

interface Testimonial {
    quote: string;
    name: string;
    title: string;
}

function getTestimonialsForIndustry(industry?: string): Testimonial[] {
    const defaults: Testimonial[] = [
        {
            quote: 'Absolutely fantastic experience. The team went above and beyond our expectations.',
            name: 'Sarah M.',
            title: 'Happy Customer'
        },
        {
            quote: 'Professional, reliable, and a pleasure to work with. Highly recommended!',
            name: 'James R.',
            title: 'Repeat Client'
        },
        {
            quote: 'The quality exceeded my expectations. Will definitely be back.',
            name: 'Emily T.',
            title: 'Satisfied Customer'
        }
    ];

    const industryTestimonials: Record<string, Testimonial[]> = {
        'restaurant': [
            {
                quote: 'Best meal we\'ve had in years. The flavors were incredible and the service was impeccable.',
                name: 'Rachel K.',
                title: 'Local Food Enthusiast'
            },
            {
                quote: 'Our go-to spot for special occasions. Never disappoints!',
                name: 'David L.',
                title: 'Regular Diner'
            },
            {
                quote: 'Fresh ingredients, creative dishes, and a warm atmosphere. What more could you ask for?',
                name: 'Monica S.',
                title: 'First-time Visitor'
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
                quote: 'This tool has transformed how our team works. We\'ve saved hours every week.',
                name: 'Mark D.',
                title: 'Operations Manager'
            },
            {
                quote: 'Intuitive interface and powerful features. The best investment we\'ve made.',
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
                quote: 'I\'ve recommended them to everyone I know. Truly exceptional service.',
                name: 'Amanda L.',
                title: 'Returning Client'
            }
        ],
        'fitness': [
            {
                quote: 'The trainers here actually care about your progress. Best gym I\'ve ever joined.',
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

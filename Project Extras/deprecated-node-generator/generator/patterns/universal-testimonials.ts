/**
 * Universal Testimonials Pattern - TT4-Aligned
 *
 * Provides varied testimonial content to avoid repeated identical quotes.
 * Uses TT4 semantic color tokens for consistent styling:
 * - Background: accent-2 (lighter accent for warmth)
 * - Cards: base (white/light)
 * - Text: contrast, contrast-2
 *
 * Phase 13 - Best Practices: This pattern is slot-driven and never
 * contains demo brand names (no "Niofika", "Études", etc.)
 */

import { PageContent } from '../types';

export interface Testimonial {
    quote: string;
    author: string;
    role?: string;
}

/**
 * Default testimonials - varied and generic
 * These are safe fallbacks that work for any business type
 */
const DEFAULT_TESTIMONIALS: Testimonial[] = [
    {
        quote: "Outstanding service and attention to detail. Truly exceeded our expectations.",
        author: "Happy Customer",
        role: "Verified Client"
    },
    {
        quote: "Professional, reliable, and incredibly helpful throughout the entire process.",
        author: "Satisfied Client",
        role: "Local Resident"
    },
    {
        quote: "We've been coming back for years. Simply the best in the business.",
        author: "Loyal Customer",
        role: "Regular Visitor"
    }
];

/**
 * Restaurant-specific testimonials
 */
const RESTAURANT_TESTIMONIALS: Testimonial[] = [
    {
        quote: "The flavors are incredible and the atmosphere is perfect. Our new favorite spot!",
        author: "Food Lover",
        role: "Dinner Guest"
    },
    {
        quote: "Best meal I've had in a long time. The staff made us feel like family.",
        author: "Happy Diner",
        role: "First-Time Visitor"
    },
    {
        quote: "We celebrate every special occasion here. Never disappoints!",
        author: "Regular Customer",
        role: "Local Favorite"
    }
];

/**
 * Get testimonials based on industry
 */
export function getTestimonialsForIndustry(industry?: string): Testimonial[] {
    const normalizedIndustry = (industry || 'general').toLowerCase();

    if (normalizedIndustry === 'restaurant' || normalizedIndustry === 'cafe' || normalizedIndustry === 'restaurant_cafe') {
        return RESTAURANT_TESTIMONIALS;
    }

    return DEFAULT_TESTIMONIALS;
}

/**
 * Generate Universal Testimonials Section
 *
 * Uses TT4 color tokens:
 * - Section bg: accent-2 (warm secondary accent)
 * - Card bg: base (white/light)
 * - Quote text: contrast (dark)
 * - Author text: contrast-2 (muted)
 */
export const getUniversalTestimonialsContent = (
    businessName: string,
    industry?: string,
    customTestimonials?: Testimonial[]
) => {
    // Use custom testimonials if provided, otherwise fall back to industry defaults
    const displayTestimonials = customTestimonials?.length
        ? customTestimonials
        : getTestimonialsForIndustry(industry);

    const testimonialBlocks = displayTestimonials.map((t, i) => `
            <!-- wp:group {"style":{"spacing":{"padding":{"top":"var:preset|spacing|40","bottom":"var:preset|spacing|40","left":"var:preset|spacing|40","right":"var:preset|spacing|40"}},"border":{"radius":"12px"}},"backgroundColor":"base","layout":{"type":"flex","orientation":"vertical"}} -->
            <div class="wp-block-group has-base-background-color has-background" style="border-radius:12px;padding-top:var(--wp--preset--spacing--40);padding-right:var(--wp--preset--spacing--40);padding-bottom:var(--wp--preset--spacing--40);padding-left:var(--wp--preset--spacing--40)">
                <!-- wp:paragraph {"style":{"typography":{"fontStyle":"italic","lineHeight":"1.6"}},"textColor":"contrast","fontSize":"medium"} -->
                <p class="has-contrast-color has-text-color has-medium-font-size" style="font-style:italic;line-height:1.6">"${t.quote}"</p>
                <!-- /wp:paragraph -->
                <!-- wp:group {"style":{"spacing":{"margin":{"top":"var:preset|spacing|20"}}},"layout":{"type":"flex","flexWrap":"nowrap","verticalAlignment":"center"}} -->
                <div class="wp-block-group" style="margin-top:var(--wp--preset--spacing--20)">
                    <!-- wp:paragraph {"fontSize":"small","textColor":"contrast"} -->
                    <p class="has-contrast-color has-text-color has-small-font-size"><strong>${t.author}</strong></p>
                    <!-- /wp:paragraph -->
                    ${t.role ? `
                    <!-- wp:paragraph {"fontSize":"small","textColor":"contrast-2"} -->
                    <p class="has-contrast-2-color has-text-color has-small-font-size">— ${t.role}</p>
                    <!-- /wp:paragraph -->
                    ` : ''}
                </div>
                <!-- /wp:group -->
            </div>
            <!-- /wp:group -->`).join('\n');

    return `
    <!-- wp:group {"align":"full","style":{"spacing":{"padding":{"top":"var:preset|spacing|70","bottom":"var:preset|spacing|70"}}},"backgroundColor":"accent-2","layout":{"type":"constrained"}} -->
    <div class="wp-block-group alignfull has-accent-2-background-color has-background" style="padding-top:var(--wp--preset--spacing--70);padding-bottom:var(--wp--preset--spacing--70)">
        <!-- wp:heading {"textAlign":"center","textColor":"contrast","fontSize":"x-large"} -->
        <h2 class="wp-block-heading has-text-align-center has-contrast-color has-text-color has-x-large-font-size">What Our Customers Say</h2>
        <!-- /wp:heading -->

        <!-- wp:paragraph {"align":"center","textColor":"contrast-2","style":{"spacing":{"margin":{"bottom":"var:preset|spacing|50"}}}} -->
        <p class="has-text-align-center has-contrast-2-color has-text-color" style="margin-bottom:var(--wp--preset--spacing--50)">Don't just take our word for it — hear from our satisfied customers.</p>
        <!-- /wp:paragraph -->

        <!-- wp:group {"align":"wide","layout":{"type":"grid","columnCount":3,"minimumColumnWidth":null}} -->
        <div class="wp-block-group alignwide">
            ${testimonialBlocks}
        </div>
        <!-- /wp:group -->
    </div>
    <!-- /wp:group -->
    `;
};

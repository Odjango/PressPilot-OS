import { PageContent } from '../../types';
import type { SectionContext } from '../../recipes/types';
import { tokenToCSS } from '../../utils/BlockHelpers';

/**
 * Final CTA Section - Phase 3 Token-Aware Version
 *
 * Strong call-to-action band at the bottom of the page.
 * Uses `contrast` background for high-contrast dark band (works with all palettes).
 *
 * Token mappings:
 * - Section padding: tokens.spacing.sectionPadding
 * - Button margin top: tokens.spacing.buttonMarginTop
 * - Button weight: tokens.typography.buttonWeight
 * - Button radius: tokens.radius.button
 */
export function getFinalCTASectionWithContext(ctx: SectionContext): string {
    const { tokens, render } = ctx;
    const cta = getCTAForIndustry(render.industry);

    // Token-driven values (Phase 3)
    const sectionPadding = tokens.spacing.sectionPadding;
    const buttonMarginTop = tokens.spacing.buttonMarginTop;
    const buttonWeight = tokens.typography.buttonWeight;
    const buttonRadius = tokens.radius.button;

    return `<!-- wp:group {"align":"full","style":{"spacing":{"padding":{"top":"${sectionPadding}","bottom":"${sectionPadding}"}}},"backgroundColor":"contrast","layout":{"type":"constrained"}} -->
<div class="wp-block-group alignfull has-contrast-background-color has-background" style="padding-top:${tokenToCSS(sectionPadding)};padding-bottom:${tokenToCSS(sectionPadding)}">
    <!-- wp:heading {"textAlign":"center","textColor":"base"} -->
    <h2 class="wp-block-heading has-text-align-center has-base-color has-text-color">${cta.headline}</h2>
    <!-- /wp:heading -->
    <!-- wp:paragraph {"align":"center","textColor":"base"} -->
    <p class="has-text-align-center has-base-color has-text-color">${cta.subheadline}</p>
    <!-- /wp:paragraph -->
    <!-- wp:buttons {"layout":{"type":"flex","justifyContent":"center"},"style":{"spacing":{"margin":{"top":"${buttonMarginTop}"}}}} -->
    <div class="wp-block-buttons is-layout-flex is-content-justification-center" style="margin-top:${tokenToCSS(buttonMarginTop)}">
        <!-- wp:button {"backgroundColor":"base","textColor":"contrast","style":{"typography":{"fontWeight":"${buttonWeight}"},"border":{"radius":"${buttonRadius}"}}} -->
        <div class="wp-block-button"><a class="wp-block-button__link has-contrast-color has-base-background-color has-text-color has-background wp-element-button" style="border-radius:${buttonRadius};font-weight:${buttonWeight}">${cta.buttonText}</a></div>
        <!-- /wp:button -->
    </div>
    <!-- /wp:buttons -->
</div>
<!-- /wp:group -->`;
}

/**
 * Final CTA Section - Legacy API (Backward Compatible)
 *
 * NOTE: Uses hardcoded default values. New code should use
 * getFinalCTASectionWithContext() with SectionContext.
 */
export function getFinalCTASection(content?: PageContent, industry?: string): string {
    const cta = getCTAForIndustry(industry);

    return `<!-- wp:group {"align":"full","style":{"spacing":{"padding":{"top":"var:preset|spacing|60","bottom":"var:preset|spacing|60"}}},"backgroundColor":"contrast","layout":{"type":"constrained"}} -->
<div class="wp-block-group alignfull has-contrast-background-color has-background" style="padding-top:var(--wp--preset--spacing--60);padding-bottom:var(--wp--preset--spacing--60)">
    <!-- wp:heading {"textAlign":"center","textColor":"base"} -->
    <h2 class="wp-block-heading has-text-align-center has-base-color has-text-color">${cta.headline}</h2>
    <!-- /wp:heading -->
    <!-- wp:paragraph {"align":"center","textColor":"base"} -->
    <p class="has-text-align-center has-base-color has-text-color">${cta.subheadline}</p>
    <!-- /wp:paragraph -->
    <!-- wp:buttons {"layout":{"type":"flex","justifyContent":"center"},"style":{"spacing":{"margin":{"top":"var:preset|spacing|40"}}}} -->
    <div class="wp-block-buttons is-layout-flex is-content-justification-center" style="margin-top:var(--wp--preset--spacing--40)">
        <!-- wp:button {"backgroundColor":"base","textColor":"contrast","style":{"typography":{"fontWeight":"600"}}} -->
        <div class="wp-block-button"><a class="wp-block-button__link has-contrast-color has-base-background-color has-text-color has-background wp-element-button" style="font-weight:600">${cta.buttonText}</a></div>
        <!-- /wp:button -->
    </div>
    <!-- /wp:buttons -->
</div>
<!-- /wp:group -->`;
}

interface CTA {
    headline: string;
    subheadline: string;
    buttonText: string;
}

function getCTAForIndustry(industry?: string): CTA {
    const defaults: CTA = {
        headline: 'Ready to Get Started?',
        subheadline: 'Take the next step today. We\'re here to help you succeed.',
        buttonText: 'Contact Us'
    };

    const industryCTAs: Record<string, CTA> = {
        'restaurant': {
            headline: 'Ready to Dine With Us?',
            subheadline: 'Book your table today and experience unforgettable flavors.',
            buttonText: 'Make a Reservation'
        },
        'restaurant_cafe': {
            headline: 'Come Visit Us',
            subheadline: 'Great food, warm atmosphere, and memories waiting to be made.',
            buttonText: 'See Our Menu'
        },
        'cafe': {
            headline: 'Stop By Today',
            subheadline: 'Fresh coffee, delicious pastries, and a cozy atmosphere await.',
            buttonText: 'Find Us'
        },
        'ecommerce': {
            headline: 'Start Shopping Today',
            subheadline: 'Discover products you\'ll love. Free shipping on orders over $50.',
            buttonText: 'Shop Now'
        },
        'saas_product': {
            headline: 'Start Your Free Trial',
            subheadline: 'No credit card required. See the difference in minutes.',
            buttonText: 'Get Started Free'
        },
        'service': {
            headline: 'Let\'s Work Together',
            subheadline: 'Get in touch for a free consultation. We\'d love to hear about your project.',
            buttonText: 'Request a Quote'
        },
        'local_store': {
            headline: 'Visit Us Today',
            subheadline: 'Stop by our location or give us a call. We\'re here to help.',
            buttonText: 'Get Directions'
        },
        'fitness': {
            headline: 'Start Your Fitness Journey',
            subheadline: 'Your first class is on us. No commitment, just results.',
            buttonText: 'Claim Free Class'
        },
        'portfolio': {
            headline: 'Let\'s Create Something Amazing',
            subheadline: 'Ready to bring your vision to life? Let\'s talk.',
            buttonText: 'Get in Touch'
        }
    };

    return industryCTAs[industry || ''] || defaults;
}

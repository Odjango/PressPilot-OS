/**
 * Ecommerce Featured Products Section - Generator 2.0 Phase 4
 *
 * 4-column grid of product cards with images, names, prices, and CTA buttons.
 *
 * Token mappings:
 * - Section padding: tokens.spacing.sectionPadding
 * - Card padding: tokens.spacing.cardPadding
 * - Card radius: tokens.radius.card
 * - Button radius: tokens.radius.button
 * - Button weight: tokens.typography.buttonWeight
 * - Badge weight: tokens.typography.badgeWeight (for prices)
 */

import type { SectionContext } from '../../recipes/types';
import { getModernImageUrl } from '../../utils/ImageProvider';
import { tokenToCSS } from '../../utils/BlockHelpers';

export function getEcommerceFeaturedProductsSectionWithContext(ctx: SectionContext): string {
    const { tokens, section } = ctx;

    // Token-driven values
    const sectionPadding = tokens.spacing.sectionPadding;
    const cardPadding = tokens.spacing.cardPadding;
    const cardRadius = tokens.radius.card;
    const buttonRadius = tokens.radius.button;
    const buttonWeight = tokens.typography.buttonWeight;
    const priceWeight = tokens.typography.badgeWeight;

    const products = [
        { name: 'Classic Tee', price: '$49.99' },
        { name: 'Premium Hoodie', price: '$89.99' },
        { name: 'Slim Fit Jeans', price: '$79.99' },
        { name: 'Canvas Sneakers', price: '$69.99' }
    ];

    const productCards = products.map((product, index) => `
        <!-- wp:column -->
        <div class="wp-block-column">
            <!-- wp:group {"style":{"border":{"radius":"${cardRadius}"},"spacing":{"padding":{"top":"${cardPadding}","right":"${cardPadding}","bottom":"${cardPadding}","left":"${cardPadding}"}}},"backgroundColor":"base","layout":{"type":"constrained"}} -->
            <div class="wp-block-group has-base-background-color has-background" style="border-radius:${cardRadius};padding-top:${tokenToCSS(cardPadding)};padding-right:${tokenToCSS(cardPadding)};padding-bottom:${tokenToCSS(cardPadding)};padding-left:${tokenToCSS(cardPadding)}">
                <!-- wp:image {"aspectRatio":"4/5","scale":"cover"} -->
                <figure class="wp-block-image"><img src="${getModernImageUrl('ecommerce', index)}" alt="${product.name}" style="aspect-ratio:4/5;object-fit:cover"/></figure>
                <!-- /wp:image -->
                <!-- wp:heading {"level":4,"textColor":"contrast","style":{"spacing":{"margin":{"top":"var:preset|spacing|20","bottom":"var:preset|spacing|10"}}}} -->
                <h4 class="wp-block-heading has-contrast-color has-text-color" style="margin-top:var(--wp--preset--spacing--20);margin-bottom:var(--wp--preset--spacing--10)">${product.name}</h4>
                <!-- /wp:heading -->
                <!-- wp:paragraph {"style":{"typography":{"fontWeight":"${priceWeight}"}},"textColor":"accent"} -->
                <p class="has-accent-color has-text-color" style="font-weight:${priceWeight}">${product.price}</p>
                <!-- /wp:paragraph -->
                <!-- wp:buttons {"style":{"spacing":{"margin":{"top":"var:preset|spacing|20"}}}} -->
                <div class="wp-block-buttons" style="margin-top:var(--wp--preset--spacing--20)">
                    <!-- wp:button {"width":100,"backgroundColor":"contrast","textColor":"base","style":{"border":{"radius":"${buttonRadius}"},"typography":{"fontWeight":"${buttonWeight}"}}} -->
                    <div class="wp-block-button has-custom-width wp-block-button__width-100"><a class="wp-block-button__link has-base-color has-contrast-background-color has-text-color has-background wp-element-button" style="border-radius:${buttonRadius};font-weight:${buttonWeight}">Add to Cart</a></div>
                    <!-- /wp:button -->
                </div>
                <!-- /wp:buttons -->
            </div>
            <!-- /wp:group -->
        </div>
        <!-- /wp:column -->`).join('\n');

    const bgColor = section.backgroundColor || 'base';

    return `<!-- wp:group {"align":"full","style":{"spacing":{"padding":{"top":"${sectionPadding}","bottom":"${sectionPadding}"}}},"backgroundColor":"${bgColor}","layout":{"type":"constrained"}} -->
<div class="wp-block-group alignfull has-${bgColor}-background-color has-background" style="padding-top:${tokenToCSS(sectionPadding)};padding-bottom:${tokenToCSS(sectionPadding)}">
    <!-- wp:heading {"textAlign":"center","textColor":"contrast"} -->
    <h2 class="wp-block-heading has-text-align-center has-contrast-color has-text-color">Featured Products</h2>
    <!-- /wp:heading -->
    <!-- wp:paragraph {"align":"center","textColor":"contrast-2"} -->
    <p class="has-text-align-center has-contrast-2-color has-text-color">Handpicked favorites just for you</p>
    <!-- /wp:paragraph -->
    <!-- wp:columns {"align":"wide","style":{"spacing":{"margin":{"top":"var:preset|spacing|50"}}}} -->
    <div class="wp-block-columns alignwide" style="margin-top:var(--wp--preset--spacing--50)">
        ${productCards}
    </div>
    <!-- /wp:columns -->
</div>
<!-- /wp:group -->`;
}

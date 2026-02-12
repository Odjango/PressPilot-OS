/**
 * Ecommerce Category Grid Section - Generator 2.0 Phase 4
 *
 * 4-column grid of category cards with images.
 * Each card links to a category page.
 *
 * Token mappings:
 * - Section padding: tokens.spacing.sectionPadding
 * - Card radius: tokens.radius.card
 * - Image radius: tokens.radius.image
 * - Column gap: tokens.spacing.columnGap
 */

import type { SectionContext } from '../../recipes/types';
import { getModernImageUrl } from '../../utils/ImageProvider';
import { tokenToCSS } from '../../utils/BlockHelpers';

export function getEcommerceCategoryGridSectionWithContext(ctx: SectionContext): string {
    const { tokens, section } = ctx;

    // Token-driven values
    const sectionPadding = tokens.spacing.sectionPadding;
    const cardRadius = tokens.radius.card;
    const imageRadius = tokens.radius.image;
    const columnGap = tokens.spacing.columnGap;

    const categories = [
        { name: 'New Arrivals', slug: 'new-arrivals' },
        { name: 'Best Sellers', slug: 'best-sellers' },
        { name: 'On Sale', slug: 'on-sale' },
        { name: 'Collections', slug: 'collections' }
    ];

    const categoryCards = categories.map((cat, index) => `
        <!-- wp:column -->
        <div class="wp-block-column">
            <!-- wp:group {"style":{"border":{"radius":"${cardRadius}"},"spacing":{"padding":{"top":"var:preset|spacing|30","bottom":"var:preset|spacing|30","left":"var:preset|spacing|30","right":"var:preset|spacing|30"}}},"backgroundColor":"base","layout":{"type":"constrained"}} -->
            <div class="wp-block-group has-base-background-color has-background" style="border-radius:${cardRadius};padding-top:var(--wp--preset--spacing--30);padding-bottom:var(--wp--preset--spacing--30);padding-left:var(--wp--preset--spacing--30);padding-right:var(--wp--preset--spacing--30)">
                <!-- wp:image {"aspectRatio":"1","scale":"cover","style":{"border":{"radius":"${imageRadius}"}}} -->
                <figure class="wp-block-image has-custom-border" style="border-radius:${tokenToCSS(imageRadius)}"><img src="${getModernImageUrl('ecommerce', index + 4)}" alt="${cat.name}" style="aspect-ratio:1;object-fit:cover"/></figure>
                <!-- /wp:image -->
                <!-- wp:heading {"textAlign":"center","level":3,"textColor":"contrast","style":{"spacing":{"margin":{"top":"var:preset|spacing|20"}}}} -->
                <h3 class="wp-block-heading has-text-align-center has-contrast-color has-text-color" style="margin-top:var(--wp--preset--spacing--20)">${cat.name}</h3>
                <!-- /wp:heading -->
            </div>
            <!-- /wp:group -->
        </div>
        <!-- /wp:column -->`).join('\n');

    const bgColor = section.backgroundColor || 'base-2';

    return `<!-- wp:group {"align":"full","style":{"spacing":{"padding":{"top":"${sectionPadding}","bottom":"${sectionPadding}"}}},"backgroundColor":"${bgColor}","layout":{"type":"constrained"}} -->
<div class="wp-block-group alignfull has-${bgColor}-background-color has-background" style="padding-top:${tokenToCSS(sectionPadding)};padding-bottom:${tokenToCSS(sectionPadding)}">
    <!-- wp:heading {"textAlign":"center","textColor":"contrast"} -->
    <h2 class="wp-block-heading has-text-align-center has-contrast-color has-text-color">Shop by Category</h2>
    <!-- /wp:heading -->
    <!-- wp:paragraph {"align":"center","textColor":"contrast-2"} -->
    <p class="has-text-align-center has-contrast-2-color has-text-color">Explore our curated collections</p>
    <!-- /wp:paragraph -->
    <!-- wp:columns {"align":"wide","style":{"spacing":{"blockGap":{"left":"${columnGap}"},"margin":{"top":"var:preset|spacing|50"}}}} -->
    <div class="wp-block-columns alignwide" style="margin-top:var(--wp--preset--spacing--50)">
        ${categoryCards}
    </div>
    <!-- /wp:columns -->
</div>
<!-- /wp:group -->`;
}

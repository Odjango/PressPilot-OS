import { PageContent } from '../../types';
import type { SectionContext } from '../../recipes/types';
import { getRestaurantStyleTokens } from './restaurantThemeTokens';
import { getRestaurantMenuImageStyle, type BrandMode } from '../../design-system';

/**
 * Restaurant Menu Preview Section - Phase 3 Token-Aware Version
 *
 * 6 food images in a 3x2 grid showcasing featured dishes.
 * Uses SectionContext for token-driven styling.
 *
 * Token mappings:
 * - Section padding: tokens.spacing.sectionPadding
 * - Column gap: tokens.spacing.columnGap
 * - Card padding: tokens.spacing.cardPadding
 * - Button margin top: tokens.spacing.buttonMarginTop
 * - Image radius: tokens.radius.image
 * - Button radius: tokens.radius.button
 * - Button weight: tokens.typography.buttonWeight
 */
export function getRestaurantMenuPreviewSectionWithContext(ctx: SectionContext): string {
    const { tokens, render } = ctx;

    // Token-driven values
    const sectionPadding = tokens.spacing.sectionPadding;
    const columnGap = tokens.spacing.columnGap;
    const cardPadding = tokens.spacing.cardPadding;
    const buttonMarginTop = tokens.spacing.buttonMarginTop;
    const imageRadius = tokens.radius.image;
    const buttonRadius = tokens.radius.button;
    const buttonWeight = tokens.typography.buttonWeight;

    // Get menu image style from brand mode
    const brandMode = (render.brandStyle || 'playful') as BrandMode;
    const menuImageStyle = getRestaurantMenuImageStyle(brandMode);

    const dishes = [
        { name: 'Grilled Salmon', image: 'https://placehold.co/200x200/f5f5f5/333333?text=Salmon' },
        { name: 'Prime Ribeye', image: 'https://placehold.co/200x200/f5f5f5/333333?text=Ribeye' },
        { name: 'Fresh Pasta', image: 'https://placehold.co/200x200/f5f5f5/333333?text=Pasta' },
        { name: 'Garden Salad', image: 'https://placehold.co/200x200/f5f5f5/333333?text=Salad' },
        { name: 'Roasted Chicken', image: 'https://placehold.co/200x200/f5f5f5/333333?text=Chicken' },
        { name: 'Seasonal Dessert', image: 'https://placehold.co/200x200/f5f5f5/333333?text=Dessert' }
    ];

    // Determine image class based on style (circular vs rectangular)
    const imageClass = menuImageStyle === 'circular' ? 'is-style-rounded' : '';

    const renderDishColumn = (dish: { name: string; image: string }) => `<!-- wp:column -->
        <div class="wp-block-column">
            <!-- wp:image {"align":"center","sizeSlug":"medium","className":"${imageClass}","style":{"border":{"radius":"${imageRadius}"}}} -->
            <figure class="wp-block-image aligncenter size-medium ${imageClass}"><img src="${dish.image}" alt="${dish.name}" class="wp-element-border" style="border-radius:${imageRadius}"/></figure>
            <!-- /wp:image -->
            <!-- wp:paragraph {"align":"center","textColor":"contrast","style":{"spacing":{"margin":{"top":"var:preset|spacing|20"}}}} -->
            <p class="has-text-align-center has-contrast-color has-text-color" style="margin-top:var(--wp--preset--spacing--20)"><strong>${dish.name}</strong></p>
            <!-- /wp:paragraph -->
        </div>
        <!-- /wp:column -->`;

    return `<!-- wp:group {"align":"full","style":{"spacing":{"padding":{"top":"${sectionPadding}","bottom":"${sectionPadding}"}}},"backgroundColor":"base-2","layout":{"type":"constrained"}} -->
<div class="wp-block-group alignfull has-base-2-background-color has-background" style="padding-top:var(--wp--preset--spacing--70);padding-bottom:var(--wp--preset--spacing--70)">
    <!-- wp:heading {"textAlign":"center","textColor":"contrast"} -->
    <h2 class="wp-block-heading has-text-align-center has-contrast-color has-text-color">Featured Delicacies</h2>
    <!-- /wp:heading -->
    <!-- wp:paragraph {"align":"center","textColor":"contrast-2"} -->
    <p class="has-text-align-center has-contrast-2-color has-text-color">Discover our chef's signature creations</p>
    <!-- /wp:paragraph -->

    <!-- wp:columns {"align":"wide","style":{"spacing":{"margin":{"top":"${columnGap}"},"blockGap":{"left":"${columnGap}"}}}} -->
    <div class="wp-block-columns alignwide" style="margin-top:var(--wp--preset--spacing--50)">
        ${renderDishColumn(dishes[0])}
        ${renderDishColumn(dishes[1])}
        ${renderDishColumn(dishes[2])}
    </div>
    <!-- /wp:columns -->

    <!-- wp:columns {"align":"wide","style":{"spacing":{"margin":{"top":"${cardPadding}"},"blockGap":{"left":"${columnGap}"}}}} -->
    <div class="wp-block-columns alignwide" style="margin-top:var(--wp--preset--spacing--40)">
        ${renderDishColumn(dishes[3])}
        ${renderDishColumn(dishes[4])}
        ${renderDishColumn(dishes[5])}
    </div>
    <!-- /wp:columns -->

    <!-- wp:buttons {"layout":{"type":"flex","justifyContent":"center"},"style":{"spacing":{"margin":{"top":"${buttonMarginTop}"}}}} -->
    <div class="wp-block-buttons is-layout-flex is-content-justification-center" style="margin-top:var(--wp--preset--spacing--50)">
        <!-- wp:button {"backgroundColor":"accent","textColor":"base","style":{"typography":{"fontWeight":"${buttonWeight}"},"border":{"radius":"${buttonRadius}"}}} -->
        <div class="wp-block-button"><a class="wp-block-button__link has-base-color has-accent-background-color has-text-color has-background wp-element-button" style="border-radius:${buttonRadius};font-weight:${buttonWeight}">View Full Menu</a></div>
        <!-- /wp:button -->
    </div>
    <!-- /wp:buttons -->
</div>
<!-- /wp:group -->`;
}

/**
 * Restaurant Menu Preview Section - Legacy API (Backward Compatible)
 *
 * NOTE: Uses getRestaurantStyleTokens() internally. New code should use
 * getRestaurantMenuPreviewSectionWithContext() with SectionContext.
 */
export function getRestaurantMenuPreviewSection(content?: PageContent, brandStyle?: string): string {
    const tokens = getRestaurantStyleTokens(brandStyle);

    const dishes = [
        { name: 'Grilled Salmon', image: 'https://placehold.co/200x200/f5f5f5/333333?text=Salmon' },
        { name: 'Prime Ribeye', image: 'https://placehold.co/200x200/f5f5f5/333333?text=Ribeye' },
        { name: 'Fresh Pasta', image: 'https://placehold.co/200x200/f5f5f5/333333?text=Pasta' },
        { name: 'Garden Salad', image: 'https://placehold.co/200x200/f5f5f5/333333?text=Salad' },
        { name: 'Roasted Chicken', image: 'https://placehold.co/200x200/f5f5f5/333333?text=Chicken' },
        { name: 'Seasonal Dessert', image: 'https://placehold.co/200x200/f5f5f5/333333?text=Dessert' }
    ];

    // Determine image class based on style (circular vs rectangular)
    const imageClass = tokens.menuImageStyle === 'circular' ? 'is-style-rounded' : '';

    const renderDishColumn = (dish: { name: string; image: string }) => `<!-- wp:column -->
        <div class="wp-block-column">
            <!-- wp:image {"align":"center","sizeSlug":"medium","className":"${imageClass}","style":{"border":{"radius":"${tokens.imageRadius}"}}} -->
            <figure class="wp-block-image aligncenter size-medium ${imageClass}"><img src="${dish.image}" alt="${dish.name}" class="wp-element-border" style="border-radius:${tokens.imageRadius}"/></figure>
            <!-- /wp:image -->
            <!-- wp:paragraph {"align":"center","textColor":"contrast","style":{"spacing":{"margin":{"top":"var:preset|spacing|20"}}}} -->
            <p class="has-text-align-center has-contrast-color has-text-color" style="margin-top:var(--wp--preset--spacing--20)"><strong>${dish.name}</strong></p>
            <!-- /wp:paragraph -->
        </div>
        <!-- /wp:column -->`;

    return `<!-- wp:group {"align":"full","style":{"spacing":{"padding":{"top":"${tokens.sectionPadding}","bottom":"${tokens.sectionPadding}"}}},"backgroundColor":"base-2","layout":{"type":"constrained"}} -->
<div class="wp-block-group alignfull has-base-2-background-color has-background" style="padding-top:var(--wp--preset--spacing--70);padding-bottom:var(--wp--preset--spacing--70)">
    <!-- wp:heading {"textAlign":"center","textColor":"contrast"} -->
    <h2 class="wp-block-heading has-text-align-center has-contrast-color has-text-color">Featured Delicacies</h2>
    <!-- /wp:heading -->
    <!-- wp:paragraph {"align":"center","textColor":"contrast-2"} -->
    <p class="has-text-align-center has-contrast-2-color has-text-color">Discover our chef's signature creations</p>
    <!-- /wp:paragraph -->

    <!-- wp:columns {"align":"wide","style":{"spacing":{"margin":{"top":"${tokens.columnGap}"},"blockGap":{"left":"${tokens.columnGap}"}}}} -->
    <div class="wp-block-columns alignwide" style="margin-top:var(--wp--preset--spacing--50)">
        ${renderDishColumn(dishes[0])}
        ${renderDishColumn(dishes[1])}
        ${renderDishColumn(dishes[2])}
    </div>
    <!-- /wp:columns -->

    <!-- wp:columns {"align":"wide","style":{"spacing":{"margin":{"top":"${tokens.cardPadding}"},"blockGap":{"left":"${tokens.columnGap}"}}}} -->
    <div class="wp-block-columns alignwide" style="margin-top:var(--wp--preset--spacing--40)">
        ${renderDishColumn(dishes[3])}
        ${renderDishColumn(dishes[4])}
        ${renderDishColumn(dishes[5])}
    </div>
    <!-- /wp:columns -->

    <!-- wp:buttons {"layout":{"type":"flex","justifyContent":"center"},"style":{"spacing":{"margin":{"top":"${tokens.buttonMarginTop}"}}}} -->
    <div class="wp-block-buttons is-layout-flex is-content-justification-center" style="margin-top:var(--wp--preset--spacing--50)">
        <!-- wp:button {"backgroundColor":"accent","textColor":"base","style":{"typography":{"fontWeight":"${tokens.buttonWeight}"},"border":{"radius":"${tokens.buttonRadius}"}}} -->
        <div class="wp-block-button"><a class="wp-block-button__link has-base-color has-accent-background-color has-text-color has-background wp-element-button" style="border-radius:${tokens.buttonRadius};font-weight:${tokens.buttonWeight}">View Full Menu</a></div>
        <!-- /wp:button -->
    </div>
    <!-- /wp:buttons -->
</div>
<!-- /wp:group -->`;
}

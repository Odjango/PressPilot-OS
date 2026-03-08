import { PageContent } from '../../types';
import type { SectionContext } from '../../recipes/types';
import { getRestaurantStyleTokens } from './restaurantThemeTokens';
import { getRestaurantMenuImageStyle, type BrandMode } from '../../design-system';
import { tokenToCSS } from '../../utils/BlockHelpers';
import { getRestaurantProfile } from './restaurant-profile';

interface MenuCategoryPreview {
    title: string;
    items: Array<{ name: string; description: string }>;
}

function buildCategoryPreview(content?: PageContent): MenuCategoryPreview[] {
    const menus = content?.menus || [];
    if (menus.length > 0) {
        return menus.slice(0, 3).map((menu) => ({
            title: menu.title || 'Featured',
            items: (menu.items || []).slice(0, 2).map((item) => ({
                name: item.name || 'Chef Selection',
                description: item.description || 'Prepared fresh daily.'
            }))
        }));
    }

    return [
        {
            title: 'Appetizers',
            items: [
                { name: 'Roasted Burrata', description: 'Tomato confit, basil oil, grilled sourdough.' },
                { name: 'Crispy Calamari', description: 'Lemon aioli and charred citrus.' }
            ]
        },
        {
            title: 'Mains',
            items: [
                { name: 'Braised Short Rib', description: 'Parsnip puree, red wine glaze.' },
                { name: 'Herb Seared Salmon', description: 'Warm farro salad, citrus beurre blanc.' }
            ]
        },
        {
            title: 'Desserts',
            items: [
                { name: 'Dark Chocolate Torte', description: 'Sea salt caramel and whipped creme.' },
                { name: 'Seasonal Fruit Tart', description: 'Vanilla bean pastry cream.' }
            ]
        }
    ];
}

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
    const profile = getRestaurantProfile(render.content, render.businessType);

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
    const categories = buildCategoryPreview(render.content);

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

    const renderCategory = (category: MenuCategoryPreview) => `<!-- wp:column -->
        <div class="wp-block-column">
            <!-- wp:group {"style":{"spacing":{"padding":{"top":"${cardPadding}","right":"${cardPadding}","bottom":"${cardPadding}","left":"${cardPadding}"}},"border":{"radius":"${tokens.radius.card}"}},"backgroundColor":"base"} -->
            <div class="wp-block-group has-base-background-color has-background" style="border-radius:${tokens.radius.card};padding-top:${tokenToCSS(cardPadding)};padding-right:${tokenToCSS(cardPadding)};padding-bottom:${tokenToCSS(cardPadding)};padding-left:${tokenToCSS(cardPadding)}">
                <!-- wp:heading {"level":4,"textColor":"contrast"} -->
                <h4 class="wp-block-heading has-contrast-color has-text-color">${category.title}</h4>
                <!-- /wp:heading -->
                ${category.items
                    .map(
                        (item) => `<!-- wp:paragraph {"textColor":"contrast"} -->
                <p class="has-contrast-color has-text-color"><strong>${item.name}</strong></p>
                <!-- /wp:paragraph -->
                <!-- wp:paragraph {"textColor":"contrast-2","fontSize":"small"} -->
                <p class="has-contrast-2-color has-text-color has-small-font-size">${item.description}</p>
                <!-- /wp:paragraph -->`
                    )
                    .join('\n')}
            </div>
            <!-- /wp:group -->
        </div>
        <!-- /wp:column -->`;

    const renderDishColumn = (dish: { name: string; image: string }) => `<!-- wp:column -->
        <div class="wp-block-column">
            <!-- wp:image {"align":"center","sizeSlug":"medium","className":"${imageClass}","style":{"border":{"radius":"${imageRadius}"}}} -->
            <figure class="wp-block-image aligncenter size-medium ${imageClass} has-custom-border" style="border-radius:${tokenToCSS(imageRadius)}"><img src="${dish.image}" alt="${dish.name}"/></figure>
            <!-- /wp:image -->
            <!-- wp:paragraph {"align":"center","textColor":"contrast","style":{"spacing":{"margin":{"top":"var:preset|spacing|20"}}}} -->
            <p class="has-text-align-center has-contrast-color has-text-color" style="margin-top:var(--wp--preset--spacing--20)"><strong>${dish.name}</strong></p>
            <!-- /wp:paragraph -->
        </div>
        <!-- /wp:column -->`;

    return `<!-- wp:group {"align":"full","style":{"spacing":{"padding":{"top":"${sectionPadding}","bottom":"${sectionPadding}"}}},"backgroundColor":"base-2","layout":{"type":"constrained"}} -->
<div class="wp-block-group alignfull has-base-2-background-color has-background" style="padding-top:${tokenToCSS(sectionPadding)};padding-bottom:${tokenToCSS(sectionPadding)}">
    <!-- wp:heading {"textAlign":"center","textColor":"contrast"} -->
    <h2 class="wp-block-heading has-text-align-center has-contrast-color has-text-color">Menu Highlights</h2>
    <!-- /wp:heading -->
    <!-- wp:paragraph {"align":"center","textColor":"contrast-2"} -->
    <p class="has-text-align-center has-contrast-2-color has-text-color">${profile.gallerySubheadline}</p>
    <!-- /wp:paragraph -->

    <!-- wp:columns {"align":"wide","style":{"spacing":{"margin":{"top":"${columnGap}"},"blockGap":{"left":"${columnGap}"}}}} -->
    <div class="wp-block-columns alignwide" style="margin-top:${tokenToCSS(columnGap)}">
        ${renderCategory(categories[0])}
        ${renderCategory(categories[1])}
        ${renderCategory(categories[2])}
    </div>
    <!-- /wp:columns -->

    <!-- wp:columns {"align":"wide","style":{"spacing":{"margin":{"top":"${cardPadding}"},"blockGap":{"left":"${columnGap}"}}}} -->
    <div class="wp-block-columns alignwide" style="margin-top:${tokenToCSS(cardPadding)}">
        ${renderDishColumn(dishes[3])}
        ${renderDishColumn(dishes[4])}
        ${renderDishColumn(dishes[5])}
    </div>
    <!-- /wp:columns -->

    <!-- wp:buttons {"layout":{"type":"flex","justifyContent":"center"},"style":{"spacing":{"margin":{"top":"${buttonMarginTop}"}}}} -->
    <div class="wp-block-buttons is-layout-flex is-content-justification-center" style="margin-top:${tokenToCSS(buttonMarginTop)}">
        <!-- wp:button {"backgroundColor":"contrast","textColor":"base","style":{"typography":{"fontWeight":"${buttonWeight}"},"border":{"radius":"${buttonRadius}"}}} -->
        <div class="wp-block-button"><a class="wp-block-button__link has-base-color has-contrast-background-color has-text-color has-background wp-element-button" style="border-radius:${buttonRadius};font-weight:${buttonWeight}">View Full Menu</a></div>
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
    const categories = buildCategoryPreview(content);

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

    const renderCategory = (category: MenuCategoryPreview) => `<!-- wp:column -->
        <div class="wp-block-column">
            <!-- wp:group {"style":{"spacing":{"padding":{"top":"${tokens.cardPadding}","right":"${tokens.cardPadding}","bottom":"${tokens.cardPadding}","left":"${tokens.cardPadding}"}},"border":{"radius":"${tokens.cardRadius}"}},"backgroundColor":"base"} -->
            <div class="wp-block-group has-base-background-color has-background" style="border-radius:${tokens.cardRadius};padding-top:${tokenToCSS(tokens.cardPadding)};padding-right:${tokenToCSS(tokens.cardPadding)};padding-bottom:${tokenToCSS(tokens.cardPadding)};padding-left:${tokenToCSS(tokens.cardPadding)}">
                <!-- wp:heading {"level":4,"textColor":"contrast"} -->
                <h4 class="wp-block-heading has-contrast-color has-text-color">${category.title}</h4>
                <!-- /wp:heading -->
                ${category.items
                    .map(
                        (item) => `<!-- wp:paragraph {"textColor":"contrast"} -->
                <p class="has-contrast-color has-text-color"><strong>${item.name}</strong></p>
                <!-- /wp:paragraph -->
                <!-- wp:paragraph {"textColor":"contrast-2","fontSize":"small"} -->
                <p class="has-contrast-2-color has-text-color has-small-font-size">${item.description}</p>
                <!-- /wp:paragraph -->`
                    )
                    .join('\n')}
            </div>
            <!-- /wp:group -->
        </div>
        <!-- /wp:column -->`;

    const renderDishColumn = (dish: { name: string; image: string }) => `<!-- wp:column -->
        <div class="wp-block-column">
            <!-- wp:image {"align":"center","sizeSlug":"medium","className":"${imageClass}","style":{"border":{"radius":"${tokens.imageRadius}"}}} -->
            <figure class="wp-block-image aligncenter size-medium ${imageClass} has-custom-border" style="border-radius:${tokenToCSS(tokens.imageRadius)}"><img src="${dish.image}" alt="${dish.name}"/></figure>
            <!-- /wp:image -->
            <!-- wp:paragraph {"align":"center","textColor":"contrast","style":{"spacing":{"margin":{"top":"var:preset|spacing|20"}}}} -->
            <p class="has-text-align-center has-contrast-color has-text-color" style="margin-top:var(--wp--preset--spacing--20)"><strong>${dish.name}</strong></p>
            <!-- /wp:paragraph -->
        </div>
        <!-- /wp:column -->`;

    return `<!-- wp:group {"align":"full","style":{"spacing":{"padding":{"top":"${tokens.sectionPadding}","bottom":"${tokens.sectionPadding}"}}},"backgroundColor":"base-2","layout":{"type":"constrained"}} -->
<div class="wp-block-group alignfull has-base-2-background-color has-background" style="padding-top:${tokenToCSS(tokens.sectionPadding)};padding-bottom:${tokenToCSS(tokens.sectionPadding)}">
    <!-- wp:heading {"textAlign":"center","textColor":"contrast"} -->
    <h2 class="wp-block-heading has-text-align-center has-contrast-color has-text-color">Menu Highlights</h2>
    <!-- /wp:heading -->
    <!-- wp:paragraph {"align":"center","textColor":"contrast-2"} -->
    <p class="has-text-align-center has-contrast-2-color has-text-color">Explore appetizers, mains, and desserts curated by our team.</p>
    <!-- /wp:paragraph -->

    <!-- wp:columns {"align":"wide","style":{"spacing":{"margin":{"top":"${tokens.columnGap}"},"blockGap":{"left":"${tokens.columnGap}"}}}} -->
    <div class="wp-block-columns alignwide" style="margin-top:${tokenToCSS(tokens.columnGap)}">
        ${renderCategory(categories[0])}
        ${renderCategory(categories[1])}
        ${renderCategory(categories[2])}
    </div>
    <!-- /wp:columns -->

    <!-- wp:columns {"align":"wide","style":{"spacing":{"margin":{"top":"${tokens.cardPadding}"},"blockGap":{"left":"${tokens.columnGap}"}}}} -->
    <div class="wp-block-columns alignwide" style="margin-top:${tokenToCSS(tokens.cardPadding)}">
        ${renderDishColumn(dishes[3])}
        ${renderDishColumn(dishes[4])}
        ${renderDishColumn(dishes[5])}
    </div>
    <!-- /wp:columns -->

    <!-- wp:buttons {"layout":{"type":"flex","justifyContent":"center"},"style":{"spacing":{"margin":{"top":"${tokens.buttonMarginTop}"}}}} -->
    <div class="wp-block-buttons is-layout-flex is-content-justification-center" style="margin-top:${tokenToCSS(tokens.buttonMarginTop)}">
        <!-- wp:button {"backgroundColor":"contrast","textColor":"base","style":{"typography":{"fontWeight":"${tokens.buttonWeight}"},"border":{"radius":"${tokens.buttonRadius}"}}} -->
        <div class="wp-block-button"><a class="wp-block-button__link has-base-color has-contrast-background-color has-text-color has-background wp-element-button" style="border-radius:${tokens.buttonRadius};font-weight:${tokens.buttonWeight}">View Full Menu</a></div>
        <!-- /wp:button -->
    </div>
    <!-- /wp:buttons -->
</div>
<!-- /wp:group -->`;
}

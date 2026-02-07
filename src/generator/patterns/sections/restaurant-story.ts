import { PageContent } from '../../types';
import type { SectionContext } from '../../recipes/types';
import { getRestaurantStyleTokens } from './restaurantThemeTokens';

/**
 * Restaurant Story Section - Phase 3 Token-Aware Version
 *
 * Image + text layout showcasing the restaurant's story and heritage.
 * Uses SectionContext for token-driven styling.
 *
 * Token mappings:
 * - Section padding: tokens.spacing.sectionPadding
 * - Column gap: tokens.spacing.columnGap
 * - Button margin top: tokens.spacing.buttonMarginTop
 * - Story image radius: tokens.radius.image
 * - Button radius: tokens.radius.button
 * - Button weight: tokens.typography.buttonWeight
 */
export function getRestaurantStorySectionWithContext(ctx: SectionContext): string {
    const { tokens, render } = ctx;
    const businessName = render.content?.business_name || render.content?.hero_title || 'Our Restaurant';

    // Token-driven values
    const sectionPadding = tokens.spacing.sectionPadding;
    const columnGap = tokens.spacing.columnGap;
    const buttonMarginTop = tokens.spacing.buttonMarginTop;
    const storyImageRadius = tokens.radius.image;
    const buttonRadius = tokens.radius.button;
    const buttonWeight = tokens.typography.buttonWeight;

    return `<!-- wp:group {"align":"full","style":{"spacing":{"padding":{"top":"${sectionPadding}","bottom":"${sectionPadding}"}}},"backgroundColor":"base","layout":{"type":"constrained"}} -->
<div class="wp-block-group alignfull has-base-background-color has-background" style="padding-top:var(--wp--preset--spacing--70);padding-bottom:var(--wp--preset--spacing--70)">
    <!-- wp:columns {"align":"wide","style":{"spacing":{"blockGap":{"left":"${columnGap}"}}}} -->
    <div class="wp-block-columns alignwide">
        <!-- wp:column {"width":"40%"} -->
        <div class="wp-block-column" style="flex-basis:40%">
            <!-- wp:image {"sizeSlug":"large","style":{"border":{"radius":"${storyImageRadius}"}}} -->
            <figure class="wp-block-image size-large has-custom-border"><img src="https://placehold.co/600x500/f5f5f5/333333?text=Our+Story" alt="Our Story" style="border-radius:${storyImageRadius}"/></figure>
            <!-- /wp:image -->
        </div>
        <!-- /wp:column -->
        <!-- wp:column {"width":"60%","verticalAlignment":"center"} -->
        <div class="wp-block-column is-vertically-aligned-center" style="flex-basis:60%">
            <!-- wp:paragraph {"textColor":"accent","fontSize":"small"} -->
            <p class="has-accent-color has-text-color has-small-font-size"><strong>SINCE 2010</strong></p>
            <!-- /wp:paragraph -->
            <!-- wp:heading {"textColor":"contrast","style":{"typography":{"lineHeight":"1.2"}}} -->
            <h2 class="wp-block-heading has-contrast-color has-text-color" style="line-height:1.2">The ${businessName} Story</h2>
            <!-- /wp:heading -->
            <!-- wp:paragraph {"textColor":"contrast-2","style":{"spacing":{"margin":{"top":"var:preset|spacing|30"}}}} -->
            <p class="has-contrast-2-color has-text-color" style="margin-top:var(--wp--preset--spacing--30)">Every great restaurant has a story. Ours began with a simple passion: serving food that brings people together. From our family kitchen to your table, we've dedicated ourselves to crafting memorable dining experiences.</p>
            <!-- /wp:paragraph -->
            <!-- wp:paragraph {"textColor":"contrast-2"} -->
            <p class="has-contrast-2-color has-text-color">We source the finest local ingredients, honor time-tested recipes, and believe that great food should be shared with great company. Whether you're celebrating a special occasion or enjoying a casual meal, we're honored to be part of your story.</p>
            <!-- /wp:paragraph -->
            <!-- wp:buttons {"style":{"spacing":{"margin":{"top":"${buttonMarginTop}"}}}} -->
            <div class="wp-block-buttons" style="margin-top:var(--wp--preset--spacing--40)">
                <!-- wp:button {"backgroundColor":"accent","textColor":"base","style":{"typography":{"fontWeight":"${buttonWeight}"},"border":{"radius":"${buttonRadius}"}}} -->
                <div class="wp-block-button"><a class="wp-block-button__link has-base-color has-accent-background-color has-text-color has-background wp-element-button" style="border-radius:${buttonRadius};font-weight:${buttonWeight}">Learn More About Us</a></div>
                <!-- /wp:button -->
            </div>
            <!-- /wp:buttons -->
        </div>
        <!-- /wp:column -->
    </div>
    <!-- /wp:columns -->
</div>
<!-- /wp:group -->`;
}

/**
 * Restaurant Story Section - Legacy API (Backward Compatible)
 *
 * NOTE: Uses getRestaurantStyleTokens() internally. New code should use
 * getRestaurantStorySectionWithContext() with SectionContext.
 */
export function getRestaurantStorySection(content?: PageContent, brandStyle?: string): string {
    const businessName = content?.business_name || content?.hero_title || 'Our Restaurant';
    const tokens = getRestaurantStyleTokens(brandStyle);

    return `<!-- wp:group {"align":"full","style":{"spacing":{"padding":{"top":"${tokens.sectionPadding}","bottom":"${tokens.sectionPadding}"}}},"backgroundColor":"base","layout":{"type":"constrained"}} -->
<div class="wp-block-group alignfull has-base-background-color has-background" style="padding-top:var(--wp--preset--spacing--70);padding-bottom:var(--wp--preset--spacing--70)">
    <!-- wp:columns {"align":"wide","style":{"spacing":{"blockGap":{"left":"${tokens.columnGap}"}}}} -->
    <div class="wp-block-columns alignwide">
        <!-- wp:column {"width":"40%"} -->
        <div class="wp-block-column" style="flex-basis:40%">
            <!-- wp:image {"sizeSlug":"large","style":{"border":{"radius":"${tokens.storyImageRadius}"}}} -->
            <figure class="wp-block-image size-large has-custom-border"><img src="https://placehold.co/600x500/f5f5f5/333333?text=Our+Story" alt="Our Story" style="border-radius:${tokens.storyImageRadius}"/></figure>
            <!-- /wp:image -->
        </div>
        <!-- /wp:column -->
        <!-- wp:column {"width":"60%","verticalAlignment":"center"} -->
        <div class="wp-block-column is-vertically-aligned-center" style="flex-basis:60%">
            <!-- wp:paragraph {"textColor":"accent","fontSize":"small"} -->
            <p class="has-accent-color has-text-color has-small-font-size"><strong>SINCE 2010</strong></p>
            <!-- /wp:paragraph -->
            <!-- wp:heading {"textColor":"contrast","style":{"typography":{"lineHeight":"1.2"}}} -->
            <h2 class="wp-block-heading has-contrast-color has-text-color" style="line-height:1.2">The ${businessName} Story</h2>
            <!-- /wp:heading -->
            <!-- wp:paragraph {"textColor":"contrast-2","style":{"spacing":{"margin":{"top":"var:preset|spacing|30"}}}} -->
            <p class="has-contrast-2-color has-text-color" style="margin-top:var(--wp--preset--spacing--30)">Every great restaurant has a story. Ours began with a simple passion: serving food that brings people together. From our family kitchen to your table, we've dedicated ourselves to crafting memorable dining experiences.</p>
            <!-- /wp:paragraph -->
            <!-- wp:paragraph {"textColor":"contrast-2"} -->
            <p class="has-contrast-2-color has-text-color">We source the finest local ingredients, honor time-tested recipes, and believe that great food should be shared with great company. Whether you're celebrating a special occasion or enjoying a casual meal, we're honored to be part of your story.</p>
            <!-- /wp:paragraph -->
            <!-- wp:buttons {"style":{"spacing":{"margin":{"top":"${tokens.buttonMarginTop}"}}}} -->
            <div class="wp-block-buttons" style="margin-top:var(--wp--preset--spacing--40)">
                <!-- wp:button {"backgroundColor":"accent","textColor":"base","style":{"typography":{"fontWeight":"${tokens.buttonWeight}"},"border":{"radius":"${tokens.buttonRadius}"}}} -->
                <div class="wp-block-button"><a class="wp-block-button__link has-base-color has-accent-background-color has-text-color has-background wp-element-button" style="border-radius:${tokens.buttonRadius};font-weight:${tokens.buttonWeight}">Learn More About Us</a></div>
                <!-- /wp:button -->
            </div>
            <!-- /wp:buttons -->
        </div>
        <!-- /wp:column -->
    </div>
    <!-- /wp:columns -->
</div>
<!-- /wp:group -->`;
}

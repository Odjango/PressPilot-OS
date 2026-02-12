import type { SectionContext } from '../../recipes/types';
import { tokenToCSS } from '../../utils/BlockHelpers';

export function getPortfolioHeroSectionWithContext(ctx: SectionContext): string {
    const { tokens, section } = ctx;
    const sectionPadding = tokens.spacing.sectionPadding;
    const buttonRadius = tokens.radius.button;
    const buttonWeight = tokens.typography.buttonWeight;
    const bgColor = section.backgroundColor || 'base';

    return `<!-- wp:group {"align":"full","backgroundColor":"${bgColor}","style":{"spacing":{"padding":{"top":"${sectionPadding}","bottom":"${sectionPadding}"}}},"layout":{"type":"constrained"}} -->
<div class="wp-block-group alignfull has-${bgColor}-background-color has-background" style="padding-top:${tokenToCSS(sectionPadding)};padding-bottom:${tokenToCSS(sectionPadding)}">
    <!-- wp:columns {"align":"wide","verticalAlignment":"center","style":{"spacing":{"blockGap":{"left":"${tokens.spacing.columnGap}"}}}} -->
    <div class="wp-block-columns alignwide are-vertically-aligned-center">
        <!-- wp:column {"width":"60%"} -->
        <div class="wp-block-column" style="flex-basis:60%">
            <!-- wp:paragraph {"textColor":"accent","fontSize":"small"} -->
            <p class="has-accent-color has-text-color has-small-font-size"><strong>{{title}}</strong></p>
            <!-- /wp:paragraph -->
            <!-- wp:heading {"level":1,"textColor":"contrast"} -->
            <h1 class="wp-block-heading has-contrast-color has-text-color">{{name}}</h1>
            <!-- /wp:heading -->
            <!-- wp:paragraph {"textColor":"contrast-2"} -->
            <p class="has-contrast-2-color has-text-color">{{tagline}}</p>
            <!-- /wp:paragraph -->
            <!-- wp:buttons {"style":{"spacing":{"margin":{"top":"${tokens.spacing.buttonMarginTop}"}}}} -->
            <div class="wp-block-buttons" style="margin-top:${tokenToCSS(tokens.spacing.buttonMarginTop)}">
                <!-- wp:button {"backgroundColor":"accent","textColor":"base","style":{"border":{"radius":"${buttonRadius}"},"typography":{"fontWeight":"${buttonWeight}"}}} -->
                <div class="wp-block-button"><a class="wp-block-button__link has-base-color has-accent-background-color has-text-color has-background wp-element-button" style="border-radius:${buttonRadius};font-weight:${buttonWeight}">View Work</a></div>
                <!-- /wp:button -->
                <!-- wp:button {"className":"is-style-outline","borderColor":"accent","textColor":"accent","style":{"border":{"width":"2px","radius":"${buttonRadius}"}}} -->
                <div class="wp-block-button is-style-outline"><a class="wp-block-button__link has-accent-color has-text-color has-border-color has-accent-border-color wp-element-button" style="border-width:2px;border-radius:${buttonRadius}">Contact</a></div>
                <!-- /wp:button -->
            </div>
            <!-- /wp:buttons -->
        </div>
        <!-- /wp:column -->
        <!-- wp:column {"width":"40%"} -->
        <div class="wp-block-column" style="flex-basis:40%">
            <!-- wp:image {"sizeSlug":"large","linkDestination":"none","style":{"border":{"radius":"${tokens.radius.image}"}}} -->
            <figure class="wp-block-image size-large"><img src="https://placehold.co/900x900" alt="{{name}} portrait" style="border-radius:${tokens.radius.image}"/></figure>
            <!-- /wp:image -->
        </div>
        <!-- /wp:column -->
    </div>
    <!-- /wp:columns -->
</div>
<!-- /wp:group -->`;
}

import type { SectionContext } from '../../recipes/types';
import { tokenToCSS } from '../../utils/BlockHelpers';

export function getLocalAboutSectionWithContext(ctx: SectionContext): string {
    const { tokens, section } = ctx;
    const sectionPadding = tokens.spacing.sectionPadding;
    const cardPadding = tokens.spacing.cardPadding;
    const bgColor = section.backgroundColor || 'base-2';

    return `<!-- wp:group {"align":"full","backgroundColor":"${bgColor}","style":{"spacing":{"padding":{"top":"${sectionPadding}","bottom":"${sectionPadding}"}}},"layout":{"type":"constrained"}} -->
<div class="wp-block-group alignfull has-${bgColor}-background-color has-background" style="padding-top:${tokenToCSS(sectionPadding)};padding-bottom:${tokenToCSS(sectionPadding)}">
    <!-- wp:columns {"align":"wide","verticalAlignment":"center","style":{"spacing":{"blockGap":{"left":"${tokens.spacing.columnGap}"}}}} -->
    <div class="wp-block-columns alignwide are-vertically-aligned-center">
        <!-- wp:column {"width":"44%"} -->
        <div class="wp-block-column" style="flex-basis:44%">
            <!-- wp:image {"sizeSlug":"large","linkDestination":"none","style":{"border":{"radius":"${tokens.radius.image}"}}} -->
            <figure class="wp-block-image size-large"><img src="https://placehold.co/900x1100" alt="{{business_name}} storefront" style="border-radius:${tokens.radius.image}"/></figure>
            <!-- /wp:image -->
        </div>
        <!-- /wp:column -->
        <!-- wp:column {"width":"56%"} -->
        <div class="wp-block-column" style="flex-basis:56%">
            <!-- wp:paragraph {"textColor":"accent","fontSize":"small"} -->
            <p class="has-accent-color has-text-color has-small-font-size"><strong>About {{business_name}}</strong></p>
            <!-- /wp:paragraph -->
            <!-- wp:heading {"textColor":"contrast"} -->
            <h2 class="wp-block-heading has-contrast-color has-text-color">Trusted Local Experts for {{service_area}}</h2>
            <!-- /wp:heading -->
            <!-- wp:paragraph {"textColor":"contrast-2"} -->
            <p class="has-contrast-2-color has-text-color">{{description}}</p>
            <!-- /wp:paragraph -->
            <!-- wp:group {"backgroundColor":"base","style":{"border":{"radius":"${tokens.radius.card}"},"spacing":{"padding":{"top":"${cardPadding}","right":"${cardPadding}","bottom":"${cardPadding}","left":"${cardPadding}"},"margin":{"top":"${tokens.spacing.cardPadding}"}}},"layout":{"type":"constrained"}} -->
            <div class="wp-block-group has-base-background-color has-background" style="border-radius:${tokens.radius.card};margin-top:${tokenToCSS(tokens.spacing.cardPadding)};padding-top:${tokenToCSS(cardPadding)};padding-right:${tokenToCSS(cardPadding)};padding-bottom:${tokenToCSS(cardPadding)};padding-left:${tokenToCSS(cardPadding)}">
                <!-- wp:paragraph {"textColor":"contrast"} -->
                <p class="has-contrast-color has-text-color"><strong>Years in business:</strong> {{years_in_business}}</p>
                <!-- /wp:paragraph -->
                <!-- wp:paragraph {"textColor":"contrast"} -->
                <p class="has-contrast-color has-text-color"><strong>Service area:</strong> {{service_area}}</p>
                <!-- /wp:paragraph -->
            </div>
            <!-- /wp:group -->
        </div>
        <!-- /wp:column -->
    </div>
    <!-- /wp:columns -->
</div>
<!-- /wp:group -->`;
}

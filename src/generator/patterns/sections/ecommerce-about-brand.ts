import type { SectionContext } from '../../recipes/types';
import { tokenToCSS } from '../../utils/BlockHelpers';

export function getEcommerceAboutBrandSectionWithContext(ctx: SectionContext): string {
    const { tokens, section } = ctx;
    const sectionPadding = tokens.spacing.sectionPadding;
    const bgColor = section.backgroundColor || 'base-2';

    return `<!-- wp:group {"align":"full","backgroundColor":"${bgColor}","style":{"spacing":{"padding":{"top":"${sectionPadding}","bottom":"${sectionPadding}"}}},"layout":{"type":"constrained"}} -->
<div class="wp-block-group alignfull has-${bgColor}-background-color has-background" style="padding-top:${tokenToCSS(sectionPadding)};padding-bottom:${tokenToCSS(sectionPadding)}">
    <!-- wp:columns {"align":"wide","verticalAlignment":"center","style":{"spacing":{"blockGap":{"left":"${tokens.spacing.columnGap}"}}}} -->
    <div class="wp-block-columns alignwide are-vertically-aligned-center">
        <!-- wp:column {"width":"46%"} -->
        <div class="wp-block-column" style="flex-basis:46%">
            <!-- wp:image {"sizeSlug":"large","linkDestination":"none","style":{"border":{"radius":"${tokens.radius.image}"}}} -->
            <figure class="wp-block-image size-large"><img src="{{brand_story_image}}" alt="{{store_name}}" style="border-radius:${tokens.radius.image}"/></figure>
            <!-- /wp:image -->
        </div>
        <!-- /wp:column -->
        <!-- wp:column {"width":"54%"} -->
        <div class="wp-block-column" style="flex-basis:54%">
            <!-- wp:paragraph {"textColor":"accent","fontSize":"small"} -->
            <p class="has-accent-color has-text-color has-small-font-size"><strong>Our Brand</strong></p>
            <!-- /wp:paragraph -->
            <!-- wp:heading {"textColor":"contrast"} -->
            <h2 class="wp-block-heading has-contrast-color has-text-color">{{store_name}}</h2>
            <!-- /wp:heading -->
            <!-- wp:paragraph {"textColor":"contrast-2"} -->
            <p class="has-contrast-2-color has-text-color">{{brand_story}}</p>
            <!-- /wp:paragraph -->
            <!-- wp:list {"textColor":"contrast-2"} -->
            <ul class="has-contrast-2-color has-text-color"><li>{{brand_value_1}}</li><li>{{brand_value_2}}</li><li>{{brand_value_3}}</li></ul>
            <!-- /wp:list -->
        </div>
        <!-- /wp:column -->
    </div>
    <!-- /wp:columns -->
</div>
<!-- /wp:group -->`;
}

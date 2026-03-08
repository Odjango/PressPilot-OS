import type { SectionContext } from '../../recipes/types';
import { tokenToCSS } from '../../utils/BlockHelpers';

export function getRestaurantGallerySectionWithContext(ctx: SectionContext): string {
    const { tokens } = ctx;
    const sectionPadding = tokens.spacing.sectionPadding;

    return `<!-- wp:group {"align":"full","style":{"spacing":{"padding":{"top":"${sectionPadding}","bottom":"${sectionPadding}"}}},"backgroundColor":"base","layout":{"type":"constrained"}} -->
<div class="wp-block-group alignfull has-base-background-color has-background" style="padding-top:${tokenToCSS(sectionPadding)};padding-bottom:${tokenToCSS(sectionPadding)}">
    <!-- wp:group {"align":"wide","layout":{"type":"constrained"}} -->
    <div class="wp-block-group alignwide">
        <!-- wp:paragraph {"align":"center","textColor":"accent","fontSize":"small"} -->
        <p class="has-text-align-center has-accent-color has-text-color has-small-font-size"><strong>GALLERY</strong></p>
        <!-- /wp:paragraph -->
        <!-- wp:heading {"textAlign":"center","textColor":"contrast"} -->
        <h2 class="wp-block-heading has-text-align-center has-contrast-color has-text-color">A Look Inside {{business_name}}</h2>
        <!-- /wp:heading -->
        <!-- wp:paragraph {"align":"center","textColor":"contrast-2"} -->
        <p class="has-text-align-center has-contrast-2-color has-text-color">{{tagline}}</p>
        <!-- /wp:paragraph -->
    </div>
    <!-- /wp:group -->
    <!-- wp:gallery {"columns":3,"linkTo":"none","sizeSlug":"large","align":"wide","style":{"spacing":{"margin":{"top":"${tokens.spacing.columnGap}"}}}} -->
    <figure class="wp-block-gallery alignwide has-nested-images columns-3 is-cropped" style="margin-top:${tokenToCSS(tokens.spacing.columnGap)}">
        <figure class="wp-block-image size-large"><img src="https://placehold.co/1200x900" alt="Gallery image 1"/></figure>
        <figure class="wp-block-image size-large"><img src="https://placehold.co/1200x900" alt="Gallery image 2"/></figure>
        <figure class="wp-block-image size-large"><img src="https://placehold.co/1200x900" alt="Gallery image 3"/></figure>
        <figure class="wp-block-image size-large"><img src="https://placehold.co/1200x900" alt="Gallery image 4"/></figure>
        <figure class="wp-block-image size-large"><img src="https://placehold.co/1200x900" alt="Gallery image 5"/></figure>
        <figure class="wp-block-image size-large"><img src="https://placehold.co/1200x900" alt="Gallery image 6"/></figure>
    </figure>
    <!-- /wp:gallery -->
</div>
<!-- /wp:group -->`;
}

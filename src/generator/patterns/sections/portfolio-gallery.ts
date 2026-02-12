import type { SectionContext } from '../../recipes/types';
import { tokenToCSS } from '../../utils/BlockHelpers';

export function getPortfolioGallerySectionWithContext(ctx: SectionContext): string {
    const { tokens, section } = ctx;
    const sectionPadding = tokens.spacing.sectionPadding;
    const bgColor = section.backgroundColor || 'base';

    const item = (n: number) => `<!-- wp:column -->
        <div class="wp-block-column">
            <!-- wp:image {"sizeSlug":"large","linkDestination":"none","style":{"border":{"radius":"${tokens.radius.card}"}}} -->
            <figure class="wp-block-image size-large"><img src="{{project_${n}_image}}" alt="{{project_${n}_title}}" style="border-radius:${tokens.radius.card}"/></figure>
            <!-- /wp:image -->
            <!-- wp:paragraph {"textColor":"accent","fontSize":"small"} -->
            <p class="has-accent-color has-text-color has-small-font-size">{{project_${n}_category}}</p>
            <!-- /wp:paragraph -->
            <!-- wp:heading {"level":4,"textColor":"contrast"} -->
            <h4 class="wp-block-heading has-contrast-color has-text-color">{{project_${n}_title}}</h4>
            <!-- /wp:heading -->
        </div>
        <!-- /wp:column -->`;

    return `<!-- wp:group {"align":"full","backgroundColor":"${bgColor}","style":{"spacing":{"padding":{"top":"${sectionPadding}","bottom":"${sectionPadding}"}}},"layout":{"type":"constrained"}} -->
<div class="wp-block-group alignfull has-${bgColor}-background-color has-background" style="padding-top:${tokenToCSS(sectionPadding)};padding-bottom:${tokenToCSS(sectionPadding)}">
    <!-- wp:group {"align":"wide","layout":{"type":"constrained"}} -->
    <div class="wp-block-group alignwide">
        <!-- wp:heading {"textAlign":"center","textColor":"contrast"} -->
        <h2 class="wp-block-heading has-text-align-center has-contrast-color has-text-color">Selected Work</h2>
        <!-- /wp:heading -->
        <!-- wp:paragraph {"align":"center","textColor":"contrast-2"} -->
        <p class="has-text-align-center has-contrast-2-color has-text-color">All · Branding · Product · Campaign</p>
        <!-- /wp:paragraph -->
    </div>
    <!-- /wp:group -->
    <!-- wp:columns {"align":"wide","style":{"spacing":{"margin":{"top":"${tokens.spacing.columnGap}"}}}} -->
    <div class="wp-block-columns alignwide" style="margin-top:${tokenToCSS(tokens.spacing.columnGap)}">
        ${item(1)}${item(2)}${item(3)}
    </div>
    <!-- /wp:columns -->
    <!-- wp:columns {"align":"wide","style":{"spacing":{"margin":{"top":"${tokens.spacing.cardPadding}"}}}} -->
    <div class="wp-block-columns alignwide" style="margin-top:${tokenToCSS(tokens.spacing.cardPadding)}">
        ${item(4)}${item(5)}${item(6)}
    </div>
    <!-- /wp:columns -->
</div>
<!-- /wp:group -->`;
}

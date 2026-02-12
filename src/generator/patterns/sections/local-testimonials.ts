import type { SectionContext } from '../../recipes/types';
import { tokenToCSS } from '../../utils/BlockHelpers';

export function getLocalTestimonialsSectionWithContext(ctx: SectionContext): string {
    const { tokens, section } = ctx;
    const sectionPadding = tokens.spacing.sectionPadding;
    const cardPadding = tokens.spacing.cardPadding;
    const bgColor = section.backgroundColor || 'base-2';

    const testimonial = (n: number) => `<!-- wp:column -->
        <div class="wp-block-column">
            <!-- wp:group {"backgroundColor":"base","style":{"border":{"radius":"${tokens.radius.card}"},"spacing":{"padding":{"top":"${cardPadding}","right":"${cardPadding}","bottom":"${cardPadding}","left":"${cardPadding}"}}},"layout":{"type":"constrained"}} -->
            <div class="wp-block-group has-base-background-color has-background" style="border-radius:${tokens.radius.card};padding-top:${tokenToCSS(cardPadding)};padding-right:${tokenToCSS(cardPadding)};padding-bottom:${tokenToCSS(cardPadding)};padding-left:${tokenToCSS(cardPadding)};box-shadow:${tokens.shadows.card}">
                <!-- wp:paragraph {"textColor":"accent"} -->
                <p class="has-accent-color has-text-color"><strong>{{testimonial_${n}_rating}} ★</strong></p>
                <!-- /wp:paragraph -->
                <!-- wp:paragraph {"textColor":"contrast-2"} -->
                <p class="has-contrast-2-color has-text-color">“{{testimonial_${n}_quote}}”</p>
                <!-- /wp:paragraph -->
                <!-- wp:paragraph {"textColor":"contrast","fontSize":"small"} -->
                <p class="has-contrast-color has-text-color has-small-font-size"><strong>{{testimonial_${n}_name}}</strong> · {{testimonial_${n}_service}}</p>
                <!-- /wp:paragraph -->
            </div>
            <!-- /wp:group -->
        </div>
        <!-- /wp:column -->`;

    return `<!-- wp:group {"align":"full","backgroundColor":"${bgColor}","style":{"spacing":{"padding":{"top":"${sectionPadding}","bottom":"${sectionPadding}"}}},"layout":{"type":"constrained"}} -->
<div class="wp-block-group alignfull has-${bgColor}-background-color has-background" style="padding-top:${tokenToCSS(sectionPadding)};padding-bottom:${tokenToCSS(sectionPadding)}">
    <!-- wp:heading {"textAlign":"center","textColor":"contrast"} -->
    <h2 class="wp-block-heading has-text-align-center has-contrast-color has-text-color">What Customers Say</h2>
    <!-- /wp:heading -->
    <!-- wp:columns {"align":"wide","style":{"spacing":{"margin":{"top":"${tokens.spacing.columnGap}"}}}} -->
    <div class="wp-block-columns alignwide" style="margin-top:${tokenToCSS(tokens.spacing.columnGap)}">
        ${testimonial(1)}
        ${testimonial(2)}
        ${testimonial(3)}
    </div>
    <!-- /wp:columns -->
</div>
<!-- /wp:group -->`;
}

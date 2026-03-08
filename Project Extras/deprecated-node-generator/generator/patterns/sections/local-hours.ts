import type { SectionContext } from '../../recipes/types';
import { tokenToCSS } from '../../utils/BlockHelpers';

export function getLocalHoursSectionWithContext(ctx: SectionContext): string {
    const { tokens, section } = ctx;
    const sectionPadding = tokens.spacing.sectionPadding;
    const cardPadding = tokens.spacing.cardPadding;
    const bgColor = section.backgroundColor || 'base-2';

    return `<!-- wp:group {"align":"full","backgroundColor":"${bgColor}","style":{"spacing":{"padding":{"top":"${sectionPadding}","bottom":"${sectionPadding}"}}},"layout":{"type":"constrained"}} -->
<div class="wp-block-group alignfull has-${bgColor}-background-color has-background" style="padding-top:${tokenToCSS(sectionPadding)};padding-bottom:${tokenToCSS(sectionPadding)}">
    <!-- wp:group {"align":"wide","layout":{"type":"constrained"}} -->
    <div class="wp-block-group alignwide">
        <!-- wp:heading {"textAlign":"center","textColor":"contrast"} -->
        <h2 class="wp-block-heading has-text-align-center has-contrast-color has-text-color">Business Hours</h2>
        <!-- /wp:heading -->
        <!-- wp:group {"backgroundColor":"base","style":{"border":{"radius":"${tokens.radius.card}"},"spacing":{"padding":{"top":"${cardPadding}","right":"${cardPadding}","bottom":"${cardPadding}","left":"${cardPadding}"},"margin":{"top":"${tokens.spacing.columnGap}"}}},"layout":{"type":"constrained"}} -->
        <div class="wp-block-group has-base-background-color has-background" style="border-radius:${tokens.radius.card};margin-top:${tokenToCSS(tokens.spacing.columnGap)};padding-top:${tokenToCSS(cardPadding)};padding-right:${tokenToCSS(cardPadding)};padding-bottom:${tokenToCSS(cardPadding)};padding-left:${tokenToCSS(cardPadding)}">
            <!-- wp:paragraph {"textColor":"contrast"} -->
            <p class="has-contrast-color has-text-color"><strong>Monday:</strong> {{hours_monday}}</p>
            <!-- /wp:paragraph -->
            <!-- wp:paragraph {"textColor":"contrast"} -->
            <p class="has-contrast-color has-text-color"><strong>Tuesday:</strong> {{hours_tuesday}}</p>
            <!-- /wp:paragraph -->
            <!-- wp:paragraph {"textColor":"contrast"} -->
            <p class="has-contrast-color has-text-color"><strong>Wednesday:</strong> {{hours_wednesday}}</p>
            <!-- /wp:paragraph -->
            <!-- wp:paragraph {"textColor":"contrast"} -->
            <p class="has-contrast-color has-text-color"><strong>Thursday:</strong> {{hours_thursday}}</p>
            <!-- /wp:paragraph -->
            <!-- wp:paragraph {"textColor":"contrast"} -->
            <p class="has-contrast-color has-text-color"><strong>Friday:</strong> {{hours_friday}}</p>
            <!-- /wp:paragraph -->
            <!-- wp:paragraph {"textColor":"contrast"} -->
            <p class="has-contrast-color has-text-color"><strong>Saturday:</strong> {{hours_saturday}}</p>
            <!-- /wp:paragraph -->
            <!-- wp:paragraph {"textColor":"contrast"} -->
            <p class="has-contrast-color has-text-color"><strong>Sunday:</strong> {{hours_sunday}}</p>
            <!-- /wp:paragraph -->
        </div>
        <!-- /wp:group -->
    </div>
    <!-- /wp:group -->
</div>
<!-- /wp:group -->`;
}

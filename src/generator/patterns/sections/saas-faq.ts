import type { SectionContext } from '../../recipes/types';
import { tokenToCSS } from '../../utils/BlockHelpers';

export function getSaasFAQSectionWithContext(ctx: SectionContext): string {
    const { tokens, section } = ctx;
    const sectionPadding = tokens.spacing.sectionPadding;
    const bgColor = section.backgroundColor || 'base';

    const item = (n: number) => `<!-- wp:group {"backgroundColor":"base-2","style":{"border":{"radius":"${tokens.radius.card}"},"spacing":{"padding":{"top":"${tokens.spacing.cardPadding}","right":"${tokens.spacing.cardPadding}","bottom":"${tokens.spacing.cardPadding}","left":"${tokens.spacing.cardPadding}"},"margin":{"top":"${tokens.spacing.cardPadding}"}}},"layout":{"type":"constrained"}} -->
    <div class="wp-block-group has-base-2-background-color has-background" style="border-radius:${tokens.radius.card};margin-top:${tokenToCSS(tokens.spacing.cardPadding)};padding-top:${tokenToCSS(tokens.spacing.cardPadding)};padding-right:${tokenToCSS(tokens.spacing.cardPadding)};padding-bottom:${tokenToCSS(tokens.spacing.cardPadding)};padding-left:${tokenToCSS(tokens.spacing.cardPadding)}">
        <!-- wp:heading {"level":4,"textColor":"contrast"} -->
        <h4 class="wp-block-heading has-contrast-color has-text-color">{{faq_${n}_question}}</h4>
        <!-- /wp:heading -->
        <!-- wp:paragraph {"textColor":"contrast-2"} -->
        <p class="has-contrast-2-color has-text-color">{{faq_${n}_answer}}</p>
        <!-- /wp:paragraph -->
    </div>
    <!-- /wp:group -->`;

    return `<!-- wp:group {"align":"full","backgroundColor":"${bgColor}","style":{"spacing":{"padding":{"top":"${sectionPadding}","bottom":"${sectionPadding}"}}},"layout":{"type":"constrained"}} -->
<div class="wp-block-group alignfull has-${bgColor}-background-color has-background" style="padding-top:${tokenToCSS(sectionPadding)};padding-bottom:${tokenToCSS(sectionPadding)}">
    <!-- wp:group {"align":"wide","layout":{"type":"constrained"}} -->
    <div class="wp-block-group alignwide">
        <!-- wp:heading {"textAlign":"center","textColor":"contrast"} -->
        <h2 class="wp-block-heading has-text-align-center has-contrast-color has-text-color">Frequently Asked Questions</h2>
        <!-- /wp:heading -->
        ${item(1)}
        ${item(2)}
        ${item(3)}
        ${item(4)}
    </div>
    <!-- /wp:group -->
</div>
<!-- /wp:group -->`;
}
